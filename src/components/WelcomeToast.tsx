'use client';

import React, { useState, useEffect } from 'react';
import { getMeta, setMeta } from '@/lib/versionDb';

export default function WelcomeToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkWelcome = async () => {
      try {
        const dismissed = await getMeta('welcome_dismissed');
        if (!dismissed) {
          // Small delay for a polished feel
          setTimeout(() => setShow(true), 800);
        }
      } catch {
        // If DB isn't ready yet, skip
      }
    };
    checkWelcome();
  }, []);

  const dismiss = async () => {
    setShow(false);
    await setMeta('welcome_dismissed', true);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-200 dark:border-brand-800 shadow-xl p-5 w-[340px] max-w-[calc(100vw-3rem)]">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">✨</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Welcome to FlowForge
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Built for process leaders like you. Start with a{' '}
              <a href="/templates" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                template
              </a>{' '}
              or{' '}
              <a href="/new" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                describe your own process
              </a>.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
