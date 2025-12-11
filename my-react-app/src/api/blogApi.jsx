import axiosClient from './axiosClient';

const blogApi = {
  // Lấy danh sách bài viết có phân trang và lọc
  getAllPosts: (params = {}) => {
    const { keyword, categoryIds, published, page = 0, size = 10, sort = 'createdAt,desc' } = params;
    return axiosClient.get('/api/v1/admin/blog/posts', {
      params: { keyword, categoryIds, published, page, size, sort }
    });
  },

  // Lấy chi tiết bài viết để edit
  getPostById: (id) => {
    return axiosClient.get(`/api/v1/admin/blog/posts/${id}`);
  },

  // Tạo bài viết mới
  createPost: (data) => {
    console.log('Creating post with data:', data);
    return axiosClient.post('/api/v1/admin/blog/posts', data);
  },

  // Cập nhật bài viết
  updatePost: (id, data) => {
    console.log('Updating post with data:', data);
    return axiosClient.put(`/api/v1/admin/blog/posts/${id}`, data);
  },

  // Xóa bài viết
  deletePost: (id) => {
    return axiosClient.delete(`/api/v1/admin/blog/posts/${id}`);
  },

  // Thay đổi trạng thái publish của bài viết
  togglePostPublish: (id) => {
    return axiosClient.patch(`/api/v1/admin/blog/posts/${id}/toggle-publish`);
  },

  // Lấy danh sách categories
  getAllCategories: () => {
    return axiosClient.get('/api/v1/admin/blog/categories');
  },

  // Tạo mới category
  createCategory: (data) => {
    return axiosClient.post('/api/v1/admin/blog/categories', data);
  },

  // Cập nhật category
  updateCategory: (id, data) => {
    return axiosClient.put(`/api/v1/admin/blog/categories/${id}`, data);
  },

  // Xóa category
  deleteCategory: (id) => {
    return axiosClient.delete(`/api/v1/admin/blog/categories/${id}`);
  },

  // Lấy danh sách comments của bài viết
  getPostComments: (postId, params = {}) => {
    const { page = 0, size = 10 } = params;
    return axiosClient.get(`/api/v1/admin/blog/posts/${postId}/comments`, {
      params: { page, size }
    });
  },

  // Xóa comment
  deleteComment: (commentId) => {
    return axiosClient.delete(`/api/v1/admin/blog/comments/${commentId}`);
  },

  // Thống kê blog
  getBlogStatistics: () => {
    return axiosClient.get('/api/v1/admin/blog/statistics');
  },

  // Upload hình ảnh cho bài viết
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/api/v1/admin/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default blogApi;