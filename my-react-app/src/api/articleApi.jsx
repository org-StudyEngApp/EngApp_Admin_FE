import axiosClient, { axiosClientForCrawl, axiosClientForTranslation } from './axiosClient';

const articleApi = {
  // ==================== UTILITY APIs ====================
  
  // Preview Crawler - Fetch dữ liệu từ URL (KHÔNG lưu vào database, chỉ preview)
  fetchFromUrl: (url, options = {}) => {
    const body = {
      url: url,
      generateAudio: options.generateAudio !== undefined ? options.generateAudio : true,
      generateQuiz: options.generateQuiz !== undefined ? options.generateQuiz : true,
      quizQuestionCount: options.quizQuestionCount || 5,
      newsTopicId: options.newsTopicId || null,
      newsSeriesId: options.newsSeriesId || null
    };
    return axiosClientForCrawl.post('/articles/preview-crawl', body);
  },

  // Generate Audio (if available)
  generateAudio: (articleId) => {
    return axiosClient.post(`/articles/${articleId}/generate-audio`);
  },

  // ==================== ADMIN CRUD APIs ====================
  // Admin có thể thao tác với TẤT CẢ bài viết (DRAFT, SCHEDULED, PUBLISHED)
  
  // Tạo bài báo mới
  createArticle: (data) => {
    return axiosClient.post('/admin/articles', data);
  },

  // Lấy tất cả bài báo (Admin - bao gồm cả DRAFT, SCHEDULED, PUBLISHED)
  getAllArticles: (params) => {
    return axiosClient.get('/admin/articles', { params });
  },

  // Lấy bài báo theo ID (Admin - xem được mọi status)
  getArticleById: (id) => {
    return axiosClient.get(`/admin/articles/${id}`);
  },

  // Cập nhật bài báo
  updateArticle: (id, data) => {
    return axiosClient.put(`/admin/articles/${id}`, data);
  },

  // Xóa bài báo
  deleteArticle: (id) => {
    return axiosClient.delete(`/admin/articles/${id}`);
  },

  /**
   * Cập nhật trạng thái Lock/Unlock bài báo (Premium Only)
   * @param {number|string} id 
   * @param {boolean} isLocked - true = chỉ Premium, false = public
   */
  updateArticleLockStatus: (id, isLocked) => {
    return axiosClient.put(`/admin/articles/${id}`, { isLocked });
  },

  // ==================== STATUS MANAGEMENT APIs ====================
  
  // Publish ngay lập tức
  publishNow: (id) => {
    return axiosClient.put(`/admin/articles/${id}/publish`);
  },

  // Unpublish - gỡ xuất bản (chuyển về DRAFT)
  unpublish: (id) => {
    return axiosClient.put(`/admin/articles/${id}/unpublish`);
  },

  // Lên lịch publish tự động
  schedulePublish: (id, scheduledDate) => {
    return axiosClient.put(`/admin/articles/${id}/schedule?scheduledDate=${encodeURIComponent(scheduledDate)}`);
  },

  // Hủy lịch publish
  unschedule: (id) => {
    return axiosClient.put(`/admin/articles/${id}/unschedule`);
  },

  // Lấy bài báo theo status (DRAFT, SCHEDULED, PUBLISHED)
  getArticlesByStatus: (status, params = {}) => {
    return axiosClient.get(`/admin/articles/by-status`, { 
      params: { status, ...params } 
    });
  },

  // Thống kê số lượng bài báo theo status
  getStatistics: () => {
    return axiosClient.get('/admin/articles/statistics');
  },

  // ==================== PUBLIC USER APIs ====================
  // User CHỈ nhìn thấy bài có status = PUBLISHED
  
  // Lấy danh sách bài PUBLISHED (cho User)
  getPublishedArticles: (params) => {
    return axiosClient.get('/articles', { params });
  },

  // Lấy chi tiết bài PUBLISHED (cho User)
  getPublishedArticleById: (id) => {
    return axiosClient.get(`/articles/${id}`);
  },

  // ==================== TRANSLATION APIs ====================
  
  // Admin dịch trước bài báo và lưu vào database (FREE cho tất cả user)
  // Sử dụng axiosClientForTranslation với timeout cao (90s) cho Gemini API
  translateArticle: (articleId) => {
    return axiosClientForTranslation.post(`/admin/articles/${articleId}/translate`);
  },

  // User lấy bản dịch có sẵn từ database (FREE - không tốn quota)
  getStoredTranslation: (articleId) => {
    return axiosClient.get(`/articles/${articleId}/translation/stored`);
  },

  // User dịch bằng AI (Giới hạn 10 lần/ngày cho free user)
  // Sử dụng axiosClientForTranslation với timeout cao (90s)
  getAiTranslation: (articleId) => {
    return axiosClientForTranslation.post(`/articles/${articleId}/translation/ai`);
  },

  // ==================== LEGACY SUPPORT ====================
  // Giữ lại để tương thích với code cũ
  
  publishArticle: (id) => {
    return axiosClient.put(`/admin/articles/${id}/publish`);
  },

  unpublishArticle: (id) => {
    return axiosClient.put(`/admin/articles/${id}/unpublish`);
  },

  revertToDraft: (id) => {
    return axiosClient.put(`/admin/articles/${id}/unpublish`);
  }
};

export default articleApi;
