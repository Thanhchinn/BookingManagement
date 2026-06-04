import { useState, useEffect } from 'react';
// Import các trang theo đúng cấu trúc tối ưu chuẩn Senior
import { Home } from './pages/client/Home';
import { AuthPage } from './pages/client/AuthPage';
import { MyBookings } from './pages/client/MyBookings';
import { CourtDetails } from './pages/client/CourtDetails';
import { BookingSuccess } from './pages/client/BookingSuccess';
import { Matchmaking } from './pages/client/Matchmaking';
import { CommunityChat } from './pages/client/CommunityChat';
import { Search } from './pages/client/Search';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { PartnerLayout } from './pages/partner/PartnerLayout';
import { PartnerLoginPage } from './pages/partner/PartnerLoginPage';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';
import { Toaster, toast } from 'sonner';

function App() {
  // 1. QUẢN LÝ ĐƯỜNG DẪN URL TRÊN TRÌNH DUYỆT (NATIVE PATH ROUTING)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Trạng thái trang client phụ, được tính toán tự động dựa trên URL hiện tại để đồng bộ 100%
  const currentPage = (() => {
    const path = currentPath;
    if (path === '/auth') return 'auth';
    if (path === '/my-bookings') return 'my-bookings';
    if (path === '/field-details') return 'field-details';
    if (path === '/booking-success') return 'booking-success';
    if (path === '/matchmaking') return 'matchmaking';
    if (path === '/chat') return 'chat';
    if (path === '/search') return 'search';
    return 'home';
  })();

  // Chế độ đăng nhập hay đăng ký của client
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Trạng thái bộ lọc tìm kiếm toàn cục
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    address: 'all',
    category: 'all'
  });

  // Trạng thái đăng nhập Client (Khách hàng)
  const [userName, setUserName] = useState<string | null>(() => {
    const saved = localStorage.getItem('user_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.fullName || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Trạng thái đăng nhập Admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Trạng thái đăng nhập Partner (Chủ sân)
  const [partnerName, setPartnerName] = useState<string | null>(null);

  // Lưu trữ tạm dữ liệu đặt vé thành công
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);

  // Lắng nghe sự thay đổi URL khi người dùng bấm nút Quay lại/Tiến tới (Back/Forward) của trình duyệt
  useEffect(() => {
    // Khởi tạo thư viện AOS (Animate On Scroll)
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true
    });

    // Tự động khôi phục phiên đăng nhập Admin từ localStorage
    const token = localStorage.getItem('admin_token');
    const profile = localStorage.getItem('admin_profile');
    if (token && profile) {
      setIsAdminLoggedIn(true);
    }

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Hàm chuyển trang đồng thời cập nhật thanh địa chỉ URL
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleNavigate = (
    page: 'home' | 'auth' | 'admin' | 'partner' | 'my-bookings' | 'field-details' | 'booking-success' | 'matchmaking' | 'chat' | 'search', 
    mode?: 'login' | 'register'
  ) => {
    if (mode) setAuthMode(mode);
    if (page === 'admin') {
      navigateTo('/admin');
    } else if (page === 'partner') {
      navigateTo('/partner');
    } else if (page === 'home') {
      navigateTo('/');
    } else {
      navigateTo(`/${page}`);
    }
  };

  const handleClientLoginSuccess = (name: string) => {
    setUserName(name);
    navigateTo('/');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    navigateTo('/admin');
  };

  const handlePartnerLoginSuccess = (name: string) => {
    setPartnerName(name);
    navigateTo('/partner');
  };

  const handleClientLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    setUserName(null);
    navigateTo('/');
  };

  // Kiểm tra xem URL hiện tại có thuộc về khu vực Admin hay không
  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin/');

  // Kiểm tra xem URL hiện tại có thuộc về khu vực Partner hay không
  const isPartnerRoute = currentPath === '/partner' || currentPath.startsWith('/partner/');

  // ==========================================================================
  // RENDER CONTENT HELPER
  // ==========================================================================
  const renderContent = () => {
    if (isAdminRoute) {
      if (isAdminLoggedIn) {
        return (
          <AdminLayout 
            currentPath={currentPath}
            navigateTo={navigateTo}
            onLogout={() => {
              // Đăng xuất hoàn toàn, xóa token an toàn
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_profile');
              setIsAdminLoggedIn(false);
              toast.success('Đăng xuất thành công!', {
                description: 'Phiên làm việc quản trị đã được hủy an toàn.',
                duration: 3000,
              });
              navigateTo('/admin');
            }}
          />
        );
      } else {
        return (
          <AdminLoginPage 
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToClient={() => navigateTo('/')}
          />
        );
      }
    }

    if (isPartnerRoute) {
      if (partnerName) {
        return (
          <PartnerLayout 
            partnerName={partnerName}
            currentPath={currentPath}
            navigateTo={navigateTo}
            onLogout={() => {
              setPartnerName(null);
              navigateTo('/');
            }}
          />
        );
      } else {
        return (
          <PartnerLoginPage 
            onLoginSuccess={handlePartnerLoginSuccess}
            onBackToClient={() => navigateTo('/')}
            onGoToAuth={() => handleNavigate('auth', 'login')}
          />
        );
      }
    }

    // Mặc định hiển thị trang phía Client
    return (
      <>
        {currentPage === 'home' && (
          <Home 
            onNavigate={handleNavigate} 
            userName={userName || undefined} 
            onLogout={handleClientLogout} 
            searchFilters={searchFilters}
            onSearch={(filters) => {
              setSearchFilters(filters);
              navigateTo('/search');
            }}
          />
        )}
        {currentPage === 'search' && (
          <Search
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
            searchFilters={searchFilters}
            onUpdateFilters={setSearchFilters}
          />
        )}
        {currentPage === 'auth' && (
          <AuthPage 
            initialMode={authMode} 
            onBackToHome={() => navigateTo('/')}
            onLoginSuccess={handleClientLoginSuccess}
          />
        )}
        {currentPage === 'my-bookings' && (
          <MyBookings 
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
          />
        )}
        {currentPage === 'field-details' && (
          <CourtDetails 
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
            onSetBookingSuccessData={setBookingSuccessData}
          />
        )}
        {currentPage === 'booking-success' && (
          <BookingSuccess 
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
            bookingSuccessData={bookingSuccessData}
          />
        )}
        {currentPage === 'matchmaking' && (
          <Matchmaking 
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
          />
        )}
        {currentPage === 'chat' && (
          <CommunityChat 
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
          />
        )}
      </>
    );
  };

  return (
    <>
      <Toaster 
        theme="dark" 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f8fafc',
            fontFamily: 'sans-serif',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
          }
        }}
      />
      {renderContent()}
    </>
  );
}

export default App;
