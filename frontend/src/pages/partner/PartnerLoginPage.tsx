import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, Play, UserCheck } from 'lucide-react';

interface PartnerLoginPageProps {
  onLoginSuccess: (partnerName: string) => void;
  onBackToClient: () => void;
}

export const PartnerLoginPage: React.FC<PartnerLoginPageProps> = ({ onLoginSuccess, onBackToClient }) => {
  // Trạng thái Form
  const [email, setEmail] = useState('partner@gmail.com');
  const [password, setPassword] = useState('partner123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Xử lý gửi Form đăng nhập
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      // Tài khoản giả lập đối tác: partner@gmail.com / partner123
      if (email === 'partner@gmail.com' && password === 'partner123') {
        onLoginSuccess('Tổ Hợp Thể Thao Bình Lợi Pro');
      } else {
        setErrorMsg('Tài khoản hoặc mật khẩu chủ sân không chính xác.');
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative font-sans text-slate-100 px-4 overflow-hidden select-none">
      
      {/* 1. HIỆU ỨNG ÁNH SÁNG NỀN (AURA BLUR) */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 2. KHUNG ĐĂNG NHẬP CHÍNH */}
      <div className="relative w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        
        {/* Nút quay lại trang chủ Client */}
        <button 
          onClick={onBackToClient}
          className="absolute top-6 left-6 text-slate-500 hover:text-white transition duration-150 cursor-pointer bg-transparent border-0 flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>

        {/* Logo & Tiêu đề */}
        <div className="text-center mt-6 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mb-4 text-xl font-bold">
            🏆
          </div>
          <h2 className="text-lg font-black text-white m-0 uppercase tracking-wider">SportZone Partner</h2>
          <p className="text-[10px] text-slate-500 m-0 mt-1 uppercase font-bold tracking-widest">Cổng quản lý dành cho Chủ Sân</p>
        </div>

        {/* Thông báo tài khoản mẫu */}
        <div className="mb-6 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[10px] text-left text-amber-400 font-semibold space-y-1">
          <p className="m-0 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            TÀI KHOẢN ĐỐI TÁC DÙNG THỬ (MÔ PHỎNG):
          </p>
          <p className="m-0 font-mono text-[9px] text-slate-300">
            • Tài khoản: <strong className="text-white">partner@gmail.com</strong> <br />
            • Mật khẩu: <strong className="text-white">partner123</strong>
          </p>
        </div>

        {/* Biểu mẫu đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Nhập Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thư điện tử (Email)</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chu_san@sportzone.vn"
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-xs text-white pl-10 pr-4 py-3 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-medium"
                required
              />
            </div>
          </div>

          {/* Nhập Mật khẩu */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mật khẩu</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-xs text-white pl-10 pr-4 py-3 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-medium font-mono"
                required
              />
            </div>
          </div>

          {/* Hiển thị lỗi */}
          {errorMsg && (
            <p className="text-[10px] text-red-400 font-bold text-center m-0 mt-2">{errorMsg}</p>
          )}

          {/* Nút Submit */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-xs font-bold text-white rounded-xl transition duration-150 border-0 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Đang kết nối...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Đăng Nhập Hệ Thống</span>
              </>
            )}
          </button>

        </form>

        {/* Khuyên đăng ký đối tác */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 m-0">
            Bạn chưa là đối tác của SportZone?{' '}
            <a 
              href="#register" 
              onClick={(e) => {
                e.preventDefault();
                alert('Vui lòng gửi hồ sơ liên kết ở chân trang Client (Section: Dành Cho Chủ Sân).');
              }}
              className="text-amber-400 hover:text-amber-300 font-bold"
            >
              Nộp hồ sơ ngay
            </a>
          </p>
        </div>

      </div>

    </div>
  );
};
