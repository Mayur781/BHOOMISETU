import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export default function Alert({
  type = 'info', // 'info' | 'success' | 'warning' | 'error'
  title,
  children,
  onDismiss,
  className = ''
}) {
  const config = {
    info: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600'
    },
    success: {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600'
    },
    warning: {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    error: {
      border: 'border-red-200',
      bg: 'bg-red-50',
      text: 'text-red-900',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    }
  };

  const style = config[type] || config.info;
  const Icon = style.icon;

  return (
    <div
      className={`p-3.5 rounded-lg border flex items-start space-x-3 text-xs ${style.border} ${style.bg} ${style.text} ${className}`}
      role="alert"
    >
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold leading-tight mb-0.5">{title}</h4>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
