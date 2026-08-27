import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { FaceLogin } from './FaceLogin';

export const LoginPage: React.FC = () => {
  const { employees, loginAsAdmin, loginAsEmployee } = useDuty();
  const [activeRole, setActiveRole] = useState<'user' | 'admin'>('user');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isFaceLogin, setIsFaceLogin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (activeRole === 'admin') {
      if (username === 'admin' && password === 'admin') {
        loginAsAdmin();
      } else {
        setError('Tài khoản hoặc mật khẩu Admin không đúng (thử admin/admin)');
      }
    } else {
      // User login
      const emp = employees.find(e => e.username === username && e.password === password);
      if (emp) {
        loginAsEmployee(emp.id);
      } else {
        setError('Tài khoản hoặc mật khẩu không đúng');
      }
    }
  };

  const handleFaceSuccess = (empId: string) => {
    loginAsEmployee(empId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001848] via-[#003d9b] to-[#0052cc] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#003d9b] text-white font-bold text-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            DS
          </div>
          <h1 className="text-[26px] font-bold text-[#041b3c] tracking-tight">DutyScheduler</h1>
          <p className="text-[14px] text-[#737685] font-medium mt-1">Hệ thống Phân công Lao động & Trực nhật</p>
        </div>

        {isFaceLogin ? (
          <FaceLogin 
            employees={employees} 
            onSuccess={handleFaceSuccess} 
            onCancel={() => setIsFaceLogin(false)} 
          />
        ) : (
          <>
            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f1f3ff] rounded-xl mb-6 border border-[#c3c6d6]/60">
              <button
                type="button"
                onClick={() => { setActiveRole('user'); setError(''); setUsername(''); setPassword(''); }}
                className={`py-2.5 rounded-lg text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
                  activeRole === 'user'
                    ? 'bg-white text-[#003d9b] shadow-xs'
                    : 'text-[#434654] hover:text-[#003d9b]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                Nhân viên
              </button>

              <button
                type="button"
                onClick={() => { setActiveRole('admin'); setError(''); setUsername(''); setPassword(''); }}
                className={`py-2.5 rounded-lg text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
                  activeRole === 'admin'
                    ? 'bg-white text-[#003d9b] shadow-xs'
                    : 'text-[#434654] hover:text-[#003d9b]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                Quản trị
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-2">
                  Tài khoản
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={activeRole === 'admin' ? "admin" : "Nhập tài khoản của bạn"}
                  className="w-full px-4 py-3 border border-[#c3c6d6] rounded-xl text-[15px] font-semibold text-[#041b3c] bg-white focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={activeRole === 'admin' ? "admin" : "Nhập mật khẩu"}
                  className="w-full px-4 py-3 border border-[#c3c6d6] rounded-xl text-[15px] font-semibold text-[#041b3c] bg-white focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-[#ffdad6]/40 border border-[#ba1a1a]/30 rounded-lg text-[13px] text-[#ba1a1a] font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-xl font-bold text-[15px] transition-all shadow-md flex items-center justify-center gap-2 group mt-2"
              >
                Đăng nhập hệ thống
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </form>

            {activeRole === 'user' && (
              <div className="mt-6 text-center">
                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-[#c3c6d6]"></div>
                  <span className="flex-shrink-0 mx-4 text-[#737685] text-[12px] font-medium">HOẶC</span>
                  <div className="flex-grow border-t border-[#c3c6d6]"></div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsFaceLogin(true)}
                  className="w-full py-3.5 bg-white border-2 border-[#003d9b] text-[#003d9b] hover:bg-[#003d9b]/5 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">face</span>
                  Đăng nhập bằng Khuôn mặt (Face ID)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
