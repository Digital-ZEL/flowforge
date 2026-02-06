'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/lib/v2/tokens.css';

/* ── Context ── */
interface V2LayoutContext {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}
const Ctx = createContext<V2LayoutContext>({ sidebarOpen: true, setSidebarOpen: () => {} });
export const useV2Layout = () => useContext(Ctx);

/* ── Nav items ── */
const NAV = [
  { href: '/v2', label: 'Dashboard', icon: DashboardIcon },
  { href: '/v2/new', label: 'New Process', icon: PlusIcon },
  { href: '/v2/library', label: 'Library', icon: LibraryIcon },
  { href: '/v2/executive', label: 'Executive', icon: ChartIcon },
] as const;

export default function V2Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  /* Close mobile sidebar on route change */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  /* Collapse sidebar on small viewports by default */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    if (mq.matches) setSidebarOpen(false);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(!e.matches ? true : false);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* Hide legacy chrome (root layout nav bars) when V2 is active */
  useEffect(() => {
    document.body.classList.add('v2-active');
    return () => { document.body.classList.remove('v2-active'); };
  }, []);

  const isActive = (href: string) =>
    href === '/v2' ? pathname === '/v2' : pathname.startsWith(href);

  return (
    <Ctx.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div
        className="min-h-screen flex"
        style={{ background: 'var(--v2-bg)', color: 'var(--v2-text)' }}
      >
        {/* ── Mobile overlay ── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full flex flex-col
            transition-all duration-300 ease-in-out
            border-r
            lg:relative
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{
            width: sidebarOpen ? 'var(--v2-sidebar-width)' : 'var(--v2-sidebar-collapsed)',
            background: 'var(--v2-bg-elevated)',
            borderColor: 'var(--v2-border)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-16 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--v2-primary)' }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap">
                FlowForge <span className="text-xs font-medium px-1.5 py-0.5 rounded-full ml-1" style={{ background: 'var(--v2-primary-muted)', color: 'var(--v2-primary-light)' }}>v2</span>
              </span>
            )}
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${active ? '' : 'hover:opacity-90'}
                  `}
                  style={{
                    background: active ? 'var(--v2-primary-muted)' : 'transparent',
                    color: active ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
                  }}
                  title={label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-3 pb-4 space-y-2 flex-shrink-0">
            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors"
              style={{ color: 'var(--v2-text-muted)' }}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <svg className={`w-5 h-5 flex-shrink-0 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {sidebarOpen && <span>Collapse</span>}
            </button>

            {/* Switch to classic */}
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors"
              style={{ color: 'var(--v2-text-muted)' }}
              title="Switch to Classic"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {sidebarOpen && <span>Switch to Classic</span>}
            </Link>

            {/* User avatar */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'var(--v2-primary-muted)', color: 'var(--v2-primary-light)' }}
              >
                U
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">User</p>
                  <p className="text-xs truncate" style={{ color: 'var(--v2-text-muted)' }}>user@flowforge.ai</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header
            className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 border-b backdrop-blur-md"
            style={{
              background: 'rgba(15,15,20,0.8)',
              borderColor: 'var(--v2-border)',
            }}
          >
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg"
              style={{ color: 'var(--v2-text-secondary)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <Breadcrumb pathname={pathname} />

            <div className="flex-1" />

            {/* Quick actions */}
            <Link
              href="/v2/new"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--v2-primary)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" d="M12 5v14m7-7H5" />
              </svg>
              New Process
            </Link>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </Ctx.Provider>
  );
}

/* ── Breadcrumb ── */
function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean);
  const labels: Record<string, string> = {
    v2: 'Home',
    new: 'New Process',
    library: 'Library',
    executive: 'Executive',
    process: 'Process',
  };

  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        const label = labels[seg] || seg.slice(0, 8) + (seg.length > 8 ? '…' : '');
        return (
          <span key={href} className="flex items-center gap-1.5">
            {i > 0 && <span style={{ color: 'var(--v2-text-muted)' }}>/</span>}
            {isLast ? (
              <span style={{ color: 'var(--v2-text)' }} className="font-medium">{label}</span>
            ) : (
              <Link href={href} style={{ color: 'var(--v2-text-muted)' }} className="hover:underline">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* ── Icons ── */
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 8v8m4-4H8" />
    </svg>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
