import React, { useState, useEffect } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { CategoryList } from '../../../features/sports-field/components/CategoryList';
import { FieldList, MOCK_FIELDS } from '../../../features/sports-field/components/FieldList';
import { SearchBar } from '../../../features/sports-field/components/SearchBar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useCategories } from '../../../hooks/useCategories';
import { 
  Building2, CalendarDays, MapPin, ShieldCheck, Trophy, Zap, 
  Clock, CheckCircle2, QrCode, ArrowRight, Flame, Sparkles, 
  Compass, Bell, Quote, Star, Award
} from 'lucide-react';
import { ErrorBoundary } from '../../../components/ui/ErrorBoundary';
import { toast } from 'sonner';

interface HomeProps {
  onNavigate?: (page: any, authMode?: any) => void;
  userName?: string;
  onLogout?: () => void;
  searchFilters: {
    query: string;
    address: string;
    category: string;
  };
  onSearch: (filters: { query: string; address: string; category: string }) => void;
}

const API = 'http://localhost:3000';

const getPitchImage = (pitch: any) => {
  if (pitch.imageUrls && Array.isArray(pitch.imageUrls) && pitch.imageUrls.length > 0) {
    return pitch.imageUrls[0];
  }
  const cat = (pitch.category || '').toLowerCase();
  if (cat.includes('bóng đá') || cat.includes('foot')) {
    return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
  }
  if (cat.includes('cầu lông') || cat.includes('badminton')) {
    return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop';
  }
  if (cat.includes('tennis')) {
    return 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop';
};

export const Home: React.FC<HomeProps> = ({ 
  onNavigate, 
  userName, 
  onLogout,
  searchFilters,
  onSearch
}) => {
  const [bannerQuery, setBannerQuery] = useState(searchFilters.query);
  const [bannerAddress, setBannerAddress] = useState(searchFilters.address);
  const [bannerCategory, setBannerCategory] = useState(searchFilters.category);

  const [homeCategory, setHomeCategory] = useState('all');
  const [dbPitches, setDbPitches] = useState<any[]>([]);
  const [pitchCategory, setPitchCategory] = useState('all');
  const [isNotified, setIsNotified] = useState(false);

  // Lấy danh sách bộ môn từ DB
  const { categories, getNameBySlug } = useCategories();

  // Fetch danh sách sân đấu thực tế từ DB
  useEffect(() => {
    fetch(`${API}/public/sports-pitches`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        setDbPitches(data);
      })
      .catch(() => setDbPitches([]));
  }, []);

  const handleSearchSubmit = () => {
    onSearch({
      query: bannerQuery,
      address: bannerAddress,
      category: bannerCategory
    });
  };

  const handleNotifyMe = () => {
    setIsNotified(true);
    toast.success('Đã kích hoạt thông báo! Bạn sẽ nhận tin nhắn khi có ca trống mới.');
  };

  const homeFilteredFields = MOCK_FIELDS.filter(court => {
    const categoryName = getNameBySlug(homeCategory);
    return homeCategory === 'all' || court.sport.toLowerCase() === categoryName?.toLowerCase();
  });

  const filteredPitches = dbPitches.filter(pitch => {
    const categoryName = getNameBySlug(pitchCategory);
    return pitchCategory === 'all' || pitch.category.toLowerCase().includes(categoryName?.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 overflow-x-hidden selection:bg-emerald-500/30 selection:text-zinc-50">
      
      {/* 1. THANH NAV DÙNG CHUNG */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* 2. HERO SECTION ĐIỆN ẢNH VỚI COMMAND BAR */}
      <section 
        className="relative min-h-[660px] flex items-center justify-start text-left px-6 sm:px-12 lg:px-24 bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: "url('/stadium_hero_bg.png')" 
        }}
      >
        <div className="absolute inset-0 sz-hero-vignette z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_65%_35%,rgba(16,185,129,0.18),transparent_32rem)] z-10"></div>

        <div className="relative z-20 max-w-5xl space-y-7 pt-16 pb-16">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
            <span>Real-time Multi-Sport Booking</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 font-medium">Hơn 50+ cụm sân tại TP.HCM</span>
          </div>

          {/* Heading 1 / 2 */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-zinc-50 tracking-tight">
              Đặt sân thi đấu <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 bg-clip-text text-transparent">
                Chuẩn xác từng giây
              </span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              Hệ thống ma trận lịch trống thời gian thực. Khóa slot giữ chỗ 10 phút, không trùng lịch, thanh toán linh hoạt và quét mã QR vào sân ngay.
            </p>
          </div>

          {/* Primary Quick Actions */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <a href="#courts-list">
              <Button 
                variant="primary" 
                className="px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-sm font-black rounded-xl shadow-xl shadow-emerald-500/25 text-zinc-950 transition-all cursor-pointer flex items-center gap-2 border-0"
              >
                <CalendarDays className="w-4.5 h-4.5" />
                <span>Đặt Sân Ngay</span>
              </Button>
            </a>

            <Button 
              variant="secondary"
              className="px-6 py-3.5 bg-zinc-900/80 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 active:scale-[0.98] text-sm font-bold rounded-xl text-zinc-100 transition-all cursor-pointer flex items-center gap-2 backdrop-blur-md"
            >
              <Building2 className="w-4.5 h-4.5 text-emerald-400" />
              <span>Dành Cho Chủ Sân</span>
            </Button>
          </div>

          {/* 2. REDESIGNED COMMAND BAR */}
          <div className="pt-2 w-full">
            <SearchBar
              searchQuery={bannerQuery}
              onSearchChange={setBannerQuery}
              selectedAddress={bannerAddress}
              onAddressChange={setBannerAddress}
              selectedCategory={bannerCategory}
              onCategoryChange={setBannerCategory}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>

          {/* 3. HERO KPI STATS */}
          <div className="grid grid-cols-3 gap-3.5 max-w-xl pt-2">
            {[
              { value: '320+', label: 'Lượt đặt / tháng', icon: Zap, accent: 'text-emerald-400' },
              { value: '4.9/5', label: 'Đánh giá tích cực', icon: Star, accent: 'text-amber-400' },
              { value: '30s', label: 'Khóa slot nhanh', icon: Clock, accent: 'text-teal-400' },
            ].map(({ value, label, icon: Icon, accent }) => (
              <div 
                key={label} 
                className="bg-zinc-900/85 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-3.5 shadow-lg hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl sm:text-2xl font-black text-zinc-50 tracking-tight font-mono">{value}</span>
                  <Icon className={`w-4 h-4 ${accent} opacity-80 group-hover:scale-110 transition-transform`} />
                </div>
                <span className="block text-[11px] font-semibold text-zinc-400">{label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. SECTION: PRO ADVANTAGES - ASYMMETRIC BENTO GRID (DESIGN_VARIANCE: 6) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-zinc-800/80 bg-zinc-950/70 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header Bất Đối Xứng (Off-center Layout) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nền tảng công nghệ thể thao</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-50 m-0 leading-tight">
                Trải Nghiệm Đặt Sân <br />
                <span className="text-emerald-400">Đẳng Cấp & Chuẩn Xác</span>
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-md text-left md:text-right leading-relaxed font-normal">
              Loại bỏ hoàn toàn cảnh gọi điện check giờ thủ công. Chúng tôi đồng bộ dữ liệu thời gian thực trực tiếp từ hệ thống quản lý của chủ sân.
            </p>
          </div>

          {/* BENTO GRID: 1 CARD LỚN (7 COLS) + 2 CARD NHỎ (5 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            
            {/* Bento Card 1 (Large - Realtime Scheduler Preview - Spans 7 cols) */}
            <div className="lg:col-span-7 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/90 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
              <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>SOCKET.IO REAL-TIME</span>
                  </span>
                </div>
                <h3 className="text-2xl font-black text-zinc-50 tracking-tight m-0">
                  Đặt Sân Real-Time 30 Giây
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg">
                  Lịch trống đồng bộ từng phút với hệ thống đèn và lễ tân tại sân. Khi bạn chọn giờ, slot sẽ tự động khóa 10 phút để tránh bất kỳ ai đặt trùng.
                </p>
              </div>

              {/* Interactive Scheduler Mockup */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3.5 relative z-10 shadow-inner">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800">
                  <span className="font-bold text-zinc-300 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-400" />
                    Hôm nay, 24 Tháng 10
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">Sân số 3 (Mặt cỏ nhân tạo)</span>
                </div>

                {/* Slot Pills Visual Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center opacity-40 cursor-not-allowed">
                    <span className="block text-xs font-mono font-bold text-zinc-400">16:00 - 17:30</span>
                    <span className="block text-[9px] uppercase font-bold text-zinc-500 mt-1">Đã kín chỗ</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center relative shadow-md shadow-emerald-500/10">
                    <span className="block text-xs font-mono font-bold text-emerald-300">17:30 - 19:00</span>
                    <span className="block text-[9px] uppercase font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                      Đang chọn
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-lime-500/30 text-center hover:border-lime-500/60 transition-colors cursor-pointer group/slot">
                    <span className="block text-xs font-mono font-bold text-lime-400 group-hover/slot:text-lime-300">19:00 - 20:30</span>
                    <span className="block text-[9px] uppercase font-bold text-lime-400/90 mt-1">Ca Vàng -20%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-center transition-colors cursor-pointer">
                    <span className="block text-xs font-mono font-bold text-zinc-300">20:30 - 22:00</span>
                    <span className="block text-[9px] uppercase font-bold text-emerald-400 mt-1">Còn trống</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Thời gian giữ chỗ an toàn: <strong className="text-emerald-400 font-mono">09:59</strong>
                  </span>
                  <span className="text-zinc-500 hidden sm:inline">Khóa tự động chống duplicate</span>
                </div>
              </div>

            </div>

            {/* Bento Right Column (Spans 5 cols) - 2 Stacked Cards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Bento Card 2: Chất Lượng Kiểm Duyệt */}
              <div className="flex-1 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all duration-300">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-50 tracking-tight m-0">
                    Kiểm Duyệt Cơ Sở 100%
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Đội ngũ chuyên viên khảo sát thực tế chất lượng mặt sân, hệ thống chiếu sáng đạt 500+ Lux và tiện ích phụ trợ.
                  </p>
                </div>

                {/* Verified Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Mặt sân chuẩn thi đấu</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Đèn LED không chói</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Phòng tắm & thay đồ sạch</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Bãi giữ xe rộng rãi</span>
                  </div>
                </div>
              </div>

              {/* Bento Card 3: Thẻ Hội Viên & Ưu Đãi Độc Quyền */}
              <div className="flex-1 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all duration-300">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-50 tracking-tight m-0">
                    Ưu Đãi Tuyển Thủ & Hoàn Tiền
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tự động tích điểm rank Bạc/Vàng/Kim Cương sau mỗi ca thi đấu. Hoàn tiền 5% vào ví khi thanh toán qua mã QR.
                  </p>
                </div>

                {/* Member Preview Banner */}
                <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400 text-zinc-950 font-black flex items-center justify-center text-xs">
                      VIP
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-zinc-200">Hội viên SportPass</span>
                      <span className="block text-[10px] text-emerald-400 font-medium">Giảm tới 50.000đ/ca</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-400 px-2 py-1 bg-zinc-800/80 rounded">
                    CASHBACK 5%
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. SECTION: SÂN ĐẤU TIÊU BIỂU (FEATURED SPORTS PITCHES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10 text-left">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Sân Đấu Tiêu Biểu</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-50 m-0">
              Khung Giờ Đẹp & Cơ Sở Chất Lượng
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Các cụm sân được tuyển chọn có cơ sở vật chất tốt nhất và lịch trống cập nhật theo ca chơi.
            </p>
          </div>

          {/* Categories/Tabs lọc Sân đấu (từ DB) */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setPitchCategory('all')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                pitchCategory === 'all'
                  ? 'bg-emerald-400 text-zinc-950 border-emerald-300 font-black shadow-md shadow-emerald-400/20'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setPitchCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  pitchCategory === cat.slug
                    ? 'bg-emerald-400 text-zinc-950 border-emerald-300 font-black shadow-md shadow-emerald-400/20'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 4. XỬ LÝ EMPTY STATE BẰNG RADAR GOLDEN SLOTS + SHIMMER SKELETON */}
        {filteredPitches.length === 0 ? (
          <div className="space-y-6">
            
            {/* Radar Golden Hours Alert Banner */}
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
              <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-5 relative z-10 text-left">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
                  <Flame className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Radar Khung Giờ Vàng
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">Cập nhật 12:00 & 18:00 hằng ngày</span>
                  </div>
                  <h3 className="text-lg font-black text-zinc-50 m-0">
                    Đang mở đợt ca thi đấu mới cho bộ môn này
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-lg">
                    Các chủ sân đối tác đang cập nhật danh sách sân đấu và khung giờ trống. Nhận thông báo đẩy ngay khi có sân mở lịch!
                  </p>
                </div>
              </div>

              <div className="relative z-10 shrink-0 w-full sm:w-auto">
                <Button 
                  onClick={handleNotifyMe}
                  variant="primary"
                  className={`w-full sm:w-auto px-6 py-3 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isNotified 
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-lg shadow-emerald-400/20'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>{isNotified ? '✓ Đã Bật Thông Báo' : 'Nhận Báo Slot Trống'}</span>
                </Button>
              </div>
            </div>

            {/* Shimmer Skeleton Placeholder Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-60">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden p-4 space-y-4 animate-pulse">
                  <div className="aspect-[16/10] bg-zinc-800/60 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/20 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-800 rounded-md w-3/4"></div>
                    <div className="h-3 bg-zinc-800/60 rounded-md w-1/2"></div>
                  </div>
                  <div className="flex gap-1.5 pt-2">
                    <div className="h-6 bg-zinc-800/80 rounded w-14"></div>
                    <div className="h-6 bg-zinc-800/80 rounded w-14"></div>
                    <div className="h-6 bg-zinc-800/80 rounded w-14"></div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* Danh sách Sân Đấu có sẵn từ DB */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPitches.slice(0, 8).map((pitch) => {
              const image = getPitchImage(pitch);
              return (
                <div 
                  key={pitch.id}
                  className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xl hover:-translate-y-1.5"
                >
                  {/* Ảnh và tag */}
                  <div className="aspect-[16/10] overflow-hidden relative bg-zinc-950">
                    <img 
                      src={image} 
                      alt={pitch.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                    
                    {/* Category Tag */}
                    <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 bg-emerald-400 text-zinc-950 rounded-lg uppercase tracking-wider shadow">
                      {pitch.category}
                    </span>

                    {/* Time slot hint */}
                    <div className="absolute left-3 bottom-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Còn 3 ca trống hôm nay</span>
                    </div>
                  </div>

                  {/* Thông tin */}
                  <div className="p-5 flex-grow space-y-3 text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">
                        {pitch.subType || 'Sân đạt chuẩn'}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1 m-0">
                        {pitch.name}
                      </h4>
                    </div>

                    <div className="space-y-1 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="line-clamp-1 font-medium text-zinc-300">{pitch.locationName || 'Cơ sở thành viên'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{pitch.locationDistrict ? `${pitch.locationDistrict}, ` : ''}{pitch.locationCity || 'TP.HCM'}</span>
                      </div>
                    </div>

                    {/* Time-Slot Pills */}
                    <div className="pt-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['17:30', '18:30', '19:30'].map(slot => (
                          <span key={slot} className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Giá và nút */}
                  <div className="px-5 pb-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Đơn giá / giờ</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {(Number(pitch.basePricePerHour) || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate?.('field-details', { locationId: pitch.locationId, courtId: pitch.id })}
                      className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-xs font-black text-zinc-950 rounded-xl transition-all shadow-md shadow-emerald-400/20 cursor-pointer border-0 flex items-center gap-1"
                    >
                      <span>Đặt Lịch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. SECTION: FEATURED VENUE & CÁC SÂN KHÁM PHÁ (FIELD LIST) */}
      <section id="courts-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ Thống Sân Hàng Đầu</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-50 m-0">
              Khám Phá Sân Thể Thao ProZone
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Xem chi tiết giá thuê, tiện ích máy lạnh, đèn LED và slot giờ trống của từng cơ sở.
            </p>
          </div>
        </div>

        {/* Thanh Phân Loại Danh Mục (Lucide Vector Icons) */}
        <CategoryList selectedCategory={homeCategory} onSelectCategory={setHomeCategory} />

        {/* Danh Sách Sân Đấu Nâng Cấp với Time-Slot Pills */}
        <FieldList fields={homeFilteredFields} onNavigate={onNavigate} />
      </section>

      {/* 6. SECTION: SIMPLE PROCESS (3 BƯỚC) - CONNECTED TIMELINE & DIGITAL QR PASS */}
      <section className="bg-zinc-900/40 border-y border-zinc-800/80 py-20 text-left relative overflow-hidden">
        <div className="absolute top-1/2 left-0 right-0 h-96 -translate-y-1/2 bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge status="success">Quy trình mượt mà</Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-50 m-0">
              Đặt Sân Chuẩn Chỉ Trong 3 Bước
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Không cần chuyển khoản thủ công hay gọi điện thoại chờ xác nhận. Mọi thứ được số hóa trơn tru.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Timeline 3 Bước Liền Mạch (Spans 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1 */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono font-black text-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  01
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors m-0">
                    Tìm Sân Cận Vị Trí & Chọn Môn Thể Thao
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Sử dụng thanh Command Bar thông minh để chọn khu vực gần bạn, loại sân bóng đá, cầu lông hay tennis theo đúng ngân sách.
                  </p>
                </div>
              </div>

              {/* Step Connector Line */}
              <div className="ml-6 w-0.5 h-6 bg-gradient-to-b from-emerald-500/60 to-teal-500/60"></div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono font-black text-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  02
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors m-0">
                    Xem Lịch Trống Trực Quan & Khóa Slot 10 Phút
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ma trận thời gian hiển thị chính xác từng ca. Khi bấm chọn, hệ thống tự động khóa chỗ cho bạn hoàn tất thông tin an toàn.
                  </p>
                </div>
              </div>

              {/* Step Connector Line */}
              <div className="ml-6 w-0.5 h-6 bg-gradient-to-b from-teal-500/60 to-lime-500/60"></div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/25 text-lime-400 font-mono font-black text-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  03
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-lime-300 transition-colors m-0">
                    Nhận QR Code Check-in & Ra Sân Tức Thì
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Vé điện tử lưu trữ trực tiếp trong điện thoại. Đến quầy lễ tân chỉ cần quét mã QR trong 2 giây để bật đèn sân thi đấu.
                  </p>
                </div>
              </div>

            </div>

            {/* Visual Digital QR Pass / Match Ticket Preview (Spans 5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400"></div>
                
                {/* Header Ticket */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      SZ
                    </div>
                    <div>
                      <span className="text-xs font-black text-zinc-100 block">SPORTZONE MATCH PASS</span>
                      <span className="text-[10px] font-mono text-zinc-400">BOOKING #SZ-88421</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    CONFIRMED
                  </span>
                </div>

                {/* Body Ticket Info */}
                <div className="py-5 space-y-3.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Địa điểm & Sân đấu</span>
                    <strong className="text-sm text-zinc-100 font-bold block">Sân Cầu Lông Trong Nhà ProZone - Sân 03</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Thời gian</span>
                      <span className="text-xs text-emerald-400 font-mono font-bold">18:30 - 20:00</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Ngày thi đấu</span>
                      <span className="text-xs text-zinc-200 font-bold">Thứ Bảy, 24/10</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Graphic Divider */}
                <div className="relative py-4 border-t border-dashed border-zinc-800 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-36 h-36 bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    {/* SVG Clean Vector QR Code */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-950 fill-current">
                      <rect x="0" y="0" width="30" height="30" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="10" y="10" width="10" height="10" />
                      
                      <rect x="70" y="0" width="30" height="30" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="80" y="10" width="10" height="10" />

                      <rect x="0" y="70" width="30" height="30" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="10" y="80" width="10" height="10" />

                      {/* Random Data Pattern */}
                      <rect x="35" y="10" width="8" height="8" />
                      <rect x="48" y="10" width="8" height="8" />
                      <rect x="35" y="25" width="8" height="8" />
                      <rect x="48" y="35" width="8" height="8" />
                      <rect x="15" y="45" width="8" height="8" />
                      <rect x="35" y="50" width="15" height="8" />
                      <rect x="55" y="50" width="8" height="8" />
                      <rect x="70" y="40" width="8" height="8" />
                      <rect x="82" y="40" width="8" height="8" />
                      <rect x="70" y="60" width="8" height="8" />
                      <rect x="82" y="60" width="8" height="8" />
                      <rect x="38" y="70" width="8" height="8" />
                      <rect x="52" y="70" width="8" height="8" />
                      <rect x="38" y="85" width="8" height="8" />
                      <rect x="52" y="85" width="8" height="8" />
                      <rect x="70" y="85" width="20" height="8" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Quét tại quầy lễ tân để check-in</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. SECTION: ĐÁNH GIÁ TỪ CÁC TUYỂN THỦ (TESTIMONIALS) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5" />
              <span>Tiếng Nói Tuyển Thủ</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-50 m-0">
              Đánh Giá Thực Tế Từ Người Chơi
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Được đánh giá 4.9/5 từ hơn 1,200+ trận đấu</span>
        </div>

        <ErrorBoundary fallback={
          <div className="py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-center text-xs text-zinc-500">
            Không thể tải đánh giá lúc này.
          </div>
        }>
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="w-full pb-14"
          >
            {/* Slide 1 */}
            <SwiperSlide>
              <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-6 sm:p-7 rounded-3xl space-y-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 h-[240px] text-left shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic m-0">
                    "Tôi đặt sân cỏ nhân tạo cho công ty đá bóng hàng tuần. Lịch lúc nào cũng chính xác tuyệt đối, săn được mã giảm giá ca vàng 17:30 rất rẻ và tiện lợi!"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                    QH
                  </div>
                  <div className="text-left">
                    <strong className="text-xs text-zinc-100 flex items-center gap-1.5">
                      <span>Trần Quốc Hùng</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </strong>
                    <span className="text-[10px] text-zinc-400 block">Đội trưởng FC Rainbow</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 2 */}
            <SwiperSlide>
              <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-6 sm:p-7 rounded-3xl space-y-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 h-[240px] text-left shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic m-0">
                    "Hệ thống đặt sân cầu lông quá tiện. Thích nhất là hiển thị sẵn các pill giờ trống [18:30] [19:30] ngay trên thẻ sân, không phải click vào từng trang để dò lịch."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 font-black text-xs flex items-center justify-center shrink-0">
                    LC
                  </div>
                  <div className="text-left">
                    <strong className="text-xs text-zinc-100 flex items-center gap-1.5">
                      <span>Nguyễn Thị Linh Chi</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </strong>
                    <span className="text-[10px] text-zinc-400 block">Tuyển thủ Cầu Lông bán chuyên</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 3 */}
            <SwiperSlide>
              <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-6 sm:p-7 rounded-3xl space-y-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 h-[240px] text-left shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic m-0">
                    "Sân Tennis Phú Mỹ Hưng đặt giờ trước kia rất dễ bị trùng ca. Giờ có mã QR và xác nhận tức thì, cả nhóm chỉ việc xách vợt ra sân khởi động là chơi."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
                  <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-400 font-black text-xs flex items-center justify-center shrink-0">
                    HH
                  </div>
                  <div className="text-left">
                    <strong className="text-xs text-zinc-100 flex items-center gap-1.5">
                      <span>Lê Huy Hoàng</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </strong>
                    <span className="text-[10px] text-zinc-400 block">Hội Tennis TP.HCM</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </ErrorBoundary>
      </section>

      {/* 8. CHÂN TRANG DÙNG CHUNG */}
      <Footer />

    </div>
  );
};
