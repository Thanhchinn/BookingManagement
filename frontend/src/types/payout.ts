/**
 * ============================================================================
 * PAYOUT TYPES (YÊU CẦU RÚT TIỀN / DOANH THU ĐỐI TÁC)
 * ============================================================================
 * 
 * 📄 File gốc: frontend/src/types/payout.ts
 * 📌 Sử dụng tại các trang:
 *    - PayoutManagement.tsx (Admin panel duyệt lệnh rút tiền của chủ sân)
 *    - Các mô-đun ví tiền, đối soát doanh thu của phía chủ sân đối tác (Partner).
 */

/**
 * Hồ sơ yêu cầu rút tiền / thanh toán số dư ví đối tác về tài khoản ngân hàng.
 */
export interface PayoutRequest {
  id: string;                                     // Mã định danh phiên yêu cầu rút tiền (Ví dụ: PAY-8809)
  partnerName: string;                            // Tên chủ cụm sân bãi đối tác yêu cầu rút tiền
  amount: number;                                 // Số tiền yêu cầu rút ra (VNĐ)
  bankName: string;                               // Tên ngân hàng thụ hưởng (Ví dụ: Vietcombank, Techcombank...)
  accountNumber: string;                          // Số tài khoản ngân hàng nhận tiền
  accountName: string;                            // Tên chủ tài khoản thụ hưởng (viết hoa không dấu)
  status: 'PENDING' | 'APPROVED' | 'REJECTED';    // Trạng thái xử lý yêu cầu (Đang chờ duyệt, Đã chuyển khoản thành công, Bị từ chối)
  requestDate: string;                            // Ngày tạo yêu cầu rút tiền
  completeDate?: string;                          // Ngày Admin duyệt và hoàn tất chuyển khoản thành công
  txHash?: string;                                // Mã biên lai / Mã giao dịch ngân hàng đối soát
  rejectReason?: string;                          // Lý do từ chối giao dịch nếu thông tin sai lệch
}
