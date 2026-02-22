'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { templates, type ProcessTemplate } from '@/lib/templates';

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(templates.flatMap((t) => t.tags)));

  const filtered = selectedTag
    ? templates.filter((t) => t.tags.includes(selectedTag))
    : templates;

  const applyTemplate = (template: ProcessTemplate) => {
    const params = new URLSearchParams({
      template: template.id,
      currentProcess: template.currentProcess,
      desiredOutcome: template.desiredOutcome,
      industry: template.industry,
    });
    router.push(`/new?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-sm font-medium mb-4">
            📋 Template Library
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Industry Templates
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Start with a pre-built wealth management process template. Customize it or use it as-is.
          </p>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              !selectedTag
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedTag === tag
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{template.icon}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-medium">
                    {template.industry}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => applyTemplate(template)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
