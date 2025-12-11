import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, Upload, Loader2, Check } from 'lucide-react';
import adminCourseService from '../../../services/adminCourseService';

const CourseInfoForm = ({ 
  courseId = null, 
  initialData = null, 
  onSuccess,
  onCourseCreated // Callback khi tạo course mới thành công (trả về courseId)
}) => {
  const isEditMode = !!courseId;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      courseName: '',
      courseDescription: '',
      coursePrice: '',
      courseImageUrl: '',
      topicGroupId: '',
      courseLevel: 'BEGINNER',
      free: false,
      published: false
    }
  });

  const [topicGroups, setTopicGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Watch thumbnailUrl để preview
  const courseImageUrl = watch('courseImageUrl');

  // Fetch topic groups khi component mount
  useEffect(() => {
    fetchTopicGroups();
  }, []);

  // Load dữ liệu khóa học nếu là edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      reset({
        courseName: initialData.courseName || '',
        courseDescription: initialData.courseDescription || '',
        coursePrice: initialData.coursePrice || '',
        courseImageUrl: initialData.courseImageUrl || '',
        topicGroupId: initialData.topicGroupId || '',
        courseLevel: initialData.courseLevel || 'BEGINNER',
        free: initialData.free || false,
        published: initialData.published || false
      });
    }
  }, [isEditMode, initialData, reset]);

  // Fetch danh sách TopicGroup
  const fetchTopicGroups = async () => {
    try {
      const response = await adminCourseService.getTopicGroups();
      
      if (response.data.code === 1000) {
        setTopicGroups(response.data.result || []);
      }
    } catch (err) {
      console.error('Error fetching topic groups:', err);
      setError('Không thể tải danh sách chủ đề');
    }
  };

  // Handle upload image (giả lập - bạn cần tích hợp với Cloudinary hoặc service khác)
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      // TODO: Tích hợp với Cloudinary hoặc service upload của bạn
      // Ví dụ giả lập:
      const formData = new FormData();
      formData.append('file', file);
      
      // Giả lập upload (thay thế bằng API thực tế)
      // const response = await uploadToCloudinary(formData);
      // setValue('thumbnailUrl', response.data.url);
      
      // Tạm thời dùng URL local để preview
      const localUrl = URL.createObjectURL(file);
      setValue('courseImageUrl', localUrl);
      
      console.log('File ready for upload:', file.name);
      // Trong thực tế, bạn sẽ upload và nhận URL từ server
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Không thể upload hình ảnh. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submit
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Prepare payload
      const payload = {
        courseName: data.courseName,
        courseDescription: data.courseDescription,
        coursePrice: parseFloat(data.coursePrice),
        courseImageUrl: data.courseImageUrl,
        courseLevel: data.courseLevel || 'BEGINNER',
        free: data.free || false,
        published: data.published || false
      };

      // Only include topicGroupId if it's provided
      if (data.topicGroupId) {
        payload.topicGroupId = parseInt(data.topicGroupId);
      }

      let response;

      if (isEditMode) {
        // Update existing course
        response = await adminCourseService.updateCourse(courseId, payload);
        
        if (response.data.code === 1000) {
          setSuccess(true);
          
          // Show success message
          setTimeout(() => {
            if (onSuccess) onSuccess(response.data.result);
          }, 1000);
        }
      } else {
        // Create new course
        response = await adminCourseService.createCourse(payload);
        
        if (response.data.code === 1000) {
          const newCourseId = response.data.result.courseId;
          setSuccess(true);
          
          // Callback với courseId mới để chuyển sang Tab 2
          setTimeout(() => {
            if (onCourseCreated) {
              onCourseCreated(newCourseId, response.data.result);
            }
          }, 1000);
        }
      }

    } catch (err) {
      console.error('Error saving course:', err);
      setError(
        err.response?.data?.message || 
        `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} khóa học. Vui lòng thử lại.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 text-sm">
              {isEditMode ? 'Cập nhật khóa học thành công!' : 'Tạo khóa học thành công! Đang chuyển sang tab Curriculum...'}
            </p>
          </div>
        )}

          {/* Title Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên khóa học <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('courseName', {
              required: 'Vui lòng nhập tên khóa học',
              minLength: {
                value: 5,
                message: 'Tên khóa học phải có ít nhất 5 ký tự'
              },
              maxLength: {
                value: 200,
                message: 'Tên khóa học không được vượt quá 200 ký tự'
              }
            })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.courseName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="VD: Luyện thi TOEIC 500+"
          />
          {errors.courseName && (
            <p className="mt-1 text-sm text-red-500">{errors.courseName.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả khóa học <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('courseDescription', {
              required: 'Vui lòng nhập mô tả khóa học',
              minLength: {
                value: 20,
                message: 'Mô tả phải có ít nhất 20 ký tự'
              }
            })}
            rows={5}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.courseDescription ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập mô tả chi tiết về khóa học..."
          />
          {errors.courseDescription && (
            <p className="mt-1 text-sm text-red-500">{errors.courseDescription.message}</p>
          )}
        </div>

        {/* Price, Level and Topic Group Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Price Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá khóa học (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('coursePrice', {
                required: 'Vui lòng nhập giá khóa học',
                min: {
                  value: 0,
                  message: 'Giá không được âm'
                },
                max: {
                  value: 100000000,
                  message: 'Giá không được vượt quá 100.000.000 VND'
                }
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.coursePrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="500000"
              min="0"
              step="1000"
            />
            {errors.coursePrice && (
              <p className="mt-1 text-sm text-red-500">{errors.coursePrice.message}</p>
            )}
          </div>

          {/* Course Level Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cấp độ <span className="text-red-500">*</span>
            </label>
            <select
              {...register('courseLevel')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          {/* Topic Group Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ đề
            </label>
            <select
              {...register('topicGroupId')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn chủ đề (tùy chọn) --</option>
              {topicGroups.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('free')}
              id="free"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="free" className="text-sm font-medium text-gray-700">
              Miễn phí
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('published')}
              id="published"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Xuất bản ngay
            </label>
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh khóa học
          </label>
          
          <div className="flex items-start space-x-4">
            {/* Preview */}
            {courseImageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={courseImageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image';
                  }}
                />
              </div>
            )}

            {/* Upload Button */}
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                  ) : (
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  )}
                  <span className="text-sm text-gray-600">
                    {uploadingImage ? 'Đang upload...' : 'Click để upload hình ảnh'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG (Max 5MB)
                  </span>
                </label>
              </div>

              {/* Manual URL Input */}
              <div className="mt-3">
                <input
                  type="url"
                  {...register('courseImageUrl', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'URL không hợp lệ'
                    }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    errors.courseImageUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Hoặc nhập URL hình ảnh"
                />
                {errors.courseImageUrl && (
                  <p className="mt-1 text-sm text-red-500">{errors.courseImageUrl.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                {isEditMode ? 'Lưu thay đổi' : 'Lưu & Tiếp tục'}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CourseInfoForm;
