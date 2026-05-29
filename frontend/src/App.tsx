import { useState, useEffect } from 'react';
// Import các trang theo đúng cấu trúc tối ưu chuẩn Senior
import { Home } from './pages/client/Home';
import { AuthPage } from './pages/client/AuthPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { PartnerLayout } from './pages/partner/PartnerLayout';
import { PartnerLoginPage } from './pages/partner/PartnerLoginPage';
import './App.css';

function App() {
  // 1. QUẢN LÝ ĐƯỜNG DẪN URL TRÊN TRÌNH DUYỆT (NATIVE PATH ROUTING)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Trạng thái trang client phụ ('home' hoặc 'auth')
  const [currentPage, setCurrentPage] = useState<'home' | 'auth'>('home');
  // Chế độ đăng nhập hay đăng ký của client
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Trạng thái đăng nhập Client (Khách hàng)
  const [userName, setUserName] = useState<string | null>(null);

  // Trạng thái đăng nhập Admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Trạng thái đăng nhập Partner (Chủ sân)
  const [partnerName, setPartnerName] = useState<string | null>(null);

  // Lắng nghe sự thay đổi URL khi người dùng bấm nút Quay lại/Tiến tới (Back/Forward) của trình duyệt
  useEffect(() => {
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

  const handleNavigate = (page: 'home' | 'auth' | 'admin' | 'partner', mode?: 'login' | 'register') => {
    if (page === 'admin') {
      navigateTo('/admin');
    } else if (page === 'partner') {
      navigateTo('/partner');
    } else {
      setCurrentPage(page);
      if (mode) setAuthMode(mode);
      navigateTo('/');
    }
  };

  const handleClientLoginSuccess = (name: string) => {
    setUserName(name);
    setCurrentPage('home');
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
    setUserName(null);
  };

  // Kiểm tra xem URL hiện tại có thuộc về khu vực Admin hay không
  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin/');

  // Kiểm tra xem URL hiện tại có thuộc về khu vực Partner hay không
  const isPartnerRoute = currentPath === '/partner' || currentPath.startsWith('/partner/');

  // ==========================================================================
  // RENDER DỰA TRÊN ĐƯỜNG DẪN URL
  // ==========================================================================
  if (isAdminRoute) {
    if (isAdminLoggedIn) {
      return (
        <AdminLayout 
          onBackToClient={() => {
            setIsAdminLoggedIn(false);
            navigateTo('/');
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
        />
      );
    }
  }

  // Mặc định hiển thị trang phía Client
  return (
    <>
      {currentPage === 'home' ? (
        <Home 
          onNavigate={handleNavigate} 
          userName={userName || undefined} 
          onLogout={handleClientLogout} 
        />
      ) : (
        <AuthPage 
          initialMode={authMode} 
          onBackToHome={() => setCurrentPage('home')}
          onLoginSuccess={handleClientLoginSuccess}
        />
      )}
    </>
  );
}

export default App;
