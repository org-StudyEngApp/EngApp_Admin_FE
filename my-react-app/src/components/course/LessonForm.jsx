// src/components/course/LessonForm.js
import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Upload,
  message,
  Row,
  Col
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import CourseService from '../../services/CourseService';

const { TextArea } = Input;
const { Option } = Select;

const LessonForm = ({ 
  visible, 
  onClose, 
  onSuccess, 
  sectionId, 
  editingLesson = null 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleSubmit = async (values) => {
    console.log('Lesson form submitted:', values);
    
    setLoading(true);
    try {
      const lessonData = {
        lessonTitle: values.lessonTitle,
        content: values.content || '',
        videoUrl: videoUrl || null,
        contentType: values.contentType || 'TEXT',
        orderIndex: values.orderIndex || 1,
        sectionId: sectionId
      };

      console.log('Lesson data:', lessonData);

      let response;
      if (editingLesson) {
        response = await CourseService.updateLesson(editingLesson.id, lessonData);
      } else {
        response = await CourseService.createLesson(lessonData);
      }

      console.log('Lesson API response:', response);

      if (response.success) {
        message.success(response.message || 'Lưu bài học thành công!');
        form.resetFields();
        setVideoUrl('');
        onClose();
        onSuccess && onSuccess();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Lesson form error:', error);
      message.error('Có lỗi xảy ra khi lưu bài học');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (file) => {
    console.log('Uploading video:', file);
    
    // Validate file type
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      message.error('Chỉ chấp nhận file video!');
      return;
    }

    // Validate file size (max 100MB)
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error('Video phải nhỏ hơn 100MB!');
      return;
    }

    try {
      setUploadLoading(true);
      
      // Tạo URL tạm thời để preview
      const tempUrl = URL.createObjectURL(file);
      setVideoUrl(tempUrl);
      message.success('Upload video thành công');
      
      // TODO: Implement actual upload to server
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await CourseService.uploadLessonVideo(file);
      // if (response.success) {
      //   setVideoUrl(response.data.url);
      //   message.success('Upload video thành công');
      // }
    } catch (error) {
      console.error('Upload video error:', error);
      message.error('Lỗi khi upload video');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setVideoUrl('');
    onClose();
  };

  // Set form values when editing
  React.useEffect(() => {
    if (visible && editingLesson) {
      form.setFieldsValue({
        lessonTitle: editingLesson.lessonTitle,
        content: editingLesson.content,
        contentType: editingLesson.contentType,
        orderIndex: editingLesson.orderIndex
      });
      setVideoUrl(editingLesson.videoUrl || '');
    } else if (visible && !editingLesson) {
      form.resetFields();
      setVideoUrl('');
    }
  }, [visible, editingLesson, form]);

  return (
    <Modal
      title={editingLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tiêu đề bài học"
              name="lessonTitle"
              rules={[
                { required: true, message: 'Vui lòng nhập tiêu đề bài học!' },
                { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự!' }
              ]}
            >
              <Input placeholder="Nhập tiêu đề bài học" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại nội dung"
              name="contentType"
              rules={[{ required: true, message: 'Vui lòng chọn loại nội dung!' }]}
              initialValue="TEXT"
            >
              <Select placeholder="Chọn loại nội dung">
                <Option value="VIDEO">Video</Option>
                <Option value="TEXT">Văn bản</Option>
                <Option value="QUIZ">Bài kiểm tra</Option>
                <Option value="ASSIGNMENT">Bài tập</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Thứ tự hiển thị"
              name="orderIndex"
              rules={[
                { type: 'number', min: 1, message: 'Thứ tự phải lớn hơn 0!' }
              ]}
              initialValue={1}
            >
              <InputNumber
                min={1}
                placeholder="Nhập thứ tự hiển thị"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Nội dung bài học"
          name="content"
          rules={[
            { required: true, message: 'Vui lòng nhập nội dung bài học!' }
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập nội dung bài học"
          />
        </Form.Item>

        <Form.Item label="Video bài học (tùy chọn)">
          <div>
            {videoUrl && (
              <div style={{ marginBottom: 16 }}>
                <video
                  width="100%"
                  height="200"
                  controls
                  src={videoUrl}
                  style={{ borderRadius: 4, backgroundColor: '#f0f0f0' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            <Upload
              name="file"
              accept="video/*"
              maxCount={1}
              showUploadList={false}
              beforeUpload={(file) => {
                handleVideoUpload(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />} loading={uploadLoading}>
                {videoUrl ? 'Thay đổi video' : 'Upload video'}
              </Button>
            </Upload>
            {videoUrl && (
              <Button 
                style={{ marginLeft: 8 }} 
                onClick={() => setVideoUrl('')}
              >
                Xóa video
              </Button>
            )}
          </div>
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
          <Space>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingLesson ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LessonForm;
