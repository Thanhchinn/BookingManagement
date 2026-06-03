# 🛡️ Giải Thích Kiến Trúc: Đăng Nhập Admin & Vòng Đời Request (Request Lifecycle) trong NestJS

Khi lập trình viên quen thuộc với Node.js truyền thống (Express.js) chuyển sang NestJS, họ thường hỏi: *"Đã viết Middleware cho chức năng này chưa?"*. 

Câu trả lời ngắn gọn là: **Trong NestJS, chúng ta không dùng Middleware truyền thống để xác thực hay kiểm duyệt dữ liệu login. Thay vào đó, NestJS cung cấp các công cụ mạnh mẽ và chuyên biệt hơn rất nhiều gọi là Pipes và Guards.**

Tài liệu này sẽ giải thích chi tiết tại sao lại như vậy, và hệ thống của bạn đang bảo mật như thế nào.

---

## 🗺️ 1. Bản Đồ Vòng Đời Request trong NestJS

Trong Express, mọi thứ đều là Middleware chạy tuần tự. Nhưng trong NestJS, một Request đi qua **5 chốt chặn bảo mật** chuyên biệt trước khi đến được cơ sở dữ liệu:

```text
Request ──> [1. Middlewares] ──> [2. Guards] ──> [3. Interceptors] ──> [4. Pipes] ──> [Controller Action]
                                                                                            │
Response <── [Exception Filters] <──────────────────────────────────────────────────────────┘
```

Mỗi thành phần có một nhiệm vụ cực kỳ chuyên sâu:
1. **Middlewares:** Chạy đầu tiên, dùng để parse body, logs, CORS (Ví dụ: `app.enableCors()`).
2. **Guards (Bộ gác cổng):** Quyết định request có quyền truy cập hay không (Kiểm tra Token JWT).
3. **Interceptors:** Biến đổi dữ liệu gửi đi hoặc nhận về, ghi log thời gian chạy.
4. **Pipes (Ống lọc dữ liệu):** Kiểm duyệt dữ liệu đầu vào có hợp lệ không (Kiểm tra DTO, chặn spam).
5. **Exception Filters:** Bắt các lỗi xảy ra và dịch thành mã JSON thân thiện trả về Client.

---

## 🔑 2. Đoạn API Login Admin Có Dùng Middleware/Guard Không?

### Tại sao endpoint `POST /auth/admin/login` không dùng Guard xác thực JWT?
Endpoint đăng nhập là một **Public API (API công cộng)**.
* **Lý do:** Khi một admin chuẩn bị đăng nhập, họ **chưa có Token JWT**. Nếu chúng ta áp dụng Middleware hoặc Guard bắt buộc phải có Token JWT lên chính API này, admin sẽ bị chặn ngay lập tức (Lỗi 401 Unauthorized) và **không bao giờ có thể đăng nhập được**.
* Do đó, Route `/auth/admin/login` phải được mở công khai để admin gửi username/password lên đổi lấy Token.

### Nhưng chúng ta có "Middleware" kiểm duyệt dữ liệu đầu vào (Validation Pipe)!
Tuy không dùng Guard kiểm tra token, nhưng để bảo mật tuyệt đối, chúng ta đã áp dụng **Validation Pipe** (đóng vai trò như một Middleware lọc dữ liệu tối tân):

```typescript
// Trong main.ts chúng ta đã thiết lập:
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

* **Cơ chế hoạt động:** Khi request gửi dữ liệu lên, "Middleware lọc" này sẽ ép dữ liệu đó vào khuôn của `LoginAdminDto`. Nếu hacker cố tình gửi thêm các trường lạ (như `{ role: 'SUPERADMIN' }` hòng tự nâng quyền), Validation Pipe sẽ lập tức lọc bỏ hoàn toàn các trường đó, bảo vệ máy chủ khỏi lỗi chèn tham số (Mass Assignment).

---

## 🛡️ 3. Chúng Ta Đã Viết "Middleware" Xác Thực Ở Đâu?

Đối với các API **sau khi đăng nhập** (như Xem danh sách sân, duyệt chủ sân, thanh toán...), chúng ta cần bảo vệ chúng bằng cách yêu cầu có Token JWT hợp lệ. 

Chúng ta đã viết sẵn hai thành phần cực kỳ quan trọng làm nhiệm vụ của một **Authentication Middleware**:

### 1. Chiến lược giải mã Token (`src/auth/strategies/jwt.strategy.ts`)
Đây là bộ xử lý sẽ tự động trích xuất token JWT từ Header `Authorization: Bearer <token>`, giải mã chữ ký số và kiểm tra xem token còn hạn hay không.
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Tự động giải mã chữ ký số của Token
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
```

### 2. Bộ gác cổng bảo mật (`src/auth/guards/jwt-auth.guard.ts`)
Đây chính là "Middleware" bảo vệ các route nhạy cảm. Nó hoạt động giống như một chiếc Barie kiểm tra vé.
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

## 🚀 4. Cách Sử Dụng Bộ Gác Cổng (Guard) Để Bảo Vệ Các API Admin

Khi bạn phát triển các tính năng quản trị khác (ví dụ: `SportsManagementController`), bạn chỉ cần đặt decorator `@UseGuards(JwtAuthGuard)` lên trên đầu Controller hoặc Action đó. NestJS sẽ tự động kích hoạt "Middleware bảo mật" để chặn các truy cập trái phép:

### Ví dụ bảo vệ API:
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/sports')
@UseGuards(JwtAuthGuard) // 🛡️ Kích hoạt chốt chặn bảo mật cho toàn bộ các API bên dưới!
export class SportsManagementController {
  
  @Get('list')
  async getAllSports() {
    return { message: 'Chỉ có Admin đã đăng nhập và có token hợp lệ mới xem được danh sách này!' };
  }
}
```

---

## 💎 Tóm Lại:
* **API Đăng nhập:** Không cần xác thực (vì là Public), nhưng được bảo vệ nghiêm ngặt bằng **Validation Pipe** (Middleware lọc dữ liệu chống hack tham số).
* **API Nghiệp vụ sau đăng nhập:** Được bảo vệ hoàn hảo bằng **`JwtAuthGuard`** (chốt chặn phân quyền JWT tối tân của NestJS).
