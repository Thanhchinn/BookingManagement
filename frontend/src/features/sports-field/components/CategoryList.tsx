import React from 'react';
import { Trophy, Activity, Zap, Flame, Sparkles, Target, Compass } from 'lucide-react';
import { useCategories } from '../../../hooks/useCategories';

interface CategoryListProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

const getCategoryIcon = (slug: string, name: string) => {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (s.includes('bong-da') || s.includes('foot') || n.includes('bóng đá')) return <Flame className="w-4 h-4 text-emerald-400" />;
  if (s.includes('cau-long') || s.includes('badminton') || n.includes('cầu lông')) return <Zap className="w-4 h-4 text-emerald-400" />;
  if (s.includes('tennis') || n.includes('tennis')) return <Activity className="w-4 h-4 text-emerald-400" />;
  if (s.includes('pickleball') || n.includes('pickleball')) return <Sparkles className="w-4 h-4 text-emerald-400" />;
  if (s.includes('bong-ro') || s.includes('basketball') || n.includes('bóng rổ')) return <Target className="w-4 h-4 text-emerald-400" />;
  return <Trophy className="w-4 h-4 text-emerald-400" />;
};

export const CategoryList: React.FC<CategoryListProps> = ({ selectedCategory, onSelectCategory }) => {
  const { categories, isLoading } = useCategories();

  return (
    <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-2 select-none scrollbar-none py-1">
      {/* Nút Tất cả sân */}
      <button
        onClick={() => onSelectCategory('all')}
        className={`flex min-h-10 items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border ${
          selectedCategory === 'all'
            ? 'bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-400/20 border-emerald-300 font-black'
            : 'bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-800 text-zinc-300 hover:text-white'
        }`}
      >
        <Compass className={`w-4 h-4 ${selectedCategory === 'all' ? 'text-zinc-950' : 'text-emerald-400'}`} />
        <span>Tất cả sân đấu</span>
      </button>

      {/* Danh sách bộ môn từ DB */}
      {isLoading ? (
        <span className="text-xs text-zinc-500 animate-pulse px-3 py-2">Đang tải danh mục...</span>
      ) : (
        categories.map(cat => {
          const isActive = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex min-h-10 items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-400/20 border-emerald-300 font-black'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-zinc-950 [&>svg]:text-zinc-950' : ''}>
                {getCategoryIcon(cat.slug, cat.name)}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })
      )}
    </div>
  );
};
