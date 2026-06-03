import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

// Định nghĩa Interface dữ liệu cho 1 Sân thể thao
export interface SportField {
  id: string;
  title: string;
  location: string;
  price: string;
  rating: number;
  image: string;
  sport: string;
}

interface FieldCardProps {
  court: SportField;
  onNavigate?: (page: any, authMode?: any) => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ court, onNavigate }) => {
  return (
    <div 
      onClick={() => onNavigate?.('field-details')}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 text-left flex flex-col group cursor-pointer"
    >
      {/* Ảnh đại diện thực tế hoặc giả lập bằng Emoji lớn */}
      <div className="h-44 bg-slate-950 flex items-center justify-center overflow-hidden select-none relative">
        {court.image.startsWith('/') ? (
          <img 
            src={court.image} 
            alt={court.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-6xl group-hover:scale-105 transition-transform duration-300 block">
            {court.image}
          </span>
        )}
        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all duration-300"></div>
      </div>
      
      {/* Nội dung chi tiết của sân */}
      <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] bg-slate-800 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {court.sport}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current" /> {court.rating}
            </div>
          </div>
 
          <h4 className="text-base font-extrabold text-white leading-tight m-0 group-hover:text-emerald-400 transition">
            {court.title}
          </h4>
 
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{court.location}</span>
          </div>
        </div>
 
        <div className="space-y-3 pt-3">
          <hr className="border-slate-800 m-0" />
 
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider m-0">Giá thuê chỉ từ</p>
              <p className="text-sm font-extrabold text-emerald-400 m-0">{court.price}/giờ</p>
            </div>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.('field-details');
              }}
              variant="secondary" 
              className="px-4 py-2 text-xs font-bold rounded-lg cursor-pointer"
            >
              Chi Tiết
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
