import React from 'react';
import { Search, Filter } from 'lucide-react';

const UserSearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  filterRole, 
  setFilterRole, 
  filterStatus, 
  setFilterStatus,
  pageSize,
  handlePageSizeChange,
  selectedUsers,
  handleBulkDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, mã user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="CONTENT_MANAGER">Quản lý nội dung</option>
              <option value="DELIVERY_MANAGER">Quản lý giao hàng</option>
              <option value="USER">Người dùng</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Bị khóa</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5/trang</option>
              <option value={10}>10/trang</option>
              <option value={20}>20/trang</option>
              <option value={50}>50/trang</option>
            </select>
          </div>
          
          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBulkDelete}
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Xóa ({selectedUsers.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchFilter;