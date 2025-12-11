import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Upload } from 'lucide-react';

const LessonModal = ({ sectionId, lesson, onClose, onSave }) => {
  const isEditMode = !!lesson;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      lessonTitle: '',
      contentType: 'VIDEO',
      videoUrl: '',
      content: '',
      duration: 0,
      trial: false,
      orderIndex: 1
    }
  });

  const [error, setError] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const lessonType = watch('contentType');
  const videoUrl = watch('videoUrl');

  useEffect(() => {
    if (lesson) {
      reset({
        lessonTitle: lesson.lessonTitle || '',
        contentType: lesson.contentType || 'VIDEO',
        videoUrl: lesson.videoUrl || '',
        content: lesson.content || '',
        duration: lesson.duration || 0,
        trial: lesson.trial || false,
        orderIndex: lesson.orderIndex || 1
      });
    }
  }, [lesson, reset]);

  const onSubmit = async (data) => {
    setError(null);
    
    // Chuẩn bị data theo Backend Enum
    const lessonData = {
      lessonTitle: data.lessonTitle,
      contentType: data.contentType,
      trial: data.trial,
      orderIndex: data.orderIndex
    };
    
    // Thêm field theo type
    if (data.contentType === 'VIDEO') {
      lessonData.videoUrl = data.videoUrl;
      lessonData.duration = data.duration;
      lessonData.content = data.content || '';
    } else if (data.contentType === 'TEXT') {
      lessonData.content = data.content;
      lessonData.videoUrl = null;
      lessonData.duration = null;
    } else if (data.contentType === 'QUIZ') {
      lessonData.videoUrl = null;
      lessonData.duration = null;
      lessonData.content = null;
    }
    
    const result = await onSave(lessonData);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  // Handle video upload (giả lập - cần tích hợp với video hosting service)
  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Vui lòng chọn file video');
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError('Kích thước video không được vượt quá 500MB');
      return;
    }

    try {
      setUploadingVideo(true);
      setError(null);

      // TODO: Tích hợp với video hosting service (Cloudinary, AWS S3, etc.)
      // Tạm thời dùng URL local để preview
      const localUrl = URL.createObjectURL(file);
      setValue('videoUrl', localUrl);
      
      console.log('Video ready for upload:', file.name);
      // Trong thực tế, upload và nhận URL từ server
      
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Không thể upload video. Vui lòng thử lại.');
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
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
              Tiêu đề bài học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('lessonTitle', {
                required: 'Vui lòng nhập tiêu đề bài học',
                minLength: {
                  value: 3,
                  message: 'Tiêu đề phải có ít nhất 3 ký tự'
                }
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.lessonTitle ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="VD: Bài 1: Giới thiệu về TOEIC"
            />
            {errors.lessonTitle && (
              <p className="mt-1 text-sm text-red-500">{errors.lessonTitle.message}</p>
            )}
          </div>

          {/* Type and Duration Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lesson Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại bài học <span className="text-red-500">*</span>
              </label>
              <select
                {...register('contentType')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="VIDEO">Video bài giảng</option>
                <option value="TEXT">Tài liệu đọc</option>
                <option value="QUIZ">Bài tập trắc nghiệm</option>
              </select>
            </div>

            {/* Duration - Only for VIDEO type */}
            {lessonType === 'VIDEO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng (giây) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('duration', {
                    min: {
                      value: 0,
                      message: 'Thời lượng không được âm'
                    }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  placeholder="600"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
                )}
              </div>
            )}
            
            {/* Order Index - Only for non-VIDEO types */}
            {lessonType !== 'VIDEO' && (
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
              </div>
            )}
          </div>

          {/* Video URL (only for VIDEO type) */}
          {lessonType === 'VIDEO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL hoặc Upload
              </label>
              
              {/* Video Preview */}
              {videoUrl && (
                <div className="mb-3">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full max-h-64 rounded-lg border border-gray-300"
                    onError={(e) => {
                      console.error('Video load error');
                    }}
                  />
                </div>
              )}

              {/* Upload Button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors mb-3">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={uploadingVideo}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploadingVideo ? (
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                  ) : (
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  )}
                  <span className="text-sm text-gray-600">
                    {uploadingVideo ? 'Đang upload...' : 'Click để upload video'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    MP4, WebM (Max 500MB)
                  </span>
                </label>
              </div>

              {/* Manual URL Input */}
              <input
                type="url"
                {...register('videoUrl', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'URL không hợp lệ'
                  }
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.videoUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Hoặc nhập URL video (YouTube, Vimeo, ...)"
              />
              {errors.videoUrl && (
                <p className="mt-1 text-sm text-red-500">{errors.videoUrl.message}</p>
              )}
            </div>
          )}

          {/* Content - Conditional based on type */}
          {lessonType === 'TEXT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung tài liệu <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('content', {
                  required: lessonType === 'TEXT' ? 'Vui lòng nhập nội dung tài liệu' : false
                })}
                rows={10}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập nội dung chi tiết của bài học..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
          )}
          
          {lessonType === 'VIDEO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả (Optional)
              </label>
              <textarea
                {...register('content')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả ngắn về video..."
              />
            </div>
          )}
          
          {lessonType === 'QUIZ' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Thông báo:</strong> Bạn sẽ thêm câu hỏi ở màn hình chi tiết sau khi tạo bài học.
              </p>
            </div>
          )}

          {/* Options Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Is Trial */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('trial')}
                id="trial"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="trial" className="text-sm font-medium text-gray-700">
                Cho phép học thử miễn phí
              </label>
            </div>

            {/* Order Index - Show for VIDEO type */}
            {lessonType === 'VIDEO' && (
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
              </div>
            )}
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
                isEditMode ? 'Cập nhật' : 'Thêm bài học'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonModal;
