import React, { useState } from 'react';
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
  CreditCard
} from 'lucide-react';

interface CourtDetailsProps {
  onNavigate?: (page: 'home' | 'auth' | 'admin' | 'partner' | 'field-details' | 'my-bookings' | 'booking-success' | 'matchmaking' | 'chat', authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
  onSetBookingSuccessData?: (data: any) => void;
}

interface TimeSlot {
  id: string;
  label: string;
  priceModifier: number;
  isBooked: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  category: 'DRINK' | 'FOOD' | 'EQUIPMENT';
  image: string;
  qty: number;
}

export const CourtDetails: React.FC<CourtDetailsProps> = ({ 
  onNavigate, 
  userName, 
  onLogout,
  onSetBookingSuccessData 
}) => {
  // 1. NGÀY ĐẶT SÂN
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Mặc định ngày mai
  );

  // 2. DANH SÁCH CA HOẠT ĐỘNG (TIME SLOTS)
  const [slots] = useState<TimeSlot[]>([
    { id: '1', label: '06:00 - 08:00 (Sáng sớm - Giảm 10%)', priceModifier: 0.9, isBooked: false },
    { id: '2', label: '08:00 - 10:00 (Sáng thường)', priceModifier: 1.0, isBooked: true },
    { id: '3', label: '10:00 - 12:00 (Sáng muộn)', priceModifier: 1.0, isBooked: false },
    { id: '4', label: '14:00 - 16:00 (Chiều thường)', priceModifier: 1.0, isBooked: false },
    { id: '5', label: '16:00 - 18:00 (Chiều mát)', priceModifier: 1.1, isBooked: false },
    { id: '6', label: '18:00 - 20:00 (Giờ vàng - Hệ số 1.3)', priceModifier: 1.3, isBooked: false },
    { id: '7', label: '20:00 - 22:00 (Giờ vàng - Hệ số 1.3)', priceModifier: 1.3, isBooked: false }
  ]);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // 3. SẢN PHẨM MUA KÈM (DRINKS & RENTALS)
  const [products, setProducts] = useState<ProductItem[]>([
    { id: '1', name: 'Nước khoáng Revive Chanh Muối', price: 15000, category: 'DRINK', image: '💧', qty: 0 },
    { id: '2', name: 'Nước tăng lực Sting Dâu', price: 15000, category: 'DRINK', image: '🥤', qty: 0 },
    { id: '3', name: 'Thuê Vợt Cầu Lông Pro Kennex', price: 30000, category: 'EQUIPMENT', image: '🏸', qty: 0 },
    { id: '4', name: 'Thuê Bộ Áo Nhóm Bib (10 cái)', price: 40000, category: 'EQUIPMENT', image: '👕', qty: 0 }
  ]);

  // 4. MÃ KHUYẾN MÃI (PROMO CODE)
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number; maxDiscount: number } | null>(null);
  const [promoError, setPromoError] = useState<string>('');

  // 5. CỔNG THANH TOÁN
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'MOMO' | 'CASH'>('VNPAY');

  // Giá sân cơ bản
  const BASE_PRICE = 150000;

  // Tính toán số tiền
  const getSelectedSlotPrice = () => {
    if (!selectedSlotId) return 0;
    const slot = slots.find(s => s.id === selectedSlotId);
    return slot ? BASE_PRICE * slot.priceModifier : 0;
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
      alert(`Áp dụng thành công mã giảm giá ${codeUpper}!`);
    } else {
      setPromoError('Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng.');
    }
  };

  // Thanh toán xác nhận đặt sân
  const handleCheckout = () => {
    if (!userName) {
      alert('Vui lòng đăng nhập tài khoản trước khi thực hiện đặt lịch giữ chỗ.');
      onNavigate?.('auth', 'login');
      return;
    }
    if (!selectedSlotId) {
      alert('Vui lòng chọn khung giờ (ca hoạt động) trống cần thuê.');
      return;
    }

    const chosenSlot = slots.find(s => s.id === selectedSlotId);
    const successData = {
      bookingCode: 'BKG-' + Math.floor(Math.random() * 900000 + 100000),
      courtName: 'Sân Cầu Lông Trong Nhà ProZone - Sân 1',
      sport: 'Cầu Lông',
      location: 'Số 12 Chu Văn An, Bình Thạnh, TP. HCM',
      bookingDate: selectedDate,
      startTime: chosenSlot?.label.split(' ')[0] || '18:00',
      endTime: chosenSlot?.label.split(' ')[2] || '20:00',
      paymentMethod: paymentMethod,
      finalPrice: finalPrice,
      products: products.filter(p => p.qty > 0).map(p => ({ name: p.name, qty: p.qty, price: p.price }))
    };

    if (onSetBookingSuccessData) {
      onSetBookingSuccessData(successData);
    }
    
    // Nếu chọn MoMo/VNPAY giả lập chuyển cổng thanh toán
    if (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
      alert(`Đang kết nối cổng thanh toán an toàn ${paymentMethod}...`);
    }

    // Điều hướng sang trang thành công
    onNavigate?.('booking-success');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* Navbar */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-8 text-left">
        
        {/* Tiêu đề Sân */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              🏸 Cầu Lông
            </span>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current" /> 4.9 (142 đánh giá thực tế)
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-950 border border-emerald-900 font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Đầy đủ tiện ích
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white m-0 tracking-tight leading-tight">
            Sân Cầu Lông Trong Nhà ProZone - Chi nhánh Bình Thạnh
          </h2>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="w-4.5 h-4.5 text-slate-500 shrink-0" />
            <span>Số 12 Chu Văn An, Phường 26, Quận Bình Thạnh, TP. Hồ Chí Minh (Cách bạn 2.4 km)</span>
          </div>
        </div>

        {/* Layout Hai cột */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột trái: Thông tin sân + đặt ca */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Ảnh Gallery Slider */}
            <div className="h-64 sm:h-96 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex items-center justify-center text-8xl relative group">
              🏸
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-xs bg-slate-950/80 px-4 py-2 border border-slate-800 rounded-xl text-slate-200">
                Thảm đấu cao cấp Alsaflor Pro | Đèn LED chống lóa | Bãi xe ô tô
              </div>
            </div>

            {/* Bước 1: Chọn ngày */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-black text-white m-0 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-400" />
                1. Chọn Ngày Chơi Đấu
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-sm text-slate-300 font-bold px-4 py-3 rounded-xl outline-none transition w-full sm:w-64"
                />
                <span className="text-xs text-slate-400">
                  ⚠️ Quý khách có thể đặt lịch trước tối đa 14 ngày. Hệ thống sẽ tự động cập nhật ca trống thời gian thực.
                </span>
              </div>
            </div>

            {/* Bước 2: Chọn ca */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-black text-white m-0 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                2. Chọn Ca Hoạt Động Trống
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {slots.map(s => (
                  <button
                    key={s.id}
                    disabled={s.isBooked}
                    onClick={() => setSelectedSlotId(selectedSlotId === s.id ? null : s.id)}
                    className={`p-4 rounded-2xl transition border text-left cursor-pointer flex justify-between items-center ${
                      s.isBooked 
                        ? 'bg-slate-950/40 border-slate-850 text-slate-500 cursor-not-allowed opacity-50' 
                        : selectedSlotId === s.id
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-750 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold block">{s.label}</span>
                      <span className="text-[10px] text-slate-500 block">Đơn giá gốc: {BASE_PRICE.toLocaleString()}đ/giờ</span>
                    </div>

                    <div className="text-right shrink-0">
                      {s.isBooked ? (
                        <span className="text-[10px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">Hết sân</span>
                      ) : (
                        <span className={`text-xs font-black font-mono ${selectedSlotId === s.id ? 'text-white' : 'text-emerald-400'}`}>
                          {(BASE_PRICE * s.priceModifier).toLocaleString()}đ/giờ
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bước 3: Đặt thêm nước suối/vợt */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-black text-white m-0 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-emerald-400" />
                3. Đặt Kèm Dịch Vụ Phụ Trợ (Nước uống, Thuê dụng cụ tại sân)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => (
                  <div 
                    key={p.id}
                    className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-2xl select-none shrink-0">
                        {p.image}
                      </div>
                      <div className="text-left leading-tight">
                        <span className="text-xs font-bold text-white block">{p.name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold mt-1 block">
                          {p.price.toLocaleString()}đ
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateProductQty(p.id, -1)}
                        className="w-7 h-7 bg-slate-900 border border-slate-855 text-slate-400 hover:text-white rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-slate-800 transition"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-black font-mono text-white">
                        {p.qty}
                      </span>
                      <button 
                        onClick={() => updateProductQty(p.id, 1)}
                        className="w-7 h-7 bg-slate-900 border border-slate-855 text-slate-400 hover:text-white rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-slate-800 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Cột phải: Hóa đơn & Checkout */}
          <div className="space-y-6">
            
            {/* Tóm tắt biên lai thanh toán */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 sticky top-24 backdrop-blur-md">
              
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-black text-white m-0">Hóa Đơn Tạm Tính</h3>
                <p className="text-[10px] text-slate-500 m-0">Xác nhận chi tiết thanh toán của bạn</p>
              </div>

              {/* Chi tiết ca đã chọn */}
              {selectedSlotId ? (
                <div className="space-y-3.5 text-xs">
                  
                  {/* Sân bãi */}
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold block">1. SÂN BÃI ĐÃ CHỌN</span>
                    <div className="bg-slate-950 border border-slate-855 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <strong className="text-white block">Sân Cầu Lông Số 1</strong>
                        <span className="text-[10px] text-slate-500">{selectedDate} | Ca {selectedSlotId}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">{getSelectedSlotPrice().toLocaleString()}đ</span>
                    </div>
                  </div>

                  {/* Nước uống phụ trợ */}
                  {getProductsPrice() > 0 && (
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold block">2. DỊCH VỤ PHỤ TRỢ</span>
                      <div className="bg-slate-950 border border-slate-855 rounded-xl p-3 space-y-2">
                        {products.filter(p => p.qty > 0).map(p => (
                          <div key={p.id} className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>{p.name} <span className="text-slate-500">x{p.qty}</span></span>
                            <span className="font-mono text-white">{(p.qty * p.price).toLocaleString()}đ</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nhập mã voucher */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-slate-500 font-bold block">3. MÃ KHUYẾN MÃI (PROMO)</span>
                    <div className="flex gap-2">
                      <InputField
                        type="text"
                        placeholder="Nhập mã voucher..."
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-slate-950 border border-slate-855 py-2.5 px-3.5 rounded-xl text-xs flex-grow outline-none text-white focus:border-emerald-500/50"
                      />
                      <button 
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white rounded-xl transition cursor-pointer"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {appliedPromo && (
                      <p className="text-[10px] text-emerald-400 font-bold m-0">✓ Đã áp mã {appliedPromo.code}: Giảm {appliedPromo.discountPercent}% (Tối đa -{appliedPromo.maxDiscount.toLocaleString()}đ)</p>
                    )}
                    {promoError && (
                      <p className="text-[10px] text-red-500 m-0">⚠ {promoError}</p>
                    )}
                    <p className="text-[9px] text-slate-500 m-0">💡 Nhập mã <strong className="text-emerald-400">DONGGIA50K</strong> (giảm 25% tối đa 50k) hoặc <strong className="text-emerald-400">SPORT20</strong> để test thử.</p>
                  </div>

                  {/* Phân chia thanh toán */}
                  <div className="border-t border-slate-850 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Cộng gốc:</span>
                      <span className="font-mono text-white">{subtotal.toLocaleString()}đ</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between items-center text-red-400 font-bold">
                        <span>Giảm giá khuyến mãi:</span>
                        <span className="font-mono">-{getDiscountAmount().toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Thuế giá trị gia tăng VAT (10%):</span>
                      <span className="font-mono text-white">{vat.toLocaleString()}đ</span>
                    </div>
                    <div className="border-t border-slate-855 pt-2 flex justify-between items-baseline">
                      <span className="font-bold text-white text-sm">Tổng cộng thanh toán:</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {finalPrice.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  {/* Cổng thanh toán */}
                  <div className="space-y-1.5 border-t border-slate-850 pt-3">
                    <span className="text-slate-500 font-bold block uppercase tracking-wider">4. CHỌN CỔNG THANH TOÁN</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['VNPAY', 'MOMO', 'CASH'] as const).map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 text-[10px] font-bold rounded-xl border transition cursor-pointer text-center ${
                            paymentMethod === method
                              ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-md'
                              : 'bg-slate-950 border-slate-855 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {method === 'VNPAY' ? 'VNPAY' : method === 'MOMO' ? 'Ví MoMo' : 'Tiền mặt'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button checkout */}
                  <div className="pt-2">
                    <Button 
                      onClick={handleCheckout}
                      variant="primary" 
                      className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-black text-white rounded-2xl shadow-xl shadow-emerald-600/10 transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4 shrink-0" />
                      Xác Nhận & Đặt Sân Ngay
                    </Button>
                  </div>

                  {/* Cam kết */}
                  <div className="bg-slate-950/60 border border-slate-855 rounded-xl p-3 flex gap-2 items-start">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-[9px] text-slate-500 m-0 leading-relaxed">
                      SportZone bảo vệ quyền lợi thanh toán của bạn 100%. Tiền của bạn sẽ được giữ an toàn trên cổng đối soát và chỉ kết chuyển cho chủ sân sau khi trận đấu của bạn kết thúc 2 giờ.
                    </p>
                  </div>

                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500/50 mx-auto" />
                  <p className="m-0">Vui lòng chọn khung giờ trống cần thuê (Ca hoạt động) ở cột bên trái để bắt đầu lập hóa đơn thanh toán.</p>
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
