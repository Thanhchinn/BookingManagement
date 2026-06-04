import React, { useState } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  Users, 
  UserPlus,
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  SlidersHorizontal,
  ChevronRight,
  PlusCircle,
  Check,
  X,
  ArrowLeft
} from 'lucide-react';

import type { MatchPost } from '../../../types';
import { CreateMatchModal } from './CreateMatchModal';
import { ApplyJoinModal } from './ApplyJoinModal';
import { toast } from 'sonner';

interface MatchmakingProps {
  onNavigate?: (page: 'home' | 'auth' | 'admin' | 'partner' | 'field-details' | 'my-bookings' | 'booking-success' | 'matchmaking' | 'chat', authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
}

export const Matchmaking: React.FC<MatchmakingProps> = ({ onNavigate, userName, onLogout }) => {
  // Stateful Mock Data để cho phép tương tác trực quan
  const [matches, setMatches] = useState<MatchPost[]>([
    {
      id: '1',
      hostName: 'Nguyễn Minh Hải',
      hostAvatar: '👨‍🦱',
      title: 'Tuyển 2 VĐV ghép đôi nam nữ giao lưu cuối tuần',
      sport: 'Cầu Lông',
      courtName: 'Sân Cầu Lông Trong Nhà ProZone - Sân 1',
      playDate: '2026-06-02',
      startTime: '18:00',
      endTime: '20:00',
      skillLevel: 'Khá',
      maxPlayers: 4,
      currentPlayers: 2,
      description: 'Cần tìm 2 bạn trình độ khá trở lên (đặc biệt ưu tiên đánh lưới) để ghép đôi giao lưu vãng lai vui vẻ. Tiền sân chia đều theo đầu người chơi.',
      status: 'OPEN',
      participants: [
        { name: 'Nguyễn Minh Hải', avatar: '👨‍🦱', status: 'JOINED' },
        { name: 'Trần Thị Mai', avatar: '👩‍🦰', status: 'JOINED' },
        { name: 'Phan Văn Đức', avatar: '👦', status: 'PENDING', note: 'Mình đánh được 2 năm rồi, vị trí nào cũng chiến được!' }
      ]
    },
    {
      id: '2',
      hostName: 'Lê Hoàng Long',
      hostAvatar: '🧔',
      title: 'Thi đấu giao hữu sân 5 - Cần tìm đội đá ké / ghép cầu thủ lẻ',
      sport: 'Bóng Đá',
      courtName: 'Sân Bóng Đá Cỏ Nhân Tạo Stadium A - Sân 5',
      playDate: '2026-06-03',
      startTime: '19:00',
      endTime: '20:30',
      skillLevel: 'Bất kỳ',
      maxPlayers: 10,
      currentPlayers: 8,
      description: 'Đội mình hiện tại thiếu 2 người đá cánh và hậu vệ. Giao lưu văn nghệ nhẹ nhàng, vui vẻ là chính, không đá thô bạo. Có nước free cho anh em.',
      status: 'OPEN',
      participants: [
        { name: 'Lê Hoàng Long', avatar: '🧔', status: 'JOINED' },
        { name: 'Hoàng Quốc Anh', avatar: '🧑', status: 'JOINED' },
        { name: 'Vũ Minh Tuấn', avatar: '👨', status: 'JOINED' }
      ]
    },
    {
      id: '3',
      hostName: 'Phạm Thanh Thảo',
      hostAvatar: '👩',
      title: 'Tìm bạn cùng chơi Pickleball đôi nam nữ mới tập chơi',
      sport: 'Pickleball',
      courtName: 'Sân Pickleball D-Sport Quận 7',
      playDate: '2026-06-01',
      startTime: '16:00',
      endTime: '18:00',
      skillLevel: 'Mới chơi',
      maxPlayers: 4,
      currentPlayers: 4,
      description: 'Nhóm mình vừa mới mua vợt được 2 tuần. Cần tìm các bạn mới tập chơi để dợt cùng nhau cho quen tay, không áp lực điểm số.',
      status: 'FULL',
      participants: [
        { name: 'Phạm Thanh Thảo', avatar: '👩', status: 'JOINED' },
        { name: 'Bùi Anh Khoa', avatar: '👦', status: 'JOINED' },
        { name: 'Võ Hoàng Yến', avatar: '👧', status: 'JOINED' },
        { name: 'Đặng Ngọc Minh', avatar: '🧑', status: 'JOINED' }
      ]
    }
  ]);

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<'ALL' | 'Cầu Lông' | 'Bóng Đá' | 'Pickleball' | 'Tennis'>('ALL');
  const [skillFilter, setSkillFilter] = useState<'ALL' | 'Bất kỳ' | 'Mới chơi' | 'Khá' | 'Chuyên nghiệp'>('ALL');

  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<MatchPost | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState<boolean>(false);
  
  // Tạo phòng ghép mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSport, setNewSport] = useState<'Cầu Lông' | 'Bóng Đá' | 'Pickleball' | 'Tennis' | 'Bóng Rổ'>('Cầu Lông');
  const [newCourt, setNewCourt] = useState('Sân Cầu Lông Trong Nhà ProZone - Sân 1');
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('18:00');
  const [newEnd, setNewEnd] = useState('20:00');
  const [newSkill, setNewSkill] = useState<'Bất kỳ' | 'Mới chơi' | 'Khá' | 'Chuyên nghiệp'>('Bất kỳ');
  const [newMax, setNewMax] = useState(4);
  const [newDesc, setNewDesc] = useState('');

  // Ứng tuyển tham gia
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyNote, setApplyNote] = useState('');

  // Sắp xếp lọc dữ liệu
  const filteredMatches = matches.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.courtName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = sportFilter === 'ALL' || m.sport === sportFilter;
    const matchesSkill = skillFilter === 'ALL' || m.skillLevel === skillFilter;
    return matchesSearch && matchesSport && matchesSkill;
  });

  // Tạo trận mới
  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) {
      toast.warning('Vui lòng đăng nhập trước khi tạo phòng ghép đôi');
      return;
    }
    const newMatch: MatchPost = {
      id: String(matches.length + 1),
      hostName: userName,
      hostAvatar: '👨‍🚀',
      title: newTitle,
      sport: newSport,
      courtName: newCourt,
      playDate: newDate || new Date().toISOString().split('T')[0],
      startTime: newStart,
      endTime: newEnd,
      skillLevel: newSkill,
      maxPlayers: Number(newMax),
      currentPlayers: 1,
      description: newDesc,
      status: 'OPEN',
      participants: [
        { name: userName, avatar: '👨‍🚀', status: 'JOINED' }
      ]
    };

    setMatches([newMatch, ...matches]);
    setShowCreateModal(false);
    resetForm();
    toast.success('Đăng bài tìm đội thành công', {
      description: 'Bài ghép cặp đang chờ các tuyển thủ đăng ký ứng tuyển.',
    });
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
  };

  // Nộp đơn xin gia nhập trận
  const handleApplyToJoin = () => {
    if (!userName) {
      toast.warning('Vui lòng đăng nhập trước khi ứng tuyển tham gia');
      onNavigate?.('auth', 'login');
      return;
    }
    if (!selectedMatch) return;

    // Check xem đã đăng ký chưa
    const alreadyParticipant = selectedMatch.participants.some(p => p.name === userName);
    if (alreadyParticipant) {
      toast.info('Bạn đã ứng tuyển hoặc tham gia vào trận này rồi');
      setShowApplyModal(false);
      return;
    }

    setMatches(prev => prev.map(m => {
      if (m.id === selectedMatch.id) {
        return {
          ...m,
          participants: [
            ...m.participants,
            { name: userName, avatar: '👨‍🚀', status: 'PENDING', note: applyNote }
          ]
        };
      }
      return m;
    }));

    // Cập nhật selectedMatch
    setSelectedMatch(prev => prev ? {
      ...prev,
      participants: [
        ...prev.participants,
        { name: userName, avatar: '👨‍🚀', status: 'PENDING', note: applyNote }
      ]
    } : null);

    setShowApplyModal(false);
    setApplyNote('');
    toast.success('Nộp đơn ứng tuyển thành công', {
      description: 'Vui lòng đợi Host kiểm duyệt đồng ý.',
    });
  };

  // Duyệt ứng viên (Host Approve/Reject)
  const handleApproveApplicant = (applicantName: string, approve: boolean) => {
    if (!selectedMatch) return;

    setMatches(prev => prev.map(m => {
      if (m.id === selectedMatch.id) {
        const updatedParticipants = m.participants.map(p => {
          if (p.name === applicantName) {
            return { ...p, status: approve ? 'JOINED' as const : 'REJECTED' as const };
          }
          return p;
        });

        const activeCount = updatedParticipants.filter(p => p.status === 'JOINED').length;
        const newStatus = activeCount >= m.maxPlayers ? 'FULL' as const : 'OPEN' as const;

        return {
          ...m,
          currentPlayers: activeCount,
          status: newStatus,
          participants: updatedParticipants
        };
      }
      return m;
    }));

    // Cập nhật selectedMatch view
    setSelectedMatch(prev => {
      if (!prev) return null;
      const updatedParticipants = prev.participants.map(p => {
        if (p.name === applicantName) {
          return { ...p, status: approve ? 'JOINED' as const : 'REJECTED' as const };
        }
        return p;
      });
      const activeCount = updatedParticipants.filter(p => p.status === 'JOINED').length;
      return {
        ...prev,
        currentPlayers: activeCount,
        status: activeCount >= prev.maxPlayers ? 'FULL' : 'OPEN',
        participants: updatedParticipants
      };
    });

    toast.info(approve ? `Đã đồng ý nhận ${applicantName}` : `Đã từ chối đơn của ${applicantName}`);
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
                setShowCreateModal(true);
              }
            }}
            variant="primary"
            className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-black rounded-xl shadow-lg shadow-emerald-600/10 cursor-pointer flex items-center gap-1.5 transition active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4.5 h-4.5" /> Đăng Ca Tìm Teammate
          </Button>
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
                <option value="ALL">Tất cả trình độ</option>
                <option value="Bất kỳ">Bất kỳ</option>
                <option value="Mới chơi">Mới chơi</option>
                <option value="Khá">Khá</option>
                <option value="Chuyên nghiệp">Chuyên nghiệp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hai cột danh sách & Chi tiết */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          
          {/* Cột trái: Danh sách Match Posts */}
          <div className={`lg:col-span-2 space-y-4 ${isMobileDetailOpen ? 'hidden lg:block' : 'block'}`}>
            {filteredMatches.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-850 rounded-3xl p-12 text-center space-y-3">
                <span className="text-4xl block">🔍</span>
                <h4 className="text-base font-bold text-white m-0">Không tìm thấy ca ghép đội nào</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Thử đổi từ khóa tìm kiếm hoặc lọc các môn thể thao khác để kết nối với những người chơi khác.</p>
              </div>
            ) : (
              filteredMatches.map(m => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMatch(m);
                    setIsMobileDetailOpen(true);
                  }}
                  className={`bg-slate-900 border transition rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 cursor-pointer hover:border-slate-700 ${
                    selectedMatch?.id === m.id ? 'border-emerald-500 bg-slate-900/90' : 'border-slate-800/80'
                  }`}
                >
                  <div className="space-y-3.5 flex-grow">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-2xl select-none">{getSportIcon(m.sport)}</span>
                      <span className="text-xs bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-emerald-400 font-bold uppercase">{m.sport}</span>
                      <span className="text-[10px] text-slate-500">Trình độ: <strong className="text-slate-300 font-medium">{m.skillLevel}</strong></span>
                      {m.status === 'FULL' ? (
                        <Badge status="info">Đủ người</Badge>
                      ) : (
                        <Badge status="success">Đang tuyển ({m.currentPlayers}/{m.maxPlayers})</Badge>
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
              ))
            )}
          </div>

          {/* Cột phải: Xem chi tiết / Quản lý ca ghép */}
          <div className={`space-y-6 ${isMobileDetailOpen ? 'block' : 'hidden lg:block'}`}>
            {selectedMatch ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 sticky top-24 backdrop-blur-md">
                
                {/* Header detail */}
                <div className="border-b border-slate-800 pb-4 space-y-2">
                  {/* Nút quay lại trên Mobile */}
                  <button
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="lg:hidden inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition cursor-pointer bg-transparent border-none p-0 pb-2.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
                  </button>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Chi Tiết Ghép Phòng</span>
                    {selectedMatch.status === 'FULL' ? (
                      <Badge status="info">Đầy Slot</Badge>
                    ) : (
                      <Badge status="success">Đang Tuyển</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white m-0">{selectedMatch.title}</h3>
                  <p className="text-xs text-slate-400 m-0 leading-relaxed">{selectedMatch.description}</p>
                </div>

                {/* Logistics */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Bộ môn:</span>
                    <strong className="text-emerald-400">{selectedMatch.sport}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Sân thi đấu:</span>
                    <strong className="text-white text-right truncate max-w-[150px]">{selectedMatch.courtName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Ngày chơi:</span>
                    <strong className="text-white">{selectedMatch.playDate}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Khung giờ:</span>
                    <strong className="text-white">{selectedMatch.startTime} - {selectedMatch.endTime}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Trình độ yêu cầu:</span>
                    <strong className="text-amber-400 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded">{selectedMatch.skillLevel}</strong>
                  </div>
                </div>

                {/* Danh sách thành viên */}
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-bold flex items-center gap-1"><Users className="w-4 h-4 text-emerald-400" /> Tuyển Thủ Đã Chốt ({selectedMatch.currentPlayers}/{selectedMatch.maxPlayers})</span>
                  </div>

                  <div className="space-y-2 bg-slate-950 border border-slate-850 rounded-2xl p-4">
                    {selectedMatch.participants.filter(p => p.status === 'JOINED').map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center select-none text-[10px]">{p.avatar}</span>
                          <span className="text-slate-300 font-bold">{p.name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">Thành viên</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DUYỆT ỨNG CỬ VIÊN (CHỈ DÀNH CHO HOST CỦA PHÒNG) */}
                {selectedMatch.hostName === userName ? (
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Danh Sách Tuyển Thủ Đang Chờ Duyệt</span>
                    
                    {selectedMatch.participants.filter(p => p.status === 'PENDING').length === 0 ? (
                      <p className="text-[10px] text-slate-600 m-0">✓ Chưa có hồ sơ xin ứng tuyển mới.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedMatch.participants.filter(p => p.status === 'PENDING').map((p, idx) => (
                          <div key={idx} className="bg-slate-950 border border-slate-855 rounded-2xl p-3.5 text-left space-y-2.5">
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{p.avatar}</span>
                                <strong className="text-white">{p.name}</strong>
                              </div>
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-bold">Đợi duyệt</span>
                            </div>

                            {p.note && (
                              <p className="text-[10px] bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-slate-400 m-0 italic">
                                "{p.note}"
                              </p>
                            )}

                            {/* Nút Host Duyệt */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <button
                                onClick={() => handleApproveApplicant(p.name, true)}
                                className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg border-0 cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Đồng ý
                              </button>
                              <button
                                onClick={() => handleApproveApplicant(p.name, false)}
                                className="py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/30 rounded-lg cursor-pointer flex items-center justify-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Từ chối
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ) : (
                  // DÀNH CHO CẦU THỦ KHÁC XIN ỨNG TUYỂN
                  <div className="border-t border-slate-800 pt-4">
                    {selectedMatch.participants.some(p => p.name === userName && p.status === 'PENDING') ? (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center space-y-1">
                        <span className="text-xs text-amber-400 font-bold block">Đã Nộp Đơn Ứng Tuyển ✓</span>
                        <p className="text-[10px] text-slate-500 m-0">Vui lòng đợi Host kiểm duyệt và phản hồi. Bạn sẽ nhận được thông báo đẩy thời gian thực.</p>
                      </div>
                    ) : selectedMatch.participants.some(p => p.name === userName && p.status === 'JOINED') ? (
                      <div className="space-y-3.5">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                          <span className="text-xs text-emerald-400 font-bold block">Bạn Đã Là Thành Viên Trận Đấu 🎉</span>
                          <p className="text-[10px] text-slate-500 m-0 mt-0.5">Truy cập phòng Chat Room để cùng bàn bạc chiến thuật chiến đấu.</p>
                        </div>
                        <Button 
                          onClick={() => onNavigate?.('chat')}
                          variant="primary" 
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          💬 Vào Phòng Chat Nhóm Ngay
                        </Button>
                      </div>
                    ) : selectedMatch.status === 'FULL' ? (
                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-center text-slate-500 text-xs">
                        ⚠️ Nhóm đã đủ người đăng ký tham gia giao lưu ca này.
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setShowApplyModal(true)}
                        variant="primary" 
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1"
                      >
                        <UserPlus className="w-4 h-4" /> Ứng Tuyển Gia Nhập Nhóm
                      </Button>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-850 border-dashed rounded-3xl p-8 text-center text-slate-500 sticky top-24">
                <span className="text-3xl block mb-2 select-none">👈</span>
                Nhấn chọn một bài đăng ghép đội bên trái để xem danh sách thành viên, đọc mô tả, ứng tuyển hoặc xét duyệt thành viên mới.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ======================================================================
          MODALS & FORMS TƯƠNG TÁC
          ====================================================================== */}
      
      {/* 1. MODAL ĐĂNG CA TÌM TEAMMATE */}
      <CreateMatchModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        onSubmit={handleCreateMatch}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newSport={newSport}
        setNewSport={setNewSport}
        newSkill={newSkill}
        setNewSkill={setNewSkill}
        newCourt={newCourt}
        setNewCourt={setNewCourt}
        newDate={newDate}
        setNewDate={setNewDate}
        newStart={newStart}
        setNewStart={setNewStart}
        newEnd={newEnd}
        setNewEnd={setNewEnd}
        newMax={newMax}
        setNewMax={setNewMax}
        newDesc={newDesc}
        setNewDesc={setNewDesc}
      />

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

      {/* Footer */}
      <Footer />

    </div>
  );
};
