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
```

`MOONSHOT_API_KEY` is required for AI analyze/chat. `ACCESS_PASSWORD` is required for `/api/auth/login`.

## Smoke test

Start the app, then in another terminal:

```bash
BASE_URL=http://localhost:3000 ACCESS_PASSWORD=dev_password ./scripts/smoke-test.sh
```

If `MOONSHOT_API_KEY` is set in your environment, the smoke test will also exercise `/api/ai/analyze`.
