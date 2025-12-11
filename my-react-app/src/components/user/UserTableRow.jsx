import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Shield,
  ShieldOff,
  Mail,
  Phone,
  Calendar,
  User,
  Key
} from 'lucide-react';
import { getUserRoles, getRoleColor, getStatusColor, getStatusText, formatDate } from '../../utils/userUtils';

const UserTableRow = ({ 
  user, 
  selectedUsers, 
  handleSelectUser, 
  handleToggleUserStatus,
  setResetPasswordUserId,
  setShowResetPasswordModal,
  setDeleteTargetId,
  setShowDeleteModal
}) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={() => handleSelectUser(user.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <User className="text-gray-400" size={20} />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
            </div>
            <div className="text-sm text-gray-500">@{user.username}</div>
            {user.userCode && (
              <div className="text-xs text-gray-400">{user.userCode}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          <div className="flex items-center gap-1 mb-1">
            <Mail size={12} className="text-gray-400" />
            <span>{user.email || '-'}</span>
          </div>
          {user.phoneNumber && (
            <div className="flex items-center gap-1">
              <Phone size={12} className="text-gray-400" />
              <span>{user.phoneNumber}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.roles)}`}>
          {getUserRoles(user)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isUserEnabled)}`}>
          {getStatusText(user.isUserEnabled)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-gray-400" />
          <span>{formatDate(user.createdDate)}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link 
            to={`/admin/users/view/${user.id}`} 
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </Link>
          <Link 
            to={`/admin/users/edit/${user.id}`} 
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-green-600 transition-colors"
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </Link>
          <button 
            onClick={() => {
              setResetPasswordUserId(user.id);
              setShowResetPasswordModal(true);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-yellow-600 transition-colors"
            title="Đặt lại mật khẩu"
          >
            <Key size={16} />
          </button>
          <button 
            onClick={() => handleToggleUserStatus(user.id, user.isUserEnabled)}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
              user.isUserEnabled ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
            }`}
            title={user.isUserEnabled ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
          >
            {user.isUserEnabled ? <ShieldOff size={16} /> : <Shield size={16} />}
          </button>
          <button 
            onClick={() => {
              setDeleteTargetId(user.id);
              setShowDeleteModal(true);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;