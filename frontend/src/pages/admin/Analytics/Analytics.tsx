import React from 'react';
import { RevenueChart } from '../../../features/admin/components/RevenueChart';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-8">
      
      {/* Tiêu đề trang Thống kê */}
      <div className="text-left">
        <h3 className="text-lg font-black text-white m-0 tracking-tight">Thống Kê Hoạt Động Doanh Nghiệp</h3>
        <p className="text-xs text-slate-500 m-0">Biểu đồ tỉ lệ đặt sân, doanh thu phân bổ và ngày hoạt động cao điểm</p>
      </div>

      {/* Grid: Trái là Biểu đồ cột, Phải là Báo cáo số liệu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cột trái (Lg: 7 cột): Biểu đồ chính */}
        <div className="lg:col-span-7">
          <RevenueChart />
        </div>

        {/* Cột phải (Lg: 5 cột): Các thông số phụ trợ */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-white m-0">Phân Tích Khung Giờ & Ngày Hot</h4>
            <p className="text-[10px] text-slate-500 m-0">Đánh giá hành vi đặt sân của khách hàng để tối ưu hóa giá giờ vàng</p>
            
            <hr className="border-slate-800" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Khung giờ vàng phổ biến nhất</span>
                <strong className="text-emerald-400">17:00 - 21:00</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Ngày cao điểm đặt sân</span>
                <strong className="text-blue-400">Thứ Bảy & Chủ Nhật</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Giá trị trung bình 1 đơn đặt</span>
                <strong className="text-amber-400">220.000đ / giờ</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tỉ lệ lấp đầy sân trung bình</span>
                <strong className="text-purple-400">76.4% công suất</strong>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
            <p className="text-[10px] text-emerald-400 font-bold m-0 uppercase tracking-wider">💡 Đề xuất tối ưu hóa doanh thu</p>
            <p className="text-[10px] text-slate-400 leading-normal m-0">
              Hãy gợi ý cho các đối tác tăng 10% - 15% đơn giá thuê sân vào khung giờ <strong>18:00 - 20:00 thứ Bảy</strong> để tối đa hóa doanh thu khi lượng cầu đạt mức tối đa.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
