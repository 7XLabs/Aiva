import type Anthropic from "@anthropic-ai/sdk";
import {
  addActionItem,
  addAppointment,
  addOrder,
  addWaitlistEntry,
  findAppointmentsByPhone,
  isSlotTaken,
  newId,
  nextWaitingFor,
  rescheduleAppointment,
  setAppointmentStatus,
  setWaitlistStatus,
} from "../db";
import { findFreeSlots, isClosedOn, parseBookableWindow } from "../slots";
import { occurrenceDates } from "../recurrence";
import { sendSms } from "../sms";
import { bookingConfirmationSms } from "../smsTemplates";
import { emitWebhook } from "../webhooks";
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
    name: "book_recurring_appointment",
    description:
      "Book a standing appointment repeating weekly or every two weeks (books the next 4 occurrences). Use ONLY when the caller explicitly asks for a repeating booking ('every Tuesday', 'same time every week'). Confirm service, weekday, time, name and phone first.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        service_name: { type: "string" },
        first_date: { type: "string", description: "First occurrence, YYYY-MM-DD" },
        time: { type: "string", description: "24h HH:mm" },
        recurrence: { type: "string", enum: ["weekly", "biweekly"] },
      },
      required: [
        "customer_name",
        "customer_phone",
        "service_name",
        "first_date",
        "time",
        "recurrence",
      ],
    },
  },
  {
    name: "join_waitlist",
    description:
      "Put the caller on the waitlist for a fully-booked date. Offer this when find_free_slots returns nothing for the caller's preferred date and they don't want another day. They'll be texted automatically if a slot opens.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        service_name: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD they want" },
      },
      required: ["customer_name", "customer_phone", "service_name", "date"],
    },
  },
  {
    name: "lookup_my_appointments",
    description:
      "Find a caller's upcoming appointments by their phone number. Call when the caller asks about, wants to change, or wants to cancel an existing booking.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_phone: { type: "string", description: "The caller's phone number" },
      },
      required: ["customer_phone"],
    },
  },
  {
    name: "cancel_appointment",
    description:
      "Cancel an existing appointment. Only call after lookup_my_appointments confirmed which appointment, and the caller explicitly confirmed the cancellation.",
    input_schema: {
      type: "object" as const,
      properties: {
        appointment_id: { type: "string", description: "ID from lookup_my_appointments" },
      },
      required: ["appointment_id"],
    },
  },
  {
    name: "reschedule_appointment",
    description:
      "Move an existing appointment to a new date and time. Only call after lookup_my_appointments identified the appointment and the caller confirmed the new slot.",
    input_schema: {
      type: "object" as const,
      properties: {
        appointment_id: { type: "string", description: "ID from lookup_my_appointments" },
        new_date: { type: "string", description: "YYYY-MM-DD" },
        new_time: { type: "string", description: "24h HH:mm" },
      },
      required: ["appointment_id", "new_date", "new_time"],
    },
  },
  {
    name: "set_language",
    description:
      "Switch the conversation language. Call IMMEDIATELY when the caller speaks, or asks for, a different language than the current one — this retunes the phone line's voice and speech recognition. Then reply in that language.",
    input_schema: {
      type: "object" as const,
      properties: {
        language: {
          type: "string",
          enum: ["en", "hi", "es", "fr", "de", "it", "pt", "ja"],
          description: "ISO 639-1 code of the caller's language",
        },
      },
      required: ["language"],
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
  // The caller's language, when the agent switches it mid-call.
  language?: string;
  // Signals the caller-facing pipeline (voice webhook / demo) about side effects.
  event?:
    | "appointment_booked"
    | "order_taken"
    | "transfer_requested"
    | "callback_logged"
    | "appointment_cancelled"
    | "appointment_rescheduled";
}

export interface ToolContext {
  language?: string; // current conversation language for localized SMS
}

export async function executeTool(
  business: Business,
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext = {}
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
        const date = String(input.date);
        const time = String(input.time);

        // Server-side guardrails: never trust the model to have validated.
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{1,2}:\d{2}$/.test(time)) {
          return {
            result: `Invalid date or time format (got date="${date}", time="${time}"). Use YYYY-MM-DD and 24h HH:mm, then try again.`,
            isError: true,
          };
        }
        const today = new Date().toISOString().slice(0, 10);
        if (date < today) {
          return {
            result: `${date} is in the past (today is ${today}). Ask the caller for a future date.`,
            isError: true,
          };
        }
        // Reject days the business is closed (weekday closures + holidays).
        if (isClosedOn(business, date)) {
          return {
            result: `${business.name} is closed on ${date} (hours: ${business.hours}${
              business.holidays?.includes(date) ? "; marked as a holiday" : ""
            }). Offer the next open day instead.`,
            isError: true,
          };
        }
        // Reject times outside opening hours.
        const { open, close } = parseBookableWindow(business.hours);
        const hour = Number(time.split(":")[0]) + Number(time.split(":")[1]) / 60;
        if (hour < open || hour >= close) {
          return {
            result: `${time} is outside opening hours (${business.hours}). Offer a time between ${open}:00 and ${close}:00.`,
            isError: true,
          };
        }
        const serviceName = String(input.service_name);
        const service = business.services.find(
          (s) => s.name.toLowerCase() === serviceName.toLowerCase()
        );
        const duration = service?.durationMinutes ?? 30;

        // Re-check availability at booking time, duration-aware — the slot
        // may have been taken since check_availability ran (or the model
        // skipped checking), and long services block neighboring slots.
        if (await isSlotTaken(business.id, date, time, duration)) {
          return {
            result: `The ${date} ${time} slot conflicts with an existing booking (this service runs ${duration} min). Apologize and offer another time (use find_free_slots).`,
            isError: true,
          };
        }
        const appt = await addAppointment({
          id: newId("appt"),
          businessId: business.id,
          customerName: String(input.customer_name),
          customerPhone: String(input.customer_phone),
          serviceId: service?.id ?? "custom",
          serviceName: service?.name ?? serviceName,
          date: String(input.date),
          time: String(input.time),
          durationMinutes: duration,
          status: "confirmed",
          notes: input.notes ? String(input.notes) : undefined,
          createdAt: new Date().toISOString(),
        });
        // Fire-and-forget SMS confirmation in the caller's language.
        void sendSms(
          appt.customerPhone,
          bookingConfirmationSms(ctx.language ?? "en", {
            business: business.name,
            service: appt.serviceName,
            date: appt.date,
            time: appt.time,
            ref: appt.id,
          })
        );
        emitWebhook(business, "appointment.booked", {
          id: appt.id,
          customer: appt.customerName,
          phone: appt.customerPhone,
          service: appt.serviceName,
          date: appt.date,
          time: appt.time,
        });
        return {
          result: `Appointment confirmed and SMS confirmation sent. Reference: ${appt.id}.`,
          event: "appointment_booked",
        };
      }

      case "find_free_slots": {
        const slots = await findFreeSlots(business, String(input.date));
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
        emitWebhook(business, "callback.requested", {
          summary: String(input.summary),
          phone: input.customer_phone ? String(input.customer_phone) : undefined,
        });
        return {
          result:
            "Callback request logged for the staff. Tell the caller someone will get back to them soon.",
          event: "callback_logged",
        };
      }

      case "take_order": {
        if (!business.menu?.length) {
          return {
            result: `${business.name} is a ${business.type} and does not take food orders. Offer to book an appointment instead.`,
            isError: true,
          };
        }
        const rawItems = (input.items ?? []) as Array<{
          name: string;
          quantity: number;
          notes?: string;
        }>;
        if (rawItems.length === 0) {
          return { result: "The order has no items. Ask what the caller would like.", isError: true };
        }
        if (input.order_type === "delivery" && !input.address) {
          return {
            result: "Delivery orders need an address. Ask the caller for their delivery address.",
            isError: true,
          };
        }
        // Reject items that aren't on the menu instead of silently pricing
        // them at $0 — the model must clarify with the caller.
        const unmatched = rawItems.filter(
          (it) =>
            !business.menu!.some(
              (m) => m.name.toLowerCase() === it.name.toLowerCase() && m.available
            )
        );
        if (unmatched.length > 0) {
          const menuNames = business.menu
            .filter((m) => m.available)
            .map((m) => m.name)
            .join(", ");
          return {
            result: `These items are not on the menu: ${unmatched
              .map((u) => u.name)
              .join(", ")}. Available items: ${menuNames}. Clarify with the caller, then place the order again with exact menu names.`,
            isError: true,
          };
        }
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
        emitWebhook(business, "order.placed", {
          id: order.id,
          customer: order.customerName,
          items: order.items,
          total: order.total,
          type: order.type,
          address: order.address,
        });
        return {
          result: `Order placed. Total is $${total.toFixed(2)}. Reference: ${order.id}.`,
          event: "order_taken",
        };
      }

      case "book_recurring_appointment": {
        const firstDate = String(input.first_date);
        const time = String(input.time);
        const recurrence = input.recurrence === "biweekly" ? "biweekly" : "weekly";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(firstDate) || !/^\d{1,2}:\d{2}$/.test(time)) {
          return {
            result: "Invalid date/time format. Use YYYY-MM-DD and 24h HH:mm.",
            isError: true,
          };
        }
        const todayIso = new Date().toISOString().slice(0, 10);
        if (firstDate < todayIso) {
          return { result: `${firstDate} is in the past. Ask for a future start date.`, isError: true };
        }

        const seriesId = newId("series");
        const service = business.services.find(
          (s) => s.name.toLowerCase() === String(input.service_name).toLowerCase()
        );
        const booked: string[] = [];
        const skipped: string[] = [];
        for (const date of occurrenceDates(firstDate, recurrence, 4)) {
          if (isClosedOn(business, date) || (await isSlotTaken(business.id, date, time))) {
            skipped.push(date);
            continue;
          }
          await addAppointment({
            id: newId("appt"),
            businessId: business.id,
            customerName: String(input.customer_name),
            customerPhone: String(input.customer_phone),
            serviceId: service?.id ?? "custom",
            serviceName: service?.name ?? String(input.service_name),
            date,
            time,
            status: "confirmed",
            createdAt: new Date().toISOString(),
            seriesId,
            recurrence,
          });
          booked.push(date);
        }
        if (booked.length === 0) {
          return {
            result: `None of the next 4 ${recurrence} occurrences at ${time} were available. Offer a different time.`,
            isError: true,
          };
        }
        void sendSms(
          String(input.customer_phone),
          `${business.name}: your ${recurrence} ${service?.name ?? input.service_name} at ${time} is set for: ${booked.join(", ")}.`
        );
        emitWebhook(business, "appointment.booked", {
          seriesId,
          recurrence,
          dates: booked,
          time,
          customer: String(input.customer_name),
        });
        return {
          result: `Standing booking created (${recurrence} at ${time}): ${booked.join(", ")}.${
            skipped.length
              ? ` Could not book ${skipped.join(", ")} (closed or taken) — mention this.`
              : ""
          } SMS confirmation sent.`,
          event: "appointment_booked",
        };
      }

      case "join_waitlist": {
        const entry = await addWaitlistEntry({
          id: newId("wait"),
          businessId: business.id,
          customerName: String(input.customer_name),
          customerPhone: String(input.customer_phone),
          serviceName: String(input.service_name),
          date: String(input.date),
          status: "waiting",
          createdAt: new Date().toISOString(),
        });
        return {
          result: `Added to the waitlist for ${entry.date}. Tell the caller they'll get a text automatically if a slot opens up.`,
        };
      }

      case "lookup_my_appointments": {
        const phone = String(input.customer_phone);
        const today = new Date().toISOString().slice(0, 10);
        const upcoming = (await findAppointmentsByPhone(business.id, phone))
          .filter((a) => a.status === "confirmed" && a.date >= today)
          .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
        if (upcoming.length === 0) {
          return {
            result: `No upcoming appointments found for ${phone}. Offer to book a new one.`,
          };
        }
        return {
          result: `Upcoming appointments: ${upcoming
            .map((a) => `[id=${a.id}] ${a.serviceName} on ${a.date} at ${a.time}`)
            .join("; ")}. Confirm with the caller which one they mean before changing anything.`,
        };
      }

      case "cancel_appointment": {
        const appt = await setAppointmentStatus(
          String(input.appointment_id),
          "cancelled"
        );
        if (!appt || appt.businessId !== business.id) {
          return {
            result: "Appointment not found. Use lookup_my_appointments first.",
            isError: true,
          };
        }
        void sendSms(
          appt.customerPhone,
          `${business.name}: your ${appt.serviceName} on ${appt.date} at ${appt.time} has been cancelled. Call us anytime to rebook.`
        );
        // A slot just opened — text the first caller waiting for that date.
        const waiting = await nextWaitingFor(business.id, appt.date);
        if (waiting) {
          await setWaitlistStatus(waiting.id, "notified");
          void sendSms(
            waiting.customerPhone,
            `Good news from ${business.name}! A slot just opened on ${appt.date} at ${appt.time}. Call us to grab it — first come, first served.`
          );
        }
        emitWebhook(business, "appointment.cancelled", {
          id: appt.id,
          customer: appt.customerName,
          service: appt.serviceName,
          date: appt.date,
          time: appt.time,
        });
        return {
          result: `Cancelled ${appt.serviceName} on ${appt.date} at ${appt.time}. The ${appt.time} slot is now free.${
            waiting ? " A waitlisted caller has been notified by SMS." : ""
          }`,
          event: "appointment_cancelled",
        };
      }

      case "reschedule_appointment": {
        const newDate = String(input.new_date);
        const newTime = String(input.new_time);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate) || !/^\d{1,2}:\d{2}$/.test(newTime)) {
          return {
            result: "Invalid new date/time format. Use YYYY-MM-DD and 24h HH:mm.",
            isError: true,
          };
        }
        const todayStr = new Date().toISOString().slice(0, 10);
        if (newDate < todayStr) {
          return { result: `${newDate} is in the past. Ask for a future date.`, isError: true };
        }
        if (isClosedOn(business, newDate)) {
          return {
            result: `${business.name} is closed on ${newDate}. Offer another day.`,
            isError: true,
          };
        }
        if (await isSlotTaken(business.id, newDate, newTime)) {
          return {
            result: `${newDate} ${newTime} is already taken. Use find_free_slots and offer alternatives.`,
            isError: true,
          };
        }
        const moved = await rescheduleAppointment(
          String(input.appointment_id),
          newDate,
          newTime
        );
        if (!moved || moved.businessId !== business.id) {
          return {
            result: "Appointment not found. Use lookup_my_appointments first.",
            isError: true,
          };
        }
        void sendSms(
          moved.customerPhone,
          `${business.name}: your ${moved.serviceName} has been moved to ${newDate} at ${newTime}. Ref ${moved.id}.`
        );
        emitWebhook(business, "appointment.rescheduled", {
          id: moved.id,
          customer: moved.customerName,
          service: moved.serviceName,
          date: newDate,
          time: newTime,
        });
        return {
          result: `Rescheduled to ${newDate} at ${newTime} and SMS confirmation sent.`,
          event: "appointment_rescheduled",
        };
      }

      case "set_language": {
        const code = String(input.language);
        return {
          result: `Line switched to "${code}". Continue the conversation in that language.`,
          language: code,
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
