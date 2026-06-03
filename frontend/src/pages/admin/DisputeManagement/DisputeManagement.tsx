import React, { useState } from 'react';
import { 
  ChevronRight,
  User,
  Building,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

import type { Dispute } from '../../../types';

export const DisputeManagement: React.FC = () => {
  // Mock State để có thể tương tác đầy đủ trên giao diện
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: 'DISP-7721',
      bookingCode: 'BKG-STADIUM802',
      userName: 'Trần Minh Quang',
      partnerName: 'Stadium A (Chủ sân bóng đá)',
      category: 'NO_SHOW',
      description: 'Tôi đã đặt sân bóng đá ca 19:00 ngày 30/05 và thanh toán online 100%. Tuy nhiên khi đội của tôi đến nơi thì sân khóa cửa, liên hệ hotline không ai nghe máy, bảo vệ chi nhánh báo hôm đó sân đóng cửa bảo trì thảm cỏ đột xuất.',
      evidence: ['📸 Ảnh chụp sân khóa xích khóa ngoài', '📸 Ảnh chụp màn hình lịch sử cuộc gọi lỡ'],
      status: 'OPEN',
      createdAt: '2026-05-30 20:15'
    },
    {
      id: 'DISP-7541',
      bookingCode: 'BKG-COURT501',
      userName: 'Lê Thu Thủy',
      partnerName: 'ProZone Badminton (Chủ sân cầu lông)',
      category: 'QUALITY',
      description: 'Chất lượng thảm đấu quá trơn trượt nguy hiểm, đèn LED bố trí trực diện mắt người chơi gây lóa mắt nghiêm trọng làm bạn tôi bị ngã trật khớp. Tôi yêu cầu hoàn trả 50% tiền sân ca đấu.',
      evidence: ['📸 Ảnh chụp thảm đấu bong tróc rách góc'],
      status: 'INVESTIGATING',
      createdAt: '2026-05-29 11:30'
    },
    {
      id: 'DISP-7109',
      bookingCode: 'BKG-TENNIS991',
      userName: 'Nguyễn Văn Đạt',
      partnerName: 'ATP Tennis Court',
      category: 'OVERCHARGE',
      description: 'Nhân viên quầy thu thêm 50.000đ tiền gửi xe ô tô trong khi trên trang quảng cáo của SportZone ghi rõ bãi đỗ xe ô tô rộng rãi miễn phí kèm trong phí đặt sân.',
      evidence: ['📸 Vé gửi xe ô tô có dấu đỏ thu phí'],
      status: 'RESOLVED',
      resolution: 'Admin đã liên hệ chủ sân ATP Tennis, phía cơ sở xác nhận nhân viên mới làm chưa nắm rõ quy định và đã thực hiện chuyển khoản trả lại 50.000đ cho khách hàng Nguyễn Văn Đạt.',
      verdict: 'PARTNER_WIN',
      createdAt: '2026-05-26 14:00'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED'>('ALL');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  
  // Resolution Form State
  const [resolutionText, setResolutionText] = useState('');
  const [verdict, setVerdict] = useState<'REFUND' | 'PARTNER_WIN'>('REFUND');

  const filteredDisputes = disputes.filter(d => {
    if (activeFilter === 'ALL') return true;
    return d.status === activeFilter;
  });

  // Chuyển sang đang điều tra
  const handleStartInvestigating = (id: string) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: 'INVESTIGATING' as const };
      }
      return d;
    }));
    setSelectedDispute(prev => prev ? { ...prev, status: 'INVESTIGATING' } : null);
    alert('Đã chuyển trạng thái hồ sơ khiếu nại sang: ĐANG ĐIỀU TRA.');
  };

  // Đăng quyết định phán quyết giải quyết
  const handleResolveDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    setDisputes(prev => prev.map(d => {
      if (d.id === selectedDispute.id) {
        return {
          ...d,
          status: 'RESOLVED' as const,
          resolution: resolutionText,
          verdict: verdict
        };
      }
      return d;
    }));

    setSelectedDispute(prev => prev ? {
      ...prev,
      status: 'RESOLVED',
      resolution: resolutionText,
      verdict: verdict
    } : null);

    setResolutionText('');
    alert(verdict === 'REFUND' 
      ? 'Phán quyết hoàn tất: Chấp thuận hoàn tiền 100% cho Khách hàng. Hệ thống đã trừ tiền ví tạm giữ đối tác.' 
      : 'Phán quyết hoàn tất: Xử thắng cho chủ sân cơ sở. Giải phóng doanh thu giữ chỗ vào ví tiền đối tác.');
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'QUALITY': return 'Chất lượng kém';
      case 'CANCELLATION': return 'Chủ sân hủy vô lý';
      case 'OVERCHARGE': return 'Thu sai tiền / Phí ẩn';
      case 'NO_SHOW': return 'Bỏ bom ca / Đóng cửa';
      case 'OTHER': return 'Lý do khác';
      default: return cat;
    }
  };

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* Tabs lọc */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {(['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'] as const).map(filter => {
          const label = filter === 'ALL' ? 'Tất cả vụ việc' : 
                        filter === 'OPEN' ? 'Mới nhận (OPEN)' : 
                        filter === 'INVESTIGATING' ? 'Đang điều tra' : 'Đã xử lý xong (RESOLVED)';
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

      {/* Layout Hai cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Danh sách disputes */}
        <div className="lg:col-span-2 space-y-4">
          {filteredDisputes.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <span className="text-3xl block">⚖️</span>
              <h4 className="text-sm font-bold text-white m-0">Không tìm thấy vụ việc khiếu nại nào</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Hệ thống đang vận hành ổn định mượt mà, không có khiếu nại chưa xử lý trong danh mục này.</p>
            </div>
          ) : (
            filteredDisputes.map(d => (
              <div 
                key={d.id}
                onClick={() => setSelectedDispute(d)}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer transition hover:border-slate-700 ${
                  selectedDispute?.id === d.id ? 'border-emerald-500 bg-slate-900/90' : 'border-slate-800/80'
                }`}
              >
                <div className="space-y-3 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{d.id}</span>
                    <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-amber-500 font-bold uppercase tracking-wider">
                      {getCategoryLabel(d.category)}
                    </span>
                    {d.status === 'OPEN' ? (
                      <Badge status="danger">Mới nhận</Badge>
                    ) : d.status === 'INVESTIGATING' ? (
                      <Badge status="warning">Đang điều tra</Badge>
                    ) : (
                      <Badge status="success">Đã giải quyết</Badge>
                    )}
                  </div>

                  <h4 className="text-sm font-extrabold text-white m-0">
                    Giao dịch: <span className="font-mono text-slate-400 font-bold">{d.bookingCode}</span>
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed truncate-2-lines max-w-xl m-0">
                    {d.description}
                  </p>
                </div>

                <div className="w-full sm:w-auto flex sm:flex-col items-end justify-between sm:justify-center gap-2.5 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 shrink-0">
                  <span className="text-[9px] text-slate-500 font-mono">{d.createdAt}</span>
                  <button className="flex items-center gap-1 text-[10px] font-extrabold text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition duration-150">
                    Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cột phải: Xem chi tiết & Xử lý */}
        <div className="space-y-6">
          {selectedDispute ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 sticky top-24">
              
              {/* Header chi tiết */}
              <div className="border-b border-slate-800 pb-3 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] font-mono text-slate-500">{selectedDispute.id}</span>
                  <span className="text-[9px] text-slate-500">{selectedDispute.createdAt}</span>
                </div>
                <h4 className="text-base font-black text-white m-0">Khiếu nại: {getCategoryLabel(selectedDispute.category)}</h4>
                <p className="text-xs text-emerald-400 font-bold m-0">Đơn đặt: {selectedDispute.bookingCode}</p>
              </div>

              {/* Thông tin 2 bên */}
              <div className="space-y-2.5 bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Người khiếu nại: <strong className="text-white">{selectedDispute.userName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Đối tác bị khiếu nại: <strong className="text-white">{selectedDispute.partnerName}</strong></span>
                </div>
              </div>

              {/* Tường trình của khách */}
              <div className="space-y-1.5 text-xs text-left">
                <span className="text-slate-500 font-bold block uppercase tracking-wider">Nội dung tường trình của Khách:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-950 border border-slate-850 p-3 rounded-xl m-0">
                  "{selectedDispute.description}"
                </p>
              </div>

              {/* Bằng chứng bằng ảnh */}
              {selectedDispute.evidence.length > 0 && (
                <div className="space-y-1.5 text-xs text-left">
                  <span className="text-slate-500 font-bold block uppercase tracking-wider">Tệp tin bằng chứng đính kèm:</span>
                  <div className="space-y-1.5">
                    {selectedDispute.evidence.map((ev, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-[10px] text-slate-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút hành động trạng thái */}
              {selectedDispute.status === 'OPEN' && (
                <button
                  onClick={() => handleStartInvestigating(selectedDispute.id)}
                  className="w-full py-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-1"
                >
                  🔍 Bắt đầu Tiếp Nhận & Điều Tra
                </button>
              )}

              {/* Quyết định giải quyết (Khi đang điều tra) */}
              {selectedDispute.status === 'INVESTIGATING' && (
                <form 
                  onSubmit={handleResolveDispute}
                  className="space-y-4 border-t border-slate-800 pt-4"
                >
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Lập Phán Quyết Hòa Giải</span>
                  
                  {/* Verdict options */}
                  <div className="space-y-1.5 text-xs">
                    <label className="text-slate-300 block">Quyết định phán quyết chung cuộc:</label>
                    <select
                      value={verdict}
                      onChange={(e) => setVerdict(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 outline-none"
                    >
                      <option value="REFUND">Khách hàng thắng: Hoàn 100% tiền đơn đặt</option>
                      <option value="PARTNER_WIN">Chủ sân thắng: Giữ nguyên doanh thu đối tác</option>
                    </select>
                  </div>

                  {/* Resolution text */}
                  <div className="space-y-1.5 text-xs">
                    <label className="text-slate-300 block">Ghi chú giải pháp chính thức:</label>
                    <textarea
                      required
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Mô tả lại căn cứ hòa giải, cuộc gọi xác minh giữa 2 bên để lưu lịch sử..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3 text-xs text-slate-300 outline-none transition resize-none h-20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white border-0 rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10 transition active:scale-95"
                  >
                    ✓ Công Bố Phán Quyết & Đóng Vụ Việc
                  </button>

                </form>
              )}

              {/* Đã giải quyết xong */}
              {selectedDispute.status === 'RESOLVED' && (
                <div className="space-y-3.5 border-t border-slate-800 pt-4 text-xs text-left">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center">
                    <span className="text-xs text-emerald-400 font-bold block flex items-center justify-center gap-1">
                      <CheckCircle className="w-4.5 h-4.5" /> Vụ Việc Đã Được Giải Quyết
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1 block uppercase font-mono">
                      Phán quyết: {selectedDispute.verdict === 'REFUND' ? 'Hoàn tiền khách' : 'Giữ tiền đối tác'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold block uppercase tracking-wider">Nội dung hòa giải ghi chú:</span>
                    <p className="text-slate-400 leading-relaxed bg-slate-950 border border-slate-850 p-3 rounded-xl m-0">
                      "{selectedDispute.resolution}"
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-8 text-center text-slate-500 sticky top-24">
              <span className="text-3xl block mb-2 select-none">👈</span>
              Nhấn chọn một vụ khiếu nại bên trái để xem nội dung sự cố, đối thoại chứng cứ và đưa ra phán quyết xử phạt/hoàn tiền.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
