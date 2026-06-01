import React, { useState } from 'react';
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

// Bảng ánh xạ từ ID Category sang tên Tiếng Việt trong dữ liệu Mock
const CATEGORY_MAP: Record<string, string> = {
  'football': 'Bóng Đá',
  'badminton': 'Cầu Lông',
  'tennis': 'Tennis'
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
    const categoryName = CATEGORY_MAP[homeCategory];
    return homeCategory === 'all' || court.sport.toLowerCase() === categoryName?.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* 1. THANH NAV DÙNG CHUNG */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* 2. HERO SECTION LUNG LINH ĐIỆN ẢNH VỚI BANNER TÌM KIẾM */}
      <section 
        className="relative min-h-[640px] flex items-center justify-start text-left px-6 sm:px-12 lg:px-24 bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: "url('/stadium_hero_bg.png')" 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-slate-950/40 z-10"></div>

        <div className="relative z-20 max-w-4xl space-y-6 pt-12 pb-12" data-aos="fade-right" data-aos-duration="1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold tracking-wider uppercase">
            <span>Professional Booking Platform</span>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight m-0 text-white font-sans">
            Elevate Your Facility To{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 drop-shadow-[0_2px_10px_rgba(52,211,153,0.2)]">
              Pro Level
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            The elite platform for facility owners and athletes. Seamlessly manage bookings, 
            membership cycles, and professional coaching schedules in one centralized hub.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a href="#courts-list">
              <Button 
                variant="primary" 
                className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-sm font-extrabold rounded-xl shadow-lg shadow-emerald-600/20 text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book a Court
              </Button>
            </a>

            <Button 
              variant="secondary"
              className="px-7 py-3.5 bg-slate-900/60 border border-slate-700/50 hover:bg-slate-800/80 active:scale-95 text-sm font-extrabold rounded-xl text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="text-emerald-400 text-base font-bold">+</span> List your Venue
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
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-emerald-500/20 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-400">
                ⚡
              </div>
              <h4 className="text-lg font-bold text-white m-0">Đặt Sân Real-time</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Xem lịch trống chính xác từng phút, đặt lịch nhanh chóng chỉ trong 30 giây, loại bỏ hoàn toàn việc trùng giờ chơi của bạn.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-emerald-500/20 transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-400">
                ⭐
              </div>
              <h4 className="text-lg font-bold text-white m-0">Chất Lượng Kiểm Duyệt</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tất cả sân bóng, sân cầu lông, tennis trên hệ thống đều được xác minh chất lượng thực tế, cơ sở vật chất luôn đạt chuẩn.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-emerald-500/20 transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-400">
                💰
              </div>
              <h4 className="text-lg font-bold text-white m-0">Ưu Đãi Độc Quyền</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tích điểm thành viên tự động, tham gia các khung giờ vàng giảm giá để chơi thể thao thỏa thích với chi phí rẻ nhất.
              </p>
            </div>
          </div>
        </div>
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
        <FieldList fields={homeFilteredFields} />
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
        </div>
      </section>

      {/* 4. CHÂN TRANG DÙNG CHUNG */}
      <Footer />

    </div>
  );
};

