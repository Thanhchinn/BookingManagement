import React, { useState, useEffect } from 'react';
import { Settings, X, ShieldAlert, Loader2, Percent, Coins } from 'lucide-react';
import { type PartnerItem } from './PartnerDetailsView';

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: PartnerItem | null;
  isSaving: boolean;
  onSave: (updatedFields: {
    businessName: string;
    taxCode: string;
    commissionType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    commissionRate: number;
    commissionFixedAmount: number;
  }) => Promise<void>;
}

export const PartnerFormModal: React.FC<PartnerFormModalProps> = ({
  isOpen,
  onClose,
  partner,
  isSaving,
  onSave,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [commissionType, setCommissionType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [commissionRate, setCommissionRate] = useState(10);
  const [commissionFixedAmount, setCommissionFixedAmount] = useState(0);
  const [formError, setFormError] = useState('');

  // Đồng bộ dữ liệu khi mở modal hoặc thay đổi đối tác chọn
  useEffect(() => {
    if (partner) {
      setBusinessName(partner.businessName || '');
      setTaxCode(partner.taxCode === '(Chưa cập nhật)' ? '' : partner.taxCode || '');
      setCommissionType(partner.commissionType || 'PERCENTAGE');
      setCommissionRate(partner.commissionRate ?? 10);
      setCommissionFixedAmount(partner.commissionFixedAmount ?? 0);
      setFormError('');
    }
  }, [partner, isOpen]);

  if (!isOpen || !partner) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!businessName.trim()) {
      setFormError('Tên doanh nghiệp không được để trống.');
      return;
    }

    if (commissionType === 'PERCENTAGE' && (commissionRate < 0 || commissionRate > 100)) {
      setFormError('Tỷ lệ hoa hồng phải nằm trong khoảng từ 0% đến 100%.');
      return;
    }

    if (commissionType === 'FIXED_AMOUNT' && commissionFixedAmount < 0) {
      setFormError('Số tiền hoa hồng cố định không được nhỏ hơn 0đ.');
      return;
    }

    try {
      await onSave({
        businessName: businessName.trim(),
        taxCode: taxCode.trim(),
        commissionType,
        commissionRate: commissionType === 'PERCENTAGE' ? commissionRate : 0,
        commissionFixedAmount: commissionType === 'FIXED_AMOUNT' ? commissionFixedAmount : 0,
      });
    } catch (err: any) {
      setFormError(err.message || 'Có lỗi xảy ra khi lưu cấu hình.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        onClick={isSaving ? undefined : onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-sm font-black text-white m-0 tracking-tight uppercase flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            Chỉnh Sửa Thông Tin Đối Tác
          </h3>
          <button 
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-50 rounded-xl cursor-pointer border-0 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification */}
        {formError && (
          <div className="mb-5 p-3 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-xl text-[11px] font-bold flex items-center gap-1.5 leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tên Tổ Hợp / Doanh Nghiệp */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên tổ hợp sân / Doanh nghiệp</label>
            <input 
              type="text"
              disabled={isSaving}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Nhập tên doanh nghiệp..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-500 transition"
              required
            />
          </div>

          {/* Mã Số Thuế */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã số thuế</label>
            <input 
              type="text"
              disabled={isSaving}
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              placeholder="Nhập mã số thuế..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-500 transition"
            />
          </div>

          {/* Thiết lập loại Hoa hồng */}
          <div className="space-y-2.5 border-t border-slate-800 pt-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cấu hình loại hình hoa hồng</label>
            
            {/* Loại hình Switcher buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setCommissionType('PERCENTAGE')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition cursor-pointer select-none ${
                  commissionType === 'PERCENTAGE'
                    ? 'bg-slate-950 border-emerald-500 text-white shadow-inner' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Percent className={`w-4 h-4 ${commissionType === 'PERCENTAGE' ? 'text-emerald-500' : 'text-slate-500'}`} />
                Theo phần trăm (%)
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => setCommissionType('FIXED_AMOUNT')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition cursor-pointer select-none ${
                  commissionType === 'FIXED_AMOUNT'
                    ? 'bg-slate-950 border-emerald-500 text-white shadow-inner' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Coins className={`w-4 h-4 ${commissionType === 'FIXED_AMOUNT' ? 'text-emerald-500' : 'text-slate-500'}`} />
                Số tiền cố định (đ)
              </button>
            </div>
          </div>

          {/* Nhập giá trị tương ứng */}
          {commissionType === 'PERCENTAGE' ? (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tỉ lệ hoa hồng (%)</label>
              <div className="relative">
                <input 
                  type="number"
                  disabled={isSaving}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  placeholder="Ví dụ: 10"
                  min={0}
                  max={100}
                  step={0.5}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white pl-3 pr-10 py-2.5 rounded-xl focus:outline-none placeholder-slate-500 transition font-mono font-bold"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs select-none">
                  %
                </div>
              </div>
              <p className="text-[9px] text-slate-500 m-0">Áp dụng trực tiếp hoa hồng theo % trên tổng giá trị hóa đơn đặt sân của khách hàng.</p>
            </div>
          ) : (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số tiền hoa hồng cố định (VND)</label>
              <div className="relative">
                <input 
                  type="number"
                  disabled={isSaving}
                  value={commissionFixedAmount}
                  onChange={(e) => setCommissionFixedAmount(Number(e.target.value))}
                  placeholder="Ví dụ: 20000"
                  min={0}
                  step={1000}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white pl-3 pr-12 py-2.5 rounded-xl focus:outline-none placeholder-slate-500 transition font-mono font-bold"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs select-none">
                  VND
                </div>
              </div>
              <p className="text-[9px] text-slate-500 m-0">Thu một khoản phí cố định cho mỗi một ca chơi (đơn đặt sân) được hoàn thành.</p>
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thông tin</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
