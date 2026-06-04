import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 font-extrabold rounded-lg transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-emerald-500/20";

  const variants = {
    primary: "px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/10",
    secondary: "px-6 py-3 bg-white/5 border border-slate-700/70 hover:bg-white/10 hover:border-slate-600 text-slate-100",
    danger: "px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/10",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
