import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';

export const AutoScheduleModal: React.FC = () => {
  const {
    autoScheduleModalOpen,
    setAutoScheduleModalOpen,
    autoScheduleDuty,
    selectedMonth,
    selectedYear,
    employees,
  } = useDuty();

  const [loading, setLoading] = useState(false);
  const [balanceFairness, setBalanceFairness] = useState(true);
  const [respectOffDays, setRespectOffDays] = useState(true);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!autoScheduleModalOpen) return null;

  const handleStart = async () => {
    if (employees.length === 0) {
      setErrorMessage('Chưa có nhân viên trong hệ thống! Vui lòng thêm nhân viên tại mục "Quản lý nhân viên" trước khi bấm tự động phân lịch.');
      return;
    }

    setLoading(true);
    setResultMessage(null);
    setErrorMessage(null);

    try {
      const res = await autoScheduleDuty(selectedMonth, selectedYear);
      if (res.error) {
        setErrorMessage(res.error);
        setLoading(false);
      } else {
        setResultMessage(`Đã hoàn tất phân công tự động cho ${res.count} lượt trực nhật trong Tháng ${selectedMonth + 1}/${selectedYear}!`);
        setTimeout(() => {
          setAutoScheduleModalOpen(false);
          setLoading(false);
          setResultMessage(null);
        }, 1400);
      }
    } catch (err) {
      setErrorMessage('Đã xảy ra lỗi trong quá trình tự động phân lịch.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c3c6d6] flex justify-between items-center bg-[#f1f3ff]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#003d9b]">auto_awesome</span>
            <h3 className="text-[18px] font-bold text-[#041b3c]">Tự động phân lịch trực nhật</h3>
          </div>
          <button
            onClick={() => setAutoScheduleModalOpen(false)}
            disabled={loading}
            className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#d7e2ff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-[14px]">
          <p className="text-[#434654] leading-relaxed">
            Thuật toán sẽ tự động phân bổ các nhiệm vụ trực nhật (2 người/ngày) cho{' '}
            <strong className="text-[#003d9b]">Tháng {selectedMonth + 1}/{selectedYear}</strong>, đảm bảo:
          </p>

          <div className="space-y-3 bg-[#f9f9ff] p-4 rounded-lg border border-[#c3c6d6]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={respectOffDays}
                onChange={e => setRespectOffDays(e.target.checked)}
                className="mt-1 text-[#003d9b] rounded"
              />
              <div>
                <p className="font-semibold text-[#041b3c]">Né tuyệt đối các ngày OFF</p>
                <p className="text-[12px] text-[#737685]">
                  Không bao giờ xếp công việc trực vào các ngày nhân viên đã đăng ký nghỉ.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={balanceFairness}
                onChange={e => setBalanceFairness(e.target.checked)}
                className="mt-1 text-[#003d9b] rounded"
              />
              <div>
                <p className="font-semibold text-[#041b3c]">Cân bằng khối lượng công việc</p>
                <p className="text-[12px] text-[#737685]">
                  Phân chia đều số ca trực nhật giữa các nhân viên hiện có ({employees.length} nhân viên).
                </p>
              </div>
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-md font-semibold text-[13px] flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              {errorMessage}
            </div>
          )}

          {resultMessage && (
            <div className="p-3 bg-[#82f9be]/25 border border-[#006c47]/30 text-[#006c47] rounded-md font-semibold text-[13px] flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {resultMessage}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-[#c3c6d6] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAutoScheduleModalOpen(false)}
              disabled={loading}
              className="px-4 py-2 border border-[#c3c6d6] rounded-md text-[13px] font-semibold text-[#434654] hover:bg-[#f1f3ff]"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleStart}
              disabled={loading}
              className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-md text-[13px] font-semibold flex items-center gap-2 shadow-xs"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tính toán phân bổ...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  Bắt đầu phân lịch ngay
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
