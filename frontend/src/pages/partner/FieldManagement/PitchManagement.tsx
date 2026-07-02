import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, MapPin, Settings, Save, ArrowLeft, HelpCircle, X } from 'lucide-react';
import { getCategoryLabel } from '../../../utils/formatters';
import { toast } from 'sonner';
import { PartnerFilterBar } from '../components/PartnerFilterBar';

interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface PitchItem {
  id: string;
  name: string;
  category: string;
  subType?: string;
  basePricePerHour: number;
  isActive: boolean;
  description?: string;
  imageUrls?: string[];
  location?: {
    id: string;
    name: string;
  };
  _count?: {
    timeSlots: number;
  };
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

export const PitchManagement: React.FC = () => {
  const token = localStorage.getItem('user_token');


  // - 'list': danh sách tất cả các sân
  // - 'add': form thêm sân mới
  // - 'edit': form chỉnh sửa thông tin & khung giờ sân
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingPitchId, setEditingPitchId] = useState<string | null>(null);

  // Danh sách dữ liệu từ API
  const [pitches, setPitches] = useState<PitchItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [systemCategories, setSystemCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Bộ lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // State biểu mẫu (Form)
  const [pitchName, setPitchName] = useState('');
  const [pitchCategory, setPitchCategory] = useState('');
  const [pitchSubType, setPitchSubType] = useState('Sân 5 người');
  const [pitchPrice, setPitchPrice] = useState(100000);
  const [pitchDesc, setPitchDesc] = useState('');
  const [pitchImageUrl, setPitchImageUrl] = useState('');
  const [pitchIsActive, setPitchIsActive] = useState(true);
  const [pitchLocationId, setPitchLocationId] = useState('');
  const [pitchSlots, setPitchSlots] = useState<any[]>([]);

  // States lọc danh sách ca chi tiết của sân
  const [slotDayFilter, setSlotDayFilter] = useState<string>('all');
  const [slotTimeSearch, setSlotTimeSearch] = useState<string>('');

  // States của Smart Slots Generator
  const [autoType, setAutoType] = useState<'even' | 'odd' | '1h' | '1.5h'>('even');
  const [autoStartHour, setAutoStartHour] = useState(5);
  const [autoEndHour, setAutoEndHour] = useState(22);
  const [autoPriceMod, setAutoPriceMod] = useState(1.0);
  const [autoSelectedDays, setAutoSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);

  // Load danh sách sân đấu, cơ sở và danh mục
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Tải danh sách cơ sở
      const locRes = await fetch('http://localhost:3000/locations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // 2. Tải toàn bộ sân đấu của đối tác
      const pitchesRes = await fetch('http://localhost:3000/services/partner', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // 3. Tải danh mục hệ thống
      const catRes = await fetch('http://localhost:3000/categories');

      if (!locRes.ok || !pitchesRes.ok) {
        throw new Error('Không thể đồng bộ dữ liệu từ máy chủ.');
      }

      const locData = await locRes.json();
      const pitchesData = await pitchesRes.json();
      setLocations(locData);
      setPitches(pitchesData);

      if (catRes.ok) {
        const cats = await catRes.json();
        setSystemCategories(cats);
        if (cats.length > 0) {
          setPitchCategory(cats[0].slug);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi tải dữ liệu', {
        description: err.message || 'Không thể đồng bộ thông tin sân đấu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchAllData();
    }
  }, [view]);

  // Bộ lọc danh sách sân
  const filteredPitches = pitches.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.location?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocationFilter === 'all' || p.location?.id.toString() === selectedLocationFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
    return matchesSearch && matchesLocation && matchesCategory;
  });

  // Kích hoạt form thêm sân mới
  const handleOpenAddPitch = () => {
    if (locations.length === 0) {
      toast.warning('Bạn phải tạo ít nhất một cơ sở trước khi thêm sân đấu.');
      return;
    }
    setEditingPitchId(null);
    setPitchName('');
    setPitchCategory(systemCategories[0]?.slug || 'bong-da');
    setPitchSubType('Sân 5 người');
    setPitchPrice(100000);
    setPitchDesc('');
    setPitchImageUrl('');
    setPitchIsActive(true);
    setPitchLocationId(locations[0].id.toString());
    setPitchSlots([]);
    setView('add');
  };

  // Kích hoạt form chỉnh sửa sân
  const handleOpenEditPitch = async (pitchId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/services/${pitchId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể tải thông tin sân.');
      const detail = await res.json();

      setEditingPitchId(pitchId);
      setPitchName(detail.name);
      setPitchCategory(detail.category);
      setPitchSubType(detail.subType || 'Tiêu chuẩn');
      setPitchPrice(Number(detail.basePricePerHour));
      setPitchDesc(detail.description || '');
      setPitchImageUrl(detail.imageUrls?.[0] || '');
      setPitchIsActive(detail.isActive ?? true);
      setPitchLocationId(detail.location?.id?.toString() || '');
      setPitchSlots((detail.timeSlots || []).map((ts: any) => ({
        dayOfWeek: ts.dayOfWeek,
        startTime: formatTimeSlotTime(ts.startTime),
        endTime: formatTimeSlotTime(ts.endTime),
        priceModifier: Number(ts.priceModifier),
        isAvailable: ts.isAvailable ?? true
      })));
      setView('edit');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải chi tiết sân');
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa sân đấu
  const handleDeletePitch = async (pitchId: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sân đấu "${name}"? Hành động này sẽ xóa vĩnh viễn toàn bộ các khung giờ và lịch sử liên quan.`)) {
      try {
        const res = await fetch(`http://localhost:3000/services/${pitchId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success(`Đã xóa sân "${name}" thành công!`);
          fetchAllData();
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

    setPitchSlots(slots);
    toast.success(`Đã tự động tạo ${slots.length} khung giờ hoạt động!`);
  };

  // Lưu Sân & Khung giờ
  const handleSavePitchForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pitchName.trim()) {
      toast.warning('Vui lòng nhập tên sân.');
      return;
    }
    if (!pitchImageUrl.trim()) {
      toast.warning('Vui lòng cung cấp link hình ảnh thực tế của sân.');
      return;
    }
    if (!pitchLocationId) {
      toast.warning('Vui lòng chọn cơ sở trực thuộc.');
      return;
    }

    setIsSaving(true);
    try {
      const pitchPayload = {
        locationId: pitchLocationId,
        name: pitchName,
        category: pitchCategory,
        subType: pitchSubType,
        basePricePerHour: Number(pitchPrice),
        description: pitchDesc,
        imageUrls: [pitchImageUrl],
        isActive: pitchIsActive
      };

      const url = view === 'add'
        ? 'http://localhost:3000/services'
        : `http://localhost:3000/services/${editingPitchId}`;
      const method = view === 'add' ? 'POST' : 'PUT';

      // 1. Lưu thông tin cơ bản sân
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pitchPayload)
      });

      if (!res.ok) throw new Error('Không thể lưu thông tin sân đấu.');
      const savedPitch = await res.json();
      const serviceId = view === 'add' ? savedPitch.id : editingPitchId;

      // 2. Đồng bộ khung giờ chơi
      if (serviceId) {
        const slotRes = await fetch(`http://localhost:3000/services/${serviceId}/timeslots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ timeSlots: pitchSlots })
        });
        if (!slotRes.ok) console.error('Lỗi đồng bộ khung giờ sân.');
      }

      toast.success(view === 'add' ? 'Đã thêm sân đấu mới thành công!' : 'Cập nhật cấu hình sân đấu hoàn tất!');
      setView('list');
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi lưu thông tin sân', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSingleSlot = (index: number) => {
    setPitchSlots(pitchSlots.filter((_, idx) => idx !== index));
  };

  // ---------------- VIEW 1: FORM THÊM / SỬA SÂN ĐẤU (ADD/EDIT VIEW) ----------------
  if (view === 'add' || view === 'edit') {
    return (
      <div className="space-y-6 text-left relative font-sans text-slate-100 animate-in fade-in duration-200">
        
        {/* Header Form */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setView('list')}
              className="p-2 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition cursor-pointer border border-slate-800 bg-slate-950"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-lg font-black text-white m-0 tracking-tight">
                {view === 'add' ? 'Thêm Sân Đấu Mới' : `Cấu hình Sân: ${pitchName}`}
              </h3>
              <p className="text-[11px] text-slate-400 m-0">Khai báo cấu hình chi tiết sân và thiết lập bảng giá, khung giờ hoạt động</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSavePitchForm}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-amber-500/10"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Sân Đấu'}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN SÂN (5/12) */}
          <div className="md:col-span-5 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-5 h-fit">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-slate-950 pb-3 flex items-center gap-2">
              <span className="p-1 bg-amber-500/10 text-amber-500 rounded-lg">🏸</span>
              Thông tin sân đấu
            </h4>

            <div className="space-y-4">
              {/* Tên sân */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Tên sân đấu *</label>
                <input 
                  type="text"
                  value={pitchName}
                  onChange={(e) => setPitchName(e.target.value)}
                  placeholder="Ví dụ: Sân số 1 cỏ nhân tạo"
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
                  required
                />
              </div>

              {/* Cơ sở trực thuộc */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Thuộc cơ sở nào? *</label>
                <select
                  value={pitchLocationId}
                  onChange={(e) => setPitchLocationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-semibold cursor-pointer"
                  required
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id.toString()}>{loc.name} ({loc.address})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Bộ môn */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">Bộ môn thể thao *</label>
                  <select
                    value={pitchCategory}
                    onChange={(e) => setPitchCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-semibold cursor-pointer"
                  >
                    {systemCategories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Phân loại kích thước */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">Kích thước / Phân loại</label>
                  <input 
                    type="text"
                    value={pitchSubType}
                    onChange={(e) => setPitchSubType(e.target.value)}
                    placeholder="Ví dụ: Sân 5 người, Thảm PVC..."
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Giá cơ bản */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">Giá thuê cơ bản (đ/giờ) *</label>
                  <input 
                    type="number"
                    value={pitchPrice}
                    onChange={(e) => setPitchPrice(Number(e.target.value))}
                    placeholder="Ví dụ: 80000"
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono font-bold text-amber-400"
                  />
                </div>

                {/* Trạng thái hoạt động */}
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850 self-end h-[38px]">
                  <span className="text-[10px] font-bold text-white">Sân hoạt động</span>
                  <input 
                    type="checkbox"
                    checked={pitchIsActive}
                    onChange={(e) => setPitchIsActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Mô tả sân */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Mô tả đặc điểm sân</label>
                <textarea 
                  value={pitchDesc}
                  onChange={(e) => setPitchDesc(e.target.value)}
                  placeholder="Mô tả chất lượng cỏ, thảm, ánh sáng..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 min-h-[60px]"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Đường dẫn ảnh sân đấu *</label>
                <input 
                  type="text"
                  value={pitchImageUrl}
                  onChange={(e) => setPitchImageUrl(e.target.value)}
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
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  📅 Danh sách khung giờ chi tiết ({pitchSlots.length})
                </span>
                {pitchSlots.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ các khung giờ hiện tại của sân này?')) {
                        setPitchSlots([]);
                        toast.success('Đã xóa tất cả khung giờ. Hãy bấm "Lưu Sân Đấu" để lưu thay đổi này.');
                      }
                    }}
                    className="text-[10px] font-black text-red-400 hover:text-red-300 transition bg-transparent border-0 cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                  >
                    🗑️ Xóa tất cả
                  </button>
                )}
              </div>

              {/* Bộ lọc tìm kiếm khung giờ cho đối tác */}
              {pitchSlots.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-850">
                  <select
                    value={slotDayFilter}
                    onChange={(e) => setSlotDayFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-[10px] text-slate-350 font-bold px-2 py-1.5 rounded-xl outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả các ngày</option>
                    <option value="1">Thứ 2</option>
                    <option value="2">Thứ 3</option>
                    <option value="3">Thứ 4</option>
                    <option value="4">Thứ 5</option>
                    <option value="5">Thứ 6</option>
                    <option value="6">Thứ 7</option>
                    <option value="0">Chủ Nhật</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tìm giờ (ví dụ: 06:00, 17)..."
                    value={slotTimeSearch}
                    onChange={(e) => setSlotTimeSearch(e.target.value)}
                    className="flex-grow bg-slate-900 border border-slate-800 text-[10px] text-white px-3 py-1.5 rounded-xl placeholder-slate-700 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              )}
              
              {pitchSlots.length === 0 ? (
                <div className="p-8 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center text-slate-600 text-center gap-1.5">
                  <HelpCircle className="w-6 h-6 text-slate-700" />
                  <span className="text-[10px] font-bold">Chưa có khung giờ nào được thiết lập.</span>
                  <span className="text-[9px] text-slate-700 leading-tight">Hãy sử dụng công cụ "Smart Slots" để sinh cấu hình hoạt động tự động nhanh.</span>
                </div>
              ) : (() => {
                const filtered = pitchSlots.filter(ts => {
                  const matchesDay = slotDayFilter === 'all' || ts.dayOfWeek.toString() === slotDayFilter;
                  const timeRangeStr = `${ts.startTime.substring(0, 5)} - ${ts.endTime.substring(0, 5)}`;
                  const matchesTime = timeRangeStr.includes(slotTimeSearch.trim());
                  return matchesDay && matchesTime;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl text-center text-[10px] text-slate-500">
                      Không tìm thấy khung giờ nào khớp với bộ lọc tìm kiếm.
                    </div>
                  );
                }

                return (
                  <div className="max-h-64 overflow-y-auto bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-1.5 scrollbar-thin">
                    {filtered.map((ts, idx) => {
                      // Tìm chỉ số gốc trong mảng pitchSlots để xóa đúng phần tử
                      const originalIndex = pitchSlots.findIndex(
                        origTs => origTs.dayOfWeek === ts.dayOfWeek && 
                                 origTs.startTime === ts.startTime && 
                                 origTs.endTime === ts.endTime
                      );
                      return (
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
                              onClick={() => handleRemoveSingleSlot(originalIndex !== -1 ? originalIndex : idx)}
                              className="text-slate-600 hover:text-red-400 p-0.5 hover:bg-slate-950 rounded transition border-0 bg-transparent cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ---------------- VIEW 2: DANH SÁCH SÂN ĐẤU (LIST VIEW) ----------------
  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100 animate-in fade-in duration-200">
      
      {/* Tiêu đề & Nút thêm sân */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            Quản Lý Sân Đấu
          </h3>
          <p className="text-xs text-slate-400 m-0 font-medium">Thiết lập thông tin, phân loại sân và cấu hình bảng giá ca giờ của bạn</p>
        </div>
        <button
          onClick={handleOpenAddPitch}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition duration-150 shadow-lg shadow-amber-500/10 cursor-pointer border-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sân Mới</span>
        </button>
      </div>

      {/* Grid thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sz-kpi p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Tổng số sân đấu</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-0">{pitches.length} sân con</h3>
        </div>
        <div className="sz-kpi p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase text-emerald-400">Sân đang hoạt động</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-0">{pitches.filter(p => p.isActive).length} sân</h3>
        </div>
        <div className="sz-kpi p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase text-amber-400">Thuộc cơ sở quản lý</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-0">{locations.length} cơ sở</h3>
        </div>
      </div>

      {/* Bộ lọc dùng chung */}
      <PartnerFilterBar
        mode="pitches"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        locationValue={selectedLocationFilter}
        onLocationChange={setSelectedLocationFilter}
        locationsList={locations}
        categoryValue={selectedCategoryFilter}
        onCategoryChange={setSelectedCategoryFilter}
        categoriesList={Array.from(new Set(pitches.map(p => p.category)))}
      />

      {/* Grid Danh sách các sân */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 font-bold"></div>
          <p className="text-xs text-slate-400 font-medium">Đang tải dữ liệu sân...</p>
        </div>
      ) : filteredPitches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPitches.map(pitch => (
            <div 
              key={pitch.id} 
              className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between transition group"
            >
              {/* Ảnh sân */}
              <div className="h-44 bg-slate-950 relative overflow-hidden">
                <img 
                  src={pitch.imageUrls?.[0] || 'https://images.unsplash.com/photo-1545224144-b38cd309e0a1?q=80&w=600'} 
                  alt={pitch.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                />
                <div className="absolute top-3 right-3">
                  {pitch.isActive ? (
                    <span className="text-[8px] font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/20">Hoạt động</span>
                  ) : (
                    <span className="text-[8px] font-black text-amber-500 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/20">Bảo trì / Tạm nghỉ</span>
                  )}
                </div>
              </div>

              {/* Thông tin sân */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-black text-white line-clamp-1">{pitch.name}</span>
                    <span className="text-[8px] font-extrabold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-900 uppercase shrink-0">
                      {getCategoryLabel(pitch.category)}
                    </span>                  </div>

                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {pitch.location?.name || 'Cơ sở chưa xác định'}
                  </span>

                  {pitch.subType && (
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase tracking-wider">{pitch.subType}</span>
                  )}
                  <p className="text-[10px] text-slate-400 line-clamp-2 italic m-0">{pitch.description || 'Không có mô tả cho sân này.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-950 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Giá gốc / giờ</span>
                    <span className="text-xs font-black text-amber-400 font-mono">{(Number(pitch.basePricePerHour) || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 font-mono">⏰ {pitch._count?.timeSlots || 0} slots chơi</span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="px-6 pb-6 pt-0 flex gap-2">
                <button
                  onClick={() => handleOpenEditPitch(pitch.id)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-[10px] font-bold text-slate-300 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-amber-500" />
                  Cấu hình & Giờ chơi
                </button>
                <button
                  onClick={() => handleDeletePitch(pitch.id, pitch.name)}
                  className="p-2 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                  title="Xóa sân đấu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="sz-empty py-16 text-center text-slate-500 text-xs">
          Không tìm thấy sân đấu nào khớp với bộ lọc tìm kiếm.
        </div>
      )}

    </div>
  );
};
