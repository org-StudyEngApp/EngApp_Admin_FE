import React, { useState, useEffect } from 'react';
import { Tabs, Button } from 'antd';
import { ArrowLeftOutlined, InfoCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CourseForm from './CourseForm';
import CurriculumBuilder from './CurriculumBuilder';

const CourseEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('info');

  const isEditMode = !!id;
  const canAccessCurriculum = isEditMode; // Tab 2 chỉ mở khi đã có courseId

  // Check if should open curriculum tab (after creating course)
  useEffect(() => {
    if (location.state?.openCurriculumTab && isEditMode) {
      setActiveTab('curriculum');
    }
  }, [location.state, isEditMode]);

  const tabItems = [
    {
      key: 'info',
      label: (
        <span>
          <InfoCircleOutlined /> Thông tin khóa học
        </span>
      ),
      children: <CourseForm courseId={id} />,
    },
    {
      key: 'curriculum',
      label: (
        <span>
          <BookOutlined /> Nội dung khóa học
        </span>
      ),
      children: canAccessCurriculum ? (
        <CurriculumBuilder courseId={id} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            Vui lòng lưu thông tin khóa học trước khi thêm nội dung
          </p>
          <p className="text-gray-400">
            Tab này sẽ được mở khóa sau khi bạn tạo khóa học thành công
          </p>
        </div>
      ),
      disabled: !canAccessCurriculum,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/courses')}
          className="mb-4"
        >
          Quay lại danh sách
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? 'Cập nhật thông tin và nội dung khóa học'
            : 'Tạo khóa học mới và xây dựng nội dung'}
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
    </div>
  );
};

export default CourseEditor;
