import React from 'react';
import { Dumbbell, X, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react';

interface SportItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  totalFields: number;
  isActive: boolean;
}

interface SportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSport: SportItem | null;
  formName: string;
  setFormName: (val: string) => void;
  formIcon: string;
  setFormIcon: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formIsActive: boolean;
  setFormIsActive: (val: boolean) => void;
  formError: string;
  onSave: (e: React.FormEvent) => void;
}

export const SportFormModal: React.FC<SportFormModalProps> = ({
  isOpen,
  onClose,
  editingSport,
  formName,
  setFormName,
  formIcon,
  setFormIcon,
  formDescription,
  setFormDescription,
  formIsActive,
  setFormIsActive,
  formError,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Lớp phủ mờ nền tối */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
      ></div>

      {/* Form Modal chính */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Tiêu đề Modal */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-black text-white m-0 tracking-tight uppercase flex items-center gap-2">
            <Dumbbell className="w-4.5 h-4.5 text-emerald-400" />
            {editingSport ? 'Chỉnh Sửa Bộ Môn' : 'Thêm Bộ Môn Mới'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl cursor-pointer border-0 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Message */}
        {formError && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Biểu mẫu */}
        <form onSubmit={onSave} className="space-y-4 text-left">
          
          {/* Hàng ngang chứa Tên & Icon */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên bộ môn</label>
              <input 
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Cầu lông, Bóng đá..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none placeholder-slate-700"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center block">Icon</label>
              <select 
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-base text-center px-1 py-2 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer text-white"
              >
                <option value="🏸">🏸</option>
                <option value="⚽">⚽</option>
                <option value="🏓">🏓</option>
                <option value="🎾">🎾</option>
                <option value="🏀">🏀</option>
                <option value="🏐">🏐</option>
                <option value="🏊">🏊</option>
                <option value="🏌️">🏌️</option>
                <option value="🏃">🏃</option>
              </select>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả ngắn</label>
            <textarea 
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Mô tả tóm tắt về luật chơi, lợi ích sức khỏe hoặc đặc thù của bộ môn..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none placeholder-slate-700 resize-none leading-relaxed"
            />
          </div>

          {/* Trạng thái hoạt động */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-855 mt-4 select-none">
            <div>
              <span className="text-xs font-bold text-white block">Trạng thái kích hoạt</span>
              <span className="text-[9px] text-slate-500">Cho phép người dùng đặt sân của bộ môn này ngay lập tức</span>
            </div>
            <button
              type="button"
              onClick={() => setFormIsActive(!formIsActive)}
              className="bg-transparent border-0 cursor-pointer p-0 text-slate-400 hover:text-white transition duration-150"
            >
              {formIsActive ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>

          {/* Nút hành động */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-emerald-600/10"
            >
              Lưu bộ môn
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
