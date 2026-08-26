import React from 'react';
import { useDuty } from '../../context/DutyContext';

export const PendingRequestsModal: React.FC = () => {
  const {
    pendingRequestsModalOpen,
    setPendingRequestsModalOpen,
    offDays,
    approveOffDay,
    rejectOffDay,
  } = useDuty();

  if (!pendingRequestsModalOpen) return null;

  const pendingList = offDays.filter(o => o.status === 'pending');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-xl w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c3c6d6] flex justify-between items-center bg-[#f1f3ff]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#5e3c00]">pending_actions</span>
            <div>
              <h3 className="text-[18px] font-bold text-[#041b3c]">
                Yêu cầu nghỉ chờ duyệt
              </h3>
              <p className="text-[12px] text-[#737685]">
                {pendingList.length} yêu cầu cần xử lý
              </p>
            </div>
          </div>
          <button
            onClick={() => setPendingRequestsModalOpen(false)}
            className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#d7e2ff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1 text-[14px]">
          {pendingList.length === 0 ? (
            <div className="text-center py-10 text-[#737685]">
              <span className="material-symbols-outlined text-[40px] text-[#006c47] mb-2 block">
                check_circle
              </span>
              <p className="font-semibold text-[#041b3c]">Tất cả yêu cầu đã được xử lý xong!</p>
              <p className="text-[13px] mt-1">Không có yêu cầu nghỉ nào đang chờ duyệt.</p>
            </div>
          ) : (
            pendingList.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-lg border border-[#c3c6d6] bg-[#f9f9ff] hover:border-[#5e3c00]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d7e2ff] flex items-center justify-center text-[#003d9b] font-bold shrink-0">
                    {req.employeeName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#041b3c] text-[15px]">{req.employeeName}</p>
                    <p className="text-[12px] text-[#434654]">{req.employeeRole}</p>
                    <p className="text-[13px] font-semibold text-[#003d9b] mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      {req.dayFormatted}
                    </p>
                    {req.reason && (
                      <p className="text-[12px] text-[#737685] mt-0.5 italic">
                        Lý do: {req.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => rejectOffDay(req.id)}
                    className="px-3 py-1.5 border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-[12px] font-semibold rounded-md transition-colors"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => approveOffDay(req.id)}
                    className="px-4 py-1.5 bg-[#006c47] hover:bg-[#005235] text-white text-[12px] font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Phê duyệt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#c3c6d6] bg-[#f1f3ff] flex justify-end">
          <button
            onClick={() => setPendingRequestsModalOpen(false)}
            className="px-5 py-2 bg-[#003d9b] text-white rounded-md text-[13px] font-semibold hover:bg-[#0052cc]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
