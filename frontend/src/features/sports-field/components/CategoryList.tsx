import React from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Tất cả sân', icon: '🏆' },
  { id: 'football', name: 'Bóng đá', icon: '⚽' },
  { id: 'badminton', name: 'Cầu lông', icon: '🏸' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
];

interface CategoryListProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center justify-start sm:justify-center gap-3 overflow-x-auto pb-2 select-none scrollbar-none">
      {CATEGORIES.map(category => {
        const isActive = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer shrink-0 border ${
              isActive 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 border-teal-500' 
                : 'bg-slate-900/80 border-slate-800 hover:border-teal-500/40 hover:text-white text-slate-300'
            }`}
          >
            <span className="text-sm">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
};

