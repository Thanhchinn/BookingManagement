import React from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { AlertCircle, Home, Search, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onNavigate?: (page: any, data?: any) => void;
  userName?: string;
  onLogout?: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigate, userName, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      {/* Navbar */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-8" data-aos="fade-up">
          
          {/* Whistle / Red card Illustration */}
          <div className="relative flex justify-center">
            {/* Background glowing circle */}
            <div className="absolute inset-0 m-auto w-36 h-36 bg-rose-500/10 rounded-full blur-2xl animate-pulse" />
            
            {/* Visual Red Card Icon */}
            <div className="relative w-28 h-40 bg-rose-600 border border-rose-500 rounded-2xl shadow-2xl shadow-rose-500/20 transform rotate-12 flex items-center justify-center transition-transform hover:rotate-6 duration-300 select-none">
              <div className="text-left p-4 flex flex-col justify-between h-full w-full">
                <span className="text-white font-black text-2xl tracking-tighter">404</span>
                <AlertCircle className="w-10 h-10 text-white stroke-[2.5] align-bottom self-end" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs bg-rose-500/10 border border-rose-500/25 text-rose-400 font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider select-none">
              Trọng tài thổi còi!
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-2">
              Lỗi Vi Vị / Không Tìm Thấy Trang
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Đường dẫn bạn vừa nhập không tồn tại, đã bị thay đổi hoặc không có quyền truy cập trên hệ thống SportZone.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <button
              onClick={() => onNavigate?.('home')}
              className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/10 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 border-0"
            >
              <Home className="w-4 h-4 shrink-0 text-slate-950" />
              Quay lại Trang Chủ
            </button>

            <button
              onClick={() => onNavigate?.('search')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs rounded-2xl border border-slate-800 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 shrink-0 text-slate-400" />
              Tìm Kiếm Sân Chơi
            </button>
          </div>

          {/* Quick link back */}
          <button
            onClick={() => window.history.back()}
            className="text-[10px] text-slate-500 hover:text-slate-350 font-bold bg-transparent border-0 cursor-pointer transition flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang trước đó
          </button>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
