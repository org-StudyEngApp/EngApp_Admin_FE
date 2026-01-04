import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { 
  Link2, 
  Download, 
  Save, 
  Eye, 
  Loader2, 
  Image as ImageIcon,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send
} from 'lucide-react';
import articleApi from '../../api/articleApi';
import topicApi from '../../api/topicApi';

const LEVELS = [
  { value: 'BEGINNER', label: 'Người mới bắt đầu' },
  { value: 'INTERMEDIATE', label: 'Trung cấp' },
  { value: 'ADVANCED', label: 'Nâng cao' }
];

const ArticleEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // States
  const [step, setStep] = useState(1);
  const [fetchUrl, setFetchUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    topicId: '',
    level: 'BEGINNER',
    thumbnailUrl: '',
    audioUrl: '',
    summary: '',
    sourceUrl: '',
    status: 'DRAFT', // DRAFT, SCHEDULED, PUBLISHED
    scheduledPublishDate: '' // ISO DateTime string
  });

  const [errors, setErrors] = useState({});

  // Load topics on mount
  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      loadArticle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const loadTopics = async () => {
    try {
      const response = await topicApi.getAllTopics();
      const data = response.data || response.result || response;
      setTopics(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      showNotification('error', 'Không thể tải danh sách chủ đề');
    }
  };

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await articleApi.getArticleById(id);
      const article = response.data || response.result || response;
      
      console.log('Loaded article data:', article); // Debug log
      
      setFormData({
        title: article.title || '',
        content: article.htmlContent || article.content || '', // Backend uses htmlContent
        topicId: article.newsTopicId || article.topicId || '', // Backend uses newsTopicId
        level: article.level || 'BEGINNER',
        thumbnailUrl: article.thumbnailUrl || article.mainImageUrl || '',
        audioUrl: article.audioUrl || '',
        summary: article.summary || '',
        sourceUrl: article.sourceUrl || '',
        status: article.status || 'DRAFT',
        scheduledPublishDate: article.scheduledPublishDate || ''
      });
      setStep(2); // Skip to edit form
    } catch (error) {
      console.error('Error loading article:', error);
      showNotification('error', 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Step 1: Fetch data from URL (Preview only - không lưu DB)
  const handleFetchFromUrl = async () => {
    if (!fetchUrl.trim()) {
      showNotification('error', 'Vui lòng nhập URL bài báo');
      return;
    }

    try {
      setFetchLoading(true);
      const response = await articleApi.fetchFromUrl(fetchUrl, {
        generateAudio: true,
        generateQuiz: true,
        quizQuestionCount: 5,
        newsTopicId: formData.topicId || null
      });
      const data = response.data || response.result || response;

      // Handle response based on backend structure
      const article = data.article || data;
      
      setFormData({
        ...formData,
        title: article.title || '',
        content: article.htmlContent || article.content || '',
        thumbnailUrl: article.mainImageUrl || article.thumbnailUrl || '', // Tự động gán từ mainImageUrl
        audioUrl: article.audioUrl || '', // Tự động tạo bởi backend
        sourceUrl: article.sourceUrl || fetchUrl,
        summary: article.summary || ''
      });

      setStep(2);
      
      // Hiển thị thông báo với thông tin chi tiết
      const successMsg = `Đã lấy dữ liệu thành công! ${article.audioUrl ? '✓ Audio đã được tạo.' : ''} ${article.mainImageUrl ? '✓ Ảnh đại diện đã được tự động chọn (có thể thay đổi).' : ''} Vui lòng kiểm tra trước khi lưu.`;
      showNotification('success', successMsg);
    } catch (error) {
      console.error('Error fetching from URL:', error);
      showNotification('error', error.response?.data?.message || 'Không thể lấy dữ liệu từ URL');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    // Clear error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    }

    if (!formData.topicId) {
      newErrors.topicId = 'Vui lòng chọn chủ đề';
    }

    if (!formData.level) {
      newErrors.level = 'Vui lòng chọn cấp độ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2: Save article (luôn lưu dưới dạng DRAFT)
  const handleSaveArticle = async () => {
    if (!validateForm()) {
      showNotification('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      
      // Map frontend fields to backend expected fields
      const payload = {
        title: formData.title.trim(),
        htmlContent: formData.content, // Backend expects htmlContent
        level: formData.level,
        newsTopicId: parseInt(formData.topicId), // Backend expects newsTopicId as integer (required)
        sourceUrl: formData.sourceUrl?.trim() || '',
        audioUrl: formData.audioUrl?.trim() || '', // Auto-generated by backend during crawl
        thumbnailUrl: formData.thumbnailUrl?.trim() || '', // Admin can edit, defaults to mainImageUrl from crawl
        summary: formData.summary?.trim() || '',
        isTrial: false, // Default value
        newsSeriesId: null, // Optional
        orderIndex: 1, // Default value
        status: formData.status || 'DRAFT', // Thêm status
        scheduledPublishDate: formData.scheduledPublishDate || null // Thêm scheduledPublishDate
      };

      console.log('Payload being sent:', payload); // Debug log

      let savedArticleId = id;
      if (isEditMode) {
        await articleApi.updateArticle(id, payload);
        showNotification('success', 'Cập nhật bài viết thành công!');
      } else {
        const response = await articleApi.createArticle(payload);
        savedArticleId = response.data?.id || response.result?.id || response.id;
        showNotification('success', 'Tạo bài viết mới thành công!');
      }

      // Không redirect ngay, để user có thể publish/schedule
      if (!isEditMode && savedArticleId) {
        // Chuyển sang edit mode
        navigate(`/admin/articles/${savedArticleId}/edit`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving article:', error);
      
      // Handle specific error: duplicate sourceUrl
      if (error.response?.data?.message?.includes('source URL already exists')) {
        showNotification('error', 'URL nguồn này đã tồn tại! Hãy xóa URL nguồn hoặc chỉnh sửa bài viết cũ.');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Không thể lưu bài viết';
        showNotification('error', errorMsg);
      }
      
      console.error('Detailed error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Publish ngay lập tức
  const handlePublishNow = async () => {
    if (!isEditMode) {
      showNotification('error', 'Vui lòng lưu bài viết trước khi publish');
      return;
    }

    if (!window.confirm('Xuất bản bài viết ngay lập tức?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await articleApi.publishNow(id);
      const updatedArticle = response.data || response.result || response;
      
      setFormData({ 
        ...formData, 
        status: 'PUBLISHED',
        scheduledPublishDate: null
      });
      
      showNotification('success', '✅ Đã xuất bản bài viết thành công!');
      
      setTimeout(() => {
        navigate('/admin/articles');
      }, 1500);
    } catch (error) {
      console.error('Error publishing article:', error);
      const errorMsg = error.response?.data?.message || 'Không thể publish bài viết';
      showNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Lên lịch publish
  const handleSchedulePublish = async () => {
    if (!isEditMode) {
      showNotification('error', 'Vui lòng lưu bài viết trước khi lên lịch');
      return;
    }

    if (!formData.scheduledPublishDate) {
      showNotification('error', 'Vui lòng chọn thời gian publish');
      return;
    }

    try {
      setLoading(true);
      await articleApi.schedulePublish(id, formData.scheduledPublishDate);
      
      showNotification('success', '🕒 Đã lên lịch xuất bản thành công');
      
      setTimeout(() => {
        navigate('/admin/articles');
      }, 1000);
    } catch (error) {
      console.error('Error scheduling article:', error);
      const errorMsg = error.response?.data?.message || 'Không thể lên lịch publish';
      showNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Hủy lịch publish
  const handleUnschedule = async () => {
    if (!isEditMode) return;

    if (!window.confirm('⚠️ HỦY LỊCH VÀ CHUYỂN VỀ BẢN NHÁP?\n\n❌ Bài viết sẽ KHÔNG hiển thị cho người dùng\n📝 Lịch publish tự động sẽ bị hủy\n\nBạn có chắc chắn?')) {
      return;
    }

    try {
      setLoading(true);
      await articleApi.unschedule(id);
      setFormData({ ...formData, status: 'DRAFT', scheduledPublishDate: '' });
      showNotification('success', '✅ Đã hủy lịch - Bài viết đã chuyển về bản nháp');
    } catch (error) {
      console.error('Error unscheduling article:', error);
      const errorMsg = error.response?.data?.message || 'Không thể hủy lịch';
      showNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển về Draft (Unpublish)
  const handleRevertToDraft = async () => {
    if (!isEditMode) return;

    if (!window.confirm('⚠️ GỠ XUẤT BẢN VÀ CHUYỂN VỀ BẢN NHÁP?\n\n❌ Bài viết sẽ KHÔNG còn hiển thị cho người dùng\n📝 Chỉ admin có thể xem và chỉnh sửa\n\nBạn có chắc chắn muốn tiếp tục?')) {
      return;
    }

    try {
      setLoading(true);
      await articleApi.unpublish(id);
      setFormData({ ...formData, status: 'DRAFT', scheduledPublishDate: '' });
      showNotification('success', '✅ Đã gỡ xuất bản - Bài viết đã bị ẩn khỏi người dùng');
    } catch (error) {
      console.error('Error reverting to draft:', error);
      const errorMsg = error.response?.data?.message || 'Không thể chuyển về Draft';
      showNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Skip fetch and go directly to form
  const handleSkipFetch = () => {
    setStep(2);
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-md animate-slide-in ${
          notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        } border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Chỉnh sửa Bài báo' : 'Soạn thảo Bài báo mới'}
        </h1>
        <p className="text-gray-600">
          {step === 1 
            ? 'Nhập link bài báo gốc để lấy dữ liệu tự động hoặc bỏ qua để nhập thủ công'
            : 'Chỉnh sửa nội dung và lưu bài viết'
          }
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm font-medium text-gray-700">Import URL</span>
          <span className="text-sm font-medium text-gray-700">Chỉnh sửa & Lưu</span>
        </div>
      </div>

      {/* Step 1: URL Fetch */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Lấy dữ liệu từ URL</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link bài báo gốc
                </label>
                <input
                  type="url"
                  value={fetchUrl}
                  onChange={(e) => setFetchUrl(e.target.value)}
                  placeholder="https://bbc.com/news/article-example"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={fetchLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: BBC, CNN, The Guardian, và nhiều nguồn tin khác
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFetchFromUrl}
                  disabled={fetchLoading || !fetchUrl.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {fetchLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang lấy dữ liệu...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Lấy dữ liệu
                    </>
                  )}
                </button>

                <button
                  onClick={handleSkipFetch}
                  disabled={fetchLoading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Edit Form */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Info Box - Hướng dẫn */}
          {formData.audioUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">📋 Thông tin bài viết đã crawl:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li><strong>Ảnh đại diện:</strong> Đã tự động lấy từ bài gốc, bạn có thể thay đổi URL nếu muốn</li>
                  <li><strong>Audio:</strong> Đã được AI tạo tự động (không thể chỉnh sửa)</li>
                  <li><strong>Nội dung:</strong> Đã được làm sạch và định dạng HTML, hãy kiểm tra kỹ trước khi lưu</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Thông tin bài viết</h2>
              
              {/* Status Badge */}
              {isEditMode && formData.status && (
                <div className="flex items-center gap-2">
                  {formData.status === 'DRAFT' && (
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full" title="Bản nháp - Chỉ admin xem được, KHÔNG hiển thị cho user">
                      📝 Bản nháp (Ẩn)
                    </span>
                  )}
                  {formData.status === 'SCHEDULED' && (
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                      <Clock size={14} />
                      Đã lên lịch
                    </span>
                  )}
                  {formData.status === 'PUBLISHED' && (
                    <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      Đã xuất bản
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề bài viết"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Tóm tắt ngắn gọn về bài viết"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Topic and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.topicId}
                    onChange={(e) => handleInputChange('topicId', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.topicId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Chọn chủ đề --</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title || topic.name || `Topic #${topic.id}`}
                      </option>
                    ))}
                  </select>
                  {errors.topicId && (
                    <p className="text-red-500 text-sm mt-1">{errors.topicId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.level ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {errors.level && (
                    <p className="text-red-500 text-sm mt-1">{errors.level}</p>
                  )}
                </div>
              </div>

              {/* Scheduled Publish Date - chỉ hiện khi muốn lên lịch */}
              {isEditMode && (
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Lên lịch xuất bản (tùy chọn)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledPublishDate ? formData.scheduledPublishDate.slice(0, 16) : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        // Gửi format: "2026-01-01T07:57:00" (không có timezone)
                        handleInputChange('scheduledPublishDate', e.target.value + ':00');
                      } else {
                        handleInputChange('scheduledPublishDate', '');
                      }
                    }}
                    min={(() => {
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = String(now.getMonth() + 1).padStart(2, '0');
                      const day = String(now.getDate()).padStart(2, '0');
                      const hour = String(now.getHours()).padStart(2, '0');
                      const minute = String(now.getMinutes()).padStart(2, '0');
                      return `${year}-${month}-${day}T${hour}:${minute}`;
                    })()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.scheduledPublishDate 
                      ? `Bài viết sẽ tự động xuất bản vào ${formData.scheduledPublishDate.replace('T', ' ')}`
                      : 'Để trống nếu muốn xuất bản ngay hoặc giữ ở trạng thái nháp'
                    }
                  </p>
                </div>
              )}

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon size={16} className="inline mr-1" />
                  Ảnh đại diện (URL)
                  <span className="text-xs text-gray-500 ml-2">
                    (Tự động lấy từ bài gốc khi crawl, có thể thay đổi)
                  </span>
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.thumbnailUrl && (
                  <div className="mt-3">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Preview"
                      className="max-w-xs h-auto rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Audio URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Volume2 size={16} className="inline mr-1" />
                  Audio URL
                  <span className="text-xs text-gray-500 ml-2">
                    (Tự động tạo bởi AI khi crawl - Read-only)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.audioUrl}
                    readOnly
                    placeholder="Chưa có audio - sẽ tự động tạo khi crawl bài báo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    title="Audio được tạo tự động bởi backend, không thể chỉnh sửa"
                  />
                  {formData.audioUrl && (
                    <audio 
                      controls 
                      className="mt-2 w-full"
                      src={formData.audioUrl}
                    >
                      Trình duyệt không hỗ trợ audio.
                    </audio>
                  )}
                </div>
              </div>

              {/* Source URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nguồn bài viết
                  <span className="text-xs text-gray-500 ml-2">(Nếu URL bị trùng, hãy xóa trường này)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                    placeholder="https://bbc.com/..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.sourceUrl && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('sourceUrl', '')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Xóa URL nguồn"
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Backend không cho phép 2 bài viết có cùng URL nguồn
                </p>
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <div className={`border rounded-lg ${errors.content ? 'border-red-500' : 'border-gray-300'}`}>
                  <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    value={formData.content}
                    onEditorChange={(content) => handleInputChange('content', content)}
                    init={{
                      height: 500,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                  />
                </div>
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/admin/articles')}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>

              <div className="flex gap-3">
                {/* Chỉ hiện nút Quay lại khi đang ở chế độ tạo mới và chưa có ID */}
                {!isEditMode && (
                  <button
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Quay lại
                  </button>
                )}

                {/* Nút Lưu Nháp - luôn hiển thị */}
                <button
                  onClick={handleSaveArticle}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {isEditMode ? 'Lưu thay đổi' : 'Lưu nháp'}
                    </>
                  )}
                </button>

                {/* Nút Hủy lịch - chỉ hiện khi status = SCHEDULED */}
                {isEditMode && formData.status === 'SCHEDULED' && (
                  <button
                    onClick={handleUnschedule}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <XCircle size={20} />
                        Hủy lịch
                      </>
                    )}
                  </button>
                )}

                {/* Nút Lên lịch - chỉ hiện khi đã lưu và có scheduledPublishDate và chưa publish */}
                {isEditMode && formData.scheduledPublishDate && formData.status !== 'PUBLISHED' && formData.status !== 'SCHEDULED' && (
                  <button
                    onClick={handleSchedulePublish}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Clock size={20} />
                        Lên lịch xuất bản
                      </>
                    )}
                  </button>
                )}

                {/* Nút Xuất bản ngay - chỉ hiện khi đã lưu và chưa publish */}
                {isEditMode && formData.status !== 'PUBLISHED' && (
                  <button
                    onClick={handlePublishNow}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Đang xuất bản...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Xuất bản ngay
                      </>
                    )}
                  </button>
                )}

                {/* Nút Chuyển về Draft - chỉ hiện khi đã publish hoặc scheduled */}
                {isEditMode && (formData.status === 'PUBLISHED' || formData.status === 'SCHEDULED') && (
                  <button
                    onClick={handleRevertToDraft}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <AlertCircle size={20} />
                        Chuyển về nháp
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
