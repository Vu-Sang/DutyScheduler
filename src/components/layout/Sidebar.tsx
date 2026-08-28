import React from 'react';
import { TabType } from '../../types';
import { useDuty } from '../../context/DutyContext';
import { AvatarImage } from '../common/AvatarImage';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, currentUser, offDays, logout } = useDuty();

  const isUserRole = currentUser.roleType === 'user';

  const pendingCount = offDays.filter(o => o.status === 'pending').length;

  const adminNavItems: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { id: 'my_schedule', label: 'Lịch trực tuần', icon: 'view_week' },
    { id: 'calendar', label: 'Lịch trực tháng', icon: 'calendar_month' },
    { id: 'offdays', label: 'Lịch nghỉ nhân viên', icon: 'event_busy', badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'categories', label: 'Danh mục công việc', icon: 'cleaning_services' },
    { id: 'employees', label: 'Quản lý nhân viên', icon: 'group' },
    { id: 'dashboard', label: 'Bảng điều khiển', icon: 'dashboard' },
  ];

  const userNavItems: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { id: 'my_schedule', label: 'Lịch trực của tôi', icon: 'assignment_ind' },
    { id: 'offdays', label: 'Đăng ký lịch OFF', icon: 'event_busy' },
    { id: 'calendar', label: 'Lịch trực full tháng', icon: 'calendar_month' },
    { id: 'my_summary', label: 'Tổng kết số liệu', icon: 'analytics' }
  ];

  const navItems = isUserRole ? userNavItems : adminNavItems;

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed left-0 top-0 h-screen w-64 bg-[#f1f3ff] border-r border-[#c3c6d6] flex flex-col py-6 z-40 transition-transform duration-200 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="px-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#003d9b] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              DS
            </div>
            <div>
              <h1 className="text-[22px] leading-7 font-bold text-[#003d9b] tracking-tight">DutyScheduler</h1>
              <p className="text-[12px] leading-4 text-[#434654] font-medium">
                {isUserRole ? 'Giao diện Nhân viên' : 'Phân công trực nhật'}
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-[#434654] hover:text-[#003d9b]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Navigation List */}
        <ul className="flex flex-col gap-1 px-3 flex-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-[14px] transition-all duration-200 ease-in-out cursor-pointer ${isActive
                    ? 'text-[#003d9b] font-bold bg-[#0052cc]/10 border-r-4 border-[#003d9b]'
                    : 'text-[#434654] font-medium hover:text-[#003d9b] hover:bg-[#e0e8ff]'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="bg-[#ba1a1a] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* User Profile Card Footer */}
        <div className="px-4 pt-4 border-t border-[#c3c6d6] flex flex-col gap-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 border border-[#c3c6d6]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#c3c6d6] shadow-2xs">
                <AvatarImage src={currentUser.avatar} name={currentUser.name} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-bold text-[#041b3c] truncate">{currentUser.name}</p>
                <p className="text-[11px] text-[#737685] truncate">{currentUser.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-[#737685] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors"
              title="Đăng xuất"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
