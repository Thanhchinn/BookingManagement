import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  Filter, 
  Eye, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Percent, 
  ShieldAlert,
  Download,
  CreditCard,
  FileText,
  DollarSign,
  User,
  Phone,
  MapPin,
  Tag,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '../../partner/components/ConfirmModal';

interface ProductItem {
  name: string;
  qty: number;
  price: number;
}

interface Booking {
  id: string; // Booking Code (e.g. BK12345)
  realId: string; // BigInt ID
  userName: string;
  userEmail: string;
  userPhone: string;
  facilityName: string;
  courtName: string;
  sport: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  discountAmount: number;
  vat: number;
  finalPrice: number;
  commissionAmount: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | 'REFUNDED';
  bookingStatus: 'pending' | 'approved' | 'completed' | 'cancelled';
  transactionId: string | null;
  createdAt: string;
  products: ProductItem[];
  cancellationReason?: string;
}
const getSportTypeName = (cat: string) => {
  if (!cat) return 'N/A';
  const val = cat.toLowerCase().trim();
  if (val === 'badminton' || val === 'cầu lông' || val === 'cau-long') return 'Cầu Lông';
  if (val === 'football' || val === 'soccer' || val === 'bóng đá' || val === 'bong-da') return 'Bóng Đá';
  if (val === 'tennis' || val === 'quần vợt') return 'Tennis';
  if (val === 'basketball' || val === 'bóng rổ') return 'Bóng Rổ';
  if (val === 'volleyball' || val === 'bóng chuyền') return 'Bóng Chuyền';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

export const BookingMonitor: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // Booking status filter
  const [paymentFilter, setPaymentFilter] = useState('all'); // Payment status filter
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Fetch admin bookings
  useEffect(() => {
    const fetchAdminBookings = async () => {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3000/bookings/admin-all', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Không thể tải danh sách đặt sân.');
        }
        const data = await res.json();
        
        const mapped: Booking[] = data.map((b: any) => {
          const firstPayment = b.payments?.[0];
          
          let uiBookingStatus: 'pending' | 'approved' | 'completed' | 'cancelled' = 'pending';
          if (b.status === 'CONFIRMED') {
            uiBookingStatus = 'approved';
          } else if (b.status === 'COMPLETED') {
            uiBookingStatus = 'completed';
          } else if (b.status === 'CANCELLED') {
            uiBookingStatus = 'cancelled';
          }

          return {
            id: b.bookingCode,
            realId: b.id.toString(),
            userName: b.user?.fullName || 'Khách hàng',
            userEmail: b.user?.email || 'N/A',
            userPhone: b.user?.phone || 'N/A',
            facilityName: b.sportsPitch?.location?.name || 'Cơ sở',
            courtName: b.sportsPitch?.name || 'Sân đấu',
            sport: getSportTypeName(b.sportsPitch?.category),
            bookingDate: b.bookingDate,
            startTime: b.startTime,
            endTime: b.endTime,
            basePrice: Number(b.basePrice),
            discountAmount: Number(b.discountAmount),
            vat: Math.round(Number(b.basePrice) * 0.1),
            finalPrice: Number(b.finalPrice),
            commissionAmount: Number(b.commissionAmount),
            paymentMethod: b.paymentMethod || firstPayment?.paymentMethod || 'CASH',
            paymentStatus: b.paymentStatus,
            bookingStatus: uiBookingStatus,
            transactionId: firstPayment?.transactionId || null,
            createdAt: new Date(b.createdAt).toLocaleString('vi-VN'),
            products: b.bookingDetails?.map((d: any) => ({
              name: d.product?.name || 'Sản phẩm',
              qty: d.quantity,
              price: Number(d.price)
            })) || [],
            cancellationReason: b.cancellationReason || undefined
          };
        });

        setBookings(mapped);

        // Update selected booking if currently viewing in modal
        if (selectedBooking) {
          const fresh = mapped.find(x => x.realId === selectedBooking.realId);
          if (fresh) setSelectedBooking(fresh);
        }
      } catch (err: any) {
        console.error('Lỗi tải danh sách đặt sân của hệ thống:', err);
      }
    };

    fetchAdminBookings();
  }, [refreshTrigger]);

  // Tính toán số liệu tổng quan
  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'PARTIALLY_PAID')
    .reduce((sum, b) => sum + b.finalPrice, 0);
  const totalCommission = bookings
    .filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'PARTIALLY_PAID')
    .reduce((sum, b) => sum + b.commissionAmount, 0);
  const totalRefunded = bookings
    .filter(b => b.paymentStatus === 'REFUNDED')
    .reduce((sum, b) => sum + b.finalPrice, 0);

  // Xử lý hoàn tiền khẩn cấp qua ConfirmModal
  const handleRefund = (id: string, realId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hoàn tiền khẩn cấp',
      message: `Bạn có chắc chắn muốn thực hiện HOÀN TIỀN KHẨN CẤP cho đơn đặt sân ${id}? Đơn sẽ được chuyển trạng thái thanh toán thành ĐÃ HOÀN TIỀN (REFUNDED).`,
      confirmText: 'Xác nhận hoàn tiền',
      type: 'danger',
      onConfirm: async () => {
        const token = localStorage.getItem('user_token');
        if (!token) return;
        setIsConfirmLoading(true);

        try {
          const res = await fetch(`http://localhost:3000/bookings/${realId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentStatus: 'REFUNDED',
              cancellationReason: 'Admin hoàn tiền khẩn cấp do lỗi kỹ thuật của hệ thống'
            }),
          });

          if (!res.ok) {
            throw new Error('Hoàn tiền thất bại.');
          }

          toast.success(`Đã hoàn tiền thành công cho mã đặt sân ${id}!`);
          setRefreshTrigger(prev => prev + 1);
          closeConfirm();
        } catch (err: any) {
          toast.error(err.message || 'Lỗi khi hoàn tiền.');
          setIsConfirmLoading(false);
        }
      }
    });
  };

  // Lọc dữ liệu hiển thị
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userPhone.includes(searchQuery);
    const matchesSport = sportFilter === 'all' || b.sport === sportFilter;
    const matchesBookingStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
    const matchesPaymentStatus = paymentFilter === 'all' || b.paymentStatus === paymentFilter;
    return matchesSearch && matchesSport && matchesBookingStatus && matchesPaymentStatus;
  });

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* 1. THÈ SỐ LIỆU TỔNG QUAN (METRICS CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Tổng số lượt đặt</span>
            <h3 className="text-3xl font-black text-white mt-1.5 mb-0">{totalBookings} lượt</h3>
          </div>
          <span className="text-[9px] text-teal-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Toàn hệ thống
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Doanh thu giao dịch</span>
            <h3 className="text-3xl font-black text-amber-500 mt-1.5 mb-0">{totalRevenue.toLocaleString()}đ</h3>
          </div>
          <span className="text-[9px] text-slate-500 font-bold">
            💵 Dựa trên các giao dịch PAID/CỌC thành công
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Phí nền tảng thu về</span>
            <h3 className="text-3xl font-black text-teal-400 mt-1.5 mb-0">{totalCommission.toLocaleString()}đ</h3>
          </div>
          <span className="text-[9px] text-teal-400 font-bold">
            💰 Lợi nhuận ròng của SportZone
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Tổng tiền đã hoàn trả</span>
            <h3 className="text-3xl font-black text-rose-500 mt-1.5 mb-0">{totalRefunded.toLocaleString()}đ</h3>
          </div>
          <span className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Khách hủy / Giao dịch hoàn trả
          </span>
        </div>
      </div>

      {/* 2. BỘ LỌC TÌM KIẾM (FILTER BAR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="relative w-full xl:w-80 shrink-0">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo mã đặt, khách hàng, số điện thoại, cơ sở..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 rounded-2xl pl-10 pr-4 py-3 text-xs text-white outline-none transition"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-end">
          {/* Bộ môn */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-2xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-500 font-bold uppercase mr-1 select-none">Môn:</span>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="bg-transparent border-0 text-xs text-white font-bold outline-none cursor-pointer py-1 bg-slate-950"
            >
              <option value="all" className="bg-slate-950 text-white">Tất cả bộ môn</option>
              <option value="Bóng Đá" className="bg-slate-950 text-white">Bóng Đá</option>
              <option value="Cầu Lông" className="bg-slate-950 text-white">Cầu Lông</option>
              <option value="Tennis" className="bg-slate-950 text-white">Tennis</option>
            </select>
          </div>

          {/* Trạng thái đơn đặt */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-2xl px-3 py-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase mr-1 select-none">Đơn đặt:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 text-xs text-white font-bold outline-none cursor-pointer py-1 bg-slate-950"
            >
              <option value="all" className="bg-slate-950 text-white">Tất cả trạng thái</option>
              <option value="pending" className="bg-slate-950 text-white">⏳ Chờ phê duyệt</option>
              <option value="approved" className="bg-slate-950 text-white">🟢 Đã phê duyệt</option>
              <option value="completed" className="bg-slate-950 text-white">✅ Đã hoàn thành</option>
              <option value="cancelled" className="bg-slate-950 text-white">🔴 Đã hủy bỏ</option>
            </select>
          </div>

          {/* Trạng thái thanh toán */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-2xl px-3 py-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase mr-1 select-none">Thanh toán:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent border-0 text-xs text-white font-bold outline-none cursor-pointer py-1 bg-slate-950"
            >
              <option value="all" className="bg-slate-950 text-white">Tất cả thanh toán</option>
              <option value="PAID" className="bg-slate-950 text-white">🟢 Đã thu (PAID)</option>
              <option value="PARTIALLY_PAID" className="bg-slate-950 text-white">🔵 Đã đặt cọc (CỌC)</option>
              <option value="UNPAID" className="bg-slate-950 text-white">⏳ Chưa thu (UNPAID)</option>
              <option value="REFUNDED" className="bg-slate-950 text-white">🔴 Đã hoàn tiền (REFUNDED)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSportFilter('all');
              setStatusFilter('all');
              setPaymentFilter('all');
              toast.success('Đã reset bộ lọc tìm kiếm');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-2xl transition border-0 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Khôi phục
          </button>
        </div>
      </div>

      {/* 3. BẢNG HIỂN THỊ DANH SÁCH TRANSACTION */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-thead">
                <th className="admin-table-th">Mã Lịch Đặt</th>
                <th className="admin-table-th">Khách Hàng</th>
                <th className="admin-table-th">Cơ Sở & Sân</th>
                <th className="admin-table-th">Thời Gian Chơi</th>
                <th className="admin-table-th text-right">Tổng Tiền</th>
                <th className="admin-table-th text-right">Phí Admin (10%)</th>
                <th className="admin-table-th text-center">Trạng Thái Đơn</th>
                <th className="admin-table-th text-center w-28">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="admin-table-tbody">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-xs py-8 text-slate-500">
                    Không tìm thấy lịch đặt nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.realId} className="admin-table-tr">
                    <td className="admin-table-td font-mono font-bold text-slate-400">
                      {b.id}
                    </td>
                    <td className="admin-table-td">
                      <div>
                        <p className="admin-table-td-bold m-0 text-white">{b.userName}</p>
                        <span className="text-[9px] text-slate-500 block">{b.userPhone}</span>
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <div>
                        <p className="admin-table-td-bold m-0 text-white flex items-center gap-1.5">
                          <span className="text-[9px] bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-amber-500 font-extrabold uppercase">
                            {b.sport}
                          </span>
                          {b.facilityName}
                        </p>
                        <span className="text-[9px] text-slate-500 block mt-0.5">{b.courtName}</span>
                      </div>
                    </td>
                    <td className="admin-table-td text-slate-400">
                      <div className="flex flex-col text-[11px] leading-tight font-mono">
                        <span className="font-bold flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3 h-3 text-amber-500" /> {b.bookingDate}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 mt-1">
                          <Clock className="w-3 h-3" /> {b.startTime} - {b.endTime}
                        </span>
                      </div>
                    </td>
                    <td className="admin-table-td text-right">
                      <div className="font-mono text-right">
                        <p className="m-0 font-black text-white text-xs">{b.finalPrice.toLocaleString()}đ</p>
                        <span className={`text-[9px] font-bold block mt-0.5 ${
                          b.paymentStatus === 'PAID' ? 'text-emerald-400' :
                          b.paymentStatus === 'PARTIALLY_PAID' ? 'text-blue-400' :
                          b.paymentStatus === 'REFUNDED' ? 'text-slate-405' : 'text-amber-500'
                        }`}>
                          {b.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                           b.paymentMethod === 'CASH' ? 'Tiền mặt' : b.paymentMethod || ''} 
                          {b.paymentStatus === 'PAID' ? ' (Đã thu)' :
                           b.paymentStatus === 'PARTIALLY_PAID' ? ' (Đã cọc)' :
                           b.paymentStatus === 'REFUNDED' ? ' (Đã hoàn)' : ' (Chưa thu)'}
                        </span>
                      </div>
                    </td>
                    <td className="admin-table-td text-right font-black font-mono text-teal-400 text-xs">
                      {b.commissionAmount.toLocaleString()}đ
                    </td>
                    {/* Trạng thái đơn đặt */}
                    <td className="admin-table-td text-center">
                      {b.bookingStatus === 'approved' && (
                        <span className="admin-table-badge admin-table-badge-emerald">Đã duyệt</span>
                      )}
                      {b.bookingStatus === 'completed' && (
                        <span className="admin-table-badge bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Hoàn thành</span>
                      )}
                      {b.bookingStatus === 'pending' && (
                        <span className="admin-table-badge admin-table-badge-amber">Chờ duyệt</span>
                      )}
                      {b.bookingStatus === 'cancelled' && (
                        <span className="admin-table-badge admin-table-badge-red">Đã hủy</span>
                      )}
                    </td>
                    <td className="admin-table-td text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer transition border border-slate-850 flex items-center justify-center"
                          title="Xem chi tiết hóa đơn"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {b.paymentStatus === 'PAID' && b.bookingStatus !== 'cancelled' && (
                          <button
                            onClick={() => handleRefund(b.id, b.realId)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-450 rounded-lg cursor-pointer transition flex items-center justify-center"
                            title="Hoàn tiền khẩn cấp"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL CHI TIẾT HÓA ĐƠN ĐẶT SÂN (INVOICE MODAL) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 relative shadow-2xl">
            {/* Header */}
            <div className="border-b border-slate-800/80 pb-4 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest block">Chi tiết giao dịch đặt lịch</span>
                <h3 className="text-base font-black text-white m-0 mt-0.5 flex items-center gap-2 font-mono">
                  <FileText className="w-4.5 h-4.5 text-teal-400" />
                  {selectedBooking.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-450 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Cột 1: Thông tin khách hàng & Sân */}
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">👤 Khách hàng đặt lịch</h5>
                  <div className="text-xs space-y-1.5">
                    <p className="font-extrabold text-white m-0 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" /> {selectedBooking.userName}
                    </p>
                    <p className="text-slate-450 m-0 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedBooking.userPhone}
                    </p>
                    <p className="text-slate-500 text-[10px] m-0 pl-5 truncate">{selectedBooking.userEmail}</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">🏟️ Chi tiết sân & Ca đấu</h5>
                  <div className="text-xs space-y-1.5">
                    <p className="font-extrabold text-white m-0 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> {selectedBooking.facilityName}
                    </p>
                    <p className="text-amber-450 font-bold m-0 pl-5">{selectedBooking.courtName} ({selectedBooking.sport})</p>
                    <div className="mt-2 pt-2 border-t border-slate-900/60 font-mono text-[11px] text-slate-300 pl-5">
                      <p className="m-0 flex justify-between"><span>Khung giờ:</span> <strong className="text-white">{selectedBooking.startTime} - {selectedBooking.endTime}</strong></p>
                      <p className="m-0 flex justify-between mt-0.5"><span>Ngày chơi:</span> <strong className="text-white">{selectedBooking.bookingDate}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Sản phẩm & Hóa đơn */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" /> Sản phẩm dùng thêm
                  </h5>
                  
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {selectedBooking.products.length > 0 ? (
                      selectedBooking.products.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-900/60 text-xs">
                          <div>
                            <p className="m-0 font-bold text-white">{p.name}</p>
                            <span className="text-[9px] text-slate-500 font-mono">SL: {p.qty} x {p.price.toLocaleString()}đ</span>
                          </div>
                          <span className="font-mono font-bold text-slate-300">{(p.qty * p.price).toLocaleString()}đ</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500 italic text-center py-4 m-0">Không có dịch vụ/sản phẩm dùng thêm.</p>
                    )}
                  </div>
                </div>

                {/* Phân rã hóa đơn */}
                <div className="border-t border-slate-850 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Giá thuê sân gốc:</span>
                    <span className="font-mono text-white">{selectedBooking.basePrice.toLocaleString()}đ</span>
                  </div>
                  {selectedBooking.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span>Giảm giá voucher:</span>
                      <span className="font-mono">-{selectedBooking.discountAmount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Thuế VAT (10%):</span>
                    <span className="font-mono">{selectedBooking.vat.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-slate-900/60 pt-1.5">
                    <span>Tổng tiền khách trả:</span>
                    <strong className="font-mono text-sm font-extrabold text-amber-500">{selectedBooking.finalPrice.toLocaleString()}đ</strong>
                  </div>
                  
                  {/* Phí hệ thống */}
                  <div className="flex justify-between text-[11px] text-teal-400 font-bold bg-teal-500/10 px-2 py-1 rounded-lg border border-teal-500/15 mt-2">
                    <span>Phí hoa hồng Admin (10%):</span>
                    <span className="font-mono">{selectedBooking.commissionAmount.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết Hủy/Hoàn tiền & Nhật ký */}
            <div className="space-y-4 text-left">
              {/* Phương thức thanh toán */}
              <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase block mb-0.5">Phương thức thanh toán</span>
                  <p className="text-white font-bold m-0 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-teal-400" />
                    {selectedBooking.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' :
                     selectedBooking.paymentMethod === 'CASH' ? 'Tiền mặt' : selectedBooking.paymentMethod}
                    {selectedBooking.transactionId && ` (Mã GD: ${selectedBooking.transactionId})`}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase block mb-0.5 text-right">Trạng thái thanh toán</span>
                  <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider ${
                    selectedBooking.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    selectedBooking.paymentStatus === 'PARTIALLY_PAID' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    selectedBooking.paymentStatus === 'REFUNDED' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedBooking.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                     selectedBooking.paymentStatus === 'PARTIALLY_PAID' ? 'Đã cọc' :
                     selectedBooking.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>

              {selectedBooking.cancellationReason && (
                <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-4 space-y-1 text-xs">
                  <span className="text-[9px] text-rose-400 font-extrabold uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Thông tin hủy lịch / Hoàn tiền
                  </span>
                  <p className="text-slate-400 m-0 leading-relaxed italic">
                    "{selectedBooking.cancellationReason}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="border-t border-slate-800/80 pt-4 flex gap-3 justify-end items-center">
              <button
                onClick={() => {
                  toast.info('Tải hóa đơn PDF đang được phát triển...');
                }}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Xuất Hóa Đơn
              </button>
              {selectedBooking.paymentStatus === 'PAID' && selectedBooking.bookingStatus !== 'cancelled' && (
                <button
                  onClick={() => handleRefund(selectedBooking.id, selectedBooking.realId)}
                  className="px-4 py-2 bg-rose-650 hover:bg-rose-700 border-0 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Hoàn Tiền Khẩn Cấp
                </button>
              )}
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
