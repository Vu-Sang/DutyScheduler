import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';

export const LoginPage: React.FC = () => {
  const { employees, loginAsAdmin, loginAsEmployee } = useDuty();
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [activeRole, setActiveRole] = useState<'user' | 'admin'>('user');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole === 'admin') {
      loginAsAdmin();
    } else {
      loginAsEmployee(selectedEmpId);
    }
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

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#f1f3ff] rounded-xl mb-6 border border-[#c3c6d6]/60">
          <button
            type="button"
            onClick={() => setActiveRole('user')}
            className={`py-2.5 rounded-lg text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
              activeRole === 'user'
                ? 'bg-white text-[#003d9b] shadow-xs'
                : 'text-[#434654] hover:text-[#003d9b]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            Nhân viên (User)
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('admin')}
            className={`py-2.5 rounded-lg text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
              activeRole === 'admin'
                ? 'bg-white text-[#003d9b] shadow-xs'
                : 'text-[#434654] hover:text-[#003d9b]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            Quản trị (Admin)
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {activeRole === 'user' ? (
            <div>
              <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-2">
                Chọn tài khoản Nhân viên đăng nhập:
              </label>
              <select
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                className="w-full px-4 py-3 border border-[#c3c6d6] rounded-xl text-[15px] font-semibold text-[#041b3c] bg-white focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 outline-none cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — ({emp.role})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-4 bg-[#003d9b]/5 border border-[#003d9b]/20 rounded-xl space-y-2 text-[13px] text-[#041b3c]">
              <div className="flex items-center gap-2 font-bold text-[#003d9b]">
                <span className="material-symbols-outlined text-[20px]">security</span>
                Đăng nhập Quyền Quản trị viên
              </div>
              <p className="text-[#434654]">
                Toàn quyền thêm nhân viên, quản lý danh mục trực, điền ngày OFF và xếp lịch tự động.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-xl font-bold text-[15px] transition-all shadow-md flex items-center justify-center gap-2 group"
          >
            Đăng nhập hệ thống
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </form>

        <p className="text-[12px] text-center text-[#737685] mt-6 font-medium">
          Dành cho Nhân viên xem lịch trực & Tải ảnh bằng chứng vệ sinh
        </p>
      </div>
    </div>
  );
};
