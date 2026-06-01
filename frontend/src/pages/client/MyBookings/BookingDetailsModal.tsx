import React from 'react';
import type { BookingItem } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { 
  QrCode, 
  Utensils, 
  XCircle, 
  Star, 
  AlertTriangle 
} from 'lucide-react';

interface BookingDetailsModalProps {
  isOpen: boolean;
  booking: BookingItem | null;
  onClose: () => void;
  onPayOnline: () => void;
  onCancelRequest: () => void;
  onWriteReview: () => void;
  onOpenDispute: () => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  booking,
  onClose,
  onPayOnline,
  onCancelRequest,
  onWriteReview,
  onOpenDispute,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left space-y-6 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200 my-8">
        
        {/* Tiêu đề details */}
        <div className="flex justify-between items-start border-b border-slate-850 pb-4">
          <div className="space-y-1">
            <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-emerald-400 font-mono font-bold tracking-wider">
              {booking.bookingCode}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white m-0 mt-1">{booking.courtName}</h3>
            <p className="text-xs text-slate-400 font-medium m-0 flex items-center gap-1">
              Môn chơi: <strong className="text-emerald-400">{booking.sport}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Phân đoạn Vé Check-in QR */}
        {booking.status === 'CONFIRMED' && (
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 text-center space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
            <div className="w-36 h-36 bg-white p-2.5 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-black/40">
              {/* Giả lập QR Code */}
              <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center border border-dashed border-slate-300 text-slate-800">
                <QrCode className="w-12 h-12 stroke-[1.5]" />
                <span className="text-[8px] font-mono font-bold mt-1 tracking-wider">{booking.bookingCode}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white m-0">Mã QR Check-in Tại Sân</p>
              <p className="text-[10px] text-slate-500 max-w-[220px] mx-auto m-0 leading-relaxed">
                Đưa mã này cho nhân viên quầy lễ tân quét khi bạn đến nhận sân đấu.
              </p>
            </div>
          </div>
        )}

        {/* Thông tin Chi tiết ca và Dịch vụ đi kèm */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Ngày chơi:</span>
            <strong className="text-white">{booking.bookingDate}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Giờ thuê ca:</span>
            <strong className="text-white">{booking.startTime} - {booking.endTime}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Địa điểm cụm sân:</span>
            <strong className="text-white text-right max-w-[240px] truncate">{booking.location}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Trạng thái thanh toán:</span>
            <strong className={`font-bold ${
              booking.paymentStatus === 'FULLY_PAID' ? 'text-emerald-400' :
              booking.paymentStatus === 'UNPAID' ? 'text-amber-500' : 'text-slate-500'
            }`}>
              {booking.paymentStatus === 'FULLY_PAID' ? 'Đã thanh toán đủ' :
               booking.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' :
               booking.paymentStatus === 'DEPOSIT_PAID' ? 'Đã cọc 50%' : 'Đã hoàn tiền'}
            </strong>
          </div>

          {/* Sản phẩm mua kèm */}
          {booking.products.length > 0 && (
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                <Utensils className="w-3.5 h-3.5 text-amber-500" />
                <span>Sản phẩm / Dịch vụ phụ trợ đính kèm</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-855 rounded-xl p-3 space-y-2">
                {booking.products.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>{p.name} <span className="text-slate-500 font-bold">x{p.qty}</span></span>
                    <span className="font-mono text-white font-bold">{(p.qty * p.price).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tổng hóa đơn snapshot */}
          <div className="border-t border-slate-855 pt-3 flex justify-between items-baseline">
            <span className="text-slate-400 font-bold">Tổng tiền đơn đặt:</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {booking.price.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* HÀNH ĐỘNG DỰA TRÊN TRẠNG THÁI ĐƠN HÀNG */}
        <div className="space-y-2.5 pt-4 border-t border-slate-800">
          {/* Chờ thanh toán -> Cho phép Thanh toán ngay */}
          {booking.status === 'PENDING' && (
            <Button 
              onClick={onPayOnline}
              variant="primary" 
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              💳 Thanh Toán Ngay Cổng Online
            </Button>
          )}

          {/* Cho phép hủy lịch nếu sắp chơi (CONFIRMED hoặc PENDING) */}
          {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
            <Button 
              onClick={onCancelRequest}
              variant="secondary" 
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              Yêu Cầu Hủy Lịch Sân
            </Button>
          )}

          {/* Đã hoàn thành -> Cho phép Review và Khiếu nại */}
          {booking.status === 'COMPLETED' && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                disabled={booking.reviewed}
                onClick={onWriteReview}
                variant="secondary"
                className={`py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer border ${
                  booking.reviewed 
                    ? 'bg-slate-950 border-slate-850 text-slate-500 cursor-not-allowed' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40'
                }`}
              >
                <Star className="w-4 h-4 fill-current shrink-0" />
                {booking.reviewed ? 'Đã Đánh Giá' : 'Đánh Giá'}
              </Button>

              <Button
                disabled={booking.disputed}
                onClick={onOpenDispute}
                variant="secondary"
                className={`py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer border ${
                  booking.disputed 
                    ? 'bg-slate-950 border-slate-850 text-red-500/30 cursor-not-allowed' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {booking.disputed ? 'Đang Khiếu Nại' : 'Khiếu Nại'}
              </Button>
            </div>
          )}

          {/* Đã hủy -> Vẫn cho khiếu nại (nếu bị hủy oan hoặc không hoàn cọc) */}
          {booking.status === 'CANCELLED' && (
            <Button 
              disabled={booking.disputed}
              onClick={onOpenDispute}
              variant="secondary" 
              className={`w-full py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border ${
                booking.disputed 
                  ? 'bg-slate-950 border-slate-850 text-red-500/30 cursor-not-allowed' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {booking.disputed ? 'Đang Xử Lý Khiếu Nại' : 'Khiếu Nại Hoàn Tiền / Cọc'}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};
