import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

// ============================================================================
// KHAI BÁO COMPONENT NAVBAR (THANH ĐIỀU HƯỚNG TRÊN CÙNG)
// ============================================================================
interface NavbarProps {
  onNavigate?: (page: 'home' | 'auth' | 'admin' | 'partner', authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, userName, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      {/* 
        - sticky top-0: Giữ thanh điều hướng cố định trên cùng khi cuộn trang (giống position: sticky)
        - bg-white/80 backdrop-blur-md: Tạo hiệu ứng nền kính mờ (Glassmorphism) cực kỳ sang trọng
        - border-b: Đường viền mỏng ở dưới đáy
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* ==========================================
            1. PHẦN TRÁI: LOGO & TÊN THƯƠNG HIỆU
            ========================================== */}
        <div 
          onClick={() => {
            onNavigate?.('home');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          {/* Biểu tượng logo thể thao */}
          <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-md shadow-emerald-500/20 text-lg transition-transform group-hover:scale-110 duration-200">
            🏆
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 tracking-tight">SportZone</span>
            {/* Nhãn Real-time nhấp nháy báo trạng thái trực tuyến */}
            <span className="ml-2 inline-flex items-center text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full inline-block animate-ping"></span>
              Live
            </span>
          </div>
        </div>

        {/* ==========================================
            2. PHẦN GIỮA: CÁC ĐƯỜNG DẪN ĐIỀU HƯỚNG (DESKTOP)
            ========================================== */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-600">
          <button 
            onClick={() => onNavigate?.('home')}
            className="text-emerald-600 hover:text-emerald-700 transition duration-150 bg-transparent border-0 cursor-pointer p-0 font-bold text-sm"
          >
            Đặt Sân Thể Thao
          </button>
          <a 
            href="#my-bookings" 
            className="hover:text-slate-900 transition duration-150"
          >
            Lịch Hẹn Của Tôi
          </a>
          <a 
            href="#rules" 
            className="hover:text-slate-900 transition duration-150"
          >
            Quy Định Đặt Sân
          </a>
          <button 
            onClick={() => onNavigate?.('partner')}
            className="hover:text-slate-900 transition duration-150 flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 font-bold text-sm text-slate-600"
          >
            Dành Cho Chủ Sân
            <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold">
              Partner
            </span>
          </button>
        </div>

        {/* ==========================================
            3. PHẦN PHẢI: ĐĂNG NHẬP / ĐĂNG KÝ & HAMBURGER TRÊN MOBILE
            ========================================== */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Nút Đăng nhập/Đăng xuất/Quản trị */}
          <div className="flex items-center space-x-2">
            {userName ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {userName.includes('Admin') && (
                  <button 
                    onClick={() => {
                      onNavigate?.('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-[11px] sm:text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-2.5 sm:px-3.5 py-2 rounded-xl transition duration-150 shadow-md shadow-emerald-600/10 cursor-pointer border-0 flex items-center gap-1"
                  >
                    ⚙️ Quản Trị
                  </button>
                )}
                <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                  Xin chào, <strong className="text-slate-900 font-bold">{userName}</strong>
                </span>
                <button 
                  onClick={() => {
                    onLogout?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-600 px-2 sm:px-3 py-2 rounded-xl hover:bg-red-50 transition duration-150 cursor-pointer bg-transparent border-0"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={() => onNavigate?.('auth', 'login')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 sm:px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition duration-150 cursor-pointer bg-transparent border-0"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => onNavigate?.('auth', 'register')}
                  className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 px-3 sm:px-4.5 py-2.5 rounded-xl transition-all duration-150 shadow-md shadow-slate-900/10 cursor-pointer border-0"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>

          {/* Nút Hamburger menu toggle (Chỉ hiện dưới MD) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer border-0 transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* ==========================================
          4. MENU THẢ XUỐNG DÀNH CHO DI ĐỘNG (MOBILE DROPDOWN)
          ========================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 flex flex-col text-left transition-all duration-200">
          <button 
            onClick={() => {
              onNavigate?.('home');
              setIsMobileMenuOpen(false);
            }}
            className="text-emerald-600 hover:text-emerald-700 font-bold text-sm bg-transparent border-0 cursor-pointer p-0 text-left"
          >
            Đặt Sân Thể Thao
          </button>
          <a 
            href="#my-bookings" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-600 hover:text-slate-900 font-bold text-sm"
          >
            Lịch Hẹn Của Tôi
          </a>
          <a 
            href="#rules" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-600 hover:text-slate-900 font-bold text-sm"
          >
            Quy Định Đặt Sân
          </a>
          <button 
            onClick={() => {
              onNavigate?.('partner');
              setIsMobileMenuOpen(false);
            }}
            className="text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0 text-left"
          >
            Dành Cho Chủ Sân
            <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold">
              Partner
            </span>
          </button>
        </div>
      )}

    </nav>
  );
};
