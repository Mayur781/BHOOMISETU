import React from 'react';

export default function Card({
  title,
  subtitle,
  action,
  children,
  footer,
  className = '',
  bodyClassName = 'p-5'
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-gov overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            {title && <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>

      {footer && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
}
