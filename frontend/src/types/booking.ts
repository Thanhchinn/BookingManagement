/**
 * ============================================================================
 * BOOKING TYPES (ĐẶT LỊCH SÂN ĐẤU & DỊCH VỤ ĐI KÈM)
 * ============================================================================
 * 
 * 📄 File gốc: frontend/src/types/booking.ts
 * 📌 Sử dụng tại các trang:
 *    - MyBookings.tsx (Trang "Lịch Hẹn Của Tôi" phía Client)
 *    - Các thành phần liên quan đến Lịch sử giao dịch và Biên lai thanh toán sân.
 */

/**
 * Kiểu dữ liệu cho các sản phẩm/dịch vụ mua kèm theo đơn đặt sân
 * (Ví dụ: thuê thêm nước uống, vợt cầu lông, giày thể thao, quả bóng...)
 */
export interface BookingProduct {
  name: string;      // Tên sản phẩm / dịch vụ phụ trợ
  qty: number;       // Số lượng thuê hoặc mua lẻ
  price: number;     // Đơn giá của từng sản phẩm (VNĐ)
}

/**
 * Cấu trúc dữ liệu chi tiết của một đơn đặt lịch sân bãi (Booking Item)
 */
export interface BookingItem {
  id: string;                                                         // Mã định danh đơn hàng tự sinh (ID nội bộ)
  bookingCode: string;                                                // Mã vé đặt sân hiển thị cho khách hàng (Ví dụ: BKG-STADIUM802)
  courtName: string;                                                  // Tên cụm sân / sân đấu chi tiết (Ví dụ: Sân số 3 - ProZone)
  sport: string;                                                      // Môn thể thao (Ví dụ: Cầu Lông, Bóng Đá, Pickleball...)
  location: string;                                                   // Địa chỉ chi tiết cụm sân bãi đấu
  bookingDate: string;                                                // Ngày đặt lịch thi đấu (Định dạng YYYY-MM-DD hoặc ngày cụ thể)
  startTime: string;                                                  // Giờ bắt đầu ca đấu (Ví dụ: 18:00)
  endTime: string;                                                    // Giờ kết thúc ca đấu (Ví dụ: 20:00)
  price: number;                                                      // Tổng giá trị thanh toán của đơn đặt sân (bao gồm cả sản phẩm)
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';        // Trạng thái đơn đặt (Chờ thanh toán, Sắp chơi, Đã hoàn thành, Đã hủy)
  paymentStatus: 'UNPAID' | 'FULLY_PAID' | 'DEPOSIT_PAID' | 'REFUNDED'; // Trạng thái thanh toán (Chưa trả, Đã thanh toán 100%, Đã cọc 50%, Đã hoàn tiền)
  products: BookingProduct[];                                         // Danh sách các dịch vụ & sản phẩm thuê kèm
  disputed?: boolean;                                                 // Đánh dấu đơn đang bị khiếu nại (true nếu đang tranh chấp)
  reviewed?: boolean;                                                 // Đánh dấu đơn hàng đã được người dùng đánh giá (true nếu rồi)
  isMatch?: boolean;                                                  // Đánh dấu đây là trận đấu ghép cặp
  matchHost?: string;                                                 // Chủ phòng ghép cặp
  matchMaxPlayers?: number;                                           // Số lượng người chơi tối đa
  matchCurrentPlayers?: number;                                       // Số lượng người chơi hiện tại
  description?: string;                                               // Mô tả chi tiết (dành cho kèo đấu giao lưu)
  isHostMatch?: boolean;                                              // Người dùng hiện tại là chủ phòng (Host) của trận đấu này
  matchParticipants?: MatchParticipantItem[];                         // Danh sách thành viên tham gia ghép kèo
}

export interface MatchParticipantItem {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  status: 'PENDING' | 'JOINED' | 'REJECTED';
  note?: string;
}

