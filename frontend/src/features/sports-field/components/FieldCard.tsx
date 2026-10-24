import React from 'react';
import { ArrowRight, MapPin, ShieldCheck, Star, Trophy, Clock } from 'lucide-react';
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
  availableSlots?: string[];
  features?: string[];
}

interface FieldCardProps {
  court: SportField;
  onNavigate?: (page: any, data?: any) => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ court, onNavigate }) => {
  // Mock time slots nếu chưa có từ API
  const defaultSlots = ['17:30', '18:30', '19:30', '20:30'];
  const slots = court.availableSlots || defaultSlots;

  return (
    <div 
      onClick={() => onNavigate?.('field-details', { locationId: court.id })}
      className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 hover:border-emerald-500/40 rounded-2xl overflow-hidden text-left flex flex-col group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 hover:-translate-y-1.5"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onNavigate?.('field-details', { locationId: court.id });
        }
      }}
    >
      {/* Ảnh đại diện sân */}
      <div className="sz-card-media bg-zinc-950 flex items-center justify-center overflow-hidden select-none relative aspect-[16/10]">
        {(court.image.startsWith('/') || court.image.startsWith('http')) ? (
          <img 
            src={court.image} 
            alt={court.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="w-7 h-7" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        
        {/* Rating Badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-zinc-950/80 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-zinc-800">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{court.rating}</span>
        </div>

        {/* Sport Category Badge */}
        <span className="absolute right-3 top-3 text-[10px] bg-emerald-400 text-zinc-950 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
          {court.sport}
        </span>

        {/* Live Slot Indicator */}
        <div className="absolute left-3 bottom-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[11px] font-semibold text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Lịch trống hôm nay</span>
        </div>
      </div>
      
      {/* Nội dung chi tiết của sân */}
      <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <h4 className="text-base font-bold text-zinc-50 leading-snug m-0 group-hover:text-emerald-400 transition-colors line-clamp-1">
            {court.title}
          </h4>
 
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="line-clamp-1">{court.location}</span>
          </div>

          {/* Time-Slot Pills (Hiển thị trực quan giờ trống) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>Khung giờ trống sắp tới:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {slots.map((slot, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors"
                >
                  {slot}
                </span>
              ))}
              <span className="px-2 py-1 text-[10px] font-semibold text-zinc-500">
                +2 ca khác
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đã xác minh cơ sở vật chất</span>
          </div>
        </div>
 
        <div className="space-y-3 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider m-0">Giá thuê từ</p>
              <p className="text-base font-black text-emerald-400 font-mono m-0">{court.price}</p>
            </div>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.('field-details', { locationId: court.id });
              }}
              variant="secondary" 
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white border border-zinc-700 text-xs font-bold rounded-xl cursor-pointer group/cta flex items-center gap-1.5 shadow-sm"
            >
              <span>Xem Lịch</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-1 text-emerald-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
