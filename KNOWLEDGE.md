# KNOWLEDGE.md — FlowForge

## Stack
- Framework: Next.js 14 + TypeScript + Tailwind CSS
- Database: IndexedDB (via `idb` package)
- Hosting: Vercel — https://flowforge-three.vercel.app
- AI: Claude API (ANTHROPIC_API_KEY env var on Vercel)
- Flowcharts: React Flow (@xyflow/react) + Dagre auto-layout
- Build: `npm run build`
- Deploy: `vercel --token sffUL0GD7thIEme58RgZtmt0 --yes --prod`

## Architecture Decisions
- Client-side storage (IndexedDB) — no backend DB needed
- Claude API via serverless function at /api/ai/analyze
- Dagre for automatic flowchart layout — deterministic positioning
- Custom React Flow nodes for each process step type

## Known Issues
- Next.js 14.2.29 has a security advisory — consider upgrading to 14.2.35+
- React Flow SSR hydration can cause issues — ensure client-only rendering

## Build Gotchas
- ANTHROPIC_API_KEY must be set in Vercel env vars (not in code)
- After adding env vars, must redeploy for them to take effect
- `vercel env add` command: `echo -n "value" | vercel env add NAME production --token TOKEN`

## File Conventions
- API routes: `src/app/api/`
- Custom nodes: `src/components/ProcessNode.tsx`
- Flow wrapper: `src/components/FlowMap.tsx`
- AI logic: `src/lib/ai.ts`
- Layout engine: `src/lib/layout.ts`
- Types: `src/lib/types.ts`

## Node Types
- StartNode (green, rounded) — process entry point
- ProcessNode (blue, rectangle) — regular step
- DecisionNode (yellow, diamond) — branch point
- HandoffNode (purple) — partner/team handoff
- BottleneckNode (red border) — AI-identified pain point
- EndNode (gray, rounded) — process end

## User Context
- Built for Natalie — business PM at wealth management firm
- Primary use: mapping current processes, identifying bottlenecks, generating optimized workflows
- Key pain: sharing work with partners, too many processes to map manually
- Design: Indigo/slate, professional B2B aesthetic (NOT pink)
- Export to PDF for presentations to leadership
