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

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is an AI receptionist?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An AI receptionist is software that answers your business phone with natural conversation — booking appointments, taking orders and answering questions 24/7, without menus or hold music.",
        },
      },
      {
        "@type": "Question",
        name: "How long does AIVA take to set up?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Minutes. Describe your business in plain English and AIVA generates its own configuration — services, FAQs, menu and languages — then point a phone number at it.",
        },
      },
      {
        "@type": "Question",
        name: "Which languages does AIVA speak?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "English, Hindi, Spanish, French, German, Italian, Portuguese and Japanese, with automatic mid-call language switching.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
