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
  CheckCircle2
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
    sourceUrl: ''
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
        sourceUrl: article.sourceUrl || ''
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
        thumbnailUrl: article.mainImageUrl || article.thumbnailUrl || '',
        audioUrl: article.audioUrl || '',
        sourceUrl: article.sourceUrl || fetchUrl,
        summary: article.summary || ''
      });

      setStep(2);
      showNotification('success', 'Đã lấy dữ liệu thành công! Vui lòng kiểm tra và chỉnh sửa trước khi lưu.');
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

  // Step 2: Save article
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
        isTrial: false, // Default value
        newsSeriesId: null, // Optional
        orderIndex: 1 // Default value
      };

      console.log('Payload being sent:', payload); // Debug log

      if (isEditMode) {
        await articleApi.updateArticle(id, payload);
        showNotification('success', 'Cập nhật bài viết thành công!');
      } else {
        await articleApi.createArticle(payload);
        showNotification('success', 'Tạo bài viết mới thành công!');
      }

      setTimeout(() => {
        navigate('/admin/articles');
      }, 1500);
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Thông tin bài viết</h2>

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

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon size={16} className="inline mr-1" />
                  Ảnh đại diện (URL)
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
                </label>
                <input
                  type="url"
                  value={formData.audioUrl}
                  onChange={(e) => handleInputChange('audioUrl', e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Quay lại
                </button>

                <button
                  onClick={handleSaveArticle}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {isEditMode ? 'Cập nhật' : 'Lưu bài viết'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
