import React, { useState, useEffect } from 'react';
import { useDuty } from '../../context/DutyContext';

export const OffDayRegistrationView: React.FC = () => {
  const {
    employees,
    offDays,
    toggleEmployeeOffDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    currentUser,
  } = useDuty();

  const isUserRole = currentUser.roleType === 'user';
  const isAdmin = currentUser.isManager || currentUser.roleType === 'admin';
  const loggedInEmpId = currentUser.employeeId || currentUser.id;

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    if (isUserRole && loggedInEmpId) return loggedInEmpId;
    return employees[0]?.id || '';
  });

  // Track locked status per employee/month/year
  const [lockedMap, setLockedMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('duty_off_locked_schedules_v1');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('duty_off_locked_schedules_v1', JSON.stringify(lockedMap));
  }, [lockedMap]);

  useEffect(() => {
    if (isUserRole && loggedInEmpId) {
      setSelectedEmployeeId(loggedInEmpId);
    }
  }, [isUserRole, loggedInEmpId]);

  const lockKey = `${selectedEmployeeId}_${selectedYear}_${selectedMonth}`;
  const isScheduleLocked = Boolean(lockedMap[lockKey]);

  const months = [
    { value: 0, label: 'Tháng 1' },
    { value: 1, label: 'Tháng 2' },
    { value: 2, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 4, label: 'Tháng 5' },
    { value: 5, label: 'Tháng 6' },
    { value: 6, label: 'Tháng 7' },
    { value: 7, label: 'Tháng 8' },
    { value: 8, label: 'Tháng 9' },
    { value: 9, label: 'Tháng 10' },
    { value: 10, label: 'Tháng 11' },
    { value: 11, label: 'Tháng 12' },
  ];
  
  const currentRealYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentRealYear - 1 + i);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  // Days matrix for the selected month
  const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Helper to check if employee is off on dateStr
  const isOffDay = (empId: string, day: number) => {
    const dStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return offDays.some(o => o.employeeId === empId && o.date === dStr);
  };

  const handleToggleDay = (day: number) => {
    if (!selectedEmployee) return;

    if (isScheduleLocked) {
      alert(`Lịch đăng ký OFF Tháng ${selectedMonth + 1}/${selectedYear} của nhân viên ${selectedEmployee.name} ĐANG BỊ KHÓA.\n\nVui lòng bấm nút "Mở khóa (Admin)" ở góc trên trước khi điều chỉnh!`);
      return;
    }

    const dStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    toggleEmployeeOffDay(selectedEmployee.id, dStr, isUserRole ? `${currentUser.name} đăng ký xin nghỉ OFF` : 'Admin xếp lịch nghỉ');
  };

  const handleLockSchedule = () => {
    const empOffCount = daysArray.filter(day => isOffDay(selectedEmployee.id, day)).length;
    if (window.confirm(`Bạn có chắc chắn muốn XÁC NHẬN VÀ KHÓA LỊCH OFF (${empOffCount} ngày nghỉ) cho Tháng ${selectedMonth + 1}/${selectedYear}?\n\nSau khi khóa, lịch nghỉ này sẽ không thể tự ý thay đổi!`)) {
      setLockedMap(prev => ({ ...prev, [lockKey]: true }));
    }
  };

  const handleUnlockSchedule = () => {
    if (window.confirm(`Admin: Mở khóa lịch đăng ký OFF Tháng ${selectedMonth + 1}/${selectedYear} cho nhân viên ${selectedEmployee.name}?`)) {
      setLockedMap(prev => ({ ...prev, [lockKey]: false }));
    }
  };

  return (
    <div id="off-day-registration-view" className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003d9b] via-[#004bb8] to-[#0052cc] rounded-2xl p-6 text-white shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px]">event_busy</span>
          </div>
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-black tracking-tight text-white flex items-center gap-2">
              {isUserRole ? 'Đăng Ký Lịch Nghỉ (OFF)' : 'Quản Lý Lịch Nghỉ Nhân Viên (OFF)'}
            </h2>
            <p className="text-[13px] text-white/85 font-medium mt-0.5">
              {isUserRole
                ? 'Đánh dấu các ngày bạn muốn đăng ký nghỉ OFF. Thuật toán tự động né ngày OFF của bạn.'
                : 'Đánh dấu ngày nghỉ OFF cho nhân viên. Thuật toán tự động né xếp ca vào ngày nghỉ.'}
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white/15 backdrop-blur-md p-1.5 rounded-xl border border-white/30 shrink-0 self-stretch sm:self-auto justify-between sm:justify-end">
          {isAdmin && (
            <select
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              className="bg-white text-[#041b3c] font-extrabold text-[13px] px-3 py-1.5 rounded-lg outline-none cursor-pointer shadow-xs max-w-[160px] truncate"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1.5">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-white text-[#041b3c] font-extrabold text-[13px] px-3 py-1.5 rounded-lg outline-none cursor-pointer shadow-xs"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-white text-[#041b3c] font-extrabold text-[13px] px-3 py-1.5 rounded-lg outline-none cursor-pointer shadow-xs"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Employee Selector (Admin can pick anyone, Employee defaults to self) */}
        {!isUserRole && (
          <div className="lg:col-span-1 bg-white border border-[#c3c6d6] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-[16px] text-[#041b3c]">Chọn nhân viên</h3>

            {employees.length === 0 ? (
              <p className="text-[13px] text-[#737685] italic">Chưa có nhân viên nào</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {employees.map(emp => {
                  const isSelected = emp.id === selectedEmployeeId;
                  const empOffDays = daysArray.filter(day => isOffDay(emp.id, day));
                  const isEmpLocked = Boolean(lockedMap[`${emp.id}_${selectedYear}_${selectedMonth}`]);

                  return (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#003d9b] text-white border-[#003d9b] shadow-xs'
                          : 'bg-[#f9f9ff] text-[#041b3c] border-[#c3c6d6] hover:bg-[#e0e8ff]'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {emp.avatar ? (
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/40"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white text-[#003d9b]' : 'bg-[#d7e2ff] text-[#003d9b]'
                            }`}
                          >
                            {emp.initials || emp.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1">
                            <p className="font-bold text-[13px] truncate">{emp.name}</p>
                            {isEmpLocked && (
                              <span className="material-symbols-outlined text-[14px] text-[#006c47]" title="Đã khóa lịch">
                                lock
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-[#737685]'}`}>
                            {emp.role}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : empOffDays.length > 0
                            ? 'bg-[#ba1a1a]/15 text-[#ba1a1a]'
                            : 'bg-[#f1f3ff] text-[#737685]'
                        }`}
                      >
                        {empOffDays.length} ngày nghỉ
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Right / Full: Interactive Month Days Picker Matrix */}
        <div className={`${isUserRole ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-xs space-y-5`}>
          {selectedEmployee ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#c3c6d6] pb-4">
                <div className="flex items-center gap-3">
                  {selectedEmployee.avatar ? (
                    <img
                      src={selectedEmployee.avatar}
                      alt={selectedEmployee.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#c3c6d6]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#003d9b] text-white font-bold text-[16px] flex items-center justify-center">
                      {selectedEmployee.initials || selectedEmployee.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[18px] text-[#041b3c]">
                        Đăng ký nghỉ cho: {selectedEmployee.name}
                      </h3>
                      {isScheduleLocked && (
                        <span className="px-2.5 py-0.5 rounded bg-[#006c47] text-white font-bold text-[11px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">lock</span>
                          ĐÃ KHÓA LỊCH
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#737685]">
                      {isScheduleLocked
                        ? 'Lịch đăng ký OFF đã được xác nhận và khóa. Cần bấm "Mở khóa (Admin)" để điều chỉnh.'
                        : 'Nhấp vào số ngày bên dưới để Bật/Tắt đăng ký nghỉ OFF (Màu đỏ = Đã xin nghỉ).'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-[#ffdad6]/60 border border-[#ba1a1a]/30 text-[#ba1a1a] font-bold text-[13px] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">event_busy</span>
                    <span>
                      {daysArray.filter(day => isOffDay(selectedEmployee.id, day)).length} ngày OFF
                    </span>
                  </div>

                  {/* Lock / Confirm Schedule Button */}
                  {!isScheduleLocked ? (
                    <button
                      onClick={handleLockSchedule}
                      className="px-4 py-2 bg-[#006c47] hover:bg-[#005236] text-white font-bold text-[13px] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      Xác nhận & Khóa lịch OFF
                    </button>
                  ) : (
                    isAdmin && (
                      <button
                        onClick={handleUnlockSchedule}
                        className="px-3.5 py-2 border border-[#003d9b] bg-[#e0e8ff] hover:bg-[#c6d7ff] text-[#003d9b] font-bold text-[13px] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">lock_open</span>
                        Mở khóa (Admin)
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Locked Warning Banner */}
              {isScheduleLocked && (
                <div className="p-3.5 bg-[#82f9be]/20 border border-[#006c47]/30 text-[#006c47] rounded-lg font-bold text-[13px] flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    Lịch đăng ký OFF Tháng {selectedMonth + 1}/{selectedYear} đang bị KHÓA. {isAdmin ? 'Admin cần bấm nút "Mở khóa (Admin)" ở góc trên để chỉnh sửa.' : 'Bạn không thể thay đổi lịch nghỉ này nữa!'}
                  </div>
                </div>
              )}

              {/* Matrix of days */}
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2.5">
                {daysArray.map(day => {
                  const off = isOffDay(selectedEmployee.id, day);
                  const isBtnDisabled = isScheduleLocked;

                  return (
                    <button
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      disabled={isBtnDisabled}
                      className={`h-14 rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 border transition-all ${
                        isBtnDisabled ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        off
                          ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] shadow-xs'
                          : 'bg-[#f9f9ff] text-[#041b3c] border-[#c3c6d6] hover:bg-[#e0e8ff] hover:border-[#003d9b]'
                      }`}
                    >
                      <span className="text-[14px]">Ngày {day}</span>
                      <span className="text-[10px] font-normal opacity-90">
                        {off ? 'Nghỉ (OFF)' : 'Đi làm'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Legend & Note */}
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#737685] pt-2 border-t border-[#c3c6d6]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#ba1a1a] inline-block" />
                  <span className="font-semibold text-[#041b3c]">Đã đăng ký nghỉ OFF</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#f9f9ff] border border-[#c3c6d6] inline-block" />
                  <span>Sẵn sàng đi làm</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[14px] text-[#737685] italic text-center py-8">
              Vui lòng thêm nhân viên tại mục "Quản lý nhân viên" trước.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
