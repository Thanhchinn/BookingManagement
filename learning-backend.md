# 🖥️ Hướng Dẫn Học Backend (NodeJS + NestJS + Prisma ORM + PostgreSQL) Cho Laravel & PHP Developer

Chào bạn! Nếu bạn đã quen thuộc với **Laravel và PHP**, bạn đã sở hữu một lợi thế cực kỳ to lớn. **NestJS** chính là "chân ái" của các nhà phát triển Laravel khi chuyển sang thế giới Node.js. Cú pháp và cách tổ chức thư mục của NestJS chịu ảnh hưởng sâu sắc bởi các nguyên lý thiết kế hướng đối tượng (OOP), Dependency Injection giống hệt như Laravel!

Dưới đây là cẩm nang so sánh chi tiết và lộ trình học Backend từ con số 0 dành riêng cho bạn.

---

## 🧠 1. Chuyển Đổi Tư Duy: Từ Laravel sang NestJS

NestJS có cấu trúc rất chặt chẽ. Hãy xem bảng đối chiếu khái niệm dưới đây để thấy sự tương đồng 90%:

| Khái niệm trong Laravel (PHP) | Khái niệm tương đương trong NestJS (TypeScript/Node) | Giải thích |
| :--- | :--- | :--- |
| **`routes/api.php` & Controllers** | **NestJS Controllers (`@Controller()`, `@Get()`, `@Post()`)** | Định nghĩa các endpoint API bằng cách sử dụng các `@Decorators` trực tiếp trên Class và Hàm (rất trực quan). |
| **Form Requests (`php artisan make:request`)** | **DTO (Data Transfer Object) + `class-validator`** | Tạo Class định nghĩa kiểu dữ liệu gửi lên và sử dụng các thư viện validation như `@IsString()`, `@IsEmail()` để kiểm tra dữ liệu đầu vào. |
| **Services / Repositories / DI** | **NestJS Services (`@Injectable()`) & Dependency Injection** | Lớp xử lý logic nghiệp vụ chính (Business Logic). NestJS tự động quản lý và tiêm (inject) các Service này vào Controller thông qua `constructor`. |
| **Service Providers & Container** | **NestJS Modules (`@Module()`)** | Nơi gom nhóm các Controller và Service liên quan lại với nhau (Ví dụ: `AuthModule`, `BookingModule`). |
| **Middlewares** | **NestJS Guards, Interceptors, Middlewares** | Các lớp trung gian để xử lý Authentication, Authorization (như kiểm tra Token JWT), ghi log hoặc định dạng dữ liệu trả về. |
| **Artisan CLI (`php artisan make:...`)** | **Nest CLI (`nest generate ...` hoặc `nest g ...`)** | Công cụ dòng lệnh mạnh mẽ để tự động tạo code mẫu cho Controller, Service, Module vô cùng nhanh chóng. |
| **Eloquent ORM & Migrations** | **Prisma ORM & Prisma Migrations (`schema.prisma`)** | Công cụ tương tác Database. Khác với Eloquent viết migration bằng code PHP, Prisma sử dụng một file khai báo cấu trúc duy nhất (`schema.prisma`) rồi tự động tạo các bảng và sinh ra kiểu dữ liệu (Types) an toàn. |

---

## 📅 2. Lộ Trình Học Chi Tiết 4 Tuần (Từ Con Số 0)

### 🔴 TUẦN 1: Tổng Quan Node.js & Cấu Trúc Dự Án NestJS
*   **Mục tiêu:** Hiểu cách hoạt động bất đồng bộ (Asynchronous) của Node.js, luồng chạy ứng dụng NestJS.
*   **Các nội dung trọng tâm:**
    *   **Node.js Runtime:** Sự khác biệt giữa môi trường chạy PHP (FPM đa luồng) và Node.js (đơn luồng, non-blocking I/O).
    *   **Cấu trúc thư mục NestJS:**
        *   `src/main.ts`: File khởi tạo server, cấu hình Port, CORS, Global Pipes.
        *   `src/app.module.ts`: Root Module kết nối toàn bộ ứng dụng.
        *   `src/app.controller.ts` & `src/app.service.ts`: Điểm tiếp nhận request và xử lý logic mặc định.
    *   **Sử dụng Nest CLI:** Làm quen với các lệnh tạo file:
        *   `nest g mo users` (Tạo Users Module)
        *   `nest g co users` (Tạo Users Controller)
        *   `nest g s users` (Tạo Users Service)

---

### 🔵 TUẦN 2: Thiết Kế Database (Prisma ORM & PostgreSQL)
> [!IMPORTANT]
> Prisma là ORM hiện đại và cực kỳ dễ học đối với người dùng Eloquent. Thay vì viết nhiều file Migration riêng lẻ, bạn chỉ cần quản lý cấu trúc bảng trong duy nhất một tệp tin `schema.prisma`.

*   **Mục tiêu:** Cài đặt PostgreSQL, thiết kế các bảng dữ liệu cho hệ thống Booking và chạy Migrations thành công.
*   **Các nội dung trọng tâm:**
    *   **Khai báo Connection:** Cấu hình link database PostgreSQL trong file `.env` (`DATABASE_URL`).
    *   **Thiết kế Schema (`prisma/schema.prisma`):** Định nghĩa các Model và mối quan hệ (1-n, n-n):
        *   `User` (Khách hàng & Admin)
        *   `Service` (Dịch vụ spa/phòng khám)
        *   `Staff` (Nhân viên thực hiện)
        *   `Booking` (Thông tin đặt lịch hẹn)
    *   **Prisma Migrations:** Chạy lệnh để Prisma tạo bảng tự động trong Database:
        ```bash
        npx prisma migrate dev --name init
        ```
    *   **Prisma Client:** Sử dụng `PrismaClient` trong NestJS để thực hiện các câu lệnh Query (`findMany`, `findUnique`, `create`, `update`, `delete`).

---

### 🟡 TUẦN 3: Xây Dựng RESTful API & Validation (DTO)
*   **Mục tiêu:** Viết các API CRUD cho Dịch vụ, Nhân viên và xử lý logic Đặt lịch nâng cao.
*   **Các nội dung trọng tâm:**
    *   **Routing & Decorators:** Sử dụng `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Body()`, `@Param()`, `@Query()`.
    *   **Validation với DTO (Data Transfer Object):** 
        *   Cài đặt `class-validator` và `class-transformer`.
        *   Tạo file `create-booking.dto.ts` để kiểm tra định dạng dữ liệu khách gửi lên (ví dụ: ngày đặt lịch phải là ngày trong tương lai, email phải đúng định dạng).
    *   **Xử lý Logic Đặt Lịch (Booking Logic):**
        *   Kiểm tra nhân viên có lịch làm việc vào giờ đó không.
        *   Kiểm tra khung giờ đó đã bị khách khác đặt trùng chưa (Conflict Resolution).
        *   Lưu thông tin đặt lịch mới vào database.

---

### 🟢 TUẦN 4: Authentication (Bảo Mật JWT) & Hoàn Thiện API
*   **Mục tiêu:** Bảo mật hệ thống, phân quyền Admin/Customer và kết nối với Frontend.
*   **Các nội dung trọng tâm:**
    *   **Bảo mật mật khẩu:** Mã hóa mật khẩu bằng thư viện `bcrypt`.
    *   **JSON Web Token (JWT):** Sử dụng `@nestjs/jwt` để cấp phát token khi đăng nhập thành công (tương tự như Laravel Sanctum phát hành Token).
    *   **NestJS Guards:** Tạo `@UseGuards(JwtAuthGuard)` để bảo vệ các API nhạy cảm (Ví dụ: Chỉ Admin mới được thêm/sửa/xóa dịch vụ).
    *   **CORS (Cross-Origin Resource Sharing):** Bật CORS trong `main.ts` để cho phép React Frontend gửi request tới NestJS Backend thành công.

---

## 🛠️ 3. Thực Hành Ngay Trên Dự Án Hiện Tại

Thư mục `backend` của bạn đã được cấu hình sẵn NestJS + Prisma. Hãy thực hiện các bước sau để thiết lập cơ sở dữ liệu đầu tiên:

### Bước 1: Khởi động PostgreSQL Local
Bạn có thể dùng phần mềm **XAMPP** (nếu có tích hợp PostgreSQL), cài đặt **PostgreSQL** trực tiếp từ trang chủ, hoặc sử dụng **Docker** để chạy một container Postgres nhanh chóng.
Link kết nối PostgreSQL mặc định trong `.env` sẽ có dạng:
```env
DATABASE_URL="postgresql://postgres:matkhaucuaban@localhost:5432/booking_db?schema=public"
```

### Bước 2: Thiết kế Database Schema
Hãy mở file `backend/prisma/schema.prisma` và sửa lại nội dung để định nghĩa các bảng mẫu cho hệ thống Đặt Lịch như sau:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String
  password  String
  role      String    @default("CUSTOMER") // CUSTOMER, ADMIN, STAFF
  bookings  Booking[]
  createdAt DateTime  @default(now())
}

model Service {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  price       Float
  duration    Int       // Thời lượng thực hiện dịch vụ (tính bằng phút)
  bookings    Booking[]
}

model Booking {
  id          Int      @id @default(autoincrement())
  bookingDate DateTime // Ngày giờ đặt lịch
  status      String   @default("PENDING") // PENDING, CONFIRMED, COMPLETED, CANCELLED
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  serviceId   Int
  service     Service  @relation(fields: [serviceId], references: [id])
  createdAt   DateTime @default(now())
}
```

### Bước 3: Chạy Migration để tạo bảng thực tế
Trong terminal tại thư mục `backend`, chạy lệnh:
```bash
npm install
npx prisma migrate dev --name init
```
Lệnh này sẽ quét file `schema.prisma`, tự động kết nối PostgreSQL để tạo các bảng `User`, `Service`, `Booking` và tự động sinh ra bộ thư viện Client để bạn viết code truy vấn database an toàn về mặt kiểu dữ liệu!

### Bước 4: Chạy Server NestJS Backend ở môi trường Local:
```bash
npm run start:dev
```
👉 Server của bạn sẽ chạy tại địa chỉ `http://localhost:3000`. Khi bạn sửa đổi bất kỳ code nào trong thư mục `src`, server sẽ tự động restart và cập nhật ngay lập tức!

---

## 📚 4. Tài Nguyên Học Tập Tốt Nhất (Miễn Phí)

1.  **Trang chủ NestJS (Tài liệu cực kỳ chi tiết, dễ hiểu):** [docs.nestjs.com](https://docs.nestjs.com)
2.  **Trang chủ Prisma (Tài liệu hướng dẫn trực quan):** [prisma.io/docs](https://www.prisma.io/docs)
3.  **Video hướng dẫn học NestJS Tiếng Việt:**
    *   Kênh Youtube **Hỏi Dân IT** (Eric) có chuỗi video học NestJS và Prisma cực kỳ bài bản từ cơ bản đến nâng cao cho người mới bắt đầu.
    *   Kênh Youtube **F8 Fullstack** cũng có các bài viết định hướng rất tốt về Node.js.
