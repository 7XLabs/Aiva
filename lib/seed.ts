import type { Business } from "./types";

// Demo businesses covering all four target verticals.
export const seedBusinesses: Business[] = [
  {
    id: "biz_clinic",
    name: "Sunrise Family Clinic",
    type: "clinic",
    phone: "+1 (555) 010-1001",
    staffPhone: "+1 (555) 010-1099",
    address: "12 Wellness Ave, Springfield",
    hours: "Mon–Sat 9:00–18:00",
    languages: ["en", "hi", "es"],
    services: [
      { id: "svc_gp", name: "General Consultation", durationMinutes: 20, price: 40 },
      { id: "svc_dental", name: "Dental Checkup", durationMinutes: 30, price: 60 },
      { id: "svc_physio", name: "Physiotherapy Session", durationMinutes: 45, price: 55 },
      { id: "svc_vax", name: "Vaccination", durationMinutes: 15, price: 25 },
    ],
    faqs: [
      { id: "f1", question: "Do you accept walk-ins?", answer: "Yes, walk-ins are welcome before 4 PM, but booked appointments get priority." },
      { id: "f2", question: "Do you accept insurance?", answer: "We accept all major insurance providers including BlueCross and Aetna." },
      { id: "f3", question: "Is parking available?", answer: "Yes, free patient parking is available behind the building." },
    ],
  },
  {
    id: "biz_salon",
    name: "Luxe Hair & Beauty Salon",
    type: "salon",
    phone: "+1 (555) 010-2002",
    address: "88 Style Street, Springfield",
    hours: "Tue–Sun 10:00–20:00",
    languages: ["en", "es", "fr"],
    services: [
      { id: "svc_cut", name: "Haircut & Styling", durationMinutes: 45, price: 35 },
      { id: "svc_color", name: "Hair Coloring", durationMinutes: 90, price: 85 },
      { id: "svc_mani", name: "Manicure & Pedicure", durationMinutes: 60, price: 45 },
      { id: "svc_facial", name: "Signature Facial", durationMinutes: 50, price: 65 },
    ],
    faqs: [
      { id: "f1", question: "Do I need an appointment?", answer: "Appointments are recommended, especially on weekends. Walk-ins served when chairs are free." },
      { id: "f2", question: "Which products do you use?", answer: "We use L'Oréal Professionnel and Kérastase products." },
    ],
  },
  {
    id: "biz_restaurant",
    name: "Bella Notte Trattoria",
    type: "restaurant",
    phone: "+1 (555) 010-3003",
    staffPhone: "+1 (555) 010-3099",
    address: "45 Olive Lane, Springfield",
    hours: "Daily 11:00–23:00",
    languages: ["en", "es", "de"],
    services: [
      { id: "svc_table2", name: "Table for 2", durationMinutes: 90, price: 0 },
      { id: "svc_table4", name: "Table for 4", durationMinutes: 90, price: 0 },
      { id: "svc_private", name: "Private Dining Room", durationMinutes: 150, price: 100 },
    ],
    menu: [
      { id: "m1", name: "Margherita Pizza", description: "San Marzano tomato, fior di latte, basil", price: 14, category: "Pizza", available: true },
      { id: "m2", name: "Spaghetti Carbonara", description: "Guanciale, pecorino, egg yolk", price: 16, category: "Pasta", available: true },
      { id: "m3", name: "Lasagna al Forno", description: "Slow-braised beef ragù", price: 18, category: "Pasta", available: true },
      { id: "m4", name: "Tiramisu", description: "Classic, made in-house", price: 8, category: "Dessert", available: true },
      { id: "m5", name: "Chicken Parmigiana", description: "With spaghetti pomodoro", price: 19, category: "Mains", available: true },
    ],
    faqs: [
      { id: "f1", question: "Do you deliver?", answer: "Yes, we deliver within 5 miles. Delivery is free on orders over $30." },
      { id: "f2", question: "Do you have vegan options?", answer: "Yes — vegan pizza, pasta pomodoro, and salads are available." },
    ],
  },
  {
    id: "biz_hotel",
    name: "The Grand Meridian Hotel",
    type: "hotel",
    phone: "+1 (555) 010-4004",
    address: "1 Skyline Blvd, Springfield",
    hours: "Front desk 24/7",
    languages: ["en", "fr", "de", "hi"],
    services: [
      { id: "svc_spa", name: "Spa Appointment", durationMinutes: 60, price: 120 },
      { id: "svc_airport", name: "Airport Pickup", durationMinutes: 60, price: 45 },
    ],
    rooms: [
      { id: "r1", name: "Deluxe King", pricePerNight: 189, capacity: 2, available: 12 },
      { id: "r2", name: "Twin Room", pricePerNight: 159, capacity: 2, available: 8 },
      { id: "r3", name: "Executive Suite", pricePerNight: 349, capacity: 4, available: 3 },
    ],
    faqs: [
      { id: "f1", question: "What time is check-in?", answer: "Check-in is from 2 PM, check-out by 11 AM. Early check-in subject to availability." },
      { id: "f2", question: "Is breakfast included?", answer: "Breakfast is included with Deluxe and Suite bookings, 6:30–10:30 AM." },
      { id: "f3", question: "Do you allow pets?", answer: "Small pets under 10 kg are welcome with a $40 cleaning fee." },
    ],
  },
];
