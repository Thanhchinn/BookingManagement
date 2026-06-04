import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Loader2 } from 'lucide-react';
import { SportFormModal } from './SportFormModal';
import { toast } from 'sonner';
import { AdminConfirmModal } from '../../../features/admin/components/AdminConfirmModal';
import { AdminSearchFilter } from '../../../features/admin/components/AdminSearchFilter';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  colorBg: string;
  colorText: string;
  isActive: boolean;
  sortOrder: number;
}

export const SportsManagement: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Các trạng thái phân trang phía Server (Pagination States)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5; // Số bộ môn hiển thị trên từng trang để tối ưu thị giác

  // Trạng thái hiển thị Modal (Thêm / Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<CategoryItem | null>(null);

  // Trạng thái Form của bộ môn
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIcon, setFormIcon] = useState('🏸');
  const [formColorBg, setFormColorBg] = useState('bg-emerald-500/10');
  const [formColorText, setFormColorText] = useState('text-emerald-400');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Trạng thái Popup Xóa chung (AdminConfirmModal)
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

  // Gọi API tải danh sách bộ môn thể thao từ Backend (Hỗ trợ phân trang & tìm kiếm phía máy chủ)
  const fetchCategories = async (page = currentPage, searchVal = searchTerm) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/categories?page=${page}&limit=${pageSize}&search=${encodeURIComponent(searchVal)}`
      );
      if (!response.ok) throw new Error('Không thể tải dữ liệu danh mục.');
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setCategories(data);
        setTotalCount(data.length);
        setTotalPages(1);
      } else if (data && data.data && Array.isArray(data.data)) {
        setCategories(data.data);
        setTotalCount(data.meta.total);
        setTotalPages(data.meta.totalPages);
      }
    } catch (err: any) {
      toast.error('Lỗi tải dữ liệu', {
        description: err.message || 'Không thể kết nối đến máy chủ API.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Tải dữ liệu khi chuyển trang (Triggered on currentPage change)
  useEffect(() => {
    fetchCategories(currentPage, searchTerm);
  }, [currentPage]);

  // 2. Tự động Debounce từ khóa tìm kiếm (Tối ưu hiệu năng, tránh dồn ứ API request liên tục)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (currentPage === 1) {
        fetchCategories(1, searchTerm);
      } else {
        setCurrentPage(1); // Chuyển về trang 1 sẽ tự kích hoạt useEffect tải dữ liệu
      }
    }, 300); // Trễ 300ms chuẩn

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Dữ liệu bảng (Server-side đã được lọc nên lấy trực tiếp từ categories)
  const filteredCategories = categories;

  // Tiện ích tự động tạo Slug không dấu thân thiện từ Tên tiếng Việt
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Khử dấu
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '') // Khử ký tự đặc biệt
      .replace(/(\s+)/g, '-') // Đổi khoảng trắng thành gạch ngang
      .replace(/-+/g, '-') // Khử gạch ngang thừa
      .replace(/^-+|-+$/g, '');
  };

  // Lắng nghe thay đổi tên để cập nhật Slug tự động khi thêm mới
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingSport) {
      setFormSlug(generateSlug(val));
    }
  };

  // Mở Modal biểu mẫu để thêm mới
  const handleOpenAddModal = () => {
    setEditingSport(null);
    setFormName('');
    setFormSlug('');
    setFormIcon('🏸');
    setFormColorBg('bg-emerald-500/10');
    setFormColorText('text-emerald-400');
    setFormIsActive(true);
    setFormSortOrder(0);
    setFormError('');
    setIsModalOpen(true);
  };

  // Mở Modal biểu mẫu để chỉnh sửa
  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingSport(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormIcon(cat.icon);
    setFormColorBg(cat.colorBg);
    setFormColorText(cat.colorText);
    setFormIsActive(cat.isActive);
    setFormSortOrder(cat.sortOrder);
    setFormError('');
    setIsModalOpen(true);
  };

  // Thay đổi nhanh trạng thái hoạt động của bộ môn trực tiếp trên hàng của bảng
  const handleToggleStatus = async (cat: CategoryItem) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Lỗi xác thực', { description: 'Hết hạn phiên đăng nhập quản trị.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/categories/${cat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !cat.isActive })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cập nhật trạng thái thất bại.');
      }

      // Cập nhật trạng thái cục bộ tức thời
      setCategories(prev => prev.map(item => 
        item.id === cat.id ? { ...item, isActive: !item.isActive } : item
      ));

      toast.success('Cập nhật trạng thái thành công', {
        description: `Môn "${cat.name}" đã được ${!cat.isActive ? 'kích hoạt' : 'tạm dừng'} hiển thị.`,
        duration: 3000
      });
    } catch (err: any) {
      toast.error('Lỗi cập nhật', { description: err.message });
    }
  };

  // Lưu Form (Tạo mới hoặc cập nhật bộ môn)
  const handleSaveSport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên bộ môn.');
      return;
    }
    if (!formSlug.trim()) {
      setFormError('Vui lòng nhập đường dẫn slug.');
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setFormError('Phiên làm việc quản trị đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      icon: formIcon,
      colorBg: formColorBg,
      colorText: formColorText,
      isActive: formIsActive,
      sortOrder: Number(formSortOrder)
    };

    try {
      const url = editingSport 
        ? `http://localhost:3000/categories/${editingSport.id}`
        : 'http://localhost:3000/categories';
      const method = editingSport ? 'PATCH' : 'POST';

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
        const errorMessage = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(errorMessage || 'Không thể lưu thông tin bộ môn.');
      }

      toast.success(editingSport ? 'Cập nhật bộ môn thành công' : 'Thêm bộ môn mới thành công', {
        description: `Đã đồng bộ hóa danh mục "${payload.name}" vào hệ thống.`,
        duration: 3000
      });

      setIsModalOpen(false);
      fetchCategories(currentPage, searchTerm); // Tải lại trang hiện tại
    } catch (err: any) {
      setFormError(err.message || 'Đã có lỗi hệ thống xảy ra.');
    } finally {
      setIsSaving(false);
    }
  };

  // Xóa danh mục bộ môn thể thao
  const handleDeleteSport = (cat: CategoryItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Danh Mục Bộ Môn',
      message: `Bạn có chắc chắn muốn xóa bộ môn "${cat.name}"? Thao tác này sẽ gỡ bỏ danh mục vĩnh viễn khỏi toàn bộ hệ thống sân bãi!`,
      variant: 'danger',
      onConfirm: () => executeDeleteSport(cat)
    });
  };

  const executeDeleteSport = async (cat: CategoryItem) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Lỗi xác thực', { description: 'Hết hạn phiên đăng nhập quản trị.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/categories/${cat.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Xóa bộ môn thất bại.');
      }

      toast.success('Xóa bộ môn thành công', {
        description: `Bộ môn "${cat.name}" đã bị xóa bỏ hoàn toàn khỏi cơ sở dữ liệu.`,
        duration: 3000
      });

      // Nếu xóa phần tử cuối cùng của trang và trang hiện tại > 1, tự động nhảy lùi 1 trang
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchCategories(currentPage, searchTerm);
      }
    } catch (err: any) {
      toast.error('Lỗi xóa bộ môn', { description: err.message });
    }
  };

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* 1. NÚT THÊM MỚI BỘ MÔN */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition duration-150 shadow-lg shadow-emerald-600/20 cursor-pointer border-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Bộ Môn Mới</span>
        </button>
      </div>

      {/* 2. THẺ CHỈ SỐ THỐNG KÊ DANH MỤC */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Tổng Số Bộ Môn */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Tổng bộ môn</span>
            <span className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg text-emerald-400">🏅</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : totalCount}
          </h3>
          <p className="text-[10px] text-slate-400 m-0 mt-1">Đồng bộ hoàn toàn Postgres</p>
        </div>

        {/* Đang Hoạt Động */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Đang hoạt động</span>
            <span className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg text-emerald-400">🟢</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : (
              categories.filter(c => c.isActive).length
            )}
          </h3>
          <p className="text-[10px] text-emerald-400 font-bold m-0 mt-1">Sân bãi hiển thị ngoài Client</p>
        </div>

        {/* Tạm Dừng Hoạt Động */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Tạm ngưng</span>
            <span className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg text-rose-400">🔴</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : (
              categories.filter(c => !c.isActive).length
            )}
          </h3>
          <p className="text-[10px] text-rose-400 font-bold m-0 mt-1">Tạm thời ẩn ngoài tìm kiếm</p>
        </div>

      </div>

      {/* 3. THANH TÌM KIẾM DÙNG CHUNG */}
      <AdminSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm nhanh danh mục bộ môn theo tên, đường dẫn slug..."
      />

      {/* 4. BẢNG DỮ LIỆU ĐƯỢC THIẾT KẾ ĐẲNG CẤP */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-thead">
                <th className="admin-table-th w-16 text-center">Icon</th>
                <th className="admin-table-th w-48">Bộ môn</th>
                <th className="admin-table-th">Đường dẫn (Slug)</th>
                <th className="admin-table-th w-32 text-center">Thứ tự ưu tiên</th>
                <th className="admin-table-th w-32 text-center">Trạng thái</th>
                <th className="admin-table-th w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="admin-table-tbody">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                      <span>Đang đồng bộ dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map(cat => (
                  <tr key={cat.id} className="admin-table-tr">
                    
                    {/* BIỂU TƯỢNG EMOJI */}
                    <td className="admin-table-td text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-slate-950 rounded-xl text-xl border border-slate-850">
                        {cat.icon}
                      </span>
                    </td>

                    {/* BADGE BỘ MÔN KHẢ TÙY CHỈNH MÀU SẮC */}
                    <td className="admin-table-td">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-extrabold border border-transparent shadow-xs ${cat.colorBg} ${cat.colorText}`}>
                        {cat.name}
                      </span>
                    </td>

                    {/* ĐƯỜNG DẪN MONO SLUG */}
                    <td className="admin-table-td font-mono text-[11px] text-slate-400">
                      /{cat.slug}
                    </td>

                    {/* THỨ TỰ SẮP XẾP */}
                    <td className="admin-table-td text-center font-extrabold text-slate-300">
                      {cat.sortOrder}
                    </td>

                    {/* CÔNG TẮC BẬT TẮT NHANH TRẠNG THÁI */}
                    <td className="admin-table-td text-center">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        title={cat.isActive ? 'Bấm để Tạm Ngưng' : 'Bấm để Kích Hoạt'}
                        className="bg-transparent border-0 cursor-pointer p-0"
                      >
                        {cat.isActive ? (
                          <span className="admin-table-badge admin-table-badge-emerald">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="admin-table-badge admin-table-badge-slate">
                            Tạm ngưng
                          </span>
                        )}
                      </button>
                    </td>

                    {/* HÀNH ĐỘNG CẬP NHẬT / XÓA */}
                    <td className="admin-table-td text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          title="Chỉnh sửa thông tin"
                          className="admin-table-btn-icon"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteSport(cat)}
                          title="Xóa danh mục bộ môn"
                          className="admin-table-btn-icon admin-table-btn-icon-danger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy danh mục bộ môn nào hợp lệ.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. THANH ĐIỀU HƯỚNG PHÂN TRANG (PAGINATION PANEL) */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 px-5 py-4 rounded-2xl shadow-lg">
          <div className="text-xs text-slate-400 font-bold">
            Hiển thị trang <span className="text-emerald-400">{currentPage}</span> / {totalPages} (Tổng cộng <span className="text-emerald-400">{totalCount}</span> bộ môn)
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
              className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-xs font-bold text-slate-355 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* BIỂU MẪU ĐĂNG KÝ / CẬP NHẬT BỘ MÔN */}
      <SportFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingSport={editingSport}
        formName={formName}
        setFormName={handleNameChange}
        formSlug={formSlug}
        setFormSlug={setFormSlug}
        formIcon={formIcon}
        setFormIcon={setFormIcon}
        formColorBg={formColorBg}
        setFormColorBg={setFormColorBg}
        formColorText={formColorText}
        setFormColorText={setFormColorText}
        formIsActive={formIsActive}
        setFormIsActive={setFormIsActive}
        formSortOrder={formSortOrder}
        setFormSortOrder={setFormSortOrder}
        formError={formError}
        isSaving={isSaving}
        onSave={handleSaveSport}
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
