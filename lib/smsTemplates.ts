// SMS confirmations in the caller's language — a booking made in Spanish
// should be confirmed in Spanish.
interface BookingSmsParams {
  business: string;
  service: string;
  date: string;
  time: string;
  ref: string;
}

const BOOKING_TEMPLATES: Record<string, (p: BookingSmsParams) => string> = {
  en: (p) =>
    `${p.business}: your ${p.service} is confirmed for ${p.date} at ${p.time}. Ref ${p.ref}. Reply to this number to reschedule.`,
  hi: (p) =>
    `${p.business}: आपकी ${p.service} बुकिंग ${p.date} को ${p.time} बजे पक्की हो गई है। संदर्भ ${p.ref}।`,
  es: (p) =>
    `${p.business}: su ${p.service} está confirmada para el ${p.date} a las ${p.time}. Ref ${p.ref}.`,
  fr: (p) =>
    `${p.business} : votre ${p.service} est confirmé le ${p.date} à ${p.time}. Réf ${p.ref}.`,
  de: (p) =>
    `${p.business}: Ihr Termin (${p.service}) am ${p.date} um ${p.time} ist bestätigt. Ref ${p.ref}.`,
  it: (p) =>
    `${p.business}: il suo appuntamento (${p.service}) del ${p.date} alle ${p.time} è confermato. Rif ${p.ref}.`,
  pt: (p) =>
    `${p.business}: seu ${p.service} está confirmado para ${p.date} às ${p.time}. Ref ${p.ref}.`,
  ja: (p) =>
    `${p.business}：${p.date} ${p.time}の${p.service}のご予約を承りました。予約番号 ${p.ref}。`,
};

export function bookingConfirmationSms(
  lang: string,
  params: BookingSmsParams
): string {
  return (BOOKING_TEMPLATES[lang] ?? BOOKING_TEMPLATES.en)(params);
}

interface OrderSmsParams {
  business: string;
  ref: string;
  total: number;
  type: "pickup" | "delivery";
  etaMinutes: number;
}

const ORDER_TEMPLATES: Record<string, (p: OrderSmsParams) => string> = {
  en: (p) =>
    `${p.business}: order ${p.ref} received — $${p.total.toFixed(2)}, ${p.type}, ready in ~${p.etaMinutes} min. Thank you!`,
  es: (p) =>
    `${p.business}: pedido ${p.ref} recibido — $${p.total.toFixed(2)}, ${p.type === "delivery" ? "entrega" : "recogida"}, listo en ~${p.etaMinutes} min. ¡Gracias!`,
  hi: (p) =>
    `${p.business}: ऑर्डर ${p.ref} मिल गया — $${p.total.toFixed(2)}, ~${p.etaMinutes} मिनट में तैयार। धन्यवाद!`,
  fr: (p) =>
    `${p.business} : commande ${p.ref} reçue — ${p.total.toFixed(2)} $, prête dans ~${p.etaMinutes} min. Merci !`,
};

export function orderConfirmationSms(lang: string, params: OrderSmsParams): string {
  return (ORDER_TEMPLATES[lang] ?? ORDER_TEMPLATES.en)(params);
}
