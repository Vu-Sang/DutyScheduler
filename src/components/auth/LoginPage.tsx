import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';

export const LoginPage: React.FC = () => {
  const { employees, loginAsAdmin, loginAsEmployee } = useDuty();
  const [activeRole, setActiveRole] = useState<'user' | 'admin'>('user');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (activeRole === 'admin') {
      if (username === 'admin' && password === '0342633403') {
        loginAsAdmin();
      } else {
        setError('Tài khoản hoặc mật khẩu Admin không chính xác');
      }
    } else {
      // User login
      const emp = employees.find(e => e.username === username && e.password === password);
      if (emp) {
        loginAsEmployee(emp.id);
      } else {
        setError('Tài khoản hoặc mật khẩu nhân viên không chính xác');
      }
    }
  };

  const handleQuickFillAdmin = () => {
    setActiveRole('admin');
    setUsername('admin');
    setPassword('0342633403');
    setError('');
  };

  const handleQuickFillEmployee = () => {
    setActiveRole('user');
    if (employees.length > 0) {
      setUsername(employees[0].username || '');
      setPassword(employees[0].password || '');
    }
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] font-sans select-none overflow-x-hidden">
      
      {/* Background Animated Ambient Lights */}
      <div className="fixed top-10 left-10 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Main Container - Split Screen 2D/3D Anime Theme */}
      <div className="relative z-10 max-w-5xl w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-2 border-white/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300">
        
        {/* LEFT COLUMN: Anime Duty Banner Showcase */}
        <div className="relative lg:col-span-7 bg-slate-900 min-h-[260px] lg:min-h-[580px] flex flex-col justify-between p-6 sm:p-8 overflow-hidden group">
          {/* Background Anime Illustration */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url('/login_anime_bg.jpg')` }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-slate-950/50 lg:to-slate-950" />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-sm animate-bounce">
                ✨
              </div>
              <span className="text-white font-black text-sm tracking-wide">DutyScheduler Anime</span>
            </div>

            <span className="hidden sm:inline-flex bg-pink-500/80 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full border border-pink-300/40 shadow-sm">
              🧹 Trực Nhật Vui Vẻ 2D/3D
            </span>
          </div>

          {/* Bottom Banner Content */}
          <div className="relative z-10 mt-auto pt-12 space-y-3">
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[12px] rounded-lg shadow-md uppercase tracking-wider">
              ✦ Hệ Thống Phân Công 4.0
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-md">
              Cùng Nhau Trực Nhật, <br />
              <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Giữ Cho Không Gian Sạch Đẹp!
              </span>
            </h2>

            <p className="text-slate-200 text-xs sm:text-sm font-semibold max-w-md drop-shadow">
              Quản lý lịch trực nhật thông minh, nhắc nhở thông báo giọng nói Tiếng Việt và nộp ảnh minh chứng thực tế dễ dàng.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-cyan-300">calendar_month</span>
                Xếp lịch tự động
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-pink-300">campaign</span>
                Thông báo loa giọng nói
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-300">verified</span>
                Nộp minh chứng thực tế
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Card Login */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center bg-white">
          
          {/* Header */}
          <div className="text-center sm:text-left mb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span>Đăng Nhập</span>
              <span className="text-xl">🚀</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Chọn vai trò bên dưới để truy cập vào hệ thống:
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveRole('user'); setError(''); setUsername(''); setPassword(''); }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-indigo-600 font-bold'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              Nhân viên
            </button>

            <button
              type="button"
              onClick={() => { setActiveRole('admin'); setError(''); setUsername(''); setPassword(''); }}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-purple-600 font-bold'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              Quản trị viên
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                Tài khoản {activeRole === 'admin' ? 'Admin' : 'Nhân viên'}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400">
                  {activeRole === 'admin' ? 'manage_accounts' : 'person'}
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={activeRole === 'admin' ? "admin" : "Nhập tên tài khoản"}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-extrabold flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3.5 text-white rounded-xl font-black text-sm transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer group mt-2 ${
                activeRole === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700'
              }`}
            >
              Đăng nhập ngay
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-2">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Thử nghiệm nhanh:</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-black rounded-lg border border-purple-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Admin
              </button>
              <button
                type="button"
                onClick={handleQuickFillEmployee}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">person</span>
                Nhân viên
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


