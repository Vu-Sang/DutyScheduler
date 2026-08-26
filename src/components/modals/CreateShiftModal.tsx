import React, { useState, useEffect } from 'react';
import { useDuty } from '../../context/DutyContext';

export const CreateShiftModal: React.FC = () => {
  const {
    createAssignmentModalOpen,
    setCreateAssignmentModalOpen,
    createAssignmentPreselectedDate,
    categories,
    employees,
    offDays,
    addAssignment,
  } = useDuty();

  const [date, setDate] = useState('2024-10-08');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (createAssignmentPreselectedDate) {
      setDate(createAssignmentPreselectedDate);
    }
  }, [createAssignmentPreselectedDate]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
    if (employees.length > 0 && !employeeId) {
      setEmployeeId(employees[0].id);
    }
  }, [categories, employees]);

  if (!createAssignmentModalOpen) return null;

  // Check if selected employee is OFF on selected date
  const isEmployeeOffOnDate = offDays.some(
    o => o.employeeId === employeeId && o.date === date && o.status === 'approved'
  );

  const selectedEmp = employees.find(e => e.id === employeeId) || employees[0];
  const selectedCat = categories.find(c => c.id === categoryId) || categories[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !selectedCat) return;

    if (isEmployeeOffOnDate) {
      if (!confirm(`Nhân viên ${selectedEmp.name} đang có lịch nghỉ OFF ngày ${date}. Bạn vẫn muốn phân công?`)) {
        return;
      }
    }

    addAssignment({
      date,
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      categoryIcon: selectedCat.icon,
      categoryColor: selectedCat.color,
      assignedEmployeeId: selectedEmp.id,
      assignedEmployeeName: selectedEmp.name,
      assignedEmployeeRole: selectedEmp.role,
      assignedEmployeeAvatar: selectedEmp.avatar,
      notes,
    });

    setCreateAssignmentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#c3c6d6] flex justify-between items-center bg-[#f1f3ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b]">assignment_add</span>
            <h3 className="text-[18px] font-bold text-[#041b3c]">Phân công Trực nhật mới</h3>
          </div>
          <button
            onClick={() => setCreateAssignmentModalOpen(false)}
            className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#d7e2ff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Date */}
          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Ngày trực nhật
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#c3c6d6] rounded-md text-[14px] text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none"
            />
          </div>

          {/* Duty Category */}
          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Hạng mục công việc trực nhật
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2.5 rounded border text-left transition-all flex items-center gap-2.5 ${
                    categoryId === cat.id
                      ? 'border-[#003d9b] bg-[#0052cc]/10 font-bold ring-1 ring-[#003d9b]'
                      : 'border-[#c3c6d6] text-[#434654] hover:bg-[#f1f3ff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color: cat.color }}>
                    {cat.icon || 'task_alt'}
                  </span>
                  <div>
                    <p className="text-[13px] text-[#041b3c] font-bold">{cat.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Employee */}
          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Nhân viên thực hiện
            </label>
            <select
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border border-[#c3c6d6] rounded-md text-[14px] text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none bg-white cursor-pointer"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.role} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          {/* Off day warning */}
          {isEmployeeOffOnDate && (
            <div className="p-3 bg-[#ba1a1a]/10 border border-[#ba1a1a]/40 rounded-md flex items-center gap-2 text-[#ba1a1a] text-[13px] font-semibold">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              Cảnh báo: Nhân viên {selectedEmp?.name} đã đăng ký nghỉ (OFF) vào ngày này!
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Ghi chú bổ sung
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="VD: Quét sạch khu vực sảnh trước 8h sáng..."
              className="w-full px-3 py-2 border border-[#c3c6d6] rounded-md text-[14px] text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#c3c6d6] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateAssignmentModalOpen(false)}
              className="px-4 py-2 border border-[#c3c6d6] rounded-md text-[13px] font-semibold text-[#434654] hover:bg-[#f1f3ff]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-md text-[13px] font-semibold shadow-xs"
            >
              Lưu phân công
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
