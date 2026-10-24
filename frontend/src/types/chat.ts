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
 * Cấu trúc thông tin sân và lịch đặt liên kết với phòng chat (Booking Context)
 */
export interface BookingContext {
  id?: string;
  bookingCode: string;
  courtName: string;
  locationName: string;
  address: string;
  playDate: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'AWAITING_PAYMENT' | 'PENDING' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  statusLabel: string;
  statusColor?: 'emerald' | 'amber' | 'cyan' | 'rose';
  totalPrice?: number | string;
  contactPhone?: string;
}

/**
 * Cấu trúc vé điện tử hệ thống (Ticket Card)
 */
export interface TicketData {
  bookingCode: string;
  courtName: string;
  locationName: string;
  address: string;
  playDate: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'AWAITING_PAYMENT' | 'PENDING' | 'CHECKED_IN';
  statusLabel: string;
  price?: string;
  customerName?: string;
  depositPaid?: boolean;
  qrPayload?: string;
}

/**
 * Cấu trúc tin nhắn chi tiết trong một phòng hội thoại (Chat Message)
 */
export interface ChatMessage {
  id: string;                     // Mã tin nhắn duy nhất
  senderName: string;             // Tên người gửi tin nhắn (Tên người dùng, Tên chủ sân, hoặc Hệ thống)
  senderAvatar: string;           // Ảnh đại diện của người gửi tin nhắn
  senderRole?: 'OWNER' | 'CAPTAIN' | 'MEMBER' | 'ADMIN' | 'SYSTEM' | string; // Vai trò người gửi
  isMe: boolean;                  // Đánh dấu tin nhắn do chính người dùng hiện tại gửi (true nếu đúng)
  text: string;                   // Nội dung văn bản tin nhắn
  timestamp: string;              // Giờ gửi tin nhắn (Ví dụ: 16:45, Hôm qua...)
  type: 'TEXT' | 'SYSTEM' | 'IMAGE'; // Phân loại tin nhắn
  ticketData?: TicketData;        // Dữ liệu vé điện tử nếu là tin nhắn hệ thống xác nhận đặt sân
  attachments?: any;              // Tệp hoặc dữ liệu bổ trợ kèm theo
  reactions?: Record<string, number>; // Thả biểu cảm cảm xúc (👍, ❤️, ⚽, 🔥)
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
  roleLabel?: string;             // Nhãn vai trò đối phương (Chủ cơ sở sân, Đội trưởng kèo đấu)
  unreadCount: number;            // Số lượng tin nhắn chưa đọc của phòng chat này đối với tài khoản hiện tại
  lastMessage: string;            // Nội dung tin nhắn cuối cùng hiển thị xem trước ngoài danh sách phòng
  lastMessageTime: string;        // Thời điểm gửi tin nhắn cuối cùng hiển thị xem trước
  lastMessageDate?: string | Date | null;
  bookingContext?: BookingContext; // Thẻ tóm tắt đặt sân liên kết (Mini Booking Card)
  messages?: ChatMessage[];       // Toàn bộ lịch sử các tin nhắn trong phòng hội thoại này
}
