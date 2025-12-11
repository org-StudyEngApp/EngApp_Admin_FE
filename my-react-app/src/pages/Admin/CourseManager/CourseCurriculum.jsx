import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronRight,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Lock,
  Unlock
} from 'lucide-react';
import adminCourseService from '../../../services/adminCourseService';
import SectionModal from './components/SectionModal';
import LessonModal from './components/LessonModal';

const CourseCurriculum = ({ courseId }) => {
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [sectionModal, setSectionModal] = useState({ show: false, section: null });
  const [lessonModal, setLessonModal] = useState({ show: false, sectionId: null, lesson: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, id: null, title: '' });
  
  // Expanded sections
  const [expandedSections, setExpandedSections] = useState(new Set());

  useEffect(() => {
    if (courseId) {
      fetchCurriculum();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Fetch curriculum from course detail
  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminCourseService.getCourseById(courseId);
      
      if (response.data.code === 1000) {
        const sections = response.data.result.sections || [];
        setCurriculum(sections);
        
        // Auto expand all sections
        const allSectionIds = new Set(sections.map(s => s.sectionId));
        setExpandedSections(allSectionIds);
      }
    } catch (err) {
      console.error('Error fetching curriculum:', err);
      setError('Không thể tải nội dung khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle section expand/collapse
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Handle create/edit section
  const handleSaveSection = async (sectionData) => {
    try {
      const payload = {
        ...sectionData,
        courseId: parseInt(courseId)
      };
      
      if (sectionModal.section) {
        // Update existing section
        await adminCourseService.updateSection(sectionModal.section.sectionId, payload);
      } else {
        // Create new section
        await adminCourseService.createSection(payload);
      }
      
      await fetchCurriculum();
      setSectionModal({ show: false, section: null });
      
      return { success: true };
    } catch (err) {
      console.error('Error saving section:', err);
      return { success: false, error: err.response?.data?.message || 'Không thể lưu chương học' };
    }
  };

  // Handle create/edit lesson
  const handleSaveLesson = async (lessonData) => {
    try {
      if (lessonModal.lesson) {
        // Update existing lesson
        await adminCourseService.updateLesson(lessonModal.lesson.lessonId, lessonData);
      } else {
        // Create new lesson
        await adminCourseService.createLesson(lessonModal.sectionId, lessonData);
      }
      
      await fetchCurriculum();
      setLessonModal({ show: false, sectionId: null, lesson: null });
      
      return { success: true };
    } catch (err) {
      console.error('Error saving lesson:', err);
      return { success: false, error: err.response?.data?.message || 'Không thể lưu bài học' };
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      if (deleteModal.type === 'section') {
        await adminCourseService.deleteSection(deleteModal.id);
      } else if (deleteModal.type === 'lesson') {
        await adminCourseService.deleteLesson(deleteModal.id);
      }
      
      await fetchCurriculum();
      setDeleteModal({ show: false, type: null, id: null, title: '' });
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Không thể xóa. Vui lòng thử lại.');
    }
  };

  // Calculate section stats
  const getSectionStats = (section) => {
    const totalLessons = section.lessons?.length || 0;
    const totalDuration = section.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;
    const minutes = Math.floor(totalDuration / 60);
    
    return { totalLessons, minutes };
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get lesson type icon
  const getLessonTypeIcon = (contentType) => {
    switch (contentType) {
      case 'VIDEO':
        return <Video className="w-4 h-4" />;
      case 'TEXT':
        return <FileText className="w-4 h-4" />;
      case 'QUIZ':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!courseId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Vui lòng lưu thông tin khóa học trước khi thêm nội dung.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nội dung khóa học</h2>
          <p className="text-gray-600 mt-1">Quản lý các chương và bài học</p>
        </div>
        <button
          onClick={() => setSectionModal({ show: true, section: null })}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm chương mới
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
        </div>
      ) : curriculum.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có nội dung
          </h3>
          <p className="text-gray-600 mb-4">
            Bắt đầu xây dựng khóa học bằng cách thêm chương học đầu tiên
          </p>
          <button
            onClick={() => setSectionModal({ show: true, section: null })}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm chương đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {curriculum.map((section, sectionIndex) => {
            const stats = getSectionStats(section);
            const isExpanded = expandedSections.has(section.sectionId);

            return (
              <div key={section.sectionId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Section Header */}
                <div className="p-4 flex items-center space-x-3 bg-gray-50 border-b border-gray-200">
                  <button className="cursor-move text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => toggleSection(section.sectionId)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        Chương {sectionIndex + 1}: {section.sectionName}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.totalLessons} bài học • {stats.minutes} phút
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setLessonModal({ show: true, sectionId: section.sectionId, lesson: null })}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Thêm bài học"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSectionModal({ show: true, section })}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Sửa chương"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ 
                        show: true, 
                        type: 'section', 
                        id: section.sectionId, 
                        title: section.sectionName 
                      })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa chương"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Lessons List */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {section.lessons && section.lessons.length > 0 ? (
                      section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.lessonId}
                          className="p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                        >
                          <button className="cursor-move text-gray-400 hover:text-gray-600">
                            <GripVertical className="w-4 h-4" />
                          </button>

                          <div className="flex items-center space-x-2 text-gray-600">
                            {getLessonTypeIcon(lesson.contentType)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {lessonIndex + 1}. {lesson.lessonTitle}
                              </span>
                              {lesson.trial && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                  Học thử
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDuration(lesson.duration)}
                              </span>
                              <span className="flex items-center">
                                {lesson.trial ? (
                                  <Unlock className="w-3 h-3 mr-1" />
                                ) : (
                                  <Lock className="w-3 h-3 mr-1" />
                                )}
                                {lesson.trial ? 'Công khai' : 'Khóa'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setLessonModal({ 
                                show: true, 
                                sectionId: section.sectionId, 
                                lesson 
                              })}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Sửa bài học"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ 
                                show: true, 
                                type: 'lesson', 
                                id: lesson.lessonId, 
                                title: lesson.lessonTitle 
                              })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa bài học"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">Chưa có bài học nào</p>
                        <button
                          onClick={() => setLessonModal({ show: true, sectionId: section.sectionId, lesson: null })}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Thêm bài học đầu tiên
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Section Modal */}
      {sectionModal.show && (
        <SectionModal
          section={sectionModal.section}
          onClose={() => setSectionModal({ show: false, section: null })}
          onSave={handleSaveSection}
        />
      )}

      {/* Lesson Modal */}
      {lessonModal.show && (
        <LessonModal
          sectionId={lessonModal.sectionId}
          lesson={lessonModal.lesson}
          onClose={() => setLessonModal({ show: false, sectionId: null, lesson: null })}
          onSave={handleSaveLesson}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa {deleteModal.type === 'section' ? 'chương' : 'bài học'}{' '}
              <strong>"{deleteModal.title}"</strong>?
              {deleteModal.type === 'section' && (
                <span className="block mt-2 text-red-600 text-sm">
                  ⚠️ Tất cả bài học trong chương này cũng sẽ bị xóa!
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, type: null, id: null, title: '' })}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCurriculum;
