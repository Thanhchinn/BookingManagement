import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone, 
  Video, 
  Info,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  isMe: boolean;
  text: string;
  timestamp: string;
  type: 'TEXT' | 'SYSTEM';
}

interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  type: 'MATCH' | 'INDIVIDUAL';
  sport?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

interface PartnerCustomerChatProps {
  partnerName: string;
}

const API = 'http://localhost:3000';

export const PartnerCustomerChat: React.FC<PartnerCustomerChatProps> = ({ partnerName }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => {
    return localStorage.getItem('sportzone_partner_active_customer_room_id');
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState<boolean>(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch danh sách các phòng chat
  const fetchRooms = async (isFirstLoad = false) => {
    const token = localStorage.getItem('user_token');
    if (!token) return;

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
        // Lọc để chỉ hiển thị các phòng chat cá nhân (INDIVIDUAL) cho đối tác trao đổi với khách
        const individualRooms = data.filter((r: any) => r.type === 'INDIVIDUAL');
        setRooms(individualRooms);
        
        if (individualRooms.length > 0) {
          const savedActiveId = localStorage.getItem('sportzone_partner_active_customer_room_id');
          const exists = individualRooms.some((r: any) => r.id === savedActiveId);
          if (!savedActiveId || !exists) {
            setActiveRoomId(individualRooms[0].id);
            localStorage.setItem('sportzone_partner_active_customer_room_id', individualRooms[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng chat khách hàng:', err);
    } finally {
      if (isFirstLoad) setIsLoadingRooms(false);
    }
  };

  // 2. Fetch danh sách tin nhắn của phòng chat đang active
  const fetchMessages = async (roomId: string, showLoader = false) => {
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
        setMessages(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải tin nhắn phòng chat:', err);
    } finally {
      if (showLoader) setIsLoadingMessages(false);
    }
  };

  // 3. Polling định kỳ tải dữ liệu
  useEffect(() => {
    fetchRooms(true);

    const interval = setInterval(() => {
      fetchRooms(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 4. Load tin nhắn mỗi khi đổi phòng chat hoặc định kỳ
  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return;
    }

    fetchMessages(activeRoomId, true);

    const interval = setInterval(() => {
      fetchMessages(activeRoomId, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeRoomId]);

  // Tự động cuộn xuống cuối tin nhắn
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

  // Gửi tin nhắn mới lên Backend
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoomId) return;

    const token = localStorage.getItem('user_token');
    if (!token) return;

    const textToSend = inputText.trim();
    setInputText('');

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

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    localStorage.setItem('sportzone_partner_active_customer_room_id', roomId);
    setIsMobileChatOpen(true);
    fetchMessages(roomId, true);
  };

  // Lọc phòng chat
  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-[calc(100vh-180px)] min-h-[450px] relative font-sans text-slate-100 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      <div className="flex-grow flex h-full relative overflow-hidden">
        
        {/* CỘT TRÁI: DANH SÁCH KHÁCH HÀNG */}
        <aside className={`w-full md:w-80 border-r border-slate-800/80 flex flex-col bg-slate-900 shrink-0 ${
          isMobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header tìm kiếm */}
          <div className="p-4 border-b border-slate-800/80 space-y-3 text-left">
            <div>
              <h3 className="text-base font-black text-white m-0 tracking-tight flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                Hội Thoại Khách Hàng
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Liên lạc trực tiếp với khách thuê sân của {partnerName}</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-750 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-350 outline-none transition"
              />
            </div>
          </div>

          {/* Danh sách phòng */}
          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {isLoadingRooms ? (
              <div className="space-y-2.5 p-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3 p-3 rounded-2xl bg-slate-850/20 border border-slate-800/30 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
                    <div className="flex-grow space-y-2">
                      <div className="h-3.5 bg-slate-850 rounded w-3/4" />
                      <div className="h-2 bg-slate-850 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRooms.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-8 m-0 font-medium">Chưa có khách hàng nào liên hệ.</p>
            ) : (
              filteredRooms.map(r => {
                const isActive = r.id === activeRoomId;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRoom(r.id)}
                    className={`w-full flex gap-3 p-3.5 rounded-2xl transition border-0 cursor-pointer text-left ${
                      isActive 
                        ? 'bg-amber-500/10 text-white' 
                        : 'bg-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 select-none overflow-hidden">
                      {r.avatar && (r.avatar.startsWith('http') || r.avatar.startsWith('/')) ? (
                        <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                      ) : (
                        r.avatar || '💬'
                      )}
                    </div>

                    <div className="flex-grow text-left leading-tight min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <h4 className={`text-xs font-bold truncate m-0 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {r.name}
                        </h4>
                        <span className="text-[9px] text-slate-550 font-mono shrink-0">{r.lastMessageTime}</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 truncate mt-1.5 m-0 font-medium">
                        {r.lastMessage}
                      </p>
                    </div>

                    {r.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shrink-0">
                        {r.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* CỘT PHẢI: KHU VỰC TRÒ CHUYỆN CHI TIẾT */}
        {activeRoom ? (
          <main className={`flex-grow flex flex-col h-full bg-slate-950/40 relative min-w-0 ${
            isMobileChatOpen ? 'flex' : 'hidden md:flex'
          }`}>
            
            {/* Header Phòng chat */}
            <header className="h-16 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-xs">
              <div className="flex items-center gap-3 text-left">
                {/* Nút quay lại trên Mobile */}
                <button
                  onClick={() => setIsMobileChatOpen(false)}
                  className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer flex items-center justify-center shrink-0"
                  title="Quay lại danh sách"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg select-none overflow-hidden">
                  {activeRoom.avatar && (activeRoom.avatar.startsWith('http') || activeRoom.avatar.startsWith('/')) ? (
                    <img src={activeRoom.avatar} alt={activeRoom.name} className="w-full h-full object-cover" />
                  ) : (
                    activeRoom.avatar || '💬'
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white m-0 tracking-tight leading-none">{activeRoom.name}</h4>
                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mt-1 block">
                    🟢 Khách Hàng Thuê Sân
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-550 hover:text-white bg-transparent border-0 cursor-pointer rounded-lg hover:bg-slate-800/40 transition">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-550 hover:text-white bg-transparent border-0 cursor-pointer rounded-lg hover:bg-slate-800/40 transition">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-550 hover:text-white bg-transparent border-0 cursor-pointer rounded-lg hover:bg-slate-800/40 transition">
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Feed tin nhắn */}
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  <div className="flex gap-2 max-w-[60%] animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-2 bg-slate-850 rounded w-16" />
                      <div className="h-10 bg-slate-800 rounded-2xl w-48" />
                    </div>
                  </div>
                  <div className="flex gap-2 max-w-[60%] ml-auto flex-row-reverse animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-2 bg-slate-850 rounded w-16" />
                      <div className="h-10 bg-slate-800 rounded-2xl w-48" />
                    </div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-slate-600 space-y-2">
                  <MessageSquare className="w-10 h-10 stroke-[1.2] text-slate-800" />
                  <p className="text-[11px] font-medium">Bắt đầu trò chuyện với khách hàng.</p>
                </div>
              ) : (
                messages.map((m) => {
                  if (m.type === 'SYSTEM') {
                    return (
                      <div key={m.id} className="flex justify-center my-2">
                        <div className="bg-slate-900 border border-slate-850 px-4 py-2 rounded-2xl text-[10px] text-slate-400 max-w-md text-center leading-relaxed">
                          🤖 {m.text}
                        </div>
                      </div>
                    );
                  }

                  const isOwn = m.isMe;
                  return (
                    <div 
                      key={m.id} 
                      className={`flex gap-3 max-w-[80%] ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto text-left'}`}
                    >
                      {/* Avatar */}
                      {m.senderAvatar && (m.senderAvatar.startsWith('http') || m.senderAvatar.startsWith('/')) ? (
                        <img 
                          src={m.senderAvatar} 
                          alt={m.senderName} 
                          className="w-8 h-8 rounded-full object-cover shrink-0 select-none border border-slate-800"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0 select-none">
                          {m.senderAvatar || '🧑'}
                        </span>
                      )}

                      {/* Bubble */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-550 block">{m.senderName}</span>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isOwn 
                            ? 'bg-amber-600 text-white rounded-tr-none text-left shadow-lg shadow-amber-900/10' 
                            : 'bg-slate-900 border border-slate-800 text-slate-350 rounded-tl-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[8px] text-slate-650 block font-mono">{m.timestamp}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Ô gõ tin nhắn */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-800/80 bg-slate-900/20 backdrop-blur-xs flex gap-2"
            >
              <input
                type="text"
                placeholder="Nhập tin nhắn phản hồi cho khách hàng..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition"
              />
              
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-0 cursor-pointer transition ${
                  inputText.trim() 
                    ? 'bg-amber-500 text-white hover:bg-amber-400 active:scale-95 shadow-md shadow-amber-500/10' 
                    : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>

          </main>
        ) : (
          <div className={`flex-grow flex flex-col justify-center items-center text-slate-500 space-y-3 ${
            isMobileChatOpen ? 'flex' : 'hidden md:flex'
          }`}>
            <MessageSquare className="w-16 h-16 stroke-[1.2] text-slate-700" />
            <p className="text-xs font-medium">Chọn một khách hàng ở cột bên trái để bắt đầu cuộc trò chuyện.</p>
          </div>
        )}

      </div>

    </div>
  );
};
