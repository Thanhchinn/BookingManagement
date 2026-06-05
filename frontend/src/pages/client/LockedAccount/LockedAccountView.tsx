import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Send, MessageSquare, LogIn, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';

interface LockedAccountViewProps {
  email: string;
  onLogout: () => void;
  onNavigate: (page: any, authMode?: any) => void;
}

interface SupportMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  time: string;
}

export const LockedAccountView: React.FC<LockedAccountViewProps> = ({ email, onLogout, onNavigate }) => {
  const [showChat, setShowChat] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages, setMessages] = useState<SupportMessage[]>(() => {
    const saved = localStorage.getItem(`sportzone_support_messages_${email}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: '1',
        sender: 'admin',
        text: 'Hệ thống hỗ trợ SportZone xin chào. Tài khoản của bạn hiện đang bị tạm khóa. Vui lòng cho chúng tôi biết thông tin hoặc khiếu nại để ban quản trị tiến hành đối chiếu.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(`sportzone_support_messages_${email}`, JSON.stringify(messages));
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: SupportMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Giả lập Admin trả lời sau 1.5 giây
    setTimeout(() => {
      const replyMsg: SupportMessage = {
        id: String(Date.now() + 1),
        sender: 'admin',
        text: `Chào bạn, chúng tôi đã tiếp nhận phản hồi cho tài khoản "${email}". Yêu cầu này đã được chuyển đến bộ phận kiểm duyệt tài khoản. Ban quản trị sẽ rà soát hoạt động của bạn và phản hồi kết quả trong vòng 24h tới.`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const handleAction = (action: 'login' | 'register') => {
    // Đăng xuất xóa token trước
    onLogout();
    // Chuyển hướng
    onNavigate('auth', action);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-slate-100 overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-650/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 transition-all duration-350">
        
        {/* HỘP THÔNG BÁO KHÓA (Cột trái) */}
        <div className={`sz-panel bg-slate-900/90 border border-slate-800 p-6 sm:p-8 flex flex-col justify-center items-center text-center backdrop-blur-xl ${
          showChat ? 'md:col-span-6' : 'md:col-span-12 max-w-lg mx-auto w-full'
        } transition-all duration-300 rounded-3xl shadow-2xl`}>
          
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 uppercase">
            Tài Khoản Đã Bị Khóa
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
            Hệ thống phát hiện tài khoản <span className="text-red-400 font-mono font-bold">{email}</span> vi phạm quy tắc cộng đồng hoặc có hoạt động đặt ca đáng ngờ. Vui lòng liên hệ hỗ trợ hoặc đăng nhập tài khoản khác.
          </p>

          {/* HÀNG CÁC NÚT THAO TÁC */}
          <div className="w-full space-y-3">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition duration-205 cursor-pointer border ${
                showChat
                  ? 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-600/20'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{showChat ? 'Ẩn kênh hỗ trợ' : 'Liên hệ hỗ trợ (Chat với Admin)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction('login')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-350 rounded-xl transition duration-150 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>

              <button
                onClick={() => handleAction('register')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-350 rounded-xl transition duration-150 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký</span>
              </button>
            </div>
          </div>
        </div>

        {/* CỘT CHAT HỖ TRỢ TRỰC TIẾP (Cột phải) */}
        {showChat && (
          <div className="md:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[450px] md:h-[500px] overflow-hidden backdrop-blur-xl animate-fade-in">
            {/* Header Chat */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5 text-left">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <div>
                  <h4 className="text-xs font-bold text-white m-0">Kênh khiếu nại & Hỗ trợ</h4>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Admin trực tuyến · SportZone Support</span>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 bg-transparent border-0 cursor-pointer text-xs flex items-center gap-1 font-bold md:hidden"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại
              </button>
            </div>

            {/* Khung chat */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-950/20">
              {messages.map((m) => {
                const isOwn = m.sender === 'user';
                return (
                  <div key={m.id} className={`flex gap-2.5 max-w-[85%] ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto text-left'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 select-none ${
                      isOwn ? 'bg-slate-800 text-slate-300' : 'bg-red-950 text-red-400 border border-red-900/30'
                    }`}>
                      {isOwn ? '👤' : '🛡️'}
                    </div>
                    <div className="space-y-1">
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isOwn 
                          ? 'bg-red-650 text-white rounded-tr-none text-left' 
                          : 'bg-slate-950 border border-slate-850 text-slate-300 rounded-tl-none'
                      }`}>
                        {m.text}
                      </div>
                      <span className="text-[8px] text-slate-600 block font-mono text-right">{m.time}</span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto text-left items-center">
                  <div className="w-7 h-7 rounded-full bg-red-950 text-red-400 border border-red-900/30 flex items-center justify-center text-xs shrink-0 select-none">
                    🛡️
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-3 py-2 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                    <span className="text-[10px] text-slate-400">Admin đang soạn phản hồi...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Nhập chat */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Nhập nội dung giải trình..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow bg-slate-950 border border-slate-800 focus:border-red-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 border-0 cursor-pointer transition ${
                  inputText.trim() 
                    ? 'bg-red-650 text-white hover:bg-red-750 active:scale-95 shadow-md shadow-red-650/20' 
                    : 'bg-slate-950 text-slate-650 cursor-not-allowed border border-slate-850'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
