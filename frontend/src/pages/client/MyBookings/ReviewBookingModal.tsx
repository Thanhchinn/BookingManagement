import React from 'react';
import type { BookingItem } from '../../../types';
import { Star } from 'lucide-react';

interface ReviewBookingModalProps {
  isOpen: boolean;
  booking: BookingItem | null;
  rating: number;
  setRating: (val: number) => void;
  reviewComment: string;
  setReviewComment: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const ReviewBookingModal: React.FC<ReviewBookingModalProps> = ({
  isOpen,
  booking,
  rating,
  setRating,
  reviewComment,
  setReviewComment,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left space-y-5 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-amber-400">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0">
            ⭐
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white m-0">Đánh Giá & Nhận Xét Sân Đấu</h4>
            <p className="text-[10px] text-slate-400 m-0">Giúp cộng đồng biết thêm về chất lượng của sân bãi này</p>
          </div>
        </div>

        {/* Chọn số sao */}
        <div className="space-y-2 text-center py-2 bg-slate-950 border border-slate-850 rounded-2xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Chọn mức độ hài lòng</span>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 hover:scale-125 transition cursor-pointer border-0 bg-transparent"
              >
                <Star className={`w-8 h-8 shrink-0 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-400 mt-1 block">
            {rating === 5 ? 'Quá tuyệt vời (5/5 sao)' :
             rating === 4 ? 'Rất tốt (4/5 sao)' :
             rating === 3 ? 'Bình thường (3/5 sao)' :
             rating === 2 ? 'Kém (2/5 sao)' : 'Quá tệ (1/5 sao)'}
          </span>
        </div>

        {/* Nhận xét văn bản */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Ý kiến góp ý / Bình luận:</label>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Mô tả trải nghiệm của bạn (ánh sáng sân, chất lượng thảm đấu, nhân viên phục vụ, bãi xe...)"
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-3.5 text-xs text-slate-300 outline-none transition resize-none h-24"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white border-0 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10"
          >
            Đăng Đánh Giá
          </button>
        </div>
      </div>
    </div>
  );
};
