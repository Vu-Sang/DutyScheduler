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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003d9b] via-[#004bb8] to-[#0052cc] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px]">cleaning_services</span>
          </div>
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-black tracking-tight text-white flex items-center gap-2">
              Danh Mục Công Việc Trực Nhật
            </h2>
            <p className="text-[13px] text-white/85 font-medium mt-0.5">
              Tùy chỉnh và quản lý danh mục công việc lao động & vệ sinh (Quét nhà, lau nhà, đổ rác...).
            </p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="bg-white text-[#003d9b] hover:bg-white/90 px-4 py-2.5 rounded-xl font-extrabold text-[13px] transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
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
