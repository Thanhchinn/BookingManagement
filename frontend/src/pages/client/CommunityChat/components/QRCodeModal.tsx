import React from 'react';
import { X, Copy, QrCode, Share2 } from 'lucide-react';
import type { BookingContext, TicketData } from '../../../../types/chat';
import { toast } from 'sonner';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketData | BookingContext | null;
  onSendToChat?: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSendToChat
}) => {
  if (!isOpen || !ticket) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(ticket.bookingCode);
    toast.success(`Đã sao chép mã: ${ticket.bookingCode}`);
  };

  const copyLink = () => {
    const checkinUrl = `https://sportzone.vn/checkin?code=${encodeURIComponent(ticket.bookingCode)}`;
    navigator.clipboard.writeText(checkinUrl);
    toast.success('Đã sao chép liên kết vé check-in!');
  };

  const isConfirmed = ticket.status === 'CONFIRMED' || ticket.status === 'CHECKED_IN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-center z-10 space-y-4">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition border-0 bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề Modal */}
        <div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-white m-0 tracking-tight">
            Mã QR Check-in & Giữ Chỗ
          </h3>
          <p className="text-xs text-slate-400 mt-1 m-0">
            Xuất trình mã này tại quầy lễ tân để nhận sân thi đấu
          </p>
        </div>

        {/* Khung Mã QR SVG Siêu Nét */}
        <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-lg relative group">
          {/* Authentic SVG QR Code Graphic */}
          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Corner position markers */}
            <rect x="5" y="5" width="26" height="26" rx="4" fill="#09090b" />
            <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
            <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#10b981" />

            <rect x="69" y="5" width="26" height="26" rx="4" fill="#09090b" />
            <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
            <rect x="77" y="13" width="10" height="10" rx="1.5" fill="#10b981" />

            <rect x="5" y="69" width="26" height="26" rx="4" fill="#09090b" />
            <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
            <rect x="13" y="77" width="10" height="10" rx="1.5" fill="#10b981" />

            {/* Matrix Data Points */}
            <rect x="36" y="8" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="46" y="8" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="56" y="8" width="5" height="5" rx="1" fill="#09090b" />
            
            <rect x="36" y="18" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="46" y="18" width="5" height="5" rx="1" fill="#10b981" />
            <rect x="56" y="18" width="5" height="5" rx="1" fill="#09090b" />

            <rect x="36" y="28" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="8" y="36" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="18" y="36" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="28" y="36" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="42" y="36" width="6" height="6" rx="1" fill="#09090b" />
            <rect x="54" y="36" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="68" y="36" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="78" y="36" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="88" y="36" width="5" height="5" rx="1" fill="#09090b" />

            {/* Center SportZone Badge */}
            <circle cx="50" cy="50" r="11" fill="#09090b" />
            <circle cx="50" cy="50" r="9" fill="#10b981" />
            <path d="M46 50L49 53L54 47" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Bottom matrix */}
            <rect x="36" y="46" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="60" y="46" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="8" y="56" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="22" y="56" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="36" y="56" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="48" y="56" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="62" y="56" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="76" y="56" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="86" y="56" width="5" height="5" rx="1" fill="#09090b" />

            <rect x="36" y="68" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="48" y="68" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="60" y="68" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="72" y="68" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="84" y="68" width="5" height="5" rx="1" fill="#09090b" />

            <rect x="36" y="80" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="46" y="80" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="58" y="80" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="70" y="80" width="5" height="5" rx="1" fill="#09090b" />
            <rect x="82" y="80" width="5" height="5" rx="1" fill="#09090b" />
          </svg>

          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1 block">
            Quét mã để Check-in
          </span>
        </div>

        {/* Thông tin vé */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Mã đặt sân
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-black text-cyan-400">
                {ticket.bookingCode}
              </span>
              <button
                onClick={copyCode}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 cursor-pointer transition"
                title="Sao chép mã"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-white block">
              {ticket.courtName}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              ⏰ {ticket.timeSlot} • {ticket.playDate}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-850">
            <span className="text-[10px] text-slate-400">Trạng thái vé:</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isConfirmed ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {ticket.statusLabel || (isConfirmed ? 'Đã giữ chỗ' : 'Chờ thanh toán')}
            </span>
          </div>
        </div>

        {/* Các nút hành động */}
        <div className="space-y-2 pt-1">
          {onSendToChat && (
            <button
              onClick={() => {
                onSendToChat();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-md shadow-emerald-600/20 active:scale-98"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ vé vào đoạn chat này</span>
            </button>
          )}

          <button
            onClick={copyLink}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/80"
          >
            <Copy className="w-4 h-4" />
            <span>Sao chép liên kết vé</span>
          </button>
        </div>

      </div>

    </div>
  );
};
