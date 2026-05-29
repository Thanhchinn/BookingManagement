import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'emerald' | 'amber' | 'blue' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendType,
  icon: Icon,
  color,
}) => {
  // Bản đồ các style màu sắc theo Tailwind CSS v4
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
    },
  };

  const selectedColor = colorMap[color];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition duration-200 text-left relative overflow-hidden group">
      {/* Hộp sáng mờ ở góc khi hover */}
      <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-300 pointer-events-none opacity-30 ${
        color === 'emerald' ? 'bg-emerald-500' :
        color === 'amber' ? 'bg-amber-500' :
        color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
      }`}></div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl border ${selectedColor.bg} ${selectedColor.border} ${selectedColor.text}`}>
          <Icon className="w-4 h-4 shrink-0" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-2xl font-black text-white m-0 tracking-tight">{value}</h3>
        <p className="text-[10px] m-0 flex items-center space-x-1 font-semibold">
          <span className={
            trendType === 'up' ? 'text-emerald-400' :
            trendType === 'down' ? 'text-red-400' : 'text-slate-400'
          }>
            {trendType === 'up' ? '↑' : trendType === 'down' ? '↓' : '•'} {trend}
          </span>
          <span className="text-slate-500">so với tháng trước</span>
        </p>
      </div>

    </div>
  );
};
