import React from 'react';
import { ArrowRight, MapPin, ShieldCheck, Star, Trophy } from 'lucide-react';
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
  onNavigate?: (page: any, data?: any) => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ court, onNavigate }) => {
  return (
    <div 
      onClick={() => onNavigate?.('field-details', { locationId: court.id })}
      className="sz-card sz-card-lift overflow-hidden hover:border-teal-500/40 text-left flex flex-col group cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onNavigate?.('field-details', { locationId: court.id });
        }
      }}
    >
      {/* Ảnh đại diện thực tế hoặc giả lập bằng Emoji lớn */}
      <div className="sz-card-media bg-slate-950 flex items-center justify-center overflow-hidden select-none relative">
        {(court.image.startsWith('/') || court.image.startsWith('http')) ? (
          <img 
            src={court.image} 
            alt={court.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300">
            <Trophy className="w-7 h-7" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent transition-all duration-300"></div>
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-slate-950/72 px-2.5 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md border border-white/10">
          <Star className="w-3.5 h-3.5 fill-current" />
          {court.rating}
        </div>
        <span className="absolute right-3 top-3 text-[10px] bg-teal-500 text-slate-950 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
          {court.sport}
        </span>
      </div>
      
      {/* Nội dung chi tiết của sân */}
      <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <h4 className="text-base font-extrabold text-white leading-tight m-0 group-hover:text-teal-300 transition line-clamp-2 min-h-[40px]">
            {court.title}
          </h4>
 
          <div className="flex items-center gap-1.5 text-xs text-slate-400 min-h-[18px]">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{court.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/15 rounded-lg px-2.5 py-2 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Đã xác minh lịch trống</span>
          </div>
        </div>
 
        <div className="space-y-3 pt-3">
          <hr className="border-slate-800 m-0" />
 
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider m-0">Giá thuê chỉ từ</p>
              <p className="text-sm font-extrabold text-teal-300 m-0">{court.price}/giờ</p>
            </div>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.('field-details', { locationId: court.id });
              }}
              variant="secondary" 
              className="px-4 py-2 text-xs font-bold rounded-lg cursor-pointer group/cta"
            >
              Chi Tiết
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
