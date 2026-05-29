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
    success: "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400",
    warning: "bg-amber-950/40 border border-amber-500/30 text-amber-400",
    danger: "bg-red-950/40 border border-red-500/30 text-red-400",
    info: "bg-blue-950/40 border border-blue-500/30 text-blue-400",
  };

  return (
    <span className={`${baseStyle} ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${
        status === 'success' ? 'bg-emerald-500' :
        status === 'warning' ? 'bg-amber-500 animate-pulse' :
        status === 'danger' ? 'bg-red-500' : 'bg-blue-500'
      }`}></span>
      {children}
    </span>
  );
};
