import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/InputField';
import { Lock, ShieldAlert } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (adminName: string) => void;
  onBackToClient: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ 
  onLoginSuccess, 
  onBackToClient 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin quản trị viên.');
      return;
    }

    setIsLoading(true);

    // Giả lập kết nối API Đăng nhập quản trị viên tối mật
    setTimeout(() => {
      setIsLoading(false);
      if (email === 'admin@gmail.com' && password === 'admin123') {
        onLoginSuccess('Super Admin');
      } else {
        setError('Sai thông tin đăng nhập hoặc bạn không có quyền truy cập vùng quản trị.');
      }
    }, 1200);
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden"
      style={{ 
        backgroundImage: "url('/stadium_hero_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Lớp phủ làm tối mờ huyền diệu */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-10"></div>
      
      {/* Vòng tròn sáng hiệu ứng Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-10"></div>

      {/* KHUNG ĐĂNG NHẬP ADMIN GLASSMORPHISM */}
      <div className="relative z-20 w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md">
        
        {/* Phần Đầu Trang Đăng Nhập */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight m-0 uppercase">Vùng Quản Trị Hệ Thống</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">SportZone Admin Portal</p>
          </div>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Biểu mẫu đăng nhập Admin */}
        <form onSubmit={handleAdminSubmit} className="space-y-5">
          <InputField
            id="admin-email"
            label="Email Quản Trị"
            type="email"
            placeholder="admin@gmail.com..."
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-950 border-slate-805 text-white focus:border-emerald-500"
          />

          <InputField
            id="admin-password"
            label="Mật Khẩu Tối Mật"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-950 border-slate-805 text-white focus:border-emerald-500"
          />

          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading} 
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-sm text-white rounded-xl shadow-lg shadow-emerald-600/10 cursor-pointer mt-6"
          >
            Xác Thực Đăng Nhập
          </Button>
        </form>

        {/* Nút quay lại trang Client */}
        <div className="text-center mt-6 pt-4 border-t border-slate-800/60">
          <button 
            onClick={onBackToClient}
            className="text-[11px] text-slate-400 hover:text-white font-bold bg-transparent border-0 cursor-pointer p-0 underline"
          >
            Quay lại trang chính Client
          </button>
        </div>

      </div>

      {/* Bản quyền */}
      <p className="relative z-20 text-[10px] text-slate-600 mt-8 font-medium">
        Hệ thống bảo mật đa tầng SportZone. Nghiêm cấm mọi hành vi truy cập trái phép.
      </p>

    </div>
  );
};
