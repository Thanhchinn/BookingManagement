import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
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
import { toast } from 'sonner';

const getSportTypeName = (cat: string) => {
  if (!cat) return 'N/A';
  const val = cat.toLowerCase().trim();
  if (val === 'badminton' || val === 'cầu lông' || val === 'cau-long') return 'Cầu Lông';
  if (val === 'football' || val === 'soccer' || val === 'bóng đá' || val === 'bong-da') return 'Bóng Đá';
  if (val === 'tennis' || val === 'quần vợt') return 'Tennis';
  if (val === 'basketball' || val === 'bóng rổ') return 'Bóng Rổ';
  if (val === 'volleyball' || val === 'bóng chuyền') return 'Bóng Chuyền';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

const getSportEmoji = (sport: string) => {
  if (!sport) return '🏆';
  const val = sport.toLowerCase();
  if (val.includes('bóng đá') || val.includes('football') || val.includes('soccer')) return '⚽';
  if (val.includes('cầu lông') || val.includes('badminton')) return '🏸';
  if (val.includes('tennis')) return '🎾';
  if (val.includes('bóng rổ') || val.includes('basketball')) return '🏀';
  if (val.includes('bóng chuyền') || val.includes('volleyball')) return '🏐';
  return '🏆';
};

const getBookingCountdown = (bookingDate: string, _startTime: string, status: string) => {
  if (status !== 'CONFIRMED' && status !== 'PENDING') return null;
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    if (bookingDate === todayStr) {
      return { text: 'Hôm nay ⏰', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (bookingDate === tomorrowStr) {
      return { text: 'Ngày mai 📅', className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    }
    
    const tDate = new Date(todayStr);
    const bDate = new Date(bookingDate);
    const diffTime = bDate.getTime() - tDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { text: `Còn ${diffDays} ngày ⏳`, className: 'bg-slate-950 text-slate-400 border border-slate-800' };
    }
    return null;
  } catch (e) {
    return null;
  }
};

interface MyBookingsProps {
  onNavigate?: (page: any, authMode?: any) => void;
  userName?: string;
  onLogout?: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onNavigate, userName, onLogout }) => {
  // Danh sách đơn đặt sân tải từ backend
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'APPLIED'>('ALL');
  const [matchBookings, setMatchBookings] = useState<BookingItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Tải danh sách đơn đặt sân của user từ backend
  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const res = await apiClient.get('/bookings/my-bookings');
        const data = res.data;
        
        const mappedBookings: BookingItem[] = data.map((b: any) => {
          let paymentStatusLabel = 'CHƯA THANH TOÁN';
          if (b.paymentStatus === 'PAID') {
            paymentStatusLabel = 'ĐÃ THANH TOÁN';
          } else if (b.paymentStatus === 'PARTIALLY_PAID') {
            paymentStatusLabel = 'ĐÃ ĐẶT CỌC 30%';
          } else if (b.paymentStatus === 'REFUNDED') {
            paymentStatusLabel = 'ĐÃ HOÀN TIỀN';
          }

          const courtName = b.sportsPitch 
            ? `${b.sportsPitch.location?.name || 'Cơ sở'} - ${b.sportsPitch.name}`
            : 'Sân đấu';

          return {
            id: b.id,
            bookingCode: b.bookingCode,
            courtName,
            sport: getSportTypeName(b.sportsPitch?.category),
            location: b.sportsPitch?.location 
              ? `${b.sportsPitch.location.address}, ${b.sportsPitch.location.district}, ${b.sportsPitch.location.city}`
              : '',
            bookingDate: b.bookingDate,
            startTime: b.startTime,
            endTime: b.endTime,
            price: b.finalPrice,
            status: b.status,
            paymentStatus: paymentStatusLabel,
            products: b.bookingDetails?.map((d: any) => ({
              name: d.product?.name || 'Sản phẩm',
              qty: d.quantity,
              price: d.price
            })) || [],
            payments: b.payments || [],
          };
        });

        setBookings(mappedBookings);
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu đặt sân:', err);
      }
    };

    fetchMyBookings();
  }, [userName, refreshTrigger]);

  // Tải danh sách ghép kèo mà user tham gia từ backend
  useEffect(() => {
    const fetchJoinedMatches = async () => {
      try {
        const res = await apiClient.get('/matchmaking/posts/joined');
        const data = res.data;
        
        const infoStr = localStorage.getItem('user_info');
        let currentUserId = '';
        if (infoStr) {
          try {
            currentUserId = String(JSON.parse(infoStr).id);
          } catch (_) {}
        }

        // Map MatchPost sang BookingItem format
        const mappedMatches: BookingItem[] = data.map((m: any) => {
          const isHost = currentUserId ? String(m.userId) === currentUserId : false;
          return {
            id: `match-${m.id}`,
            bookingCode: `MATCH-${String(m.id).padStart(4, '0')}`,
            courtName: m.courtName || 'Sân thi đấu giao lưu',
            sport: m.sport,
            location: m.courtAddress || 'Địa chỉ sân đấu',
            bookingDate: m.playDate,
            startTime: m.startTime,
            endTime: m.endTime,
            price: 0,
            status: m.status === 'FULL' || m.status === 'OPEN' ? 'CONFIRMED' : (m.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING'),
            paymentStatus: 'FULLY_PAID',
            products: [],
            isMatch: true,
            matchHost: m.hostName,
            matchMaxPlayers: m.maxPlayers,
            matchCurrentPlayers: m.currentPlayers,
            description: m.description,
            isHostMatch: isHost,
            matchParticipants: m.participants,
          };
        });
        
        setMatchBookings(mappedMatches);
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu ghép kèo:', err);
      }
    };

    fetchJoinedMatches();
  }, [userName, refreshTrigger]);

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
  const allBookings = [...bookings, ...matchBookings];
  const filteredBookings = allBookings.filter(b => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'APPLIED') return b.isMatch === true;
    return b.status === activeFilter;
  });

  // Hủy đặt sân
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      toast.loading('Đang xử lý hủy lịch...', { id: 'cancel-loading' });

      await apiClient.patch(`/bookings/${selectedBooking.id}/status`, {
        status: 'CANCELLED',
      });

      toast.dismiss('cancel-loading');
      toast.success('Đã hủy đơn đặt lịch thành công', {
        description: 'Tiền cọc hoặc thanh toán trước sẽ được hoàn trả theo quy định.',
      });

      setRefreshTrigger(prev => prev + 1);
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
    } catch (err: any) {
      toast.dismiss('cancel-loading');
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi hủy lịch.');
    }
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
    toast.success('Cảm ơn bạn đã gửi đánh giá', {
      description: 'Ý kiến của bạn sẽ giúp chủ sân cải thiện dịch vụ tốt hơn.',
    });
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
    toast.info('Khiếu nại đã được gửi', {
      description: 'Ban quản trị sẽ kiểm tra và phản hồi trong vòng 24 giờ.',
    });
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
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-400">
      
      {/* 1. HEADER NAVBAR */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* BACKGROUND DECORATIVE GLOW EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] opacity-70"></div>
        <div className="absolute bottom-1/3 right-10 w-[400px] h-[300px] bg-teal-500/10 rounded-full blur-[120px] opacity-60"></div>
      </div>

      {/* 2. MAIN HUB CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow w-full space-y-8 relative z-10">
        
        {/* Tiêu đề & Thống kê điểm loyalty */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl shadow-slate-950/60">
          <div className="text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Khách hàng thân thiết
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white m-0 tracking-tight">
              Lịch Hẹn Của Tôi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl m-0 leading-relaxed">
              Quản lý tất cả danh sách đặt sân thể thao, mã vé check-in, lịch ghép kèo giao lưu và gửi phản hồi đánh giá dịch vụ.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-950/80 border border-emerald-500/30 px-6 py-4 rounded-2xl shadow-lg w-full sm:w-auto shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-left leading-none space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Điểm tích lũy SportZone</span>
              <span className="text-2xl font-black text-emerald-400 font-mono block">450 <span className="text-xs text-slate-400 font-bold">pts</span></span>
            </div>
          </div>
        </div>

        {/* 3. TABS BỘ LỌC ĐƠN HÀNG - RESPONSIVE SCROLLABLE ON MOBILE */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar select-none border-b border-white/10">
          {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'APPLIED'] as const).map(filter => {
            const label = filter === 'ALL' ? 'Tất cả đơn' : 
                          filter === 'CONFIRMED' ? 'Chờ chơi' : 
                          filter === 'PENDING' ? 'Chờ thanh toán' : 
                          filter === 'COMPLETED' ? 'Đã hoàn thành' : 
                          filter === 'CANCELLED' ? 'Đã hủy' : 'Đã ứng tuyển';
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2.5 text-xs font-black rounded-2xl transition-all duration-300 cursor-pointer whitespace-nowrap border shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105' 
                    : 'bg-slate-900/60 backdrop-blur-md border-white/10 text-slate-400 hover:text-white hover:border-emerald-500/30 hover:bg-slate-900'
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
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-emerald-500/30 text-emerald-400 shadow-md">
                📅
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-black text-white m-0">Không tìm thấy lịch đặt nào</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">Bạn chưa đăng ký lịch đặt sân bãi nào trong mục này hoặc chưa chọn giữ ca.</p>
              </div>
              <Button 
                onClick={() => onNavigate?.('home')} 
                variant="primary" 
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
              >
                Đặt sân thi đấu ngay
              </Button>
            </div>
          ) : (
            filteredBookings.map(b => {
              const countdown = getBookingCountdown(b.bookingDate, b.startTime, b.status);
              const isSelected = selectedBooking?.id === b.id;
              return (
                <div 
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`bg-slate-900/60 backdrop-blur-xl rounded-3xl transition-all duration-300 p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 cursor-pointer border shadow-xl relative overflow-hidden group hover:translate-y-[-2px] ${
                    isSelected 
                      ? 'border-emerald-400 bg-slate-900/90 shadow-2xl ring-2 ring-emerald-400/30' 
                      : 'border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="space-y-3 flex-grow text-left w-full min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-left">
                      <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">{b.bookingCode}</span>
                      {getStatusBadge(b.status)}
                      {countdown && (
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg ${countdown.className}`}>
                          {countdown.text}
                        </span>
                      )}
                      {b.isMatch && (
                        <>
                          <span className="text-[9px] bg-purple-500/20 border border-purple-500/30 text-purple-300 font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                            Ghép Kèo ({b.matchCurrentPlayers}/{b.matchMaxPlayers})
                          </span>
                          {b.isHostMatch ? (
                            <span className="text-[9px] bg-blue-500/20 border border-blue-500/30 text-blue-300 font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                              Chủ phòng (Tổ chức)
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                              Đã ứng tuyển
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <h4 className="text-base sm:text-xl font-black text-white m-0 group-hover:text-emerald-400 transition-colors text-left flex items-center gap-2 truncate">
                      <span className="shrink-0 text-xl">{getSportEmoji(b.sport)}</span>
                      <span className="truncate">{b.courtName}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-300 text-left font-medium">
                      <div className="flex items-center gap-2 text-left">
                        <Calendar className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                        <span className="font-bold">{b.bookingDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-left">
                        <Clock className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                        <span className="font-bold">{b.startTime} - {b.endTime} ({b.sport})</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2 text-left min-w-0 text-slate-400">
                        <MapPin className="w-4 h-4 text-slate-500 shrink-0 stroke-[2]" />
                        <span className="truncate">{b.location}</span>
                      </div>
                    </div>

                    {/* Dịch vụ phụ trợ đính kèm dưới dạng chip */}
                    {b.products && b.products.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mr-1">Dịch vụ kèm:</span>
                        {b.products.map((p, idx) => (
                          <span key={idx} className="inline-flex items-center text-[10px] bg-slate-950 text-slate-300 border border-white/10 px-2.5 py-1 rounded-xl font-semibold">
                            {p.name.includes('Nước') || p.name.toLowerCase().includes('coca') || p.name.toLowerCase().includes('pepsi') || p.name.toLowerCase().includes('aquafina') ? '🥤' : '🎒'} {p.name} <span className="text-emerald-400 font-black ml-1.5">x{p.qty}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-full sm:w-auto flex sm:flex-col items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0 shrink-0">
                    <div className="text-left sm:text-right space-y-0.5">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider m-0">
                        {b.isMatch ? 'Chi phí tham gia' : 'Tổng tiền'}
                      </p>
                      <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono m-0">
                        {b.isMatch ? 'Chia đều' : `${b.price.toLocaleString('vi-VN')}đ`}
                      </p>
                    </div>

                    <button className="flex items-center gap-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer">
                      Xem vé <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })
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
          toast.loading('Đang kết nối cổng thanh toán an toàn...');
          if (selectedBooking) {
            setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'CONFIRMED', paymentStatus: 'FULLY_PAID' } : b));
            setSelectedBooking(null);
          }
        }}
        onCancelRequest={() => setShowCancelModal(true)}
        onWriteReview={() => setShowReviewModal(true)}
        onOpenDispute={() => setShowDisputeModal(true)}
        onRefreshMatches={() => setRefreshTrigger(prev => prev + 1)}
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
