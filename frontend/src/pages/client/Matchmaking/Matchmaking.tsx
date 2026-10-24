import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import {
  Search,
  PlusCircle,
  Moon,
  Flame,
  Smile,
  Swords,
  Radio,
  Users,
  X,
} from 'lucide-react';

import type { MatchPost } from '../../../types';
import { ApplyJoinModal } from './ApplyJoinModal';
import { MatchDetailsModal } from './MatchDetailsModal';
import { MatchLobbyCard } from './MatchLobbyCard';
import { getMatchStart, SKILL_META, type SkillKey } from './matchmakingUtils';
import { toast } from 'sonner';

interface MatchmakingProps {
  onNavigate?: (page: any, authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
}

type QuickFilter = 'tonight' | 'need-one' | 'chill' | 'intense';

const SPORT_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'cau-long', label: 'Cầu Lông' },
  { value: 'bong-da', label: 'Bóng Đá' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'pickleball', label: 'Pickleball' },
];

const toLocalDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const getMissing = (m: MatchPost) => {
  const joined = (m.participants || []).filter(p => p.status === 'JOINED').length;
  return Math.max(0, m.maxPlayers - Math.max(m.currentPlayers, joined));
};

export const Matchmaking: React.FC<MatchmakingProps> = ({ onNavigate, userName, onLogout }) => {
  // Trạng thái danh sách
  const [matches, setMatches] = useState<MatchPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my-posts'>('all');

  // Bộ lọc
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('ALL');
  const [skillFilter, setSkillFilter] = useState<'ALL' | SkillKey>('ALL');
  const [quickFilter, setQuickFilter] = useState<QuickFilter | null>(null);

  // Đồng hồ chung cho các bộ đếm ngược trên card
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Debounce ô tìm kiếm để không gọi API mỗi phím gõ
  useEffect(() => {
    const id = window.setTimeout(() => setSearchQuery(searchInput.trim()), 350);
    return () => window.clearTimeout(id);
  }, [searchInput]);

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
  useEffect(() => {
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

  // ── Quick filter theo tâm trạng / nhu cầu (lọc phía client trên dữ liệu đã tải) ──
  const quickPredicates: Record<QuickFilter, (m: MatchPost) => boolean> = useMemo(() => {
    const todayKey = toLocalDateKey(new Date(now));
    return {
      tonight: m => {
        const s = getMatchStart(m);
        return !!s && m.playDate === todayKey && s.getHours() >= 17 && s.getTime() > now;
      },
      'need-one': m => m.status === 'OPEN' && getMissing(m) === 1,
      chill: m => m.skillLevel === 'ANY' || m.skillLevel === 'BEGINNER',
      intense: m => m.skillLevel === 'ADVANCED',
    };
    // Chỉ cần tính lại theo phút để đếm "tối nay" không giật mỗi giây
  }, [Math.floor(now / 60000)]);

  const QUICK_FILTERS: { key: QuickFilter; label: string; Icon: React.ElementType; tone: string }[] = [
    { key: 'tonight', label: 'Kèo tối nay', Icon: Moon, tone: 'data-[on=true]:bg-violet-400 data-[on=true]:text-zinc-950 data-[on=true]:border-violet-300' },
    { key: 'need-one', label: 'Thiếu 1 người', Icon: Flame, tone: 'data-[on=true]:bg-orange-400 data-[on=true]:text-zinc-950 data-[on=true]:border-orange-300' },
    { key: 'chill', label: 'Giao lưu vui vẻ', Icon: Smile, tone: 'data-[on=true]:bg-sky-400 data-[on=true]:text-zinc-950 data-[on=true]:border-sky-300' },
    { key: 'intense', label: 'Kèo căng cực', Icon: Swords, tone: 'data-[on=true]:bg-rose-400 data-[on=true]:text-zinc-950 data-[on=true]:border-rose-300' },
  ];

  // Sắp xếp: kèo sắp diễn ra lên trước, kèo đã qua xuống cuối
  const visibleMatches = useMemo(() => {
    const list = quickFilter ? matches.filter(quickPredicates[quickFilter]) : matches;
    return [...list].sort((a, b) => {
      const ta = getMatchStart(a)?.getTime() ?? Infinity;
      const tb = getMatchStart(b)?.getTime() ?? Infinity;
      const pa = ta < now ? 1 : 0;
      const pb = tb < now ? 1 : 0;
      return pa - pb || (pa ? tb - ta : ta - tb);
    });
  }, [matches, quickFilter, quickPredicates, Math.floor(now / 60000)]);

  const openMatches = matches.filter(m => m.status === 'OPEN' && (getMatchStart(m)?.getTime() ?? 0) > now);
  const openSlots = openMatches.reduce((acc, m) => acc + getMissing(m), 0);

  const openDetails = (m: MatchPost) => {
    setSelectedMatch(m);
    setShowDetailsModal(true);
  };

  const quickJoin = (m: MatchPost) => {
    if (!userName || !getClientToken()) {
      toast.warning('Vui lòng đăng nhập để tham gia kèo');
      onNavigate?.('auth', 'login');
      return;
    }
    setSelectedMatch(m);
    setShowApplyModal(true);
  };

  const goCreate = () => {
    if (!userName) {
      toast.warning('Vui lòng đăng nhập trước khi đăng bài tìm đội giao hữu');
      onNavigate?.('auth', 'login');
    } else {
      onNavigate?.('matchmaking/create');
    }
  };

  const hasActiveFilters = quickFilter || sportFilter !== 'ALL' || skillFilter !== 'ALL' || searchQuery;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 flex-grow w-full relative">

        {/* ── HERO: bố cục lệch, số liệu live bên phải ── */}
        <section className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-end mb-10">
          <div className="lg:col-span-7 text-left space-y-4">
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Lobby đang mở
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-50 m-0 leading-[0.95]">
              Tìm kèo.<br />
              <span className="text-zinc-500">Ghép đội.</span> <span className="text-emerald-400">Ra sân.</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-md m-0 leading-relaxed">
              Thiếu chân sút, thiếu bạn đánh đôi? Chọn một chỗ trống, share tiền sân và vào trận trong vài phút.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-3 gap-px bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-800">
            {[
              { v: openMatches.length, l: 'Kèo đang mở' },
              { v: openSlots, l: 'Chỗ trống' },
              { v: matches.filter(quickPredicates.tonight).length, l: 'Kèo tối nay' },
            ].map(s => (
              <div key={s.l} className="bg-zinc-900 px-4 py-4 text-left">
                <span className="block text-3xl font-black font-mono tabular-nums text-zinc-50 leading-none">{loading ? '–' : s.v}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-2">{s.l}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={goCreate}
              className="col-span-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 px-4 py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-0 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" /> Đăng kèo tìm teammate
            </button>
          </div>
        </section>

        {/* ── THANH ĐIỀU KHIỂN: tab + tìm kiếm + quick filter ── */}
        <section className="sticky top-16 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-zinc-950/85 backdrop-blur-xl mb-6 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0 self-start">
              {(['all', ...(userName ? ['my-posts'] : [])] as ('all' | 'my-posts')[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setActiveTab(t);
                    setSelectedMatch(null);
                    setShowDetailsModal(false);
                  }}
                  className={`px-4 py-2 text-xs font-black rounded-lg border-0 cursor-pointer transition ${
                    activeTab === t ? 'bg-zinc-100 text-zinc-950' : 'bg-transparent text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {t === 'all' ? 'Tất cả kèo' : 'Kèo của tôi'}
                </button>
              ))}
            </div>

            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="matchmaking-search"
                type="text"
                placeholder="Tìm theo sân, tiêu đề kèo..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-400/70 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 outline-none transition placeholder:text-zinc-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar md:ml-auto">
              {SPORT_OPTIONS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSportFilter(s.value)}
                  className={`shrink-0 px-3 py-2 text-[11px] font-bold rounded-lg border cursor-pointer transition ${
                    sportFilter === s.value
                      ? 'border-emerald-400/60 text-emerald-300 bg-emerald-400/10'
                      : 'border-zinc-800 text-zinc-400 bg-transparent hover:text-zinc-100 hover:border-zinc-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {QUICK_FILTERS.map(({ key, label, Icon, tone }) => {
              const on = quickFilter === key;
              const count = matches.filter(quickPredicates[key]).length;
              return (
                <button
                  key={key}
                  id={`quick-filter-${key}`}
                  type="button"
                  data-on={on}
                  onClick={() => setQuickFilter(on ? null : key)}
                  className={`group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 text-[12px] font-extrabold tracking-tight cursor-pointer transition-all duration-200 hover:border-zinc-600 hover:text-white active:scale-95 ${tone}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black font-mono flex items-center justify-center ${
                    on ? 'bg-zinc-950/20' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            <span className="hidden sm:block w-px h-5 bg-zinc-800 mx-1" />

            <div className="flex items-center gap-1">
              {(['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSkillFilter(k)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border-0 cursor-pointer transition ${
                    skillFilter === k ? 'bg-zinc-800 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {k === 'ALL' ? 'Mọi trình độ' : SKILL_META[k].label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => { setQuickFilter(null); setSportFilter('ALL'); setSkillFilter('ALL'); setSearchInput(''); }}
                className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-zinc-200 bg-transparent border-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Xoá lọc
              </button>
            )}
          </div>
        </section>

        {/* ── LOBBY GRID ── */}
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[340px] rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4 animate-pulse">
                <div className="h-3 w-32 bg-zinc-800 rounded" />
                <div className="h-5 w-3/4 bg-zinc-800 rounded" />
                <div className="h-3 w-1/2 bg-zinc-800 rounded" />
                <div className="h-px bg-zinc-800 mt-12" />
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map(j => <div key={j} className="w-9 h-9 rounded-full bg-zinc-800" />)}
                </div>
              </div>
            ))}
          </div>
        ) : visibleMatches.length === 0 ? (
          <div className="grid md:grid-cols-12 gap-6 items-center border border-dashed border-zinc-800 rounded-3xl p-8 sm:p-12">
            <div className="md:col-span-7 text-left space-y-3">
              <h2 className="text-2xl font-black text-zinc-50 m-0">
                {quickFilter ? 'Chưa có kèo khớp bộ lọc này' : 'Lobby đang trống'}
              </h2>
              <p className="text-sm text-zinc-400 m-0 max-w-md leading-relaxed">
                {quickFilter
                  ? 'Thử bỏ bộ lọc nhanh hoặc đổi bộ môn. Hoặc tự mở một kèo — người chơi gần bạn sẽ thấy ngay.'
                  : 'Hãy là người mở kèo đầu tiên. Đặt sân, đăng kèo, và chờ đồng đội vào.'}
              </p>
              <button
                type="button"
                onClick={goCreate}
                className="mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-black uppercase tracking-wide border-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Mở kèo mới
              </button>
            </div>
            <div className="md:col-span-5 flex md:justify-end">
              <div className="flex items-center">
                {[0, 1, 2, 3].map(i => (
                  <span key={i} className="ml-2 first:ml-0 w-12 h-12 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-600">
                    <Users className="w-4 h-4" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visibleMatches.map((m, i) => (
              <MatchLobbyCard
                key={m.id}
                match={m}
                now={now}
                index={i}
                userName={userName}
                onOpen={openDetails}
                onJoin={quickJoin}
              />
            ))}
          </div>
        )}
      </main>

      {/* MODAL ỨNG TUYỂN (APPLY TO JOIN) */}
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

      {/* MODAL CHI TIẾT CA GHÉP */}
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

      <Footer />
    </div>
  );
};
