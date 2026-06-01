import React from 'react';
import type { BookingItem } from '../../../types';

interface CancelBookingModalProps {
  isOpen: boolean;
  booking: BookingItem | null;
  cancelReason: string;
  setCancelReason: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  booking,
  cancelReason,
  setCancelReason,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left space-y-5 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-red-400">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl shrink-0">
            ⚠️
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white m-0">Xác Nhận Hủy Lịch Đặt Sân</h4>
            <p className="text-[10px] text-slate-400 m-0">
              Vé đặt sân: <strong className="text-slate-200 font-mono font-medium">{booking.bookingCode}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Lý do hủy sân bãi (Bắt buộc):</label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Ví dụ: Đột xuất bận việc gia đình, thời tiết mưa bão, hoặc chuyển ca thi đấu khác..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-red-500/50 rounded-xl p-3.5 text-xs text-slate-300 outline-none transition resize-none h-24"
          />
          <p className="text-[10px] text-slate-500 m-0 leading-relaxed">
            * Lưu ý: Tùy thuộc vào thời gian hủy so với giờ thi đấu, chính sách hoàn trả của sân bãi có thể áp dụng khấu trừ phí cọc/phí thanh toán online.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            Giữ lại ca
          </button>
          <button
            disabled={!cancelReason.trim()}
            onClick={onConfirm}
            className={`px-5 py-2 text-xs font-bold text-white border-0 rounded-xl transition cursor-pointer ${
              cancelReason.trim() 
                ? 'bg-red-650 hover:bg-red-700 shadow-lg shadow-red-600/20' 
                : 'bg-red-800/40 text-slate-500 cursor-not-allowed'
            }`}
          >
            Xác Nhận Hủy Ngay
          </button>
        </div>
      </div>
    </div>
  );
};
