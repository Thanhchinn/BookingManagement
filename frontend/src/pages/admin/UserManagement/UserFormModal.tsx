import React, { useState } from 'react';
import { UserPlus, X, ShieldAlert, ToggleLeft, ToggleRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { type UserItem } from './UserManagement';
import { AddressSelector } from '../../../components/ui/AddressSelector';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: UserItem | null;
  formFullName: string;
  setFormFullName: (val: string) => void;
  formEmail: string;
  setFormEmail: (val: string) => void;
  formPassword: string;
  setFormPassword: (val: string) => void;
  formPhone: string;
  setFormPhone: (val: string) => void;
  formLoyaltyPoints: number;
  setFormLoyaltyPoints: (val: number) => void;
  formCity: string;
  setFormCity: (val: string) => void;
  formDistrict: string;
  setFormDistrict: (val: string) => void;
  formWard: string;
  setFormWard: (val: string) => void;
  formAddress: string;
  setFormAddress: (val: string) => void;
  formIsActive: boolean;
  setFormIsActive: (val: boolean) => void;
  formError: string;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  formFullName,
  setFormFullName,
  formEmail,
  setFormEmail,
  formPassword,
  setFormPassword,
  formPhone,
  setFormPhone,
  formLoyaltyPoints,
  setFormLoyaltyPoints,
  formCity,
  setFormCity,
  formDistrict,
  setFormDistrict,
  formWard,
  setFormWard,
  formAddress,
  setFormAddress,
  formIsActive,
  setFormIsActive,
  formError,
  isSaving,
  onSave
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Nền mờ tối */}
      <div 
        onClick={isSaving ? undefined : onClose}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Cửa sổ Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md max-h-[90vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-sm font-black text-white m-0 tracking-tight uppercase flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            {editingUser ? 'Cập Nhật Tài Khoản' : 'Thêm Tài Khoản Mới'}
          </h3>
          <button 
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl cursor-pointer border-0 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lỗi xác thực nếu có */}
        {formError && (
          <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[11px] font-bold flex items-center gap-1.5 leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form chính */}
        <form onSubmit={onSave} className="space-y-6 text-left">
          
          {/* SECTION 1: THÔNG TIN TÀI KHOẢN */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">Thông tin tài khoản</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Họ Tên */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Họ và tên *</label>
                <input 
                  type="text"
                  disabled={isSaving}
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-750 transition"
                  required
                />
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                <input 
                  type="text"
                  disabled={isSaving}
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Ví dụ: 0987654321..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-750 transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Địa chỉ Email *</label>
                <input 
                  type="email"
                  disabled={isSaving}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-750 transition"
                  required
                />
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Mật khẩu {editingUser ? '' : '*'}
                  </label>
                  {editingUser && (
                    <span className="text-[9px] text-slate-550 font-medium italic">Để trống nếu không đổi</span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input 
                    type={showPassword ? "text" : "password"}
                    disabled={isSaving}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUser ? "Nhập mật khẩu mới..." : "Ít nhất 6 ký tự..."}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white pl-3 pr-10 py-2.5 rounded-xl focus:outline-none placeholder-slate-750 transition"
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-550 hover:text-slate-350 cursor-pointer bg-transparent border-0 p-0 flex items-center justify-center focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: CHI TIẾT ĐỊA CHỈ & ĐIỂM THƯỞNG */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">Thông tin bổ sung & Địa chỉ</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Điểm tích lũy */}
              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Điểm tích lũy Loyalty</label>
                <input 
                  type="number"
                  disabled={isSaving}
                  value={formLoyaltyPoints}
                  onChange={(e) => setFormLoyaltyPoints(Number(e.target.value))}
                  placeholder="0"
                  min={0}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-750 transition"
                />
              </div>

              {/* BỘ CHỌN ĐỊA CHỈ PHÂN CẤP TỈNH/HUYỆN/XÃ DÙNG CHUNG CHO TOÀN ADMIN */}
              <AddressSelector
                city={formCity}
                onCityChange={setFormCity}
                district={formDistrict}
                onDistrictChange={setFormDistrict}
                ward={formWard}
                onWardChange={setFormWard}
                address={formAddress}
                onAddressChange={setFormAddress}
                disabled={isSaving}
              />

            </div>
          </div>

          {/* SECTION 3: TRẠNG THÁI HOẠT ĐỘNG */}
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-850 select-none">
            <div>
              <span className="text-xs font-bold text-white block">Cho phép hoạt động</span>
              <span className="text-[9px] text-slate-550">Mở/khóa trạng thái đăng nhập hệ thống của người dùng này</span>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setFormIsActive(!formIsActive)}
              className="bg-transparent border-0 cursor-pointer p-0 text-slate-400 hover:text-white disabled:opacity-50 transition duration-150"
            >
              {formIsActive ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>

          {/* Footer nút hành động */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang lưu tài khoản...</span>
                </>
              ) : (
                <span>Lưu tài khoản</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
