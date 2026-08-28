import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { DutyAssignment } from '../../types';

export const ShiftDetailModal: React.FC = () => {
  const {
    selectedAssignmentForDetail,
    setSelectedAssignmentForDetail,
    updateAssignment,
    deleteAssignment,
    employees,
    currentUser,
    setProofModalOpen,
    setDutyForProof,
    assignments,
    categories,
  } = useDuty();

  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDate, setEditDate] = useState('');

  // Admin Penalty states
  const [isAdminAnnotating, setIsAdminAnnotating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [fineAmount, setFineAmount] = useState<string>('');
  const [penaltyImage, setPenaltyImage] = useState<string>('');

  if (!selectedAssignmentForDetail) return null;

  const duty = selectedAssignmentForDetail;
  const isAdmin = currentUser.isManager || currentUser.roleType === 'admin';
  const myEmployeeId = currentUser.employeeId || currentUser.id;
  const isMyShift = duty.assignedEmployeeId === myEmployeeId;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = duty.date === todayStr;

  // Tìm hạng mục tương ứng để lấy mô tả công việc
  const matchingCategory = categories.find(
    c => c.id === duty.categoryId || c.name.toLowerCase() === duty.categoryName.toLowerCase()
  );
  const categoryDescription = matchingCategory?.description;

  // Tìm tất cả các công việc của nhân viên này trong cùng ngày
  const relatedAssignments = assignments
    ? assignments.filter(a => a.date === duty.date && a.assignedEmployeeId === duty.assignedEmployeeId)
    : [];

  const handleStartEdit = () => {
    setEditCategoryId(duty.categoryId);
    setEditEmployeeId(duty.assignedEmployeeId);
    setEditNotes(duty.notes || categoryDescription || '');
    setEditDate(duty.date);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const assignedEmp = employees.find(e => e.id === editEmployeeId) || employees[0];
    const selectedCat = categories.find(c => c.id === editCategoryId) || categories[0];
    const updated: DutyAssignment = {
      ...duty,
      date: editDate || duty.date,
      categoryId: selectedCat ? selectedCat.id : duty.categoryId,
      categoryName: selectedCat ? selectedCat.name : duty.categoryName,
      categoryIcon: selectedCat ? selectedCat.icon : duty.categoryIcon,
      categoryColor: selectedCat ? selectedCat.color : duty.categoryColor,
      assignedEmployeeId: assignedEmp.id,
      assignedEmployeeName: assignedEmp.name,
      assignedEmployeeRole: assignedEmp.role,
      assignedEmployeeAvatar: assignedEmp.avatar,
      notes: editNotes,
    };
    updateAssignment(updated);
    setSelectedAssignmentForDetail(updated);
    setIsEditing(false);
  };

  const handleStartAdminAnnotate = () => {
    setAdminNotes(duty.adminNotes || '');
    setFineAmount(duty.fineAmount ? String(duty.fineAmount) : '50000');
    setPenaltyImage(duty.penaltyImage || '');
    setIsAdminAnnotating(true);
  };

  const handlePenaltyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPenaltyImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePenalty = () => {
    const parsedAmount = fineAmount ? Number(fineAmount) : 50000;
    const updated: DutyAssignment = {
      ...duty,
      penaltyStatus: 'penalty',
      adminNotes,
      fineAmount: parsedAmount,
      penaltyImage,
    };
    updateAssignment(updated);
    setSelectedAssignmentForDetail(updated);
    setIsAdminAnnotating(false);
  };

  const handleRemovePenalty = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa biên bản phạt này?')) {
      const updated: DutyAssignment = {
        ...duty,
        penaltyStatus: 'normal',
        adminNotes: '',
        fineAmount: 0,
        penaltyImage: '',
      };
      updateAssignment(updated);
      setSelectedAssignmentForDetail(updated);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xoá nhiệm vụ trực nhật này?')) {
      deleteAssignment(duty.id);
      setSelectedAssignmentForDetail(null);
    }
  };

  const handleOpenUploadProof = () => {
    setDutyForProof(duty);
    setSelectedAssignmentForDetail(null);
    setProofModalOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-[#c3c6d6] flex justify-between items-center bg-[#f1f3ff] ${relatedAssignments.length > 1 ? 'pb-2' : ''}`}>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#003d9b]">task_alt</span>
            <h3 className="text-[18px] font-bold text-[#041b3c]">Chi tiết Trực nhật</h3>
          </div>
          <button
            onClick={() => setSelectedAssignmentForDetail(null)}
            className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#d7e2ff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs for Multiple Assignments */}
        {relatedAssignments.length > 1 && (
          <div className="flex px-6 bg-[#f1f3ff] border-b border-[#c3c6d6] gap-2 overflow-x-auto no-scrollbar">
            {relatedAssignments.map((a) => {
              const isActive = a.id === duty.id;
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedAssignmentForDetail(a);
                    setIsEditing(false);
                    setIsAdminAnnotating(false);
                  }}
                  className={`px-3 py-2.5 text-[13px] font-bold border-b-[3px] -mb-[1px] transition-colors whitespace-nowrap cursor-pointer ${isActive
                    ? 'border-[#003d9b] text-[#003d9b]'
                    : 'border-transparent text-[#737685] hover:text-[#041b3c]'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">{a.categoryIcon || 'task_alt'}</span>
                    {a.categoryName}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-[14px]">
          {/* Category Title & Date */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ color: duty.categoryColor || '#003d9b' }}
                >
                  {duty.categoryIcon || 'task_alt'}
                </span>
                <h4 className="text-[20px] font-bold text-[#041b3c]">{duty.categoryName}</h4>
              </div>
              <p className="text-[#434654] mt-1 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[18px] text-[#737685]">calendar_today</span>
                Ngày thực hiện: {duty.date}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${duty.penaltyStatus === 'penalty'
                ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/40 font-extrabold'
                : duty.status === 'completed'
                  ? 'bg-[#82f9be]/30 text-[#006c47] border border-[#006c47]/30'
                  : 'bg-[#ffca81]/30 text-[#5e3c00]'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {duty.penaltyStatus === 'penalty' ? 'warning' : duty.status === 'completed' ? 'check_circle' : 'pending'}
              </span>
              {duty.penaltyStatus === 'penalty' ? 'Bị phạt vi phạm' : duty.status === 'completed' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
            </span>
          </div>

          {/* Assigned Employee Card */}
          <div className="bg-[#f9f9ff] border border-[#c3c6d6] rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#d7e2ff] border border-[#c3c6d6] shrink-0">
                {duty.assignedEmployeeAvatar ? (
                  <img
                    src={duty.assignedEmployeeAvatar}
                    alt={duty.assignedEmployeeName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[#003d9b]">
                    {duty.assignedEmployeeName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#041b3c]">{duty.assignedEmployeeName}</p>
                <p className="text-[12px] text-[#434654]">{duty.assignedEmployeeRole || 'Nhân viên phụ trách'}</p>
              </div>
            </div>
          </div>

          {/* PENALTY DISPLAY BADGE WITH DIRTY PROOF PHOTO & FINE AMOUNT */}
          {duty.penaltyStatus === 'penalty' && (
            <div className="p-4 rounded-xl border border-[#ba1a1a]/40 bg-[#ffdad6]/35 text-[#ba1a1a] space-y-3 animate-in fade-in shadow-xs">
              <div className="flex items-center justify-between border-b border-[#ba1a1a]/20 pb-2">
                <div className="flex items-center gap-2 font-extrabold text-[15px]">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                  <span>BIÊN BẢN PHẠT VI PHẠM TRỰC NHẬT</span>
                </div>
                {duty.fineAmount && duty.fineAmount > 0 && (
                  <span className="px-3 py-1 rounded bg-[#ba1a1a] text-white font-extrabold text-[13px] shadow-2xs">
                    Phạt -{duty.fineAmount.toLocaleString('vi-VN')} đ
                  </span>
                )}
              </div>

              {/* Dirty Proof Image */}
              {duty.penaltyImage && (
                <div className="space-y-1">
                  <span className="text-[12px] font-bold text-[#ba1a1a] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    Hình ảnh khu vực chưa dọn / dơ (Bằng chứng vi phạm):
                  </span>
                  <img
                    src={duty.penaltyImage}
                    alt="Bằng chứng vi phạm dơ"
                    className="w-full h-44 object-cover rounded-lg border border-[#ba1a1a]/40 shadow-2xs"
                  />
                </div>
              )}

              {duty.adminNotes && (
                <div className="text-[13px] font-medium bg-white/80 p-3 rounded-lg border border-[#ba1a1a]/20 text-[#041b3c]">
                  <strong className="text-[#ba1a1a]">Lý do phạt của Admin: </strong> {duty.adminNotes}
                </div>
              )}

              {isAdmin && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleRemovePenalty}
                    className="text-[12px] font-bold text-[#ba1a1a] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                    Hủy biên bản phạt
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Proof Image Verification Display (Employee Upload) */}
          {duty.proofImage ? (
            <div className="p-4 bg-[#82f9be]/15 border border-[#006c47]/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#006c47] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Ảnh minh chứng nhân viên đã hoàn thành:
                </span>
                {duty.completedAt && (
                  <span className="text-[11px] text-[#737685] font-medium">{duty.completedAt}</span>
                )}
              </div>
              <img
                src={duty.proofImage}
                alt="Bằng chứng dọn vệ sinh"
                className="w-full h-48 object-cover rounded-lg border border-[#006c47]/30 shadow-xs"
              />
              {duty.completionNotes && (
                <p className="text-[12px] text-[#041b3c] font-medium italic">
                  "{duty.completionNotes}"
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-[#f1f3ff] rounded-lg border border-[#c3c6d6]/60 text-[12px] text-[#737685] italic flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Chưa có ảnh minh chứng tải lên cho ca trực này.
            </div>
          )}

          {/* Single Category Description & Prominent Admin Special Notice */}
          {(() => {
            // 1. Task Description directly from Category
            const descText = categoryDescription || duty.categoryName;

            // 2. Extract Custom Admin Notice (e.g. "bạn cần hoàn thành sớm nay có khách")
            let customNotice = duty.notes || '';

            // Extract partner info if present
            const partnerMatch = customNotice.match(/\(Cùng trực với [^)]+\)/);
            const partnerInfo = partnerMatch ? partnerMatch[0] : '';

            // Clean custom notice
            if (categoryDescription && customNotice.startsWith(categoryDescription)) {
              customNotice = customNotice.replace(categoryDescription, '').trim();
            }
            customNotice = customNotice.replace(/\(Cùng trực với [^)]+\)/, '').trim();

            return (
              <div className="space-y-3">
                {/* 1. SINGLE CLEAN MÔ TẢ CÔNG VIỆC CARD */}
                <div className="flex items-start gap-3 bg-[#f1f3ff] p-4 rounded-xl border border-[#c3c6d6] shadow-xs">
                  <span className="material-symbols-outlined text-[22px] text-[#003d9b] shrink-0 mt-0.5">
                    assignment
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="font-extrabold text-[#041b3c] text-[14px]">Mô tả công việc :</p>
                    <p className="text-[#434654] text-[13px] font-medium leading-relaxed">{descText}</p>

                    {partnerInfo && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-extrabold text-[#003d9b] bg-white px-2.5 py-1 rounded-md border border-[#003d9b]/20">
                        <span className="material-symbols-outlined text-[14px]">group</span>
                        {partnerInfo.replace(/[()]/g, '')}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. PROMINENT HIGHLIGHTED CARD FOR SPECIAL ADMIN NOTICES */}
                {customNotice && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#fff9e6] via-[#fff3cc] to-[#ffecb3] border-2 border-[#ffb300] text-[#5e3c00] shadow-md space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-black text-[13px] text-[#d97706] uppercase tracking-wide">
                      <span className="material-symbols-outlined text-[22px] text-[#d97706]">campaign</span>
                      <span>Lưu ý quan trọng từ Admin:</span>
                    </div>
                    <p className="text-[14px] font-black text-[#041b3c] leading-relaxed bg-white/80 p-3 rounded-lg border border-[#ffca81]">
                      "{customNotice}"
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ADMIN PENALTY FORM (ADMIN ONLY) */}
          {isAdmin && isAdminAnnotating && (
            <div className="p-4 bg-[#fff8f6] border border-[#ba1a1a]/40 rounded-xl space-y-4 animate-in fade-in shadow-2xs">
              <div className="flex items-center gap-2 border-b border-[#ba1a1a]/20 pb-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">gavel</span>
                <h5 className="font-bold text-[15px] text-[#ba1a1a]">Lập Biên Bản Phạt Tiền Vi Phạm</h5>
              </div>

              {/* 1. Fine Amount Field */}
              <div>
                <label className="block text-[13px] font-bold text-[#041b3c] mb-1.5">
                  1. Số tiền phạt tiền (VNĐ): <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Nhập số tiền phạt (VD: 50000 hoặc 100000)"
                    value={fineAmount}
                    onChange={e => setFineAmount(e.target.value)}
                    className="w-full p-2.5 border border-[#c3c6d6] rounded-md text-[14px] bg-white font-bold text-[#ba1a1a] pr-8 focus:border-[#ba1a1a] outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[13px] font-bold text-[#737685]">đ</span>
                </div>
              </div>

              {/* 2. Dirty Image Proof Upload */}
              <div>
                <label className="block text-[13px] font-bold text-[#041b3c] mb-1.5">
                  2. Kèm hình ảnh khu vực dơ / chưa trực (Bằng chứng):
                </label>

                {penaltyImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-[#ba1a1a]/40">
                    <img src={penaltyImage} alt="Ảnh dơ" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => setPenaltyImage('')}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full"
                      title="Xóa ảnh này"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="border-2 border-dashed border-[#ba1a1a]/40 hover:border-[#ba1a1a] bg-[#ffdad6]/20 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <span className="material-symbols-outlined text-[28px] text-[#ba1a1a] mb-1">
                        add_a_photo
                      </span>
                      <span className="text-[12px] font-bold text-[#ba1a1a]">
                        Tải lên ảnh chụp thực tế dơ / chưa dọn
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePenaltyImageUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Hoặc dán đường dẫn (URL) hình ảnh tại đây..."
                      value={penaltyImage}
                      onChange={e => setPenaltyImage(e.target.value)}
                      className="w-full p-2 border border-[#c3c6d6] rounded text-[12px] bg-white"
                    />
                  </div>
                )}
              </div>

              {/* 3. Admin Notes Field */}
              <div>
                <label className="block text-[13px] font-bold text-[#041b3c] mb-1.5">
                  3. Nội dung ghi chú lý do phạt của Admin:
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập lý do phạt chi tiết (Ví dụ: Bỏ trực ngày 05, sàn nhà nhiều bụi chưa quét lau)..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="w-full p-2.5 border border-[#c3c6d6] rounded-md text-[13px] bg-white focus:border-[#ba1a1a] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#c3c6d6]/60">
                <button
                  type="button"
                  onClick={() => setIsAdminAnnotating(false)}
                  className="px-4 py-2 border border-[#c3c6d6] text-[13px] font-semibold rounded-md text-[#434654] hover:bg-[#f1f3ff]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSavePenalty}
                  className="px-5 py-2 bg-[#ba1a1a] hover:bg-[#92000e] text-white text-[13px] font-bold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                  Lưu Biên Bản Phạt
                </button>
              </div>
            </div>
          )}

          {/* Edit Mode Inline (ADMIN ONLY) */}
          {isAdmin && isEditing && (
            <div className="p-4 bg-[#f9f9ff] border border-[#003d9b]/40 rounded-xl space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 border-b border-[#003d9b]/20 pb-2">
                <span className="material-symbols-outlined text-[#003d9b]">edit_note</span>
                <h5 className="font-extrabold text-[15px] text-[#003d9b]">Chỉnh Sửa Ca Trực & Phân Công</h5>
              </div>

              {/* 1. Category / Task Selection */}
              <div>
                <label className="block text-[12px] font-extrabold text-[#041b3c] mb-1">
                  1. Tên / Hạng mục nhiệm vụ:
                </label>
                <select
                  value={editCategoryId}
                  onChange={e => {
                    const catId = e.target.value;
                    setEditCategoryId(catId);
                    const found = categories.find(c => c.id === catId);
                    if (found && found.description && !editNotes) {
                      setEditNotes(found.description);
                    }
                  }}
                  className="w-full p-2.5 border border-[#c3c6d6] rounded-lg text-[13px] bg-white font-bold text-[#041b3c] cursor-pointer outline-none focus:border-[#003d9b]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Employee Assignment Selection */}
              <div>
                <label className="block text-[12px] font-extrabold text-[#041b3c] mb-1">
                  2. Nhân viên phụ trách:
                </label>
                <select
                  value={editEmployeeId}
                  onChange={e => setEditEmployeeId(e.target.value)}
                  className="w-full p-2.5 border border-[#c3c6d6] rounded-lg text-[13px] bg-white font-bold text-[#041b3c] cursor-pointer outline-none focus:border-[#003d9b]"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role} - {e.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Date Selection */}
              <div>
                <label className="block text-[12px] font-extrabold text-[#041b3c] mb-1">
                  3. Ngày thực hiện:
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full p-2.5 border border-[#c3c6d6] rounded-lg text-[13px] bg-white font-bold text-[#041b3c] outline-none focus:border-[#003d9b]"
                />
              </div>

              {/* 4. Admin Special Notice / Instructions */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[12px] font-extrabold text-[#041b3c]">
                    4. 📢 Lưu ý quan trọng / Dặn dò đặc biệt cho nhân viên (Bôi vàng nổi bật):
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Nhập dặn dò đặc biệt (VD: Bạn cần hoàn thành sớm nay có khách, dọn kỹ bàn làm việc)..."
                  className="w-full p-2.5 border-2 border-[#ffca81] bg-[#fff9e6] rounded-lg text-[13px] text-[#041b3c] font-bold outline-none focus:border-[#d97706]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#c3c6d6]/60">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-[#c3c6d6] text-[13px] font-bold rounded-lg text-[#434654] hover:bg-[#f1f3ff]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white text-[13px] font-extrabold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Lưu Thay Đổi
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer Actions - STRICT ROLE BASED ACCESSIBILITY */}
          {!isEditing && !isAdminAnnotating && (
            <div className="pt-4 border-t border-[#c3c6d6] flex flex-wrap justify-between items-center gap-2">
              {isAdmin ? (
                <>
                  <button
                    onClick={handleDelete}
                    className="text-[#ba1a1a] hover:bg-[#ffdad6]/40 px-3 py-2 rounded-md font-semibold text-[13px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Xoá nhiệm vụ
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleStartAdminAnnotate}
                      className="px-3.5 py-2 bg-[#ba1a1a]/10 text-[#ba1a1a] hover:bg-[#ba1a1a]/20 border border-[#ba1a1a]/40 rounded-md font-bold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">gavel</span>
                      {duty.penaltyStatus === 'penalty' ? 'Sửa Biên Bản Phạt' : 'Phạt Tiền Vi Phạm'}
                    </button>

                    <button
                      onClick={handleStartEdit}
                      className="px-3.5 py-2 border border-[#003d9b] text-[#003d9b] hover:bg-[#0052cc]/10 rounded-md font-semibold text-[13px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Chỉnh sửa ca trực
                    </button>

                    <button
                      onClick={() => setSelectedAssignmentForDetail(null)}
                      className="px-4 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-md font-semibold text-[13px] transition-colors cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              ) : (
                /* EMPLOYEE / USER ROLE ONLY: CAN ONLY REPORT FOR OWN SHIFT ON TODAY */
                <div className="w-full flex justify-between items-center gap-2">
                  {isMyShift ? (
                    isToday ? (
                      <button
                        onClick={handleOpenUploadProof}
                        className="px-4 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-md font-bold text-[13px] flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                        {duty.proofImage ? 'Cập nhật lại ảnh minh chứng' : 'Nộp ảnh minh chứng trực nhật'}
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 bg-[#f1f3ff] border border-[#c3c6d6] text-[#737685] rounded-md text-[12px] font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">event_busy</span>
                        Chỉ được báo cáo vào đúng ngày trực ({duty.date})
                      </div>
                    )
                  ) : (
                    <div className="px-3 py-1.5 bg-[#f1f3ff] border border-[#c3c6d6] text-[#737685] rounded-md text-[12px] font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      Ca trực của {duty.assignedEmployeeName} (Chỉ xem chi tiết)
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedAssignmentForDetail(null)}
                    className="px-4 py-2 border border-[#c3c6d6] text-[#434654] hover:bg-[#f1f3ff] rounded-md font-semibold text-[13px] cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
