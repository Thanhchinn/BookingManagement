# 🚀 Hướng Dẫn Kiến Trúc Real-Time & Đồng Bộ Trạng Thái Đồng Thời (Cross-Portal Sync)

Tài liệu này giải thích cách hoạt động của hệ thống đồng bộ trạng thái thời gian thực giữa **Admin Portal** và **Partner Portal** nhằm đảm bảo dữ liệu luôn được cập nhật tức thời mà không cần tải lại trang (reload).

---

## 📌 1. Nguyên Lý Hoạt Động Tổng Quan

Hệ thống hoạt động dựa trên cơ chế **Short-Polling (Truy vấn ngắn định kỳ)** phối hợp với **React hooks** và **LocalStorage**.

```
                       [ Admin Portal ]
                              │  (Khóa tài khoản đối tác / duyệt đăng ký)
                              ▼
                       [ NestJS / DB ]
                              ▲
                              │  (Tự động kiểm tra trạng thái mỗi 3 giây)
                       [ Partner Portal ]
```

### Chi tiết các luồng:
1. **Đồng bộ khi khóa tài khoản (Active -> Suspended):**
   - Admin bấm khóa đối tác ở Admin Dashboard.
   - Trạng thái thay đổi trong DB.
   - Trang Portal Đối tác đang hoạt động tự động gửi request kiểm tra (`GET /partners/user/:userId`) định kỳ mỗi **3 giây**.
   - Khi phát hiện trạng thái không còn là `ACTIVE` (ví dụ `SUSPENDED`), Portal Đối tác lập tức đăng xuất (logout) tài khoản và trả về trang login kèm thông báo lỗi.

2. **Đồng bộ khi phê duyệt đối tác (Pending -> Active):**
   - Đối tác vừa gửi form đăng ký, đang chờ duyệt ở màn hình `PENDING`.
   - Trang Admin Dashboard tự động refresh danh sách mỗi **3 giây**, hồ sơ đối tác mới lập tức xuất hiện mà không cần bấm F5.
   - Admin bấm phê duyệt hồ sơ đối tác.
   - Trang `PENDING` của đối tác tự động check trạng thái, phát hiện status chuyển sang `ACTIVE` sẽ kích hoạt đăng nhập thẳng vào Portal Đối tác.

---

## 📂 2. Các File Ảnh Hưởng & Vai Trò Chi Tiết

Dưới đây là các file trực tiếp điều khiển hành vi real-time này:

### 1️⃣ `frontend/src/hooks/useAutoRefresh.ts` (Bộ Khởi Tạo Nhịp Tim)
*   **Vai trò**: Cung cấp cơ chế tự động gọi hàm cập nhật định kỳ.
*   **Cách thức**:
    *   Sử dụng `useRef` để lưu trữ hàm `fetchFn` mới nhất, tránh việc tạo lại `setInterval` khi các state phụ thuộc thay đổi (ngăn chặn rò rỉ bộ nhớ - memory leak).
    *   Thực hiện việc kích hoạt lặp lại mỗi `intervalMs` (truyền trực tiếp `3000ms` khi cần chạy nhanh).

---

### 2️⃣ `frontend/src/pages/partner/PartnerLoginPage/PartnerLoginPage.tsx` (Màn Hình Chờ Duyệt)
*   **Vai trò**: Tự động đưa đối tác vào dashboard khi Admin phê duyệt.
*   **Chi tiết hoạt động**:
    *   Khi đối tác vừa gửi hồ sơ xong và đang ở trạng thái `pending` (Chờ duyệt), một `useEffect` polling sẽ chạy:
        ```typescript
        const interval = setInterval(async () => {
          const res = await fetch(`http://localhost:3000/partners/user/${userInfo.id}`);
          const data = await res.json();
          if (data && data.status === 'ACTIVE') {
            setPageState('active'); // Kích hoạt hiệu ứng login
          }
        }, 3000); // 3 giây/lần
        ```
    *   Khi phát hiện trạng thái đổi sang `ACTIVE`, giao diện sẽ tự chuyển hướng vào dashboard mà không bắt người dùng F5.

---

### 3️⃣ `frontend/src/pages/partner/PartnerLayout/PartnerLayout.tsx` (Bảng Điều Khiển Đối Tác)
*   **Vai trò**: Lập tức kích hoạt cơ chế đá đối tác ra ngoài nếu bị Admin khóa.
*   **Chi tiết hoạt động**:
    *   Ngay khi đối tác đăng nhập thành công vào trang quản trị của họ, ứng dụng bắt đầu kiểm tra trạng thái của user ID đó mỗi 3 giây thông qua API `/partners/user/:userId`.
    *   Nếu Admin đổi trạng thái thành `SUSPENDED` hoặc xóa hồ sơ của đối tác khỏi cơ sở dữ liệu:
        *   Cơ chế polling phát hiện trạng thái không còn là `ACTIVE`.
        *   Hàm `onLogout()` được gọi ngay lập tức để hủy phiên làm việc.
        *   Hiển thị thông báo toast: *"Tài khoản đối tác của bạn đã bị khóa hoặc ngừng kích hoạt bởi Admin!"*.

---

### 4️⃣ `frontend/src/pages/admin/PartnerManagement/PartnerManagement.tsx` & `UserManagement.tsx` (Admin Dashboard)
*   **Vai trò**: Tự động đồng bộ các tài khoản vừa đăng ký mà không cần tải lại trang.
*   **Chi tiết hoạt động**:
    *   Hai file này sử dụng hook `useAutoRefresh(fetchPartners/fetchUsers, 3000)` để cập nhật danh sách và số liệu thống kê ở đầu trang mỗi **3 giây**.
    *   Khi người dùng ở Client đăng ký tài khoản mới hoặc đăng ký nâng cấp đối tác, danh sách trên dashboard Admin tự động cập nhật ngay lập tức.

---

### 5️⃣ `frontend/src/features/admin/components/AdminConfirmModal.tsx` (Modal Xác Nhận Trực Quan)
*   **Vai trò**: Đảm bảo đồng bộ hóa tiến trình bất đồng bộ (async).
*   **Chi tiết hoạt động**:
    *   Trước đây, modal sẽ đóng ngay khi click nút xác nhận mà không đợi API chạy xong.
    *   Sau khi sửa đổi, modal sẽ hiển thị trạng thái `Đang xử lý...` (spinner) và đợi hàm API (`PATCH/DELETE`) hoàn thành thành công rồi mới tự đóng và làm mới dữ liệu.

---

## 💡 3. Điểm Ưu Việt Của Kiến Trúc Này
1.  **Trải nghiệm mượt mà**: Người dùng hoặc đối tác không cần phải tải lại trang thủ công để kiểm tra trạng thái duyệt hay khóa.
2.  **Tiết kiệm tài nguyên**: Sử dụng truy vấn API tối giản (`/user/:id`), giảm thiểu tối đa tải lượng xử lý cho Database và NestJS.
3.  **Tự hủy khi unmount**: Tất cả các bộ hẹn giờ (`setInterval`) đều có cơ chế `clear` sạch sẽ khi người dùng chuyển trang, không làm chậm trình duyệt.
