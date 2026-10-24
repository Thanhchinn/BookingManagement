import React from 'react';
import { X, Navigation, MapPin, Copy, PhoneCall, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtName: string;
  address: string;
  locationName?: string;
  contactPhone?: string;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  isOpen,
  onClose,
  courtName,
  address,
  locationName,
  contactPhone
}) => {
  if (!isOpen) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Đã sao chép địa chỉ sân!');
  };

  const openGoogleMaps = () => {
    const query = encodeURIComponent(`${courtName} ${address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-left z-10 space-y-4">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition border-0 bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white m-0 tracking-tight">
              Chỉ Đường Tới Sân Thi Đấu
            </h3>
            <span className="text-xs text-slate-400 block mt-0.5 font-medium">
              Định vị vị trí và lộ trình di chuyển nhanh nhất
            </span>
          </div>
        </div>

        {/* Bản đồ mô phỏng công nghệ cao (High-Tech Sports Radar Map View) */}
        <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group">
          {/* Grid lines background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />

          {/* Radar Circles */}
          <div className="absolute w-36 h-36 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
          <div className="absolute w-24 h-24 rounded-full border border-emerald-500/30" />
          <div className="absolute w-12 h-12 rounded-full border border-cyan-500/40" />

          {/* Marker Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-2 border-white animate-bounce">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-white shadow">
              {courtName}
            </div>
          </div>

          {/* Distance chip */}
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[10px] text-cyan-400 font-mono font-bold">
            ~2.4 km • ~7-10 phút đi xe
          </div>
        </div>

        {/* Khối Địa chỉ chi tiết */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {locationName || 'Địa chỉ cụm sân'}
            </span>
            <button
              onClick={copyAddress}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0"
            >
              <Copy className="w-3 h-3" />
              <span>Sao chép</span>
            </button>
          </div>

          <p className="m-0 text-xs sm:text-sm font-bold text-white leading-relaxed">
            {address}
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="space-y-2 pt-1">
          <button
            onClick={openGoogleMaps}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-md shadow-cyan-600/20 active:scale-98"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Mở chỉ đường trên Google Maps</span>
          </button>

          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700/80 no-underline text-center"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Gọi hotline hỗ trợ: {contactPhone}</span>
            </a>
          )}
        </div>

      </div>

    </div>
  );
};
