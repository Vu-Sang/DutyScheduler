import React, { useState, useRef, useEffect } from 'react';
import { useDuty } from '../../context/DutyContext';
import { CURRENT_USER } from '../../data/initialData';

interface TopHeaderProps {
  onToggleMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    currentUser,
  } = useDuty();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="top-app-header"
      className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white border-b border-[#c3c6d6] flex justify-between items-center px-4 md:px-8 z-30 shadow-xs"
    >
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-[#041b3c] hover:bg-[#f1f3ff] rounded-lg transition-colors"
          aria-label="Mở menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <span className="text-[18px] font-bold text-[#003d9b]">DutyScheduler</span>
      </div>

      {/* Search Input Bar */}
      <div className="hidden sm:flex flex-1 max-w-md relative items-center">
        <span className="material-symbols-outlined absolute left-3 text-[#737685] text-[20px] pointer-events-none">
          search
        </span>
        <input
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm nhân viên, công việc trực..."
          className="w-full pl-10 pr-8 py-2 bg-[#f9f9ff] border border-[#c3c6d6] rounded-md text-[14px] text-[#041b3c] placeholder-[#737685] focus:bg-white focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 text-[#737685] hover:text-[#041b3c] p-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-full text-[#434654] hover:text-[#003d9b] hover:bg-[#f1f3ff] transition-colors relative"
            aria-label="Thông báo"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-[#c3c6d6] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[#c3c6d6]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[14px] text-[#041b3c]">Thông báo</h4>
                  {unreadCount > 0 && (
                    <span className="bg-[#ba1a1a] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[12px] text-[#003d9b] hover:underline font-medium"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#c3c6d6]/30">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#737685] text-[13px]">
                    Không có thông báo mới
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3.5 hover:bg-[#f1f3ff] transition-colors cursor-pointer flex gap-3 items-start ${
                        !notif.read ? 'bg-[#f1f3ff]/60' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.type === 'offday'
                            ? 'bg-[#ffca81]/30 text-[#5e3c00]'
                            : notif.type === 'shift'
                            ? 'bg-[#b2c5ff]/40 text-[#003d9b]'
                            : 'bg-[#82f9be]/30 text-[#006c47]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {notif.type === 'offday'
                            ? 'event_busy'
                            : notif.type === 'shift'
                            ? 'cleaning_services'
                            : 'info'}
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-semibold text-[13px] text-[#041b3c] truncate">
                            {notif.title}
                          </p>
                          <span className="text-[11px] text-[#737685] shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[12px] text-[#434654] leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <div className="relative" ref={settingsRef}>
          <button
            id="settings-btn"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-2 rounded-full text-[#434654] hover:text-[#003d9b] hover:bg-[#f1f3ff] transition-colors"
            aria-label="Cài đặt hệ thống"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>

          {/* Quick Settings Dropdown */}
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-[#c3c6d6] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <h4 className="font-bold text-[14px] text-[#041b3c] mb-3">Tuỳ chọn hệ thống</h4>
              <div className="space-y-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#434654]">Hệ thống</span>
                  <span className="font-medium text-[#003d9b] bg-[#0052cc]/10 px-2 py-0.5 rounded text-[12px]">
                    Phân công Trực nhật
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434654]">Thuật toán xếp lịch</span>
                  <span className="text-[#006c47] font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#006c47]" /> Né ngày OFF
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative ml-1 sm:ml-2" ref={userRef}>
          <button
            id="user-profile-menu-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-9 h-9 rounded-full overflow-hidden border border-[#c3c6d6] hover:ring-2 hover:ring-[#003d9b] transition-all flex items-center justify-center bg-[#d7e2ff]"
            aria-label="Menu tài khoản"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#c3c6d6] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[#c3c6d6]/60">
                <p className="font-bold text-[14px] text-[#041b3c]">{currentUser.name}</p>
                <p className="text-[12px] text-[#737685]">{currentUser.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
