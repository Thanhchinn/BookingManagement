import React from 'react';

interface PromotionFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  code: string;
  setCode: (val: string) => void;
  percent: number;
  setPercent: (val: number) => void;
  maxDiscount: number;
  setMaxDiscount: (val: number) => void;
  minOrder: number;
  setMinOrder: (val: number) => void;
  start: string;
  setStart: (val: string) => void;
  end: string;
  setEnd: (val: string) => void;
  limit: number;
  setLimit: (val: number) => void;
  desc: string;
  setDesc: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PromotionFormModal: React.FC<PromotionFormModalProps> = ({
  isOpen,
  isEdit,
  code,
  setCode,
  percent,
  setPercent,
  maxDiscount,
  setMaxDiscount,
  minOrder,
  setMinOrder,
  start,
  setStart,
  end,
  setEnd,
  limit,
  setLimit,
  desc,
  setDesc,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <form 
        onSubmit={onSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200"
      >
        <h4 className="text-base font-extrabold text-white m-0 border-b border-slate-800 pb-3 flex items-center gap-1.5">
          {isEdit ? '⚙️ Cập Nhật Thông Tin Mã Giảm Giá' : '🏷️ Phát Hành Mã Giảm Giá Mới'}
        </h4>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Mã Coupon (Ví dụ: HE2026):</label>
              <input
                type="text"
                required
                placeholder="MÃ VIẾT LIỀN..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white outline-none focus:border-amber-500/50 uppercase font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Tỷ lệ giảm (%):</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white outline-none focus:border-amber-500/50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Giảm tối đa (đ):</label>
              <input
                type="number"
                min={0}
                required
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Đơn tối thiểu (đ):</label>
              <input
                type="number"
                min={0}
                required
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white outline-none focus:border-amber-500/50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Ngày bắt đầu:</label>
              <input
                type="date"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Ngày kết thúc:</label>
              <input
                type="date"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Giới hạn số lượt dùng:</label>
              <input
                type="number"
                min={0}
                required
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white outline-none focus:border-amber-500/50 font-mono"
              />
              <span className="text-[9px] text-slate-500 block">0 = Không giới hạn lượt</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Mô tả chương trình ưu đãi:</label>
            <textarea
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả đối tượng áp dụng, quy định chung của coupon..."
              className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-slate-300 outline-none transition resize-none h-14"
            />
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
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white border-0 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10"
          >
            {isEdit ? 'Xác Nhận Lưu' : 'Kích Hoạt Voucher'}
          </button>
        </div>
      </form>
    </div>
  );
};
