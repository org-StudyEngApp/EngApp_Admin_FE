import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, List, Settings } from 'lucide-react';
import CourseInfoForm from './CourseInfoForm';
import CourseCurriculum from './CourseCurriculum';
import adminCourseService from '../../../services/adminCourseService';

const CourseEditor = () => {
  const { id } = useParams(); // courseId từ URL nếu là edit mode
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'curriculum' | 'settings'
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(id || null);

  // Tabs configuration
  const tabs = [
    { 
      id: 'info', 
      label: 'Thông tin khóa học', 
      icon: BookOpen,
      disabled: false 
    },
    { 
      id: 'curriculum', 
      label: 'Nội dung khóa học', 
      icon: List,
      disabled: !currentCourseId // Chỉ mở khi đã có courseId
    },
    { 
      id: 'settings', 
      label: 'Cài đặt', 
      icon: Settings,
      disabled: !currentCourseId 
    }
  ];

  // Fetch course data
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await adminCourseService.getCourseById(id);
      
      if (response.data.code === 1000) {
        setCourseData(response.data.result);
      }
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load course data nếu là edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCourseData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Callback khi tạo course mới thành công
  const handleCourseCreated = (courseId, courseResult) => {
    console.log('Course created with ID:', courseId);
    setCurrentCourseId(courseId);
    setCourseData(courseResult);
    
    // Chuyển sang tab Curriculum
    setActiveTab('curriculum');
    
    // Update URL (optional)
    navigate(`/admin/courses/${courseId}/edit`, { replace: true });
  };

  // Callback khi update thành công
  const handleUpdateSuccess = (updatedData) => {
    console.log('Course updated:', updatedData);
    setCourseData(updatedData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/courses')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
                </h1>
                {courseData?.title && (
                  <p className="text-sm text-gray-600">{courseData.title}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {currentCourseId && (
                <button
                  onClick={() => navigate(`/admin/courses/${currentCourseId}`)}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Xem trước
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`
                    flex items-center space-x-2 py-4 border-b-2 transition-colors
                    ${isActive 
                      ? 'border-blue-600 text-blue-600' 
                      : isDisabled
                        ? 'border-transparent text-gray-400 cursor-not-allowed'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {isDisabled && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                      Chưa khả dụng
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'info' && (
              <CourseInfoForm
                courseId={currentCourseId}
                initialData={courseData}
                onSuccess={handleUpdateSuccess}
                onCourseCreated={handleCourseCreated}
              />
            )}

            {activeTab === 'curriculum' && (
              <CourseCurriculum courseId={currentCourseId} />
            )}

            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Cài đặt khóa học
                </h3>
                <p className="text-gray-600">
                  Tính năng này đang được phát triển...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;
