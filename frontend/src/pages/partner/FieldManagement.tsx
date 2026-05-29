import React, { useState } from 'react';
import { Trophy, Plus, Search, Edit3, Trash2, ToggleLeft, ToggleRight, X, ShieldAlert } from 'lucide-react';

interface FieldItem {
  id: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  status: 'active' | 'maintenance';
  description: string;
}

export const FieldManagement: React.FC = () => {
  // Danh sách các sân thể thao của Chủ Sân này
  const [fields, setFields] = useState<FieldItem[]>([
    { id: 'F001', name: 'Sân Cầu Lông Pro A1', sportType: 'Cầu lông', pricePerHour: 80000, status: 'active', description: 'Thảm PVC chuyên dụng, chiếu sáng chống lóa.' },
    { id: 'F002', name: 'Sân Cầu Lông Pro A2', sportType: 'Cầu lông', pricePerHour: 80000, status: 'active', description: 'Thảm PVC chất lượng cao, vị trí gần quầy dịch vụ.' },
    { id: 'F003', name: 'Sân Cầu Lông Pro A3', sportType: 'Cầu lông', pricePerHour: 80000, status: 'maintenance', description: 'Đang bảo dưỡng hệ thống đèn chiếu sáng.' },
    { id: 'F004', name: 'Sân Bóng Đá 5 Người B1', sportType: 'Bóng đá', pricePerHour: 250000, status: 'active', description: 'Cỏ nhân tạo nhập khẩu, tiêu chuẩn FIFA.' },
    { id: 'F005', name: 'Sân Bóng Đá 5 Người B2', sportType: 'Bóng đá', pricePerHour: 250000, status: 'active', description: 'Cỏ nhân tạo, có lưới bao quanh chắc chắn.' },
  ]);

  // Bộ lọc tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // Trạng thái Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldItem | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formSportType, setFormSportType] = useState('Cầu lông');
  const [formPrice, setFormPrice] = useState(80000);
  const [formStatus, setFormStatus] = useState<'active' | 'maintenance'>('active');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');

  // Lọc
  const filteredFields = fields.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.sportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mở modal
  const handleOpenAddModal = () => {
    setEditingField(null);
    setFormName('');
    setFormSportType('Cầu lông');
    setFormPrice(80000);
    setFormStatus('active');
    setFormDesc('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (f: FieldItem) => {
    setEditingField(f);
    setFormName(f.name);
    setFormSportType(f.sportType);
    setFormPrice(f.pricePerHour);
    setFormStatus(f.status);
    setFormDesc(f.description);
    setFormError('');
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Lưu Form
  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên sân thể thao.');
      return;
    }

    if (formPrice <= 0) {
      setFormError('Giá thuê sân mỗi giờ phải lớn hơn 0đ.');
      return;
    }

    if (editingField) {
      setFields(prev => prev.map(item => 
        item.id === editingField.id 
          ? { ...item, name: formName, sportType: formSportType, pricePerHour: formPrice, status: formStatus, description: formDesc }
          : item
      ));
    } else {
      const newField: FieldItem = {
        id: 'F' + Date.now().toString().slice(-3),
        name: formName,
        sportType: formSportType,
        pricePerHour: formPrice,
        status: formStatus,
        description: formDesc
      };
      setFields(prev => [...prev, newField]);
    }

    setIsModalOpen(false);
  };

  // Xóa sân
  const handleDeleteField = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sân này khỏi danh sách quản lý?')) {
      setFields(prev => prev.filter(item => item.id !== id));
    }
  };

  // Thay đổi trạng thái hoạt động nhanh
  const handleToggleStatus = (id: string, current: 'active' | 'maintenance') => {
    const next: 'active' | 'maintenance' = current === 'active' ? 'maintenance' : 'active';
    setFields(prev => prev.map(item => 
      item.id === id ? { ...item, status: next } : item
    ));
  };

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* Hàng tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Quản Lý Danh Sách Sân Thể Thao
          </h3>
          <p className="text-xs text-slate-400 m-0">Khai báo, cấu hình khung giá và giám sát tình trạng hoạt động cụm sân của bạn</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition duration-150 shadow-lg shadow-amber-500/10 cursor-pointer border-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sân Mới</span>
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Tổng số sân</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-0">{fields.length} sân</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase text-emerald-400">Đang hoạt động</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-0">{fields.filter(f => f.status === 'active').length} sân</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase text-amber-500">Đang bảo trì</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-0">{fields.filter(f => f.status === 'maintenance').length} sân</h3>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4.5 h-4.5 text-slate-500 shrink-0" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm nhanh sân theo tên, môn thể thao..." 
          className="bg-transparent border-0 text-xs text-slate-200 focus:outline-none placeholder-slate-700 w-full"
        />
      </div>

      {/* Bảng sân */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-thead">
                <th className="admin-table-th w-24 text-center">Mã Sân</th>
                <th className="admin-table-th">Tên Sân Thể Thao</th>
                <th className="admin-table-th w-32">Bộ Môn</th>
                <th className="admin-table-th w-40 text-right">Đơn giá / Giờ</th>
                <th className="admin-table-th w-36 text-center">Trạng thái</th>
                <th className="admin-table-th w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="admin-table-tbody">
              {filteredFields.length > 0 ? (
                filteredFields.map(f => (
                  <tr key={f.id} className="admin-table-tr">
                    <td className="admin-table-td text-center font-mono font-bold text-slate-500">{f.id}</td>
                    <td className="admin-table-td">
                      <div>
                        <p className="admin-table-td-bold m-0">{f.name}</p>
                        <span className="text-[9px] text-slate-500 block mt-0.5">{f.description || 'Chưa cập nhật mô tả.'}</span>
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-850">
                        {f.sportType}
                      </span>
                    </td>
                    <td className="admin-table-td text-right font-black text-amber-400 font-mono">
                      {f.pricePerHour.toLocaleString('vi-VN')}đ / giờ
                    </td>
                    <td className="admin-table-td text-center">
                      <button
                        onClick={() => handleToggleStatus(f.id, f.status)}
                        className="bg-transparent border-0 cursor-pointer p-0"
                      >
                        {f.status === 'active' ? (
                          <span className="admin-table-badge admin-table-badge-emerald">Hoạt động</span>
                        ) : (
                          <span className="admin-table-badge admin-table-badge-amber">Bảo trì</span>
                        )}
                      </button>
                    </td>
                    <td className="admin-table-td text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(f)}
                          className="admin-table-btn-icon"
                          title="Chỉnh sửa sân"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(f.id)}
                          className="admin-table-btn-icon admin-table-btn-icon-danger"
                          title="Xóa sân"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Không tìm thấy sân nào trong danh sách.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseModal} className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"></div>
          
          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-white m-0 uppercase flex items-center gap-2">
                <Trophy className="w-4.5 h-4.5 text-amber-500" />
                {editingField ? 'Chỉnh Sửa Sân' : 'Thêm Sân Thể Thao'}
              </h3>
              <button onClick={handleCloseModal} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer border-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveField} className="space-y-4 text-left">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên sân thể thao</label>
                <input 
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Sân Cầu Lông Số 5, Sân Cỏ B3..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Môn thể thao</label>
                  <select
                    value={formSportType}
                    onChange={(e) => setFormSportType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Cầu lông">🏸 Cầu lông</option>
                    <option value="Bóng đá">⚽ Bóng đá</option>
                    <option value="Pickleball">🏓 Pickleball</option>
                    <option value="Tennis">🎾 Tennis</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Đơn giá / Giờ</label>
                  <input 
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả đặc điểm</label>
                <textarea 
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Ví dụ: Thảm chuyên dụng, vị trí đẹp..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-850 mt-4 select-none">
                <div>
                  <span className="text-xs font-bold text-white block">Trạng thái sân</span>
                  <span className="text-[9px] text-slate-500">Mở để đón lịch đặt của khách, tắt khi sửa chữa</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormStatus(prev => prev === 'active' ? 'maintenance' : 'active')}
                  className="bg-transparent border-0 cursor-pointer p-0 text-slate-400 hover:text-white transition duration-150"
                >
                  {formStatus === 'active' ? (
                    <ToggleRight className="w-8 h-8 text-amber-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-amber-500/10"
                >
                  Lưu Sân Thể Thao
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
