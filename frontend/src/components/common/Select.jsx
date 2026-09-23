import React from 'react';

export default function Select({
  label,
  id,
  value,
  onChange,
  options = [], // array of { value, label } or strings
  required = false,
  error,
  helperText,
  disabled = false,
  placeholder,
  className = '',
  ...props
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-medium text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gov-navy focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>

      {error ? (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
