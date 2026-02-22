# FlowForge

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Environment variables

Create a `.env.local` with:

```
MOONSHOT_API_KEY=your_api_key
ACCESS_PASSWORD=dev_password
SESSION_SECRET=replace_with_32+_char_random_secret
```

`MOONSHOT_API_KEY` is required for AI analyze/chat. `ACCESS_PASSWORD` is required for `/api/auth/login`. `SESSION_SECRET` is required to sign authentication cookies in production.

## Smoke test

Start the app, then in another terminal:

```bash
BASE_URL=http://localhost:3000 ACCESS_PASSWORD=dev_password ./scripts/smoke-test.sh
```

If `MOONSHOT_API_KEY` is set in your environment, the smoke test will also exercise `/api/ai/analyze`.
