import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import topicApi from '../../api/topicApi';

const TopicManager = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      thumbnailUrl: ''
    }
  });

  const thumbnailUrl = watch('thumbnailUrl');

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (editingTopic) {
      reset({
        title: editingTopic.title || editingTopic.name || '',
        description: editingTopic.description || '',
        thumbnailUrl: editingTopic.thumbnailUrl || ''
      });
    } else {
      reset({
        title: '',
        description: '',
        thumbnailUrl: ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTopic]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await topicApi.getAllTopics();
      const data = response.data || response.result || response;
      setTopics(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      showNotification('error', 'Không thể tải danh sách chủ đề');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleOpenModal = (topic = null) => {
    setEditingTopic(topic);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTopic(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      if (editingTopic) {
        await topicApi.updateTopic(editingTopic.id, data);
        showNotification('success', 'Cập nhật chủ đề thành công!');
      } else {
        await topicApi.createTopic(data);
        showNotification('success', 'Thêm chủ đề mới thành công!');
      }

      await loadTopics();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving topic:', error);
      showNotification('error', error.response?.data?.message || 'Không thể lưu chủ đề');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) {
      return;
    }

    try {
      await topicApi.deleteTopic(id);
      showNotification('success', 'Xóa chủ đề thành công!');
      await loadTopics();
    } catch (error) {
      console.error('Error deleting topic:', error);
      showNotification('error', error.response?.data?.message || 'Không thể xóa chủ đề');
    }
  };

  return (
    <div className="p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-md animate-slide-in ${
          notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        } border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Chủ đề</h1>
          <p className="text-gray-600 mt-1">Quản lý các chủ đề cho bài báo</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm chủ đề
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Chưa có chủ đề nào</p>
            <button
              onClick={() => handleOpenModal()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Thêm chủ đề đầu tiên
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thumbnail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên chủ đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topics.map((topic) => (
                <tr key={topic.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{topic.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {topic.thumbnailUrl ? (
                      <img
                        src={topic.thumbnailUrl}
                        alt={topic.name}
                        className="w-16 h-16 rounded object-cover"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>`;
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={24} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {topic.title || topic.name || 'Untitled'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-md line-clamp-2">
                      {topic.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(topic)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTopic ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên chủ đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', { 
                    required: 'Tên chủ đề không được để trống',
                    minLength: { value: 2, message: 'Tên chủ đề phải có ít nhất 2 ký tự' }
                  })}
                  placeholder="Ví dụ: Technology, Sports, Politics..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Mô tả ngắn về chủ đề này..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon size={16} className="inline mr-1" />
                  Link ảnh Thumbnail
                </label>
                <input
                  type="url"
                  {...register('thumbnailUrl', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'URL không hợp lệ'
                    }
                  })}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.thumbnailUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                />
                {errors.thumbnailUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.thumbnailUrl.message}</p>
                )}
                
                {/* Preview */}
                {thumbnailUrl && !errors.thumbnailUrl && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={thumbnailUrl}
                      alt="Preview"
                      className="w-32 h-32 rounded object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      {editingTopic ? 'Cập nhật' : 'Thêm mới'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicManager;
