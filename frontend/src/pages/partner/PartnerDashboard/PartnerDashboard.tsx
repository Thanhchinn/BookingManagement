import React from 'react';
import { DollarSign, CalendarCheck, Trophy, Landmark, ArrowUpRight } from 'lucide-react';

interface PartnerDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ onNavigateTab }) => {
  // Hoạt động hôm nay
  const todaySchedules = [
    { id: '1', name: 'Nguyễn Văn Hải', time: '17:00 - 19:00', field: 'Sân Cầu Lông Pro A1', type: 'approved', price: '160.000đ' },
    { id: '2', name: 'Phạm Minh Quân', time: '18:00 - 20:00', field: 'Sân Bóng Đá B1', type: 'pending', price: '500.000đ' },
    { id: '3', name: 'Lê Hoàng Minh', time: '20:00 - 21:00', field: 'Sân Cầu Lông Pro A2', type: 'approved', price: '80.000đ' },
  ];

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* 1. KHU VỰC THẺ CHỈ SỐ STATS (GOLD THEME FOR PARTNER) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Thẻ Doanh Thu */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition duration-300">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Doanh thu hôm nay</span>
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">1.340.000đ</h3>
          <p className="text-[10px] text-emerald-400 m-0 mt-1 flex items-center gap-1 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+15.2% so với hôm qua</span>
          </p>
        </div>

        {/* Lượt đặt lịch */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition duration-300">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Tổng lịch đặt</span>
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">8 lượt đặt</h3>
          <p className="text-[10px] text-slate-500 m-0 mt-1">Lịch hoạt động cả ngày</p>
        </div>

        {/* Sân hoạt động */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition duration-300">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Sân đang hoạt động</span>
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">4 / 5 sân</h3>
          <p className="text-[10px] text-slate-500 m-0 mt-1">1 sân đang bảo dưỡng định kỳ</p>
        </div>

        {/* Lịch chưa duyệt */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition duration-300">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase text-amber-400">
            <span>Lịch chờ duyệt</span>
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
              <Landmark className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">2 yêu cầu</h3>
          <p className="text-[10px] text-amber-400 m-0 mt-1 font-semibold">Cần phê duyệt khung giờ</p>
        </div>

      </div>

      {/* 2. KHU VỰC TIỂU TIẾT HÔM NAY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lịch thi đấu hôm nay */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-white m-0">Lịch Hoạt Động Hôm Nay</h4>
              <p className="text-[10px] text-slate-500 m-0">Theo dõi dòng thời gian thi đấu và đặt lịch của khách hàng</p>
            </div>
            <button 
              onClick={() => onNavigateTab('bookings')}
              className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded-lg border border-slate-800 transition duration-150 cursor-pointer"
            >
              Quản lý tất cả lịch khách
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedules.map(sch => (
              <div key={sch.id} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    🕒
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white m-0">{sch.name}</h5>
                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{sch.field} ({sch.time})</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-amber-400 m-0 font-mono">{sch.price}</p>
                  <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                    sch.type === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {sch.type === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thống kê doanh thu nhanh */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h4 className="text-sm font-extrabold text-white m-0">Cơ Cấu Đặt Lịch Sân</h4>
            <p className="text-[10px] text-slate-500 m-0">Tỉ lệ lấp đầy các loại sân ngày hôm nay</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">🏸 Cụm Sân Cầu Lông</span>
                <span className="text-amber-400 font-bold">80% lắp đầy</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden flex">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">⚽ Cụm Sân Bóng Đá</span>
                <span className="text-amber-400 font-bold">60% lắp đầy</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden flex">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
