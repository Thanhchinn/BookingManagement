import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Dumbbell,
  Users, 
  Handshake, 
  Landmark, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X 
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onBackToClient: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  onBackToClient,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  // Danh sách menu chính
  const menuItems = [
    { id: 'dashboard', name: 'Tổng quan', icon: LayoutDashboard },
    { id: 'analytics', name: 'Thống kê sâu', icon: BarChart3 },
    { id: 'sports', name: 'Quản lý bộ môn', icon: Dumbbell },
    { id: 'users', name: 'Quản lý người dùng', icon: Users },
    { id: 'partners', name: 'Quản lý đối tác', icon: Handshake },
    { id: 'reconciliation', name: 'Đối soát tài chính', icon: Landmark },
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
        
        {/* PHẦN ĐẦU: LOGO & NÚT THU GỌN */}
        <div className="p-4 sm:p-5 space-y-6">
          <div className="flex items-center justify-between">
            
            {/* BRANDING LOGO */}
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-emerald-500 text-white p-2 rounded-xl text-lg shadow-md shadow-emerald-500/10 shrink-0 select-none">
                🏆
              </div>
              {!isCollapsed && (
                <div className="text-left shrink-0 transition-opacity duration-200">
                  <h4 className="text-sm font-black text-white tracking-tight m-0">SportZone</h4>
                  <p className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase m-0">Admin Portal</p>
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

            {/* NÚT THU GỌN SIDEBAR TRÊN MÁY TÍNH (DEKSTOP ONLY) */}
            <button 
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer border-0 shadow"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

          </div>

          <hr className="border-slate-800 my-0" />

          {/* DANH SÁCH MENU ĐIỀU HƯỚNG */}
          <nav className="space-y-1.5 text-left">
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
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                      : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="transition-opacity duration-200">{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* PHẦN CUỐI: NÚT QUAY LẠI CLIENT */}
        <div className="p-4 sm:p-5">
          <button
            onClick={onBackToClient}
            title={isCollapsed ? 'Về trang Client' : undefined}
            className={`w-full flex items-center bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-bold rounded-xl transition duration-150 cursor-pointer ${
              isCollapsed ? 'justify-center p-3' : 'justify-center space-x-2 py-3 px-4'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span className="transition-opacity duration-200">Về trang Client</span>}
          </button>
        </div>

      </aside>
    </>
  );
};
