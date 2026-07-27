# 🚀 Local Booking & Community Platform (BookingManagement)

Chào mừng bạn đến với tài liệu hướng dẫn kỹ thuật, đặc tả cơ sở dữ liệu chi tiết và luồng hoạt động của dự án **BookingManagement**. Đây là một nền tảng chuyên nghiệp hỗ trợ tìm kiếm và đặt lịch sân bãi thể thao (Cầu lông, Bóng đá, Pickleball, Tennis, Bơi lội, Bóng rổ, Bóng chuyền), đặt kèm các sản phẩm dịch vụ phụ trợ tại sân, ghép đội giao lưu vãng lai và trò chuyện thời gian thực.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### 🎨 Frontend (Client-side)
*   **React 19** + **TypeScript** + **Vite** (Khởi chạy cực nhanh).
*   **Tailwind CSS** (Thiết kế giao diện hiện đại, responsive mượt mà).
*   **Socket.io Client** (Xử lý giao tiếp Real-time với Backend).
*   **Lucide React** (Bộ icons chất lượng cao).

### ⚙️ Backend (Server-side & Database)
*   **NestJS** (Framework Node.js mạnh mẽ, cấu trúc modular vững chắc như Laravel).
*   **Prisma ORM** (Công cụ tương tác database an toàn về kiểu dữ liệu).
*   **PostgreSQL** (Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, hiệu năng cao).
*   **Socket.io (WebSockets)** (Xử lý kết nối và đồng bộ dữ liệu thời gian thực).

---

## 📊 Kiến Trúc Cơ Sở Dữ Liệu (Database Schema)

Hệ thống được thiết kế với **29 bảng** cơ sở dữ liệu, chia làm **7 nhóm nghiệp vụ** chính, có mối quan hệ ràng buộc chặt chẽ nhằm đảm bảo tính toàn vẹn dữ liệu và hiệu năng tối ưu.

### 1. Sơ đồ Quan hệ Thực thể (ERD - Mermaid Diagram)

```mermaid
erDiagram
    users ||--o| partner_profiles : "1:1 user_id"
    partner_profiles ||--o| locations : "1:N partner_id"
    locations ||--o| services : "1:N location_id"
    locations ||--o| products : "1:N location_id"
    services ||--o| time_slots : "1:N service_id"
    services ||--o| slot_overrides : "1:N service_id"
    services ||--o| bookings : "1:N service_id"
    users ||--o| bookings : "1:N user_id"
    bookings ||--o| payments : "1:N booking_id"
    bookings ||--o| booking_details : "1:N booking_id"
    products ||--o| booking_details : "1:N product_id"
    users ||--o| match_posts : "1:N user_id"
    services ||--o| match_posts : "1:N service_id"
    bookings ||--o| match_posts : "1:1 booking_id"
    match_posts ||--o| match_participants : "1:N match_post_id"
    users ||--o| match_participants : "1:N user_id"
    match_posts ||--o| chat_rooms : "1:1 match_post_id"
    chat_rooms ||--o| chat_room_members : "1:N chat_room_id"
    users ||--o| chat_room_members : "1:N user_id"
    chat_rooms ||--o| messages : "1:N chat_room_id"
    users ||--o| messages : "1:N sender_id"
    users ||--o| disputes : "1:N user_id"
    partner_profiles ||--o| partner_commission_bills : "1:N partner_id"
    admins ||--o| partner_commission_bills : "1:N processed_by"
    admins ||--o| partner_profiles : "1:N approved_by"
```

---

### 2. Từ Điển Cơ Sở Dữ Liệu Chi Tiết (Detailed Database Dictionary)

Dưới đây là đặc tả chi tiết của từng trường (field), kiểu dữ liệu, các ràng buộc và vai trò hoạt động của từng cột trong tất cả các bảng dữ liệu.

---

#### 👤 Nhóm 1: Người dùng & Phân quyền

##### 1. Bảng `users` — Khách hàng & Tài khoản hệ thống
Bảng trung tâm lưu trữ thông tin của người dùng đăng ký ứng dụng, bao gồm cả Khách hàng và Đối tác trước khi được duyệt.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Mã số định danh duy nhất của người dùng |
| `full_name` | varchar(255) | Not Null | Họ và tên đầy đủ của người dùng |
| `email` | varchar(255) | Unique, Not Null | Email dùng để đăng nhập và nhận thông tin |
| `email_verified_at` | timestamp | Nullable | Thời điểm email được kích hoạt xác thực |
| `password` | varchar(255) | Not Null | Mật khẩu tài khoản đã mã hóa bằng Bcrypt |
| `phone` | varchar(20) | Unique, Nullable | Số điện thoại dùng để liên lạc hoặc xác thực OTP |
| `avatar_url` | text | Nullable | Đường dẫn URL của ảnh đại diện người dùng |
| `address` | text | Nullable | Địa chỉ chi tiết (Số nhà, ngõ, tên đường) |
| `ward` | varchar(100) | Nullable | Tên Phường/Xã cư trú |
| `district` | varchar(100) | Nullable | Tên Quận/Huyện cư trú |
| `city` | varchar(100) | Nullable | Tên Tỉnh/Thành phố cư trú |
| `latitude` | decimal(10,8) | Nullable, Index `idx_users_location` | Vĩ độ GPS dùng để tính toán khoảng cách sân gần nhất |
| `longitude` | decimal(11,8) | Nullable, Index `idx_users_location` | Kinh độ GPS dùng để tính toán khoảng cách sân gần nhất |
| `loyalty_points` | int | Default: 0 | Điểm thưởng tích lũy dùng để đổi khuyến mãi hoặc ưu đãi |
| `is_active` | boolean | Default: true (1) | Trạng thái tài khoản (true = Đang hoạt động, false = Bị khóa) |
| `remember_token` | varchar(100) | Nullable | Token duy trì trạng thái đăng nhập tự động |
| `created_at` | timestamp | Nullable | Thời điểm đăng ký tài khoản |
| `updated_at` | timestamp | Nullable | Thời điểm cập nhật thông tin tài khoản gần nhất |

##### 2. Bảng `admins` — Ban quản trị nền tảng
Lưu trữ thông tin các tài khoản quản trị hệ thống có thẩm quyền kiểm duyệt đối tác, xử lý tranh chấp và quản lý hạ tầng dữ liệu.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Mã số định danh quản trị viên |
| `username` | varchar(50) | Unique, Not Null | Tên đăng nhập của quản trị viên trên Admin Panel |
| `email` | varchar(255) | Unique, Not Null | Email liên hệ chính của quản trị viên |
| `password` | varchar(255) | Not Null | Mật khẩu đã mã hóa của admin |
| `full_name` | varchar(255) | Nullable | Họ tên đầy đủ của quản trị viên |
| `role` | varchar(20) | Default: 'MODERATOR' | Phân quyền: `SUPER_ADMIN` (Toàn quyền), `MODERATOR` (Kiểm duyệt), `SUPPORT` (Hỗ trợ) |
| `is_active` | boolean | Default: true | Trạng thái hoạt động của tài khoản admin |
| `last_login` | timestamp | Nullable | Thời điểm cuối cùng tài khoản admin này đăng nhập hệ thống |
| `created_at` | timestamp | Nullable | Thời điểm tạo tài khoản admin |
| `updated_at` | timestamp | Nullable | Thời điểm sửa thông tin tài khoản admin |

##### 3. Bảng `partner_profiles` — Hồ sơ Đối tác (Chủ sân)
Bảng liên kết 1-1 với `users` lưu giữ thông tin tư cách pháp nhân và dòng tài chính của các đơn vị ký kết cung cấp sân bãi trên sàn.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Mã định danh hồ sơ đối tác |
| `user_id` | bigint | Unique, FK (`users`) | Liên kết 1-1 đến tài khoản user làm chủ sân |
| `business_name` | varchar(255) | Not Null | Tên thương hiệu kinh doanh hoặc tên doanh nghiệp |
| `tax_code` | varchar(50) | Nullable | Mã số thuế của hộ kinh doanh hoặc doanh nghiệp |
| `business_license_url`| text | Nullable | URL ảnh chụp/file đính kèm giấy chứng nhận ĐKKD |
| `commission_type` | varchar(20) | Default: 'PERCENTAGE' | Loại hình hoa hồng: `PERCENTAGE` hoặc `FIXED_AMOUNT` |
| `commission_rate` | decimal(5,2) | Default: 10.00 | Phần trăm phí hoa hồng sàn thu trên mỗi đơn đặt lịch thành công (nếu là PERCENTAGE) |
| `commission_fixed_amount` | decimal(12,2) | Default: 0.00 | Số tiền hoa hồng cố định thu trên mỗi lượt đặt lịch (nếu là FIXED_AMOUNT) |
| `balance` | decimal(15,2) | Default: 0.00 | Số dư ví tích lũy của đối tác |
| `status` | varchar(20) | Default: 'PENDING' | Trạng thái hồ sơ: `PENDING` (Chờ duyệt), `ACTIVE` (Hoạt động), `REJECTED` (Từ chối), `SUSPENDED` (Đang khóa) |
| `approved_by` | bigint | Nullable, FK (`admins`) | ID của admin đã duyệt hồ sơ này |
| `created_at` | timestamp | Nullable | Thời điểm đăng ký làm đối tác |
| `updated_at` | timestamp | Nullable | Thời điểm cập nhật trạng thái hoặc thông tin đối tác |

---

#### 🗺️ Nhóm 2: Địa giới & Cơ sở Kinh doanh

##### 4. Bảng `location_provinces` — Danh mục Tỉnh/Thành phố
Lưu trữ danh sách Tỉnh/Thành phố trực thuộc trung ương của Việt Nam được chuẩn hóa từ nguồn dữ liệu hành chính quốc gia.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh hệ thống của tỉnh |
| `province_code` | varchar(2) | Unique, Not Null | Mã code chuẩn tỉnh thành (Ví dụ: `01` cho Hà Nội, `79` cho TP.HCM) |
| `name` | varchar(255) | Not Null | Tên đầy đủ của Tỉnh/Thành phố (Ví dụ: Thành phố Hà Nội) |
| `short_name` | varchar(255) | Not Null | Tên ngắn gọn (Ví dụ: Hà Nội) |
| `code` | varchar(5) | Unique, Not Null | Mã số đại diện tỉnh |
| `place_type` | varchar(255) | Not Null | Cấp hành chính (Ví dụ: Trung ương, Tỉnh) |
| `country` | varchar(10) | Default: 'VN' | Mã quốc gia mặc định Việt Nam |
| `slug` | varchar(255) | Nullable | Đường dẫn URL thân thiện cho SEO của tỉnh thành |
| `image` | varchar(255) | Nullable | Hình ảnh đại diện đặc trưng của Tỉnh/Thành phố |

##### 5. Bảng `location_wards` — Danh mục Quận/Huyện/Phường/Xã
Danh mục đơn vị hành chính cấp dưới liên kết trực tiếp với Tỉnh/Thành phố để phục vụ lọc tìm kiếm chính xác.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh hệ thống của xã/phường |
| `ward_code` | varchar(6) | Unique, Not Null | Mã code chuẩn hành chính phường xã |
| `name` | varchar(255) | Not Null | Tên đầy đủ phường xã/quận huyện liên kết |
| `province_code` | varchar(2) | FK (`location_provinces`), Index | Thuộc mã tỉnh thành nào |

##### 6. Bảng `locations` — Chi nhánh kinh doanh của Đối tác
Các cụm sân, cơ sở kinh doanh cụ thể thuộc quyền sở hữu của Đối tác, có vị trí GPS cố định và liên kết địa giới chuẩn.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh chi nhánh kinh doanh |
| `partner_id` | bigint | FK (`partner_profiles`), Not Null | Chi nhánh này thuộc sở hữu của chủ sân nào |
| `name` | varchar(255) | Not Null | Tên chi nhánh cụ thể (Ví dụ: Sân cầu lông Victory Quận 7) |
| `address` | text | Not Null | Số nhà, ngõ ngách, tên đường cụ thể của chi nhánh |
| `ward` | varchar(100) | Nullable | Phường/Xã hành chính nơi chi nhánh tọa lạc |
| `district` | varchar(100) | Nullable, Index `idx_locations_city_district` | Quận/Huyện phục vụ lọc vị trí |
| `city` | varchar(100) | Nullable, Index `idx_locations_city_district` | Tỉnh/Thành phố phục vụ lọc vị trí |
| `latitude` | decimal(10,8) | Nullable, Index `idx_locations_geo` | Vĩ độ GPS của chi nhánh |
| `longitude` | decimal(11,8) | Nullable, Index `idx_locations_geo` | Kinh độ GPS của chi nhánh |
| `contact_phone` | varchar(20) | Nullable | Số điện thoại liên hệ trực tiếp tại quầy của chi nhánh |
| `is_active` | boolean | Default: true | Trạng thái chi nhánh (true = Đang mở cửa kinh doanh, false = Đóng cửa) |
| `is_primary` | boolean | Default: false | Đánh dấu chi nhánh chính/trụ sở chính của Đối tác đó |
| `created_at` | timestamp | Nullable | Thời điểm chi nhánh được khởi tạo trên bản đồ |
| `updated_at` | timestamp | Nullable | Thời điểm cập nhật dữ liệu chi nhánh |

##### 7. Bảng `categories` — Danh mục Môn thể thao / Loại hình
Bảng tra cứu loại hình hoạt động thể thao hệ thống hỗ trợ, định nghĩa các thuộc tính màu sắc và biểu tượng trên giao diện.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Mã số danh mục |
| `name` | varchar(255) | Unique, Not Null | Tên loại hình (Ví dụ: Cầu lông, Bóng đá, Pickleball) |
| `slug` | varchar(255) | Unique, Not Null | Đường dẫn URL thân thiện (Ví dụ: `cau-long`, `bong-da`) |
| `icon` | varchar(255) | Default: 'fa-medal' | Tên class biểu tượng FontAwesome tương ứng |
| `color_bg` | varchar(255) | Default: 'bg-emerald-100' | Class CSS màu nền hiển thị danh mục trên UI |
| `color_text` | varchar(255) | Default: 'text-emerald-600' | Class CSS màu chữ hiển thị danh mục trên UI |
| `is_active` | boolean | Default: true | Trạng thái khả dụng (Khóa/Mở danh mục môn thể thao này) |
| `sort_order` | int | Default: 0 | Thứ tự ưu tiên hiển thị trên trang chủ (Sắp xếp tăng dần) |

##### 8. Bảng `services` — Dịch vụ cụ thể (Sân lẻ / Phòng lẻ)
Đơn vị nhỏ nhất có thể cho thuê theo giờ tại mỗi chi nhánh (Ví dụ: Sân số 1, Sân số 2, Studio A...).
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Mã định danh dịch vụ (sân lẻ) |
| `location_id` | bigint | FK (`locations`), Not Null | Dịch vụ này nằm trong chi nhánh cụ thể nào |
| `name` | varchar(255) | Not Null | Tên cụ thể của sân (Ví dụ: Sân số 3 cỏ nhân tạo) |
| `category` | varchar(30) | Not Null, Index `idx_services_category` | Khớp với slug của bảng `categories` (Bóng đá, Cầu lông...) |
| `sub_type` | varchar(50) | Nullable | Phân loại sâu hơn: `5v5`, `7v7` (Bóng đá), `indoor`, `outdoor` (Pickleball) |
| `description` | text | Nullable | Mô tả chi tiết về cơ sở vật chất sân, loại thảm, ánh sáng... |
| `base_price_per_hour`| decimal(12,2) | Not Null | Giá thuê cơ bản của sân cho mỗi giờ (Chưa tính nhân hệ số giờ vàng) |
| `image_urls` | json | Nullable | Mảng chứa danh sách link ảnh thực tế của sân |
| `is_active` | boolean | Default: true | Trạng thái sẵn sàng cho thuê (Cho đặt lịch / Đang tạm đóng sửa chữa) |
| `created_at` | timestamp | Nullable | Thời điểm khởi tạo sân bãi |
| `updated_at` | timestamp | Nullable | Thời điểm cập nhật cấu hình sân |

##### 9. Bảng `amenities` — Danh mục Tiện ích
Danh sách tĩnh các tiện ích của cơ sở dịch vụ bãi xe, nước free, wifi, căn tin, tủ đồ...
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh tiện ích |
| `name` | varchar(255) | Unique, Not Null | Tên tiện ích (Ví dụ: Giữ xe miễn phí, Wifi miễn phí, Có điều hòa) |
| `icon` | varchar(255) | Nullable | Biểu tượng icon hiển thị kèm theo |

##### 10. Bảng `location_amenities` — Bảng trung gian Chi nhánh - Tiện ích
Mối quan hệ Many-to-Many liên kết giữa chi nhánh (`locations`) với các tiện ích hiện có (`amenities`).
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `location_id` | bigint | FK (`locations`), Composite PK | Định danh chi nhánh |
| `amenity_id` | bigint | FK (`amenities`), Composite PK | Định danh tiện ích thuộc chi nhánh |

##### 11. Bảng `products` — Hàng hóa & Dịch vụ đi kèm tại Chi nhánh
Lưu danh sách đồ ăn, nước uống đóng chai hoặc thiết bị thể thao (vợt, giày) cho thuê ngay tại sân bãi của chi nhánh.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh sản phẩm bán kèm |
| `location_id` | bigint | FK (`locations`), Not Null | Sản phẩm này thuộc chi nhánh nào quản lý và cung cấp |
| `name` | varchar(255) | Not Null | Tên sản phẩm/dịch vụ phụ (Ví dụ: Nước uống Revive, Thuê vợt Pro Kennex) |
| `category` | varchar(50) | Default: 'DRINK' | Phân loại: `DRINK` (Nước uống), `FOOD` (Đồ ăn), `SNACK` (Đồ ăn vặt), `EQUIPMENT` (Dụng cụ) |
| `description` | text | Nullable | Mô tả dung tích, tình trạng cũ mới hoặc thương hiệu |
| `price` | decimal(12,2) | Not Null | Đơn giá bán đứt hoặc đơn giá thuê theo đơn vị dịch vụ |
| `image_url` | text | Nullable | Đường dẫn ảnh mô tả sản phẩm |
| `is_available` | boolean | Default: true | Trạng thái kho hàng (true = Còn hàng/Sẵn sàng thuê, false = Tạm hết) |
| `created_at` | timestamp | Nullable | Thời điểm thêm sản phẩm |
| `updated_at` | timestamp | Nullable | Thời điểm cập nhật giá hoặc kho hàng của sản phẩm |

---

#### 📅 Nhóm 3: Lịch Trình & Bảng Giá

##### 12. Bảng `time_slots` — Lịch biểu & Ca hoạt động mặc định
Xác định các khung giờ hoạt động cố định lặp lại theo thứ trong tuần, đồng thời điều phối mức giá tăng/giảm theo từng ca.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh khung ca mặc định |
| `service_id` | bigint | FK (`services`), Not Null, Unique Combo | Liên kết tới sân bãi cụ thể |
| `day_of_week` | tinyint | Unique Combo, (0 = Chủ Nhật -> 6 = Thứ Bảy) | Thứ trong tuần áp dụng ca này |
| `start_time` | time | Unique Combo, Not Null | Giờ bắt đầu ca đặt lịch (Ví dụ: `08:00:00`) |
| `end_time` | time | Not Null | Giờ kết thúc ca đặt lịch (Ví dụ: `10:00:00`) |
| `price_modifier` | decimal(3,2) | Default: 1.00 | Hệ số điều chỉnh giá (Ví dụ: ca đêm vàng là `1.50`, ca trưa ít khách là `0.80`) |
| `is_available` | boolean | Default: true | Ca này có mở cho khách đặt hay không |
| `created_at` | timestamp | Nullable | Thời điểm thiết lập ca |
| `updated_at` | timestamp | Nullable | Thời điểm điều chỉnh hệ số giá hoặc giờ ca |

##### 13. Bảng `slot_overrides` — Thiết lập ghi đè ngày đặc biệt
Dùng khi đối tác muốn đóng cửa sân đột xuất (bảo trì) hoặc áp mức giá đặc biệt cho các dịp lễ Tết cụ thể ngoài lịch mặc định.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh bản ghi ghi đè |
| `service_id` | bigint | FK (`services`), Not Null, Unique Combo | Sân bãi cần cấu hình ghi đè |
| `override_date` | date | Unique Combo, Not Null | Ngày cụ thể áp dụng ghi đè (Ví dụ: `2026-04-30` cho ngày lễ) |
| `start_time` | time | Unique Combo, Nullable | Giờ bắt đầu ghi đè (Nếu NULL = Áp dụng toàn bộ cả ngày hôm đó) |
| `end_time` | time | Nullable | Giờ kết thúc ghi đè |
| `price_modifier` | decimal(3,2) | Default: 1.00 | Hệ số giá áp dụng riêng cho ngày đặc biệt này |
| `is_closed` | boolean | Default: false | Cờ đóng sân (true = Đóng/Khóa sân cả ngày hoặc ca đó do nghỉ lễ/bảo trì) |
| `reason` | varchar(255) | Nullable | Ghi chú nguyên nhân ghi đè (Ví dụ: Nghỉ Quốc Khánh, Bảo trì thay thảm mới) |

---

#### 💳 Nhóm 4: Đặt Sân & Thanh Toán

##### 14. Bảng `bookings` — Đơn đặt chỗ chính
Bảng nghiệp vụ quan trọng nhất lưu trữ thông tin giao dịch giữ chỗ, thời gian chơi, tổng tiền thanh toán và trạng thái đơn hàng.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Mã số đơn đặt lịch trên hệ thống |
| `booking_code` | varchar(20) | Unique, Not Null | Mã code QR độc nhất để Check-in tại quầy (Ví dụ: `BKG-ABCD123`) |
| `user_id` | bigint | FK (`users`), Not Null, Index | ID của khách hàng thực hiện đặt sân |
| `service_id` | bigint | FK (`services`), Not Null, Index | ID của sân được thuê |
| `promo_id` | bigint | Nullable, FK (`promotions`) | ID của mã giảm giá đã áp dụng thành công |
| `booking_date` | date | Not Null, Index | Ngày khách đăng ký đến chơi |
| `start_time` | time | Not Null, Index | Giờ bắt đầu sử dụng sân |
| `end_time` | time | Not Null | Giờ kết thúc sử dụng sân |
| `base_price` | decimal(12,2) | Not Null | Tổng đơn giá gốc của sân bãi tại thời điểm đặt (chưa trừ voucher) |
| `discount_amount` | decimal(12,2) | Default: 0.00 | Tổng số tiền được khấu trừ bởi chương trình khuyến mãi |
| `final_price` | decimal(12,2) | Not Null | Số tiền thực tế cuối cùng khách phải thanh toán (gồm sân + sản phẩm phụ) |
| `status` | varchar(20) | Default: 'PENDING' | Trạng thái đơn: `PENDING` (Chờ thanh toán), `CONFIRMED` (Xác nhận/Thành công), `COMPLETED` (Đã chơi xong), `CANCELLED` (Đã hủy) |
| `payment_status` | varchar(20) | Default: 'UNPAID' | Trạng thái tiền: `UNPAID` (Chưa trả), `DEPOSIT_PAID` (Đã cọc), `FULLY_PAID` (Đã trả đủ), `REFUNDED` (Đã hoàn tiền) |
| `cancellation_reason`| text | Nullable | Ghi nhận nguyên nhân khách hủy sân hoặc chủ sân hủy đơn |
| `created_at` | timestamp | Nullable | Thời điểm bấm đặt lịch trên giao diện |
| `updated_at` | timestamp | Nullable | Thời điểm thay đổi trạng thái đơn lịch gần nhất |

##### 15. Bảng `booking_details` — Sản phẩm mua kèm trong Đơn đặt
Lưu danh sách hàng hóa/dịch vụ thuê phụ trợ được khách hàng lựa chọn mua kèm khi tạo đơn đặt lịch chính.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh chi tiết hàng hóa mua kèm |
| `booking_id` | bigint | FK (`bookings`), Not Null | Liên kết tới đơn đặt lịch chính tương ứng |
| `product_id` | bigint | FK (`products`), Not Null | ID sản phẩm bán kèm được chọn |
| `quantity` | int | Default: 1 | Số lượng đặt mua/thuê sản phẩm này |
| `price` | decimal(12,2) | Not Null | Đơn giá sản phẩm lưu dạng snapshot tại thời điểm mua (tránh sai lệch khi đổi giá) |
| `created_at` | timestamp | Nullable | Thời điểm ghi nhận mua |
| `updated_at` | timestamp | Nullable | Thời điểm cập nhật số lượng |

##### 16. Bảng `payments` — Lịch sử giao dịch thanh toán
Lưu dấu vết các luồng tiền ra vào thông qua cổng thanh toán trực tuyến hoặc tiền mặt, làm bằng chứng đối soát tài chính.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Mã định danh giao dịch thanh toán |
| `booking_id` | bigint | FK (`bookings`), Not Null | Giao dịch này thuộc đơn đặt lịch nào |
| `transaction_id` | varchar(255) | Nullable | Mã giao dịch ngân hàng do cổng thanh toán (VNPAY, MoMo) gửi về |
| `amount` | decimal(12,2) | Not Null | Số tiền thực hiện giao dịch của đợt này |
| `payment_method` | varchar(20) | Nullable | Cổng thanh toán sử dụng: `VNPAY`, `MOMO`, `ZALOPAY`, `CASH` (Tiền mặt tại quầy) |
| `payment_type` | varchar(20) | Not Null | Phân loại: `DEPOSIT` (Thanh toán cọc), `FULL_PAYMENT` (Trả đủ), `REFUND` (Lệnh hoàn tiền) |
| `status` | varchar(20) | Default: 'PENDING' | Trạng thái giao dịch: `PENDING` (Chờ xử lý), `SUCCESS` (Thành công), `FAILED` (Thất bại) |
| `created_at` | timestamp | Nullable | Thời điểm phát sinh giao dịch tiền |

##### 17. Bảng `promotions` — Chương trình Khuyến mãi
Quản lý mã giảm giá do Sàn phát hành (áp dụng chung) hoặc do Đối tác tự cấu hình riêng (áp dụng tại chi nhánh của đối tác).
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh chương trình khuyến mãi |
| `partner_id` | bigint | Nullable, FK (`partner_profiles`) | NULL = Mã giảm giá toàn sàn, có ID = Mã riêng của đối tác đó phát hành |
| `code` | varchar(50) | Unique, Not Null | Mã chữ số nhập vào khi checkout (Ví dụ: `DONGGIA50K`, `VANDONGVIET`) |
| `description` | text | Nullable | Nội dung thông tin, điều khoản áp dụng khuyến mãi |
| `discount_percent` | decimal(5,2) | Default: 0.00 | Tỷ lệ giảm giá theo phần trăm (Ví dụ: `15.00` tương đương giảm 15%) |
| `max_discount_amount`| decimal(12,2) | Nullable | Số tiền giảm tối đa (Trần giảm giá nếu tính theo %) |
| `min_order_value` | decimal(12,2) | Default: 0.00 | Giá trị đơn đặt tối thiểu để voucher này có hiệu lực |
| `start_date` | datetime | Not Null, Index `idx_promotions_dates` | Ngày giờ bắt đầu chương trình khuyến mãi |
| `end_date` | datetime | Not Null, Index `idx_promotions_dates` | Ngày giờ chương trình hết hạn sử dụng |
| `usage_limit` | int | Default: 0 | Tổng số lượt sử dụng tối đa của mã này (0 = Không giới hạn) |
| `used_count` | int | Default: 0 | Số lần thực tế người dùng đã áp dụng mã này thành công |

##### 18. Bảng `user_promotions` — Nhật ký sử dụng mã giảm giá của Khách
Lưu trữ thông tin để kiểm soát giới hạn số lần một khách hàng được sử dụng một mã voucher, tránh spam mã.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh bản ghi lượt dùng |
| `user_id` | bigint | FK (`users`), Not Null | Khách hàng sử dụng |
| `promotion_id` | bigint | FK (`promotions`), Not Null | Mã giảm giá được áp dụng |
| `used_at` | timestamp | Nullable | Thời điểm giao dịch áp voucher được thực thi |

---

#### 🤝 Nhóm 5: Ghép Đội & Cộng Đồng (Matchmaking)

##### 19. Bảng `match_posts` — Bài đăng tìm người chơi cùng
Phục vụ nhu cầu ghép đội lẻ, đăng tin mời người chơi cùng hoặc tìm đội đấu giao lưu của các khách hàng vãng lai.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh tin bài đăng tìm đội |
| `user_id` | bigint | FK (`users`), Not Null | Khách hàng đăng bài tìm kiếm (Chủ phòng ghép) |
| `service_id` | bigint | FK (`services`), Not Null, Index | Sân bãi dự kiến/đã đặt để thi đấu |
| `booking_id` | bigint | Nullable, FK (`bookings`) | Liên kết tới đơn đặt sân nếu chủ phòng đã thanh toán giữ sân trước |
| `title` | varchar(255) | Not Null | Tiêu đề tin đăng (Ví dụ: *Cần tuyển 3 chân sút sân 5 tối nay*) |
| `description` | text | Nullable | Yêu cầu vị trí đá, chia tiền sân hoặc thông tin kỹ năng... |
| `play_date` | date | Not Null, Index `idx_match_posts_date_status` | Ngày chơi dự kiến |
| `start_time` | time | Not Null | Giờ bắt đầu trận |
| `end_time` | time | Not Null | Giờ kết thúc trận |
| `skill_level` | varchar(20) | Default: 'ANY' | Trình độ mong muốn: `ANY` (Bất kỳ), `BEGINNER` (Mới chơi), `INTERMEDIATE` (Khá), `ADVANCED` (Chuyên nghiệp) |
| `max_players` | int | Not Null | Tổng số thành viên của trận cần có (tính cả chủ phòng) |
| `current_players` | int | Default: 1 | Số người hiện tại đã chốt tham gia trận (mặc định ban đầu = 1) |
| `status` | varchar(20) | Default: 'OPEN', Index | Trạng thái: `OPEN` (Đang tuyển), `FULL` (Đủ người), `CANCELLED` (Hủy trận), `EXPIRED` (Quá giờ chơi) |

##### 20. Bảng `match_participants` — Danh sách ứng cử viên tham gia ghép trận
Nơi lưu thông tin các khách hàng khác bấm ứng cử tham gia vào tin tuyển dụng và trạng thái duyệt của Chủ phòng.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh lượt xin tham gia |
| `match_post_id` | bigint | FK (`match_posts`), Not Null, Unique Combo | ID bài đăng ghép đội muốn xin vào |
| `user_id` | bigint | FK (`users`), Not Null, Unique Combo | ID khách hàng muốn xin tham gia |
| `status` | varchar(20) | Default: 'PENDING' | Trạng thái duyệt: `PENDING` (Chờ duyệt), `JOINED` (Đồng ý/Tham gia), `REJECTED` (Từ chối) |
| `note` | text | Nullable | Lời nhắn gửi đến chủ phòng (Ví dụ: *Mình có thể đá tiền đạo tốt*) |

---

#### 💬 Nhóm 6: Chat & Giao Tiếp Thời Gian Thực

##### 21. Bảng `chat_rooms` — Phòng chat
Quản lý các phòng giao tiếp, phân loại giữa phòng trò chuyện riêng tư 1-1 và phòng trò chuyện tập thể của nhóm ghép đội.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh phòng trò chuyện |
| `type` | varchar(20) | Default: 'INDIVIDUAL' | Loại phòng: `INDIVIDUAL` (Trò chuyện 1-1 riêng tư), `MATCH` (Trò chuyện nhóm ghép đội) |
| `match_post_id` | bigint | Nullable, FK (`match_posts`) | Liên kết tới bài đăng ghép nếu thuộc loại phòng nhóm `MATCH` |
| `name` | varchar(255) | Nullable | Tên phòng chat (chỉ điền đối với loại phòng tập thể `MATCH`) |

##### 22. Bảng `chat_room_members` — Thành viên tham gia phòng chat
Lưu vết các tài khoản được quyền truy cập vào phòng chat và mốc thời gian đọc tin cuối phục vụ hiển thị tin chưa đọc.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh thành viên phòng |
| `chat_room_id` | bigint | FK (`chat_rooms`), Unique Combo | Định danh phòng chat tham gia |
| `user_id` | bigint | FK (`users`), Unique Combo | Định danh tài khoản thành viên |
| `last_read_at` | timestamp | Nullable | Thời điểm gần nhất thành viên này xem phòng chat này để đếm số tin unread |

##### 23. Bảng `messages` — Nội dung tin nhắn
Lưu trữ toàn bộ nội dung tin nhắn dạng văn bản, hình ảnh hoặc các thông báo hệ thống phát sinh trong các cuộc đối thoại.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Mã số tin nhắn duy nhất |
| `chat_room_id` | bigint | FK (`chat_rooms`), Not Null, Index `idx_messages_room_time` | Tin nhắn này được gửi trong phòng chat nào |
| `sender_id` | bigint | FK (`users`), Not Null | ID của người dùng đã soạn gửi tin nhắn này |
| `message_text` | text | Not Null | Nội dung văn bản thô của tin nhắn |
| `type` | varchar(20) | Default: 'TEXT' | Loại tin nhắn: `TEXT` (Chữ), `IMAGE` (Ảnh đính kèm), `SYSTEM` (Thông báo của hệ thống) |
| `attachments` | json | Nullable | Mảng danh sách URL các tệp tin/ảnh đính kèm đính kèm (nếu có) |
| `created_at` | timestamp | Nullable, Index `idx_messages_room_time` | Thời điểm gửi tin nhắn (dùng sắp xếp thời gian chat) |

---

#### ⚖️ Nhóm 7: Hỗ Trợ & Tài Chính

##### 24. Bảng `disputes` — Khiếu nại & Tranh chấp
Lưu trữ các vụ việc mâu thuẫn cần hỗ trợ hòa giải từ quản trị viên nền tảng, đảm bảo môi trường giao dịch an toàn.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh vụ khiếu nại |
| `booking_id` | bigint | FK (`bookings`), Not Null | Khiếu nại nhắm vào giao dịch cụ thể nào |
| `raised_by` | bigint | FK (`users`), Not Null | Tài khoản khách hàng đứng ra tố cáo/khiếu nại |
| `against_partner` | bigint | FK (`partner_profiles`), Not Null | Đối tác bị khiếu nại |
| `category` | varchar(30) | Not Null | Phân loại mâu thuẫn: `QUALITY` (Chất lượng kém), `CANCELLATION` (Hủy lịch vô lý), `OVERCHARGE` (Thu sai tiền), `NO_SHOW` (Bỏ bom ca), `OTHER` (Lý do khác) |
| `description` | text | Not Null | Nội dung tường trình chi tiết sự cố của khách |
| `evidence_urls` | json | Nullable | Danh sách link hình ảnh/video bằng chứng do khách tải lên |
| `status` | varchar(20) | Default: 'OPEN' | Trạng thái xử lý: `OPEN` (Mới nhận), `INVESTIGATING` (Đang điều tra), `RESOLVED` (Đã có hướng xử lý), `CLOSED` (Đã đóng hồ sơ) |
| `resolution` | text | Nullable | Hướng xử lý chính thức do ban quản trị quyết định ghi lại |
| `resolved_by` | bigint | Nullable, FK (`admins`) | Admin trực tiếp thụ lý hồ sơ và đưa ra phán quyết |
| `resolved_at` | timestamp | Nullable | Thời điểm vụ việc chính thức được hòa giải đóng lại |

##### 25. Bảng `partner_commission_bills` — Hóa đơn thu hoa hồng hàng tháng của Đối tác
Bảng theo dõi các hóa đơn thu phí hoa hồng hàng tháng do sàn gửi đến Đối tác để Đối tác thực hiện thanh toán.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh hóa đơn hoa hồng |
| `partner_id` | bigint | FK (`partner_profiles`), Not Null | Đối tác nhận hóa đơn |
| `bill_period` | date | Not Null | Kỳ hóa đơn tháng (Ví dụ: `2026-06-01` đại diện tháng 6) |
| `total_bookings` | int | Default: 0 | Tổng số lượt đặt sân hoàn thành trong tháng |
| `total_revenue` | decimal(15,2) | Default: 0.00 | Tổng doanh thu đối tác thu được trong tháng |
| `commission_amount` | decimal(15,2) | Default: 0.00 | Số tiền hoa hồng nợ phải thanh toán cho hệ thống |
| `payment_evidence` | text | Nullable | Bằng chứng hình ảnh chuyển khoản thanh toán |
| `status` | varchar(20) | Default: 'UNPAID' | Trạng thái hóa đơn: `UNPAID` (Chưa trả), `PROCESSING` (Đang kiểm duyệt), `PAID` (Đã thanh toán), `OVERDUE` (Quá hạn) |
| `processed_by` | bigint | Nullable, FK (`admins`) | Admin duyệt minh chứng và hoàn tất thanh toán |
| `created_at` | timestamp | Nullable | Thời điểm lập hóa đơn |

##### 26. Bảng `notifications` — Thông báo nội bộ
Lưu thông điệp thông báo đẩy gửi đến từng tài khoản khách hàng hoặc đối tác để cập nhật trạng thái lịch, tiền hoặc sự kiện.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh thông báo |
| `user_id` | bigint | FK (`users`), Not Null, Index | Tài khoản nhận thông báo này |
| `title` | varchar(255) | Not Null | Tiêu đề ngắn gọn của thông báo |
| `message` | text | Not Null | Nội dung chi tiết của thông báo gửi đi |
| `type` | varchar(20) | Not Null | Phân loại: `BOOKING` (Tin lịch đặt), `PAYMENT` (Tin giao dịch), `PROMOTION` (Tin ưu đãi), `SYSTEM` (Tin hệ thống), `DISPUTE` (Tin giải quyết khiếu nại) |
| `related_id` | unsigned bigint | Nullable | ID của đối tượng liên quan trực tiếp để điều hướng khi click (Ví dụ: `booking_id`) |
| `is_read` | boolean | Default: false, Index | Trạng thái xem thông báo (false = Chưa đọc, true = Đã đọc) |
| `created_at` | timestamp | Nullable | Thời điểm bắn thông báo |

##### 27. Bảng `reviews` — Đánh giá & Phản hồi
Nơi lưu trữ đánh giá chất lượng dịch vụ của khách sau khi sử dụng ca xong, cùng phản hồi phản biện của chủ sân.
| Tên trường (Field) | Kiểu dữ liệu | Thuộc tính / Ràng buộc | Giải thích ý nghĩa (Description) |
| :--- | :--- | :--- | :--- |
| `id` | bigint | Primary Key, Auto Increment | Định danh đánh giá |
| `booking_id` | bigint | Unique, FK (`bookings`), Not Null | Liên kết 1-1 tới đơn đặt lịch đã chơi xong (Một đơn chỉ được đánh giá một lần) |
| `user_id` | bigint | FK (`users`), Not Null | Người viết đánh giá |
| `service_id` | bigint | FK (`services`), Not Null, Index | Đánh giá này nhắm trực tiếp vào dịch vụ sân bãi nào |
| `rating` | tinyint | Not Null, Index | Số sao bình chọn chất lượng từ 1 đến 5 sao |
| `comment` | text | Nullable | Ý kiến nhận xét, góp ý dạng văn bản của khách hàng |
| `images` | json | Nullable | Danh sách các link ảnh chụp thực tế tình trạng sân do khách gửi kèm |
| `partner_reply` | text | Nullable | Nội dung phản hồi, trả lời giải trình của chủ sân |
| `created_at` | timestamp | Nullable | Thời điểm viết bài đánh giá |

---

## 🔄 Luồng Hoạt Động Chi Tiết (Operational Activity Flows)

### 1. Luồng Đăng ký & Kích hoạt Đối tác (Partner Onboarding Flow)

```
[User đăng ký đối tác] ──> [Nhập thông tin doanh nghiệp, GPKD] ──> [Tạo hồ sơ status: PENDING]
                                                                        │
[Admin nhận thông báo] <── [Admin duyệt hồ sơ duyệt/từ chối] <──────────┘
          │
          └───> Kích hoạt: Profile chuyển sang ACTIVE ──> Đối tác đăng nhập trang Partner Portal
```

*   **Bước 1:** Khách hàng thông thường gửi yêu cầu đăng ký đối tác kèm tên doanh nghiệp, mã số thuế và ảnh giấy phép kinh doanh thông qua API đăng ký (`OnboardingController`).
*   **Bước 2:** Hệ thống tạo bản ghi mới trong `partner_profiles` với trạng thái `PENDING` và gửi thông báo đến ban quản trị.
*   **Bước 3:** Quản trị viên đăng nhập hệ thống Admin Portal, truy cập danh sách hồ sơ đối tác để xem chi tiết giấy phép kinh doanh và ấn **Duyệt (Approve)** hoặc **Từ chối (Reject)** thông qua bảng điều khiển (`PartnerController`).
*   **Bước 4:** Nếu duyệt thành công, trạng thái chuyển thành `ACTIVE`, ghi nhận `approved_by` của Admin. Đối tác chính thức được phân quyền truy cập trang chủ dành cho chủ sân (Partner Portal) để quản lý hoạt động kinh doanh.

---

### 2. Luồng Thiết lập Cơ sở & Danh sách Sân đấu (Facility & Multi-Court Setup Flow)

```
[Thêm Cơ sở Mới] ──> [Nhập tên, SĐT, chọn địa chỉ chuẩn, tiện ích] ──> [Lưu & Tạo Cơ sở thành công]
                                                                                │
[Chỉnh sửa Cơ sở] <─────────────────────────────────────────────────────────────┘
       │
       └──> [Khai báo danh sách Sân con (Services)] ──> [Tên sân, Bộ môn, Phân loại, Giá, Ảnh, Mô tả, Trạng thái]
                         │
                         └──> [Cấu hình Khung giờ & Bảng giá] ──> [Công cụ "Smart Slots" sinh tự động giờ chẵn/lẻ/1h/1.5h]
```

*   **Bước 1 (Thêm Cơ sở):** Đối tác nhấp nút **Thêm Cơ sở** trong trang **Quản Lý Cơ Sở** (sidebar). Ở bước này, đối tác khai báo thông tin cơ sở kinh doanh: nhập tên cơ sở, số điện thoại liên hệ trực tiếp, đường dẫn hình ảnh đại diện cơ sở (`imageUrl`), chọn đầy đủ địa chỉ chuẩn hóa (Tỉnh/Thành, Quận/Huyện, Phường/Xã, địa chỉ cụ thể) thông qua `AddressSelector`, và thiết lập các tiện ích sẵn có. Khi bấm **Lưu Cơ Sở**, hệ thống gửi yêu cầu `POST /locations` để lưu và tạo cơ sở mới độc lập mà không yêu cầu cấu hình sân ngay.
*   **Bước 2 (Sửa Thông tin Cơ sở):** Khi cơ sở đã được tạo, đối tác có thể nhấp **Sửa Cơ Sở** để mở trang biểu mẫu `LocationForm` và điều chỉnh thông tin cơ bản hoặc hình ảnh đại diện của cơ sở kinh doanh, sau đó cập nhật qua `PUT /locations/:id`.
*   **Bước 3 (Quản Lý Sân):** Đối tác nhấp vào **Quản Lý Sân** từ danh sách cơ sở để chuyển sang một trang quản trị sân đấu hoàn toàn riêng biệt (`CourtManagementPage`):
    *   Trang này hiển thị danh sách các sân đấu con hoạt động dưới cơ sở đó.
    *   Có nút **Thêm Sân Đấu** và **Cấu hình & Giờ chơi** của từng sân đấu để chuyển sang trang biểu mẫu riêng biệt, tránh các ô popup rườm rà.
    *   Đối tác thiết lập thuộc tính sân đấu (tên sân, bộ môn thể thao, phân loại thảm/kích thước, đơn giá thuê gốc) và cấu hình khung giờ chơi (`time_slots`) bằng công cụ sinh tự động **Smart Slots** (Giờ chẵn, giờ lẻ, 1.5h...).
    *   Khi lưu, hệ thống gửi yêu cầu tạo/cập nhật sân trực tiếp (`POST /services` hoặc `PUT /services/:id`) và đồng bộ khung giờ chơi tương ứng (`POST /services/:id/timeslots`), giúp giảm độ phức tạp khi lưu nhiều dữ liệu cùng lúc.
    *   Hành động xóa sân được thực hiện trực tiếp bằng cách gọi `DELETE /services/:id`.
*   **Bước 4 (Quản Lý Sản Phẩm):** Đối tác nhấp vào **Quản Lý Sản Phẩm** từ danh sách cơ sở để chuyển sang trang quản trị sản phẩm riêng biệt (`ProductManagementPage`):
    *   Khai báo và hiển thị các sản phẩm phụ trợ (`products`) tại chi nhánh như nước suối, đồ ăn nhanh, thuê áo bib, thuê vợt cầu lông để chuẩn bị bán kèm cho khách hàng đặt cùng giờ.
    *   Thao tác thêm, sửa, xóa sản phẩm được thực hiện trực tiếp qua API `/products` độc lập.
    *   Cấu hình trạng thái "Còn hàng / Hết hàng" nhanh chóng.

---

### 3. Luồng Đặt Lịch & Thanh Toán Đi Kèm (Search, Booking & Checkout Flow)

```
[Khách tìm sân gần đây / theo môn] ──> [Chọn sân & khung giờ còn trống] ──> [Chọn thêm Nước suối/Vợt thuê]
                                                                                      │
[Trang checkout: Kiểm tra trùng lịch & Tính tiền áp mã] <─────────────────────────────┘
          │
          └───> [Chọn phương thức & Thanh toán] ──> [Chuyển cổng thanh toán MoMo/VNPAY]
                                                               │
[Check-in bằng Booking Code QR] <── [Gửi thông báo & Mã QR] <─── [Thanh toán SUCCESS: Chuyển Confirmed]
```

*   **Bước 1:** Khách hàng tìm kiếm sân gần đây hoặc lọc theo môn thể thao tại trang chủ. Hệ thống truy vấn bảng `locations` (tính khoảng cách địa lý dựa trên GPS của khách) và bảng `services` (khớp danh mục môn học).
*   **Bước 2:** Khách hàng click vào dịch vụ để xem danh sách lịch trống được tính toán động (hệ thống truy vấn bảng `bookings` trong ngày để ẩn đi các giờ đã được đặt, hiển thị các giờ khả dụng tính toán giá theo `base_price_per_hour` kết hợp `price_modifier` trong `time_slots` hoặc `slot_overrides` của ngày đó).
*   **Bước 3:** Khách hàng chọn khung giờ và bấm đặt kèm sản phẩm (nước suối, thuê vợt) -> Chuyển đến trang checkout xử lý bởi dịch vụ thanh toán (`BookingController`).
*   **Bước 4:** Hệ thống thực hiện khóa giữ chỗ tạm thời (PENDING), kiểm tra lại tính hợp lệ (trùng giờ), áp mã giảm giá `promotions` nếu có để tính toán `final_price` và tạo:
    *   Bản ghi `bookings` (status: `PENDING`, payment_status: `UNPAID`).
    *   Bản ghi `booking_details` lưu trữ danh sách sản phẩm đi kèm với snapshot giá tại thời điểm đặt.
*   **Bước 5:** Khách hàng chọn thanh toán trực tuyến qua cổng VNPAY/MoMo. Cổng thanh toán xử lý và gọi Webhook (IPN) về hệ thống:
    *   **Thành công:** Tạo bản ghi `payments` (status: `SUCCESS`), cập nhật `bookings` (status: `CONFIRMED`, payment_status: `FULLY_PAID`), sinh mã `booking_code` độc nhất phục vụ check-in QR Code. Đồng thời cộng điểm `loyalty_points` cho khách hàng và cộng số dư ví tạm tính `balance` cho chủ sân trong `partner_profiles`.
    *   **Thất bại/Hủy:** Hủy đơn đặt lịch, giải phóng khung giờ.

---

### 4. Luồng Ghép Đội & Chat Nhóm Cộng Đồng (Matchmaking & Chat Flow)

```
[Khách đã đặt sân thành công] ──> [Tạo bài đăng ghép đội (Match Post) thiếu người]
                                                  │
[Chủ bài đăng Duyệt yêu cầu] <── [Khách khác ứng tuyển qua trang danh sách /matches]
          │
          └───> [Tự động tạo Chat Room loại MATCH, tự động thêm các thành viên vào nhóm]
                                                  │
[Nhận tin nhắn thời gian thực] <── [Mọi người thảo luận, chia sẻ vị trí chiến thuật]
```

*   **Bước 1:** Khách hàng đã đặt sân thành công nhưng thiếu người chơi cùng sẽ tạo một bài đăng ghép đội (`match_posts`) lưu môn thể thao, ngày giờ thi đấu (liên kết với `booking_id` của sân đã đặt), cấp độ kỹ năng yêu cầu (`skill_level`), và số lượng người cần tuyển `max_players`.
*   **Bước 2:** Các người chơi khác duyệt tìm danh sách ghép đội, chọn trận phù hợp và nhấn **Tham gia** kèm lời nhắn ngắn gọn. Hệ thống tạo bản ghi trong `match_participants` với trạng thái chờ duyệt (status: `PENDING`) qua `MatchController`.
*   **Bước 3:** Chủ bài đăng nhận thông báo, xem danh sách ứng cử viên và bấm **Chấp nhận (Accept)**. Lúc này:
    *   `match_participants.status` cập nhật thành `JOINED`.
    *   `match_posts.current_players` tăng thêm 1.
    *   Hệ thống kiểm tra nếu đây là thành viên đầu tiên được duyệt, sẽ tự động tạo một phòng chat mới trong bảng `chat_rooms` với `type = MATCH` liên kết tới `match_post_id`.
    *   Thêm cả chủ bài đăng lẫn thành viên mới vào bảng `chat_room_members`.
*   **Bước 4:** Thành viên trong đội có thể truy cập phòng chat nhóm để trò chuyện thời gian thực bàn về trang phục thi đấu hoặc vị trí chiến thuật. Mỗi tin nhắn gửi lên tạo bản ghi `messages` (type: `TEXT`/`IMAGE`/`SYSTEM`), hệ thống tự động đẩy thông báo unread bằng cách so sánh thời gian tin nhắn mới nhất với `last_read_at` của từng thành viên.

---

### 5. Luồng Giải Quyết Tranh Chấp & Đối Soát Tài Chính (Dispute & Payout Flow)

```
[Khách hàng gặp sự cố] ──> [Gửi khiếu nại (Dispute)] ──> [Đính kèm bằng chứng ảnh/video]
                                                                  │
[Admin ra quyết định] <── [Admin điều tra liên hệ 2 bên] <────────┘
          │
          ├───> [Phán quyết Khách thắng: Hủy booking, tạo lệnh hoàn tiền payments REFUND]
          │
          └───> [Phán quyết Chủ sân thắng: Xác nhận giao dịch, ghi nhận số dư ví đối tác]
                                                                  │
[Thực hiện chuyển khoản & Hoàn tất] <── [Admin duyệt hóa đơn] <── [Chủ sân thanh toán & tải minh chứng]
```

*   **Bước 1:** Trường hợp chủ sân không mở cửa, sân không đảm bảo chất lượng hoặc khách không đến (No-show), khách hàng có thể gửi khiếu nại tạo bản ghi trong `disputes` với các thông tin danh mục tranh chấp, mô tả, và hình ảnh chứng cứ tải lên hệ thống.
*   **Bước 2:** Admin tiếp nhận khiếu nại, chuyển trạng thái tranh chấp thành `INVESTIGATING`. Admin liên hệ hai bên để xác minh sự việc.
*   **Bước 3:** Admin đưa ra phán quyết xử lý thông qua hệ thống:
    *   **Hoàn tiền cho Khách:** Cập nhật `bookings.status = CANCELLED`, tạo một bản ghi giao dịch âm trong `payments` với `payment_type = REFUND` kích hoạt lệnh hoàn tiền từ cổng thanh toán, đồng thời khấu trừ tiền ví tạm giữ của đối tác.
    *   **Thanh toán cho Chủ sân:** Đóng khiếu nại, giữ nguyên trạng thái xác nhận đặt sân, kết chuyển doanh thu chính thức vào ví đối tác.
*   **Bước 4:** Định kỳ cuối tháng, Admin hoặc hệ thống sẽ tổng hợp số ca đấu hoàn thành và lập hóa đơn thu hoa hồng (`partner_commission_bills`) gửi cho đối tác dựa trên tổng doanh thu và cấu hình hoa hồng của đối tác đó.
*   **Bước 5:** Đối tác nhận hóa đơn hoa hồng trong Partner Portal, tiến hành chuyển khoản thanh toán cho Admin, sau đó tải lên ảnh chụp minh chứng chuyển khoản (`payment_evidence`). Admin kiểm duyệt giao dịch và cập nhật trạng thái hóa đơn thành `PAID` để hoàn tất kỳ đối soát.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án Từ Đầu

### 📋 Yêu cầu hệ thống
*   Đã cài đặt **Node.js** (Phiên bản khuyên dùng: `v18` hoặc `v20` trở lên).
*   Đã cài đặt cơ sở dữ liệu **PostgreSQL** (Có thể chạy cục bộ hoặc qua Docker).

---

### 1. Cấu Hình & Chạy Backend (NestJS v11)

Mở terminal tại thư mục gốc của dự án, truy cập vào thư mục `backend`:

#### **Bước 1.1: Cài đặt thư viện dependencies**
```bash
cd backend
npm install
```

#### **Bước 1.2: Cấu hình biến môi trường (`.env`)**
Tạo file `.env` trong thư mục `backend` (nếu chưa có) và cập nhật đường dẫn kết nối PostgreSQL của bạn:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:matkhaucuaban@localhost:5432/booking_management_db?schema=public"
JWT_SECRET="bi-mat-quan-trong-cua-ban-12345"
```
*(Thay thế `postgres:matkhaucuaban` bằng tài khoản và mật khẩu PostgreSQL của bạn)*

#### **Bước 1.3: Khởi tạo Cơ sở dữ liệu với Prisma**
Chạy lệnh migration để tự động tạo cấu trúc bảng trong PostgreSQL:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

#### **Bước 1.4: Khởi động Server Backend phát triển**
```bash
npm run start:dev
```
👉 Server Backend sẽ chạy tại: `http://localhost:3000`

---

### 2. Cấu Hinh & Chạy Frontend (ReactJS v19)

Mở một cửa sổ terminal mới, truy cập vào thư mục `frontend`:

#### **Bước 2.1: Cài đặt thư viện dependencies**
```bash
cd frontend
npm install
```

#### **Bước 2.2: Cấu hình Tailwind CSS v4**
*Dự án sử dụng **Tailwind CSS v4** (kiến trúc CSS-first mới nhất). Mọi cài đặt đã được cấu hình tự động thông qua PostCSS và Vite plugin. Bạn không cần tạo tệp `tailwind.config.js` hay `postcss.config.js` truyền thống.*

Mọi cấu hình tùy chỉnh (Theme) có thể định nghĩa trực tiếp trong file CSS chính tại [frontend/src/index.css](file:///c:/xampp/htdocs/ME/BookingManagement/frontend/src/index.css) bằng chỉ thị `@import "tailwindcss";` và quy tắc `@theme`.

#### **Bước 2.3: Khởi động Server Frontend**
```bash
npm run dev
```
👉 Server Frontend sẽ chạy tại: `http://localhost:5173` (hoặc cổng bất kỳ được hiển thị trong terminal).

---

## 📂 Cấu Trúc Dự Án (Project Structure)

```text
BookingManagement/
├── backend/                   # ⚙️ NestJS Backend (NestJS v11)
│   ├── prisma/                # Cấu hình Database & Schema
│   │   └── schema.prisma      # Nơi định nghĩa 29 bảng dữ liệu hệ thống
│   ├── src/                   # Source code APIs NestJS
│   ├── .env                   # Biến môi trường
│   └── package.json
│
├── frontend/                  # 🎨 React Frontend (React 19 + Tailwind v4)
│   ├── src/                   # Source code giao diện React
│   │   ├── assets/            # Hình ảnh, icons tĩnh
│   │   ├── components/        # Các UI Components dùng chung (Navbar, Layout...)
│   │   ├── features/          # Cấu trúc Features-based (auth, sports-field...)
│   │   ├── pages/             # Các trang ứng dụng (client, admin...)
│   │   ├── App.tsx            # Component chính của ứng dụng
│   │   ├── index.css          # CSS v4 & Tailwind import
│   │   └── main.tsx           # Điểm khởi chạy React
│   ├── index.html
│   ├── vite.config.ts         # Cấu hình Vite
│   └── package.json
│
├── learning-frontend.md       # 📚 Cẩm nang tự học FE cho Laravel Dev
├── learning-backend.md        # 📚 Cẩm nang tự học BE cho Laravel Dev
└── README.md                  # 📖 Tài liệu hướng dẫn hiện tại
```

---

## 🗓️ Lộ Trình Phát Triển Đề Xuất (System Roadmap)

*   [ ] **Giai đoạn 1 (Core DB Schema & Prisma Migration):** Đồng bộ hóa đầy đủ 29 bảng trong file `schema.prisma`. Chạy migration tạo bảng hoàn chỉnh trong PostgreSQL.
*   [ ] **Giai đoạn 2 (Core REST APIs & Auth):** Phát triển hệ thống đăng nhập, đăng ký và phân quyền cho 3 nhóm vai trò (User, Partner, Admin).
*   [ ] **Giai đoạn 3 (Lịch Trống & Xử Lý Đặt Sân Real-Time):** Tạo thuật toán tính toán lịch trống động kết hợp cơ chế khóa slot giữ chỗ 10 phút. Tích hợp WebSockets/Socket.IO để cập nhật real-time.
*   [ ] **Giai đoạn 4 (Sản Phẩm Đi Kèm & Cổng Thanh Toán):** Cho phép đặt thêm sản phẩm dịch vụ phụ trợ. Tích hợp cổng thanh toán MoMo/VNPAY và xử lý Webhook.
*   [ ] **Giai đoạn 5 (Cộng Đồng Ghép Đội & Chat Nhóm):** Lập trình tính năng Matchmaking và tự động tạo phòng Chat room Socket.IO.
*   [ ] **Giai đoạn 6 (Disputes & Đối Soát Tài Chính):** Hoàn thiện module giải quyết khiếu nại của Admin và hệ thống hóa đơn hoa hồng hàng tháng (Partner Commission Bill) thay thế cho cơ chế yêu cầu rút tiền thủ công.
*   [x] **Giai đoạn 7 (Quản Lý Sân & Vị Trí Cơ Sở Đối Tác Chuyên Sâu):** Phát triển phân hệ Quản lý Sân (Services) và Cơ sở (Locations) độc lập dạng Trang chuyên biệt (Dedicated Page) thay thế cho popup modal. Tích hợp quản lý Tiện ích (Amenities), Khung giờ bảng giá động (TimeSlots), Sản phẩm bán kèm (Products) và Phản hồi đánh giá của khách (Reviews).

---


*Tài liệu được bảo trì và cập nhật bởi Đội ngũ Phát triển kỹ thuật của dự án. Mọi câu hỏi kỹ thuật xin vui lòng liên hệ bộ phận hỗ trợ.*
