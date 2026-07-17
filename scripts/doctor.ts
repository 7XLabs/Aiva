// Config doctor: prints which integrations are wired up.
//   npm run doctor
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd()); // read .env.local like Next.js does
import { integrationSummary } from "../lib/env";

console.log("AIVA configuration check\n");
for (const note of integrationSummary()) console.log("  " + note);
console.log("\nSet values in .env.local — see .env.example.");
