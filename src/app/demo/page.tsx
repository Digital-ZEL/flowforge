'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveProcess, getProcess } from '@/lib/versionDb';
import type { AnalysisResult } from '@/lib/types';

const DEMO_PROCESS: AnalysisResult = {
  id: 'demo-client-onboarding',
  title: 'Client Onboarding — Wealth Management',
  currentProcess: `New high-net-worth client comes in through referral or seminar. Advisor has initial meeting, gathers financial documents (tax returns, statements, insurance policies). Admin assistant manually enters data into CRM. Compliance team reviews KYC/AML documents — this can take 3-5 days because they're backed up. Investment Policy Statement drafted by advisor, reviewed by senior partner. Account opening paperwork (ACAT transfers, beneficiary forms, fee agreements) is printed, signed in person, then scanned back in. Portfolio constructed based on model portfolios, manually adjusted for client preferences. Welcome packet mailed (physical). First review meeting scheduled 90 days out. The whole process takes 4-6 weeks, and we lose about 15% of prospects during the wait.`,
  desiredOutcome: `Onboard new clients in under 2 weeks with a digital-first experience. Reduce compliance bottleneck. Eliminate paper forms. Keep the personal touch that high-net-worth clients expect, but remove the friction. Track every step so nothing falls through the cracks.`,
  industry: 'wealth-management',
  currentState: {
    steps: [
      { id: 's1', label: 'Referral / Seminar Lead', type: 'start', connections: ['s2'], description: 'New prospect enters the pipeline through referral network or educational seminar' },
      { id: 's2', label: 'Initial Discovery Meeting', type: 'process', connections: ['s3'], description: 'Advisor meets with prospect to understand goals, risk tolerance, and current financial situation' },
      { id: 's3', label: 'Document Collection', type: 'process', connections: ['s4'], description: 'Gather tax returns, existing account statements, insurance policies, estate documents' },
      { id: 's4', label: 'Manual CRM Data Entry', type: 'bottleneck', connections: ['s5'], description: 'Admin assistant manually enters all client data into CRM — error-prone, takes 2-3 hours per client' },
      { id: 's5', label: 'KYC/AML Compliance Review', type: 'bottleneck', connections: ['s6', 's7'], description: '3-5 day backlog. Compliance team manually verifies identity, runs checks, reviews documents' },
      { id: 's6', label: 'Compliance Approved?', type: 'decision', connections: ['s8', 's5'], description: 'If approved, proceed. If issues found, loop back for additional documentation' },
      { id: 's7', label: 'Additional Docs Requested', type: 'handoff', connections: ['s5'], description: 'Client asked to provide missing or corrected documents — often causes 1-2 week delays' },
      { id: 's8', label: 'Draft Investment Policy Statement', type: 'process', connections: ['s9'], description: 'Advisor creates IPS based on discovery meeting notes and risk assessment' },
      { id: 's9', label: 'Senior Partner Review', type: 'handoff', connections: ['s10'], description: 'IPS reviewed and approved by senior partner — scheduling the review can take 3-5 days' },
      { id: 's10', label: 'Account Opening Paperwork', type: 'bottleneck', connections: ['s11'], description: 'ACAT transfers, beneficiary forms, fee agreements — all printed, signed in person, scanned back in' },
      { id: 's11', label: 'Portfolio Construction', type: 'process', connections: ['s12'], description: 'Model portfolio selected and manually adjusted for client preferences and tax considerations' },
      { id: 's12', label: 'Welcome Packet Mailed', type: 'process', connections: ['s13'], description: 'Physical welcome packet sent via mail — takes 3-5 business days' },
      { id: 's13', label: '90-Day Review Scheduled', type: 'end', connections: [], description: 'First review meeting scheduled. Total timeline: 4-6 weeks. 15% prospect drop-off during process' },
    ],
    bottlenecks: [
      { stepId: 's4', reason: 'Manual data entry takes 2-3 hours per client and is error-prone. Every error compounds downstream.' },
      { stepId: 's5', reason: 'Compliance review has a 3-5 day backlog. This is the #1 reason for prospect drop-off.' },
      { stepId: 's10', reason: 'Paper-based account opening requires in-person signing. Scheduling conflicts add 1-2 weeks.' },
    ],
  },
  options: [
    {
      name: 'Digital-First Onboarding',
      description: 'Replace paper processes with a secure client portal. Digital document upload, e-signatures, automated CRM population, and real-time compliance pre-screening. Maintains high-touch advisor relationship while eliminating friction.',
      improvement: 'Reduces onboarding from 4-6 weeks to 7-10 days. Eliminates paper forms entirely. Cuts prospect drop-off from 15% to under 5%.',
      steps: [
        { id: 'o1-1', label: 'Referral / Seminar Lead', type: 'start', connections: ['o1-2'], description: 'Same high-touch acquisition channels' },
        { id: 'o1-2', label: 'Discovery Meeting + Portal Invite', type: 'process', connections: ['o1-3'], description: 'After meeting, client gets secure portal invite to upload documents at their convenience' },
        { id: 'o1-3', label: 'Automated Document Intake', type: 'process', connections: ['o1-4'], description: 'Client uploads documents to portal. OCR extracts key data. CRM auto-populated. Zero manual entry.' },
        { id: 'o1-4', label: 'AI-Assisted Compliance Pre-Screen', type: 'process', connections: ['o1-5'], description: 'Automated KYC/AML pre-screening flags issues immediately. Clean files go straight to compliance for quick approval.' },
        { id: 'o1-5', label: 'Compliance Fast-Track Review', type: 'process', connections: ['o1-6'], description: 'Pre-screened files reviewed in 24-48 hours instead of 3-5 days' },
        { id: 'o1-6', label: 'Digital IPS + E-Signature', type: 'process', connections: ['o1-7'], description: 'IPS generated from structured intake data, reviewed by advisor, sent for e-signature' },
        { id: 'o1-7', label: 'Automated Account Opening', type: 'process', connections: ['o1-8'], description: 'ACAT transfers initiated digitally. All forms e-signed. No printing, no scanning.' },
        { id: 'o1-8', label: 'Portfolio Auto-Construction', type: 'process', connections: ['o1-9'], description: 'Model portfolio applied with rules-based customization. Advisor reviews and approves.' },
        { id: 'o1-9', label: 'Digital Welcome + 30-Day Check-In', type: 'end', connections: [], description: 'Instant digital welcome. First check-in at 30 days instead of 90. Client engaged from day 1.' },
      ],
    },
    {
      name: 'Hybrid Concierge Model',
      description: 'Keep the white-glove feel with a dedicated onboarding concierge who manages the entire process. Combines personal touch with behind-the-scenes automation. Best for ultra-high-net-worth clients.',
      improvement: 'Reduces timeline to 2-3 weeks. Zero client effort after initial meeting. Premium experience justifies premium fees.',
      steps: [
        { id: 'o2-1', label: 'Referral / Seminar Lead', type: 'start', connections: ['o2-2'] },
        { id: 'o2-2', label: 'Discovery Meeting', type: 'process', connections: ['o2-3'], description: 'Advisor + dedicated onboarding concierge attend meeting together' },
        { id: 'o2-3', label: 'Concierge Takes Over', type: 'handoff', connections: ['o2-4'], description: 'Concierge becomes single point of contact. Collects all documents, manages timeline.' },
        { id: 'o2-4', label: 'Parallel Processing', type: 'process', connections: ['o2-5'], description: 'Compliance, CRM entry, and IPS drafting happen simultaneously — not sequentially' },
        { id: 'o2-5', label: 'One Signing Appointment', type: 'process', connections: ['o2-6'], description: 'All paperwork bundled into one meeting. Digital options available. Concierge brings everything prepared.' },
        { id: 'o2-6', label: 'Portfolio + Welcome', type: 'process', connections: ['o2-7'], description: 'Portfolio constructed and funded same week as signing' },
        { id: 'o2-7', label: '14-Day Welcome Call', type: 'end', connections: [], description: 'Concierge calls at 14 days to confirm everything is settled. Warm handoff back to advisor.' },
      ],
    },
    {
      name: 'Phased Automation',
      description: 'Implement changes incrementally without disrupting current operations. Start with the highest-impact bottleneck (compliance), then digitize forms, then automate intake. Lower risk, proven ROI at each stage.',
      improvement: 'Phase 1 alone cuts 1-2 weeks off timeline. Full implementation over 6 months reaches same efficiency as Option A with lower change management risk.',
      steps: [
        { id: 'o3-1', label: 'Phase 1: Compliance Fast-Track', type: 'start', connections: ['o3-2'], description: 'Month 1-2: Implement automated pre-screening. Biggest bottleneck, biggest impact.' },
        { id: 'o3-2', label: 'Phase 2: Digital Forms', type: 'process', connections: ['o3-3'], description: 'Month 2-3: Replace paper forms with e-signatures. DocuSign or similar integration.' },
        { id: 'o3-3', label: 'Phase 3: Client Portal', type: 'process', connections: ['o3-4'], description: 'Month 3-4: Launch secure document upload portal. Auto-populate CRM.' },
        { id: 'o3-4', label: 'Phase 4: Workflow Automation', type: 'process', connections: ['o3-5'], description: 'Month 4-6: Automated task assignment, status tracking, client notifications' },
        { id: 'o3-5', label: 'Full Digital Onboarding', type: 'end', connections: [], description: 'All phases live. 7-10 day onboarding. Continuous improvement from data.' },
      ],
    },
  ],
  comparison: [
    { metric: 'Onboarding Timeline', current: '4-6 weeks', 'Digital-First': '7-10 days', 'Hybrid Concierge': '2-3 weeks', 'Phased Automation': '7-10 days (when complete)' },
    { metric: 'Prospect Drop-Off', current: '15%', 'Digital-First': '<5%', 'Hybrid Concierge': '<3%', 'Phased Automation': '~8% (improves per phase)' },
    { metric: 'Manual Data Entry', current: '2-3 hrs/client', 'Digital-First': '0 hrs (automated)', 'Hybrid Concierge': '1 hr (concierge handles)', 'Phased Automation': '0 hrs (Phase 3+)' },
    { metric: 'Compliance Review Time', current: '3-5 days', 'Digital-First': '24-48 hours', 'Hybrid Concierge': '2-3 days', 'Phased Automation': '24-48 hours (Phase 1)' },
    { metric: 'Client Experience', current: 'Paper-heavy, slow', 'Digital-First': 'Modern, convenient', 'Hybrid Concierge': 'White-glove, premium', 'Phased Automation': 'Gradually improves' },
    { metric: 'Implementation Cost', current: 'N/A', 'Digital-First': '$$$', 'Hybrid Concierge': '$$', 'Phased Automation': '$ per phase' },
    { metric: 'Change Management Risk', current: 'N/A', 'Digital-First': 'High (big bang)', 'Hybrid Concierge': 'Low (additive)', 'Phased Automation': 'Very low (incremental)' },
    { metric: 'Scalability', current: 'Linear (more staff)', 'Digital-First': 'High (tech-driven)', 'Hybrid Concierge': 'Medium (concierge capacity)', 'Phased Automation': 'High (when complete)' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  goals: ['Reduce time', 'Improve client experience', 'Ensure compliance'],
  lastViewedAt: new Date().toISOString(),
  feedbackCount: 0,
};

export default function DemoPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'saving' | 'redirecting'>('loading');

  useEffect(() => {
    async function seedDemo() {
      try {
        // Always overwrite demo to ensure latest data
        setStatus('saving');
        await saveProcess({
          ...DEMO_PROCESS,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastViewedAt: new Date().toISOString(),
        });
        setStatus('redirecting');
        // Small delay to ensure IndexedDB write completes
        await new Promise(r => setTimeout(r, 300));
        router.push(`/process/${DEMO_PROCESS.id}`);
      } catch (error) {
        console.error('Demo seed error:', error);
        setStatus('error' as typeof status);
      }
    }

    seedDemo();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          {status === 'loading' && 'Loading demo...'}
          {status === 'saving' && 'Building your process map...'}
          {status === 'redirecting' && 'Opening process view...'}
          {status === ('error' as typeof status) && 'Something went wrong. Please try refreshing.'}
        </p>
      </div>
    </div>
  );
}
