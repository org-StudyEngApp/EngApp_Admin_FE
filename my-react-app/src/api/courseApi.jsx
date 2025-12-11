// src/api/courseApi.js
import axiosClient from "./axiosClient";

const courseApi = {
  // ==================== ADMIN COURSE MANAGEMENT ====================
  
  // Lấy danh sách khóa học (admin) với pagination
  getAllCoursesAdmin: (params = {}) => {
    const {
      page = 0,
      size = 10
    } = params;
    
    return axiosClient.get("/admin/courses", {
      params: {
        page,
        size
      }
    });
  },

  // Lấy chi tiết khóa học theo ID (admin)
  getCourseByIdAdmin: (id) => {
    return axiosClient.get(`/admin/courses/${id}`);
  },

  // Tạo khóa học mới
  createCourse: (courseData) => {
    return axiosClient.post("/admin/courses", courseData);
  },

  // Cập nhật khóa học
  updateCourse: (id, courseData) => {
    return axiosClient.put(`/admin/courses/${id}`, courseData);
  },

  // Xóa khóa học
  deleteCourse: (id) => {
    return axiosClient.delete(`/admin/courses/${id}`);
  },

  // Lấy thống kê khóa học
  getCourseStats: () => {
    return axiosClient.get("/admin/courses/stats");
  },

  // Lấy danh sách đăng ký của khóa học
  getCourseEnrollments: (id, params = {}) => {
    const { page = 0, size = 10 } = params;
    return axiosClient.get(`/admin/courses/${id}/enrollments`, {
      params: { page, size }
    });
  },

  // ==================== PUBLIC COURSE APIs ====================
  
  // Lấy tất cả khóa học đã xuất bản
  getAllPublishedCourses: () => {
    return axiosClient.get("/courses");
  },

  // Lấy chi tiết khóa học theo ID (dùng cho form edit)
  getCourseById: (id) => {
    return axiosClient.get(`/courses/${id}`);
  },

  // Tìm kiếm khóa học
  searchCourses: (keyword) => {
    return axiosClient.get("/courses/search", {
      params: { keyword }
    });
  },

  // ==================== SECTION MANAGEMENT ====================
  
  // Lấy tất cả sections của một khóa học
  getSectionsByCourseId: (courseId) => {
    return axiosClient.get(`/sections/course/${courseId}`);
  },

  // Lấy chi tiết section theo ID
  getSectionById: (id) => {
    return axiosClient.get(`/sections/${id}`);
  },

  // Tạo section mới (courseId phải có trong body)
  createSection: (sectionData) => {
    return axiosClient.post("/sections", sectionData);
  },

  // Cập nhật section
  updateSection: (id, sectionData) => {
    return axiosClient.put(`/sections/${id}`, sectionData);
  },

  // Xóa section
  deleteSection: (id) => {
    return axiosClient.delete(`/sections/${id}`);
  },

  // ==================== LESSON MANAGEMENT ====================
  
  // Lấy tất cả lessons của một section
  getLessonsBySectionId: (sectionId) => {
    return axiosClient.get(`/lessons/section/${sectionId}`);
  },

  // Lấy chi tiết lesson theo ID
  getLessonById: (id) => {
    return axiosClient.get(`/lessons/${id}`);
  },

  // Tạo lesson mới (sectionId trong URL path)
  createLesson: (sectionId, lessonData) => {
    return axiosClient.post(`/lessons/section/${sectionId}`, lessonData);
  },

  // Cập nhật lesson
  updateLesson: (id, lessonData) => {
    return axiosClient.put(`/lessons/${id}`, lessonData);
  },

  // Xóa lesson
  deleteLesson: (id) => {
    return axiosClient.delete(`/lessons/${id}`);
  },

  // ==================== ENROLLMENT MANAGEMENT ====================
  
  // Đăng ký khóa học
  enrollCourse: (enrollmentData) => {
    return axiosClient.post("/enrollments", enrollmentData);
  },

  // Lấy thông tin đăng ký theo ID
  getEnrollmentById: (id) => {
    return axiosClient.get(`/enrollments/${id}`);
  },

  // Lấy danh sách đăng ký của user
  getUserEnrollments: (userId) => {
    return axiosClient.get(`/enrollments/user/${userId}`);
  },

  // Lấy danh sách đăng ký của khóa học
  getCourseEnrollmentsList: (courseId) => {
    return axiosClient.get(`/enrollments/course/${courseId}`);
  },

  // Lấy khóa học của tôi
  getMyEnrollments: () => {
    return axiosClient.get("/enrollments/my-courses");
  },

  // Cập nhật tiến độ học tập
  updateProgress: (id, progress) => {
    return axiosClient.put(`/enrollments/${id}/progress`, null, {
      params: { progress }
    });
  },

  // Hủy đăng ký khóa học
  cancelEnrollment: (id) => {
    return axiosClient.delete(`/enrollments/${id}`);
  },

  // Kiểm tra đã đăng ký hay chưa
  checkEnrollment: (userId, courseId) => {
    return axiosClient.get("/enrollments/check", {
      params: { userId, courseId }
    });
  },

  // ==================== REVIEW MANAGEMENT ====================
  
  // Thêm đánh giá
  addReview: (reviewData) => {
    return axiosClient.post("/reviews", reviewData);
  },

  // Lấy chi tiết đánh giá theo ID
  getReviewById: (id) => {
    return axiosClient.get(`/reviews/${id}`);
  },

  // Lấy danh sách đánh giá của khóa học
  getCourseReviews: (courseId) => {
    return axiosClient.get(`/reviews/course/${courseId}`);
  },

  // Lấy điểm trung bình của khóa học
  getAverageRating: (courseId) => {
    return axiosClient.get(`/reviews/course/${courseId}/rating`);
  },

  // Cập nhật đánh giá
  updateReview: (id, reviewData) => {
    return axiosClient.put(`/reviews/${id}`, reviewData);
  },

  // Xóa đánh giá
  deleteReview: (id) => {
    return axiosClient.delete(`/reviews/${id}`);
  },

  // ==================== UTILITY METHODS ====================
  
  // Upload hình ảnh khóa học
  uploadCourseImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosClient.post('/upload/course-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload video bài học
  uploadLessonVideo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosClient.post('/upload/lesson-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default courseApi;
