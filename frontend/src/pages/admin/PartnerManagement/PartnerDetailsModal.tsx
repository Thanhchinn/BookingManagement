import React from 'react';
import { Handshake, X, Info } from 'lucide-react';

interface PartnerItem {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  totalFields: number;
  sportCategories: string[];
  status: 'active' | 'pending' | 'suspended';
  registrationDate: string;
  taxCode: string;
  bankAccount: {
    holder: string;
    number: string;
    bankName: string;
  };
}

interface PartnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: PartnerItem | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onToggleActive: (id: string, currentStatus: 'active' | 'suspended') => void;
}

export const PartnerDetailsModal: React.FC<PartnerDetailsModalProps> = ({
  isOpen,
  onClose,
  partner,
  onApprove,
  onReject,
  onToggleActive
}) => {
  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Lớp phủ mờ tuyệt đẹp */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
      ></div>

      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Handshake className="w-5 h-5" />
            </span>
            <div className="text-left">
              <h4 className="text-sm font-extrabold text-white m-0 uppercase tracking-tight">{partner.businessName}</h4>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mã hồ sơ: {partner.id}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl cursor-pointer border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chi tiết thông tin */}
        <div className="mt-6 space-y-5 text-xs text-left max-h-[60vh] overflow-y-auto pr-1">
          
          {/* 1. THÔNG TIN CHỦ TỔ HỢP */}
          <div className="space-y-3 bg-slate-950 rounded-2xl p-4 border border-slate-855">
            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Thông tin người đăng ký
            </h5>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Chủ sở hữu</span>
                <span className="text-white font-bold">{partner.ownerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Mã số thuế</span>
                <span className="text-white font-bold font-mono">{partner.taxCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Số điện thoại</span>
                <span className="text-white font-bold font-mono">{partner.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Thư điện tử</span>
                <span className="text-white font-bold font-mono break-all">{partner.email}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-900 mt-1">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Địa chỉ đăng ký</span>
                <span className="text-slate-300 font-medium leading-relaxed block mt-0.5">{partner.address}</span>
              </div>
            </div>
          </div>

          {/* 2. THÔNG TIN VẬN HÀNH THỂ THAO */}
          <div className="space-y-3 bg-slate-950 rounded-2xl p-4 border border-slate-855">
            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              🏆 Cấu hình cụm sân thể thao
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Số sân liên kết</span>
                <span className="text-white font-black text-sm block mt-0.5">{partner.totalFields} sân vận động</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Bộ môn khai thác</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {partner.sportCategories.map(cat => (
                    <span 
                      key={cat}
                      className="text-[9px] font-bold bg-slate-900 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. TÀI KHOẢN ĐỐI SOÁT TÀI CHÍNH */}
          <div className="space-y-3 bg-slate-950 rounded-2xl p-4 border border-slate-855">
            <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              💵 Cấu hình thụ hưởng (Rút tiền)
            </h5>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Tên ngân hàng</span>
                <span className="text-white font-bold">{partner.bankAccount.bankName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Số tài khoản</span>
                <span className="text-white font-black font-mono tracking-wider">{partner.bankAccount.number}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-900 mt-1">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Tên tài khoản thụ hưởng</span>
                <span className="text-white font-black font-mono">{partner.bankAccount.holder}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Modal với các nút Phê duyệt / Khóa */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold text-left">Trạng thái hồ sơ</span>
            <div className="mt-1">
              {partner.status === 'active' && (
                <span className="admin-table-badge admin-table-badge-emerald">Đang hoạt động</span>
              )}
              {partner.status === 'pending' && (
                <span className="admin-table-badge admin-table-badge-amber">Đang chờ duyệt</span>
              )}
              {partner.status === 'suspended' && (
                <span className="admin-table-badge admin-table-badge-red">Bị tạm khóa</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer"
            >
              Đóng lại
            </button>

            {partner.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    onApprove(partner.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-emerald-600/10"
                >
                  Duyệt hồ sơ
                </button>
                <button
                  onClick={() => {
                    onReject(partner.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0"
                >
                  Từ chối
                </button>
              </>
            )}

            {partner.status !== 'pending' && (
              <button
                onClick={() => {
                  onToggleActive(partner.id, partner.status as any);
                  onClose();
                }}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 ${
                  partner.status === 'active'
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10'
                }`}
              >
                {partner.status === 'active' ? 'Khóa đối tác' : 'Kích hoạt lại'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
