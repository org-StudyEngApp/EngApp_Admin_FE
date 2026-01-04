import axiosClient, { axiosClientForVocabulary } from './axiosClient';

const vocabularyApi = {
  // ============ ADMIN APIs ============
  // Note: axiosClientForVocabulary has baseURL = /api (no /v1)

  // 1. Generate Vocabulary từ Gemini AI
  generateVocabulary: (data) => {
    return axiosClientForVocabulary.post('/admin/articles/vocabularies/generate', data);
  },

  // 2. Lấy tất cả vocabulary của article (Admin)
  getAdminVocabularies: (articleId, level = null) => {
    const params = level ? { level } : {};
    return axiosClientForVocabulary.get(`/admin/articles/${articleId}/vocabularies`, { params });
  },

  // 3. Lấy vocabulary theo ID
  getVocabularyById: (id) => {
    return axiosClientForVocabulary.get(`/admin/articles/vocabularies/${id}`);
  },

  // 4. Tạo vocabulary mới (Manual)
  createVocabulary: (articleId, data) => {
    return axiosClientForVocabulary.post(`/admin/articles/${articleId}/vocabularies`, data);
  },

  // 4b. Bulk create vocabularies (Import từ Excel)
  bulkCreateVocabularies: (articleId, vocabularies) => {
    return axiosClientForVocabulary.post(`/admin/articles/${articleId}/vocabularies/bulk`, vocabularies);
  },

  // 5. Cập nhật vocabulary
  updateVocabulary: (id, data) => {
    return axiosClientForVocabulary.put(`/admin/articles/vocabularies/${id}`, data);
  },

  // 6. Xóa vocabulary
  deleteVocabulary: (id) => {
    return axiosClientForVocabulary.delete(`/admin/articles/vocabularies/${id}`);
  },

  // 7. Xóa tất cả vocabulary của article
  deleteAllVocabularies: (articleId, level = null) => {
    const params = level ? { level } : {};
    return axiosClientForVocabulary.delete(`/admin/articles/${articleId}/vocabularies`, { params });
  },

  // 8. Approve vocabulary
  approveVocabulary: (id) => {
    return axiosClientForVocabulary.put(`/admin/articles/vocabularies/${id}/approve`);
  },

  // 9. Batch approve vocabularies
  batchApproveVocabularies: (vocabularyIds) => {
    return axiosClientForVocabulary.put('/admin/articles/vocabularies/batch-approve', vocabularyIds);
  },

  // 10. Reorder vocabularies
  reorderVocabularies: (articleId, level, vocabularyIds) => {
    return axiosClientForVocabulary.put(
      `/admin/articles/${articleId}/vocabularies/reorder?level=${level}`,
      vocabularyIds
    );
  },

  // ============ USER APIs ============

  // 1. Lấy vocabulary của article (User - chỉ approved)
  getUserVocabularies: (articleId, level = null) => {
    const params = level ? { level } : {};
    return axiosClientForVocabulary.get(`/articles/${articleId}/vocabularies`, { params });
  },

  // 2. Đếm số vocabulary
  getVocabularyCount: (articleId) => {
    return axiosClientForVocabulary.get(`/articles/${articleId}/vocabularies/count`);
  }
};

export default vocabularyApi;
