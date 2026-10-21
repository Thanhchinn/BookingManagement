import React, { useState } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  SlidersHorizontal,
  ChevronRight,
  PlusCircle
} from 'lucide-react';

import type { MatchPost } from '../../../types';
import { ApplyJoinModal } from './ApplyJoinModal';
import { MatchDetailsModal } from './MatchDetailsModal';
import { toast } from 'sonner';

interface MatchmakingProps {
  onNavigate?: (page: any, authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
}

export const Matchmaking: React.FC<MatchmakingProps> = ({ onNavigate, userName, onLogout }) => {
  // Trạng thái danh sách
  const [matches, setMatches] = useState<MatchPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my-posts'>('all');

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('ALL');
  const [skillFilter, setSkillFilter] = useState<'ALL' | 'Bất kỳ' | 'Mới chơi' | 'Khá' | 'Chuyên nghiệp'>('ALL');

  const getSportTypeName = (type?: string): string => {
    if (!type) return 'Thể thao';
    const t = type.toLowerCase().trim();
    if (t === 'cau-long' || t === 'badminton' || t === 'cầu lông') return 'Cầu Lông';
    if (t === 'bong-da' || t === 'football' || t === 'soccer' || t === 'bóng đá') return 'Bóng Đá';
    if (t === 'tennis' || t === 'quần vợt') return 'Tennis';
    if (t === 'pickleball') return 'Pickleball';
    if (t === 'bong-ro' || t === 'basketball' || t === 'bóng rổ') return 'Bóng Rổ';
    return type;
  };
  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<MatchPost | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  
  // Ứng tuyển tham gia
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyNote, setApplyNote] = useState('');

  // Lấy client token thực tế từ localStorage (đồng bộ với hệ thống)
  const getClientToken = () => localStorage.getItem('user_token');

  // Fetch dữ liệu các trận ghép đôi
  const fetchMatches = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:3000/matchmaking/posts/public';
      
      // Nếu activeTab là 'my-posts', cần gọi API riêng
      if (activeTab === 'my-posts') {
        url = 'http://localhost:3000/matchmaking/posts/my-posts';
        const token = getClientToken();
        if (!token) {
          toast.warning('Vui lòng đăng nhập để xem bài đăng của bạn.');
          setActiveTab('all');
          return;
        }
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMatches(data);
          // Cập nhật selectedMatch nếu nó đang hiển thị
          if (selectedMatch) {
            const currentSelected = data.find((m: any) => m.id === selectedMatch.id);
            if (currentSelected) {
              setSelectedMatch(currentSelected);
            }
          }
        } else if (res.status === 401) {
          localStorage.removeItem('user_token');
          localStorage.removeItem('user_info');
          onLogout?.();
          toast.error('Phiên đăng nhập hết hạn hoặc tài khoản đã bị khóa.');
          onNavigate?.('auth', 'login');
        } else {
          toast.error('Không thể tải bài đăng của bạn.');
        }
      } else {
        // Tải các trận công khai
        const params = new URLSearchParams();
        if (sportFilter && sportFilter !== 'ALL') params.append('sport', sportFilter);
        if (skillFilter && skillFilter !== 'ALL') params.append('skillLevel', skillFilter);
        if (searchQuery) params.append('search', searchQuery);
        
        const res = await fetch(`${url}?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMatches(data);
          // Cập nhật selectedMatch nếu nó đang hiển thị
          if (selectedMatch) {
            const currentSelected = data.find((m: any) => m.id === selectedMatch.id);
            if (currentSelected) {
              setSelectedMatch(currentSelected);
            }
          }
        } else {
          toast.error('Không thể tải danh sách ghép đôi.');
        }
      }
    } catch (err) {
      console.error('Lỗi kết nối API:', err);
      toast.error('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API lấy dữ liệu khi khởi chạy hoặc thay đổi bộ lọc/tab
  React.useEffect(() => {
    fetchMatches();
  }, [activeTab, sportFilter, skillFilter, searchQuery]);

  // Nộp đơn xin gia nhập trận
  const handleApplyToJoin = async () => {
    const token = getClientToken();
    if (!token) {
      toast.warning('Vui lòng đăng nhập trước khi ứng tuyển tham gia');
      onNavigate?.('auth', 'login');
      return;
    }
    if (!selectedMatch) return;

    try {
      const res = await fetch(`http://localhost:3000/matchmaking/posts/${selectedMatch.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: applyNote })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        // Cập nhật selectedMatch và list
        setSelectedMatch(updatedPost);
        setMatches(prev => prev.map(m => m.id === updatedPost.id ? updatedPost : m));
        setShowApplyModal(false);
        setApplyNote('');
        toast.success('Nộp đơn ứng tuyển thành công', {
          description: 'Vui lòng đợi Host kiểm duyệt đồng ý.',
        });
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Lỗi khi nộp đơn ứng tuyển.');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  // Duyệt ứng viên (Host Approve/Reject)
  const handleApproveApplicant = async (participantId: string, approve: boolean) => {
    const token = getClientToken();
    if (!token || !selectedMatch) return;

    try {
      const res = await fetch(`http://localhost:3000/matchmaking/posts/${selectedMatch.id}/participants/${participantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: approve ? 'JOINED' : 'REJECTED' })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setSelectedMatch(updatedPost);
        setMatches(prev => prev.map(m => m.id === updatedPost.id ? updatedPost : m));
        toast.info(approve ? 'Đã đồng ý nhận thành viên.' : 'Đã từ chối đơn ứng tuyển.');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Lỗi khi phê duyệt ứng viên.');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  // Hủy bài đăng (dành cho Host)
  const handleCancelMatch = async () => {
    const token = getClientToken();
    if (!token || !selectedMatch) return;

    if (!window.confirm('Bạn có chắc chắn muốn hủy và xóa ca ghép đôi này?')) return;

    try {
      const res = await fetch(`http://localhost:3000/matchmaking/posts/${selectedMatch.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success('Đã hủy bài đăng ghép đôi thành công.');
        setMatches(prev => prev.filter(m => m.id !== selectedMatch.id));
        setSelectedMatch(null);
        setShowDetailsModal(false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Lỗi khi hủy bài đăng.');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  const getSportIcon = (sport: string) => {
    if (!sport) return '🏆';
    const val = sport.toLowerCase().trim();
    switch (val) {
      case 'cau-long':
      case 'badminton':
      case 'cầu lông':
        return '🏸';
      case 'bong-da':
      case 'football':
      case 'soccer':
      case 'bóng đá':
        return '⚽';
      case 'pickleball':
        return '🏓';
      case 'tennis':
      case 'quần vợt':
        return '🎾';
      case 'bong-ro':
      case 'basketball':
      case 'bóng rổ':
        return '🏀';
      default:
        return '🏆';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-400">
      
      {/* Header */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* BACKGROUND DECORATIVE GLOW EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] opacity-70"></div>
        <div className="absolute bottom-1/3 right-10 w-[400px] h-[300px] bg-teal-500/10 rounded-full blur-[120px] opacity-60"></div>
      </div>

      {/* Main Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow w-full space-y-8 relative z-10">
        
        {/* Banner Giới thiệu */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/60">
          <div className="text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Kết nối cộng đồng thể thao
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white m-0 tracking-tight">
              Cộng Đồng Ghép Đội & Tìm Bạn Chơi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl m-0 leading-relaxed">
              Thiếu chân sút bóng đá, thiếu đối thủ pickleball hay tìm cặp đôi giao lưu cầu lông? Tìm kiếm và giao lưu thể thao tức thì.
            </p>
          </div>

          <Button
            onClick={() => {
              if (!userName) {
                toast.warning('Vui lòng đăng nhập trước khi đăng bài tìm đội giao hữu');
                onNavigate?.('auth', 'login');
              } else {
                onNavigate?.('matchmaking/create');
              }
            }}
            variant="primary"
            className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-2xl shadow-xl shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2 transition duration-200 active:scale-95 shrink-0 uppercase tracking-wide border-0"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5]" /> ĐĂNG CA TÌM TEAMMATE
          </Button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedMatch(null);
              setShowDetailsModal(false);
            }}
            className={`px-6 py-3.5 text-xs sm:text-sm font-black transition duration-200 border-b-2 cursor-pointer ${
              activeTab === 'all'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ca ghép đôi
          </button>
          {userName && (
            <button
              onClick={() => {
                setActiveTab('my-posts');
                setSelectedMatch(null);
                setShowDetailsModal(false);
              }}
              className={`px-6 py-3.5 text-xs sm:text-sm font-black transition duration-200 border-b-2 cursor-pointer ${
                activeTab === 'my-posts'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Bài đăng của tôi
            </button>
          )}
        </div>

        {/* Thanh lọc & tìm kiếm */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên sân, môn, tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Môn:</span>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value as any)}
                className="bg-slate-950 border border-white/10 text-[11px] font-bold text-white px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-emerald-400"
              >
                <option value="ALL">Tất cả môn</option>
                <option value="cau-long">Cầu Lông</option>
                <option value="bong-da">Bóng Đá</option>
                <option value="pickleball">Pickleball</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Trình độ:</span>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value as any)}
                className="bg-slate-950 border border-white/10 text-[11px] font-bold text-white px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-emerald-400"
              >
                <option value="ALL">Mọi trình độ</option>
                <option value="Bất kỳ">Bất kỳ</option>
                <option value="Mới chơi">Mới chơi</option>
                <option value="Khá">Khá</option>
                <option value="Chuyên nghiệp">Chuyên nghiệp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Khung nội dung chính */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">
              Đang tải dữ liệu ghép đôi...
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center space-y-3 shadow-xl">
              <span className="text-4xl block">🔍</span>
              <h4 className="text-base sm:text-lg font-black text-white m-0">Không tìm thấy ca ghép đội nào</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">Thử đổi từ khóa tìm kiếm hoặc lọc các môn thể thao khác để kết nối với những người chơi khác.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map(m => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMatch(m);
                    setShowDetailsModal(true);
                  }}
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-all duration-300 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 cursor-pointer shadow-xl group hover:translate-y-[-2px]"
                >
                  <div className="space-y-3 flex-grow text-left">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-2xl select-none">{getSportIcon(m.sport)}</span>
                      <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-emerald-400 font-mono font-black uppercase">{getSportTypeName(m.sport)}</span>
                      <span className="text-[11px] text-slate-400 font-medium">Trình độ: <strong className="text-slate-200 font-bold">{m.skillLevel}</strong></span>
                      
                      {m.status === 'PENDING' ? (
                        <Badge status="warning">Chờ duyệt</Badge>
                      ) : m.status === 'REJECTED' ? (
                        <Badge status="danger">Bị từ chối</Badge>
                      ) : m.status === 'FULL' ? (
                        <Badge status="info">Đủ người</Badge>
                      ) : (
                        <Badge status="success">Cần thêm {m.maxPlayers - m.currentPlayers} người</Badge>
                      )}
                    </div>

                    <h4 className="text-base sm:text-xl font-black text-white m-0 group-hover:text-emerald-400 transition-colors leading-snug">
                      {m.title}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                        <span className="font-bold">{m.playDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                        <span className="font-bold">{m.startTime} - {m.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-slate-500 shrink-0 stroke-[2]" />
                        <span className="truncate">{m.courtName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-white/10 pt-4 md:pt-0 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-xs font-bold select-none text-emerald-400 shadow-md">{m.hostAvatar}</span>
                      <div className="text-left leading-none">
                        <span className="text-[9px] text-slate-400 font-black uppercase block">Host</span>
                        <strong className="text-xs text-white block font-bold mt-0.5">{m.hostName}</strong>
                      </div>
                    </div>

                    <button className="flex items-center gap-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer">
                      Xem & ứng tuyển <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ======================================================================
          MODALS & FORMS TƯƠNG TÁC
          ====================================================================== */}
      
      {/* 2. MODAL ỨNG TUYỂN (APPLY TO JOIN) */}
      <ApplyJoinModal
        isOpen={showApplyModal}
        match={selectedMatch}
        applyNote={applyNote}
        setApplyNote={setApplyNote}
        onClose={() => {
          setShowApplyModal(false);
          setApplyNote('');
        }}
        onConfirm={handleApplyToJoin}
      />

      {/* 3. MODAL CHI TIẾT CA GHÉP (POPUP TO) */}
      <MatchDetailsModal
        isOpen={showDetailsModal}
        match={selectedMatch}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMatch(null);
        }}
        userName={userName}
        onNavigate={onNavigate}
        onOpenApplyModal={() => {
          setShowApplyModal(true);
        }}
        onApproveApplicant={handleApproveApplicant}
        onCancelMatch={handleCancelMatch}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
};
