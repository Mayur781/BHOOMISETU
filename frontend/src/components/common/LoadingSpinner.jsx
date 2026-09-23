import React from 'react';

export default function LoadingSpinner({
  size = 'md', // 'sm' | 'md' | 'lg'
  message = 'Loading data...',
  fullPage = false
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-slate-200 border-t-gov-navy rounded-full animate-spin`}
      />
      {message && <p className="text-xs font-semibold text-slate-600">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
