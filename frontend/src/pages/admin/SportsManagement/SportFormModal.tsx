import React from 'react';
import { Dumbbell, X, ShieldAlert, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { type CategoryItem } from './SportsManagement';

interface SportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSport: CategoryItem | null;
  formName: string;
  setFormName: (val: string) => void;
  formSlug: string;
  setFormSlug: (val: string) => void;
  formIcon: string;
  setFormIcon: (val: string) => void;
  formColorBg: string;
  setFormColorBg: (val: string) => void;
  formColorText: string;
  setFormColorText: (val: string) => void;
  formIsActive: boolean;
  setFormIsActive: (val: boolean) => void;
  formSortOrder: number;
  setFormSortOrder: (val: number) => void;
  formError: string;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
}

// Bảng màu Badge mờ siêu sang (Glassmorphism Presets) được chọn lọc kỹ càng
const COLOR_PRESETS = [
  { name: 'Emerald (Lục)', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/25', dotBg: 'bg-emerald-400' },
  { name: 'Sky (Lam)', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/25', dotBg: 'bg-sky-400' },
  { name: 'Indigo (Chàm)', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/25', dotBg: 'bg-indigo-400' },
  { name: 'Rose (Hồng)', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/25', dotBg: 'bg-rose-400' },
  { name: 'Amber (Vàng)', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25', dotBg: 'bg-amber-400' },
  { name: 'Violet (Tím)', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/25', dotBg: 'bg-violet-400' },
  { name: 'Cyan (Lục Lam)', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/25', dotBg: 'bg-cyan-400' },
  { name: 'Orange (Cam)', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/25', dotBg: 'bg-orange-400' },
];

// Danh sách các Icon bộ môn thể thao trực quan
const ICON_OPTIONS = ['🏸', '⚽', '🏓', '🎾', '🏀', '🏐', '🏊', '🏌️', '🏃', '🏋️', '🛹', '🏆'];

export const SportFormModal: React.FC<SportFormModalProps> = ({
  isOpen,
  onClose,
  editingSport,
  formName,
  setFormName,
  formSlug,
  setFormSlug,
  formIcon,
  setFormIcon,
  formColorBg,
  setFormColorBg,
  formColorText,
  setFormColorText,
  formIsActive,
  setFormIsActive,
  formSortOrder,
  setFormSortOrder,
  formError,
  isSaving,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Lớp phủ mờ nền tối tĩnh */}
      <div 
        onClick={isSaving ? undefined : onClose}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Cửa sổ biểu mẫu trượt lên */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Tiêu đề Modal */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-sm font-black text-white m-0 tracking-tight uppercase flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            {editingSport ? 'Chỉnh Sửa Bộ Môn' : 'Khai Báo Bộ Môn Mới'}
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

        {/* Thông báo lỗi nếu có */}
        {formError && (
          <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[11px] font-bold flex items-center gap-1.5 leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Biểu mẫu đăng ký */}
        <form onSubmit={onSave} className="space-y-5 text-left">
          
          {/* Hàng 1: Tên bộ môn & Icon */}
          <div className="grid grid-cols-4 gap-4">
            
            {/* Tên Bộ Môn */}
            <div className="col-span-3 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên bộ môn</label>
              <input 
                type="text"
                disabled={isSaving}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Bóng đá, Cầu lông..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-750 transition"
                required
              />
            </div>
            
            {/* Biểu Tượng Icon */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center block">Icon</label>
              <select 
                disabled={isSaving}
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-base text-center py-2.5 rounded-xl focus:outline-none cursor-pointer text-white transition"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Đường dẫn thân thiện (Slug) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đường dẫn Slug</label>
              <span className="text-[9px] text-slate-500 font-semibold italic">Tự động sinh từ tên bộ môn</span>
            </div>
            <input 
              type="text"
              disabled={isSaving}
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="ví-du-bong-da"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs font-mono text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-750 transition"
              required
            />
          </div>

          {/* Thứ tự sắp xếp */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thứ tự ưu tiên hiển thị</label>
            <input 
              type="number"
              disabled={isSaving}
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(Number(e.target.value))}
              placeholder="Số nguyên (ví dụ: 0, 1, 2...)"
              min={0}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-750 transition"
              required
            />
          </div>

          {/* CHỌN MÀU BADGE CAO CẤP & XEM TRƯỚC (LIVE PREVIEW) */}
          <div className="space-y-2.5 border-t border-slate-800/80 pt-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Thiết lập tông màu Badge</label>
            
            {/* Color Presets Grid */}
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = formColorBg === preset.bg && formColorText === preset.text;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setFormColorBg(preset.bg);
                      setFormColorText(preset.text);
                    }}
                    className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-[9px] font-bold transition cursor-pointer select-none ${
                      isSelected 
                        ? 'bg-slate-950 border-emerald-500 text-white shadow-inner shadow-emerald-500/10' 
                        : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-350'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${preset.dotBg} mb-1 shadow-sm`} />
                    <span className="truncate max-w-full">{preset.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* LIVE PREVIEW HUY HIỆU */}
            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between mt-3 select-none">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wide">Xem trước hiển thị (Badge Live Preview)</span>
                <span className="text-[9px] text-slate-650">Huy hiệu bộ môn sẽ hiển thị ngoài Client</span>
              </div>
              <div className="shrink-0 flex items-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border border-slate-800 shadow-md ${formColorBg} ${formColorText}`}>
                  <span>{formIcon}</span>
                  <span>{formName || 'Tên bộ môn'}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Toggle trạng thái hoạt động */}
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-850 select-none">
            <div>
              <span className="text-xs font-bold text-white block">Cho phép hoạt động</span>
              <span className="text-[9px] text-slate-500">Mở/khóa tức thì trạng thái hiển thị của bộ môn này</span>
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

          {/* Hàng nút bấm gửi dữ liệu */}
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
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu cấu hình</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
