import React from 'react';
import { Bell, Search, UserCheck, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminTopbarProps {
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ 
  onToggleMobileSidebar,
  isSidebarCollapsed,
  onToggleCollapse
}) => {
  return (
    <header className="h-16 shrink-0 border-b border-slate-800 bg-slate-900 px-6 sm:px-8 flex items-center justify-between z-30 select-none shadow-sm">
      
      {/* 1. NÚT ĐÓNG MỞ SIDEBAR CHUYÊN NGHIỆP */}
      <div className="flex items-center space-x-3 text-left">
        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={onToggleMobileSidebar}
          className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-lg cursor-pointer transition-all duration-250 shadow-sm"
        >
          <Menu className="w-4.5 h-4.5 text-teal-400 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider">Menu</span>
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button 
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 hover:bg-slate-800 hover:text-teal-400 rounded-lg text-slate-300 transition-all duration-250 cursor-pointer font-bold text-xs shadow-sm select-none"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-teal-400 shrink-0" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-teal-400 shrink-0" />
          )}
          <span>{isSidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
        </button>
      </div>

      {/* 2. PHẦN PHẢI: TÌM KIẾM NHANH, THÔNG BÁO & USER PROFILE */}
      <div className="flex items-center space-x-6">
        
        {/* Thanh tìm kiếm mô phỏng */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 w-64">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Tìm nhanh thành viên, mã đối soát..." 
            className="bg-transparent border-0 text-[11px] text-white focus:outline-none placeholder-slate-600 w-full"
          />
        </div>

        {/* Nút Chuông thông báo có chấm đỏ */}
        <button className="relative bg-slate-950 hover:bg-slate-800 p-2.5 rounded-lg border border-slate-850 transition duration-150 cursor-pointer text-slate-400 hover:text-white">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full border border-slate-950"></span>
        </button>

        {/* Đường kẻ chia cách dọc */}
        <span className="w-px h-6 bg-slate-800"></span>

        {/* Profile Admin thu nhỏ */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-teal-950/40 border border-teal-900/30 text-teal-400 rounded-lg flex items-center justify-center font-bold text-xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-black text-white m-0">Admin SportZone</p>
            <p className="text-[9px] text-teal-400 font-bold m-0 uppercase tracking-widest">Super Administrator</p>
          </div>
        </div>

      </div>

    </header>
  );
};
