import axios from 'axios';
import CloudinaryService from './CloudinaryService';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminExamService = {
  // Get all exams for admin
  getAllExams: async () => {
    try {
      const response = await api.get('/admin/exams');
      console.log('Fetched exams from server:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },

  // Delete an exam
  deleteExam: async (id) => {
    try {
      console.log('Deleting exam with ID:', id);
      const response = await api.delete(`/admin/exams/${id}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  },

  // Get exam detail for editing
  getExamDetail: async (id) => {
    try {
      const response = await api.get(`/admin/exams/${id}`);
      console.log('Got exam details:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  },

  // Create new exam
  createExam: async (examData) => {
    try {
      console.log('Sending data to create exam:', examData);
      const response = await api.post('/admin/exams', examData);
      console.log('Create exam response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },

  // Update exam
  updateExam: async (id, examData) => {
    try {
      console.log('Sending data to update exam:', examData);
      const response = await api.put(`/admin/exams/${id}`, examData);
      console.log('Update exam response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  },

  // Add a new part to an exam
  addPart: async (examId, partData) => {
    try {
      console.log('Adding part to exam:', examId, partData);
      const response = await api.post(`/admin/exams/${examId}/parts`, partData);
      console.log('Add part response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding part:', error);
      throw error;
    }
  },

  // Update a part
  updatePart: async (partId, partData) => {
    try {
      console.log('Updating part:', partId, partData);
      const response = await api.put(`/admin/exams/parts/${partId}`, partData);
      console.log('Update part response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating part:', error);
      throw error;
    }
  },

  // Delete a part
  deletePart: async (partId) => {
    try {
      const response = await api.delete(`/admin/exams/parts/${partId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting part:', error);
      throw error;
    }
  },

  // Add a new question to a part
  addQuestion: async (partId, questionData) => {
    try {
      console.log('Adding question to part:', partId, questionData);
      const response = await api.post(`/admin/exams/parts/${partId}/questions`, questionData);
      console.log('Add question response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  },

  // Update a question
  updateQuestion: async (questionId, questionData) => {
    try {
      console.log('Updating question:', questionId, questionData);
      const response = await api.put(`/admin/exams/questions/${questionId}`, questionData);
      console.log('Update question response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Delete a question
  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/admin/exams/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  uploadFileAndUpdateQuestion: async (questionId, file, fileType) => {
  try {
    console.log(`Bắt đầu upload ${fileType} lên Cloudinary cho câu hỏi:`, questionId);

    // Tạo form data
    const formData = new FormData();
    formData.append('file', file);

    // Chọn endpoint tương ứng
    const endpoint =
      fileType === 'image'
        ? `/admin/exams/questions/${questionId}/upload-image`
        : fileType === 'audio'
          ? `/admin/exams/questions/${questionId}/upload-audio`
          : null;

    if (!endpoint) {
      throw new Error('Loại file không được hỗ trợ');
    }

    console.log(`Sử dụng endpoint: ${endpoint}`);

    // Gửi request lên backend (đã có middleware update Cloudinary)
  const response = await api.post(endpoint, formData);

    console.log(`Upload ${fileType} và cập nhật câu hỏi thành công:`, response.data);

    return {
      url: response.data[fileType + 'Url'],
      questionData: response.data,
    };
  } catch (error) {
    console.error(`Lỗi khi upload ${fileType} và cập nhật câu hỏi:`, error);
    throw error;
  }
},
// =====================
  // Toggle exam active status
  toggleExamActive: async (id) => {
    try {
      const response = await api.patch(`/admin/exams/${id}/toggle-active`);
      return response.data;
    } catch (error) {
      console.error('Error toggling exam status:', error);
      throw error;
    }
  },

  // Duplicate exam
  duplicateExam: async (id) => {{/* Right Content - Course Card */}
    try {
      const response = await api.post(`/admin/exams/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating exam:', error);
      throw error;
    }
  }
};

export default AdminExamService;
