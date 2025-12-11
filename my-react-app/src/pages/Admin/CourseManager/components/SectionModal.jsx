import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';

const SectionModal = ({ section, onClose, onSave }) => {
  const isEditMode = !!section;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      sectionName: '',
      orderIndex: 1,
      courseId: null
    }
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (section) {
      reset({
        sectionName: section.sectionName || '',
        orderIndex: section.orderIndex || 1,
        courseId: section.courseId || null
      });
    }
  }, [section, reset]);

  const onSubmit = async (data) => {
    setError(null);
    
    const result = await onSave(data);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Chỉnh sửa chương học' : 'Thêm chương học mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề chương <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('sectionName', {
                required: 'Vui lòng nhập tiêu đề chương',
                minLength: {
                  value: 3,
                  message: 'Tiêu đề phải có ít nhất 3 ký tự'
                }
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.sectionName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="VD: Chương 1: Giới thiệu cơ bản"
            />
            {errors.sectionName && (
              <p className="mt-1 text-sm text-red-500">{errors.sectionName.message}</p>
            )}
          </div>

          {/* Order Index */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              {...register('orderIndex', {
                min: {
                  value: 1,
                  message: 'Thứ tự phải lớn hơn 0'
                }
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.orderIndex ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
            />
            {errors.orderIndex && (
              <p className="mt-1 text-sm text-red-500">{errors.orderIndex.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Chương học sẽ được sắp xếp theo thứ tự này
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                isEditMode ? 'Cập nhật' : 'Thêm chương'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionModal;
