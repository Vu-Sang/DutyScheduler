import React, { useState, useMemo } from 'react';
import { useDuty } from '../../context/DutyContext';
import { Employee } from '../../types';
import { AvatarImage } from '../common/AvatarImage';
import { EmployeeScheduleModal } from '../modals/EmployeeScheduleModal';

export const DashboardView: React.FC = () => {
  const {
    assignments,
    categories,
    employees,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    setSelectedAssignmentForDetail,
  } = useDuty();

  const [selectedEmployeeForSchedule, setSelectedEmployeeForSchedule] = useState<Employee | null>(null);

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

  const currentRealYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentRealYear - 1 + i);

  // Filter assignments for selected month & year
  const monthAssignments = useMemo(() => {
    return assignments.filter(a => {
      const [y, m] = a.date.split('-').map(Number);
      return y === selectedYear && m === selectedMonth + 1;
    });
  }, [assignments, selectedMonth, selectedYear]);

  // Overall Monthly Metrics
  const totalMonthShifts = monthAssignments.length;
  const completedMonthShifts = monthAssignments.filter(a => a.status === 'completed').length;
  const penalizedMonthShifts = monthAssignments.filter(a => a.penaltyStatus === 'penalty');
  const totalFineCollected = penalizedMonthShifts.reduce((sum, a) => sum + (a.fineAmount || 0), 0);
  const overallCompletionRate = totalMonthShifts > 0 ? Math.round((completedMonthShifts / totalMonthShifts) * 100) : 0;

  // Employee Performance & Penalty Stats List
  const employeePerformanceList = useMemo(() => {
    return employees.map(emp => {
      const empDuties = monthAssignments.filter(a => a.assignedEmployeeId === emp.id);
      const totalAssigned = empDuties.length;
      const completed = empDuties.filter(a => a.status === 'completed').length;
      const penalized = empDuties.filter(a => a.penaltyStatus === 'penalty');
      const totalFine = penalized.reduce((sum, a) => sum + (a.fineAmount || 0), 0);
      const rate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 100;

      return {
        ...emp,
        totalAssigned,
        completed,
        penalizedCount: penalized.length,
        totalFine,
        rate,
      };
    }).sort((a, b) => b.totalFine - a.totalFine || a.rate - b.rate);
  }, [employees, monthAssignments]);

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003d9b] via-[#004bb8] to-[#0052cc] rounded-2xl p-6 text-white shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px]">dashboard</span>
          </div>
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-black tracking-tight text-white flex items-center gap-2">
              Bảng Điều Khiển & Phạt Vi Phạm
            </h2>
            <p className="text-[13px] text-white/85 font-medium mt-0.5">
              Thống kê tổng quan hiệu suất trực nhật toàn cơ quan, tỷ lệ hoàn thành và tổng tiền phạt.
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md p-1.5 rounded-xl border border-white/30 shrink-0 self-end sm:self-auto">
          <span className="material-symbols-outlined text-white/80 text-[20px] ml-1">calendar_month</span>
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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Total Assigned */}
        <div className="bg-white p-5 rounded-xl border border-[#c3c6d6] shadow-xs flex flex-col justify-between hover:border-[#003d9b] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[12px] font-bold text-[#737685] uppercase tracking-wider">
              Tổng ca trực đã giao
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b]">
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold text-[#041b3c]">{totalMonthShifts}</span>
            <span className="text-[12px] font-semibold text-[#737685]">ca trong tháng</span>
          </div>
        </div>

        {/* KPI 2: Overall Completion Rate */}
        <div className="bg-white p-5 rounded-xl border border-[#c3c6d6] shadow-xs flex flex-col justify-between hover:border-[#006c47] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[12px] font-bold text-[#737685] uppercase tracking-wider">
              Tỉ lệ hoàn thành chung
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#82f9be]/30 flex items-center justify-center text-[#006c47]">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold text-[#006c47]">{overallCompletionRate}%</span>
            <span className="text-[12px] font-semibold text-[#737685]">({completedMonthShifts}/{totalMonthShifts} ca)</span>
          </div>
        </div>

        {/* KPI 3: Total Penalty Money Collected */}
        <div className="bg-gradient-to-br from-[#fff8f6] to-[#ffdad6]/40 p-5 rounded-xl border border-[#ba1a1a]/40 shadow-xs flex flex-col justify-between hover:border-[#ba1a1a] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[12px] font-bold text-[#ba1a1a] uppercase tracking-wider">
              Tổng tiền phạt vi phạm
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#ba1a1a] text-white flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-black text-[#ba1a1a]">
              -{totalFineCollected.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* KPI 4: Penalized Shifts Count */}
        <div className="bg-white p-5 rounded-xl border border-[#c3c6d6] shadow-xs flex flex-col justify-between hover:border-[#ba1a1a] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[12px] font-bold text-[#737685] uppercase tracking-wider">
              Số ca bị phạt dơ / bỏ trực
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#ba1a1a]/10 flex items-center justify-center text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[22px]">gavel</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold text-[#ba1a1a]">{penalizedMonthShifts.length}</span>
            <span className="text-[12px] font-semibold text-[#737685]">ca vi phạm</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table 1: Employee Performance & Penalty Ranking Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#c3c6d6] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-[#c3c6d6] bg-[#f1f3ff] flex justify-between items-center">
            <div>
              <h3 className="text-[17px] font-bold text-[#041b3c] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003d9b]">leaderboard</span>
                Bảng Thống Kê Hiệu Suất & Phạt Tiền Theo Nhân Viên
              </h3>
              <p className="text-[12px] text-[#737685] font-medium">Tháng {selectedMonth + 1}/{selectedYear}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f9f9ff] border-b border-[#c3c6d6] text-[#041b3c] font-bold">
                  <th className="p-3.5">Nhân viên</th>
                  <th className="p-3.5 text-center">Ca giao</th>
                  <th className="p-3.5 text-center">Đã trực</th>
                  <th className="p-3.5 text-center">Hiệu suất</th>
                  <th className="p-3.5 text-center">Ca vi phạm</th>
                  <th className="p-3.5 text-right">Tổng phạt (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]">
                {employeePerformanceList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[#737685] italic">
                      Chưa có dữ liệu nhân viên
                    </td>
                  </tr>
                ) : (
                  employeePerformanceList.map(emp => (
                    <tr
                      key={emp.id}
                      onClick={() => {
                        const fullEmpObj = employees.find(e => e.id === emp.id);
                        if (fullEmpObj) setSelectedEmployeeForSchedule(fullEmpObj);
                      }}
                      className="hover:bg-[#e0e8ff]/70 transition-colors cursor-pointer"
                      title="Bấm để xem lịch trực & chi tiết cá nhân"
                    >
                      {/* Name & Avatar */}
                      <td className="p-3.5 font-bold text-[#041b3c]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#c3c6d6]">
                            <AvatarImage src={emp.avatar} name={emp.name} />
                          </div>
                          <div>
                            <p className="leading-tight">{emp.name}</p>
                            <p className="text-[11px] text-[#737685] font-normal">{emp.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Total Assigned */}
                      <td className="p-3.5 text-center font-bold text-[#041b3c]">{emp.totalAssigned} ca</td>

                      {/* Completed */}
                      <td className="p-3.5 text-center font-extrabold text-[#006c47]">{emp.completed} ca</td>

                      {/* Performance Bar */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 bg-[#c3c6d6]/40 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#006c47] h-full rounded-full"
                              style={{ width: `${emp.rate}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-[12px] text-[#006c47]">{emp.rate}%</span>
                        </div>
                      </td>

                      {/* Penalized Count */}
                      <td className="p-3.5 text-center">
                        {emp.penalizedCount > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#ba1a1a]/15 text-[#ba1a1a] font-extrabold text-[11px]">
                            ⚠️ {emp.penalizedCount} ca
                          </span>
                        ) : (
                          <span className="text-[#006c47] text-[11px] font-semibold">0</span>
                        )}
                      </td>

                      {/* Total Fine Amount */}
                      <td className="p-3.5 text-right font-black text-[14px]">
                        {emp.totalFine > 0 ? (
                          <span className="text-[#ba1a1a]">-{emp.totalFine.toLocaleString('vi-VN')} đ</span>
                        ) : (
                          <span className="text-[#737685] font-semibold">0 đ</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Penalty Logs List with Image Proof Thumbnails (1 Column) */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#c3c6d6] shadow-xs p-5 space-y-4 flex flex-col">
          <div className="border-b border-[#c3c6d6] pb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ba1a1a]">gavel</span>
              <h3 className="font-bold text-[16px] text-[#ba1a1a]">Nhật Ký Phạt Vi Phạm</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#ba1a1a] text-white font-extrabold text-[11px]">
              {penalizedMonthShifts.length} ca
            </span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {penalizedMonthShifts.length === 0 ? (
              <div className="text-center py-8 text-[#006c47] bg-[#82f9be]/15 rounded-lg border border-[#006c47]/30 space-y-1">
                <span className="material-symbols-outlined text-[32px]">verified_user</span>
                <p className="font-bold text-[13px]">Không có ca vi phạm nào trong tháng này.</p>
              </div>
            ) : (
              penalizedMonthShifts.map(duty => (
                <div
                  key={duty.id}
                  onClick={() => setSelectedAssignmentForDetail(duty)}
                  className="p-3.5 rounded-xl border border-[#ba1a1a]/40 bg-[#ffdad6]/25 hover:bg-[#ffdad6]/40 transition-all cursor-pointer space-y-2.5 shadow-2xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[14px] text-[#041b3c]">{duty.assignedEmployeeName}</p>
                      <p className="text-[11px] text-[#737685] font-medium">📅 Ngày: {duty.date} • {duty.categoryName}</p>
                    </div>

                    <span className="px-2.5 py-1 bg-[#ba1a1a] text-white font-extrabold text-[11px] rounded shadow-2xs">
                      Phạt -{(duty.fineAmount || 50000).toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  {/* Dirty Proof Image Thumbnail */}
                  {duty.penaltyImage ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#ba1a1a]">Bằng chứng dơ Admin chụp:</p>
                      <img
                        src={duty.penaltyImage}
                        alt="Ảnh vi phạm dơ"
                        className="w-full h-28 object-cover rounded-lg border border-[#ba1a1a]/30"
                      />
                    </div>
                  ) : (
                    duty.adminNotes && (
                      <p className="text-[11px] text-[#ba1a1a] italic bg-white/80 p-2 rounded border border-[#ba1a1a]/20">
                        "{duty.adminNotes}"
                      </p>
                    )
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Popup Modal: Employee Duty Schedule & Performance */}
      <EmployeeScheduleModal
        employee={selectedEmployeeForSchedule}
        onClose={() => setSelectedEmployeeForSchedule(null)}
      />
    </div>
  );
};
