import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CategoryList } from '../../features/sports-field/components/CategoryList';
import { FieldList } from '../../features/sports-field/components/FieldList';

interface HomeProps {
  onNavigate?: (page: 'home' | 'auth' | 'admin' | 'partner', authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, userName, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* 1. THANH NAV DÙNG CHUNG */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* 2. HERO SECTION LUNG LINH ĐIỆN ẢNH */}
      <section 
        className="relative min-h-[580px] flex items-center justify-start text-left px-6 sm:px-12 lg:px-24 bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: "url('/stadium_hero_bg.png')" 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-slate-950/40 z-10"></div>

        <div className="relative z-20 max-w-2xl space-y-6 pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold tracking-wider uppercase">
            <span>Professional Management</span>
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

          <div className="flex flex-wrap items-center gap-4 pt-3">
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
        </div>
      </section>

      {/* 3. PHẦN TÌM SÂN (CATEGORIES & FIELD LIST) */}
      <section id="courts-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <Badge status="success">Featured Venue</Badge>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
            Khám Phá Các Sân Thể Thao Cao Cấp
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Hệ thống sân đấu đạt tiêu chuẩn thi đấu chuyên nghiệp với đầy đủ tiện ích đi kèm.
          </p>
        </div>

        {/* Gọi thanh phân loại môn học */}
        <CategoryList />

        {/* Gọi danh sách sân đấu */}
        <FieldList />
      </section>

      {/* 4. CHÂN TRANG DÙNG CHUNG */}
      <Footer />

    </div>
  );
};
