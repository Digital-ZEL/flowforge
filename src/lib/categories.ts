// Department categories with icons and colors
export interface Department {
  id: string;
  label: string;
  icon: string;
  color: string;       // Tailwind text color
  bgColor: string;     // Tailwind bg color for badges
  borderColor: string;  // Tailwind border color
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'billing',
    label: 'Billing',
    icon: '💳',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/50',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    icon: '🚀',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: '🛡️',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: '⚙️',
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
  },
  {
    id: 'advisory',
    label: 'Advisory',
    icon: '📊',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'trading',
    label: 'Trading',
    icon: '📈',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: 'technology',
    label: 'Technology',
    icon: '💻',
    color: 'text-cyan-700 dark:text-cyan-300',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/50',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
  {
    id: 'hr',
    label: 'HR',
    icon: '👥',
    color: 'text-pink-700 dark:text-pink-300',
    bgColor: 'bg-pink-100 dark:bg-pink-900/50',
    borderColor: 'border-pink-200 dark:border-pink-800',
  },
];

export function getDepartment(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}

// Process status types
export interface ProcessStatus {
  id: 'draft' | 'in_review' | 'approved' | 'needs_update';
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const PROCESS_STATUSES: ProcessStatus[] = [
  {
    id: 'draft',
    label: 'Draft',
    icon: '📝',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
  {
    id: 'in_review',
    label: 'In Review',
    icon: '🔍',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
  },
  {
    id: 'approved',
    label: 'Approved',
    icon: '✅',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  {
    id: 'needs_update',
    label: 'Needs Update',
    icon: '⚠️',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
  },
];

export function getProcessStatus(id: string): ProcessStatus | undefined {
  return PROCESS_STATUSES.find((s) => s.id === id);
}

// Sort options
export interface SortOption {
  id: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: 'recently_updated', label: 'Recently Updated' },
  { id: 'health_score', label: 'Health Score' },
  { id: 'risk_level', label: 'Risk Level' },
  { id: 'alphabetical', label: 'Alphabetical' },
];
