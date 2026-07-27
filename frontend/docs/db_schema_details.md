# 📊 Chi Tiết Các Bảng Cơ Sở Dữ Liệu (Database Schema Details)

Tài liệu này cung cấp mô tả chi tiết, đầy đủ và trực quan về cấu trúc toàn bộ **30 bảng** cơ sở dữ liệu (tương ứng với các model trong file [schema.prisma](file:///c:/xampp/htdocs/ME/BookingManagement/backend/prisma/schema.prisma)) của hệ thống đặt sân thể thao **BookingManagement** sử dụng cơ sở dữ liệu **PostgreSQL** thông qua **Prisma ORM**.

---

## 📌 Tóm Tắt 7 Nhóm Nghiệp Vụ Chính
Hệ thống cơ sở dữ liệu được chia làm 7 nhóm nghiệp vụ chính để dễ theo dõi và quản lý:
1. **Người dùng & Phân quyền** (4 bảng): `users`, `otp_verifications`, `admins`, `partner_profiles`
2. **Khu vực & Cơ sở Kinh doanh** (9 bảng): `location_provinces`, `location_wards`, `locations`, `categories`, `sports_pitches`, `amenities`, `location_amenities`, `products`, `product_categories`
3. **Lịch trình & Bảng giá** (2 bảng): `time_slots`, `slot_overrides`
4. **Đặt sân & Thanh toán** (5 bảng): `bookings`, `booking_details`, `payments`, `promotions`, `user_promotions`
5. **Ghép đội & Cộng đồng** (2 bảng): `match_posts`, `match_participants`
6. **Chat & Tin nhắn Real-time** (3 bảng): `chat_rooms`, `chat_room_members`, `messages`
7. **Hỗ trợ, Đánh giá & Đối soát** (5 bảng): `disputes`, `partner_commission_bills`, `notifications`, `reviews`, `admin_partner_messages`

---

## 👤 Nhóm 1: Người Dùng & Phân Quyền

### 1. Bảng `users` — Tài khoản người dùng hệ thống
*   **Chức năng chính:** Lưu trữ thông tin cá nhân của tất cả các tài khoản tham gia hệ thống (Khách hàng đặt sân lẻ và tài khoản đăng nhập của Đối tác/Chủ sân).
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng, định danh duy nhất người dùng. |
| `fullName` (`full_name`) | `String` | `varchar(255)` | `Not Null` | Họ và tên đầy đủ của người dùng. |
| `email` | `String` | `varchar(255)` | `@unique`, `Not Null` | Địa chỉ email độc nhất, dùng để đăng nhập và nhận thông tin hóa đơn. |
| `emailVerifiedAt` (`email_verified_at`) | `DateTime?` | `timestamp` | `Nullable` | Thời điểm email được xác thực bằng OTP. |
| `password` | `String` | `varchar(255)` | `Not Null` | Mật khẩu tài khoản đã được mã hóa (Bcrypt). |
| `phone` | `String?` | `varchar(20)` | `@unique`, `Nullable` | Số điện thoại liên hệ, nhận mã OTP. |
| `avatarUrl` (`avatar_url`) | `String?` | `text` | `Nullable` | Đường dẫn lưu ảnh đại diện (avatar) của người dùng. |
| `address` | `String?` | `text` | `Nullable` | Số nhà, tên đường cư trú của người dùng. |
| `ward` | `String?` | `varchar(100)` | `Nullable` | Phường/Xã cư trú. |
| `district` | `String?` | `varchar(100)` | `Nullable` | Quận/Huyện cư trú. |
| `city` | `String?` | `varchar(100)` | `Nullable` | Tỉnh/Thành phố cư trú. |
| `latitude` | `Decimal?` | `numeric(10, 8)` | `Nullable` | Vĩ độ GPS hiện tại (dùng để gợi ý sân đấu gần nhất). |
| `longitude` | `Decimal?` | `numeric(11, 8)` | `Nullable` | Kinh độ GPS hiện tại. |
| `loyaltyPoints` (`loyalty_points`) | `Int` | `integer` | `Default(0)` | Điểm tích lũy nhận được khi hoàn tất đặt sân dùng đổi voucher. |
| `isActive` (`is_active`) | `Boolean` | `boolean` | `Default(true)` | Trạng thái tài khoản (`true`: Hoạt động, `false`: Bị khóa do vi phạm). |
| `rememberToken` (`remember_token`) | `String?` | `varchar(100)` | `Nullable` | Token duy trì đăng nhập tự động khi người dùng tắt trình duyệt. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Thời gian đăng ký tài khoản. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Thời gian cập nhật thông tin lần cuối. |
| `birthDate` (`birth_date`) | `DateTime?` | `date` | `Nullable` | Ngày sinh. |
| `gender` | `String?` | `varchar(10)` | `Nullable` | Giới tính (`MALE`, `FEMALE`, `OTHER`). |
| `bio` | `String?` | `text` | `Nullable` | Đoạn giới thiệu ngắn về bản thân. |
| `favoriteSports` (`favorite_sports`) | `Json?` | `jsonb` | `Nullable` | Mảng chứa danh sách môn thể thao ưa thích (Ví dụ: `["football", "badminton"]`). |
| `skillLevels` (`skill_levels`) | `Json?` | `jsonb` | `Nullable` | Lưu trình độ của từng bộ môn (Ví dụ: `{"badminton": "ADVANCED"}`). |
| `preferredPlayTime` (`preferred_play_time`) | `Json?` | `jsonb` | `Nullable` | Khung giờ chơi ưu thích của người dùng. |

*   **Quan hệ:**
    *   `1:1` với `partner_profiles` (Chỉ những user đã đăng ký & duyệt làm chủ sân mới có hồ sơ này).
    *   `1:N` với `bookings`, `user_promotions`, `match_posts`, `match_participants`, `chat_room_members`, `messages`, `disputes`, `notifications`, `reviews`, `otp_verifications`.

---

### 2. Bảng `otp_verifications` — Xác thực OTP mã xác nhận
*   **Chức năng chính:** Lưu trữ mã OTP dùng để xác thực email khi đăng ký mới hoặc khi người dùng yêu cầu khôi phục mật khẩu.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `email` | `String` | `varchar(255)` | `@unique`, `Not Null` | Email đăng ký nhận OTP. |
| `otpCode` (`otp_code`) | `String` | `varchar(10)` | `Not Null` | Chuỗi mã OTP ngẫu nhiên (Ví dụ: `123456`). |
| `expiresAt` (`expires_at`) | `DateTime` | `timestamp` | `Not Null` | Thời điểm mã OTP hết hiệu lực (mặc định sau 5 phút). |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Thời điểm tạo mã OTP. |
| `userId` (`user_id`) | `BigInt?` | `bigint` | `Nullable` | Khóa ngoại liên kết tới bảng `users`. |

*   **Quan hệ:**
    *   `N:1` với `users` (`onDelete: Cascade` - khi xóa User sẽ tự động xóa bản ghi OTP liên quan).

---

### 3. Bảng `admins` — Ban quản trị hệ thống
*   **Chức năng chính:** Lưu tài khoản quản trị hệ thống có các đặc quyền như kiểm duyệt đối tác, đối soát hoa hồng, giải quyết khiếu nại, cấu hình danh mục.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `username` | `String` | `varchar(50)` | `@unique`, `Not Null` | Tên đăng nhập Admin độc nhất (Ví dụ: `admin_root`). |
| `email` | `String` | `varchar(255)` | `@unique`, `Not Null` | Email của quản trị viên. |
| `password` | `String` | `varchar(255)` | `Not Null` | Mật khẩu Admin đã băm. |
| `fullName` (`full_name`) | `String?` | `varchar(255)` | `Nullable` | Họ và tên đầy đủ của admin. |
| `role` | `String` | `varchar(20)` | `Default("MODERATOR")` | Phân quyền Admin (`SUPER_ADMIN`, `MODERATOR`, `SUPPORT`). |
| `isActive` (`is_active`) | `Boolean` | `boolean` | `Default(true)` | Trạng thái hoạt động của tài khoản Admin. |
| `lastLogin` (`last_login`) | `DateTime?` | `timestamp` | `Nullable` | Thời điểm cuối cùng tài khoản Admin này đăng nhập hệ thống. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Thời gian tạo tài khoản. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Thời gian cập nhật tài khoản lần cuối. |

*   **Quan hệ:**
    *   `1:N` với `partner_profiles` (các đối tác do admin này phê duyệt).
    *   `1:N` với `partner_commission_bills` (các hóa đơn hoa hồng do admin này xử lý).
    *   `1:N` với `disputes` (các khiếu nại do admin này trực tiếp giải quyết).

---

### 4. Bảng `partner_profiles` — Hồ sơ Đối tác (Chủ sân)
*   **Chức năng chính:** Lưu thông tin pháp lý, cấu hình phí hoa hồng và ví tài chính của những người dùng đăng ký kinh doanh cung cấp dịch vụ sân bãi trên hệ thống.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `userId` (`user_id`) | `BigInt` | `bigint` | `@unique`, `Not Null` | Khóa ngoại liên kết duy nhất `1:1` tới bảng `users`. |
| `businessName` (`business_name`) | `String` | `varchar(255)` | `Not Null` | Tên hộ kinh doanh hoặc công ty sở hữu sân. |
| `taxCode` (`tax_code`) | `String?` | `varchar(50)` | `Nullable` | Mã số thuế doanh nghiệp/cá nhân kinh doanh. |
| `businessLicenseUrl` (`business_license_url`) | `String?` | `text` | `Nullable` | URL ảnh chụp giấy phép đăng ký kinh doanh. |
| `commissionRate` (`commission_rate`) | `Decimal` | `numeric(5, 2)` | `Default(10.00)` | Tỷ lệ phần trăm hoa hồng nền tảng thu từ mỗi đơn đặt (Ví dụ: `10.00` = 10%). |
| `commissionType` (`commission_type`) | `String` | `varchar(20)` | `Default("PERCENTAGE")` | Hình thức thu hoa hồng (`PERCENTAGE` - theo %, `FIXED_AMOUNT` - số tiền cố định). |
| `commissionFixedAmount` (`commission_fixed_amount`) | `Decimal` | `numeric(12, 2)` | `Default(0.00)` | Số tiền hoa hồng cố định thu trên mỗi lượt đặt sân. |
| `balance` | `Decimal` | `numeric(15, 2)` | `Default(0.00)` | Số dư ví tài chính của đối tác dùng để đối soát/rút tiền. |
| `status` | `String` | `varchar(20)` | `Default("PENDING")` | Trạng thái hồ sơ (`PENDING` - Chờ duyệt, `ACTIVE` - Đã duyệt, `REJECTED`, `SUSPENDED` - Tạm dừng). |
| `approvedBy` (`approved_by`) | `BigInt?` | `bigint` | `Nullable` | Khóa ngoại liên kết tới Admin xử lý phê duyệt hồ sơ. |
| `bankName` (`bank_name`) | `String?` | `varchar(100)` | `Nullable` | Tên ngân hàng thụ hưởng nhận tiền rút. |
| `bankAccountNumber` (`bank_account_number`) | `String?` | `varchar(50)` | `Nullable` | Số tài khoản ngân hàng thụ hưởng. |
| `bankAccountName` (`bank_account_name`) | `String?` | `varchar(100)` | `Nullable` | Tên chủ tài khoản ngân hàng thụ hưởng (viết hoa không dấu). |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày đối tác tạo hồ sơ đăng ký. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Ngày cập nhật hồ sơ gần nhất. |

*   **Quan hệ:**
    *   `N:1` với `admins` (`onDelete: SetNull` - Xóa admin thì trường `approvedBy` chuyển về `null`).
    *   `1:1` với `users` (`onDelete: Cascade` - Xóa user thì xóa luôn hồ sơ đối tác).
    *   `1:N` với `locations`, `commissionBills`, `disputes`, `promotions`, `adminPartnerMessages`, `productCategories`.

---

## 🗺️ Nhóm 2: Khu Vực & Cơ Sở Kinh Doanh

### 5. Bảng `location_provinces` — Danh mục Tỉnh/Thành phố
*   **Chức năng chính:** Lưu trữ danh sách phân vùng hành chính cấp Tỉnh/Thành phố trực thuộc Trung ương của Việt Nam phục vụ việc tìm kiếm chi nhánh.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `provinceCode` (`province_code`) | `String` | `varchar(2)` | `@unique`, `Not Null` | Mã hành chính chuẩn của tỉnh/thành (Ví dụ: `79` - TP. Hồ Chí Minh). |
| `name` | `String` | `varchar(255)` | `Not Null` | Tên đầy đủ (Ví dụ: Thành phố Hồ Chí Minh). |
| `shortName` (`short_name`) | `String` | `varchar(255)` | `Not Null` | Tên rút gọn (Ví dụ: Hồ Chí Minh). |
| `code` | `String` | `varchar(5)` | `@unique`, `Not Null` | Ký hiệu mã hóa viết tắt. |
| `placeType` (`place_type`) | `String` | `varchar(255)` | `Not Null` | Phân loại hành chính (`Tỉnh`, `Thành phố Trung ương`). |
| `country` | `String` | `varchar(10)` | `Default("VN")` | Mã quốc gia. |
| `slug` | `String?` | `varchar(255)` | `Nullable` | Chuỗi slug tối ưu cho SEO URL (Ví dụ: `ho-chi-minh`). |
| `image` | `String?` | `varchar(255)` | `Nullable` | Ảnh đại diện của Tỉnh/Thành phố. |

*   **Quan hệ:**
    *   `1:N` với `location_wards` (một Tỉnh/Thành có nhiều Quận/Huyện/Xã).

---

### 6. Bảng `location_wards` — Danh mục Xã/Phường/Quận/Huyện
*   **Chức năng chính:** Lưu trữ chi tiết địa phận hành chính cấp dưới (Quận/Huyện/Xã/Phường) trực thuộc các tỉnh để làm dữ liệu chuẩn cho phần nhập địa chỉ chi nhánh.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `wardCode` (`ward_code`) | `String` | `varchar(6)` | `@unique`, `Not Null` | Mã code hành chính xã/phường/thị trấn. |
| `name` | `String` | `varchar(255)` | `Not Null` | Tên đầy đủ của xã/phường/thị trấn. |
| `provinceCode` (`province_code`) | `String` | `varchar(2)` | `Not Null` | Khóa ngoại liên kết mã Tỉnh/Thành trực thuộc. |

*   **Quan hệ:**
    *   `N:1` với `location_provinces` (`onDelete: Cascade`).

---

### 7. Bảng `locations` — Chi nhánh/Cụm sân bãi
*   **Chức năng chính:** Lưu các địa điểm hoạt động (cơ sở/chi nhánh) của Đối tác. Một đối tác có thể sở hữu một hoặc nhiều cụm sân ở các địa điểm khác nhau.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `partnerId` (`partner_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới hồ sơ đối tác `partner_profiles`. |
| `name` | `String` | `varchar(255)` | `Not Null` | Tên đại diện chi nhánh (Ví dụ: SportZone Quận 7). |
| `address` | `String` | `text` | `Not Null` | Địa chỉ cụ thể (Số nhà, tên đường). |
| `ward` | `String?` | `varchar(100)` | `Nullable` | Phường/Xã của chi nhánh. |
| `district` | `String?` | `varchar(100)` | `Nullable` | Quận/Huyện của chi nhánh. |
| `city` | `String?` | `varchar(100)` | `Nullable` | Tỉnh/Thành phố của chi nhánh. |
| `latitude` | `Decimal?` | `numeric(10, 8)` | `Nullable` | Vĩ độ định vị GPS để tìm kiếm địa điểm trên bản đồ. |
| `longitude` | `Decimal?` | `numeric(11, 8)` | `Nullable` | Kinh độ định vị GPS. |
| `contactPhone` (`contact_phone`) | `String?` | `varchar(20)` | `Nullable` | Số điện thoại hotline riêng của chi nhánh này. |
| `imageUrl` (`image_url`) | `String?` | `text` | `Nullable` | URL ảnh chụp toàn cảnh chi nhánh sân. |
| `isActive` (`is_active`) | `Boolean` | `boolean` | `Default(true)` | Trạng thái hoạt động chi nhánh (`true`: Hoạt động, `false`: Tạm đóng cửa). |
| `isPrimary` (`is_primary`) | `Boolean` | `boolean` | `Default(false)` | Đánh dấu chi nhánh chính/trụ sở chính của đối tác. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày khởi tạo chi nhánh. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Ngày cập nhật thông tin gần nhất. |

*   **Quan hệ:**
    *   `N:1` với `partner_profiles` (`onDelete: Cascade` - Xóa đối tác thì tự động xóa toàn bộ chi nhánh).
    *   `1:N` với `sportsPitches` (các sân đấu trực thuộc chi nhánh này), `products` (dịch vụ bán kèm), `locationAmenities` (tiện ích).

---

### 8. Bảng `categories` — Danh mục Môn thể thao
*   **Chức năng chính:** Chứa danh sách các bộ môn thể thao được hỗ trợ đặt trên toàn hệ thống (Bóng đá, Cầu lông, Pickleball, Tennis...).
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `name` | `String` | `varchar(255)` | `@unique`, `Not Null` | Tên môn thể thao (Ví dụ: Cầu lông). |
| `slug` | `String` | `varchar(255)` | `@unique`, `Not Null` | Slug của môn dùng làm link URL tìm kiếm (Ví dụ: `cau-long`). |
| `icon` | `String` | `varchar(255)` | `Default("fa-medal")` | Tên icon Lucide/FontAwesome để hiển thị ở Frontend UI. |
| `colorBg` (`color_bg`) | `String` | `varchar(255)` | `Default("bg-emerald-100")` | Mã màu CSS đại diện nền danh mục (phục vụ UX/UI đẹp mắt). |
| `colorText` (`color_text`) | `String` | `varchar(255)` | `Default("text-emerald-600")` | Mã màu CSS chữ đại diện danh mục. |
| `isActive` (`is_active`) | `Boolean` | `boolean` | `Default(true)` | Trạng thái hiển thị môn thể thao này trên trang chủ. |
| `sortOrder` (`sort_order`) | `Int` | `integer` | `Default(0)` | Thứ tự ưu tiên sắp xếp khi hiển thị danh sách môn. |

---

### 9. Bảng `sports_pitches` — Sân bãi chi tiết (Dịch vụ cho thuê lẻ)
*   **Chức năng chính:** Lưu trữ thông tin chi tiết từng sân chơi lẻ trong một cụm chi nhánh. Đây là đối tượng trực tiếp được thuê (Ví dụ: Sân cầu lông số 1, Sân bóng đá số 5).
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `locationId` (`location_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới chi nhánh `locations`. |
| `name` | `String` | `varchar(255)` | `Not Null` | Tên định danh của sân (Ví dụ: Sân số 1). |
| `category` | `String` | `varchar(30)` | `Not Null` | Slug bộ môn thể thao (Phân loại liên kết đến bảng `categories`). |
| `subType` (`sub_type`) | `String?` | `varchar(50)` | `Nullable` | Cấu hình phụ của sân (Ví dụ: Sân đất nện, Sân trong nhà, Sân 5 người...). |
| `description` | `String?` | `text` | `Nullable` | Mô tả các lưu ý, quy định riêng đối với sân này. |
| `basePricePerHour` (`base_price_per_hour`) | `Decimal` | `numeric(12, 2)` | `Not Null` | Đơn giá cho thuê tiêu chuẩn của sân trong 1 giờ. |
| `imageUrls` (`image_urls`) | `Json?` | `jsonb` | `Nullable` | Mảng chứa danh sách các ảnh chụp cận cảnh của sân đấu. |
| `isActive` (`is_active`) | `Boolean` | `boolean` | `Default(true)` | Trạng thái cho phép đặt sân này (`true`: Cho đặt, `false`: Tạm khóa/Sửa chữa). |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày khai báo sân. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Ngày cập nhật thông tin sân. |

*   **Quan hệ:**
    *   `N:1` với `locations` (`onDelete: Cascade` - Xóa chi nhánh sẽ tự động gỡ bộ toàn bộ các sân trực thuộc).
    *   `1:N` với `timeSlots` (bảng ca hoạt động mặc định), `slotOverrides` (ca ngày nghỉ/lễ), `bookings` (lịch sử đặt sân này), `matchPosts` (các bài đăng ghép đôi tại sân), `reviews` (phản hồi khách hàng).

---

### 10. Bảng `amenities` — Tiện ích của sân
*   **Chức năng chính:** Lưu trữ danh sách các tiện ích mở rộng có tại cụm sân (Wifi miễn phí, Bãi đỗ xe ô tô, Tủ khóa đồ, Nhà tắm...).
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `name` | `String` | `varchar(255)` | `@unique`, `Not Null` | Tên tiện ích (Ví dụ: Có Wifi). |
| `icon` | `String?` | `varchar(255)` | `Nullable` | Tên icon hiển thị đại diện. |

*   **Quan hệ:**
    *   `1:N` với `locationAmenities` (Bảng trung gian ánh xạ liên kết tiện ích đến địa điểm).

---

### 11. Bảng `location_amenities` — Bảng liên kết Địa điểm - Tiện ích
*   **Chức năng chính:** Bảng trung gian giải quyết quan hệ Nhiều - Nhiều (`N:N`) giữa bảng Địa điểm cụm sân (`locations`) và bảng Tiện ích (`amenities`).
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `locationId` (`location_id`) | `BigInt` | `bigint` | `@id`, Khóa ngoại | Mã địa điểm cụm sân được trang bị tiện ích. |
| `amenityId` (`amenity_id`) | `BigInt` | `bigint` | `@id`, Khóa ngoại | Mã tiện ích được trang bị cho địa điểm. |

*   **Quan hệ:**
    *   Liên kết kép làm khóa chính tổng hợp `[locationId, amenityId]`.
    *   `N:1` với `locations` và `amenities` (`onDelete: Cascade` cho cả hai khóa ngoại).

---

### 12. Bảng `products` — Dịch vụ bán kèm / Cho thuê phụ trợ
*   **Chức năng chính:** Lưu danh sách các mặt hàng (đồ ăn, nước uống) hoặc dụng cụ thể thao bán/cho thuê trực tiếp tại chi nhánh (Ví dụ: Nước suối, thuê vợt...).
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `locationId` (`location_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới chi nhánh `locations`. |
| `name` | `String` | `varchar(255)` | `Not Null` | Tên sản phẩm/dịch vụ (Ví dụ: Nước uống Revive). |
| `category` | `String` | `varchar(50)` | `Default("DRINK")` | Phân loại sản phẩm (`DRINK` - Nước, `FOOD` - Đồ ăn, `EQUIPMENT` - Vợt/Giày thuê...). |
| `description` | `String?` | `text` | `Nullable` | Mô tả ngắn về sản phẩm. |
| `price` | `Decimal` | `numeric(12, 2)` | `Not Null` | Đơn giá bán hoặc đơn giá thuê trên một lượt ca. |
| `imageUrl` (`image_url`) | `String?` | `text` | `Nullable` | URL hình ảnh minh họa sản phẩm. |
| `isAvailable` (`is_available`) | `Boolean` | `boolean` | `Default(true)` | Trạng thái còn hàng hoặc còn sẵn phục vụ tại chi nhánh. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày tạo sản phẩm. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Ngày cập nhật thông tin sản phẩm. |

*   **Quan hệ:**
    *   `N:1` với `locations` (`onDelete: Cascade`).
    *   `1:N` với `bookingDetails` (các chi tiết đơn hàng chọn mua kèm sản phẩm này).

---

### 13. Bảng `product_categories` — Danh mục sản phẩm đối tác
*   **Chức năng chính:** Lưu trữ cấu trúc nhóm/phân mục sản phẩm tự định nghĩa riêng của từng Đối tác để họ quản lý kho hàng khoa học hơn.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `partnerId` (`partner_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới `partner_profiles`. |
| `name` | `String` | `varchar(100)` | `Not Null` | Tên danh mục (Ví dụ: Nhóm vợt cho thuê cao cấp). |
| `icon` | `String?` | `varchar(50)` | `Default("📦")` | Icon đại diện danh mục. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày tạo danh mục. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Ngày cập nhật danh mục. |

*   **Quan hệ:**
    *   `N:1` với `partner_profiles` (`onDelete: Cascade`).

---

## 📅 Nhóm 3: Lịch Trình & Bảng Giá

### 14. Bảng `time_slots` — Khung ca hoạt động mặc định hàng tuần
*   **Chức năng chính:** Thiết lập thời gian các ca hoạt động cố định lặp lại theo tuần cho từng sân và hệ số nhân giá điều chỉnh theo giờ cao điểm/thấp điểm.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `sportsPitchId` (`sports_pitch_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới sân `sports_pitches`. |
| `dayOfWeek` (`day_of_week`) | `Int` | `smallint` | `Not Null` | Ngày trong tuần, kiểu số hành chính (`0` = Chủ Nhật -> `6` = Thứ Bảy). |
| `startTime` (`start_time`) | `DateTime` | `time` | `Not Null` | Giờ ca bắt đầu hoạt động (Ví dụ: `17:00:00`). |
| `endTime` (`end_time`) | `DateTime` | `time` | `Not Null` | Giờ ca kết thúc hoạt động (Ví dụ: `18:30:00`). |
| `priceModifier` (`price_modifier`) | `Decimal` | `numeric(3, 2)` | `Default(1.00)` | Hệ số nhân giá ca chơi này (Ví dụ: `1.50` cho khung giờ tối cao điểm). |
| `isAvailable` (`is_available`) | `Boolean` | `boolean` | `Default(true)` | Trạng thái hiển thị ca chơi cho phép khách hàng đặt. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày tạo ca mặc định. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Ngày cập nhật ca. |

*   **Ràng buộc Unique:**
    *   Có ràng buộc `@unique([sportsPitchId, dayOfWeek, startTime])` giúp chặn tạo trùng lắp khung giờ khởi điểm của ca chơi của cùng một sân trong cùng một thứ.
*   **Quan hệ:**
    *   `N:1` với `sports_pitches` (`onDelete: Cascade`).

---

### 15. Bảng `slot_overrides` — Ghi đè ca ngày đặc biệt
*   **Chức năng chính:** Dùng khi đối tác cần đóng cửa sân tạm thời (để bảo trì, nghỉ Tết...) hoặc tăng/giảm giá thuê vào một ngày ngày lễ Dương/Âm lịch cụ thể mà không làm đổi cấu trúc ca lặp tuần mặc định.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `sportsPitchId` (`sports_pitch_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới sân `sports_pitches`. |
| `overrideDate` (`override_date`) | `DateTime` | `date` | `Not Null` | Ngày dương lịch cụ thể áp dụng ghi đè (Ví dụ: `2026-09-02`). |
| `startTime` (`start_time`) | `DateTime?` | `time` | `Nullable` | Giờ bắt đầu ca ghi đè (nếu ghi đè theo ca cụ thể). |
| `endTime` (`end_time`) | `DateTime?` | `time` | `Nullable` | Giờ kết thúc ca ghi đè. |
| `priceModifier` (`price_modifier`) | `Decimal` | `numeric(3, 2)` | `Default(1.00)` | Hệ số nhân giá áp dụng riêng cho ca/ngày ghi đè này (Ví dụ: x2.0 ngày Tết). |
| `isClosed` (`is_closed`) | `Boolean` | `boolean` | `Default(false)` | Đánh dấu đóng cửa ngưng phục vụ ca chơi/ngày chơi này (`true`: Đóng sân). |
| `reason` | `String?` | `varchar(255)` | `Nullable` | Lý do ghi đè (Ví dụ: Bảo dưỡng lưới căng bóng). |

*   **Ràng buộc Unique:**
    *   Ràng buộc `@unique([sportsPitchId, overrideDate, startTime])`.
*   **Quan hệ:**
    *   `N:1` với `sports_pitches` (`onDelete: Cascade`).

---

## 💳 Nhóm 4: Đặt Sân & Thanh Toán

### 16. Bảng `bookings` — Đơn đặt lịch chính
*   **Chức năng chính:** Ghi nhận lịch sử đặt sân của người dùng, thời gian sử dụng cụ thể, giá thuê, hoa hồng nền tảng và quản lý trạng thái của đơn hàng.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `bookingCode` (`booking_code`) | `String` | `varchar(20)` | `@unique`, `Not Null` | Mã QR code đặt lịch độc nhất cho khách làm thủ tục check-in tại sân. |
| `userId` (`user_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới tài khoản đặt sân `users`. |
| `sportsPitchId` (`sports_pitch_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới sân được thuê `sports_pitches`. |
| `promoId` (`promo_id`) | `BigInt?` | `bigint` | `Nullable` | Khóa ngoại mã giảm giá áp dụng cho đơn `promotions`. |
| `bookingDate` (`booking_date`) | `DateTime` | `date` | `Not Null` | Ngày thuê chơi thực tế. |
| `startTime` (`start_time`) | `DateTime` | `time` | `Not Null` | Giờ bắt đầu chơi. |
| `endTime` (`end_time`) | `DateTime` | `time` | `Not Null` | Giờ kết thúc chơi. |
| `basePrice` (`base_price`) | `Decimal` | `numeric(12, 2)` | `Not Null` | Giá thuê gốc (chưa áp dụng mã giảm giá hay phụ phí). |
| `discountAmount` (`discount_amount`) | `Decimal` | `numeric(12, 2)` | `Default(0.00)` | Số tiền được giảm giá qua voucher khuyến mãi. |
| `finalPrice` (`final_price`) | `Decimal` | `numeric(12, 2)` | `Not Null` | Giá trị thực tế khách phải trả cho đơn đặt sân này. |
| `commissionType` (`commission_type`) | `String` | `varchar(20)` | `Default("PERCENTAGE")` | Hình thức thu hoa hồng ghi nhận tại thời điểm đặt (Snapshot của Đối tác). |
| `commissionRate` (`commission_rate`) | `Decimal?` | `numeric(5, 2)` | `Nullable` | Phần trăm hoa hồng ghi nhận lúc đặt sân. |
| `commissionFixedAmount` (`commission_fixed_amount`) | `Decimal?` | `numeric(12, 2)` | `Nullable` | Số tiền hoa hồng cố định ghi nhận lúc đặt sân. |
| `commissionAmount` (`commission_amount`) | `Decimal` | `numeric(12, 2)` | `Default(0.00)` | Số tiền hoa hồng sàn thu được từ đơn đặt sân này (hệ thống tự động tính). |
| `status` | `String` | `varchar(20)` | `Default("PENDING")` | Trạng thái đơn hàng (`PENDING` - Chờ trả tiền, `CONFIRMED` - Đã xác nhận/đặt cọc, `COMPLETED` - Đã chơi xong, `CANCELLED` - Đã hủy). |
| `paymentStatus` (`payment_status`) | `String` | `varchar(20)` | `Default("UNPAID")` | Trạng thái ví tiền đơn (`UNPAID` - Chưa cọc, `DEPOSIT_PAID` - Đã đặt cọc, `FULLY_PAID` - Đã trả đủ, `REFUNDED` - Đã hoàn cọc do hủy hợp lệ). |
| `cancellationReason` (`cancellation_reason`) | `String?` | `text` | `Nullable` | Lý do hủy đơn (từ khách hàng hoặc từ chủ sân). |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày giao dịch đặt sân được tạo. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Ngày cập nhật đơn đặt. |

*   **Quan hệ:**
    *   `N:1` với `users` (`onDelete: Cascade`), `sports_pitches` (`onDelete: Cascade`), `promotions` (`onDelete: SetNull` - Xóa voucher không ảnh hưởng đến dữ liệu hóa đơn lịch sử đặt).
    *   `1:N` với `bookingDetails` (các sản phẩm nước uống đi kèm), `payments` (các đợt chuyển khoản cọc/hoàn), `matchPosts` (bài giao lưu kết nối), `disputes` (tố tụng tranh chấp).
    *   `1:1` với `reviews` (đánh giá dịch vụ).

---

### 17. Bảng `booking_details` — Sản phẩm dịch vụ mua kèm
*   **Chức năng chính:** Lưu danh sách các vật phẩm mua thêm hoặc thuê thêm đi kèm trong hóa đơn ca chơi (Ví dụ: Nước khoáng, Vợt thuê).
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `bookingId` (`booking_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới đơn đặt `bookings`. |
| `productId` (`product_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới sản phẩm `products`. |
| `quantity` | `Int` | `integer` | `Default(1)` | Số lượng sản phẩm mua/thuê. |
| `price` | `Decimal` | `numeric(12, 2)` | `Not Null` | Giá snapshot tại thời điểm mua (Tránh bị sai lệch doanh thu khi chủ sân thay đổi giá niêm yết trong tương lai). |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày mua. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Ngày cập nhật. |

*   **Quan hệ:**
    *   `N:1` với `bookings` (`onDelete: Cascade` - Xóa đơn đặt sân thì xóa sạch chi tiết hàng kèm), `products` (`onDelete: Cascade`).

---

### 18. Bảng `payments` — Lịch sử giao dịch tiền
*   **Chức năng chính:** Lưu nhật ký thanh toán thực tế của khách thông qua các cổng thanh toán online hoặc giao dịch tiền mặt tại sân, phục vụ tra soát.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `bookingId` (`booking_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới đơn đặt `bookings`. |
| `transactionId` (`transaction_id`) | `String?` | `varchar(255)` | `Nullable` | Mã giao dịch ngân hàng hoặc mã đối tác cổng thanh toán trả về (Ví dụ: mã giao dịch Momo/VNPAY). |
| `amount` | `Decimal` | `numeric(12, 2)` | `Not Null` | Số tiền giao dịch thực tế của đợt thanh toán này. |
| `paymentMethod` (`payment_method`) | `String?` | `varchar(20)` | `Nullable` | Phương thức thanh toán (`VNPAY`, `MOMO`, `CASH`, `BANK_TRANSFER`...). |
| `paymentType` (`payment_type`) | `String` | `varchar(20)` | `Not Null` | Loại hình thanh toán (`DEPOSIT` - Trả cọc, `FULL_PAYMENT` - Trả đủ, `REFUND` - Hoàn tiền). |
| `status` | `String` | `varchar(20)` | `Default("PENDING")` | Trạng thái giao dịch (`PENDING` - Chờ xử lý, `SUCCESS` - Thành công, `FAILED` - Thất bại). |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày giờ phát sinh giao dịch. |

*   **Quan hệ:**
    *   `N:1` với `bookings` (`onDelete: Cascade`).

---

### 19. Bảng `promotions` — Chương trình Khuyến mãi (Voucher)
*   **Chức năng chính:** Quản lý các voucher giảm giá. Có hai cấp độ voucher: mã của toàn sàn phát hành bởi Admin (`partnerId` = `null`) hoặc mã giảm giá riêng của từng chi nhánh phát hành bởi Đối tác.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `partnerId` (`partner_id`) | `BigInt?` | `bigint` | `Nullable` | Khóa ngoại liên kết `partner_profiles` (Nếu `null` là voucher dùng cho mọi sân trên hệ thống). |
| `code` | `String` | `varchar(50)` | `@unique`, `Not Null` | Mã ký tự voucher người dùng nhập vào (Ví dụ: `BANHMIOSUGAR`). |
| `description` | `String?` | `text` | `Nullable` | Mô tả chi tiết thể lệ, quy định áp dụng của voucher. |
| `discountPercent` (`discount_percent`) | `Decimal` | `numeric(5, 2)` | `Default(0.00)` | Tỷ lệ giảm giá theo phần trăm (Ví dụ: `15.00` = Giảm 15%). |
| `maxDiscountAmount` (`max_discount_amount`) | `Decimal?` | `numeric(12, 2)` | `Nullable` | Số tiền được chiết khấu tối đa đối với các mã áp dụng tỉ lệ phần trăm. |
| `minOrderValue` (`min_order_value`) | `Decimal` | `numeric(12, 2)` | `Default(0.00)` | Giá trị tối thiểu của đơn đặt sân để có thể sử dụng voucher. |
| `startDate` (`start_date`) | `DateTime` | `timestamp` | `Not Null` | Thời điểm voucher bắt đầu có hiệu lực. |
| `endDate` (`end_date`) | `DateTime` | `timestamp` | `Not Null` | Thời điểm voucher hết hạn sử dụng. |
| `usageLimit` (`usage_limit`) | `Int` | `integer` | `Default(0)` | Số lượng voucher được phát hành tối đa (Ví dụ: `100` lượt). |
| `usedCount` (`used_count`) | `Int` | `integer` | `Default(0)` | Số lượt voucher đã thực tế được áp dụng thành công. |

*   **Quan hệ:**
    *   `N:1` với `partner_profiles` (`onDelete: Cascade`).
    *   `1:N` với `bookings` (các đơn hàng dùng mã này), `userPromotions` (danh sách khách hàng áp dụng).

---

### 20. Bảng `user_promotions` — Nhật ký dùng mã giảm giá của Khách
*   **Chức năng chính:** Ghi lại lịch sử người dùng cụ thể đã sử dụng mã giảm giá nào nhằm phục vụ việc giới hạn số lần sử dụng của một người dùng, tránh lạm dụng mã.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `userId` (`user_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới `users`. |
| `promotionId` (`promotion_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới `promotions`. |
| `usedAt` (`used_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày giờ người dùng này sử dụng mã giảm giá này. |

*   **Quan hệ:**
    *   `N:1` với `users` (`onDelete: Cascade`), `promotions` (`onDelete: Cascade`).

---

## 🤝 Nhóm 5: Ghép Đội & Cộng Đồng (Matchmaking)

### 21. Bảng `match_posts` — Tin tuyển người / Ghép đội giao lưu
*   **Chức năng chính:** Cho phép các chủ sân (người đã thuê sân) đăng thông tin tìm kiếm thêm người chơi vãng lai hoặc rủ giao lưu thi đấu thể thao.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `userId` (`user_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới người đăng tin (Chủ phòng - `users`). |
| `sportsPitchId` (`sports_pitch_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới sân đấu dự kiến giao lưu `sports_pitches`. |
| `bookingId` (`booking_id`) | `BigInt?` | `bigint` | `Nullable` | Khóa ngoại liên kết tới đơn đặt sân `bookings` (nếu chủ phòng đã thuê sân trước). |
| `title` | `String` | `varchar(255)` | `Not Null` | Tiêu đề của tin đăng ghép đôi (Ví dụ: "Tìm 2 bạn nam đánh cầu lông tối nay"). |
| `description` | `String?` | `text` | `Nullable` | Nội dung mô tả chi tiết yêu cầu, phân chia chi phí tiền sân. |
| `playDate` (`play_date`) | `DateTime` | `date` | `Not Null` | Ngày chơi giao lưu. |
| `startTime` (`start_time`) | `DateTime` | `time` | `Not Null` | Giờ bắt đầu trận giao lưu. |
| `endTime` (`end_time`) | `DateTime` | `time` | `Not Null` | Giờ kết thúc trận giao lưu. |
| `skillLevel` (`skill_level`) | `String` | `varchar(20)` | `Default("ANY")` | Trình độ mong muốn (`ANY` - Mọi trình độ, `BEGINNER`, `INTERMEDIATE`, `ADVANCED`). |
| `maxPlayers` (`max_players`) | `Int` | `integer` | `Not Null` | Tổng số lượng người chơi mong muốn tham gia. |
| `currentPlayers` (`current_players`) | `Int` | `integer` | `Default(1)` | Số người hiện tại đã tham gia trong nhóm. |
| `status` | `String` | `varchar(20)` | `Default("OPEN")` | Trạng thái tin đăng (`OPEN` - Đang tuyển, `FULL` - Đã đủ người, `CANCELLED` - Đã hủy, `EXPIRED` - Hết hạn). |

*   **Quan hệ:**
    *   `N:1` với `users` (`onDelete: Cascade`), `sports_pitches` (`onDelete: Cascade`), `bookings` (`onDelete: SetNull`).
    *   `1:N` với `participants` (danh sách người đăng ký ghép).
    *   `1:1` với `chatRoom` (Phòng trò chuyện riêng của nhóm chơi).

---

### 22. Bảng `match_participants` — Danh sách thành viên đăng ký ghép
*   **Chức năng chính:** Quản lý danh sách các thành viên khác đăng ký ứng tuyển tham gia vào bài đăng ghép đội và trạng thái chấp thuận của chủ phòng.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `matchPostId` (`match_post_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới bài đăng ghép `match_posts`. |
| `userId` (`user_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới người xin tham gia `users`. |
| `status` | `String` | `varchar(20)` | `Default("PENDING")` | Trạng thái duyệt (`PENDING` - Chờ duyệt, `JOINED` - Đã duyệt tham gia, `REJECTED` - Từ chối). |
| `note` | `String?` | `text` | `Nullable` | Lời chào, mô tả trình độ bản thân của người tham gia gửi chủ phòng. |

*   **Ràng buộc Unique:**
    *   Có ràng buộc duy nhất `@@unique([matchPostId, userId])` để ngăn một người xin tham gia nhiều lần vào cùng một bài đăng.
*   **Quan hệ:**
    *   `N:1` với `match_posts` (`onDelete: Cascade`), `users` (`onDelete: Cascade`).

---

## 💬 Nhóm 6: Chat & Giao Tiếp Thời Gian Thực

### 23. Bảng `chat_rooms` — Phòng chat
*   **Chức năng chính:** Quản lý các phòng hội thoại để trao đổi nhắn tin trực tuyến thời gian thực giữa các thành viên.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `type` | `String` | `varchar(20)` | `Default("INDIVIDUAL")` | Loại phòng chat (`INDIVIDUAL` - Hội thoại 1:1, `MATCH` - Hội thoại nhóm của trận đấu ghép đội). |
| `matchPostId` (`match_post_id`) | `BigInt?` | `bigint` | `@unique`, `Nullable` | Khóa ngoại liên kết tới bài đăng ghép nếu là loại chat nhóm `MATCH`. |
| `name` | `String?` | `varchar(255)` | `Nullable` | Tên phòng chat (dành cho chat nhóm). |

*   **Quan hệ:**
    *   `1:1` với `match_posts` (`onDelete: Cascade` - Gỡ bài đăng ghép thì xóa luôn phòng chat nhóm).
    *   `1:N` với `members` (các thành viên phòng), `messages` (nội dung tin nhắn).

---

### 24. Bảng `chat_room_members` — Thành viên phòng chat
*   **Chức năng chính:** Lưu danh sách các thành viên được quyền tham gia gửi và nhận tin nhắn trong phòng chat nào.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `chatRoomId` (`chat_room_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới phòng chat `chat_rooms`. |
| `userId` (`user_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới người dùng `users`. |
| `lastReadAt` (`last_read_at`) | `DateTime?` | `timestamp` | `Nullable` | Thời điểm gần nhất người dùng này mở xem phòng chat (phục vụ tính năng hiển thị tin nhắn chưa đọc). |

*   **Ràng buộc Unique:**
    *   Có ràng buộc `@@unique([chatRoomId, userId])` nhằm chống việc trùng lặp thành viên trong một phòng chat.
*   **Quan hệ:**
    *   `N:1` với `chat_rooms` (`onDelete: Cascade`), `users` (`onDelete: Cascade`).

---

### 25. Bảng `messages` — Nội dung tin nhắn chi tiết
*   **Chức năng chính:** Lưu trữ chi tiết nội dung tin nhắn trao đổi thời gian thực giữa các thành viên.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `chatRoomId` (`chat_room_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới phòng chat `chat_rooms`. |
| `senderId` (`sender_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới tài khoản người gửi `users`. |
| `messageText` (`message_text`) | `String` | `text` | `Not Null` | Nội dung văn bản tin nhắn. |
| `type` | `String` | `varchar(20)` | `Default("TEXT")` | Phân loại định dạng tin nhắn (`TEXT` - Văn bản thường, `IMAGE` - Ảnh gửi kèm, `SYSTEM` - Thông báo hệ thống). |
| `attachments` | `Json?` | `jsonb` | `Nullable` | Mảng JSON chứa link các tệp, hình ảnh gửi kèm. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Thời gian gửi tin nhắn. |

*   **Quan hệ:**
    *   `N:1` với `chat_rooms` (`onDelete: Cascade`), `users` (`onDelete: Cascade`).

---

## ⚖️ Nhóm 7: Hỗ Trợ, Đánh Giá & Tài Chính

### 26. Bảng `disputes` — Khiếu nại & Tranh chấp
*   **Chức năng chính:** Lưu trữ thông tin khiếu nại phát sinh từ người dùng tố cáo chất lượng chi nhánh hoặc đối tác đòi giải quyết quyền lợi hoàn cọc ca đặt.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `bookingId` (`booking_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới đơn đặt sân xảy ra tranh chấp `bookings`. |
| `raisedBy` (`raised_by`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại người nộp đơn khiếu nại (Nguyên đơn - `users`). |
| `againstPartner` (`against_partner`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại đối tác bị khiếu nại (Bị đơn - `partner_profiles`). |
| `category` | `String` | `varchar(30)` | `Not Null` | Phân loại mâu thuẫn (`QUALITY` - Chất lượng sân kém, `CANCELLATION` - Chủ tự hủy lịch, `OVERCHARGE` - Thu sai giá, `NO_SHOW` - Sân không mở, `OTHER`). |
| `description` | `String` | `text` | `Not Null` | Mô tả chi tiết diễn biến sự việc bị mâu thuẫn. |
| `evidenceUrls` (`evidence_urls`) | `Json?` | `jsonb` | `Nullable` | Lưu danh sách URL chứa ảnh chụp/video làm bằng chứng. |
| `status` | `String` | `varchar(20)` | `Default("OPEN")` | Trạng thái xử lý đơn (`OPEN` - Mới nhận, `INVESTIGATING` - Đang xác minh, `RESOLVED` - Đã giải quyết, `CLOSED` - Đóng đơn). |
| `resolution` | `String?` | `text` | `Nullable` | Văn bản kết luận và hướng giải quyết xử lý đền bù từ quản trị viên. |
| `resolvedBy` (`resolved_by`) | `BigInt?` | `bigint` | `Nullable` | Admin chịu trách nhiệm kiểm duyệt hỗ trợ và giải quyết khiếu nại. |
| `resolvedAt` (`resolved_at`) | `DateTime?` | `timestamp` | `Nullable` | Thời điểm hoàn tất giải quyết khiếu nại. |

*   **Quan hệ:**
    *   `N:1` với `bookings` (`onDelete: Cascade`), `users` (`onDelete: Cascade`), `partner_profiles` (`onDelete: Cascade`), `admins` (`onDelete: SetNull`).

---

### 27. Bảng `partner_commission_bills` — Hóa đơn hoa hồng đối tác
*   **Chức năng chính:** Hóa đơn đối soát doanh thu và tiền hoa hồng định kỳ (hàng tháng) mà Đối tác có nghĩa vụ phải thanh toán lại cho nền tảng.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `partnerId` (`partner_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới đối tác đóng phí `partner_profiles`. |
| `billCode` (`bill_code`) | `String` | `varchar(50)` | `@unique`, `Not Null` | Mã hóa đơn đối soát độc nhất (Ví dụ: `BILL-202607-PARTNER01`). |
| `totalBookingsCount` (`total_bookings_count`) | `Int` | `integer` | `Default(0)` | Số lượng lượt đặt sân hoàn thành thành công trong kỳ đối soát. |
| `totalRevenue` (`total_revenue`) | `Decimal` | `numeric(15, 2)` | `Default(0.00)` | Tổng doanh thu đối tác thu được từ khách hàng trong kỳ đối soát. |
| `commissionAmount` (`commission_amount`) | `Decimal` | `numeric(15, 2)` | `Default(0.00)` | Số tiền hoa hồng đối tác nợ nền tảng (Ví dụ: 10% của `totalRevenue`). |
| `periodStart` (`period_start`) | `DateTime` | `date` | `Not Null` | Ngày bắt đầu tính kỳ đối soát. |
| `periodEnd` (`period_end`) | `DateTime` | `date` | `Not Null` | Ngày kết thúc tính kỳ đối soát. |
| `dueDate` (`due_date`) | `DateTime` | `date` | `Not Null` | Hạn chót đối tác phải hoàn thành thanh toán tiền hoa hồng. |
| `status` | `String` | `varchar(20)` | `Default("UNPAID")` | Trạng thái thanh toán của hóa đơn (`UNPAID` - Chưa thanh toán, `PROCESSING` - Chờ kiểm duyệt minh chứng chuyển tiền, `PAID` - Đã nộp tiền thành công, `OVERDUE` - Trễ hạn nộp). |
| `paymentEvidenceUrl` (`payment_evidence_url`) | `String?` | `text` | `Nullable` | URL ảnh chụp hóa đơn/bằng chứng giao dịch chuyển tiền do đối tác tải lên. |
| `processedBy` (`processed_by`) | `BigInt?` | `bigint` | `Nullable` | Quản trị viên (Admin) chịu trách nhiệm kiểm tra đối chiếu tiền nộp và phê duyệt hóa đơn. |
| `processedAt` (`processed_at`) | `DateTime?` | `timestamp` | `Nullable` | Thời điểm Admin xác thực đã nhận được tiền. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày lập hóa đơn hoa hồng tự động. |
| `updatedAt` (`updated_at`) | `DateTime` | `timestamp` | `UpdatedAt` | Ngày cập nhật hóa đơn. |

*   **Quan hệ:**
    *   `N:1` với `partner_profiles` (`onDelete: Cascade`), `admins` (`onDelete: SetNull`).

---

### 28. Bảng `notifications` — Thông báo nội bộ
*   **Chức năng chính:** Lưu trữ và hiển thị các thông báo tới tài khoản người dùng về tiến độ đơn hàng, biến động số dư, tin nhắn mới, sự kiện ghép phòng, duyệt đối tác.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `userId` (`user_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại người nhận thông báo `users`. |
| `title` | `String` | `varchar(255)` | `Not Null` | Tiêu đề thông báo (Ví dụ: "Đặt sân thành công"). |
| `message` | `String` | `text` | `Not Null` | Chi tiết nội dung thông báo. |
| `type` | `String` | `varchar(20)` | `Not Null` | Thể loại tin (`BOOKING` - Đặt sân, `PAYMENT` - Tiền, `SYSTEM` - Hệ thống, `DISPUTE` - Tranh chấp, `PROMOTION` - Ưu đãi). |
| `relatedId` (`related_id`) | `BigInt?` | `bigint` | `Nullable` | ID thực thể liên quan (Ví dụ: lưu `bookingId` để khi click thông báo tự chuyển hướng về chi tiết ca đặt đó). |
| `isRead` (`is_read`) | `Boolean` | `boolean` | `Default(false)` | Đánh dấu trạng thái người dùng đã mở xem thông báo hay chưa. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày tạo thông báo. |

*   **Quan hệ:**
    *   `N:1` với `users` (`onDelete: Cascade`).

---

### 29. Bảng `reviews` — Đánh giá chất lượng sân
*   **Chức năng chính:** Lưu các đánh giá phản hồi (số sao, cảm nghĩ) của khách hàng sau khi hoàn tất sử dụng sân đấu và câu trả lời phản hồi từ phía chủ sân.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `bookingId` (`booking_id`) | `BigInt` | `bigint` | `@unique`, `Not Null` | Khóa ngoại độc nhất liên kết với đơn đặt `bookings` (Mỗi hóa đơn chỉ được đánh giá 1 lần duy nhất). |
| `userId` (`user_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại tài khoản người thực hiện đánh giá `users`. |
| `sportsPitchId` (`sports_pitch_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết sân được đánh giá `sports_pitches`. |
| `rating` | `Int` | `smallint` | `Not Null` | Điểm số sao đánh giá (từ 1 đến 5 sao). |
| `comment` | `String?` | `text` | `Nullable` | Cảm nghĩ, góp ý chi tiết của người dùng về sân bãi. |
| `images` | `Json?` | `jsonb` | `Nullable` | Danh sách chứa các URL hình ảnh do khách đính kèm review. |
| `partnerReply` (`partner_reply`) | `String?` | `text` | `Nullable` | Phản hồi phản biện giải thích từ phía chủ cụm sân. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày giờ gửi đánh giá. |

*   **Quan hệ:**
    *   `1:1` với `bookings` (`onDelete: Cascade`).
    *   `N:1` với `users` (`onDelete: Cascade`), `sports_pitches` (`onDelete: Cascade`).

---

### 30. Bảng `admin_partner_messages` — Hội thoại Admin - Đối tác
*   **Chức năng chính:** Nhật ký nhắn tin liên lạc nội bộ để giải đáp thắc mắc và xử lý nghiệp vụ giữa quản trị viên và Đối tác chủ sân.
*   **Chi tiết các trường dữ liệu:**

| Tên Trường (DB Map) | Kiểu Dữ Liệu (Prisma) | Kiểu Dữ Liệu (PostgreSQL) | Ràng buộc / Mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BigInt` | `bigint` | `@id`, `Autoincrement` | Khóa chính tự tăng. |
| `partnerId` (`partner_id`) | `BigInt` | `bigint` | `Not Null` | Khóa ngoại liên kết tới đối tác `partner_profiles`. |
| `senderType` (`sender_type`) | `String` | `varchar(20)` | `Not Null` | Phân loại vai trò người gửi tin (`ADMIN` hoặc `PARTNER`). |
| `senderId` (`sender_id`) | `BigInt` | `bigint` | `Not Null` | ID của người gửi (Admin ID hoặc User ID của Đối tác). |
| `messageText` (`message_text`) | `String` | `text` | `Not Null` | Nội dung văn bản tin nhắn. |
| `createdAt` (`created_at`) | `DateTime` | `timestamp` | `Default(now())` | Ngày gửi tin nhắn. |

*   **Quan hệ:**
    *   `N:1` với `partner_profiles` (`onDelete: Cascade`).
