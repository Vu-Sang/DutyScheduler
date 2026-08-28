import React, { useState, useRef, useEffect } from 'react';
import { useDuty } from '../../context/DutyContext';
import { AvatarImage } from '../common/AvatarImage';
import { AvatarModal } from '../modals/AvatarModal';
import { ChangePasswordModal } from '../modals/ChangePasswordModal';

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
    logout,
  } = useDuty();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

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
    <>
      <header
        id="top-app-header"
        className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-4 md:px-8 z-30 shadow-xs"
      >
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Mở menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
              AE
            </div>
            <span className="text-[16px] font-black text-slate-900 tracking-tight">AE Media</span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="hidden sm:flex flex-1 max-w-md relative items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px] pointer-events-none">
            search
          </span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nhân viên, ca trực nhật..."
            className="w-full pl-11 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1"
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
              className="p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
              aria-label="Thông báo"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900">Thông báo</h4>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-blue-700 hover:underline font-bold cursor-pointer"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                      Không có thông báo mới
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${
                          !notif.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.type === 'offday'
                              ? 'bg-amber-100 text-amber-800'
                              : notif.type === 'shift'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
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
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">{notif.time}</span>
                          </div>
                          <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
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
              className="p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cài đặt hệ thống"
            >
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>

            {/* Quick Settings Dropdown */}
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <h4 className="font-extrabold text-sm text-slate-900 mb-3">Tuỳ chọn hệ thống</h4>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Hệ thống</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-[11px] border border-blue-200/60">
                      AE Media Internal
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Thuật toán xếp lịch</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Né ngày OFF
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
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 hover:border-blue-600 transition-all flex items-center justify-center bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
              aria-label="Menu tài khoản"
            >
              <AvatarImage src={currentUser.avatar} name={currentUser.name} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <p className="font-extrabold text-sm text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 font-semibold">{currentUser.role}</p>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setAvatarModalOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-700">account_circle</span>
                  Đổi ảnh đại diện
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setPasswordModalOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-700">lock_reset</span>
                  Đổi mật khẩu
                </button>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <AvatarModal isOpen={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} />
      <ChangePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </>
  );
};
