import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, MessageCircleCode } from 'lucide-react';

interface Message {
  id: string;
  partnerName: string;
  sender: 'admin' | 'partner';
  text: string;
  timestamp: string;
}

interface Partner {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  status: string;
}

export const AdminPartnerChat: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Tải danh sách đối tác từ API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch('http://localhost:3000/partners');
        if (res.ok) {
          const data = await res.json();
          const normalized = data.map((p: any) => ({
            id: String(p.id),
            businessName: p.businessName || 'Đối tác chưa đặt tên',
            ownerName: p.user?.fullName || 'Chủ sân',
            email: p.user?.email || '',
            status: p.status || 'PENDING'
          }));
          setPartners(normalized);
          if (normalized.length > 0) {
            setSelectedPartnerName(normalized[0].businessName);
          }
        }
      } catch (err) {
        console.error('Không thể lấy danh sách đối tác:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPartners();
  }, []);

  // 2. Đồng bộ tin nhắn từ localStorage
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

    // Listen to changes in other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sportzone_admin_partner_messages') {
        loadMessages();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Polling every 1.5 seconds for real-time interaction on the same window
    const interval = setInterval(loadMessages, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Tự động cuộn xuống cuối
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
  }, [selectedPartnerName]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  // Lọc tin nhắn của đối tác đang chọn
  const activeChatMessages = messages.filter(m => m.partnerName === selectedPartnerName);

  // Gửi tin nhắn
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedPartnerName) return;

    const newMsg: Message = {
      id: String(Date.now()),
      partnerName: selectedPartnerName,
      sender: 'admin',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, newMsg];
    localStorage.setItem('sportzone_admin_partner_messages', JSON.stringify(updated));
    setMessages(updated);
    setInputText('');
  };

  // Lọc danh sách đối tác theo ô tìm kiếm
  const filteredPartners = partners.filter(p =>
    p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trợ lý trả lời nhanh của Admin
  const quickReplies = [
    'Chào đối tác, hồ sơ của bạn đã được duyệt thành công.',
    'Chúng tôi đang tiến hành đối soát, tiền sẽ về ví trong 24h tới.',
    'Vui lòng cập nhật hình ảnh sân bóng sắc nét hơn để thu hút khách nhé.',
    'Yêu cầu hỗ trợ của bạn đã được chuyển cho kỹ thuật xử lý.'
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex shadow-2xl h-[calc(100vh-260px)] min-h-[450px] relative font-sans text-slate-100 w-full max-w-full">
      {/* 1. SIDEBAR CHAT BÊN TRÁI */}
      <aside className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50 shrink-0">
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <div>
            <h3 className="text-sm font-black text-white m-0 tracking-tight flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              Kênh Trao Đổi Đối Tác
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              Nhắn tin trực tiếp với chủ cơ sở sân
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm đối tác..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 outline-none transition"
            />
          </div>
        </div>

        {/* Danh sách đối tác */}
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <p className="text-xs text-slate-500 text-center py-8">Đang tải đối tác...</p>
          ) : filteredPartners.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-8">Không tìm thấy đối tác.</p>
          ) : (
            filteredPartners.map(p => {
              const isActive = p.businessName === selectedPartnerName;
              const partnerMsgs = messages.filter(m => m.partnerName === p.businessName);
              const lastMsg = partnerMsgs[partnerMsgs.length - 1];

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPartnerName(p.businessName)}
                  className={`w-full flex gap-3 p-3 rounded-2xl transition border-0 cursor-pointer text-left ${
                    isActive
                      ? 'bg-teal-650/10 text-white border border-teal-500/20'
                      : 'bg-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-base shrink-0 select-none">
                    🏟️
                  </div>

                  <div className="flex-grow text-left leading-tight min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className={`text-xs font-bold truncate m-0 ${isActive ? 'text-teal-400' : 'text-slate-200'}`}>
                        {p.businessName}
                      </h4>
                    </div>
                    <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                      Chủ sân: {p.ownerName}
                    </span>
                    <p className="text-[10px] text-slate-500 truncate mt-1.5 m-0 font-medium">
                      {lastMsg ? (lastMsg.sender === 'admin' ? 'Bạn: ' : '') + lastMsg.text : 'Chưa có tin nhắn'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. KHU VỰC TRÒ CHUYỆN CHI TIẾT */}
      {selectedPartnerName ? (
        <main className="flex-grow flex flex-col h-full bg-slate-950/20 min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/25">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg select-none">
                🏟️
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white m-0 tracking-tight leading-none">
                  {selectedPartnerName}
                </h4>
                <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider mt-1 block">
                  🟢 Kênh Hỗ Trợ Đối Tác
                </span>
              </div>
            </div>
          </header>

          {/* Feed tin nhắn */}
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-6 space-y-4">
            {activeChatMessages.length === 0 ? (
              <div className="flex flex-col justify-center items-center text-slate-500 h-full space-y-2">
                <MessageCircleCode className="w-12 h-12 stroke-[1.2] text-slate-700" />
                <p className="text-xs">Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!</p>
              </div>
            ) : (
              activeChatMessages.map((m, idx) => {
                const isOwn = m.sender === 'admin';
                return (
                  <div
                    key={m.id || idx}
                    className={`flex gap-3 max-w-[80%] ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto text-left'}`}
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0 select-none">
                      {isOwn ? '💼' : '🏟️'}
                    </span>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-550 block">
                        {isOwn ? 'Ban Quản Trị' : selectedPartnerName}
                      </span>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isOwn
                          ? 'bg-teal-650 text-white rounded-tr-none text-left shadow-lg shadow-teal-900/10'
                          : 'bg-slate-900 border border-slate-800 text-slate-350 rounded-tl-none'
                      }`}>
                        {m.text}
                      </div>
                      <span className="text-[8px] text-slate-650 block font-mono text-right">{m.timestamp}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Replies Bar */}
          <div className="px-6 py-2 border-t border-slate-800/50 bg-slate-950/20 flex gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
            {quickReplies.map((qr, index) => (
              <button
                key={index}
                onClick={() => setInputText(qr)}
                className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-teal-500/30 text-slate-400 hover:text-white text-[10px] font-semibold rounded-full transition whitespace-nowrap cursor-pointer"
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
              placeholder={`Nhắn tin cho ${selectedPartnerName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow bg-slate-950 border border-slate-800 focus:border-teal-500/50 rounded-xl px-4 py-3 text-xs text-white outline-none transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-0 cursor-pointer transition ${
                inputText.trim()
                  ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95 shadow-md shadow-teal-600/10'
                  : 'bg-slate-900 text-slate-650 cursor-not-allowed'
              }`}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </main>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center text-slate-500 space-y-3">
          <MessageSquare className="w-16 h-16 stroke-[1.2] text-slate-700" />
          <p className="text-xs">Chọn một đối tác ở cột bên trái để bắt đầu trò chuyện.</p>
        </div>
      )}
    </div>
  );
};
