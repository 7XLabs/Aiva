# Contributing to AIVA

Thanks for your interest in improving AIVA!

## Getting started

```bash
git clone https://github.com/7XLabs/aiva.git
cd aiva
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

## Development workflow

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes. Keep commits small and focused.
3. Run checks before pushing:
   ```bash
   npm run build   # type-checks and builds
   npm test        # unit tests
   ```
4. Open a pull request with a clear description of what and why.

## Code guidelines

- TypeScript strict mode — no `any` unless unavoidable at an API boundary.
- Server-side guardrails over model trust: any state-changing agent tool must validate its inputs itself.
- Voice replies must stay short — this is a phone call, not a chat window.
- New agent tools need: a prescriptive description (when to call it), input validation, and an error path that tells the model how to recover.

## Good first issues

New here? See [docs/GOOD_FIRST_ISSUES.md](docs/GOOD_FIRST_ISSUES.md) for
scoped, beginner-friendly tasks.

## Where help is wanted

- Calendar integrations (Google Calendar, Cal.com)
- Database adapters (Postgres/Prisma)
- Additional language/voice mappings
- Streaming STT/TTS experiments

## Reporting bugs

Open an issue with steps to reproduce, expected vs actual behavior, and logs if relevant.
