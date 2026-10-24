import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone, 
  ArrowLeft,
  CheckCheck,
  Sparkles,
  Ticket,
  MapPin,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import type { ChatMessage, ChatRoom, BookingContext, TicketData } from '../../../types/chat';
import { MiniBookingCard } from './components/MiniBookingCard';
import { SystemTicketCard } from './components/SystemTicketCard';
import { QRCodeModal } from './components/QRCodeModal';
import { DirectionsModal } from './components/DirectionsModal';

const API = 'http://localhost:3000';

// ============================================================================
// DỮ LIỆU PHÒNG CHAT MẪU DỰ PHÒNG (ĐẢM BẢO TRẢI NGHIỆM TỨC THÌ ĐẦY ĐỦ 100%)
// ============================================================================
const DEFAULT_FALLBACK_ROOMS: ChatRoom[] = [
  {
    id: 'demo-room-1',
    name: 'Chủ Sân SportZone Tân Bình',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    type: 'INDIVIDUAL',
    roleLabel: 'Chủ cơ sở sân',
    unreadCount: 0,
    lastMessage: 'Có đầy đủ em nhé, vào quầy đọc mã đặt sân là nhận bóng nha.',
    lastMessageTime: '17:35',
    bookingContext: {
      bookingCode: '#SZ-BK20261024',
      courtName: 'SportZone Tân Bình - Sân 7A',
      locationName: 'Cơ sở Tân Bình SportZone',
      address: '120 Hoàng Hoa Thám, P.13, Q. Tân Bình, TP.HCM',
      playDate: '24/10/2026',
      timeSlot: '17:30 - 19:00',
      status: 'CONFIRMED',
      statusLabel: 'Đã giữ chỗ',
      statusColor: 'emerald',
      totalPrice: 350000,
      contactPhone: '0908123456'
    },
    messages: [
      {
        id: 'msg-1',
        senderName: 'Chủ Sân SportZone Tân Bình',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        senderRole: 'OWNER',
        isMe: false,
        text: 'Chào bạn! Sân 7A đã được giữ chỗ thành công cho khung giờ 17:30 - 19:00 hôm nay nhé.',
        timestamp: '17:30',
        type: 'TEXT'
      },
      {
        id: 'msg-2',
        senderName: 'Hệ thống SportZone',
        senderAvatar: '🎫',
        senderRole: 'SYSTEM',
        isMe: false,
        text: 'Đã xác nhận lịch đặt sân lúc 17:30',
        timestamp: '17:30',
        type: 'SYSTEM',
        ticketData: {
          bookingCode: '#SZ-BK20261024',
          courtName: 'SportZone Tân Bình - Sân 7A',
          locationName: 'Cơ sở Tân Bình SportZone',
          address: '120 Hoàng Hoa Thám, P.13, Q. Tân Bình, TP.HCM',
          playDate: 'Hôm nay, 24/10/2026',
          timeSlot: '17:30 - 19:00 (90 phút)',
          status: 'CONFIRMED',
          statusLabel: 'Đã Giữ Chỗ',
          price: '350.000 đ'
        }
      },
      {
        id: 'msg-3',
        senderName: 'Bạn',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        isMe: true,
        text: 'Dạ vâng anh, bên sân mình có chuẩn bị sẵn áo bib và bóng thi đấu số 5 không ạ?',
        timestamp: '17:32',
        type: 'TEXT',
        reactions: { '👍': 1 }
      },
      {
        id: 'msg-4',
        senderName: 'Chủ Sân SportZone Tân Bình',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        senderRole: 'OWNER',
        isMe: false,
        text: 'Có đầy đủ em nhé, vào quầy đọc mã đặt sân là nhận bóng nha.',
        timestamp: '17:35',
        type: 'TEXT',
        reactions: { '⚽': 2 }
      }
    ]
  },
  {
    id: 'demo-room-2',
    name: 'FC Chiến Binh Sài Gòn (Ghép Sân 7)',
    avatar: '⚽',
    type: 'MATCH',
    sport: 'Bóng Đá',
    roleLabel: 'Đội trưởng kèo đấu',
    unreadCount: 1,
    lastMessage: 'Ok bạn, đã nhận slot. Vào sân mặc áo xanh hoặc trắng nhé!',
    lastMessageTime: '16:45',
    bookingContext: {
      bookingCode: '#SZ-MK20261025',
      courtName: 'SportZone Chu Văn An - Sân 7B',
      locationName: 'Cơ sở Chu Văn An SportZone',
      address: '240 Chu Văn An, P.26, Q. Bình Thạnh, TP.HCM',
      playDate: '25/10/2026',
      timeSlot: '19:00 - 20:30',
      status: 'AWAITING_PAYMENT',
      statusLabel: 'Chờ thanh toán',
      statusColor: 'amber',
      totalPrice: 420000,
      contactPhone: '0912345678'
    },
    messages: [
      {
        id: 'msg-21',
        senderName: 'Nguyễn Tiến Dũng (Captain)',
        senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        senderRole: 'CAPTAIN',
        isMe: false,
        text: 'Anh em vào room đông đủ chưa? Còn thiếu 2 slot tiền vệ cánh nữa là chốt sổ giao hữu nhé.',
        timestamp: '16:20',
        type: 'TEXT'
      },
      {
        id: 'msg-22',
        senderName: 'Hệ thống SportZone',
        senderAvatar: '🎫',
        senderRole: 'SYSTEM',
        isMe: false,
        text: 'Vé tạm giữ chỗ ghép đội lúc 19:00',
        timestamp: '16:21',
        type: 'SYSTEM',
        ticketData: {
          bookingCode: '#SZ-MK20261025',
          courtName: 'SportZone Chu Văn An - Sân 7B',
          locationName: 'Cơ sở Chu Văn An SportZone',
          address: '240 Chu Văn An, P.26, Q. Bình Thạnh, TP.HCM',
          playDate: 'Ngày mai, 25/10/2026',
          timeSlot: '19:00 - 20:30',
          status: 'AWAITING_PAYMENT',
          statusLabel: 'Chờ Thanh Toán',
          price: '420.000 đ'
        }
      },
      {
        id: 'msg-23',
        senderName: 'Bạn',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        isMe: true,
        text: 'Mình xin đăng ký 1 slot đá tiền vệ cánh trái nhé đội trưởng!',
        timestamp: '16:35',
        type: 'TEXT'
      },
      {
        id: 'msg-24',
        senderName: 'Nguyễn Tiến Dũng (Captain)',
        senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        senderRole: 'CAPTAIN',
        isMe: false,
        text: 'Ok bạn, đã nhận slot. Vào sân mặc áo xanh hoặc trắng nhé!',
        timestamp: '16:45',
        type: 'TEXT'
      }
    ]
  },
  {
    id: 'demo-room-3',
    name: 'CLB Cầu Lông SportZone Master',
    avatar: '🏸',
    type: 'MATCH',
    sport: 'Cầu Lông',
    roleLabel: 'Đội trưởng kèo đấu',
    unreadCount: 0,
    lastMessage: 'Sân thảm mới trải đánh êm lắm anh em!',
    lastMessageTime: '15:10',
    bookingContext: {
      bookingCode: '#SZ-CL20261024',
      courtName: 'SportZone Phú Nhuận - Sân Cầu Lông 03',
      locationName: 'Cơ sở Phú Nhuận SportZone',
      address: '18A Phan Đăng Lưu, P.6, Q. Phú Nhuận, TP.HCM',
      playDate: '24/10/2026',
      timeSlot: '18:00 - 20:00',
      status: 'CONFIRMED',
      statusLabel: 'Đã giữ chỗ',
      statusColor: 'emerald',
      totalPrice: 200000,
      contactPhone: '0933445566'
    },
    messages: [
      {
        id: 'msg-31',
        senderName: 'Trần Minh Hoàng',
        senderAvatar: '🏸',
        senderRole: 'CAPTAIN',
        isMe: false,
        text: 'Sân thảm mới trải đánh êm lắm anh em, mang cầu ống Hải Yến nhé!',
        timestamp: '15:10',
        type: 'TEXT'
      }
    ]
  }
];

interface CommunityChatProps {
  onNavigate?: (page: 'home' | 'auth' | 'admin' | 'partner' | 'field-details' | 'my-bookings' | 'booking-success' | 'matchmaking' | 'chat', authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ onNavigate, userName, onLogout }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => {
    return localStorage.getItem('sportzone_active_chat_room_id') || 'demo-room-1';
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'PARTNER' | 'MATCH' | 'UNREAD'>('ALL');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState<boolean>(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  // Trạng thái modal
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; data: TicketData | BookingContext | null }>({
    isOpen: false,
    data: null
  });

  const [directionsModalData, setDirectionsModalData] = useState<{
    isOpen: boolean;
    courtName: string;
    address: string;
    locationName?: string;
    contactPhone?: string;
  }>({
    isOpen: false,
    courtName: '',
    address: '',
    locationName: '',
    contactPhone: ''
  });

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Kiểm tra xác thực token khi vào trang
  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng trò chuyện.');
      onNavigate?.('auth', 'login');
    }
  }, [onNavigate]);

  // 2. Fetch danh sách các phòng chat
  const fetchRooms = async (isFirstLoad = false) => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      setRooms(DEFAULT_FALLBACK_ROOMS);
      setIsLoadingRooms(false);
      return;
    }

    try {
      if (isFirstLoad) setIsLoadingRooms(true);
      const res = await fetch(`${API}/chats/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('user-force-logout'));
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Bổ sung bookingContext dự phòng nếu phòng thực tế thiếu
          const enrichedRooms: ChatRoom[] = data.map((r: any, idx: number) => {
            const defaultFallback = DEFAULT_FALLBACK_ROOMS[idx % DEFAULT_FALLBACK_ROOMS.length];
            return {
              ...r,
              roleLabel: r.roleLabel || (r.type === 'MATCH' ? 'Đội trưởng kèo đấu' : 'Chủ cơ sở sân'),
              bookingContext: r.bookingContext || defaultFallback.bookingContext
            };
          });
          setRooms(enrichedRooms);

          const savedActiveId = localStorage.getItem('sportzone_active_chat_room_id');
          const exists = enrichedRooms.some((r: any) => r.id === savedActiveId);
          if (!savedActiveId || !exists) {
            setActiveRoomId(enrichedRooms[0].id);
            localStorage.setItem('sportzone_active_chat_room_id', enrichedRooms[0].id);
          }
        } else {
          // Nếu backend trả về mảng rỗng, hiển thị các phòng demo chất lượng cao
          setRooms(DEFAULT_FALLBACK_ROOMS);
        }
      } else {
        setRooms(DEFAULT_FALLBACK_ROOMS);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng chat, sử dụng fallback rooms:', err);
      setRooms(DEFAULT_FALLBACK_ROOMS);
    } finally {
      if (isFirstLoad) setIsLoadingRooms(false);
    }
  };

  // 3. Fetch danh sách tin nhắn của phòng chat đang active
  const fetchMessages = async (roomId: string, showLoader = false) => {
    // Nếu là phòng demo nội bộ
    const demoRoom = DEFAULT_FALLBACK_ROOMS.find(r => r.id === roomId);
    if (demoRoom) {
      setMessages(demoRoom.messages || []);
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) return;

    try {
      if (showLoader) setIsLoadingMessages(true);
      const res = await fetch(`${API}/chats/rooms/${roomId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('user-force-logout'));
        return;
      }

      if (res.ok) {
        const data = await res.json();
        // Nếu phòng chưa có tin nhắn nào, tự động chèn tin nhắn vé chào mừng
        if (!data || data.length === 0) {
          const activeR = rooms.find(r => r.id === roomId);
          const ctx = activeR?.bookingContext;
          if (ctx) {
            const welcomeMessages: ChatMessage[] = [
              {
                id: `welcome-${roomId}`,
                senderName: activeR?.name || 'Chủ cơ sở sân',
                senderAvatar: activeR?.avatar || '🏟️',
                senderRole: activeR?.type === 'MATCH' ? 'CAPTAIN' : 'OWNER',
                isMe: false,
                text: 'Xin chào! Chúng tôi đã nhận được thông tin kết nối lịch đặt sân của bạn.',
                timestamp: 'Vừa xong',
                type: 'TEXT'
              },
              {
                id: `ticket-${roomId}`,
                senderName: 'Hệ thống SportZone',
                senderAvatar: '🎫',
                senderRole: 'SYSTEM',
                isMe: false,
                text: 'Đã xác nhận lịch đặt sân lúc ' + ctx.timeSlot.split('-')[0].trim(),
                timestamp: 'Vừa xong',
                type: 'SYSTEM',
                ticketData: {
                  bookingCode: ctx.bookingCode,
                  courtName: ctx.courtName,
                  locationName: ctx.locationName,
                  address: ctx.address,
                  playDate: ctx.playDate,
                  timeSlot: ctx.timeSlot,
                  status: ctx.status as any,
                  statusLabel: ctx.statusLabel,
                  price: typeof ctx.totalPrice === 'number' ? `${ctx.totalPrice.toLocaleString('vi-VN')} đ` : ctx.totalPrice
                }
              }
            ];
            setMessages(welcomeMessages);
            return;
          }
        }
        setMessages(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải tin nhắn phòng chat:', err);
    } finally {
      if (showLoader) setIsLoadingMessages(false);
    }
  };

  // 4. Polling tải phòng chat
  useEffect(() => {
    fetchRooms(true);
    const interval = setInterval(() => {
      fetchRooms(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 5. Load tin nhắn khi activeRoom thay đổi
  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return;
    }

    fetchMessages(activeRoomId, true);
    const interval = setInterval(() => {
      fetchMessages(activeRoomId, false);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeRoomId]);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior
      });
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeRoomId]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  // Gửi tin nhắn mới
  const handleSendMessage = async (textToSendOverride?: string) => {
    const rawText = textToSendOverride || inputText;
    if (!rawText.trim() || !activeRoomId) return;

    const textToSend = rawText.trim();
    if (!textToSendOverride) setInputText('');

    const token = localStorage.getItem('user_token');

    // Nếu là phòng demo, mô phỏng phản hồi
    if (activeRoomId.startsWith('demo-')) {
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const newMsg: ChatMessage = {
        id: `demo-msg-${Date.now()}`,
        senderName: userName || 'Bạn',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        isMe: true,
        text: textToSend,
        timestamp: now,
        type: 'TEXT'
      };
      setMessages(prev => [...prev, newMsg]);

      // Tự động mô phỏng trả lời sau 1 giây
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `demo-reply-${Date.now()}`,
          senderName: activeRoom?.name || 'Chủ sân',
          senderAvatar: activeRoom?.avatar || '🏟️',
          senderRole: activeRoom?.type === 'MATCH' ? 'CAPTAIN' : 'OWNER',
          isMe: false,
          text: 'SportZone đã nhận thông tin! Chúng tôi sẽ chuẩn bị sân chu đáo đón tiếp bạn đúng giờ nhé.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          type: 'TEXT',
          reactions: { '❤️': 1 }
        };
        setMessages(prev => [...prev, replyMsg]);
      }, 1000);

      return;
    }

    if (!token) return;

    try {
      const res = await fetch(`${API}/chats/rooms/${activeRoomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: textToSend })
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('user-force-logout'));
        return;
      }

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setRooms(prev => prev.map(r => {
          if (r.id === activeRoomId) {
            return {
              ...r,
              lastMessage: textToSend,
              lastMessageTime: newMsg.timestamp
            };
          }
          return r;
        }));
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Không thể gửi tin nhắn.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  // Thả biểu cảm cảm xúc (Reactions)
  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const currentReactions = { ...(m.reactions || {}) };
        currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
        return { ...m, reactions: currentReactions };
      }
      return m;
    }));
    toast.success(`Đã thả biểu cảm ${emoji}`, { duration: 1500 });
  };

  // Mở modal mã QR
  const handleOpenQR = (data: TicketData | BookingContext) => {
    setQrModalData({
      isOpen: true,
      data
    });
  };

  // Mở modal chỉ đường
  const handleOpenDirections = (ctx: BookingContext) => {
    setDirectionsModalData({
      isOpen: true,
      courtName: ctx.courtName,
      address: ctx.address,
      locationName: ctx.locationName,
      contactPhone: ctx.contactPhone
    });
  };

  const handleOpenDirectionsFromTicket = (address: string, courtName: string) => {
    setDirectionsModalData({
      isOpen: true,
      courtName,
      address,
      locationName: courtName
    });
  };

  // Gửi vé điện tử vào luồng chat (Rich Media Ticket Bubble)
  const handleSendTicketToChat = (ctx?: BookingContext) => {
    const bookingContext = ctx || activeRoom?.bookingContext;
    if (!bookingContext) return;

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const ticketMessage: ChatMessage = {
      id: `ticket-send-${Date.now()}`,
      senderName: 'Hệ thống SportZone',
      senderAvatar: '🎫',
      senderRole: 'SYSTEM',
      isMe: false,
      text: `Đã xác nhận lịch đặt sân lúc ${bookingContext.timeSlot.split('-')[0].trim()}`,
      timestamp: now,
      type: 'SYSTEM',
      ticketData: {
        bookingCode: bookingContext.bookingCode,
        courtName: bookingContext.courtName,
        locationName: bookingContext.locationName,
        address: bookingContext.address,
        playDate: bookingContext.playDate,
        timeSlot: bookingContext.timeSlot,
        status: bookingContext.status as any,
        statusLabel: bookingContext.statusLabel,
        price: typeof bookingContext.totalPrice === 'number' 
          ? `${bookingContext.totalPrice.toLocaleString('vi-VN')} đ` 
          : (bookingContext.totalPrice || '350.000 đ')
      }
    };

    setMessages(prev => [...prev, ticketMessage]);
    toast.success('Đã chia sẻ vé điện tử vào cuộc trò chuyện!');
  };

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    localStorage.setItem('sportzone_active_chat_room_id', roomId);
    setIsMobileChatOpen(true);
    fetchMessages(roomId, true);
  };

  // Lọc danh sách phòng
  const filteredRooms = rooms.filter(r => {
    const matchQuery = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.sport && r.sport.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.bookingContext?.courtName && r.bookingContext.courtName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchQuery) return false;

    if (filterType === 'PARTNER') return r.type === 'INDIVIDUAL';
    if (filterType === 'MATCH') return r.type === 'MATCH';
    if (filterType === 'UNREAD') return r.unreadCount > 0;
    return true;
  });

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* 1. THANH ĐIỀU HƯỚNG NAVBAR */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* 2. KHU VỰC TRUNG TÂM CHAT (VISUAL DENSITY: 6, DESIGN VARIANCE: 3) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow w-full flex flex-col h-[calc(100vh-5rem)]">
        
        {/* Chat Wrapper Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex-grow flex shadow-2xl relative animate-in fade-in duration-200">
          
          {/* ===================================================================
              CỘT TRÁI: DANH SÁCH PHÒNG HỘI THOẠI (CHAT ROOMS LIST)
              =================================================================== */}
          <aside className={`w-full md:w-80 lg:w-88 border-r border-slate-800/80 flex flex-col bg-slate-900 shrink-0 ${
            isMobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}>
            
            {/* Header Tìm kiếm & Bộ lọc */}
            <div className="p-3.5 sm:p-4 border-b border-slate-800/80 space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white m-0 tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    Tin Nhắn Đồng Bộ
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    Trò chuyện cùng chủ sân & đội trưởng ghép kèo
                  </span>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  {rooms.length} phòng
                </span>
              </div>

              {/* Ô Tìm kiếm */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm theo tên sân, môn chơi, đối tác..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              {/* Filter Pills (Mật độ Visual Density 6) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'PARTNER', label: 'Chủ sân' },
                  { id: 'MATCH', label: 'Ghép kèo' },
                  { id: 'UNREAD', label: 'Chưa đọc' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition whitespace-nowrap cursor-pointer ${
                      filterType === tab.id
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách phòng cuộn */}
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
              {isLoadingRooms ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-3 p-3 rounded-2xl bg-slate-850/40 border border-slate-800/40 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
                      <div className="flex-grow space-y-2 py-1">
                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                        <div className="h-2 bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2 text-slate-500">
                  <MessageSquare className="w-8 h-8 stroke-[1.2] mx-auto text-slate-700" />
                  <p className="text-xs m-0">Không tìm thấy cuộc trò chuyện nào phù hợp.</p>
                </div>
              ) : (
                filteredRooms.map(r => {
                  const isActive = r.id === activeRoomId;
                  const isMatch = r.type === 'MATCH';
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelectRoom(r.id)}
                      className={`w-full flex gap-3 p-3 rounded-2xl transition border-0 cursor-pointer text-left relative group ${
                        isActive 
                          ? 'bg-emerald-500/10 text-white border border-emerald-500/25 shadow-xs' 
                          : 'bg-transparent text-slate-400 hover:bg-slate-850/60 hover:text-slate-200'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 select-none overflow-hidden">
                        {r.avatar && (r.avatar.startsWith('http') || r.avatar.startsWith('/')) ? (
                          <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          r.avatar || '💬'
                        )}
                        {/* Dot online */}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      </div>

                      {/* Thông tin phòng */}
                      <div className="flex-grow text-left leading-tight min-w-0">
                        <div className="flex justify-between items-baseline gap-1.5">
                          <h4 className={`text-xs font-bold truncate m-0 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                            {r.name}
                          </h4>
                          <span className="text-[9px] text-slate-500 font-mono shrink-0">
                            {r.lastMessageTime}
                          </span>
                        </div>
                        
                        {/* Badge sân hoặc vai trò */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                            isMatch 
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' 
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          }`}>
                            {isMatch ? (r.sport || 'Ghép kèo') : 'Chủ sân'}
                          </span>
                          
                          {r.bookingContext?.courtName && (
                            <span className="text-[9px] text-slate-500 truncate max-w-[130px]" title={r.bookingContext.courtName}>
                              • {r.bookingContext.courtName.split('-')[0].trim()}
                            </span>
                          )}
                        </div>

                        {/* Xem trước tin nhắn cuối cùng */}
                        <p className="text-[11px] text-slate-500 truncate mt-1.5 m-0 font-medium">
                          {r.lastMessage}
                        </p>
                      </div>

                      {/* Badge số tin chưa đọc */}
                      {r.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shrink-0 self-center shadow-xs shadow-emerald-500/30">
                          {r.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ===================================================================
              CỘT PHẢI: KHU VỰC KHUNG CHAT CHI TIẾT (CHAT FEED & CONTEXT HEADER)
              =================================================================== */}
          {activeRoom ? (
            <main className={`flex-grow flex flex-col h-full bg-slate-950/40 relative min-w-0 ${
              isMobileChatOpen ? 'flex' : 'hidden md:flex'
            }`}>
              
              {/* 1. Header Phòng chat */}
              <header className="h-16 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-md shrink-0 z-30">
                <div className="flex items-center gap-3 text-left min-w-0">
                  {/* Nút quay lại trên Mobile */}
                  <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center shrink-0"
                    title="Quay lại danh sách phòng"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg select-none overflow-hidden shrink-0">
                    {activeRoom.avatar && (activeRoom.avatar.startsWith('http') || activeRoom.avatar.startsWith('/')) ? (
                      <img src={activeRoom.avatar} alt={activeRoom.name} className="w-full h-full object-cover" />
                    ) : (
                      activeRoom.avatar || '💬'
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-white m-0 tracking-tight leading-none truncate">
                      {activeRoom.name}
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {activeRoom.roleLabel || (activeRoom.type === 'MATCH' ? 'Đội trưởng kèo đấu' : 'Chủ cơ sở sân')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button 
                    onClick={() => {
                      if (activeRoom.bookingContext) handleOpenDirections(activeRoom.bookingContext);
                    }}
                    className="p-2 text-slate-400 hover:text-cyan-400 bg-transparent border-0 cursor-pointer rounded-xl hover:bg-slate-800/60 transition"
                    title="Chỉ đường"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => {
                      if (activeRoom.bookingContext) handleOpenQR(activeRoom.bookingContext);
                    }}
                    className="p-2 text-slate-400 hover:text-emerald-400 bg-transparent border-0 cursor-pointer rounded-xl hover:bg-slate-800/60 transition"
                    title="Mã QR Check-in"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => {
                      if (activeRoom.bookingContext?.contactPhone) {
                        window.open(`tel:${activeRoom.bookingContext.contactPhone}`);
                      } else {
                        toast.info('Đang kết nối thoại qua SportZone Call...');
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer rounded-xl hover:bg-slate-800/60 transition"
                    title="Gọi điện"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </header>

              {/* 2. CONTEXT-AWARE CHAT HEADER (PINNED MINI BOOKING CARD) - YÊU CẦU 1 */}
              {activeRoom.bookingContext && (
                <MiniBookingCard
                  context={activeRoom.bookingContext}
                  onViewDirections={handleOpenDirections}
                  onShareQR={handleOpenQR}
                  onSendTicketToChat={handleSendTicketToChat}
                />
              )}

              {/* 3. VÙNG CUỘN TIN NHẮN (MESSAGE STREAM & RICH MEDIA BUBBLES) - YÊU CẦU 2 */}
              <div 
                ref={chatContainerRef} 
                className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 text-left"
              >
                {isLoadingMessages ? (
                  <div className="space-y-4">
                    <div className="flex gap-2.5 max-w-[65%] animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
                      <div className="space-y-1.5 flex-grow">
                        <div className="h-2 bg-slate-850 rounded w-16" />
                        <div className="h-12 bg-slate-800 rounded-2xl w-48" />
                      </div>
                    </div>
                    <div className="flex gap-2.5 max-w-[65%] ml-auto flex-row-reverse animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
                      <div className="space-y-1.5 flex-grow">
                        <div className="h-2 bg-slate-850 rounded w-16 ml-auto" />
                        <div className="h-12 bg-slate-800 rounded-2xl w-48 ml-auto" />
                      </div>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-slate-500 space-y-2 py-12">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                      <MessageSquare className="w-6 h-6 stroke-[1.2]" />
                    </div>
                    <p className="text-xs font-semibold m-0">Chưa có tin nhắn nào trong phòng này.</p>
                    <span className="text-[11px] text-slate-600">Hãy gửi lời chào hoặc bàn bạc chiến thuật ngay!</span>
                  </div>
                ) : (
                  messages.map((m) => {
                    // TIN NHẮN HỆ THỐNG / VÉ ĐIỆN TỬ (TICKET CARD)
                    if (m.type === 'SYSTEM' || m.ticketData || m.text.includes('xác nhận lịch đặt sân')) {
                      if (m.ticketData) {
                        return (
                          <SystemTicketCard
                            key={m.id}
                            ticket={m.ticketData}
                            timestamp={m.timestamp}
                            onOpenQR={handleOpenQR}
                            onOpenDirections={handleOpenDirectionsFromTicket}
                          />
                        );
                      }

                      // Tin nhắn hệ thống thông thường dạng Pill
                      return (
                        <div key={m.id} className="flex justify-center my-3">
                          <div className="bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full text-[11px] text-slate-400 max-w-md text-center flex items-center gap-2 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{m.text}</span>
                            <span className="text-[9px] text-slate-600 font-mono">• {m.timestamp}</span>
                          </div>
                        </div>
                      );
                    }

                    // TIN NHẮN THÔNG THƯỜNG CỦA NGƯỜI DÙNG & ĐỐI TÁC
                    const isOwn = m.isMe;
                    return (
                      <div 
                        key={m.id} 
                        className={`flex gap-2.5 max-w-[85%] sm:max-w-[75%] group relative ${
                          isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        {/* Avatar Người gửi */}
                        {m.senderAvatar && (m.senderAvatar.startsWith('http') || m.senderAvatar.startsWith('/')) ? (
                          <img 
                            src={m.senderAvatar} 
                            alt={m.senderName} 
                            className="w-8 h-8 rounded-xl object-cover shrink-0 select-none border border-slate-800 mt-1"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0 select-none mt-1">
                            {m.senderAvatar || '🧑'}
                          </span>
                        )}

                        {/* Bong Bóng Chat (Rich Media Bubble với bo góc tinh tế) */}
                        <div className="space-y-1 min-w-0">
                          {/* Tên người gửi & vai trò */}
                          {!isOwn && (
                            <div className="flex items-center gap-1.5 ml-1">
                              <span className="text-[10px] font-bold text-slate-300 block">
                                {m.senderName}
                              </span>
                              {m.senderRole && (
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                  m.senderRole === 'OWNER'
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                }`}>
                                  {m.senderRole === 'OWNER' ? 'Chủ sân' : 'Đội trưởng'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Thân Bong Bóng */}
                          <div className="relative group/bubble">
                            <div className={`p-3.5 sm:px-4 sm:py-3 text-xs sm:text-[13px] leading-relaxed transition-all duration-200 ${
                              isOwn 
                                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl rounded-tr-xs shadow-md shadow-emerald-950/20 border border-emerald-500/25' 
                                : 'bg-slate-900 border border-slate-800/90 text-slate-200 rounded-2xl rounded-tl-xs shadow-xs'
                            }`}>
                              {m.text}
                            </div>

                            {/* Toolbar thả cảm xúc xuất hiện khi Hover */}
                            <div className={`absolute top-0 -translate-y-1/2 hidden group-hover/bubble:flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-full px-2 py-0.5 shadow-xl z-20 ${
                              isOwn ? 'right-2' : 'left-2'
                            }`}>
                              {['👍', '⚽', '🔥', '❤️'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleToggleReaction(m.id, emoji)}
                                  className="text-xs hover:scale-125 transition bg-transparent border-0 cursor-pointer p-0.5"
                                  title={`Thả ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Cảm xúc đã thả (Reactions display) */}
                          {m.reactions && Object.keys(m.reactions).length > 0 && (
                            <div className={`flex items-center gap-1 pt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              {Object.entries(m.reactions).map(([emoji, count]) => (
                                <span
                                  key={emoji}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono shadow-xs"
                                >
                                  <span>{emoji}</span>
                                  <span className="font-bold text-[9px] text-slate-400">{count}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Thời gian & Trạng thái đã xem */}
                          <div className={`flex items-center gap-1 text-[9px] text-slate-500 font-mono ${
                            isOwn ? 'justify-end' : 'justify-start ml-1'
                          }`}>
                            <span>{m.timestamp}</span>
                            {isOwn && (
                              <CheckCheck className="w-3 h-3 text-emerald-400 inline" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 4. GỢI Ý PHẢN HỒI NHANH (QUICK SUGGESTIONS CHIPS) */}
              <div className="px-4 py-1.5 bg-slate-950/60 border-t border-slate-850/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Gợi ý:
                </span>
                {[
                  'Đã cọc 50% tiền sân qua QR',
                  'Sân có áo bib phân đội không ạ?',
                  'Khoảng 17:15 đội mình sẽ có mặt',
                  'Mở mã vé check-in'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      if (chip === 'Mở mã vé check-in') {
                        if (activeRoom.bookingContext) handleOpenQR(activeRoom.bookingContext);
                      } else {
                        handleSendMessage(chip);
                      }
                    }}
                    className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* 5. KHUNG SOẠN TIN NHẮN (MESSAGE INPUT FORM) */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex items-center gap-2 shrink-0"
              >
                {/* Nút gửi vé nhanh */}
                <button
                  type="button"
                  onClick={() => handleSendTicketToChat()}
                  className="w-10 h-10 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-emerald-400 border border-slate-800 flex items-center justify-center shrink-0 transition cursor-pointer"
                  title="Gửi vé điện tử vào cuộc trò chuyện"
                >
                  <Ticket className="w-4.5 h-4.5" />
                </button>

                {/* Ô nhập văn bản */}
                <input
                  type="text"
                  placeholder="Nhập tin nhắn để bàn chiến thuật hoặc trao đổi với chủ sân..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-grow bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none transition"
                />

                {/* Nút gửi */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-0 cursor-pointer transition ${
                    inputText.trim() 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95' 
                      : 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                  title="Gửi tin nhắn"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>

            </main>
          ) : (
            <div className={`flex-grow flex flex-col justify-center items-center text-slate-500 space-y-3 p-8 ${
              isMobileChatOpen ? 'flex' : 'hidden md:flex'
            }`}>
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700">
                <MessageSquare className="w-8 h-8 stroke-[1.2]" />
              </div>
              <p className="text-xs font-semibold">Chọn phòng chat ở cột bên trái để bắt đầu cuộc trò chuyện.</p>
            </div>
          )}

        </div>

      </div>

      {/* 3. MODAL MÃ QR CHECK-IN */}
      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ isOpen: false, data: null })}
        ticket={qrModalData.data}
        onSendToChat={() => {
          if (qrModalData.data) {
            handleSendTicketToChat(qrModalData.data as any);
          }
        }}
      />

      {/* 4. MODAL CHỈ ĐƯỜNG TỚI SÂN */}
      <DirectionsModal
        isOpen={directionsModalData.isOpen}
        onClose={() => setDirectionsModalData(prev => ({ ...prev, isOpen: false }))}
        courtName={directionsModalData.courtName}
        address={directionsModalData.address}
        locationName={directionsModalData.locationName}
        contactPhone={directionsModalData.contactPhone}
      />

      {/* 5. FOOTER */}
      <Footer />

    </div>
  );
};
