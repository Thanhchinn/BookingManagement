import React from 'react';

interface ProductFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  name: string;
  setName: (val: string) => void;
  price: number;
  setPrice: (val: number) => void;
  category: 'DRINK' | 'FOOD' | 'EQUIPMENT';
  setCategory: (val: 'DRINK' | 'FOOD' | 'EQUIPMENT') => void;
  desc: string;
  setDesc: (val: string) => void;
  isAvail: boolean;
  setIsAvail: (val: boolean) => void;
  imageEmoji: string;
  setImageEmoji: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  isEdit,
  name,
  setName,
  price,
  setPrice,
  category,
  setCategory,
  desc,
  setDesc,
  isAvail,
  setIsAvail,
  imageEmoji,
  setImageEmoji,
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
          {isEdit ? '⚙️ Cập Nhật Thông Tin Sản Phẩm' : '🎁 Khai Báo Đăng Bán Sản Phẩm Mới'}
        </h4>

        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Tên sản phẩm / đồ thuê:</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nước suối Aquafina 500ml..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Đơn giá (đ):</label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Phân loại chính:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-slate-300 outline-none"
              >
                <option value="DRINK">Nước uống</option>
                <option value="FOOD">Đồ ăn</option>
                <option value="EQUIPMENT">Dụng cụ / Thuê đồ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Biểu tượng Emoji đại diện:</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 🥤, 💧, 🏸..."
                value={imageEmoji}
                onChange={(e) => setImageEmoji(e.target.value)}
                className="w-full bg-slate-950 border border-slate-855 p-3 rounded-xl text-xs text-white outline-none text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Trạng thái tồn kho:</label>
              <select
                value={isAvail ? 'YES' : 'NO'}
                onChange={(e) => setIsAvail(e.target.value === 'YES')}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-slate-300 outline-none"
              >
                <option value="YES">Còn hàng sẵn bán</option>
                <option value="NO">Tạm thời hết hàng</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Mô tả chi tiết sản phẩm:</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả thể tích chai, hãng sản xuất, hoặc tình trạng mới của vợt cho thuê..."
              className="w-full bg-slate-950 border border-slate-850 p-3.5 rounded-xl text-xs text-slate-300 outline-none transition resize-none h-16"
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
            {isEdit ? 'Xác Nhận Lưu Thay Đổi' : 'Thêm Sản Phẩm Ngay'}
          </button>
        </div>
      </form>
    </div>
  );
};
