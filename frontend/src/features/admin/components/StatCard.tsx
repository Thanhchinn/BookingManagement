import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'blue' | 'red' | 'indigo' | 'violet' | 'cyan' | 'orange';
  isLoading?: boolean;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  comparisonText?: string; // defaults to 'so với tháng trước' if trend is set, or acts as direct subtext/caption
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  isLoading = false,
  trend,
  trendType,
  comparisonText,
}) => {
  // Bản đồ các style màu sắc theo Tailwind CSS v4 và Slate Dark Palette
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-950/40 text-emerald-400',
      border: 'border-emerald-900/30',
      text: 'text-emerald-400',
      glow: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-950/40 text-amber-400',
      border: 'border-amber-900/30',
      text: 'text-amber-400',
      glow: 'bg-amber-500',
    },
    blue: {
      bg: 'bg-blue-950/40 text-blue-400',
      border: 'border-blue-900/30',
      text: 'text-blue-400',
      glow: 'bg-blue-500',
    },
    red: {
      bg: 'bg-rose-950/40 text-rose-400',
      border: 'border-rose-900/30',
      text: 'text-rose-400',
      glow: 'bg-rose-500',
    },
    indigo: {
      bg: 'bg-indigo-950/40 text-indigo-400',
      border: 'border-indigo-900/30',
      text: 'text-indigo-400',
      glow: 'bg-indigo-500',
    },
    violet: {
      bg: 'bg-violet-950/40 text-violet-400',
      border: 'border-violet-900/30',
      text: 'text-violet-400',
      glow: 'bg-violet-500',
    },
    cyan: {
      bg: 'bg-cyan-950/40 text-cyan-400',
      border: 'border-cyan-900/30',
      text: 'text-cyan-400',
      glow: 'bg-cyan-500',
    },
    orange: {
      bg: 'bg-orange-950/40 text-orange-400',
      border: 'border-orange-900/30',
      text: 'text-orange-400',
      glow: 'bg-orange-500',
    },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition duration-200 text-left relative overflow-hidden group shadow-lg">
      {/* Hộp sáng mờ ở góc khi hover */}
      <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-300 pointer-events-none opacity-10 ${selectedColor.glow}`}></div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-1.5 rounded-lg border ${selectedColor.bg} ${selectedColor.border} ${selectedColor.text}`}>
          <Icon className="w-4.5 h-4.5 shrink-0" />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-2xl font-black text-white m-0 tracking-tight flex items-center">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          ) : (
            value
          )}
        </h3>

        {/* Render xu hướng hoặc văn bản chú thích tùy chọn */}
        {trend || trendType ? (
          <p className="text-[10px] m-0 flex items-center space-x-1 font-semibold">
            <span className={
              trendType === 'up' ? 'text-emerald-400' :
              trendType === 'down' ? 'text-rose-400' : 'text-slate-400'
            }>
              {trendType === 'up' ? '↑' : trendType === 'down' ? '↓' : '•'} {trend}
            </span>
            <span className="text-slate-400">{comparisonText || 'so với tháng trước'}</span>
          </p>
        ) : (
          comparisonText && (
            <p className={`text-[10px] font-bold m-0 mt-1 ${selectedColor.text}`}>
              {comparisonText}
            </p>
          )
        )}
      </div>

    </div>
  );
};
