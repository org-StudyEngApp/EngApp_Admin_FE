import axiosClient from "../api/axiosClient";

const adminCourseService = {
  // ==================== COURSE MANAGEMENT ====================
  
  getCourses: (params = {}) => {
    const { page = 0, size = 10, sortBy = "createdAt", sortDir = "desc" } = params;

    return axiosClient.get("/api/v1/admin/courses", {
      params: { page, size, sortBy, sortDir },
    });
  },

  getCourseById: (courseId) => axiosClient.get(`/api/v1/admin/courses/${courseId}`),

  createCourse: (payload) => axiosClient.post("/api/v1/admin/courses", payload),

  updateCourse: (courseId, payload) =>
    axiosClient.put(`/api/v1/admin/courses/${courseId}`, payload),

  deleteCourse: (courseId) => axiosClient.delete(`/api/v1/admin/courses/${courseId}`),

  togglePublishCourse: (courseId, isPublished) =>
    axiosClient.put(`/api/v1/admin/courses/${courseId}/publish`, null, {
      params: { isPublished },
    }),

  searchCourses: (params = {}) => {
    const { keyword = "", page = 0, size = 10 } = params;
    return axiosClient.get("/api/v1/admin/courses/search", {
      params: { keyword, page, size },
    });
  },

  getCourseStats: () => axiosClient.get("/api/v1/admin/courses/stats"),

  getCourseEnrollments: (courseId, params = {}) => {
    const { page = 0, size = 10 } = params;
    return axiosClient.get(`/api/v1/admin/courses/${courseId}/enrollments`, {
      params: { page, size },
    });
  },

  getCourseReviews: (courseId, params = {}) => {
    const { page = 0, size = 10 } = params;
    return axiosClient.get(`/api/v1/admin/courses/${courseId}/reviews`, {
      params: { page, size },
    });
  },

  // ==================== SECTION MANAGEMENT ====================
  
  createSection: (payload) => axiosClient.post("/api/v1/sections", payload),

  updateSection: (sectionId, payload) =>
    axiosClient.put(`/api/v1/sections/${sectionId}`, payload),

  deleteSection: (sectionId) => axiosClient.delete(`/api/v1/sections/${sectionId}`),

  getSectionById: (sectionId) => axiosClient.get(`/api/v1/sections/${sectionId}`),

  getSectionsByCourse: (courseId) =>
    axiosClient.get(`/api/v1/sections/course/${courseId}`),

  // ==================== LESSON MANAGEMENT ====================
  
  createLesson: (sectionId, payload) =>
    axiosClient.post(`/api/v1/lessons/section/${sectionId}`, payload),

  updateLesson: (lessonId, payload) =>
    axiosClient.put(`/api/v1/lessons/${lessonId}`, payload),

  deleteLesson: (lessonId) => axiosClient.delete(`/api/v1/lessons/${lessonId}`),

  getLessonById: (lessonId) => axiosClient.get(`/api/v1/lessons/${lessonId}`),

  getLessonsBySection: (sectionId) =>
    axiosClient.get(`/api/v1/lessons/section/${sectionId}`),

  // ==================== TOPIC GROUP ====================
  
  getTopicGroups: () => axiosClient.get("/api/v1/topic-groups"),
};

export default adminCourseService;
