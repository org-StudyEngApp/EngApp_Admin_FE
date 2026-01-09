import examApi from '../api/examApi';

const AdminExamService = {
  // ========== QUẢN LÝ BÀI THI ==========
  
  /**
   * Lấy tất cả bài thi (Admin) - có thể filter theo examType
   * @param {string} examType - 'READING' | 'LISTENING' | 'FULL_TEST' (optional)
   */
  getAllExams: async (examType = null) => {
    try {
      const params = examType ? { examType } : {};
      const response = await examApi.getAllExams(params);
      console.log('Fetched exams from server:', response);
      return response;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết bài thi để edit
   */
  getExamDetail: async (id) => {
    try {
      const response = await examApi.getExamDetail(id);
      console.log('Got exam details:', response);
      return response;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  },

  /**
   * Tạo bài thi mới
   * @param {Object} examData - { title, description, level, examType, durationTimes, instructions, requirements }
   */
  createExam: async (examData) => {
    try {
      console.log('Sending data to create exam:', examData);
      const response = await examApi.createExam(examData);
      console.log('Create exam response:', response);
      return response;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin bài thi
   */
  updateExam: async (id, examData) => {
    try {
      console.log('Sending data to update exam:', examData);
      const response = await examApi.updateExam(id, examData);
      console.log('Update exam response:', response);
      return response;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  },

  /**
   * Xóa bài thi
   */
  deleteExam: async (id) => {
    try {
      console.log('Deleting exam with ID:', id);
      const response = await examApi.deleteExam(id);
      console.log('Delete response:', response);
      return response;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái Lock/Unlock bài thi (Premium Only)
   * @param {number|string} examId 
   * @param {boolean} isLocked - true = chỉ Premium, false = public
   */
  updateExamLockStatus: async (examId, isLocked) => {
    try {
      console.log('Updating exam lock status:', examId, isLocked);
      const response = await examApi.updateExamLockStatus(examId, isLocked);
      console.log('Update lock status response:', response);
      return response;
    } catch (error) {
      console.error('Error updating lock status:', error);
      throw error;
    }
  },

  // ========== QUẢN LÝ PARTS (PHẦN THI) ==========
  
  /**
   * Thêm Part cho bài thi
   */
  addPart: async (examId, partData) => {
    try {
      console.log('Adding part to exam:', examId, partData);
      const response = await examApi.addPart(examId, partData);
      console.log('Add part response:', response);
      return response;
    } catch (error) {
      console.error('Error adding part:', error);
      throw error;
    }
  },

  /**
   * Cập nhật Part
   */
  updatePart: async (partId, partData) => {
    try {
      console.log('Updating part:', partId, partData);
      const response = await examApi.updatePart(partId, partData);
      console.log('Update part response:', response);
      return response;
    } catch (error) {
      console.error('Error updating part:', error);
      throw error;
    }
  },

  /**
   * Xóa Part
   */
  deletePart: async (partId) => {
    try {
      const response = await examApi.deletePart(partId);
      return response;
    } catch (error) {
      console.error('Error deleting part:', error);
      throw error;
    }
  },

  // ========== QUẢN LÝ QUESTIONS (CÂU HỎI) ==========
  
  /**
   * Thêm câu hỏi cho Part
   */
  addQuestion: async (partId, questionData) => {
    try {
      console.log('Adding question to part:', partId, questionData);
      const response = await examApi.addQuestion(partId, questionData);
      console.log('Add question response:', response);
      return response;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  },

  /**
   * Cập nhật câu hỏi
   */
  updateQuestion: async (questionId, questionData) => {
    try {
      console.log('Updating question:', questionId, questionData);
      const response = await examApi.updateQuestion(questionId, questionData);
      console.log('Update question response:', response);
      return response;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  /**
   * Xóa câu hỏi
   */
  deleteQuestion: async (questionId) => {
    try {
      const response = await examApi.deleteQuestion(questionId);
      return response;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // ========== UPLOAD MEDIA ==========
  
  /**
   * Upload hình ảnh cho câu hỏi
   */
  uploadImage: async (file) => {
    try {
      console.log('Uploading image:', file.name);
      const response = await examApi.uploadImage(file);
      console.log('Upload image response:', response);
      return response;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  /**
   * Upload audio cho câu hỏi listening
   */
  uploadAudio: async (file) => {
    try {
      console.log('Uploading audio:', file.name);
      const response = await examApi.uploadAudio(file);
      console.log('Upload audio response:', response);
      return response;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  },

  // ========== KẾT QUẢ & THỐNG KÊ ==========

  /**
   * Lấy kết quả thi của user với breakdown Reading/Listening
   * @param {number} userId - ID của user
   * @param {string} examType - 'READING' | 'LISTENING' | 'FULL_TEST' (optional)
   */
  getUserExamResults: async (userId, examType = null) => {
    try {
      const params = examType ? { examType } : {};
      const response = await examApi.getUserExamResults(userId, params);
      console.log('Fetched user exam results:', response);
      return response;
    } catch (error) {
      console.error('Error fetching user exam results:', error);
      throw error;
    }
  },

  /**
   * Lấy thống kê tổng quan cho dashboard
   * @returns {Promise<Object>} Statistics overview
   */
  getStatisticsOverview: async () => {
    try {
      const response = await examApi.getStatisticsOverview();
      console.log('Fetched statistics overview:', response);
      return response;
    } catch (error) {
      console.error('Error fetching statistics overview:', error);
      throw error;
    }
  },

  /**
   * Lấy dữ liệu analytics cho dashboard charts
   * @param {string} period - 'week' | 'month' | 'year'
   * @returns {Promise<Object>} Dashboard analytics data
   */
  getDashboardAnalytics: async (period = 'month') => {
    try {
      const response = await examApi.getDashboardAnalytics(period);
      console.log('Fetched dashboard analytics:', response);
      return response;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },

  /**
   * Tìm kiếm kết quả thi với filters
   * @param {Object} filters - { userName, examType, minScore, maxScore, startDate, endDate, page, size }
   * @returns {Promise<Object>} Paginated exam results
   */
  searchExamResults: async (filters = {}) => {
    try {
      const params = {
        ...filters,
        page: filters.page || 0,
        size: filters.size || 20,
      };
      const response = await examApi.searchExamResults(params);
      console.log('Search exam results:', response);
      return response;
    } catch (error) {
      console.error('Error searching exam results:', error);
      throw error;
    }
  },
};

export default AdminExamService;
