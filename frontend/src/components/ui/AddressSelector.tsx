import React, { useState, useEffect } from 'react';

interface AddressSelectorProps {
  city: string;
  onCityChange: (val: string) => void;
  district: string;
  onDistrictChange: (val: string) => void;
  ward: string;
  onWardChange: (val: string) => void;
  address: string;
  onAddressChange: (val: string) => void;
  disabled?: boolean;

  // Thuộc tính CSS Class tùy chọn để tùy biến giao diện giữa Client và Admin
  containerClassName?: string;
  selectClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  city,
  onCityChange,
  district,
  onDistrictChange,
  ward,
  onWardChange,
  address,
  onAddressChange,
  disabled = false,
  containerClassName = "grid grid-cols-1 sm:grid-cols-3 gap-4 sm:col-span-3",
  selectClassName = "w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none transition disabled:opacity-40 disabled:cursor-not-allowed",
  inputClassName = "w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none placeholder-slate-750 transition disabled:opacity-40 disabled:cursor-not-allowed",
  labelClassName = "text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5"
}) => {
  // Trạng thái lưu trữ danh sách địa lý (Provinces / Districts / Wards)
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Mã số lựa chọn (Codes) để đồng bộ Dropdown tương ứng
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);

  // Trạng thái quay vòng loading của từng dropdown
  const [isProvincesLoading, setIsProvincesLoading] = useState(false);
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);
  const [isWardsLoading, setIsWardsLoading] = useState(false);

  // 1. Tải danh sách 63 Tỉnh/Thành phố khi component mount
  useEffect(() => {
    const loadInitialProvinces = async () => {
      setIsProvincesLoading(true);
      try {
        const res = await fetch('https://provinces.open-api.vn/api/p/');
        if (!res.ok) throw new Error('Không thể tải dữ liệu Tỉnh/Thành phố.');
        const provinceList = await res.json();
        setProvinces(provinceList);

        // Hỗ trợ tự động khớp mã Code khi có sẵn thông tin Tỉnh/Thành phố (Edit Mode)
        if (city) {
          const matchProv = provinceList.find((p: any) => 
            p.name.toLowerCase() === city.toLowerCase() ||
            p.name.toLowerCase().includes(city.toLowerCase()) ||
            city.toLowerCase().includes(p.name.toLowerCase())
          );

          if (matchProv) {
            setSelectedProvinceCode(matchProv.code);
            await loadDistricts(matchProv.code);
          }
        } else {
          setSelectedProvinceCode(null);
          setSelectedDistrictCode(null);
          setDistricts([]);
          setWards([]);
        }
      } catch (err) {
        console.error('Lỗi tải danh mục Tỉnh/Thành:', err);
      } finally {
        setIsProvincesLoading(false);
      }
    };

    loadInitialProvinces();
  }, [city]);

  // 2. Hàm tải Quận/Huyện theo mã Tỉnh/Thành
  const loadDistricts = async (provCode: number) => {
    setIsDistrictsLoading(true);
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provCode}?depth=2`);
      if (!res.ok) throw new Error('Không thể tải danh sách Quận/Huyện.');
      const data = await res.json();
      const districtList = data.districts || [];
      setDistricts(districtList);

      if (district) {
        const matchDist = districtList.find((d: any) => 
          d.name.toLowerCase() === district.toLowerCase() ||
          d.name.toLowerCase().includes(district.toLowerCase()) ||
          district.toLowerCase().includes(d.name.toLowerCase())
        );

        if (matchDist) {
          setSelectedDistrictCode(matchDist.code);
          await loadWards(matchDist.code);
        }
      } else {
        setSelectedDistrictCode(null);
        setWards([]);
      }
    } catch (err) {
      console.error('Lỗi tải Quận/Huyện:', err);
    } finally {
      setIsDistrictsLoading(false);
    }
  };

  // 3. Hàm tải Phường/Xã theo mã Quận/Huyện
  const loadWards = async (distCode: number) => {
    setIsWardsLoading(true);
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${distCode}?depth=2`);
      if (!res.ok) throw new Error('Không thể tải danh sách Phường/Xã.');
      const data = await res.json();
      setWards(data.wards || []);
    } catch (err) {
      console.error('Lỗi tải Phường/Xã:', err);
    } finally {
      setIsWardsLoading(false);
    }
  };

  // 4. Khi thay đổi Tỉnh thành
  const handleProvinceChange = async (provCode: number) => {
    if (!provCode) {
      setSelectedProvinceCode(null);
      setSelectedDistrictCode(null);
      onCityChange('');
      onDistrictChange('');
      onWardChange('');
      setDistricts([]);
      setWards([]);
      return;
    }

    const matchProv = provinces.find(p => p.code === provCode);
    const cityName = matchProv ? matchProv.name : '';
    onCityChange(cityName);
    setSelectedProvinceCode(provCode);

    // Reset sạch các cấp con dưới
    setSelectedDistrictCode(null);
    onDistrictChange('');
    onWardChange('');
    setDistricts([]);
    setWards([]);

    await loadDistricts(provCode);
  };

  // 5. Khi thay đổi Quận huyện
  const handleDistrictChange = async (distCode: number) => {
    if (!distCode) {
      setSelectedDistrictCode(null);
      onDistrictChange('');
      onWardChange('');
      setWards([]);
      return;
    }

    const matchDist = districts.find(d => d.code === distCode);
    const distName = matchDist ? matchDist.name : '';
    onDistrictChange(distName);
    setSelectedDistrictCode(distCode);

    // Reset cấp con dưới
    onWardChange('');
    setWards([]);

    await loadWards(distCode);
  };

  return (
    <div className={containerClassName}>
      
      {/* A. TỈNH / THÀNH PHỐ */}
      <div>
        <label className={labelClassName}>
          Tỉnh / Thành phố {isProvincesLoading && '(Đang tải...)'}
        </label>
        <select
          disabled={disabled || isProvincesLoading}
          value={selectedProvinceCode || ''}
          onChange={(e) => handleProvinceChange(Number(e.target.value))}
          className={selectClassName}
        >
          <option value="">-- Chọn Tỉnh / Thành phố --</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* B. QUẬN / HUYỆN */}
      <div>
        <label className={labelClassName}>
          Quận / Huyện {isDistrictsLoading && '(Đang tải...)'}
        </label>
        <select
          disabled={disabled || !selectedProvinceCode || isDistrictsLoading}
          value={selectedDistrictCode || ''}
          onChange={(e) => handleDistrictChange(Number(e.target.value))}
          className={selectClassName}
        >
          <option value="">-- Chọn Quận / Huyện --</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* C. PHƯỜNG / XÃ */}
      <div>
        <label className={labelClassName}>
          Phường / Xã {isWardsLoading && '(Đang tải...)'}
        </label>
        <select
          disabled={disabled || !selectedDistrictCode || isWardsLoading}
          value={ward || ''}
          onChange={(e) => onWardChange(e.target.value)}
          className={selectClassName}
        >
          <option value="">-- Chọn Phường / Xã --</option>
          {wards.map((w) => (
            <option key={w.code} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* D. ĐỊA CHỈ CHI TIẾT */}
      <div className="sm:col-span-3">
        <label className={labelClassName}>Số nhà, Tên đường cụ thể</label>
        <input 
          type="text"
          disabled={disabled}
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Ví dụ: Số 15, Ngõ 20, Đường Nguyễn Khánh Toàn..."
          className={inputClassName}
        />
      </div>

    </div>
  );
};
