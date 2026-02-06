'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { analyzeProcess } from '@/lib/ai';
import { saveProcess } from '@/lib/versionDb';
import type { AnalysisResult } from '@/lib/types';
import { Suspense } from 'react';

const INDUSTRIES = [
  { id: 'Wealth Management', label: 'Wealth Management', icon: '💰', color: 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30' },
  { id: 'Banking', label: 'Banking', icon: '🏦', color: 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30' },
  { id: 'Insurance', label: 'Insurance', icon: '🛡️', color: 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/30' },
  { id: 'Healthcare', label: 'Healthcare', icon: '🏥', color: 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30' },
  { id: 'Legal', label: 'Legal', icon: '⚖️', color: 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30' },
  { id: 'Other', label: 'Other', icon: '🔧', color: 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/30' },
];

const INDUSTRY_PROMPTS: Record<string, string> = {
  'Wealth Management': 'Example: When a new client comes in, the advisor fills out a paper form, walks it to compliance, compliance reviews for 2-3 days, then sends it back with questions. The advisor fixes issues, resubmits, and once approved, opens accounts through our custodian...',
  'Banking': 'Example: Customer applies for a mortgage online. Loan officer reviews the application, requests additional documentation via email. Underwriting takes 5-7 days. If approved, closing documents are prepared by legal, scheduled for signing...',
  'Insurance': 'Example: Client submits a claim through our call center. Claims adjuster is assigned within 48 hours. They request documentation from the client and third parties. Investigation can take 2-4 weeks. Once reviewed, the claim goes to a supervisor for approval...',
  'Healthcare': 'Example: Patient is referred by their primary care physician. Referral is faxed to our office. Front desk calls patient to schedule, often playing phone tag for days. Patient arrives, fills out paper forms, insurance is verified manually...',
  'Legal': 'Example: New case intake starts with a consultation request. Paralegal screens the case, attorney reviews, engagement letter is drafted. Client signs retainer agreement. Case documents are collected, organized, and filed. Discovery process begins...',
  'Other': 'Describe your current workflow step by step. Include who is involved, what tools are used, where delays happen, and any pain points you experience...',
};

const GOALS = [
  { id: 'reduce-time', label: 'Reduce time', icon: '⏱️' },
  { id: 'cut-costs', label: 'Cut costs', icon: '💵' },
  { id: 'improve-experience', label: 'Improve client experience', icon: '⭐' },
  { id: 'ensure-compliance', label: 'Ensure compliance', icon: '✅' },
  { id: 'reduce-errors', label: 'Reduce errors', icon: '🎯' },
  { id: 'scale-operations', label: 'Scale operations', icon: '📈' },
];

const PROGRESS_STEPS = [
  { label: 'Analyzing your process...', icon: '🔍' },
  { label: 'Identifying bottlenecks...', icon: '🎯' },
  { label: 'Generating optimization options...', icon: '⚡' },
  { label: 'Building your process maps...', icon: '🗺️' },
];

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-brand-100 dark:bg-brand-900/50 animate-ping opacity-30" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            AI is working on your process
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Usually takes 15-30 seconds
          </p>
        </div>

        <div className="space-y-3 text-left">
          {PROGRESS_STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                i < currentStep
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                  : i === currentStep
                  ? 'bg-brand-50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50'
              }`}
            >
              <span className="text-lg flex-shrink-0">
                {i < currentStep ? '✅' : step.icon}
              </span>
              <span className={`text-sm font-medium ${
                i < currentStep
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : i === currentStep
                  ? 'text-brand-700 dark:text-brand-300'
                  : 'text-slate-500 dark:text-slate-500'
              }`}>
                {step.label}
              </span>
              {i === currentStep && (
                <div className="ml-auto">
                  <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggleListening = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onTranscript]);

  // Check if speech recognition is available
  const isAvailable = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!isAvailable) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
        listening
          ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/30 dark:border-red-700 dark:text-red-400 animate-pulse'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
      title={listening ? 'Stop recording' : 'Start voice input'}
    >
      {listening ? (
        <>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Listening...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Voice
        </>
      )}
    </button>
  );
}

function NewProcessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [currentProcess, setCurrentProcess] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);

  useEffect(() => {
    if (templateLoaded) return;
    const tmplProcess = searchParams.get('currentProcess');
    const tmplOutcome = searchParams.get('desiredOutcome');
    const tmplIndustry = searchParams.get('industry');
    if (tmplProcess) setCurrentProcess(tmplProcess);
    if (tmplOutcome) setCustomGoal(tmplOutcome);
    if (tmplIndustry) {
      const found = INDUSTRIES.find(i => i.id === tmplIndustry || i.id.toLowerCase() === tmplIndustry?.toLowerCase());
      if (found) setIndustry(found.id);
    }
    // If we have template params, skip to step 2
    if (tmplProcess && tmplIndustry) {
      setIndustry(tmplIndustry);
      setStep(2);
    }
    setTemplateLoaded(true);
  }, [searchParams, templateLoaded]);

  useEffect(() => {
    if (!loading) return;
    setProgressStep(0);
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setProgressStep(1), 3000));
    timers.push(setTimeout(() => setProgressStep(2), 7000));
    timers.push(setTimeout(() => setProgressStep(3), 12000));
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
    );
  };

  const buildDesiredOutcome = (): string => {
    const parts: string[] = [];
    const goalLabels = selectedGoals
      .map(id => GOALS.find(g => g.id === id)?.label)
      .filter(Boolean);
    if (goalLabels.length > 0) {
      parts.push(`Goals: ${goalLabels.join(', ')}.`);
    }
    if (customGoal.trim()) {
      parts.push(customGoal.trim());
    }
    return parts.join(' ') || 'Optimize this process for efficiency and reduce bottlenecks.';
  };

  const canProceed = () => {
    if (step === 1) return industry !== '';
    if (step === 2) return currentProcess.trim().length > 20;
    if (step === 3) return true; // Goals are optional
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeProcess({
        currentProcess,
        desiredOutcome: buildDesiredOutcome(),
        industry,
        goals: selectedGoals,
      });

      const id = uuidv4();
      const analysis: AnalysisResult = {
        id,
        title: result.title,
        currentProcess,
        desiredOutcome: buildDesiredOutcome(),
        industry,
        currentState: result.currentState,
        options: result.options,
        comparison: result.comparison,
        goals: selectedGoals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveProcess(analysis);
      router.push(`/process/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !error) {
    return <ProgressIndicator currentStep={progressStep} />;
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Map Your Process
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {step === 1 && 'Start by selecting your industry'}
            {step === 2 && 'Describe your current workflow'}
            {step === 3 && 'What are your optimization goals?'}
            {step === 4 && 'Review and analyze'}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => s < step && setStep(s)}
                aria-label={`Step ${s}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  s === step
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : s < step
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 cursor-pointer hover:bg-brand-200 dark:hover:bg-brand-800'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {s < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </button>
              {s < 4 && (
                <div className={`w-6 sm:w-12 h-0.5 ${
                  s < step ? 'bg-brand-400' : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 lg:p-8">
          {/* Step 1: Industry Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  What industry are you in?
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  This helps our AI tailor recommendations to your industry&apos;s regulations and best practices.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    className={`flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                      industry === ind.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 dark:border-brand-400 shadow-md ring-2 ring-brand-500/20'
                        : `${ind.color} hover:border-brand-300 dark:hover:border-brand-600`
                    }`}
                  >
                    <span className="text-3xl">{ind.icon}</span>
                    <span className={`text-sm font-medium ${
                      industry === ind.id
                        ? 'text-brand-700 dark:text-brand-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {ind.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Process Description */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Describe your current process
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Walk us through your workflow step by step. The more detail, the better the analysis.
                </p>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <VoiceButton onTranscript={(text) => setCurrentProcess(prev => prev + (prev ? ' ' : '') + text)} />
                <span className="text-xs text-slate-400">
                  {currentProcess.length} characters · minimum 20
                </span>
              </div>
              <textarea
                value={currentProcess}
                onChange={(e) => setCurrentProcess(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none text-sm leading-relaxed"
                placeholder={INDUSTRY_PROMPTS[industry] || INDUSTRY_PROMPTS['Other']}
              />
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  What&apos;s your goal?
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select all that apply (optional — helps the AI prioritize recommendations)
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                      selectedGoals.includes(goal.id)
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 dark:border-brand-400'
                        : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-600'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{goal.icon}</span>
                    <span className={`text-sm font-medium ${
                      selectedGoals.includes(goal.id)
                        ? 'text-brand-700 dark:text-brand-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {goal.label}
                    </span>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none text-sm leading-relaxed"
                  placeholder="E.g., Cut onboarding time from 2 weeks to 3 days and eliminate paper handoffs..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Review your inputs
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Make sure everything looks good before we analyze.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{INDUSTRIES.find(i => i.id === industry)?.icon}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Industry</span>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{industry}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Process Description</span>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 line-clamp-4">
                    {currentProcess}
                  </p>
                </div>
                {(selectedGoals.length > 0 || customGoal) && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Goals</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedGoals.map(id => {
                        const goal = GOALS.find(g => g.id === id);
                        return goal ? (
                          <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-medium">
                            {goal.icon} {goal.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                    {customGoal && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{customGoal}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <p>{error}</p>
                <button
                  onClick={handleSubmit}
                  className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 underline hover:no-underline"
                >
                  Try Again →
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(step - 1)}
              aria-label="Go back"
              className={`px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                step === 1 ? 'invisible' : ''
              }`}
            >
              ← Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:from-brand-700 hover:to-purple-700 transition-all shadow-sm shadow-brand-600/25 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze Process
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewProcessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewProcessForm />
    </Suspense>
  );
}
