import React, { useState, useEffect } from 'react';
import { useDuty } from '../../context/DutyContext';

export const CategoryModal: React.FC = () => {
  const {
    categoryModalOpen,
    setCategoryModalOpen,
    editingCategory,
    addCategory,
    updateCategory,
  } = useDuty();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('cleaning_services');
  const [color, setColor] = useState('#003d9b');
  const [description, setDescription] = useState('');

  const iconOptions = [
    { value: 'cleaning_services', label: 'Quét dọn (Bàn chải)' },
    { value: 'mop', label: 'Lau nhà (Cây lau)' },
    { value: 'delete', label: 'Đổ rác (Thùng rác)' },
    { value: 'window', label: 'Lau kính (Cửa sổ)' },
    { value: 'potted_plant', label: 'Tưới cây (Chậu cây)' },
    { value: 'wash', label: 'Rửa chén / Vệ sinh' },
    { value: 'sanitizer', label: 'Khử khuẩn' },
  ];

  const colorOptions = ['#003d9b', '#006c47', '#ba1a1a', '#705d00', '#6b4ea2', '#008394', '#d97706'];

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setIcon(editingCategory.icon || 'cleaning_services');
      setColor(editingCategory.color || '#003d9b');
      setDescription(editingCategory.description || '');
    } else {
      setName('');
      setIcon('cleaning_services');
      setColor('#003d9b');
      setDescription('');
    }
  }, [editingCategory, categoryModalOpen]);

  if (!categoryModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name,
        icon,
        color,
        description,
      });
    } else {
      addCategory({
        name,
        icon,
        color,
        description,
      });
    }
    setCategoryModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#c3c6d6] flex justify-between items-center bg-[#f1f3ff]">
          <h3 className="text-[18px] font-bold text-[#041b3c]">
            {editingCategory ? 'Chỉnh sửa Hạng mục Trực' : 'Thêm Hạng mục Trực mới'}
          </h3>
          <button
            onClick={() => setCategoryModalOpen(false)}
            className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#d7e2ff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Tên hạng mục công việc
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Quét nhà, Lau nhà, Đổ rác..."
              className="w-full px-3 py-2 border border-[#c3c6d6] rounded-md text-[14px] text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Biểu tượng (Icon)
            </label>
            <select
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="w-full px-3 py-2 border border-[#c3c6d6] rounded-md text-[14px] text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none bg-white cursor-pointer"
            >
              {iconOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Màu nhận diện
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-110 border-[#041b3c]' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#434654] uppercase tracking-wider mb-1.5">
              Mô tả nhiệm vụ
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Chi tiết công việc cần làm..."
              className="w-full px-3 py-2 border border-[#c3c6d6] rounded-md text-[14px] text-[#041b3c] focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#c3c6d6] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="px-4 py-2 border border-[#c3c6d6] rounded-md text-[13px] font-semibold text-[#434654] hover:bg-[#f1f3ff]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-md text-[13px] font-semibold shadow-xs"
            >
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
