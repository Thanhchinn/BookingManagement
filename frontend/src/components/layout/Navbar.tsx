import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Sun, Moon, 
  User, Settings, Key, Calendar, Heart, Building, LogOut, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// ============================================================================
// KHAI BÁO COMPONENT NAVBAR (THANH ĐIỀU HƯỚNG TRÊN CÙNG)
// ============================================================================
interface NavbarProps {
  onNavigate?: (page: any, authMode?: any) => void;
  userName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, userName, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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

  const [avatar, setAvatar] = useState('👤');

  useEffect(() => {
    const updateAvatar = () => {
      const userInfoStr = localStorage.getItem('user_info');
      if (userInfoStr) {
        try {
          const u = JSON.parse(userInfoStr);
          if (u && u.avatarUrl) {
            setAvatar(u.avatarUrl);
          } else {
            setAvatar('👤');
          }
        } catch {
          setAvatar('👤');
        }
      } else {
        setAvatar('👤');
      }
    };

    updateAvatar();
    
    window.addEventListener('storage', updateAvatar);
    window.addEventListener('user_profile_updated', updateAvatar);
    
    return () => {
      window.removeEventListener('storage', updateAvatar);
      window.removeEventListener('user_profile_updated', updateAvatar);
    };
  }, [userName]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toast.info(lng === 'vi' ? 'Đã chuyển sang Tiếng Việt!' : 'Switched to English successfully!', {
      icon: '🌐',
      duration: 2000,
    });
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
            <span className="text-lg font-black text-slate-100 tracking-tight">{t('common.sportsZone')}</span>
            {/* Nhãn Real-time nhấp nháy báo trạng thái trực tuyến */}
            <span className="ml-2 inline-flex items-center text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20">
              <span className="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full inline-block animate-ping"></span>
              {t('common.live')}
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
            {t('nav.booking')}
          </button>

          <button 
            onClick={() => onNavigate?.('matchmaking')}
            className="hover:text-slate-100 transition duration-150 bg-transparent border-0 cursor-pointer p-0 font-bold text-sm text-slate-300"
          >
            {t('nav.matchmaking')}
          </button>

          <button 
            onClick={() => onNavigate?.('chat')}
            className="hover:text-slate-100 transition duration-150 bg-transparent border-0 cursor-pointer p-0 font-bold text-sm text-slate-300"
          >
            {t('nav.messages')}
          </button>
        </div>

        {/* ==========================================
            3. PHẦN PHẢI: ĐĂNG NHẬP / ĐĂNG KÝ & HAMBURGER TRÊN MOBILE
            ========================================== */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Bộ Chọn Ngôn Ngữ Song Ngữ (Bilingual Selector Pill) */}
          <div className="flex items-center bg-slate-850/80 rounded-xl p-0.5 border border-slate-800 shrink-0">
            <button
              onClick={() => changeLanguage('vi')}
              className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 border-0 flex items-center justify-center ${
                i18n.language.startsWith('vi')
                  ? 'bg-emerald-500 text-white shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 bg-transparent'
              }`}
              title="Tiếng Việt"
            >
              VI
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 border-0 flex items-center justify-center ${
                i18n.language.startsWith('en')
                  ? 'bg-emerald-500 text-white shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 bg-transparent'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Nút Đổi màu giao diện (Theme Toggle) */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-slate-850/60 text-slate-400 hover:text-emerald-400 transition-all duration-200 cursor-pointer border-0 bg-transparent flex items-center justify-center shrink-0"
            title={t('common.themeToggle')}
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
              <div className="relative flex items-center gap-2 sm:gap-3">
                {userName.includes('Admin') && (
                  <button 
                    onClick={() => {
                      onNavigate?.('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-[11px] sm:text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-2.5 sm:px-3.5 py-2 rounded-xl transition duration-150 shadow-md shadow-emerald-600/10 cursor-pointer border-0 flex items-center gap-1"
                  >
                    ⚙️ {t('common.admin')}
                  </button>
                )}

                {/* Profile Pill Trigger Button */}
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-cyan-500/30 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-cyan-50/20 dark:hover:bg-slate-850 transition-all duration-200 cursor-pointer shadow-sm relative z-50 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500 dark:bg-slate-850 flex items-center justify-center text-white overflow-hidden shrink-0">
                    {avatar.startsWith('http') ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover animate-fade-in" />
                    ) : (
                      <span className="text-base select-none">{avatar}</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 max-w-[80px] sm:max-w-[120px] truncate">
                    {userName}
                  </span>
                  {isProfileMenuOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  )}
                </button>

                {/* Dropdown Menu Backdrop */}
                {isProfileMenuOpen && (
                  <div 
                    className="fixed inset-0 z-40 bg-transparent cursor-default" 
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                )}

                {/* Dropdown Menu Box */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 py-4 px-3.5 transition-all duration-200 transform origin-top-right">
                    
                    {/* Header Block */}
                    <div className="bg-[#f0f4ff] dark:bg-slate-800/80 rounded-[20px] p-4 text-center mb-3 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl overflow-hidden mb-2 shadow-inner border border-slate-300 dark:border-slate-650 shrink-0">
                        {avatar.startsWith('http') ? (
                          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="select-none">{avatar}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-black tracking-wider text-indigo-500 dark:text-indigo-400 uppercase mb-0.5 block">
                        THÀNH VIÊN
                      </span>
                      <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 truncate w-full block">
                        {userName}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          onNavigate?.('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[14px] font-semibold transition-all duration-150 text-left border-0 bg-transparent cursor-pointer"
                      >
                        <Settings className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                        <span>Thông tin tài khoản</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate?.('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[14px] font-semibold transition-all duration-150 text-left border-0 bg-transparent cursor-pointer"
                      >
                        <User className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                        <span>Thông tin cá nhân</span>
                      </button>

                       <button
                        onClick={() => {
                          onNavigate?.('change-password');
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[14px] font-semibold transition-all duration-150 text-left border-0 bg-transparent cursor-pointer"
                      >
                        <Key className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                        <span>Đổi mật khẩu</span>
                      </button>

                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1.5" />

                      <button
                        onClick={() => {
                          onNavigate?.('my-bookings');
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[14px] font-semibold transition-all duration-150 text-left border-0 bg-transparent cursor-pointer"
                      >
                        <Calendar className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                        <span>Lịch hẹn của tôi</span>
                      </button>

                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1.5" />

                      <button
                        onClick={() => {
                          toast.info('Danh sách sân yêu thích đang được phát triển!', { icon: '❤️' });
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[14px] font-semibold transition-all duration-150 text-left border-0 bg-transparent cursor-pointer"
                      >
                        <Heart className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                        <span>Sân yêu thích</span>
                      </button>

                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1.5" />

                      <button
                        onClick={() => {
                          onNavigate?.('partner');
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[14px] font-semibold transition-all duration-150 text-left border-0 bg-transparent cursor-pointer"
                      >
                        <Building className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                        <span>Quản lý cơ sở</span>
                      </button>

                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1.5" />

                      <button
                        onClick={() => {
                          onLogout?.();
                          setIsProfileMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[14px] font-bold transition-all duration-150 text-left border-0 bg-transparent cursor-pointer"
                      >
                        <LogOut className="w-4.5 h-4.5 text-rose-500 dark:text-rose-450" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={() => onNavigate?.('auth', 'login')}
                  className="text-xs font-bold text-slate-300 hover:text-slate-100 px-2.5 sm:px-3.5 py-2.5 rounded-xl hover:bg-slate-850/60 transition duration-150 cursor-pointer bg-transparent border-0"
                >
                  {t('common.login')}
                </button>
                <button 
                  onClick={() => onNavigate?.('auth', 'register')}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3 sm:px-4.5 py-2.5 rounded-xl transition-all duration-150 shadow-md shadow-emerald-600/10 cursor-pointer border-0"
                >
                  {t('common.register')}
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
            {t('nav.booking')}
          </button>

          <button 
            onClick={() => {
              onNavigate?.('matchmaking');
              setIsMobileMenuOpen(false);
            }}
            className="text-slate-300 hover:text-slate-100 font-bold text-sm bg-transparent border-0 cursor-pointer p-0 text-left"
          >
            {t('nav.matchmaking')}
          </button>

          <button 
            onClick={() => {
              onNavigate?.('chat');
              setIsMobileMenuOpen(false);
            }}
            className="text-slate-300 hover:text-slate-100 font-bold text-sm bg-transparent border-0 cursor-pointer p-0 text-left"
          >
            {t('nav.messages')}
          </button>
        </div>
      )}

    </nav>
  );
};

