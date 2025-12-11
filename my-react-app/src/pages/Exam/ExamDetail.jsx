import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Trash2 } from 'lucide-react';
import AdminExamService from '../../services/AdminExamService';

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamDetail();
  }, [id]);

  const fetchExamDetail = async () => {
    setLoading(true);
    try {
      const examData = await AdminExamService.getExamDetail(id);
      setExam(examData);
    } catch (error) {
      console.error('Error fetching exam detail:', error);
      alert('Có lỗi xảy ra khi tải chi tiết bài thi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bài thi</h2>
          <button 
            onClick={() => navigate('/admin/tests')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/tests')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết bài thi</h1>
            <p className="text-gray-600">{exam.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/exams/${id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit size={16} />
            Chỉnh sửa
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Copy size={16} />
            Sao chép
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Xóa
          </button>
        </div>
      </div>

      {/* Exam Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Tiêu đề</label>
            <p className="text-lg text-gray-900">{exam.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Cấp độ</label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {exam.level}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Mô tả</label>
            <p className="text-gray-900">{exam.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Thời gian</label>
            <p className="text-gray-900">{exam.durationTimes} phút</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Số câu hỏi</label>
            <p className="text-gray-900">{exam.totalQuestions} câu</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Số phần</label>
            <p className="text-gray-900">{exam.totalParts} phần</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;

