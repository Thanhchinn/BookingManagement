import React, { useState, useEffect } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, Calendar, Clock, MapPin, Trophy, Users, Info } from 'lucide-react';
import { toast } from 'sonner';

interface SportsPitchItem {
  id: string;
  name: string;
  category: string;
  locationName: string;
  locationId: string;
}

interface MatchmakingCreateProps {
  onNavigate?: (page: any, authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
}

export const MatchmakingCreate: React.FC<MatchmakingCreateProps> = ({ onNavigate, userName, onLogout }) => {
  // Lấy client token thực tế từ localStorage (đồng bộ với hệ thống)
  const getClientToken = () => localStorage.getItem('user_token');

  // Kiểm tra đăng nhập khi vừa vào trang
  useEffect(() => {
    const token = getClientToken();
    if (!token) {
      toast.warning('Vui lòng đăng nhập trước khi tạo phòng ghép đôi');
      onNavigate?.('auth', 'login');
    }
  }, [onNavigate]);

  // States của form
  const [newTitle, setNewTitle] = useState('');
  const [newSport, setNewSport] = useState<string>('cau-long');
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('18:00');
  const [newEnd, setNewEnd] = useState('20:00');
  const [newSkill, setNewSkill] = useState<'Bất kỳ' | 'Mới chơi' | 'Khá' | 'Chuyên nghiệp'>('Bất kỳ');
  const [newMax, setNewMax] = useState(4);
  const [neededPlayers, setNeededPlayers] = useState(3); // Số lượng cần tuyển thêm
  const [newDesc, setNewDesc] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedPitchId, setSelectedPitchId] = useState('');
  const [sportsPitches, setSportsPitches] = useState<SportsPitchItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Tải danh sách sân từ API
  useEffect(() => {
    const fetchSportsPitches = async () => {
      try {
        const res = await fetch('http://localhost:3000/public/sports-pitches');
        if (res.ok) {
          const data = await res.json();
          setSportsPitches(data);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách sân:', err);
      }
    };
    fetchSportsPitches();
  }, []);

  // Lọc sân theo môn thể thao đã chọn
  const filteredPitches = sportsPitches.filter(
    (pitch) => pitch.category.toLowerCase() === newSport.toLowerCase()
  );

  // Lọc các cơ sở duy nhất dựa trên danh sách sân của môn thể thao đó
  const uniqueLocations = Array.from(
    new Map(
      filteredPitches
        .filter(p => p.locationId && p.locationName)
        .map((p) => [p.locationId, p.locationName])
    ).entries()
  ).map(([id, name]) => ({ id, name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getClientToken();
    if (!token) {
      toast.warning('Vui lòng đăng nhập trước khi tạo phòng ghép đôi');
      onNavigate?.('auth', 'login');
      return;
    }

    if (!selectedPitchId) {
      toast.warning('Vui lòng chọn sân đấu.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/matchmaking/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          sportsPitchId: selectedPitchId,
          playDate: newDate || new Date().toISOString().split('T')[0],
          startTime: newStart,
          endTime: newEnd,
          skillLevel: newSkill,
          maxPlayers: Number(newMax)
        })
      });

      if (res.ok) {
        toast.success('Đăng bài tìm đội thành công!', {
          description: 'Bài ghép đôi đang được gửi tới Admin duyệt trước khi hiển thị công khai.',
        });
        // Quay về trang ghép kèo
        onNavigate?.('matchmaking');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Lỗi khi đăng bài ghép đôi.');
      }
    } catch (err) {
      toast.error('Không thể kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* 1. THANH NAVBAR DÙNG CHUNG */}
      <Navbar userName={userName} onLogout={onLogout} onNavigate={onNavigate} />

      {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 text-left">
        {/* Back Button */}
        <button
          onClick={() => onNavigate?.('matchmaking')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-bold bg-transparent border-0 cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách ca ghép</span>
        </button>

        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xl shrink-0 select-none">
              🏸
            </span>
            Đăng Tin Tìm Teammate / Đối Thủ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Tạo bài đăng nhanh chóng để tuyển thêm người chơi vãng lai cho ca đấu của bạn.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tiêu đề */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                Tiêu đề bài đăng
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Cần tuyển gấp 2 tay vợt giao lưu cầu lông tối nay Quận 1..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 p-3.5 rounded-2xl text-xs sm:text-sm text-white outline-none transition"
              />
            </div>

            {/* Môn thể thao & Trình độ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  Chọn bộ môn thể thao
                </label>
                <select
                  value={newSport}
                  onChange={(e) => {
                    setNewSport(e.target.value);
                    setSelectedLocationId('');
                    setSelectedPitchId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition cursor-pointer"
                >
                  <option value="cau-long">Cầu Lông</option>
                  <option value="bong-da">Bóng Đá</option>
                  <option value="pickleball">Pickleball</option>
                  <option value="tennis">Tennis</option>
                  <option value="bong-ro">Bóng Rổ</option>
                </select>              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Yêu cầu trình độ
                </label>
                <select
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition cursor-pointer"
                >
                  <option value="Bất kỳ">Bất kỳ trình độ</option>
                  <option value="Mới chơi">Mới chơi (Beginner)</option>
                  <option value="Khá">Khá (Intermediate)</option>
                  <option value="Chuyên nghiệp">Chuyên nghiệp (Advanced)</option>
                </select>
              </div>
            </div>

            {/* Cơ sở thi đấu & Sân thi đấu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Chọn cơ sở thi đấu
                  <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedLocationId}
                  onChange={(e) => {
                    setSelectedLocationId(e.target.value);
                    setSelectedPitchId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition cursor-pointer"
                >
                  <option value="">-- Chọn cơ sở thi đấu --</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Chọn sân cụ thể
                  <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={!selectedLocationId}
                  value={selectedPitchId}
                  onChange={(e) => setSelectedPitchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Chọn sân thuộc cơ sở này --</option>
                  {filteredPitches
                    .filter((p) => p.locationId === selectedLocationId)
                    .map((pitch) => (
                      <option key={pitch.id} value={pitch.id}>
                        {pitch.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            {filteredPitches.length === 0 && (
              <div className="flex items-center gap-2 text-amber-500 text-[10px] mt-1 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Không tìm thấy cơ sở/sân nào đăng ký bộ môn này trên hệ thống.</span>
              </div>
            )}

            {/* Ngày và Giờ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Ngày thi đấu
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Giờ bắt đầu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 18:00"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Giờ kết thúc
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 20:00"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition font-mono"
                />
              </div>
            </div>

            {/* Số lượng thành viên tối đa & Lời nhắn */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Số lượng cần tuyển thêm
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={neededPlayers}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setNeededPlayers(val);
                    setNewMax(val + 1); // Host (1) + needed players
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition font-mono"
                />
                <span className="text-[10px] text-slate-500 block">Ví dụ: Cần tuyển thêm 3 người, hệ thống sẽ lưu tổng số người chơi là 4 (gồm cả bạn).</span>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs sm:text-sm font-bold text-slate-200">
                  Mô tả chi tiết / Lời nhắn chia sẻ
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả cụ thể chi phí chia đầu người, trình độ mong muốn chi tiết, liên hệ dự phòng..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-300 outline-none transition resize-none h-24"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => onNavigate?.('matchmaking')}
                className="px-6 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs sm:text-sm font-bold text-slate-400 hover:text-white rounded-2xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <Button
                type="submit"
                disabled={submitting}
                variant="primary"
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm font-bold text-white border-0 rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-600/15"
              >
                {submitting ? 'Đang gửi bài...' : 'Đăng Ca Tìm Teammate Ngay'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* 3. THANH FOOTER DÙNG CHUNG */}
      <Footer />
    </div>
  );
};
