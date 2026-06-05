import React from 'react';

interface SportsPitchItem {
  id: string;
  name: string;
  category: string;
  locationName: string;
}

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newSport: 'Cầu Lông' | 'Bóng Đá' | 'Pickleball' | 'Tennis' | 'Bóng Rổ';
  setNewSport: (val: any) => void;
  newSkill: 'Bất kỳ' | 'Mới chơi' | 'Khá' | 'Chuyên nghiệp';
  setNewSkill: (val: any) => void;
  selectedPitchId: string;
  setSelectedPitchId: (val: string) => void;
  sportsPitches: SportsPitchItem[];
  newDate: string;
  setNewDate: (val: string) => void;
  newStart: string;
  setNewStart: (val: string) => void;
  newEnd: string;
  setNewEnd: (val: string) => void;
  newMax: number;
  setNewMax: (val: number) => void;
  newDesc: string;
  setNewDesc: (val: string) => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newTitle,
  setNewTitle,
  newSport,
  setNewSport,
  newSkill,
  setNewSkill,
  selectedPitchId,
  setSelectedPitchId,
  sportsPitches,
  newDate,
  setNewDate,
  newStart,
  setNewStart,
  newEnd,
  setNewEnd,
  newMax,
  setNewMax,
  newDesc,
  setNewDesc,
}) => {
  if (!isOpen) return null;

  // Lọc danh sách sân theo môn thể thao đã chọn
  const filteredPitches = sportsPitches.filter(
    (pitch) => pitch.category.toLowerCase() === newSport.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <form 
        onSubmit={onSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left space-y-4.5 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200 max-h-[90svh] overflow-y-auto"
      >
        <div className="flex items-center gap-3 text-emerald-400 border-b border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shrink-0">
            🏸
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white m-0">Đăng Tin Ghép Cặp / Tìm Đồng Đội</h4>
            <p className="text-[10px] text-slate-400 m-0">Tạo tin tuyển vãng lai chuyên nghiệp nhanh chóng</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Tiêu đề */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Tiêu đề tin tuyển (Ngắn gọn, hấp dẫn):</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Cần tuyển 3 chân sút sân 5 đá giao hữu tối nay..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Bộ môn */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Chọn bộ môn:</label>
              <select
                value={newSport}
                onChange={(e) => {
                  setNewSport(e.target.value as any);
                  setSelectedPitchId(''); // Reset pitch selection when sport changes
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 outline-none"
              >
                <option value="Cầu Lông">Cầu Lông</option>
                <option value="Bóng Đá">Bóng Đá</option>
                <option value="Pickleball">Pickleball</option>
                <option value="Tennis">Tennis</option>
                <option value="Bóng Rổ">Bóng Rổ</option>
              </select>
            </div>

            {/* Trình độ */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Trình độ mong muốn:</label>
              <select
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 outline-none"
              >
                <option value="Bất kỳ">Bất kỳ</option>
                <option value="Mới chơi">Mới chơi</option>
                <option value="Khá">Khá</option>
                <option value="Chuyên nghiệp">Chuyên nghiệp</option>
              </select>
            </div>
          </div>

          {/* Sân bãi */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Chọn sân thi đấu:</label>
            <select
              required
              value={selectedPitchId}
              onChange={(e) => setSelectedPitchId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 outline-none"
            >
              <option value="">-- Chọn sân ({newSport}) --</option>
              {filteredPitches.map((pitch) => (
                <option key={pitch.id} value={pitch.id}>
                  {pitch.locationName} - {pitch.name}
                </option>
              ))}
            </select>
            {filteredPitches.length === 0 && (
              <span className="text-[10px] text-amber-500 block mt-1">
                Lưu ý: Không tìm thấy sân nào thuộc bộ môn này trên hệ thống.
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Ngày */}
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-slate-300 block">Ngày chơi:</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 outline-none"
              />
            </div>
            {/* Giờ đầu */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Giờ bắt đầu:</label>
              <input
                type="text"
                required
                placeholder="18:00"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 outline-none font-mono"
              />
            </div>
            {/* Giờ cuối */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Giờ kết thúc:</label>
              <input
                type="text"
                required
                placeholder="20:00"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 outline-none font-mono"
              />
            </div>
          </div>

          {/* Số lượng / Mô tả */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Tổng số người chơi:</label>
              <input
                type="number"
                min={2}
                max={22}
                required
                value={newMax}
                onChange={(e) => setNewMax(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 outline-none font-mono"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block">Mô tả chi tiết / Lời nhắn:</label>
              <textarea
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Ghi rõ chi phí chia đầu người, yêu cầu chiến thuật hoặc giới tính..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3.5 text-xs text-slate-300 outline-none transition resize-none h-14"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white border-0 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-600/10"
          >
            Đăng Bài Tìm Đội Ngay
          </button>
        </div>
      </form>
    </div>
  );
};
