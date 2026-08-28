import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { Employee } from '../../types';

import { EmployeeScheduleModal } from '../modals/EmployeeScheduleModal';

export const EmployeeManagementView: React.FC = () => {
  const {
    employees,
    assignments,
    searchQuery,
    setEmployeeModalOpen,
    setEditingEmployee,
    deleteEmployee,
    setActiveTab,
  } = useDuty();

  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedEmployeeForSchedule, setSelectedEmployeeForSchedule] = useState<Employee | null>(null);

  const departments = ['all', ...Array.from(new Set(employees.map(e => e.department)))];

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    if (!matchesDept) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q)
    );
  });

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmployeeModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xoá nhân viên ${name}?`)) {
      deleteEmployee(id);
    }
    setActiveMenuId(null);
  };

  const handleViewSchedule = (emp: Employee) => {
    setSelectedEmployeeForSchedule(emp);
    setActiveMenuId(null);
  };

  return (
    <div id="employee-management-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#003d9b] via-[#004bb8] to-[#0052cc] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px]">group</span>
          </div>
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-black tracking-tight text-white flex items-center gap-2">
              Quản Lý Nhân Viên
            </h2>
            <p className="text-[13px] text-white/85 font-medium mt-0.5">
              Quản lý danh sách nhân sự tham gia trực nhật và theo dõi hiệu suất làm việc.
            </p>
          </div>
        </div>

        <button
          id="add-employee-btn"
          onClick={() => {
            setEditingEmployee(null);
            setEmployeeModalOpen(true);
          }}
          className="bg-white text-[#003d9b] hover:bg-white/90 px-4 py-2.5 rounded-xl font-extrabold text-[13px] transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Thêm nhân viên mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#c3c6d6]/60">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-[12px] font-semibold text-[#737685] uppercase tracking-wider mr-1">
            Bộ phận:
          </span>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-[#003d9b] text-white'
                  : 'bg-[#e0e8ff] text-[#041b3c] hover:bg-[#d7e2ff]'
              }`}
            >
              {dept === 'all' ? 'Tất cả (' + employees.length + ')' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredEmployees.map(emp => {
          const isSecondary = emp.accentColor === 'secondary';

          // Calculate Duty Performance & Efficiency Rate
          const empAssignments = assignments.filter(a => a.assignedEmployeeId === emp.id);
          const totalAssigned = empAssignments.length;
          const completedAssigned = empAssignments.filter(a => a.status === 'completed').length;
          
          // 100% default if newly created without assignments yet
          const efficiencyPct = totalAssigned > 0 ? Math.round((completedAssigned / totalAssigned) * 100) : 100;
          
          const ringColor = efficiencyPct >= 80 ? '#006c47' : efficiencyPct >= 50 ? '#d97706' : '#ba1a1a';
          const circumference = 150.8; // 2 * PI * 24
          const dashoffset = circumference - (circumference * efficiencyPct) / 100;

          return (
            <div
              key={emp.id}
              id={`employee-card-${emp.id}`}
              onClick={() => setSelectedEmployeeForSchedule(emp)}
              className="bg-white rounded-xl border border-[#c3c6d6] p-5 flex flex-col hover:border-[#003d9b] transition-all hover:shadow-md relative overflow-hidden group min-h-[220px] cursor-pointer"
            >
              {/* Left Color Stripe */}
              <div
                className={`absolute top-0 left-0 w-1.5 h-full ${
                  isSecondary ? 'bg-[#006c47]' : 'bg-[#003d9b]'
                }`}
              />

              {/* Card Top: Avatar, Name, Role, 3-dots Menu */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {emp.avatar ? (
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#c3c6d6] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#d7e2ff] flex items-center justify-center text-[#041b3c] font-bold text-[16px] border border-[#c3c6d6] shrink-0">
                      {emp.initials || emp.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <h3 className="text-[16px] font-bold text-[#041b3c] truncate">{emp.name}</h3>
                    <span className="bg-[#e0e8ff] text-[#434654] text-[11px] font-semibold px-2 py-0.5 rounded mt-1 inline-block truncate max-w-[170px]">
                      {emp.role}
                    </span>
                  </div>
                </div>

                {/* 3-dots Menu Toggle */}
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                    className="text-[#737685] hover:text-[#003d9b] p-1 rounded-full hover:bg-[#f1f3ff] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>

                  {activeMenuId === emp.id && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-[#c3c6d6] py-1 z-30 animate-in fade-in">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="w-full px-3 py-1.5 text-left text-[13px] text-[#041b3c] hover:bg-[#f1f3ff] flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span> Sửa thông tin
                      </button>
                      <button
                        onClick={() => handleViewSchedule(emp)}
                        className="w-full px-3 py-1.5 text-left text-[13px] text-[#041b3c] hover:bg-[#f1f3ff] flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span> Xem lịch
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="w-full px-3 py-1.5 text-left text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span> Xoá nhân viên
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Mid: Circular Performance & Efficiency Gauge */}
              <div className="flex items-center gap-4 mt-auto border-t border-[#c3c6d6]/60 pt-4">
                {/* SVG Circular Progress Ring */}
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                    <circle
                      cx="30"
                      cy="30"
                      r="24"
                      stroke="#e0e8ff"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="24"
                      stroke={ringColor}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-[13px] text-[#041b3c]">
                    {efficiencyPct}%
                  </div>
                </div>

                <div>
                  <p className="text-[12px] font-bold text-[#041b3c] uppercase tracking-wide">
                    Năng suất hiệu quả trực
                  </p>
                  <p className="text-[12px] text-[#737685] font-semibold mt-0.5">
                    {completedAssigned} / {totalAssigned} ca đã hoàn thành
                  </p>
                </div>
              </div>

              {/* Card Bottom Hover Actions */}
              <div className="mt-4 pt-2 flex gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(emp)}
                  className="flex-1 bg-white border border-[#c3c6d6] text-[#434654] px-3 py-1.5 rounded text-[12px] font-semibold hover:border-[#003d9b] hover:text-[#003d9b] transition-colors flex justify-center items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span> Sửa
                </button>
                <button
                  onClick={() => handleViewSchedule(emp)}
                  className="flex-1 bg-[#e0e8ff] border border-transparent text-[#003d9b] px-3 py-1.5 rounded text-[12px] font-semibold hover:bg-[#d7e2ff] transition-colors flex justify-center items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span> Lịch
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Popup Modal: Employee Duty Schedule & Performance */}
      <EmployeeScheduleModal
        employee={selectedEmployeeForSchedule}
        onClose={() => setSelectedEmployeeForSchedule(null)}
      />
    </div>
  );
};
