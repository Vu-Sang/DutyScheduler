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
          className="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col py-6 z-40 transition-transform duration-200 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="px-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-md shadow-blue-600/30">
              AE
            </div>
            <div>
              <h1 className="text-[17px] leading-5 font-black text-white tracking-tight">Lịch Trực AE Media</h1>
              <p className="text-[11px] leading-4 text-slate-400 font-semibold mt-0.5">
                {isUserRole ? 'Cổng Nhân Viên' : 'Hệ Thống Phân Công'}
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Navigation List */}
        <ul className="flex flex-col gap-1.5 px-3 flex-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[13.5px] transition-all duration-200 ease-in-out cursor-pointer ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 font-medium hover:text-slate-100 hover:bg-slate-800/80'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* User Profile Card Footer */}
        <div className="px-3 pt-4 border-t border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-600 shadow-sm bg-slate-700">
                <AvatarImage src={currentUser.avatar} name={currentUser.name} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 font-semibold truncate">{currentUser.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

