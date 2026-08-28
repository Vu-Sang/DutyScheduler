import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';

export const ProofUploadModal: React.FC = () => {
  const {
    proofModalOpen,
    setProofModalOpen,
    dutyForProof,
    completeDutyWithProof,
    currentUser,
  } = useDuty();

  const [proofImage, setProofImage] = useState<string>('');
  const [notes, setNotes] = useState('');

  if (!proofModalOpen || !dutyForProof) return null;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const myEmployeeId = currentUser.employeeId || currentUser.id;
  const isMyShift = dutyForProof.assignedEmployeeId === myEmployeeId;
  const isToday = dutyForProof.date === todayStr;
  const isAdmin = currentUser.isManager || currentUser.roleType === 'admin';
  const canSubmit = (isToday && isMyShift) || isAdmin;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      alert(!isMyShift && !isAdmin ? 'Bạn không thể nộp ảnh minh chứng cho ca trực của người khác!' : 'Bạn chỉ có thể nộp ảnh minh chứng vào đúng ngày trực (Hôm nay)!');
      return;
    }
    if (!proofImage) {
      alert('Vui lòng mở camera chụp ảnh minh chứng thực tế trước khi xác nhận!');
      return;
    }
    completeDutyWithProof(dutyForProof.id, proofImage, notes);
    setProofModalOpen(false);
    setProofImage('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#c3c6d6] flex justify-between items-center bg-[#f1f3ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c47]">task_alt</span>
            <h3 className="text-[18px] font-bold text-[#041b3c]">Xác minh Trực nhật & Chụp ảnh</h3>
          </div>
          <button
            onClick={() => setProofModalOpen(false)}
            className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#d7e2ff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-[14px]">
          {/* Duty Info Card */}
          <div className="p-3 bg-[#f1f3ff] rounded-lg border border-[#c3c6d6]/60 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 font-bold"
              style={{ backgroundColor: dutyForProof.categoryColor || '#003d9b' }}
            >
              <span className="material-symbols-outlined text-[22px]">
                {dutyForProof.categoryIcon || 'task_alt'}
              </span>
            </div>
            <div>
              <p className="font-bold text-[15px] text-[#041b3c]">{dutyForProof.categoryName}</p>
              <p className="text-[12px] text-[#434654] font-medium">
                Ngày trực: {dutyForProof.date} — {dutyForProof.assignedEmployeeName}
              </p>
            </div>
          </div>

          {/* Warning Banner if not allowed */}
          {!canSubmit && (
            <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/40 rounded-xl text-[#ba1a1a] text-[13px] font-bold flex items-center gap-2 shadow-2xs">
              <span className="material-symbols-outlined text-[22px] shrink-0">event_busy</span>
              <span>
                {!isMyShift && !isAdmin
                  ? `Đây là ca trực của ${dutyForProof.assignedEmployeeName}. Bạn không thể báo cáo thay người khác!`
                  : `Bạn chỉ có thể nộp báo cáo minh chứng vào đúng ngày trực (${dutyForProof.date}). Không thể báo cáo bù cho ngày khác!`}
              </span>
            </div>
          )}

          {/* Direct Camera Trigger Input */}
          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-2">
              Chụp ảnh minh chứng trực nhật thực tế: <span className="text-[#ba1a1a]">*</span>
            </label>

            {canSubmit && (
              <input
                id="camera-photo-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            )}

            {!proofImage ? (
              canSubmit ? (
                <label
                  htmlFor="camera-photo-input"
                  className="w-full p-6 border-2 border-dashed border-[#003d9b] bg-[#003d9b]/5 hover:bg-[#003d9b]/10 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-2.5 group shadow-2xs"
                >
                  <div className="w-14 h-14 rounded-full bg-[#003d9b] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[32px]">photo_camera</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[15px] font-extrabold text-[#003d9b] block">
                      📷 Mở Camera điện thoại chụp ảnh trực tiếp
                    </span>
                    <span className="text-[12px] text-[#737685] font-medium">
                      Nhấp vào đây để bật máy ảnh chụp ảnh dọn vệ sinh thực tế
                    </span>
                  </div>
                </label>
              ) : (
                <div className="w-full p-6 border-2 border-dashed border-[#737685]/40 bg-[#f9f9ff] rounded-xl flex flex-col items-center justify-center gap-2 text-center opacity-60">
                  <span className="material-symbols-outlined text-[36px] text-[#737685]">lock</span>
                  <span className="text-[13px] font-bold text-[#737685]">Chức năng nộp báo cáo bị khóa do không phải ca trực ngày hôm nay</span>
                </div>
              )
            ) : (
              <div className="p-3 border-2 border-[#006c47] rounded-xl bg-[#82f9be]/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#006c47] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Ảnh đã chụp từ camera:
                  </span>

                  {canSubmit && (
                    <label
                      htmlFor="camera-photo-input"
                      className="text-[12px] font-bold text-[#003d9b] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded border border-[#003d9b]/30 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                      Chụp lại ảnh khác
                    </label>
                  )}
                </div>

                <img src={proofImage} alt="Ảnh chụp thực tế" className="w-full h-52 object-cover rounded-lg border border-[#006c47]/30 shadow-xs" />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Ghi chú hoàn thành (Không bắt buộc)
            </label>
            <textarea
              rows={2}
              value={notes}
              disabled={!canSubmit}
              onChange={e => setNotes(e.target.value)}
              placeholder="VD: Đã quét dọn sạch phòng làm việc và lau lau sạch ráo..."
              className="w-full px-3 py-2 border border-[#c3c6d6] rounded-md text-[14px] text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#c3c6d6] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setProofModalOpen(false)}
              className="px-4 py-2 border border-[#c3c6d6] rounded-md text-[#434654] font-semibold hover:bg-[#f1f3ff]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!proofImage || !canSubmit}
              className={`px-5 py-2 rounded-md font-bold text-white transition-all shadow-xs flex items-center gap-1.5 ${
                proofImage && canSubmit
                  ? 'bg-[#006c47] hover:bg-[#005236] cursor-pointer'
                  : 'bg-[#737685]/50 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Xác nhận hoàn thành
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
