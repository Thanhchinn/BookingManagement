import React, { useState } from 'react';
import { Handshake, Search, Check, X, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { PartnerDetailsModal } from './PartnerDetailsModal';

interface PartnerItem {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  totalFields: number;
  sportCategories: string[];
  status: 'active' | 'pending' | 'suspended';
  registrationDate: string;
  taxCode: string;
  bankAccount: {
    holder: string;
    number: string;
    bankName: string;
  };
}

export const PartnerManagement: React.FC = () => {
  // Dữ liệu giả lập ban đầu của các Đối tác chủ sân
  const [partners, setPartners] = useState<PartnerItem[]>([
    {
      id: 'P001',
      businessName: 'Tổ hợp Thể thao Bình Lợi Pro',
      ownerName: 'Nguyễn Văn Hùng',
      phone: '0908123456',
      email: 'hung.binhloipro@gmail.com',
      address: '456 Nơ Trang Long, Bình Thạnh, TP.HCM',
      totalFields: 8,
      sportCategories: ['Bóng đá', 'Cầu lông'],
      status: 'active',
      registrationDate: '2026-04-10',
      taxCode: '0315482361',
      bankAccount: { holder: 'NGUYEN VAN HUNG', number: '1903456789012', bankName: 'Techcombank' }
    },
    {
      id: 'P002',
      businessName: 'CLB Cầu Lông ATP Cầu Giấy',
      ownerName: 'Trần Thị Mai',
      phone: '0987654321',
      email: 'mai.atp@gmail.com',
      address: '12 Duy Tân, Cầu Giấy, Hà Nội',
      totalFields: 12,
      sportCategories: ['Cầu lông'],
      status: 'active',
      registrationDate: '2026-05-02',
      taxCode: '0109485762',
      bankAccount: { holder: 'TRAN THI MAI', number: '0021000432876', bankName: 'Vietcombank' }
    },
    {
      id: 'P003',
      businessName: 'Sân Cỏ Nhân Tạo Thành Lâm',
      ownerName: 'Lê Hoàng Nam',
      phone: '0912345678',
      email: 'nam.thanhlam@gmail.com',
      address: '78 Đường 3/2, Quận 10, TP.HCM',
      totalFields: 6,
      sportCategories: ['Bóng đá'],
      status: 'pending',
      registrationDate: '2026-05-28',
      taxCode: '0318596743',
      bankAccount: { holder: 'LE HOANG NAM', number: '102345987', bankName: 'VPBank' }
    },
    {
      id: 'P004',
      businessName: 'Pickleball Zone Việt Nam',
      ownerName: 'Phạm Minh Trí',
      phone: '0933888999',
      email: 'tri.pickleballzone@gmail.com',
      address: '102 Xuân Thủy, Cầu Giấy, Hà Nội',
      totalFields: 10,
      sportCategories: ['Pickleball', 'Tennis'],
      status: 'pending',
      registrationDate: '2026-05-29',
      taxCode: '0108546372',
      bankAccount: { holder: 'PHAM MINH TRI', number: '5678912345', bankName: 'MBBank' }
    },
    {
      id: 'P005',
      businessName: 'CLB Tennis Trương Định',
      ownerName: 'Hoàng Văn Thắng',
      phone: '0944777555',
      email: 'thang.tennis@gmail.com',
      address: '45 Trương Định, Hoàng Mai, Hà Nội',
      totalFields: 4,
      sportCategories: ['Tennis'],
      status: 'suspended',
      registrationDate: '2026-03-15',
      taxCode: '0106482759',
      bankAccount: { holder: 'HOANG VAN THANG', number: '1092837465', bankName: 'BIDV' }
    }
  ]);

  // Tìm kiếm & Lọc trạng thái
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  // Xem chi tiết Đối tác (Modal)
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);

  // Xử lý Duyệt Đối Tác
  const handleApprove = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn PHÊ DUYỆT đối tác này gia nhập hệ thống SportZone?')) {
      setPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
      alert('Đã phê duyệt đối tác thành công! Hệ thống đã gửi email thông báo tài khoản hoạt động.');
    }
  };

  // Xử lý Từ Chối Duyệt
  const handleReject = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn TỪ CHỐI hồ sơ đăng ký của đối tác này?')) {
      setPartners(prev => prev.filter(p => p.id !== id));
      alert('Đã từ chối hồ sơ đăng ký và loại bỏ khỏi danh sách hàng đợi.');
    }
  };

  // Xử lý Bật/Tắt trạng thái hoạt động (Khóa / Mở khóa)
  const handleToggleActive = (id: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionText = newStatus === 'suspended' ? 'KHÓA' : 'KÍCH HOẠT LẠI';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} đối tác này?`)) {
      setPartners(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  // Lọc danh sách dữ liệu hiển thị
  const filteredPartners = partners.filter(p => {
    const matchesSearch = 
      p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* 1. TIÊU ĐỀ TRANG */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <Handshake className="w-5 h-5 text-emerald-400" />
            Phê Duyệt & Quản Lý Đối Tác
          </h3>
          <p className="text-xs text-slate-400 m-0">Quản lý tài khoản các chủ sân, phê duyệt hồ sơ liên kết mới và kiểm soát hoạt động</p>
        </div>
      </div>

      {/* 2. KHU VỰC THẺ CHỈ SỐ NHANH */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Tổng đối tác */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Tổng đối tác</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-emerald-400">🤝</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">{partners.length}</h3>
          <p className="text-[10px] text-slate-500 m-0 mt-1">Đồng hành cùng SportZone</p>
        </div>

        {/* Đang Hoạt Động */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Đang hoạt động</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-emerald-400">🟢</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">
            {partners.filter(p => p.status === 'active').length}
          </h3>
          <p className="text-[10px] text-emerald-500 m-0 mt-1">Sân hiển thị cho người dùng đặt</p>
        </div>

        {/* Chờ Phê Duyệt */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Chờ phê duyệt</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-amber-500 animate-pulse">⏳</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0 flex items-center gap-2">
            {partners.filter(p => p.status === 'pending').length}
            {partners.filter(p => p.status === 'pending').length > 0 && (
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">Mới</span>
            )}
          </h3>
          <p className="text-[10px] text-amber-500 m-0 mt-1 font-semibold">Cần duyệt hồ sơ mới</p>
        </div>

        {/* Bị Khóa */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Bị tạm khóa</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-red-500">🔴</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">
            {partners.filter(p => p.status === 'suspended').length}
          </h3>
          <p className="text-[10px] text-slate-500 m-0 mt-1">Vi phạm quy định / Đang khóa</p>
        </div>

      </div>

      {/* 3. THANH BỘ LỌC VÀ TÌM KIẾM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        
        {/* Tìm kiếm */}
        <div className="md:col-span-2 flex items-center gap-3 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 w-full">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên tổ hợp sân, tên chủ sân, số điện thoại, địa chỉ..." 
            className="bg-transparent border-0 text-xs text-slate-200 focus:outline-none placeholder-slate-700 w-full"
          />
        </div>

        {/* Lọc Trạng Thái */}
        <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-2 py-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase px-2">Trạng thái:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-transparent border-0 text-xs text-white focus:outline-none cursor-pointer font-bold w-full"
          >
            <option value="all">Tất Cả</option>
            <option value="active">🟢 Đang hoạt động</option>
            <option value="pending">⏳ Chờ phê duyệt</option>
            <option value="suspended">🔴 Bị tạm khóa</option>
          </select>
        </div>

      </div>

      {/* 4. BẢNG HIỂN THỊ DỮ LIỆU ĐỐI TÁC (REUSABLE CSS) */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-thead">
                <th className="admin-table-th">Tổ hợp sân</th>
                <th className="admin-table-th">Chủ sở hữu</th>
                <th className="admin-table-th">Liên hệ</th>
                <th className="admin-table-th w-28 text-center">Số sân liên kết</th>
                <th className="admin-table-th w-32 text-center">Bộ môn</th>
                <th className="admin-table-th w-32 text-center">Trạng thái</th>
                <th className="admin-table-th w-40 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="admin-table-tbody">
              {filteredPartners.length > 0 ? (
                filteredPartners.map(partner => (
                  <tr key={partner.id} className="admin-table-tr">
                    
                    {/* TÊN TỔ HỢP SÂN */}
                    <td className="admin-table-td">
                      <div className="text-left">
                        <p className="admin-table-td-bold m-0">{partner.businessName}</p>
                        <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{partner.address}</span>
                      </div>
                    </td>

                    {/* TÊN CHỦ SỞ HỮU */}
                    <td className="admin-table-td">
                      <div className="text-left">
                        <p className="text-white font-bold m-0">{partner.ownerName}</p>
                        <span className="text-[9px] text-slate-500 block mt-0.5">Mã số thuế: {partner.taxCode}</span>
                      </div>
                    </td>

                    {/* LIÊN HỆ */}
                    <td className="admin-table-td text-slate-400 font-medium">
                      <div className="text-left font-mono">
                        <p className="m-0 text-slate-300">{partner.phone}</p>
                        <p className="m-0 text-[10px] text-slate-500">{partner.email}</p>
                      </div>
                    </td>

                    {/* SỐ SÂN LIÊN KẾT */}
                    <td className="admin-table-td text-center font-black text-white">
                      {partner.totalFields} sân
                    </td>

                    {/* BỘ MÔN */}
                    <td className="admin-table-td text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {partner.sportCategories.map(cat => (
                          <span 
                            key={cat}
                            className="text-[9px] font-bold bg-slate-950 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* TRẠNG THÁI */}
                    <td className="admin-table-td text-center">
                      {partner.status === 'active' && (
                        <span className="admin-table-badge admin-table-badge-emerald">Hoạt động</span>
                      )}
                      {partner.status === 'pending' && (
                        <span className="admin-table-badge admin-table-badge-amber">Chờ duyệt</span>
                      )}
                      {partner.status === 'suspended' && (
                        <span className="admin-table-badge admin-table-badge-red">Đang khóa</span>
                      )}
                    </td>

                    {/* THAO TÁC */}
                    <td className="admin-table-td text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Xem chi tiết */}
                        <button
                          onClick={() => setSelectedPartner(partner)}
                          title="Xem thông tin chi tiết"
                          className="admin-table-btn-icon"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Phê duyệt nhanh nếu đang là Pending */}
                        {partner.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(partner.id)}
                              title="Duyệt đối tác"
                              className="admin-table-btn-icon text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20 hover:border-emerald-600/30"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReject(partner.id)}
                              title="Từ chối hồ sơ"
                              className="admin-table-btn-icon admin-table-btn-icon-danger"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          // Bật/tắt trạng thái Khóa cho Active/Suspended
                          <button
                            onClick={() => handleToggleActive(partner.id, partner.status as any)}
                            title={partner.status === 'active' ? 'Khóa đối tác' : 'Mở khóa đối tác'}
                            className="bg-transparent border-0 cursor-pointer p-0"
                          >
                            {partner.status === 'active' ? (
                              <ToggleRight className="w-7 h-7 text-emerald-500 transition hover:scale-105" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-slate-600 transition hover:scale-105" />
                            )}
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    Không tìm thấy thông tin đối tác nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CHI TIẾT ĐỐI TÁC TRỰC QUAN */}
      <PartnerDetailsModal
        isOpen={selectedPartner !== null}
        partner={selectedPartner}
        onClose={() => setSelectedPartner(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleActive={handleToggleActive}
      />

    </div>
  );
};
