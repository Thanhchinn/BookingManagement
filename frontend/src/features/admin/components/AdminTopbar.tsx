import { Bell, Search, UserCheck, Menu } from 'lucide-react';

interface AdminTopbarProps {
  currentTab: string;
  onToggleMobileSidebar: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ 
  currentTab, 
  onToggleMobileSidebar 
}) => {
  // Bản đồ tên Tab hiển thị dạng Breadcrumb
  const tabNames: Record<string, string> = {
    dashboard: 'Tổng quan hệ thống',
    analytics: 'Báo cáo thống kê sâu',
    sports: 'Quản lý danh mục bộ môn',
    users: 'Quản lý tài khoản khách hàng',
    partners: 'Phê duyệt & Quản lý đối tác chủ sân',
    reconciliation: 'Đối soát tài chính & Rút tiền',
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      
      {/* 1. NÚT HAMBURGER TRÊN DI ĐỘNG (DƯỚI LG) */}
      <div className="flex items-center space-x-3 text-left">
        <button 
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-850 border border-slate-800 rounded-xl cursor-pointer"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <h2 className="text-sm font-extrabold text-white m-0 tracking-tight">
          {tabNames[currentTab] || 'Quản lý Hệ thống'}
        </h2>
        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
          <span>Portal</span>
          <span>/</span>
          <span className="text-slate-400 capitalize">{currentTab}</span>
        </div>
      </div>

      {/* 2. PHẦN PHẢI: TÌM KIẾM NHANH, THÔNG BÁO & USER PROFILE */}
      <div className="flex items-center space-x-6">
        
        {/* Thanh tìm kiếm mô phỏng */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 w-64">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Tìm nhanh thành viên, mã đối soát..." 
            className="bg-transparent border-0 text-[11px] text-slate-200 focus:outline-none placeholder-slate-600 w-full"
          />
        </div>

        {/* Nút Chuông thông báo có chấm đỏ */}
        <button className="relative bg-slate-950 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-800 transition duration-150 cursor-pointer text-slate-400 hover:text-slate-200">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950 animate-pulse"></span>
        </button>

        {/* Đường kẻ chia cách dọc */}
        <span className="w-px h-6 bg-slate-800"></span>

        {/* Profile Admin thu nhỏ */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-black text-white m-0">Admin SportZone</p>
            <p className="text-[9px] text-emerald-400 font-bold m-0 uppercase tracking-widest">Super Administrator</p>
          </div>
        </div>

      </div>

    </header>
  );
};
