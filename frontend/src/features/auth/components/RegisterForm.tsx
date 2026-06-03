import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/InputField';
import { MailCheck, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RegisterFormProps {
  onSwitchMode: () => void;
  onSuccess: (name: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchMode, onSuccess: _onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Trạng thái phục vụ luồng OTP
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [devOtpSuggestion, setDevOtpSuggestion] = useState(''); // Để hiển thị mã gợi ý ở chế độ Dev
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Yêu cầu gửi mã OTP về email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validation cơ bản trước khi gửi OTP
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

    try {
      const response = await fetch('http://localhost:3000/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể gửi mã OTP xác thực.');
      }

      setIsOtpSent(true);
      setOtpCountdown(60); // 60 giây chờ gửi lại
      setSuccessMsg('Mã xác thực OTP đã được gửi thành công.');
      
      // Hỗ trợ hiển thị trực tiếp OTP để test nhanh ở môi trường phát triển
      if (data.devOtp) {
        setDevOtpSuggestion(data.devOtp);
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi gửi mã xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit đăng ký tài khoản (khi đã nhập OTP)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isOtpSent) {
      // Nếu chưa gửi OTP, kích hoạt gửi OTP trước
      await handleSendOtp();
      return;
    }

    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP gồm 6 chữ số.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password: password,
          otpCode: otpCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký tài khoản thất bại.');
      }

      toast.success('Đăng ký tài khoản thành công! Vui lòng sử dụng thông tin đăng nhập của bạn.');
      onSwitchMode();
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left w-full max-w-sm mx-auto">
      {/* Tiêu đề biểu mẫu */}
      <div className="space-y-1.5">
        <h3 className="text-2xl font-black tracking-tight text-white m-0">Tạo tài khoản mới!</h3>
        <p className="text-xs text-slate-400">Tham gia ngay cộng đồng đặt lịch thể thao cao cấp</p>
      </div>

      {/* Thông báo lỗi nếu thất bại */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Thông báo thành công gửi OTP */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <MailCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Biểu mẫu đăng ký */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Trường nhập thông tin ban đầu (Ẩn/Disable khi đã gửi OTP thành công để tránh thay đổi email khi đang xác thực) */}
        <div className={`space-y-4 transition-all duration-300 ${isOtpSent ? 'opacity-40 pointer-events-none' : ''}`}>
          <InputField
            id="fullname"
            label="Họ và Tên"
            placeholder="Ví dụ: Nguyễn Văn A..."
            required={!isOtpSent}
            disabled={isOtpSent}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-emerald-500"
          />

          <InputField
            id="email"
            label="Địa chỉ Email"
            type="email"
            placeholder="email@example.com..."
            required={!isOtpSent}
            disabled={isOtpSent}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-emerald-500"
          />

          <InputField
            id="password"
            label="Mật khẩu bảo mật"
            type="password"
            placeholder="Tối thiểu từ 6 ký tự..."
            required={!isOtpSent}
            disabled={isOtpSent}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-emerald-500"
          />

          <InputField
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Nhập lại mật khẩu phía trên..."
            required={!isOtpSent}
            disabled={isOtpSent}
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
              disabled={isOtpSent}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer mt-0.5"
            />
            <label htmlFor="terms" className="cursor-pointer leading-normal">
              Tôi đồng ý với <a href="#terms" className="text-emerald-400 font-bold hover:underline">Điều khoản dịch vụ</a> của SportZone.
            </label>
          </div>
        </div>

        {/* PHÂN VÙNG NHẬP MÃ OTP (CHỈ HIỂN THỊ KHI ĐÃ GỬI OTP THÀNH CÔNG) */}
        {isOtpSent && (
          <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-850 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 animate-pulse" />
                Nhập Mã Xác Thực OTP *
              </label>
              
              {/* Nút gửi lại OTP */}
              {otpCountdown > 0 ? (
                <span className="text-[11px] text-slate-500 font-medium">Gửi lại sau {otpCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold bg-transparent border-0 cursor-pointer p-0 underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Gửi lại mã
                </button>
              )}
            </div>

            <InputField
              id="otpCode"
              type="text"
              placeholder="Nhập mã 6 chữ số..."
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Chỉ cho phép nhập số
              className="bg-slate-900 border-emerald-500/30 text-white text-center text-lg font-mono tracking-widest focus:bg-slate-950 focus:border-emerald-500"
            />

            {/* Dev Mode Helper suggestion */}
            {devOtpSuggestion && (
              <div className="text-[10px] text-slate-500 bg-slate-900/60 p-2 rounded-lg border border-slate-800 leading-normal">
                💡 <strong>Thử nghiệm nhanh:</strong> Mã OTP vừa gửi là <code className="text-emerald-400 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded">{devOtpSuggestion}</code> (hoặc xem trong Log của Terminal NestJS).
              </div>
            )}

            {/* Nút quay lại sửa thông tin email */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtpCode('');
                  setDevOtpSuggestion('');
                }}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-medium bg-transparent border-0 cursor-pointer p-0 underline"
              >
                Quay lại sửa thông tin
              </button>
            </div>
          </div>
        )}

        {/* Nút Hành động chính */}
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isLoading} 
          className="w-full py-3 mt-2 text-sm text-white font-extrabold cursor-pointer"
        >
          {isOtpSent ? 'Xác Nhận & Đăng Ký' : 'Nhận Mã Xác Thực OTP'}
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
