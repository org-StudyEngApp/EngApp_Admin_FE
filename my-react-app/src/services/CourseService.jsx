// src/services/CourseService.js
import courseApi from "../api/courseApi";

class CourseService {
  // ==================== ADMIN COURSE MANAGEMENT ====================
  
  /**
   * Lấy danh sách tất cả khóa học với pagination
   * @param {Object} params - Tham số phân trang và sắp xếp
   * @returns {Promise}
   */
  async getAllCoursesAdmin(params = {}) {
    try {
      const response = await courseApi.getAllCoursesAdmin(params);
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách khóa học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy danh sách khóa học");
    }
  }

  /**
   * Lấy chi tiết khóa học theo ID
   * @param {number} id - ID khóa học
   * @returns {Promise}
   */
  async getCourseById(id) {
    try {
      const response = await courseApi.getCourseByIdAdmin(id);
      return {
        success: true,
        data: response.data,
        message: "Lấy thông tin khóa học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy thông tin khóa học");
    }
  }

  /**
   * Tạo khóa học mới
   * @param {Object} courseData - Dữ liệu khóa học
   * @returns {Promise}
   */
  async createCourse(courseData) {
    try {
      // Validate dữ liệu trước khi gửi
      const validationError = this.validateCourseData(courseData);
      if (validationError) {
        return {
          success: false,
          message: validationError
        };
      }

      const response = await courseApi.createCourse(courseData);
      return {
        success: true,
        data: response.data,
        message: "Tạo khóa học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi tạo khóa học");
    }
  }

  /**
   * Cập nhật khóa học
   * @param {number} id - ID khóa học
   * @param {Object} courseData - Dữ liệu cập nhật
   * @returns {Promise}
   */
  async updateCourse(id, courseData) {
    try {
      const validationError = this.validateCourseData(courseData, false);
      if (validationError) {
        return {
          success: false,
          message: validationError
        };
      }

      const response = await courseApi.updateCourse(id, courseData);
      return {
        success: true,
        data: response.data,
        message: "Cập nhật khóa học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi cập nhật khóa học");
    }
  }

  /**
   * Xóa khóa học
   * @param {number} id - ID khóa học
   * @returns {Promise}
   */
  async deleteCourse(id) {
    try {
      await courseApi.deleteCourse(id);
      return {
        success: true,
        message: "Xóa khóa học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi xóa khóa học");
    }
  }

  /**
   * Xuất bản/hủy xuất bản khóa học
   * @param {number} id - ID khóa học
   * @param {boolean} isPublished - Trạng thái xuất bản
   * @returns {Promise}
   */
  async togglePublishCourse(id, isPublished) {
    try {
      const response = await courseApi.togglePublishCourse(id, isPublished);
      return {
        success: true,
        data: response.data,
        message: `${isPublished ? 'Xuất bản' : 'Hủy xuất bản'} khóa học thành công`
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi thay đổi trạng thái xuất bản");
    }
  }

  /**
   * Lấy thống kê khóa học
   * @returns {Promise}
   */
  async getCourseStats() {
    try {
      const response = await courseApi.getCourseStats();
      return {
        success: true,
        data: response.data,
        message: "Lấy thống kê thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy thống kê khóa học");
    }
  }

  // ==================== SECTION MANAGEMENT ====================
  
  /**
   * Lấy danh sách sections của khóa học
   * @param {number} courseId - ID khóa học
   * @returns {Promise}
   */
  async getSectionsByCourseId(courseId) {
    try {
      const response = await courseApi.getSectionsByCourseId(courseId);
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách chương học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy danh sách chương học");
    }
  }

  /**
   * Tạo section mới
   * @param {Object} sectionData - Dữ liệu section
   * @returns {Promise}
   */
  async createSection(sectionData) {
    try {
      const validationError = this.validateSectionData(sectionData);
      if (validationError) {
        return {
          success: false,
          message: validationError
        };
      }

      const response = await courseApi.createSection(sectionData);
      return {
        success: true,
        data: response.data,
        message: "Tạo chương học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi tạo chương học");
    }
  }

  /**
   * Cập nhật section
   * @param {number} id - ID section
   * @param {Object} sectionData - Dữ liệu cập nhật
   * @returns {Promise}
   */
  async updateSection(id, sectionData) {
    try {
      const validationError = this.validateSectionData(sectionData, false);
      if (validationError) {
        return {
          success: false,
          message: validationError
        };
      }

      const response = await courseApi.updateSection(id, sectionData);
      return {
        success: true,
        data: response.data,
        message: "Cập nhật chương học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi cập nhật chương học");
    }
  }

  /**
   * Xóa section
   * @param {number} id - ID section
   * @returns {Promise}
   */
  async deleteSection(id) {
    try {
      await courseApi.deleteSection(id);
      return {
        success: true,
        message: "Xóa chương học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi xóa chương học");
    }
  }

  // ==================== LESSON MANAGEMENT ====================
  
  /**
   * Lấy danh sách lessons của section
   * @param {number} sectionId - ID section
   * @returns {Promise}
   */
  async getLessonsBySectionId(sectionId) {
    try {
      const response = await courseApi.getLessonsBySectionId(sectionId);
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách bài học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy danh sách bài học");
    }
  }

  /**
   * Tạo lesson mới
   * @param {Object} lessonData - Dữ liệu lesson
   * @returns {Promise}
   */
  async createLesson(lessonData) {
    try {
      const validationError = this.validateLessonData(lessonData);
      if (validationError) {
        return {
          success: false,
          message: validationError
        };
      }

      const response = await courseApi.createLesson(lessonData);
      return {
        success: true,
        data: response.data,
        message: "Tạo bài học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi tạo bài học");
    }
  }

  /**
   * Cập nhật lesson
   * @param {number} id - ID lesson
   * @param {Object} lessonData - Dữ liệu cập nhật
   * @returns {Promise}
   */
  async updateLesson(id, lessonData) {
    try {
      const validationError = this.validateLessonData(lessonData, false);
      if (validationError) {
        return {
          success: false,
          message: validationError
        };
      }

      const response = await courseApi.updateLesson(id, lessonData);
      return {
        success: true,
        data: response.data,
        message: "Cập nhật bài học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi cập nhật bài học");
    }
  }

  /**
   * Xóa lesson
   * @param {number} id - ID lesson
   * @returns {Promise}
   */
  async deleteLesson(id) {
    try {
      await courseApi.deleteLesson(id);
      return {
        success: true,
        message: "Xóa bài học thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi xóa bài học");
    }
  }

  // ==================== ENROLLMENT MANAGEMENT ====================
  
  /**
   * Lấy danh sách đăng ký của khóa học
   * @param {number} courseId - ID khóa học
   * @param {Object} params - Tham số phân trang
   * @returns {Promise}
   */
  async getCourseEnrollments(courseId, params = {}) {
    try {
      const response = await courseApi.getCourseEnrollments(courseId, params);
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách đăng ký thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy danh sách đăng ký");
    }
  }

  // ==================== REVIEW MANAGEMENT ====================
  
  /**
   * Lấy danh sách đánh giá của khóa học
   * @param {number} courseId - ID khóa học
   * @returns {Promise}
   */
  async getCourseReviews(courseId) {
    try {
      const response = await courseApi.getCourseReviews(courseId);
      return {
        success: true,
        data: response.data,
        message: "Lấy danh sách đánh giá thành công"
      };
    } catch (error) {
      return this.handleError(error, "Lỗi khi lấy danh sách đánh giá");
    }
  }

  // ==================== VALIDATION METHODS ====================
  
  /**
   * Validate dữ liệu khóa học
   * @param {Object} courseData - Dữ liệu khóa học
   * @param {boolean} isCreate - Có phải tạo mới không
   * @returns {string|null} - Thông báo lỗi hoặc null
   */
  validateCourseData(courseData, isCreate = true) {
    if (!courseData.courseName || courseData.courseName.trim() === '') {
      return "Tên khóa học không được để trống";
    }

    if (courseData.courseName.length > 100) {
      return "Tên khóa học không được vượt quá 100 ký tự";
    }

    if (!courseData.courseDescription || courseData.courseDescription.trim() === '') {
      return "Mô tả khóa học không được để trống";
    }

    if (courseData.courseDescription.length > 1000) {
      return "Mô tả khóa học không được vượt quá 1000 ký tự";
    }

    if (courseData.price !== undefined && courseData.price < 0) {
      return "Giá khóa học không được âm";
    }

    return null;
  }

  /**
   * Validate dữ liệu section
   * @param {Object} sectionData - Dữ liệu section
   * @param {boolean} isCreate - Có phải tạo mới không
   * @returns {string|null} - Thông báo lỗi hoặc null
   */
  validateSectionData(sectionData, isCreate = true) {
    if (!sectionData.sectionTitle || sectionData.sectionTitle.trim() === '') {
      return "Tiêu đề chương học không được để trống";
    }

    if (sectionData.sectionTitle.length > 200) {
      return "Tiêu đề chương học không được vượt quá 200 ký tự";
    }

    if (isCreate && !sectionData.courseId) {
      return "ID khóa học không được để trống";
    }

    return null;
  }

  /**
   * Validate dữ liệu lesson
   * @param {Object} lessonData - Dữ liệu lesson
   * @param {boolean} isCreate - Có phải tạo mới không
   * @returns {string|null} - Thông báo lỗi hoặc null
   */
  validateLessonData(lessonData, isCreate = true) {
    if (!lessonData.lessonTitle || lessonData.lessonTitle.trim() === '') {
      return "Tiêu đề bài học không được để trống";
    }

    if (lessonData.lessonTitle.length > 200) {
      return "Tiêu đề bài học không được vượt quá 200 ký tự";
    }

    if (isCreate && !lessonData.sectionId) {
      return "ID chương học không được để trống";
    }

    if (lessonData.contentType && !['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT'].includes(lessonData.contentType)) {
      return "Loại nội dung không hợp lệ";
    }

    return null;
  }

  // ==================== UTILITY METHODS ====================
  
  /**
   * Xử lý lỗi API
   * @param {Object} error - Lỗi từ API
   * @param {string} defaultMessage - Thông báo mặc định
   * @returns {Object} - Response format
   */
  handleError(error, defaultMessage) {
    console.error("CourseService Error:", error);
    
    let message = defaultMessage;
    let status = 500;

    if (error.response) {
      status = error.response.status;
      message = error.response.data?.message || 
                error.response.data?.error || 
                defaultMessage;
    } else if (error.request) {
      message = "Không thể kết nối đến server";
    }

    return {
      success: false,
      message,
      status,
      data: null
    };
  }

  /**
   * Format currency
   * @param {number} amount - Số tiền
   * @returns {string} - Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format date
   * @param {string} dateString - Date string
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  }
}

const courseService = new CourseService();
export default courseService;
