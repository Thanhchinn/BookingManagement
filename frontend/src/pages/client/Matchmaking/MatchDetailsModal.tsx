import React from 'react';
import { 
  MapPin, 
  Users, 
  Check, 
  X, 
  UserPlus, 
  MessageSquare,
  Phone
} from 'lucide-react';
import type { MatchPost } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';

interface MatchDetailsModalProps {
  isOpen: boolean;
  match: MatchPost | null;
  onClose: () => void;
  userName?: string;
  onNavigate?: (page: any) => void;
  onOpenApplyModal: () => void;
  onApproveApplicant: (id: string, approve: boolean) => void;
  onCancelMatch: () => void;
}

const Badge: React.FC<{ status: 'success' | 'warning' | 'danger' | 'info'; children: React.ReactNode }> = ({ status, children }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border uppercase tracking-wider ${styles[status]}`}>
      {children}
    </span>
  );
};

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  isOpen,
  match,
  onClose,
  userName,
  onNavigate,
  onOpenApplyModal,
  onApproveApplicant,
  onCancelMatch,
}) => {
  if (!isOpen || !match) return null;

  const isHost = match.hostName === userName;
  const isJoined = match.participants.some(p => p.name === userName && p.status === 'JOINED');
  const isPending = match.participants.some(p => p.name === userName && p.status === 'PENDING');
  const missingCount = match.maxPlayers - match.currentPlayers;

  const checkIsPlayTimeArrived = () => {
    if (!match || !match.playDate || !match.startTime) return false;
    const [year, month, day] = match.playDate.split('-').map(Number);
    const [hours, minutes] = match.startTime.split(':').map(Number);
    const playStart = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    return new Date() >= playStart;
  };

  const handleContactHost = async () => {
    if (!userName) {
      toast.error('Vui lòng đăng nhập để gửi tin nhắn.');
      onNavigate?.('auth');
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) {
      toast.error('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.');
      onNavigate?.('auth');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/chats/rooms/individual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: match.userId.toString() })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('sportzone_active_chat_room_id', data.id);
        onClose();
        onNavigate?.('chat');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Không thể mở phòng chat cá nhân với Host.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  const handleEnterGroupChat = async () => {
    if (!match) return;
    const token = localStorage.getItem('user_token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để tham gia.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/chats/rooms/match/${match.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('sportzone_active_chat_room_id', data.id);
        onClose();
        onNavigate?.('chat');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Không thể mở phòng chat nhóm.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-left space-y-6 shadow-2xl shadow-black/95 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] relative">
        
        {/* Header: Title, Sport badge, Close Button */}
        <div className="flex justify-between items-start gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-950 border border-slate-850 px-3 py-1 rounded-full text-emerald-400 font-bold uppercase tracking-wider">
                {match.sport}
              </span>
              {match.status === 'PENDING' ? (
                <Badge status="warning">Chờ duyệt</Badge>
              ) : match.status === 'REJECTED' ? (
                <Badge status="danger">Bị từ chối</Badge>
              ) : match.status === 'FULL' ? (
                <Badge status="info">Đầy chỗ</Badge>
              ) : (
                <Badge status="success">Còn thiếu {missingCount} người</Badge>
              )}
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white m-0 tracking-tight leading-snug">
              {match.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-950/60 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Chi tiết mô tả bài đăng (Lời nhắn của Host) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Lời nhắn từ người đăng tuyển:</h4>
          <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap m-0 font-medium italic">
              "{match.description || 'Không có mô tả chi tiết cho trận này.'}"
            </p>
          </div>
        </div>

        {/* 3. Thông tin chi tiết về ca kèo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="bg-slate-950/40 border border-slate-850/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Môn thể thao:</span>
              <strong className="text-emerald-400 font-bold uppercase">{match.sport}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Yêu cầu trình độ:</span>
              <strong className="text-slate-200">{match.skillLevel}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ngày chơi:</span>
              <strong className="text-slate-200">{match.playDate}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Giờ thi đấu:</span>
              <strong className="text-slate-200">{match.startTime} - {match.endTime}</strong>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-850/80 rounded-2xl p-4 flex flex-col justify-between gap-3.5">
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0">Địa điểm:</span>
                <strong className="text-slate-200 text-right leading-snug">{match.courtName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Người đăng tin (Host):</span>
                <strong className="text-slate-200 flex items-center gap-1">
                  <span>{match.hostAvatar}</span>
                  <span>{match.hostName}</span>
                </strong>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Vui lòng đến đúng giờ đã đăng ký để tham gia hoạt động.</span>
            </div>
          </div>
        </div>

        {/* Nút liên hệ trực tiếp */}
        {match.hostPhone && (
          <div className="space-y-3 bg-slate-950/30 border border-slate-850 rounded-2xl p-4 text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isHost ? 'Thông tin liên hệ của bạn (Hiển thị với người khác):' : 'Liên hệ trực tiếp với Host:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a 
                href={`tel:${match.hostPhone}`}
                className="flex items-center justify-center gap-2 py-2.5 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-extrabold rounded-xl transition cursor-pointer no-underline"
              >
                <Phone className="w-4 h-4" /> Gọi điện: {match.hostPhone}
              </a>
              <button 
                onClick={handleContactHost}
                className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold rounded-xl transition cursor-pointer border-0"
              >
                <MessageSquare className="w-4 h-4" /> Nhắn tin trực tiếp
              </button>
            </div>
          </div>
        )}

        {/* 4. Thành viên đã chốt (Participants JOINED) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" /> 
              Tuyển thủ đã chốt ({match.currentPlayers}/{match.maxPlayers})
            </span>
            <span className="text-xs font-bold text-slate-500">
              {match.status === 'FULL' ? 'Đã đủ người' : `Còn thiếu ${missingCount} người`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/40 border border-slate-850 rounded-2xl p-4">
            {match.participants.filter(p => p.status === 'JOINED').map((p) => (
              <div key={p.id} className="flex justify-between items-center text-xs bg-slate-900/50 border border-slate-850/50 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center select-none text-[10px]">
                    {p.avatar}
                  </span>
                  <span className="text-slate-300 font-bold">{p.name}</span>
                </div>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-900/50 px-2 py-0.5 rounded-lg uppercase">
                  {p.name === match.hostName ? 'Chủ phòng' : 'Thành viên'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Khu vực duyệt ứng viên (Chỉ dành cho Host) hoặc nộp đơn (Dành cho Member) */}
        <div className="border-t border-slate-800/80 pt-5 space-y-4">
          {isHost ? (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0 text-left">
                Tuyển thủ đang xin gia nhập (Chờ duyệt)
              </h4>
              
              {match.participants.filter(p => p.status === 'PENDING').length === 0 ? (
                <div className="bg-slate-950/30 border border-slate-850 border-dashed rounded-2xl p-6 text-center text-xs text-slate-500">
                  ✓ Chưa có yêu cầu ứng tuyển mới cho ca đấu này.
                </div>
              ) : (
                <div className="space-y-3">
                  {match.participants.filter(p => p.status === 'PENDING').map((p) => (
                    <div key={p.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-left space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{p.avatar}</span>
                          <strong className="text-white text-xs">{p.name}</strong>
                        </div>
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                          Đợi duyệt
                        </span>
                      </div>

                      {p.note && (
                        <p className="text-xs bg-slate-900/90 border border-slate-850 p-3 rounded-xl text-slate-300 m-0 italic font-mono leading-relaxed">
                          "{p.note}"
                        </p>
                      )}

                      {/* Nút phê duyệt của Host */}
                      <div className="flex justify-end gap-3 text-xs pt-1">
                        <button
                          onClick={() => onApproveApplicant(p.id!, false)}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/30 rounded-xl cursor-pointer transition flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> Từ chối
                        </button>
                        <button
                          onClick={() => onApproveApplicant(p.id!, true)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-0 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/10"
                        >
                          <Check className="w-3.5 h-3.5" /> Đồng ý
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nút hủy bài đăng */}
              <div className="pt-2 space-y-1.5">
                <button
                  disabled={!checkIsPlayTimeArrived()}
                  onClick={onCancelMatch}
                  className={`w-full py-3.5 font-bold border rounded-2xl transition text-xs uppercase tracking-wider ${
                    checkIsPlayTimeArrived()
                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer'
                      : 'bg-slate-950 border-slate-850 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Hủy & Xóa bài đăng ghép đôi
                </button>
                {!checkIsPlayTimeArrived() && (
                  <span className="text-[10px] text-amber-500/80 font-medium block text-center">
                    ⚠️ Chỉ có thể hủy/xóa khi ca đấu bắt đầu ({match.startTime} ngày {match.playDate}).
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div>
              {isPending ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-center space-y-1">
                  <span className="text-xs text-amber-400 font-bold block">Đã Nộp Đơn Ứng Tuyển ✓</span>
                  <p className="text-[10px] text-slate-500 m-0 leading-normal">
                    Yêu cầu tham gia đang được Host kiểm duyệt. Bạn sẽ nhận được phản hồi sớm nhất.
                  </p>
                </div>
              ) : isJoined ? (
                <div className="space-y-3.5">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
                    <span className="text-xs text-emerald-400 font-bold block">Bạn Đã Là Thành Viên Trận Đấu 🎉</span>
                    <p className="text-[10px] text-slate-500 m-0 mt-1 leading-normal">
                      Vào phòng chat nhóm để kết nối và bàn thảo chi tiết kèo đấu với các thành viên khác.
                    </p>
                  </div>
                  <Button 
                    onClick={handleEnterGroupChat}
                    variant="primary" 
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Vào Phòng Chat Nhóm Ngay
                  </Button>
                </div>
              ) : match.status === 'FULL' ? (
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 text-center text-slate-500 text-xs font-semibold">
                  ⚠️ Nhóm đã đủ người đăng ký tham gia giao lưu ca này.
                </div>
              ) : match.status === 'PENDING' ? (
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 text-center text-slate-500 text-xs font-semibold">
                  🕒 Bài viết này đang chờ Ban quản trị phê duyệt trước khi công khai.
                </div>
              ) : match.status === 'REJECTED' ? (
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 text-center text-red-500 text-xs font-semibold">
                  ❌ Bài viết này đã bị Ban quản trị từ chối.
                </div>
              ) : (
                <Button 
                  onClick={onOpenApplyModal}
                  variant="primary" 
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm font-extrabold rounded-2xl cursor-pointer flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-95"
                >
                  <UserPlus className="w-4.5 h-4.5" /> Ứng Tuyển Gia Nhập Nhóm
                </Button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
