import React from 'react';
import type { MatchPost } from '../../../types';

interface ApplyJoinModalProps {
  isOpen: boolean;
  match: MatchPost | null;
  applyNote: string;
  setApplyNote: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const ApplyJoinModal: React.FC<ApplyJoinModalProps> = ({
  isOpen,
  match,
  applyNote,
  setApplyNote,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-emerald-400">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shrink-0">
            🤝
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white m-0">Nộp Đơn Xin Ghép Trận</h4>
            <p className="text-[10px] text-slate-400 m-0">Gửi tin nhắn ngắn giới thiệu trình độ của bạn với Host</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Lời nhắn gửi chủ phòng (Không bắt buộc):</label>
          <textarea
            value={applyNote}
            onChange={(e) => setApplyNote(e.target.value)}
            placeholder="Ví dụ: Mình chơi cầu lông tốt, có thể bao lưới/nhận đôi nam nữ. Hẹn gặp bạn ở sân nhé!"
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3.5 text-xs text-slate-300 outline-none transition resize-none h-24"
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
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white border-0 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-600/10"
          >
            Gửi Yêu Cầu Ghép Trận
          </button>
        </div>
      </div>
    </div>
  );
};
