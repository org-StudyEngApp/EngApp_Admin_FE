import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Newspaper,
  BookOpen,
  Clock,
  Send
} from 'lucide-react';
import articleApi from '../../api/articleApi';
import topicApi from '../../api/topicApi';

const ArticleList = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // Thêm filter status
  const [topics, setTopics] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filterLevel, filterTopic, filterStatus]);

  const loadTopics = async () => {
    try {
      const response = await topicApi.getAllTopics();
      const data = response.data || response.result || response;
      setTopics(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        keyword: searchTerm || undefined,
        level: filterLevel || undefined,
        newsTopicId: filterTopic || undefined,
        status: filterStatus || undefined
      };

      // Remove undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await articleApi.getAllArticles(params);
      const data = response.data || response.result || response;
      
      console.log('📰 Articles loaded:', data);
      console.log('📊 First article:', data.content?.[0]);
      
      // Map topic names to articles
      const articlesWithTopics = (data.content || data.data || data || []).map(article => {
        // Tìm topic name từ danh sách topics
        const topic = topics.find(t => t.id === article.newsTopicId);
        return {
          ...article,
          topicName: topic?.title || topic?.name || article.newsTopicName || article.topicTitle || 'Chưa có chủ đề'
        };
      });
      
      setArticles(articlesWithTopics);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 0 });
    loadArticles();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      await articleApi.deleteArticle(id);
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Không thể xóa bài viết');
    }
  };

  const handlePublishToggle = async (article) => {
    try {
      // Map từ published boolean sang status nếu backend chưa có status field
      let status = article.status;
      if (!status) {
        status = article.published ? 'PUBLISHED' : 'DRAFT';
      }
      
      // Nếu đang là PUBLISHED, unpublish (chuyển về DRAFT)
      if (status === 'PUBLISHED') {
        if (!window.confirm('⚠️ GỠ XUẤT BẢN?\n\n❌ Bài viết sẽ BỊ ẨN khỏi người dùng\n📝 Chuyển về trạng thái Nháp\n\nXác nhận gỡ xuất bản?')) return;
        await articleApi.unpublish(article.id);
        showSuccessMessage('✅ Đã gỡ - Bài viết đã bị ẩn khỏi user');
      } 
      // Nếu đang là SCHEDULED, có thể publish ngay hoặc hủy lịch
      else if (status === 'SCHEDULED') {
        const action = window.confirm('📅 BÀI VIẾT ĐANG LÊN LỊCH\n\n✅ OK = Xuất bản ngay lập tức\n❌ Cancel = Hủy lịch (bài viết sẽ BỊ ẨN)\n\nChọn hành động:');
        if (action) {
          await articleApi.publishNow(article.id);
          showSuccessMessage('✅ Đã xuất bản ngay');
        } else {
          await articleApi.unschedule(article.id);
          showSuccessMessage('✅ Đã hủy lịch - Bài viết đã bị ẩn');
        }
      }
      // Nếu đang là DRAFT, publish ngay
      else {
        if (!window.confirm('📢 XUẤT BẢN BÀI VIẾT?\n\n✅ Bài viết sẽ HIỂN THỊ cho tất cả người dùng\n\nXác nhận xuất bản ngay?')) return;
        await articleApi.publishNow(article.id);
        showSuccessMessage('✅ Đã xuất bản - User có thể xem bài viết');
      }
      
      loadArticles();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      const errorMsg = error.response?.data?.message || 'Không thể thay đổi trạng thái';
      alert(errorMsg);
    }
  };

  const showSuccessMessage = (message) => {
    // Có thể thêm toast notification ở đây
    console.log(message);
  };

  const getStatusBadge = (article) => {
    // Map từ published boolean sang status string nếu backend chưa cập nhật
    let status = article.status;
    if (!status) {
      status = article.published ? 'PUBLISHED' : 'DRAFT';
    }
    
    const scheduledDate = article.scheduledPublishDate;
    
    if (status === 'PUBLISHED') {
      return (
        <button 
          onClick={() => handlePublishToggle(article)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
          title="Click để chuyển về Draft"
        >
          <CheckCircle size={14} />
          Đã xuất bản
        </button>
      );
    } else if (status === 'SCHEDULED') {
      return (
        <button 
          onClick={() => handlePublishToggle(article)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
          title="Click để xuất bản ngay hoặc chuyển về Draft"
        >
          <Clock size={14} />
          Đã lên lịch
          {scheduledDate && (
            <span className="text-[10px] ml-1">
              ({new Date(scheduledDate).toLocaleDateString('vi-VN')})
            </span>
          )}
        </button>
      );
    } else {
      return (
        <button 
          onClick={() => handlePublishToggle(article)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
          title="Bản nháp - KHÔNG hiển thị cho user. Click để xuất bản"
        >
          <XCircle size={14} />
          Bản nháp (Ẩn)
        </button>
      );
    }
  };

  const getLevelBadge = (level) => {
    const badges = {
      BEGINNER: { bg: 'bg-green-100', text: 'text-green-800', label: 'Cơ bản' },
      INTERMEDIATE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Trung cấp' },
      ADVANCED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Nâng cao' }
    };
    const badge = badges[level] || badges.BEGINNER;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài báo</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả bài báo tin tức</p>
        </div>
        <button
          onClick={() => navigate('/admin/articles/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tạo bài mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title || topic.name || `Topic #${topic.id}`}
              </option>
            ))}
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả cấp độ</option>
            <option value="BEGINNER">Cơ bản</option>
            <option value="INTERMEDIATE">Trung cấp</option>
            <option value="ADVANCED">Nâng cao</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="SCHEDULED">Đã lên lịch</option>
            <option value="PUBLISHED">Đã xuất bản</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có bài viết nào</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chủ đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cấp độ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt xem
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
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 h-16 flex-shrink-0 mr-4">
                          {article.thumbnailUrl || article.mainImageUrl ? (
                            <img
                              src={article.thumbnailUrl || article.mainImageUrl}
                              alt={article.title}
                              className="w-full h-full rounded-lg object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center"
                            style={{ display: (article.thumbnailUrl || article.mainImageUrl) ? 'none' : 'flex' }}
                          >
                            <Newspaper className="text-gray-400" size={28} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {article.title}
                          </div>
                          {article.summary && (
                            <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {article.summary}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {article.topicName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLevelBadge(article.level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 text-gray-700">
                        <Eye size={16} className="text-gray-500" />
                        <span className="text-sm font-medium">
                          {(article.viewCount || 0).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(article)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Publish/Unpublish Button */}
                        {article.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublishToggle(article)}
                            className="text-green-600 hover:text-green-900"
                            title="Xuất bản ngay"
                          >
                            <Send size={18} />
                          </button>
                        )}
                        {article.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handlePublishToggle(article)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Chuyển về nháp"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        {article.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handlePublishToggle(article)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xuất bản ngay hoặc hủy lịch"
                          >
                            <Clock size={18} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => navigate(`/admin/articles/${article.id}/vocabulary`)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Quản lý Vocabulary"
                        >
                          <BookOpen size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{articles.length}</span> trong tổng số{' '}
                  <span className="font-medium">{pagination.totalElements}</span> bài viết
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArticleList;
