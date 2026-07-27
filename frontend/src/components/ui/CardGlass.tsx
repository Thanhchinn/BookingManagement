import React from 'react';

interface CardGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const CardGlass: React.FC<CardGlassProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  const baseStyle = "bg-slate-900/60 border border-slate-800/60 backdrop-blur-md rounded-2xl p-5 text-left transition-all duration-200";
  const hoverStyle = hoverable ? "hover:bg-slate-900/80 hover:border-slate-700/60 hover:-translate-y-0.5" : "";

  return (
    <div className={`${baseStyle} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};
