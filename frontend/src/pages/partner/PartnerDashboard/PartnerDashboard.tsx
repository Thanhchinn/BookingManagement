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
        <div className="sz-kpi bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition duration-500"></div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-wider">
            <span>Doanh thu hôm nay</span>
            <span className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20 shrink-0">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0 font-mono">1.340.000đ</h3>
          <p className="text-[10px] text-emerald-400 m-0 mt-2.5 flex items-center gap-1 font-extrabold">
            <ArrowUpRight className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>+15.2% so với hôm qua</span>
          </p>
        </div>

        {/* Lượt đặt lịch */}
        <div className="sz-kpi bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition duration-500"></div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-wider">
            <span>Tổng lịch đặt</span>
            <span className="p-2 bg-amber-500/10 rounded-xl text-amber-550 border border-amber-500/20 shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0 font-mono">8 lượt đặt</h3>
          <p className="text-[10px] text-slate-500 m-0 mt-2.5 font-bold">Lịch hoạt động cả ngày</p>
        </div>

        {/* Sân hoạt động */}
        <div className="sz-kpi bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition duration-500"></div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-wider">
            <span>Sân đang hoạt động</span>
            <span className="p-2 bg-amber-550/10 rounded-xl text-amber-500 border border-amber-500/20 shrink-0">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0 font-mono">4 / 5 sân</h3>
          <p className="text-[10px] text-slate-500 m-0 mt-2.5 font-bold">1 sân bảo dưỡng định kỳ</p>
        </div>

        {/* Lịch chưa duyệt */}
        <div className="sz-kpi bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition duration-500"></div>
          <div className="flex items-center justify-between text-[10px] text-amber-400 font-black uppercase tracking-wider">
            <span>Lịch chờ duyệt</span>
            <span className="p-2 bg-amber-550/10 rounded-xl text-amber-500 border border-amber-500/20 shrink-0">
              <Landmark className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0 font-mono">2 yêu cầu</h3>
          <p className="text-[10px] text-amber-400 m-0 mt-2.5 font-extrabold">Cần phê duyệt khung giờ</p>
        </div>

      </div>

      {/* 2. KHU VỰC TIỂU TIẾT HÔM NAY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lịch thi đấu hôm nay */}
        <div className="lg:col-span-2 sz-panel p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h4 className="text-sm font-black text-white m-0 uppercase tracking-wider">Lịch Hoạt Động Hôm Nay</h4>
              <p className="text-[10px] text-slate-500 m-0 mt-0.5">Theo dõi dòng thời gian thi đấu và đặt lịch của khách hàng</p>
            </div>
            <button 
              onClick={() => onNavigateTab('bookings')}
              className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-350 font-black uppercase tracking-wider px-3.5 py-2 rounded-xl border border-slate-800 transition duration-150 cursor-pointer"
            >
              Quản lý lịch khách
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedules.map(sch => {
              const isApproved = sch.type === 'approved';
              return (
                <div 
                  key={sch.id} 
                  className={`flex items-center justify-between p-4 bg-slate-950/60 border rounded-2xl hover:border-slate-800 transition-all duration-200 ${
                    isApproved ? 'border-l-4 border-l-emerald-500/50 border-slate-850' : 'border-l-4 border-l-amber-500/50 border-slate-855'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isApproved ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    }`}>
                      {isApproved ? '✅' : '⏳'}
                    </div>
                    <div className="text-left">
                      <h5 className="text-xs font-bold text-white m-0">{sch.name}</h5>
                      <span className="text-[10px] text-slate-550 font-bold block mt-0.5">{sch.field} <span className="font-mono text-slate-400 ml-1">({sch.time})</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-amber-400 m-0 font-mono">{sch.price}</p>
                    <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded mt-1.5 ${
                      isApproved ? 'bg-emerald-950/60 border border-emerald-900/60 text-emerald-400' : 'bg-amber-950/60 border border-amber-900/60 text-amber-400'
                    }`}>
                      {isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thống kê doanh thu nhanh */}
        <div className="sz-panel p-6 space-y-6">
          <div className="text-left">
            <h4 className="text-sm font-black text-white m-0 uppercase tracking-wider">Cơ Cấu Đặt Lịch Sân</h4>
            <p className="text-[10px] text-slate-500 m-0 mt-0.5">Tỉ lệ lấp đầy các loại sân ngày hôm nay</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">🏸 Cụm Sân Cầu Lông</span>
                <span className="text-amber-400 font-black font-mono">80% lấp đầy</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full border border-slate-850 overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">⚽ Cụm Sân Bóng Đá</span>
                <span className="text-amber-400 font-black font-mono">60% lấp đầy</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full border border-slate-850 overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
