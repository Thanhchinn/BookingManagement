import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Dumbbell,
  Users, 
  Handshake, 
  Landmark, 
  X,
  Scale,
  Coins,
  LogOut,
  MessageSquare,
  CalendarRange
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  onLogout,
  isCollapsed,
  isMobileOpen,
  onCloseMobile
}) => {
  // Danh sách menu chính
  const menuItems = [
    { id: 'dashboard', name: 'Tổng quan', icon: LayoutDashboard },
    { id: 'bookings', name: 'Giám sát đặt sân', icon: CalendarRange },
    { id: 'sports', name: 'Quản lý bộ môn', icon: Dumbbell },
    { id: 'partners', name: 'Quản lý đối tác', icon: Handshake },
    { id: 'users', name: 'Quản lý người dùng', icon: Users },
    { id: 'disputes', name: 'Giải quyết khiếu nại', icon: Scale },
    { id: 'payouts', name: 'Duyệt rút tiền', icon: Coins },
    { id: 'reconciliation', name: 'Đối soát tài chính', icon: Landmark },
    { id: 'analytics', name: 'Thống kê sâu', icon: BarChart3 },
    { id: 'chats', name: 'Tin nhắn đối tác', icon: MessageSquare },
  ];

  return (
    <>
      {/* 1. LỚP PHỦ NỀN MỜ CHO THIẾT BỊ DI ĐỘNG KHI SIDEBAR MỞ */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* 2. THANH MENU SIDEBAR CHÍNH */}
      <aside 
        className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen fixed lg:sticky top-0 z-50 shrink-0 select-none transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        
        {/* PHẦN ĐẦU: LOGO CHUẨN ĐỒNG BỘ CHIỀU CAO H-16 TRÊN DI ĐỘNG & H-20 TRÊN MÁY TÍNH */}
        <div className="h-16 lg:h-20 border-b border-slate-800 flex items-center px-6 sm:px-5 justify-between shrink-0">
          {/* BRANDING LOGO */}
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-teal-600 text-white p-2 rounded-lg text-lg shadow-sm shrink-0 select-none">
              🏆
            </div>
            {!isCollapsed && (
              <div className="text-left shrink-0 transition-opacity duration-200">
                <h4 className="text-sm font-black text-white tracking-tight m-0">SportZone</h4>
                <p className="text-[9px] text-teal-400 font-bold tracking-widest uppercase m-0">Admin Portal</p>
              </div>
            )}
          </div>

          {/* NÚT ĐÓNG SIDEBAR TRÊN DI ĐỘNG (X) */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PHẦN THÂN: DANH SÁCH MENU ĐIỀU HƯỚNG CÓ THỂ CUỘN */}
        <div className="flex-grow overflow-y-auto p-6 sm:p-5 text-left">
          <nav className="space-y-1.5">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              return (
                <button
                   key={item.id}
                   onClick={() => {
                     onSelectTab(item.id);
                     onCloseMobile(); // Tự động đóng trên mobile khi chọn xong
                   }}
                   title={isCollapsed ? item.name : undefined}
                   className={`w-full flex items-center rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border-0 ${
                     isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                   } ${
                     isActive 
                       ? 'bg-slate-950 text-white border border-slate-800 shadow-inner' 
                       : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
                   }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                  {!isCollapsed && <span className="transition-opacity duration-200">{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* PHẦN CUỐI: NÚT ĐĂNG XUẤT */}
        <div className="p-6 sm:p-5">
          <button
            onClick={onLogout}
            title={isCollapsed ? 'Đăng xuất' : undefined}
            className={`w-full flex items-center bg-rose-950/20 border border-rose-900/30 hover:bg-rose-950/40 text-xs text-rose-400 font-bold rounded-lg transition duration-150 cursor-pointer ${
              isCollapsed ? 'justify-center p-3' : 'justify-center space-x-2 py-3 px-4'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="transition-opacity duration-200">Đăng xuất</span>}
          </button>
        </div>

      </aside>
    </>
  );
};
