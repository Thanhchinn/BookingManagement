import React from 'react';
import { StatCard } from '../../../features/admin/components/StatCard';
import { DollarSign, CalendarCheck, Users2, Landmark } from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  // Hoạt động đặt lịch & dòng tiền vừa diễn ra
  const recentActivities = [
    { id: '1', type: 'booking', detail: 'Nguyễn Văn A vừa đặt Sân Cầu Lông ProZone', time: '5 phút trước', amount: '+180.000đ' },
    { id: '2', type: 'cashout', detail: 'Chủ sân Stadium A yêu cầu rút tiền đối soát', time: '15 phút trước', amount: '-5.000.000đ', status: 'Chờ duyệt' },
    { id: '3', type: 'partner', detail: 'Đối tác mới "Sân Cỏ Bình Lợi" nộp hồ sơ xin liên kết', time: '1 giờ trước', status: 'Đang xử lý' },
    { id: '4', type: 'booking', detail: 'Trần Thị B vừa đặt Sân Tennis ATP', time: '2 giờ trước', amount: '+350.000đ' },
  ];

  return (
    <div className="space-y-8">
      
      {/* 1. KHU VỰC THẺ CHỈ SỐ STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu tháng"
          value="45.200.000đ"
          trend="12.4%"
          trendType="up"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Tổng lượt đặt sân"
          value="320 lượt"
          trend="8.2%"
          trendType="up"
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Chủ sân (Đối tác)"
          value="45 đối tác"
          trend="24.1%"
          trendType="up"
          icon={Users2}
          color="amber"
        />
        <StatCard
          title="Yêu cầu đối soát rút tiền"
          value="8 lệnh"
          trend="8 lệnh mới"
          trendType="neutral"
          icon={Landmark}
          color="red"
        />
      </div>

      {/* 2. KHU VỰC BẢNG HOẠT ĐỘNG GẦN ĐÂY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-white m-0">Nhật Ký Hoạt Động Gần Đây</h4>
            <p className="text-[10px] text-slate-500 m-0">Giám sát giao dịch, đặt lịch và phê duyệt trong thời gian thực</p>
          </div>
          <button 
            onClick={() => onNavigateTab('analytics')}
            className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded-lg border border-slate-800 transition duration-150 cursor-pointer"
          >
            Xem tất cả báo cáo
          </button>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-thead">
                <th className="admin-table-th">Loại hình</th>
                <th className="admin-table-th">Nội dung hoạt động</th>
                <th className="admin-table-th">Thời gian</th>
                <th className="admin-table-th text-right">Biến động ví</th>
              </tr>
            </thead>
            <tbody className="admin-table-tbody">
              {recentActivities.map(activity => (
                <tr key={activity.id} className="admin-table-tr">
                  <td className="admin-table-td font-semibold">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      activity.type === 'booking' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20' :
                      activity.type === 'cashout' ? 'bg-red-950/60 text-red-400 border border-red-500/20' :
                      'bg-amber-950/60 text-amber-400 border border-amber-500/20'
                    }`}>
                      {activity.type === 'booking' ? 'Đặt sân' : activity.type === 'cashout' ? 'Rút tiền' : 'Đối tác'}
                    </span>
                  </td>
                  <td className="admin-table-td admin-table-wrap text-white font-bold">{activity.detail}</td>
                  <td className="admin-table-td text-slate-500">{activity.time}</td>
                  <td className={`admin-table-td text-right font-extrabold ${
                    activity.amount?.startsWith('+') ? 'text-emerald-400' : 
                    activity.amount?.startsWith('-') ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {activity.amount || (activity.status ? `[${activity.status}]` : '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
