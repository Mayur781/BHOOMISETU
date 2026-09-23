import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs',
    lg: 'px-4 py-2.5 text-sm'
  };

  const variantStyles = {
    primary: 'bg-gov-navy text-white hover:bg-gov-navyLight focus:ring-gov-navy shadow-sm',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 focus:ring-slate-400',
    outline: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success: 'bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-600 shadow-sm',
    warning: 'bg-amber-500 text-slate-950 hover:bg-amber-600 focus:ring-amber-500 shadow-sm'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-1.5 flex-shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
