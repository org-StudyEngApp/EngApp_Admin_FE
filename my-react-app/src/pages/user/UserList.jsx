import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useUserManagement } from '../../hooks/useUserManagement';
import UserLoadingState from '../../components/user/UserLoadingState';
import UserErrorState from '../../components/user/UserErrorState';
import UserStatsCards from '../../components/user/UserStatsCards';
import UserSearchFilter from '../../components/user/UserSearchFilter';
import UserTableHeader from '../../components/user/UserTableHeader';
import UserTableRow from '../../components/user/UserTableRow';
import UserEmptyState from '../../components/user/UserEmptyState';
import UserPagination from '../../components/user/UserPagination';
import UserModals from '../../components/user/UserModals';

const UserList = () => {
  const {
    // States
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    users,
    loading,
    selectedUsers,
    error,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    stats,
    
    // Actions
    fetchUsers,
    handleToggleUserStatus,
    handleDeleteUser,
    handleBulkDelete,
    handleSelectAll,
    handleSelectUser,
    handlePageChange,
    handlePageSizeChange,
    clearFilters
  } = useUserManagement();

  // Modal states (keep in main component since they're UI-specific)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Render loading state
  if (loading && users.length === 0) {
    return <UserLoadingState />;
  }

  // Render error state
  if (error && users.length === 0) {
    return <UserErrorState error={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tài khoản và thông tin người dùng trong hệ thống 
            ({totalElements} người dùng)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} />
            Xóa bộ lọc
          </button>
          <button 
            onClick={fetchUsers}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <UserStatsCards stats={stats} />

      {/* Search and Filter */}
      <UserSearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        pageSize={pageSize}
        handlePageSizeChange={handlePageSizeChange}
        selectedUsers={selectedUsers}
        handleBulkDelete={handleBulkDelete}
      />

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <UserTableHeader 
              selectedUsers={selectedUsers}
              users={users}
              handleSelectAll={handleSelectAll}
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <UserEmptyState 
                  searchTerm={searchTerm}
                  filterRole={filterRole}
                  filterStatus={filterStatus}
                />
              ) : (
                users.map((user) => (
                  <UserTableRow 
                    key={user.id}
                    user={user}
                    selectedUsers={selectedUsers}
                    handleSelectUser={handleSelectUser}
                    handleToggleUserStatus={handleToggleUserStatus}
                    setResetPasswordUserId={setResetPasswordUserId}
                    setShowResetPasswordModal={setShowResetPasswordModal}
                    setDeleteTargetId={setDeleteTargetId}
                    setShowDeleteModal={setShowDeleteModal}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <UserPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalElements={totalElements}
          handlePageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      <UserModals 
        showResetPasswordModal={showResetPasswordModal}
        setShowResetPasswordModal={setShowResetPasswordModal}
        resetPasswordUserId={resetPasswordUserId}
        setResetPasswordUserId={setResetPasswordUserId}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        deleteTargetId={deleteTargetId}
        setDeleteTargetId={setDeleteTargetId}
        handleDeleteUser={handleDeleteUser}
      />
    </div>
  );
};

export default UserList;