import React, { useState, useEffect } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { SearchBar } from '../../../features/sports-field/components/SearchBar';
import { CategoryList } from '../../../features/sports-field/components/CategoryList';
import { 
  Sparkles, ArrowLeft, MapPin, Star, ShieldCheck, Clock, 
  ArrowRight, Flame, Filter, Navigation, Phone, 
  Compass, Zap, Wifi, Car
} from 'lucide-react';
import { useCategories } from '../../../hooks/useCategories';

interface SearchProps {
  onNavigate?: (page: any, authMode?: any) => void;
  userName?: string;
  onLogout?: () => void;
  searchFilters: {
    query: string;
    address: string;
    category: string;
  };
  onUpdateFilters: (filters: { query: string; address: string; category: string }) => void;
}

const API = 'http://localhost:3000';

// Mock time-slots cho dải Time-slot Availability Strip trên từng card
const MOCK_SLOT_STRIP = [
  { time: '06:00', price: '120k', isHot: false, isBooked: true },
  { time: '07:30', price: '120k', isHot: false, isBooked: false },
  { time: '16:00', price: '150k', isHot: false, isBooked: false },
  { time: '17:30', price: '180k', isHot: true, isBooked: false },
  { time: '19:00', price: '180k', isHot: true, isBooked: false },
  { time: '20:30', price: '140k', isHot: false, isBooked: false },
];

export const Search: React.FC<SearchProps> = ({
  onNavigate,
  userName,
  onLogout,
  searchFilters,
  onUpdateFilters,
}) => {
  const { query, address, category } = searchFilters;
  const [filteredFields, setFilteredFields] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'rating'>('featured');
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách bộ môn từ DB
  const { getNameBySlug } = useCategories();

  // Gọi API lấy danh sách đã lọc từ backend
  useEffect(() => {
    setIsLoading(true);
    const categoryName = getNameBySlug(category);
    const params = new URLSearchParams();
    if (query.trim()) params.append('search', query.trim());
    if (address && address !== 'all') params.append('city', address);
    if (categoryName && category !== 'all') params.append('category', categoryName);

    fetch(`${API}/public/locations?${params.toString()}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        let mapped = data.map((loc: any) => {
          const prices = loc.services?.map((s: any) => Number(s.basePricePerHour) || 0) || [];
          const minPrice = prices.length > 0 ? Math.min(...prices) : 120000;
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 180000;
          const sports = Array.from(new Set(loc.services?.map((s: any) => s.category) || []));
          const sportLabel = sports.join(', ') || 'Thể thao đa năng';
          
          return {
            id: loc.id,
            title: loc.name,
            location: `${loc.district || 'Bình Thạnh'}, ${loc.city || 'TP. HCM'}`,
            address: loc.address || 'Khu phức hợp thể thao',
            priceRaw: minPrice,
            price: minPrice === maxPrice ? `${minPrice.toLocaleString()}đ` : `${minPrice.toLocaleString()}đ - ${maxPrice.toLocaleString()}đ`,
            rating: loc.rating || 4.9,
            image: loc.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
            sport: sportLabel,
            totalCourts: loc.services?.length || 4,
            phone: loc.partner?.user?.phone || '0901 234 567',
            amenities: ['Wifi tốc độ cao', 'Bãi đỗ ô tô', 'Máy lạnh / Đèn LED', 'Phòng thay đồ']
          };
        });

        // Áp dụng bộ lọc sắp xếp (Sorting)
        if (sortBy === 'price_asc') {
          mapped = [...mapped].sort((a, b) => a.priceRaw - b.priceRaw);
        } else if (sortBy === 'rating') {
          mapped = [...mapped].sort((a, b) => b.rating - a.rating);
        }

        setFilteredFields(mapped);
        if (mapped.length > 0 && !selectedVenue) {
          setSelectedVenue(mapped[0]);
        }
      })
      .catch(() => {
        setFilteredFields([]);
      })
      .finally(() => setIsLoading(false));
  }, [query, address, category, sortBy, getNameBySlug]);

  const handleQueryChange = (val: string) => {
    onUpdateFilters({ ...searchFilters, query: val });
  };

  const handleAddressChange = (val: string) => {
    onUpdateFilters({ ...searchFilters, address: val });
  };

  const handleCategoryChange = (val: string) => {
    onUpdateFilters({ ...searchFilters, category: val });
  };

  const handleReset = () => {
    onUpdateFilters({ query: '', address: 'all', category: 'all' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 overflow-x-hidden selection:bg-emerald-500/30 selection:text-zinc-50">
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* 1. HEADER CO GỌN & THANH COMMAND BAR */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('home')}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition cursor-pointer"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-50 tracking-tight flex items-center gap-2 m-0">
                <Compass className="w-5 h-5 text-emerald-400" />
                <span>Đặt Sân Thể Thao ProZone</span>
              </h1>
              <span className="text-[11px] text-zinc-400 font-medium">
                Tìm thấy <strong className="text-emerald-400 font-mono">{filteredFields.length}</strong> cơ sở hoạt động
              </span>
            </div>
          </div>

          {/* Quick Command Bar */}
          <div className="flex-1 max-w-2xl">
            <SearchBar
              searchQuery={query}
              onSearchChange={handleQueryChange}
              selectedAddress={address}
              onAddressChange={handleAddressChange}
              selectedCategory={category}
              onCategoryChange={handleCategoryChange}
              onSearchSubmit={() => {}}
            />
          </div>

        </div>
      </div>

      {/* 2. MAIN CONTENT - INTELLIGENT SPLIT-VIEW (VISUAL_DENSITY: 6, DESIGN_VARIANCE: 4) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
        
        {/* Category Tabs Strip */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 gap-3">
          <div className="flex-1 overflow-x-auto scrollbar-none">
            <CategoryList selectedCategory={category} onSelectCategory={handleCategoryChange} />
          </div>
          
          {(query !== '' || address !== 'all' || category !== 'all') && (
            <button
              onClick={handleReset}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer shrink-0 ml-2"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Sorting & Filter Bar */}
        <div className="flex items-center justify-between py-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Sắp xếp theo:</span>
            <div className="flex gap-1.5">
              {[
                { key: 'featured', label: 'Nổi bật nhất' },
                { key: 'price_asc', label: 'Giá tốt nhất' },
                { key: 'rating', label: 'Đánh giá cao' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    sortBy === s.key
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[11px] text-zinc-500 hidden sm:inline font-mono">
            Hiển thị ma trận ca trống thời gian thực
          </span>
        </div>

        {/* SPLIT VIEW CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI (7 COLS): DANH SÁCH SÂN VỚI TIME-SLOT AVAILABILITY STRIP */}
          <div className="lg:col-span-7 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 animate-pulse space-y-3">
                    <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                    <div className="h-3 bg-zinc-800/60 rounded w-1/2"></div>
                    <div className="h-8 bg-zinc-800/40 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredFields.length === 0 ? (
              <div className="sz-empty py-16 px-6 text-center space-y-3 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-zinc-200 m-0">Không tìm thấy sân đấu phù hợp</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Vui lòng thử chọn bộ môn khác hoặc xóa các điều kiện tìm kiếm khu vực hiện tại.
                </p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl shadow cursor-pointer mt-2"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              filteredFields.map(venue => {
                const isSelected = selectedVenue?.id === venue.id;
                return (
                  <div
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue)}
                    className={`bg-zinc-900/85 backdrop-blur-md border rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer group hover:shadow-xl ${
                      isSelected
                        ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 bg-zinc-900'
                        : 'border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Top Row: Thumbnail + Info */}
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-950 shrink-0 relative">
                        <img 
                          src={venue.image} 
                          alt={venue.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold text-amber-300 flex items-center gap-1 border border-zinc-800">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{venue.rating}</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm sm:text-base font-black text-zinc-50 group-hover:text-emerald-400 transition-colors line-clamp-1 m-0">
                            {venue.title}
                          </h3>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                            {venue.totalCourts} Sân Đấu
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="line-clamp-1">{venue.location}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Từ:</span>
                            <span className="text-sm font-black text-emerald-400 font-mono">{venue.price}</span>
                          </div>

                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                            {venue.sport}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* TIME-SLOT AVAILABILITY STRIP (Thanh trượt khung giờ trống trực quan) */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ca trống hôm nay (Click để chọn):</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">Real-time update</span>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
                        {MOCK_SLOT_STRIP.map((slot, idx) => (
                          <button
                            key={idx}
                            disabled={slot.isBooked}
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate?.('field-details', { locationId: venue.id });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                              slot.isBooked
                                ? 'bg-zinc-950/60 border-zinc-800/40 text-zinc-600 line-through cursor-not-allowed'
                                : slot.isHot
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 shadow-sm'
                                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            <span>{slot.time}</span>
                            <span className="text-[10px] opacity-75">({slot.price})</span>
                            {slot.isHot && <Flame className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />}
                          </button>
                        ))}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate?.('field-details', { locationId: venue.id });
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Xem tất cả</span>
                          <ArrowRight className="w-3 h-3 text-emerald-400" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* CỘT PHẢI (5 COLS): STICKY RADAR MAP & KHUNG TÓM TẮT ĐẶT SÂN NHANH */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28 self-start space-y-5">
            
            {/* Interactive Area Map / Radar Visual */}
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>Bản Đồ Cụm Sân Thể Thao</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  GPS LIVE
                </span>
              </div>

              {/* Simulated Tactical Map Canvas */}
              <div className="h-56 bg-zinc-950 rounded-2xl relative overflow-hidden border border-zinc-800/80 flex items-center justify-center p-4">
                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                
                {/* Radar Sweep Animation */}
                <div className="absolute w-44 h-44 rounded-full border border-emerald-500/20 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-emerald-500/30"></div>
                </div>

                {/* Simulated Pins */}
                <div className="absolute top-1/4 left-1/3 flex flex-col items-center group/pin cursor-pointer">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/30 animate-pulse"></div>
                  <span className="text-[9px] font-bold text-emerald-300 bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 rounded mt-1 shadow">Bình Thạnh</span>
                </div>

                <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center group/pin cursor-pointer">
                  <div className="w-3 h-3 rounded-full bg-teal-400 ring-4 ring-teal-500/30"></div>
                  <span className="text-[9px] font-bold text-zinc-300 bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 rounded mt-1 shadow">Quận 2</span>
                </div>

                <div className="absolute top-1/2 right-1/3 flex flex-col items-center group/pin cursor-pointer">
                  <div className="w-3 h-3 rounded-full bg-lime-400 ring-4 ring-lime-500/30"></div>
                  <span className="text-[9px] font-bold text-zinc-300 bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 rounded mt-1 shadow">Quận 7</span>
                </div>

                {/* Map Center Badge */}
                <div className="relative z-10 text-center bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl shadow backdrop-blur-md">
                  <span className="text-[11px] font-black text-zinc-200 block">TP. Hồ Chí Minh</span>
                  <span className="text-[9px] text-emerald-400 font-mono">Bán kính quét: 10km</span>
                </div>
              </div>
            </div>

            {/* Quick Book Preview Drawer / Sticky Summary Card */}
            {selectedVenue && (
              <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl text-left space-y-4 animate-fade-in-up">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                      Tóm tắt cơ sở đã chọn
                    </span>
                    <h3 className="text-base font-black text-zinc-100 m-0 line-clamp-1">{selectedVenue.title}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ⭐ {selectedVenue.rating}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 m-0">
                  {selectedVenue.address}, {selectedVenue.location}
                </p>

                {/* Tiện ích nhanh */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Wifi miễn phí</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bãi đỗ ô tô & xe máy</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mặt sân chuẩn đấu</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono">{selectedVenue.phone}</span>
                  </div>
                </div>

                {/* Chính sách hoàn hủy */}
                <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Bảo hiểm giờ chơi 100%</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 m-0">
                    Hỗ trợ dời ca hoặc hoàn tiền miễn phí khi thông báo trước 6 tiếng thi đấu.
                  </p>
                </div>

                {/* Direct CTA */}
                <button
                  onClick={() => onNavigate?.('field-details', { locationId: selectedVenue.id })}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Chọn Ca & Khóa Slot Ngay (30s)</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Search;
