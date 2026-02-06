# FlowForge — AI-Powered Process Intelligence Platform

**Version:** 5.0  
**Live URL:** https://flowforge-three.vercel.app  
**Repository:** https://github.com/Digital-ZEL/clawd (projects/flowforge)  
**Last Updated:** February 6, 2026  

---

## What It Does

FlowForge takes a plain-English description of any business process and transforms it into:
- Interactive process flow maps
- Bottleneck identification
- 3 optimization options with comparison metrics
- AI-powered follow-up chat for deeper analysis
- Executive dashboards for organizational oversight

**The pitch:** Describe your workflow in 60 seconds. Get optimized process maps, cost analysis, and compliance-ready documentation instantly.

---

## Target Market

**Primary:** Wealth management firms ($100B-1T+ AUM)
- Process managers, operations leads, compliance teams
- Advisory firms scaling from regional to national
- Anyone managing complex, regulated business processes

**Secondary:** Any enterprise with process optimization needs
- Financial services, healthcare, insurance, legal
- B2B SaaS for operations teams

---

## Features by Version

### v1-v3 (Foundation)
- AI process analysis from natural language input
- Interactive flow maps (React Flow + dagre auto-layout)
- Bottleneck detection and visualization
- 3 optimization options per analysis
- Comparison table across all options
- Dark mode, mobile responsive

### v4 (Product Experience)
- 🧙 **Guided onboarding wizard** — 3-step flow replaces blank textarea
- 📊 **Dashboard** — all processes grouped by industry, quick stats
- 📋 **Templates** — pre-built process starting points by industry
- 💬 **AI Chat** — follow-up questions on any analysis
- 🏊 **Swimlane view** — toggle between flowchart and swimlane
- 💰 **ROI Calculator** — annual savings, payback period, 3-year ROI
- 🏥 **Process Health Score** — 0-100 gauge per process
- 💡 **Smart Suggestions** — auto-detected quick wins
- 🤝 **Collaboration** — share links for async feedback
- 📄 **PDF Export** — download process maps and analysis
- 📜 **Version History** — track changes over time
- 🏠 **Landing page** — hero section, how-it-works, before/after demo
- 🎮 **Demo mode** — pre-built Client Onboarding process at /demo

### v5 (Enterprise — Current)
- 📚 **Process Library** (`/library`)
  - Grid/list view of all organizational processes
  - Filter by department: Billing, Onboarding, Compliance, Operations, Advisory, Trading, Technology, HR
  - Search by title, description, department
  - Sort by: recently updated, health score, risk level, alphabetical
  - Status badges: Draft → In Review → Approved → Needs Update
  - Featured process pinning

- 📊 **Org Analytics Dashboard** (`/org-dashboard`)
  - Risk Matrix — interactive 5×5 grid plotting every process by likelihood vs impact
  - Cost Calculator — estimate annual process costs, model savings with optimization slider (10-70%)
  - Department breakdown — process count and avg health by department
  - Activity feed — recent changes across the organization
  - Top metrics: total processes, avg health, high risk count, processes needing review

- 📋 **Audit Trail & Approval Workflows** (on every process page)
  - Full timeline of every change: created, edited, reviewed, approved, rejected
  - Filter by action type
  - Export audit log as formatted text (clipboard)
  - Approval workflow: Submit for Review → Approve / Request Changes
  - Required comments on status changes
  - Separate IndexedDB database for audit data (no conflicts)

- 👔 **Executive Dashboard** (`/executive`)
  - CEO-level view — one screen, entire organization
  - 4 hero metrics with animated SVG gauge: Total Processes, Org Health Score, Annual Cost, Compliance %
  - Process Health Grid — color-coded tiles (green/yellow/orange/red)
  - Department Performance — horizontal bar chart
  - Compliance Summary — SVG donut chart (Approved vs In Review vs Draft vs Needs Update)
  - Action Items Panel — processes needing attention NOW

---

## Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Flow Diagrams | React Flow (@xyflow/react) + dagre |
| Storage | IndexedDB via `idb` package |
| AI Provider | Moonshot API (moonshot-v1-8k model) |
| PDF Export | jspdf + html-to-image |
| Hosting | Vercel (Hobby plan) |
| Version Control | GitHub |

### Data Architecture
| Database | Version | Purpose | Stores |
|----------|---------|---------|--------|
| `flowforge` | v5 | Main app data | processes, versions, chats, meta, feedback |
| `flowforge_analytics` | v1 | Usage tracking | events |
| `flowforge_audit` | v1 | Audit trail | audit_log |

All data stored client-side in IndexedDB. No server-side database. No user data leaves the device (except AI analysis prompts sent to Moonshot API).

### AI Integration
- **Provider:** Moonshot (Kimi) — free tier, OpenAI-compatible API
- **Model:** moonshot-v1-8k — fast, reliable JSON generation
- **Analyze endpoint:** `/api/ai/analyze` — serverless, 60s timeout
- **Chat endpoint:** `/api/ai/chat` — serverless, 60s timeout
- **Response time:** 20-40 seconds for analysis, 3-10 seconds for chat
- **Error recovery:** Auto-retry prompt, JSON fence stripping, structure validation

### Performance
| Metric | Value |
|--------|-------|
| Pages | 17 routes |
| Avg page load | <0.4 seconds |
| Largest bundle | 99.9 kB (process page) |
| Shared JS | 88.2 kB |
| AI analysis time | 20-40 seconds |
| AI chat time | 3-10 seconds |

---

## Page Inventory

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Landing page with hero, how-it-works, CTA |
| `/new` | Static | 3-step wizard: industry → process description → goals |
| `/dashboard` | Static | Personal process dashboard, grouped by industry |
| `/library` | Static | Org-wide process library with filters and search |
| `/executive` | Static | Executive dashboard — CEO view |
| `/org-dashboard` | Static | Org analytics — risk matrix, cost calculator |
| `/templates` | Static | Pre-built process templates by industry |
| `/demo` | Static | Interactive demo with pre-loaded data |
| `/process/[id]` | Dynamic | Full process view — flow map, chat, ROI, audit |
| `/share/[id]` | Dynamic | Read-only share view |
| `/collaborate/[id]` | Dynamic | Collaboration view with feedback |
| `/analytics` | Static | Usage analytics |
| `/settings` | Static | App settings and data backup |
| `/login` | Static | Auth page (disabled for alpha) |
| `/api/ai/analyze` | API | Process analysis endpoint |
| `/api/ai/chat` | API | Follow-up chat endpoint |
| `/api/auth/login` | API | Auth endpoint (disabled) |

---

## Process Analysis Output

When a user submits a process description, the AI returns:

```json
{
  "title": "Quarterly Fee Calculation",
  "currentState": {
    "steps": [
      {"id": "1", "label": "Start", "type": "start", "connections": ["2"]},
      {"id": "2", "label": "Collect AUM Data", "type": "process", "connections": ["3"]},
      {"id": "3", "label": "Manual Calculation", "type": "bottleneck", "connections": ["4"]},
      ...
    ],
    "bottlenecks": [
      {"stepId": "3", "reason": "Manual spreadsheet calculations prone to errors"}
    ]
  },
  "options": [
    {
      "name": "Automated Fee Engine",
      "description": "Rules-based calculation system",
      "improvement": "90% faster, 99.9% accuracy",
      "steps": [...]
    },
    // 2 more options
  ],
  "comparison": [
    {"metric": "Processing Time", "current": "3 days", "option1": "4 hours", ...},
    // 5-8 metrics
  ]
}
```

This gets rendered as:
- Interactive flow map with color-coded node types (start, process, decision, handoff, bottleneck, end)
- Tabbed view switching between current state and 3 optimization options
- Comparison table across all options
- Health score calculated from bottleneck/handoff/complexity analysis

---

## Node Types

| Type | Color | Shape | Meaning |
|------|-------|-------|---------|
| Start | Green | Rounded pill | Process entry point |
| Process | Blue | Rounded rectangle | Standard step |
| Decision | Amber | Diamond | Branch point |
| Handoff | Purple | Rectangle with icon | Team/system transfer |
| Bottleneck | Red | Rectangle with warning | Identified problem |
| End | Gray | Rounded pill | Process completion |

---

## Health Score Algorithm

```
Score = 100
Score -= 15 × (number of bottlenecks)
Score -= 10 × (number of handoff steps)
Score -= 5 if (total steps > 10)
Score -= 10 × (decision nodes beyond 2)
Score = clamp(0, 100)
```

| Range | Color | Label |
|-------|-------|-------|
| 80-100 | Green | Healthy |
| 60-79 | Yellow | Needs Attention |
| 40-59 | Orange | At Risk |
| 0-39 | Red | Critical |

---

## Security & Privacy

- **No server-side database** — all user data stays in the browser (IndexedDB)
- **No user accounts required** — frictionless alpha testing
- **AI prompts** — process descriptions sent to Moonshot API for analysis (only data that leaves the device)
- **No tracking pixels** — analytics stored locally in IndexedDB
- **Auth system built but disabled** — ready for enterprise deployment with SSO

---

## Deployment

- **Platform:** Vercel (Hobby plan)
- **Build:** `npm run build` (Next.js static + serverless)
- **Deploy:** `vercel --prod` (auto-aliased to flowforge-three.vercel.app)
- **CI:** Manual deploy via CLI (GitHub Actions ready)
- **Environment Variables:**
  - `MOONSHOT_API_KEY` — Moonshot/Kimi API key for AI features
  - `ACCESS_PASSWORD` — disabled for alpha

---

## What's Next (v6 Roadmap)

### Enterprise Features
- [ ] Multi-tenant with real authentication (SSO/Okta/Azure AD)
- [ ] Server-side database (PostgreSQL on Neon) for team collaboration
- [ ] Role-based access control (Admin, Editor, Viewer, Compliance)
- [ ] Real-time collaboration (multiple users on same process)
- [ ] API integrations (Salesforce, ServiceNow, Jira, Slack)
- [ ] Webhook notifications for status changes

### Intelligence Features
- [ ] AI that learns from the firm's historical processes
- [ ] Automated compliance checking against FINRA/SEC rules
- [ ] Process monitoring — alert when health score drops
- [ ] Cross-process dependency mapping
- [ ] Industry benchmarking (compare your processes to peers)

### Monetization
- [ ] Stripe integration for subscription billing
- [ ] Tier gating (Free → Team → Enterprise)
- [ ] Usage-based pricing for AI analysis credits

---

## Build History

| Date | Version | Features | Agents Used |
|------|---------|----------|-------------|
| Feb 5, 2026 | v1-v3 | Core analysis, flow maps, chat | 1 |
| Feb 5, 2026 | v4 | Wizard, dashboard, templates, ROI, collaboration, landing | 4 parallel |
| Feb 6, 2026 | v4.1 | Bug fixes: React 18 compat, Moonshot API, IndexedDB conflict | 1 |
| Feb 6, 2026 | v5 | Library, Org Analytics, Audit Trail, Executive Dashboard | 4 parallel |
| Feb 6, 2026 | v5.1 | Debug swarm: API fixes, -57% bundle size, cache headers | 4 parallel |

**Total development time:** ~6 hours  
**Total agents spawned:** 17+  
**Total features:** 40+  
**Lines of code:** ~5,000+  

---

*Built by Khiry × Clawd — February 2026*
