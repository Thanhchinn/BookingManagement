import React from 'react';
import { ChevronDown, Search, MapPin, Trophy } from 'lucide-react';
import { useCategories } from '../../../hooks/useCategories';

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
  const { categories } = useCategories();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit();
  };

  return (
    <form className="w-full max-w-5xl" onSubmit={handleSubmit}>
      <div className="sz-filter-shell backdrop-blur-xl rounded-lg p-2 grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_1px_190px_1px_180px_auto] items-stretch md:items-center gap-1 transition-all duration-300">
        
        {/* 1. Tìm theo từ khóa */}
        <label className="sz-filter-field flex items-center gap-2.5 px-4 py-2.5 min-w-0 hover:bg-slate-50">
          <Search className="w-4.5 h-4.5 text-teal-600 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm sân đấu, địa điểm..."
            aria-label="Tìm kiếm sân đấu"
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm font-semibold outline-none border-none focus:ring-0 p-0"
          />
        </label>

        {/* Vạch chia ngăn dọc */}
        <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0"></div>

        {/* 2. Lọc theo địa chỉ */}
        <label className="sz-filter-field flex items-center gap-2.5 px-4 py-2.5 w-full shrink-0 relative hover:bg-slate-50">
          <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <select
            value={selectedAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            aria-label="Chọn địa điểm"
            className="w-full bg-transparent text-slate-700 focus:outline-none text-sm font-semibold appearance-none cursor-pointer border-none focus:ring-0 p-0 pr-6"
          >
            <option value="all" className="text-slate-800">Tất cả địa điểm</option>
            <option value="Bình Thạnh" className="text-slate-800">Quận Bình Thạnh</option>
            <option value="Quận 2" className="text-slate-800">Quận 2 (Thủ Đức)</option>
            <option value="Quận 7" className="text-slate-800">Quận 7 (TP. HCM)</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </label>

        {/* Vạch chia ngăn dọc */}
        <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0"></div>

        {/* 3. Lọc theo danh mục (từ DB) */}
        <label className="sz-filter-field flex items-center gap-2.5 px-4 py-2.5 w-full shrink-0 relative hover:bg-slate-50">
          <Trophy className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Chọn bộ môn"
            className="w-full bg-transparent text-slate-700 focus:outline-none text-sm font-semibold appearance-none cursor-pointer border-none focus:ring-0 p-0 pr-6"
          >
            <option value="all" className="text-slate-800">Tất cả bộ môn</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug} className="text-slate-800">
                {cat.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </label>

        {/* Nút Tìm kiếm */}
        <button
          type="submit"
          className="w-full md:w-auto min-h-[52px] px-7 py-3 bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-lg shadow-md shadow-teal-600/10 transition-all duration-200 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Tìm kiếm</span>
        </button>

      </div>
    </form>
  );
};
