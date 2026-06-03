# 🚀 Hướng Dẫn Kiểm Thử API Quản Lý Bộ Môn Trên Postman

Vì các API **Thêm (POST)**, **Sửa (PATCH)**, và **Xóa (DELETE)** bộ môn thể thao đều được bảo vệ bởi bộ gác cổng `JwtAuthGuard` của Admin, bạn cần phải thực hiện **đăng nhập trước** để lấy token JWT, sau đó cấu hình Token này trong các yêu cầu gửi đi tiếp theo.

Dưới đây là 6 bước kiểm thử chuẩn chỉnh trên Postman:

---

## 🔑 BƯỚC 1: Đăng nhập Admin lấy Access Token (JWT)

Để có quyền Thêm/Sửa/Xóa, bạn cần lấy mã thông hành `access_token`.

* **HTTP Method:** `POST`
* **URL:** `http://localhost:3000/auth/admin/login`
* **Headers:**
  * Key: `Content-Type` | Value: `application/json`
* **Body:** Chọn kiểu **`raw`** và chọn định dạng **`JSON`**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
* **Response:** Hệ thống sẽ trả về mã Token như bên dưới:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "1",
      "username": "admin",
      "fullName": "Administrator",
      "role": "SUPERADMIN"
    }
  }
  ```
> ⚠️ **HÀNH ĐỘNG:** Bạn hãy **bôi đen và sao chép (Copy)** toàn bộ chuỗi ký tự trong trường `"access_token"`.

---

## 🛠️ BƯỚC 2: Cấu hình Authorization trên Postman cho API Thêm/Sửa/Xóa

Để không bị báo lỗi `401 Unauthorized` khi gọi API chỉnh sửa dữ liệu, hãy cấu hình Token vừa copy vào Postman:

1. Tại cửa sổ tạo request mới của API Thêm/Sửa/Xóa, chuyển sang Tab **`Authorization`** (ngay dưới ô nhập URL).
2. Tại dòng **`Type`**, nhấp chọn menu xổ xuống và chọn **`Bearer Token`**.
3. Tại ô **`Token`** ở bên phải, hãy **Dán (Paste)** chuỗi `access_token` mà bạn đã sao chép ở Bước 1 vào.

---

## 🆕 BƯỚC 3: Test API Thêm Mới Bộ Môn (Create Category)

* **HTTP Method:** `POST`
* **URL:** `http://localhost:3000/categories`
* **Authorization:** Cấu hình **`Bearer Token`** (như đã hướng dẫn ở Bước 2).
* **Headers:** `Content-Type: application/json`
* **Body:** Chọn **`raw`** -> **`JSON`** và nhập dữ liệu mẫu:
  ```json
  {
    "name": "Bóng bàn",
    "slug": "bong-ban",
    "icon": "🏓",
    "colorBg": "bg-sky-500/10",
    "colorText": "text-sky-400",
    "isActive": true,
    "sortOrder": 3
  }
  ```
* Bấm **`Send`**. Kết quả trả về mã `201 Created` kèm thông tin bộ môn đã tạo thành công trong DB!

---

## 🌍 BƯỚC 4: Test API Xem Danh Sách Bộ Môn (Get All - Public API)

API này là công khai nên **KHÔNG cần cấu hình Token**.

* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/categories`
* Bấm **`Send`**. Bạn sẽ thấy bộ môn vừa tạo xuất hiện trong mảng JSON trả về.
> ⚠️ **HÀNH ĐỘNG:** Xem cột `"id"` của bộ môn bạn vừa tạo (ví dụ: `"id": "6"` hoặc tương tự) để dùng cho việc kiểm thử Sửa và Xóa dưới đây.

---

## ✏️ BƯỚC 5: Test API Cập Nhật Bộ Môn (Update Category)

* **HTTP Method:** `PATCH`
* **URL:** `http://localhost:3000/categories/<ID_BỘ_MÔN_CỦA_BẠN>` (Ví dụ: `http://localhost:3000/categories/6`)
* **Authorization:** Cấu hình **`Bearer Token`** (như Bước 2).
* **Headers:** `Content-Type: application/json`
* **Body:** Chọn **`raw`** -> **`JSON`** để cập nhật thông tin (bạn chỉ cần gửi các trường cần cập nhật):
  ```json
  {
    "name": "Bóng bàn siêu cấp",
    "colorBg": "bg-rose-500/10",
    "colorText": "text-rose-400",
    "sortOrder": 1
  }
  ```
* Bấm **`Send`**. Kiểm tra kết quả trả về mã `200 OK` với thông tin đã được thay đổi.

---

## ❌ BƯỚC 6: Test API Xóa Bộ Môn (Delete Category)

* **HTTP Method:** `DELETE`
* **URL:** `http://localhost:3000/categories/<ID_BỘ_MÔN_CỦA_BẠN>` (Ví dụ: `http://localhost:3000/categories/6`)
* **Authorization:** Cấu hình **`Bearer Token`** (như Bước 2).
* Bấm **`Send`**. Kết quả trả về mã `200 OK` với thông điệp:
  ```json
  {
    "message": "Đã xóa thành công bộ môn thể thao có ID: 6"
  }
  ```
* Bạn gọi lại API `GET /categories` ở Bước 4 để xác thực rằng bộ môn này đã biến mất hoàn toàn!
