import axiosClient, { axiosClientForCrawl } from './axiosClient';

const articleApi = {
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

  // CRUD Articles
  createArticle: (data) => {
    return axiosClient.post('/articles', data);
  },

  getAllArticles: (params) => {
    return axiosClient.get('/articles', { params });
  },

  getArticleById: (id) => {
    return axiosClient.get(`/articles/${id}`);
  },

  updateArticle: (id, data) => {
    return axiosClient.put(`/articles/${id}`, data);
  },

  deleteArticle: (id) => {
    return axiosClient.delete(`/articles/${id}`);
  },

  // Generate Audio (if available)
  generateAudio: (articleId) => {
    return axiosClient.post(`/articles/${articleId}/generate-audio`);
  },

  // Publish/Unpublish
  publishArticle: (id) => {
    return axiosClient.patch(`/articles/${id}/publish`);
  },

  unpublishArticle: (id) => {
    return axiosClient.patch(`/articles/${id}/unpublish`);
  }
};

export default articleApi;
