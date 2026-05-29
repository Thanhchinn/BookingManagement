import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/InputField';

interface RegisterFormProps {
  onSwitchMode: () => void;
  onSuccess: (name: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchMode, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu bảo mật phải tối thiểu từ 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    if (!agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản sử dụng của SportZone.');
      return;
    }

    setIsLoading(true);

    // Giả lập kết nối API Đăng ký lên NestJS Backend mất 1.5 giây
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(fullName);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left w-full max-w-sm mx-auto">
      {/* Tiêu đề biểu mẫu */}
      <div className="space-y-1.5">
        <h3 className="text-2xl font-black tracking-tight text-white m-0">Tạo tài khoản mới!</h3>
        <p className="text-xs text-slate-400">Tham gia ngay cộng đồng đặt lịch thể thao cao cấp</p>
      </div>

      {/* Thông báo lỗi nếu đăng ký thất bại */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Biểu mẫu đăng ký */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="fullname"
          label="Họ và Tên"
          placeholder="Ví dụ: Nguyễn Văn A..."
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-emerald-500"
        />

        <InputField
          id="email"
          label="Địa chỉ Email"
          type="email"
          placeholder="email@example.com..."
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-emerald-500"
        />

        <InputField
          id="password"
          label="Mật khẩu bảo mật"
          type="password"
          placeholder="Tối thiểu từ 6 ký tự..."
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-emerald-500"
        />

        <InputField
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu phía trên..."
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-emerald-500"
        />

        {/* Đồng ý điều khoản */}
        <div className="flex items-start space-x-2 text-xs text-slate-400 select-none">
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer mt-0.5"
          />
          <label htmlFor="terms" className="cursor-pointer leading-normal">
            Tôi hoàn toàn đồng ý với các <a href="#terms" className="text-emerald-400 font-bold decoration-none hover:underline">Điều khoản dịch vụ</a> và <a href="#privacy" className="text-emerald-400 font-bold decoration-none hover:underline">Chính sách riêng tư</a> của SportZone.
          </label>
        </div>

        {/* Nút Đăng ký */}
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isLoading} 
          className="w-full py-3 mt-2 text-sm text-white font-extrabold cursor-pointer"
        >
          Đăng Ký Tài Khoản
        </Button>
      </form>

      {/* Chuyển sang màn đăng nhập */}
      <div className="text-center pt-2 text-xs text-slate-400">
        Bạn đã có tài khoản?{' '}
        <button 
          onClick={onSwitchMode} 
          className="text-emerald-400 hover:text-emerald-300 font-bold bg-transparent border-0 cursor-pointer p-0 underline"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
};
