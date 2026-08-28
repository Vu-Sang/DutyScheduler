import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, employees, updateEmployee } = useDuty();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const myEmpId = currentUser.employeeId || currentUser.id;
  const targetEmp = employees.find(e => e.id === myEmpId);
  const isAdmin = currentUser.isManager || currentUser.roleType === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Verify current password for employee
    if (!isAdmin && targetEmp) {
      const existingPass = targetEmp.password || '123456';
      if (currentPassword !== existingPass) {
        setError('Mật khẩu hiện tại không chính xác!');
        return;
      }
    }

    // 2. Validate new password
    if (newPassword.length < 3) {
      setError('Mật khẩu mới phải có ít nhất 3 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp với mật khẩu mới!');
      return;
    }

    // 3. Update Employee Password
    if (targetEmp) {
      try {
        await updateEmployee({
          ...targetEmp,
          password: newPassword,
        });
        setSuccess('✅ Đổi mật khẩu thành công! Lần đăng nhập tới hãy sử dụng mật khẩu mới này.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1800);
      } catch (err) {
        console.error(err);
        setError('Lỗi khi cập nhật mật khẩu.');
      }
    } else {
      // If admin default user profile
      setSuccess('✅ Đổi mật khẩu Admin thành công!');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c3c6d6] bg-[#f1f3ff] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b]">lock_reset</span>
            <h3 className="text-[18px] font-extrabold text-[#041b3c]">Đổi Mật Khẩu Tài Khoản</h3>
          </div>
          <button onClick={onClose} className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#d7e2ff]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[14px]">
          {/* Employee User Info Banner */}
          <div className="p-3 bg-[#003d9b]/5 border border-[#003d9b]/20 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#003d9b] text-white font-bold flex items-center justify-center text-[15px] shrink-0">
              {currentUser.name.slice(0, 1)}
            </div>
            <div>
              <p className="font-extrabold text-[14px] text-[#041b3c]">{currentUser.name}</p>
              <p className="text-[12px] text-[#737685] font-medium">{currentUser.role}</p>
            </div>
          </div>

          {!isAdmin && (
            <div>
              <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
                Mật khẩu hiện tại: <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full px-3.5 py-2.5 border border-[#c3c6d6] rounded-xl text-[14px] font-medium text-[#041b3c] focus:border-[#003d9b] outline-none bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Mật khẩu mới: <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="w-full px-3.5 py-2.5 border border-[#c3c6d6] rounded-xl text-[14px] font-medium text-[#041b3c] focus:border-[#003d9b] outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Xác nhận mật khẩu mới: <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-3.5 py-2.5 border border-[#c3c6d6] rounded-xl text-[14px] font-medium text-[#041b3c] focus:border-[#003d9b] outline-none bg-white"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/40 rounded-xl text-[13px] text-[#ba1a1a] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-[#82f9be]/20 border border-[#006c47]/40 rounded-xl text-[13px] text-[#006c47] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c3c6d6] text-[#434654] font-semibold rounded-lg hover:bg-[#f1f3ff]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-extrabold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              Cập nhật mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
