import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  error,
  className = '',
  id,
  type,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col space-y-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        <input
          ref={ref}
          id={id}
          type={inputType}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-4 focus:ring-teal-500/15 transition-all duration-200 placeholder:text-slate-500 ${
            error 
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' 
              : 'border-slate-200 focus:border-teal-500'
          } ${
            className.includes('bg-') ? '' : 'bg-slate-50 focus:bg-white'
          } ${
            className.includes('text-') ? '' : 'text-slate-900'
          } ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-500 hover:text-teal-500 cursor-pointer bg-transparent border-0 p-0 flex items-center justify-center focus:outline-none"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-[11px] text-rose-500 font-semibold">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';
