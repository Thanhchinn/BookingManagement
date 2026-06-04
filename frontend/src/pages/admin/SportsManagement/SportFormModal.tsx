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
  { name: 'Emerald (Lục)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotBg: 'bg-emerald-500' },
  { name: 'Sky (Lam)', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dotBg: 'bg-sky-500' },
  { name: 'Indigo (Chàm)', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dotBg: 'bg-indigo-500' },
  { name: 'Rose (Hồng)', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dotBg: 'bg-rose-500' },
  { name: 'Amber (Vàng)', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dotBg: 'bg-amber-500' },
  { name: 'Violet (Tím)', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dotBg: 'bg-violet-500' },
  { name: 'Cyan (Lục Lam)', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dotBg: 'bg-cyan-500' },
  { name: 'Orange (Cam)', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dotBg: 'bg-orange-500' },
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Cửa sổ biểu mẫu trượt lên */}
      <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Tiêu đề Modal */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-black text-slate-950 m-0 tracking-tight uppercase flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-600" />
            {editingSport ? 'Chỉnh Sửa Bộ Môn' : 'Khai Báo Bộ Môn Mới'}
          </h3>
          <button 
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl cursor-pointer border-0 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {formError && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 leading-relaxed">
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
              <label className="text-[10px] font-bold text-slate-655 text-slate-600 uppercase tracking-wider">Tên bộ môn</label>
              <input 
                type="text"
                disabled={isSaving}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Bóng đá, Cầu lông..."
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-xs text-slate-900 px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-400 transition"
                required
              />
            </div>
            
            {/* Biểu Tượng Icon */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-655 text-slate-600 uppercase tracking-wider text-center block">Icon</label>
              <select 
                disabled={isSaving}
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-base text-center py-2.5 rounded-xl focus:outline-none cursor-pointer text-slate-900 transition"
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
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Đường dẫn Slug</label>
              <span className="text-[9px] text-slate-500 font-semibold italic">Tự động sinh từ tên bộ môn</span>
            </div>
            <input 
              type="text"
              disabled={isSaving}
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="ví-du-bong-da"
              className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-xs font-mono text-slate-900 px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-400 transition"
              required
            />
          </div>

          {/* Thứ tự sắp xếp */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Thứ tự ưu tiên hiển thị</label>
            <input 
              type="number"
              disabled={isSaving}
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(Number(e.target.value))}
              placeholder="Số nguyên (ví dụ: 0, 1, 2...)"
              min={0}
              className="w-full bg-white border border-slate-200 focus:border-emerald-500 text-xs text-slate-900 px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-400 transition"
              required
            />
          </div>

          {/* CHỌN MÀU BADGE CAO CẤP & XEM TRƯỚC (LIVE PREVIEW) */}
          <div className="space-y-2.5 border-t border-slate-200/60 pt-4">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Thiết lập tông màu Badge</label>
            
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
                        ? 'bg-slate-100 border-emerald-500 text-slate-900 shadow-inner' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${preset.dotBg} mb-1 shadow-sm`} />
                    <span className="truncate max-w-full">{preset.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* LIVE PREVIEW HUY HIỆU */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between mt-3 select-none">
              <div>
                <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wide">Xem trước hiển thị (Badge Live Preview)</span>
                <span className="text-[9px] text-slate-500">Huy hiệu bộ môn sẽ hiển thị ngoài Client</span>
              </div>
              <div className="shrink-0 flex items-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border border-slate-200 shadow-sm ${formColorBg} ${formColorText}`}>
                  <span>{formIcon}</span>
                  <span>{formName || 'Tên bộ môn'}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Toggle trạng thái hoạt động */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 select-none">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Cho phép hoạt động</span>
              <span className="text-[9px] text-slate-500">Mở/khóa tức thì trạng thái hiển thị của bộ môn này</span>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setFormIsActive(!formIsActive)}
              className="bg-transparent border-0 cursor-pointer p-0 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition duration-150"
            >
              {formIsActive ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-400" />
              )}
            </button>
          </div>

          {/* Hàng nút bấm gửi dữ liệu */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-150">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 rounded-xl transition cursor-pointer"
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
