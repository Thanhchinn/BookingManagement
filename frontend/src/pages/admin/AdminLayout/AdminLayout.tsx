import React, { useState, useRef } from 'react';
import { AdminSidebar } from '../../../features/admin/components/AdminSidebar';
import { AdminTopbar } from '../../../features/admin/components/AdminTopbar';
import { Dashboard } from '../Dashboard';
import { Analytics } from '../Analytics';
import { SportsManagement } from '../SportsManagement';
import { PartnerManagement } from '../PartnerManagement';
import { DisputeManagement } from '../DisputeManagement';
import { PayoutManagement } from '../PayoutManagement';
import { UserManagement } from '../UserManagement';
import { AdminPartnerChat } from '../AdminPartnerChat';
import '../../../features/admin/styles/admin-table.css';

interface AdminLayoutProps {
  currentPath: string;
  navigateTo: (path: string) => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, navigateTo, onLogout }) => {
  // Quản lý tab nội dung hiện tại của Admin dựa trên URL
  const currentTab = (() => {
    const parts = currentPath.split('/');
    return parts[2] || 'dashboard';
  })();

  // Trạng thái thu gọn Sidebar trên máy tính
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Trạng thái mở Sidebar dạng Off-canvas Drawer trên di động
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Trạng thái hiển thị trang con chi tiết của các phân hệ để ẩn/hiện header dùng chung đồng bộ
  const [isSubPageActive, setIsSubPageActive] = useState(false);

  // Ref cho vùng cuộn chính <main> để reset scroll khi chuyển tab
  const mainRef = useRef<HTMLElement>(null);

  // Hàm chuyển tab đồng thời reset trạng thái trang chi tiết và scroll về đầu trang
  const handleSelectTab = (tab: string) => {
    const newPath = tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
    navigateTo(newPath);
    setIsSubPageActive(false);
    mainRef.current?.scrollTo({ top: 0 });
  };

  // Bản đồ tên Tab hiển thị trong trang với đầy đủ tiêu đề, mô tả và icon premium
  const tabNames: Record<string, { title: string; desc: string; icon: string }> = {
    dashboard: { title: 'Tổng quan hệ thống', desc: 'Giám sát hoạt động giao dịch, đặt lịch và đối tác chủ sân theo thời gian thực.', icon: '📊' },
    analytics: { title: 'Báo cáo thống kê sâu', desc: 'Đánh giá chi tiết doanh thu, hiệu suất lấp đầy sân và hành vi người dùng.', icon: '📈' },
    sports: { title: 'Quản lý danh mục bộ môn', desc: 'Khai báo, thiết lập và cấu hình các bộ môn thể thao trên toàn hệ thống.', icon: '🏸' },
    users: { title: 'Quản lý tài khoản khách hàng', desc: 'Kiểm soát tài khoản người dùng, xem lịch sử đặt sân và quản lý phân quyền.', icon: '👥' },
    chats: { title: 'Trao đổi & Hỗ trợ đối tác', desc: 'Trò chuyện và hỗ trợ trực tiếp các yêu cầu của chủ cơ sở sân bãi.', icon: '💬' },
    partners: { title: 'Phê duyệt & Quản lý đối tác chủ sân', desc: 'Xem xét thông tin đăng ký liên kết của chủ sân, phê duyệt hồ sơ và kiểm soát hoạt động.', icon: '🤝' },
    disputes: { title: 'Giải quyết khiếu nại khách hàng', desc: 'Theo dõi các phản ánh, tranh chấp sân bãi giữa người dùng và chủ sân.', icon: '⚖️' },
    payouts: { title: 'Duyệt rút tiền đối soát', desc: 'Phê duyệt các yêu cầu rút tiền mặt từ doanh thu sân bãi của đối tác.', icon: '💵' },
    reconciliation: { title: 'Đối soát tài chính & Rút tiền', desc: 'Kiểm tra khớp số liệu dòng tiền, xuất hóa đơn và tổng hợp báo cáo tài chính.', icon: '💰' },
  };

  // Hàm render nội dung trang con tương ứng với Tab được chọn
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigateTab={handleSelectTab} />;
      case 'analytics':
        return <Analytics />;
      case 'sports':
        return <SportsManagement />;
      case 'users':
        return <UserManagement />;
      case 'chats':
        return <AdminPartnerChat />;
      case 'partners':
        return <PartnerManagement onSubPageActive={setIsSubPageActive} />;
      case 'disputes':
        return <DisputeManagement />;
      case 'payouts':
        return <PayoutManagement />;
      case 'reconciliation':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            💵 Tính năng Đối soát Tài chính đang được dựng ở Đợt 2...
          </div>
        );
      default:
        return <Dashboard onNavigateTab={handleSelectTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100 overflow-hidden relative">
      
      {/* A. SIDEBAR BÊN TRÁI ĐIỀU HƯỚNG */}
      <AdminSidebar 
        currentTab={currentTab} 
        onSelectTab={handleSelectTab} 
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* B. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Topbar điều khiển trên cùng — cố định không cuộn */}
        <AdminTopbar 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Nội dung thay đổi động của từng phân hệ — cuộn độc lập bên dưới Topbar */}
        <main ref={mainRef} className="p-4 sm:p-6 lg:p-8 flex-grow bg-slate-950 text-left overflow-y-auto">
          
          {/* TIÊU ĐỀ TRANG LINH HOẠT VỚI THIẾT KẾ PREMIUM */}
          {tabNames[currentTab] && !isSubPageActive && (
            <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <span className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-lg shadow-inner select-none">
                    {tabNames[currentTab].icon}
                  </span>
                  {tabNames[currentTab].title}
                </h1>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-3xl">
                  {tabNames[currentTab].desc}
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <span>Portal</span>
                <span>/</span>
                <span className="text-emerald-400">{currentTab}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </main>

      </div>

    </div>
  );
};
