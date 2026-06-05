import React from 'react';
import { toast } from 'sonner';
import type { BookingItem } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { 
  QrCode, 
  Utensils, 
  XCircle, 
  Star, 
  AlertTriangle 
} from 'lucide-react';

interface BookingDetailsModalProps {
  isOpen: boolean;
  booking: BookingItem | null;
  onClose: () => void;
  onPayOnline: () => void;
  onCancelRequest: () => void;
  onWriteReview: () => void;
  onOpenDispute: () => void;
  onRefreshMatches?: () => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  booking,
  onClose,
  onPayOnline,
  onCancelRequest,
  onWriteReview,
  onOpenDispute,
  onRefreshMatches,
}) => {
  if (!isOpen || !booking) return null;

  const [showReasonModal, setShowReasonModal] = React.useState<boolean>(false);
  const [reasonMode, setReasonMode] = React.useState<'KICK' | 'LEAVE'>('LEAVE');
  const [selectedParticipantId, setSelectedParticipantId] = React.useState<string | null>(null);
  const [cancelReasonText, setCancelReasonText] = React.useState<string>('');

  const userInfoStr = localStorage.getItem('user_info');
  const currentUser = userInfoStr ? JSON.parse(userInfoStr) : null;
  const currentUserId = currentUser?.id?.toString() || '';

  const checkIsPlayTimeArrived = () => {
    if (!booking || !booking.bookingDate || !booking.startTime) return false;
    const [year, month, day] = booking.bookingDate.split('-').map(Number);
    const [hours, minutes] = booking.startTime.split(':').map(Number);
    const playStart = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    return new Date() >= playStart;
  };

  const executeKickPlayer = async (participantId: string, reason: string) => {
    const token = localStorage.getItem('user_token');
    if (!token || !booking) return;

    try {
      const matchPostId = booking.id.replace('match-', '');
      const res = await fetch(`http://localhost:3000/matchmaking/posts/${matchPostId}/participants/${participantId}/kick`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Không thể xóa thành viên.');
      }

      toast.success('Đã xóa thành viên khỏi ca ghép kèo thành công!');
      if (onRefreshMatches) {
        onRefreshMatches();
      }
      onClose();
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const executeLeaveMatch = async (reason: string) => {
    const token = localStorage.getItem('user_token');
    if (!token || !booking) return;

    try {
      const matchPostId = booking.id.replace('match-', '');
      const res = await fetch(`http://localhost:3000/matchmaking/posts/${matchPostId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Không thể rời kèo đấu.');
      }

      toast.success('Bạn đã hủy tham gia kèo đấu thành công!');
      if (onRefreshMatches) {
        onRefreshMatches();
      }
      onClose();
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const executeCancelMatch = async () => {
    const token = localStorage.getItem('user_token');
    if (!token || !booking) return;

    if (!window.confirm('Bạn có chắc chắn muốn hủy và xóa ca ghép đôi này không?')) {
      return;
    }

    try {
      const matchPostId = booking.id.replace('match-', '');
      const res = await fetch(`http://localhost:3000/matchmaking/posts/${matchPostId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Không thể hủy bài đăng.');
      }

      toast.success('Đã hủy bài đăng ghép đôi thành công!');
      if (onRefreshMatches) {
        onRefreshMatches();
      }
      onClose();
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const handleConfirmReason = async () => {
    if (reasonMode === 'KICK') {
      if (!selectedParticipantId) return;
      await executeKickPlayer(selectedParticipantId, cancelReasonText);
    } else {
      await executeLeaveMatch(cancelReasonText);
    }
    setShowReasonModal(false);
    setCancelReasonText('');
    setSelectedParticipantId(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left space-y-6 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200 my-8">
        
        {/* Tiêu đề details */}
        <div className="flex justify-between items-start border-b border-slate-850 pb-4">
          <div className="space-y-1">
            <span className="text-[9px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-emerald-400 font-mono font-bold tracking-wider">
              {booking.bookingCode}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white m-0 mt-1">{booking.courtName}</h3>
            <p className="text-xs text-slate-400 font-medium m-0 flex items-center gap-1">
              Môn chơi: <strong className="text-emerald-400">{booking.sport}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Phân đoạn Vé Check-in QR */}
        {booking.status === 'CONFIRMED' && !booking.isMatch && (
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 text-center space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
            <div className="w-36 h-36 bg-white p-2.5 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-black/40">
              {/* Giả lập QR Code */}
              <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center border border-dashed border-slate-300 text-slate-800">
                <QrCode className="w-12 h-12 stroke-[1.5]" />
                <span className="text-[8px] font-mono font-bold mt-1 tracking-wider">{booking.bookingCode}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white m-0">Mã QR Check-in Tại Sân</p>
              <p className="text-[10px] text-slate-500 max-w-[220px] mx-auto m-0 leading-relaxed">
                Đưa mã này cho nhân viên quầy lễ tân quét khi bạn đến nhận sân đấu.
              </p>
            </div>
          </div>
        )}

        {/* Phân đoạn Lịch Ghép Kèo Matchmaking */}
        {booking.isMatch && (
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 text-center space-y-2 relative overflow-hidden group">
            <div className="text-3xl">🤝</div>
            <p className="text-xs font-bold text-white m-0">Lịch Giao Lưu Ghép Kèo</p>
            <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto m-0 leading-relaxed">
              Đây là lịch thi đấu ghép cặp giao lưu thể thao. Hãy đến sân đúng giờ đã đăng ký và liên hệ với Host hoặc các tuyển thủ cùng chơi để nhận sân.
            </p>
            {booking.description && (
              <div className="mt-3 p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl text-left text-[11px] text-slate-300 leading-normal max-h-24 overflow-y-auto">
                <span className="font-bold text-slate-400 block mb-1 text-[10px] uppercase tracking-wider">Mô tả kèo đấu:</span>
                {booking.description}
              </div>
            )}
          </div>
        )}

        {/* Thông tin Chi tiết ca và Dịch vụ đi kèm */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Ngày chơi:</span>
            <strong className="text-white">{booking.bookingDate}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Giờ thuê ca:</span>
            <strong className="text-white">{booking.startTime} - {booking.endTime}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Địa điểm cụm sân:</span>
            <strong className="text-white text-right max-w-[240px] truncate">{booking.location}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Trạng thái thanh toán:</span>
            <strong className={`font-bold ${
              booking.paymentStatus === 'FULLY_PAID' ? 'text-emerald-400' :
              booking.paymentStatus === 'UNPAID' ? 'text-amber-500' : 'text-slate-500'
            }`}>
              {booking.paymentStatus === 'FULLY_PAID' ? 'Đã thanh toán đủ' :
               booking.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' :
               booking.paymentStatus === 'DEPOSIT_PAID' ? 'Đã cọc 50%' : 'Đã hoàn tiền'}
            </strong>
          </div>

          {/* Sản phẩm mua kèm */}
          {!booking.isMatch && (booking.products || []).length > 0 && (
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                <Utensils className="w-3.5 h-3.5 text-amber-500" />
                <span>Sản phẩm / Dịch vụ phụ trợ đính kèm</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-855 rounded-xl p-3 space-y-2">
                {(booking.products || []).map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>{p.name} <span className="text-slate-500 font-bold">x{p.qty}</span></span>
                    <span className="font-mono text-white font-bold">{(p.qty * p.price).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tổng hóa đơn hoặc thông tin ghép kèo */}
          {booking.isMatch ? (
            <div className="space-y-3">
              <div className="border-t border-slate-850 pt-3 space-y-2.5 text-xs text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Chủ phòng ghép kèo (Host):</span>
                  <strong className="text-white">{booking.matchHost}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Số lượng người chơi:</span>
                  <strong className="text-white">{booking.matchCurrentPlayers} / {booking.matchMaxPlayers} tuyển thủ</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Trạng thái tham gia:</span>
                  {booking.isHostMatch ? (
                    <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Chủ phòng (Tổ chức)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Đã ứng tuyển thành công
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-800">
                  <span className="font-bold">Chi phí ca chơi:</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">Chia đều / Miễn phí</span>
                </div>
              </div>

              {/* Danh sách thành viên tham gia ghép kèo */}
              {booking.matchParticipants && booking.matchParticipants.length > 0 && (
                <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-bold">
                    <span>Tuyển thủ đã tham gia ({booking.matchParticipants.filter(p => p.status === 'JOINED').length} người):</span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-855 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                    {booking.matchParticipants.map((p, idx) => (
                      <div key={p.id || idx} className="flex justify-between items-center py-1 border-b border-slate-800 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-850 flex items-center justify-center text-[10px] font-bold text-slate-300">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-slate-200">{p.name}</span>
                          {p.status === 'JOINED' && (
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                              Đã tham gia
                            </span>
                          )}
                        </div>
                        {booking.isHostMatch && p.status === 'JOINED' && p.userId !== currentUserId && (
                          <button
                            onClick={() => {
                              setSelectedParticipantId(p.id);
                              setReasonMode('KICK');
                              setShowReasonModal(true);
                              setCancelReasonText('');
                            }}
                            className="text-[9px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 transition cursor-pointer"
                          >
                            Xóa thành viên
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t border-slate-855 pt-3 flex justify-between items-baseline">
              <span className="text-slate-400 font-bold">Tổng tiền đơn đặt:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {booking.price.toLocaleString('vi-VN')}đ
              </span>
            </div>
          )}
        </div>

        {/* HÀNH ĐỘNG DỰA TRÊN TRẠNG THÁI ĐƠN HÀNG */}
        {!booking.isMatch ? (
          <div className="space-y-2.5 pt-4 border-t border-slate-800">
            {/* Chờ thanh toán -> Cho phép Thanh toán ngay */}
            {booking.status === 'PENDING' && (
              <Button 
                onClick={onPayOnline}
                variant="primary" 
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                💳 Thanh Toán Ngay Cổng Online
              </Button>
            )}

            {/* Cho phép hủy lịch nếu sắp chơi (CONFIRMED hoặc PENDING) */}
            {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
              <Button 
                onClick={onCancelRequest}
                variant="secondary" 
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                Yêu Cầu Hủy Lịch Sân
              </Button>
            )}

            {/* Đã hoàn thành -> Cho phép Review và Khiếu nại */}
            {booking.status === 'COMPLETED' && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  disabled={booking.reviewed}
                  onClick={onWriteReview}
                  variant="secondary"
                  className={`py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer border ${
                    booking.reviewed 
                      ? 'bg-slate-950 border-slate-850 text-slate-500 cursor-not-allowed' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current shrink-0" />
                  {booking.reviewed ? 'Đã Đánh Giá' : 'Đánh Giá'}
                </Button>

                <Button
                  disabled={booking.disputed}
                  onClick={onOpenDispute}
                  variant="secondary"
                  className={`py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer border ${
                    booking.disputed 
                      ? 'bg-slate-950 border-slate-850 text-red-500/30 cursor-not-allowed' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {booking.disputed ? 'Đang Khiếu Nại' : 'Khiếu Nại'}
                </Button>
              </div>
            )}

            {/* Đã hủy -> Vẫn cho khiếu nại (nếu bị hủy oan hoặc không hoàn cọc) */}
            {booking.status === 'CANCELLED' && (
              <Button 
                disabled={booking.disputed}
                onClick={onOpenDispute}
                variant="secondary" 
                className={`w-full py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border ${
                  booking.disputed 
                    ? 'bg-slate-950 border-slate-850 text-red-500/30 cursor-not-allowed' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {booking.disputed ? 'Đang Xử Lý Khiếu Nại' : 'Khiếu Nại Hoàn Tiền / Cọc'}
              </Button>
            )}
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            {!booking.isHostMatch && (
              <Button 
                onClick={() => {
                  setReasonMode('LEAVE');
                  setShowReasonModal(true);
                  setCancelReasonText('');
                }}
                variant="secondary" 
                className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 hover:border-red-500/50 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                Hủy tham gia kèo đấu này
              </Button>
            )}
             {booking.isHostMatch && (
              <div className="w-full space-y-1.5">
                <Button 
                  disabled={!checkIsPlayTimeArrived()}
                  onClick={executeCancelMatch}
                  variant="secondary" 
                  className={`w-full py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border ${
                    checkIsPlayTimeArrived() 
                      ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30 hover:border-red-500/50' 
                      : 'bg-slate-950 border-slate-850 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Hủy & Xóa bài đăng ghép đôi
                </Button>
                {!checkIsPlayTimeArrived() && (
                  <span className="text-[10px] text-amber-500/80 font-medium block text-center mt-1">
                    ⚠️ Chỉ có thể hủy/xóa khi ca đấu bắt đầu ({booking.startTime} ngày {booking.bookingDate}).
                  </span>
                )}
              </div>
            )}
            <Button 
              onClick={onClose}
              variant="secondary" 
              className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Đóng Chi Tiết Lịch Ghép
            </Button>
          </div>
        )}

      {/* MODAL NHẬP LÝ DO HỦY / XÓA */}
      {showReasonModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 text-left space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div>
              <h4 className="text-sm font-black text-white">
                {reasonMode === 'KICK' ? 'Lý do xóa tuyển thủ' : 'Lý do hủy tham gia'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {reasonMode === 'KICK' 
                  ? 'Vui lòng cung cấp lý do để gửi thông báo cho tuyển thủ này.'
                  : 'Hãy chia sẻ lý do rút lui để thông báo cho chủ phòng biết.'}
              </p>
            </div>
            
            <textarea
              value={cancelReasonText}
              onChange={(e) => setCancelReasonText(e.target.value)}
              placeholder="Nhập lý do tại đây..."
              rows={3}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none font-medium"
            />
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setCancelReasonText('');
                  setSelectedParticipantId(null);
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold rounded-lg cursor-pointer transition border border-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                disabled={!cancelReasonText.trim()}
                onClick={handleConfirmReason}
                className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition border ${
                  cancelReasonText.trim()
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/20'
                    : 'bg-slate-850 text-slate-500 border-slate-800 cursor-not-allowed'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
