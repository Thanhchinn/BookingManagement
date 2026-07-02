import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/InputField';
import apiClient from '../../../services/apiClient';

interface LoginFormProps {
  onSwitchMode: () => void;
  onSuccess: (name: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchMode, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin đăng nhập.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      const data = response.data;

      // Lưu trữ thông tin người dùng và token vào localStorage
      localStorage.setItem('user_token', data.access_token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      onSuccess(data.user.fullName);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left w-full max-w-sm mx-auto">
      {/* Tiêu đề biểu mẫu */}
      <div className="space-y-1.5">
        <h3 className="text-2xl font-black tracking-tight text-white m-0">Chào mừng trở lại!</h3>
        <p className="text-xs text-slate-400">Đăng nhập vào tài khoản đặt sân thể thao của bạn</p>
      </div>

      {/* Thông báo lỗi nếu đăng nhập thất bại */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Biểu mẫu nhập liệu */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="email"
          label="Địa chỉ Email"
          type="email"
          placeholder="Nhập địa chỉ email của bạn..."
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-emerald-500"
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu</label>
            <a href="#forgot" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold decoration-none">
              Quên mật khẩu?
            </a>
          </div>
          <InputField
            id="password"
            type="password"
            placeholder="Nhập mật khẩu của bạn..."
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-emerald-500"
          />
        </div>

        {/* Nút ghi nhớ tài khoản */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 select-none">
          <input 
            type="checkbox" 
            id="remember" 
            className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="remember" className="cursor-pointer">Duy trì đăng nhập trên thiết bị này</label>
        </div>

        {/* Nút Đăng nhập */}
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isLoading} 
          className="w-full py-3 mt-2 text-sm text-white font-extrabold cursor-pointer"
        >
          Đăng Nhập
        </Button>
      </form>

      {/* Điều hướng chuyển chế độ */}
      <div className="text-center pt-2 text-xs text-slate-400">
        Bạn chưa có tài khoản?{' '}
        <button 
          onClick={onSwitchMode} 
          className="text-emerald-400 hover:text-emerald-300 font-bold bg-transparent border-0 cursor-pointer p-0 underline"
        >
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
};
