'use client';

import React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { generateSuggestions } from '@/lib/suggestions';

interface SmartSuggestionsProps {
  process: AnalysisResult;
  onSuggestionClick: (chatPrompt: string) => void;
}

const CATEGORY_COLORS = {
  handoff: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/50',
  bottleneck: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50',
  automation: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50',
  improvement: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50',
};

export default function SmartSuggestions({ process, onSuggestionClick }: SmartSuggestionsProps) {
  const suggestions = generateSuggestions(process);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
        💡 Quick Wins
      </h3>
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.chatPrompt)}
            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${CATEGORY_COLORS[suggestion.category]}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0 mt-0.5">{suggestion.icon}</span>
              <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {suggestion.text}
              </span>
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
