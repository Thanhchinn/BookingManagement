import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Search, Edit3, Trash2, MapPin, Phone, Settings, ShoppingBag } from 'lucide-react';
import { LocationForm } from './LocationForm';
import { CourtManagementPage } from './CourtManagementPage';
import { ProductManagementPage } from './ProductManagementPage';
import { toast } from 'sonner';

interface CourtItem {
  id: string;
  name: string;
  category: string;
  subType?: string;
  basePricePerHour: number;
  isActive: boolean;
  location?: {
    id: string;
  };
}

interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  contactPhone: string;
  imageUrl?: string;
  isActive: boolean;
  locationAmenities?: Array<{
    amenity: {
      id: number;
      name: string;
      icon: string;
    };
  }>;
}

export const FieldManagement: React.FC = () => {
  const token = localStorage.getItem('user_token');

  // Trạng thái view:
  // - 'list': danh sách cơ sở
  // - 'add-location': thêm thông tin cơ sở
  // - 'edit-location': sửa thông tin cơ sở
  // - 'manage-courts': trang quản lý sân lẻ của cơ sở
  // - 'manage-products': trang quản lý sản phẩm bán kèm của cơ sở
  const [view, setView] = useState<'list' | 'add-location' | 'edit-location' | 'manage-courts' | 'manage-products'>('list');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');

  // Dữ liệu từ API
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Bộ lọc tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // Tải dữ liệu từ API
  const fetchLocationsAndCourts = async () => {
    setIsLoading(true);
    try {
      // Tải danh sách cơ sở
      const locRes = await fetch('http://localhost:3000/locations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Tải danh sách sân
      const servicesRes = await fetch('http://localhost:3000/services/partner', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!locRes.ok || !servicesRes.ok) {
        throw new Error('Không thể đồng bộ dữ liệu từ máy chủ API.');
      }

      const locData = await locRes.json();
      const courtData = await servicesRes.json();

      setLocations(locData);
      setCourts(courtData);
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi tải dữ liệu', {
        description: err.message || 'Không thể lấy thông tin cơ sở & sân thể thao.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchLocationsAndCourts();
    }
  }, [view]);

  // Bộ lọc
  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.contactPhone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Thao tác điều hướng
  const handleOpenAddLocationPage = () => {
    setSelectedLocationId(null);
    setView('add-location');
  };

  const handleOpenEditLocationPage = (locId: string) => {
    setSelectedLocationId(locId);
    setView('edit-location');
  };

  const handleOpenManageCourtsPage = (locId: string, locName: string) => {
    setSelectedLocationId(locId);
    setSelectedLocationName(locName);
    setView('manage-courts');
  };

  const handleOpenManageProductsPage = (locId: string, locName: string) => {
    setSelectedLocationId(locId);
    setSelectedLocationName(locName);
    setView('manage-products');
  };

  // Xóa Cơ sở (cascade delete tất cả sân và sản phẩm thuộc cơ sở)
  const handleDeleteLocation = async (locId: string, locName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa cơ sở "${locName}" và toàn bộ các sân, sản phẩm thuộc cơ sở này? Hành động này không thể hoàn tác.`)) {
      try {
        const response = await fetch(`http://localhost:3000/locations/${locId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          toast.success('Đã xóa cơ sở thành công!');
          fetchLocationsAndCourts();
        } else {
          toast.error('Lỗi xóa cơ sở', { description: 'Yêu cầu bị từ chối từ hệ thống.' });
        }
      } catch (err) {
        toast.error('Lỗi kết nối', { description: 'Không thể kết nối đến máy chủ.' });
      }
    }
  };

  // Thay đổi trạng thái cơ sở nhanh
  const handleToggleLocationStatus = async (locId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/locations/${locId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (response.ok) {
        toast.success(!currentStatus ? 'Đã kích hoạt cơ sở kinh doanh!' : 'Đã tạm dừng hoạt động cơ sở.');
        fetchLocationsAndCourts();
      } else {
        toast.error('Cập nhật trạng thái thất bại.');
      }
    } catch (err) {
      toast.error('Lỗi kết nối');
    }
  };

  // 1. Phân cảnh thêm/sửa cơ sở
  if (view === 'add-location' || view === 'edit-location') {
    return (
      <LocationForm
        view={view === 'add-location' ? 'add' : 'edit'}
        editingLocationId={selectedLocationId}
        onBack={() => setView('list')}
        onSaveSuccess={() => setView('list')}
      />
    );
  }

  // 2. Phân cảnh quản lý sân của một cơ sở
  if (view === 'manage-courts' && selectedLocationId) {
    return (
      <CourtManagementPage
        locationId={selectedLocationId}
        locationName={selectedLocationName}
        onBack={() => setView('list')}
      />
    );
  }

  // 3. Phân cảnh quản lý sản phẩm bán kèm của một cơ sở
  if (view === 'manage-products' && selectedLocationId) {
    return (
      <ProductManagementPage
        locationId={selectedLocationId}
        locationName={selectedLocationName}
        onBack={() => setView('list')}
      />
    );
  }

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100 animate-in fade-in duration-200">
      
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Quản Lý Cơ Sở
          </h3>
          <p className="text-xs text-slate-400 m-0">Xem và sửa đổi các cơ sở thể thao của đại lý</p>
        </div>
        <button
          onClick={handleOpenAddLocationPage}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition duration-150 shadow-lg shadow-amber-500/10 cursor-pointer border-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Cơ Sở</span>
        </button>
      </div>

      {/* Grid thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sz-kpi p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Tổng số cơ sở thể thao</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-0">{locations.length} cơ sở</h3>
        </div>
        <div className="sz-kpi p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase text-emerald-400">Cơ sở đang mở cửa</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-0">{locations.filter(l => l.isActive).length} cơ sở</h3>
        </div>
        <div className="sz-kpi p-5">
          <span className="text-[10px] text-slate-500 font-bold uppercase text-amber-500 font-semibold">Tổng số sân đấu</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-0">{courts.length} sân con</h3>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="sz-panel p-4 flex items-center gap-3 focus-within:border-amber-500/50">
        <Search className="w-4.5 h-4.5 text-slate-500 shrink-0" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm nhanh theo tên cơ sở, địa chỉ, số điện thoại..." 
          className="bg-transparent border-0 text-xs text-slate-200 focus:outline-none placeholder-slate-700 w-full"
        />
      </div>

      {/* Danh sách các cơ sở dạng Cards Master-Detail */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 font-bold"></div>
          <p className="text-xs text-slate-400 font-medium">Đang tải hồ sơ cơ sở...</p>
        </div>
      ) : filteredLocations.length > 0 ? (
        <div className="space-y-6">
          {filteredLocations.map(loc => {
            const locCourts = courts.filter(
              c => c.location && c.location.id.toString() === loc.id.toString()
            );

            return (
              <div 
                key={loc.id} 
                className="sz-card overflow-hidden animate-in fade-in duration-200 group flex flex-col justify-between"
              >
                {/* Facility Image Cover */}
                {loc.imageUrl && (
                  <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
                    <img 
                      src={loc.imageUrl} 
                      alt={loc.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />
                  </div>
                )}

                {/* Card Content wrapper */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Header cơ sở */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-950 pb-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-sm font-black text-white tracking-wide uppercase">🏢 {loc.name}</span>
                        <button
                          onClick={() => handleToggleLocationStatus(loc.id, loc.isActive)}
                          className="bg-transparent border-0 cursor-pointer p-0"
                          title="Bấm để đóng/mở nhanh cơ sở"
                        >
                          {loc.isActive ? (
                            <span className="text-[9px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Đang mở cửa</span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-500 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Tạm nghỉ / Đóng cửa</span>
                          )}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 text-slate-400 text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          {loc.address}, {loc.ward}, {loc.district}, {loc.city}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-amber-500" />
                          {loc.contactPhone || 'Chưa cập nhật SĐT'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenEditLocationPage(loc.id)}
                        className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-xs font-bold text-slate-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                        Sửa Cơ Sở
                      </button>
                      <button
                        onClick={() => handleOpenManageProductsPage(loc.id, loc.name)}
                        className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-xs font-bold text-slate-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                        Quản Lý Sản Phẩm
                      </button>
                      <button
                        onClick={() => handleOpenManageCourtsPage(loc.id, loc.name)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer border-0 shadow-lg shadow-amber-500/10"
                      >
                        <Settings className="w-3.5 h-3.5 text-white" />
                        Quản Lý Sân ({locCourts.length})
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(loc.id, loc.name)}
                        className="p-2 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                        title="Xóa toàn bộ cơ sở này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tiện ích cơ sở */}
                  {loc.locationAmenities && loc.locationAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {loc.locationAmenities.map(la => (
                        <span 
                          key={la.amenity.id} 
                          className="px-2.5 py-1 bg-slate-950 rounded-lg text-[10px] text-slate-400 border border-slate-850 flex items-center gap-1"
                        >
                          <span>{la.amenity.icon || '📌'}</span>
                          <span>{la.amenity.name}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Danh sách sân đấu con (Xem nhanh) */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">🏸 Danh sách sân con ({locCourts.length})</span>
                    
                    {locCourts.length === 0 ? (
                      <p className="text-xs text-slate-500 italic m-0">Cơ sở này chưa được cấu hình sân đấu. Nhấp "Quản Lý Sân" để bắt đầu cấu hình.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {locCourts.map(court => (
                          <div 
                            key={court.id} 
                            className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-750 transition"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] font-black text-slate-200 block">{court.name}</span>
                                {court.isActive ? (
                                  <span className="text-[8px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Hoạt động</span>
                                ) : (
                                  <span className="text-[8px] font-bold text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">Tạm dừng</span>
                                )}
                              </div>
                              
                              <span className="inline-block px-1.5 py-0.5 mt-1.5 rounded bg-slate-900 border border-slate-850 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                {court.category} • {court.subType || 'Tiêu chuẩn'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] mt-4 pt-2.5 border-t border-slate-900">
                              <span className="text-slate-500">Giá cơ bản:</span>
                              <span className="font-bold text-amber-400 font-mono">{court.basePricePerHour.toLocaleString('vi-VN')}đ/h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="sz-empty py-16 text-center text-slate-500 text-xs">
          Không tìm thấy cơ sở nào khớp với từ khóa tìm kiếm.
        </div>
      )}

    </div>
  );
};
