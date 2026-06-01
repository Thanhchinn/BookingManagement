import React from 'react';
import type { PayoutRequest } from '../../../types';

interface RejectPayoutModalProps {
  isOpen: boolean;
  request: PayoutRequest | null;
  rejectReasonInput: string;
  setRejectReasonInput: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RejectPayoutModal: React.FC<RejectPayoutModalProps> = ({
  isOpen,
  request,
  rejectReasonInput,
  setRejectReasonInput,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <form 
        onSubmit={onSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center gap-3 text-red-500">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl shrink-0">
            ⚠️
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white m-0">Từ Chối Yêu Cầu Rút Tiền</h4>
            <p className="text-[10px] text-slate-400 m-0">
              Đơn rút tiền: <strong className="font-mono text-slate-200">{request.id}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Lý do từ chối chính thức (Bắt buộc):</label>
          <textarea
            required
            value={rejectReasonInput}
            onChange={(e) => setRejectReasonInput(e.target.value)}
            placeholder="Nêu rõ lý do (Ví dụ: Sai số tài khoản ngân hàng thụ hưởng, tài khoản nằm trong danh mục nghi ngờ gian lận, hoặc tên chủ tài khoản thụ hưởng không trùng khớp...)"
            className="w-full bg-slate-950 border border-slate-800 focus:border-red-500/50 rounded-xl p-3 text-xs text-slate-300 outline-none transition resize-none h-24"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={!rejectReasonInput.trim()}
            className={`px-5 py-2 text-xs font-bold text-white border-0 rounded-xl transition cursor-pointer ${
              rejectReasonInput.trim() 
                ? 'bg-red-650 hover:bg-red-700 shadow-lg shadow-red-600/10' 
                : 'bg-red-800/40 text-slate-500 cursor-not-allowed'
            }`}
          >
            Xác Nhận Từ Chối
          </button>
        </div>
      </form>
    </div>
  );
};
