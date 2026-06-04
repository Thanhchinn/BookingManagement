import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddressSelector } from '../../../components/ui/AddressSelector';

interface LocationFormProps {
  view: 'add' | 'edit';
  editingLocationId: string | null;
  onBack: () => void;
  onSaveSuccess: () => void;
}

// Hàm Geocoding miễn phí dùng OpenStreetMap Nominatim
const geocodeAddress = async (address: string, ward: string, district: string, city: string) => {
  const fullAddress = [address, ward, district, city, 'Việt Nam'].filter(Boolean).join(', ');
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'vi' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.warn('Geocoding thất bại:', err);
  }
  return null;
};

export const LocationForm: React.FC<LocationFormProps> = ({
  view,
  editingLocationId,
  onBack,
  onSaveSuccess
}) => {
  const token = localStorage.getItem('user_token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // State thông tin Cơ sở
  const [locName, setLocName] = useState('');
  const [locPhone, setLocPhone] = useState('');
  const [locImageUrl, setLocImageUrl] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locDistrict, setLocDistrict] = useState('');
  const [locWard, setLocWard] = useState('');
  const [locIsActive, setLocIsActive] = useState(true);
  const [locLat, setLocLat] = useState<number | null>(null);
  const [locLng, setLocLng] = useState<number | null>(null);

  const [systemAmenities, setSystemAmenities] = useState<any[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, [editingLocationId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const amenRes = await fetch('http://localhost:3000/locations/amenities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (amenRes.ok) {
        const amens = await amenRes.json();
        setSystemAmenities(amens);
      }

      if (view === 'edit' && editingLocationId) {
        const locRes = await fetch(`http://localhost:3000/locations/${editingLocationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (locRes.ok) {
          const locData = await locRes.json();
          setLocName(locData.name || '');
          setLocPhone(locData.contactPhone || '');
          setLocImageUrl(locData.imageUrl || '');
          setLocAddress(locData.address || '');
          setLocCity(locData.city || '');
          setLocDistrict(locData.district || '');
          setLocWard(locData.ward || '');
          setLocIsActive(locData.isActive ?? true);
          setLocLat(locData.latitude || null);
          setLocLng(locData.longitude || null);
          if (locData.locationAmenities) {
            setSelectedAmenityIds(locData.locationAmenities.map((la: any) => Number(la.amenityId)));
          }
        }
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu cơ sở:', error);
      toast.error('Lỗi tải dữ liệu', { description: 'Không thể đồng bộ dữ liệu với máy chủ.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAmenity = (id: number) => {
    setSelectedAmenityIds(prev =>
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  // Geocode thủ công khi nhấn nút
  const handleGeocode = async () => {
    if (!locAddress || !locCity) {
      toast.warning('Vui lòng nhập địa chỉ và chọn thành phố trước.');
      return;
    }
    setIsGeocoding(true);
    const result = await geocodeAddress(locAddress, locWard, locDistrict, locCity);
    setIsGeocoding(false);
    if (result) {
      setLocLat(result.lat);
      setLocLng(result.lng);
      toast.success('Đã xác định tọa độ bản đồ thành công!', {
        description: `Lat: ${result.lat.toFixed(6)} | Lng: ${result.lng.toFixed(6)}`
      });
    } else {
      toast.error('Không thể xác định tọa độ từ địa chỉ này. Vui lòng kiểm tra lại địa chỉ.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!locName.trim()) {
      toast.warning('Vui lòng nhập tên cơ sở.');
      return;
    }
    if (!locAddress.trim()) {
      toast.warning('Vui lòng nhập địa chỉ cụ thể.');
      return;
    }

    setIsSaving(true);
    try {
      // Nếu chưa có tọa độ, tự động geocode trước khi lưu
      let lat = locLat;
      let lng = locLng;
      if (!lat || !lng) {
        setIsGeocoding(true);
        const coords = await geocodeAddress(locAddress, locWard, locDistrict, locCity);
        setIsGeocoding(false);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          setLocLat(lat);
          setLocLng(lng);
        }
      }

      const locPayload = {
        name: locName,
        address: locAddress,
        city: locCity,
        district: locDistrict,
        ward: locWard,
        contactPhone: locPhone,
        imageUrl: locImageUrl,
        isActive: locIsActive,
        isPrimary: view === 'add',
        latitude: lat,
        longitude: lng,
        amenityIds: selectedAmenityIds
      };

      const url = view === 'add'
        ? 'http://localhost:3000/locations'
        : `http://localhost:3000/locations/${editingLocationId}`;
      const method = view === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(locPayload)
      });

      if (!res.ok) throw new Error(view === 'add' ? 'Không thể tạo cơ sở mới.' : 'Không thể cập nhật thông tin cơ sở.');

      toast.success(view === 'add' ? 'Đã thêm cơ sở kinh doanh thành công!' : 'Đã cập nhật thông tin cơ sở thành công!', {
        description: 'Thông tin cơ sở đã được ghi nhận trên hệ thống.'
      });
      onSaveSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi lưu cơ sở', { description: err.message || 'Gặp lỗi trong quá trình lưu trữ.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-400 font-medium">Đang tải hồ sơ cơ sở...</p>
      </div>
    );
  }

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
              {view === 'add' ? 'Thêm Cơ Sở Mới' : `Chỉnh Sửa: ${locName}`}
            </h3>
            <p className="text-[11px] text-slate-400 m-0">
              {view === 'add' ? 'Khai báo hồ sơ cơ sở kinh doanh mới' : 'Cập nhật thông tin cơ sở kinh doanh'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFormSubmit}
          disabled={isSaving || isGeocoding}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-amber-500/10"
        >
          {(isSaving || isGeocoding) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isGeocoding ? 'Đang định vị...' : isSaving ? 'Đang lưu...' : 'Lưu Cơ Sở'}</span>
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

        {/* PHẦN 1: THÔNG TIN CƠ SỞ */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-950 pb-3 flex items-center gap-2">
            <span className="p-1 bg-amber-500/10 text-amber-500 rounded-lg">🏢</span>
            Hồ sơ thông tin cơ sở
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tên cơ sở kinh doanh *</label>
              <input
                type="text"
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                placeholder="Ví dụ: Tổ hợp thể thao SportZone Q7"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-3 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Số điện thoại liên hệ *</label>
              <input
                type="tel"
                value={locPhone}
                onChange={(e) => setLocPhone(e.target.value)}
                placeholder="Số hotline hỗ trợ khách hàng tại quầy"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-3 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-mono font-semibold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trạng thái cơ sở</label>
              <select
                value={locIsActive ? 'active' : 'inactive'}
                onChange={(e) => setLocIsActive(e.target.value === 'active')}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-3 rounded-xl focus:border-amber-500 focus:outline-none font-semibold"
              >
                <option value="active">🟢 Đang hoạt động / Mở cửa</option>
                <option value="inactive">🔴 Tạm ngưng hoạt động / Đóng cửa</option>
              </select>
            </div>
          </div>

          {/* Ảnh đại diện */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Đường dẫn ảnh đại diện cơ sở (Image URL)</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={locImageUrl}
                onChange={(e) => setLocImageUrl(e.target.value)}
                placeholder="https://example.com/facility-cover.jpg"
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-3 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
              />
              {locImageUrl && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-800 shrink-0">
                  <img src={locImageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PHẦN 2: ĐỊA CHỈ & BẢN ĐỒ */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-950 pb-3 flex items-center gap-2">
            <span className="p-1 bg-amber-500/10 text-amber-500 rounded-lg">📍</span>
            Địa chỉ & Vị trí bản đồ
          </h4>

          <AddressSelector
            city={locCity}
            district={locDistrict}
            ward={locWard}
            address={locAddress}
            onCityChange={setLocCity}
            onDistrictChange={setLocDistrict}
            onWardChange={setLocWard}
            onAddressChange={setLocAddress}
          />

          {/* Tọa độ & Geocoding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Tọa độ GPS (tự động từ địa chỉ)</span>
              {locLat && locLng ? (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-mono text-emerald-400">
                    {locLat.toFixed(6)}, {locLng.toFixed(6)}
                  </span>
                  <span className="text-[9px] text-emerald-500 bg-emerald-950/50 border border-emerald-900/50 px-1.5 py-0.5 rounded font-bold">✓ Đã định vị</span>
                </div>
              ) : (
                <span className="text-xs text-slate-600 italic">Chưa có tọa độ — nhấn "Định vị từ địa chỉ" để tạo</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleGeocode}
              disabled={isGeocoding}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer shrink-0"
            >
              {isGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5 text-amber-500" />}
              <span>{isGeocoding ? 'Đang định vị...' : 'Định vị từ địa chỉ'}</span>
            </button>
          </div>

          {/* Preview bản đồ nếu có tọa độ */}
          {locLat && locLng && (
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-800">
              <iframe
                src={`https://maps.google.com/maps?q=${locLat},${locLng}&z=16&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                title="Vị trí cơ sở trên bản đồ"
              />
            </div>
          )}
        </div>

        {/* PHẦN 3: TIỆN ÍCH */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-4">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-950 pb-3 flex items-center gap-2">
            <span className="p-1 bg-amber-500/10 text-amber-500 rounded-lg">✨</span>
            Tiện ích đi kèm tại cơ sở
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {systemAmenities.map(amenity => {
              const isSelected = selectedAmenityIds.includes(Number(amenity.id));
              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => handleToggleAmenity(Number(amenity.id))}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left
                    ${isSelected
                      ? 'bg-amber-500/10 border-amber-500/35 text-amber-400'
                      : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                >
                  <span className="text-base">{amenity.icon || '📌'}</span>
                  <span className="truncate">{amenity.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </form>
    </div>
  );
};
