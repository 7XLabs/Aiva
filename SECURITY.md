# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.
Email the maintainers instead and allow up to 72 hours for a first response.

## Scope & hardening notes

- **API keys** live only in environment variables — never commit `.env.local`.
- **Twilio webhooks**: validate the `X-Twilio-Signature` header in production (see `lib/twilioAuth.ts`) so only Twilio can drive your voice endpoints.
- **The JSON file store is for demos.** It has no auth or multi-tenancy; put the dashboard and APIs behind authentication before exposing them publicly.
- **Prompt injection**: callers can say anything. State-changing tools validate all inputs server-side and the agent cannot read or modify data outside its business scope.
- **PII**: transcripts and phone numbers are stored in `data/store.json`. Apply your local data-protection rules (GDPR/CCPA) before production use.
