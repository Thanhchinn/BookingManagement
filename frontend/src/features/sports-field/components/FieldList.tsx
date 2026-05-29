import React from 'react';
import { FieldCard } from './FieldCard';
import type { SportField } from './FieldCard';

// Dữ liệu mẫu (sau này sẽ được gọi từ API)
const MOCK_FIELDS: SportField[] = [
  {
    id: '1',
    title: 'Sân Cầu Lông Trong Nhà ProZone',
    location: 'Quận Bình Thạnh, TP. HCM',
    price: '120.000đ - 180.000đ',
    rating: 4.9,
    image: '🏸',
    sport: 'Cầu Lông'
  },
  {
    id: '2',
    title: 'Sân Bóng Đá Cỏ Nhân Tạo Stadium A',
    location: 'Quận 2, TP. Thủ Đức',
    price: '300.000đ - 450.000đ',
    rating: 4.8,
    image: '⚽',
    sport: 'Bóng Đá'
  },
  {
    id: '3',
    title: 'Sân Tennis Đất Nện Đạt Chuẩn ATP',
    location: 'Quận 7, TP. HCM',
    price: '200.000đ - 350.000đ',
    rating: 4.9,
    image: '🎾',
    sport: 'Tennis'
  }
];

export const FieldList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {MOCK_FIELDS.map(court => (
        <FieldCard key={court.id} court={court} />
      ))}
    </div>
  );
};
