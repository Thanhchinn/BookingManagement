# 📖 Cẩm Nang Toàn Tập: Hướng Dẫn Sử Dụng Cấu Trúc Thư Mục & Components Frontend
### (Tài liệu chi tiết dành riêng cho Lập trình viên PHP/Laravel học React & TypeScript từ con số 0)

Chào bạn! Thư mục `frontend/src` của chúng ta đang sử dụng cấu trúc **Feature-Based Architecture** (Kiến trúc phân rã theo tính năng). Đây là cấu trúc chuẩn mực cấp doanh nghiệp, giúp quản lý hàng trăm component một cách khoa học, không bao giờ bị rối và cực kỳ dễ bảo trì.

Tài liệu này được biên soạn rất chi tiết, chứa **giải thích tường tận mọi khái niệm** kèm **ví dụ code hoàn chỉnh 100% có chú thích từng dòng** để bạn học tập và thực hành trực tiếp.

---

## 📂 1. Giải Thích Chi Tiết Vai Trò Của Từng Thư Mục

Để bạn dễ hình dung, chúng ta hãy so sánh các thư mục này với các khái niệm tương đương trong thế giới **Laravel/PHP**:

| Tên Thư Mục | Vai trò trong dự án React / TypeScript | Khái niệm tương đương trong Laravel |
| :--- | :--- | :--- |
| **`components/ui/`** | Nơi chứa các mảnh ghép giao diện nhỏ nhất, dùng chung cho toàn bộ dự án (như: Nút bấm, Ô nhập liệu, Nhãn trạng thái, Hộp thoại Modal). Chúng là các component "câm" (chỉ nhận dữ liệu từ cha truyền xuống và hiển thị, không chứa logic nghiệp vụ). | **Blade Components** dùng chung (`/resources/views/components/`) |
| **`components/layout/`** | Chứa khung giao diện chung xuất hiện ở hầu hết các trang (như: Thanh điều hướng Navbar, Chân trang Footer, Thanh bên Sidebar). | **Layout Files** (`layouts/app.blade.php`) |
| **`features/`** | **TRỌNG TÂM CỦA HỆ THỐNG:** Chia nhỏ dự án theo chức năng nghiệp vụ (Ví dụ: `auth` xử lý đăng nhập, `booking` xử lý đặt lịch, `sports-field` xử lý danh sách sân). Mỗi feature sẽ tự quản lý các Component, API, Types riêng biệt của nó. | **Domain / Feature Modules** hoặc các nhóm Service liên quan đến một đối tượng cụ thể. |
| **`context/`** | Nơi quản lý Trạng thái toàn cục (Global State) cần chia sẻ cho tất cả các trang truy cập (Ví dụ: thông tin đăng nhập của User hiện tại, cấu hình giao diện Sáng/Tối). | **Session / Auth Guard / Config** |
| **`pages/`** | Nơi chứa các trang chính của ứng dụng. Các file ở đây cực kỳ ngắn gọn, chúng đóng vai trò làm "chất keo" lắp ghép các Feature Components và Layout lại với nhau để tạo thành một màn hình hoàn chỉnh. | **Blade Views chính** được gọi bởi Controller (`homepage.blade.php`) |
| **`services/`** | Cấu hình gọi API lên Backend (Ví dụ: tạo Axios instance để đính kèm Token, định nghĩa các endpoint URL gọi lên NestJS). | **HTTP Client / Guzzle / API Integration Services** |
| **`types/`** | Định nghĩa kiểu dữ liệu (Interfaces/Types) của TypeScript dùng chung cho toàn dự án (Ví dụ: cấu hình kiểu dữ liệu của `User`, `Booking`). | **PHP Classes / Data Transfer Objects (DTOs)** |
| **`utils/`** | Các hàm tiện ích bổ trợ dùng chung (Ví dụ: hàm định dạng tiền tệ `150.000đ`, hàm định dạng ngày tháng). | **PHP Helper Functions** (`app/Helpers/`) |

---

## ⚡ 2. Luồng Đi Của Component (Xếp Hình Lego)

Trong React, cách tư duy tốt nhất là **"Tư duy Xếp hình Lego"**. Chúng ta sẽ đi từ các mảnh ghép nhỏ nhất, lắp ghép chúng thành các cụm tính năng, rồi đưa cụm tính năng đó vào trang web:

```text
[Mảnh UI nhỏ nhất]             [Cụm Tính Năng]              [Trang Web Hoàn Chỉnh]
components/ui/Button   ───┐
components/ui/Input    ───┼─>  features/booking/Form ───>  pages/BookingPage.tsx  ───>  App.tsx (Chạy ứng dụng)
components/ui/Badge    ───┘
```

---

## 💻 3. Ví Dụ Thực Chiến Hoàn Chỉnh (Chi Tiết Từng Dòng)

Dưới đây là mã nguồn đầy đủ của các file tương ứng trong cấu trúc. Mình đã viết **chú thích vô cùng chi tiết trên từng dòng** để bạn hiểu rõ ý nghĩa cú pháp TypeScript và React Hooks.

### 🧱 PHẦN 3.1: các UI Components Dùng Chung (Mảnh Lego Nhỏ)

#### Ví dụ 1: Tạo nút bấm dùng chung – `src/components/ui/Button.tsx`
*UI Component này kế thừa các thuộc tính của nút bấm HTML tiêu chuẩn nhưng bổ sung thêm tính năng đổi màu (`variant`) và vòng xoay tải dữ liệu (`isLoading`).*

```tsx
import React from 'react';

// ============================================================================
// 1. ĐỊNH NGHĨA PROPS (THAM SỐ TRUYỀN VÀO COMPONENT) BẰNG TYPESCRIPT
// ============================================================================
// Chúng ta mở rộng (extends) từ React.ButtonHTMLAttributes để nút bấm này
// thừa hưởng toàn bộ các thuộc tính mặc định của thẻ <button> trong HTML
// (như: type, onClick, disabled, value, v.v.)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Biến thể màu sắc của nút bấm (không bắt buộc vì có dấu ?)
  variant?: 'primary' | 'secondary' | 'danger';
  // Trạng thái hiển thị vòng xoay đang tải dữ liệu (loading spinner)
  isLoading?: boolean;
}

// ============================================================================
// 2. KHAI BÁO COMPONENT BUTTON
// ============================================================================
// React.FC là viết tắt của React.FunctionComponent.
// Chúng ta truyền <ButtonProps> để định kiểu dữ liệu nghiêm ngặt cho Props.
export const Button: React.FC<ButtonProps> = ({
  children,            // Slot nội dung lồng trong nút (tương đương biến $slot của Laravel Blade)
  variant = 'primary', // Giá trị mặc định nếu component cha không truyền variant
  isLoading = false,   // Mặc định không xoay loading
  className = '',      // Cho phép truyền thêm các class Tailwind khác từ ngoài vào để tùy biến
  ...props             // Thu thập tất cả các thuộc tính còn lại (onClick, disabled, v.v.) vào biến props
}) => {
  
  // A. Các class CSS mặc định áp dụng cho mọi loại Button
  const baseStyle = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  // B. Bảng màu tương ứng với các biến thể (variant)
  const variants = {
    primary: "px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10",
    secondary: "px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700",
    danger: "px-6 py-3 bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/10",
  };

  return (
    <button
      // Kết hợp class mặc định, class variant màu sắc, và class tùy biến từ ngoài vào
      className={`${baseStyle} ${variants[variant]} ${className}`}
      // Vô hiệu hóa click khi đang tải dữ liệu hoặc bị disabled
      disabled={isLoading || props.disabled}
      // Rải tất cả thuộc tính mặc định như onClick, type xuống thẻ button thật
      {...props}
    >
      {/* NẾU ĐANG LOADING: Hiển thị SVG vòng xoay tròn */}
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}

      {/* Hiển thị chữ/nội dung bên trong nút */}
      {children}
    </button>
  );
};
```

---

#### Ví dụ 2: Tạo ô nhập liệu dùng chung – `src/components/ui/Input.tsx`
*Một component Input chuẩn hóa, tự động đi kèm tiêu đề nhỏ (`label`) phía trên và khu vực hiển thị thông báo lỗi (`error`) phía dưới.*

```tsx
import React from 'react';

// ============================================================================
// ĐỊNH NGHĨA PROPS CHO INPUT
// ============================================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Dòng chữ tiêu đề nhỏ phía trên ô nhập
  error?: string; // Nội dung thông báo lỗi khi validate thất bại
}

// ============================================================================
// KHAI BÁO COMPONENT INPUT
// ============================================================================
// Sử dụng React.forwardRef để component cha có thể kiểm soát tiêu điểm (Focus)
// hoặc lấy giá trị input thông qua Ref nếu cần.
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col space-y-1.5 text-left">
      {/* 1. HIỂN THỊ DÒNG TIÊU ĐỀ (LABEL) */}
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* 2. THẺ INPUT CHÍNH CỦA HTML */}
      <input
        ref={ref}
        id={id}
        // Tự động đổi viền sang màu Đỏ nếu có lỗi (error) truyền vào
        className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-slate-200 focus:border-emerald-500'
        } ${className}`}
        {...props}
      />

      {/* 3. HIỂN THỊ DÒNG BÁO LỖI NẾU CÓ */}
      {error && (
        <span className="text-[11px] text-red-500 font-semibold">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
});

// Đặt tên định danh hiển thị trong React DevTools
Input.displayName = 'Input';
```

---

#### Ví dụ 3: Tạo nhãn trạng thái dùng chung – `src/components/ui/Badge.tsx`
*Component nhỏ hiển thị trạng thái đặt lịch (Ví dụ: Màu xanh cho 'Đã xác nhận', màu vàng cho 'Chờ duyệt').*

```tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status = 'info'
}) => {
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider select-none";

  const statusStyles = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`${baseStyle} ${statusStyles[status]}`}>
      {/* Hiển thị một chấm tròn nhỏ nhấp nháy phát sáng bên cạnh nhãn */}
      <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${
        status === 'success' ? 'bg-emerald-500' :
        status === 'warning' ? 'bg-amber-500 animate-pulse' :
        status === 'danger' ? 'bg-red-500' : 'bg-blue-500'
      }`}></span>
      {children}
    </span>
  );
};
```

---

### 📦 PHẦN 3.2: các Feature Components (Cụm Tính Năng Nghiệp Vụ)

#### Tạo Form đặt sân đấu thể thao – `src/features/booking/components/QuickBookingForm.tsx`
*Component này chứa logic nghiệp vụ thực sự: Validate thông tin, xử lý loading khi gửi request, lồng ghép các mảnh ghép UI Button, Input và Badge ở phần trên.*

```tsx
import React, { useState } from 'react';
// Import các mảnh ghép UI dùng chung từ thư mục components/ui
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';

export const QuickBookingForm: React.FC = () => {
  // ==========================================================================
  // KHAI BÁO STATE (Quản lý trạng thái dữ liệu nội bộ của component)
  // Tương tự như việc khai báo các thuộc tính public trong Livewire
  // ==========================================================================
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [sportType, setSportType] = useState('football'); // football hoặc badminton
  
  // Quản lý trạng thái xử lý logic
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // ==========================================================================
  // HÀM XỬ LÝ KHI NGƯỜI DÙNG GỬI YÊU CẦU ĐẶT LỊCH (SUBMIT FORM)
  // ==========================================================================
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trình duyệt load lại trang mặc định
    setValidationError('');

    // A. Validate dữ liệu nhập ở phía Client (Frontend Validation)
    if (!customerName.trim()) {
      setValidationError('Tên khách hàng không được bỏ trống!');
      return;
    }
    if (customerPhone.length < 10) {
      setValidationError('Số điện thoại liên hệ không hợp lệ!');
      return;
    }

    // B. Giả lập quá trình gửi API lên NestJS Backend mất 1.5 giây
    setIsLoading(true); // Bật vòng xoay loading trên nút bấm

    setTimeout(() => {
      setIsLoading(false); // Tắt loading
      setIsSuccess(true);  // Đánh dấu đặt sân thành công
    }, 1500);
  };

  const handleReset = () => {
    setCustomerName('');
    setCustomerPhone('');
    setSportType('football');
    setIsSuccess(false);
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      {/* Tiêu đề & Nhãn trạng thái */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 m-0">Đặt Sân Nhanh</h3>
          <p className="text-xs text-slate-400 mt-1">Cập nhật trực tiếp lên hệ thống</p>
        </div>
        
        {/* Sử dụng UI Badge để hiển thị trạng thái động */}
        <Badge status={isSuccess ? 'success' : 'warning'}>
          {isSuccess ? 'Thành công' : 'Đang xử lý'}
        </Badge>
      </div>

      {/* HIỂN THỊ THÀNH CÔNG NẾU ĐẶT SÂN HOÀN TẤT */}
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
            ✓
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Đăng ký thành công!</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chúc mừng <strong>{customerName}</strong>! Bạn đã đặt sân <strong>{sportType === 'football' ? 'Bóng đá' : 'Cầu lông'}</strong> thành công.
            </p>
          </div>
          {/* Dùng UI Button bản Secondary */}
          <Button variant="secondary" className="w-full" onClick={handleReset}>
            Đặt Tiếp Sân Khác
          </Button>
        </div>
      ) : (

        /* GIAO DIỆN NHẬP LIỆU FORM */
        <form onSubmit={handleBookingSubmit} className="space-y-4 text-left">
          
          {/* Thông báo lỗi validation */}
          {validationError && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-semibold">
              ⚠️ {validationError}
            </div>
          )}

          {/* Sử dụng UI Input của chúng ta */}
          <Input
            id="name"
            label="Họ và tên khách hàng"
            required
            placeholder="Ví dụ: Nguyễn Văn A..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <Input
            id="phone"
            label="Số điện thoại liên lạc"
            type="tel"
            required
            placeholder="Ví dụ: 0987654321..."
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />

          {/* Chọn loại bộ môn thể thao */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chọn Môn Thể Thao
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSportType('football')}
                className={`py-2 px-3 border rounded-xl text-xs font-bold transition cursor-pointer ${
                  sportType === 'football' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                ⚽ Sân Bóng Đá
              </button>
              <button
                type="button"
                onClick={() => setSportType('badminton')}
                className={`py-2 px-3 border rounded-xl text-xs font-bold transition cursor-pointer ${
                  sportType === 'badminton' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                🏸 Sân Cầu Lông
              </button>
            </div>
          </div>

          {/* Sử dụng UI Button với tính năng isLoading tự xoay xoắn */}
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading} 
            className="w-full text-sm py-3 mt-4"
          >
            ĐẶT LỊCH NGAY
          </Button>

        </form>
      )}

    </div>
  );
};
```

---

### 💻 PHẦN 3.3: Các Layout Components (Khung Giao Diện)

#### Tạo Thanh điều hướng trên cùng – `src/components/layout/Navbar.tsx`
```tsx
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo và Brand Name */}
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 text-white p-2 rounded-xl text-lg">
            🏆
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">SportZone</span>
        </div>

        {/* Các đường dẫn chính */}
        <div className="hidden md:flex space-x-8 text-sm font-bold text-slate-600">
          <a href="#home" className="text-emerald-600 hover:text-emerald-700 transition">Đặt Lịch Sân</a>
          <a href="#my-bookings" className="hover:text-slate-900 transition">Lịch Hẹn Của Tôi</a>
        </div>

        {/* Nút Đăng nhập/Đăng ký */}
        <div className="flex items-center space-x-3">
          <button className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 transition">
            Đăng nhập
          </button>
          <button className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition">
            Đăng ký
          </button>
        </div>

      </div>
    </nav>
  );
};
```

---

### 🖥️ PHẦN 3.4: Lắp Ghép Lên Trang Web (`src/pages/BookingPage.tsx`)
*Đây là "chất keo" kết hợp Layout và Feature.*

```tsx
import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { QuickBookingForm } from '../features/booking/components/QuickBookingForm';

export const BookingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Chèn Layout Navbar */}
      <Navbar />

      {/* 2. Phần nội dung chính (Grid layout) */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex-grow grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Cột trái: Thông tin sân đấu */}
        <div className="md:col-span-2 space-y-6 text-left">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-black text-slate-900 m-0">Sân Cỏ Nhân Tạo & Nhà Thi Đấu Chuẩn Quốc Tế</h2>
            <p className="text-sm text-slate-500">📍 Quận Bình Thạnh, Thành phố Hồ Chí Minh</p>
            <hr className="border-slate-100" />
            <p className="text-slate-600 text-sm leading-relaxed">
              Chào mừng bạn đến với khu liên hợp thể thao SportZone. Tại đây, chúng tôi cung cấp các dịch vụ sân bóng cỏ nhân tạo chất lượng cao 5 người/7 người và các sân cầu lông trong nhà đạt tiêu chuẩn chuyên nghiệp. Hệ thống đặt sân trực tuyến hoạt động real-time giúp bạn đặt chỗ nhanh chóng chỉ trong 5 giây.
            </p>
          </div>
        </div>

        {/* Cột phải: Chèn Cụm tính năng Form Đặt Lịch */}
        <div className="w-full">
          <QuickBookingForm />
        </div>

      </main>

      {/* 3. Chân trang Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs mt-auto">
        <p>© 2026 SportZone Booker. Toàn bộ bản quyền được bảo lưu.</p>
      </footer>
    </div>
  );
};
```

---

## 🚀 4. Kế Hoạch Thực Hành Cho Bạn:

Chúng ta sẽ cùng học tập bằng cách **lắp ráp thực tế** từng file trên theo thứ tự như sau:

1.  **Ngày 1:** Chúng ta sẽ tạo ra các file UI nhỏ trước ở thư mục `components/ui/` (`Button.tsx`, `Badge.tsx`, `Input.tsx`).
2.  **Ngày 2:** Tạo cụm tính năng đặt lịch ở thư mục `features/` (`QuickBookingForm.tsx`).
3.  **Ngày 3:** Tạo Layout (`Navbar.tsx`) và lắp ghép thành trang hoàn chỉnh ở `pages/BookingPage.tsx`.
4.  **Ngày 4:** Kết nối với Backend NestJS và Prisma để xử lý lưu vào Database thật!

Bạn thấy kế hoạch và tài liệu ví dụ này thế nào? Bạn đã sẵn sàng để chúng ta tạo tệp tin **UI Component đầu tiên** là chiếc nút bấm `Button.tsx` để thực hành chưa? Hãy nhắn cho mình nhé!
