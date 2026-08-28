import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { Employee } from '../../types';
import { AvatarImage } from '../common/AvatarImage';

interface EmployeeScheduleModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeScheduleModal: React.FC<EmployeeScheduleModalProps> = ({ employee, onClose }) => {
  const {
    assignments,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    setSelectedAssignmentForDetail,
  } = useDuty();

  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'penalty'>('all');

  if (!employee) return null;

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

  // Filter duties assigned to this employee for selected month & year
  const empMonthAssignments = assignments.filter(a => {
    const [y, m] = a.date.split('-').map(Number);
    return a.assignedEmployeeId === employee.id && y === selectedYear && m === selectedMonth + 1;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const totalShifts = empMonthAssignments.length;
  const completedShifts = empMonthAssignments.filter(a => a.status === 'completed' && a.penaltyStatus !== 'penalty');
  const pendingShifts = empMonthAssignments.filter(a => a.status !== 'completed' && a.penaltyStatus !== 'penalty');
  const penalizedShifts = empMonthAssignments.filter(a => a.penaltyStatus === 'penalty');

  const completedShiftsCount = completedShifts.length;
  const pendingShiftsCount = pendingShifts.length;
  const penalizedShiftsCount = penalizedShifts.length;

  const totalFineAmount = penalizedShifts.reduce((sum, a) => sum + (a.fineAmount || 0), 0);
  const completionRate = totalShifts > 0 ? Math.round((completedShiftsCount / totalShifts) * 100) : 100;

  // Filtered list based on statusFilter
  const displayAssignments = empMonthAssignments.filter(duty => {
    if (statusFilter === 'completed') return duty.status === 'completed' && duty.penaltyStatus !== 'penalty';
    if (statusFilter === 'pending') return duty.status !== 'completed' && duty.penaltyStatus !== 'penalty';
    if (statusFilter === 'penalty') return duty.penaltyStatus === 'penalty';
    return true;
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#c3c6d6] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#003d9b] via-[#004bb8] to-[#0052cc] p-6 text-white flex justify-between items-start shrink-0 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white/40 shadow-md bg-white">
              <AvatarImage src={employee.avatar} name={employee.name} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[20px] font-black text-white">{employee.name}</h3>
                <span className="bg-white/20 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/30">
                  {employee.department}
                </span>
              </div>
              <p className="text-[13px] text-white/85 font-medium mt-0.5">
                {employee.role} • Lịch phân công trực nhật cá nhân
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Filter & Stat Bar */}
        <div className="bg-[#f9f9ff] px-6 py-4 border-b border-[#c3c6d6] space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003d9b] text-[20px]">calendar_month</span>
              <span className="text-[14px] font-extrabold text-[#041b3c]">Chọn thời gian:</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="bg-white border border-[#c3c6d6] text-[#041b3c] font-extrabold text-[13px] px-3 py-1.5 rounded-xl outline-none cursor-pointer shadow-2xs"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-[#c3c6d6] text-center">
              <p className="text-[10px] font-extrabold text-[#737685] uppercase">Tổng số ca</p>
              <p className="text-[18px] font-black text-[#041b3c]">{totalShifts}</p>
            </div>

            <div className="bg-[#82f9be]/20 p-3 rounded-xl border border-[#006c47]/30 text-center">
              <p className="text-[10px] font-extrabold text-[#006c47] uppercase">Hoàn thành</p>
              <p className="text-[18px] font-black text-[#006c47]">{completedShiftsCount} ({completionRate}%)</p>
            </div>

            <div className="bg-[#ffdad6]/40 p-3 rounded-xl border border-[#ba1a1a]/30 text-center">
              <p className="text-[10px] font-extrabold text-[#ba1a1a] uppercase">Bị vi phạm</p>
              <p className="text-[18px] font-black text-[#ba1a1a]">{penalizedShiftsCount}</p>
            </div>

            <div className="bg-[#fff9e6] p-3 rounded-xl border border-[#ffca81] text-center">
              <p className="text-[10px] font-extrabold text-[#5e3c00] uppercase">Tiền phạt</p>
              <p className="text-[16px] font-black text-[#ba1a1a]">-{totalFineAmount.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>

        {/* Duties Schedule List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Status Filter Tabs Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#c3c6d6] pb-3">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#003d9b] text-white shadow-2xs'
                  : 'bg-[#f1f3ff] text-[#434654] hover:bg-[#e0e8ff]'
              }`}
            >
              Tất cả ({totalShifts})
            </button>

            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-[#006c47] text-white shadow-2xs'
                  : 'bg-[#82f9be]/20 text-[#006c47] hover:bg-[#82f9be]/40 border border-[#006c47]/30'
              }`}
            >
              ✓ Đã hoàn thành ({completedShiftsCount})
            </button>

            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-[#003d9b] text-white shadow-2xs'
                  : 'bg-[#f1f3ff] text-[#003d9b] hover:bg-[#e0e8ff] border border-[#003d9b]/20'
              }`}
            >
              ⏳ Chưa hoàn thành ({pendingShiftsCount})
            </button>

            <button
              onClick={() => setStatusFilter('penalty')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'penalty'
                  ? 'bg-[#ba1a1a] text-white shadow-2xs'
                  : 'bg-[#ffdad6]/40 text-[#ba1a1a] hover:bg-[#ffdad6]/70 border border-[#ba1a1a]/30'
              }`}
            >
              ⚠️ Vi phạm ({penalizedShiftsCount})
            </button>
          </div>

          {displayAssignments.length === 0 ? (
            <div className="py-12 text-center text-[#737685] bg-[#f9f9ff] rounded-2xl border border-dashed border-[#c3c6d6] space-y-2">
              <span className="material-symbols-outlined text-[40px] text-[#737685]/40">search_off</span>
              <p className="font-bold text-[14px] text-[#041b3c]">Không tìm thấy ca trực nào phù hợp</p>
              <p className="text-[12px]">Không có ca trực nào khớp với bộ lọc trạng thái được chọn.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayAssignments.map(duty => {
                const isCompleted = duty.status === 'completed';
                const isPenalized = duty.penaltyStatus === 'penalty';

                return (
                  <div
                    key={duty.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      isPenalized
                        ? 'bg-[#ffdad6]/25 border-[#ba1a1a]/40'
                        : isCompleted
                        ? 'bg-[#82f9be]/10 border-[#006c47]/30'
                        : 'bg-white border-[#c3c6d6] hover:border-[#003d9b]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: duty.categoryColor || '#003d9b' }}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {duty.categoryIcon || 'task_alt'}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[15px] text-[#041b3c]">{duty.categoryName}</span>
                          <span className="text-[12px] font-bold text-[#737685] bg-[#f1f3ff] px-2 py-0.5 rounded">
                            📅 {duty.date}
                          </span>
                        </div>

                        {duty.adminNotes && (
                          <p className="text-[12px] text-[#434654] font-medium mt-0.5 italic">
                            Admin: "{duty.adminNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {isPenalized ? (
                        <span className="px-3 py-1 bg-[#ba1a1a] text-white text-[12px] font-extrabold rounded-lg flex items-center gap-1 shadow-2xs">
                          <span className="material-symbols-outlined text-[14px]">gavel</span>
                          Vi phạm (-{(duty.fineAmount || 50000).toLocaleString('vi-VN')}đ)
                        </span>
                      ) : isCompleted ? (
                        <span className="px-3 py-1 bg-[#006c47] text-white text-[12px] font-extrabold rounded-lg flex items-center gap-1 shadow-2xs">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Đã hoàn thành
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-[#f1f3ff] text-[#003d9b] text-[12px] font-bold rounded-lg border border-[#003d9b]/20">
                          Chưa nộp minh chứng
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAssignmentForDetail(duty);
                        }}
                        className="p-1.5 text-[#003d9b] hover:bg-[#e0e8ff] rounded-lg transition-colors"
                        title="Xem chi tiết ca trực"
                      >
                        <span className="material-symbols-outlined text-[20px]">info</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f9f9ff] px-6 py-3.5 border-t border-[#c3c6d6] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white text-[13px] font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
