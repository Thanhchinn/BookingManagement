import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col space-y-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={id}
        className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-slate-200 focus:border-emerald-500'
        } ${className}`}
        {...props}
      />

      {error && (
        <span className="text-[11px] text-red-500 font-semibold">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';
