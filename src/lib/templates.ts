export interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  icon: string;
  currentProcess: string;
  desiredOutcome: string;
  tags: string[];
}

export const templates: ProcessTemplate[] = [
  {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    description:
      'End-to-end new client onboarding workflow from initial KYC through account opening, funding, asset allocation, and the welcome call.',
    industry: 'Wealth Management',
    icon: '👤',
    tags: ['KYC', 'Onboarding', 'Compliance'],
    currentProcess:
      'When a new client expresses interest, the advisor collects basic information via a paper form or email. This is forwarded to the operations team, who initiates the KYC (Know Your Customer) process — verifying identity documents, running background checks, and confirming accredited investor status. Once KYC clears (often 3-5 business days with back-and-forth), the account opening paperwork is prepared manually, signed by the client (sometimes via wet signature), and submitted to the custodian. After account setup (another 2-3 days), the client wires funds. Operations confirms receipt and notifies the advisor, who then works with the portfolio management team to determine the initial asset allocation. Finally, the advisor schedules and conducts a welcome call to walk the client through their portal, investment strategy, and next steps.',
    desiredOutcome:
      'Reduce onboarding time from 2-3 weeks to under 5 business days. Automate KYC verification and document collection via a digital portal. Enable e-signatures to eliminate wet signature delays. Provide real-time status tracking for clients and advisors. Automate the funding notification and initial allocation workflow.',
  },
  {
    id: 'quarterly-portfolio-review',
    name: 'Quarterly Portfolio Review',
    description:
      'Structured quarterly review process covering data aggregation, performance analysis, advisor preparation, client meeting, rebalancing, and documentation.',
    industry: 'Wealth Management',
    icon: '📊',
    tags: ['Portfolio', 'Review', 'Rebalancing'],
    currentProcess:
      'Each quarter, the operations team manually pulls performance data from multiple custodians and consolidates it into spreadsheets. The analytics team runs performance attribution, benchmarks against relevant indices, and flags any drift from the target allocation. This analysis is compiled into a PowerPoint deck, which is emailed to the advisor 3-5 days before the client meeting. The advisor reviews the deck, adds personal notes, and sometimes requests revisions. During the client meeting, the advisor presents the review, discusses market outlook, and notes any changes to the client\'s goals or risk tolerance. After the meeting, if rebalancing is needed, the advisor submits trade instructions to the trading desk. The trading desk executes the trades over 1-2 days. Finally, a summary of actions taken is documented in the CRM and a follow-up letter is mailed to the client.',
    desiredOutcome:
      'Automate data aggregation from custodians into a single dashboard. Auto-generate review decks with performance attribution and drift analysis. Provide advisors a collaborative prep tool instead of static PowerPoints. Streamline the rebalancing workflow with pre-approved model trades. Auto-generate post-meeting documentation and client letters.',
  },
  {
    id: 'acat-transfer',
    name: 'New Account Transfer (ACAT)',
    description:
      'ACAT (Automated Customer Account Transfer) process for transferring client assets from another firm, including paperwork, submission, tracking, reconciliation, and notification.',
    industry: 'Wealth Management',
    icon: '🔄',
    tags: ['ACAT', 'Transfer', 'Operations'],
    currentProcess:
      'When a client decides to transfer assets from another firm, the advisor notifies the operations team. Operations prepares the ACAT transfer paperwork, including the Transfer Initiation Form (TIF), which requires the client\'s signature and details of the sending firm\'s account. The client signs (often requiring a physical or faxed signature) and operations submits the TIF to the receiving custodian. The custodian initiates the ACAT process with the contra firm. Operations tracks the transfer status by logging into the custodian portal daily, sometimes calling the contra firm for updates. Transfers typically take 5-10 business days but can stall if there are discrepancies (wrong account numbers, unsupported securities, margin balances). When assets arrive, operations reconciles the transferred positions against the original statement, flags any missing assets or cash differences, and resolves discrepancies. Once fully reconciled, the advisor is notified and contacts the client to confirm completion.',
    desiredOutcome:
      'Enable digital ACAT paperwork with e-signatures. Automate transfer status tracking with real-time alerts instead of manual daily checks. Build an automated reconciliation tool that flags discrepancies immediately upon asset receipt. Create a client-facing status tracker so clients can see transfer progress. Reduce average transfer completion notification time from 2 days to same-day.',
  },
  {
    id: 'compliance-review',
    name: 'Compliance Review',
    description:
      'Trade surveillance and compliance review workflow from flag detection through advisor response, resolution, and documentation.',
    industry: 'Wealth Management',
    icon: '🛡️',
    tags: ['Compliance', 'Surveillance', 'Risk'],
    currentProcess:
      'The compliance monitoring system flags trades that trigger pre-defined rules (e.g., concentration limits, suitability concerns, excessive trading, cross-transactions). A compliance analyst reviews each flag, pulling up the client profile, investment policy statement, and recent trading history. If the flag requires advisor input, the analyst sends an email to the advisor requesting justification. Advisors often take 2-5 days to respond, sometimes requiring follow-up emails. The analyst reviews the advisor\'s response, determines if the trade is acceptable, needs modification, or must be reversed. The decision and rationale are manually documented in the compliance system. If a trade must be reversed, the trading desk is notified and a new workflow begins. Monthly, the compliance team compiles a summary of all flagged trades, resolutions, and trends for the Chief Compliance Officer\'s review.',
    desiredOutcome:
      'Streamline the advisor response process with in-app notifications and a 48-hour SLA with automatic escalation. Auto-populate compliance review screens with relevant client context. Enable one-click trade justification templates for common scenarios. Automate the documentation of decisions and resolutions. Generate the monthly compliance summary report automatically.',
  },
  {
    id: 'partner-advisor-handoff',
    name: 'Partner/Advisor Handoff',
    description:
      'Workflow for transferring a client relationship between partners or advisors, including case assignment, briefing, document transfer, introduction, and follow-up.',
    industry: 'Wealth Management',
    icon: '🤝',
    tags: ['Handoff', 'Partner', 'Transition'],
    currentProcess:
      'When a client needs to be transitioned to a new advisor (due to retirement, reorganization, or client request), the managing partner assigns the case. The outgoing advisor prepares a briefing document covering the client\'s history, preferences, investment strategy, family situation, and any sensitive notes. This is typically a Word document or lengthy email. Key documents (IPS, account agreements, correspondence history) are gathered from various systems — CRM, document management, email archives. The outgoing advisor introduces the incoming advisor to the client via a warm introduction call or meeting. After the introduction, the incoming advisor conducts their own discovery meeting to build rapport. The outgoing advisor remains available for questions during a 30-60 day transition period. Follow-up tasks (updating CRM records, changing advisor assignments in the custodian system, notifying operations) are tracked via manual checklists.',
    desiredOutcome:
      'Create a structured digital handoff package that auto-populates from CRM data. Build a transition checklist with automated task tracking and deadline reminders. Enable a shared notes space between outgoing and incoming advisors. Automate system updates (CRM, custodian, billing) when the handoff is complete. Track client satisfaction during the transition with automated check-in surveys.',
  },
  {
    id: 'fee-billing-cycle',
    name: 'Fee Billing Cycle',
    description:
      'Quarterly fee billing workflow including fee calculation, invoice generation, client notification, collection, and reconciliation.',
    industry: 'Wealth Management',
    icon: '💰',
    tags: ['Billing', 'Fees', 'Revenue'],
    currentProcess:
      'At the end of each quarter, the billing team calculates advisory fees based on each client\'s fee schedule and quarter-end AUM (assets under management). Fee schedules vary — some clients have tiered rates, family billing aggregation, or negotiated discounts, all tracked in separate spreadsheets. The billing team cross-references AUM data from the custodian with the fee schedules to compute each client\'s fee. Invoices are generated in the billing system and reviewed by a senior member for accuracy. Once approved, invoices are either sent to clients via email or fees are deducted directly from client accounts via the custodian. Clients who receive invoices have 30 days to pay. The billing team tracks outstanding payments, sends reminders, and escalates to advisors for collections support. At the end of the cycle, the team reconciles collected fees against expected revenue, resolves any discrepancies, and reports to finance.',
    desiredOutcome:
      'Automate fee calculations with a rules engine that handles tiered rates, family billing, and custom discounts. Auto-generate and distribute invoices with itemized breakdowns. Provide clients a fee transparency portal showing exactly how their fee was calculated. Automate payment tracking and reminder emails. Generate real-time revenue reconciliation dashboards for finance.',
  },
];
