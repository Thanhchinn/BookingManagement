# 🏆 Cẩm Nang Kiến Trúc: Cấu Trúc Component Tối Ưu Chuẩn Senior Developer
### (Dựa trên sơ đồ thiết kế module Admin và Client cao cấp)

Chào bạn! Nhận định của bạn cực kỳ chính xác. Cấu trúc thư mục trước đó của chúng ta mới chỉ ở mức "phân chia cơ bản". Khi dự án phình to ra thực tế, cấu trúc được trình bày trong hai bức ảnh bạn gửi mới chính là **kiến trúc đỉnh cao (Feature-Driven / Domain-Driven Architecture)** mà các **Senior Developer** và **Tech Lead** tin dùng trong các dự án quy mô lớn.

Hôm nay, mình sẽ giải thích chi tiết tại sao cấu trúc này lại tối ưu, triết lý đằng sau nó là gì, và cách các tệp tin liên kết với nhau trong thực tế!

---

## 🎨 1. Sơ Đồ Tổng Quan & Bản Đồ Kiến Trúc

### 🏢 Phân Hệ Admin (Kiến trúc Độc lập - High Cohesion)
```text
frontend/src/
├── features/
│   └── admin/                      # Module quản trị độc lập (Chứa logic đặc thù)
│       ├── components/             # Các mảnh ghép giao diện nhỏ dành riêng cho Admin
│       │   ├── AdminSidebar.tsx    # Thanh menu bên trái (Dashboard, Users, Partners...)
│       │   ├── AdminTopbar.tsx     # Thanh đầu trang (Profile Admin, Thông báo, Đăng xuất)
│       │   ├── StatCard.tsx        # Thẻ hiển thị số liệu nhanh (Doanh thu, Người dùng...)
│       │   ├── UserTable.tsx       # Bảng hiển thị thông tin & khóa/mở người dùng
│       │   ├── PartnerApprovalTable.tsx # Bảng duyệt đối tác đăng ký sân đấu mới
│       │   └── RevenueChart.tsx    # Biểu đồ thống kê doanh thu cột/đường
│       ├── hooks/
│       │   └── useAdminData.ts     # Custom hook tập trung gọi API & quản lý state cho Admin
│       └── services/
│           └── adminApi.ts         # Khai báo các hàm Axios gọi API riêng biệt lên NestJS
└── pages/
    └── admin/                      # Các trang Shell (Vỏ bọc) lắp ghép các component Admin
        ├── AdminLayout.tsx         # Khung Layout chung (Sidebar + Topbar + Outlet)
        ├── Dashboard.tsx           # Trang tổng quan chung
        ├── Analytics.tsx           # Trang thống kê chi tiết
        ├── UserManagement.tsx      # Trang quản lý người dùng
        └── PartnerManagement.tsx   # Trang duyệt & quản lý đối tác chủ sân
```

### 👤 Phân Hệ Client & Shared UI (Mảnh Ghép Toàn Cục)
```text
frontend/src/
├── components/                     # THÀNH PHẦN DÙNG CHUNG TOÀN HỆ THỐNG
│   ├── layout/
│   │   ├── Navbar.tsx              # Thanh điều hướng của Client (Tìm sân, Đăng ký đối tác)
│   │   └── Footer.tsx              # Chân trang (Liên hệ, chính sách)
│   └── ui/
│       ├── Button.tsx              # Nút bấm tái sử dụng cao cấp
│       └── InputField.tsx          # Ô nhập liệu chuẩn hóa có icon & label kèm theo
├── features/
│   ├── sports-field/               # MODULE TÍNH NĂNG SÂN THỂ THAO
│   │   ├── components/
│   │   │   ├── CategoryList.tsx    # Danh sách chọn môn thể thao (Bóng đá, Cầu lông...)
│   │   │   ├── FieldCard.tsx       # Card hiển thị thông tin 1 sân (Giá, điểm, vị trí)
│   │   │   └── FieldList.tsx       # Lưới hiển thị danh sách nhiều FieldCard
│   │   └── services/
│   │       └── fieldApi.ts         # API lấy danh sách sân, lọc theo bộ môn/vị trí
│   └── partner/                    # MODULE CHUYỂN ĐỔI CHỦ SÂN (PARTNER)
│       └── components/
│           └── PartnerRegisterForm.tsx # Form điền thông tin xin nâng cấp lên Chủ Sân
└── pages/
    └── client/                     # CÁC TRANG CỦA KHÁCH HÀNG
        ├── Home.tsx                # Trang chủ (Lắp ghép Navbar + Hero + FieldList + Footer)
        └── BecomePartner.tsx       # Trang Đăng ký Đối tác (chứa PartnerRegisterForm)
```

---

## 💡 2. 3 Triết Lý Vàng Giúp Cấu Trúc Này Trở Nên "Tối Ưu"

Các Senior Developer luôn thiết kế cấu trúc dựa trên các nguyên lý phần mềm kinh điển:

### 🌟 Triết lý 1: "Folder-as-a-Module" (Mỗi thư mục là một hộp kín)
Nhìn vào thư mục `features/admin/`, bạn sẽ thấy nó tự quản lý **Components** của nó, tự quản lý **Hooks** của nó, và tự quản lý **Services** của nó. 
*   **Tại sao tối ưu?** Khi bạn cần sửa logic lấy dữ liệu admin, bạn chỉ việc vào đúng thư mục `features/admin/` để sửa. Không cần phải nhảy qua nhảy lại giữa thư mục `src/hooks` toàn cục hay `src/api` toàn cục xa xôi. Nó cô lập hoàn toàn sự ảnh hưởng (Low Coupling).

### 🌟 Triết lý 2: "Layout Composition" (Lắp ghép Layout lồng nhau)
Hãy nhìn vào `pages/admin/AdminLayout.tsx`. Đây là một điểm cực kỳ thông minh của Senior. File này sẽ định nghĩa khung xương: bên trái là Sidebar, bên phải là Topbar và một khu vực rỗng (gọi là `Outlet` hoặc `children`).
*   **Tại sao tối ưu?** Các trang con như `Dashboard.tsx`, `UserManagement.tsx` sẽ được lồng vào bên trong khu vực rỗng đó. Nhờ vậy, chúng ta không cần phải import đi import lại thanh Sidebar và Topbar ở mỗi trang con nữa! Code cực kỳ DRÝ (Don't Repeat Yourself).

### 🌟 Triết lý 3: "Smart vs Dumb Components" (Component Thông Minh vs Component Câm)
*   **Dumb Components (Nằm ở `components/ui/`):** Như `Button.tsx`, `InputField.tsx`. Chúng không biết gì về API, không biết gì về Database. Chúng chỉ nhận các thuộc tính như `onClick`, `placeholder` để hiển thị và tái sử dụng ở bất cứ đâu (Client dùng được, Admin dùng được).
*   **Smart Components (Nằm ở `features/`):** Như `UserTable.tsx` hay `QuickBookingForm.tsx`. Chúng trực tiếp kết nối với các custom hooks (`useAdminData`) để lấy dữ liệu thật, xử lý logic xóa người dùng, duyệt đối tác.

---

## 🔗 3. Cách Kết Nối Mã Nguồn Trong Thực Tế (Code Flow)

Hãy xem cách Senior kết nối các file này lại với nhau qua ví dụ cụ thể về **Trang Quản lý Người dùng (UserManagement)**:

### 🔹 Bước 1: Khai báo API (`features/admin/services/adminApi.ts`)
Đây là nơi chịu trách nhiệm duy nhất cho việc định nghĩa kết nối mạng (Network):
```typescript
import axios from 'axios';

// Định nghĩa hàm lấy danh sách người dùng từ NestJS API
export const fetchUsersApi = async () => {
  const response = await axios.get('/api/admin/users');
  return response.data; // Trả về danh sách user [{ id: 1, name: 'An' }, ...]
};
```

### 🔹 Bước 2: Tạo Custom Hook (`features/admin/hooks/useAdminData.ts`)
Custom hook đóng vai trò như một **Controller** trung gian, quản lý State và gọi API:
```typescript
import { useState, useEffect } from 'react';
import { fetchUsersApi } from '../services/adminApi';

export const useAdminData = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tự động gọi API khi component sử dụng Hook này được kích hoạt
  useEffect(() => {
    fetchUsersApi()
      .then(data => setUsers(data))
      .finally(() => setIsLoading(false));
  }, []);

  return { users, isLoading };
};
```

### 🔹 Bước 3: Viết Bảng Hiển Thị (`features/admin/components/UserTable.tsx`)
Bảng này chỉ lo việc lặp dữ liệu (`map`) ra giao diện HTML:
```tsx
import React from 'react';
import { Button } from '../../../components/ui/Button'; // Tái sử dụng UI Button

interface UserTableProps {
  users: Array<{ id: number; name: string; email: string }>;
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-800 text-slate-400">
          <th className="py-3 px-4">Tên</th>
          <th className="py-3 px-4">Email</th>
          <th className="py-3 px-4">Hành động</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} className="border-b border-slate-900 hover:bg-slate-900/40">
            <td className="py-3 px-4">{user.name}</td>
            <td className="py-3 px-4">{user.email}</td>
            <td className="py-3 px-4">
              <Button variant="danger" className="text-xs px-3 py-1.5 rounded-lg">Khóa</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### 🔹 Bước 4: Lắp ráp vào Trang hoàn chỉnh (`pages/admin/UserManagement.tsx`)
Trang này cực kỳ ngắn gọn, nó chỉ gọi Hook để lấy dữ liệu, rồi truyền dữ liệu đó vào Bảng `UserTable`:
```tsx
import React from 'react';
import { UserTable } from '../../features/admin/components/UserTable';
import { useAdminData } from '../../features/admin/hooks/useAdminData';

export const UserManagement: React.FC = () => {
  // 1. Gọi hook trung gian để lấy dữ liệu
  const { users, isLoading } = useAdminData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white m-0">Quản Lý Người Dùng</h2>
        <p className="text-xs text-slate-500">Xem danh sách và phân quyền tài khoản thành viên</p>
      </div>

      {/* 2. Hiển thị trạng thái loading hoặc truyền dữ liệu vào bảng */}
      {isLoading ? (
        <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
      ) : (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900">
          <UserTable users={users} />
        </div>
      )}
    </div>
  );
};
```

---

## 🚀 4. Kế Hoạch Tổ Chức Lại Dự Án Theo Chuẩn Tối Ưu Này

Chúng ta sẽ nâng cấp cấu trúc hiện tại của dự án theo đúng bản thiết kế tối ưu này bằng cách:

1.  **Dọn dẹp & Di chuyển:**
    *   Di chuyển `Navbar.tsx` và `Footer.tsx` vào thư mục [src/components/layout/](file:///c:/xampp/htdocs/ME/BookingManagement/frontend/src/components/layout/). (Đã hoàn thành!)
    *   Di chuyển `Button.tsx` và `Badge.tsx` vào thư mục [src/components/ui/](file:///c:/xampp/htdocs/ME/BookingManagement/frontend/src/components/ui/). (Đã hoàn thành!)
2.  **Khởi tạo trang Home của Client chuẩn Senior:**
    *   Tạo file `src/pages/client/Home.tsx` và di chuyển logic trang chủ từ `App.tsx` vào đây.
3.  **Xây dựng cấu trúc Admin mới:**
    *   Tạo file layout chung `src/pages/admin/AdminLayout.tsx` để bao bọc.
    *   Tạo trang quản lý người dùng `src/pages/admin/UserManagement.tsx` và các component tương ứng ở `features/admin/components/`.

Cấu trúc này thực sự quá đẹp và sạch sẽ đúng không bạn! Bạn có muốn mình hỗ trợ **chuyển đổi trang chủ hiện tại thành trang `src/pages/client/Home.tsx`** theo chuẩn Senior này trước để dọn dẹp sạch sẽ file `App.tsx` không? Hãy cho mình biết nhé!
