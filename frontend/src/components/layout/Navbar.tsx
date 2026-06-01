import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';

// ============================================================================
// KHAI BÁO COMPONENT NAVBAR (THANH ĐIỀU HƯỚNG TRÊN CÙNG)
// ============================================================================
interface NavbarProps {
  onNavigate?: (page: 'home' | 'auth' | 'admin' | 'partner' | 'my-bookings' | 'field-details' | 'booking-success' | 'matchmaking' | 'chat', authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, userName, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-850 text-slate-100 transition-colors duration-300">
      {/* 
        - sticky top-0: Giữ thanh điều hướng cố định trên cùng khi cuộn trang (giống position: sticky)
        - bg-slate-900/80 backdrop-blur-md: Tạo hiệu ứng nền kính mờ (Glassmorphism) cực kỳ sang trọng
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
            <span className="text-lg font-black text-slate-100 tracking-tight">SportZone</span>
            {/* Nhãn Real-time nhấp nháy báo trạng thái trực tuyến */}
            <span className="ml-2 inline-flex items-center text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20">
              <span className="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full inline-block animate-ping"></span>
              Live
            </span>
          </div>
        </div>

        {/* ==========================================
            2. PHẦN GIỮA: CÁC ĐƯỜNG DẪN ĐIỀU HƯỚNG (DESKTOP)
            ========================================== */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-300">
          <button 
            onClick={() => onNavigate?.('home')}
            className="text-emerald-400 hover:text-emerald-500 transition duration-150 bg-transparent border-0 cursor-pointer p-0 font-bold text-sm"
          >
            Đặt Sân Thể Thao
          </button>
          
          <button 
            onClick={() => onNavigate?.('my-bookings')}
            className="hover:text-slate-100 transition duration-150 bg-transparent border-0 cursor-pointer p-0 font-bold text-sm text-slate-300"
          >
            Lịch Hẹn Của Tôi
          </button>

          <button 
            onClick={() => onNavigate?.('matchmaking')}
            className="hover:text-slate-100 transition duration-150 bg-transparent border-0 cursor-pointer p-0 font-bold text-sm text-slate-300"
          >
            Cộng Đồng Ghép Đội
          </button>

          <button 
            onClick={() => onNavigate?.('chat')}
            className="hover:text-slate-100 transition duration-150 bg-transparent border-0 cursor-pointer p-0 font-bold text-sm text-slate-300"
          >
            Tin Nhắn
          </button>

          <button 
            onClick={() => onNavigate?.('partner')}
            className="hover:text-slate-100 transition duration-150 flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0 font-bold text-sm text-slate-300"
          >
            Dành Cho Chủ Sân
            <span className="bg-slate-850 text-slate-300 text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold border border-slate-800">
              Partner
            </span>
          </button>
        </div>

        {/* ==========================================
            3. PHẦN PHẢI: ĐĂNG NHẬP / ĐĂNG KÝ & HAMBURGER TRÊN MOBILE
            ========================================== */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Nút Đổi màu giao diện (Theme Toggle) */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-slate-850/60 text-slate-400 hover:text-emerald-400 transition-all duration-200 cursor-pointer border-0 bg-transparent flex items-center justify-center shrink-0"
            title="Đổi giao diện Sáng/Tối"
          >
            {theme === 'light' ? (
              <Moon className="w-4.5 h-4.5 text-slate-400" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-amber-450" />
            )}
          </button>

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
                <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                  Xin chào, <strong className="text-slate-100 font-bold">{userName}</strong>
                </span>
                <button 
                  onClick={() => {
                    onLogout?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-400 hover:text-red-500 px-2 sm:px-3 py-2 rounded-xl hover:bg-red-500/10 transition duration-150 cursor-pointer bg-transparent border-0"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={() => onNavigate?.('auth', 'login')}
                  className="text-xs font-bold text-slate-300 hover:text-slate-100 px-2.5 sm:px-3.5 py-2.5 rounded-xl hover:bg-slate-850/60 transition duration-150 cursor-pointer bg-transparent border-0"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => onNavigate?.('auth', 'register')}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3 sm:px-4.5 py-2.5 rounded-xl transition-all duration-150 shadow-md shadow-emerald-600/10 cursor-pointer border-0"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>

          {/* Nút Hamburger menu toggle (Chỉ hiện dưới MD) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-850 rounded-xl cursor-pointer border-0 transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* ==========================================
          4. MENU THẢ XUỐNG DÀNH CHO DI ĐỘNG (MOBILE DROPDOWN)
          ========================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-850 bg-slate-900/95 backdrop-blur-md px-4 py-4 space-y-3 flex flex-col text-left transition-all duration-200">
          <button 
            onClick={() => {
              onNavigate?.('home');
              setIsMobileMenuOpen(false);
            }}
            className="text-emerald-400 hover:text-emerald-500 font-bold text-sm bg-transparent border-0 cursor-pointer p-0 text-left"
          >
            Đặt Sân Thể Thao
          </button>
          
          <button 
            onClick={() => {
              onNavigate?.('my-bookings');
              setIsMobileMenuOpen(false);
            }}
            className="text-slate-300 hover:text-slate-100 font-bold text-sm bg-transparent border-0 cursor-pointer p-0 text-left"
          >
            Lịch Hẹn Của Tôi
          </button>

          <button 
            onClick={() => {
              onNavigate?.('matchmaking');
              setIsMobileMenuOpen(false);
            }}
            className="text-slate-300 hover:text-slate-100 font-bold text-sm bg-transparent border-0 cursor-pointer p-0 text-left"
          >
            Cộng Đồng Ghép Đội
          </button>

          <button 
            onClick={() => {
              onNavigate?.('chat');
              setIsMobileMenuOpen(false);
            }}
            className="text-slate-300 hover:text-slate-100 font-bold text-sm bg-transparent border-0 cursor-pointer p-0 text-left"
          >
            Tin Nhắn
          </button>

          <button 
            onClick={() => {
              onNavigate?.('partner');
              setIsMobileMenuOpen(false);
            }}
            className="text-slate-300 hover:text-slate-100 font-bold text-sm flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0 text-left"
          >
            Dành Cho Chủ Sân
            <span className="bg-slate-850 text-slate-300 text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold border border-slate-800">
              Partner
            </span>
          </button>
        </div>
      )}

    </nav>
  );
};
