import React, { useMemo } from 'react';
import { useDuty } from '../../context/DutyContext';
import { DutyAssignment } from '../../types';

export const MonthlyCalendarView: React.FC = () => {
  const {
    assignments,
    employees,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    setSelectedAssignmentForDetail,
    setCreateAssignmentModalOpen,
    setCreateAssignmentPreselectedDate,
    setAutoScheduleModalOpen,
    clearMonthAssignments,
    searchQuery,
    currentUser,
  } = useDuty();

  const isAdmin = currentUser.isManager || currentUser.roleType === 'admin';

  const months = [
    { value: 0, label: 'Tháng 1' },
    { value: 1, label: 'Tháng 2' },
    { value: 2, label: 'Tháng 3' },
    { value: 3, label: 'Tháng 4' },
    { value: 4, label: 'Tháng 5' },
    { value: 5, label: 'Tháng 6' },
    { value: 6, label: 'Tháng 7' },
    { value: 7, label: 'Tháng 8' },
    { value: 8, label: 'Tháng 9' },
    { value: 9, label: 'Tháng 10' },
    { value: 10, label: 'Tháng 11' },
    { value: 11, label: 'Tháng 12' },
  ];

  // Dynamic real year options
  const currentRealYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentRealYear - 1 + i);

  // Filter assignments for selected month and year
  const monthAssignments = useMemo(() => {
    return assignments.filter(a => {
      const [y, m] = a.date.split('-').map(Number);
      return y === selectedYear && m === selectedMonth + 1;
    });
  }, [assignments, selectedMonth, selectedYear]);

  // Calculate duty counts assigned per employee in this month
  const employeeShiftCounts = useMemo(() => {
    const countsMap = new Map<string, number>();
    monthAssignments.forEach(a => {
      countsMap.set(a.assignedEmployeeId, (countsMap.get(a.assignedEmployeeId) || 0) + 1);
    });

    return employees.map(emp => {
      const assignedCount = countsMap.get(emp.id) || 0;
      return {
        ...emp,
        assignedCount,
      };
    }).sort((a, b) => b.assignedCount - a.assignedCount);
  }, [employees, monthAssignments]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const prevMonthLastDay = new Date(selectedYear, selectedMonth, 0).getDate();

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

    const days: Array<{
      dateNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      dayAssignments: DutyAssignment[];
    }> = [];

    const realToday = new Date();

    // 1. Previous month trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const prevM = selectedMonth === 0 ? 12 : selectedMonth;
      const prevY = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const dStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      days.push({
        dateNumber: dNum,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: false,
        dayAssignments: [],
      });
    }

    // 2. Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isRealToday =
        selectedYear === realToday.getFullYear() &&
        selectedMonth === realToday.getMonth() &&
        day === realToday.getDate();

      const filteredAssignments = assignments.filter(a => {
        const matchesDate = a.date === dStr;
        if (!matchesDate) return false;
        if (searchQuery.trim() === '') return true;
        const q = searchQuery.toLowerCase();
        return (
          a.assignedEmployeeName.toLowerCase().includes(q) ||
          a.categoryName.toLowerCase().includes(q)
        );
      });

      days.push({
        dateNumber: day,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday: isRealToday,
        dayAssignments: filteredAssignments,
      });
    }

    // 3. Next month leading days to complete grid rows
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining + (days.length <= 28 ? 7 : 0); i++) {
      const nextM = selectedMonth === 11 ? 1 : selectedMonth + 2;
      const nextY = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      const dStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateNumber: i,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: false,
        dayAssignments: [],
      });
    }

    return days;
  }, [selectedYear, selectedMonth, assignments, searchQuery]);

  const handleAddDutyOnDate = (dateStr: string) => {
    if (!isAdmin) return;
    setCreateAssignmentPreselectedDate(dateStr);
    setCreateAssignmentModalOpen(true);
  };

  const handleClearMonth = () => {
    if (!isAdmin) return;
    if (monthAssignments.length === 0) {
      alert(`Tháng ${selectedMonth + 1}/${selectedYear} hiện chưa có ca trực nào để xóa.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn XÓA TOÀN BỘ ${monthAssignments.length} ca trực của Tháng ${selectedMonth + 1}/${selectedYear}?`)) {
      clearMonthAssignments(selectedMonth, selectedYear);
    }
  };

  return (
    <div id="monthly-calendar-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#041b3c] tracking-tight">
            Lịch trực tháng
          </h2>
          <p className="text-[14px] text-[#434654] mt-1 font-medium">
            Quản lý phân công vệ sinh & lao động hàng ngày (2 người/ngày: Quét nhà, lau nhà, đổ rác).
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <select
              id="month-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-[#c3c6d6] text-[#041b3c] font-medium text-[14px] px-3 py-2 rounded-md focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none cursor-pointer"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              id="year-select"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-[#c3c6d6] text-[#041b3c] font-medium text-[14px] px-3 py-2 rounded-md focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* ADMIN ONLY CONTROLS */}
          {isAdmin && (
            <>
              {/* Delete All Month Duties Button */}
              <button
                onClick={handleClearMonth}
                className="border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-3.5 py-2 rounded-md font-semibold text-[13px] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Xóa toàn bộ lịch trực trong tháng được chọn"
              >
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                Xóa lịch tháng
              </button>

              <button
                id="auto-schedule-btn"
                onClick={() => setAutoScheduleModalOpen(true)}
                className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-4 py-2 rounded-md font-semibold text-[14px] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Tự động phân lịch
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Calendar Left (3 Cols) + Employee Summary Right (1 Col) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* LEFT: Monthly Calendar Grid (3 columns) */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-[#c3c6d6] shadow-xs overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-[#c3c6d6] bg-[#f1f3ff] text-center font-bold text-[13px] text-[#041b3c]">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((dayName, idx) => (
              <div
                key={dayName}
                className={`py-3 border-r border-[#c3c6d6] last:border-r-0 ${
                  idx === 6 ? 'text-[#ba1a1a]' : ''
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#c3c6d6] bg-[#c3c6d6]">
            {calendarDays.map((cell, idx) => (
              <div
                key={`${cell.dateStr}-${idx}`}
                onClick={() => cell.isCurrentMonth && isAdmin && handleAddDutyOnDate(cell.dateStr)}
                className={`min-h-[125px] p-2 bg-white flex flex-col justify-between transition-colors relative group ${
                  !cell.isCurrentMonth ? 'bg-[#f9f9ff]/40 text-[#737685]/50' : isAdmin ? 'hover:bg-[#f1f3ff]/60 cursor-pointer' : ''
                }`}
              >
                {/* Day Header */}
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-[13px] font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      cell.isToday
                        ? 'bg-[#003d9b] text-white shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-[#041b3c]'
                        : 'text-[#737685]/50'
                    }`}
                  >
                    {cell.dateNumber}
                  </span>

                  {cell.isCurrentMonth && isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddDutyOnDate(cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[#003d9b] hover:bg-[#e0e8ff] p-0.5 rounded transition-all"
                      title="Thêm nhiệm vụ"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  )}
                </div>

                {/* Day Duty Assignments Badges - RED PENALTY ICON IF PENALIZED */}
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[95px] no-scrollbar">
                  {cell.dayAssignments.map(duty => {
                    const isPenalized = duty.penaltyStatus === 'penalty';
                    return (
                      <div
                        key={duty.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssignmentForDetail(duty);
                        }}
                        className={`px-2 py-1.5 rounded-md text-[12px] font-bold flex items-center justify-between cursor-pointer transition-all hover:shadow-xs border-l-3 ${
                          isPenalized
                            ? 'bg-[#ffdad6]/40 border-l-[#ba1a1a] border-[#ba1a1a]/30'
                            : 'bg-white'
                        }`}
                        style={{
                          borderLeftColor: isPenalized ? '#ba1a1a' : (duty.categoryColor || '#003d9b'),
                          backgroundColor: isPenalized ? '#ffdad6]/50' : `${duty.categoryColor || '#003d9b'}12`,
                          borderColor: isPenalized ? '#ba1a1a]/40' : `${duty.categoryColor || '#003d9b'}30`,
                        }}
                      >
                        {/* Prominent Employee Name with Maximum Width */}
                        <span className={`font-bold text-[12px] truncate leading-tight flex-1 ${isPenalized ? 'text-[#ba1a1a]' : 'text-[#041b3c]'}`}>
                          {duty.assignedEmployeeName}
                        </span>

                        {isPenalized ? (
                          <span className="material-symbols-outlined text-[14px] text-[#ba1a1a] shrink-0 ml-1 font-bold" title="Bị phạt vi phạm trực nhật">
                            warning
                          </span>
                        ) : duty.status === 'completed' ? (
                          <span className="material-symbols-outlined text-[13px] text-[#006c47] shrink-0 ml-1" title="Đã nộp ảnh">
                            check_circle
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Employee Shift Count Summary Card (1 column) */}
        <div className="xl:col-span-1 bg-white rounded-xl border border-[#c3c6d6] p-5 shadow-xs space-y-4">
          <div className="border-b border-[#c3c6d6] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003d9b]">badge</span>
              <h3 className="font-bold text-[16px] text-[#041b3c]">Số ca làm đã giao</h3>
            </div>
            <span className="text-[11px] font-bold text-[#737685] bg-[#f1f3ff] px-2 py-0.5 rounded">
              Tháng {selectedMonth + 1}/{selectedYear}
            </span>
          </div>

          {employeeShiftCounts.length === 0 ? (
            <p className="text-[13px] text-[#737685] italic text-center py-4">Chưa có nhân viên trong hệ thống</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {employeeShiftCounts.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3 bg-[#f9f9ff] rounded-lg border border-[#c3c6d6]/60 flex items-center justify-between hover:border-[#003d9b] transition-all"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {emp.avatar ? (
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#c3c6d6] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#d7e2ff] text-[#003d9b] font-bold text-[12px] flex items-center justify-center shrink-0">
                        {emp.initials || emp.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-[13px] font-bold text-[#041b3c] truncate">{emp.name}</p>
                      <p className="text-[11px] text-[#737685] truncate">{emp.role}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 bg-[#003d9b] text-white rounded-full font-bold text-[12px] inline-block shadow-2xs">
                      {emp.assignedCount} ca
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
