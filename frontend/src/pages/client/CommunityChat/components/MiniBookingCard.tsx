import React, { useState } from 'react';
import { 
  Navigation, 
  QrCode, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Copy,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import type { BookingContext } from '../../../../types/chat';
import { toast } from 'sonner';

interface MiniBookingCardProps {
  context: BookingContext;
  onViewDirections: (ctx: BookingContext) => void;
  onShareQR: (ctx: BookingContext) => void;
  onSendTicketToChat?: (ctx: BookingContext) => void;
}

export const MiniBookingCard: React.FC<MiniBookingCardProps> = ({
  context,
  onViewDirections,
  onShareQR,
  onSendTicketToChat
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isConfirmed = context.status === 'CONFIRMED' || context.status === 'CHECKED_IN';

  const copyBookingCode = () => {
    navigator.clipboard.writeText(context.bookingCode);
    toast.success(`Đã sao chép mã đặt sân: ${context.bookingCode}`);
  };

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md z-20 shrink-0 transition-all duration-200 shadow-sm">
      {/* Thanh ghim chính (Pinned Bar) - Tối ưu mật độ thị giác Visual Density 6 */}
      <div className="px-3.5 sm:px-5 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
        
        {/* Phần 1: Tên sân & Thời gian chơi */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border select-none ${
            isConfirmed 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <span className="text-sm">🏟️</span>
          </div>

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate m-0 leading-tight">
                {context.courtName}
              </h4>
              <button 
                onClick={copyBookingCode}
                className="hidden xs:inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono transition cursor-pointer"
                title="Sao chép mã"
              >
                {context.bookingCode}
                <Copy className="w-2.5 h-2.5 text-slate-400" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium flex-wrap">
              <span className="inline-flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                {context.timeSlot} • {context.playDate}
              </span>
              <span className="hidden md:inline text-slate-600">•</span>
              <span className="hidden md:inline-flex items-center gap-1 text-slate-400 truncate max-w-[200px]" title={context.address}>
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                {context.locationName}
              </span>
            </div>
          </div>
        </div>

        {/* Phần 2: Trạng thái & Các nút hành động nhanh */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0 shrink-0">
          {/* Badge trạng thái */}
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
            isConfirmed
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 shadow-xs shadow-emerald-500/10'
              : 'bg-amber-500/15 border-amber-500/35 text-amber-400 shadow-xs shadow-amber-500/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {context.statusLabel || (isConfirmed ? 'Đã giữ chỗ' : 'Chờ thanh toán')}
          </div>

          {/* Nút hành động nhanh: Xem đường đi */}
          <button
            onClick={() => onViewDirections(context)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            title="Xem chỉ đường tới sân"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Xem đường đi</span>
          </button>

          {/* Nút hành động nhanh: Chia sẻ mã QR */}
          <button
            onClick={() => onShareQR(context)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 text-[11px] font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            title="Mở & chia sẻ mã QR Check-in"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chia sẻ mã QR</span>
          </button>

          {/* Toggle mở rộng chi tiết */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 bg-transparent border-0 cursor-pointer transition"
            title={isExpanded ? 'Thu gọn' : 'Xem chi tiết sân & giá'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Phần mở rộng chi tiết (Collapsible Details Drawer) */}
      {isExpanded && (
        <div className="px-3.5 sm:px-5 py-3 bg-slate-950/60 border-t border-slate-850/80 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in slide-in-from-top-1 duration-150">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Địa chỉ sân</span>
            <p className="m-0 text-slate-300 font-medium flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>{context.address}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Chi phí & Cọc sân</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {typeof context.totalPrice === 'number' 
                  ? `${context.totalPrice.toLocaleString('vi-VN')} đ` 
                  : (context.totalPrice || '350.000 đ')}
              </span>
              <span className="text-[10px] text-slate-500">
                ({isConfirmed ? 'Đã xác nhận cọc' : 'Chờ hoàn tất thanh toán'})
              </span>
            </div>
          </div>

          <div className="flex items-center sm:justify-end gap-2">
            {context.contactPhone && (
              <a
                href={`tel:${context.contactPhone}`}
                className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 text-[11px] font-bold inline-flex items-center gap-1.5 transition no-underline"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gọi chủ sân</span>
              </a>
            )}

            {onSendTicketToChat && (
              <button
                onClick={() => onSendTicketToChat(context)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                title="Gửi tấm vé điện tử này vào đoạn chat"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gửi vé vào chat</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
