import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  Clock,
  MoreVertical,
  Plus,
  AlertTriangle
} from 'lucide-react';
import AdminExamService from '../../services/AdminExamService';

const TestList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTests, setSelectedTests] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Fetch exams from database when component mounts
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await AdminExamService.getAllExams();
      console.log('Loaded exams from database:', response);
      setTests(response);
    } catch (error) {
      console.error('Error fetching tests:', error);
      alert('Lỗi khi tải danh sách bài thi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = () => {
    navigate('/admin/tests/create');
  };

  const handleViewTest = (id) => {
    navigate(`/admin/tests/${id}`);
  };

  const handleEditTest = (id) => {
    navigate(`/admin/tests/${id}/edit`);
  };

  const confirmDeleteTest = (id) => {
    setExamToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTest = async () => {
    if (!examToDelete) return;
    
    setDeleteLoading(true);
    try {
      await AdminExamService.deleteExam(examToDelete);
      setTests(tests.filter(test => test.id !== examToDelete));
      alert('Xóa bài thi thành công');
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Lỗi khi xóa bài thi: ' + error.message);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const result = await AdminExamService.toggleExamActive(id);
      setTests(tests.map(test => 
        test.id === id ? {...test, isActive: result.isActive} : test
      ));
    } catch (error) {
      console.error('Error toggling exam status:', error);
      alert('Lỗi khi thay đổi trạng thái bài thi: ' + error.message);
    }
  };

  const handleSelectTest = (testId) => {
    setSelectedTests(prev => 
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTests.length === filteredTests.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(filteredTests.map(test => test.id));
    }
  };

  const confirmBulkDelete = () => {
    if (selectedTests.length === 0) return;
    setExamToDelete('bulk');
    setIsDeleteModalOpen(true);
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      await Promise.all(selectedTests.map(id => AdminExamService.deleteExam(id)));
      setTests(tests.filter(test => !selectedTests.includes(test.id)));
      setSelectedTests([]);
      alert(`Đã xóa ${selectedTests.length} bài thi thành công`);
    } catch (error) {
      console.error('Error bulk deleting tests:', error);
      alert('Lỗi khi xóa bài thi: ' + error.message);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    }
  };

  // Filter tests based on search term and filter status
  const filteredTests = tests.filter(test => {
    const matchesSearch = 
      (test.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (test.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && test.isActive) || 
      (filterStatus === 'draft' && !test.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusText = (status) => {
    if (status === 'active' || status === true) return 'Hoạt động';
    if (status === 'draft' || status === false) return 'Bản nháp';
    return 'Không hoạt động';
  };

  const getStatusColor = (status) => {
    if (status === 'active' || status === true) return 'bg-green-100 text-green-800';
    if (status === 'draft' || status === false) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh sách bài thi...</p>
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
          <p className="text-gray-600 mt-1">Quản lý và tổ chức các đề thi TOPIK</p>
        </div>
        <button 
          onClick={handleCreateTest}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tạo đề thi mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số đề thi</p>
              <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {tests.filter(t => t.isActive === true).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bản nháp</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tests.filter(t => t.isActive === false).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
              <p className="text-2xl font-bold text-purple-600">
                {tests.reduce((sum, test) => sum + (test.totalQuestions || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm đề thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>

          {selectedTests.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                onClick={confirmBulkDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Đang xóa...' : `Xóa (${selectedTests.length})`}
              </button>
              <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Xuất file
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTests.length === filteredTests.length && filteredTests.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên đề thi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
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
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th> */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Không tìm thấy bài thi nào khớp với điều kiện tìm kiếm'
                      : 'Chưa có bài thi nào. Hãy tạo bài thi mới!'}
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.id)}
                        onChange={() => handleSelectTest(test.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{test.title}</div>
                      <div className="text-sm text-gray-500">{test.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {test.level || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(test.isActive)}`}>
                        {getStatusText(test.isActive)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {test.totalQuestions || 0} câu
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-1">
                      <Clock size={14} />
                      {test.durationTimes || 0} phút
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(test.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewTest(test.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditTest(test.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDeleteTest(test.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                          disabled={deleteLoading}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredTests.length}</span> trong tổng số <span className="font-medium">{tests.length}</span> kết quả
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Trước
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Xác nhận xóa
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {examToDelete === 'bulk' 
                          ? `Bạn có chắc chắn muốn xóa ${selectedTests.length} bài thi đã chọn?` 
                          : 'Bạn có chắc chắn muốn xóa bài thi này? Hành động này không thể hoàn tác.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={examToDelete === 'bulk' ? handleBulkDelete : handleDeleteTest}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestList;
