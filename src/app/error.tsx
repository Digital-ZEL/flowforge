'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-500 mb-4">{error.message}</p>
        <button onClick={reset} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm">Try Again</button>
        <a href="/" className="ml-3 px-4 py-2 rounded-lg border text-sm">Home</a>
      </div>
    </div>
  );
}
