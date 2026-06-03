import React from 'react';
import { Search } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface AdminSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Tùy chọn cho Bộ lọc (Filter) - Nếu không truyền sẽ chỉ hiển thị ô tìm kiếm rộng 100%
  filterValue?: string;
  onFilterChange?: (value: any) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
}

export const AdminSearchFilter: React.FC<AdminSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm nhanh...',
  filterValue = '',
  onFilterChange,
  filterOptions,
  filterLabel = 'Trạng thái:'
}) => {
  const hasFilter = onFilterChange && filterOptions && filterOptions.length > 0;

  return (
    <div 
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 ${
        hasFilter ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : 'flex items-center gap-3'
      }`}
    >
      {/* 1. Ô TÌM KIẾM */}
      <div 
        className={`flex items-center gap-3 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 w-full transition focus-within:border-emerald-500/50 ${
          hasFilter ? 'md:col-span-2' : ''
        }`}
      >
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder} 
          className="bg-transparent border-0 text-xs text-slate-200 focus:outline-none placeholder-slate-700 w-full"
        />
      </div>

      {/* 2. BỘ LỌC (Chỉ hiển thị khi có tham số cấu hình) */}
      {hasFilter && (
        <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-2 py-1 transition focus-within:border-emerald-500/50">
          <span className="text-[10px] text-slate-500 font-bold uppercase px-2 shrink-0">{filterLabel}</span>
          <select 
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-transparent border-0 text-xs text-white focus:outline-none cursor-pointer font-bold w-full pr-8 py-1.5"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-slate-950 text-slate-300">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
