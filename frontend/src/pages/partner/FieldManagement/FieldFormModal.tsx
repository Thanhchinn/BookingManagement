import React from 'react';
import { Trophy, X, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react';

interface FieldItem {
  id: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  status: 'active' | 'maintenance';
  description: string;
}

interface FieldFormModalProps {
  isOpen: boolean;
  editingField: FieldItem | null;
  formName: string;
  setFormName: (val: string) => void;
  formSportType: string;
  setFormSportType: (val: string) => void;
  formPrice: number;
  setFormPrice: (val: number) => void;
  formStatus: 'active' | 'maintenance';
  setFormStatus: (val: 'active' | 'maintenance') => void;
  formDesc: string;
  setFormDesc: (val: string) => void;
  formError: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const FieldFormModal: React.FC<FieldFormModalProps> = ({
  isOpen,
  editingField,
  formName,
  setFormName,
  formSportType,
  setFormSportType,
  formPrice,
  setFormPrice,
  formStatus,
  setFormStatus,
  formDesc,
  setFormDesc,
  formError,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-black text-white m-0 uppercase flex items-center gap-2">
            <Trophy className="w-4.5 h-4.5 text-amber-500" />
            {editingField ? 'Chỉnh Sửa Sân' : 'Thêm Sân Thể Thao'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer border-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {formError && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 text-left">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên sân thể thao</label>
            <input 
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ví dụ: Sân Cầu Lông Số 5, Sân Cỏ B3..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Môn thể thao</label>
              <select
                value={formSportType}
                onChange={(e) => setFormSportType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="cau-long">🏸 Cầu lông</option>
                <option value="bong-da">⚽ Bóng đá</option>
                <option value="pickleball">🏓 Pickleball</option>
                <option value="tennis">🎾 Tennis</option>
              </select>            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đơn giá / Giờ</label>
              <input 
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả đặc điểm</label>
            <textarea 
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Ví dụ: Thảm chuyên dụng, vị trí đẹp..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-850 mt-4 select-none">
            <div>
              <span className="text-xs font-bold text-white block">Trạng thái sân</span>
              <span className="text-[9px] text-slate-500">Mở để đón lịch đặt của khách, tắt khi sửa chữa</span>
            </div>
            <button
              type="button"
              onClick={() => setFormStatus(formStatus === 'active' ? 'maintenance' : 'active')}
              className="bg-transparent border-0 cursor-pointer p-0 text-slate-400 hover:text-white transition duration-150"
            >
              {formStatus === 'active' ? (
                <ToggleRight className="w-8 h-8 text-amber-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-amber-500/10"
            >
              Lưu Sân Thể Thao
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
