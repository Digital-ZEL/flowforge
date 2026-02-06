'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isIDBError = error.message?.toLowerCase().includes('indexeddb') || 
                     error.message?.toLowerCase().includes('backing store') ||
                     error.message?.toLowerCase().includes('idb');

  return (
    <html>
      <body style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'system-ui', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {isIDBError 
              ? 'Browser storage is corrupted. Click "Full Reset" to clear it and reload.'
              : error.message || 'An unexpected error occurred.'
            }
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                try {
                  // Delete ALL FlowForge databases
                  if (typeof indexedDB !== 'undefined') {
                    indexedDB.deleteDatabase('flowforge');
                    indexedDB.deleteDatabase('flowforge_analytics');
                    indexedDB.deleteDatabase('flowforge_audit');
                  }
                  // Clear localStorage too
                  if (typeof localStorage !== 'undefined') {
                    const keysToRemove: string[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('flowforge')) keysToRemove.push(key);
                    }
                    keysToRemove.forEach(k => localStorage.removeItem(k));
                  }
                } catch { /* ignore */ }
                // Force full page reload after short delay
                setTimeout(() => { window.location.href = '/'; }, 500);
              }}
              style={{ padding: '0.625rem 1.25rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}
            >
              Full Reset
            </button>
            <button
              onClick={() => reset()}
              style={{ padding: '0.625rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', color: '#334155', background: 'white', fontSize: '0.875rem' }}
            >
              Try Again
            </button>
            <a href="/" style={{ padding: '0.625rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', textDecoration: 'none', color: '#334155', fontSize: '0.875rem', display: 'inline-block' }}>
              Back to Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
