import React, { useState, useEffect } from 'react';
import { Collapse, Button, Space, Popconfirm, message, Tag, Empty } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import courseApi from '../../api/courseApi';
import SectionModal from './SectionModal';
import LessonModal from './CourseManager/components/LessonModal';

const { Panel } = Collapse;

const CurriculumBuilder = ({ courseId }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadCurriculum();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Load curriculum structure
  const loadCurriculum = async () => {
    setLoading(true);
    try {
      const data = await courseApi.getCourseByIdAdmin(courseId);
      console.log('Curriculum data loaded:', data);
      setSections(data.sections || []);
    } catch (error) {
      console.error('Error loading curriculum:', error);
      message.error('Không thể tải nội dung khóa học');
    } finally {
      setLoading(false);
    }
  };

  // Section handlers
  const handleAddSection = () => {
    setEditingSection(null);
    setSectionModalVisible(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionModalVisible(true);
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      await courseApi.deleteSection(sectionId);
      message.success('Xóa chương thành công');
      loadCurriculum();
    } catch (error) {
      console.error('Error deleting section:', error);
      message.error('Không thể xóa chương');
    }
  };

  const handleSectionModalClose = (shouldReload) => {
    setSectionModalVisible(false);
    setEditingSection(null);
    if (shouldReload) {
      loadCurriculum();
    }
  };

  // Lesson handlers
  const handleAddLesson = (sectionId) => {
    setCurrentSectionId(sectionId);
    setEditingLesson(null);
    setLessonModalVisible(true);
  };

  const handleEditLesson = (lesson, sectionId) => {
    setCurrentSectionId(sectionId);
    setEditingLesson(lesson);
    setLessonModalVisible(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await courseApi.deleteLesson(lessonId);
      message.success('Xóa bài học thành công');
      loadCurriculum();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      message.error('Không thể xóa bài học');
    }
  };

  const handleLessonSave = async (lessonData) => {
    try {
      if (editingLesson) {
        // Update existing lesson
        const lessonId = editingLesson.lessonId || editingLesson.id;
        await courseApi.updateLesson(lessonId, lessonData);
        message.success('Cập nhật bài học thành công');
      } else {
        // Create new lesson
        await courseApi.createLesson(currentSectionId, lessonData);
        message.success('Thêm bài học mới thành công');
      }
      
      await loadCurriculum();
      setLessonModalVisible(false);
      setEditingLesson(null);
      setCurrentSectionId(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving lesson:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const handleLessonModalClose = (shouldReload) => {
    setLessonModalVisible(false);
    setEditingLesson(null);
    setCurrentSectionId(null);
    if (shouldReload) {
      loadCurriculum();
    }
  };

  // Get lesson type icon and label
  const getLessonTypeDisplay = (type) => {
    const types = {
      VIDEO: { icon: <PlayCircleOutlined />, label: 'Video', color: 'blue' },
      TEXT: { icon: <FileTextOutlined />, label: 'Tài liệu', color: 'green' },
      QUIZ: { icon: <QuestionCircleOutlined />, label: 'Quiz', color: 'orange' },
    };
    return types[type] || types.VIDEO;
  };

  // Format duration from seconds
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="curriculum-builder">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Nội dung khóa học</h2>
          <p className="text-gray-600">Quản lý chương và bài học</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddSection}
          size="large"
        >
          Thêm chương mới
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : sections.length === 0 ? (
        <Empty
          description="Chưa có chương nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSection}>
            Tạo chương đầu tiên
          </Button>
        </Empty>
      ) : (
        <Collapse accordion>
          {sections.map((section, sectionIndex) => (
            <Panel
              header={
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    Chương {sectionIndex + 1}: {section.sectionName}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {section.lessons?.length || 0} bài học
                  </span>
                </div>
              }
              key={section.id}
              extra={
                <Space size="small" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditSection(section)}
                  />
                  <Popconfirm
                    title="Xóa chương"
                    description="Bạn có chắc chắn muốn xóa chương này?"
                    onConfirm={() => handleDeleteSection(section.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              }
            >
              {/* Section Description */}
              {section.description && (
                <p className="text-gray-600 mb-4">{section.description}</p>
              )}

              {/* Lessons List */}
              <div className="space-y-2">
                {section.lessons && section.lessons.length > 0 ? (
                  section.lessons.map((lesson, lessonIndex) => {
                    const typeDisplay = getLessonTypeDisplay(lesson.contentType);
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-gray-500 font-mono text-sm">
                            {lessonIndex + 1}
                          </span>
                          <span className="text-lg">{typeDisplay.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{lesson.lessonTitle}</div>
                            <Space size="small" className="text-sm text-gray-500">
                              <Tag color={typeDisplay.color}>{typeDisplay.label}</Tag>
                              {lesson.duration > 0 && (
                                <span>{formatDuration(lesson.duration)}</span>
                              )}
                              {lesson.trial && (
                                <Tag color="green">Học thử miễn phí</Tag>
                              )}
                            </Space>
                          </div>
                        </div>
                        <Space size="small">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditLesson(lesson, section.id)}
                          />
                          <Popconfirm
                            title="Xóa bài học"
                            description="Bạn có chắc chắn muốn xóa bài học này?"
                            onConfirm={() => handleDeleteLesson(lesson.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </Space>
                      </div>
                    );
                  })
                ) : (
                  <Empty
                    description="Chưa có bài học nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>

              {/* Add Lesson Button */}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => handleAddLesson(section.id)}
                className="w-full mt-4"
              >
                Thêm bài học
              </Button>
            </Panel>
          ))}
        </Collapse>
      )}

      {/* Modals */}
      <SectionModal
        visible={sectionModalVisible}
        courseId={courseId}
        section={editingSection}
        onClose={handleSectionModalClose}
      />

      {lessonModalVisible && (
        <LessonModal
          sectionId={currentSectionId}
          lesson={editingLesson}
          onClose={handleLessonModalClose}
          onSave={handleLessonSave}
        />
      )}
    </div>
  );
};

export default CurriculumBuilder;
