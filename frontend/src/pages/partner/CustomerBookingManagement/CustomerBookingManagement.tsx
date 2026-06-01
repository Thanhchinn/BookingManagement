import React, { useState } from 'react';
import { CalendarRange, Search, Check, X } from 'lucide-react';

interface BookingItem {
  id: string;
  customerName: string;
  customerPhone: string;
  fieldName: string;
  sportType: string;
  date: string;
  timeSlot: string;
  totalPrice: number;
  status: 'pending' | 'approved' | 'cancelled';
}

export const CustomerBookingManagement: React.FC = () => {
  // Danh sách lịch hẹn khách hàng đặt tại cụm sân này
  const [bookings, setBookings] = useState<BookingItem[]>([
    { id: 'BK001', customerName: 'Nguyễn Văn Hải', customerPhone: '0909111222', fieldName: 'Sân Cầu Lông Pro A1', sportType: 'Cầu lông', date: '2026-05-30', timeSlot: '17:00 - 19:00', totalPrice: 160000, status: 'approved' },
    { id: 'BK002', customerName: 'Phạm Minh Quân', customerPhone: '0912333444', fieldName: 'Sân Bóng Đá 5 Người B1', sportType: 'Bóng đá', date: '2026-05-30', timeSlot: '18:00 - 20:00', totalPrice: 500000, status: 'pending' },
    { id: 'BK003', customerName: 'Trần Hoàng Long', customerPhone: '0977888999', fieldName: 'Sân Cầu Lông Pro A2', sportType: 'Cầu lông', date: '2026-05-31', timeSlot: '08:00 - 10:00', totalPrice: 160000, status: 'pending' },
    { id: 'BK004', customerName: 'Vũ Thị Hạnh', customerPhone: '0966444555', fieldName: 'Sân Cầu Lông Pro A3', sportType: 'Cầu lông', date: '2026-05-29', timeSlot: '19:00 - 21:00', totalPrice: 160000, status: 'cancelled' },
  ]);

  // Tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'cancelled'>('all');

  // Xử lý phê duyệt lịch đặt
  const handleApprove = (id: string) => {
    if (window.confirm('Bạn có chắc muốn PHÊ DUYỆT lịch đặt sân này của khách hàng?')) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    }
  };

  // Xử lý hủy lịch đặt
  const handleCancel = (id: string) => {
    if (window.confirm('Bạn có chắc muốn HỦY lịch đặt sân này của khách hàng?')) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    }
  };

  // Lọc dữ liệu
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm) ||
      b.fieldName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-amber-500" />
            Quản Lý Lịch Hẹn Khách Hàng
          </h3>
          <p className="text-xs text-slate-400 m-0">Kiểm soát danh sách khách hàng đặt lịch, phê duyệt khung giờ và tiếp nhận thông báo trực tuyến</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="md:col-span-2 flex items-center gap-3 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 w-full">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên khách, số điện thoại, tên sân..." 
            className="bg-transparent border-0 text-xs text-slate-200 focus:outline-none placeholder-slate-700 w-full"
          />
        </div>
        <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-2 py-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase px-2">Trạng thái:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-transparent border-0 text-xs text-white focus:outline-none cursor-pointer font-bold w-full"
          >
            <option value="all">Tất Cả</option>
            <option value="pending">⏳ Chờ phê duyệt</option>
            <option value="approved">🟢 Đã phê duyệt</option>
            <option value="cancelled">🔴 Đã hủy bỏ</option>
          </select>
        </div>
      </div>

      {/* Bảng đặt lịch */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-thead">
                <th className="admin-table-th">Khách hàng</th>
                <th className="admin-table-th">Sân đã chọn</th>
                <th className="admin-table-th w-28 text-center">Thể Loại</th>
                <th className="admin-table-th w-44">Thời gian đặt</th>
                <th className="admin-table-th w-32 text-right">Tổng thanh toán</th>
                <th className="admin-table-th w-32 text-center">Trạng thái</th>
                <th className="admin-table-th w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="admin-table-tbody">
              {filteredBookings.length > 0 ? (
                filteredBookings.map(b => (
                  <tr key={b.id} className="admin-table-tr">
                    <td className="admin-table-td">
                      <div>
                        <p className="admin-table-td-bold m-0">{b.customerName}</p>
                        <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{b.customerPhone}</span>
                      </div>
                    </td>
                    <td className="admin-table-td font-semibold text-slate-200">
                      {b.fieldName}
                    </td>
                    <td className="admin-table-td text-center">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950 text-slate-400 border border-slate-855">
                        {b.sportType}
                      </span>
                    </td>
                    <td className="admin-table-td">
                      <div className="text-left font-mono">
                        <p className="m-0 text-slate-300 font-bold">{b.timeSlot}</p>
                        <p className="m-0 text-[10px] text-slate-500">{b.date}</p>
                      </div>
                    </td>
                    <td className="admin-table-td text-right font-black text-white font-mono">
                      {b.totalPrice.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="admin-table-td text-center">
                      {b.status === 'approved' && (
                        <span className="admin-table-badge admin-table-badge-emerald">Đã duyệt</span>
                      )}
                      {b.status === 'pending' && (
                        <span className="admin-table-badge admin-table-badge-amber">Chờ duyệt</span>
                      )}
                      {b.status === 'cancelled' && (
                        <span className="admin-table-badge admin-table-badge-red">Đã hủy</span>
                      )}
                    </td>
                    <td className="admin-table-td text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(b.id)}
                              className="admin-table-btn-icon text-emerald-400 hover:text-emerald-300"
                              title="Phê duyệt lịch"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCancel(b.id)}
                              className="admin-table-btn-icon admin-table-btn-icon-danger"
                              title="Hủy lịch đặt"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {b.status === 'approved' && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="admin-table-btn-icon admin-table-btn-icon-danger"
                            title="Hủy lịch"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="text-[10px] text-slate-600 font-bold">Lịch đã hủy</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy lịch đặt nào khớp với tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
