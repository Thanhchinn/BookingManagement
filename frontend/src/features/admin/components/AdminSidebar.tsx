import React, { useState, useEffect } from 'react';
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
  CalendarRange,
  ClipboardCheck,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

// Static MENU_GROUPS definition
const MENU_GROUPS = [
  {
    title: 'Hệ thống & Báo cáo',
    items: [
      { id: 'dashboard', name: 'Tổng quan', icon: LayoutDashboard },
      { id: 'analytics', name: 'Thống kê sâu', icon: BarChart3 },
    ]
  },
  {
    title: 'Quản lý tài khoản',
    items: [
      { id: 'partners', name: 'Quản lý đối tác', icon: Handshake },
      { id: 'users', name: 'Quản lý người dùng', icon: Users },
      { id: 'chats', name: 'Tin nhắn đối tác', icon: MessageSquare },
    ]
  },
  {
    title: 'Vận hành & Lịch đặt',
    items: [
      { id: 'bookings', name: 'Giám sát đặt sân', icon: CalendarRange },
      { id: 'matchmaking', name: 'Duyệt ghép đôi', icon: ClipboardCheck },
      { id: 'sports', name: 'Quản lý bộ môn', icon: Dumbbell },
    ]
  },
  {
    title: 'Tài chính & Khiếu nại',
    items: [
      { id: 'payouts', name: 'Duyệt rút tiền', icon: Coins },
      { id: 'reconciliation', name: 'Đối soát tài chính', icon: Landmark },
      { id: 'disputes', name: 'Giải quyết khiếu nại', icon: Scale },
    ]
  }
];

const LOCAL_STORAGE_KEY = 'sportzone_admin_sidebar_collapsed_groups';

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  onLogout,
  isCollapsed,
  isMobileOpen,
  onCloseMobile
}) => {
  // Load state from localStorage
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Auto expand active group only when tab changes
  useEffect(() => {
    const activeGroup = MENU_GROUPS.find(g => g.items.some(item => item.id === currentTab));
    if (activeGroup) {
      setCollapsedGroups(prev => {
        if (!prev[activeGroup.title]) return prev; // already expanded
        const next = { ...prev, [activeGroup.title]: false };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [currentTab]);

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => {
      const next = { ...prev, [title]: !prev[title] };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isGroupCollapsed = (title: string) => {
    if (isCollapsed) return false;
    return !!collapsedGroups[title];
  };

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
        
        {/* PHẦN ĐẦU: LOGO */}
        <div className="h-16 lg:h-20 border-b border-slate-800 flex items-center px-6 sm:px-5 justify-between shrink-0">
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

          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PHẦN THÂN: DANH SÁCH MENU */}
        <div className="flex-grow overflow-y-auto p-6 sm:p-5 text-left custom-scrollbar">
          <nav className="space-y-5">
            {MENU_GROUPS.map((group, groupIdx) => {
              const collapsed = isGroupCollapsed(group.title);
              return (
                <div key={groupIdx} className="space-y-1.5">
                  {/* Tiêu đề nhóm */}
                  {!isCollapsed ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between text-[9px] font-black text-slate-500 hover:text-slate-300 tracking-wide uppercase px-2 mb-2 select-none bg-transparent border-0 cursor-pointer outline-none transition-all duration-150 whitespace-nowrap"
                    >
                      <span className="mr-2">{group.title}</span>
                      {collapsed ? (
                        <ChevronRight className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                      )}
                    </button>
                  ) : (
                    groupIdx > 0 && <div className="border-t border-slate-800/60 my-3" />
                  )}
                  
                  {/* Các menu thuộc nhóm */}
                  <div className={`grid transition-all duration-300 ease-in-out ${
                    collapsed 
                      ? 'grid-rows-[0fr] opacity-0 pointer-events-none' 
                      : 'grid-rows-[1fr] opacity-100'
                  }`}>
                    <div className="overflow-hidden space-y-1.5">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        
                        return (
                          <button
                             key={item.id}
                             onClick={() => {
                               onSelectTab(item.id);
                               onCloseMobile();
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
                            {!isCollapsed && <span className="transition-opacity duration-200 whitespace-nowrap">{item.name}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
