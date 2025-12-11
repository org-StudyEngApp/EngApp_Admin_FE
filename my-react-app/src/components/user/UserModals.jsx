import React from 'react';
import userApi from '../../api/userApi';

const UserModals = ({
  showResetPasswordModal,
  setShowResetPasswordModal,
  resetPasswordUserId,
  setResetPasswordUserId,
  newPassword,
  setNewPassword,
  showDeleteModal,
  setShowDeleteModal,
  deleteTargetId,
  setDeleteTargetId,
  handleDeleteUser
}) => {
  // Handle reset password
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
      await userApi.resetUserPassword(resetPasswordUserId, newPassword);
      setShowResetPasswordModal(false);
      setResetPasswordUserId(null);
      setNewPassword('');
      alert('Đặt lại mật khẩu thành công');
    } catch (error) {
      console.error('Lỗi khi đặt lại mật khẩu:', error);
      alert('Có lỗi xảy ra khi đặt lại mật khẩu');
    }
  };

  return (
    <>
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
                  setResetPasswordUserId(null);
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
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa người dùng này? Thao tác này sẽ thực hiện soft delete và có thể khôi phục sau.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteUser(deleteTargetId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserModals;