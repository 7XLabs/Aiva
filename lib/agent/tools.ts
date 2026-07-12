import type Anthropic from "@anthropic-ai/sdk";
import {
  addActionItem,
  addAppointment,
  addOrder,
  isSlotTaken,
  newId,
} from "../db";
import { findFreeSlots } from "../slots";
import { sendSms } from "../sms";
import type { Business, Order, OrderItem } from "../types";

// Tool definitions passed to Claude. Descriptions are prescriptive about WHEN
// to call each tool so triggering is reliable.
export const agentTools: Anthropic.Tool[] = [
  {
    name: "check_availability",
    description:
      "Check whether an appointment slot is free. Call this BEFORE booking whenever the caller proposes a date and time.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Date in YYYY-MM-DD" },
        time: { type: "string", description: "Time in 24h HH:mm" },
      },
      required: ["date", "time"],
    },
  },
  {
    name: "book_appointment",
    description:
      "Book an appointment once the caller has confirmed service, date, time, name and phone number. Only call after check_availability shows the slot is free.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        service_name: { type: "string", description: "One of the business's services" },
        date: { type: "string", description: "YYYY-MM-DD" },
        time: { type: "string", description: "24h HH:mm" },
        notes: { type: "string", description: "Optional extra details from the caller" },
      },
      required: ["customer_name", "customer_phone", "service_name", "date", "time"],
    },
  },
  {
    name: "take_order",
    description:
      "Place a food order after the caller has confirmed every item, quantity, pickup/delivery choice, name and phone number. Restaurants only.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        items: {
          type: "array",
          description: "Ordered items with quantities",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              quantity: { type: "integer" },
              notes: { type: "string" },
            },
            required: ["name", "quantity"],
          },
        },
        order_type: { type: "string", enum: ["pickup", "delivery"] },
        address: { type: "string", description: "Required for delivery orders" },
      },
      required: ["customer_name", "customer_phone", "items", "order_type"],
    },
  },
  {
    name: "find_free_slots",
    description:
      "Get a short list of genuinely free appointment slots for a date. Call when the caller's preferred slot is taken, or when they ask 'what times do you have?'. Offer at most 2-3 of the returned times.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Date in YYYY-MM-DD" },
      },
      required: ["date"],
    },
  },
  {
    name: "request_callback",
    description:
      "Log a callback request or follow-up task for the staff. Call when the caller wants a human to call them back, has a question you cannot answer, or asks for something requiring staff action (prescription refills, complaints, special requests).",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: {
          type: "string",
          description: "One sentence describing what the staff should do",
        },
        customer_phone: { type: "string" },
      },
      required: ["summary"],
    },
  },
  {
    name: "transfer_to_human",
    description:
      "Transfer the call to a human staff member. Call when the caller explicitly asks for a person, is upset, or has a request you cannot handle.",
    input_schema: {
      type: "object" as const,
      properties: {
        reason: { type: "string", description: "Short reason for the transfer" },
      },
      required: ["reason"],
    },
  },
];

export interface ToolOutcome {
  result: string;
  isError?: boolean;
  // Signals the caller-facing pipeline (voice webhook / demo) about side effects.
  event?:
    | "appointment_booked"
    | "order_taken"
    | "transfer_requested"
    | "callback_logged";
}

export async function executeTool(
  business: Business,
  name: string,
  input: Record<string, unknown>
): Promise<ToolOutcome> {
  try {
    switch (name) {
      case "check_availability": {
        const taken = await isSlotTaken(
          business.id,
          String(input.date),
          String(input.time)
        );
        return {
          result: taken
            ? `The slot on ${input.date} at ${input.time} is already taken. Suggest a nearby time.`
            : `The slot on ${input.date} at ${input.time} is available.`,
        };
      }

      case "book_appointment": {
        const serviceName = String(input.service_name);
        const service = business.services.find(
          (s) => s.name.toLowerCase() === serviceName.toLowerCase()
        );
        const appt = await addAppointment({
          id: newId("appt"),
          businessId: business.id,
          customerName: String(input.customer_name),
          customerPhone: String(input.customer_phone),
          serviceId: service?.id ?? "custom",
          serviceName: service?.name ?? serviceName,
          date: String(input.date),
          time: String(input.time),
          status: "confirmed",
          notes: input.notes ? String(input.notes) : undefined,
          createdAt: new Date().toISOString(),
        });
        // Fire-and-forget SMS confirmation (no-op without Twilio creds).
        void sendSms(
          appt.customerPhone,
          `${business.name}: your ${appt.serviceName} is confirmed for ${appt.date} at ${appt.time}. Ref ${appt.id}. Reply to this number to reschedule.`
        );
        return {
          result: `Appointment confirmed and SMS confirmation sent. Reference: ${appt.id}.`,
          event: "appointment_booked",
        };
      }

      case "find_free_slots": {
        const slots = await findFreeSlots(business.id, String(input.date));
        return {
          result: slots.length
            ? `Free slots on ${input.date}: ${slots.join(", ")}.`
            : `No free slots remain on ${input.date}. Suggest another day.`,
        };
      }

      case "request_callback": {
        await addActionItem({
          id: newId("task"),
          businessId: business.id,
          text: String(input.summary),
          customerPhone: input.customer_phone
            ? String(input.customer_phone)
            : undefined,
          done: false,
          createdAt: new Date().toISOString(),
        });
        return {
          result:
            "Callback request logged for the staff. Tell the caller someone will get back to them soon.",
          event: "callback_logged",
        };
      }

      case "take_order": {
        const rawItems = (input.items ?? []) as Array<{
          name: string;
          quantity: number;
          notes?: string;
        }>;
        const items: OrderItem[] = rawItems.map((it) => {
          const menuItem = business.menu?.find(
            (m) => m.name.toLowerCase() === it.name.toLowerCase()
          );
          return {
            name: menuItem?.name ?? it.name,
            quantity: it.quantity,
            price: menuItem?.price ?? 0,
            notes: it.notes,
          };
        });
        const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
        const order: Order = {
          id: newId("ord"),
          businessId: business.id,
          customerName: String(input.customer_name),
          customerPhone: String(input.customer_phone),
          items,
          total,
          type: input.order_type === "delivery" ? "delivery" : "pickup",
          address: input.address ? String(input.address) : undefined,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        await addOrder(order);
        return {
          result: `Order placed. Total is $${total.toFixed(2)}. Reference: ${order.id}.`,
          event: "order_taken",
        };
      }

      case "transfer_to_human":
        return {
          result:
            "Transfer initiated. Tell the caller you are connecting them to a staff member.",
          event: "transfer_requested",
        };

      default:
        return { result: `Unknown tool: ${name}`, isError: true };
    }
  } catch (err) {
    return {
      result: `Tool error: ${err instanceof Error ? err.message : String(err)}`,
      isError: true,
    };
  }
}
