import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/demo`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/onboard`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
