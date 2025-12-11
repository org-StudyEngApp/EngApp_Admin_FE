import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Image, Tag, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import courseApi from '../../api/courseApi';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch courses data
  const fetchCourses = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await courseApi.getAllCoursesAdmin({
        page: page - 1, // Backend sử dụng 0-indexed
        size: pageSize,
      });

      setCourses(response.content);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.totalElements,
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1, 10);
  }, []);

  // Handle table change (pagination)
  const handleTableChange = (newPagination) => {
    fetchCourses(newPagination.current, newPagination.pageSize);
  };

  // Handle delete course
  const handleDelete = async (courseId) => {
    try {
      await courseApi.deleteCourse(courseId);
      message.success('Xóa khóa học thành công');
      fetchCourses(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error deleting course:', error);
      message.error('Không thể xóa khóa học');
    }
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Format duration from seconds to hours
  const formatDuration = (seconds) => {
    if (!seconds) return '0 giờ';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Level color mapping
  const getLevelColor = (level) => {
    const colors = {
      BEGINNER: 'green',
      INTERMEDIATE: 'blue',
      ADVANCED: 'orange',
      EXPERT: 'red',
    };
    return colors[level] || 'default';
  };

  // Level text mapping
  const getLevelText = (level) => {
    const texts = {
      BEGINNER: 'Cơ bản',
      INTERMEDIATE: 'Trung cấp',
      ADVANCED: 'Nâng cao',
      EXPERT: 'Chuyên gia',
    };
    return texts[level] || level;
  };

  // Language text mapping
  const getLanguageText = (language) => {
    const texts = {
      VIETNAMESE: 'Tiếng Việt',
      ENGLISH: 'English',
    };
    return texts[language] || language;
  };

  // Table columns
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'courseImageUrl',
      key: 'courseImageUrl',
      width: 100,
      render: (url) => (
        <Image
          src={url || 'https://via.placeholder.com/150'}
          alt="Thumbnail"
          width={80}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/150"
        />
      ),
    },
    {
      title: 'Tên khóa học',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 300,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Giá',
      dataIndex: 'coursePrice',
      key: 'coursePrice',
      width: 150,
      render: (price) => (
        <span className="text-blue-600 font-semibold">{formatPrice(price)}</span>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'courseLevel',
      key: 'courseLevel',
      width: 120,
      render: (level) => (
        <Tag color={getLevelColor(level)}>{getLevelText(level)}</Tag>
      ),
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration) => formatDuration(duration),
    },
    {
      title: 'Học viên',
      dataIndex: 'enrollmentCount',
      key: 'enrollmentCount',
      width: 100,
      render: (count) => <span>{count || 0}</span>,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'averageRating',
      key: 'averageRating',
      width: 100,
      render: (rating) => (
        <span className="text-yellow-500">
          ⭐ {rating ? rating.toFixed(1) : '0.0'}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin/courses/${record.id}/edit`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa khóa học"
            description="Bạn có chắc chắn muốn xóa khóa học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Khóa học</h1>
          <p className="text-gray-600 mt-1">Danh sách tất cả các khóa học</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/admin/courses/new')}
        >
          Tạo khóa học mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="courseId"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} khóa học`,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default CourseList;
