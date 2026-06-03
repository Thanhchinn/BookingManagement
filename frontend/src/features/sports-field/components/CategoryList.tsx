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
    <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2 select-none scrollbar-none">
      {CATEGORIES.map(category => {
        const isActive = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
              isActive 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105 border border-emerald-500' 
                : 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300'
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

