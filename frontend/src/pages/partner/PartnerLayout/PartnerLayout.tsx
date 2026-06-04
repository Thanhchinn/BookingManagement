import React, { useState, useEffect, useRef } from 'react';
import { PartnerDashboard } from '../PartnerDashboard';
import { FieldManagement } from '../FieldManagement';
import { PitchManagement } from '../FieldManagement/PitchManagement';
import { CustomerBookingManagement } from '../CustomerBookingManagement';
import { ProductManagement } from '../ProductManagement';
import { PromotionManagement } from '../PromotionManagement';
import { 
  Trophy, 
  CalendarRange, 
  DollarSign, 
  LayoutDashboard, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  ShoppingBag,
  Tag,
  Sun,
  Moon,
  MessageSquare,
  Building
} from 'lucide-react';
import { PartnerAdminChat } from '../PartnerAdminChat';
import '../../../features/admin/styles/admin-table.css';
import { toast } from 'sonner';

interface PartnerLayoutProps {
  partnerName: string;
  currentPath: string;
  navigateTo: (path: string) => void;
  onLogout: () => void;
}

export const PartnerLayout: React.FC<PartnerLayoutProps> = ({ partnerName, currentPath, navigateTo, onLogout }) => {
  // Polling liên tục kiểm tra tài khoản đối tác có bị khóa (SUSPENDED) bởi Admin không
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('user_info');
    if (!savedUserInfo) return;

    let parsed: any;
    try {
      parsed = JSON.parse(savedUserInfo);
    } catch {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3000/partners/user/${parsed.id}`);
        if (res.ok) {
          const data = await res.json();
          // Nếu hồ sơ đối tác bị xóa hoặc chuyển sang trạng thái khác ACTIVE (VD: SUSPENDED, PENDING)
          if (!data || data.status?.toUpperCase() !== 'ACTIVE') {
            clearInterval(interval);
            onLogout();
            toast.error('Tài khoản đối tác của bạn đã bị khóa hoặc ngừng kích hoạt bởi Admin!', {
              description: 'Vui lòng liên hệ quản trị viên để biết thêm chi tiết.',
              duration: 5000,
            });
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra trạng thái đối tác:', err);
      }
    }, 3000); // Check status every 3 seconds

    return () => clearInterval(interval);
  }, [onLogout]);

  // Trạng thái Theme (Sáng / Tối)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  
  // Tab hiện tại của Đối tác dựa trên URL
  const currentTab = (() => {
    const parts = currentPath.split('/');
    return parts[2] || 'dashboard';
  })();
  
  // Ref cho vùng cuộn chính <main> để reset scroll khi chuyển tab
  const mainRef = useRef<HTMLElement>(null);

  // Tự động cuộn lên đầu trang con khi chuyển tab
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [currentTab]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSelectTab = (tab: string) => {
    const newPath = tab === 'dashboard' ? '/partner' : `/partner/${tab}`;
    navigateTo(newPath);
  };

  // Trạng thái thu gọn Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Trạng thái mở Sidebar di động (Off-canvas Drawer)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Khai báo menu điều hướng Sidebar của Đối tác
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'fields', label: 'Quản Lý Cơ Sở', icon: Building },
    { id: 'pitches', label: 'Quản Lý Sân Đấu', icon: Trophy },
    { id: 'bookings', label: 'Lịch Đặt Khách Hàng', icon: CalendarRange },
    { id: 'products', label: 'Quản Lý Sản Phẩm', icon: ShoppingBag },
    { id: 'promotions', label: 'Quản Lý Voucher', icon: Tag },
    { id: 'revenue', label: 'Đối Soát & Ví Tiền', icon: DollarSign },
    { id: 'chat', label: 'Liên Hệ Admin', icon: MessageSquare },
  ];

  // Render nội dung tương ứng từng Tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <PartnerDashboard onNavigateTab={handleSelectTab} />;
      case 'fields':
        return <FieldManagement />;
      case 'pitches':
        return <PitchManagement />;
      case 'bookings':
        return <CustomerBookingManagement />;
      case 'products':
        return <ProductManagement />;
      case 'promotions':
        return <PromotionManagement />;
      case 'chat':
        return <PartnerAdminChat partnerName={partnerName} />;
      case 'revenue':
        return (
          <div className="space-y-6 text-left relative font-sans text-slate-100">
            {/* Tiêu đề */}
            <div>
              <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                Đối Soát Tài Chính & Ví Thụ Hưởng
              </h3>
              <p className="text-xs text-slate-400 m-0">Kiểm tra doanh thu tích lũy, phí nền tảng và rút tiền đối soát về ngân hàng liên kết</p>
            </div>

            {/* Widget Tiền tệ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Số dư có thể rút</span>
                <h3 className="text-3xl font-black text-amber-400 mt-2 mb-0">12.450.000đ</h3>
                <p className="text-[9px] text-slate-500 mt-1.5 m-0">Đã khấu trừ 10% phí vận hành nền tảng</p>
                <button 
                  onClick={() => alert('Yêu cầu rút tiền đối soát của bạn đã được gửi thành công lên Tổng Quản Trị Admin. Số tiền sẽ được chuyển khoản trong vòng 24 giờ.')}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white border-0 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  Yêu Cầu Rút Tiền Ngay
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tổng tiền đã rút</span>
                <h3 className="text-3xl font-black text-white mt-2 mb-0">85.000.000đ</h3>
                <p className="text-[9px] text-emerald-400 mt-1.5 m-0">🟢 Tài khoản thụ hưởng liên kết hoạt động tốt</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Phí nền tảng (Platform fee)</span>
                <h3 className="text-3xl font-black text-slate-500 mt-2 mb-0">10%</h3>
                <p className="text-[9px] text-slate-500 mt-1.5 m-0">Áp dụng cho mọi giao dịch đặt lịch thành công</p>
              </div>
            </div>

            {/* Bảng lịch sử giao dịch */}
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-white m-0">Lịch Sử Giao Dịch Đối Soát</h4>
              <div className="admin-table-container">
                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr className="admin-table-thead">
                        <th className="admin-table-th">Mã Lệnh</th>
                        <th className="admin-table-th">Ngân hàng thụ hưởng</th>
                        <th className="admin-table-th">Thời gian rút</th>
                        <th className="admin-table-th text-right">Số tiền rút</th>
                        <th className="admin-table-th w-36 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="admin-table-tbody">
                      <tr className="admin-table-tr">
                        <td className="admin-table-td font-mono font-bold text-slate-400">WD90872</td>
                        <td className="admin-table-td">
                          <div>
                            <p className="admin-table-td-bold m-0">Techcombank</p>
                            <span className="text-[9px] text-slate-500 block">1903456789012 (NGUYEN VAN HUNG)</span>
                          </div>
                        </td>
                        <td className="admin-table-td text-slate-400">2026-05-25 10:15</td>
                        <td className="admin-table-td text-right font-black text-white font-mono">-15.000.000đ</td>
                        <td className="admin-table-td text-center">
                          <span className="admin-table-badge admin-table-badge-emerald">Thành công</span>
                        </td>
                      </tr>
                      <tr className="admin-table-tr">
                        <td className="admin-table-td font-mono font-bold text-slate-400">WD90543</td>
                        <td className="admin-table-td">
                          <div>
                            <p className="admin-table-td-bold m-0">Techcombank</p>
                            <span className="text-[9px] text-slate-500 block">1903456789012 (NGUYEN VAN HUNG)</span>
                          </div>
                        </td>
                        <td className="admin-table-td text-slate-400">2026-05-10 14:30</td>
                        <td className="admin-table-td text-right font-black text-white font-mono">-20.000.000đ</td>
                        <td className="admin-table-td text-center">
                          <span className="admin-table-badge admin-table-badge-emerald">Thành công</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        );
      default:
        return <PartnerDashboard onNavigateTab={handleSelectTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100 select-none">
      
      {/* ======================================================================
          1. SIDEBAR CHO ĐỐI TÁC (GOLD/AMBER DESIGN SYSTEM)
          ====================================================================== */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-all duration-300
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header Sidebar */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/80 h-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
              🏆
            </div>
            {!isSidebarCollapsed && (
              <div className="text-left leading-none">
                <h2 className="text-xs font-black text-white m-0 tracking-wider uppercase">Zone Partner</h2>
                <span className="text-[8px] text-slate-500 font-bold uppercase mt-0.5 block">Cụm Sân Thể Thao</span>
              </div>
            )}
          </div>
          
          {/* Nút thu gọn Sidebar trên desktop */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded-lg transition duration-150 cursor-pointer border-0"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Danh sách Menu điều hướng */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleSelectTab(item.id);
                  setIsMobileSidebarOpen(false); // Đóng drawer trên mobile sau khi chọn
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition duration-150 border-0 cursor-pointer text-left
                  ${isActive 
                    ? 'bg-amber-500 text-white font-extrabold shadow-lg shadow-amber-500/10' 
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }
                `}
              >
                <IconComponent className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span className="text-xs">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Chân Sidebar (Đăng xuất) */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 bg-slate-950/40 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl transition duration-150 border border-slate-855 hover:border-red-500/20 cursor-pointer text-left`}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-red-500" />
            {!isSidebarCollapsed && <span className="text-xs font-bold">Đăng xuất đối tác</span>}
          </button>
        </div>

      </aside>

      {/* Overlay che màn hình khi Drawer mobile mở */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* ======================================================================
          2. KHU VỰC NỘI DUNG CHÍNH (MAIN WRAPPER & TOPBAR)
          ====================================================================== */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}
        `}
      >
        
        {/* Topbar điều khiển trên cùng */}
        <header className="bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-20 h-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Nút Hamburger menu trên Mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer border-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-left">
              <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block">Cổng Đối Tác</span>
              <h2 className="text-sm font-black text-white m-0 uppercase tracking-tight mt-0.5">{partnerName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button for Partners */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-850/60 text-slate-400 hover:text-amber-500 transition-all duration-200 cursor-pointer border-0 bg-transparent flex items-center justify-center shrink-0"
              title="Đổi giao diện Sáng/Tối"
            >
              {theme === 'light' ? (
                <Moon className="w-4.5 h-4.5 text-slate-400" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-amber-500" />
              )}
            </button>
            
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="Hệ thống trực tuyến"></span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider hidden sm:inline">Trực tuyến</span>
          </div>
        </header>

        {/* Nội dung chi tiết của trang tương ứng */}
        <main ref={mainRef} className="flex-1 p-6 sm:p-8 bg-slate-950 overflow-y-auto">
          {renderTabContent()}
        </main>

      </div>

    </div>
  );
};
