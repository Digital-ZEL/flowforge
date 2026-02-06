'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsStats } from '@/lib/analytics';

interface Stats {
  totalProcesses: number;
  totalPageViews: number;
  totalChatMessages: number;
  totalExports: number;
  templateUsage: Record<string, number>;
  industryUsage: Record<string, number>;
  exportTypes: Record<string, number>;
  dailyActivity: Record<string, number>;
}

function BarChart({ data, color = 'brand' }: { data: Record<string, number>; color?: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500 italic">No data yet</p>
    );
  }

  const colorMap: Record<string, string> = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="space-y-2">
      {entries.map(([label, value]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-xs text-slate-600 dark:text-slate-400 w-28 truncate text-right">
            {label}
          </span>
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
            <div
              className={`${colorMap[color] || colorMap.brand} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
              style={{ width: `${Math.max((value / max) * 100, 8)}%` }}
            >
              <span className="text-[10px] font-bold text-white">{value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsStats().then((s) => {
      setStats(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500">Failed to load analytics</p>
      </div>
    );
  }

  // Get last 14 days of daily activity
  const dailyEntries = Object.entries(stats.dailyActivity)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14);
  const dailyData = Object.fromEntries(
    dailyEntries.map(([date, count]) => [
      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    ])
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Usage statistics for FlowForge (stored locally)
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Processes Created" value={stats.totalProcesses} icon="📊" />
          <StatCard label="Page Views" value={stats.totalPageViews} icon="👁️" />
          <StatCard label="Chat Messages" value={stats.totalChatMessages} icon="💬" />
          <StatCard label="Exports" value={stats.totalExports} icon="📄" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Industry Usage */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Processes by Industry
            </h3>
            <BarChart data={stats.industryUsage} color="brand" />
          </div>

          {/* Template Usage */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Templates Used
            </h3>
            <BarChart data={stats.templateUsage} color="purple" />
          </div>

          {/* Export Types */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Export Formats
            </h3>
            <BarChart data={stats.exportTypes} color="emerald" />
          </div>

          {/* Daily Activity */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Daily Activity (Last 14 Days)
            </h3>
            <BarChart data={dailyData} color="blue" />
          </div>
        </div>
      </div>
    </div>
  );
}
