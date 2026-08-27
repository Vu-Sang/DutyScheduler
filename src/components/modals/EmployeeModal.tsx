import React, { useState, useEffect } from 'react';
import { useDuty } from '../../context/DutyContext';

export const EmployeeModal: React.FC = () => {
  const {
    employeeModalOpen,
    setEmployeeModalOpen,
    editingEmployee,
    addEmployee,
    updateEmployee,
  } = useDuty();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (editingEmployee) {
      setName(editingEmployee.name);
      setUsername(editingEmployee.username || '');
      setPassword(editingEmployee.password || '');
    } else {
      setName('');
      setUsername('');
      setPassword('');
    }
  }, [editingEmployee, employeeModalOpen]);

  if (!employeeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingEmployee) {
      updateEmployee({
        ...editingEmployee,
        name: name.trim(),
        username: username.trim(),
        password: password.trim(),
      });
    } else {
      addEmployee({
        name: name.trim(),
        role: 'Nhân viên trực nhật',
        department: 'Bộ phận Lao động',
        email: '',
        phone: '',
        initials: name.trim().split(' ').map(n => n[0]).join('').slice(-2).toUpperCase(),
        accentColor: 'primary',
        shiftsCompleted: 0,
        offDaysUsed: 0,
        maxOffDaysPerMonth: 4,
        skills: ['Quét nhà', 'Lau nhà', 'Đổ rác'],
        isActive: true,
        username: username.trim(),
        password: password.trim(),
      });
    }

    setName('');
    setUsername('');
    setPassword('');
    setEmployeeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c3c6d6] flex justify-between items-center bg-[#f1f3ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b]">
              {editingEmployee ? 'edit' : 'person_add'}
            </span>
            <h3 className="text-[18px] font-bold text-[#041b3c]">
              {editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            </h3>
          </div>
          <button
            onClick={() => setEmployeeModalOpen(false)}
            className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#d7e2ff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[14px]">
          <div>
            <label className="block text-[12px] font-bold text-[#041b3c] uppercase tracking-wider mb-1.5">
              Họ và tên nhân viên *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full px-3 py-2 border border-[#c3c6d6] rounded-lg text-[15px] font-semibold text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-[#041b3c] uppercase tracking-wider mb-1.5">
                Tài khoản đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="VD: nguyenvana"
                className="w-full px-3 py-2 border border-[#c3c6d6] rounded-lg text-[14px] text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#041b3c] uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full px-3 py-2 border border-[#c3c6d6] rounded-lg text-[14px] text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none transition-all"
              />
            </div>
          </div>
          
          <p className="text-[12px] text-[#737685] mt-1.5 italic">
            Tài khoản và mật khẩu dùng để nhân viên tự đăng nhập xem lịch trực hoặc quét khuôn mặt.
          </p>

          {/* Footer */}
          <div className="pt-4 mt-2 border-t border-[#c3c6d6] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEmployeeModalOpen(false)}
              className="px-4 py-2 border border-[#c3c6d6] rounded-lg text-[13px] font-semibold text-[#434654] hover:bg-[#f1f3ff]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-lg text-[14px] font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              {editingEmployee ? 'Lưu thay đổi' : 'Thêm nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
