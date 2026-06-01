import React, { useState } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight 
} from 'lucide-react';

import type { BookingItem } from '../../../types';
import { BookingDetailsModal } from './BookingDetailsModal';
import { CancelBookingModal } from './CancelBookingModal';
import { ReviewBookingModal } from './ReviewBookingModal';
import { DisputeBookingModal } from './DisputeBookingModal';

interface MyBookingsProps {
  onNavigate?: (page: any, authMode?: any) => void;
  userName?: string;
  onLogout?: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onNavigate, userName, onLogout }) => {
  // Mock State để có thể tương tác đầy đủ trên giao diện
  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: '1',
      bookingCode: 'BKG-COURT501',
      courtName: 'Sân Cầu Lông Trong Nhà ProZone - Sân 1',
      sport: 'Cầu Lông',
      location: 'Số 12 Chu Văn An, Bình Thạnh, TP. HCM',
      bookingDate: '2026-06-02',
      startTime: '18:00',
      endTime: '20:00',
      price: 320000,
      status: 'CONFIRMED',
      paymentStatus: 'FULLY_PAID',
      products: [
        { name: 'Nước uống Revive', qty: 2, price: 15000 },
        { name: 'Thuê vợt Pro Kennex', qty: 2, price: 30000 }
      ]
    },
    {
      id: '2',
      bookingCode: 'BKG-STADIUM802',
      courtName: 'Sân Bóng Đá Cỏ Nhân Tạo Stadium A - Sân 5',
      sport: 'Bóng Đá',
      location: 'Đường Song Hành, An Phú, Quận 2, TP. HCM',
      bookingDate: '2026-05-30',
      startTime: '19:00',
      endTime: '20:30',
      price: 550000,
      status: 'COMPLETED',
      paymentStatus: 'FULLY_PAID',
      products: [
        { name: 'Nước uống Sting', qty: 5, price: 15000 }
      ],
      reviewed: false,
      disputed: false
    },
    {
      id: '3',
      bookingCode: 'BKG-TENNIS991',
      courtName: 'Sân Tennis Đất Nện Đạt Chuẩn ATP - Sân VIP',
      sport: 'Tennis',
      location: 'Khu Phú Mỹ Hưng, Quận 7, TP. HCM',
      bookingDate: '2026-06-05',
      startTime: '08:00',
      endTime: '10:00',
      price: 600000,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      products: []
    },
    {
      id: '4',
      bookingCode: 'BKG-BADMINTON111',
      courtName: 'Sân Cầu Lông Trong Nhà ProZone - Sân 3',
      sport: 'Cầu Lông',
      location: 'Số 12 Chu Văn An, Bình Thạnh, TP. HCM',
      bookingDate: '2026-05-15',
      startTime: '15:00',
      endTime: '17:00',
      price: 240000,
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      products: []
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  
  // Drawer / Modals State
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);
  const [disputeCategory, setDisputeCategory] = useState<string>('QUALITY');
  const [disputeDescription, setDisputeDescription] = useState<string>('');

  // Lọc danh sách đơn đặt sân
  const filteredBookings = bookings.filter(b => {
    if (activeFilter === 'ALL') return true;
    return b.status === activeFilter;
  });

  // Hủy đặt sân
  const handleCancelBooking = () => {
    if (!selectedBooking) return;
    setBookings(prev => prev.map(b => {
      if (b.id === selectedBooking.id) {
        return { 
          ...b, 
          status: 'CANCELLED', 
          paymentStatus: b.paymentStatus === 'FULLY_PAID' ? 'REFUNDED' : 'UNPAID'
        };
      }
      return b;
    }));
    setShowCancelModal(false);
    setSelectedBooking(null);
    setCancelReason('');
    alert('Hủy đơn đặt lịch sân bãi thành công. Tiền đặt cọc/thanh toán (nếu có) sẽ được hoàn trả theo quy định.');
  };

  // Đăng đánh giá
  const handleSubmitReview = () => {
    if (!selectedBooking) return;
    setBookings(prev => prev.map(b => {
      if (b.id === selectedBooking.id) {
        return { ...b, reviewed: true };
      }
      return b;
    }));
    setShowReviewModal(false);
    setSelectedBooking(null);
    setReviewComment('');
    setRating(5);
    alert('Cảm ơn bạn đã gửi đánh giá! Ý kiến của bạn sẽ giúp chủ sân cải thiện dịch vụ tốt hơn.');
  };

  // Gửi khiếu nại
  const handleSendDispute = () => {
    if (!selectedBooking) return;
    setBookings(prev => prev.map(b => {
      if (b.id === selectedBooking.id) {
        return { ...b, disputed: true };
      }
      return b;
    }));
    setShowDisputeModal(false);
    setSelectedBooking(null);
    setDisputeDescription('');
    alert('Khiếu nại của bạn đã được gửi tới Ban Quản Trị hệ thống. Chúng tôi sẽ điều tra và phản hồi trong vòng 24 giờ.');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge status="warning">Chờ thanh toán</Badge>;
      case 'CONFIRMED':
        return <Badge status="success">Sắp đá / Chờ chơi</Badge>;
      case 'COMPLETED':
        return <Badge status="info">Đã hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge status="danger">Đã hủy lịch</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* 1. HEADER NAVBAR */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* 2. MAIN HUB CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-8">
        
        {/* Tiêu đề & Thống kê điểm loyalty */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
          <div className="text-left space-y-1">
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Khách hàng thân thiết
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight">
              Lịch Hẹn Của Tôi
            </h2>
            <p className="text-xs text-slate-400">
              Quản lý danh sách đặt sân thể thao, xem mã QR check-in, viết đánh giá và khiếu nại.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-left leading-none">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Điểm thưởng tích lũy</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">450 <span className="text-xs text-slate-500 font-medium">pts</span></span>
            </div>
          </div>
        </div>

        {/* 3. TABS BỘ LỌC ĐƠN HÀNG */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map(filter => {
            const label = filter === 'ALL' ? 'Tất cả đơn' : 
                          filter === 'CONFIRMED' ? 'Chờ chơi' : 
                          filter === 'PENDING' ? 'Chờ thanh toán' : 
                          filter === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy';
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer border ${
                  isActive 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/10' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 4. DỮ LIỆU ĐƠN ĐẶT SÂN */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-850 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-slate-800">
                📅
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white m-0">Không tìm thấy đơn đặt sân nào</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Bạn chưa đăng ký lịch đặt sân bãi nào trong bộ lọc này hoặc chưa hoàn tất thao tác giữ ca.</p>
              </div>
              <Button 
                onClick={() => onNavigate?.('home')} 
                variant="primary" 
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Khám phá đặt sân ngay
              </Button>
            </div>
          ) : (
            filteredBookings.map(b => (
              <div 
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className={`bg-slate-900 border transition-all duration-200 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:shadow-lg hover:shadow-emerald-950/10 ${
                  selectedBooking?.id === b.id ? 'border-emerald-500 bg-slate-900/90 shadow-md border-dashed' : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3 flex-grow text-left">
                  <div className="flex flex-wrap items-center gap-2 text-left">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">{b.bookingCode}</span>
                    {getStatusBadge(b.status)}
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-white m-0 hover:text-emerald-400 transition text-left">
                    {b.courtName}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-400 text-left">
                    <div className="flex items-center gap-1.5 text-left">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{b.bookingDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-left">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{b.startTime} - {b.endTime} ({b.sport})</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2 text-left">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{b.location}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex sm:flex-col items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0 shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider m-0">Tổng thanh toán</p>
                    <p className="text-base font-extrabold text-emerald-400 font-mono m-0">
                      {b.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>

                  <button className="flex items-center gap-1 text-[11px] font-extrabold text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-xl transition duration-150">
                    Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ======================================================================
          5. MODALS & FORMS ĐỐI THOẠI HÀNH ĐỘNG
          ====================================================================== */}

      {/* F. CHI TIẾT ĐƠN HÀNG POPUP MODAL (XEM CHI TIẾT) */}
      <BookingDetailsModal
        isOpen={selectedBooking !== null && !showCancelModal && !showReviewModal && !showDisputeModal}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onPayOnline={() => {
          alert('Hệ thống đang chuyển hướng tới Cổng Thanh Toán VNPay/MoMo để xử lý giao dịch...');
          if (selectedBooking) {
            setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'CONFIRMED', paymentStatus: 'FULLY_PAID' } : b));
            setSelectedBooking(null);
          }
        }}
        onCancelRequest={() => setShowCancelModal(true)}
        onWriteReview={() => setShowReviewModal(true)}
        onOpenDispute={() => setShowDisputeModal(true)}
      />

      {/* A. MODAL HỦY ĐẶT SÂN */}
      <CancelBookingModal
        isOpen={showCancelModal}
        booking={selectedBooking}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason('');
        }}
        onConfirm={handleCancelBooking}
      />

      {/* B. MODAL ĐĂNG ĐÁNH GIÁ (REVIEW) */}
      <ReviewBookingModal
        isOpen={showReviewModal}
        booking={selectedBooking}
        rating={rating}
        setRating={setRating}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        onClose={() => {
          setShowReviewModal(false);
          setReviewComment('');
          setRating(5);
        }}
        onConfirm={handleSubmitReview}
      />

      {/* C. MODAL GỬI KHIẾU NẠI (DISPUTE) */}
      <DisputeBookingModal
        isOpen={showDisputeModal}
        booking={selectedBooking}
        disputeCategory={disputeCategory}
        setDisputeCategory={setDisputeCategory}
        disputeDescription={disputeDescription}
        setDisputeDescription={setDisputeDescription}
        onClose={() => {
          setShowDisputeModal(false);
          setDisputeDescription('');
          setDisputeCategory('QUALITY');
        }}
        onConfirm={handleSendDispute}
      />

      {/* 6. CHÂN TRANG FOOTER */}
      <Footer />

    </div>
  );
};
