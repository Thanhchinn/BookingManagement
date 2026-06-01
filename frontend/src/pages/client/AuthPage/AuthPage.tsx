import React, { useState } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { LoginForm } from '../../../features/auth/components/LoginForm';
import { RegisterForm } from '../../../features/auth/components/RegisterForm';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onBackToHome: () => void;
  onLoginSuccess: (name: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  initialMode = 'login', 
  onBackToHome,
  onLoginSuccess 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* 1. THANH NAV DÙNG CHUNG */}
      <Navbar onNavigate={(page, authMode) => {
        if (page === 'home') {
          onBackToHome();
        } else if (page === 'auth') {
          setMode(authMode || 'login');
        }
      }} />

      {/* 2. CHIA ĐÔI MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ CỰC KỲ CAO CẤP */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl min-h-[580px]">
          
          {/* =================================================================
              CỘT TRÁI (Lg: 5 cột): NỀN GRADIENT ĐIỆN ẢNH VÀ QUOTE THỂ THAO
              ================================================================= */}
          <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 bg-cover bg-center overflow-hidden"
               style={{ backgroundImage: "url('/stadium_hero_bg.png')" }}>
            
            {/* Lớp phủ màu sẫm huyền ảo */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-emerald-950/80 z-10"></div>
            
            {/* Nội dung lồng phía trên */}
            <div className="relative z-20 space-y-3 text-left">
              <span className="text-2xl">🏆</span>
              <h4 className="text-xl font-black text-white tracking-tight m-0">SportZone</h4>
            </div>

            <div className="relative z-20 text-left space-y-4">
              <p className="text-2xl font-extrabold text-white leading-tight m-0">
                "Nơi kết nối đam mê, giữ chỗ vững chắc cho mọi trận đấu đỉnh cao của bạn."
              </p>
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-400 m-0 uppercase tracking-widest">SportZone Community</p>
                <p className="text-[10px] text-slate-400 m-0">Hơn 10,000+ lượt đặt sân mỗi tuần</p>
              </div>
            </div>

            <div className="relative z-20 text-left text-[10px] text-slate-500">
              © 2026 SportZone. Tất cả quyền được bảo lưu.
            </div>
          </div>

          {/* =================================================================
              CỘT PHẢI (Lg: 7 cột): CHỨA FORM ĐĂNG NHẬP / ĐĂNG KÝ
              ================================================================= */}
          <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12 bg-slate-900/60 relative">
            {/* Hộp tròn sáng hiệu ứng Aura mờ ảo ở góc */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {mode === 'login' ? (
              <LoginForm 
                onSwitchMode={() => setMode('register')} 
                onSuccess={onLoginSuccess}
              />
            ) : (
              <RegisterForm 
                onSwitchMode={() => setMode('login')} 
                onSuccess={onLoginSuccess}
              />
            )}
          </div>

        </div>
      </main>

      {/* 3. CHÂN TRANG DÙNG CHUNG */}
      <Footer />

    </div>
  );
};
