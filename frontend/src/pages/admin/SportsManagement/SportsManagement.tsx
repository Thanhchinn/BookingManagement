import React, { useState } from 'react';
import { Dumbbell, Plus, Search, Edit3, Trash2 } from 'lucide-react';
import { SportFormModal } from './SportFormModal';

interface SportItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  totalFields: number;
  isActive: boolean;
}

export const SportsManagement: React.FC = () => {
  // Dữ liệu giả lập ban đầu của các bộ môn thể thao
  const [sports, setSports] = useState<SportItem[]>([
    { id: '1', name: 'Cầu lông', icon: '🏸', description: 'Môn thể thao dùng vợt phổ biến, đòi hỏi phản xạ nhanh và sự bền bỉ.', totalFields: 42, isActive: true },
    { id: '2', name: 'Bóng đá', icon: '⚽', description: 'Môn thể thao vua với lượng người chơi đông đảo nhất hành tinh.', totalFields: 32, isActive: true },
    { id: '3', name: 'Pickleball', icon: '🏓', description: 'Môn thể thao thời thượng đang phát triển vũ bão, kết hợp bóng bàn và tennis.', totalFields: 24, isActive: true },
    { id: '4', name: 'Tennis', icon: '🎾', description: 'Môn quần vợt quý tộc, phù hợp rèn luyện sức bền và cơ bắp.', totalFields: 18, isActive: true },
    { id: '5', name: 'Bóng rổ', icon: '🏀', description: 'Phù hợp phát triển chiều cao và tinh thần đồng đội cực cao.', totalFields: 10, isActive: false },
  ]);

  // Bộ lọc tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // Trạng thái hiển thị Modal (Thêm / Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<SportItem | null>(null);

  // Trạng thái của Form
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('🏸');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredSports = sports.filter(sport => 
    sport.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sport.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mở Modal để thêm mới
  const handleOpenAddModal = () => {
    setEditingSport(null);
    setFormName('');
    setFormIcon('🏸');
    setFormDescription('');
    setFormIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  // Mở Modal để chỉnh sửa
  const handleOpenEditModal = (sport: SportItem) => {
    setEditingSport(sport);
    setFormName(sport.name);
    setFormIcon(sport.icon);
    setFormDescription(sport.description);
    setFormIsActive(sport.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  // Đóng Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Xử lý Lưu Form (Thêm hoặc Cập nhật)
  const handleSaveSport = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Vui lòng điền tên bộ môn thể thao.');
      return;
    }

    if (editingSport) {
      // Cập nhật bộ môn cũ
      setSports(prev => prev.map(item => 
        item.id === editingSport.id 
          ? { ...item, name: formName, icon: formIcon, description: formDescription, isActive: formIsActive }
          : item
      ));
    } else {
      // Tạo bộ môn mới
      const newSport: SportItem = {
        id: Date.now().toString(),
        name: formName,
        icon: formIcon,
        description: formDescription,
        totalFields: 0, // Mới tạo chưa có sân nào liên kết
        isActive: formIsActive
      };
      setSports(prev => [...prev, newSport]);
    }

    setIsModalOpen(false);
  };

  // Xử lý Xóa bộ môn
  const handleDeleteSport = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bộ môn thể thao này khỏi hệ thống?')) {
      setSports(prev => prev.filter(item => item.id !== id));
    }
  };

  // Xử lý Bật/Tắt nhanh trạng thái hoạt động
  const handleToggleStatus = (id: string) => {
    setSports(prev => prev.map(item => 
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ));
  };

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* 1. THANH TIÊU ĐỀ & NÚT TẠO MỚI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            Quản Lý Bộ Môn Thể Thao
          </h3>
          <p className="text-xs text-slate-400 m-0">Khai báo và cấu hình danh mục bộ môn thể thao trên hệ thống SportZone</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition duration-150 shadow-lg shadow-emerald-600/10 cursor-pointer border-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Bộ Môn Mới</span>
        </button>
      </div>

      {/* 2. THẺ CHỈ SỐ STATS NHANH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Tổng Bộ Môn */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Tổng bộ môn</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-emerald-400">📊</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">{sports.length}</h3>
          <p className="text-[10px] text-slate-500 m-0 mt-1">Được đồng bộ trên toàn quốc</p>
        </div>

        {/* Đang Hoạt Động */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Đang Hoạt Động</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-emerald-400">🟢</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">
            {sports.filter(s => s.isActive).length}
          </h3>
          <p className="text-[10px] text-emerald-500 m-0 mt-1">Hiện hiển thị ngoài Client</p>
        </div>

        {/* Tạm khóa */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Tạm ngưng</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-amber-500">🟡</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3 mb-0">
            {sports.filter(s => !s.isActive).length}
          </h3>
          <p className="text-[10px] text-slate-500 m-0 mt-1">Bị ẩn khỏi trang tìm kiếm</p>
        </div>

      </div>

      {/* 3. THANH TÌM KIẾM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4.5 h-4.5 text-slate-500 shrink-0" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm nhanh bộ môn theo tên, mô tả chi tiết..." 
          className="bg-transparent border-0 text-xs text-slate-200 focus:outline-none placeholder-slate-650 w-full"
        />
      </div>

      {/* 4. DANH SÁCH BẢNG DỮ LIỆU CHUYÊN NGHIỆP */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-thead">
                <th className="admin-table-th w-16 text-center">Icon</th>
                <th className="admin-table-th w-48">Tên bộ môn</th>
                <th className="admin-table-th">Mô tả chi tiết</th>
                <th className="admin-table-th w-32 text-center">Tổng số sân</th>
                <th className="admin-table-th w-32 text-center">Trạng thái</th>
                <th className="admin-table-th w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="admin-table-tbody">
              {filteredSports.length > 0 ? (
                filteredSports.map(sport => (
                  <tr key={sport.id} className="admin-table-tr">
                    
                    {/* ICON EMOJI */}
                    <td className="admin-table-td text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-slate-950 rounded-xl text-xl border border-slate-800">
                        {sport.icon}
                      </span>
                    </td>

                    {/* TÊN BỘ MÔN */}
                    <td className="admin-table-td admin-table-td-bold">
                      {sport.name}
                    </td>

                    {/* MÔ TẢ */}
                    <td className="admin-table-td admin-table-td-muted">
                      {sport.description || 'Chưa cập nhật mô tả.'}
                    </td>

                    {/* TỔNG SỐ SÂN */}
                    <td className="admin-table-td text-center font-bold">
                      {sport.totalFields} sân
                    </td>

                    {/* TRẠNG THÁI */}
                    <td className="admin-table-td text-center">
                      <button
                        onClick={() => handleToggleStatus(sport.id)}
                        title={sport.isActive ? 'Bấm để Tạm Ngưng' : 'Bấm để Kích Hoạt'}
                        className="bg-transparent border-0 cursor-pointer p-0"
                      >
                        {sport.isActive ? (
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

                    {/* THAO TÁC */}
                    <td className="admin-table-td text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* Nút sửa */}
                        <button
                          onClick={() => handleOpenEditModal(sport)}
                          title="Chỉnh sửa thông tin"
                          className="admin-table-btn-icon"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Nút xóa */}
                        <button
                          onClick={() => handleDeleteSport(sport.id)}
                          title="Xóa bộ môn"
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
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    Không tìm thấy bộ môn thể thao nào khớp với từ khóa tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL THÊM/SỬA BỘ MÔN */}
      <SportFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingSport={editingSport}
        formName={formName}
        setFormName={setFormName}
        formIcon={formIcon}
        setFormIcon={setFormIcon}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formIsActive={formIsActive}
        setFormIsActive={setFormIsActive}
        formError={formError}
        onSave={handleSaveSport}
      />

    </div>
  );
};
