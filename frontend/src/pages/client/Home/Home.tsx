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
import { BadgePercent, Building2, CalendarDays, MapPin, ShieldCheck, Trophy, Zap } from 'lucide-react';
import { ErrorBoundary } from '../../../components/ui/ErrorBoundary';
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
  // Fallbacks
  const cat = (pitch.category || '').toLowerCase();
  if (cat.includes('bóng')) {
    return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
  }
  if (cat.includes('lông')) {
    return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop';
};



export const Home: React.FC<HomeProps> = ({ 
  onNavigate, 
  userName, 
  onLogout,
  searchFilters,
  onSearch
}) => {
  // State quản lý bộ tìm kiếm cục bộ ở Banner trước khi nhấn "Tìm kiếm"
  const [bannerQuery, setBannerQuery] = useState(searchFilters.query);
  const [bannerAddress, setBannerAddress] = useState(searchFilters.address);
  const [bannerCategory, setBannerCategory] = useState(searchFilters.category);

  // State lọc danh mục cho phần tab duyệt sân nhanh ở cuối trang
  const [homeCategory, setHomeCategory] = useState('all');

  const [dbPitches, setDbPitches] = useState<any[]>([]);
  const [pitchCategory, setPitchCategory] = useState('all');

  // Lấy danh sách bộ môn từ DB
  const { categories, getNameBySlug } = useCategories();

  // Fetch danh sách sân đấu thực tế từ DB
  useEffect(() => {
    fetch(`${API}/public/sports-pitches`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        setDbPitches(data);
      })
      .catch(console.error);
  }, []);

  // Xử lý chuyển sang trang tìm kiếm khi click nút "Tìm kiếm"
  const handleSearchSubmit = () => {
    onSearch({
      query: bannerQuery,
      address: bannerAddress,
      category: bannerCategory
    });
  };

  // Logic lọc dữ liệu sân hiển thị nhanh ở trang chủ theo Tabs
  const homeFilteredFields = MOCK_FIELDS.filter(court => {
    const categoryName = getNameBySlug(homeCategory);
    return homeCategory === 'all' || court.sport.toLowerCase() === categoryName?.toLowerCase();
  });

  const filteredPitches = dbPitches.filter(pitch => {
    const categoryName = getNameBySlug(pitchCategory);
    return pitchCategory === 'all' || pitch.category.toLowerCase().includes(categoryName?.toLowerCase());
  });

  return (
    <div className="min-h-screen sz-page flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* 1. THANH NAV DÙNG CHUNG */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* 2. HERO SECTION LUNG LINH ĐIỆN ẢNH VỚI BANNER TÌM KIẾM */}
      <section 
        className="relative min-h-[620px] flex items-center justify-start text-left px-6 sm:px-12 lg:px-24 bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: "url('/stadium_hero_bg.png')" 
        }}
      >
        <div className="absolute inset-0 sz-hero-vignette z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(20,184,166,0.18),transparent_28rem)] z-10"></div>

        <div className="relative z-20 max-w-4xl space-y-6 pt-12 pb-12" data-aos="fade-right" data-aos-duration="1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-full text-xs font-semibold uppercase">
            <span>Modern Sport Booking Platform</span>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight m-0 text-white font-sans">
            Đặt sân nhanh hơn, quản lý lịch chơi rõ hơn
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Tìm sân phù hợp, xem lịch trống theo thời gian thực và hoàn tất giữ chỗ chỉ trong vài bước.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a href="#courts-list">
              <Button 
                variant="primary" 
                className="px-7 py-3.5 bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-sm font-extrabold rounded-lg shadow-lg shadow-teal-600/20 text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <CalendarDays className="w-4.5 h-4.5" />
                Book a Court
              </Button>
            </a>

            <Button 
              variant="secondary"
              className="px-7 py-3.5 bg-white/8 border border-white/15 hover:bg-white/12 active:scale-[0.98] text-sm font-extrabold rounded-lg text-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Building2 className="w-4.5 h-4.5 text-emerald-300" /> List your Venue
            </Button>
          </div>

          {/* THANH TÌM KIẾM GỌN GÀNG PILL-SHAPED NẰM TRONG BANNER */}
          <div className="pt-6 w-full max-w-3xl">
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

          <div className="grid grid-cols-3 gap-3 max-w-xl pt-2">
            {[
              ['320+', 'Lượt đặt/tháng'],
              ['4.9/5', 'Đánh giá trung bình'],
              ['30s', 'Giữ chỗ nhanh'],
            ].map(([value, label]) => (
              <div key={label} className="sz-kpi p-3">
                <span className="block text-lg font-black text-white">{value}</span>
                <span className="block text-[10px] font-semibold text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECTION: TẠI SAO CHỌN CHÚNG TÔI (PRO ADVANTAGES) */}
      <section className="bg-slate-900/30 border-y border-slate-900/60 py-16 backdrop-blur-md text-left" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <Badge status="info">Pro Advantages</Badge>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
              Trải Nghiệm Đặt Sân Đẳng Cấp Nhất
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Chúng tôi cung cấp giải pháp chuyển đổi số toàn diện cho chủ sân và tuyển thủ thể thao.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="sz-card p-6 space-y-4 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white m-0">Đặt Sân Real-time</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Xem lịch trống chính xác từng phút, đặt lịch nhanh chóng chỉ trong 30 giây, loại bỏ hoàn toàn việc trùng giờ chơi của bạn.
              </p>
            </div>

            <div className="sz-card p-6 space-y-4 transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white m-0">Chất Lượng Kiểm Duyệt</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tất cả sân bóng, sân cầu lông, tennis trên hệ thống đều được xác minh chất lượng thực tế, cơ sở vật chất luôn đạt chuẩn.
              </p>
            </div>

            <div className="sz-card p-6 space-y-4 transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-400">
                <BadgePercent className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white m-0">Ưu Đãi Độc Quyền</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tích điểm thành viên tự động, tham gia các khung giờ vàng giảm giá để chơi thể thao thỏa thích với chi phí rẻ nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: SÂN ĐẤU NỔI BẬT (FEATURED SPORTS PITCHES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4 space-y-10" data-aos="fade-up">
        
        <div className="text-center max-w-xl mx-auto space-y-3">
          <Badge status="info">Featured Pitches</Badge>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
            Sân Đấu Tiêu Biểu & Khung Giờ Đẹp
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Tìm kiếm sân đấu chất lượng cao theo nhu cầu chơi đơn, chơi đôi hay đội nhóm.
          </p>
        </div>

        {/* Categories/Tabs lọc Sân đấu (từ DB) */}
        <div className="flex justify-center gap-2 flex-wrap">
          {/* Nút Tất cả */}
          <button
            onClick={() => setPitchCategory('all')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              pitchCategory === 'all'
                ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-md shadow-teal-500/5 font-extrabold'
                : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" /> Tất cả
          </button>
          {/* Các tab từ DB */}
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setPitchCategory(cat.slug)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                pitchCategory === cat.slug
                  ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-md shadow-teal-500/5 font-extrabold'
                  : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Danh sách Sân đấu */}
        {filteredPitches.length === 0 ? (
          <div className="py-12 bg-slate-900/30 border border-slate-900 rounded-3xl text-center text-xs text-slate-500">
            Hiện chưa có sân đấu nào được đăng tải cho bộ môn này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPitches.slice(0, 8).map((pitch) => {
              const image = getPitchImage(pitch);
              return (
                <div 
                  key={pitch.id}
                  className="sz-card-lift bg-slate-900/50 border border-slate-800 hover:border-teal-500/35 transition-all duration-300 rounded-lg overflow-hidden flex flex-col justify-between group shadow-lg"
                >
                  {/* Ảnh và tag */}
                  <div className="sz-card-media overflow-hidden relative">
                    <img 
                      src={image} 
                      alt={pitch.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    
                    {/* Category Tag */}
                    <span className="absolute top-3 right-3 text-[9px] font-black px-2.5 py-1 bg-teal-500 text-slate-950 rounded-lg uppercase tracking-wider border-0">
                      {pitch.category}
                    </span>
                  </div>

                  {/* Thông tin */}
                  <div className="p-5 flex-grow space-y-3.5 text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-teal-400 block uppercase tracking-widest">{pitch.subType || 'Tiêu chuẩn'}</span>
                      <h4 className="text-sm font-black text-slate-200 group-hover:text-white transition line-clamp-1 m-0">{pitch.name}</h4>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="line-clamp-1 font-semibold text-slate-300">{pitch.locationName || 'Cơ sở thành viên'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{pitch.locationDistrict ? `${pitch.locationDistrict}, ` : ''}{pitch.locationCity || ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Giá và nút */}
                  <div className="px-5 pb-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Đơn giá / giờ</span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {(Number(pitch.basePricePerHour) || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate?.('field-details', { locationId: pitch.locationId, courtId: pitch.id })}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-[10px] font-extrabold text-white rounded-xl transition shadow-md shadow-teal-600/10 cursor-pointer border-0"
                    >
                      Đặt Lịch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. PHẦN TÌM SÂN (CATEGORIES & FIELD LIST) */}
      <section id="courts-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12" data-aos="fade-up">
        
        <div className="text-center max-w-xl mx-auto space-y-3">
          <Badge status="success">Featured Venue</Badge>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
            Khám Phá Các Sân Thể Thao Cao Cấp
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Hệ thống sân đấu đạt tiêu chuẩn thi đấu chuyên nghiệp với đầy đủ tiện ích đi kèm.
          </p>
        </div>

        {/* Gọi thanh phân loại môn học (Lọc nhanh trang chủ) */}
        <CategoryList selectedCategory={homeCategory} onSelectCategory={setHomeCategory} />

        {/* Gọi danh sách sân đấu */}
        <FieldList fields={homeFilteredFields} onNavigate={onNavigate} />
      </section>

      {/* 5. SECTION: QUY TRÌNH ĐẶT SÂN (SIMPLE PROCESS) */}
      <section className="bg-slate-900/10 border-t border-slate-900 py-16 text-left" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <Badge status="success">Simple Process</Badge>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
              Đặt Sân Dễ Dàng Với 3 Bước
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Quy trình được tối ưu hóa tối đa giúp bạn đặt sân nhanh mà không mất công gọi điện thoại check lịch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines on desktop */}
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-slate-800 to-emerald-500/20 -translate-y-1/2 z-0"></div>

            {/* Step 1 */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 relative z-10 text-center hover:border-emerald-500/25 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 font-extrabold text-sm flex items-center justify-center mx-auto border border-emerald-500/20">
                1
              </div>
              <h4 className="text-base font-bold text-white m-0">Tìm Sân Cận Địa Điểm</h4>
              <p className="text-xs text-slate-450 leading-relaxed max-w-xs mx-auto">
                Sử dụng bộ lọc thông minh ở banner để chọn khu vực, từ khóa hoặc bộ môn bạn yêu thích chỉ với 1 click.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 relative z-10 text-center hover:border-emerald-500/25 transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 font-extrabold text-sm flex items-center justify-center mx-auto border border-emerald-500/20">
                2
              </div>
              <h4 className="text-base font-bold text-white m-0">Chọn Ca & Khung Giờ</h4>
              <p className="text-xs text-slate-455 leading-relaxed max-w-xs mx-auto">
                Xem lịch trống trực quan của sân đấu, chọn ca chơi sáng, chiều, tối hoặc ca vàng phù hợp với thời gian biểu của bạn.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 relative z-10 text-center hover:border-emerald-500/25 transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 font-extrabold text-sm flex items-center justify-center mx-auto border border-emerald-500/20">
                3
              </div>
              <h4 className="text-base font-bold text-white m-0">Đặt Chỗ & Xác Nhận</h4>
              <p className="text-xs text-slate-460 leading-relaxed max-w-xs mx-auto">
                Nhận ngay mã đặt sân QR code tiện lợi, dễ dàng quét check-in khi đến sân thi đấu và thanh toán linh hoạt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: Ý KIẾN KHÁCH HÀNG (PLAYER TESTIMONIALS) */}
      <section className="bg-slate-900/30 border-t border-slate-900 py-16 text-left" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <Badge status="info">Testimonials</Badge>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
              Đánh Giá Từ Các Tuyển Thủ
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Hàng ngàn người chơi thể thao nghiệp dư và chuyên nghiệp đã tin tưởng dịch vụ của chúng tôi.
            </p>
          </div>

          <ErrorBoundary fallback={
            <div className="py-12 bg-slate-900/30 border border-slate-800 rounded-3xl text-center text-xs text-slate-500">
              💬 Không thể tải các đánh giá của tuyển thủ lúc này.
            </div>
          }>
            <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="w-full pb-12"
          >
            {/* Slide 1 */}
            <SwiperSlide>
              <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl space-y-4 flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300 h-[220px] text-left">
                <p className="text-xs text-slate-400 leading-relaxed italic m-0">
                  "Tôi đặt sân cỏ nhân tạo cho công ty đá bóng hàng tuần qua app này. Lịch lúc nào cũng chính xác tuyệt đối, lại hay săn được mã giảm giá ca vàng lúc 17:30 rất rẻ!"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                  <span className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-sm shrink-0">⚽</span>
                  <div className="text-left">
                    <strong className="text-xs text-slate-200 block">Trần Quốc Hùng</strong>
                    <span className="text-[10px] text-slate-500 block">Đội trưởng FC Rainbow</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 2 */}
            <SwiperSlide>
              <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl space-y-4 flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300 h-[220px] text-left">
                <p className="text-xs text-slate-400 leading-relaxed italic m-0">
                  "Hệ thống đặt sân quá tiện lợi. Thích nhất là tính năng tìm teamparty ghép đôi giao lưu cầu lông. Vừa tìm được sân đẹp lại vừa giao lưu thêm được nhiều người chơi khác đam mê."
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                  <span className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-sm shrink-0">🏸</span>
                  <div className="text-left">
                    <strong className="text-xs text-slate-200 block">Nguyễn Thị Linh Chi</strong>
                    <span className="text-[10px] text-slate-500 block">Tuyển thủ Cầu Lông bán chuyên</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 3 */}
            <SwiperSlide>
              <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl space-y-4 flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300 h-[220px] text-left">
                <p className="text-xs text-slate-400 leading-relaxed italic m-0">
                  "Sân Tennis Phú Mỹ Hưng là sân quen của tôi nhưng trước kia gọi điện đặt giờ rất khó khăn. Từ khi dùng app này, tôi có thể xem ngay lịch trống các ngày cuối tuần để book thẳng tiện lợi vô cùng."
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                  <span className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-sm shrink-0">🎾</span>
                  <div className="text-left">
                    <strong className="text-xs text-slate-200 block">Lê Huy Hoàng</strong>
                    <span className="text-[10px] text-slate-500 block">Hội tennis Quận 7</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
          </ErrorBoundary>
        </div>
      </section>

      {/* 4. CHÂN TRANG DÙNG CHUNG */}
      <Footer />

    </div>
  );
};

