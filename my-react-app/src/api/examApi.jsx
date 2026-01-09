import axiosClient from './axiosClient';

const examApi = {
  // ========== QUẢN LÝ BÀI THI ==========
  
  /**
   * Lấy tất cả bài thi (Admin) - có thể filter theo examType
   * @param {Object} params - { examType: 'READING' | 'LISTENING' | 'FULL_TEST' }
   */
  getAllExams: (params = {}) => {
    return axiosClient.get('/admin/exams', { params });
  },

  /**
   * Lấy chi tiết bài thi để edit
   * @param {number|string} examId 
   */
  getExamDetail: (examId) => {
    return axiosClient.get(`/admin/exams/${examId}`);
  },

  /**
   * Tạo bài thi mới
   * @param {Object} data - { title, description, level, examType, durationTimes, instructions, requirements }
   */
  createExam: (data) => {
    return axiosClient.post('/admin/exams', data);
  },

  /**
   * Cập nhật thông tin bài thi
   * @param {number|string} examId 
   * @param {Object} data - { title, description, level, examType, durationTimes, instructions, requirements }
   */
  updateExam: (examId, data) => {
    return axiosClient.put(`/admin/exams/${examId}`, data);
  },

  /**
   * Xóa bài thi
   * @param {number|string} examId 
   */
  deleteExam: (examId) => {
    return axiosClient.delete(`/admin/exams/${examId}`);
  },

  /**
   * Cập nhật trạng thái Lock/Unlock bài thi (Premium Only)
   * @param {number|string} examId 
   * @param {boolean} isLocked - true = chỉ Premium, false = public
   */
  updateExamLockStatus: (examId, isLocked) => {
    return axiosClient.put(`/admin/exams/${examId}`, { isLocked });
  },

  // ========== QUẢN LÝ PARTS (PHẦN THI) ==========
  
  /**
   * Thêm Part cho bài thi
   * @param {number|string} examId 
   * @param {Object} data - { title, description, instructions, timeLimit }
   */
  addPart: (examId, data) => {
    return axiosClient.post(`/admin/exams/${examId}/parts`, data);
  },

  /**
   * Cập nhật Part
   * @param {number|string} partId 
   * @param {Object} data - { title, description, instructions, timeLimit }
   */
  updatePart: (partId, data) => {
    return axiosClient.put(`/admin/exams/parts/${partId}`, data);
  },

  /**
   * Xóa Part
   * @param {number|string} partId 
   */
  deletePart: (partId) => {
    return axiosClient.delete(`/admin/exams/parts/${partId}`);
  },

  // ========== QUẢN LÝ QUESTIONS (CÂU HỎI) ==========
  
  /**
   * Thêm câu hỏi cho Part
   * @param {number|string} partId 
   * @param {Object} data - {
   *   questionText,
   *   questionType,
   *   option (JSON string array),
   *   correctAnswer,
   *   explanation,
   *   points,
   *   audioUrl (optional),
   *   imageUrl (optional)
   * }
   */
  addQuestion: (partId, data) => {
    return axiosClient.post(`/admin/exams/parts/${partId}/questions`, data);
  },

  /**
   * Cập nhật câu hỏi
   * @param {number|string} questionId 
   * @param {Object} data - { questionText, questionType, option, correctAnswer, explanation, points, audioUrl, imageUrl }
   */
  updateQuestion: (questionId, data) => {
    return axiosClient.put(`/admin/exams/questions/${questionId}`, data);
  },

  /**
   * Xóa câu hỏi
   * @param {number|string} questionId 
   */
  deleteQuestion: (questionId) => {
    return axiosClient.delete(`/admin/exams/questions/${questionId}`);
  },

  // ========== UPLOAD MEDIA (Azure Blob Storage) ==========
  
  /**
   * Upload hình ảnh cho câu hỏi lên Azure Blob Storage
   * Backend sẽ:
   * - Upload file lên Azure trong folder 'exam-images/'
   * - Tự động cập nhật imageUrl vào câu hỏi
   * - Trả về URL: { "imageUrl": "https://...blob.core.windows.net/uploads/exam-images/..." }
   * 
   * @param {number|string} questionId - ID của câu hỏi (câu hỏi phải đã được tạo)
   * @param {File} file - File hình ảnh (JPG, PNG, GIF)
   */
  uploadImageToQuestion: (questionId, file) => {
    const formData = new FormData();
    formData.append('file', file); // Backend expect 'file', not 'image'
    return axiosClient.post(`/admin/exams/questions/${questionId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload audio cho câu hỏi listening lên Azure Blob Storage
   * Backend sẽ:
   * - Upload file lên Azure trong folder 'exam-audio/'
   * - Tự động cập nhật audioUrl vào câu hỏi
   * - Trả về URL: { "audioUrl": "https://...blob.core.windows.net/uploads/exam-audio/..." }
   * 
   * @param {number|string} questionId - ID của câu hỏi (câu hỏi phải đã được tạo)
   * @param {File} file - File audio (MP3, WAV, OGG)
   */
  uploadAudioToQuestion: (questionId, file) => {
    const formData = new FormData();
    formData.append('file', file); // Backend expect 'file', not 'audio'
    return axiosClient.post(`/admin/exams/questions/${questionId}/upload-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // ========== KẾT QUẢ & THỐNG KÊ ==========

  /**
   * Lấy kết quả thi của user với breakdown Reading/Listening
   * @param {number} userId - ID của user
   * @param {Object} params - { examType: 'READING' | 'LISTENING' | 'FULL_TEST' }
   */
  getUserExamResults: (userId, params = {}) => {
    return axiosClient.get(`/admin/exams/results/user/${userId}`, { params });
  },

  /**
   * Lấy thống kê tổng quan cho dashboard
   */
  getStatisticsOverview: () => {
    return axiosClient.get('/admin/exams/statistics/overview');
  },

  /**
   * Lấy dữ liệu analytics cho dashboard charts
   * @param {string} period - 'week' | 'month' | 'year'
   */
  getDashboardAnalytics: (period = 'month') => {
    return axiosClient.get('/admin/exams/analytics/dashboard', {
      params: { period },
    });
  },

  /**
   * Tìm kiếm kết quả thi với filters
   * @param {Object} params - { userName, examType, minScore, maxScore, startDate, endDate, page, size }
   */
  searchExamResults: (params = {}) => {
    return axiosClient.get('/admin/exams/results/search', { params });
  },
};

export default examApi;
