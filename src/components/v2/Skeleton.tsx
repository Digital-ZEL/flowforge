'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'metric' | 'circle' | 'custom';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const baseClass =
  'bg-[var(--v2-bg-muted)] rounded-[var(--v2-radius-md)] relative overflow-hidden';

const shimmerOverlay =
  "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent after:animate-[v2-shimmer_2s_infinite]";

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  style,
  ...props
}) => {
  if (variant === 'card') {
    return (
      <div
        className={`rounded-[var(--v2-radius-lg)] border border-[var(--v2-border-subtle)] bg-[var(--v2-bg-subtle)] p-[var(--v2-space-6)] ${className}`}
        style={style}
        aria-hidden="true"
        {...props}
      >
        <div className={`${baseClass} ${shimmerOverlay} h-4 w-1/3 mb-[var(--v2-space-4)]`} />
        <div className={`${baseClass} ${shimmerOverlay} h-3 w-full mb-[var(--v2-space-2)]`} />
        <div className={`${baseClass} ${shimmerOverlay} h-3 w-4/5 mb-[var(--v2-space-2)]`} />
        <div className={`${baseClass} ${shimmerOverlay} h-3 w-2/3`} />
      </div>
    );
  }

  if (variant === 'metric') {
    return (
      <div
        className={`rounded-[var(--v2-radius-lg)] border border-[var(--v2-border-subtle)] bg-[var(--v2-bg-subtle)] p-[var(--v2-space-6)] ${className}`}
        style={style}
        aria-hidden="true"
        {...props}
      >
        <div className={`${baseClass} ${shimmerOverlay} h-3 w-20 mb-[var(--v2-space-3)]`} />
        <div className={`${baseClass} ${shimmerOverlay} h-8 w-24 mb-[var(--v2-space-2)]`} />
        <div className={`${baseClass} ${shimmerOverlay} h-3 w-16`} />
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={`${baseClass} ${shimmerOverlay} rounded-full ${className}`}
        style={{
          width: width || 40,
          height: height || 40,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    );
  }

  // text and custom
  if (variant === 'text' && lines > 1) {
    return (
      <div className={className} aria-hidden="true" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} ${shimmerOverlay} h-3 ${i < lines - 1 ? 'mb-[var(--v2-space-2)]' : ''}`}
            style={{
              width: i === lines - 1 ? '60%' : '100%',
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClass} ${shimmerOverlay} ${className}`}
      style={{
        width: width || '100%',
        height: height || 16,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

Skeleton.displayName = 'Skeleton';

export { Skeleton };
export type { SkeletonProps };
