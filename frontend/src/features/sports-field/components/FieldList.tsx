import React from 'react';
import { SearchX } from 'lucide-react';
import { FieldCard } from './FieldCard';
import type { SportField } from './FieldCard';

// Dữ liệu mẫu (sau này sẽ được gọi từ API) - Được export để dùng cho bộ lọc ở Home
export const MOCK_FIELDS: SportField[] = [
  {
    id: '1',
    title: 'Sân Cầu Lông Trong Nhà ProZone',
    location: 'Quận Bình Thạnh, TP. HCM',
    price: '120.000đ - 180.000đ',
    rating: 4.9,
    image: '/badminton_court.png',
    sport: 'Cầu Lông'
  },
  {
    id: '2',
    title: 'Sân Bóng Đá Cỏ Nhân Tạo Stadium A',
    location: 'Quận 2, TP. Thủ Đức',
    price: '300.000đ - 450.000đ',
    rating: 4.8,
    image: '/football_stadium.png',
    sport: 'Bóng Đá'
  },
  {
    id: '3',
    title: 'Sân Tennis Đất Nện Đạt Chuẩn ATP',
    location: 'Quận 7, TP. HCM',
    price: '200.000đ - 350.000đ',
    rating: 4.9,
    image: '/tennis_court.png',
    sport: 'Tennis'
  },
  {
    id: '4',
    title: 'Sân Bóng Đá Mini Cầu Đỏ',
    location: 'Quận Bình Thạnh, TP. HCM',
    price: '250.000đ - 400.000đ',
    rating: 4.7,
    image: '/football_stadium.png',
    sport: 'Bóng Đá'
  },
  {
    id: '5',
    title: 'Sân Cầu Lông Rồng Vàng',
    location: 'Quận 2, TP. Thủ Đức',
    price: '100.000đ - 150.000đ',
    rating: 4.6,
    image: '/badminton_court.png',
    sport: 'Cầu Lông'
  },
  {
    id: '6',
    title: 'Sân Tennis Phú Mỹ Hưng',
    location: 'Quận 7, TP. HCM',
    price: '220.000đ - 380.000đ',
    rating: 4.8,
    image: '/tennis_court.png',
    sport: 'Tennis'
  }
];

interface FieldListProps {
  fields?: SportField[];
  onNavigate?: (page: any, authMode?: any) => void;
}

export const FieldList: React.FC<FieldListProps> = ({ fields = MOCK_FIELDS, onNavigate }) => {
  if (fields.length === 0) {
    return (
      <div className="sz-empty flex flex-col items-center justify-center py-16 px-4 text-slate-400 space-y-4">
        <div className="w-16 h-16 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-teal-300">
          <SearchX className="w-7 h-7" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-bold text-slate-300">Không tìm thấy sân phù hợp</p>
          <p className="text-sm text-slate-500 max-w-md">
            Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại các bộ lọc (Địa điểm, Bộ môn) để tìm được sân ưng ý nhé!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
      {fields.map(court => (
        <FieldCard key={court.id} court={court} onNavigate={onNavigate} />
      ))}
    </div>
  );
};

