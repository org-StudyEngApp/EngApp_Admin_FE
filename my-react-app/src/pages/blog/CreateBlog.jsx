import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import {
  ArrowLeft,
  Save,
  X,
  ImageIcon
} from 'lucide-react';
import blogApi from '../../api/blogApi';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // States
  const [blog, setBlog] = useState({
    title: '',
    excerpt: '',
    content: '',
    categories: [],
    tags: '',
    featuredImage: null,
    imageUrl: '',
    published: false,
    authorName: '',
    slug: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // TinyMCE configuration
  const editorConfig = {
    height: 500,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
      'template', 'codesample'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | link image media | code preview | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    
    // Image upload configuration
    images_upload_handler: async (blobInfo, success, failure) => {
      try {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());
        
        const response = await blogApi.uploadImage(formData.get('file'));
        success(response.data.url);
      } catch (error) {
        failure('Image upload failed: ' + error.message);
      }
    },
    
    // Auto-save
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_prefix: 'korastudy-blog-',
    autosave_retention: '2m',
    
    // Link options
    link_default_target: '_blank',
    link_assume_external_targets: true,
    
    // Table options
    table_default_attributes: {
      border: '1'
    },
    table_default_styles: {
      'border-collapse': 'collapse',
      'width': '100%'
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Tạm thời comment API call cho đến khi backend có endpoint
        // const response = await blogApi.getAllCategories();
        // setCategories(response.data);
        
        // Mock data
        setCategories([
          { id: 1, name: 'Công nghệ' },
          { id: 2, name: 'Lập trình' },
          { id: 3, name: 'Thiết kế' }
        ]);
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Fetch post data if editing
  useEffect(() => {
    const fetchPostData = async () => {
      if (id) {
        setLoading(true);
        
        try {
          const response = await blogApi.getPostById(id);
          const postData = response.data;
          
          console.log('Fetched post data:', postData);
          
          setBlog({
            title: postData.postTitle || '',
            excerpt: postData.postSummary || '',
            content: postData.postContent || '',
            categories: postData.categories?.map(cat => cat.id) || [],
            tags: postData.metas?.find(meta => meta.metaKey === 'seo_keywords')?.postMetaContext || '',
            imageUrl: postData.metas?.find(meta => meta.metaKey === 'featured_image')?.postMetaContext || '',
            published: postData.published || false,
            authorName: postData.authorName || '',
            slug: postData.slug || ''
          });

        } catch (error) {
          console.error('Lỗi khi tải thông tin bài viết:', error);
          setError('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchPostData();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const postData = {
        postTitle: blog.title,
        postSummary: blog.excerpt,
        postContent: blog.content,
        categoryIds: blog.categories,
        published: blog.published
      };

      console.log('Sending post data:', postData);

      // Handle image upload
      if (blog.featuredImage && blog.featuredImage instanceof File) {
        try {
          const imageResponse = await blogApi.uploadImage(blog.featuredImage);
          postData.featuredImage = imageResponse.data.url;
        } catch (imageError) {
          console.error('Lỗi upload ảnh:', imageError);
        }
      } else if (blog.imageUrl) {
        postData.featuredImage = blog.imageUrl;
      }
      
      let response;
      if (isEditing) {
        response = await blogApi.updatePost(id, postData);
      } else {
        response = await blogApi.createPost(postData);
      }
      
      console.log('API Response:', response);
      alert(isEditing ? 'Bài viết đã được cập nhật thành công' : 'Bài viết đã được tạo thành công');
      navigate('/admin/blogs');
    } catch (error) {
      console.error('Lỗi khi lưu bài viết:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setSaving(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setBlog({ ...blog, categories: selectedOptions });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlog({ 
        ...blog, 
        featuredImage: file,
        imageUrl: URL.createObjectURL(file)
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-2">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/blogs" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h1>
          <p className="text-gray-600 mt-1">Viết và xuất bản bài viết blog</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <X className="text-red-500" size={16} />
            <span className="text-red-700 font-medium">Lỗi</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề bài viết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={blog.title}
                  onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề bài viết..."
                  required
                />
              </div>

              {/* Excerpt */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt
                </label>
                <textarea
                  value={blog.excerpt}
                  onChange={(e) => setBlog({ ...blog, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tóm tắt bài viết..."
                />
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <Editor
                  apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
                  value={blog.content}
                  onEditorChange={(content) => setBlog({ ...blog, content })}
                  init={editorConfig}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt xuất bản</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={blog.published ? 'published' : 'draft'}
                      onChange={(e) => setBlog({ ...blog, published: e.target.value === 'published' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Bản nháp</option>
                      <option value="published">Xuất bản</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      multiple
                      value={blog.categories}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      size={5}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Giữ Ctrl (hoặc Command) để chọn nhiều danh mục
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={blog.tags}
                      onChange={(e) => setBlog({ ...blog, tags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tags, phân cách bằng dấu phẩy"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ảnh đại diện</h3>
                
                {blog.imageUrl ? (
                  <div className="mb-4">
                    <img 
                      src={blog.imageUrl} 
                      alt="Featured" 
                      className="w-full h-40 object-cover rounded-lg" 
                    />
                    <button 
                      type="button"
                      onClick={() => setBlog({ ...blog, featuredImage: null, imageUrl: '' })}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="featured-image"
                    />
                    <label
                      htmlFor="featured-image"
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                      <ImageIcon size={16} />
                      Chọn ảnh
                    </label>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-blue-400"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {blog.published ? 'Xuất bản' : 'Lưu nháp'}
                    </>
                  )}
                </button>
                <Link 
                  to="/admin/blogs"
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <X size={16} />
                  Hủy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;