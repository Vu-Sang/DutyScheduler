import React, { useState, useMemo } from 'react';
import { useDuty } from '../../context/DutyContext';
import { DutyAssignment } from '../../types';

export const UserPortalView: React.FC = () => {
  const {
    currentUser,
    assignments,
    categories,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    setProofModalOpen,
    setDutyForProof,
    setSelectedAssignmentForDetail,
  } = useDuty();

  const [activeViewMode, setActiveViewMode] = useState<'timetable' | 'list' | 'month'>('timetable');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const myEmployeeId = currentUser.employeeId || currentUser.id;

  // Real-time Dynamic Week Calculation (Monday to Sunday based on real today or selected month)
  const currentWeekDays = useMemo(() => {
    const now = new Date();
    
    // Determine target date: If selected month/year is current real month/year, use real today. Otherwise 1st of selected month.
    let targetDate = new Date();
    if (selectedYear !== now.getFullYear() || selectedMonth !== now.getMonth()) {
      targetDate = new Date(selectedYear, selectedMonth, 1);
    }

    // Get Monday of the target week (0 is Sunday)
    const dayOfWeek = targetDate.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() + distanceToMonday);

    const days = [];
    const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const dateNum = d.getDate();
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
      days.push({
        label: dayLabels[i],
        dateNumber: dateNum,
        dateFormatted: `${String(dateNum).padStart(2, '0')}/${String(m).padStart(2, '0')}`,
        dateStr,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [selectedYear, selectedMonth]);

  // My assignments for selected month
  const myMonthAssignments = useMemo(() => {
    return assignments.filter(a => {
      const [y, m] = a.date.split('-').map(Number);
      return a.assignedEmployeeId === myEmployeeId && y === selectedYear && m === selectedMonth + 1;
    });
  }, [assignments, myEmployeeId, selectedMonth, selectedYear]);

  // Penalized assignments list for employee
  const penalizedDuties = useMemo(() => {
    return myMonthAssignments.filter(a => a.penaltyStatus === 'penalty');
  }, [myMonthAssignments]);

  // Computed metrics: Employee completed shifts, penalized shifts, and remaining shifts
  const totalShiftsCount = myMonthAssignments.length;
  const completedShiftsCount = myMonthAssignments.filter(a => a.status === 'completed').length;
  const penalizedShiftsCount = penalizedDuties.length;
  const remainingShiftsCount = Math.max(0, totalShiftsCount - completedShiftsCount);
  const completionPercentage =
    totalShiftsCount > 0 ? Math.round((completedShiftsCount / totalShiftsCount) * 100) : 0;

  // Total fine money lost this month
  const totalFineAmount = penalizedDuties.reduce((sum, a) => sum + (a.fineAmount || 0), 0);

  const handleOpenProofModal = (duty: DutyAssignment) => {
    setDutyForProof(duty);
    setProofModalOpen(true);
  };

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

  return (
    <div id="user-portal-view" className="space-y-6 animate-in fade-in duration-200">
      {/* User Welcome & Stats Banner */}
      <div className="bg-gradient-to-r from-[#003d9b] via-[#004bb8] to-[#0052cc] rounded-2xl p-6 text-white shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 overflow-hidden border-2 border-white/40 shrink-0 shadow-xs">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-white">
                {currentUser.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-extrabold">Xin chào, {currentUser.name}! 👋</h2>
            <p className="text-[13px] text-white/80 font-medium mt-0.5">
              Thời khóa biểu trực nhật & báo cáo hiệu suất cá nhân Tháng {selectedMonth + 1}/{selectedYear}.
            </p>
          </div>
        </div>

        {/* Circular Performance Gauge & Financial Penalty Stats Widget */}
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex flex-wrap items-center gap-6 shadow-lg w-full lg:w-auto justify-between sm:justify-start">
          {/* 1. Circular SVG Progress Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/20"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#82f9be] transition-all duration-700 ease-out"
                strokeDasharray={`${completionPercentage}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[16px] font-black leading-none text-white">{completionPercentage}%</span>
              <span className="text-[9px] font-medium text-white/80 mt-0.5">Tiến độ</span>
            </div>
          </div>

          {/* 2. Shift Completion Counter Breakdown */}
          <div className="space-y-1 text-left border-r border-white/20 pr-6">
            <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Tiến độ ca trực</p>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
              <span>Đã trực:</span>
              <strong className="text-[#82f9be] text-[15px] font-extrabold">{completedShiftsCount}</strong>
              <span className="text-white/70">/{totalShiftsCount} ca</span>
              {penalizedShiftsCount > 0 && (
                <span className="text-[10px] text-[#ff8e8e] font-extrabold bg-white/10 px-1.5 py-0.5 rounded border border-[#ff8e8e]/30">
                  ({penalizedShiftsCount} ca bị phạt)
                </span>
              )}
            </div>
            <p className="text-[12px] font-semibold text-white/90">
              Cần trực nữa: <strong className="text-[#ffca81] text-[14px] font-extrabold">{remainingShiftsCount} ca</strong>
            </p>
          </div>

          {/* 3. Interactive Clickable Penalty Money Breakdown */}
          <div
            onClick={() => setShowPenaltyModal(true)}
            className="space-y-1 text-left cursor-pointer hover:bg-white/10 p-2 rounded-xl border border-transparent hover:border-white/30 transition-all group"
            title="Nhấp để xem danh sách ngày phạt & hình ảnh vi phạm"
          >
            <div className="flex items-center gap-1">
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Tiền phạt vi phạm</p>
              <span className="material-symbols-outlined text-[14px] text-white/70 group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </div>
            <p className="text-[18px] font-black text-[#ff8e8e] flex items-center gap-1 leading-none">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
              {totalFineAmount > 0 ? `-${totalFineAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
            </p>
            <p className="text-[10px] text-white/80 font-medium underline flex items-center gap-0.5">
              {totalFineAmount > 0 ? 'Xem ngày & ảnh vi phạm →' : 'Không bị phạt tiền ✓'}
            </p>
          </div>
        </div>
      </div>

      {/* CLICKABLE PENALTY BREAKDOWN MODAL */}
      {showPenaltyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#c3c6d6] bg-[#fff8f6] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[24px]">gavel</span>
                <div>
                  <h3 className="text-[18px] font-bold text-[#ba1a1a]">Chi Tiết Các Lần Vi Phạm Trực Nhật</h3>
                  <p className="text-[12px] text-[#737685] font-medium">Tháng {selectedMonth + 1}/{selectedYear}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPenaltyModal(false)}
                className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#ffdad6]/50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-[13px]">
              {penalizedDuties.length === 0 ? (
                <div className="text-center py-8 text-[#006c47] bg-[#82f9be]/15 rounded-xl border border-[#006c47]/30 space-y-2">
                  <span className="material-symbols-outlined text-[40px]">workspace_premium</span>
                  <p className="font-extrabold text-[15px]">Chúc mừng! Bạn không có ca vi phạm nào trong tháng này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-[#ba1a1a] text-white rounded-lg flex justify-between items-center font-bold text-[13px]">
                    <span>Tổng số ca vi phạm: {penalizedDuties.length} ca</span>
                    <span className="text-[15px] font-extrabold">Tổng phạt: -{totalFineAmount.toLocaleString('vi-VN')} đ</span>
                  </div>

                  {penalizedDuties.map((duty, idx) => (
                    <div key={duty.id} className="p-4 bg-[#ffdad6]/30 border border-[#ba1a1a]/40 rounded-xl space-y-3 shadow-2xs">
                      <div className="flex justify-between items-start border-b border-[#ba1a1a]/20 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[15px] text-[#ba1a1a]">Ca #{idx + 1}: {duty.categoryName}</span>
                          </div>
                          <p className="text-[12px] font-bold text-[#041b3c] mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-[#737685]">calendar_today</span>
                            Ngày phạt: {duty.date}
                          </p>
                        </div>

                        <span className="px-3 py-1 bg-[#ba1a1a] text-white rounded-md font-extrabold text-[12px] shadow-2xs">
                          Phạt -{(duty.fineAmount || 50000).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      {/* Dirty Proof Photo */}
                      {duty.penaltyImage ? (
                        <div className="space-y-1">
                          <p className="text-[12px] font-bold text-[#ba1a1a] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                            Hình ảnh khu vực chưa dọn / dơ (Bằng chứng Admin chụp):
                          </p>
                          <img
                            src={duty.penaltyImage}
                            alt="Bằng chứng vi phạm dơ"
                            className="w-full h-44 object-cover rounded-lg border border-[#ba1a1a]/40 shadow-xs"
                          />
                        </div>
                      ) : (
                        <div className="p-2.5 bg-white/80 rounded border border-[#ba1a1a]/20 text-[12px] text-[#ba1a1a] italic">
                          (Admin không đính kèm hình ảnh minh chứng dơ)
                        </div>
                      )}

                      {/* Admin Reason Note */}
                      {duty.adminNotes && (
                        <div className="p-3 bg-white rounded-lg border border-[#ba1a1a]/30 text-[13px] text-[#041b3c]">
                          <strong className="text-[#ba1a1a]">Nội dung lý do phạt của Admin: </strong> {duty.adminNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#c3c6d6] bg-[#f9f9ff] flex justify-end">
              <button
                onClick={() => setShowPenaltyModal(false)}
                className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold rounded-lg text-[13px] shadow-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation View Tabs */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#c3c6d6] pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveViewMode('timetable')}
            className={`px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeViewMode === 'timetable'
                ? 'bg-[#003d9b] text-white shadow-xs'
                : 'bg-white text-[#434654] border border-[#c3c6d6] hover:bg-[#f1f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Thời khóa biểu Tuần (Ma trận)
          </button>

          <button
            onClick={() => setActiveViewMode('list')}
            className={`px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeViewMode === 'list'
                ? 'bg-[#003d9b] text-white shadow-xs'
                : 'bg-white text-[#434654] border border-[#c3c6d6] hover:bg-[#f1f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            Danh sách của tôi ({myMonthAssignments.length})
          </button>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-white border border-[#c3c6d6] text-[#041b3c] font-bold text-[13px] px-3 py-2 rounded-md focus:border-[#003d9b] outline-none cursor-pointer"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: TIMETABLE MATRIX VIEW */}
      {activeViewMode === 'timetable' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[18px] font-bold text-[#041b3c] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003d9b]">table_view</span>
                Thời khóa biểu Trực nhật Tuần (2 người/ngày)
              </h3>
              <p className="text-[13px] text-[#737685]">
                Tất cả các ca của bạn được tô sáng khung xanh dương. Bấm vào nút "Nộp ảnh minh chứng" để nộp bằng chứng trực nhật.
              </p>
            </div>
          </div>

          {/* Timetable Grid Table */}
          <div className="bg-white rounded-xl border border-[#c3c6d6] shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#f1f3ff] border-b border-[#c3c6d6] text-[#041b3c] text-[13px] font-bold">
                  <th className="p-3.5 w-[200px] border-r border-[#c3c6d6] text-center">Nhiệm vụ trực nhật</th>
                  {currentWeekDays.map(day => (
                    <th
                      key={day.dateStr}
                      className={`p-3.5 text-center border-r border-[#c3c6d6] last:border-r-0 ${
                        day.isToday ? 'bg-[#003d9b] text-white' : ''
                      }`}
                    >
                      <div className="font-extrabold">{day.label}</div>
                      <div className={`text-[11px] font-normal ${day.isToday ? 'text-white/80' : 'text-[#737685]'}`}>
                        {day.dateFormatted}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6] text-[13px]">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-[#737685] italic">
                      Chưa có danh mục công việc nào
                    </td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-[#f9f9ff]">
                      {/* Task Name Column */}
                      <td className="p-3.5 border-r border-[#c3c6d6] bg-[#f9f9ff] font-bold text-[#041b3c]">
                        <div className="flex items-center gap-2">
                          <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ color: cat.color || '#003d9b' }}
                          >
                            {cat.icon || 'task_alt'}
                          </span>
                          <div>
                            <p className="leading-tight">{cat.name}</p>
                            {cat.description && (
                              <p className="text-[11px] text-[#737685] font-normal mt-0.5">{cat.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 7 Days Columns */}
                      {currentWeekDays.map(day => {
                        const dayAssignments = assignments.filter(
                          a => a.date === day.dateStr && a.categoryId === cat.id
                        );
                        const isMyShift = dayAssignments.some(a => a.assignedEmployeeId === myEmployeeId);

                        return (
                          <td
                            key={day.dateStr}
                            className={`p-2.5 border-r border-[#c3c6d6] last:border-r-0 align-top ${
                              isMyShift ? 'bg-[#003d9b]/10 font-semibold' : ''
                            }`}
                          >
                            {dayAssignments.length === 0 ? (
                              <span className="text-[11px] text-[#737685]/40 italic block text-center py-2">
                                Chưa xếp
                              </span>
                            ) : (
                              <div className="space-y-1.5">
                                {dayAssignments.map(duty => {
                                  const isMine = duty.assignedEmployeeId === myEmployeeId;
                                  const isPenalized = duty.penaltyStatus === 'penalty';
                                  return (
                                    <div
                                      key={duty.id}
                                      onClick={() => setSelectedAssignmentForDetail(duty)}
                                      className={`p-2 rounded-lg text-[12px] cursor-pointer transition-all border shadow-2xs ${
                                        isPenalized
                                          ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] font-bold ring-2 ring-[#ba1a1a]/30'
                                          : isMine
                                          ? 'bg-[#003d9b] text-white border-[#003d9b] font-bold ring-2 ring-[#003d9b]/30'
                                          : 'bg-white text-[#041b3c] border-[#c3c6d6] hover:bg-[#f1f3ff]'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="truncate flex-1">{duty.assignedEmployeeName}</span>
                                        {isPenalized ? (
                                          <span className="material-symbols-outlined text-[14px] text-white font-extrabold" title="Bị phạt vi phạm">
                                            warning
                                          </span>
                                        ) : duty.status === 'completed' ? (
                                          <span className="material-symbols-outlined text-[14px] text-[#82f9be]">
                                            check_circle
                                          </span>
                                        ) : null}
                                      </div>

                                      {isMine && duty.status !== 'completed' && !isPenalized && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenProofModal(duty);
                                          }}
                                          className="mt-1.5 w-full py-1 bg-white text-[#003d9b] rounded text-[10px] font-extrabold hover:bg-white/90 flex items-center justify-center gap-1 shadow-2xs"
                                        >
                                          <span className="material-symbols-outlined text-[12px]">add_a_photo</span>
                                          Nộp ảnh minh chứng
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: LIST VIEW */}
      {activeViewMode === 'list' && (
        <div className="bg-white rounded-xl border border-[#c3c6d6] p-6 shadow-xs space-y-4">
          <h3 className="text-[18px] font-bold text-[#041b3c]">
            Danh sách ca trực của tôi trong Tháng {selectedMonth + 1}/{selectedYear}
          </h3>

          {myMonthAssignments.length === 0 ? (
            <div className="p-8 text-center text-[#737685] bg-[#f9f9ff] rounded-lg border border-[#c3c6d6]">
              <span className="material-symbols-outlined text-[40px] text-[#737685]/50 mb-2">event_busy</span>
              <p className="font-semibold">Bạn không có ca trực nào trong tháng này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myMonthAssignments.map(duty => {
                const isPenalized = duty.penaltyStatus === 'penalty';
                return (
                  <div
                    key={duty.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                      isPenalized
                        ? 'bg-[#ffdad6]/35 border-[#ba1a1a]/40 hover:border-[#ba1a1a]'
                        : 'bg-[#f9f9ff] border-[#c3c6d6] hover:border-[#003d9b]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ color: isPenalized ? '#ba1a1a' : (duty.categoryColor || '#003d9b') }}
                          >
                            {duty.categoryIcon || 'task_alt'}
                          </span>
                          <h4 className="font-bold text-[15px] text-[#041b3c]">{duty.categoryName}</h4>
                        </div>
                        <p className="text-[12px] text-[#737685] mt-1 font-medium">📅 Ngày: {duty.date}</p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isPenalized
                            ? 'bg-[#ba1a1a] text-white'
                            : duty.status === 'completed'
                            ? 'bg-[#82f9be]/30 text-[#006c47]'
                            : 'bg-[#ffca81]/30 text-[#5e3c00]'
                        }`}
                      >
                        {isPenalized ? '⚠️ Bị phạt vi phạm' : duty.status === 'completed' ? 'Đã hoàn thành' : 'Chưa trực'}
                      </span>
                    </div>

                    {isPenalized && (
                      <div className="p-2.5 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg text-[#ba1a1a] text-[12px] font-bold flex items-center justify-between">
                        <span>Bị phạt vi phạm trực nhật</span>
                        <span>-{duty.fineAmount?.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}

                    {duty.proofImage ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#006c47]">✓ Đã nộp ảnh minh chứng thực tế</p>
                        <img src={duty.proofImage} alt="Minh chứng" className="w-full h-28 object-cover rounded-lg border border-[#c3c6d6]" />
                      </div>
                    ) : !isPenalized && (
                      <button
                        onClick={() => handleOpenProofModal(duty)}
                        className="w-full py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-lg text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                        Nộp ảnh minh chứng trực nhật
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
