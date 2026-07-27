import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
// Import các trang theo đúng cấu trúc tối ưu chuẩn Senior
import { Home } from './pages/client/Home';
import { AuthPage } from './pages/client/AuthPage';
import { MyBookings } from './pages/client/MyBookings';
import { CourtDetails } from './pages/client/CourtDetails';
import { BookingSuccess } from './pages/client/BookingSuccess';
import { Matchmaking } from './pages/client/Matchmaking';
import { MatchmakingCreate } from './pages/client/Matchmaking/MatchmakingCreate';
import { CommunityChat } from './pages/client/CommunityChat';
import { Search } from './pages/client/Search';
import { NotFound } from './pages/client/NotFound';
import { Profile, ChangePassword } from './pages/client/Profile';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { PartnerLayout } from './pages/partner/PartnerLayout';
import { PartnerLoginPage } from './pages/partner/PartnerLoginPage';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';
import { Toaster, toast } from 'sonner';
import { LockedAccountView } from './pages/client/LockedAccount';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { ProtectedRoute } from './components/common/ProtectedRoute';

function App() {
  // 1. QUẢN LÝ ĐƯỜNG DẪN URL TRÊN TRÌNH DUYỆT BẰNG REACT ROUTER DOM
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // 2. KẾT NỐI VỚI ZUSTAND STORES ĐỂ QUẢN LÝ TRẠNG THÁI TOÀN CỤC
  const { 
    userName, 
    partnerName, 
    isAdminLoggedIn, 
    loginUser,
    logoutUser, 
    loginAdmin, 
    logoutAdmin, 
    loginPartner, 
    logoutPartner,
    setUserName
  } = useAuthStore();

  const {
    searchFilters,
    setSearchFilters,
    bookingSuccessData,
    setBookingSuccessData,
    selectedLocationId,
    setSelectedLocationId,
    selectedCourtId,
    setSelectedCourtId
  } = useAppStore();

  // Chế độ đăng nhập hay đăng ký của client
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Trạng thái tài khoản Client bị khóa
  const [isUserLocked, setIsUserLocked] = useState(false);
  const [lockedUserEmail, setLockedUserEmail] = useState('');

  // Định kỳ 3 giây kiểm tra trạng thái tài khoản (isActive) của Client
  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('user_token');
      const infoStr = localStorage.getItem('user_info');
      
      if (!token || !infoStr) {
        setIsUserLocked(false);
        return;
      }
      
      try {
        const currentUser = JSON.parse(infoStr);
        setLockedUserEmail(currentUser.email || '');
        
        const res = await fetch(`http://localhost:3000/users/${currentUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          const data = await res.json();
          if (data.message && (
            data.message.includes('khóa') || 
            data.message.includes('vô hiệu hóa') || 
            data.message.includes('block') || 
            data.message.includes('lock') || 
            data.message.includes('không tồn tại')
          )) {
            setIsUserLocked(true);
          }
        } else if (res.ok) {
          const data = await res.json();
          if (data && data.isActive === false) {
            setIsUserLocked(true);
          } else {
            setIsUserLocked(false);
          }
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái tài khoản:', err);
      }
    };

    checkUserStatus();
    const interval = setInterval(checkUserStatus, 3000);
    return () => clearInterval(interval);
  }, [currentPath]);

  // Lắng nghe sự thay đổi URL khi người dùng bấm nút Quay lại/Tiến tới (Back/Forward) của trình duyệt
  useEffect(() => {
    // Khởi tạo thư viện AOS (Animate On Scroll)
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true
    });

    // Lắng nghe sự kiện buộc đăng xuất do hết hạn phiên làm việc
    const handleAdminForceLogout = () => {
      logoutAdmin();
      navigateTo('/admin');
      toast.error('Phiên làm việc quản trị đã hết hạn.', {
        description: 'Vui lòng đăng nhập lại.',
        duration: 5000,
      });
    };

    const handleUserForceLogout = () => {
      logoutUser();
      navigateTo('/');
      toast.error('Phiên làm việc đã hết hạn.', {
        description: 'Vui lòng đăng nhập lại để tiếp tục.',
        duration: 5000,
      });
    };

    window.addEventListener('admin-force-logout', handleAdminForceLogout);
    window.addEventListener('user-force-logout', handleUserForceLogout);

    return () => {
      window.removeEventListener('admin-force-logout', handleAdminForceLogout);
      window.removeEventListener('user-force-logout', handleUserForceLogout);
    };
  }, []);

  // Tự động cuộn lên đầu trang khi thay đổi đường dẫn URL (tránh việc giữ nguyên vị trí cuộn ở trang cũ)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  // Hàm chuyển trang đồng thời cập nhật thanh địa chỉ URL
  const navigateTo = (path: string) => {
    navigate(path);
  };

  const handleNavigate = (
    page: 'home' | 'auth' | 'admin' | 'partner' | 'my-bookings' | 'field-details' | 'booking-success' | 'matchmaking' | 'matchmaking/create' | 'chat' | 'search' | 'profile' | 'change-password',
    data?: any
  ) => {
    // data có thể là string (authMode cũ) hoặc object { locationId, courtId }
    if (typeof data === 'string') setAuthMode(data as 'login' | 'register');
    if (data?.locationId) setSelectedLocationId(data.locationId);
    if (data?.courtId) {
      setSelectedCourtId(data.courtId.toString());
    } else {
      setSelectedCourtId(null);
    }
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
    const token = localStorage.getItem('user_token') || '';
    const infoStr = localStorage.getItem('user_info');
    const info = infoStr ? JSON.parse(infoStr) : {};
    loginUser(name, token, info);
    toast.success('Đăng nhập thành công!', {
      description: `Chào mừng ${name} quay trở lại.`,
      duration: 3000,
    });
    navigateTo('/');
  };

  const handleAdminLoginSuccess = () => {
    const token = localStorage.getItem('admin_token') || '';
    const profileStr = localStorage.getItem('admin_profile');
    const profile = profileStr ? JSON.parse(profileStr) : {};
    loginAdmin(token, profile);
    navigateTo('/admin');
  };

  const handlePartnerLoginSuccess = (name: string) => {
    loginPartner(name);
    toast.success('Đăng nhập đối tác thành công!', {
      description: `Chào mừng ${name} đến với trang quản lý cơ sở.`,
      duration: 3000,
    });
    navigateTo('/partner');
  };

  const handleClientLogout = () => {
    logoutUser();
    toast.success('Đăng xuất thành công!', {
      description: 'Hẹn gặp lại bạn lần sau.',
      duration: 3000,
    });
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
    // Nếu tài khoản bị khóa và không ở route quản lý
    if (!isAdminRoute && !isPartnerRoute && isUserLocked) {
      return (
        <LockedAccountView 
          email={lockedUserEmail}
          onLogout={handleClientLogout}
          onNavigate={handleNavigate}
        />
      );
    }

    return (
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={
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
        } />

        <Route path="/search" element={
          <Search
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
            searchFilters={searchFilters}
            onUpdateFilters={setSearchFilters}
          />
        } />

        <Route path="/auth" element={
          <AuthPage 
            initialMode={authMode} 
            onBackToHome={() => navigateTo('/')}
            onLoginSuccess={handleClientLoginSuccess}
          />
        } />

        <Route path="/my-bookings" element={
          <ProtectedRoute allowedRole="client">
            <MyBookings 
              onNavigate={handleNavigate}
              userName={userName || undefined}
              onLogout={handleClientLogout}
            />
          </ProtectedRoute>
        } />

        <Route path="/field-details" element={
          <CourtDetails 
            locationId={selectedLocationId}
            initialCourtId={selectedCourtId}
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
            onSetBookingSuccessData={setBookingSuccessData}
          />
        } />

        <Route path="/booking-success" element={
          <BookingSuccess 
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
            bookingSuccessData={bookingSuccessData}
          />
        } />

        <Route path="/matchmaking" element={
          <Matchmaking 
            onNavigate={handleNavigate}
            userName={userName || undefined}
            onLogout={handleClientLogout}
          />
        } />

        <Route path="/matchmaking/create" element={
          <ProtectedRoute allowedRole="client">
            <MatchmakingCreate
              onNavigate={handleNavigate}
              userName={userName || undefined}
              onLogout={handleClientLogout}
            />
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute allowedRole="client">
            <CommunityChat 
              onNavigate={handleNavigate}
              userName={userName || undefined}
              onLogout={handleClientLogout}
            />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowedRole="client">
            <Profile 
              onNavigate={handleNavigate}
              userName={userName || undefined}
              onLogout={handleClientLogout}
              onProfileUpdated={(newName) => setUserName(newName)}
            />
          </ProtectedRoute>
        } />

        <Route path="/change-password" element={
          <ProtectedRoute allowedRole="client">
            <ChangePassword
              onNavigate={handleNavigate}
              userName={userName || undefined}
              onLogout={handleClientLogout}
            />
          </ProtectedRoute>
        } />

        {/* Admin Area */}
        <Route path="/admin/*" element={
          isAdminLoggedIn ? (
            <AdminLayout 
              currentPath={currentPath}
              navigateTo={navigateTo}
              onLogout={() => {
                logoutAdmin();
                toast.success('Đăng xuất thành công!', {
                  description: 'Phiên làm việc quản trị đã được hủy an toàn.',
                  duration: 3000,
                });
                navigateTo('/admin');
              }}
            />
          ) : (
            <AdminLoginPage 
              onLoginSuccess={handleAdminLoginSuccess}
              onBackToClient={() => navigateTo('/')}
            />
          )
        } />

        {/* Partner Area */}
        <Route path="/partner/*" element={
          partnerName ? (
            <PartnerLayout 
              partnerName={partnerName}
              currentPath={currentPath}
              navigateTo={navigateTo}
              onLogout={() => {
                logoutPartner();
                toast.success('Đăng xuất thành công!', {
                  description: 'Phiên làm việc đối tác đã được hủy an toàn.',
                  duration: 3000,
                });
                navigateTo('/');
              }}
            />
          ) : (
            <PartnerLoginPage 
              onLoginSuccess={handlePartnerLoginSuccess}
              onBackToClient={() => navigateTo('/')}
              onGoToAuth={() => handleNavigate('auth', 'login')}
            />
          )
        } />

        {/* 404 Route */}
        <Route path="*" element={
          <NotFound 
            onNavigate={handleNavigate} 
            userName={userName || undefined} 
            onLogout={handleClientLogout} 
          />
        } />
      </Routes>
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
