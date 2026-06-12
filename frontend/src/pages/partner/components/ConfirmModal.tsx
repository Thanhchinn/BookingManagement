import React from 'react';
import { AlertTriangle, Info, Trash2, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  onConfirm,
  onCancel,
  type = 'info',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // Icon và style tương ứng với từng loại confirm
  const getStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          iconBg: 'bg-red-500/10 border-red-500/20',
          btnBg: 'bg-red-650 hover:bg-red-700 text-white shadow-lg shadow-red-600/10',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20',
          btnBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/10',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
          iconBg: 'bg-emerald-500/10 border-emerald-500/20',
          btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/10',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-500" />,
          iconBg: 'bg-blue-500/10 border-blue-500/20',
          btnBg: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/10',
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-5 transform scale-95 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng góc phải */}
        <button 
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-450 hover:text-white transition cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Nội dung chính */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border shrink-0 flex items-center justify-center ${styles.iconBg}`}>
            {styles.icon}
          </div>
          <div className="space-y-1 text-left flex-1 pr-6">
            <h4 className="text-sm font-black text-white m-0 leading-tight">{title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed m-0">{message}</p>
          </div>
        </div>

        {/* Cụm nút bấm */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer border-0 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-1.5 ${styles.btnBg}`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
