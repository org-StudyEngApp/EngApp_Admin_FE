import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Clock,
  FileText,
  Headphones,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import AdminExamService from '../../services/AdminExamService';

const EXAM_TYPES = {
  ALL: { value: '', label: 'Tất cả', icon: FileText },
  READING: { value: 'READING', label: 'Reading', icon: BookOpen },
  LISTENING: { value: 'LISTENING', label: 'Listening', icon: Headphones },
  FULL_TEST: { value: 'FULL_TEST', label: 'Full Test', icon: CheckCircle2 }
};

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const ExamManagement = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchExams();
  }, [selectedExamType]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await AdminExamService.getAllExams(selectedExamType || null);
      setExams(response);
    } catch (error) {
      console.error('Error fetching exams:', error);
      alert('Có lỗi xảy ra khi tải danh sách bài thi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = () => {
    navigate('/admin/exams/create');
  };

  const handleEditExam = (examId) => {
    navigate(`/admin/exams/${examId}/edit`);
  };

  const handleViewExam = (examId) => {
    navigate(`/admin/exams/${examId}`);
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài thi này? Hành động này không thể hoàn tác.')) {
      try {
        await AdminExamService.deleteExam(examId);
        setExams(exams.filter(exam => exam.id !== examId));
        alert('Xóa bài thi thành công!');
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Có lỗi xảy ra khi xóa bài thi: ' + error.message);
      }
    }
  };

  // Filter exams based on search and level
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !selectedLevel || exam.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const getExamTypeInfo = (examType) => {
    return EXAM_TYPES[examType] || EXAM_TYPES.READING;
  };

  const getExamTypeColor = (examType) => {
    switch (examType) {
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Bài thi TOEIC</h1>
        <p className="text-gray-600">Quản lý bài thi Reading, Listening và Full Test</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Exam Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(EXAM_TYPES).map(([key, type]) => {
              const Icon = type.icon;
              const isActive = selectedExamType === type.value;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedExamType(type.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả cấp độ</option>
            {LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          {/* Create Button */}
          <button
            onClick={handleCreateExam}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Tạo bài thi</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng số bài thi</p>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reading</p>
              <p className="text-2xl font-bold text-blue-600">
                {exams.filter(e => e.examType === 'READING').length}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Listening</p>
              <p className="text-2xl font-bold text-purple-600">
                {exams.filter(e => e.examType === 'LISTENING').length}
              </p>
            </div>
            <Headphones className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Full Test</p>
              <p className="text-2xl font-bold text-green-600">
                {exams.filter(e => e.examType === 'FULL_TEST').length}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Không tìm thấy bài thi nào</p>
            <button
              onClick={handleCreateExam}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Tạo bài thi đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cấp độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số phần
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.map((exam) => {
                  const typeInfo = getExamTypeInfo(exam.examType);
                  const Icon = typeInfo.icon;
                  
                  return (
                    <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {exam.description || 'Không có mô tả'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getExamTypeColor(exam.examType)}`}>
                          <Icon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(exam.level)}`}>
                          {exam.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {exam.durationTimes} phút
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {exam.parts?.length || 0} phần
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewExam(exam.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditExam(exam.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;

const ExamManagement = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedExams, setSelectedExams] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await AdminExamService.getAllExams();
      setExams(response);
    } catch (error) {
      console.error('Error fetching exams:', error);
      alert('Có lỗi xảy ra khi tải danh sách bài thi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = () => {
    console.log('Navigating to create exam page'); // Debug log
    navigate('/admin/exams/create');
  };

  const handleEditExam = (examId) => {
    console.log('Navigating to edit exam:', examId); // Debug log
    navigate(`/admin/exams/${examId}/edit`);
  };

  const handleViewExam = (examId) => {
    console.log('Navigating to view exam:', examId); // Debug log
    navigate(`/admin/exams/${examId}`);
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài thi này? Hành động này không thể hoàn tác.')) {
      try {
        await AdminExamService.deleteExam(examId);
        setExams(exams.filter(exam => exam.id !== examId));
        alert('Xóa bài thi thành công!');
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Có lỗi xảy ra khi xóa bài thi: ' + error.message);
      }
    }
  };

  const handleDuplicateExam = async (examId) => {
    try {
      const duplicatedExam = await AdminExamService.duplicateExam(examId);
      setExams([duplicatedExam, ...exams]);
      alert('Sao chép bài thi thành công!');
    } catch (error) {
      console.error('Error duplicating exam:', error);
      alert('Có lỗi xảy ra khi sao chép bài thi: ' + error.message);
    }
  };

  const handleToggleStatus = async (examId) => {
    try {
      const response = await AdminExamService.toggleExamActive(examId);
      setExams(exams.map(exam => 
        exam.id === examId ? { ...exam, isActive: response.isActive } : exam
      ));
    } catch (error) {
      console.error('Error toggling exam status:', error);
      alert('Có lỗi xảy ra khi thay đổi trạng thái bài thi: ' + error.message);
    }
  };

  const handleSelectExam = (examId) => {
    setSelectedExams(prev => 
      prev.includes(examId) 
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const handleSelectAll = () => {
    if (selectedExams.length === filteredExams.length) {
      setSelectedExams([]);
    } else {
      setSelectedExams(filteredExams.map(exam => exam.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedExams.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedExams.length} bài thi đã chọn?`)) {
      try {
        await Promise.all(selectedExams.map(id => AdminExamService.deleteExam(id)));
        setExams(exams.filter(exam => !selectedExams.includes(exam.id)));
        setSelectedExams([]);
        alert('Xóa các bài thi thành công!');
      } catch (error) {
        console.error('Error bulk deleting exams:', error);
        alert('Có lỗi xảy ra khi xóa bài thi: ' + error.message);
      }
    }
  };

  // Filter exams
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === '' || exam.level === selectedLevel;
    const matchesStatus = selectedStatus === '' || 
                         (selectedStatus === 'active' && exam.isActive) ||
                         (selectedStatus === 'inactive' && !exam.isActive);
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đề thi</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý các bài thi TOPIK</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedExams.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={20} />
              Xóa ({selectedExams.length})
            </button>
          )}
          <button 
            onClick={handleCreateExam}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            type="button"
          >
            <Plus size={20} />
            Tạo đề thi mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm bài thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả cấp độ</option>
            <option value="TOPIK I">TOPIK I</option>
            <option value="TOPIK II">TOPIK II</option>
            <option value="Sơ cấp">Sơ cấp</option>
            <option value="Trung cấp">Trung cấp</option>
            <option value="Cao cấp">Cao cấp</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm dừng</option>
          </select>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {filteredExams.length} / {exams.length} bài thi
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng bài thi</p>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {exams.filter(e => e.isActive).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tạm dừng</p>
              <p className="text-2xl font-bold text-orange-600">
                {exams.filter(e => !e.isActive).length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
              <p className="text-2xl font-bold text-purple-600">
                {exams.reduce((sum, e) => sum + e.totalQuestions, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedExams.length === filteredExams.length && filteredExams.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài thi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cấp độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Câu hỏi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cập nhật
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedExams.includes(exam.id)}
                      onChange={() => handleSelectExam(exam.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {exam.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {exam.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {exam.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(exam.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        exam.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {exam.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {exam.totalQuestions} câu ({exam.totalParts} phần)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-1">
                    <Clock size={14} />
                    {exam.durationTimes} phút
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(exam.updatedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewExam(exam.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditExam(exam.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDuplicateExam(exam.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-purple-600"
                        title="Sao chép"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy bài thi nào
            </h3>
            <p className="text-gray-500 mb-4">
              Thử thay đổi bộ lọc hoặc tạo bài thi mới
            </p>
            <button
              onClick={handleCreateExam}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tạo bài thi mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;
                  