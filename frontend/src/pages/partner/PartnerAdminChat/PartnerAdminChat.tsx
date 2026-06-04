import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircleCode } from 'lucide-react';

interface Message {
  id: string;
  partnerName: string;
  sender: 'admin' | 'partner';
  text: string;
  timestamp: string;
}

interface PartnerAdminChatProps {
  partnerName: string;
}

export const PartnerAdminChat: React.FC<PartnerAdminChatProps> = ({ partnerName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activePartnerName = partnerName || 'Đối tác Cụm Sân';

  // 1. Đồng bộ tin nhắn từ localStorage
  const loadMessages = () => {
    const stored = localStorage.getItem('sportzone_admin_partner_messages');
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Dữ liệu khởi tạo nếu chưa có cuộc trò chuyện nào
      const initialMessages: Message[] = [
        {
          id: 'init-1',
          partnerName: 'Cầu Lông ProZone',
          sender: 'partner',
          text: 'Chào admin, tài khoản của bên mình đã được kích hoạt chưa ạ?',
          timestamp: '10:00'
        },
        {
          id: 'init-2',
          partnerName: 'Cầu Lông ProZone',
          sender: 'admin',
          text: 'Chào bạn, hồ sơ của bạn đã được kiểm duyệt hợp lệ. Tài khoản ProZone đã chính thức kích hoạt nhé!',
          timestamp: '10:05'
        }
      ];
      localStorage.setItem('sportzone_admin_partner_messages', JSON.stringify(initialMessages));
      setMessages(initialMessages);
    }
  };

  useEffect(() => {
    loadMessages();

    // Listen to changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sportzone_admin_partner_messages') {
        loadMessages();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Polling every 1.5 seconds for real-time interaction
    const interval = setInterval(loadMessages, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Tự động cuộn xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lọc tin nhắn của đối tác hiện tại
  const activeChatMessages = messages.filter(m => m.partnerName === activePartnerName);

  // Gửi tin nhắn
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: Message = {
      id: String(Date.now()),
      partnerName: activePartnerName,
      sender: 'partner',
      text: inputVal.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, newMsg];
    localStorage.setItem('sportzone_admin_partner_messages', JSON.stringify(updated));
    setMessages(updated);
    setInputVal('');
  };

  // Trợ lý phản hồi nhanh của Đối tác
  const quickReplies = [
    'Tôi muốn hỗ trợ phê duyệt thông tin cơ sở mới cập nhật.',
    'Yêu cầu rút tiền đối soát từ ngày hôm qua chưa nhận được.',
    'Nhờ admin kiểm tra lỗi hiển thị lịch đặt sân của tôi.',
    'Tôi muốn đổi thông tin tài khoản thụ hưởng ngân hàng.'
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-[70vh] relative font-sans text-slate-100 max-w-5xl mx-auto">
      {/* Header */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/25 shrink-0">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg select-none">
            🛡️
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white m-0 tracking-tight leading-none">
              Ban Quản Trị Hệ Thống SportZone
            </h4>
            <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mt-1 block">
              🟢 Trợ giúp trực tuyến 24/7
            </span>
          </div>
        </div>
      </header>

      {/* Feed tin nhắn */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4">
        {activeChatMessages.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-slate-500 h-full space-y-2">
            <MessageCircleCode className="w-12 h-12 stroke-[1.2] text-slate-700 animate-pulse" />
            <p className="text-xs">Chưa có tin nhắn nào với Ban quản trị. Hãy gửi lời chào hỗ trợ đầu tiên!</p>
          </div>
        ) : (
          activeChatMessages.map((m, idx) => {
            const isOwn = m.sender === 'partner';
            return (
              <div
                key={m.id || idx}
                className={`flex gap-3 max-w-[80%] ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto text-left'}`}
              >
                <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0 select-none">
                  {isOwn ? '🏟️' : '💼'}
                </span>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 block">
                    {isOwn ? activePartnerName : 'Ban Quản Trị'}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isOwn
                      ? 'bg-amber-600 text-white rounded-tr-none text-left shadow-lg shadow-amber-900/10'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[8px] text-slate-600 block font-mono text-right">{m.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Bar */}
      <div className="px-6 py-2 border-t border-slate-800/50 bg-slate-950/20 flex gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
        {quickReplies.map((qr, index) => (
          <button
            key={index}
            onClick={() => setInputVal(qr)}
            className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-amber-500/30 text-slate-400 hover:text-white text-[10px] font-semibold rounded-full transition whitespace-nowrap cursor-pointer"
          >
            💡 {qr}
          </button>
        ))}
      </div>

      {/* Chat input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-slate-800/80 bg-slate-900/20 flex gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Nhập câu hỏi để gửi cho Ban quản trị..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-grow bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition"
        />

        <button
          type="submit"
          disabled={!inputVal.trim()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-0 cursor-pointer transition ${
            inputVal.trim()
              ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-md shadow-amber-500/10'
              : 'bg-slate-900 text-slate-655 cursor-not-allowed'
          }`}
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
};
