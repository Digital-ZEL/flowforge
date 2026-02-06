'use client';

export default function ProcessError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center max-w-md p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {error.message || 'Failed to load process'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
