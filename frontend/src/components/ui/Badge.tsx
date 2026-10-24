import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status = 'info'
}) => {
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider select-none";

  const statusStyles = {
    success: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
    warning: "bg-amber-500/10 border border-amber-500/30 text-amber-400",
    danger: "bg-rose-500/10 border border-rose-500/30 text-rose-400",
    info: "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300",
  };

  return (
    <span className={`${baseStyle} ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${
        status === 'success' ? 'bg-emerald-400' :
        status === 'warning' ? 'bg-amber-400 animate-pulse' :
        status === 'danger' ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'
      }`}></span>
      {children}
    </span>
  );
};
