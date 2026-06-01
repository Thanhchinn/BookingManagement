import React from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { SearchBar } from '../../../features/sports-field/components/SearchBar';
import { CategoryList } from '../../../features/sports-field/components/CategoryList';
import { FieldList, MOCK_FIELDS } from '../../../features/sports-field/components/FieldList';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

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

// Bảng ánh xạ từ ID Category sang tên Tiếng Việt trong dữ liệu Mock
const CATEGORY_MAP: Record<string, string> = {
  'football': 'Bóng Đá',
  'badminton': 'Cầu Lông',
  'tennis': 'Tennis'
};

export const Search: React.FC<SearchProps> = ({
  onNavigate,
  userName,
  onLogout,
  searchFilters,
  onUpdateFilters,
}) => {
  const { query, address, category } = searchFilters;

  // Cập nhật từng bộ lọc
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

  // Logic lọc dữ liệu sân
  const filteredFields = MOCK_FIELDS.filter(court => {
    // 1. Từ khóa
    const matchesSearch = query.trim() === '' || 
      court.title.toLowerCase().includes(query.toLowerCase()) ||
      court.location.toLowerCase().includes(query.toLowerCase()) ||
      court.sport.toLowerCase().includes(query.toLowerCase());

    // 2. Địa chỉ
    const matchesAddress = address === 'all' || 
      court.location.toLowerCase().includes(address.toLowerCase());

    // 3. Danh mục
    const categoryName = CATEGORY_MAP[category];
    const matchesCategory = category === 'all' || 
      court.sport.toLowerCase() === categoryName?.toLowerCase();

    return matchesSearch && matchesAddress && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* 1. THANH NAV DÙNG CHUNG */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* 2. MAIN HUB TÌM KIẾM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-10 text-left">
        
        {/* Nút quay lại trang chủ và Tiêu đề */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="space-y-2">
            <button
              onClick={() => onNavigate?.('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang chủ
            </button>
            <h2 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              Kết Quả Tìm Kiếm Sân Đấu
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Khám phá và đặt các sân thể thao cao cấp phù hợp với yêu cầu của bạn.
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            {filteredFields.length > 0 ? (
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                Tìm thấy {filteredFields.length} sân đấu phù hợp
              </span>
            ) : (
              <span className="text-xs font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full">
                Không có kết quả trùng khớp
              </span>
            )}
          </div>
        </div>

        {/* 3. THANH TÌM KIẾM CO GỌN NỔI BẬT */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md flex justify-center">
          <SearchBar
            searchQuery={query}
            onSearchChange={handleQueryChange}
            selectedAddress={address}
            onAddressChange={handleAddressChange}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            onSearchSubmit={() => {}} // Đã tự động lọc real-time trên trang tìm kiếm
          />
        </div>

        {/* 4. TABS BỘ MÔN (CATEGORY LIST) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Phân Loại Theo Bộ Môn</span>
            {(query !== '' || address !== 'all' || category !== 'all') && (
              <button
                onClick={handleReset}
                className="text-xs font-bold text-rose-400 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
          <CategoryList selectedCategory={category} onSelectCategory={handleCategoryChange} />
        </div>

        {/* 5. DANH SÁCH SÂN ĐẤU (FIELD LIST) */}
        <div className="space-y-6 pt-4">
          <FieldList fields={filteredFields} />
        </div>

      </div>

      {/* 6. CHÂN TRANG DÙNG CHUNG */}
      <Footer />

    </div>
  );
};
export default Search;
