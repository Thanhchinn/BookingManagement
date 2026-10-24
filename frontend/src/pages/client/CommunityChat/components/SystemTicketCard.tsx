import React from 'react';
import { 
  Ticket, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Navigation, 
  Copy
} from 'lucide-react';
import type { TicketData } from '../../../../types/chat';
import { toast } from 'sonner';

interface SystemTicketCardProps {
  ticket: TicketData;
  timestamp?: string;
  onOpenQR: (ticket: TicketData) => void;
  onOpenDirections: (address: string, courtName: string) => void;
}

export const SystemTicketCard: React.FC<SystemTicketCardProps> = ({
  ticket,
  timestamp,
  onOpenQR,
  onOpenDirections
}) => {
  const isConfirmed = ticket.status === 'CONFIRMED' || ticket.status === 'CHECKED_IN';

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ticket.bookingCode);
    toast.success(`Đã sao chép mã đặt sân: ${ticket.bookingCode}`);
  };

  return (
    <div className="flex justify-center my-4 w-full px-2 sm:px-4">
      {/* Container Vé Điện Tử (Electronic Ticket Card) */}
      <div className="relative w-full max-w-[430px] rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/35 p-4 sm:p-5 shadow-2xl shadow-emerald-950/30 overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
        
        {/* Holographic Top Glow Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Header Vé Điện Tử */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase block">
                SPORTZONE PASS
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Hệ thống xác thực điện tử</span>
            </div>
          </div>

          {/* Badge trạng thái */}
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
            isConfirmed 
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400' 
              : 'bg-amber-500/15 border-amber-500/35 text-amber-400'
          }`}>
            {isConfirmed ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{ticket.statusLabel || 'Đã Giữ Chỗ'}</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{ticket.statusLabel || 'Chờ Thanh Toán'}</span>
              </>
            )}
          </div>
        </div>

        {/* 2. Thân Vé: Tên sân & Thông tin chi tiết */}
        <div className="py-3.5 space-y-3 text-left">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Sân thi đấu đã xác nhận
            </span>
            <h4 className="text-sm sm:text-base font-black text-white m-0 tracking-tight leading-snug">
              {ticket.courtName}
            </h4>
            <p className="text-[11px] text-slate-400 m-0 mt-0.5 truncate" title={ticket.address}>
              📍 {ticket.locationName} - {ticket.address}
            </p>
          </div>

          {/* Lưới 2 Cột hiển thị dữ liệu vé */}
          <div className="grid grid-cols-2 gap-2.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                Khung giờ chơi
              </span>
              <span className="text-xs font-bold text-slate-200 block mt-0.5 font-mono">
                {ticket.timeSlot}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium block">
                {ticket.playDate}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                Mã đặt sân (Booking Code)
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-extrabold text-cyan-400 font-mono tracking-wider">
                  {ticket.bookingCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded border border-slate-700/60 cursor-pointer transition"
                  title="Sao chép mã"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {ticket.price || '350.000 đ'} • {isConfirmed ? 'Đã cọc' : 'Chờ cọc'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Đường Cắt Vé Tinh Tế (Perforated Dashed Divider with Notches) */}
        <div className="relative my-2 py-1 flex items-center justify-center">
          {/* Lỗ khuyết vé trái */}
          <div className="absolute -left-6 sm:-left-7 w-4 h-4 rounded-full bg-slate-950 border-r border-emerald-500/35" />
          {/* Đường nét đứt xé vé */}
          <div className="w-full border-t border-dashed border-slate-700/70" />
          {/* Lỗ khuyết vé phải */}
          <div className="absolute -right-6 sm:-right-7 w-4 h-4 rounded-full bg-slate-950 border-l border-emerald-500/35" />
        </div>

        {/* 4. Cuống Vé & Nút Hành Động Nhanh (Stub & Action Buttons) */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Barcode/Scan text */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex gap-0.5 items-end h-6 py-0.5 px-1 bg-slate-950 rounded border border-slate-800">
              <span className="w-0.5 h-full bg-slate-400" />
              <span className="w-1 h-3/4 bg-slate-300" />
              <span className="w-0.5 h-full bg-slate-400" />
              <span className="w-1.5 h-full bg-slate-300" />
              <span className="w-0.5 h-1/2 bg-slate-400" />
              <span className="w-1 h-full bg-slate-300" />
              <span className="w-0.5 h-3/4 bg-slate-400" />
              <span className="w-1 h-full bg-slate-300" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Quét QR tại quầy
            </span>
          </div>

          {/* Nút hành động trực tiếp trên vé */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onOpenDirections(ticket.address, ticket.courtName)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-[11px] font-bold inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Chỉ đường tới sân"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chỉ đường</span>
            </button>

            <button
              onClick={() => onOpenQR(ticket)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-emerald-600/20"
              title="Mở mã QR Check-in"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mở mã QR</span>
            </button>
          </div>
        </div>

        {/* Timestamp phía dưới vé */}
        {timestamp && (
          <div className="mt-3 text-right">
            <span className="text-[9px] text-slate-600 font-mono">
              Xác nhận lúc {timestamp}
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
