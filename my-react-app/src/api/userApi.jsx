import axiosClient from './axiosClient';

const userApi = {
  // Lấy danh sách tất cả người dùng có phân trang
  getAllUsers: (params = {}) => {
    const { page = 0, size = 20, sort = 'id,desc' } = params;
    return axiosClient.get('/admin/users', { 
      params: { page, size, sort } 
    });
  },

  // Lấy danh sách người dùng không phân trang (cho dropdown, export...)
  getAllUsersList: () => {
    return axiosClient.get('/admin/users/list');
  },

  // Tìm kiếm người dùng theo keyword
  searchUsers: (keyword, params = {}) => {
    const { page = 0, size = 20 } = params;
    return axiosClient.get('/admin/users/search', {
      params: { keyword, page, size }
    });
  },

  // Lọc người dùng theo vai trò
  getUsersByRole: (roleName, params = {}) => {
    const { page = 0, size = 20 } = params;
    return axiosClient.get('/admin/users/by-role', {
      params: { roleName, page, size }
    });
  },

  // Lọc người dùng theo trạng thái
  getUsersByStatus: (isEnabled, params = {}) => {
    const { page = 0, size = 20 } = params;
    return axiosClient.get('/admin/users/by-status', {
      params: { isEnabled, page, size }
    });
  },

  // ✅ Lấy thông tin chi tiết người dùng
  getUserDetail: (userId) => {
    return axiosClient.get(`/admin/users/${userId}`);
  },

  // ✅ Cập nhật thông tin người dùng  
  updateUser: (userId, data) => {
    return axiosClient.put(`/admin/users/${userId}`, data);
  },

  // Kích hoạt/vô hiệu hóa người dùng
  toggleUserStatus: (userId, enabled) => {
    return axiosClient.patch(`/admin/users/${userId}/status`, null, {
      params: { enabled }
    });
  },

  // Đặt lại mật khẩu cho người dùng
  resetUserPassword: (userId, newPassword) => {
    return axiosClient.put(`/admin/users/${userId}/reset-password`, null, {
      params: { newPassword }
    });
  },

  // Phê duyệt hồ sơ người dùng
  approveUserProfile: (userId) => {
    return axiosClient.patch(`/admin/users/${userId}/approve-profile`);
  },

  // Từ chối hồ sơ người dùng
  rejectUserProfile: (userId, reason) => {
    return axiosClient.patch(`/admin/users/${userId}/reject-profile`, null, {
      params: { reason }
    });
  },

  // Xóa người dùng (soft delete)
  deleteUser: (userId) => {
    return axiosClient.delete(`/admin/users/${userId}`);
  },

  // Thống kê người dùng
  getUserStatistics: () => {
    return axiosClient.get('/admin/users/statistics');
  },

  // ==================== PREMIUM USER MANAGEMENT ====================
  
  /**
   * Lấy tất cả Premium Users
   * @param {Object} params - Pagination params
   * @returns {Promise} Page of premium users
   */
  getAllPremiumUsers: (params = {}) => {
    const { page = 0, size = 20, sort = 'createdAt,desc' } = params;
    return axiosClient.get('/admin/users/premium', {
      params: { page, size, sort }
    });
  },

  /**
   * Lọc Premium Users theo loại gói
   * @param {string} subscriptionType - PREMIUM_MONTHLY hoặc PREMIUM_YEARLY
   * @param {Object} params - Pagination params
   * @returns {Promise} Page of premium users by type
   */
  getPremiumUsersByType: (subscriptionType, params = {}) => {
    const { page = 0, size = 20, sort = 'createdAt,desc' } = params;
    return axiosClient.get(`/admin/users/premium/${subscriptionType}`, {
      params: { page, size, sort }
    });
  },

  /**
   * Lấy Premium Users sắp hết hạn
   * @param {number} days - Số ngày sắp hết hạn (default: 7)
   * @param {Object} params - Pagination params
   * @returns {Promise} Page of expiring premium users
   */
  getExpiringPremiumUsers: (days = 7, params = {}) => {
    const { page = 0, size = 20, sort = 'createdAt,desc' } = params;
    return axiosClient.get('/admin/users/premium/expiring', {
      params: { days, page, size, sort }
    });
  },

  /**
   * Lấy tất cả Free Users
   * @param {Object} params - Pagination params
   * @returns {Promise} Page of free users
   */
  getAllFreeUsers: (params = {}) => {
    const { page = 0, size = 20, sort = 'createdAt,desc' } = params;
    return axiosClient.get('/admin/users/free', {
      params: { page, size, sort }
    });
  }
};

export default userApi;