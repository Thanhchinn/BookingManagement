import React from 'react';

export const RevenueChart: React.FC = () => {
  // Dữ liệu giả lập thống kê các môn thể thao được đặt lịch nhiều nhất
  const chartData = [
    { name: 'Bóng đá', count: 320, percentage: 80, color: 'bg-emerald-500 shadow-emerald-500/20', icon: '⚽' },
    { name: 'Cầu lông', count: 420, percentage: 100, color: 'bg-blue-500 shadow-blue-500/20', icon: '🏸' },
    { name: 'Tennis', count: 180, percentage: 45, color: 'bg-amber-500 shadow-amber-500/20', icon: '🎾' },
    { name: 'Pickleball', count: 240, percentage: 60, color: 'bg-purple-500 shadow-purple-500/20', icon: '🏓' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left space-y-6 shadow-sm">
      
      {/* Tiêu đề biểu đồ */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-extrabold text-slate-950 m-0">Tỉ Lệ Đặt Lịch Theo Môn Thể Thao</h4>
          <p className="text-[10px] text-slate-500 m-0">Thống kê tổng số lượt đặt sân trong 30 ngày qua</p>
        </div>
        <span className="text-[10px] bg-slate-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-slate-200">
          Real-time
        </span>
      </div>

      {/* Danh sách cột biểu đồ nằm dọc (đối với giao diện nhỏ) và ngang */}
      <div className="space-y-4">
        {chartData.map(item => (
          <div key={item.name} className="space-y-1.5">
            
            {/* Tên bộ môn và chỉ số số lượng */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
              <span className="text-slate-600 font-bold">{item.count} lượt đặt</span>
            </div>

            {/* Thanh hiển thị tỉ lệ phần trăm phát sáng */}
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${item.color} shadow-lg`} 
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>

          </div>
        ))}
      </div>

      {/* Phần cuối chú thích */}
      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>Tổng lượt đặt: <strong>1,160 lượt</strong></span>
        <span>Bộ môn hot nhất: <strong className="text-blue-650">Cầu lông (🏸)</strong></span>
      </div>

    </div>
  );
};
