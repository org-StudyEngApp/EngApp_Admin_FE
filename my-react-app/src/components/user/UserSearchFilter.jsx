import React from 'react';
import { Search, Filter, Crown, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

const UserSearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  filterRole, 
  setFilterRole, 
  filterStatus, 
  setFilterStatus,
  filterPremium,
  setFilterPremium,
  filterPremiumType,
  setFilterPremiumType,
  pageSize,
  handlePageSizeChange,
  selectedUsers,
  handleBulkDelete
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Main Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            
            {/* Premium Filter */}
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-yellow-500" />
              <select
                value={filterPremium}
                onChange={(e) => setFilterPremium(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gradient-to-r from-yellow-50 to-white"
              >
                <option value="all">Tất cả gói</option>
                <option value="premium">👑 Premium</option>
                <option value="free">🆓 Free</option>
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

      {/* Premium Quick Filters */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="text-yellow-600" size={18} />
          <h3 className="text-sm font-semibold text-gray-900">Bộ lọc Premium nhanh</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* All Premium */}
          <button
            onClick={() => {
              setFilterPremium('premium');
              setFilterPremiumType('all');
            }}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              filterPremium === 'premium' && filterPremiumType === 'all'
                ? 'bg-yellow-500 border-yellow-600 text-white shadow-lg'
                : 'bg-white border-yellow-200 text-gray-700 hover:border-yellow-400'
            }`}
          >
            <Crown size={16} />
            <div className="text-left">
              <p className="text-xs font-medium">Tất cả Premium</p>
              <p className="text-xs opacity-75">Active + Expired</p>
            </div>
          </button>

          {/* Monthly Premium */}
          <button
            onClick={() => {
              setFilterPremium('premium');
              setFilterPremiumType('monthly');
            }}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              filterPremium === 'premium' && filterPremiumType === 'monthly'
                ? 'bg-blue-500 border-blue-600 text-white shadow-lg'
                : 'bg-white border-blue-200 text-gray-700 hover:border-blue-400'
            }`}
          >
            <Calendar size={16} className={filterPremium === 'premium' && filterPremiumType === 'monthly' ? 'text-white' : 'text-blue-600'} />
            <div className="text-left">
              <p className="text-xs font-medium">Premium Monthly</p>
              <p className="text-xs opacity-75">Gói tháng</p>
            </div>
          </button>

          {/* Yearly Premium */}
          <button
            onClick={() => {
              setFilterPremium('premium');
              setFilterPremiumType('yearly');
            }}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              filterPremium === 'premium' && filterPremiumType === 'yearly'
                ? 'bg-purple-500 border-purple-600 text-white shadow-lg'
                : 'bg-white border-purple-200 text-gray-700 hover:border-purple-400'
            }`}
          >
            <TrendingUp size={16} className={filterPremium === 'premium' && filterPremiumType === 'yearly' ? 'text-white' : 'text-purple-600'} />
            <div className="text-left">
              <p className="text-xs font-medium">Premium Yearly</p>
              <p className="text-xs opacity-75">Gói năm</p>
            </div>
          </button>

          {/* Expiring Soon */}
          <button
            onClick={() => {
              setFilterPremium('premium');
              setFilterPremiumType('expiring');
            }}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              filterPremium === 'premium' && filterPremiumType === 'expiring'
                ? 'bg-red-500 border-red-600 text-white shadow-lg'
                : 'bg-white border-red-200 text-gray-700 hover:border-red-400'
            }`}
          >
            <AlertTriangle size={16} className={filterPremium === 'premium' && filterPremiumType === 'expiring' ? 'text-white' : 'text-red-600'} />
            <div className="text-left">
              <p className="text-xs font-medium">Sắp hết hạn</p>
              <p className="text-xs text-gray-500">{'<'} 7 ngày</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchFilter;