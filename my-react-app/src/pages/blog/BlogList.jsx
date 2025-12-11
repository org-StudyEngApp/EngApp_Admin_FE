import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit,
  Trash2,
  Search,
  Plus,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  MoreVertical,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';
import blogApi from '../../api/blogApi';

const BlogList = () => {
  // States
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  
  // Statistics
  const [statistics, setStatistics] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalComments: 0
  });

  // Fetch posts with filters
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine if we need to filter by published status
      let published;
      if (filterStatus === 'published') {
        published = true;
      } else if (filterStatus === 'draft') {
        published = false;
      }
      
      // Convert selectedCategories to categoryIds parameter
      const categoryIds = selectedCategories.length > 0 ? selectedCategories : undefined;

      const response = await blogApi.getAllPosts({
        keyword: searchTerm || undefined,
        categoryIds,
        published,
        page: currentPage,
        size: pageSize
      });

      const data = response.data;
      console.log('API Response Data:', data);
      console.log('Posts content:', data.content);

      if (data.content) {
        setBlogs(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setCurrentPage(data.number);
      } else {
        setBlogs([]);
        setTotalPages(0);
        setTotalElements(0);
      }

      // Fetch blog statistics
      const statsResponse = await blogApi.getBlogStatistics();
      setStatistics(statsResponse.data);

      // Fetch categories
      const categoriesResponse = await blogApi.getAllCategories();
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu blog:', error);
      setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterStatus, searchTerm, selectedCategories]);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle delete post
  const confirmDeletePost = (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await blogApi.deletePost(postToDelete);
      fetchPosts(); // Refresh the list
      setShowDeleteModal(false);
      setPostToDelete(null);
      alert('Bài viết đã được xóa thành công');
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      alert('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (postId) => {
    try {
      await blogApi.togglePostPublish(postId);
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái xuất bản:', error);
      alert('Có lỗi xảy ra khi thay đổi trạng thái xuất bản');
    }
  };

  // Handle category form
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategoryId) {
        await blogApi.updateCategory(editingCategoryId, categoryFormData);
        alert('Cập nhật danh mục thành công');
      } else {
        await blogApi.createCategory(categoryFormData);
        alert('Tạo danh mục thành công');
      }
      
      // Reset form and refresh data
      setCategoryFormData({ name: '', description: '' });
      setEditingCategoryId(null);
      setShowCategoryModal(false);
      
      // Fetch updated categories
      const categoriesResponse = await blogApi.getAllCategories();
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Lỗi khi lưu danh mục:', error);
      alert('Có lỗi xảy ra khi lưu danh mục');
    }
  };

  const editCategory = (category) => {
    setCategoryFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingCategoryId(category.id);
    setShowCategoryModal(true);
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await blogApi.deleteCategory(categoryId);
        
        // Fetch updated categories
        const categoriesResponse = await blogApi.getAllCategories();
        setCategories(categoriesResponse.data);
        alert('Xóa danh mục thành công');
      } catch (error) {
        console.error('Lỗi khi xóa danh mục:', error);
        alert('Có lỗi xảy ra khi xóa danh mục');
      }
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Blog</h1>
          <p className="text-gray-600 mt-1">Quản lý các bài viết và tin tức</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Thêm danh mục
          </button>
          <Link 
            to="/admin/blogs/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Tạo bài viết mới
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng bài viết</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalPosts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Edit size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
              <p className="text-2xl font-bold text-green-600">{statistics.publishedPosts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bản nháp</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.draftPosts}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng lượt xem</p>
              <p className="text-2xl font-bold text-purple-600">{statistics.totalViews}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5/trang</option>
              <option value={10}>10/trang</option>
              <option value={20}>20/trang</option>
              <option value={50}>50/trang</option>
            </select>
          </div>
          <button 
            onClick={() => fetchPosts()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
        
        {/* Category filters */}
        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map(category => (
              <div 
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                  selectedCategories.includes(category.id) 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                {category.name}
              </div>
            ))}
            {selectedCategories.length > 0 && (
              <div 
                onClick={() => setSelectedCategories([])}
                className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 cursor-pointer flex items-center gap-1"
              >
                <XCircle size={14} />
                Xóa bộ lọc
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <XCircle className="text-red-500" size={16} />
            <span className="text-red-700 font-medium">Lỗi</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Blog Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày xuất bản
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Edit size={48} className="text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-600 mb-2">
                        Không có bài viết nào
                      </p>
                      <p className="text-gray-500 mb-6">
                        Hãy tạo bài viết mới hoặc thay đổi bộ lọc
                      </p>
                      <Link
                        to="/admin/blogs/create"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Tạo bài viết mới
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {blog.postTitle}
                          {blog.featuredImage && (
                            <span className="text-blue-500" title="Có hình ảnh">
                              <Eye size={14} />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{blog.postSummary}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {blog.categories && blog.categories.map((category) => (
                          <span 
                            key={category.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category.name}
                          </span>
                        ))}
                        {(!blog.categories || blog.categories.length === 0) && (
                          <span className="text-xs text-gray-400">Không có danh mục</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.published ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-1">
                      <User size={14} className="text-gray-400" />
                      {blog.authorName || 'Admin'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-1">
                      <Eye size={14} className="text-gray-400" />
                      {blog.viewCount || 0}
                      {blog.commentCount > 0 && (
                        <span className="ml-2 flex items-center gap-1 text-gray-500">
                          <MessageSquare size={14} className="text-gray-400" />
                          {blog.commentCount}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {blog.published
                        ? (blog.publishedAt
                            ? new Date(blog.publishedAt).toLocaleDateString('vi-VN')
                            : (blog.createdAt
                                ? new Date(blog.createdAt).toLocaleDateString('vi-VN')
                                : 'Chưa xuất bản'))
                        : (blog.createdAt
                            ? new Date(blog.createdAt).toLocaleDateString('vi-VN')
                            : 'Chưa xuất bản')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/blogs/edit/${blog.id}`}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(blog.id)}
                          className={`p-1 hover:bg-gray-100 rounded text-gray-600 ${blog.published ? 'hover:text-yellow-600' : 'hover:text-green-600'}`}
                          title={blog.published ? 'Chuyển về nháp' : 'Xuất bản'}
                        >
                          {blog.published ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-purple-600"
                          title="Xem trên website"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => confirmDeletePost(blog.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="p-1 hover:bg-gray-100 rounded text-gray-600"
                          title="Thêm"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{" "}
              <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span>{" "}
              trong tổng số{" "}
              <span className="font-medium">{totalElements}</span> kết quả
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đầu
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cuối
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa bài viết
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPostToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategoryId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h3>
            
            <form onSubmit={handleCategorySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mô tả danh mục"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-between">
                <div>
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setCategoryFormData({ name: '', description: '' });
                      }}
                      className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Tạo mới
                    </button>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategoryId(null);
                      setCategoryFormData({ name: '', description: '' });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingCategoryId ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </div>
            </form>
            
            {/* Categories List */}
            {categories.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Danh mục hiện có</h4>
                <div className="max-h-60 overflow-y-auto">
                  {categories.map(category => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between py-2 border-b border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-xs text-gray-500">{category.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editCategory(category)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;