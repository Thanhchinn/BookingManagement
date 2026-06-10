import { useState, useEffect, useCallback } from 'react';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

// Map icon font-awesome sang emoji fallback khi dùng trên UI
const ICON_EMOJI_MAP: Record<string, string> = {
  'fa-futbol': '⚽',
  'fa-baseball-ball': '⚾',
  'fa-basketball-ball': '🏀',
  'fa-volleyball-ball': '🏐',
  'fa-table-tennis': '🏓',
  'fa-shuttlecock': '🏸',
  'fa-golf-ball': '⛳',
  'fa-medal': '🏆',
  'tennis': '🎾',
};

export function useCategoryEmoji(icon: string): string {
  return ICON_EMOJI_MAP[icon] ?? icon;
}

/**
 * Hook lấy danh sách bộ môn thể thao từ database.
 * Tự động sort theo sortOrder tăng dần.
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/categories')
      .then(r => {
        if (!r.ok) throw new Error('Không thể tải danh sách bộ môn.');
        return r.json();
      })
      .then((data: any[]) => {
        const mapped: CategoryItem[] = data
          .filter(d => d.isActive !== false)
          .map(d => ({
            id: String(d.id),
            name: d.name,
            slug: d.slug,
            icon: ICON_EMOJI_MAP[d.icon] ?? d.icon ?? '🏆',
            isActive: d.isActive,
            sortOrder: d.sortOrder ?? 0,
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setCategories(mapped);
      })
      .catch(err => {
        console.error('[useCategories]', err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * Chuyển slug → name (ví dụ: 'bong-da' → 'Bóng Đá')
   */
  const getNameBySlug = useCallback((slug: string): string => {
    return categories.find(c => c.slug === slug)?.name ?? '';
  }, [categories]);

  return { categories, isLoading, error, getNameBySlug };
}
