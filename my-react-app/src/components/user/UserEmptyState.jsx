import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus } from 'lucide-react';

const UserEmptyState = ({ searchTerm, filterRole, filterStatus }) => {
  const hasFilters = searchTerm || filterRole !== 'all' || filterStatus !== 'all';
  
  return (
    <tr>
      <td colSpan={7} className="text-center py-12">
        <div className="flex flex-col items-center justify-center">
          <Users className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasFilters ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào'}
          </h3>
          <p className="text-gray-500 mb-6">
            {hasFilters 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bắt đầu thêm người dùng đầu tiên vào hệ thống'
            }
          </p>
          {!hasFilters && (
            <Link 
              to="/admin/users/create"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <UserPlus size={16} />
              Thêm người dùng
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserEmptyState;