import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ANIMAL_AVATARS = [
  { name: 'Mèo con 🐱', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23ffb6c1"/><polygon points="25,35 15,10 40,25" fill="%23ff94a8"/><polygon points="75,35 85,10 60,25" fill="%23ff94a8"/><circle cx="50" cy="55" r="30" fill="%23ffffff"/><circle cx="40" cy="50" r="4" fill="%23222222"/><circle cx="60" cy="50" r="4" fill="%23222222"/><polygon points="50,57 46,54 54,54" fill="%23ff69b4"/><path d="M 40 62 Q 50 68 60 62" stroke="%23ff69b4" stroke-width="2" fill="none"/><line x1="20" y1="52" x2="35" y2="54" stroke="%23888888" stroke-width="2"/><line x1="20" y1="60" x2="35" y2="58" stroke="%23888888" stroke-width="2"/><line x1="80" y1="52" x2="65" y2="54" stroke="%23888888" stroke-width="2"/><line x1="80" y1="60" x2="65" y2="58" stroke="%23888888" stroke-width="2"/></svg>' },
  { name: 'Cún con 🐶', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23ffe082"/><ellipse cx="20" cy="50" rx="12" ry="20" fill="%238d6e63"/><ellipse cx="80" cy="50" rx="12" ry="20" fill="%238d6e63"/><circle cx="50" cy="55" r="30" fill="%23d7ccc8"/><circle cx="38" cy="48" r="4" fill="%23222222"/><circle cx="62" cy="48" r="4" fill="%23222222"/><ellipse cx="50" cy="58" rx="8" ry="6" fill="%234e342e"/><path d="M 44 65 Q 50 72 56 65" stroke="%234e342e" stroke-width="2" fill="none"/></svg>' },
  { name: 'Gấu trúc 🐼', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23a5d6a7"/><circle cx="25" cy="25" r="14" fill="%23333333"/><circle cx="75" cy="25" r="14" fill="%23333333"/><circle cx="50" cy="55" r="32" fill="%23ffffff"/><ellipse cx="38" cy="50" rx="9" ry="12" fill="%23333333"/><ellipse cx="62" cy="50" rx="9" ry="12" fill="%23333333"/><circle cx="38" cy="48" r="3" fill="%23ffffff"/><circle cx="62" cy="48" r="3" fill="%23ffffff"/><ellipse cx="50" cy="60" rx="5" ry="4" fill="%23333333"/><path d="M 44 66 Q 50 70 56 66" stroke="%23333333" stroke-width="2" fill="none"/></svg>' },
  { name: 'Cáo nhỏ 🦊', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%2380deea"/><polygon points="20,40 10,12 38,28" fill="%23ff7043"/><polygon points="80,40 90,12 62,28" fill="%23ff7043"/><circle cx="50" cy="55" r="30" fill="%23ff7043"/><polygon points="50,75 25,50 75,50" fill="%23ffffff"/><circle cx="38" cy="48" r="4" fill="%23222222"/><circle cx="62" cy="48" r="4" fill="%23222222"/><circle cx="50" cy="64" r="4" fill="%23222222"/></svg>' },
  { name: 'Thỏ ngọc 🐰', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23ce93d8"/><ellipse cx="35" cy="22" rx="8" ry="20" fill="%23ffffff"/><ellipse cx="65" cy="22" rx="8" ry="20" fill="%23ffffff"/><ellipse cx="35" cy="22" rx="4" ry="14" fill="%23ff4081"/><ellipse cx="65" cy="22" rx="4" ry="14" fill="%23ff4081"/><circle cx="50" cy="58" r="28" fill="%23ffffff"/><circle cx="38" cy="52" r="3.5" fill="%23222222"/><circle cx="62" cy="52" r="3.5" fill="%23222222"/><polygon points="50,59 46,56 54,56" fill="%23ff4081"/><circle cx="30" cy="58" r="5" fill="%23ff4081" opacity="0.3"/><circle cx="70" cy="58" r="5" fill="%23ff4081" opacity="0.3"/></svg>' },
  { name: 'Gấu nâu 🐻', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23ffab91"/><circle cx="24" cy="26" r="13" fill="%238d6e63"/><circle cx="76" cy="26" r="13" fill="%238d6e63"/><circle cx="24" cy="26" r="7" fill="%23d7ccc8"/><circle cx="76" cy="26" r="7" fill="%23d7ccc8"/><circle cx="50" cy="55" r="32" fill="%238d6e63"/><ellipse cx="50" cy="62" rx="14" ry="10" fill="%23d7ccc8"/><circle cx="38" cy="48" r="4" fill="%23222222"/><circle cx="62" cy="48" r="4" fill="%23222222"/><ellipse cx="50" cy="59" rx="5" ry="4" fill="%233e2723"/><path d="M 44 65 Q 50 69 56 65" stroke="%233e2723" stroke-width="2" fill="none"/></svg>' },
  { name: 'Cánh cụt 🐧', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%2381d4fa"/><circle cx="50" cy="52" r="32" fill="%2337474f"/><ellipse cx="50" cy="56" rx="22" ry="24" fill="%23ffffff"/><circle cx="40" cy="46" r="3.5" fill="%23222222"/><circle cx="60" cy="46" r="3.5" fill="%23222222"/><polygon points="50,56 42,50 58,50" fill="%23ffa726"/><circle cx="30" cy="52" r="4" fill="%23ff8a80" opacity="0.4"/><circle cx="70" cy="52" r="4" fill="%23ff8a80" opacity="0.4"/></svg>' },
  { name: 'Sư tử 🦁', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23fff59d"/><circle cx="50" cy="52" r="36" fill="%23fb8c00"/><circle cx="50" cy="52" r="26" fill="%23ffe082"/><circle cx="38" cy="46" r="3.5" fill="%23222222"/><circle cx="62" cy="46" r="3.5" fill="%23222222"/><polygon points="50,55 45,51 55,51" fill="%235d4037"/><path d="M 44 60 Q 50 65 56 60" stroke="%235d4037" stroke-width="2" fill="none"/></svg>' },
  { name: 'Koala 🐨', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23b2ebf2"/><circle cx="22" cy="30" r="16" fill="%2378909c"/><circle cx="78" cy="30" r="16" fill="%2378909c"/><circle cx="22" cy="30" r="9" fill="%23cfd8dc"/><circle cx="78" cy="30" r="9" fill="%23cfd8dc"/><circle cx="50" cy="55" r="30" fill="%2378909c"/><ellipse cx="50" cy="56" rx="8" ry="12" fill="%2337474f"/><circle cx="36" cy="48" r="3.5" fill="%23222222"/><circle cx="64" cy="48" r="3.5" fill="%23222222"/></svg>' },
  { name: 'Hổ con 🐯', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23ffe082"/><circle cx="24" cy="26" r="12" fill="%23ff9800"/><circle cx="76" cy="26" r="12" fill="%23ff9800"/><circle cx="50" cy="55" r="32" fill="%23ff9800"/><ellipse cx="50" cy="62" rx="14" ry="10" fill="%23ffffff"/><circle cx="38" cy="48" r="4" fill="%23222222"/><circle cx="62" cy="48" r="4" fill="%23222222"/><polygon points="50,58 45,54 55,54" fill="%233e2723"/><path d="M 50 30 L 50 38" stroke="%233e2723" stroke-width="3"/><path d="M 30 40 L 38 42" stroke="%233e2723" stroke-width="3"/><path d="M 70 40 L 62 42" stroke="%233e2723" stroke-width="3"/></svg>' },
  { name: 'Heo hồng 🐷', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23f8bbd0"/><polygon points="25,35 18,18 38,25" fill="%23f48fb1"/><polygon points="75,35 82,18 62,25" fill="%23f48fb1"/><circle cx="50" cy="55" r="30" fill="%23f48fb1"/><ellipse cx="50" cy="58" rx="12" ry="9" fill="%23ff4081"/><circle cx="45" cy="58" r="2.5" fill="%23880e4f"/><circle cx="55" cy="58" r="2.5" fill="%23880e4f"/><circle cx="36" cy="46" r="3.5" fill="%23222222"/><circle cx="64" cy="46" r="3.5" fill="%23222222"/></svg>' },
  { name: 'Ếch xanh 🐸', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23c8e6c9"/><circle cx="32" cy="28" r="14" fill="%2366bb6a"/><circle cx="68" cy="28" r="14" fill="%2366bb6a"/><circle cx="32" cy="28" r="7" fill="%23ffffff"/><circle cx="68" cy="28" r="7" fill="%23ffffff"/><circle cx="32" cy="28" r="3.5" fill="%23222222"/><circle cx="68" cy="28" r="3.5" fill="%23222222"/><ellipse cx="50" cy="58" rx="34" ry="24" fill="%2366bb6a"/><path d="M 32 58 Q 50 72 68 58" stroke="%231b5e20" stroke-width="3" fill="none"/><circle cx="28" cy="56" r="4" fill="%23ff8a80" opacity="0.5"/><circle cx="72" cy="56" r="4" fill="%23ff8a80" opacity="0.5"/></svg>' },
];

export const MINIMAL_AVATARS = [
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23003d9b"/><circle cx="50" cy="38" r="22" fill="%23ffffff"/><path d="M 20,88 C 20,64 32,54 50,54 C 68,54 80,64 80,88 Z" fill="%23ffffff"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23006c47"/><circle cx="50" cy="38" r="22" fill="%23ffffff"/><path d="M 20,88 C 20,64 32,54 50,54 C 68,54 80,64 80,88 Z" fill="%23ffffff"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23ba1a1a"/><circle cx="50" cy="38" r="22" fill="%23ffffff"/><path d="M 20,88 C 20,64 32,54 50,54 C 68,54 80,64 80,88 Z" fill="%23ffffff"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23673ab7"/><circle cx="50" cy="38" r="22" fill="%23ffffff"/><path d="M 20,88 C 20,64 32,54 50,54 C 68,54 80,64 80,88 Z" fill="%23ffffff"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23e91e63"/><circle cx="50" cy="38" r="22" fill="%23ffffff"/><path d="M 20,88 C 20,64 32,54 50,54 C 68,54 80,64 80,88 Z" fill="%23ffffff"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23ff9800"/><circle cx="50" cy="38" r="22" fill="%23ffffff"/><path d="M 20,88 C 20,64 32,54 50,54 C 68,54 80,64 80,88 Z" fill="%23ffffff"/></svg>',
];

export const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, employees, updateEmployee } = useDuty();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser.avatar || ANIMAL_AVATARS[0].url);
  const [activeTab, setActiveTab] = useState<'animals' | 'minimal'>('animals');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setSelectedAvatar(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // 1. Update current user
    setCurrentUser({
      ...currentUser,
      avatar: selectedAvatar,
    });

    // 2. If logged in as employee, update employee record too
    const myEmpId = currentUser.employeeId || currentUser.id;
    const targetEmp = employees.find(e => e.id === myEmpId);
    if (targetEmp) {
      await updateEmployee({
        ...targetEmp,
        avatar: selectedAvatar,
      });
    }

    alert('✅ Đã cập nhật ảnh đại diện mới thành công!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c3c6d6] bg-[#f1f3ff] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b]">pets</span>
            <h3 className="text-[18px] font-extrabold text-[#041b3c]">Chọn Avatar Con Vật Dễ Thương</h3>
          </div>
          <button onClick={onClose} className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#d7e2ff]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-[14px]">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center gap-2 bg-[#f9f9ff] p-4 rounded-2xl border border-[#c3c6d6]/60">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#003d9b] shadow-md relative bg-white">
              <img src={selectedAvatar} alt="Avatar preview" className="w-full h-full object-cover" />
            </div>
            <p className="text-[12px] font-extrabold text-[#003d9b]">Ảnh đại diện đang chọn</p>
          </div>

          {/* Option 1: File Upload */}
          <div>
            <label className="block text-[12px] font-extrabold text-[#434654] uppercase tracking-wider mb-2">
              1. Tải ảnh cá nhân từ thiết bị:
            </label>
            <label className="w-full py-3 px-4 border-2 border-dashed border-[#003d9b] bg-[#003d9b]/5 hover:bg-[#003d9b]/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-[#003d9b] font-bold text-[14px] shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">upload_file</span>
              Chọn ảnh chụp từ máy tính / điện thoại
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Option 2: Presets */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[12px] font-extrabold text-[#434654] uppercase tracking-wider">
                2. Chọn Avatar Con Vật dễ thương:
              </label>

              {/* Category selector */}
              <div className="flex gap-1 bg-[#f1f3ff] p-1 rounded-lg border border-[#c3c6d6]/60">
                <button
                  type="button"
                  onClick={() => setActiveTab('animals')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${activeTab === 'animals' ? 'bg-[#003d9b] text-white shadow-2xs' : 'text-[#434654]'
                    }`}
                >
                  🐾 Thú cưng ({ANIMAL_AVATARS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('minimal')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${activeTab === 'minimal' ? 'bg-[#003d9b] text-white shadow-2xs' : 'text-[#434654]'
                    }`}
                >
                  👤 Màu sắc
                </button>
              </div>
            </div>

            {activeTab === 'animals' ? (
              <div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                {ANIMAL_AVATARS.map((item, idx) => {
                  const isSelected = selectedAvatar === item.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(item.url)}
                      className={`flex flex-col items-center gap-1 group cursor-pointer`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 ${isSelected
                            ? 'border-[#003d9b] ring-4 ring-[#003d9b]/25 scale-105 shadow-md'
                            : 'border-[#c3c6d6] group-hover:border-[#003d9b] opacity-90 group-hover:opacity-100'
                          }`}
                      >
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <span className="text-[11px] font-bold text-[#434654] truncate max-w-full">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 p-1">
                {MINIMAL_AVATARS.map((svgUrl, idx) => {
                  const isSelected = selectedAvatar === svgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(svgUrl)}
                      className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 mx-auto cursor-pointer ${isSelected
                          ? 'border-[#003d9b] ring-4 ring-[#003d9b]/25 scale-105 shadow-md'
                          : 'border-[#c3c6d6] hover:border-[#003d9b] opacity-80 hover:opacity-100'
                        }`}
                    >
                      <img src={svgUrl} alt={`Minimal preset ${idx + 1}`} className="w-full h-full object-cover rounded-full" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#c3c6d6] bg-[#f9f9ff] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#c3c6d6] text-[#434654] font-semibold rounded-lg hover:bg-[#f1f3ff]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-extrabold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Lưu avatar con vật
          </button>
        </div>
      </div>
    </div>
  );
};
