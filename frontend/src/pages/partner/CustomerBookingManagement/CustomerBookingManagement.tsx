import React, { useState, useEffect } from 'react';
import { CalendarRange, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { PartnerFilterBar } from '../components/PartnerFilterBar';

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
  paymentMethod?: string;
  paymentStatus?: string;
}

export const CustomerBookingManagement: React.FC = () => {
  // Danh sách lịch hẹn khách hàng đặt tải từ backend
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Tải danh sách đơn đặt từ backend
  useEffect(() => {
    const fetchPartnerBookings = async () => {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3000/bookings/partner-bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          if (res.status === 401) {
            window.dispatchEvent(new CustomEvent('user-force-logout'));
            return;
          }
          throw new Error('Không thể tải danh sách đặt sân.');
        }
        const data = await res.json();
        
        const mapped: BookingItem[] = data.map((b: any) => {
          let uiStatus: 'pending' | 'approved' | 'cancelled' = 'pending';
          if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
            uiStatus = 'approved';
          } else if (b.status === 'CANCELLED') {
            uiStatus = 'cancelled';
          }

          return {
            id: b.id,
            customerName: b.user?.fullName || 'Khách hàng',
            customerPhone: b.user?.phone || 'N/A',
            fieldName: b.sportsPitch?.name || 'Sân đấu',
            sportType: b.sportsPitch?.category === 'badminton' ? 'Cầu lông' : (b.sportsPitch?.category === 'football' ? 'Bóng đá' : 'Tennis'),
            date: b.bookingDate,
            timeSlot: `${b.startTime} - ${b.endTime}`,
            totalPrice: b.finalPrice,
            status: uiStatus,
            paymentMethod: b.paymentMethod,
            paymentStatus: b.paymentStatus,
          };
        });

        setBookings(mapped);
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu đặt sân:', err);
      }
    };

    fetchPartnerBookings();
  }, [refreshTrigger]);

  // Tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'cancelled'>('all');

  // Xử lý phê duyệt lịch đặt
  const handleApprove = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn PHÊ DUYỆT lịch đặt sân này của khách hàng?')) {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      try {
        const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'CONFIRMED' }),
        });

        if (!res.ok) {
          throw new Error('Phê duyệt thất bại.');
        }

        toast.success('Đã phê duyệt lịch đặt sân');
        setRefreshTrigger(prev => prev + 1);
      } catch (err: any) {
        toast.error(err.message || 'Lỗi phê duyệt.');
      }
    }
  };

  // Xử lý hủy lịch đặt
  const handleCancel = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn HỦY lịch đặt sân này của khách hàng?')) {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      try {
        const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'CANCELLED' }),
        });

        if (!res.ok) {
          throw new Error('Hủy lịch thất bại.');
        }

        toast.info('Đã hủy lịch đặt sân');
        setRefreshTrigger(prev => prev + 1);
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi hủy lịch.');
      }
    }
  };

  // Xác nhận đã nhận chuyển khoản ngân hàng
  const handleConfirmBankPayment = async (id: string, nextStatus: 'PAID' | 'PARTIALLY_PAID') => {
    if (window.confirm(`Bạn xác nhận đã nhận đủ tiền chuyển khoản cho đơn đặt sân này (${nextStatus === 'PAID' ? 'Trả hết 100%' : 'Đặt cọc 30%'})?`)) {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      try {
        const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentStatus: nextStatus }),
        });

        if (!res.ok) {
          throw new Error('Không thể cập nhật trạng thái thanh toán.');
        }

        toast.success('Đã xác nhận thanh toán thành công!');
        setRefreshTrigger(prev => prev + 1);
      } catch (err: any) {
        toast.error(err.message || 'Lỗi xác nhận thanh toán.');
      }
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

      {/* Bộ lọc dùng chung */}
      <PartnerFilterBar
        mode="bookings"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusValue={statusFilter}
        onStatusChange={(val) => setStatusFilter(val as any)}
      />

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
                    <td className="admin-table-td text-right">
                      <div className="font-mono text-right">
                        <p className="m-0 font-black text-white">{b.totalPrice.toLocaleString('vi-VN')}đ</p>
                        <span className={`text-[9px] font-bold block mt-0.5 ${
                          b.paymentStatus === 'PAID' ? 'text-emerald-400' :
                          b.paymentStatus === 'PARTIALLY_PAID' ? 'text-blue-400' :
                          b.paymentStatus === 'REFUNDED' ? 'text-slate-400' : 'text-amber-500'
                        }`}>
                          {b.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                           b.paymentMethod === 'CASH' ? 'Tiền mặt' : b.paymentMethod || ''} 
                          {b.paymentStatus === 'PAID' ? ' (Đã thu)' :
                           b.paymentStatus === 'PARTIALLY_PAID' ? ' (Đã cọc)' :
                           b.paymentStatus === 'REFUNDED' ? ' (Đã hoàn)' : ' (Chưa thu)'}
                        </span>
                      </div>
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
                        {b.paymentMethod === 'BANK_TRANSFER' && b.paymentStatus !== 'PAID' && b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleConfirmBankPayment(b.id, 'PAID')}
                            className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-[9px] font-bold text-emerald-400 rounded border border-emerald-500/25 transition cursor-pointer"
                            title="Xác nhận đã nhận đủ tiền chuyển khoản"
                          >
                            Xác nhận CK
                          </button>
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
