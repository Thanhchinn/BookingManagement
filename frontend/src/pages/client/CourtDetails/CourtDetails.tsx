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
  SlidersHorizontal
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
  const [hourFilter, setHourFilter] = useState<'all' | 'even' | 'odd'>('all');
  const [selectedDuration, setSelectedDuration] = useState<number>(1.5);
  const [timeSearch, setTimeSearch] = useState<string>('');

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
  }, [selectedCourtId, selectedDate, selectedDuration]);

  const handleSelectCourt = (courtId: string) => {
    setSelectedCourtId(courtId);
    setSelectedSlotId(null);
  };

  // 5. MÃ KHUYẾN MÃI (PROMO CODE)
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number; maxDiscount: number } | null>(null);
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
  
  // Tính discount
  const getDiscountAmount = () => {
    if (!appliedPromo) return 0;
    const discount = subtotal * (appliedPromo.discountPercent / 100);
    return Math.min(discount, appliedPromo.maxDiscount);
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

  // Áp mã giảm giá
  const handleApplyPromo = () => {
    setPromoError('');
    const codeUpper = promoCode.trim().toUpperCase();
    if (codeUpper === 'DONGGIA50K' || codeUpper === 'SPORT20') {
      setAppliedPromo({
        code: codeUpper,
        discountPercent: codeUpper === 'DONGGIA50K' ? 25 : 20,
        maxDiscount: codeUpper === 'DONGGIA50K' ? 50000 : 80000
      });
      toast.success(`Áp dụng thành công mã giảm giá ${codeUpper}`);
    } else {
      setPromoError('Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng.');
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
        finalPrice: finalPrice,
        products: products.filter(p => p.qty > 0).map(p => ({ name: p.name, qty: p.qty, price: p.price }))
      };

      if (onSetBookingSuccessData) {
        onSetBookingSuccessData(successData);
      }

      onNavigate?.('booking-success');
    } catch (err: any) {
      toast.dismiss('booking-loading');
      toast.error(err.message || 'Lỗi đặt sân.');
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

  // Lọc Ca đấu (Làm gọn) theo Buổi & Giờ Chẵn/Lẻ & Từ khóa giờ tìm kiếm
  const filteredSlots = slots.filter(s => {
    // 1. Lọc buổi
    if (periodFilter !== 'all' && s.period !== periodFilter) return false;
    // 2. Lọc giờ chẵn/lẻ
    if (hourFilter === 'even' && s.startHour % 2 !== 0) return false;
    if (hourFilter === 'odd' && s.startHour % 2 === 0) return false;
    // 3. Lọc theo tìm kiếm từ khóa giờ
    if (timeSearch.trim() && !s.timeRange.includes(timeSearch.trim())) return false;
    return true;
  });

  // Tiện ích từ API location
  const amenities: any[] = location?.locationAmenities || [];

  // Đánh giá từ sân đang chọn
  const reviews: any[] = activeCourt?.reviews || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* Navbar */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8 text-left">
        
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
                    <div className="h-64 sm:h-[380px] bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden relative flex items-center justify-center">
                      <img src={cur.url} alt="Gallery" className="w-full h-full object-cover transition-all duration-500" />
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
                            className={`h-16 sm:h-20 rounded-2xl overflow-hidden border-2 transition cursor-pointer p-0 relative ${
                              activeImgIndex === idx ? 'border-amber-500' : 'border-transparent hover:border-slate-700'
                            }`}>
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Tabs Điều Hướng Chi Tiết */}
            <div className="flex border-b border-slate-800 gap-6">
              <button
                onClick={() => setActiveTab('booking')}
                className={`pb-4 text-sm font-bold border-b-2 transition duration-150 cursor-pointer bg-transparent border-0 px-1 ${
                  activeTab === 'booking' ? 'border-amber-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Đặt sân & Chọn ca
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-4 text-sm font-bold border-b-2 transition duration-150 cursor-pointer bg-transparent border-0 px-1 ${
                  activeTab === 'details' ? 'border-amber-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Tiện ích & Đánh giá ({reviews.length} đánh giá)
              </button>
            </div>

            {/* Tab 1: ĐẶT SÂN */}
            {activeTab === 'booking' && (
              <div className="space-y-6">
                
                {/* 1. Chọn ngày chơi */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-4">
                  <h3 className="text-sm font-black text-white m-0 flex items-center gap-2 uppercase tracking-wider text-amber-500">
                    <CalendarIcon className="w-4.5 h-4.5" />
                    1. Chọn ngày chơi
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-bold px-4 py-3 rounded-xl outline-none transition w-full sm:w-64"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      ⚠️ Chọn ngày đấu thích hợp. Lịch đặt trước tối đa 14 ngày.
                    </span>
                  </div>
                </div>

                {/* 2. CHỌN SÂN TRONG CƠ SỞ */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-4">
                  <h3 className="text-sm font-black text-white m-0 flex items-center gap-2 uppercase tracking-wider text-amber-500">
                    <Trophy className="w-4.5 h-4.5 text-amber-500" />
                    2. Chọn sân đấu chi tiết
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {courts.map(c => {
                      const isSelected = selectedCourtId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCourt(c.id)}
                          className={`p-4 rounded-2xl transition border text-left cursor-pointer flex flex-col justify-between h-28 relative overflow-hidden ${
                            isSelected
                              ? 'bg-amber-600/10 border-amber-500 text-white shadow-lg shadow-amber-500/5'
                              : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-750 hover:bg-slate-900/30'
                          }`}
                        >
                          <div className="w-full flex justify-between items-start">
                            <div>
                              <span className="text-xs font-black block leading-none">{c.name}</span>
                              <span className="text-[9px] text-slate-500 block mt-1.5">{c.subType || c.category}</span>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shrink-0 ${
                              isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-550 border border-slate-800'
                            }`}>
                              {c.category}
                            </span>
                          </div>

                          <div className="w-full flex justify-between items-center mt-2 pt-2 border-t border-slate-900/60">
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                              ⭐ {c._count?.reviews || 0} đánh giá
                            </span>
                            <span className={`text-[11px] font-extrabold ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                              Giá gốc: {(Number(c.basePricePerHour) || 0).toLocaleString()}đ/h
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. CHỌN CA ĐẤU (LÀM GỌN PHẦN NÀY BẰNG BỘ LỌC TỐT HƠN) */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="text-sm font-black text-white m-0 flex items-center gap-2 uppercase tracking-wider text-amber-500">
                      <Clock className="w-4.5 h-4.5" />
                      3. Chọn Ca Đấu Trống
                    </h3>

                    {/* Bộ lọc làm gọn ca */}
                    <div className="flex flex-wrap items-center gap-2 select-none">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-950 px-2 py-1 rounded-lg border border-slate-900 shrink-0">
                        <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                        Lọc ca:
                      </div>

                      {/* Thời lượng */}
                      <select 
                        value={selectedDuration} 
                        onChange={(e) => {
                          setSelectedDuration(parseFloat(e.target.value));
                          setSelectedSlotId(null);
                        }}
                        className="bg-slate-950 border border-amber-500/30 hover:border-amber-500/50 text-[10px] text-amber-400 font-extrabold px-2 py-1 rounded-lg outline-none cursor-pointer"
                      >
                        <option value="1">⏱️ Thuê 1.0 Giờ</option>
                        <option value="1.5">⏱️ Thuê 1.5 Giờ</option>
                        <option value="2">⏱️ Thuê 2.0 Giờ</option>
                      </select>
                      
                      {/* Filter Buổi */}
                      <select 
                        value={periodFilter} 
                        onChange={(e) => setPeriodFilter(e.target.value as any)}
                        className="bg-slate-950 border border-slate-850 hover:border-slate-750 text-[10px] text-slate-300 font-bold px-2 py-1 rounded-lg outline-none cursor-pointer"
                      >
                        <option value="all">Tất cả các buổi</option>
                        <option value="morning">☀️ Ca Sáng (06h - 12h)</option>
                        <option value="afternoon">🌤️ Ca Chiều (12h - 18h)</option>
                        <option value="evening">🌙 Ca Tối (18h - 22h)</option>
                      </select>

                      {/* Filter Chẵn Lẻ */}
                      <select 
                        value={hourFilter} 
                        onChange={(e) => setHourFilter(e.target.value as any)}
                        className="bg-slate-950 border border-slate-850 hover:border-slate-750 text-[10px] text-slate-300 font-bold px-2 py-1 rounded-lg outline-none cursor-pointer"
                      >
                        <option value="all">Tất cả khung giờ</option>
                        <option value="even">⏱️ Giờ chẵn (06h, 08h...)</option>
                        <option value="odd">⏱️ Giờ lẻ (07h, 17h...)</option>
                      </select>

                      {/* Tìm giờ bằng ô input */}
                      <input 
                        type="text"
                        placeholder="Tìm giờ (ví dụ: 17:00)..."
                        value={timeSearch}
                        onChange={(e) => setTimeSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-850 hover:border-slate-750 text-[10px] text-white px-2.5 py-1 rounded-lg outline-none placeholder-slate-700 w-32 font-bold focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  {/* Hiển thị danh sách ca thu gọn theo bộ lọc */}
                  {filteredSlots.length === 0 ? (
                    <div className="py-8 bg-slate-950/20 border border-slate-900 rounded-2xl text-center text-xs text-slate-500">
                      Không có ca đấu nào phù hợp với bộ lọc được chọn.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredSlots.map(s => {
                        const isBooked = s.isBooked;
                        const isSelected = selectedSlotId === s.id;
                        return (
                          <button
                            key={s.id}
                            disabled={isBooked}
                            onClick={() => setSelectedSlotId(isSelected ? null : s.id)}
                            className={`p-3.5 rounded-2xl transition border text-left cursor-pointer flex justify-between items-center relative overflow-hidden ${
                              isBooked
                                ? 'bg-slate-950/20 border-slate-900/60 text-slate-600 cursor-not-allowed opacity-40'
                                : isSelected
                                ? 'bg-amber-550 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                                : 'bg-slate-950 border-slate-850 text-slate-350 hover:border-slate-750 hover:bg-slate-900/40'
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="text-xs font-bold block">{s.label}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-500 px-1 py-0.2 rounded font-bold uppercase">
                                  {s.startHour % 2 === 0 ? 'Giờ chẵn' : 'Giờ lẻ'}
                                </span>
                                {s.isPromo && !isBooked && (
                                  <span className="text-[8px] text-emerald-400 font-extrabold bg-emerald-950/50 border border-emerald-900/40 px-1.5 py-0.2 rounded">🎁 -10%</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              {isBooked ? (
                                <span className="text-[8px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-500 font-black uppercase">Hết sân</span>
                              ) : (
                                <span className={`text-xs font-black font-mono ${isSelected ? 'text-white' : 'text-amber-400'}`}>
                                  {(BASE_PRICE * s.priceModifier).toLocaleString()}đ/h
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Dịch vụ nước uống và dụng cụ đi kèm */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-4">
                  <h3 className="text-sm font-black text-white m-0 flex items-center gap-2 uppercase tracking-wider text-amber-500">
                    <Coffee className="w-4.5 h-4.5" />
                    4. Dịch vụ ăn uống & Thuê đồ dùng kèm
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map(p => (
                      <div 
                        key={p.id}
                        className="bg-slate-950 border border-slate-855/80 rounded-2xl p-4 flex items-center justify-between gap-4 transition hover:border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-2xl select-none shrink-0">
                            {p.image}
                          </div>
                          <div className="text-left leading-tight">
                            <span className="text-xs font-bold text-slate-200 block">{p.name}</span>
                            <span className="text-[10px] text-amber-400 font-mono font-bold mt-1.5 block">
                              {p.price.toLocaleString()}đ
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => updateProductQty(p.id, -1)}
                            className="w-7 h-7 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-slate-800 transition"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-black font-mono text-white">
                            {p.qty}
                          </span>
                          <button 
                            onClick={() => updateProductQty(p.id, 1)}
                            className="w-7 h-7 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-slate-800 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
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
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-6 sticky top-24">
              
              <div className="border-b border-slate-800/80 pb-4 text-left">
                <h3 className="text-sm font-black text-white m-0 tracking-wider uppercase text-amber-500">Biên lai thanh toán</h3>
                <p className="text-[10px] text-slate-500 m-0">Kiểm tra chi tiết và các khoản khấu trừ</p>
              </div>

              {/* Chi tiết ca đã chọn */}
              {selectedSlotId ? (
                <div className="space-y-4 text-xs">
                  
                  {/* Sân bãi */}
                  <div className="space-y-2 text-left">
                    <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">1. Sân thi đấu đã chọn</span>
                    <div className="bg-slate-955 border border-slate-850 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <strong className="text-xs text-white block">{activeCourt.name}</strong>
                        <span className="text-[9px] text-slate-500 font-bold block mt-1">{selectedDate} | {slots.find(s => s.id === selectedSlotId)?.label}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-xs shrink-0">{getSelectedSlotPrice().toLocaleString()}đ</span>
                    </div>
                  </div>

                  {/* Nước uống phụ trợ */}
                  {getProductsPrice() > 0 && (
                    <div className="space-y-2 text-left">
                      <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">2. Dịch vụ phụ trợ mua thêm</span>
                      <div className="bg-slate-955 border border-slate-855 rounded-2xl p-4 space-y-2">
                        {products.filter(p => p.qty > 0).map(p => (
                          <div key={p.id} className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                            <span>{p.name} <span className="text-slate-600 font-extrabold">x{p.qty}</span></span>
                            <span className="font-mono text-white">{(p.qty * p.price).toLocaleString()}đ</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nhập mã voucher */}
                  <div className="space-y-2 text-left">
                    <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">3. Mã giảm giá (Promo)</span>
                    <div className="flex gap-2">
                      <InputField
                        type="text"
                        placeholder="Nhập mã voucher..."
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-slate-955 border border-slate-855 py-2.5 px-3.5 rounded-xl text-xs flex-grow outline-none text-white focus:border-amber-500/50"
                      />
                      <button 
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 bg-slate-955 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-205 hover:text-white rounded-xl transition cursor-pointer"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {appliedPromo && (
                      <p className="text-[10px] text-emerald-400 font-bold m-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã giảm {appliedPromo.discountPercent}% (Tối đa -{appliedPromo.maxDiscount.toLocaleString()}đ)
                      </p>
                    )}
                    {promoError && (
                      <p className="text-[10px] text-red-500 m-0">⚠ {promoError}</p>
                    )}
                    <p className="text-[9px] text-slate-500 m-0 leading-relaxed">
                      💡 Mã voucher mẫu: <strong className="text-amber-400">SPORT20</strong> hoặc <strong className="text-amber-400">DONGGIA50K</strong>
                    </p>
                  </div>

                  {/* Receipt Breakdown (Dotted Separator Style) */}
                  <div className="border-t border-dashed border-slate-800 pt-4 space-y-2.5 text-xs text-left">
                    <div className="flex justify-between items-center text-slate-450">
                      <span>Cộng tiền sân & dịch vụ:</span>
                      <span className="font-mono text-white font-semibold">{subtotal.toLocaleString()}đ</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between items-center text-red-400 font-bold">
                        <span>Giảm giá voucher:</span>
                        <span className="font-mono">-{getDiscountAmount().toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-450">
                      <span>Thuế VAT (10%):</span>
                      <span className="font-mono text-white font-semibold">{vat.toLocaleString()}đ</span>
                    </div>
                    
                    <div className="border-t border-dashed border-slate-800 pt-3 space-y-1">
                      {paymentMethod !== 'CASH' && paymentMethod !== 'BANK_TRANSFER' && paymentOption === 'PARTIAL' && (
                        <div className="flex justify-between items-center text-slate-450 text-[10px] pt-0.5">
                          <span>Còn lại (Trả tại sân):</span>
                          <span className="font-mono text-slate-300 font-semibold">{Math.round(finalPrice * 0.7).toLocaleString()}đ</span>
                        </div>
                      )}
                      {paymentMethod === 'BANK_TRANSFER' && paymentOption === 'PARTIAL' && (
                        <div className="flex justify-between items-center text-slate-450 text-[10px] pt-0.5">
                          <span>Còn lại (Trả tại sân):</span>
                          <span className="font-mono text-slate-300 font-semibold">{Math.round(finalPrice * 0.7).toLocaleString()}đ</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white text-xs uppercase tracking-wider">Tổng tiền hóa đơn:</span>
                        <span className="text-lg font-black text-slate-200 font-mono">
                          {finalPrice.toLocaleString()}đ
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="font-extrabold text-amber-400 text-xs uppercase tracking-wider">Thanh toán ngay:</span>
                        <span className="text-xl font-black text-amber-400 font-mono">
                          {paymentMethod === 'CASH' 
                            ? '0' 
                            : paymentOption === 'PARTIAL' 
                              ? Math.round(finalPrice * 0.3).toLocaleString() 
                              : finalPrice.toLocaleString()
                          }đ
                        </span>
                      </div>

                      {paymentMethod === 'CASH' && (
                        <div className="flex justify-between items-center text-slate-450 text-[10px] pt-0.5">
                          <span>Số tiền trả tại sân:</span>
                          <span className="font-mono text-slate-300 font-semibold">{finalPrice.toLocaleString()}đ</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phương thức thanh toán */}
                  <div className="space-y-2 border-t border-slate-800/80 pt-4 text-left">
                    <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">4. Phương thức thanh toán</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(['BANK_TRANSFER', 'CASH'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2.5 text-[9px] font-extrabold rounded-xl border transition cursor-pointer text-center ${
                            paymentMethod === method
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5'
                              : 'bg-slate-955 border-slate-855 text-slate-500 hover:text-slate-350'
                          }`}
                        >
                          {method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lựa chọn thanh toán (nếu chọn cổng trực tuyến hoặc chuyển khoản) */}
                  {paymentMethod !== 'CASH' && (
                    <div className="space-y-2 border-t border-slate-800/80 pt-4 text-left">
                      <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">5. Lựa chọn thanh toán</span>
                      <div className="grid grid-cols-2 gap-2">
                        {(['FULL', 'PARTIAL'] as const).map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setPaymentOption(option)}
                            className={`py-2 text-[9px] font-extrabold rounded-xl border transition cursor-pointer text-center ${
                              paymentOption === option
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5'
                                : 'bg-slate-955 border-slate-855 text-slate-500 hover:text-slate-350'
                            }`}
                          >
                            {option === 'FULL' ? 'Thanh toán 100%' : 'Thanh toán cọc 30%'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hướng dẫn chuyển khoản VietQR */}
                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="space-y-3 border-t border-slate-800/80 pt-4 text-left">
                      <span className="text-amber-500 font-extrabold text-[10px] uppercase tracking-wider block">6. Quét mã VietQR chuyển khoản</span>
                      {location?.partner?.bankAccountNumber ? (
                        <div className="bg-slate-905 border border-slate-800/60 rounded-2xl p-4 space-y-4">
                          <div className="text-xs space-y-2 text-slate-300 font-sans">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Ngân hàng:</span>
                              <span className="font-extrabold text-white">{location.partner.bankName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Số tài khoản:</span>
                              <span className="font-extrabold text-white font-mono">{location.partner.bankAccountNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Chủ tài khoản:</span>
                              <span className="font-extrabold text-white uppercase">{location.partner.bankAccountName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Số tiền chuyển:</span>
                              <span className="font-extrabold text-amber-400 font-mono">
                                {(paymentOption === 'PARTIAL' ? Math.round(finalPrice * 0.3) : finalPrice).toLocaleString()}đ
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Nội dung chuyển:</span>
                              <span className="font-extrabold text-amber-500 font-mono">
                                DAT SAN {userPhone || 'QUET QR'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center space-y-2 max-w-[180px] mx-auto shadow-md">
                            <img
                              src={`https://img.vietqr.io/image/${getBankId(location.partner.bankName)}-${location.partner.bankAccountNumber}-compact2.png?amount=${paymentOption === 'PARTIAL' ? Math.round(finalPrice * 0.3) : finalPrice}&addInfo=${encodeURIComponent(`DAT SAN ${userPhone || 'QUET QR'}`)}&accountName=${encodeURIComponent(location.partner.bankAccountName)}`}
                              alt="VietQR code"
                              className="w-36 h-36 object-contain"
                            />
                            <span className="text-[8px] text-slate-800 font-black tracking-wider uppercase">Chuyển khoản an toàn</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-xl text-[10px] text-rose-450 font-semibold leading-relaxed">
                          ⚠️ Đối tác này chưa cập nhật thông tin tài khoản ngân hàng để nhận chuyển khoản. Vui lòng chọn phương thức khác.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Button checkout */}
                  <div className="pt-2">
                    <Button 
                      onClick={handleCheckout}
                      variant="primary" 
                      className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-xs font-black text-slate-950 hover:text-slate-950 rounded-2xl shadow-xl shadow-amber-500/15 transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 border-0"
                    >
                      <CreditCard className="w-4 h-4 shrink-0 text-slate-950" />
                      Xác Nhận & Đặt Sân Ngay
                    </Button>
                  </div>

                  {/* Bảo vệ thanh toán */}
                  <div className="bg-slate-950/60 border border-slate-855 rounded-xl p-3 flex gap-2 items-start text-left">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-slate-500 m-0 leading-relaxed">
                      SportZone bảo vệ giao dịch của bạn. Tiền thanh toán sẽ được hệ thống tạm giữ an toàn và chỉ kết chuyển cho đối tác chủ sân sau khi trận đấu kết thúc 2 giờ.
                    </p>
                  </div>

                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 space-y-2 text-left flex flex-col items-center">
                  <AlertCircle className="w-8 h-8 text-amber-500/40" />
                  <p className="m-0 max-w-[200px] text-center">Vui lòng chọn ca đấu hoạt động trống bên cột trái để tiến hành thanh toán hóa đơn.</p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
};
