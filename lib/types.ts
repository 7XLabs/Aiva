// Core domain types for AIVA

export type BusinessType = "clinic" | "salon" | "restaurant" | "hotel";

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  phone: string;
  address: string;
  hours: string;
  languages: string[];
  services: Service[];
  faqs: Faq[];
  menu?: MenuItem[]; // restaurants only
  rooms?: RoomType[]; // hotels only
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

export interface RoomType {
  id: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  available: number;
}

export interface Appointment {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  type: "pickup" | "delivery";
  address?: string;
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  createdAt: string;
}

export interface CallTranscriptTurn {
  role: "caller" | "aiva";
  text: string;
  timestamp: string;
}

export interface CallLog {
  id: string;
  businessId: string;
  callerPhone: string;
  language: string;
  startedAt: string;
  endedAt?: string;
  outcome:
    | "appointment_booked"
    | "order_taken"
    | "faq_answered"
    | "transferred"
    | "missed"
    | "in_progress";
  transcript: CallTranscriptTurn[];
  summary?: string;
}
