import React, { useMemo, useState } from 'react';
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
    setActiveTab,
  } = useDuty();

  const isAdmin = currentUser.isManager || currentUser.roleType === 'admin';
  const [mobileSelectedDayStr, setMobileSelectedDayStr] = useState<string | null>(null);

  const realTodayStr = useMemo(() => {
    const realToday = new Date();
    return `${realToday.getFullYear()}-${String(realToday.getMonth() + 1).padStart(2, '0')}-${String(realToday.getDate()).padStart(2, '0')}`;
  }, []);

  const activeMobileDayStr = useMemo(() => {
    const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    if (mobileSelectedDayStr && mobileSelectedDayStr.startsWith(monthPrefix)) {
      return mobileSelectedDayStr;
    }
    const realToday = new Date();
    const isCurrentRealMonth = realToday.getFullYear() === selectedYear && realToday.getMonth() === selectedMonth;
    if (isCurrentRealMonth) return realTodayStr;
    return `${monthPrefix}-01`;
  }, [mobileSelectedDayStr, selectedYear, selectedMonth, realTodayStr]);

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
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#003d9b] via-[#004bb8] to-[#0052cc] rounded-2xl p-6 text-white shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px]">calendar_month</span>
          </div>
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-black tracking-tight text-white flex items-center gap-2">
              Lịch Trực Full Tháng
            </h2>
            <p className="text-[13px] text-white/85 font-medium mt-0.5">
              Quản lý ma trận phân công vệ sinh & lao động hàng ngày trong toàn bộ tháng.
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white/15 backdrop-blur-md p-1.5 rounded-xl border border-white/30 shrink-0 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-white/80 text-[20px] ml-1">filter_alt</span>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-white text-[#041b3c] font-extrabold text-[13px] px-3 py-1.5 rounded-lg outline-none cursor-pointer shadow-xs"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <select
              id="year-select"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-white text-[#041b3c] font-extrabold text-[13px] px-3 py-1.5 rounded-lg outline-none cursor-pointer shadow-xs"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveTab('my_schedule')}
            className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-[13px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-white/30"
            title="Chuyển sang thời khóa biểu 7 ngày theo tuần"
          >
            <span className="material-symbols-outlined text-[18px]">view_week</span>
            Xem lịch trực tuần
          </button>

          {isAdmin && (
            <>
              <button
                onClick={handleClearMonth}
                className="px-3 py-1.5 bg-[#ba1a1a] hover:bg-[#9c1212] text-white font-extrabold text-[12px] rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="Xóa tất cả ca trực của tháng này"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                Xóa lịch tháng
              </button>

              <button
                id="auto-schedule-btn"
                onClick={() => setAutoScheduleModalOpen(true)}
                className="px-3.5 py-1.5 bg-white text-[#003d9b] hover:bg-white/90 font-extrabold text-[13px] rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Tự động phân lịch
              </button>
            </>
          )}
        </div>
      </div>

      {/* MOBILE VIEW: Compact Month Calendar Grid + Selected Day Agenda Cards (Visible on mobile, hidden on md+) */}
      <div className="block md:hidden space-y-4">
        {/* Compact Mini Month Grid */}
        <div className="bg-white rounded-2xl border border-[#c3c6d6] shadow-xs p-3.5 space-y-2.5">
          <div className="flex justify-between items-center px-1 pb-2 border-b border-[#f0f2f5]">
            <h3 className="font-extrabold text-[15px] text-[#041b3c] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#003d9b] text-[20px]">calendar_month</span>
              Lịch Tháng {selectedMonth + 1}/{selectedYear}
            </h3>
            <span className="text-[11px] font-bold text-[#737685] bg-[#f1f3ff] px-2 py-0.5 rounded-full">
              {monthAssignments.length} ca trực
            </span>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center font-bold text-[12px] text-[#041b3c] py-1">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => (
              <div key={d} className={i === 6 ? 'text-[#ba1a1a]' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const isSelected = activeMobileDayStr === cell.dateStr;
              const hasDuties = cell.dayAssignments.length > 0;
              const hasMyShift = cell.dayAssignments.some(a => a.assignedEmployeeId === (currentUser.employeeId || currentUser.id));
              const hasPenalties = cell.dayAssignments.some(a => a.penaltyStatus === 'penalty');

              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  disabled={!cell.isCurrentMonth}
                  onClick={() => cell.isCurrentMonth && setMobileSelectedDayStr(cell.dateStr)}
                  className={`aspect-square p-1 rounded-xl flex flex-col items-center justify-between transition-all relative border cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'opacity-25 border-transparent cursor-default'
                      : isSelected
                      ? 'bg-[#003d9b] text-white border-[#003d9b] shadow-sm font-bold scale-102'
                      : cell.isToday
                      ? 'bg-[#fff9e6] text-[#041b3c] border-[#ffca81] font-bold'
                      : 'bg-[#f9f9ff] text-[#041b3c] border-[#e0e2ec] hover:border-[#003d9b]'
                  }`}
                >
                  {/* Today Tag */}
                  {cell.isToday && (
                    <span className={`text-[7px] font-black uppercase px-1 py-0.2 rounded-full leading-none ${
                      isSelected ? 'bg-[#ffca81] text-[#5e3c00]' : 'bg-[#003d9b] text-white'
                    }`}>
                      Nay
                    </span>
                  )}

                  {/* Date Number */}
                  <span className={`text-[12px] ${isSelected ? 'font-black text-white' : 'font-bold'}`}>
                    {cell.dateNumber}
                  </span>

                  {/* Dots / Indicators */}
                  {cell.isCurrentMonth && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {hasPenalties ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" title="Bị phạt" />
                      ) : hasMyShift ? (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#82f9be]' : 'bg-[#003d9b]'}`} title="Ca của bạn" />
                      ) : hasDuties ? (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : 'bg-[#737685]'}`} title="Có ca trực" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Cards */}
        {(() => {
          const selectedCell = calendarDays.find(c => c.dateStr === activeMobileDayStr);
          const dayAssignments = selectedCell ? selectedCell.dayAssignments : [];
          const [y, m, d] = activeMobileDayStr.split('-').map(Number);
          const formattedDate = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
          const isToday = activeMobileDayStr === realTodayStr;

          return (
            <div className="bg-white rounded-2xl p-4 border border-[#c3c6d6] shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b border-[#f0f2f5] pb-2.5">
                <div>
                  <h4 className="font-extrabold text-[15px] text-[#041b3c] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#003d9b] text-[20px]">event_note</span>
                    Lịch trực ngày {formattedDate}
                  </h4>
                  <p className="text-[12px] text-[#737685]">
                    {dayAssignments.length > 0 ? `${dayAssignments.length} ca trực được phân công` : 'Chưa phân công ca trực nào'}
                  </p>
                </div>
                {isToday && (
                  <span className="px-2.5 py-1 bg-[#ffca81]/30 text-[#5e3c00] rounded-full text-[11px] font-extrabold border border-[#ffca81]">
                    Hôm nay
                  </span>
                )}
              </div>

              {dayAssignments.length === 0 ? (
                <div className="py-6 text-center text-[#737685] bg-[#f9f9ff] rounded-xl border border-dashed border-[#c3c6d6] space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-[#737685]/40">event_busy</span>
                  <p className="text-[13px] font-medium">Chưa có ca trực nào vào ngày này</p>
                  {isAdmin && (
                    <button
                      onClick={() => handleAddDutyOnDate(activeMobileDayStr)}
                      className="px-3.5 py-1.5 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-lg text-[12px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      Phân ca trực ngày này
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {dayAssignments.map(duty => {
                    const isMine = duty.assignedEmployeeId === (currentUser.employeeId || currentUser.id);
                    const isPenalized = duty.penaltyStatus === 'penalty';
                    const isCompleted = duty.status === 'completed';

                    return (
                      <div
                        key={duty.id}
                        onClick={() => setSelectedAssignmentForDetail(duty)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden space-y-2 ${
                          isPenalized
                            ? 'bg-[#ffdad6]/35 border-[#ba1a1a]/40'
                            : isMine
                            ? 'bg-[#003d9b]/5 border-[#003d9b]/40 ring-1 ring-[#003d9b]/20 shadow-xs'
                            : 'bg-[#f9f9ff] border-[#c3c6d6]'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#003d9b]/10 text-[#003d9b] font-extrabold flex items-center justify-center text-[13px] border border-[#003d9b]/20">
                              {duty.assignedEmployeeName.slice(0, 1)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[14px] text-[#041b3c]">
                                {duty.assignedEmployeeName}
                              </span>
                              {isMine && (
                                <span className="bg-[#003d9b] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                  Bạn
                                </span>
                              )}
                            </div>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 ${
                            isPenalized
                              ? 'bg-[#ba1a1a] text-white'
                              : isCompleted
                              ? 'bg-[#82f9be]/30 text-[#006c47]'
                              : 'bg-[#ffca81]/30 text-[#5e3c00]'
                          }`}>
                            {isPenalized ? '⚠️ Phạt' : isCompleted ? '✓ Đã xong' : 'Chưa trực'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#e0e2ec]">
                          <div className="flex items-center gap-2">
                            <span
                              className="material-symbols-outlined text-[18px]"
                              style={{ color: duty.categoryColor || '#003d9b' }}
                            >
                              {duty.categoryIcon || 'task_alt'}
                            </span>
                            <span className="text-[13px] font-bold text-[#041b3c]">
                              {duty.categoryName}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#003d9b] font-bold hover:underline flex items-center gap-0.5">
                            Chi tiết <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {isAdmin && (
                    <button
                      onClick={() => handleAddDutyOnDate(activeMobileDayStr)}
                      className="w-full py-2 bg-[#f1f3ff] hover:bg-[#e0e8ff] text-[#003d9b] border border-[#003d9b]/30 rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Thêm ca trực khác cho ngày này
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Main Grid for Desktop (Hidden on mobile, visible on md+) */}
      <div className="hidden md:grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        {/* LEFT: Monthly Calendar Grid (4 columns) */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-[#c3c6d6] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[750px]">
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
                    className={`min-h-[150px] p-2 bg-white flex flex-col transition-colors relative group ${
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
                          className="opacity-0 group-hover:opacity-100 text-[#003d9b] hover:bg-[#e0e8ff] p-0.5 rounded transition-all cursor-pointer"
                          title="Thêm nhiệm vụ"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      )}
                    </div>

                    {/* Day Duty Assignments Badges */}
                    <div className="space-y-1.5 flex-1 mt-1">
                      {Object.values(
                        cell.dayAssignments.reduce((acc, duty) => {
                          if (!acc[duty.assignedEmployeeId]) {
                            acc[duty.assignedEmployeeId] = {
                              employeeName: duty.assignedEmployeeName,
                              duties: [],
                              isPenalized: false,
                              hasCompleted: false,
                              primaryColor: duty.categoryColor || '#003d9b'
                            };
                          }
                          acc[duty.assignedEmployeeId].duties.push(duty);
                          if (duty.penaltyStatus === 'penalty') acc[duty.assignedEmployeeId].isPenalized = true;
                          if (duty.status === 'completed') acc[duty.assignedEmployeeId].hasCompleted = true;
                          return acc;
                        }, {} as Record<string, any>)
                      ).map((group: any) => {
                        const { employeeName, duties, isPenalized, hasCompleted, primaryColor } = group;
                        const isMine = duties[0].assignedEmployeeId === (currentUser.employeeId || currentUser.id);
                        
                        return (
                          <div
                            key={duties[0].id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssignmentForDetail(duties[0]);
                            }}
                            className={`px-2 py-1.5 rounded-md text-[12px] font-bold flex flex-col justify-center cursor-pointer transition-all hover:shadow-xs border-l-[3px] border relative overflow-hidden ${
                              isPenalized
                                ? 'bg-[#ffdad6]/40 border-l-[#ba1a1a] border-[#ba1a1a]/30'
                                : isMine
                                ? 'bg-[#003d9b]/15 border-[#003d9b]/40 shadow-[0_2px_10px_rgba(0,61,155,0.15)] ring-1 ring-[#003d9b]/20'
                                : 'bg-white'
                            }`}
                            style={(!isPenalized && !isMine) ? {
                              borderLeftColor: primaryColor,
                              backgroundColor: `${primaryColor}12`,
                              borderColor: `${primaryColor}30`,
                            } : {
                              borderLeftColor: isPenalized ? '#ba1a1a' : '#003d9b'
                            }}
                          >
                            <div className="flex items-center justify-between relative z-10">
                              <span className={`font-extrabold text-[12px] truncate leading-tight flex flex-1 items-center gap-1 ${isPenalized ? 'text-[#ba1a1a]' : isMine ? 'text-[#003d9b]' : 'text-[#041b3c]'}`}>
                                {employeeName}
                                {isMine && <span className="bg-[#003d9b] text-white text-[9px] px-1 py-0.5 rounded uppercase tracking-wider leading-none">Bạn</span>}
                              </span>
                              {isPenalized ? (
                                <span className="material-symbols-outlined text-[14px] text-[#ba1a1a] shrink-0 ml-1 font-bold" title="Bị phạt vi phạm trực nhật">
                                  warning
                                </span>
                              ) : hasCompleted ? (
                                <span className="material-symbols-outlined text-[13px] text-[#006c47] shrink-0 ml-1" title="Đã nộp ảnh">
                                  check_circle
                                </span>
                              ) : null}
                            </div>
                            {duties.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {duties.map((d: any) => (
                                  <span 
                                    key={d.id} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAssignmentForDetail(d);
                                    }}
                                    className="material-symbols-outlined text-[14px] bg-white/60 rounded shadow-2xs hover:bg-white hover:scale-110 transition-all p-[1px]" 
                                    style={{ color: d.categoryColor || '#003d9b' }}
                                    title={d.categoryName}
                                  >
                                    {d.categoryIcon || 'task_alt'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
