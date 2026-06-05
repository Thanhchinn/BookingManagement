import React, { useState, useEffect } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import {
  User, Mail, Phone, MapPin, Lock, Save, Camera,
  ShieldCheck, Edit3, X, Home, Calendar, Sparkles, Trophy, Clock, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { AddressSelector } from '../../../components/ui/AddressSelector';

interface ProfileProps {
  onNavigate?: (page: any, data?: any) => void;
  userName?: string;
  onLogout?: () => void;
  onProfileUpdated?: (newName: string) => void;
}

const PRESET_AVATARS = [
  '⚽', '🏀', '🎾', '🏸', '🏐', '⛳', '🥋', '🥊',
  '🦁', '🐯', '🦊', '🐻', '🐼', '🐨', '🤖', '👽',
  '👤', '🦸', '🥷', '🧑', '🧙', '🧝', '🧛', '🧟'
];

interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  birthDate?: string;
  gender?: string;
  bio?: string;
  favoriteSports?: string[];
  skillLevels?: Record<string, string>;
  preferredPlayTime?: { weekdays: string[]; weekends: string[] };
}

export const Profile: React.FC<ProfileProps> = ({
  onNavigate,
  userName,
  onLogout,
  onProfileUpdated
}) => {
  const [fetching, setFetching] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Displayed user info (read-only view)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '', email: '', phone: '', avatarUrl: '👤',
    address: '', ward: '', district: '', city: '',
    birthDate: '', gender: '', bio: '', favoriteSports: [], skillLevels: {},
    preferredPlayTime: { weekdays: [], weekends: [] }
  });

  // Edit form state (inside modal)
  const [editForm, setEditForm] = useState<UserInfo>({ ...userInfo });

  const [availableSports, setAvailableSports] = useState<string[]>(['Cầu Lông', 'Bóng Đá', 'Pickleball', 'Tennis', 'Bóng Rổ']);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3000/categories');
        if (res.ok) {
          const data = await res.json();
          const activeSports = data
            .filter((cat: any) => cat.isActive !== false)
            .map((cat: any) => cat.name);
          if (activeSports.length > 0) {
            setAvailableSports(activeSports);
          }
        }
      } catch (error) {
        console.error('Lỗi khi fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const userInfoStr = localStorage.getItem('user_info');
  const currentUser = userInfoStr ? JSON.parse(userInfoStr) : null;
  const currentUserId = currentUser?.id || null;

  useEffect(() => {
    if (!currentUserId) {
      toast.error('Vui lòng đăng nhập để truy cập trang cá nhân.');
      onNavigate?.('auth', 'login');
      return;
    }

    const fetchUserProfile = async () => {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      try {
        setFetching(true);
        const res = await fetch(`http://localhost:3000/users/${currentUserId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_info');
            onLogout?.();
            onNavigate?.('auth', 'login');
            throw new Error('Tài khoản của bạn đã bị khóa hoặc phiên làm việc hết hạn.');
          }
          throw new Error('Không thể tải thông tin tài khoản.');
        }
        const data = await res.json();
        const info: UserInfo = {
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || '👤',
          address: data.address || '',
          ward: data.ward || '',
          district: data.district || '',
          city: data.city || '',
          birthDate: data.birthDate ? data.birthDate.substring(0, 10) : '',
          gender: data.gender || '',
          bio: data.bio || '',
          favoriteSports: Array.isArray(data.favoriteSports) ? data.favoriteSports : [],
          skillLevels: data.skillLevels || {},
          preferredPlayTime: data.preferredPlayTime || { weekdays: [], weekends: [] },
        };
        setUserInfo(info);
        setEditForm(info);
      } catch (err: any) {
        toast.error(`Lỗi: ${err.message}`);
      } finally {
        setFetching(false);
      }
    };

    fetchUserProfile();
  }, [currentUserId]);

  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File ảnh không được lớn hơn 2MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('user_token');
    try {
      setUploading(true);
      const res = await fetch('http://localhost:3000/users/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Tải ảnh lên thất bại.');
      }

      const data = await res.json();
      setEditForm(f => ({ ...f, avatarUrl: data.avatarUrl }));
      toast.success('Tải ảnh đại diện lên thành công!');
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const openModal = () => {
    setEditForm({ ...userInfo });
    setShowEditModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) { toast.error('Họ và tên không được để trống.'); return; }
    if (!editForm.email.trim() || !editForm.email.includes('@')) { toast.error('Email không hợp lệ.'); return; }
    if (!editForm.phone.trim()) { toast.error('Số điện thoại không được để trống.'); return; }

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
          fullName: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
          avatarUrl: editForm.avatarUrl,
          address: editForm.address,
          ward: editForm.ward,
          district: editForm.district,
          city: editForm.city,
          birthDate: editForm.birthDate || null,
          gender: editForm.gender || null,
          bio: editForm.bio || null,
          favoriteSports: editForm.favoriteSports || [],
          skillLevels: editForm.skillLevels || {},
          preferredPlayTime: editForm.preferredPlayTime || { weekdays: [], weekends: [] },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Cập nhật tài khoản thất bại.');
      }

      const updated = await res.json();
      const newInfo: UserInfo = {
        fullName: updated.fullName || '',
        email: updated.email || '',
        phone: updated.phone || '',
        avatarUrl: updated.avatarUrl || '👤',
        address: updated.address || '',
        ward: updated.ward || '',
        district: updated.district || '',
        city: updated.city || '',
        birthDate: updated.birthDate ? updated.birthDate.substring(0, 10) : '',
        gender: updated.gender || '',
        bio: updated.bio || '',
        favoriteSports: Array.isArray(updated.favoriteSports) ? updated.favoriteSports : [],
        skillLevels: updated.skillLevels || {},
        preferredPlayTime: updated.preferredPlayTime || { weekdays: [], weekends: [] },
      };

      setUserInfo(newInfo);
      localStorage.setItem('user_info', JSON.stringify({ ...currentUser, ...newInfo }));
      window.dispatchEvent(new Event('user_profile_updated'));
      onProfileUpdated?.(updated.fullName);
      toast.success('Cập nhật thông tin thành công!');
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fullAddress = [userInfo.address, userInfo.ward, userInfo.district, userInfo.city]
    .filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-10" data-aos="fade-up">

        {/* Back button */}
        <button
          onClick={() => onNavigate?.('home')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold transition mb-6 bg-transparent border-0 cursor-pointer p-0 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Quay lại trang chủ
        </button>

        {/* Page header */}
        <div className="mb-8">
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Tài Khoản Thành Viên
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-3">Hồ Sơ Cá Nhân</h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Xem thông tin cá nhân và tùy chỉnh hồ sơ của bạn.
          </p>
        </div>

        {fetching ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Đang tải hồ sơ...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ── Left: Avatar card ── */}
            <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 blur-xl" />

              <div className="relative inline-block mx-auto">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-5xl select-none overflow-hidden">
                  {userInfo.avatarUrl?.startsWith('http') ? (
                    <img src={userInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userInfo.avatarUrl || '👤'
                  )}
                </div>
                <button
                  onClick={openModal}
                  className="absolute bottom-0 right-0 bg-emerald-500 text-slate-950 p-1.5 rounded-full border border-slate-900 shadow-md cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{userInfo.fullName || 'Người dùng'}</h3>
                <span className="text-xs bg-slate-800 text-emerald-400 font-bold px-2.5 py-1 rounded-lg mt-1 inline-block">
                  {userInfo.phone || 'Chưa có SĐT'}
                </span>
                <p className="text-xs text-slate-400 mt-1.5 break-all">{userInfo.email}</p>
              </div>

              {/* Quick actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={openModal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-2xl transition cursor-pointer border-0"
                >
                  <Edit3 className="w-4 h-4" />
                  Cập nhật thông tin
                </button>
                <button
                  onClick={() => onNavigate?.('change-password')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-2xl transition cursor-pointer border-0"
                >
                  <Lock className="w-4 h-4" />
                  Đổi mật khẩu
                </button>
              </div>
            </div>

            {/* ── Right: Info panels ── */}
            <div className="md:col-span-2 space-y-5">

              {/* Personal info */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-extrabold text-white flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-emerald-400" />
                    Thông tin cá nhân
                  </h3>
                  <button
                    onClick={openModal}
                    className="flex items-center gap-1.5 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold bg-transparent border-0 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={<User className="w-4 h-4 text-slate-500" />} label="Họ và tên" value={userInfo.fullName} />
                  <InfoRow icon={<Phone className="w-4 h-4 text-slate-500" />} label="Số điện thoại" value={userInfo.phone} />
                  <InfoRow icon={<Mail className="w-4 h-4 text-slate-500" />} label="Email" value={userInfo.email} className="sm:col-span-2" />
                  
                  <InfoRow icon={<Calendar className="w-4 h-4 text-slate-500" />} label="Ngày sinh" value={userInfo.birthDate ? new Date(userInfo.birthDate).toLocaleDateString('vi-VN') : ''} />
                  <InfoRow icon={<User className="w-4 h-4 text-slate-500" />} label="Giới tính" value={userInfo.gender === 'MALE' ? 'Nam' : userInfo.gender === 'FEMALE' ? 'Nữ' : userInfo.gender === 'OTHER' ? 'Khác' : ''} />
                  
                  {/* Favorite sports and skill levels */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Môn thể thao & Trình độ</p>
                    {userInfo.favoriteSports && userInfo.favoriteSports.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userInfo.favoriteSports.map(sport => {
                          const level = userInfo.skillLevels?.[sport] || 'Bất kỳ';
                          const levelLabel = level === 'BEGINNER' ? 'Mới chơi' : level === 'INTERMEDIATE' ? 'Khá' : level === 'ADVANCED' ? 'Chuyên nghiệp' : level;
                          return (
                            <div key={sport} className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                              <span className="font-bold text-emerald-400">{sport}</span>
                              <span className="text-slate-400">|</span>
                              <span className="text-slate-300 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">{levelLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Chưa chọn môn thể thao yêu thích</span>
                    )}
                  </div>

                  {/* Preferred play time */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Thời gian chơi ưa thích</p>
                    {((userInfo.preferredPlayTime?.weekdays && userInfo.preferredPlayTime.weekdays.length > 0) || 
                      (userInfo.preferredPlayTime?.weekends && userInfo.preferredPlayTime.weekends.length > 0)) ? (
                      <div className="space-y-1">
                        {userInfo.preferredPlayTime.weekdays && userInfo.preferredPlayTime.weekdays.length > 0 && (
                          <div className="text-xs text-slate-300">
                            <span className="font-bold text-slate-400 mr-2">Ngày trong tuần:</span>
                            {userInfo.preferredPlayTime.weekdays.map(t => t === 'morning' ? 'Sáng' : t === 'afternoon' ? 'Chiều' : 'Tối').join(', ')}
                          </div>
                        )}
                        {userInfo.preferredPlayTime.weekends && userInfo.preferredPlayTime.weekends.length > 0 && (
                          <div className="text-xs text-slate-300">
                            <span className="font-bold text-slate-400 mr-2">Cuối tuần:</span>
                            {userInfo.preferredPlayTime.weekends.map(t => t === 'morning' ? 'Sáng' : t === 'afternoon' ? 'Chiều' : 'Tối').join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Chưa cập nhật thời gian rảnh</span>
                    )}
                  </div>

                  <InfoRow icon={<Sparkles className="w-4 h-4 text-slate-500" />} label="Tiểu sử / Lời giới thiệu" value={userInfo.bio} className="sm:col-span-2" />
                </div>
              </div>

              {/* Address info */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-extrabold text-white flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Địa chỉ liên hệ
                  </h3>
                  <button
                    onClick={openModal}
                    className="flex items-center gap-1.5 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold bg-transparent border-0 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                </div>

                {fullAddress ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InfoRow icon={<MapPin className="w-4 h-4 text-slate-500" />} label="Phường / Xã" value={userInfo.ward} />
                    <InfoRow icon={<MapPin className="w-4 h-4 text-slate-500" />} label="Quận / Huyện" value={userInfo.district} />
                    <InfoRow icon={<MapPin className="w-4 h-4 text-slate-500" />} label="Tỉnh / TP" value={userInfo.city} />
                    <InfoRow icon={<Home className="w-4 h-4 text-slate-500" />} label="Địa chỉ chi tiết" value={userInfo.address} className="sm:col-span-3" />
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <MapPin className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="text-xs text-slate-500">Bạn chưa cập nhật địa chỉ liên hệ.</p>
                    <button
                      onClick={openModal}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-transparent border-0 cursor-pointer underline"
                    >
                      Thêm địa chỉ ngay
                    </button>
                  </div>
                )}
              </div>

              {/* Security panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="font-extrabold text-white flex items-center gap-2 text-sm pb-3 border-b border-slate-800 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Bảo mật tài khoản
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-300">Mật khẩu đăng nhập</p>
                    <p className="text-xs text-slate-500 mt-0.5">Cập nhật mật khẩu thường xuyên để bảo vệ tài khoản</p>
                  </div>
                  <button
                    onClick={() => onNavigate?.('change-password')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer border-0 shrink-0 ml-4"
                  >
                    <Lock className="w-3.5 h-3.5" /> Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <Footer />

      {/* ── Edit Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />

          {/* Modal content */}
          <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-3xl z-10">
              <h2 className="font-black text-white text-base">Cập nhật thông tin</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border-0 bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 pb-6 pt-5 space-y-5">

              {/* Avatar picker */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Biểu tượng đại diện
                </label>
                
                {/* Custom Avatar preview and File Uploader */}
                <div className="flex items-center gap-4 bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-3xl select-none overflow-hidden shrink-0">
                    {editForm.avatarUrl?.startsWith('http') ? (
                      <img src={editForm.avatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                    ) : (
                      editForm.avatarUrl || '👤'
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs font-bold text-slate-300">Tải ảnh lên từ thiết bị</p>
                    <p className="text-[10px] text-slate-500">Chấp nhận định dạng JPG, PNG, WEBP tối đa 2MB.</p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] rounded-lg cursor-pointer transition">
                      <Camera className="w-3.5 h-3.5" />
                      {uploading ? 'Đang tải lên...' : 'Chọn ảnh'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">
                    Hoặc chọn từ kho biểu tượng có sẵn
                  </label>
                  <div className="grid grid-cols-8 gap-2 bg-slate-950/50 rounded-2xl p-2 border border-slate-800 max-h-28 overflow-y-auto">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av}
                        onClick={() => setEditForm(f => ({ ...f, avatarUrl: av }))}
                        type="button"
                        className={`text-2xl p-1 rounded-xl transition cursor-pointer flex items-center justify-center border-2 ${
                          editForm.avatarUrl === av
                            ? 'bg-emerald-500/20 border-emerald-500 scale-110'
                            : 'bg-transparent border-transparent hover:bg-slate-800/50'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalField
                  label="Họ và tên *"
                  icon={<User className="w-4 h-4 text-slate-500" />}
                  type="text"
                  value={editForm.fullName}
                  onChange={v => setEditForm(f => ({ ...f, fullName: v }))}
                  placeholder="Nhập họ và tên"
                  required
                />
                <ModalField
                  label="Số điện thoại *"
                  icon={<Phone className="w-4 h-4 text-slate-500" />}
                  type="tel"
                  value={editForm.phone}
                  onChange={v => setEditForm(f => ({ ...f, phone: v }))}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              {/* Email */}
              <ModalField
                label="Email *"
                icon={<Mail className="w-4 h-4 text-slate-500" />}
                type="email"
                value={editForm.email}
                onChange={v => setEditForm(f => ({ ...f, email: v }))}
                placeholder="Nhập email"
                required
              />

              {/* Ngày sinh + Giới tính */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalField
                  label="Ngày sinh"
                  icon={<Calendar className="w-4 h-4 text-slate-500" />}
                  type="date"
                  value={editForm.birthDate || ''}
                  onChange={v => setEditForm(f => ({ ...f, birthDate: v }))}
                />
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Giới tính</label>
                  <div className="relative">
                    <select
                      value={editForm.gender || ''}
                      onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition appearance-none"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tiểu sử */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Tiểu sử / Lời giới thiệu</label>
                <textarea
                  value={editForm.bio || ''}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Giới thiệu bản thân, trình độ chơi thể thao của bạn..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>

              {/* Môn thể thao yêu thích & Trình độ */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider block">
                  Môn thể thao yêu thích & Trình độ
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableSports.map(sport => {
                    const isChecked = editForm.favoriteSports?.includes(sport) || false;
                    const level = editForm.skillLevels?.[sport] || 'Bất kỳ';

                    const handleSportChange = (checked: boolean) => {
                      let nextSports = [...(editForm.favoriteSports || [])];
                      if (checked) {
                        nextSports.push(sport);
                      } else {
                        nextSports = nextSports.filter(s => s !== sport);
                      }
                      setEditForm(f => ({ ...f, favoriteSports: nextSports }));
                    };

                    const handleLevelChange = (newLevel: string) => {
                      const nextLevels = { ...(editForm.skillLevels || {}) };
                      nextLevels[sport] = newLevel;
                      setEditForm(f => ({ ...f, skillLevels: nextLevels }));
                    };

                    return (
                      <div key={sport} className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => handleSportChange(e.target.checked)}
                              className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900 cursor-pointer"
                            />
                            {sport}
                          </label>
                        </div>
                        {isChecked && (
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-black block">Trình độ chơi</label>
                            <select
                              value={level}
                              onChange={e => handleLevelChange(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 text-[11px] text-white focus:outline-none focus:border-emerald-500 transition appearance-none"
                            >
                              <option value="Bất kỳ">Bất kỳ</option>
                              <option value="BEGINNER">Mới chơi</option>
                              <option value="INTERMEDIATE">Khá</option>
                              <option value="ADVANCED">Chuyên nghiệp</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thời gian chơi thích hợp */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider block">
                  Thời gian chơi thích hợp
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Trong tuần */}
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Trong tuần</span>
                    <div className="flex gap-4">
                      {['morning', 'afternoon', 'evening'].map(time => {
                        const label = time === 'morning' ? 'Sáng' : time === 'afternoon' ? 'Chiều' : 'Tối';
                        const isChecked = editForm.preferredPlayTime?.weekdays?.includes(time) || false;

                        const handleChange = (checked: boolean) => {
                          const weekdays = [...(editForm.preferredPlayTime?.weekdays || [])];
                          const nextWeekdays = checked ? [...weekdays, time] : weekdays.filter(t => t !== time);
                          setEditForm(f => ({
                            ...f,
                            preferredPlayTime: {
                              weekdays: nextWeekdays,
                              weekends: f.preferredPlayTime?.weekends || []
                            }
                          }));
                        };

                        return (
                          <label key={time} className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => handleChange(e.target.checked)}
                              className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5 bg-slate-900 cursor-pointer"
                            />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cuối tuần */}
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Cuối tuần</span>
                    <div className="flex gap-4">
                      {['morning', 'afternoon', 'evening'].map(time => {
                        const label = time === 'morning' ? 'Sáng' : time === 'afternoon' ? 'Chiều' : 'Tối';
                        const isChecked = editForm.preferredPlayTime?.weekends?.includes(time) || false;

                        const handleChange = (checked: boolean) => {
                          const weekends = [...(editForm.preferredPlayTime?.weekends || [])];
                          const nextWeekends = checked ? [...weekends, time] : weekends.filter(t => t !== time);
                          setEditForm(f => ({
                            ...f,
                            preferredPlayTime: {
                              weekdays: f.preferredPlayTime?.weekdays || [],
                              weekends: nextWeekends
                            }
                          }));
                        };

                        return (
                          <label key={time} className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => handleChange(e.target.checked)}
                              className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5 bg-slate-900 cursor-pointer"
                            />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address section — dùng AddressSelector chuẩn giống Admin */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider block">
                  Địa chỉ liên hệ
                </span>
                <AddressSelector
                  city={editForm.city}
                  onCityChange={v => setEditForm(f => ({ ...f, city: v }))}
                  district={editForm.district}
                  onDistrictChange={v => setEditForm(f => ({ ...f, district: v }))}
                  ward={editForm.ward}
                  onWardChange={v => setEditForm(f => ({ ...f, ward: v }))}
                  address={editForm.address}
                  onAddressChange={v => setEditForm(f => ({ ...f, address: v }))}
                  containerClassName="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  selectClassName="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-3 rounded-2xl focus:outline-none transition disabled:opacity-40 disabled:cursor-not-allowed appearance-none"
                  inputClassName="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-3 rounded-2xl focus:outline-none placeholder:text-slate-600 transition"
                  labelClassName="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer border-0"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer border-0 flex items-center gap-2"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    : <Save className="w-4 h-4" />
                  }
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Helper: read-only row ── */
function InfoRow({
  icon, label, value, className = ''
}: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-slate-200 font-semibold">
          {value || <span className="text-slate-600 italic">Chưa cập nhật</span>}
        </span>
      </div>
    </div>
  );
}

/* ── Helper: modal input field ── */
function ModalField({
  label, icon, type, value, onChange, placeholder, required, className = ''
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{icon}</span>
      </div>
    </div>
  );
}
