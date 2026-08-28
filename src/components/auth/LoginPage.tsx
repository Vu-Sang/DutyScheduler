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
        setError('Tài khoản hoặc mật khẩu Quản trị viên không chính xác');
      }
    } else {
      // User login
      const emp = employees.find(e => e.username === username && e.password === password);
      if (emp) {
        loginAsEmployee(emp.id);
      } else {
        setError('Tài khoản hoặc mật khẩu Nhân viên không chính xác');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#0b1329] font-sans select-none overflow-x-hidden relative">

      {/* Subtle Background Glow Accent */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Professional Container */}
      <div className="relative z-10 max-w-5xl w-full bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">

        {/* LEFT COLUMN: Executive Enterprise Showcase */}
        <div className="relative lg:col-span-7 min-h-[300px] lg:min-h-[600px] flex flex-col justify-between p-6 sm:p-10 overflow-hidden group">
          {/* Professional Corporate Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url('/login_pro_bg.jpg')` }}
          />
          {/* Deep Professional Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40 lg:bg-gradient-to-r lg:from-slate-950/90 lg:via-slate-950/70 lg:to-slate-950/30" />

          {/* Top Corporate Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-sm">
                AE
              </div>
              <span className="text-white font-bold text-sm tracking-wide">Lịch Trực AE Media</span>
            </div>

            <span className="hidden sm:inline-flex bg-blue-500/20 backdrop-blur-md text-blue-300 text-xs font-semibold px-3 py-1 rounded-lg border border-blue-400/30 shadow-sm">
              Enterprise v4.2
            </span>
          </div>

          {/* Executive Enterprise Showcase Content */}
          <div className="relative z-10 my-auto py-6 flex flex-col items-center text-center space-y-6 max-w-xl mx-auto">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/15 border border-blue-400/30 text-blue-200 font-bold text-xs rounded-full backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Hệ Thống Phân Công & Điều Hành AE Media
            </div>

            {/* Main High-Impact Typography */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white leading-tight tracking-tight drop-shadow-md">
                Tối Ưu Hóa Phân Công
              </h2>
              <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent leading-tight tracking-tight whitespace-normal sm:whitespace-nowrap drop-shadow-sm">
                Chuẩn Hóa Điều Hành Trực Nhật
              </h3>
            </div>

            {/* Sub-description */}
            <p className="text-slate-200 text-xs sm:text-sm font-medium max-w-md leading-relaxed text-center drop-shadow">
              Giải pháp toàn diện giúp tự động hóa lịch trực nhật, quản lý nhân sự và xác thực nhiệm vụ minh&nbsp;bạch cho doanh nghiệp.
            </p>

            {/* Layout Division: Glassmorphism Enterprise Cards */}
            <div className="grid grid-cols-3 gap-2.5 w-full pt-2">
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 text-center flex flex-col items-center shadow-md">
                <span className="material-symbols-outlined text-[22px] text-blue-400 mb-1">auto_awesome</span>
                <span className="text-white font-extrabold text-[12px] leading-tight">Xếp Lịch Tự Động</span>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">Tối ưu công bằng</span>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 text-center flex flex-col items-center shadow-md">
                <span className="material-symbols-outlined text-[22px] text-cyan-400 mb-1">campaign</span>
                <span className="text-white font-extrabold text-[12px] leading-tight">Loa Thông Báo</span>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">Giọng nói Real-time</span>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 text-center flex flex-col items-center shadow-md">
                <span className="material-symbols-outlined text-[22px] text-emerald-400 mb-1">verified</span>
                <span className="text-white font-extrabold text-[12px] leading-tight">Minh Chứng Ảnh</span>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">Xác thực thực tế</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Modern Corporate Authentication Form */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white">
          
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 mb-4 shadow-xs">
                <span className="material-symbols-outlined text-[26px]">lock</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Cổng Đăng Nhập
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Hệ thống quản lý & phân công lịch trực AE Media
              </p>
            </div>

            {/* Role Selector Segmented Control */}
            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200/80">
              <button
                type="button"
                onClick={() => { setActiveRole('user'); setError(''); setUsername(''); setPassword(''); }}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeRole === 'user'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">badge</span>
                Nhân viên
              </button>

              <button
                type="button"
                onClick={() => { setActiveRole('admin'); setError(''); setUsername(''); setPassword(''); }}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Tài khoản {activeRole === 'admin' ? 'Quản trị (Admin)' : 'Nhân viên'}
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
                    placeholder={activeRole === 'admin' ? "admin" : "Nhập tên tài khoản của bạn"}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:font-normal focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Mật khẩu truy cập
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
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:font-normal focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all hover:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-extrabold flex items-center gap-2 animate-in fade-in">
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-rose-600">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-extrabold text-sm transition-all shadow-lg hover:shadow-xl shadow-blue-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer group mt-2"
              >
                Xác nhận đăng nhập
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </form>
          </div>

          {/* Corporate Security Footer */}
          <div className="pt-6 mt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-500">verified_user</span>
              Bảo mật SSL 256-bit • Nội bộ AE Media
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};



