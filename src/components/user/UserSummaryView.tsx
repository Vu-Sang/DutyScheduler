import React from 'react';
import { useDuty } from '../../context/DutyContext';

export const UserSummaryView: React.FC = () => {
  const {
    assignments,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    currentUser,
  } = useDuty();

  const myEmployeeId = currentUser.employeeId || currentUser.id;

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

  // My assignments for selected month
  const myMonthAssignments = assignments.filter(a => {
    const [y, m] = a.date.split('-').map(Number);
    return a.assignedEmployeeId === myEmployeeId && y === selectedYear && m === selectedMonth + 1;
  });

  const penalizedDuties = myMonthAssignments.filter(a => a.penaltyStatus === 'penalty');
  const totalShiftsCount = myMonthAssignments.length;
  const completedShiftsCount = myMonthAssignments.filter(a => a.status === 'completed').length;
  const penalizedShiftsCount = penalizedDuties.length;
  const completionPercentage = totalShiftsCount > 0 ? Math.round((completedShiftsCount / totalShiftsCount) * 100) : 0;
  const totalFineAmount = penalizedDuties.reduce((sum, a) => sum + (a.fineAmount || 0), 0);

  const perfScore = Math.max(
    0,
    Math.min(100, 100 - (penalizedShiftsCount * 15) - ((totalShiftsCount - completedShiftsCount) * 10))
  );

  let perfBadge = { text: '🏆 Xuất Sắc', color: 'bg-[#82f9be]/30 text-[#006c47] border-[#006c47]/40', desc: 'Thực hiện xuất sắc nhiệm vụ, nộp minh chứng đầy đủ và không có vi phạm nào!' };
  if (perfScore < 50) {
    perfBadge = { text: '⚠️ Cần Cải Thiện', color: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/40', desc: 'Cần chú ý nộp minh chứng đúng giờ và nâng cao chất lượng vệ sinh để tránh bị phạt vi phạm.' };
  } else if (perfScore < 75) {
    perfBadge = { text: '👌 Đạt Yêu Cầu', color: 'bg-[#ffca81]/30 text-[#5e3c00] border-[#ffca81]', desc: 'Hoàn thành khá tốt công việc được giao, hãy tiếp tục duy trì!' };
  } else if (perfScore < 90) {
    perfBadge = { text: '⭐ Hoàn Thành Tốt', color: 'bg-[#b2c5ff]/40 text-[#003d9b] border-[#003d9b]/40', desc: 'Làm việc năng nổ, chấp hành tốt nội quy phân công ca trực.' };
  }

  // Group duties by category
  const categoryStatsMap: Record<string, { name: string; icon: string; color: string; total: number; done: number; penalty: number }> = {};
  myMonthAssignments.forEach(duty => {
    const key = duty.categoryId || duty.categoryName;
    if (!categoryStatsMap[key]) {
      categoryStatsMap[key] = {
        name: duty.categoryName,
        icon: duty.categoryIcon || 'task_alt',
        color: duty.categoryColor || '#003d9b',
        total: 0,
        done: 0,
        penalty: 0,
      };
    }
    categoryStatsMap[key].total += 1;
    if (duty.status === 'completed') categoryStatsMap[key].done += 1;
    if (duty.penaltyStatus === 'penalty') categoryStatsMap[key].penalty += 1;
  });
  const categoryStats = Object.values(categoryStatsMap);

  // Feedback entries (Duties with adminNotes or penalty)
  const feedbackDuties = myMonthAssignments.filter(d => d.adminNotes || d.notes || d.penaltyStatus === 'penalty');

  return (
    <div id="user-summary-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#003d9b] via-[#004bb8] to-[#0052cc] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px]">analytics</span>
          </div>
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-black tracking-tight text-white flex items-center gap-2">
              Tổng Kết Số Liệu Cá Nhân
            </h2>
            <p className="text-[13px] text-white/85 font-medium mt-0.5">
              Báo cáo hiệu suất làm việc, phản hồi từ Admin và theo dõi tiền phạt vi phạm cá nhân.
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md p-1.5 rounded-xl border border-white/30 shrink-0 self-end sm:self-auto">
          <span className="material-symbols-outlined text-white/80 text-[20px] ml-2">calendar_month</span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-white text-[#041b3c] font-extrabold text-[13px] px-3.5 py-1.5 rounded-lg border-0 outline-none cursor-pointer shadow-xs"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Header Performance Status Banner */}
      <div className="bg-white rounded-2xl border border-[#c3c6d6] p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#f0f2f5] pb-5">
          <div>
            <h3 className="text-[18px] font-extrabold text-[#041b3c]">
              Báo Cáo Hiệu Suất Tháng {selectedMonth + 1}/{selectedYear}
            </h3>
            <p className="text-[12px] text-[#737685] font-medium mt-0.5">
              Phân tích tự động dựa trên số ca hoàn thành và vi phạm trực nhật.
            </p>
          </div>

          {/* Score & Badge */}
          <div className="flex items-center gap-3 bg-[#f9f9ff] px-4 py-2.5 rounded-xl border border-[#c3c6d6]">
            <div className="text-right">
              <p className="text-[11px] font-bold text-[#737685] uppercase tracking-wider">Chỉ số uy tín</p>
              <p className="text-[22px] font-black text-[#003d9b] leading-tight">{perfScore}<span className="text-[14px] text-[#737685]">/100</span></p>
            </div>
            <span className={`px-3 py-1.5 rounded-xl text-[13px] font-extrabold border ${perfBadge.color}`}>
              {perfBadge.text}
            </span>
          </div>
        </div>

        <p className="text-[13px] font-semibold text-[#041b3c] bg-[#f1f3ff] p-3.5 rounded-xl border border-[#003d9b]/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003d9b] text-[20px]">info</span>
          {perfBadge.desc}
        </p>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#c3c6d6] space-y-1">
            <p className="text-[11px] font-extrabold text-[#737685] uppercase">Tổng ca được giao</p>
            <p className="text-[24px] font-black text-[#041b3c]">{totalShiftsCount} <span className="text-[13px] text-[#737685] font-bold">ca</span></p>
            <p className="text-[11px] text-[#737685]">Lịch phân công tháng {selectedMonth + 1}</p>
          </div>

          <div className="p-4 bg-[#82f9be]/15 rounded-xl border border-[#006c47]/30 space-y-1">
            <p className="text-[11px] font-extrabold text-[#006c47] uppercase">Đã hoàn thành</p>
            <p className="text-[24px] font-black text-[#006c47]">{completedShiftsCount} <span className="text-[13px] font-bold">ca</span></p>
            <p className="text-[11px] font-extrabold text-[#006c47]">Đạt {completionPercentage}% khối lượng</p>
          </div>

          <div className="p-4 bg-[#ffdad6]/35 rounded-xl border border-[#ba1a1a]/30 space-y-1">
            <p className="text-[11px] font-extrabold text-[#ba1a1a] uppercase">Ca vi phạm trực nhật</p>
            <p className="text-[24px] font-black text-[#ba1a1a]">{penalizedShiftsCount} <span className="text-[13px] font-bold">ca</span></p>
            <p className="text-[11px] font-extrabold text-[#ba1a1a]">Bị lập biên bản phạt</p>
          </div>

          <div className="p-4 bg-[#fff9e6] rounded-xl border border-[#ffca81] space-y-1">
            <p className="text-[11px] font-extrabold text-[#5e3c00] uppercase">Tổng tiền phạt vi phạm</p>
            <p className="text-[24px] font-black text-[#ba1a1a]">{totalFineAmount.toLocaleString('vi-VN')} <span className="text-[13px] font-bold">đ</span></p>
            <p className="text-[11px] font-bold text-[#5e3c00]">Ghi nhận khấu trừ</p>
          </div>
        </div>
      </div>

      {/* Grid 2 Columns: Admin Feedback (Left) + Work Category Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Admin Feedback & Evaluation Comments */}
        <div className="bg-white rounded-2xl border border-[#c3c6d6] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f2f5] pb-3">
            <span className="material-symbols-outlined text-[#003d9b] text-[22px]">chat</span>
            <h4 className="font-extrabold text-[16px] text-[#041b3c]">
              Ghi Chú & Nhận Xét Từ Quản Trị Viên (Admin)
            </h4>
          </div>

          {feedbackDuties.length === 0 ? (
            <div className="py-10 text-center text-[#737685] bg-[#f9f9ff] rounded-xl border border-dashed border-[#c3c6d6] space-y-2">
              <span className="material-symbols-outlined text-[36px] text-[#737685]/40">rate_review</span>
              <p className="text-[13px] font-bold text-[#041b3c]">Chưa có ghi chú đặc biệt từ Admin</p>
              <p className="text-[12px]">Khi Admin duyệt ca trực hoặc lập biên bản phạt, phản hồi sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {feedbackDuties.map(duty => {
                const isPenalized = duty.penaltyStatus === 'penalty';
                return (
                  <div
                    key={duty.id}
                    className={`p-4 rounded-xl border space-y-2 ${
                      isPenalized
                        ? 'bg-[#ffdad6]/35 border-[#ba1a1a]/40'
                        : 'bg-[#f9f9ff] border-[#c3c6d6]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]" style={{ color: duty.categoryColor || '#003d9b' }}>
                          {duty.categoryIcon || 'task_alt'}
                        </span>
                        <span className="font-extrabold text-[14px] text-[#041b3c]">{duty.categoryName}</span>
                        <span className="text-[11px] font-bold text-[#737685]">({duty.date})</span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        isPenalized ? 'bg-[#ba1a1a] text-white' : 'bg-[#003d9b] text-white'
                      }`}>
                        {isPenalized ? 'Vi phạm' : 'Ghi chú'}
                      </span>
                    </div>

                    {duty.adminNotes && (
                      <div className="p-3 bg-white rounded-lg border border-[#e0e2ec] text-[13px] font-medium text-[#041b3c] space-y-1">
                        <p className="text-[11px] font-extrabold text-[#003d9b] uppercase flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                          Nhận xét Admin:
                        </p>
                        <p className="italic">"{duty.adminNotes}"</p>
                      </div>
                    )}

                    {duty.notes && !duty.adminNotes && (
                      <p className="text-[12px] text-[#434654] font-medium italic">Ghi chú: "{duty.notes}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Work Distribution by Duty Category */}
        <div className="bg-white rounded-2xl border border-[#c3c6d6] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f2f5] pb-3">
            <span className="material-symbols-outlined text-[#003d9b] text-[22px]">pie_chart</span>
            <h4 className="font-extrabold text-[16px] text-[#041b3c]">
              Phân Bổ Loại Công Việc Đã Thực Hiện
            </h4>
          </div>

          {categoryStats.length === 0 ? (
            <div className="py-10 text-center text-[#737685] bg-[#f9f9ff] rounded-xl border border-dashed border-[#c3c6d6]">
              <p className="text-[13px] font-bold text-[#041b3c]">Chưa có dữ liệu phân công</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryStats.map(item => {
                const pct = Math.round((item.done / item.total) * 100) || 0;
                return (
                  <div key={item.name} className="p-3.5 bg-[#f9f9ff] rounded-xl border border-[#c3c6d6] space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]" style={{ color: item.color }}>
                          {item.icon}
                        </span>
                        <span className="font-extrabold text-[14px] text-[#041b3c]">{item.name}</span>
                      </div>
                      <span className="text-[12px] font-extrabold text-[#003d9b]">
                        {item.done}/{item.total} ca ({pct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-[#e0e2ec] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>

                    {item.penalty > 0 && (
                      <p className="text-[11px] font-bold text-[#ba1a1a] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">warning</span>
                        {item.penalty} ca bị phạt vi phạm
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Financial Penalties Details Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#c3c6d6] p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#f0f2f5] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[24px]">gavel</span>
            <h4 className="font-extrabold text-[16px] text-[#041b3c]">
              Chi Tiết Tiền Phạt Vi Phạm Trực Nhật
            </h4>
          </div>
          <span className="text-[12px] font-extrabold text-[#ba1a1a] bg-[#ffdad6] px-3 py-1 rounded-full border border-[#ba1a1a]/30">
            Tổng phạt: -{totalFineAmount.toLocaleString('vi-VN')} đ
          </span>
        </div>

        {penalizedDuties.length === 0 ? (
          <div className="py-8 text-center text-[#006c47] bg-[#82f9be]/15 rounded-xl border border-[#006c47]/30 space-y-2">
            <span className="material-symbols-outlined text-[36px]">workspace_premium</span>
            <p className="font-extrabold text-[14px]">Chúc mừng! Bạn không bị trừ tiền phạt vi phạm nào trong tháng này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {penalizedDuties.map(duty => (
              <div key={duty.id} className="p-4 bg-[#ffdad6]/30 border border-[#ba1a1a]/40 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-extrabold text-[15px] text-[#ba1a1a]">{duty.categoryName}</p>
                    <p className="text-[12px] text-[#737685] font-bold">📅 Ngày: {duty.date}</p>
                  </div>
                  <span className="px-3 py-1 bg-[#ba1a1a] text-white rounded-lg font-black text-[13px]">
                    -{(duty.fineAmount || 50000).toLocaleString('vi-VN')} đ
                  </span>
                </div>

                {duty.adminNotes && (
                  <p className="text-[12px] text-[#ba1a1a] font-bold bg-white p-2 rounded border border-[#ba1a1a]/20">
                    Lý do phạt: "{duty.adminNotes}"
                  </p>
                )}

                {duty.penaltyImage && (
                  <div className="space-y-1">
                    <p className="text-[11px] font-extrabold text-[#ba1a1a]">Ảnh bằng chứng chưa sạch từ Admin:</p>
                    <img src={duty.penaltyImage} alt="Ảnh bẩn" className="w-full h-32 object-cover rounded-lg border border-[#ba1a1a]/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
