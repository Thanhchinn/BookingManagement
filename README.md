# 🏆 SportBooker (SportZone) - Hệ Thống Quản Lý & Đặt Lịch Sân Thể Thao

**SportBooker (SportZone)** là nền tảng quản lý tổ hợp sân thể thao, đặt lịch trực tuyến, ghép đội giao hữu (Matchmaking) và đối soát hoa hồng minh bạch theo mô hình sổ cái (Double-Entry Ledger) cho nhiều bộ môn (Bóng đá, Cầu lông, Tennis, Pickleball, Bóng rổ,...).

---

## ⚡ Các Tính Năng Trọng Tâm Hiện Có (Core Features)

1. **🏟️ Quản Lý Cơ Sở Đa Sân & Địa Giới Hành Chính 2 Cấp:**
   - Hỗ trợ mô hình **1 Đối tác (Partner) -> Nhiều Cơ sở (Location) -> Nhiều Sân đấu (SportsPitch)** thuộc nhiều bộ môn khác nhau.
   - Tích hợp chuẩn **Địa giới hành chính 2 cấp mới của Việt Nam** (`LocationProvince` - Tỉnh/Thành phố & `LocationWard` - Phường/Xã) cùng tìm kiếm vị trí tọa độ GPS lân cận (`/public/locations/nearby`).
2. **📅 Lịch Đặt Sân Động & Chống Trùng Lịch Cấp Độ Database:**
   - Quản lý khung giờ theo thứ trong tuần (`TimeSlot`) kết hợp ghi đè lịch/giá vào ngày lễ hoặc bảo trì (`SlotOverride`).
   - Hỗ trợ tính giá động (`basePricePerHour * priceModifier * durationHours`), đặt kèm sản phẩm/dịch vụ tại cơ sở (`Product`, `ProductCategory`), áp mã giảm giá (`Promotion` & `PromotionRedemption`).
   - **Chống đặt trùng tuyệt đối (Zero Double-Booking):** Kết hợp khóa dòng `SELECT ... FOR UPDATE` trong Transaction và ràng buộc **`EXCLUDE USING gist (bookings_no_overlap)`** trực tiếp dưới PostgreSQL.
3. **💰 Đối Soát Tài Chính & Sổ Cái Hoa Hồng (Partner Ledger):**
   - Lưu vết toàn bộ biến động công nợ hoa hồng giữa Đối tác và Nền tảng qua bảng bất biến `PartnerLedgerEntry` (`COMMISSION_CHARGE`, `COMMISSION_REVERSAL`, `COMMISSION_PAYMENT`, `ADJUSTMENT`).
   - Tự động hạch toán nợ hoa hồng khi đơn hoàn thành (`COMPLETED`) và tự động hoàn hoa hồng khi đơn hoàn tiền (`REFUNDED`).
   - Lưu vết toàn bộ lịch sử chuyển trạng thái đơn và thanh toán qua `BookingStatusHistory`.
4. **🤝 Cộng Đồng Ghép Đội (Matchmaking) & Chat Đa Kênh:**
   - Đăng tin tìm đối thủ / tuyển thành viên giao hữu (`MatchPost`), duyệt người tham gia (`MatchParticipant`), kiểm duyệt bài đăng bởi Admin.
   - Hệ thống phòng Chat (`ChatRoom`, `Message`) hỗ trợ 3 luồng: Chat cá nhân (`INDIVIDUAL`), Chat nhóm ghép trận (`MATCH`), và Kênh hỗ trợ Đối tác - Admin (`SUPPORT`).
5. **🔐 Bảo Mật & Phân Quyền 3 Tầng (Client / Partner / Admin):**
   - Xác thực JWT qua Cookie `httpOnly` và Bearer Token, xác thực đăng ký bằng OTP băm `SHA-256` (`OtpVerification`).
   - Bảo vệ toàn cục với `ThrottlerGuard` (Rate Limiting), `JwtAuthGuard`, `RolesGuard` và tự động ẩn trường nhạy cảm (`password`) tại tầng `PrismaService`.
   - Hỗ trợ đa ngôn ngữ (**Tiếng Việt / Tiếng Anh**) với `i18next`.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### 🎨 Frontend (`/frontend`)
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling & UI:** Tailwind CSS v4 (`@tailwindcss/postcss`), Lucide React Icons, AOS (Animate On Scroll), Swiper, Sonner (Toast)
- **State & Routing:** Zustand (`useAuthStore`, `useAppStore`), React Router DOM v7
- **Đa ngôn ngữ & HTTP:** `i18next` + `react-i18next`, Axios

### ⚙️ Backend (`/backend`)
- **Framework:** NestJS v11 (TypeScript, Modular Architecture)
- **Database & ORM:** PostgreSQL + Prisma ORM v7 (`@prisma/client`, `@prisma/adapter-pg`, `pg` connection pool)
- **Security & Validation:** Passport JWT, `bcrypt`, `@nestjs/throttler`, `class-validator`, `class-transformer`, `cookie-parser`

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 📋 Yêu cầu hệ thống
- **Node.js:** `v20+` (khuyên dùng `v22` hoặc `v24`)
- **PostgreSQL:** `v14+` (hỗ trợ extension `btree_gist`)

---

### 1. Cấu Hình & Chạy Backend (`/backend`)

#### **Bước 1.1: Cài đặt thư viện**
```bash
cd backend
npm install
```

#### **Bước 1.2: Cấu hình biến môi trường (`.env`)**
Sao chép từ `.env.example` sang `.env` và cập nhật chuỗi kết nối PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/booking_management"
DATABASE_POOL_MAX=10
JWT_SECRET="thay-bang-chuoi-ngau-nhien-toi-thieu-32-ky-tu"
NODE_ENV=development
PORT=3000
```

#### **Bước 1.3: Khởi tạo Database & Seed dữ liệu mẫu**
```bash
npx prisma migrate deploy
npx prisma db seed
```
*(Khi phát triển và có chỉnh sửa `prisma/schema.prisma`, sử dụng `npx prisma migrate dev --name <ten_migration>`).*

#### **Bước 1.4: Khởi động máy chủ Backend**
```bash
npm run start:dev
```
👉 Backend chạy mặc định tại: `http://localhost:3000`

---

### 2. Cấu Hình & Chạy Frontend (`/frontend`)

#### **Bước 2.1: Cài đặt thư viện**
```bash
cd frontend
npm install
```

#### **Bước 2.2: Khởi động máy chủ Frontend**
```bash
npm run dev
```
👉 Frontend chạy mặc định tại: `http://localhost:5173`

---

## 📂 Cấu Trúc Dự Án Thực Tế (Project Structure)

```text
BookingManagement/
├── backend/                        # ⚙️ NestJS v11 Backend Server
│   ├── docs/                       # Tài liệu kỹ thuật nội bộ (Routing, Lifecycle, Postman...)
│   ├── prisma/
│   │   ├── schema.prisma           # Định nghĩa 25 Models & 17 Enums (PostgreSQL)
│   │   ├── migrations/             # Lịch sử migration SQL (bao gồm EXCLUDE & CHECK constraints)
│   │   ├── seed.ts                 # Script khởi tạo dữ liệu mẫu
│   │   └── seeders/                # Seeders chi tiết (admin, user, category, location, promotion)
│   ├── src/
│   │   ├── admins/                 # Quản trị viên hệ thống (/admins)
│   │   ├── auth/                   # Xác thực, OTP, Guards & Strategies (/auth)
│   │   ├── bookings/               # Đặt sân, báo giá, duyệt đơn, hoàn tiền (/bookings)
│   │   ├── categories/             # Danh mục môn thể thao (/categories)
│   │   ├── chat/                   # Phòng chat cộng đồng, ghép trận & hỗ trợ (/chats)
│   │   ├── common/                 # Interceptors (Transform BigInt/Decimal) & Utilities
│   │   ├── locations/              # Quản lý cơ sở kinh doanh & tiện ích (/locations)
│   │   ├── matchmaking/            # Đăng tin ghép đội & duyệt thành viên (/matchmaking)
│   │   ├── partners/               # Hồ sơ đối tác & Sổ cái hoa hồng (/partners)
│   │   ├── prisma/                 # PrismaService kết nối PostgreSQL Pool
│   │   ├── products/               # Sản phẩm & danh mục bán kèm tại cơ sở (/products, /product-categories)
│   │   ├── public/                 # API tra cứu công khai cho khách hàng (/public)
│   │   ├── services/               # Quản lý sân đấu, khung giờ & phản hồi đánh giá (/services)
│   │   ├── users/                  # Quản lý người dùng & upload avatar (/users)
│   │   ├── app.module.ts           # Root Module
│   │   └── main.ts                 # Entrypoint (CORS, ValidationPipe, Static /uploads)
│   ├── uploads/                    # Lưu trữ tệp tải lên (avatars...)
│   ├── prisma.config.ts            # Cấu hình Prisma v7
│   └── package.json
│
├── frontend/                       # 🎨 React 19 + Vite 8 + Tailwind CSS v4
│   ├── public/                     # Hình ảnh tĩnh & locales đa ngôn ngữ
│   ├── src/
│   │   ├── components/             # UI Components dùng chung (Navbar, ProtectedRoute...)
│   │   ├── context/                # React Contexts
│   │   ├── features/               # Các phân hệ tính năng chuyên biệt
│   │   ├── hooks/                  # Custom React Hooks
│   │   ├── pages/
│   │   │   ├── client/             # Trang khách hàng (Home, Search, CourtDetails, MyBookings, Matchmaking, CommunityChat, Profile...)
│   │   │   ├── partner/            # Trang chủ sân (PartnerLayout, Quản lý Cơ sở, Sân, Đơn đặt, Sản phẩm...)
│   │   │   └── admin/              # Trang quản trị viên (AdminLayout, Duyệt đối tác, Sổ cái, Người dùng...)
│   │   ├── services/               # Tầng giao tiếp API
│   │   ├── store/                  # Zustand Stores (useAuthStore, useAppStore)
│   │   ├── types/                  # Định nghĩa TypeScript Interfaces
│   │   ├── utils/                  # Hàm tiện ích
│   │   ├── i18n.ts                 # Cấu hình đa ngôn ngữ (VI/EN)
│   │   ├── App.tsx                 # Định tuyến trung tâm (React Router v7)
│   │   └── main.tsx                # Entrypoint React
│   └── package.json
│
└── README.md                       # 📖 Tài liệu tổng quan dự án
```

---

## 🗄️ Tổng Quan Kiến Trúc Cơ Sở Dữ Liệu (25 Bảng / 7 Phân Hệ)

Hệ thống cơ sở dữ liệu PostgreSQL (`prisma/schema.prisma`) bao gồm **25 bảng (models)** và **17 kiểu liệt kê (enums)** chia thành 7 nhóm nghiệp vụ:

1. **Người dùng & Phân quyền (5 bảng):** `users`, `otp_verifications`, `admins`, `partner_profiles`, `user_sport_preferences`
2. **Địa giới & Cơ sở kinh doanh (8 bảng):** `location_provinces`, `location_wards`, `locations`, `categories`, `sports_pitches`, `amenities`, `location_amenities`, `products`, `product_categories`
3. **Lịch trình & Bảng giá (2 bảng):** `time_slots`, `slot_overrides`
4. **Đặt sân, Khuyến mãi & Thanh toán (6 bảng):** `bookings`, `booking_details`, `payments`, `promotions`, `promotion_redemptions`, `booking_status_history`
5. **Ghép đội & Cộng đồng (2 bảng):** `match_posts`, `match_participants`
6. **Chat & Giao tiếp (3 bảng):** `chat_rooms`, `chat_room_members`, `messages`
7. **Hỗ trợ, Đánh giá & Tài chính (4 bảng):** `disputes`, `partner_commission_bills`, `partner_ledger_entries`, `notifications`, `reviews`

---

## 🗺️ Hiện Trạng & Lộ Trình Phát Triển (Roadmap)

- [x] **Core DB Schema & Hardening:** Hoàn thiện 25 bảng dữ liệu chuẩn hóa, bổ sung `EXCLUDE USING gist` chống trùng lịch, 25+ ràng buộc `CHECK` bảo vệ dữ liệu tiền tệ/thời gian ở tầng PostgreSQL.
- [x] **Authentication & RBAC:** Đăng ký xác thực OTP, đăng nhập 3 vai trò (Client, Partner, Admin), phân quyền Guard toàn cục.
- [x] **Partner & Location Management:** Quản lý đa cơ sở, đa sân đấu, tiện ích, cấu hình khung giờ (`TimeSlot`), sản phẩm bán kèm (`Product`), trả lời đánh giá (`Review`).
- [x] **Booking Flow & Promotion Engine:** Báo giá tự động (`/bookings/quote`), tạo đơn đặt sân, áp mã khuyến mãi có hoàn lượt khi hủy, lưu vết `BookingStatusHistory` và hạch toán sổ cái `PartnerLedgerEntry`.
- [x] **Matchmaking & Multi-Room Chat:** Đăng bài tìm đối, xin vào đội, duyệt thành viên và chat trao đổi trực tiếp.
- [ ] **Real-Time WebSocket (Socket.IO):** Tích hợp `@nestjs/websockets` và `socket.io` để đẩy thông báo (`Notification`), tin nhắn chat và trạng thái giữ chỗ theo thời gian thực thay cho cơ chế HTTP Polling hiện tại.
- [ ] **Payment Gateway Webhooks:** Tích hợp tự động cổng thanh toán VNPAY / MoMo / VietQR Webhook đối soát tức thì.
- [ ] **Automated Monthly Commission Billing:** Cronjob tự động chốt sổ cái `PartnerLedgerEntry` hàng tháng thành hóa đơn `PartnerCommissionBill`.
