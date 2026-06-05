/**
 * ============================================================================
 * MATCHMAKING TYPES (TÌM ĐỐI THỦ & GHÉP CẶP GIAO LƯU THỂ THAO)
 * ============================================================================
 * 
 * 📄 File gốc: frontend/src/types/matchmaking.ts
 * 📌 Sử dụng tại các trang:
 *    - Matchmaking.tsx (Trang "Ghép Kèo" phía Client giúp kết nối các người chơi thể thao)
 */

/**
 * Danh sách người chơi tham gia xin ghép cặp hoặc đã tham gia trận đấu giao hữu
 */
export interface Participant {
  id?: string;                                // Mã định danh của bản ghi tham gia
  name: string;                               // Họ tên người tham gia ghép kèo
  avatar: string;                             // Ảnh đại diện hoặc emoji đại diện của người chơi
  status: 'JOINED' | 'PENDING' | 'REJECTED';  // Trạng thái tham gia (Đã vào phòng chơi, Đang chờ chủ phòng duyệt, Bị từ chối)
  note?: string;                              // Lời nhắn gửi kèm khi gửi yêu cầu tham gia (Ví dụ: "Mình có vợt rồi...")
}

/**
 * Thông tin bài đăng tuyển thành viên, tìm đối thủ đá bóng, giao lưu cầu lông/pickleball...
 */
export interface MatchPost {
  id: string;                                                                 // Mã bài đăng ghép kèo
  userId?: string;                                                            // Mã người tạo bài đăng (host)
  hostName: string;                                                           // Tên của chủ bài đăng (người tạo kèo)
  hostAvatar: string;                                                         // Ảnh đại diện chủ kèo
  hostPhone?: string;                                                         // Số điện thoại liên hệ của chủ phòng/host
  title: string;                                                              // Tiêu đề kèo đấu (Ví dụ: "Tuyển 2 VĐV giao lưu cầu lông...")
  sport: 'Cầu Lông' | 'Bóng Đá' | 'Pickleball' | 'Tennis' | 'Bóng Rổ';        // Môn thể thao thi đấu
  courtName: string;                                                          // Tên cụm sân đấu đăng ký (Ví dụ: Sân số 2 ProZone)
  playDate: string;                                                           // Ngày diễn ra trận đấu
  startTime: string;                                                          // Giờ mở màn trận đấu
  endTime: string;                                                            // Giờ kết thúc ca đấu
  skillLevel: 'Bất kỳ' | 'Mới chơi' | 'Khá' | 'Chuyên nghiệp';                // Yêu cầu trình độ của người tham gia
  maxPlayers: number;                                                         // Số lượng người chơi tối đa cần tuyển
  currentPlayers: number;                                                     // Số lượng thành viên hiện tại đã chốt
  description: string;                                                        // Nội dung mô tả chi tiết trận đấu và lưu ý
  status: 'PENDING' | 'OPEN' | 'FULL' | 'CANCELLED' | 'REJECTED';              // Trạng thái bài đăng
  participants: Participant[];                                                // Danh sách những người đã gửi yêu cầu tham gia bài đăng này
}
