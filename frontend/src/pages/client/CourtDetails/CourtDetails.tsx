import React, { useState, useEffect } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/InputField';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Star, 
  Sparkles, 
  Coffee, 
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Phone,
  CheckCircle2,
  MessageSquare,
  Trophy,
  Sun,
  Sunset,
  Moon,
  Flame,
  Zap,
  QrCode,
  X,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface CourtDetailsProps {
  locationId?: string | null;
  initialCourtId?: string | null;
  onNavigate?: (page: any, data?: any) => void;
  userName?: string;
  onLogout?: () => void;
  onSetBookingSuccessData?: (data: any) => void;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  category: 'DRINK' | 'FOOD' | 'EQUIPMENT';
  image: string;
  qty: number;
}

const API = 'http://localhost:3000';

const getBankId = (name: string) => {
  if (!name) return 'VCB';
  const lower = name.toLowerCase();
  if (lower.includes('vietcom')) return 'VCB';
  if (lower.includes('techcom')) return 'TCB';
  if (lower.includes('vietin')) return 'CTG';
  if (lower.includes('bidv')) return 'BIDV';
  if (lower.includes('mb') || lower.includes('quan doi')) return 'MB';
  if (lower.includes('acb')) return 'ACB';
  if (lower.includes('sacom')) return 'STB';
  if (lower.includes('agri')) return 'VARB';
  if (lower.includes('tp')) return 'TPB';
  if (lower.includes('vp')) return 'VPB';
  if (lower.includes('hd')) return 'HDB';
  if (lower.includes('shb')) return 'SHB';
  if (lower.includes('scb')) return 'SCB';
  if (lower.includes('seabank')) return 'SEAB';
  if (lower.includes('vib')) return 'VIB';
  return name.replace(/\s+/g, '');
};

// Map giờ bắt đầu → period
const getPeriod = (h: number): 'morning' | 'afternoon' | 'evening' =>
  h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';

export const CourtDetails: React.FC<CourtDetailsProps> = ({
  locationId,
  initialCourtId,
  onNavigate,
  userName,
  onLogout,
  onSetBookingSuccessData
}) => {
  const userPhone = (() => {
    const saved = localStorage.getItem('user_info');
    if (!saved) return '';
    try {
      const parsed = JSON.parse(saved);
      return parsed.phone || '';
    } catch {
      return '';
    }
  })();

  // ── Ngày chơi ──
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<'booking' | 'details'>('booking');
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);

  // ── Dữ liệu từ API ──
  const [location, setLocation] = useState<any>(null);
  const [_isFetchingLocation, setIsFetchingLocation] = useState(true);

  const [courts, setCourts] = useState<any[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');

  const [slots, setSlots] = useState<any[]>([]);
  const [_isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductItem[]>([]);

  // ── Bộ lọc ca ──
  const [periodFilter, setPeriodFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [selectedDuration, setSelectedDuration] = useState<number>(1.5);

  // ── Vé check-in QR hiển thị ngay sau khi đặt thành công ──
  const [matchPass, setMatchPass] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotsRefreshKey, setSlotsRefreshKey] = useState(0);

  // ── Fetch thông tin cơ sở + danh sách sân ──
  useEffect(() => {
    if (!locationId) return;
    setIsFetchingLocation(true);
    fetch(`${API}/public/locations/${locationId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setLocation(data);
          const svc = data.services || [];
          setCourts(svc);
          if (svc.length > 0) {
            const hasInitial = svc.some((s: any) => s.id.toString() === initialCourtId?.toString());
            if (hasInitial && initialCourtId) {
              setSelectedCourtId(initialCourtId.toString());
            } else {
              setSelectedCourtId(svc[0].id.toString());
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsFetchingLocation(false));
  }, [locationId, initialCourtId]);

  // ── Fetch sản phẩm bán kèm ──
  useEffect(() => {
    if (!locationId) return;
    fetch(`${API}/public/products/location/${locationId}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        setProducts(data.map(p => ({ ...p, qty: 0, image: p.imageUrl || '🛍️' })));
      })
      .catch(console.error);
  }, [locationId]);

  // ── Fetch available slots khi đổi sân, ngày hoặc thời lượng chơi ──
  useEffect(() => {
    if (!selectedCourtId) return;
    setIsFetchingSlots(true);
    setSelectedSlotId(null);
    fetch(`${API}/public/services/${selectedCourtId}/available-slots?date=${selectedDate}&duration=${selectedDuration}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        const mapped = data.map(s => ({
          id: s.id,
          label: `Ca ${s.startTime} - ${s.endTime}`,
          timeRange: `${s.startTime} - ${s.endTime}`,
          startTime: s.startTime,
          endTime: s.endTime,
          startHour: parseInt(s.startTime.split(':')[0]),
          period: getPeriod(parseInt(s.startTime.split(':')[0])),
          priceModifier: s.priceModifier,
          isBooked: s.isBooked,
          finalPrice: s.finalPrice,
        }));
        setSlots(mapped);
      })
      .catch(console.error)
      .finally(() => setIsFetchingSlots(false));
  }, [selectedCourtId, selectedDate, selectedDuration, slotsRefreshKey]);

  const handleSelectCourt = (courtId: string) => {
    setSelectedCourtId(courtId);
    setSelectedSlotId(null);
  };

  // 5. MÃ KHUYẾN MÃI (PROMO CODE)
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountType: 'PERCENT' | 'FIXED'; discountPercent: number; fixedAmount: number | null; maxDiscount: number | null; minOrderValue: number } | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string>('');

  // 6. CỔNG THANH TOÁN
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CASH'>('BANK_TRANSFER');
  const [paymentOption, setPaymentOption] = useState<'FULL' | 'PARTIAL'>('FULL');

  const activeCourt = courts.find((c: any) => c.id === selectedCourtId) || courts[0];
  const BASE_PRICE = activeCourt?.basePricePerHour || 0;

  // Tính toán số tiền — dùng finalPrice từ API nếu có
  const getSelectedSlotPrice = () => {
    if (!selectedSlotId) return 0;
    const slot = slots.find(s => s.id === selectedSlotId);
    return slot?.finalPrice ?? (slot ? BASE_PRICE * slot.priceModifier : 0);
  };

  const getProductsPrice = () => {
    return products.reduce((acc, p) => acc + (p.qty * p.price), 0);
  };

  const subtotal = getSelectedSlotPrice() + getProductsPrice();
  
  // Tính discount — cùng công thức với backend (booking-rules.calculatePricing)
  const getDiscountAmount = () => {
    if (!appliedPromo || subtotal < appliedPromo.minOrderValue) return 0;
    let discount = appliedPromo.discountType === 'FIXED'
      ? (appliedPromo.fixedAmount ?? 0)
      : Math.round(subtotal * (appliedPromo.discountPercent / 100));
    if (appliedPromo.maxDiscount !== null) discount = Math.min(discount, appliedPromo.maxDiscount);
    return Math.min(discount, subtotal);
  };

  const vat = Math.round((subtotal - getDiscountAmount()) * 0.1);
  const finalPrice = Math.max(0, subtotal - getDiscountAmount() + vat);

  // Cộng trừ số lượng sản phẩm
  const updateProductQty = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p.qty + delta);
        return { ...p, qty: newQty };
      }
      return p;
    }));
  };

  // Áp mã giảm giá — kiểm tra với máy chủ (hạn dùng, lượt dùng, cơ sở áp dụng, đơn tối thiểu)
  const handleApplyPromo = async () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setAppliedPromo(null);
      return;
    }
    const token = localStorage.getItem('user_token');
    if (!userName || !token) {
      setPromoError('Vui lòng đăng nhập để sử dụng mã giảm giá.');
      return;
    }
    if (!selectedSlotId || !activeCourt) {
      setPromoError('Vui lòng chọn khung giờ trước khi áp mã.');
      return;
    }

    setIsCheckingPromo(true);
    try {
      const res = await fetch(`${API}/bookings/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sportsPitchId: activeCourt.id.toString(),
          bookingDate: selectedDate,
          slotId: selectedSlotId.toString(),
          products: products
            .filter(p => p.qty > 0)
            .map(p => ({ productId: p.id.toString(), quantity: p.qty })),
          promoCode: code,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.promotion) {
        setAppliedPromo(null);
        setPromoError(data.message || 'Mã giảm giá không hợp lệ.');
        return;
      }
      setAppliedPromo({
        code: data.promotion.code,
        discountType: data.promotion.discountType,
        discountPercent: data.promotion.discountPercent,
        fixedAmount: data.promotion.fixedDiscountAmount,
        maxDiscount: data.promotion.maxDiscountAmount,
        minOrderValue: data.promotion.minOrderValue,
      });
      toast.success(`Áp dụng thành công mã giảm giá ${data.promotion.code}`);
    } catch {
      setPromoError('Không thể kiểm tra mã giảm giá. Vui lòng thử lại.');
    } finally {
      setIsCheckingPromo(false);
    }
  };

  // Thanh toán xác nhận đặt sân
  const handleCheckout = async () => {
    if (!userName) {
      toast.warning('Vui lòng đăng nhập trước khi đặt lịch', {
        description: 'Bạn sẽ được chuyển sang màn hình đăng nhập để tiếp tục.',
      });
      onNavigate?.('auth', 'login');
      return;
    }
    if (!selectedSlotId) {
      toast.warning('Vui lòng chọn khung giờ trống cần thuê.');
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) {
      toast.error('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.');
      onNavigate?.('auth', 'login');
      return;
    }

    const chosenSlot = slots.find(s => s.id === selectedSlotId);
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      toast.loading('Đang khởi tạo đơn đặt sân...', { id: 'booking-loading' });

      const payload = {
        sportsPitchId: activeCourt?.id?.toString(),
        bookingDate: selectedDate,
        slotId: selectedSlotId?.toString(),
        paymentMethod: paymentMethod,
        paymentOption: paymentMethod === 'CASH' ? 'CASH' : paymentOption,
        products: products
          .filter(p => p.qty > 0)
          .map(p => ({ productId: p.id.toString(), quantity: p.qty })),
        promoCode: appliedPromo ? appliedPromo.code : undefined,
      };

      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        toast.dismiss('booking-loading');
        window.dispatchEvent(new CustomEvent('user-force-logout'));
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Có lỗi xảy ra khi đặt sân.');
      }

      const booking = await res.json();
      toast.dismiss('booking-loading');
      toast.success('Đặt sân thành công!');

      const successData = {
        bookingCode: booking.bookingCode,
        courtName: `${location?.name || 'Cơ sở'} - ${activeCourt?.name || ''}`,
        sport: activeCourt?.category || 'Thể thao',
        location: location ? `${location.address}, ${location.district}, ${location.city}` : '',
        bookingDate: selectedDate,
        startTime: chosenSlot?.timeRange.split(' ')[0] || '18:00',
        endTime: chosenSlot?.timeRange.split(' ')[2] || '20:00',
        paymentMethod: paymentMethod,
        finalPrice: Number(booking.finalPrice ?? finalPrice), // Số tiền thực tế do máy chủ tính
        products: products.filter(p => p.qty > 0).map(p => ({ name: p.name, qty: p.qty, price: p.price }))
      };

      if (onSetBookingSuccessData) {
        onSetBookingSuccessData(successData);
      }

      // Hiển thị vé QR check-in ngay tại chỗ; người dùng có thể mở trang chi tiết đơn sau
      setMatchPass(successData);
    } catch (err: any) {
      toast.dismiss('booking-loading');
      toast.error(err.message || 'Lỗi đặt sân.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectMessage = async () => {
    if (!userName) {
      toast.error('Vui lòng đăng nhập để gửi tin nhắn.');
      onNavigate?.('auth');
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) {
      toast.error('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.');
      onNavigate?.('auth');
      return;
    }

    if (!location || !location.partnerUserId) {
      toast.error('Không tìm thấy thông tin liên hệ của chủ sân.');
      return;
    }

    try {
      const res = await fetch(`${API}/chats/rooms/individual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: location.partnerUserId })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('sportzone_active_chat_room_id', data.id);
        onNavigate?.('chat');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Không thể liên hệ trực tiếp với chủ sân.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  // Nhóm ca đấu theo buổi cho Ma trận chọn giờ
  const PERIOD_GROUPS = [
    { key: 'morning' as const, title: 'Ca Sáng', range: '06:00 - 12:00', Icon: Sun, tone: 'text-sky-300' },
    { key: 'afternoon' as const, title: 'Ca Chiều', range: '12:00 - 18:00', Icon: Sunset, tone: 'text-orange-300' },
    { key: 'evening' as const, title: 'Ca Tối & Giờ Vàng', range: '18:00 - 23:00', Icon: Moon, tone: 'text-violet-300' },
  ];
  const visibleGroups = PERIOD_GROUPS.filter(g => periodFilter === 'all' || g.key === periodFilter);

  // "Khung Giờ Vàng" = ca có hệ số giá thấp hơn giá gốc (giảm giá thật từ API)
  const getSlotPrice = (s: any) => Number(s.finalPrice ?? BASE_PRICE * s.priceModifier) || 0;
  const getGoldenDiscount = (s: any) => {
    const pm = Number(s.priceModifier);
    return pm > 0 && pm < 1 ? Math.round((1 - pm) * 100) : 0;
  };
  const selectedSlot = slots.find(s => s.id === selectedSlotId);
  const availableCount = slots.filter(s => !s.isBooked).length;
  const goldenCount = slots.filter(s => !s.isBooked && getGoldenDiscount(s) > 0).length;

  // Tiện ích từ API location
  const amenities: any[] = location?.locationAmenities || [];

  // Đánh giá từ sân đang chọn
  const reviews: any[] = activeCourt?.reviews || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* Navbar */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* Main Container */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8 text-left ${selectedSlotId ? 'pb-36' : ''}`}>
        
        {/* Breadcrumb & Tiêu đề Sân */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {courts.length > 0 && (
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {activeCourt?.category || 'Chi tiết đặt sân'}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current" /> {location?._count?.services || courts.length} sân con
            </div>
            {location?.isActive && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 font-bold px-2 py-0.5 rounded flex items-center gap-1 select-none">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Đang mở cửa
              </span>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white m-0 tracking-tight leading-tight">
            {location?.name || 'Cơ Sở Thể Thao'}
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{location ? `${location.address}, ${location.ward}, ${location.district}, ${location.city}` : ''}</span>
            </div>
            {location?.contactPhone && (
              <>
                <span className="hidden sm:inline text-slate-700">|</span>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Hotline hỗ trợ: {location.contactPhone}</span>
                </div>
              </>
            )}
            <span className="hidden sm:inline text-slate-700">|</span>
            <button
              onClick={handleDirectMessage}
              className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-extrabold bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/40 px-3.5 py-1.5 rounded-xl transition cursor-pointer select-none text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              Nhắn tin trực tiếp
            </button>
          </div>
        </div>

        {/* Layout Hai cột */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột trái: Gallery + Tabs + Chi tiết ca hoặc giới thiệu */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery Image Panel */}
            <div className="space-y-3">
              {/* Ảnh chính từ API */}
              {(() => {
                const imgs = [
                  ...(location?.imageUrl ? [{ url: location.imageUrl, desc: `Ảnh đại diện cơ sở ${location?.name || ''}` }] : []),
                  ...(courts.flatMap((c: any) => {
                    let urls = [];
                    if (Array.isArray(c.imageUrls)) urls = c.imageUrls;
                    else if (typeof c.imageUrls === 'string') {
                      try { urls = JSON.parse(c.imageUrls); } catch(e) {}
                    }
                    return urls.map((u: string) => ({ url: u, desc: c.name }));
                  })),
                ];
                const gallery = imgs.length > 0 ? imgs : [
                  { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop', desc: 'Hình ảnh cơ sở' }
                ];
                const cur = gallery[Math.min(activeImgIndex, gallery.length - 1)];
                return (
                  <>
                    <div className="h-64 sm:h-[380px] bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden relative flex items-center justify-center group/main">
                      <img src={cur.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/main:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                        <p className="text-xs sm:text-sm text-slate-200 font-bold m-0 bg-slate-950/70 border border-slate-800 px-4 py-2 rounded-2xl backdrop-blur-md">
                          ℹ️ {cur.desc}
                        </p>
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-xl uppercase tracking-wider">
                          {location?.isActive ? '🟢 Mở cửa' : '🔴 Đóng cửa'}
                        </span>
                      </div>
                    </div>
                    {gallery.length > 1 && (
                      <div className="grid grid-cols-3 gap-3">
                        {gallery.slice(0, 3).map((img, idx) => (
                          <button key={idx} onClick={() => setActiveImgIndex(idx)}
                            className={`h-16 sm:h-20 rounded-2xl overflow-hidden border-2 transition cursor-pointer p-0 relative group ${
                              activeImgIndex === idx ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-transparent hover:border-slate-700'
                            }`}>
                            <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                            {activeImgIndex !== idx && (
                              <div className="absolute inset-0 bg-slate-950/45 group-hover:bg-slate-950/20 transition duration-200"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Tabs Điều Hướng Chi Tiết */}
            <div className="flex border-b border-white/10 gap-6">
              <button
                onClick={() => setActiveTab('booking')}
                className={`pb-4 text-sm font-black border-b-2 transition duration-200 cursor-pointer bg-transparent border-0 px-1 ${
                  activeTab === 'booking' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Đặt sân & Chọn ca
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-4 text-sm font-black border-b-2 transition duration-200 cursor-pointer bg-transparent border-0 px-1 ${
                  activeTab === 'details' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Tiện ích & Đánh giá ({reviews.length} đánh giá)
              </button>
            </div>              {/* Tab 1: ĐẶT SÂN */}
            {activeTab === 'booking' && (
              <div className="space-y-6">
                
                {/* 1. Chọn ngày chơi */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs sm:text-sm font-black text-white m-0 flex items-center gap-2.5 uppercase tracking-wider text-emerald-400">
                    <CalendarIcon className="w-4.5 h-4.5 stroke-[2.5]" />
                    1. CHỌN NGÀY CHƠI
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-slate-950 border border-emerald-500/30 hover:border-emerald-400 text-xs text-slate-100 font-bold px-4 py-3 rounded-xl outline-none transition-all w-full sm:w-64 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="text-[11px] text-slate-400 font-medium leading-relaxed flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      Lịch mở trước tối đa 14 ngày. Hãy chọn ngày thi đấu của bạn.
                    </span>
                  </div>
                </div>

                {/* 2. CHỌN SÂN TRONG CƠ SỞ */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs sm:text-sm font-black text-white m-0 flex items-center gap-2.5 uppercase tracking-wider text-emerald-400">
                    <Trophy className="w-4.5 h-4.5 stroke-[2.5]" />
                    2. CHỌN SÂN ĐẤU CHI TIẾT
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {courts.map(c => {
                      const isSelected = selectedCourtId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCourt(c.id)}
                          className={`p-4 rounded-2xl transition-all duration-300 border text-left cursor-pointer flex flex-col justify-between min-h-[110px] relative overflow-hidden active:scale-[0.98] ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                              : 'bg-slate-950/80 border-white/10 text-slate-400 hover:border-emerald-500/30 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="w-full flex justify-between items-start">
                            <div>
                              <span className="text-xs sm:text-sm font-black block leading-snug text-white">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium block mt-1">{c.subType || c.category}</span>
                            </div>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider shrink-0 ${
                              isSelected ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 border border-white/10'
                            }`}>
                              {c.category}
                            </span>
                          </div>

                          <div className="w-full flex justify-between items-center mt-3 pt-2.5 border-t border-white/10">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                              ⭐ {c._count?.reviews || 0} đánh giá
                            </span>
                            <span className={`text-xs font-black font-mono ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>
                              {(Number(c.basePricePerHour) || 0).toLocaleString()}đ/h
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. MA TRẬN CHỌN GIỜ (TIME-SLOT MATRIX) — nhóm theo Sáng / Chiều / Tối */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black m-0 flex items-center gap-2.5 uppercase tracking-wider text-emerald-400">
                        <Clock className="w-4.5 h-4.5 stroke-[2.5]" />
                        3. Ma trận chọn giờ
                      </h3>
                      <p className="text-[11px] text-slate-400 m-0 mt-1 font-medium">
                        <span className="text-emerald-300 font-bold font-mono">{availableCount}</span> ca trống
                        {goldenCount > 0 && (
                          <> · <span className="text-amber-300 font-bold font-mono">{goldenCount}</span> ca giờ vàng</>
                        )}
                        {' '}· ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    {/* Thời lượng — segmented control thay cho dropdown */}
                    <div className="flex flex-wrap items-center gap-2 select-none">
                      <div className="inline-flex p-1 bg-slate-950 border border-white/10 rounded-xl">
                        {[1, 1.5, 2].map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => { setSelectedDuration(d); setSelectedSlotId(null); }}
                            className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition cursor-pointer border-0 font-mono ${
                              selectedDuration === d
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'bg-transparent text-slate-400 hover:text-white'
                            }`}
                          >
                            {d.toFixed(1)}h
                          </button>
                        ))}
                      </div>
                      <div className="inline-flex p-1 bg-slate-950 border border-white/10 rounded-xl">
                        {([
                          { key: 'all', label: 'Tất cả' },
                          { key: 'morning', label: 'Sáng' },
                          { key: 'afternoon', label: 'Chiều' },
                          { key: 'evening', label: 'Tối' },
                        ] as const).map(p => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setPeriodFilter(p.key)}
                            className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer border-0 ${
                              periodFilter === p.key
                                ? 'bg-slate-800 text-white'
                                : 'bg-transparent text-slate-500 hover:text-slate-200'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chú thích trạng thái */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-slate-900 border border-emerald-500/50 inline-block" /> Giờ trống
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500/15 border border-amber-400/60 inline-block" /> Khung giờ vàng
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-slate-950 border border-white/5 inline-block opacity-60 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.08)_2px,rgba(255,255,255,0.08)_4px)]" /> Đã đặt
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> Đang chọn
                    </span>
                  </div>

                  {slots.length === 0 ? (
                    <div className="py-10 bg-slate-950/40 border border-white/10 rounded-2xl text-center text-xs text-slate-400">
                      Sân chưa mở ca nào cho ngày đã chọn. Vui lòng chọn ngày khác.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {visibleGroups.map(({ key, title, range, Icon, tone }) => {
                        const groupSlots = slots.filter(s => s.period === key);
                        const freeInGroup = groupSlots.filter(s => !s.isBooked).length;
                        return (
                          <div key={key} className="space-y-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${tone}`} />
                                <span className="text-xs font-black text-white uppercase tracking-wider">{title}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{range}</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">
                                <span className={freeInGroup > 0 ? 'text-emerald-400' : 'text-slate-600'}>{freeInGroup}</span>/{groupSlots.length} trống
                              </span>
                            </div>

                            {groupSlots.length === 0 ? (
                              <div className="py-4 text-center text-[11px] text-slate-600 bg-slate-950/40 border border-dashed border-white/5 rounded-xl">
                                Không có ca trong buổi này
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                {groupSlots.map(s => {
                                  const isBooked = s.isBooked;
                                  const isSelected = selectedSlotId === s.id;
                                  const golden = getGoldenDiscount(s);
                                  return (
                                    <button
                                      key={s.id}
                                      type="button"
                                      disabled={isBooked}
                                      onClick={() => setSelectedSlotId(isSelected ? null : s.id)}
                                      title={isBooked ? 'Ca này đã có người đặt' : `${s.timeRange} · ${getSlotPrice(s).toLocaleString()}đ`}
                                      className={`relative px-2 pt-2.5 pb-2 rounded-xl border text-left transition-all duration-200 ${
                                        isBooked
                                          ? 'bg-slate-950/60 border-white/5 text-slate-600 cursor-not-allowed bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.025)_6px,rgba(255,255,255,0.025)_12px)]'
                                          : isSelected
                                          ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/70 text-white cursor-pointer -translate-y-0.5 shadow-lg shadow-emerald-500/20'
                                          : golden > 0
                                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-100 hover:border-amber-400 hover:-translate-y-0.5 cursor-pointer'
                                          : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:-translate-y-0.5 cursor-pointer'
                                      }`}
                                    >
                                      {golden > 0 && !isBooked && (
                                        <span className="absolute -top-2 right-1.5 flex items-center gap-0.5 text-[8px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-md shadow">
                                          <Flame className="w-2.5 h-2.5" />-{golden}%
                                        </span>
                                      )}
                                      <span className={`block text-xs font-black font-mono leading-none ${isBooked ? 'line-through' : ''}`}>
                                        {s.startTime}
                                      </span>
                                      <span className="block text-[9px] font-mono mt-1 opacity-60 leading-none">→ {s.endTime}</span>
                                      <span className={`block text-[10px] font-black font-mono mt-1.5 leading-none ${
                                        isBooked ? 'text-slate-600' : isSelected ? 'text-emerald-300' : golden > 0 ? 'text-amber-300' : 'text-emerald-400'
                                      }`}>
                                        {isBooked ? 'Đã đặt' : `${Math.round(getSlotPrice(s) / 1000)}k`}
                                      </span>
                                      {isSelected && (
                                        <CheckCircle2 className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-emerald-300" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Dịch vụ nước uống và dụng cụ đi kèm */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs sm:text-sm font-black text-white m-0 flex items-center gap-2.5 uppercase tracking-wider text-emerald-400">
                    <Coffee className="w-4.5 h-4.5 stroke-[2.5]" />
                    4. DỊCH VỤ ĂN UỐNG & THUÊ ĐỒ DÙNG KÈM
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {products.map(p => {
                      const hasQty = p.qty > 0;
                      return (
                        <div 
                          key={p.id}
                          className={`border rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all duration-300 ${
                            hasQty
                              ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-400/30'
                              : 'bg-slate-950/80 border-white/10 text-slate-300 hover:border-emerald-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl select-none shrink-0 border transition ${
                              hasQty ? 'bg-slate-950 border-emerald-400/50' : 'bg-slate-900 border-white/10'
                            }`}>
                              {p.image}
                            </div>
                            <div className="text-left leading-tight">
                              <span className="text-xs font-black text-white block">{p.name}</span>
                              <span className={`text-[11px] font-mono font-bold mt-1 block ${hasQty ? 'text-emerald-300' : 'text-emerald-400'}`}>
                                {p.price.toLocaleString()}đ
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              onClick={() => updateProductQty(p.id, -1)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm cursor-pointer transition border-0 ${
                                hasQty 
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300' 
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-black font-mono text-white">
                              {p.qty}
                            </span>
                            <button 
                              onClick={() => updateProductQty(p.id, 1)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm cursor-pointer transition border-0 ${
                                hasQty 
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300' 
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: GIỚI THIỆU & ĐÁNH GIÁ */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                
                {/* Tiện ích cơ sở */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-4 text-left">
                  <h3 className="text-sm font-black text-white m-0 tracking-wider uppercase text-amber-500 flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5" />
                    Tiện ích cơ sở vật chất sân bãi
                  </h3>
                  {amenities.length === 0 ? (
                    <p className="text-xs text-slate-500">Chưa có tiện ích nào được thiết lập.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {amenities.map((item, idx) => (
                        <div key={idx} className="flex gap-3 bg-slate-950 p-4 border border-slate-855/80 rounded-2xl items-center">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 text-lg shrink-0 select-none">
                            {item.icon || '📌'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Giới thiệu chi tiết */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-3.5 text-slate-300 text-xs leading-relaxed">
                  <h3 className="text-sm font-black text-white m-0 tracking-wider uppercase text-amber-500">Mô Tả & Quy Định Chung</h3>
                  <p className="m-0">
                    {location?.description || 'Cơ sở hiện chưa cập nhật mô tả chi tiết. Vui lòng liên hệ hotline để biết thêm thông tin.'}
                  </p>
                  <div className="bg-slate-955 p-4 border border-slate-850 rounded-xl space-y-2 mt-4">
                    <span className="text-[10px] font-extrabold uppercase text-amber-500 block">🛑 Quy định của cụm sân</span>
                    <ul className="list-disc pl-4 space-y-1.5 m-0 text-slate-400 text-[10px]">
                      <li>Vui lòng mang giày thể thao thảm đấu đế kếp hoặc thảm gum không có vệt bám.</li>
                      <li>Vui lòng có mặt đúng khung giờ đặt lịch hoặc sớm trước 5-10 phút để chuẩn bị.</li>
                      <li>Yêu cầu dời lịch/ca đấu cần phản hồi trước giờ chơi ít nhất 6 tiếng.</li>
                    </ul>
                  </div>
                </div>

                {/* Bản đồ vị trí */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-4 text-left">
                  <h3 className="text-sm font-black text-white m-0 tracking-wider uppercase text-amber-500 flex items-center gap-2">
                    📍 Bản Đồ Vị Trí & Chỉ Đường
                  </h3>
                  <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-850 bg-slate-950">
                    <iframe
                      src={location?.latitude && location?.longitude
                        ? `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=16&output=embed`
                        : `https://maps.google.com/maps?q=${encodeURIComponent(location ? `${location.address}, ${location.city}` : '')}&z=16&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Bản đồ vị trí ${location?.name || ''}`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 m-0 leading-relaxed">
                    📌 <strong>Địa chỉ cụ thể:</strong> {location ? `${location.address}, ${location.ward || ''}, ${location.district}, ${location.city}` : ''}
                  </p>
                </div>

                {/* Đánh giá thực tế */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-6">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-black text-white m-0 tracking-wider uppercase text-amber-500 flex items-center gap-2">
                      <MessageSquare className="w-4.5 h-4.5" />
                      Đánh Giá Thực Tế Từ Người Chơi
                    </h3>
                    <span className="text-xs text-amber-400 font-bold">
                      {reviews.length > 0
                        ? `${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}/5 (${reviews.length} lượt đánh giá)`
                        : 'Chưa có đánh giá'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        Chưa có đánh giá nào cho sân đấu này.
                      </div>
                    ) : (
                      reviews.map((r) => (
                        <div key={r.id} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0 text-left">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-3">
                              <img 
                                src={r.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'} 
                                alt={r.user?.fullName || 'Người dùng'} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-800" 
                              />
                              <div>
                                <span className="text-xs font-bold text-white block leading-none">{r.user?.fullName || 'Khách hàng'}</span>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <div className="flex text-amber-400">
                                    {Array.from({ length: r.rating }).map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                  </div>
                                  <span className="text-[9px] text-slate-500 font-medium">
                                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 mt-3 m-0 leading-relaxed pl-12">
                            "{r.comment || 'Không có bình luận.'}"
                          </p>

                          {r.partnerReply && (
                            <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 mt-3 ml-12 text-left">
                              <span className="text-[9px] text-amber-500 font-extrabold uppercase block mb-1">Chủ sân phản hồi:</span>
                              <p className="text-xs text-slate-400 m-0">"{r.partnerReply}"</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Cột phải: Hóa đơn & Checkout */}
          <div className="space-y-6">
            
            {/* Tóm tắt biên lai thanh toán */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5 sticky top-24 shadow-2xl shadow-slate-950/60">
              
              <div className="border-b border-white/10 pb-4 text-left">
                <h3 className="text-xs sm:text-sm font-black text-white m-0 tracking-wider uppercase text-emerald-400">BIÊN LAI THANH TOÁN</h3>
                <p className="text-[11px] text-slate-400 m-0 mt-0.5 font-medium">Kiểm tra chi tiết ca đấu và khấu trừ</p>
              </div>

              {/* Chi tiết ca đã chọn */}
              {selectedSlotId ? (
                <div className="space-y-4 text-xs">
                  
                  {/* Sân bãi */}
                  <div className="space-y-2 text-left">
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block">1. Sân thi đấu đã chọn</span>
                    <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <strong className="text-xs text-white block font-black">{activeCourt.name}</strong>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">{selectedDate} | {slots.find(s => s.id === selectedSlotId)?.label}</span>
                      </div>
                      <span className="font-mono font-black text-emerald-400 text-xs shrink-0">{getSelectedSlotPrice().toLocaleString()}đ</span>
                    </div>
                  </div>

                  {/* Nước uống phụ trợ */}
                  {getProductsPrice() > 0 && (
                    <div className="space-y-2 text-left">
                      <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block">2. Dịch vụ phụ trợ mua thêm</span>
                      <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 space-y-2">
                        {products.filter(p => p.qty > 0).map(p => (
                          <div key={p.id} className="flex justify-between items-center text-[11px] text-slate-300 font-semibold">
                            <span>{p.name} <span className="text-emerald-400 font-black">x{p.qty}</span></span>
                            <span className="font-mono text-white font-bold">{(p.qty * p.price).toLocaleString()}đ</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nhập mã voucher */}
                  <div className="space-y-2 text-left">
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block">3. Mã giảm giá (Promo)</span>
                    <div className="flex gap-2">
                      <InputField
                        type="text"
                        placeholder="Nhập mã voucher..."
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-slate-950 border border-white/10 py-2.5 px-3.5 rounded-xl text-xs flex-grow outline-none text-white focus:border-emerald-400"
                      />
                      <button 
                        onClick={handleApplyPromo}
                        disabled={isCheckingPromo}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-black text-slate-200 hover:text-white rounded-xl transition cursor-pointer"
                      >
                        {isCheckingPromo ? 'Đang kiểm tra...' : 'Áp dụng'}
                      </button>
                    </div>
                    {appliedPromo && (
                      <p className="text-[11px] text-emerald-300 font-extrabold m-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" /> Đã giảm {appliedPromo.discountType === 'FIXED' ? `${(appliedPromo.fixedAmount ?? 0).toLocaleString()}đ` : `${appliedPromo.discountPercent}%`}{appliedPromo.maxDiscount !== null && ` (Tối đa -${appliedPromo.maxDiscount.toLocaleString()}đ)`}
                      </p>
                    )}
                    {promoError && (
                      <p className="text-[11px] text-red-400 font-bold m-0">⚠ {promoError}</p>
                    )}
                  </div>

                  {/* Receipt Breakdown (Dotted Separator Style) */}
                  <div className="border-t border-dashed border-white/10 pt-4 space-y-2 text-xs text-left">
                    <div className="flex justify-between items-center text-slate-400 font-medium">
                      <span>Cộng tiền sân & dịch vụ:</span>
                      <span className="font-mono text-white font-semibold">{subtotal.toLocaleString()}đ</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between items-center text-rose-400 font-bold">
                        <span>Giảm giá voucher:</span>
                        <span className="font-mono">-{getDiscountAmount().toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-400 font-medium">
                      <span>Thuế VAT (10%):</span>
                      <span className="font-mono text-white font-semibold">{vat.toLocaleString()}đ</span>
                    </div>
                    
                    <div className="border-t border-dashed border-white/10 pt-3 space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white text-xs uppercase tracking-wider">Tổng tiền hóa đơn:</span>
                        <span className="text-lg font-black text-slate-200 font-mono">
                          {finalPrice.toLocaleString()}đ
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="font-black text-emerald-400 text-xs uppercase tracking-wider">Thanh toán ngay:</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">
                          {paymentMethod === 'CASH' 
                            ? '0' 
                            : paymentOption === 'PARTIAL' 
                              ? Math.round(finalPrice * 0.3).toLocaleString() 
                              : finalPrice.toLocaleString()
                          }đ
                        </span>
                      </div>

                      {paymentMethod === 'CASH' && (
                        <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 font-medium">
                          <span>Số tiền trả tại sân:</span>
                          <span className="font-mono text-white font-bold">{finalPrice.toLocaleString()}đ</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phương thức thanh toán */}
                  <div className="space-y-2 border-t border-white/10 pt-4 text-left">
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block">4. Phương thức thanh toán</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(['BANK_TRANSFER', 'CASH'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2.5 text-[10px] font-black rounded-xl border transition cursor-pointer text-center ${
                            paymentMethod === method
                              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10'
                              : 'bg-slate-950 border-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lựa chọn thanh toán (nếu chọn chuyển khoản) */}
                  {paymentMethod !== 'CASH' && (
                    <div className="space-y-2 border-t border-white/10 pt-4 text-left">
                      <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block">5. Lựa chọn thanh toán</span>
                      <div className="grid grid-cols-2 gap-2">
                        {(['FULL', 'PARTIAL'] as const).map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setPaymentOption(option)}
                            className={`py-2 text-[10px] font-black rounded-xl border transition cursor-pointer text-center ${
                              paymentOption === option
                                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10'
                                : 'bg-slate-955 border-white/10 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {option === 'FULL' ? 'Thanh toán 100%' : 'Đặt cọc 30%'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hướng dẫn chuyển khoản VietQR */}
                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="space-y-3 border-t border-white/10 pt-4 text-left">
                      <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider block">6. Quét mã VietQR chuyển khoản</span>
                      {location?.partner?.bankAccountNumber ? (
                        <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-4">
                          <div className="text-xs space-y-2 text-slate-300 font-sans">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Ngân hàng:</span>
                              <span className="font-black text-white">{location.partner.bankName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Số tài khoản:</span>
                              <span className="font-black text-white font-mono">{location.partner.bankAccountNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Chủ tài khoản:</span>
                              <span className="font-black text-white uppercase">{location.partner.bankAccountName}</span>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center space-y-2 max-w-[180px] mx-auto shadow-lg">
                            <img
                              src={`https://img.vietqr.io/image/${getBankId(location.partner.bankName)}-${location.partner.bankAccountNumber}-compact2.png?amount=${paymentOption === 'PARTIAL' ? Math.round(finalPrice * 0.3) : finalPrice}&addInfo=${encodeURIComponent(`DAT SAN ${userPhone || 'QUET QR'}`)}&accountName=${encodeURIComponent(location.partner.bankAccountName)}`}
                              alt="VietQR code"
                              className="w-36 h-36 object-contain"
                            />
                            <span className="text-[9px] text-slate-950 font-black tracking-wider uppercase">Chuyển khoản an toàn</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-xl text-[11px] text-rose-400 font-semibold leading-relaxed">
                          ⚠️ Đối tác này chưa cập nhật tài khoản ngân hàng. Vui lòng chọn Tiền mặt.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Button checkout */}
                  <div className="pt-2">
                    <Button 
                      onClick={handleCheckout}
                      variant="primary" 
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-xs font-black text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/25 transition duration-200 cursor-pointer flex items-center justify-center gap-2 border-0 uppercase tracking-wide"
                    >
                      <CreditCard className="w-4.5 h-4.5 shrink-0 stroke-[2.5]" />
                      XÁC NHẬN & ĐẶT SÂN NGAY
                    </Button>
                  </div>

                  {/* Bảo vệ thanh toán */}
                  <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 flex gap-2 items-start text-left">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                    <p className="text-[10px] text-slate-400 m-0 leading-relaxed font-medium">
                      SportZone bảo vệ giao dịch của bạn. Tiền thanh toán sẽ được hệ thống giữ an toàn và chỉ kết chuyển cho chủ sân sau khi trận đấu kết thúc.
                    </p>
                  </div>

                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-400 space-y-3 text-left flex flex-col items-center">
                  <AlertCircle className="w-9 h-9 text-emerald-400/60" />
                  <p className="m-0 max-w-[200px] text-center font-medium leading-relaxed">Vui lòng chọn ca đấu trống bên cột trái để tiến hành thanh toán hóa đơn.</p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* FLOATING CHECKOUT BAR — cập nhật tổng tiền tức thì khi chọn ca / dịch vụ */}
      {selectedSlot && activeTab === 'booking' && !matchPass && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-2xl border-t border-zinc-700/80 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] animate-[slideUp_0.3s_ease-out]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">
                {activeCourt?.name} · {new Date(selectedDate).toLocaleDateString('vi-VN')}
              </span>
              <span className="block text-sm font-black text-white font-mono truncate">
                {selectedSlot.timeRange}
                {getProductsPrice() > 0 && (
                  <span className="text-[11px] text-zinc-400 font-sans font-semibold"> + {products.filter(p => p.qty > 0).reduce((a, p) => a + p.qty, 0)} dịch vụ</span>
                )}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                {paymentMethod === 'CASH' ? 'Trả tại sân' : paymentOption === 'PARTIAL' ? 'Cọc 30%' : 'Tổng (gồm VAT)'}
              </span>
              <span key={finalPrice} className="block text-lg sm:text-xl font-black text-emerald-400 font-mono animate-[pricePop_0.35s_ease-out]">
                {(paymentOption === 'PARTIAL' && paymentMethod !== 'CASH' ? Math.round(finalPrice * 0.3) : finalPrice).toLocaleString()}đ
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="shrink-0 flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-xs font-black uppercase tracking-wide border-0 cursor-pointer active:scale-[0.97] transition shadow-lg shadow-emerald-500/25"
            >
              <Zap className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">{isSubmitting ? 'Đang xử lý...' : 'Đặt nhanh'}</span>
              <ArrowRight className="w-4 h-4 sm:hidden" />
            </button>
          </div>
        </div>
      )}

      {/* INSTANT QR CHECK-IN MATCH PASS */}
      {matchPass && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700/80 rounded-3xl overflow-hidden shadow-2xl animate-[passIn_0.45s_cubic-bezier(0.22,1,0.36,1)]">
            <button
              type="button"
              onClick={() => { setMatchPass(null); setSelectedSlotId(null); setSlotsRefreshKey(k => k + 1); }}
              aria-label="Đóng"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center border-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-900 text-left">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Đặt sân thành công
              </span>
              <h3 className="text-lg font-black text-white m-0 mt-3 leading-tight">{matchPass.courtName}</h3>
              <p className="text-[11px] text-zinc-400 m-0 mt-1 flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 shrink-0" />{matchPass.location}</p>
            </div>

            {/* Đường xé vé */}
            <div className="relative h-0 border-t border-dashed border-zinc-700">
              <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-black/80" />
              <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-black/80" />
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="relative mx-auto w-48 h-48 bg-white rounded-2xl p-3 overflow-hidden">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(`SPORTZONE-CHECKIN:${matchPass.bookingCode}`)}`}
                  alt={`QR check-in ${matchPass.bookingCode}`}
                  className="w-full h-full object-contain animate-[fadeIn_0.6s_ease-out]"
                />
                <span className="pointer-events-none absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_3px_rgba(52,211,153,0.7)] animate-[qrScan_2s_ease-in-out_infinite]" />
              </div>

              <div className="text-center">
                <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mã check-in</span>
                <span className="block text-xl font-black font-mono text-white tracking-[0.2em]">{matchPass.bookingCode}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl py-2">
                  <span className="block text-[9px] text-zinc-500 font-bold uppercase">Ngày</span>
                  <span className="block text-[11px] text-white font-black font-mono">{new Date(matchPass.bookingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl py-2">
                  <span className="block text-[9px] text-zinc-500 font-bold uppercase">Giờ</span>
                  <span className="block text-[11px] text-white font-black font-mono">{matchPass.startTime}-{matchPass.endTime}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl py-2">
                  <span className="block text-[9px] text-zinc-500 font-bold uppercase">Tổng</span>
                  <span className="block text-[11px] text-emerald-400 font-black font-mono">{Math.round(matchPass.finalPrice / 1000)}k</span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 text-center m-0 flex items-center justify-center gap-1">
                <QrCode className="w-3 h-3" /> Đưa mã này cho quầy lễ tân khi đến sân
              </p>

              <button
                type="button"
                onClick={() => onNavigate?.('booking-success')}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wide border-0 cursor-pointer flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                Xem chi tiết đơn <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
};
