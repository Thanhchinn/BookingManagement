import React from 'react';
import { Search, MapPin, Trophy } from 'lucide-react';
import { CATEGORIES } from './CategoryList';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedAddress: string;
  onAddressChange: (address: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearchSubmit: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedAddress,
  onAddressChange,
  selectedCategory,
  onCategoryChange,
  onSearchSubmit,
}) => {
  return (
    <div className="w-full max-w-5xl">
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-lg p-2 flex flex-col md:flex-row items-stretch md:items-center gap-1 border border-white/40 transition-all duration-300 ring-1 ring-slate-900/5">
        
        {/* 1. Tìm theo từ khóa */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 flex-grow min-w-0 rounded-lg hover:bg-slate-50 focus-within:bg-slate-50">
          <Search className="w-4.5 h-4.5 text-teal-600 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm sân đấu, địa điểm..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm font-semibold outline-none border-none focus:ring-0 p-0"
          />
        </div>

        {/* Vạch chia ngăn dọc */}
        <div className="hidden md:block w-px h-7 bg-slate-200 shrink-0"></div>

        {/* 2. Lọc theo địa chỉ */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 w-full md:w-48 shrink-0 relative rounded-lg hover:bg-slate-50">
          <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <select
            value={selectedAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full bg-transparent text-slate-700 focus:outline-none text-sm font-semibold appearance-none cursor-pointer border-none focus:ring-0 p-0 pr-6"
          >
            <option value="all" className="text-slate-800">Tất cả địa điểm</option>
            <option value="Bình Thạnh" className="text-slate-800">Quận Bình Thạnh</option>
            <option value="Quận 2" className="text-slate-800">Quận 2 (Thủ Đức)</option>
            <option value="Quận 7" className="text-slate-800">Quận 7 (TP. HCM)</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Vạch chia ngăn dọc */}
        <div className="hidden md:block w-px h-7 bg-slate-200 shrink-0"></div>

        {/* 3. Lọc theo danh mục */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 w-full md:w-44 shrink-0 relative rounded-lg hover:bg-slate-50">
          <Trophy className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-transparent text-slate-700 focus:outline-none text-sm font-semibold appearance-none cursor-pointer border-none focus:ring-0 p-0 pr-6"
          >
            <option value="all" className="text-slate-800">Tất cả bộ môn</option>
            {CATEGORIES.map(category => {
              if (category.id === 'all') return null;
              return (
                <option key={category.id} value={category.id} className="text-slate-800">
                  {category.name}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Nút Tìm kiếm */}
        <button
          onClick={onSearchSubmit}
          className="w-full md:w-auto px-7 py-3 bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-lg shadow-md shadow-teal-600/10 transition-all duration-200 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Tìm kiếm</span>
        </button>

      </div>
    </div>
  );
};
