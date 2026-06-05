import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Loader2, Users, CheckCircle, ShieldAlert, Award, Mail, Phone, MapPin, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { UserFormModal } from './UserFormModal';
import { toast } from 'sonner';
import { AdminConfirmModal } from '../../../features/admin/components/AdminConfirmModal';
import { AdminSearchFilter } from '../../../features/admin/components/AdminSearchFilter';
import { useAutoRefresh } from '../../../hooks/useAutoRefresh';
import { StatCard } from '../../../features/admin/components/StatCard';

export interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalLoyaltyPoints: number;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Các trạng thái phân trang phía Server
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5; // Kích thước trang hiển thị

  // Thống kê nhanh người dùng
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalLoyaltyPoints: 0
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Popup xác nhận chung của Admin
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
    onConfirm: () => {}
  });

  // Trạng thái hiển thị Modal (Thêm / Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Trạng thái biểu mẫu (Form States)
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLoyaltyPoints, setFormLoyaltyPoints] = useState(0);
  const [formCity, setFormCity] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formWard, setFormWard] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Tải danh sách người dùng phân trang & tìm kiếm từ Backend
  const fetchUsers = async (page = currentPage, searchVal = searchTerm, isBackground = false) => {
    const isBg = isBackground === true;
    if (!isBg) setIsLoading(true);
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Lỗi xác thực', { description: 'Vui lòng đăng nhập lại hệ thống.' });
      if (!isBg) setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/users?page=${page}&limit=${pageSize}&search=${encodeURIComponent(searchVal)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_profile');
          toast.error('Phiên đăng nhập hết hạn', { description: 'Vui lòng đăng nhập lại vào hệ thống.' });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }
        throw new Error('Không thể tải danh sách tài khoản.');
      }
      const data = await response.json();

      if (data && Array.isArray(data)) {
        setUsers(data);
        setTotalCount(data.length);
        setTotalPages(1);
      } else if (data && data.data && Array.isArray(data.data)) {
        setUsers(data.data);
        setTotalCount(data.meta.total);
        setTotalPages(data.meta.totalPages);
      }
    } catch (err: any) {
      toast.error('Lỗi tải dữ liệu', {
        description: err.message || 'Không thể kết nối đến máy chủ API.',
      });
    } finally {
      if (!isBg) setIsLoading(false);
    }
  };

  // Tải thông tin thống kê người dùng từ Backend
  const fetchStats = async (isBackground = false) => {
    const isBg = isBackground === true;
    if (!isBg) setIsStatsLoading(true);
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3000/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_profile');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Lỗi tải thống kê user:', err);
    } finally {
      if (!isBg) setIsStatsLoading(false);
    }
  };

  // Tải dữ liệu ban đầu
  useEffect(() => {
    fetchUsers(currentPage, searchTerm, false);
    fetchStats(false);
  }, [currentPage]);

  // Tự động refresh mỗi 3 giây để hiển thị người dùng mới đăng ký
  const autoRefreshFn = async () => {
    await fetchUsers(currentPage, searchTerm, true);
    await fetchStats(true);
  };
  useAutoRefresh(autoRefreshFn, 3000);


  // Bộ debounce tìm kiếm từ khóa người dùng
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers(1, searchTerm, false);
      } else {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Mở Modal biểu mẫu thêm mới
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormFullName('');
    setFormEmail('');
    setFormPassword('');
    setFormPhone('');
    setFormLoyaltyPoints(0);
    setFormCity('');
    setFormDistrict('');
    setFormWard('');
    setFormAddress('');
    setFormIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  // Mở Modal biểu mẫu chỉnh sửa
  const handleOpenEditModal = (user: UserItem) => {
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormPassword(''); // Không đổ mật khẩu cũ vì lý do bảo mật
    setFormPhone(user.phone || '');
    setFormLoyaltyPoints(user.loyaltyPoints);
    setFormCity(user.city || '');
    setFormDistrict(user.district || '');
    setFormWard(user.ward || '');
    setFormAddress(user.address || '');
    setFormIsActive(user.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  // Thay đổi nhanh trạng thái hoạt động của tài khoản khách hàng
  const handleToggleStatus = (user: UserItem) => {
    const actionText = user.isActive ? 'KHÓA' : 'KÍCH HOẠT LẠI';
    setConfirmModal({
      isOpen: true,
      title: `${user.isActive ? 'Khóa' : 'Kích Hoạt Lại'} Tài Khoản`,
      message: `Bạn có chắc chắn muốn ${actionText} tài khoản khách hàng "${user.fullName}"?`,
      variant: user.isActive ? 'warning' : 'primary',
      onConfirm: () => executeToggleStatus(user)
    });
  };

  const executeToggleStatus = async (user: UserItem) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Lỗi xác thực', { description: 'Hết hạn phiên làm việc quản trị.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !user.isActive })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_profile');
          toast.error('Phiên đăng nhập hết hạn', { description: 'Vui lòng đăng nhập lại.' });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cập nhật trạng thái người dùng thất bại.');
      }

      // Cập nhật trạng thái cục bộ tức thời
      setUsers(prev => prev.map(item => 
        item.id === user.id ? { ...item, isActive: !item.isActive } : item
      ));

      toast.success('Cập nhật trạng thái thành công', {
        description: `Tài khoản "${user.fullName}" đã được ${user.isActive ? 'tạm khóa' : 'kích hoạt'}.`,
        duration: 3000
      });

      fetchStats(); // Tải lại số liệu thống kê
    } catch (err: any) {
      toast.error('Lỗi cập nhật', { description: err.message });
    }
  };

  // Lưu Form (Tạo mới hoặc Cập nhật tài khoản)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formFullName.trim()) {
      setFormError('Vui lòng điền họ và tên.');
      return;
    }
    if (!formEmail.trim()) {
      setFormError('Vui lòng điền địa chỉ email.');
      return;
    }
    if (!editingUser && !formPassword) {
      setFormError('Vui lòng nhập mật khẩu cho tài khoản mới.');
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setFormError('Phiên làm việc quản trị đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    setIsSaving(true);

    const payload: any = {
      fullName: formFullName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || undefined,
      loyaltyPoints: Number(formLoyaltyPoints),
      city: formCity.trim() || undefined,
      district: formDistrict.trim() || undefined,
      ward: formWard.trim() || undefined,
      address: formAddress.trim() || undefined,
      isActive: formIsActive
    };

    if (formPassword) {
      payload.password = formPassword;
    }

    try {
      const url = editingUser 
        ? `http://localhost:3000/users/${editingUser.id}`
        : 'http://localhost:3000/users';
      const method = editingUser ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_profile');
          toast.error('Phiên đăng nhập hết hạn', { description: 'Vui lòng đăng nhập lại.' });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }
        const errorMessage = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(errorMessage || 'Không thể lưu tài khoản khách hàng.');
      }

      toast.success(editingUser ? 'Cập nhật tài khoản thành công' : 'Thêm tài khoản mới thành công', {
        description: `Đã đồng bộ thông tin tài khoản "${payload.fullName}" vào hệ thống.`,
        duration: 3000
      });

      setIsModalOpen(false);
      fetchUsers(currentPage, searchTerm); // Tải lại danh sách trang hiện tại
      fetchStats(); // Tải lại thông số thống kê
    } catch (err: any) {
      setFormError(err.message || 'Đã có lỗi hệ thống xảy ra khi lưu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Xóa tài khoản khách hàng
  const handleDeleteUser = (user: UserItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Tài Khoản Khách Hàng',
      message: `Bạn có chắc chắn muốn xóa tài khoản "${user.fullName}"? Hành động này sẽ xóa vĩnh viễn toàn bộ hồ sơ khách hàng khỏi cơ sở dữ liệu!`,
      variant: 'danger',
      onConfirm: () => executeDeleteUser(user)
    });
  };

  const executeDeleteUser = async (user: UserItem) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Lỗi xác thực', { description: 'Hết hạn phiên đăng nhập quản trị.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_profile');
          toast.error('Phiên đăng nhập hết hạn', { description: 'Vui lòng đăng nhập lại.' });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Xóa tài khoản thất bại.');
      }

      toast.success('Xóa tài khoản thành công', {
        description: `Tài khoản khách hàng "${user.fullName}" đã bị gỡ bỏ hoàn toàn.`,
        duration: 3000
      });

      // Nếu xóa phần tử cuối cùng của trang và ở trang > 1, tự động lùi về trang trước
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchUsers(currentPage, searchTerm);
      }
      fetchStats();
    } catch (err: any) {
      toast.error('Lỗi xóa tài khoản', { description: err.message });
    }
  };

  // Helper sinh màu sắc ngẫu nhiên bắt mắt làm hình nền cho Avatar
  const getAvatarBgColor = (name: string) => {
    const colors = [
      'bg-emerald-600 text-emerald-100',
      'bg-sky-600 text-sky-100',
      'bg-indigo-600 text-indigo-100',
      'bg-rose-600 text-rose-100',
      'bg-amber-600 text-amber-100',
      'bg-violet-600 text-violet-100',
      'bg-cyan-600 text-cyan-100',
      'bg-orange-600 text-orange-100',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* 1. NÚT THÊM TÀI KHOẢN MỚI + LÀM MỚI */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => { fetchUsers(currentPage, searchTerm); fetchStats(); }}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-300 rounded-xl transition duration-150 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition duration-150 shadow-lg shadow-emerald-600/20 cursor-pointer border-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khách Hàng Mới</span>
        </button>
      </div>

      {/* 2. THẺ CHỈ SỐ THỐNG KÊ NGƯỜI DÙNG */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Khách hàng"
          value={stats.totalUsers}
          icon={Users}
          color="indigo"
          isLoading={isStatsLoading}
          comparisonText="Đăng ký tham gia nền tảng"
        />
        <StatCard
          title="Hoạt động"
          value={stats.activeUsers}
          icon={CheckCircle}
          color="emerald"
          isLoading={isStatsLoading}
          comparisonText="Tài khoản khả dụng"
        />
        <StatCard
          title="Đang tạm khóa"
          value={stats.blockedUsers}
          icon={ShieldAlert}
          color="red"
          isLoading={isStatsLoading}
          comparisonText="Vi phạm điều khoản hoặc bị khóa"
        />
        <StatCard
          title="Quỹ điểm tích lũy"
          value={stats.totalLoyaltyPoints}
          icon={Award}
          color="amber"
          isLoading={isStatsLoading}
          comparisonText="Được lưu hành toàn mạng lưới"
        />
      </div>

      {/* 3. BỘ LỌC TÌM KIẾM DÙNG CHUNG */}
      <AdminSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm nhanh khách hàng theo tên, email, số điện thoại..."
      />

      {/* 4. BẢNG DANH SÁCH KHÁCH HÀNG */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-thead">
                <th className="admin-table-th w-16 text-center">Ảnh</th>
                <th className="admin-table-th w-56">Khách hàng</th>
                <th className="admin-table-th w-56">Liên hệ</th>
                <th className="admin-table-th">Khu vực sinh sống</th>
                <th className="admin-table-th w-28 text-center">Điểm Loyalty</th>
                <th className="admin-table-th w-28 text-center">Trạng thái</th>
                <th className="admin-table-th w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="admin-table-tbody">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                      <span>Đang đồng bộ cơ sở dữ liệu khách hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map(user => {
                  const initial = user.fullName.trim().charAt(0).toUpperCase();
                  const avatarColorClass = getAvatarBgColor(user.fullName);
                  
                  return (
                    <tr key={user.id} className="admin-table-tr">
                      
                      {/* 1. ẢNH ĐẠI DIỆN */}
                      <td className="admin-table-td text-center">
                        <div className="flex justify-center items-center">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.fullName} 
                              className="w-10 h-10 rounded-full border border-slate-800 object-cover"
                            />
                          ) : (
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 text-sm font-extrabold shadow-sm ${avatarColorClass}`}>
                              {initial}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. HỌ & TÊN KHÁCH HÀNG */}
                      <td className="admin-table-td font-extrabold text-white text-xs leading-normal">
                        <div className="space-y-0.5">
                          <div>{user.fullName}</div>
                          <div className="text-[10px] font-mono text-slate-500 font-semibold">ID: {user.id}</div>
                        </div>
                      </td>

                      {/* 3. LIÊN HỆ */}
                      <td className="admin-table-td text-slate-400 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[180px] text-[11px] font-medium">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="text-[11px] font-mono font-medium">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. ĐỊA CHỈ */}
                      <td className="admin-table-td text-slate-400 text-xs leading-relaxed font-medium">
                        {user.city || user.district || user.address ? (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>
                              {[user.address, user.ward, user.district, user.city]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Chưa đăng ký địa chỉ</span>
                        )}
                      </td>

                      {/* 5. ĐIỂM LOYALTY */}
                      <td className="admin-table-td text-center">
                        <span className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border border-slate-850 bg-amber-500/10 text-amber-400`}>
                          <Award className="w-3.5 h-3.5" />
                          <span>{user.loyaltyPoints}</span>
                        </span>
                      </td>

                      {/* 6. TRẠNG THÁI TÀI KHOẢN */}
                      <td className="admin-table-td text-center">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.isActive ? 'Bấm để Tạm Khóa tài khoản' : 'Bấm để Kích Hoạt tài khoản'}
                          className="bg-transparent border-0 cursor-pointer p-0"
                        >
                          {user.isActive ? (
                            <span className="admin-table-badge admin-table-badge-emerald">
                              Hoạt động
                            </span>
                          ) : (
                            <span className="admin-table-badge admin-table-badge-slate text-rose-400 border-rose-950/20 bg-rose-500/5">
                              Đang khóa
                            </span>
                          )}
                        </button>
                      </td>

                      {/* 7. THAO TÁC */}
                      <td className="admin-table-td text-center">
                        <div className="flex items-center justify-center gap-2">
                          
                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={user.isActive ? 'Khóa tài khoản' : 'Kích hoạt lại tài khoản'}
                            className="bg-transparent border-0 cursor-pointer p-0"
                          >
                            {user.isActive ? (
                              <ToggleRight className="w-7 h-7 text-emerald-500 transition hover:scale-105" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-slate-400 transition hover:scale-105" />
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Sửa thông tin tài khoản"
                            className="admin-table-btn-icon"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            title="Xóa tài khoản vĩnh viễn"
                            className="admin-table-btn-icon admin-table-btn-icon-danger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy tài khoản khách hàng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. PHÂN TRANG PHÍA DƯỚI BẢNG DỮ LIỆU */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 px-5 py-4 rounded-2xl shadow-lg">
          <div className="text-xs text-slate-400 font-bold">
            Hiển thị trang <span className="text-emerald-400">{currentPage}</span> / {totalPages} (Tổng cộng <span className="text-emerald-400">{totalCount}</span> khách hàng)
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-xs font-bold text-slate-350 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition cursor-pointer"
            >
              Trước
            </button>
            
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-9 h-9 flex items-center justify-center text-xs font-extrabold rounded-xl transition cursor-pointer ${
                  currentPage === pageNumber
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-xs font-bold text-slate-350 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* MODAL BIỂU MẪU THÊM/SỬA KHÁCH HÀNG */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        formFullName={formFullName}
        setFormFullName={setFormFullName}
        formEmail={formEmail}
        setFormEmail={setFormEmail}
        formPassword={formPassword}
        setFormPassword={setFormPassword}
        formPhone={formPhone}
        setFormPhone={setFormPhone}
        formLoyaltyPoints={formLoyaltyPoints}
        setFormLoyaltyPoints={setFormLoyaltyPoints}
        formCity={formCity}
        setFormCity={setFormCity}
        formDistrict={formDistrict}
        setFormDistrict={setFormDistrict}
        formWard={formWard}
        setFormWard={setFormWard}
        formAddress={formAddress}
        setFormAddress={setFormAddress}
        formIsActive={formIsActive}
        setFormIsActive={setFormIsActive}
        formError={formError}
        isSaving={isSaving}
        onSave={handleSaveUser}
      />

      {/* POPUP XÁC NHẬN CHUNG CHO ADMIN */}
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
