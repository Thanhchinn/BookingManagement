import React from 'react';
import type { PayoutRequest } from '../../../types';

interface ApprovePayoutModalProps {
  isOpen: boolean;
  request: PayoutRequest | null;
  txHashInput: string;
  setTxHashInput: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ApprovePayoutModal: React.FC<ApprovePayoutModalProps> = ({
  isOpen,
  request,
  txHashInput,
  setTxHashInput,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <form 
        onSubmit={onSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl shadow-slate-950/80 text-slate-100 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center gap-3 text-emerald-500">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shrink-0">
            💰
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white m-0">Ký Duyệt & Chuyển Tiền Giải Ngân</h4>
            <p className="text-[10px] text-slate-400 m-0">
              Đơn rút tiền: <strong className="font-mono text-slate-300">{request.id}</strong>
            </p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span>Đối tác nhận:</span>
            <strong className="text-white text-right truncate max-w-[150px]">{request.partnerName}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Tổng tiền chuyển khoản:</span>
            <strong className="text-emerald-400 font-mono text-sm">{request.amount.toLocaleString()}đ</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400 border-t border-slate-850 pt-2 mt-1">
            <span>Tài khoản nhận:</span>
            <strong className="text-white font-mono">{request.accountNumber} ({request.bankName})</strong>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 block">Mã số giao dịch Ngân hàng (TxID / Ref):</label>
          <input
            type="text"
            required
            placeholder="Nhập mã biên lai chuyển khoản (Ví dụ: FT26058913...)"
            value={txHashInput}
            onChange={(e) => setTxHashInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono transition"
          />
          <span className="text-[9px] text-slate-400 block">
            💡 Nhập mã giao dịch thực tế từ ứng dụng ngân hàng của bạn để làm bằng chứng đối soát với Đối tác khi cần.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white border-0 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            Xác Nhận Đã Chuyển Tiền
          </button>
        </div>
      </form>
    </div>
  );
};
