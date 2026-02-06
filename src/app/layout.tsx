import type { Metadata } from 'next';
import './globals.css';
import WelcomeToastWrapper from '@/components/WelcomeToastWrapper';
import { ToastProvider } from '@/components/Toast';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'FlowForge — AI Process Mapper',
  description: 'Map any business process in 60 seconds. AI-powered analysis, bottleneck identification, and optimization options.',
  openGraph: {
    title: 'FlowForge — AI Process Mapper',
    description: 'Describe your workflow. Get optimized process maps in seconds.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen antialiased">
        <ToastProvider>
          {/* Desktop Nav */}
          <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 hidden sm:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14">
                <a href="/" className="flex items-center gap-2 font-bold text-lg text-brand-600 dark:text-brand-400" aria-label="FlowForge Home">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  FlowForge
                </a>
                <div className="flex items-center gap-4">
                  <a href="/library" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Library</a>
                  <a href="/templates" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Templates</a>
                  <a href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Dashboard</a>
                  <a href="/org-dashboard" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Org Analytics</a>
                  <a href="/executive" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Executive</a>
                  <a href="/settings" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Settings</a>
                  <a
                    href="/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm min-h-[44px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Process
                  </a>
                </div>
              </div>
            </div>
          </nav>
          
          {/* Mobile Top Bar */}
          <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sm:hidden">
            <div className="px-4">
              <div className="flex items-center justify-between h-12">
                <a href="/" className="flex items-center gap-2 font-bold text-brand-600 dark:text-brand-400" aria-label="FlowForge Home">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  FlowForge
                </a>
                <a
                  href="/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </a>
              </div>
            </div>
          </nav>
          
          <main className="pb-16 sm:pb-0">{children}</main>
          
          {/* Mobile Bottom Nav */}
          <MobileNav />
          
          <WelcomeToastWrapper />
        </ToastProvider>
      </body>
    </html>
  );
}
