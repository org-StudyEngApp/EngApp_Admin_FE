import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import flashCardApi from '../../api/flashCardApi';

const FlashCardList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [flashCards, setFlashCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch flashcard sets from API
  useEffect(() => {
    fetchFlashCards();
  }, []);

  const fetchFlashCards = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching flashcards from API...');
      
      const data = await flashCardApi.getSystemFlashcardSets();
      console.log('API Response:', data);
      
      // axiosClient đã unwrap response, data chính là result
      setFlashCards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách flashcard:', error);
      setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setFlashCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter flashcards based on search term and category
  const filteredFlashCards = flashCards.filter(card => {
    const matchesSearch = card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || card.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle delete flashcard
  const handleDeleteCard = async (cardId) => {
    try {
      await flashCardApi.deleteSystemFlashcardSet(cardId);
      await fetchFlashCards();
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      alert('Đã xóa bộ flashcard thành công');
    } catch (error) {
      console.error('Lỗi khi xóa flashcard:', error);
      alert('Có lỗi xảy ra khi xóa bộ flashcard');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedCards.map(cardId => flashCardApi.deleteSystemFlashcardSet(cardId))
      );
      await fetchFlashCards();
      setSelectedCards([]);
      alert('Đã xóa các bộ flashcard được chọn');
    } catch (error) {
      console.error('Lỗi khi xóa nhiều flashcard:', error);
      alert('Có lỗi xảy ra khi xóa các bộ flashcard');
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedCards.length === filteredFlashCards.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(filteredFlashCards.map(card => card.id));
    }
  };

  // Handle individual select
  const handleSelectCard = (cardId) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
    } else {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  const getStatusText = (status) => {
    return status === 'active' ? 'Hoạt động' : 'Bản nháp';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  // Render loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách từ vựng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchFlashCards}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Từ vựng TOEIC</h1>
          <p className="text-gray-600 mt-1">Quản lý các bộ từ vựng TOEIC theo chủ đề</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchFlashCards}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          <Link 
            to="/admin/flashcards/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Tạo bộ từ vựng mới
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số bộ thẻ</p>
              <p className="text-2xl font-bold text-gray-900">{flashCards.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {flashCards.filter(card => card.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bản nháp</p>
              <p className="text-2xl font-bold text-gray-900">
                {flashCards.filter(card => card.status === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng thẻ</p>
              <p className="text-2xl font-bold text-gray-900">
                {flashCards.reduce((total, card) => total + (card.cardCount || card.cards?.length || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm bộ từ vựng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả chủ đề</option>
                <option value="TOEIC">TOEIC General</option>
                <option value="business">Business & Office</option>
                <option value="travel">Travel & Transportation</option>
                <option value="daily">Daily Life</option>
                <option value="health">Health & Medical</option>
                <option value="technology">Technology</option>
                <option value="education">Education</option>
              </select>
            </div>
            
            {/* Bulk Actions */}
            {selectedCards.length > 0 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleBulkDelete}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Xóa ({selectedCards.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flash Cards Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCards.length === filteredFlashCards.length && filteredFlashCards.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên bộ từ vựng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số từ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFlashCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có flashcard nào</h3>
                      <p className="text-gray-500 mb-6">Bắt đầu tạo bộ flashcard đầu tiên của bạn</p>
                      <Link 
                        to="/admin/flashcards/create"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                        Tạo Flash Card mới
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFlashCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => handleSelectCard(card.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{card.title || 'Không có tiêu đề'}</div>
                      {card.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{card.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {card.category || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {card.cardCount || card.cards?.length || 0} thẻ
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(card.status || 'draft')}`}>
                        {getStatusText(card.status || 'draft')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {card.createdAt ? new Date(card.createdAt).toLocaleDateString('vi-VN') : 
                       card.created_at ? new Date(card.created_at).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/admin/flashcards/view/${card.id}`} 
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          to={`/admin/flashcards/edit/${card.id}`} 
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-green-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => {
                            setDeleteTargetId(card.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
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
        {filteredFlashCards.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến{" "}
              <span className="font-medium">{filteredFlashCards.length}</span>{" "}
              trong tổng số{" "}
              <span className="font-medium">{flashCards.length}</span> kết quả
            </div>
            <div className="text-sm text-gray-500">
              {flashCards.length > 0 ? 'Đã tải xong' : 'Không có dữ liệu'}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa bộ flashcard này? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteCard(deleteTargetId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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

export default FlashCardList;