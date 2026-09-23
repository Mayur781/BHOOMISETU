import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative rounded-lg">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full py-2 bg-slate-50 border rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gov-navy focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'} ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
