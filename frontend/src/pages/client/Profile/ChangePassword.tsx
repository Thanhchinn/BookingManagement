import React, { useState } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Lock, Key, ShieldCheck, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ChangePasswordProps {
  onNavigate?: (page: any, data?: any) => void;
  userName?: string;
  onLogout?: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ 
  onNavigate, 
  userName, 
  onLogout 
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get current user id
  const userInfoStr = localStorage.getItem('user_info');
  const currentUser = userInfoStr ? JSON.parse(userInfoStr) : null;
  const currentUserId = currentUser?.id || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error('Vui lòng đăng nhập để thực hiện hành động này.');
      onNavigate?.('auth', 'login');
      return;
    }

    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/users/${currentUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Thay đổi mật khẩu thất bại.');
      }

      toast.success('Đổi mật khẩu thành công!');
      
      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect to profile page after delay
      setTimeout(() => {
        onNavigate?.('profile');
      }, 1500);

    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      <div className="flex-grow max-w-2xl w-full mx-auto px-4 py-12" data-aos="fade-up">
        {/* Back Link */}
        <button
          onClick={() => onNavigate?.('profile')}
          className="text-xs text-slate-450 hover:text-slate-300 font-bold bg-transparent border-0 cursor-pointer transition flex items-center gap-1.5 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang hồ sơ cá nhân
        </button>

        {/* Content Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-left relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-indigo-500" />
          
          <div className="mb-6">
            <span className="text-[10px] bg-rose-500/10 border border-rose-500/25 text-rose-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Bảo mật tài khoản
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight mt-3">
              Đổi Mật Khẩu
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mật khẩu hiện tại */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <Key className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 border-0 bg-transparent text-slate-500 hover:text-slate-350 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <Lock className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 border-0 bg-transparent text-slate-500 hover:text-slate-350 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <ShieldCheck className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 border-0 bg-transparent text-slate-500 hover:text-slate-350 cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-emerald-500/10 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 border-0"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};
