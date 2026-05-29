import React from 'react';

// ============================================================================
// KHAI BÁO COMPONENT FOOTER (CHÂN TRANG)
// ============================================================================
export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto text-xs font-sans">
      {/* 
        - bg-slate-900: Màu nền xám đen tối giản, hiện đại
        - text-slate-400: Màu chữ xám nhạt dễ đọc
        - mt-auto: Tự động đẩy footer xuống đáy trang nếu nội dung trang quá ít
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Lưới thông tin chân trang (Responsive Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Cột 1: Giới thiệu thương hiệu */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚽</span>
              <span className="text-base font-extrabold text-white tracking-tight">SportZone</span>
            </div>
            <p className="leading-relaxed text-slate-400 text-xs">
              Hệ thống đặt sân thể thao trực tuyến thời gian thực chuyên nghiệp và hiện đại nhất. Giúp bạn tìm và giữ sân đấu yêu thích chỉ trong vài cú click chuột.
            </p>
          </div>

          {/* Cột 2: Các liên kết nhanh */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Hỗ Trợ & Quy Định</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#rules" className="hover:text-white transition duration-150">Quy định hủy đặt sân</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition duration-150">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition duration-150">Điều khoản dịch vụ</a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Liên Hệ Với Chúng Tôi</h4>
            <p className="leading-relaxed text-slate-400 text-xs">
              📍 123 Đường Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh <br />
              📞 Hotline đặt sân: 1900.6789 (Hỗ trợ 24/7) <br />
              ✉️ Email: support@sportzone.vn
            </p>
          </div>

        </div>

        {/* Đường kẻ mỏng phân cách ở chân trang */}
        <hr className="border-slate-800" />

        {/* Dòng bản quyền và mạng xã hội */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 SportZone Booker. Thiết kế giao diện React 19 + Tailwind CSS v4.</p>
          <div className="flex space-x-4">
            <a href="#facebook" className="hover:text-white transition duration-150">Facebook</a>
            <a href="#youtube" className="hover:text-white transition duration-150">Youtube</a>
            <a href="#tiktok" className="hover:text-white transition duration-150">Tiktok</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
