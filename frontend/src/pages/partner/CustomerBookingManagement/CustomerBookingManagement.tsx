import React, { useState, useEffect } from 'react';
import { CalendarRange, Check, X, Eye, Trash2, CheckCircle, RefreshCw, DollarSign, User, Phone, MapPin, Tag, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { PartnerFilterBar } from '../components/PartnerFilterBar';
import { ConfirmModal } from '../components/ConfirmModal';
const getSportTypeName = (cat: string) => {
  if (!cat) return 'N/A';
  const val = cat.toLowerCase().trim();
  if (val === 'badminton' || val === 'cầu lông' || val === 'cau-long') return 'Cầu lông';
  if (val === 'football' || val === 'soccer' || val === 'bóng đá' || val === 'bong-da') return 'Bóng đá';
  if (val === 'tennis' || val === 'quần vợt') return 'Tennis';
  if (val === 'basketball' || val === 'bóng rổ') return 'Bóng rổ';
  if (val === 'volleyball' || val === 'bóng chuyền') return 'Bóng chuyền';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

interface BookingItem {
  id: string;
  customerName: string;
  customerPhone: string;
  fieldName: string;
  sportType: string;
  date: string;
  timeSlot: string;
  totalPrice: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  paymentMethod?: string;
  paymentStatus?: string;
  bookingDetails?: Array<{
    id: string;
    quantity: number;
    price: number;
    product?: {
      name: string;
      price: number;
      imageUrl?: string;
    };
  }>;
}

export const CustomerBookingManagement: React.FC = () => {
  // Danh sách lịch hẹn khách hàng đặt tải từ backend
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  // Trạng thái cho ConfirmModal dùng chung
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const closeConfirm = () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    setIsConfirmLoading(false);
  };

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
          let uiStatus: 'pending' | 'approved' | 'completed' | 'cancelled' = 'pending';
          if (b.status === 'CONFIRMED') {
            uiStatus = 'approved';
          } else if (b.status === 'COMPLETED') {
            uiStatus = 'completed';
          } else if (b.status === 'CANCELLED') {
            uiStatus = 'cancelled';
          }

          return {
            id: b.id,
            customerName: b.user?.fullName || 'Khách hàng',
            customerPhone: b.user?.phone || 'N/A',
            fieldName: b.sportsPitch?.name || 'Sân đấu',
            sportType: getSportTypeName(b.sportsPitch?.category),
            date: b.bookingDate,
            timeSlot: `${b.startTime} - ${b.endTime}`,
            totalPrice: b.finalPrice,
            status: uiStatus,
            paymentMethod: b.paymentMethod,
            paymentStatus: b.paymentStatus,
            bookingDetails: b.bookingDetails || [],
          };
        });

        setBookings(mapped);

        // Đồng bộ lại modal chi tiết nếu đang mở
        if (selectedBooking) {
          const fresh = mapped.find(x => x.id === selectedBooking.id);
          if (fresh) setSelectedBooking(fresh);
        }
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu đặt sân:', err);
      }
    };

    fetchPartnerBookings();
  }, [refreshTrigger]);

  // Tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'cancelled'>('all');

  // Trigger Phê duyệt lịch đặt qua ConfirmModal
  const triggerApprove = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Phê duyệt lịch đặt sân',
      message: 'Bạn có chắc chắn muốn PHÊ DUYỆT lịch đặt sân này của khách hàng không? Khách hàng sẽ nhận được thông báo.',
      confirmText: 'Phê duyệt sân',
      type: 'success',
      onConfirm: async () => {
        const token = localStorage.getItem('user_token');
        if (!token) return;
        setIsConfirmLoading(true);
        try {
          const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'CONFIRMED' }),
          });
          if (!res.ok) throw new Error('Phê duyệt thất bại.');
          toast.success('Đã phê duyệt lịch đặt sân thành công!');
          setRefreshTrigger(prev => prev + 1);
          closeConfirm();
        } catch (err: any) {
          toast.error(err.message || 'Lỗi phê duyệt.');
          setIsConfirmLoading(false);
        }
      }
    });
  };

  // Trigger Hoàn thành lịch đặt qua ConfirmModal
  const triggerComplete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận hoàn thành lịch đặt',
      message: 'Xác nhận khách hàng đã chơi xong và đã thanh toán đầy đủ? Đơn sẽ chuyển sang trạng thái ĐÃ HOÀN THÀNH.',
      confirmText: 'Đã hoàn thành & Thanh toán',
      type: 'success',
      onConfirm: async () => {
        const token = localStorage.getItem('user_token');
        if (!token) return;
        setIsConfirmLoading(true);
        try {
          const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'COMPLETED', paymentStatus: 'PAID' }),
          });
          if (!res.ok) throw new Error('Cập nhật thất bại.');
          toast.success('Đơn đặt sân đã được hoàn thành và thanh toán thành công!');
          setRefreshTrigger(prev => prev + 1);
          closeConfirm();
        } catch (err: any) {
          toast.error(err.message || 'Lỗi cập nhật.');
          setIsConfirmLoading(false);
        }
      }
    });
  };

  // Trigger Hủy lịch đặt qua ConfirmModal
  const triggerCancel = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hủy lịch đặt sân',
      message: 'Bạn có chắc chắn muốn HỦY lịch đặt sân này của khách hàng không? Các hóa đơn thanh toán đi kèm sẽ chuyển sang thất bại.',
      confirmText: 'Hủy lịch đặt',
      type: 'danger',
      onConfirm: async () => {
        const token = localStorage.getItem('user_token');
        if (!token) return;
        setIsConfirmLoading(true);
        try {
          const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'CANCELLED' }),
          });
          if (!res.ok) throw new Error('Hủy lịch thất bại.');
          toast.info('Đã hủy lịch đặt sân');
          setRefreshTrigger(prev => prev + 1);
          closeConfirm();
        } catch (err: any) {
          toast.error(err.message || 'Lỗi khi hủy lịch.');
          setIsConfirmLoading(false);
        }
      }
    });
  };

  // Trigger Xóa lịch đặt đã hủy qua ConfirmModal
  const triggerDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa vĩnh viễn đơn đặt sân',
      message: 'Bạn có chắc chắn muốn XÓA VĨNH VIỄN lịch đặt sân đã hủy này không? Thao tác này sẽ xóa sạch dữ liệu và không thể khôi phục.',
      confirmText: 'Xóa vĩnh viễn',
      type: 'danger',
      onConfirm: async () => {
        const token = localStorage.getItem('user_token');
        if (!token) return;
        setIsConfirmLoading(true);
        try {
          const res = await fetch(`http://localhost:3000/bookings/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || 'Không thể xóa lịch đặt.');
          }
          toast.success('Đã xóa vĩnh viễn lịch đặt thành công!');
          setSelectedBooking(null);
          setRefreshTrigger(prev => prev + 1);
          closeConfirm();
        } catch (err: any) {
          toast.error(err.message || 'Lỗi khi xóa lịch đặt.');
          setIsConfirmLoading(false);
        }
      }
    });
  };

  // Trigger Xác nhận nhận tiền chuyển khoản bank qua ConfirmModal
  const triggerConfirmBank = (id: string, nextStatus: 'PAID' | 'PARTIALLY_PAID') => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận chuyển khoản',
      message: `Bạn xác nhận đã nhận đủ tiền chuyển khoản cho đơn đặt sân này (${nextStatus === 'PAID' ? 'Trả hết 100%' : 'Đặt cọc 30%'})?`,
      confirmText: 'Xác nhận đã nhận',
      type: 'success',
      onConfirm: async () => {
        const token = localStorage.getItem('user_token');
        if (!token) return;
        setIsConfirmLoading(true);
        try {
          const res = await fetch(`http://localhost:3000/bookings/${id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ paymentStatus: nextStatus }),
          });
          if (!res.ok) throw new Error('Không thể cập nhật trạng thái thanh toán.');
          toast.success('Đã xác nhận thanh toán thành công!');
          setRefreshTrigger(prev => prev + 1);
          closeConfirm();
        } catch (err: any) {
          toast.error(err.message || 'Lỗi xác nhận thanh toán.');
          setIsConfirmLoading(false);
        }
      }
    });
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
          <p className="text-xs text-slate-400 m-0">Kiểm soát danh sách khách hàng đặt lịch, dịch vụ đi kèm, phê duyệt và thanh toán</p>
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
                      {b.status === 'completed' && (
                        <span className="admin-table-badge bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Hoàn thành</span>
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
                        {/* Chi tiết */}
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                          title="Xem chi tiết đơn"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Duyệt & Hủy */}
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => triggerApprove(b.id)}
                              className="admin-table-btn-icon text-emerald-400 hover:text-emerald-300"
                              title="Phê duyệt lịch"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => triggerCancel(b.id)}
                              className="admin-table-btn-icon admin-table-btn-icon-danger"
                              title="Hủy lịch đặt"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Hoàn thành (Khi đã duyệt) */}
                        {b.status === 'approved' && (
                          <button
                            onClick={() => triggerComplete(b.id)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/25 text-emerald-400 rounded-lg transition cursor-pointer"
                            title="Xác nhận chơi xong & thanh toán"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Hủy khi đã duyệt */}
                        {b.status === 'approved' && (
                          <button
                            onClick={() => triggerCancel(b.id)}
                            className="admin-table-btn-icon admin-table-btn-icon-danger"
                            title="Hủy lịch"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Xóa vĩnh viễn khi đã bị hủy */}
                        {b.status === 'cancelled' && (
                          <button
                            onClick={() => triggerDelete(b.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 rounded-lg transition cursor-pointer"
                            title="Xóa vĩnh viễn đơn đặt"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {b.paymentMethod === 'BANK_TRANSFER' && b.paymentStatus !== 'PAID' && b.status !== 'cancelled' && (
                          <button
                            onClick={() => triggerConfirmBank(b.id, 'PAID')}
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

      {/* MODAL CHI TIẾT ĐƠN ĐẶT SÂN */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 relative shadow-2xl">
            {/* Nút đóng */}
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-450 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Modal */}
            <div className="border-b border-slate-800/80 pb-4">
              <h4 className="text-base font-black text-white m-0 flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-amber-500" />
                Chi Tiết Đơn Đặt Sân
              </h4>
              <p className="text-[10px] text-slate-500 font-mono mt-1">ID Đơn: {selectedBooking.id}</p>
            </div>

            {/* Nội dung chi tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột 1: Thông tin khách hàng & Sân */}
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">👤 Khách hàng</h5>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white m-0 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" /> {selectedBooking.customerName}
                    </p>
                    <p className="text-[11px] text-slate-400 m-0 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedBooking.customerPhone}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">🏟️ Sân đấu & Thời gian</h5>
                  <div className="space-y-1 text-xs">
                    <p className="m-0 text-white font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> {selectedBooking.fieldName}
                    </p>
                    <p className="m-0 text-slate-400 flex items-center gap-1.5 pl-5">
                      Phân loại: <span className="text-white font-bold">{selectedBooking.sportType}</span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-900/60 font-mono text-[11px] text-slate-300">
                      <p className="m-0 flex justify-between"><span>Khung giờ:</span> <strong className="text-white">{selectedBooking.timeSlot}</strong></p>
                      <p className="m-0 flex justify-between mt-0.5"><span>Ngày chơi:</span> <strong className="text-white">{selectedBooking.date}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Sản phẩm/Dịch vụ đi kèm */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" /> Dịch vụ đi kèm
                  </h5>
                  
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {selectedBooking.bookingDetails && selectedBooking.bookingDetails.length > 0 ? (
                      selectedBooking.bookingDetails.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-slate-900/60 text-xs">
                          <div>
                            <p className="m-0 font-bold text-white">{item.product?.name || 'Sản phẩm phụ trợ'}</p>
                            <span className="text-[9px] text-slate-500 font-mono">SL: {item.quantity} x {Number(item.price).toLocaleString()}đ</span>
                          </div>
                          <span className="font-mono font-bold text-slate-300">{(item.quantity * Number(item.price)).toLocaleString()}đ</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 italic text-center py-4 m-0">Không có dịch vụ/nước uống đi kèm.</p>
                    )}
                  </div>
                </div>

                {/* Tổng thanh toán */}
                <div className="border-t border-slate-850 pt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Tổng tiền (đã gồm VAT & Khấu trừ):</span>
                    <strong className="font-mono text-sm font-extrabold text-amber-400">{selectedBooking.totalPrice.toLocaleString()}đ</strong>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900/60">
                    <span>Thanh toán:</span>
                    <span className="font-bold text-white">
                      {selectedBooking.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                       selectedBooking.paymentMethod === 'CASH' ? 'Tiền mặt' : selectedBooking.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Trạng thái tiền:</span>
                    <span className={`font-bold ${
                      selectedBooking.paymentStatus === 'PAID' ? 'text-emerald-400' :
                      selectedBooking.paymentStatus === 'PARTIALLY_PAID' ? 'text-blue-400' : 'text-amber-500'
                    }`}>
                      {selectedBooking.paymentStatus === 'PAID' ? 'Đã thanh toán 100%' :
                       selectedBooking.paymentStatus === 'PARTIALLY_PAID' ? 'Đã cọc 30%' : 'Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal: Các nút thao tác */}
            <div className="border-t border-slate-800/80 pt-4 flex flex-wrap gap-2 justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Trạng thái hiện tại</span>
                {selectedBooking.status === 'pending' && <span className="text-xs font-bold text-amber-400">⏳ Đang chờ phê duyệt</span>}
                {selectedBooking.status === 'approved' && <span className="text-xs font-bold text-emerald-400">🟢 Đã phê duyệt sân</span>}
                {selectedBooking.status === 'completed' && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">✅ Đã chơi xong & thanh toán</span>}
                {selectedBooking.status === 'cancelled' && <span className="text-xs font-bold text-red-500">🔴 Lịch đã hủy bỏ</span>}
              </div>

              <div className="flex items-center gap-2">
                {/* Duyệt */}
                {selectedBooking.status === 'pending' && (
                  <button 
                    onClick={() => triggerApprove(selectedBooking.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 border-0 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Phê duyệt lịch
                  </button>
                )}

                {/* Hoàn thành */}
                {selectedBooking.status === 'approved' && (
                  <button 
                    onClick={() => triggerComplete(selectedBooking.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 border-0 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Đã chơi xong & thanh toán
                  </button>
                )}

                {/* Hủy */}
                {(selectedBooking.status === 'pending' || selectedBooking.status === 'approved') && (
                  <button 
                    onClick={() => triggerCancel(selectedBooking.id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Hủy lịch
                  </button>
                )}

                {/* Xóa vĩnh viễn */}
                {selectedBooking.status === 'cancelled' && (
                  <button 
                    onClick={() => triggerDelete(selectedBooking.id)}
                    className="px-4 py-2 bg-red-650 hover:bg-red-700 border-0 text-white font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn đơn
                  </button>
                )}

                {/* Xác nhận chuyển khoản ngân hàng nếu chưa trả đủ */}
                {selectedBooking.paymentMethod === 'BANK_TRANSFER' && selectedBooking.paymentStatus !== 'PAID' && selectedBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => triggerConfirmBank(selectedBooking.id, 'PAID')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-650 border-0 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition"
                  >
                    Xác nhận đã nhận chuyển khoản
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP XÁC NHẬN DÙNG CHUNG */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        type={confirmConfig.type}
        isLoading={isConfirmLoading}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
      />

    </div>
  );
};
