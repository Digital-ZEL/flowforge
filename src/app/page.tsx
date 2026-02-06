'use client';

import { useEffect, useState } from 'react';

const BEFORE_STEPS = [
  { label: 'Paper Forms', icon: '📄', delay: 'delay-0' },
  { label: 'Manual Entry', icon: '⌨️', delay: 'delay-100' },
  { label: '3-5 Day Review', icon: '⏳', delay: 'delay-200' },
  { label: 'Multiple Handoffs', icon: '🔄', delay: 'delay-300' },
  { label: 'In-Person Signing', icon: '✍️', delay: 'delay-400' },
  { label: '4-6 Week Total', icon: '📅', delay: 'delay-500' },
];

const AFTER_STEPS = [
  { label: 'Digital Portal', icon: '💻', delay: 'delay-0' },
  { label: 'Auto-Populate', icon: '⚡', delay: 'delay-100' },
  { label: '24-48hr Review', icon: '✅', delay: 'delay-200' },
  { label: 'Parallel Processing', icon: '🔀', delay: 'delay-300' },
  { label: 'E-Signature', icon: '🔐', delay: 'delay-400' },
  { label: '7-10 Day Total', icon: '🚀', delay: 'delay-500' },
];

export default function LandingPage() {
  const [animateHero, setAnimateHero] = useState(false);

  useEffect(() => {
    setAnimateHero(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-brand-950/20" />
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
          <div className={`transition-all duration-1000 ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-Powered Process Optimization
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Map Any Business Process
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                in 60 Seconds
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Describe your workflow in plain English. Get AI-powered analysis, bottleneck identification, 
              and optimization options — with interactive process maps.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a
                href="/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:from-brand-700 hover:to-purple-700 transition-all shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40"
              >
                Start Mapping — Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                🎯 Try the Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              How it works
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Three steps from chaos to clarity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold shadow-md">1</div>
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Describe</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tell us about your workflow in plain English. Select your industry and goals.
                Voice input supported.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold shadow-md">2</div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Analyze</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                AI identifies bottlenecks, handoffs, and inefficiencies. Get a health score
                and 3 optimization options.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold shadow-md">3</div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Optimize</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Interactive process maps, ROI calculator, swimlane views. Export PDFs
                and share with stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Before & After: Client Onboarding
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              See how FlowForge transforms a real wealth management process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Before */}
            <div className="rounded-2xl border-2 border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold">BEFORE</span>
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">4-6 weeks · 15% drop-off</span>
              </div>
              <div className="space-y-2">
                {BEFORE_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50">
                    <span className="text-lg">{step.icon}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold">AFTER</span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">7-10 days · &lt;5% drop-off</span>
              </div>
              <div className="space-y-2">
                {AFTER_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                    <span className="text-lg">{step.icon}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Everything you need
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Built for wealth management and financial services firms
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: '🗺️', title: 'Interactive Process Maps', desc: 'Drag-and-drop flowcharts with color-coded bottlenecks and handoffs' },
              { icon: '🏊', title: 'Swimlane Views', desc: 'See who owns each step — advisors, compliance, operations, clients' },
              { icon: '📊', title: 'ROI Calculator', desc: 'Calculate time saved, annual savings, and 3-year ROI for each option' },
              { icon: '🏥', title: 'Health Scores', desc: '0-100 scoring on bottlenecks, handoffs, process length, and complexity' },
              { icon: '💡', title: 'Smart Suggestions', desc: 'AI-detected quick wins — handoff elimination, parallel processing, automation' },
              { icon: '💬', title: 'AI Chat', desc: 'Ask follow-up questions and modify your process maps conversationally' },
              { icon: '📄', title: 'PDF Export', desc: 'Professional reports with your company branding for stakeholder presentations' },
              { icon: '🤝', title: 'Collaboration', desc: 'Share read-only links and collect async feedback from your team' },
              { icon: '📋', title: '6 Templates', desc: 'Industry-specific templates for common wealth management workflows' },
            ].map((feature, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-sm transition-shadow">
                <span className="text-2xl mb-3 block">{feature.icon}</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            Trusted by process leaders at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-slate-400 dark:text-slate-600">
            {['Wealth Management Firms', 'RIA Practices', 'Family Offices', 'Private Banks'].map((name) => (
              <span key={name} className="text-sm font-semibold">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-brand-600 to-purple-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to streamline your workflows?
          </h2>
          <p className="text-brand-100 text-base sm:text-lg mb-8">
            No sign-up needed. Just describe and optimize.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-white text-brand-700 hover:bg-brand-50 transition-colors shadow-lg"
            >
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              View Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <svg className="w-5 h-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              FlowForge
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-500 dark:text-slate-400">
              <a href="/templates" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Templates</a>
              <a href="/dashboard" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Dashboard</a>
              <a href="/new" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">New Process</a>
              <a href="/demo" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Demo</a>
              <a href="/analytics" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Analytics</a>
              <a href="/settings" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Settings</a>
            </div>
            <span className="text-xs text-slate-400">© {new Date().getFullYear()} FlowForge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
