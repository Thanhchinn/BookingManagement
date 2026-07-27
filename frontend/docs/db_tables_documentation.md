# 📊 Tài liệu Mô tả Chức năng Các Bảng Cơ sở Dữ liệu (Database Schema Documentation)

Tài liệu này chi tiết hóa chức năng, vai trò nghiệp vụ, các trường dữ liệu quan trọng, mối quan hệ và những lưu ý khi cập nhật đối với toàn bộ **28 bảng** cơ sở dữ liệu hiện tại của hệ thống **BookingManagement** (định nghĩa trong file [schema.prisma](file:///c:/xampp/htdocs/ME/BookingManagement/backend/prisma/schema.prisma)).

---

## 📌 Tóm Tắt Hệ Thống Bảng Cơ Sở Dữ Liệu
Cơ sở dữ liệu sử dụng **PostgreSQL** và được tương tác thông qua **Prisma ORM**. Toàn bộ 28 bảng được chia làm **7 nhóm nghiệp vụ** chính:

- **Nhóm 1: Người dùng & Phân quyền** (4 bảng): `users`, `otp_verifications`, `admins`, `partner_profiles`
- **Nhóm 2: Địa giới & Cơ sở Kinh doanh** (8 bảng): `location_provinces`, `location_wards`, `locations`, `categories`, `services`, `amenities`, `location_amenities`, `products`
- **Nhóm 3: Lịch trình & Bảng giá** (2 bảng): `time_slots`, `slot_overrides`
- **Nhóm 4: Đặt sân & Thanh toán** (5 bảng): `bookings`, `booking_details`, `payments`, `promotions`, `user_promotions`
- **Nhóm 5: Ghép đội & Cộng đồng** (2 bảng): `match_posts`, `match_participants`
- **Nhóm 6: Chat & Real-time** (3 bảng): `chat_rooms`, `chat_room_members`, `messages`
- **Nhóm 7: Hỗ trợ & Tài chính** (4 bảng): `disputes`, `partner_commission_bills`, `notifications`, `reviews`

---

## 👤 Nhóm 1: Người Dùng & Phân Quyền

### 1. Bảng `users` — Tài khoản người dùng hệ thống
*   **Tên model (Prisma):** `User`
*   **Chức năng chính:** Lưu trữ thông tin tài khoản của tất cả các đối tượng tham gia hệ thống (Khách hàng vãng lai, tài khoản đăng nhập của Đối tác/Chủ sân).
*   **Các trường quan trọng:**
    *   `id` (BigInt): Khóa chính tự tăng.
    *   `email` (varchar): Unique, dùng làm tài khoản đăng nhập chính.
    *   `phone` (varchar): Unique, liên hệ hoặc nhận OTP.
    *   `latitude`, `longitude` (Decimal): Tọa độ GPS của người dùng để hỗ trợ tìm kiếm sân đấu gần nhất.
    *   `loyalty_points` (int): Điểm tích lũy khi đặt sân để đổi khuyến mãi.
    *   `is_active` (boolean): Trạng thái hoạt động (khóa/mở tài khoản).
*   **Quan hệ:**
    *   Liên kết `1:1` với `partner_profiles` (Chỉ những user đăng ký làm đối tác mới có bản ghi này).
    *   Liên kết `1:N` với `bookings`, `match_posts`, `messages`, `reviews`, `notifications`, v.v.
*   **Lưu ý khi update:** Trường `email` và `phone` bắt buộc phải là unique. Trường tọa độ cần lưu ý độ chính xác decimal.

### 2. Bảng `otp_verifications` — Xác thực OTP mã xác nhận
*   **Tên model (Prisma):** `OtpVerification`
*   **Chức năng chính:** Lưu trữ mã xác thực tạm thời để phục vụ xác nhận email khi đăng ký hoặc lấy lại mật khẩu.
*   **Các trường quan trọng:**
    *   `otp_code` (varchar): Mã xác thực (thường là 6 chữ số).
    *   `expires_at` (timestamp): Thời gian hết hạn của OTP.
    *   `user_id` (BigInt, Nullable): Liên kết đến user (nếu user đã tồn tại).
*   **Quan hệ:**
    *   Liên kết `N:1` với `users` (`onDelete: Cascade` - xóa tài khoản thì xóa luôn OTP).
*   **Lưu ý khi update:** `email` trong bảng này có ràng buộc `@unique`.

### 3. Bảng `admins` — Ban quản trị hệ thống
*   **Tên model (Prisma):** `Admin`
*   **Chức năng chính:** Lưu trữ tài khoản các quản trị viên có quyền quản lý hệ thống, kiểm duyệt chủ sân, đối soát tài chính và giải quyết tranh chấp.
*   **Các trường quan trọng:**
    *   `username`, `email` (Unique): Dùng để đăng nhập Admin Dashboard.
    *   `role` (varchar): Phân quyền nội bộ (SUPER_ADMIN, MODERATOR, SUPPORT).
*   **Quan hệ:**
    *   Liên kết `1:N` với `partner_profiles` (những đối tác được admin này duyệt).
    *   Liên kết `1:N` với `partner_commission_bills` (duyệt hóa đơn hoa hồng).
    *   Liên kết `1:N` với `disputes` (giải quyết khiếu nại).
*   **Lưu ý khi update:** Tách biệt hoàn toàn với bảng `users` để đảm bảo bảo mật phân quyền hệ thống.

### 4. Bảng `partner_profiles` — Hồ sơ Đối tác (Chủ sân)
*   **Tên model (Prisma):** `PartnerProfile`
*   **Chức năng chính:** Lưu trữ thông tin pháp nhân thương mại, cấu hình hoa hồng và ví tài chính của chủ sân đã được ban quản trị duyệt.
*   **Các trường quan trọng:**
    *   `user_id` (BigInt): Unique, liên kết trực tiếp `1:1` với tài khoản `users`.
    *   `business_license_url` (text): Đường dẫn ảnh giấy phép đăng ký kinh doanh.
    *   `commission_type` (varchar): Loại hình hoa hồng (`PERCENTAGE` hoặc `FIXED_AMOUNT`).
    *   `commission_rate` (Decimal): Tỷ lệ hoa hồng (%) sàn thu (áp dụng khi loại hình là PERCENTAGE).
    *   `commission_fixed_amount` (Decimal): Số tiền hoa hồng cố định thu trên mỗi đơn đặt (áp dụng khi loại hình là FIXED_AMOUNT).
    *   `balance` (Decimal): Số dư ví tích lũy của đối tác.
    *   `status` (varchar): Trạng thái đối tác (`PENDING`, `ACTIVE`, `REJECTED`, `SUSPENDED`).
    *   `approved_by` (BigInt): Admin thực hiện duyệt hồ sơ.
*   **Quan hệ:**
    *   Liên kết `1:1` với `users`.
    *   Liên kết `N:1` với `admins` (người duyệt).
    *   Liên kết `1:N` với `locations` (các cụm chi nhánh sân), `partner_commission_bills` (hóa đơn thanh toán hoa hồng hàng tháng), `promotions` (mã giảm giá riêng của sân).

---

## 🗺️ Nhóm 2: Địa Giới & Cơ Sở Kinh Doanh

### 5. Bảng `location_provinces` — Danh mục Tỉnh/Thành phố
*   **Tên model (Prisma):** `LocationProvince`
*   **Chức năng chính:** Lưu danh sách các Tỉnh/Thành phố của Việt Nam dùng để lọc tìm kiếm.
*   **Các trường quan trọng:**
    *   `province_code` (varchar): Mã code hành chính (Ví dụ: `01` - Hà Nội).
    *   `name`, `short_name` (varchar): Tên tỉnh/thành phố.
*   **Quan hệ:**
    *   Liên kết `1:N` với `location_wards`.

### 6. Bảng `location_wards` — Danh mục Quận/Huyện/Phường/Xã
*   **Tên model (Prisma):** `LocationWard`
*   **Chức năng chính:** Lưu chi tiết Quận/Huyện/Phường/Xã trực thuộc Tỉnh/Thành phố tương ứng.
*   **Các trường quan trọng:**
    *   `ward_code` (varchar): Mã hành chính xã/phường.
    *   `province_code` (varchar): Mã tỉnh thành liên kết.
*   **Quan hệ:**
    *   Liên kết `N:1` với `location_provinces` (`onDelete: Cascade`).

### 7. Bảng `locations` — Chi nhánh/Cụm sân bãi
*   **Tên model (Prisma):** `Location`
*   **Chức năng chính:** Lưu trữ địa điểm các chi nhánh sân của Đối tác. Một đối tác có thể sở hữu nhiều chi nhánh ở các địa chỉ khác nhau.
*   **Các trường quan trọng:**
    *   `partner_id` (BigInt): Đối tác sở hữu chi nhánh này.
    *   `ward`, `district`, `city` (varchar): Địa giới hành chính.
    *   `latitude`, `longitude` (Decimal): Tọa độ GPS phục vụ tính toán khoảng cách.
    *   `is_primary` (boolean): Đánh dấu chi nhánh chính.
*   **Quan hệ:**
    *   Liên kết `N:1` với `partner_profiles`.
    *   Liên kết `1:N` với `services` (các sân lẻ), `products` (dịch vụ đi kèm), `location_amenities` (bảng trung gian tiện ích).
*   **Lưu ý khi update:** Có Index địa lý `idx_locations_geo` để tối ưu câu lệnh truy vấn tìm sân gần đây.

### 8. Bảng `categories` — Môn thể thao / Loại hình dịch vụ
*   **Tên model (Prisma):** `Category`
*   **Chức năng chính:** Danh sách các môn thể thao hệ thống hỗ trợ (Cầu lông, Bóng đá, Pickleball, Tennis...). Định nghĩa màu sắc hiển thị trên Frontend.
*   **Các trường quan trọng:**
    *   `name` (varchar, Unique): Tên môn thể thao.
    *   `slug` (varchar, Unique): Đường dẫn thân thiện cho SEO.
    *   `icon` (varchar): Tên icon CSS/Lucide.
    *   `color_bg`, `color_text` (varchar): Mã CSS màu nền và màu chữ đại diện trên UI.
*   **Quan hệ:**
    *   Liên kết gián tiếp với bảng `services` thông qua giá trị chuỗi `category` khớp với `slug`.

### 9. Bảng `services` — Sân bãi chi tiết (Dịch vụ cho thuê)
*   **Tên model (Prisma):** `Service`
*   **Chức năng chính:** Đơn vị nhỏ nhất có thể cho thuê theo giờ (Ví dụ: Sân cầu lông số 1, Sân bóng đá cỏ nhân tạo A...).
*   **Các trường quan trọng:**
    *   `location_id` (BigInt): Thuộc chi nhánh nào.
    *   `category` (varchar): Slug môn thể thao (liên kết với `categories`).
    *   `base_price_per_hour` (Decimal): Đơn giá thuê cơ bản mỗi giờ.
    *   `image_urls` (Json): Mảng chứa danh sách link ảnh của sân.
*   **Quan hệ:**
    *   Liên kết `N:1` với `locations`.
    *   Liên kết `1:N` với `time_slots` (ca mặc định), `slot_overrides` (ca ngày đặc biệt), `bookings` (lịch sử đơn đặt), `match_posts` (ghép đội), `reviews` (đánh giá).

### 10. Bảng `amenities` — Danh mục Tiện ích
*   **Tên model (Prisma):** `Amenity`
*   **Chức năng chính:** Lưu danh sách các tiện ích sẵn có của sân (Wifi, Bãi đỗ xe, Căn tin, Tủ khóa đồ...).
*   **Quan hệ:**
    *   Liên kết `1:N` với `location_amenities` (bảng trung gian liên kết đến địa điểm).

### 11. Bảng `location_amenities` — Bảng liên kết Địa điểm - Tiện ích
*   **Tên model (Prisma):** `LocationAmenity`
*   **Chức năng chính:** Bảng trung gian liên kết mối quan hệ nhiều - nhiều (`N:N`) giữa Chi nhánh (`locations`) và Tiện ích (`amenities`).
*   **Trường khóa:**
    *   Khóa chính tổng hợp gồm `[location_id, amenity_id]`.
*   **Quan hệ:**
    *   Liên kết `N:1` với `locations` và `amenities`.

### 12. Bảng `products` — Dịch vụ bán kèm / Cho thuê phụ trợ
*   **Tên model (Prisma):** `Product`
*   **Chức năng chính:** Đồ ăn, nước uống hoặc dụng cụ thể thao bán kèm hoặc cho thuê trực tiếp tại chi nhánh (Ví dụ: Nước suối, Thuê vợt cầu lông).
*   **Các trường quan trọng:**
    *   `location_id` (BigInt): Cung cấp tại chi nhánh nào.
    *   `category` (varchar): Phân loại (`DRINK`, `FOOD`, `EQUIPMENT`...).
    *   `price` (Decimal): Đơn giá bán hoặc thuê.
*   **Quan hệ:**
    *   Liên kết `N:1` với `locations`.
    *   Liên kết `1:N` với `booking_details` (khi khách hàng chọn mua kèm trong hóa đơn).

---

## 📅 Nhóm 3: Lịch Trình & Bảng Giá

### 13. Bảng `time_slots` — Khung ca hoạt động mặc định hàng tuần
*   **Tên model (Prisma):** `TimeSlot`
*   **Chức năng chính:** Thiết lập khung ca hoạt động mặc định theo các thứ trong tuần cho từng sân và hệ số nhân giá (price modifier).
*   **Các trường quan trọng:**
    *   `service_id` (BigInt): Áp dụng cho sân nào.
    *   `day_of_week` (smallint): Thứ trong tuần (0 = Chủ Nhật -> 6 = Thứ Bảy).
    *   `start_time`, `end_time` (Time): Giờ ca bắt đầu và kết thúc.
    *   `price_modifier` (Decimal): Hệ số điều chỉnh giá (Ví dụ: ca tối giờ vàng x1.5, ca trưa vắng khách x0.8).
*   **Quan hệ:**
    *   Liên kết `N:1` với `services`.
*   **Lưu ý khi update:** Có ràng buộc `@unique([service_id, day_of_week, start_time])` để chống tạo trùng ca.

### 14. Bảng `slot_overrides` — Ghi đè ca ngày đặc biệt
*   **Tên model (Prisma):** `SlotOverride`
*   **Chức năng chính:** Dùng khi chủ sân muốn đóng cửa đột xuất (bảo trì) hoặc thay đổi hệ số giá cho các ngày lễ/Tết cụ thể (không theo lịch tuần mặc định).
*   **Các trường quan trọng:**
    *   `override_date` (Date): Ngày cụ thể áp dụng ghi đè.
    *   `is_closed` (boolean): Đánh dấu đóng sân (bảo trì/nghỉ lễ).
    *   `price_modifier` (Decimal): Hệ số giá riêng cho ngày này.
*   **Quan hệ:**
    *   Liên kết `N:1` với `services`.
*   **Lưu ý khi update:** Có ràng buộc `@unique([service_id, override_date, start_time])`. Thuật toán tìm kiếm lịch trống luôn kiểm tra bảng này trước bảng `time_slots`.

---

## 💳 Nhóm 4: Đặt Sân & Thanh Toán

### 15. Bảng `bookings` — Đơn đặt lịch chính
*   **Tên model (Prisma):** `Booking`
*   **Chức năng chính:** Bảng cốt lõi lưu trữ giao dịch giữ chỗ, thời gian chơi, tổng tiền và các trạng thái đơn đặt sân.
*   **Các trường quan trọng:**
    *   `booking_code` (varchar, Unique): Mã QR Check-in độc nhất khi khách đến sân.
    *   `booking_date` (Date), `start_time`, `end_time` (Time): Thời gian thuê sân.
    *   `base_price`, `discount_amount`, `final_price` (Decimal): Chi tiết dòng tiền.
    *   `status` (varchar): Trạng thái đơn (`PENDING` - Chờ thanh toán, `CONFIRMED` - Đã cọc/Xác nhận, `COMPLETED` - Đã chơi xong, `CANCELLED` - Đã hủy).
    *   `payment_status` (varchar): Trạng thái thanh toán (`UNPAID`, `DEPOSIT_PAID`, `FULLY_PAID`, `REFUNDED`).
*   **Quan hệ:**
    *   Liên kết `N:1` với `users` (khách đặt), `services` (sân được thuê), `promotions` (mã giảm giá áp dụng).
    *   Liên kết `1:N` với `booking_details` (sản phẩm đi kèm), `payments` (giao dịch tiền), `match_posts` (giao lưu ghép đội), `disputes` (tranh chấp).
    *   Liên kết `1:1` với `reviews` (đánh giá sau khi chơi).

### 16. Bảng `booking_details` — Sản phẩm mua kèm trong đơn
*   **Tên model (Prisma):** `BookingDetail`
*   **Chức năng chính:** Lưu danh sách và số lượng các sản phẩm đi kèm (nước uống, thuê dụng cụ) mà khách hàng đặt kèm theo ca chơi.
*   **Các trường quan trọng:**
    *   `quantity` (int): Số lượng mua/thuê.
    *   `price` (Decimal): Snapshot giá sản phẩm tại thời điểm mua (tránh bị lỗi sai lệch báo cáo khi chủ sân đổi giá sản phẩm ở bảng `Product` trong tương lai).
*   **Quan hệ:**
    *   Liên kết `N:1` với `bookings` và `products`.

### 17. Bảng `payments` — Lịch sử giao dịch tiền
*   **Tên model (Prisma):** `Payment`
*   **Chức năng chính:** Ghi nhận nhật ký dòng tiền thanh toán trực tuyến qua cổng thanh toán (MoMo, VNPAY...) hoặc tiền mặt làm căn cứ đối soát tài chính.
*   **Các trường quan trọng:**
    *   `transaction_id` (varchar): Mã giao dịch ngân hàng/cổng thanh toán trả về.
    *   `amount` (Decimal): Số tiền thực chuyển.
    *   `payment_method` (varchar): `VNPAY`, `MOMO`, `CASH`...
    *   `payment_type` (varchar): Phân loại giao dịch (`DEPOSIT` - Đặt cọc, `FULL_PAYMENT` - Trả đủ, `REFUND` - Hoàn tiền).
*   **Quan hệ:**
    *   Liên kết `N:1` với `bookings`.

### 18. Bảng `promotions` — Chương trình Khuyến mãi (Voucher)
*   **Tên model (Prisma):** `Promotion`
*   **Chức năng chính:** Quản lý các mã giảm giá. Có thể do Admin phát hành (áp dụng toàn sàn) hoặc do Đối tác tự phát hành (áp dụng riêng cho chi nhánh của họ).
*   **Các trường quan trọng:**
    *   `partner_id` (BigInt, Nullable): Nếu NULL = Mã toàn sàn; có giá trị = Mã riêng của chủ sân.
    *   `code` (varchar, Unique): Mã voucher nhập lúc thanh toán (Ví dụ: `DONGGIA50K`).
    *   `discount_percent` (Decimal): Tỷ lệ % giảm giá.
    *   `max_discount_amount` (Decimal, Nullable): Số tiền giảm tối đa.
    *   `usage_limit` (int): Giới hạn số lần sử dụng tối đa.
*   **Quan hệ:**
    *   Liên kết `N:1` với `partner_profiles`.
    *   Liên kết `1:N` với `bookings`, `user_promotions` (nhật ký dùng mã).

### 19. Bảng `user_promotions` — Nhật ký dùng mã giảm giá của Khách
*   **Tên model (Prisma):** `UserPromotion`
*   **Chức năng chính:** Lưu vết khách hàng nào đã dùng mã giảm giá nào để giới hạn số lần sử dụng của một cá nhân, tránh spam voucher.
*   **Quan hệ:**
    *   Liên kết `N:1` với `users` và `promotions`.

---

## 🤝 Nhóm 5: Ghép Đội & Cộng Đồng (Matchmaking)

### 20. Bảng `match_posts` — Tin tuyển người / Ghép đội giao lưu
*   **Tên model (Prisma):** `MatchPost`
*   **Chức năng chính:** Cho phép khách hàng đã thuê sân hoặc dự kiến chơi đăng tin tuyển thêm đồng đội hoặc tìm đội đá giao lưu.
*   **Các trường quan trọng:**
    *   `booking_id` (BigInt, Nullable): Liên kết đến đơn đặt sân (nếu chủ phòng đã đặt trước).
    *   `play_date` (Date), `start_time`, `end_time` (Time): Thời gian thi đấu.
    *   `skill_level` (varchar): Trình độ yêu cầu (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`...).
    *   `max_players`, `current_players` (int): Quy mô trận đấu và số người hiện tại.
    *   `status` (varchar): Trạng thái tin đăng (`OPEN`, `FULL`, `CANCELLED`, `EXPIRED`).
*   **Quan hệ:**
    *   Liên kết `N:1` với `users` (chủ phòng), `services` (sân đấu), `bookings`.
    *   Liên kết `1:N` với `match_participants` (ứng viên đăng ký).
    *   Liên kết `1:1` với `chat_rooms` (nhóm chat của trận đấu).

### 21. Bảng `match_participants` — Danh sách thành viên đăng ký ghép
*   **Tên model (Prisma):** `MatchParticipant`
*   **Chức năng chính:** Quản lý những người chơi khác xin tham gia trận đấu và trạng thái phê duyệt của chủ phòng.
*   **Các trường quan trọng:**
    *   `status` (varchar): Trạng thái duyệt (`PENDING` - Chờ duyệt, `JOINED` - Đã đồng ý, `REJECTED` - Từ chối).
    *   `note` (text): Lời nhắn gửi chủ phòng.
*   **Quan hệ:**
    *   Liên kết `N:1` với `match_posts` và `users`.
*   **Lưu ý khi update:** Có ràng buộc duy nhất `@@unique([match_post_id, user_id])` để ngăn một người gửi yêu cầu tham gia nhiều lần trên cùng một bài đăng.

---

## 💬 Nhóm 6: Chat & Giao Tiếp Thời Gian Thực

### 22. Bảng `chat_rooms` — Phòng chat
*   **Tên model (Prisma):** `ChatRoom`
*   **Chức năng chính:** Quản lý các phòng hội thoại trong hệ thống.
*   **Các trường quan trọng:**
    *   `type` (varchar): Phân loại phòng (`INDIVIDUAL` - Chat 1:1 giữa khách với chủ sân hoặc khách với nhau, `MATCH` - Phòng chat nhóm của trận đấu ghép đội).
    *   `match_post_id` (BigInt, Nullable): Liên kết đến tin ghép đội nếu là chat nhóm.
*   **Quan hệ:**
    *   Liên kết `1:1` với `match_posts`.
    *   Liên kết `1:N` với `chat_room_members` và `messages`.

### 23. Bảng `chat_room_members` — Thành viên phòng chat
*   **Tên model (Prisma):** `ChatRoomMember`
*   **Chức năng chính:** Lưu trữ danh sách những ai được quyền truy cập vào phòng chat nào.
*   **Các trường quan trọng:**
    *   `last_read_at` (timestamp): Thời điểm cuối cùng thành viên này mở xem phòng chat (phục vụ đếm tin nhắn chưa đọc).
*   **Quan hệ:**
    *   Liên kết `N:1` với `chat_rooms` và `users`.
*   **Lưu ý khi update:** Có ràng buộc duy nhất `@@unique([chat_room_id, user_id])`.

### 24. Bảng `messages` — Nội dung tin nhắn chi tiết
*   **Tên model (Prisma):** `Message`
*   **Chức năng chính:** Lưu trữ nội dung trao đổi thời gian thực giữa các thành viên.
*   **Các trường quan trọng:**
    *   `message_text` (text): Nội dung tin nhắn.
    *   `type` (varchar): Loại tin nhắn (`TEXT`, `IMAGE`, `SYSTEM` - Thông báo tự động của hệ thống).
    *   `attachments` (Json, Nullable): Lưu trữ URL ảnh/tệp đính kèm.
*   **Quan hệ:**
    *   Liên kết `N:1` với `chat_rooms` và `users` (sender).
*   **Lưu ý khi update:** Thiết lập index `idx_messages_room_time` trên `[chat_room_id, created_at]` để tối ưu tốc độ tải lịch sử chat.

---

## ⚖️ Nhóm 7: Hỗ Trợ & Tài Chính

### 25. Bảng `disputes` — Khiếu nại & Tranh chấp
*   **Tên model (Prisma):** `Dispute`
*   **Chức năng chính:** Ghi nhận các mâu thuẫn cần hỗ trợ hòa giải từ quản trị viên (Ví dụ: khách khiếu nại sân hỏng, chủ sân tự hủy lịch vô lý, đòi hoàn cọc...).
*   **Các trường quan trọng:**
    *   `booking_id` (BigInt): Đơn đặt sân phát sinh mâu thuẫn.
    *   `raised_by` (BigInt): Khách hàng tố cáo (plaintiff).
    *   `against_partner` (BigInt): Đối tác bị tố cáo (partner).
    *   `category` (varchar): Danh mục khiếu nại (`QUALITY`, `CANCELLATION`, `OVERCHARGE`, `NO_SHOW`, `OTHER`).
    *   `evidence_urls` (Json): Bằng chứng hình ảnh/video.
    *   `status` (varchar): Trạng thái xử lý (`OPEN`, `INVESTIGATING`, `RESOLVED`, `CLOSED`).
    *   `resolved_by` (BigInt): Admin chịu trách nhiệm xử lý.
*   **Quan hệ:**
    *   Liên kết `N:1` với `bookings`, `users` (raisedBy), `partner_profiles` (againstPartner), và `admins` (resolvedBy).

### 26. Bảng `partner_commission_bills` — Hóa đơn thu hoa hồng hàng tháng của Đối tác
*   **Tên model (Prisma):** `PartnerCommissionBill`
*   **Chức năng chính:** Quản lý hóa đơn thu phí hoa hồng hàng tháng do Admin gửi cho Đối tác để đối tác proactive thực hiện thanh toán cho hệ thống.
*   **Các trường quan trọng:**
    *   `partner_id` (BigInt): Liên kết tới đối tác phải trả hóa đơn.
    *   `bill_period` (Date): Kỳ hóa đơn tháng (ví dụ: ngày 1 hàng tháng).
    *   `total_bookings` (int): Tổng số đơn đặt sân được hoàn thành trong kỳ.
    *   `total_revenue` (Decimal): Tổng doanh thu mà đối tác thu được trong kỳ.
    *   `commission_amount` (Decimal): Tổng số tiền hoa hồng mà đối tác nợ và phải thanh toán cho hệ thống.
    *   `payment_evidence` (text): URL hình ảnh/bằng chứng chuyển khoản thanh toán hoa hồng do đối tác tải lên.
    *   `status` (varchar): Trạng thái hóa đơn (`UNPAID` - Chưa thanh toán, `PROCESSING` - Chờ kiểm duyệt minh chứng, `PAID` - Đã thanh toán, `OVERDUE` - Trễ hạn).
    *   `processed_by` (BigInt): Admin thực hiện duyệt và xác nhận thanh toán.
*   **Quan hệ:**
    *   Liên kết `N:1` với `partner_profiles` và `admins`.

### 27. Bảng `notifications` — Thông báo nội bộ
*   **Tên model (Prisma):** `Notification`
*   **Chức năng chính:** Lưu trữ thông báo gửi cho người dùng về tiến trình đặt sân, biến động số dư, tin tức ghép đội, giải quyết khiếu nại.
*   **Các trường quan trọng:**
    *   `type` (varchar): Phân loại (`BOOKING`, `PAYMENT`, `PROMOTION`, `SYSTEM`, `DISPUTE`).
    *   `related_id` (BigInt, Nullable): ID thực thể liên quan (Ví dụ: lưu `booking_id` để khi khách click vào thông báo sẽ tự động chuyển hướng đến chi tiết đơn đặt đó).
    *   `is_read` (boolean): Trạng thái đã đọc hay chưa.
*   **Quan hệ:**
    *   Liên kết `N:1` với `users`.

### 28. Bảng `reviews` — Đánh giá & Phản hồi chất lượng sân
*   **Tên model (Prisma):** `Review`
*   **Chức năng chính:** Lưu trữ đánh giá số sao (1-5 sao) và phản hồi của khách hàng sau khi chơi xong, cùng câu trả lời phản biện của chủ sân.
*   **Các trường quan trọng:**
    *   `booking_id` (BigInt, Unique): Đơn đặt sân được đánh giá (Mỗi đơn hàng chỉ được đánh giá 1 lần duy nhất).
    *   `rating` (smallint): Điểm số đánh giá từ 1 đến 5.
    *   `partner_reply` (text): Câu trả lời của chủ sân đối với nhận xét của khách.
*   **Quan hệ:**
    *   Liên kết `1:1` với `bookings`.
    *   Liên kết `N:1` với `users` (người viết), `services` (sân được đánh giá).

---

## ⚠️ Những Lưu Ý Quan Trọng Khi Cập Nhật Database (Update DB Guidelines)

Khi bạn tiến hành chỉnh sửa hoặc thêm bớt các cột/bảng trong file `schema.prisma`, hãy tuyệt đối ghi nhớ các quy tắc sau:

1.  **Kiểu Dữ Liệu `BigInt`:**
    *   Hầu hết các khóa chính (`id`) sử dụng kiểu `BigInt` để đảm bảo hệ thống có thể mở rộng lớn.
    *   *Lưu ý:* JavaScript không hỗ trợ tuần tự hóa (serialization) trực tiếp kiểu dữ liệu `BigInt` thành JSON. Do đó, ở phần Backend (NestJS), bạn phải cấu hình bộ chuyển đổi (Interceptor hoặc custom JSON stringify) để chuyển đổi `BigInt` thành `string` trước khi gửi về client.
2.  **Ràng Buộc Trực Quan Tọa Độ (GPS coordinates):**
    *   Trường `latitude` và `longitude` trong bảng `users` và `locations` sử dụng kiểu `Decimal` với độ chính xác lần lượt là `Decimal(10, 8)` (vĩ độ) và `Decimal(11, 8)` (kinh độ). Đảm bảo giữ nguyên cấu hình này để không làm mất độ chính xác khi tính khoảng cách sân gần đây.
3.  **Chiến Lược Xóa Dữ Liệu Ràng Buộc (`onDelete`):**
    *   `onDelete: Cascade`: Áp dụng cho các bảng phụ thuộc trực tiếp (Ví dụ: Xóa `User` -> Xóa sạch `OtpVerification`, `Booking`, `MatchParticipant`, `ChatRoomMember`).
    *   `onDelete: SetNull`: Áp dụng cho các khóa ngoại liên kết mang tính chất lịch sử hoặc theo dõi (Ví dụ: Khi xóa một mã `Promotion`, các đơn đặt `Booking` đã áp dụng mã đó sẽ chuyển `promo_id` về `NULL` chứ không bị xóa đơn; hoặc khi xóa tài khoản Admin, các đối tác được admin đó duyệt sẽ có trường `approved_by` chuyển về `NULL`).
4.  **Các Ràng Buộc Duy Nhất (Unique Constraints):**
    *   Khi cập nhật cơ chế ca đấu, hãy để ý các ràng buộc unique tổng hợp như `@@unique([serviceId, dayOfWeek, startTime])` ở `TimeSlot` và `@@unique([serviceId, overrideDate, startTime])` ở `SlotOverride`. Nếu thay đổi cấu trúc ca, bắt buộc phải cập nhật lại các ràng buộc này để tránh xung đột logic.
5.  **Dữ Liệu Nhạy Cảm (Snapshot dữ liệu):**
    *   Khi update DB, tránh gom các trường giá trị động và tĩnh. Ví dụ, trường `price` trong `BookingDetail` là **giá snapshot** tại thời điểm mua của sản phẩm. Việc này giúp giữ vững tính toàn vẹn tài chính ngay cả khi bảng `Product` cập nhật giá mới. Không được bỏ đi trường này.
6.  **Tạo File Migration Sau Khi Cập Nhật:**
    *   Sau khi sửa đổi file `schema.prisma`, hãy chạy lệnh sau ở terminal backend để đồng bộ hóa và tạo file migration mới:
        ```bash
        npx prisma migrate dev --name <ten_thay_doi_cua_ban>
        ```
