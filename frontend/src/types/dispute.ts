/**
 * ============================================================================
 * DISPUTE TYPES (KHIẾU NẠI & TRANH CHẤP ĐƠN HÀNG)
 * ============================================================================
 * 
 * 📄 File gốc: frontend/src/types/dispute.ts
 * 📌 Sử dụng tại các trang:
 *    - DisputeManagement.tsx (Admin panel quản lý, xử lý tranh chấp của hệ thống)
 *    - MyBookings.tsx (Client gửi khiếu nại nếu dịch vụ hoặc chủ sân có sai phạm)
 */

/**
 * Cấu trúc dữ liệu của đơn Khiếu nại / Tranh chấp (Dispute record)
 * Hỗ trợ phân tích sự cố giữa Khách hàng (User) và Chủ sân (Partner) dưới sự hòa giải của Admin.
 */
export interface Dispute {
  id: string;                                                                 // Mã định danh sự việc khiếu nại (Ví dụ: DISP-7721)
  bookingCode: string;                                                        // Mã vé đặt sân liên quan trực tiếp đến tranh chấp
  userName: string;                                                           // Họ và tên khách hàng gửi đơn
  partnerName: string;                                                        // Tên của chủ cụm sân bãi bị khiếu nại
  category: 'QUALITY' | 'CANCELLATION' | 'OVERCHARGE' | 'NO_SHOW' | 'OTHER';  // Danh mục lý do khiếu nại (Chất lượng sân, Hủy ca sai quy định, Phụ phí ẩn, Chủ sân không mở cửa, Lý do khác)
  description: string;                                                        // Chi tiết tường thuật sự việc từ người dùng
  evidence: string[];                                                         // Danh sách mô tả ảnh / video / bằng chứng tải lên (giả lập đường dẫn)
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';                              // Trạng thái xử lý (Mới tạo, Đang điều tra, Đã giải quyết xong)
  resolution?: string;                                                        // Nội dung kết luận / hướng xử lý từ Admin hệ thống
  verdict?: 'REFUND' | 'PARTNER_WIN';                                         // Quyết định cuối cùng (Hoàn tiền cho khách hàng hoặc xử thắng cho chủ sân)
  createdAt: string;                                                          // Ngày giờ tạo hồ sơ khiếu nại
}
