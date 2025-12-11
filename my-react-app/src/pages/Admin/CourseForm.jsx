import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, InputNumber, Select, Button, message, Upload } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import courseApi from '../../api/courseApi';

const { TextArea } = Input;
const { Option } = Select;

// Validation schema with Yup
const courseSchema = yup.object().shape({
  courseName: yup
    .string()
    .required('Vui lòng nhập tên khóa học')
    .min(5, 'Tên khóa học phải có ít nhất 5 ký tự')
    .max(200, 'Tên khóa học không quá 200 ký tự'),
  courseDescription: yup
    .string()
    .max(5000, 'Mô tả không quá 5000 ký tự')
    .default(''),
  coursePrice: yup
    .number()
    .required('Vui lòng nhập giá khóa học')
    .min(0, 'Giá phải lớn hơn hoặc bằng 0')
    .typeError('Giá phải là số'),
  courseLevel: yup
    .string()
    .required('Vui lòng chọn cấp độ')
    .oneOf(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], 'Cấp độ không hợp lệ'),
  courseImageUrl: yup
    .string()
    .transform((value) => value || '')
    .test('is-url-or-empty', 'URL không hợp lệ', (value) => {
      if (!value || value === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .default(''),
  free: yup.boolean().default(false),
  published: yup.boolean().default(false),
});

const CourseForm = ({ courseId }) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Use courseId prop if provided, otherwise fallback to URL param
  const id = courseId || paramId;
  const isEditMode = !!id;
  
  console.log('CourseForm - courseId prop:', courseId, 'paramId:', paramId, 'final id:', id, 'isEditMode:', isEditMode);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: {
      courseName: '',
      courseDescription: '',
      coursePrice: 0,
      courseLevel: 'BEGINNER',
      courseImageUrl: '',
      free: false,
      published: false,
    },
  });

  // Watch courseImageUrl for preview
  const courseImageUrl = watch('courseImageUrl');

  // Level options
  const levelOptions = [
    { value: 'BEGINNER', label: 'Cơ bản (Beginner)' },
    { value: 'INTERMEDIATE', label: 'Trung cấp (Intermediate)' },
    { value: 'ADVANCED', label: 'Nâng cao (Advanced)' },
  ];

  // Fetch course data for edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      console.log('Fetching course with id:', id);
      const data = await courseApi.getCourseByIdAdmin(id);
      console.log('Course data received:', data);

      // Set form values
      setValue('courseName', data.courseName || '');
      setValue('courseDescription', data.courseDescription || '');
      setValue('coursePrice', data.coursePrice || 0);
      setValue('courseImageUrl', data.courseImageUrl || '');
      setValue('courseLevel', data.courseLevel || 'BEGINNER');
      setValue('free', data.free || false);
      setValue('published', data.published || false);

      // Set thumbnail preview if exists
      if (data.courseImageUrl) {
        setFileList([
          {
            uid: '-1',
            name: 'thumbnail.jpg',
            status: 'done',
            url: data.courseImageUrl,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      message.error('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const onSubmit = async (values) => {
    try {
      const courseData = {
        courseName: values.courseName,
        courseDescription: values.courseDescription || '',
        coursePrice: values.coursePrice,
        courseImageUrl: values.courseImageUrl || '',
        courseLevel: values.courseLevel,
        free: values.free || false,
        published: values.published || false,
      };

      if (isEditMode) {
        // Update existing course
        console.log('Updating course with id:', id, 'data:', courseData);
        await courseApi.updateCourse(id, courseData);
        message.success({
          content: 'Cập nhật khóa học thành công!',
          duration: 3,
        });
        // Reload data to show updated info
        await fetchCourseData();
      } else {
        // Create new course
        const response = await courseApi.createCourse(courseData);
        message.success('Tạo khóa học mới thành công');
        
        // Get courseId from response and navigate to edit mode (unlock Tab 2)
        if (response && response.id) {
          navigate(`/admin/courses/${response.id}/edit`, { 
            state: { openCurriculumTab: true } 
          });
        } else {
          navigate('/admin/courses');
        }
        return;
      }
    } catch (error) {
      console.error('Error saving course:', error);
      message.error(
        isEditMode ? 'Không thể cập nhật khóa học' : 'Không thể tạo khóa học mới'
      );
    }
  };

  // Handle upload change (for preview only)
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].url) {
      setValue('courseImageUrl', newFileList[0].url);
    }
  };

  // Custom upload request (prevent auto upload)
  const customRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow">
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : (
          <>
            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Tên khóa học <span className="text-red-500">*</span>
              </label>
              <Controller
                name="courseName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    placeholder="VD: Luyện thi TOEIC 700+"
                    showCount
                    maxLength={200}
                    status={errors.courseName ? 'error' : ''}
                  />
                )}
              />
              {errors.courseName && (
                <p className="text-red-500 text-sm mt-1">{errors.courseName.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mô tả khóa học</label>
              <Controller
                name="courseDescription"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    rows={6}
                    placeholder="Nhập mô tả chi tiết về khóa học..."
                    showCount
                    maxLength={5000}
                    status={errors.courseDescription ? 'error' : ''}
                  />
                )}
              />
              {errors.courseDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.courseDescription.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Giá khóa học (VND) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="coursePrice"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      size="large"
                      placeholder="500000"
                      style={{ width: '100%' }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/,/g, '')}
                      status={errors.coursePrice ? 'error' : ''}
                    />
                  )}
                />
                {errors.coursePrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.coursePrice.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Level */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cấp độ <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="courseLevel"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      size="large"
                      placeholder="Chọn cấp độ"
                      style={{ width: '100%' }}
                      status={errors.courseLevel ? 'error' : ''}
                    >
                      {levelOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
                {errors.courseLevel && (
                  <p className="text-red-500 text-sm mt-1">{errors.courseLevel.message}</p>
                )}
              </div>
            </div>

            {/* Free and Published checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Controller
                  name="free"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Khóa học miễn phí</span>
                    </label>
                  )}
                />
              </div>
              <div>
                <Controller
                  name="published"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Xuất bản khóa học</span>
                    </label>
                  )}
                />
              </div>
            </div>

            {/* Thumbnail URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">URL Ảnh đại diện</label>
              <div className="flex gap-2">
                <Controller
                  name="courseImageUrl"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                      status={errors.courseImageUrl ? 'error' : ''}
                    />
                  )}
                />
                <Upload
                  fileList={fileList}
                  onChange={handleUploadChange}
                  customRequest={customRequest}
                  maxCount={1}
                  accept="image/*"
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />} size="large">
                    Upload
                  </Button>
                </Upload>
              </div>
              {errors.courseImageUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.courseImageUrl.message}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Nhập URL ảnh đại diện hoặc upload ảnh lên Cloudinary
              </p>
            </div>

            {/* Thumbnail Preview */}
            {courseImageUrl && (
              <div className="mb-4">
                <img
                  src={courseImageUrl}
                  alt="Thumbnail preview"
                  className="max-w-xs rounded-lg border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                loading={isSubmitting}
              >
                {isEditMode ? 'Cập nhật' : 'Tạo khóa học'}
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/admin/courses')}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default CourseForm;
