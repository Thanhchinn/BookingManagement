import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/InputField';
import { Lock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../../services/apiClient';

interface AdminLoginPageProps {
  onLoginSuccess: (adminName: string) => void;
  onBackToClient: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ 
  onLoginSuccess, 
  onBackToClient 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Kiểm tra dữ liệu đầu vào
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin quản trị viên.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/admin/login', {
        username: username.trim(),
        password: password,
      });

      const data = response.data;

      // Lưu Thông tin Admin và token vào localStorage
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_profile', JSON.stringify(data.admin));

      // Thông báo đăng nhập thành công bằng Toast
      toast.success('Đăng nhập quản trị thành công!', {
        description: `Chào mừng ${data.admin.fullName} quay trở lại hệ thống.`,
        duration: 4000,
      });

      // Kích hoạt callback đăng nhập thành công truyền tên Admin lên App.tsx
      onLoginSuccess(data.admin.fullName);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Kết nối tới máy chủ thất bại.';
      setError(msg);
      // Thông báo lỗi bằng Toast
      toast.error('Đăng nhập thất bại', {
        description: msg,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900 relative overflow-hidden"
      style={{ 
        backgroundImage: "url('/stadium_hero_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Lớp phủ làm tối mờ huyền diệu */}
      <div className="absolute inset-0 bg-slate-50/75 backdrop-blur-xs z-10"></div>
      
      {/* Vòng tròn sáng hiệu ứng Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none z-10"></div>
 
      {/* KHUNG ĐĂNG NHẬP ADMIN GLASSMORPHISM */}
      <div className="relative z-20 w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-2xl">
        
        {/* Phần Đầu Trang Đăng Nhập */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight m-0 uppercase">Vùng Quản Trị Hệ Thống</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">SportZone Admin Portal</p>
          </div>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Biểu mẫu đăng nhập Admin */}
        <form onSubmit={handleAdminSubmit} className="space-y-5">
          <InputField
            id="admin-username"
            label="Tên Đăng Nhập"
            type="text"
            placeholder="Nhập tên đăng nhập quản trị..."
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white border-slate-200 text-slate-900 focus:border-emerald-500"
          />

          <InputField
            id="admin-password"
            label="Mật Khẩu Tối Mật"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white border-slate-200 text-slate-900 focus:border-emerald-500"
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
        <div className="text-center mt-6 pt-4 border-t border-slate-150">
          <button 
            onClick={onBackToClient}
            className="text-[11px] text-slate-555 text-slate-500 hover:text-slate-800 font-bold bg-transparent border-0 cursor-pointer p-0 underline"
          >
            Quay lại trang chính Client
          </button>
        </div>

      </div>

      {/* Bản quyền */}
      <p className="relative z-20 text-[10px] text-slate-500 mt-8 font-medium">
        Hệ thống bảo mật đa tầng SportZone. Nghiêm cấm mọi hành vi truy cập trái phép.
      </p>

    </div>
  );
};
