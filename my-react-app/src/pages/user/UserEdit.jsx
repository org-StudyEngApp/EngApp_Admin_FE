import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload, AlertCircle } from 'lucide-react';
import userApi from '../../api/userApi';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: '',
    address: '',
    idCard: '',
    level: '',
    bio: '',
    note: '',
    isUserEnabled: true,
    roles: []
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userApi.getUserDetail(id);
      const user = response.data;
      
      setOriginalUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dob: user.dob ? user.dob.split('T')[0] : '', // Format date for input
        gender: user.gender || '',
        address: user.address || '',
        idCard: user.idCard || '',
        level: user.level || '',
        bio: user.bio || '',
        note: user.note || '',
        isUserEnabled: user.isUserEnabled,
        roles: user.roles || []
      });
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, value]
        : prev.roles.filter(role => role !== value)
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      errors.firstName = 'Họ là bắt buộc';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Phone number validation
    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    // ID Card validation
    if (formData.idCard && !/^[0-9]{9,12}$/.test(formData.idCard)) {
      errors.idCard = 'CCCD/CMND không hợp lệ';
    }

    // Age validation
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 100) {
        errors.dob = 'Tuổi phải từ 13 đến 100';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Prepare data for API
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        dob: formData.dob || null,
        gender: formData.gender || null,
        address: formData.address.trim() || null,
        idCard: formData.idCard.trim() || null,
        level: formData.level || null,
        bio: formData.bio.trim() || null,
        note: formData.note.trim() || null,
        isUserEnabled: formData.isUserEnabled,
        roles: formData.roles
      };

      await userApi.updateUser(id, updateData);
      
      alert('Cập nhật thông tin người dùng thành công!');
      navigate(`/admin/users/view/${id}`);
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      
      if (error.response?.status === 400) {
        // Handle validation errors from server
        const serverErrors = error.response.data?.errors || {};
        setValidationErrors(serverErrors);
        setError('Vui lòng kiểm tra lại thông tin đã nhập');
      } else {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify({
      firstName: originalUser?.firstName || '',
      lastName: originalUser?.lastName || '',
      email: originalUser?.email || '',
      phoneNumber: originalUser?.phoneNumber || '',
      dob: originalUser?.dob ? originalUser.dob.split('T')[0] : '',
      gender: originalUser?.gender || '',
      address: originalUser?.address || '',
      idCard: originalUser?.idCard || '',
      level: originalUser?.level || '',
      bio: originalUser?.bio || '',
      note: originalUser?.note || '',
      isUserEnabled: originalUser?.isUserEnabled || true,
      roles: originalUser?.roles || []
    });

    if (hasChanges) {
      const confirmLeave = window.confirm('Bạn có chắc chắn muốn thoát? Các thay đổi sẽ không được lưu.');
      if (!confirmLeave) return;
    }

    navigate(`/admin/users/view/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !originalUser) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={fetchUserDetail}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Thử lại
              </button>
              <Link 
                to="/admin/users"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa người dùng</h1>
            <p className="text-gray-600">Cập nhật thông tin người dùng</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-500" size={16} />
            <span className="text-red-700 font-medium">Lỗi</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Thông tin cơ bản</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập họ"
                  />
                  {validationErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên"
                  />
                  {validationErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập email"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {validationErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.dob ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.dob && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.dob}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CCCD/CMND
                  </label>
                  <input
                    type="text"
                    name="idCard"
                    value={formData.idCard}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.idCard ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số CCCD/CMND"
                  />
                  {validationErrors.idCard && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.idCard}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn cấp độ</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới thiệu bản thân
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập giới thiệu về bản thân"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú của admin
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập ghi chú cho người dùng này"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cài đặt tài khoản</h3>
              
              {/* Account Status */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isUserEnabled"
                    checked={formData.isUserEnabled}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Kích hoạt tài khoản
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Tài khoản bị vô hiệu hóa sẽ không thể đăng nhập
                </p>
              </div>

              {/* Roles */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vai trò
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'ADMIN', label: 'Quản trị viên' },
                    { value: 'CONTENT_MANAGER', label: 'Quản lý nội dung' },
                    { value: 'DELIVERY_MANAGER', label: 'Quản lý giao hàng' },
                    { value: 'USER', label: 'Người dùng' }
                  ].map((role) => (
                    <label key={role.value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={role.value}
                        checked={formData.roles.includes(role.value)}
                        onChange={handleRoleChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Current User Info */}
              {originalUser && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Thông tin hiện tại</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Username:</span> {originalUser.username}
                    </p>
                    <p>
                      <span className="font-medium">Ngày tạo:</span> {new Date(originalUser.createdDate).toLocaleDateString('vi-VN')}
                    </p>
                    <p>
                      <span className="font-medium">Cập nhật lần cuối:</span> {new Date(originalUser.updatedDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;