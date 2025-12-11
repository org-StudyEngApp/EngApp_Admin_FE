import React, { useState, useEffect } from 'react';
import { notificationService } from '../../api/notificationService';

const SendNotificationForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'all',
    userIds: []
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const userData = await notificationService.getUsersForNotification();
        setUsers(userData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset user selections when changing notification type
    if (name === 'type' && value !== 'specific') {
      setFormData(prev => ({ ...prev, userIds: [] }));
    }
  };

  const handleUserSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, userIds: selectedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    
    try {
      // Điều chỉnh payload theo đúng định dạng API yêu cầu
      const payload = {
        title: formData.title,
        content: formData.content,
        // Nếu gửi cho tất cả người dùng
        sendToAll: formData.type === 'all'
      };
      
      // Chỉ thêm userIds khi gửi cho người dùng cụ thể
      if (formData.type === 'specific' && Array.isArray(formData.userIds) && formData.userIds.length > 0) {
        payload.userIds = formData.userIds.map(id => Number(id));
      }
      
      console.log('Sending payload:', payload); // Log để debug
      
      await notificationService.sendSystemNotification(payload);
      setSuccess('Gửi thông báo thành công!');
      // Reset form
      setFormData({
        title: '',
        content: '',
        type: 'all',
        userIds: []
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      setError('Gửi thông báo thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Gửi thông báo</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề*
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Nhập tiêu đề thông báo"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung*
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Nhập nội dung thông báo"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gửi cho
          </label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="all"
                checked={formData.type === 'all'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Tất cả người dùng</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="specific"
                checked={formData.type === 'specific'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Người dùng cụ thể</span>
            </label>
          </div>
        </div>
        
        {formData.type === 'specific' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn người dùng*
            </label>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <select
                multiple
                name="userIds"
                value={formData.userIds}
                onChange={handleUserSelect}
                required={formData.type === 'specific'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
              >
                {Array.isArray(users) && users.length > 0 ? (
                  users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.username || user.email || 'Người dùng'}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Không tìm thấy người dùng</option>
                )}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">Giữ Ctrl để chọn nhiều người dùng</p>
          </div>
        )}
        
        <div>
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang gửi...
              </>
            ) : 'Gửi thông báo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendNotificationForm;