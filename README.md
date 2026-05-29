# 🏆 SportBooker - Hệ Thống Đặt Lịch Sân Thể Thao Real-Time Mượt Mà

**SportBooker** là nền tảng quản lý và đặt lịch sân thể thao trực tuyến thời gian thực (đá bóng, cầu lông, tennis, bóng rổ,...). Hệ thống được thiết kế nhằm tối ưu hóa trải nghiệm người dùng, hiển thị trạng thái sân trống tức thì (real-time) để tránh trùng lịch hẹn và mang lại tốc độ phản hồi cực kỳ nhanh chóng.

---

## ⚡ Các Tính Năng Nổi Bật (Features)

1.  **⚡ Trải Nghiệm Đặt Sân Real-Time:**
    - Sử dụng **WebSockets (Socket.io)** giúp cập nhật trạng thái sân trống/đã đặt lập tức mà không cần F5 tải lại trang.
    - Khi có khách hàng khác đang đặt hoặc đã đặt thành công một khung giờ, giao diện của tất cả người dùng khác sẽ được cập nhật trạng thái "Đang được chọn" hoặc "Đã đặt" ngay lập tức.
2.  **📅 Lịch Đặt Sân Trực Quan (Interactive Scheduler):**
    - Bảng lưới (Grid) hiển thị khung giờ trống theo ngày cực kỳ trực quan và mượt mà.
    - Hỗ trợ kéo/thả hoặc click chọn nhanh nhiều khung giờ liên tục.
3.  **🔍 Tìm Kiếm & Bộ Lọc Thông Minh:**
    - Tìm kiếm sân theo khu vực gần bạn nhất.
    - Lọc theo bộ môn thể thao (Bóng đá, Cầu lông, Tennis, Pickleball,...), khung giờ hoạt động và mức giá.
4.  **👤 Phân Quyền Người Dùng Rõ Ràng (Roles & Auth):**
    - **Khách hàng (Customer):** Tìm kiếm sân, đặt lịch, thanh toán, quản lý lịch sử đặt chỗ.
    - **Chủ sân (Court Owner):** Quản lý danh sách sân, cấu hình giá theo giờ vàng/giờ thường, duyệt lịch đặt, xem thống kê doanh thu.
    - **Quản trị viên (Admin):** Kiểm duyệt chủ sân, quản lý danh mục môn thể thao, giám sát toàn bộ hệ thống.
5.  **🔔 Hệ Thống Thông Báo Tức Thời:**
    - Gửi thông báo đẩy (Push Notification) real-time khi đặt lịch thành công hoặc có thay đổi trạng thái sân.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### 🎨 Frontend (Client-side)

- **React 19** + **TypeScript** + **Vite** (Khởi chạy cực nhanh).
- **Tailwind CSS** (Thiết kế giao diện hiện đại, responsive mượt mà).
- **Socket.io Client** (Xử lý giao tiếp Real-time với Backend).
- **Lucide React** (Bộ icons chất lượng cao).

### ⚙️ Backend (Server-side & Database)

- **NestJS** (Framework Node.js mạnh mẽ, cấu trúc modular vững chắc như Laravel).
- **Prisma ORM** (Công cụ tương tác database an toàn về kiểu dữ liệu).
- **PostgreSQL** (Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, hiệu năng cao).
- **Socket.io (WebSockets)** (Xử lý kết nối và đồng bộ dữ liệu thời gian thực).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án Từ Đầu

### 📋 Yêu cầu hệ thống

- Đã cài đặt **Node.js** (Phiên bản khuyên dùng: `v18` hoặc `v20` trở lên).
- Đã cài đặt cơ sở dữ liệu **PostgreSQL** (Có thể chạy cục bộ hoặc qua Docker).

---

### 1. Cấu Hình & Chạy Backend (NestJS)

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
DATABASE_URL="postgresql://postgres:matkhaucuaban@localhost:5432/sport_booking_db?schema=public"
JWT_SECRET="bi-mat-quan-trong-cua-ban-12345"
```

_(Thay thế `postgres:matkhaucuaban` bằng tài khoản và mật khẩu PostgreSQL của bạn)_

#### **Bước 1.3: Khởi tạo Cơ sở dữ liệu với Prisma**

Chạy lệnh migration để tự động tạo cấu trúc bảng trong PostgreSQL:

```bash
npx prisma migrate dev --name init
```

#### **Bước 1.4: Khởi động Server Backend phát triển**

```bash
npm run start:dev
```

👉 Server Backend sẽ chạy tại: `http://localhost:3000`

---

### 2. Cấu Hình & Chạy Frontend (ReactJS)

Mở một cửa sổ terminal mới, truy cập vào thư mục `frontend`:

#### **Bước 2.1: Cài đặt thư viện dependencies**

```bash
cd frontend
npm install
```

#### **Bước 2.2: Cài đặt Tailwind CSS (nếu chưa cấu hình)**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

_Cấu hình file `tailwind.config.js` nội dung như sau:_

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

_Thêm các dòng sau vào đầu file `src/index.css` để kích hoạt Tailwind:_

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

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

- [ ] **Giai đoạn 1 (Core DB Schema & Prisma Migration):** Đồng bộ hóa đầy đủ 29 bảng trong file `schema.prisma`. Chạy migration tạo bảng hoàn chỉnh trong PostgreSQL.
- [ ] **Giai đoạn 2 (Core REST APIs & Auth):** Phát triển hệ thống đăng nhập, đăng ký và phân quyền cho 3 nhóm vai trò (User, Partner, Admin).
- [ ] **Giai đoạn 3 (Lịch Trống & Xử Lý Đặt Sân Real-Time):** Tạo thuật toán tính toán lịch trống động kết hợp cơ chế khóa slot giữ chỗ 10 phút. Tích hợp WebSockets/Socket.IO để cập nhật real-time.
- [ ] **Giai đoạn 4 (Sản Phẩm Đi Kèm & Cổng Thanh Toán):** Cho phép đặt thêm sản phẩm dịch vụ phụ trợ. Tích hợp cổng thanh toán MoMo/VNPAY và xử lý Webhook.
- [ ] **Giai đoạn 5 (Cộng Đồng Ghép Đội & Chat Nhóm):** Lập trình tính năng Matchmaking và tự động tạo phòng Chat room Socket.IO.
- [ ] **Giai đoạn 6 (Disputes & Đối Soát Tài Chính):** Hoàn thiện module giải quyết khiếu nại của Admin và rút tiền ví đối tác.

---
