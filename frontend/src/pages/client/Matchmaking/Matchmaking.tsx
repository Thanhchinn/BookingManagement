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
  const [sportFilter, setSportFilter] = useState<'ALL' | 'Cầu Lông' | 'Bóng Đá' | 'Pickleball' | 'Tennis'>('ALL');
  const [skillFilter, setSkillFilter] = useState<'ALL' | 'Bất kỳ' | 'Mới chơi' | 'Khá' | 'Chuyên nghiệp'>('ALL');

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
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
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
    switch (sport) {
      case 'Cầu Lông': return '🏸';
      case 'Bóng Đá': return '⚽';
      case 'Pickleball': return '🏓';
      case 'Tennis': return '🎾';
      default: return '🏆';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* Header */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* Main Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-8">
        
        {/* Banner Giới thiệu */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
          <div className="text-left space-y-1.5">
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Kết nối cộng đồng
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight">
              Cộng Đồng Ghép Đội & Tìm Bạn Chơi
            </h2>
            <p className="text-xs text-slate-400">
              Thiếu chân sút sân bóng đá, thiếu đối thủ tennis, hay cần lập cặp đôi nam nữ cầu lông? Tìm kiếm và ghép đội ngay.
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
            className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-black rounded-xl shadow-lg shadow-emerald-600/10 cursor-pointer flex items-center gap-1.5 transition active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4.5 h-4.5" /> Đăng Ca Tìm Teammate
          </Button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedMatch(null);
              setShowDetailsModal(false);
            }}
            className={`px-6 py-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'all'
                ? 'border-emerald-500 text-emerald-400'
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
              className={`px-6 py-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                activeTab === 'my-posts'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Bài đăng của tôi
            </button>
          )}
        </div>

        {/* Thanh lọc & tìm kiếm */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên sân, môn, tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-slate-750 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 outline-none transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Môn:</span>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 px-3 py-2 rounded-xl outline-none"
              >
                <option value="ALL">Tất cả môn</option>
                <option value="Cầu Lông">Cầu Lông</option>
                <option value="Bóng Đá">Bóng Đá</option>
                <option value="Pickleball">Pickleball</option>
                <option value="Tennis">Tennis</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trình độ:</span>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 px-3 py-2 rounded-xl outline-none"
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
            <div className="text-center py-12 text-slate-400 text-xs">
              Đang tải dữ liệu ghép đôi...
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-850 rounded-3xl p-12 text-center space-y-3">
              <span className="text-4xl block">🔍</span>
              <h4 className="text-base font-bold text-white m-0">Không tìm thấy ca ghép đội nào</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Thử đổi từ khóa tìm kiếm hoặc lọc các môn thể thao khác để kết nối với những người chơi khác.</p>
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
                  className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 transition rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 cursor-pointer"
                >
                  <div className="space-y-3.5 flex-grow">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-2xl select-none">{getSportIcon(m.sport)}</span>
                      <span className="text-xs bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-emerald-400 font-bold uppercase">{m.sport}</span>
                      <span className="text-[10px] text-slate-500">Trình độ: <strong className="text-slate-300 font-medium">{m.skillLevel}</strong></span>
                      
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

                    <h4 className="text-base sm:text-lg font-black text-white m-0 hover:text-emerald-400 transition leading-snug">
                      {m.title}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{m.playDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{m.startTime} - {m.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{m.courtName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-xs select-none">{m.hostAvatar}</span>
                      <div className="text-left leading-none">
                        <span className="text-[9px] text-slate-500 block">Host</span>
                        <strong className="text-xs text-slate-200 block">{m.hostName}</strong>
                      </div>
                    </div>

                    <button className="flex items-center gap-1 text-[10px] font-extrabold text-slate-300 hover:text-white bg-slate-950/65 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl transition">
                      Xem & ứng tuyển <ChevronRight className="w-3.5 h-3.5" />
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
