// Structured data so search engines understand what AIVA is.
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AIVA — AI Voice Agent",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Open-source AI receptionist that answers calls 24/7, books appointments, takes orders and speaks 8+ languages. Built for clinics, salons, restaurants and hotels.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Open source, self-hostable",
    },
    featureList: [
      "24/7 call answering",
      "Appointment booking",
      "Phone order capture",
      "Multilingual conversations (8+ languages)",
      "Post-call sentiment and intent analysis",
      "SMS confirmations and reminders",
    ],
    softwareHelp: "https://github.com/7XLabs/aiva",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
