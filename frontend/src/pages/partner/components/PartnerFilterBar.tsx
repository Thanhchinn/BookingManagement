import React from 'react';
import { Search, Filter, Trophy } from 'lucide-react';

interface PartnerFilterBarProps {
  mode: 'bookings' | 'locations' | 'pitches';
  searchTerm: string;
  onSearchChange: (value: string) => void;
  
  // Booking status filter
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  
  // Pitches location filter
  locationValue?: string;
  onLocationChange?: (value: string) => void;
  locationsList?: Array<{ id: string | number; name: string }>;
  
  // Pitches category filter
  categoryValue?: string;
  onCategoryChange?: (value: string) => void;
  categoriesList?: string[];
}

export const PartnerFilterBar: React.FC<PartnerFilterBarProps> = ({
  mode,
  searchTerm,
  onSearchChange,
  statusValue,
  onStatusChange,
  locationValue,
  onLocationChange,
  locationsList = [],
  categoryValue,
  onCategoryChange,
  categoriesList = []
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 items-center w-full">
      {/* Ô tìm kiếm chính */}
      <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 rounded-lg px-3.5 py-2 w-full focus-within:border-amber-500/50 flex-1">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            mode === 'bookings' 
              ? "Tìm theo tên khách, số điện thoại, tên sân..." 
              : mode === 'locations'
                ? "Tìm nhanh theo tên cơ sở, địa chỉ, số điện thoại..."
                : "Tìm theo tên sân hoặc tên cơ sở..."
          } 
          className="bg-transparent border-0 text-xs text-slate-200 focus:outline-none placeholder-slate-700 w-full"
        />
      </div>
      
      {/* Bộ lọc trạng thái đơn hàng (Dành cho bookings) */}
      {mode === 'bookings' && onStatusChange && (
        <div className="flex items-center bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 focus-within:border-amber-500/50 w-full lg:w-64 shrink-0 transition-all">
          <span className="text-[10px] text-slate-500 font-bold uppercase mr-2 shrink-0 select-none">Trạng thái:</span>
          <select 
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-transparent border-0 text-xs text-white focus:outline-none focus:ring-0 focus-visible:outline-none cursor-pointer font-bold w-full bg-slate-950 py-1"
          >
            <option value="all" className="bg-slate-950 text-white">Tất Cả</option>
            <option value="pending" className="bg-slate-950 text-white">⏳ Chờ phê duyệt</option>
            <option value="approved" className="bg-slate-950 text-white">🟢 Đã phê duyệt</option>
            <option value="completed" className="bg-slate-950 text-white">✅ Đã hoàn thành</option>
            <option value="cancelled" className="bg-slate-950 text-white">🔴 Đã hủy bỏ</option>
          </select>
        </div>
      )}
      
      {/* Bộ lọc cơ sở & bộ môn (Dành cho pitches) */}
      {mode === 'pitches' && (
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          {onLocationChange && (
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 focus-within:border-amber-500/50 w-full sm:min-w-[240px] sm:max-w-[320px] transition-all">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1.5" />
              <span className="text-[10px] text-slate-500 font-bold uppercase mr-2 shrink-0 select-none">Cơ sở:</span>
              <select 
                value={locationValue}
                onChange={(e) => onLocationChange(e.target.value)}
                className="bg-transparent border-0 text-xs text-white focus:outline-none focus:ring-0 focus-visible:outline-none cursor-pointer font-bold w-full bg-slate-950 py-1"
              >
                <option value="all" className="bg-slate-950 text-white">Tất cả cơ sở</option>
                {locationsList.map(loc => (
                  <option key={loc.id} value={loc.id.toString()} className="bg-slate-950 text-white">
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {onCategoryChange && (
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 focus-within:border-amber-500/50 w-full sm:min-w-[220px] sm:max-w-[300px] transition-all">
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0 mr-1.5" />
              <span className="text-[10px] text-slate-500 font-bold uppercase mr-2 shrink-0 select-none">Bộ môn:</span>
              <select 
                value={categoryValue}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="bg-transparent border-0 text-xs text-white focus:outline-none focus:ring-0 focus-visible:outline-none cursor-pointer font-bold w-full bg-slate-950 py-1"
              >
                <option value="all" className="bg-slate-950 text-white">Tất cả bộ môn</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-950 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
