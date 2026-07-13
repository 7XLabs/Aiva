// Lightweight JSON file store. Zero external dependencies — perfect for a
// demo deployment; swap for Postgres/Prisma in production.
import { promises as fs } from "fs";
import path from "path";
import type {
  ActionItem,
  Appointment,
  Business,
  CallLog,
  Order,
} from "./types";
import { seedBusinesses } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");

interface Store {
  businesses: Business[];
  appointments: Appointment[];
  orders: Order[];
  calls: CallLog[];
  actionItems: ActionItem[];
}

const FILE = path.join(DATA_DIR, "store.json");

// In-memory cache so serverless invocations within one instance stay fast.
let cache: Store | null = null;

async function load(): Promise<Store> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    cache = JSON.parse(raw) as Store;
    // Migrate stores written by earlier versions.
    cache.actionItems ??= [];
  } catch {
    cache = {
      businesses: seedBusinesses,
      appointments: [],
      orders: [],
      calls: [],
      actionItems: [],
    };
    await persist();
  }
  return cache!;
}

async function persist() {
  if (!cache) return;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(cache, null, 2), "utf-8");
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// ---------- Businesses ----------
export async function getBusinesses(): Promise<Business[]> {
  return (await load()).businesses;
}

export async function getBusiness(id: string): Promise<Business | undefined> {
  return (await load()).businesses.find((b) => b.id === id);
}

export async function addBusiness(business: Business) {
  const store = await load();
  store.businesses.push(business);
  await persist();
  return business;
}

export async function updateBusiness(business: Business) {
  const store = await load();
  const idx = store.businesses.findIndex((b) => b.id === business.id);
  if (idx < 0) throw new Error(`Business not found: ${business.id}`);
  store.businesses[idx] = business;
  await persist();
  return business;
}

// ---------- Appointments ----------
export async function getAppointments(businessId?: string) {
  const store = await load();
  return businessId
    ? store.appointments.filter((a) => a.businessId === businessId)
    : store.appointments;
}

export async function addAppointment(appt: Appointment) {
  const store = await load();
  store.appointments.push(appt);
  await persist();
  return appt;
}

export async function isSlotTaken(
  businessId: string,
  date: string,
  time: string
): Promise<boolean> {
  const appts = await getAppointments(businessId);
  return appts.some(
    (a) => a.date === date && a.time === time && a.status === "confirmed"
  );
}

export async function findAppointmentsByPhone(
  businessId: string,
  customerPhone: string
) {
  const appts = await getAppointments(businessId);
  return appts.filter((a) => a.customerPhone === customerPhone);
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string
) {
  const store = await load();
  const appt = store.appointments.find((a) => a.id === id);
  if (appt) {
    appt.date = date;
    appt.time = time;
    appt.reminderSentAt = undefined; // new slot ⇒ new reminder
    await persist();
  }
  return appt;
}

export async function markAppointmentReminded(id: string) {
  const store = await load();
  const appt = store.appointments.find((a) => a.id === id);
  if (appt) {
    appt.reminderSentAt = new Date().toISOString();
    await persist();
  }
  return appt;
}

export async function setAppointmentStatus(
  id: string,
  status: Appointment["status"]
) {
  const store = await load();
  const appt = store.appointments.find((a) => a.id === id);
  if (appt) {
    appt.status = status;
    await persist();
  }
  return appt;
}

// ---------- Orders ----------
export async function getOrders(businessId?: string) {
  const store = await load();
  return businessId
    ? store.orders.filter((o) => o.businessId === businessId)
    : store.orders;
}

export async function addOrder(order: Order) {
  const store = await load();
  store.orders.push(order);
  await persist();
  return order;
}

export async function setOrderStatus(id: string, status: Order["status"]) {
  const store = await load();
  const order = store.orders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    await persist();
  }
  return order;
}

// ---------- Action items ----------
export async function getActionItems(businessId?: string) {
  const store = await load();
  return businessId
    ? store.actionItems.filter((a) => a.businessId === businessId)
    : store.actionItems;
}

export async function addActionItem(item: ActionItem) {
  const store = await load();
  store.actionItems.push(item);
  await persist();
  return item;
}

export async function setActionItemDone(id: string, done: boolean) {
  const store = await load();
  const item = store.actionItems.find((a) => a.id === id);
  if (item) {
    item.done = done;
    await persist();
  }
  return item;
}

// ---------- Call logs ----------
export async function getCalls(businessId?: string) {
  const store = await load();
  return businessId
    ? store.calls.filter((c) => c.businessId === businessId)
    : store.calls;
}

export async function getCall(id: string) {
  return (await load()).calls.find((c) => c.id === id);
}

export async function upsertCall(call: CallLog) {
  const store = await load();
  const idx = store.calls.findIndex((c) => c.id === call.id);
  if (idx >= 0) store.calls[idx] = call;
  else store.calls.push(call);
  await persist();
  return call;
}
