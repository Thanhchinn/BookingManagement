import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Eye, ToggleLeft, ToggleRight, Trash2, RefreshCw, Loader2, Users2, UserCheck, Clock, UserX } from 'lucide-react';
import { AdminConfirmModal } from '../../../features/admin/components/AdminConfirmModal';
import { AdminSearchFilter } from '../../../features/admin/components/AdminSearchFilter';
import { PartnerDetailsView } from './PartnerDetailsView';
import type { PartnerItem } from './PartnerDetailsView';
import { toast } from 'sonner';
import { useAutoRefresh } from '../../../hooks/useAutoRefresh';
import { StatCard } from '../../../features/admin/components/StatCard';



// Chuẩn hóa dữ liệu từ API DB về format của PartnerItem
function normalizePartner(raw: any): PartnerItem {
  const statusRaw = (raw.status || 'pending').toLowerCase();
  const status: 'active' | 'pending' | 'suspended' =
    statusRaw === 'active' ? 'active'
    : statusRaw === 'suspended' ? 'suspended'
    : 'pending';

  return {
    id: raw.id?.toString(),
    businessName: raw.businessName || raw.business_name || '(Chưa có tên)',
    ownerName: raw.user?.fullName || '(Chưa rõ)',
    phone: raw.user?.phone || '(Chưa cập nhật)',
    email: raw.user?.email || '',
    address: raw.address || '(Chưa cập nhật)',
    totalFields: raw.totalFields || 0,
    sportCategories: raw.sportCategories || [],
    status,
    registrationDate: raw.createdAt
      ? new Date(raw.createdAt).toISOString().split('T')[0]
      : '',
    taxCode: raw.taxCode || raw.tax_code || '(Chưa cập nhật)',
    bankAccount: raw.bankAccount || {
      holder: '(Chưa cập nhật)',
      number: '(Chưa cập nhật)',
      bankName: '(Chưa cập nhật)',
    },
    commissionType: raw.commissionType || 'PERCENTAGE',
    commissionRate: raw.commissionRate !== undefined && raw.commissionRate !== null ? parseFloat(raw.commissionRate) : 10.00,
    commissionFixedAmount: raw.commissionFixedAmount !== undefined && raw.commissionFixedAmount !== null ? parseFloat(raw.commissionFixedAmount) : 0,
  };
}

interface PartnerManagementProps {
  onSubPageActive?: (active: boolean) => void;
}

export const PartnerManagement: React.FC<PartnerManagementProps> = ({ onSubPageActive }) => {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tìm kiếm & Lọc trạng thái
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  // Xem chi tiết Đối tác
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);

  // Popup Xác nhận
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: () => {},
  });

  // === TẢI DỮ LIỆU TỪ API ===
  const fetchPartners = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/partners');
      if (!res.ok) throw new Error('Không thể tải danh sách đối tác.');
      const raw: any[] = await res.json();
      setPartners(raw.map(normalizePartner));
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Tự động refresh mỗi 3 giây để hiển thị dữ liệu mới nhất
  useAutoRefresh(fetchPartners, 3000);


  // Đồng bộ trạng thái sub-page
  useEffect(() => {
    if (onSubPageActive) {
      onSubPageActive(selectedPartner !== null);
    }
    return () => {
      if (onSubPageActive) onSubPageActive(false);
    };
  }, [selectedPartner, onSubPageActive]);

  // === API ACTIONS ===

  // Phê duyệt đối tác → status: active
  const handleApprove = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Phê Duyệt Đối Tác',
      message: 'Bạn có chắc chắn muốn PHÊ DUYỆT đối tác này gia nhập hệ thống SportZone?',
      variant: 'primary',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:3000/partners/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ACTIVE' }),
          });
          if (!res.ok) throw new Error('Cập nhật trạng thái thất bại.');
          await fetchPartners(); // Refresh ngay từ DB
          if (selectedPartner?.id === id) setSelectedPartner(null);
          toast.success('Duyệt đối tác thành công', {
            description: 'Hồ sơ đã được phê duyệt và thông báo kích hoạt đã được gửi.',
          });
        } catch (err: any) {
          toast.error(err.message || 'Đã xảy ra lỗi.');
        }
      },
    });
  };

  // Từ chối hồ sơ → xóa khỏi DB
  const handleReject = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Từ Chối Hồ Sơ Đối Tác',
      message: 'Bạn có chắc chắn muốn TỪ CHỐI và xóa hồ sơ đăng ký của đối tác này?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:3000/partners/${id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Xóa hồ sơ thất bại.');
          setSelectedPartner(null);
          await fetchPartners(); // Refresh ngay từ DB
          toast.success('Đã từ chối và xóa hồ sơ đăng ký.');
        } catch (err: any) {
          toast.error(err.message || 'Đã xảy ra lỗi.');
        }
      },
    });
  };

  // Bật/Tắt trạng thái khóa
  const handleToggleActive = (id: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionText = newStatus === 'suspended' ? 'KHÓA' : 'KÍCH HOẠT LẠI';
    setConfirmModal({
      isOpen: true,
      title: `${newStatus === 'suspended' ? 'Khóa' : 'Kích Hoạt Lại'} Đối Tác`,
      message: `Bạn có chắc chắn muốn ${actionText} đối tác này?`,
      variant: newStatus === 'suspended' ? 'warning' : 'primary',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:3000/partners/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus.toUpperCase() }),
          });
          if (!res.ok) throw new Error('Cập nhật trạng thái thất bại.');
          await fetchPartners(); // Refresh ngay từ DB
          if (selectedPartner?.id === id) setSelectedPartner(null);
          toast.success(
            newStatus === 'suspended' ? 'Đã khóa tài khoản đối tác' : 'Đã kích hoạt lại tài khoản',
          );
        } catch (err: any) {
          toast.error(err.message || 'Đã xảy ra lỗi.');
        }
      },
    });
  };

  // Xóa vĩnh viễn
  const handleDeletePartner = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Vĩnh Viễn Đối Tác',
      message: `Bạn có chắc chắn muốn XÓA VĨNH VIỄN đối tác "${name}"? Tất cả dữ liệu sẽ bị xóa không thể khôi phục!`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:3000/partners/${id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Xóa thất bại.');
          setSelectedPartner(null);
          await fetchPartners(); // Refresh ngay từ DB
          toast.success('Xóa đối tác thành công', {
            description: `Đối tác "${name}" đã được gỡ hoàn toàn.`,
          });
        } catch (err: any) {
          toast.error(err.message || 'Đã xảy ra lỗi.');
        }
      },
    });
  };


  // Lọc danh sách
  const getStatusKey = (s: string) => s.toLowerCase();
  const filteredPartners = partners.filter(p => {
    const matchesSearch =
      p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || getStatusKey(p.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      {selectedPartner ? (
        <PartnerDetailsView
          partner={selectedPartner}
          onBack={() => setSelectedPartner(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onToggleActive={handleToggleActive}
          onDelete={handleDeletePartner}
          onUpdateLocalPartner={setSelectedPartner}
        />
      ) : (
        <>
          {/* HEADER + REFRESH */}
          <div className="flex items-center justify-between">
            <div />
            <button
              onClick={fetchPartners}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>

          {/* KHU VỰC THẺ CHỈ SỐ NHANH */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              title="Tổng đối tác"
              value={partners.length}
              icon={Users2}
              color="blue"
              isLoading={isLoading}
              comparisonText="Đồng hành cùng SportZone"
            />
            <StatCard
              title="Đang hoạt động"
              value={partners.filter(p => getStatusKey(p.status) === 'active').length}
              icon={UserCheck}
              color="emerald"
              isLoading={isLoading}
              comparisonText="Sân hiển thị cho người dùng"
            />
            <StatCard
              title="Chờ phê duyệt"
              value={partners.filter(p => getStatusKey(p.status) === 'pending').length}
              icon={Clock}
              color="amber"
              isLoading={isLoading}
              trend={partners.filter(p => getStatusKey(p.status) === 'pending').length > 0 ? "Mới" : undefined}
              trendType={partners.filter(p => getStatusKey(p.status) === 'pending').length > 0 ? "up" : undefined}
              comparisonText="Cần duyệt hồ sơ mới"
            />
            <StatCard
              title="Bị tạm khóa"
              value={partners.filter(p => getStatusKey(p.status) === 'suspended').length}
              icon={UserX}
              color="red"
              isLoading={isLoading}
              comparisonText="Vi phạm / Đang khóa"
            />
          </div>

          {/* THANH TÌM KIẾM */}
          <AdminSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo tên tổ hợp sân, tên chủ sân, email..."
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterLabel="Trạng thái:"
            filterOptions={[
              { value: 'all', label: 'Tất Cả' },
              { value: 'active', label: '🟢 Đang hoạt động' },
              { value: 'pending', label: '⏳ Chờ phê duyệt' },
              { value: 'suspended', label: '🔴 Bị tạm khóa' },
            ]}
          />

          {/* BẢNG DỮ LIỆU */}
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                          <span className="text-slate-500 text-sm">Đang tải dữ liệu từ máy chủ...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPartners.length > 0 ? (
                    filteredPartners.map(partner => (
                      <tr key={partner.id} className="admin-table-tr">
                        {/* TÊN TỔ HỢP SÂN */}
                        <td className="admin-table-td">
                          <div className="text-left">
                            <p className="admin-table-td-bold m-0">{partner.businessName}</p>
                            <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                              #{partner.id} · Đăng ký: {partner.registrationDate}
                            </span>
                          </div>
                        </td>

                        {/* TÊN CHỦ SỞ HỮU */}
                        <td className="admin-table-td">
                          <div className="text-left">
                            <p className="text-white font-bold m-0">{partner.ownerName}</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              MST: {partner.taxCode}
                            </span>
                          </div>
                        </td>

                        {/* LIÊN HỆ */}
                        <td className="admin-table-td text-slate-300 font-medium">
                          <div className="text-left font-mono text-xs">
                            <p className="m-0 text-slate-200">{partner.phone}</p>
                            <p className="m-0 text-[10px] text-slate-400">{partner.email}</p>
                          </div>
                        </td>

                        {/* SỐ SÂN */}
                        <td className="admin-table-td text-center font-bold text-white">
                          {partner.totalFields} sân
                        </td>

                        {/* BỘ MÔN */}
                        <td className="admin-table-td text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {partner.sportCategories.length > 0 ? partner.sportCategories.map(cat => (
                              <span key={cat} className="text-[9px] font-bold bg-slate-950 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded">
                                {cat}
                              </span>
                            )) : (
                              <span className="text-[10px] text-slate-400 italic">Chưa cập nhật</span>
                            )}
                          </div>
                        </td>

                        {/* TRẠNG THÁI */}
                        <td className="admin-table-td text-center">
                          {getStatusKey(partner.status) === 'active' && (
                            <span className="admin-table-badge admin-table-badge-emerald">Hoạt động</span>
                          )}
                          {getStatusKey(partner.status) === 'pending' && (
                            <span className="admin-table-badge admin-table-badge-amber">Chờ duyệt</span>
                          )}
                          {getStatusKey(partner.status) === 'suspended' && (
                            <span className="admin-table-badge admin-table-badge-red">Đang khóa</span>
                          )}
                        </td>

                        {/* THAO TÁC */}
                        <td className="admin-table-td text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedPartner(partner)}
                              title="Xem thông tin chi tiết"
                              className="admin-table-btn-icon"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {getStatusKey(partner.status) === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApprove(partner.id)}
                                  title="Duyệt đối tác"
                                  className="admin-table-btn-icon text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/20 hover:border-emerald-900/30"
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
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleActive(partner.id, getStatusKey(partner.status) as any)}
                                  title={getStatusKey(partner.status) === 'active' ? 'Khóa đối tác' : 'Mở khóa đối tác'}
                                  className="bg-transparent border-0 cursor-pointer p-0"
                                >
                                  {getStatusKey(partner.status) === 'active' ? (
                                    <ToggleRight className="w-7 h-7 text-emerald-500 transition hover:scale-105" />
                                  ) : (
                                    <ToggleLeft className="w-7 h-7 text-slate-400 transition hover:scale-105" />
                                  )}
                                </button>
                                {getStatusKey(partner.status) === 'suspended' && (
                                  <button
                                    onClick={() => handleDeletePartner(partner.id, partner.businessName)}
                                    title="Xóa đối tác"
                                    className="admin-table-btn-icon admin-table-btn-icon-danger ml-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
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
        </>
      )}

      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
