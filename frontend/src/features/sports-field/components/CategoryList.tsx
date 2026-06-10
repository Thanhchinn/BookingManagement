import React from 'react';
import { useCategories } from '../../../hooks/useCategories';

interface CategoryListProps {
  selectedCategory: string; // 'all' hoặc slug của bộ môn
  onSelectCategory: (slug: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ selectedCategory, onSelectCategory }) => {
  const { categories, isLoading } = useCategories();

  return (
    <div className="flex items-center justify-start sm:justify-center gap-3 overflow-x-auto pb-2 select-none scrollbar-none">
      {/* Nút "Tất cả sân" luôn hiển thị cố định */}
      <button
        onClick={() => onSelectCategory('all')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer shrink-0 border ${
          selectedCategory === 'all'
            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 border-teal-500'
            : 'bg-slate-900/80 border-slate-800 hover:border-teal-500/40 hover:text-white text-slate-300'
        }`}
      >
        <span className="text-sm">🏆</span>
        <span>Tất cả sân</span>
      </button>

      {/* Danh sách bộ môn từ DB */}
      {isLoading ? (
        <span className="text-xs text-slate-500 animate-pulse">Đang tải bộ môn...</span>
      ) : (
        categories.map(cat => {
          const isActive = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 border-teal-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-teal-500/40 hover:text-white text-slate-300'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })
      )}
    </div>
  );
};
