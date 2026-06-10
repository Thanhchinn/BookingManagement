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
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductItem {
  name: string;
  qty: number;
  price: number;
}

interface Booking {
  id: string;
  realId: string;
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
  paymentStatus: 'PAID' | 'UNPAID' | 'CANCELLED' | 'REFUNDED';
  transactionId: string | null;
  createdAt: string;
  products: ProductItem[];
  cancellationReason?: string;
}

export const BookingMonitor: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
          if (res.status === 401) {
            window.dispatchEvent(new CustomEvent('user-force-logout'));
            return;
          }
          throw new Error('Không thể tải danh sách đặt sân.');
        }
        const data = await res.json();
        
        const mapped: Booking[] = data.map((b: any) => {
          const firstPayment = b.payments?.[0];
          return {
            id: b.bookingCode,
            realId: b.id,
            userName: b.user?.fullName || 'Khách hàng',
            userEmail: b.user?.email || 'N/A',
            userPhone: b.user?.phone || 'N/A',
            facilityName: b.sportsPitch?.location?.name || 'Cơ sở',
            courtName: b.sportsPitch?.name || 'Sân đấu',
            sport: b.sportsPitch?.category === 'badminton' ? 'Cầu Lông' : (b.sportsPitch?.category === 'football' ? 'Bóng Đá' : 'Tennis'),
            bookingDate: b.bookingDate,
            startTime: b.startTime,
            endTime: b.endTime,
            basePrice: b.basePrice,
            discountAmount: b.discountAmount,
            vat: Math.round(b.basePrice * 0.1),
            finalPrice: b.finalPrice,
            commissionAmount: b.commissionAmount,
            paymentMethod: firstPayment?.paymentMethod || 'CASH',
            paymentStatus: b.paymentStatus,
            transactionId: firstPayment?.transactionId || null,
            createdAt: new Date(b.createdAt).toLocaleString('vi-VN'),
            products: b.bookingDetails?.map((d: any) => ({
              name: d.product?.name || 'Sản phẩm',
              qty: d.quantity,
              price: d.price
            })) || [],
            cancellationReason: b.cancellationReason || undefined
          };
        });

        setBookings(mapped);
      } catch (err: any) {
        console.error('Lỗi tải danh sách đặt sân của hệ thống:', err);
      }
    };

    fetchAdminBookings();
  }, [refreshTrigger]);

  // Tính toán số liệu tổng quan
  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.finalPrice, 0);
  const totalCommission = bookings
    .filter(b => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.commissionAmount, 0);
  const totalRefunded = bookings
    .filter(b => b.paymentStatus === 'REFUNDED')
    .reduce((sum, b) => sum + b.finalPrice, 0);

  // Xử lý hoàn tiền khẩn cấp
  const handleRefund = async (id: string, realId: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn thực hiện hoàn trả tiền cho mã đặt sân ${id} này?`)) {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      try {
        toast.loading('Đang xử lý hoàn tiền...', { id: 'refund-loading' });

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

        toast.dismiss('refund-loading');
        toast.success(`Hoàn tiền thành công cho mã đặt sân ${id}!`);
        
        setRefreshTrigger(prev => prev + 1);
        setSelectedBooking(null);
      } catch (err: any) {
        toast.dismiss('refund-loading');
        toast.error(err.message || 'Lỗi khi hoàn tiền.');
      }
    }
  };

  // Lọc dữ liệu hiển thị
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.facilityName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = sportFilter === 'all' || b.sport === sportFilter;
    const matchesStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
    return matchesSearch && matchesSport && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* 1. THẺ SỐ LIỆU TỔNG QUAN (METRICS CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Tổng số lượt đặt</span>
            <h3 className="text-3xl font-black text-white mt-1.5 mb-0">{totalBookings} lượt</h3>
          </div>
          <span className="text-[9px] text-teal-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +15% so với tuần trước
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Doanh thu giao dịch</span>
            <h3 className="text-3xl font-black text-amber-500 mt-1.5 mb-0">{totalRevenue.toLocaleString()}đ</h3>
          </div>
          <span className="text-[9px] text-slate-500 font-bold">
            💵 Dựa trên các giao dịch PAID thành công
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Phí nền tảng thu về (10%)</span>
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
            <ShieldAlert className="w-3.5 h-3.5" /> 12 lượt hoàn tiền tranh chấp
          </span>
        </div>
      </div>

      {/* 2. BỘ LỌC TÌM KIẾM (FILTER BAR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo mã đặt, khách hàng, cơ sở..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="bg-transparent border-0 text-xs text-slate-300 font-bold outline-none cursor-pointer"
            >
              <option value="all">Tất cả bộ môn</option>
              <option value="Bóng Đá">Bóng Đá</option>
              <option value="Cầu Lông">Cầu Lông</option>
              <option value="Tennis">Tennis</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 text-xs text-slate-300 font-bold outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="UNPAID">Chờ thanh toán (UNPAID)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
              <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSportFilter('all');
              setStatusFilter('all');
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
                <th className="admin-table-th text-center">Trạng Thái</th>
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
                  <tr key={b.id} className="admin-table-tr">
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
                          <span className="text-[10px] bg-slate-850 px-1.5 py-0.5 rounded text-amber-400 font-extrabold uppercase">
                            {b.sport}
                          </span>
                          {b.facilityName}
                        </p>
                        <span className="text-[9px] text-slate-500 block mt-0.5">{b.courtName}</span>
                      </div>
                    </td>
                    <td className="admin-table-td text-slate-400">
                      <div className="flex flex-col text-[11px] leading-tight">
                        <span className="font-bold flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3 h-3 text-amber-500" /> {b.bookingDate}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 mt-1">
                          <Clock className="w-3 h-3" /> {b.startTime} - {b.endTime}
                        </span>
                      </div>
                    </td>
                    <td className="admin-table-td text-right font-black font-mono text-white text-xs">
                      {b.finalPrice.toLocaleString()}đ
                    </td>
                    <td className="admin-table-td text-right font-black font-mono text-teal-400 text-xs">
                      {b.commissionAmount.toLocaleString()}đ
                    </td>
                    <td className="admin-table-td text-center">
                      <span className={`admin-table-badge ${
                        b.paymentStatus === 'PAID' 
                          ? 'admin-table-badge-emerald' 
                          : b.paymentStatus === 'UNPAID'
                          ? 'admin-table-badge-amber'
                          : b.paymentStatus === 'REFUNDED'
                          ? 'admin-table-badge-teal'
                          : 'admin-table-badge-red'
                      }`}>
                        {b.paymentStatus === 'PAID' && 'Đã thanh toán'}
                        {b.paymentStatus === 'UNPAID' && 'Chờ thanh toán'}
                        {b.paymentStatus === 'CANCELLED' && 'Đã hủy lịch'}
                        {b.paymentStatus === 'REFUNDED' && 'Đã hoàn tiền'}
                      </span>
                    </td>
                    <td className="admin-table-td text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer transition border-0 flex items-center justify-center"
                          title="Xem chi tiết hóa đơn"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {b.paymentStatus === 'PAID' && (
                          <button
                            onClick={() => handleRefund(b.id, b.realId)}
                            className="p-1.5 bg-rose-950/35 hover:bg-rose-900 border border-rose-900/30 text-rose-400 hover:text-white rounded-lg cursor-pointer transition flex items-center justify-center"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/20">
              <div className="text-left">
                <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest block">Chi tiết giao dịch đặt lịch</span>
                <h3 className="text-lg font-black text-white m-0 mt-0.5 flex items-center gap-2 font-mono">
                  <FileText className="w-4.5 h-4.5 text-teal-400" />
                  {selectedBooking.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer border-0 transition"
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-left">
              {/* Trạng thái thanh toán */}
              <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase block">Phương thức & Trạng thái</span>
                  <p className="text-xs text-white font-bold m-0 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" /> 
                    {selectedBooking.paymentMethod} {selectedBooking.transactionId && `(${selectedBooking.transactionId})`}
                  </p>
                </div>
                <span className={`px-3 py-1.5 text-[9px] font-black rounded-xl uppercase tracking-wider ${
                  selectedBooking.paymentStatus === 'PAID'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : selectedBooking.paymentStatus === 'UNPAID'
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    : selectedBooking.paymentStatus === 'REFUNDED'
                    ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}>
                  {selectedBooking.paymentStatus === 'PAID' && 'Đã thanh toán'}
                  {selectedBooking.paymentStatus === 'UNPAID' && 'Chờ thanh toán'}
                  {selectedBooking.paymentStatus === 'CANCELLED' && 'Đã hủy lịch'}
                  {selectedBooking.paymentStatus === 'REFUNDED' && 'Đã hoàn tiền'}
                </span>
              </div>

              {/* Thông tin 2 bên: Khách hàng vs Sân bãi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/20 border border-slate-855/80 rounded-2xl p-4 space-y-2.5">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase block tracking-wider">Khách hàng đặt lịch</span>
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-white m-0">{selectedBooking.userName}</p>
                    <p className="text-slate-400 m-0">{selectedBooking.userPhone}</p>
                    <p className="text-slate-500 text-[10px] m-0 truncate">{selectedBooking.userEmail}</p>
                  </div>
                </div>

                <div className="bg-slate-950/20 border border-slate-855/80 rounded-2xl p-4 space-y-2.5">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase block tracking-wider">Chi tiết sân & Ca đấu</span>
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-white m-0">{selectedBooking.facilityName}</p>
                    <p className="text-amber-400 font-bold m-0">{selectedBooking.courtName}</p>
                    <p className="text-slate-400 m-0 flex items-center gap-1">
                      📅 {selectedBooking.bookingDate} | 🕒 {selectedBooking.startTime} - {selectedBooking.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chi tiết hóa đơn */}
              <div className="space-y-3">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase block tracking-wider">Chi tiết hóa đơn dịch vụ</span>
                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Giá thuê sân:</span>
                    <span className="font-mono text-white">{selectedBooking.basePrice.toLocaleString()}đ</span>
                  </div>

                  {selectedBooking.products.length > 0 && (
                    <div className="border-t border-slate-850 pt-2.5 space-y-2">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase block">Sản phẩm dùng thêm</span>
                      {selectedBooking.products.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-400 text-[11px]">
                          <span>{p.name} <span className="text-slate-600 font-bold">x{p.qty}</span></span>
                          <span className="font-mono text-white">{(p.qty * p.price).toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-850 pt-2.5 space-y-1.5">
                    {selectedBooking.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-rose-400 font-bold">
                        <span>Giảm giá voucher:</span>
                        <span className="font-mono">-{selectedBooking.discountAmount.toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Thuế VAT (10%):</span>
                      <span className="font-mono text-white">{selectedBooking.vat.toLocaleString()}đ</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-800 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider">Tổng tiền khách trả:</span>
                    <span className="text-xl font-black text-amber-500 font-mono">
                      {selectedBooking.finalPrice.toLocaleString()}đ
                    </span>
                  </div>

                  <div className="border-t border-slate-850 pt-3 flex justify-between items-center text-teal-400 font-extrabold bg-slate-950/20 px-3 py-2 rounded-xl">
                    <span className="text-[10px] uppercase flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" /> Phí hoa hồng Admin thu (10%):
                    </span>
                    <span className="font-mono text-sm">
                      {selectedBooking.commissionAmount.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Lý do hủy lịch nếu có */}
              {selectedBooking.cancellationReason && (
                <div className="bg-rose-950/15 border border-rose-900/20 rounded-2xl p-4 space-y-1.5 text-xs">
                  <span className="text-[9px] text-rose-400 font-extrabold uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Thông tin hủy lịch / Hoàn tiền
                  </span>
                  <p className="text-slate-400 m-0 leading-relaxed italic">
                    "{selectedBooking.cancellationReason}"
                  </p>
                </div>
              )}

              {/* Lịch sử hoạt động của giao dịch (Timeline) */}
              <div className="space-y-3">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase block tracking-wider">Nhật ký trạng thái</span>
                <div className="relative border-l border-slate-800 pl-4 space-y-4 text-xs ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
                    <p className="font-bold text-white m-0">Đặt sân thành công</p>
                    <span className="text-[10px] text-slate-500 block">{selectedBooking.createdAt}</span>
                  </div>
                  <div className="relative">
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 ${
                      selectedBooking.paymentStatus !== 'UNPAID' ? 'bg-emerald-500' : 'bg-slate-700'
                    }`} />
                    <p className={`font-bold m-0 ${selectedBooking.paymentStatus !== 'UNPAID' ? 'text-white' : 'text-slate-500'}`}>
                      Thanh toán an toàn qua cổng {selectedBooking.paymentMethod}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      {selectedBooking.paymentStatus !== 'UNPAID' ? selectedBooking.createdAt : 'Chờ khách hàng thanh toán...'}
                    </span>
                  </div>
                  {selectedBooking.paymentStatus === 'REFUNDED' && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-slate-900" />
                      <p className="font-bold text-teal-400 m-0">Đã hoàn tiền cho khách hàng</p>
                      <span className="text-[10px] text-slate-500 block">Nhật ký lưu vết: Hoàn trả thành công.</span>
                    </div>
                  )}
                  {selectedBooking.paymentStatus === 'CANCELLED' && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-slate-900" />
                      <p className="font-bold text-rose-500 m-0">Hủy lịch và đóng giao dịch</p>
                      <span className="text-[10px] text-slate-500 block">Trạng thái: CANCELLED.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/80 bg-slate-950/20 flex gap-3 justify-end">
              <button
                onClick={() => {
                  toast.info('Tải hóa đơn PDF đang được phát triển...');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 hover:text-white rounded-xl transition border-0 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Xuất Hóa Đơn
              </button>
              {selectedBooking.paymentStatus === 'PAID' && (
                <button
                  onClick={() => handleRefund(selectedBooking.id, selectedBooking.realId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs font-black text-white rounded-xl transition border-0 cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Hoàn Tiền Khẩn Cấp
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
