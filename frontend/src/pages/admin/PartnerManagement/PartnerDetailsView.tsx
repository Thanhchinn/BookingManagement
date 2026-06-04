import React, { useState } from 'react';
import { 
  Check, 
  X, 
  ChevronLeft, 
  Trash2, 
  Info, 
  Landmark, 
  MapPin, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Coffee, 
  Car, 
  Wifi, 
  ShowerHead, 
  Zap, 
  Compass,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { PartnerFormModal } from './PartnerFormModal';

export interface PartnerItem {
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
  commissionType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  commissionRate?: number;
  commissionFixedAmount?: number;
}

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  amenities: string[];
}

interface FacilityItem {
  id: string;
  name: string;
  address: string;
  contactPhone: string;
  isPrimary: boolean;
  services: ServiceItem[];
}

interface PartnerDetailsViewProps {
  partner: PartnerItem;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onToggleActive: (id: string, currentStatus: 'active' | 'suspended') => void;
  onDelete: (id: string, name: string) => void;
  onUpdateLocalPartner: React.Dispatch<React.SetStateAction<PartnerItem | null>>;
}

// Hàm giả lập tạo dữ liệu Cơ sở & Dịch vụ dựa trên thông tin thực tế của Đối tác
const getFacilitiesForPartner = (partner: PartnerItem): FacilityItem[] => {
  const categories = partner.sportCategories.length > 0 ? partner.sportCategories : ['Bóng đá'];
  
  return [
    {
      id: `${partner.id}-LOC-001`,
      name: `${partner.businessName} - Trụ sở chính`,
      address: partner.address,
      contactPhone: partner.phone,
      isPrimary: true,
      services: categories.flatMap((cat, idx) => {
        if (cat === 'Bóng đá') {
          return [
            { id: 'SRV-101', name: 'Sân bóng cỏ nhân tạo 5 người (Sân A)', category: 'Bóng đá', basePrice: 180000, isActive: true, amenities: ['Gửi xe', 'Tắm rửa', 'Căng tin'] },
            { id: 'SRV-102', name: 'Sân bóng cỏ nhân tạo 7 người (Sân B)', category: 'Bóng đá', basePrice: 320000, isActive: true, amenities: ['Gửi xe', 'Tắm rửa', 'Căng tin', 'Đèn chiếu sáng'] },
          ];
        }
        if (cat === 'Cầu lông') {
          return [
            { id: 'SRV-201', name: 'Sân Cầu lông Thảm Pro 1 (Trong nhà)', category: 'Cầu lông', basePrice: 90000, isActive: true, amenities: ['Wifi', 'Gửi xe', 'Căng tin'] },
            { id: 'SRV-202', name: 'Sân Cầu lông Thảm Pro 2 (Trong nhà)', category: 'Cầu lông', basePrice: 90000, isActive: true, amenities: ['Wifi', 'Gửi xe', 'Căng tin'] },
          ];
        }
        if (cat === 'Tennis') {
          return [
            { id: 'SRV-301', name: 'Sân Tennis Đất nện Quốc tế 1', category: 'Tennis', basePrice: 250000, isActive: true, amenities: ['Gửi xe', 'Tắm rửa', 'Wifi'] }
          ];
        }
        if (cat === 'Pickleball') {
          return [
            { id: 'SRV-401', name: 'Sân Pickleball chuẩn thi đấu A1', category: 'Pickleball', basePrice: 130000, isActive: true, amenities: ['Wifi', 'Gửi xe', 'Tắm rửa'] }
          ];
        }
        return [
          { id: `SRV-${idx}`, name: `Sân tập ${cat} cao cấp`, category: cat, basePrice: 120000, isActive: true, amenities: ['Wifi', 'Gửi xe'] }
        ];
      })
    },
    {
      id: `${partner.id}-LOC-002`,
      name: `${partner.businessName} - Chi nhánh số 2 (Quận Gò Vấp)`,
      address: '479 Phan Văn Trị, Phường 7, Quận Gò Vấp, TP.HCM',
      contactPhone: '0908777999',
      isPrimary: false,
      services: categories.flatMap((cat, idx) => {
        if (cat === 'Bóng đá') {
          return [
            { id: 'SRV-103', name: 'Sân cỏ nhân tạo 5 người (Chi nhánh 2)', category: 'Bóng đá', basePrice: 160000, isActive: true, amenities: ['Gửi xe', 'Căng tin'] }
          ];
        }
        if (cat === 'Cầu lông') {
          return [
            { id: 'SRV-203', name: 'Sân cầu lông Gò Vấp Standard', category: 'Cầu lông', basePrice: 80000, isActive: true, amenities: ['Gửi xe', 'Wifi'] }
          ];
        }
        return [
          { id: `SRV-ALT-${idx}`, name: `Sân tập ${cat} phụ trợ`, category: cat, basePrice: 100000, isActive: true, amenities: ['Wifi', 'Gửi xe'] }
        ];
      })
    }
  ];
};

// Hàm render icon tiện ích nhanh tương ứng
const renderAmenityIcon = (amenityName: string) => {
  const name = amenityName.toLowerCase();
  if (name.includes('wifi')) return <Wifi className="w-3.5 h-3.5 text-sky-400" />;
  if (name.includes('xe') || name.includes('parking')) return <Car className="w-3.5 h-3.5 text-amber-400" />;
  if (name.includes('căng tin') || name.includes('nước') || name.includes('ăn')) return <Coffee className="w-3.5 h-3.5 text-emerald-400" />;
  if (name.includes('tắm') || name.includes('vệ sinh')) return <ShowerHead className="w-3.5 h-3.5 text-purple-400" />;
  if (name.includes('đèn') || name.includes('sáng')) return <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />;
  return <Compass className="w-3.5 h-3.5 text-slate-400" />;
};

export const PartnerDetailsView: React.FC<PartnerDetailsViewProps> = ({
  partner,
  onBack,
  onApprove,
  onReject,
  onToggleActive,
  onDelete,
  onUpdateLocalPartner
}) => {
  const facilities = getFacilitiesForPartner(partner);
  
  // Trạng thái mở rộng danh sách Sân của Cơ sở nào (Mặc định mở cơ sở chính)
  const [expandedLocId, setExpandedLocId] = useState<string | null>(facilities[0]?.id || null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleExpand = (locId: string) => {
    setExpandedLocId(prev => (prev === locId ? null : locId));
  };

  const handleSavePartner = async (updatedFields: {
    businessName: string;
    taxCode: string;
    commissionType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    commissionRate: number;
    commissionFixedAmount: number;
  }) => {
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) {
        throw new Error('Cập nhật thông tin đối tác thất bại.');
      }
      const updated = await res.json();
      
      onUpdateLocalPartner(prev => prev ? {
        ...prev,
        businessName: updated.businessName,
        taxCode: updated.taxCode || '(Chưa cập nhật)',
        commissionType: updated.commissionType,
        commissionRate: updated.commissionRate !== undefined && updated.commissionRate !== null ? parseFloat(updated.commissionRate.toString()) : 10.0,
        commissionFixedAmount: updated.commissionFixedAmount !== undefined && updated.commissionFixedAmount !== null ? parseFloat(updated.commissionFixedAmount.toString()) : 0,
      } : null);
      
      toast.success('Cập nhật thông tin đối tác thành công!');
      setIsEditModalOpen(false);
    } catch (err: any) {
      throw new Error(err.message || 'Lỗi kết nối.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Nút quay lại và Tiêu đề */}
      <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
          </button>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
              <span className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-lg shadow-inner select-none leading-none flex items-center justify-center">
                🤝
              </span>
              <span>{partner.businessName}</span>
              {partner.status === 'active' && (
                <span className="admin-table-badge admin-table-badge-emerald text-[9px] font-extrabold uppercase py-0.5 px-2">Đang hoạt động</span>
              )}
              {partner.status === 'pending' && (
                <span className="admin-table-badge admin-table-badge-amber text-[9px] font-extrabold uppercase py-0.5 px-2">Chờ duyệt</span>
              )}
              {partner.status === 'suspended' && (
                <span className="admin-table-badge admin-table-badge-red text-[9px] font-extrabold uppercase py-0.5 px-2">Bị tạm khóa</span>
              )}
            </h1>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed m-0 mt-0.5">
              Mã đối tác: <span className="font-mono text-slate-200 font-bold">{partner.id}</span> • Đăng ký vào ngày: <span className="text-slate-200">{partner.registrationDate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span>Portal</span>
          <span>/</span>
          <span>partners</span>
          <span>/</span>
          <span className="text-emerald-400">Chi tiết</span>
        </div>
      </div>

      {/* Bố cục Chi tiết 2 Cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột Trái rộng: Thông tin người đăng ký và danh sách cơ sở */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Thẻ 1: Thông tin người đăng ký */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition space-y-4 shadow-lg">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 m-0 border-b border-slate-800 pb-3">
              <Info className="w-4 h-4" />
              Thông tin người đăng ký & pháp nhân
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Tên chủ sở hữu</span>
                <span className="text-white font-bold text-sm block mt-0.5">{partner.ownerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Mã số thuế doanh nghiệp</span>
                <span className="text-white font-bold font-mono text-sm block mt-0.5">{partner.taxCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Số điện thoại liên hệ</span>
                <span className="text-white font-bold font-mono text-sm block mt-0.5">{partner.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Địa chỉ hòm thư (Email)</span>
                <span className="text-white font-bold font-mono text-sm block mt-0.5 break-all">{partner.email}</span>
              </div>
              <div className="sm:col-span-2 pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Địa chỉ đăng ký kinh doanh</span>
                <span className="text-slate-300 font-medium leading-relaxed block mt-1">{partner.address}</span>
              </div>
            </div>
          </div>

          {/* Thẻ 2: Danh sách cơ sở & các sân dịch vụ chi tiết (Bấm để xem sân bãi) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition space-y-4 shadow-lg">
            <div>
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 m-0">
                <MapPin className="w-4 h-4" />
                Danh sách chi nhánh & Cơ sở vận hành ({partner.totalFields} Sân liên kết)
              </h4>
              <p className="text-[10.5px] text-slate-400 m-0 mt-1 font-medium">Nhấn vào cơ sở để xem danh sách sân đấu và biểu phí dịch vụ chi tiết</p>
            </div>
            
            <div className="space-y-4">
              {facilities.map((loc) => {
                const isExpanded = expandedLocId === loc.id;
                return (
                  <div 
                    key={loc.id} 
                    className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition focus-within:border-slate-700"
                  >
                    {/* Header Cơ Sở (Bấm để đóng mở) */}
                    <div 
                       onClick={() => toggleExpand(loc.id)}
                       className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/60 select-none transition"
                    >
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5">
                          {loc.isPrimary ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                              Cơ sở chính
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-900 text-slate-400 border border-slate-800">
                              Chi nhánh số 2
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">ID: {loc.id}</span>
                        </div>
                        <h5 className="text-sm font-extrabold text-white m-0 mt-1">{loc.name}</h5>
                        <p className="text-[11px] text-slate-400 m-0">{loc.address}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-extrabold text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl shadow-xs">
                          {loc.services.length} sân dịch vụ
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4.5 h-4.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4.5 h-4.5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Danh sách Sân Thể Thao / Dịch vụ (Chỉ hiển thị khi expanded) */}
                    {isExpanded && (
                      <div className="border-t border-slate-800 bg-slate-950 p-4 pt-3 space-y-3">
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-2 px-1">
                          <span>Sân / Tiêu đề dịch vụ</span>
                          <span>Đơn giá & Tiện ích</span>
                        </div>

                        <div className="space-y-2.5">
                          {loc.services.map((srv) => (
                            <div 
                              key={srv.id}
                              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                            >
                              <div className="space-y-1">
                                <h6 className="font-extrabold text-white m-0 flex items-center gap-1.5">
                                  {srv.name}
                                </h6>
                                <div className="flex items-center gap-2 text-[10px]">
                                  <span className="bg-slate-950 text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-800">
                                    🏀 {srv.category}
                                  </span>
                                  <span className="text-slate-500 font-mono">ID: {srv.id}</span>
                                </div>
                              </div>

                              <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                                <span className="text-emerald-400 font-extrabold font-mono text-[13px]">
                                  {srv.basePrice.toLocaleString('vi-VN')}đ<span className="text-[10px] text-slate-400 font-normal">/giờ</span>
                                </span>
                                
                                <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                                  {srv.amenities.map((amenity, aIdx) => (
                                    <span key={aIdx} title={amenity} className="hover:scale-110 transition cursor-help">
                                      {renderAmenityIcon(amenity)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thẻ 3: Cấu hình bộ môn và tỉ lệ chiết khấu */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition space-y-4 shadow-lg">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 m-0 border-b border-slate-800 pb-3">
              <Activity className="w-4 h-4" />
              Cấu hình bộ môn & Tỉ lệ chiết khấu giao dịch
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Bộ môn kinh doanh hệ thống</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {partner.sportCategories.map(cat => (
                    <span 
                      key={cat}
                      className="text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-xl"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Phí hoa hồng đối soát</span>
                <span className="text-emerald-400 font-extrabold text-sm block mt-1.5">
                  {partner.commissionType === 'PERCENTAGE' ? (
                    `${partner.commissionRate?.toFixed(2)}% / mỗi đơn đặt`
                  ) : (
                    `${partner.commissionFixedAmount?.toLocaleString('vi-VN')}đ / mỗi ca đấu`
                  )}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Cột Phải hẹp: Tài khoản thụ hưởng và Thao tác phê duyệt */}
        <div className="space-y-6">
          
          {/* Thẻ 4: Tài khoản ngân hàng đối soát */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition space-y-4 shadow-lg">
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 m-0 border-b border-slate-800 pb-3">
              <Landmark className="w-4 h-4" />
              Tài khoản ngân hàng đối soát
            </h4>
            <div className="space-y-3.5 text-xs text-left">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2.5 font-medium">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Ngân hàng liên kết</span>
                  <span className="text-white font-bold block mt-0.5">{partner.bankAccount.bankName}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Số tài khoản (STK)</span>
                  <span className="text-emerald-400 font-mono font-black text-sm block mt-0.5 tracking-wider">{partner.bankAccount.number}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Chủ tài khoản (CTK)</span>
                  <span className="text-white font-mono font-bold uppercase block mt-0.5">{partner.bankAccount.holder}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thẻ 5: Thao tác quản trị viên */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition space-y-4 shadow-lg">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 m-0 border-b border-slate-800 pb-3">
              ⚡ Thao tác quản trị
            </h4>
            
            <div className="space-y-3 flex flex-col">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Settings className="w-4 h-4 text-emerald-500" /> Chỉnh sửa đối tác
              </button>

              {partner.status === 'pending' ? (
                <>
                  <button
                    onClick={() => onApprove(partner.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Duyệt hồ sơ đối tác
                  </button>
                  
                  <button
                    onClick={() => onReject(partner.id)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Từ chối hồ sơ
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onToggleActive(partner.id, partner.status as 'active' | 'suspended');
                      onUpdateLocalPartner(prev => prev ? {
                        ...prev,
                        status: prev.status === 'active' ? 'suspended' : 'active'
                      } : null);
                    }}
                    className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
                      partner.status === 'active'
                        ? 'bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                    }`}
                  >
                    {partner.status === 'active' ? (
                      <>Khóa tài khoản đối tác</>
                    ) : (
                      <>Kích hoạt lại tài khoản</>
                    )}
                  </button>

                  {partner.status === 'suspended' && (
                    <button
                      onClick={() => onDelete(partner.id, partner.businessName)}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa đối tác vĩnh viễn
                    </button>
                  )}
                </>
              )}
              
              <button
                onClick={onBack}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>

        </div>

      </div>

      <PartnerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        partner={partner}
        isSaving={isSaving}
        onSave={handleSavePartner}
      />
    </div>
  );
};
