import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Shield, 
  ShieldOff,
  MapPin,
  Briefcase,
  Clock,
  Key,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import userApi from '../../api/userApi';
import { formatDate, getRoleColor, getStatusColor, getStatusText, getUserRoles } from '../../utils/userUtils';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userApi.getUserDetail(id);
      setUser(response.data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async () => {
    try {
      const newStatus = !user.isUserEnabled;
      await userApi.toggleUserStatus(id, newStatus);
      
      setUser(prev => ({
        ...prev,
        isUserEnabled: newStatus
      }));
      
      alert(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} người dùng thành công`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      alert('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await userApi.resetUserPassword(id, newPassword);
      setShowResetPasswordModal(false);
      setNewPassword('');
      alert('Đặt lại mật khẩu thành công');
    } catch (error) {
      console.error('Lỗi khi đặt lại mật khẩu:', error);
      alert('Có lỗi xảy ra khi đặt lại mật khẩu');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userApi.deleteUser(id);
      alert('Đã xóa người dùng thành công');
      navigate('/admin/users');
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      alert('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const handleApproveProfile = async () => {
    try {
      await userApi.approveUserProfile(id);
      alert('Đã phê duyệt hồ sơ người dùng');
      fetchUserDetail(); // Refresh data
    } catch (error) {
      console.error('Lỗi khi phê duyệt hồ sơ:', error);
      alert('Có lỗi xảy ra khi phê duyệt hồ sơ');
    }
  };

  const handleRejectProfile = async () => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      await userApi.rejectUserProfile(id, reason);
      alert('Đã từ chối hồ sơ người dùng');
      fetchUserDetail(); // Refresh data
    } catch (error) {
      console.error('Lỗi khi từ chối hồ sơ:', error);
      alert('Có lỗi xảy ra khi từ chối hồ sơ');
    }
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

  if (error) {
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

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
          <Link 
            to="/admin/users"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/users" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h1>
            <p className="text-gray-600">Xem và quản lý thông tin người dùng</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to={`/admin/users/edit/${user.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Edit size={16} />
            Chỉnh sửa
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.fullName} 
                    className="w-24 h-24 rounded-full object-cover" 
                  />
                ) : (
                  <User className="text-gray-400" size={40} />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
              </h2>
              <p className="text-gray-600">@{user.username}</p>
              {user.userCode && (
                <p className="text-sm text-gray-500 mt-1">{user.userCode}</p>
              )}
            </div>

            {/* Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Trạng thái</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isUserEnabled)}`}>
                  {getStatusText(user.isUserEnabled)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Vai trò</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.roles)}`}>
                  {getUserRoles(user)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button 
                onClick={handleToggleUserStatus}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  user.isUserEnabled 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {user.isUserEnabled ? <ShieldOff size={16} /> : <Shield size={16} />}
                {user.isUserEnabled ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
              </button>
              
              <button 
                onClick={() => setShowResetPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition-colors"
              >
                <Key size={16} />
                Đặt lại mật khẩu
              </button>

              {user.profileStatus === 'PENDING' && (
                <>
                  <button 
                    onClick={handleApproveProfile}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    <CheckCircle size={16} />
                    Phê duyệt hồ sơ
                  </button>
                  
                  <button 
                    onClick={handleRejectProfile}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
                  >
                    <XCircle size={16} />
                    Từ chối hồ sơ
                  </button>
                </>
              )}
              
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Xóa người dùng
              </button>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Thông tin chi tiết</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Thông tin cá nhân</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{user.email || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="text-sm font-medium text-gray-900">{user.phoneNumber || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Ngày sinh</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(user.dob) || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Giới tính</p>
                      <p className="text-sm font-medium text-gray-900">
                        {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  
                  {user.idCard && (
                    <div className="flex items-center gap-3">
                      <Briefcase size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">CCCD/CMND</p>
                        <p className="text-sm font-medium text-gray-900">{user.idCard}</p>
                      </div>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Địa chỉ</p>
                        <p className="text-sm font-medium text-gray-900">{user.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Thông tin tài khoản</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Ngày tạo</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(user.createdDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Lần cập nhật cuối</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(user.updatedDate)}</p>
                    </div>
                  </div>
                  
                  {user.level && (
                    <div className="flex items-center gap-3">
                      <Briefcase size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Cấp độ</p>
                        <p className="text-sm font-medium text-gray-900">{user.level}</p>
                      </div>
                    </div>
                  )}

                  {user.profileStatus && (
                    <div className="flex items-center gap-3">
                      <Shield size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Trạng thái hồ sơ</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.profileStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          user.profileStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.profileStatus === 'APPROVED' ? 'Đã duyệt' :
                           user.profileStatus === 'PENDING' ? 'Chờ duyệt' :
                           user.profileStatus === 'REJECTED' ? 'Bị từ chối' : user.profileStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(user.bio || user.note) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4">Thông tin bổ sung</h4>
                
                {user.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Giới thiệu bản thân</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{user.bio}</p>
                  </div>
                )}
                
                {user.note && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Ghi chú</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{user.note}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Đặt lại mật khẩu
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setNewPassword('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa người dùng
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa người dùng <strong>{user.fullName || user.username}</strong>? 
              Thao tác này sẽ thực hiện soft delete và có thể khôi phục sau.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;