import React, { useEffect } from 'react';
import { Modal, Input, InputNumber, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import courseApi from '../../api/courseApi';

// Validation schema
const sectionSchema = yup.object().shape({
  sectionName: yup
    .string()
    .required('Vui lòng nhập tên chương')
    .min(3, 'Tên chương phải có ít nhất 3 ký tự')
    .max(200, 'Tên chương không quá 200 ký tự'),
  orderIndex: yup
    .number()
    .required('Vui lòng nhập thứ tự')
    .min(1, 'Thứ tự phải lớn hơn 0')
    .typeError('Thứ tự phải là số'),
});

const SectionModal = ({ visible, courseId, section, onClose }) => {
  const isEditMode = !!section;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(sectionSchema),
    defaultValues: {
      sectionName: '',
      orderIndex: 1,
    },
  });

  // Load section data when editing
  useEffect(() => {
    if (visible && section) {
      reset({
        sectionName: section.sectionName || '',
        orderIndex: section.orderIndex || 1,
      });
    } else if (visible && !section) {
      reset({
        sectionName: '',
        orderIndex: 1,
      });
    }
  }, [visible, section, reset]);

  const onSubmit = async (values) => {
    try {
      const sectionData = {
        sectionName: values.sectionName,
        orderIndex: values.orderIndex,
        courseId: courseId, // Quan trọng: Phải truyền courseId
      };

      if (isEditMode) {
        await courseApi.updateSection(section.id, sectionData);
        message.success('Cập nhật chương thành công');
      } else {
        await courseApi.createSection(sectionData);
        message.success('Thêm chương mới thành công');
      }

      onClose(true); // true = reload curriculum
    } catch (error) {
      console.error('Error saving section:', error);
      message.error(
        isEditMode ? 'Không thể cập nhật chương' : 'Không thể thêm chương mới'
      );
    }
  };

  const handleCancel = () => {
    reset();
    onClose(false);
  };

  return (
    <Modal
      title={isEditMode ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
      open={visible}
      onOk={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      okText={isEditMode ? 'Cập nhật' : 'Thêm'}
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      width={600}
    >
      <form className="space-y-4 mt-4">
        {/* Section Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tên chương <span className="text-red-500">*</span>
          </label>
          <Controller
            name="sectionName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder="VD: Giới thiệu về khóa học"
                maxLength={200}
                showCount
                status={errors.sectionName ? 'error' : ''}
              />
            )}
          />
          {errors.sectionName && (
            <p className="text-red-500 text-sm mt-1">{errors.sectionName.message}</p>
          )}
        </div>

        {/* Order Index */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Thứ tự <span className="text-red-500">*</span>
          </label>
          <Controller
            name="orderIndex"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                size="large"
                placeholder="1"
                min={1}
                style={{ width: '100%' }}
                status={errors.orderIndex ? 'error' : ''}
              />
            )}
          />
          {errors.orderIndex && (
            <p className="text-red-500 text-sm mt-1">{errors.orderIndex.message}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Thứ tự hiển thị của chương trong khóa học
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default SectionModal;
