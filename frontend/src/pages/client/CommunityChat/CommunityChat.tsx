import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone, 
  Video, 
  Info,
  ArrowLeft
} from 'lucide-react';
import type { ChatMessage, ChatRoom } from '../../../types';

interface CommunityChatProps {
  onNavigate?: (page: 'home' | 'auth' | 'admin' | 'partner' | 'field-details' | 'my-bookings' | 'booking-success' | 'matchmaking' | 'chat', authMode?: 'login' | 'register') => void;
  userName?: string;
  onLogout?: () => void;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ onNavigate, userName, onLogout }) => {
  // Mock Data hỗ trợ trò chuyện động (lấy từ localStorage nếu có)
  const [rooms, setRooms] = useState<ChatRoom[]>(() => {
    const saved = localStorage.getItem('sportzone_client_chat_rooms');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
    return [
      {
        id: '1',
        name: '🏸 Cầu Lông Đôi Nam Nữ - Bình Thạnh',
        avatar: '🏸',
        type: 'MATCH',
        sport: 'Cầu Lông',
        unreadCount: 2,
        lastMessage: 'Hệ thống: Lê Hoàng Long đã tham gia phòng chat nhóm!',
        lastMessageTime: '16:45',
        messages: [
          { id: '101', senderName: 'Hệ thống', senderAvatar: '🤖', isMe: false, text: 'Trận đấu đã được chốt 4 thành viên! Phòng chat nhóm tự động được kích hoạt.', timestamp: '16:00', type: 'SYSTEM' },
          { id: '102', senderName: 'Nguyễn Minh Hải', senderAvatar: '👨‍🦱', isMe: false, text: 'Chào mọi người, sân mình đặt ở Bình Thạnh ca 18h-20h tối mai nhé.', timestamp: '16:02', type: 'TEXT' },
          { id: '103', senderName: 'Trần Thị Mai', senderAvatar: '👩‍🦰', isMe: false, text: 'Ok anh Hải ơi, mình đi xe máy tới thì gửi xe ở cổng hay bên trong ạ?', timestamp: '16:05', type: 'TEXT' },
          { id: '104', senderName: 'Nguyễn Minh Hải', senderAvatar: '👨‍🦱', isMe: false, text: 'Gửi xe máy bên hông sân miễn phí nhé em, có bảo vệ trông.', timestamp: '16:08', type: 'TEXT' },
          { id: '105', senderName: 'Hệ thống', senderAvatar: '🤖', isMe: false, text: 'Lê Hoàng Long đã được duyệt duyệt tham gia nhóm!', timestamp: '16:45', type: 'SYSTEM' }
        ]
      },
      {
        id: '2',
        name: '⚽ FC Giao Hữu Sân 5 - An Phú',
        avatar: '⚽',
        type: 'MATCH',
        sport: 'Bóng Đá',
        unreadCount: 0,
        lastMessage: 'Hẹn tối mai 19h anh em có mặt đông đủ nhé!',
        lastMessageTime: 'Hôm qua',
        messages: [
          { id: '201', senderName: 'Hệ thống', senderAvatar: '🤖', isMe: false, text: 'FC Giao Hữu Sân 5 đã được kích hoạt phòng chat.', timestamp: 'Hôm qua', type: 'SYSTEM' },
          { id: '202', senderName: 'Lê Hoàng Long', senderAvatar: '🧔', isMe: false, text: 'Đội mình mặc áo màu đỏ nhé anh em ơi.', timestamp: 'Hôm qua', type: 'TEXT' },
          { id: '203', senderName: 'Vũ Minh Tuấn', senderAvatar: '👨', isMe: false, text: 'Ok, để em mang thêm bộ áo pitch dự phòng.', timestamp: 'Hôm qua', type: 'TEXT' }
        ]
      },
      {
        id: '3',
        name: 'Chủ Sân Cầu Lông ProZone',
        avatar: '🏟️',
        type: 'INDIVIDUAL',
        unreadCount: 0,
        lastMessage: 'Dạ vâng ạ, sân em đã bật sẵn điều hòa cho đoàn mình.',
        lastMessageTime: '29 Tháng 5',
        messages: [
          { id: '301', senderName: 'Chủ Sân Cầu Lông ProZone', senderAvatar: '🏟️', isMe: false, text: 'Chào anh Hải, sân cầu lông ProZone xin nghe ạ.', timestamp: '29 Tháng 5', type: 'TEXT' },
          { id: '302', senderName: 'Khách Hàng', senderAvatar: '👨‍🚀', isMe: true, text: 'Chào admin, ca 18h tối mai mình muốn thuê thêm 2 đôi giày được không?', timestamp: '29 Tháng 5', type: 'TEXT' },
          { id: '303', senderName: 'Chủ Sân Cầu Lông ProZone', senderAvatar: '🏟️', isMe: false, text: 'Dạ được chứ anh, bên em có sẵn giày các size từ 38 đến 44. Giá thuê 20.000đ/đôi ạ.', timestamp: '29 Tháng 5', type: 'TEXT' }
        ]
      }
    ];
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    return localStorage.getItem('sportzone_active_chat_room_id') || '1';
  });
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Lưu rooms vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('sportzone_client_chat_rooms', JSON.stringify(rooms));
  }, [rooms]);

  // Lấy phòng chat đang mở
  const activeRoom = rooms.find(r => r.id === activeRoomId);

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
  }, [activeRoom?.messages]);

  // Gửi tin nhắn mới
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      senderName: userName || 'Khách Hàng',
      senderAvatar: '👨‍🚀',
      isMe: true,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type: 'TEXT'
    };

    setRooms(prevRooms => prevRooms.map(r => {
      if (r.id === activeRoom.id) {
        return {
          ...r,
          unreadCount: 0,
          lastMessage: inputText.trim(),
          lastMessageTime: newMsg.timestamp,
          messages: [...r.messages, newMsg]
        };
      }
      return r;
    }));

    setInputText('');
  };

  // Đọc tin nhắn (Reset unreadCount về 0 khi bấm vào phòng)
  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    localStorage.setItem('sportzone_active_chat_room_id', roomId);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unreadCount: 0 } : r));
    setIsMobileChatOpen(true);
  };

  // Lọc phòng chat
  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden">
      
      {/* 1. HEADER NAVBAR */}
      <Navbar onNavigate={onNavigate} userName={userName} onLogout={onLogout} />

      {/* 2. CHAT HUBS WRAPPER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col h-[75svh]">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex-grow flex shadow-2xl relative">
          
          {/* CỘT TRÁI: DANH SÁCH PHÒNG CHAT */}
          <aside className={`w-full md:w-80 border-r border-slate-800/80 flex flex-col bg-slate-900 shrink-0 ${
            isMobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Header tìm kiếm */}
            <div className="p-4 border-b border-slate-800/80 space-y-3.5 text-left">
              <div>
                <h3 className="text-base font-black text-white m-0 tracking-tight flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  Tin Nhắn Đồng Bộ
                </h3>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Trò chuyện nhóm ghép & chủ sân</span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm phòng chat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-750 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 outline-none transition"
                />
              </div>
            </div>

            {/* Danh sách phòng */}
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
              {filteredRooms.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-8 m-0">Không tìm thấy phòng chat nào.</p>
              ) : (
                filteredRooms.map(r => {
                  const isActive = r.id === activeRoomId;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelectRoom(r.id)}
                      className={`w-full flex gap-3 p-3.5 rounded-2xl transition border-0 cursor-pointer text-left ${
                        isActive 
                          ? 'bg-emerald-600/10 text-white' 
                          : 'bg-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 select-none">
                        {r.avatar}
                      </div>

                      <div className="flex-grow text-left leading-tight min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className={`text-xs font-bold truncate m-0 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {r.name}
                          </h4>
                          <span className="text-[9px] text-slate-550 font-mono shrink-0">{r.lastMessageTime}</span>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 truncate mt-1.5 m-0">
                          {r.lastMessage}
                        </p>
                      </div>

                      {r.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shrink-0">
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
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg select-none">
                    {activeRoom.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white m-0 tracking-tight leading-none">{activeRoom.name}</h4>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-1 block">
                      🟢 {activeRoom.type === 'MATCH' ? `Phòng Đội Nhóm ${activeRoom.sport}` : 'Chủ cơ sở sân'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer rounded-lg hover:bg-slate-800/40 transition">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer rounded-lg hover:bg-slate-800/40 transition">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-500 hover:text-white bg-transparent border-0 cursor-pointer rounded-lg hover:bg-slate-800/40 transition">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </header>

              {/* Feed tin nhắn */}
              <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeRoom.messages.map((m, idx) => {
                  if (m.type === 'SYSTEM') {
                    return (
                      <div key={idx} className="flex justify-center my-2">
                        <div className="bg-slate-900 border border-slate-850 px-4 py-2 rounded-2xl text-[10px] text-slate-400 max-w-md text-center leading-relaxed">
                          🤖 {m.text}
                        </div>
                      </div>
                    );
                  }

                  const isOwn = m.isMe || m.senderName === userName;
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-3 max-w-[80%] ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto text-left'}`}
                    >
                      {/* Avatar */}
                      <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0 select-none">
                        {m.senderAvatar}
                      </span>

                      {/* Bubble */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-550 block">{m.senderName}</span>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isOwn 
                            ? 'bg-emerald-600 text-white rounded-tr-none text-left' 
                            : 'bg-slate-900 border border-slate-800 text-slate-350 rounded-tl-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[8px] text-slate-650 block font-mono">{m.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ô gõ tin nhắn */}
              <form 
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-800/80 bg-slate-900/20 backdrop-blur-xs flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Nhập tin nhắn để bàn bạc chiến thuật..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-grow bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition"
                />
                
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-0 cursor-pointer transition ${
                    inputText.trim() 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/10' 
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
              <p className="text-xs">Chọn phòng chat ở cột bên trái để bắt đầu cuộc trò chuyện.</p>
            </div>
          )}

        </div>

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
};
