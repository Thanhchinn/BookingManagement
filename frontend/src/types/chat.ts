/**
 * ============================================================================
 * CHAT & MESSAGING TYPES (HỆ THỐNG TRÒ CHUYỆN ĐỒNG BỘ)
 * ============================================================================
 * 
 * 📄 File gốc: frontend/src/types/chat.ts
 * 📌 Sử dụng tại các trang:
 *    - CommunityChat.tsx (Trang "Tin Nhắn Đồng Bộ" phía Client để bàn chiến thuật kèo đấu hoặc trao đổi với chủ sân)
 */

/**
 * Cấu trúc tin nhắn chi tiết trong một phòng hội thoại (Chat Message)
 */
export interface ChatMessage {
  id: string;                     // Mã tin nhắn duy nhất
  senderName: string;             // Tên người gửi tin nhắn (Tên người dùng, Tên chủ sân, hoặc Hệ thống)
  senderAvatar: string;           // Ảnh đại diện của người gửi tin nhắn
  isMe: boolean;                  // Đánh dấu tin nhắn do chính người dùng hiện tại gửi (true nếu đúng)
  text: string;                   // Nội dung văn bản tin nhắn
  timestamp: string;              // Giờ gửi tin nhắn (Ví dụ: 16:45, Hôm qua...)
  type: 'TEXT' | 'SYSTEM';        // Phân loại tin nhắn (Tin nhắn văn bản thông thường, hoặc Tin nhắn hệ thống báo tham gia/rút nhóm)
}

/**
 * Cấu trúc thông tin của một Phòng trò chuyện (Chat Room)
 */
export interface ChatRoom {
  id: string;                     // Mã phòng chat
  name: string;                   // Tên phòng chat hiển thị (Tên kèo đấu ghép đôi hoặc Tên cơ sở cụm sân)
  avatar: string;                 // Ảnh đại diện phòng chat (Thường là Emoji môn chơi hoặc hình ảnh cụm sân)
  type: 'MATCH' | 'INDIVIDUAL';   // Loại phòng (Phòng chat nhóm ghép kèo đông người, hoặc Chat 1-1 hỗ trợ trực tiếp với chủ sân)
  sport?: string;                 // Môn thể thao của kèo đấu đó (nếu là chat ghép nhóm)
  unreadCount: number;            // Số lượng tin nhắn chưa đọc của phòng chat này đối với tài khoản hiện tại
  lastMessage: string;            // Nội dung tin nhắn cuối cùng hiển thị xem trước ngoài danh sách phòng
  lastMessageTime: string;        // Thời điểm gửi tin nhắn cuối cùng hiển thị xem trước
  messages: ChatMessage[];        // Toàn bộ lịch sử các tin nhắn trong phòng hội thoại này
}
