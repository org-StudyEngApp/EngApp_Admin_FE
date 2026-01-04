import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Clock,
  BookOpen,
  Headphones,
  CheckCircle2,
  FileText,
  Volume2
} from 'lucide-react';
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
      const data = await AdminExamService.getExamDetail(id);
      setExam(data);
    } catch (error) {
      console.error('Error fetching exam:', error);
      alert('Không thể tải thông tin bài thi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài thi này?')) {
      return;
    }

    try {
      await AdminExamService.deleteExam(id);
      alert('Xóa bài thi thành công!');
      navigate('/admin/tests');
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Có lỗi khi xóa bài thi');
    }
  };

  const getExamTypeIcon = (type) => {
    switch (type) {
      case 'READING':
        return <BookOpen className="w-5 h-5" />;
      case 'LISTENING':
        return <Headphones className="w-5 h-5" />;
      case 'FULL_TEST':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getExamTypeColor = (type) => {
    switch (type) {
      case 'READING':
        return 'bg-blue-100 text-blue-800';
      case 'LISTENING':
        return 'bg-purple-100 text-purple-800';
      case 'FULL_TEST':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const parseOptions = (optionString) => {
    try {
      return JSON.parse(optionString);
    } catch {
      return [];
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
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Không tìm thấy bài thi</p>
          <button
            onClick={() => navigate('/admin/tests')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = exam.parts?.reduce((sum, part) => sum + (part.questions?.length || 0), 0) || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/tests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getExamTypeColor(exam.examType)}`}>
                {getExamTypeIcon(exam.examType)}
                {exam.examType === 'READING' ? 'Reading' : exam.examType === 'LISTENING' ? 'Listening' : 'Full Test'}
              </span>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(exam.level)}`}>
                {exam.level}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/admin/exams/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-5 h-5" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-5 h-5" />
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Thời gian</p>
              <p className="text-lg font-bold text-gray-900">{exam.durationTimes} phút</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Số phần</p>
              <p className="text-lg font-bold text-gray-900">{exam.parts?.length || 0} phần</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng câu hỏi</p>
              <p className="text-lg font-bold text-gray-900">{totalQuestions} câu</p>
            </div>
          </div>
        </div>

        {exam.description && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Mô tả</h3>
            <p className="text-gray-600">{exam.description}</p>
          </div>
        )}

        {exam.instructions && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Hướng dẫn</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{exam.instructions}</p>
          </div>
        )}

        {exam.requirements && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Yêu cầu</h3>
            <p className="text-gray-600">{exam.requirements}</p>
          </div>
        )}
      </div>

      {/* Parts and Questions */}
      {exam.parts && exam.parts.length > 0 && (
        <div className="space-y-6">
          {exam.parts.map((part, partIndex) => (
            <div key={part.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Part Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      <span className="text-blue-600">Phần {partIndex + 1}:</span> {part.title}
                    </h3>
                    {part.description && (
                      <p className="text-sm text-gray-600 mt-1">{part.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {part.timeLimit && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {part.timeLimit} phút
                      </div>
                    )}
                    <div>{part.questions?.length || 0} câu hỏi</div>
                  </div>
                </div>
                {part.instructions && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">{part.instructions}</p>
                  </div>
                )}
              </div>

              {/* Questions */}
              <div className="p-4">
                {part.questions && part.questions.length > 0 ? (
                  <div className="space-y-4">
                    {part.questions.map((question, qIndex) => {
                      const options = parseOptions(question.option);
                      
                      return (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Câu {qIndex + 1}</h4>
                            <span className="text-sm text-gray-500">{question.points || 1} điểm</span>
                          </div>

                          {/* Media */}
                          {question.imageUrl && (
                            <div className="mb-3">
                              <img
                                src={question.imageUrl}
                                alt="Question"
                                className="max-w-md h-auto rounded-lg border border-gray-300"
                              />
                            </div>
                          )}

                          {question.audioUrl && (
                            <div className="mb-3 flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <Volume2 className="w-5 h-5 text-blue-600" />
                              <audio src={question.audioUrl} controls className="flex-1" />
                            </div>
                          )}

                          {/* Question Text */}
                          <p className="text-gray-900 mb-3 whitespace-pre-wrap">{question.questionText}</p>

                          {/* Options */}
                          {options.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                                <div
                                  key={letter}
                                  className={`flex items-start gap-2 p-2 rounded ${
                                    question.correctAnswer === letter
                                      ? 'bg-green-50 border border-green-300'
                                      : 'bg-gray-50'
                                  }`}
                                >
                                  <span className="font-medium text-gray-700 min-w-[24px]">{letter}.</span>
                                  <span className={question.correctAnswer === letter ? 'text-green-900 font-medium' : 'text-gray-700'}>
                                    {options[idx] || ''}
                                  </span>
                                  {question.correctAnswer === letter && (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Explanation */}
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                              <p className="text-sm font-medium text-yellow-900 mb-1">Giải thích:</p>
                              <p className="text-sm text-yellow-800">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Chưa có câu hỏi</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(!exam.parts || exam.parts.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Bài thi chưa có phần thi nào</p>
          <button
            onClick={() => navigate(`/admin/exams/${id}/edit`)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Thêm phần thi ngay
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamDetail;
