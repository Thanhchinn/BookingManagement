import React from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Button } from '../../../components/ui/Button';
import { 
  CheckCircle, 
  QrCode, 
  Calendar, 
  Clock, 
  MapPin, 
  Home,
  FileText
} from 'lucide-react';

interface BookingSuccessProps {
  onNavigate?: (page: 'home' | 'auth' | 'admin' | 'partner' | 'field-details' | 'my-bookings' | 'booking-success' | 'matchmaking' | 'chat', authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
  bookingSuccessData?: {
    bookingCode: string;
    courtName: string;
    sport: string;
    location: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    paymentMethod: string;
    finalPrice: number;
    products: Array<{ name: string; qty: number; price: number }>;
  };
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ 
  onNavigate, 
  userName, 
  onLogout,
  bookingSuccessData 
}) => {
  // Dữ liệu mặc định nếu người dùng F5 hoặc truy cập trực tiếp
  const data = bookingSuccessData || {
    bookingCode: 'BKG-509124',
    courtName: 'Sân Cầu Lông Trong Nhà ProZone - Sân 1',
    sport: 'Cầu Lông',
    location: 'Số 12 Chu Văn An, Bình Thạnh, TP. HCM',
    bookingDate: '2026-06-02',
    startTime: '18:00',
    endTime: '20:00',
    paymentMethod: 'VNPAY',
    finalPrice: 382000,
    products: [
      { name: 'Nước uống Revive', qty: 2, price: 15000 },
      { name: 'Thuê vợt Pro Kennex', qty: 2, price: 30000 }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* Navbar */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* Main content wrapper */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-grow w-full flex flex-col justify-center items-center text-center space-y-8">
        
        {/* Bong bóng báo thành công */}
        <div className="space-y-3 animate-bounce">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto shadow-xl shadow-emerald-500/5">
            <CheckCircle className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight">
            Đặt Lịch Sân Thành Công!
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Hệ thống đã nhận được thanh toán và tự động khóa giữ ca của bạn. Dưới đây là thông tin vé check-in.
          </p>
        </div>

        {/* Thẻ Vé (Ticket Layout) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full text-left overflow-hidden shadow-2xl relative">
          
          {/* Sọc trang trí vé */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500"></div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header Vé */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Mã số vé giữ chỗ</span>
                <span className="text-lg font-mono font-black text-white tracking-widest uppercase">{data.bookingCode}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Trạng thái thanh toán</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-900/60 px-2.5 py-0.5 rounded-full inline-block">
                  ✓ ĐÃ THANH TOÁN
                </span>
              </div>
            </div>

            {/* Chi tiết đặt sân */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white m-0 leading-tight">
                {data.courtName}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Ngày chơi:</strong> {data.bookingDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Khung giờ:</strong> {data.startTime} - {data.endTime} ({data.sport})</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span><strong>Địa chỉ sân:</strong> {data.location}</span>
                </div>
              </div>
            </div>

            {/* Vách đứt Ticket Tear line */}
            <div className="relative border-t border-dashed border-slate-850 my-1 py-1">
              <div className="absolute -left-10 -top-2.5 w-6 h-6 bg-slate-950 rounded-full border-r border-slate-800"></div>
              <div className="absolute -right-10 -top-2.5 w-6 h-6 bg-slate-950 rounded-full border-l border-slate-800"></div>
            </div>

            {/* QR Code Check-in */}
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-slate-950 border border-slate-855 rounded-2xl p-5 relative overflow-hidden group">
              <div className="text-left space-y-2 max-w-sm">
                <h4 className="text-sm font-bold text-white m-0 flex items-center gap-1.5">
                  <QrCode className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  Quét Mã Để Nhận Sân Của Bạn
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed m-0">
                  Khi đến sân thể thao, vui lòng đưa mã QR bên cạnh cho nhân viên tại quầy để check-in nhận thảm đấu. Bạn có thể xem lại mã này bất kỳ lúc nào tại mục "Lịch Hẹn Của Tôi".
                </p>
              </div>

              <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-black/30">
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center border border-dashed border-slate-350 text-slate-800 select-none">
                  <QrCode className="w-10 h-10 stroke-[1.5]" />
                  <span className="text-[7px] font-mono font-bold mt-1 tracking-wider">{data.bookingCode}</span>
                </div>
              </div>
            </div>

            {/* Chi phí & Sản phẩm mua kèm */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-3.5 text-xs">
              <span className="text-slate-500 font-bold block uppercase tracking-wider">Chi tiết biên lai thanh toán</span>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Tiền thuê thảm đấu:</span>
                  <span className="font-mono text-white">{(data.finalPrice - data.products.reduce((acc, p) => acc + (p.qty*p.price), 0)).toLocaleString()}đ</span>
                </div>
                
                {data.products.length > 0 && (
                  <div className="border-t border-slate-850 mt-1.5 pt-1.5 space-y-1">
                    {data.products.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{p.name} (x{p.qty}):</span>
                        <span className="font-mono text-white">{(p.qty * p.price).toLocaleString()}đ</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-850 mt-2.5 pt-2 flex justify-between items-baseline font-bold">
                  <span className="text-white">Tổng cộng thực tế (Đã gồm VAT & Voucher):</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {data.finalPrice.toLocaleString()}đ
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Nút điều hướng */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button
            onClick={() => onNavigate?.('my-bookings')}
            variant="primary"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Xem Vé & Lịch Hẹn Của Tôi
          </Button>

          <Button
            onClick={() => onNavigate?.('home')}
            variant="secondary"
            className="px-6 py-3 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Quay Về Trang Chủ
          </Button>
        </div>

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
};
