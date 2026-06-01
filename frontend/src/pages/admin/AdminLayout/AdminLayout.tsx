import React, { useState } from 'react';
import { AdminSidebar } from '../../../features/admin/components/AdminSidebar';
import { AdminTopbar } from '../../../features/admin/components/AdminTopbar';
import { Dashboard } from '../Dashboard';
import { Analytics } from '../Analytics';
import { SportsManagement } from '../SportsManagement';
import { PartnerManagement } from '../PartnerManagement';
import { DisputeManagement } from '../DisputeManagement';
import { PayoutManagement } from '../PayoutManagement';
import '../../../features/admin/styles/admin-table.css';

interface AdminLayoutProps {
  onBackToClient: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToClient }) => {
  // Quản lý tab nội dung hiện tại của Admin
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Trạng thái thu gọn Sidebar trên máy tính
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Trạng thái mở Sidebar dạng Off-canvas Drawer trên di động
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Hàm render nội dung trang con tương ứng với Tab được chọn
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigateTab={setCurrentTab} />;
      case 'analytics':
        return <Analytics />;
      case 'sports':
        return <SportsManagement />;
      case 'users':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            👥 Tính năng Quản lý Người dùng đang được dựng ở Đợt 2...
          </div>
        );
      case 'partners':
        return <PartnerManagement />;
      case 'disputes':
        return <DisputeManagement />;
      case 'payouts':
        return <PayoutManagement />;
      case 'reconciliation':
        return (
          <div className="bg-slate-900 border border-slate-805 rounded-2xl p-8 text-center text-slate-400">
            💵 Tính năng Đối soát Tài chính đang được dựng ở Đợt 2...
          </div>
        );
      default:
        return <Dashboard onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100 overflow-hidden relative">
      
      {/* A. SIDEBAR BÊN TRÁI ĐIỀU HƯỚNG */}
      <AdminSidebar 
        currentTab={currentTab} 
        onSelectTab={setCurrentTab} 
        onBackToClient={onBackToClient}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* B. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto">
        
        {/* Topbar điều khiển trên cùng */}
        <AdminTopbar 
          currentTab={currentTab} 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Nội dung thay đổi động của từng phân hệ */}
        <main className="p-4 sm:p-6 lg:p-8 flex-grow space-y-6 bg-slate-950">
          {renderTabContent()}
        </main>

      </div>

    </div>
  );
};
