import React from 'react';
import type { BookingItem } from '../../../types';

interface DisputeBookingModalProps {
  isOpen: boolean;
  booking: BookingItem | null;
  disputeCategory: string;
  setDisputeCategory: (val: string) => void;
  disputeDescription: string;
  setDisputeDescription: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const DisputeBookingModal: React.FC<DisputeBookingModalProps> = ({
  isOpen,
  booking,
  disputeCategory,
  setDisputeCategory,
  disputeDescription,
  setDisputeDescription,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left space-y-5 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-red-500">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl shrink-0">
            ⚖️
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white m-0">Tạo Hồ Sơ Khiếu Nại / Tranh Chấp</h4>
            <p className="text-[10px] text-slate-400 m-0">Bảo vệ quyền lợi khách hàng dưới sự giám sát của hệ thống</p>
          </div>
        </div>

        {/* Chọn danh mục khiếu nại */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Lý do khiếu nại chính:</label>
          <select
            value={disputeCategory}
            onChange={(e) => setDisputeCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 outline-none"
          >
            <option value="QUALITY">Chất lượng sân bãi quá kém so với mô tả</option>
            <option value="CANCELLATION">Chủ sân hủy lịch đột xuất vô lý</option>
            <option value="OVERCHARGE">Tính sai tiền hoặc thu thêm phí ẩn</option>
            <option value="NO_SHOW">Chủ sân bỏ bom / không mở cửa cho thuê</option>
            <option value="OTHER">Lý do khác</option>
          </select>
        </div>

        {/* Mô tả sự việc */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Mô tả chi tiết sự cố sự việc:</label>
          <textarea
            value={disputeDescription}
            onChange={(e) => setDisputeDescription(e.target.value)}
            placeholder="Ghi rõ thời điểm phát sinh sự cố, thái độ phục vụ hoặc hành vi sai lệch của phía cơ sở sân..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-red-500/50 rounded-xl p-3.5 text-xs text-slate-300 outline-none transition resize-none h-24"
          />
        </div>

        {/* Đính kèm bằng chứng (giả lập) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Đính kèm ảnh/video bằng chứng (Không bắt buộc):</label>
          <div className="border border-dashed border-slate-800 bg-slate-950 hover:bg-slate-950/60 rounded-xl p-4 text-center cursor-pointer">
            <span className="text-xs text-slate-500 block">📸 Chọn tải lên ảnh thực tế hoặc video quay tại quầy sân</span>
            <span className="text-[9px] text-slate-600 block mt-1">Định dạng hỗ trợ JPG, PNG, MP4 dưới 20MB</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            disabled={!disputeDescription.trim()}
            onClick={onConfirm}
            className={`px-5 py-2 text-xs font-bold text-white border-0 rounded-xl transition cursor-pointer ${
              disputeDescription.trim() ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10' : 'bg-red-800/40 text-slate-500 cursor-not-allowed'
            }`}
          >
            Gửi Đơn Khiếu Nại
          </button>
        </div>
      </div>
    </div>
  );
};
