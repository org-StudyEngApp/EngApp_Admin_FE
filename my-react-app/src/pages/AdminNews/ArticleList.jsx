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
  Send,
  Languages,
  CheckCheck,
  Lock,
  Unlock
} from 'lucide-react';
import articleApi from '../../api/articleApi';
import topicApi from '../../api/topicApi';
import TranslationViewerModal from '../../components/AdminNews/TranslationViewerModal';

const ArticleList = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // Thêm filter status
  const [topics, setTopics] = useState([]);
  const [translatingArticles, setTranslatingArticles] = useState(new Set()); // Track articles đang dịch
  const [viewTranslationModal, setViewTranslationModal] = useState({ isOpen: false, article: null }); // Modal xem bản dịch
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
      
      // Debug: Kiểm tra xem backend có trả về isLocked không
      console.log('📋 Sample article from backend:', (data.content || data.data || data || [])[0]);
      
      // Map topic names to articles - GIỮ NGUYÊN TẤT CẢ FIELDS từ backend
      const articlesWithTopics = (data.content || data.data || data || []).map(article => {
        // Tìm topic name từ danh sách topics
        const topic = topics.find(t => t.id === article.newsTopicId);
        
        // Backend có thể trả về snake_case hoặc camelCase
        let vietnameseTranslation = article.vietnameseTranslation || article.vietnamese_translation || null;
        
        // Kiểm tra nested paths nếu cần
        if (!vietnameseTranslation && article.data) {
          vietnameseTranslation = article.data.vietnameseTranslation || article.data.vietnamese_translation;
        }
        
        return {
          ...article, // Giữ TOÀN BỘ fields từ backend
          vietnameseTranslation, // Đảm bảo có field này (chuẩn hóa)
          topicName: topic?.title || topic?.name || article.newsTopicName || article.topicTitle || 'Chưa có chủ đề',
          isLocked: article.isLocked !== undefined ? article.isLocked : false // Đảm bảo có isLocked
        };
      });
      
      setArticles(articlesWithTopics);
      
      // *** DISABLED: Translation loading để tránh lỗi 404 ***
      // Backend chưa implement endpoint getStoredTranslation
      // Nếu không có translation trong response, load riêng
      // const articlesWithoutTranslation = articlesWithTopics.filter(a => !a.vietnameseTranslation);
      // if (articlesWithoutTranslation.length > 0) {
      //   loadTranslationsForArticles(articlesWithTopics);
      // }
      
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

  // Load translations riêng cho các articles
  const loadTranslationsForArticles = async (articles) => {
    // Chỉ check những bài có khả năng đã được dịch
    const articlesToCheck = articles.slice(0, 10);
    
    const translationPromises = articlesToCheck.map(async (article) => {
      try {
        const response = await articleApi.getStoredTranslation(article.id);
        const data = response.data || response.result || response;
        const translation = data.vietnameseTranslation || data.vietnamese_translation;
        
        if (translation) {
          return { id: article.id, translation };
        }
      } catch (error) {
        // Nếu 404 (chưa có dịch) thì bỏ qua
      }
      return null;
    });
    
    const results = await Promise.allSettled(translationPromises);
    const translations = results
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value);
    
    if (translations.length > 0) {
      setArticles(prevArticles =>
        prevArticles.map(article => {
          const found = translations.find(t => t.id === article.id);
          return found ? { ...article, vietnameseTranslation: found.translation } : article;
        })
      );
    }
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

  const handleToggleLockStatus = async (articleId, currentLockStatus) => {
    const newLockStatus = !currentLockStatus;
    const confirmMessage = newLockStatus
      ? '🔒 KHÓA BÀI BÁO - CHỈ PREMIUM\n\nBài báo sẽ chỉ có thể truy cập bởi:\n• Người dùng Premium\n• Người dùng Free được Admin grant quyền\n\nBạn có chắc chắn?'
      : '🔓 MỞ KHÓA BÀI BÁO - PUBLIC\n\nBài báo sẽ công khai cho tất cả người dùng (kể cả FREE).\n\nBạn có chắc chắn?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Tìm article trong state để lấy full data
      const article = articles.find(a => a.id === articleId);
      if (!article) {
        alert('Không tìm thấy bài báo');
        return;
      }

      // Tạo payload full với tất cả fields bắt buộc
      const payload = {
        title: article.title,
        htmlContent: article.htmlContent || article.content || '',
        level: article.level,
        newsTopicId: article.newsTopicId || article.topicId,
        sourceUrl: article.sourceUrl || '',
        audioUrl: article.audioUrl || '',
        thumbnailUrl: article.thumbnailUrl || article.mainImageUrl || '',
        summary: article.summary || '',
        isTrial: false,
        newsSeriesId: null,
        orderIndex: 1,
        status: article.status || 'DRAFT',
        scheduledPublishDate: article.scheduledPublishDate || null,
        isLocked: newLockStatus // Update lock status
      };

      // Gọi updateArticle với full payload
      await articleApi.updateArticle(articleId, payload);
      
      setArticles(articles.map(a =>
        a.id === articleId ? { ...a, isLocked: newLockStatus } : a
      ));
      alert(newLockStatus ? '✅ Đã khóa bài báo - Chỉ Premium truy cập được!' : '✅ Đã mở khóa bài báo - Công khai cho tất cả!');
    } catch (error) {
      console.error('Error toggling lock status:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('Có lỗi xảy ra khi thay đổi trạng thái lock: ' + errorMsg);
    }
  };

  const handleTranslate = async (article) => {
    if (!window.confirm(
      `🌐 DỊCH BÀI VIẾT?

` +
      `📄 Bài: ${article.title}

` +
      `✅ Dịch bằng AI (Gemini)
` +
      `💾 Lưu vào database
` +
      `🆓 MIỄN PHÍ cho tất cả user
` +
      `⏱️ Có thể mất 30-60 giây

` +
      `Xác nhận dịch bài này?`
    )) {
      return;
    }

    setTranslatingArticles(prev => new Set([...prev, article.id]));

    try {
      const response = await articleApi.translateArticle(article.id);
      const data = response.data || response.result || response;
      
      // Backend có thể trả về nhiều format khác nhau
      const translationContent = 
        data.vietnameseTranslation || 
        data.vietnamese_translation ||
        data.data?.vietnameseTranslation || 
        data.data?.vietnamese_translation ||
        null;
      
      // Cập nhật article trong list với translation mới
      setArticles(prevArticles => 
        prevArticles.map(a => 
          a.id === article.id 
            ? { ...a, vietnameseTranslation: translationContent }
            : a
        )
      );
      
      alert(
        `✅ DỊCH THÀNH CÔNG!

` +
        `📰 Bài: ${article.title}
` +
        `💾 Đã lưu bản dịch vào database
` +
        `🆓 User có thể xem MIỄN PHÍ

` +
        `${data.quotaMessage || 'Pre-translated by admin - Free for all users'}`
      );
      
      // Reload lại danh sách để đồng bộ dữ liệu từ backend
      await loadArticles();
    } catch (error) {
      console.error('❌ Lỗi dịch bài viết:', error);
      let errorMsg = 'Không thể dịch bài viết. Vui lòng thử lại!';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = '⏱️ Timeout: Bài viết quá dài, vui lòng thử lại hoặc liên hệ admin.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      alert(`❌ DỊCH THẤT BẠI

${errorMsg}`);
    } finally {
      setTranslatingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(article.id);
        return newSet;
      });
    }
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

      {/* Translation Statistics */}
      {articles.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-sm p-4 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Languages size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Thống kê Dịch thuật</h3>
                <p className="text-xs text-gray-600">Admin dịch trước → Free cho User</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {articles.filter(a => a.vietnameseTranslation).length}
                </div>
                <div className="text-xs text-gray-600">Đã dịch</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {articles.filter(a => !a.vietnameseTranslation).length}
                </div>
                <div className="text-xs text-gray-600">Chưa dịch</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {articles.length > 0 
                    ? Math.round((articles.filter(a => a.vietnameseTranslation).length / articles.length) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-gray-600">Hoàn thành</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quyền truy cập
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Languages size={14} className="inline-block mr-1" />
                    Dịch thuật
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
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleLockStatus(article.id, article.isLocked)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            article.isLocked
                              ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 hover:from-yellow-200 hover:to-yellow-300 border border-yellow-300'
                              : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300 border border-green-300'
                          }`}
                          title={article.isLocked ? 'Đang khóa - Chỉ Premium truy cập' : 'Công khai - Tất cả truy cập được'}
                        >
                          {article.isLocked ? (
                            <>
                              <Lock size={12} />
                              <span className="font-semibold">Premium Only</span>
                            </>
                          ) : (
                            <>
                              <Unlock size={12} />
                              <span>Public</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {article.vietnameseTranslation ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            <CheckCheck size={14} />
                            Đã dịch
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            <XCircle size={14} />
                            Chưa dịch
                          </span>
                        )}
                      </div>
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
                        
                        {/* Translation Button */}
                        <button
                          onClick={() => handleTranslate(article)}
                          disabled={translatingArticles.has(article.id)}
                          className={`relative ${
                            article.vietnameseTranslation 
                              ? 'text-green-600 hover:text-green-900' 
                              : 'text-indigo-600 hover:text-indigo-900'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={article.vietnameseTranslation ? 'Đã dịch - Click để dịch lại' : 'Dịch bài viết'}
                        >
                          {translatingArticles.has(article.id) ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : article.vietnameseTranslation ? (
                            <CheckCheck size={18} />
                          ) : (
                            <Languages size={18} />
                          )}
                        </button>
                        
                        {/* View Translation Button - Chỉ hiển thị nếu đã dịch */}
                        {article.vietnameseTranslation && (
                          <button
                            onClick={() => setViewTranslationModal({ isOpen: true, article })}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xem bản dịch"
                          >
                            <Eye size={18} />
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

      {/* Translation Viewer Modal */}
      <TranslationViewerModal
        article={viewTranslationModal.article}
        isOpen={viewTranslationModal.isOpen}
        onClose={() => setViewTranslationModal({ isOpen: false, article: null })}
      />
    </div>
  );
};

export default ArticleList;
