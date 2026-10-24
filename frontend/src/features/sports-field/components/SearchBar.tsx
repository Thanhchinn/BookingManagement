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
      <div className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl p-2 shadow-2xl shadow-black/70 hover:border-emerald-500/40 focus-within:border-emerald-500/50 transition-all duration-300">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80 gap-1 lg:gap-0">
          
          {/* 1. Tìm theo từ khóa (Keyword) */}
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 min-w-0 group hover:bg-zinc-800/40 rounded-xl transition-colors">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
              <Search className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-tight">
                Tìm kiếm sân
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Nhập tên sân đấu, khu vực, môn thể thao..."
                aria-label="Tìm kiếm sân đấu"
                className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm font-semibold outline-none border-none p-0 focus:ring-0 truncate"
              />
            </div>
          </div>

          {/* 2. Lọc theo địa chỉ (Location) */}
          <div className="flex items-center gap-3 px-4 py-2.5 lg:w-[230px] shrink-0 group hover:bg-zinc-800/40 rounded-xl transition-colors relative">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-tight">
                Khu vực
              </span>
              <select
                value={selectedAddress}
                onChange={(e) => onAddressChange(e.target.value)}
                aria-label="Chọn địa điểm"
                className="w-full bg-transparent text-zinc-100 text-sm font-semibold appearance-none cursor-pointer border-none outline-none p-0 pr-6 focus:ring-0 truncate"
              >
                <option value="all" className="bg-zinc-900 text-zinc-100">Toàn thành phố</option>
                <option value="Bình Thạnh" className="bg-zinc-900 text-zinc-100">Quận Bình Thạnh</option>
                <option value="Quận 2" className="bg-zinc-900 text-zinc-100">Quận 2 (Thủ Đức)</option>
                <option value="Quận 7" className="bg-zinc-900 text-zinc-100">Quận 7 (TP. HCM)</option>
                <option value="Quận 1" className="bg-zinc-900 text-zinc-100">Quận 1</option>
                <option value="Tân Bình" className="bg-zinc-900 text-zinc-100">Quận Tân Bình</option>
              </select>
            </div>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-zinc-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* 3. Lọc theo bộ môn (Category) */}
          <div className="flex items-center gap-3 px-4 py-2.5 lg:w-[220px] shrink-0 group hover:bg-zinc-800/40 rounded-xl transition-colors relative">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-tight">
                Bộ môn
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                aria-label="Chọn bộ môn"
                className="w-full bg-transparent text-zinc-100 text-sm font-semibold appearance-none cursor-pointer border-none outline-none p-0 pr-6 focus:ring-0 truncate"
              >
                <option value="all" className="bg-zinc-900 text-zinc-100">Tất cả bộ môn</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug} className="bg-zinc-900 text-zinc-100">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-zinc-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* 4. Nút Tìm kiếm (Single-line CTA) */}
          <div className="lg:pl-2 shrink-0 pt-1 lg:pt-0">
            <button
              type="submit"
              className="w-full lg:w-auto h-12 px-7 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-zinc-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 shrink-0 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>Tìm kiếm</span>
            </button>
          </div>

        </div>
      </div>
    </form>
  );
};
