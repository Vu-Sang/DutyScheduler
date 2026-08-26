import React from 'react';
import { useDuty } from '../../context/DutyContext';
import { DutyCategory } from '../../types';

export const CategoryManagementView: React.FC = () => {
  const { categories, setCategoryModalOpen, setEditingCategory, deleteCategory } = useDuty();

  const handleEdit = (cat: DutyCategory) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleDelete = (cat: DutyCategory) => {
    if (confirm(`Bạn có chắc chắn muốn xóa hạng mục công việc "${cat.name}"?`)) {
      deleteCategory(cat.id);
    }
  };

  return (
    <div id="category-management-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#041b3c] tracking-tight">
            Danh mục Công việc Trực nhật
          </h2>
          <p className="text-[14px] text-[#434654] mt-1 font-medium">
            Quản lý các hạng mục công việc lao động & vệ sinh (Quét nhà, Lau nhà, Đổ rác...).
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-4 py-2 rounded-md font-semibold text-[13px] transition-colors shadow-xs flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Thêm Hạng mục Công việc
        </button>
      </div>

      {/* Grid of Duty Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white rounded-lg border border-[#c3c6d6] shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            {/* Top Accent Line */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: cat.color }}
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {cat.icon || 'task_alt'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-[#041b3c]">{cat.name}</h3>
                    <span className="text-[11px] font-medium text-[#737685] uppercase tracking-wider">
                      Hạng mục trực
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[13px] text-[#434654] leading-relaxed">
                {cat.description || 'Chưa có mô tả chi tiết cho hạng mục công việc này.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-[#c3c6d6]/60 flex items-center justify-end gap-2">
              <button
                onClick={() => handleEdit(cat)}
                className="px-3 py-1.5 rounded text-[13px] font-semibold text-[#003d9b] hover:bg-[#0052cc]/10 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Chỉnh sửa
              </button>
              <button
                onClick={() => handleDelete(cat)}
                className="px-3 py-1.5 rounded text-[13px] font-semibold text-[#ba1a1a] hover:bg-[#ba1a1a]/10 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
