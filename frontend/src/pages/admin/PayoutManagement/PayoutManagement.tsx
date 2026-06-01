import React, { useState } from 'react';
import { 
  DollarSign, 
  Check, 
  X, 
  Building, 
  CreditCard, 
  Calendar, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

import type { PayoutRequest } from '../../../types';
import { ApprovePayoutModal } from './ApprovePayoutModal';
import { RejectPayoutModal } from './RejectPayoutModal';

export const PayoutManagement: React.FC = () => {
  // Mock State để có thể tương tác đầy đủ trên giao diện
  const [requests, setRequests] = useState<PayoutRequest[]>([
    {
      id: 'PAY-8809',
      partnerName: 'Sân Cầu Lông Trong Nhà ProZone',
      amount: 4500000,
      bankName: 'Vietcombank (VCB)',
      accountNumber: '1029384756',
      accountName: 'NGUYEN VAN HAI',
      status: 'PENDING',
      requestDate: '2026-05-30'
    },
    {
      id: 'PAY-8751',
      partnerName: 'Stadium A (Sân Cỏ Nhân Tạo)',
      amount: 12800000,
      bankName: 'Techcombank (TCB)',
      accountNumber: '1903487562001',
      accountName: 'TRAN MINH ANH',
      status: 'PENDING',
      requestDate: '2026-05-29'
    },
    {
      id: 'PAY-8210',
      partnerName: 'ATP Tennis Court VIP',
      amount: 6000000,
      bankName: 'MBBank (MB)',
      accountNumber: '990123456789',
      accountName: 'PHAN THANH DAT',
      status: 'APPROVED',
      requestDate: '2026-05-25',
      completeDate: '2026-05-25 15:30',
      txHash: 'FT26145890241'
    },
    {
      id: 'PAY-8199',
      partnerName: 'D-Sport Pickleball Quận 7',
      amount: 3500000,
      bankName: 'VietinBank',
      accountNumber: '109887766554',
      accountName: 'LE HOANG LONG',
      status: 'REJECTED',
      requestDate: '2026-05-24',
      rejectReason: 'Tên chủ tài khoản thụ hưởng không khớp với thông tin giấy phép kinh doanh đăng ký trên hệ thống.'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [txHashInput, setTxHashInput] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'ALL') return true;
    return r.status === activeFilter;
  });

  // Xác nhận Phê duyệt và Điền mã giao dịch
  const handleConfirmApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setRequests(prev => prev.map(r => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          status: 'APPROVED' as const,
          completeDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
          txHash: txHashInput || 'FT' + Math.floor(Math.random() * 90000000 + 10000000)
        };
      }
      return r;
    }));

    setSelectedRequest(null);
    setShowApproveModal(false);
    setTxHashInput('');
    alert('Đã phê duyệt yêu cầu rút tiền và kết chuyển tiền gửi thành công!');
  };

  // Xác nhận Từ chối rút tiền
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !rejectReasonInput.trim()) return;

    setRequests(prev => prev.map(r => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          status: 'REJECTED' as const,
          rejectReason: rejectReasonInput
        };
      }
      return r;
    }));

    setSelectedRequest(null);
    setShowRejectModal(false);
    setRejectReasonInput('');
    alert('Đã từ chối yêu cầu rút tiền. Tiền rút đã hoàn trả lại ví số dư thặng dư của Đối tác.');
  };

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* Tiêu đề */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Phê Duyệt Yêu Cầu Rút Tiền (Payout Approvals)
          </h3>
          <p className="text-xs text-slate-400 m-0">Xét duyệt chuyển khoản tiền doanh thu giữ chỗ của các chủ sân về tài khoản ngân hàng liên kết</p>
        </div>

        <div className="text-right bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-xl shrink-0">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Tổng quỹ tạm giữ đối soát</span>
          <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">142,500,000đ</span>
        </div>
      </div>

      {/* Lọc */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(filter => {
          const label = filter === 'ALL' ? 'Tất cả yêu cầu' : 
                        filter === 'PENDING' ? 'Chờ duyệt (PENDING)' : 
                        filter === 'APPROVED' ? 'Đã chuyển khoản' : 'Đã từ chối (REJECTED)';
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer border ${
                isActive 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/10' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid danh sách rút tiền */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Danh sách */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <span className="text-3xl block">💸</span>
              <h4 className="text-sm font-bold text-white m-0">Không có yêu cầu rút tiền nào</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Chưa có chủ sân nào nộp hồ sơ yêu cầu chuyển quỹ rút tiền trong bộ lọc này.</p>
            </div>
          ) : (
            filteredRequests.map(r => (
              <div 
                key={r.id}
                onClick={() => setSelectedRequest(r)}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer transition hover:border-slate-700 ${
                  selectedRequest?.id === r.id ? 'border-emerald-500 bg-slate-900/90' : 'border-slate-800/80'
                }`}
              >
                <div className="space-y-2.5 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{r.id}</span>
                    {r.status === 'PENDING' ? (
                      <Badge status="warning">Đang chờ duyệt</Badge>
                    ) : r.status === 'APPROVED' ? (
                      <Badge status="success">Đã chuyển khoản</Badge>
                    ) : (
                      <Badge status="danger">Đã từ chối</Badge>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-white m-0 flex items-center gap-1.5">
                    <Building className="w-4.5 h-4.5 text-slate-500" />
                    {r.partnerName}
                  </h4>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày gửi: {r.requestDate}</span>
                    <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-amber-500" /> {r.bankName}</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider m-0">Số tiền rút:</p>
                    <p className="text-base font-extrabold text-emerald-400 font-mono m-0">
                      {r.amount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Cột phải: Xem chi tiết ngân hàng & Duyệt */}
        <div className="space-y-6">
          {selectedRequest ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 sticky top-24">
              
              {/* Header chi tiết */}
              <div className="border-b border-slate-800 pb-3 space-y-1">
                <span className="text-[9px] font-mono text-slate-500 block">{selectedRequest.id} | Gửi ngày {selectedRequest.requestDate}</span>
                <h4 className="text-base font-black text-white m-0 leading-tight">{selectedRequest.partnerName}</h4>
              </div>

              {/* Số tiền rút lớn nổi bật */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider block">Yêu cầu rút số tiền</span>
                <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                  {selectedRequest.amount.toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Chi tiết tài khoản nhận tiền */}
              <div className="space-y-2.5 text-xs text-left">
                <span className="text-slate-500 font-bold block uppercase tracking-wider">Thông tin Ngân hàng thụ hưởng:</span>
                
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2 font-medium">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Ngân hàng:</span>
                    <strong className="text-white">{selectedRequest.bankName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Số tài khoản (STK):</span>
                    <strong className="text-emerald-400 font-mono text-sm">{selectedRequest.accountNumber}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Chủ tài khoản (CTK):</span>
                    <strong className="text-white font-mono uppercase">{selectedRequest.accountName}</strong>
                  </div>
                </div>
              </div>

              {/* Nút hành động dành cho PENDING */}
              {selectedRequest.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <button
                    onClick={() => {
                      setTxHashInput('');
                      setShowApproveModal(true);
                    }}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl border-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10 active:scale-95 transition"
                  >
                    <Check className="w-4 h-4 shrink-0" /> Duyệt Chuyển
                  </button>

                  <button
                    onClick={() => {
                      setRejectReasonInput('');
                      setShowRejectModal(true);
                    }}
                    className="py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <X className="w-4 h-4 shrink-0" /> Từ Chối
                  </button>
                </div>
              )}

              {/* APPROVED details */}
              {selectedRequest.status === 'APPROVED' && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-2 text-xs text-left">
                  <span className="text-xs text-emerald-400 font-bold block flex items-center justify-center gap-1">
                    <CheckCircle className="w-4.5 h-4.5" /> Chuyển Khoản Thành Công
                  </span>
                  
                  <div className="border-t border-emerald-500/10 pt-2 text-[10px] space-y-1.5 text-slate-400">
                    <div className="flex justify-between items-center">
                      <span>Mã chuyển khoản:</span>
                      <strong className="text-white font-mono">{selectedRequest.txHash}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Giờ hoàn thành:</span>
                      <strong className="text-white">{selectedRequest.completeDate}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* REJECTED details */}
              {selectedRequest.status === 'REJECTED' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-left space-y-2">
                  <span className="text-xs text-red-400 font-bold block flex items-center justify-center gap-1">
                    <AlertCircle className="w-4.5 h-4.5" /> Yêu Cầu Bị Từ Chối Rút
                  </span>
                  
                  <div className="border-t border-red-500/10 pt-2 text-[10px]">
                    <span className="text-slate-500 font-bold block uppercase tracking-wider mb-1">Lý do từ chối hệ thống:</span>
                    <p className="text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded-lg m-0">
                      "{selectedRequest.rejectReason}"
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-8 text-center text-slate-500 sticky top-24">
              <span className="text-3xl block mb-2 select-none">👈</span>
              Nhấn chọn một yêu cầu rút tiền bên trái để xem ngân hàng thụ hưởng, sao lưu hóa đơn đối chiếu và ký duyệt giải ngân quỹ.
            </div>
          )}
        </div>

      </div>

      {/* ======================================================================
          MODALS & DIALOGS ĐỐI THOẠI DUYỆT / TỪ CHỐI
          ====================================================================== */}
      
      {/* A. MODAL ĐIỀN MÃ CHUYỂN KHOẢN (APPROVE) */}
      <ApprovePayoutModal
        isOpen={showApproveModal}
        request={selectedRequest}
        txHashInput={txHashInput}
        setTxHashInput={setTxHashInput}
        onClose={() => {
          setShowApproveModal(false);
          setTxHashInput('');
        }}
        onSubmit={handleConfirmApprove}
      />

      {/* B. MODAL TỪ CHỐI RÚT TIỀN (REJECT) */}
      <RejectPayoutModal
        isOpen={showRejectModal}
        request={selectedRequest}
        rejectReasonInput={rejectReasonInput}
        setRejectReasonInput={setRejectReasonInput}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReasonInput('');
        }}
        onSubmit={handleConfirmReject}
      />

    </div>
  );
};
