import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Edit3, HelpCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface CourtManagementPageProps {
  locationId: string;
  locationName: string;
  onBack: () => void;
}

const formatTimeSlotTime = (timeStr: any) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    const parts = timeStr.split('T')[1].split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  const parts = timeStr.split(':');
  return `${parts[0]}:${parts[1]}`;
};

const formatTimeStr = (hour: number) => {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  const hStr = h.toString().padStart(2, '0');
  const mStr = m.toString().padStart(2, '0');
  return `${hStr}:${mStr}:00`;
};

export const CourtManagementPage: React.FC<CourtManagementPageProps> = ({
  locationId,
  locationName,
  onBack
}) => {
  const token = localStorage.getItem('user_token');

  // Trạng thái view nội bộ của trang quản lý sân:
  // - 'list': hiển thị danh sách sân
  // - 'add': form thêm mới sân đấu
  // - 'edit': form chỉnh sửa thông tin & khung giờ sân đấu
  const [courtView, setCourtView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);

  // States danh sách sân
  const [courts, setCourts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // States biểu mẫu (Court Form)
  const [courtName, setCourtName] = useState('');
  const [courtCategory, setCourtCategory] = useState('Bóng đá');
  const [courtSubType, setCourtSubType] = useState('Sân 5 người');
  const [courtPrice, setCourtPrice] = useState(100000);
  const [courtDesc, setCourtDesc] = useState('');
  const [courtImageUrl, setCourtImageUrl] = useState('');
  const [courtIsActive, setCourtIsActive] = useState(true);
  const [courtSlots, setCourtSlots] = useState<any[]>([]);

  // Hệ thống danh mục bộ môn và tiện ích
  const [systemCategories, setSystemCategories] = useState<any[]>([]);

  // States của Smart Slots Generator
  const [autoType, setAutoType] = useState<'even' | 'odd' | '1h' | '1.5h'>('even');
  const [autoStartHour, setAutoStartHour] = useState(5);
  const [autoEndHour, setAutoEndHour] = useState(22);
  const [autoPriceMod, setAutoPriceMod] = useState(1.0);
  const [autoSelectedDays, setAutoSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);

  // Load danh sách sân đấu & danh mục
  const fetchCourtsAndCategories = async () => {
    setIsLoading(true);
    try {
      // 1. Tải danh mục bộ môn hệ thống
      const catRes = await fetch('http://localhost:3000/categories');
      if (catRes.ok) {
        const cats = await catRes.json();
        setSystemCategories(cats);
      }

      // 2. Tải toàn bộ sân và lọc theo locationId
      const servicesRes = await fetch('http://localhost:3000/services/partner', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (servicesRes.ok) {
        const allServices = await servicesRes.json();
        const matched = allServices.filter(
          (s: any) => s.location && s.location.id.toString() === locationId.toString()
        );
        setCourts(matched);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải dữ liệu sân đấu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourtsAndCategories();
  }, [locationId, courtView]);

  // Kích hoạt form thêm sân mới
  const handleOpenAddCourt = () => {
    setEditingCourtId(null);
    setCourtName('');
    setCourtCategory(systemCategories[0]?.name || 'Bóng đá');
    setCourtSubType('Sân 5 người');
    setCourtPrice(100000);
    setCourtDesc('');
    setCourtImageUrl('');
    setCourtIsActive(true);
    setCourtSlots([]);
    setCourtView('add');
  };

  // Kích hoạt form chỉnh sửa sân
  const handleOpenEditCourt = async (courtId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/services/${courtId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể tải thông tin sân.');
      const detail = await res.json();

      setEditingCourtId(courtId);
      setCourtName(detail.name);
      setCourtCategory(detail.category);
      setCourtSubType(detail.subType || 'Tiêu chuẩn');
      setCourtPrice(Number(detail.basePricePerHour));
      setCourtDesc(detail.description || '');
      setCourtImageUrl(detail.imageUrls?.[0] || '');
      setCourtIsActive(detail.isActive ?? true);
      setCourtSlots((detail.timeSlots || []).map((ts: any) => ({
        dayOfWeek: ts.dayOfWeek,
        startTime: formatTimeSlotTime(ts.startTime),
        endTime: formatTimeSlotTime(ts.endTime),
        priceModifier: Number(ts.priceModifier),
        isAvailable: ts.isAvailable ?? true
      })));
      setCourtView('edit');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải chi tiết sân');
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa sân trực tiếp
  const handleDeleteCourt = async (courtId: string, courtName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sân đấu "${courtName}"? Hành động này sẽ xóa vĩnh viễn các khung giờ của sân.`)) {
      try {
        const res = await fetch(`http://localhost:3000/services/${courtId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success(`Đã xóa sân "${courtName}" thành công!`);
          fetchCourtsAndCategories();
        } else {
          toast.error('Lỗi khi xóa sân từ hệ thống.');
        }
      } catch (err) {
        toast.error('Lỗi kết nối máy chủ.');
      }
    }
  };

  // Smart Slots Generator Engine
  const handleToggleDay = (day: number) => {
    setAutoSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleApplyAutoSlots = () => {
    if (autoStartHour >= autoEndHour) {
      toast.warning('Giờ bắt đầu hoạt động phải nhỏ hơn giờ kết thúc.');
      return;
    }

    const duration = (autoType === '1.5h') ? 1.5 : ((autoType === 'even' || autoType === 'odd') ? 2.0 : 1.0);
    const slots: any[] = [];

    autoSelectedDays.forEach(day => {
      let currentHour = autoStartHour;
      
      // Nếu là giờ chẵn lẻ đặc biệt
      if (autoType === 'even' && currentHour % 2 !== 0) {
        currentHour += 1;
      } else if (autoType === 'odd' && currentHour % 2 === 0) {
        currentHour += 1;
      }

      while (currentHour + duration <= autoEndHour) {
        slots.push({
          dayOfWeek: day,
          startTime: formatTimeStr(currentHour),
          endTime: formatTimeStr(currentHour + duration),
          priceModifier: autoPriceMod,
          isAvailable: true
        });
        
        currentHour += duration;
      }
    });

    setCourtSlots(slots);
    toast.success(`Đã tự động tạo ${slots.length} khung giờ hoạt động!`);
  };

  // Lưu Sân & Khung giờ
  const handleSaveCourtForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courtName.trim()) {
      toast.warning('Vui lòng nhập tên sân.');
      return;
    }
    if (!courtImageUrl.trim()) {
      toast.warning('Vui lòng cung cấp link hình ảnh thực tế của sân.');
      return;
    }

    setIsSaving(true);
    try {
      const courtPayload = {
        locationId,
        name: courtName,
        category: courtCategory,
        subType: courtSubType,
        basePricePerHour: Number(courtPrice),
        description: courtDesc,
        imageUrls: [courtImageUrl],
        isActive: courtIsActive
      };

      const url = courtView === 'add'
        ? 'http://localhost:3000/services'
        : `http://localhost:3000/services/${editingCourtId}`;
      const method = courtView === 'add' ? 'POST' : 'PUT';

      // 1. Lưu thông tin cơ bản sân
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courtPayload)
      });

      if (!res.ok) throw new Error('Không thể lưu thông tin sân đấu.');
      const savedCourt = await res.json();
      const serviceId = courtView === 'add' ? savedCourt.id : editingCourtId;

      // 2. Đồng bộ khung giờ chơi
      if (serviceId) {
        const slotRes = await fetch(`http://localhost:3000/services/${serviceId}/timeslots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ timeSlots: courtSlots })
        });
        if (!slotRes.ok) console.error('Lỗi đồng bộ khung giờ sân.');
      }

      toast.success(courtView === 'add' ? 'Đã thêm sân mới thành công!' : 'Cập nhật sân đấu và khung giờ hoàn tất!');
      setCourtView('list');
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi lưu thông tin sân', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Nút xóa nhanh từng slot lẻ
  const handleRemoveSingleSlot = (index: number) => {
    setCourtSlots(courtSlots.filter((_, idx) => idx !== index));
  };

  // Trình bày ngày của tuần
  const getDayName = (dayNum: number) => {
    switch (dayNum) {
      case 1: return 'Thứ 2';
      case 2: return 'Thứ 3';
      case 3: return 'Thứ 4';
      case 4: return 'Thứ 5';
      case 5: return 'Thứ 6';
      case 6: return 'Thứ 7';
      case 0: return 'Chủ Nhật';
      default: return 'Không xác định';
    }
  };

  // Render Spinner
  if (isLoading && courtView === 'list') {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 font-bold"></div>
        <p className="text-xs text-slate-400 font-medium">Đang tải danh sách sân đấu...</p>
      </div>
    );
  }

  // ---------------- VIEW 1: DANH SÁCH SÂN ĐẤU (LIST VIEW) ----------------
  if (courtView === 'list') {
    return (
      <div className="space-y-6 text-left relative font-sans text-slate-100 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onBack}
              className="p-2 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition cursor-pointer border border-slate-800 bg-slate-950"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-lg font-black text-white m-0 tracking-tight">
                Quản Lý Sân Đấu
              </h3>
              <p className="text-[11px] text-slate-400 m-0">Cơ sở: <span className="text-amber-400 font-bold">{locationName}</span></p>
            </div>
          </div>
          <button
            onClick={handleOpenAddCourt}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition duration-150 shadow-lg shadow-amber-500/10 cursor-pointer border-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sân Đấu</span>
          </button>
        </div>

        {/* List of Courts */}
        {courts.length === 0 ? (
          <div className="py-24 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-center text-slate-500 text-xs">
            🏢 Cơ sở này hiện tại chưa được cấu hình sân đấu. Vui lòng nhấn "Thêm Sân Đấu" để bắt đầu.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courts.map(c => (
              <div 
                key={c.id} 
                className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between transition group"
              >
                {/* Court Image */}
                <div className="h-40 bg-slate-950 relative overflow-hidden">
                  <img 
                    src={c.imageUrls?.[0] || 'https://images.unsplash.com/photo-1545224144-b38cd309e0a1?q=80&w=600'} 
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    {c.isActive ? (
                      <span className="text-[8px] font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/20">Hoạt động</span>
                    ) : (
                      <span className="text-[8px] font-black text-amber-500 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/20">Bảo trì</span>
                    )}
                  </div>
                </div>

                {/* Court Meta */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-white">{c.name}</span>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-900">
                        {c.category}
                      </span>
                    </div>
                    {c.subType && (
                      <span className="text-[9px] text-slate-500 font-semibold block">{c.subType}</span>
                    )}
                    <p className="text-[10px] text-slate-400 line-clamp-2 italic m-0">{c.description || 'Không có mô tả cho sân này.'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-950 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Giá gốc / giờ</span>
                      <span className="text-xs font-black text-amber-400 font-mono">{(Number(c.basePricePerHour) || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 font-mono">⏰ {c._count?.timeSlots || 0} slots giờ chơi</span>
                  </div>
                </div>

                {/* Court Actions */}
                <div className="px-5 pb-5 pt-0 flex gap-2">
                  <button
                    onClick={() => handleOpenEditCourt(c.id)}
                    className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-[10px] font-bold text-slate-300 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-amber-500" />
                    Cấu hình & Giờ chơi
                  </button>
                  <button
                    onClick={() => handleDeleteCourt(c.id, c.name)}
                    className="p-2 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                    title="Xóa sân đấu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    );
  }

  // ---------------- VIEW 2: FORM THÊM / SỬA SÂN ĐẤU (PAGE VIEW) ----------------
  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100 animate-in fade-in duration-200">
      
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setCourtView('list')}
            className="p-2 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition cursor-pointer border border-slate-800 bg-slate-950"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-lg font-black text-white m-0 tracking-tight">
              {courtView === 'add' ? 'Thêm Sân Đấu Mới' : `Cấu hình Sân: ${courtName}`}
            </h3>
            <p className="text-[11px] text-slate-400 m-0">Khai báo cấu hình sân đấu và bảng giá khung giờ hoạt động</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveCourtForm}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-amber-500/10"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu Sân Đấu'}</span>
        </button>
      </div>

      {/* Grid biểu mẫu chia làm 2 cột: Cấu hình thông tin / Cấu hình giờ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN SÂN (4/12) */}
        <div className="md:col-span-5 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-5 h-fit">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-slate-950 pb-3 flex items-center gap-2">
            <span className="p-1 bg-amber-500/10 text-amber-500 rounded-lg">🏸</span>
            Thông tin sân đấu
          </h4>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block">Tên sân đấu *</label>
              <input 
                type="text"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="Ví dụ: Sân số 1 cỏ nhân tạo"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Bộ môn thể thao *</label>
                <select
                  value={courtCategory}
                  onChange={(e) => setCourtCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-semibold cursor-pointer"
                >
                  {systemCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Phân loại sân (Kích thước)</label>
                <input 
                  type="text"
                  value={courtSubType}
                  onChange={(e) => setCourtSubType(e.target.value)}
                  placeholder="Ví dụ: Sân 5 người, Thảm PVC..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Giá thuê cơ bản (đ/giờ) *</label>
                <input 
                  type="number"
                  value={courtPrice}
                  onChange={(e) => setCourtPrice(Number(e.target.value))}
                  placeholder="Ví dụ: 80000"
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono font-bold text-amber-400"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850 self-end h-[38px]">
                <span className="text-[10px] font-bold text-white">Sân hoạt động</span>
                <input 
                  type="checkbox"
                  checked={courtIsActive}
                  onChange={(e) => setCourtIsActive(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block">Mô tả đặc điểm sân</label>
              <textarea 
                value={courtDesc}
                onChange={(e) => setCourtDesc(e.target.value)}
                placeholder="Mô tả chất lượng cỏ, thảm, ánh sáng..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 min-h-[60px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block">Đường dẫn ảnh sân đấu (Image URL) *</label>
              <input 
                type="text"
                value={courtImageUrl}
                onChange={(e) => setCourtImageUrl(e.target.value)}
                placeholder="https://example.com/court.jpg"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
              />
            </div>
          </div>

        </div>

        {/* CỘT PHẢI: KHUNG GIỜ HOẠT ĐỘNG & BẢNG GIÁ (7/12) */}
        <div className="md:col-span-7 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* Smart Slots Engine */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-slate-950 pb-3 flex items-center gap-2">
              <span className="p-1 bg-amber-500/10 text-amber-500 rounded-lg">⚡</span>
              Sinh khung giờ tự động (Smart Slots)
            </h4>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-slate-500 uppercase block">Kiểu phân chia block giờ</label>
                  <select
                    value={autoType}
                    onChange={(e) => setAutoType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-2.5 py-2 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="even">Giờ chẵn (2h: 6-8, 8-10...)</option>
                    <option value="odd">Giờ lẻ (2h: 5-7, 7-9...)</option>
                    <option value="1h">Mỗi 1 tiếng (1h: 6-7, 7-8...)</option>
                    <option value="1.5h">Mỗi 1.5 tiếng (1.5h: 6-7.5...)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-500 uppercase block">Khung giờ từ</label>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={autoStartHour}
                      onChange={(e) => setAutoStartHour(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-2 py-2 rounded-xl focus:border-amber-500 focus:outline-none font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-500 uppercase block">Đến trước</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={autoEndHour}
                      onChange={(e) => setAutoEndHour(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-2 py-2 rounded-xl focus:border-amber-500 focus:outline-none font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-slate-500 uppercase block">Hệ số giá áp dụng</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="5.0"
                    value={autoPriceMod}
                    onChange={(e) => setAutoPriceMod(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-2.5 py-2 rounded-xl focus:border-amber-500 focus:outline-none font-mono text-center font-bold text-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyAutoSlots}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow shadow-amber-500/10 h-[36px]"
                >
                  Tự động tạo khung giờ
                </button>
              </div>

              {/* Day Picker */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase block">Áp dụng cho các ngày trong tuần</label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'T2', val: 1 },
                    { label: 'T3', val: 2 },
                    { label: 'T4', val: 3 },
                    { label: 'T5', val: 4 },
                    { label: 'T6', val: 5 },
                    { label: 'T7', val: 6 },
                    { label: 'CN', val: 0 },
                  ].map(day => {
                    const isSel = autoSelectedDays.includes(day.val);
                    return (
                      <button
                        key={day.val}
                        type="button"
                        onClick={() => handleToggleDay(day.val)}
                        className={`w-7.5 h-7.5 rounded-lg border text-[10px] font-black transition flex items-center justify-center cursor-pointer
                          ${isSel 
                            ? 'bg-amber-500 border-amber-500 text-white' 
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                          }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* List of Time Slots */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">📅 Danh sách khung giờ chi tiết ({courtSlots.length})</span>
            
            {courtSlots.length === 0 ? (
              <div className="p-8 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center text-slate-600 text-center gap-1.5">
                <HelpCircle className="w-6 h-6 text-slate-700" />
                <span className="text-[10px] font-bold">Chưa có khung giờ nào được thiết lập.</span>
                <span className="text-[9px] text-slate-700 leading-tight">Hãy sử dụng công cụ "Sinh khung giờ tự động" ở trên để sinh cấu hình hoạt động nhanh.</span>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-1.5 scrollbar-thin">
                {courtSlots.map((ts, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center px-3 py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl transition text-[10px] text-slate-300 font-mono"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{getDayName(ts.dayOfWeek)}</span>
                      <span>⏰ {ts.startTime.substring(0, 5)} - {ts.endTime.substring(0, 5)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-500">x{ts.priceModifier.toFixed(2)}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSingleSlot(idx)}
                        className="text-slate-600 hover:text-red-400 p-0.5 hover:bg-slate-950 rounded transition border-0 bg-transparent cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
