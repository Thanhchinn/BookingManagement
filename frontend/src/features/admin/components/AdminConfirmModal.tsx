import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Check, Loader2 } from 'lucide-react';

interface AdminConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  variant?: 'danger' | 'warning' | 'primary';
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  title = 'Xác nhận hành động',
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  onConfirm,
  onClose,
  variant = 'danger'
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(); // ← Await đúng cách, đợi API xong rồi mới đóng modal
    } finally {
      setIsConfirming(false);
      onClose();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Trash2 className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10 text-white';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/10 text-white';
      default:
        return 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Lớp phủ mờ nền tối */}
      <div
        onClick={isConfirming ? undefined : onClose}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      />

      {/* Cửa sổ Modal */}
      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl backdrop-blur-md animate-scale-up">

        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={onClose}
          disabled={isConfirming}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-xl cursor-pointer border-0 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Biểu tượng */}
        {getIcon()}

        {/* Tiêu đề & Thông điệp */}
        <div className="space-y-2 mb-6">
          <h3 className="text-base font-black text-white m-0 tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed m-0 px-2">
            {message}
          </p>
        </div>

        {/* Nút bấm hành động */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`w-full py-2.5 text-xs font-bold rounded-xl transition cursor-pointer border-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${getConfirmButtonStyles()}`}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
