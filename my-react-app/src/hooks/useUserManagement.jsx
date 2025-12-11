import { useState, useEffect } from 'react';
import userApi from '../api/userApi';

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Statistics
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0
    },
    byRole: {
      admins: 0,
      contentManagers: 0,
      deliveryManagers: 0,
      regularUsers: 0
    }
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching users from API...');
      
      const data = await userApi.getAllUsers({
        page: currentPage,
        size: pageSize,
        sort: 'id,desc'
      });
      
      console.log('API Response:', data);
      
      // axiosClient đã unwrap response.data.result, nên data chính là result object
      // Handle paginated response
      if (data && data.content) {
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setCurrentPage(data.number);
      } else {
        // Fallback for non-paginated response
        setUsers(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalElements(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await userApi.searchUsers(searchTerm, {
        page: currentPage,
        size: pageSize
      });
      
      // axiosClient đã unwrap response, data chính là result
      if (data && data.content) {
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setUsers([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm người dùng:', error);
      setError('Có lỗi xảy ra khi tìm kiếm');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByRole = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await userApi.getUsersByRole(filterRole, {
        page: currentPage,
        size: pageSize
      });
      
      // axiosClient đã unwrap response, data chính là result
      if (data && data.content) {
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Lỗi khi lọc theo vai trò:', error);
      setError('Có lỗi xảy ra khi lọc theo vai trò');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isEnabled = filterStatus === 'active';
      const data = await userApi.getUsersByStatus(isEnabled, {
        page: currentPage,
        size: pageSize
      });
      
      // axiosClient đã unwrap response, data chính là result
      if (data && data.content) {
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Lỗi khi lọc theo trạng thái:', error);
      setError('Có lỗi xảy ra khi lọc theo trạng thái');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const statsData = await userApi.getUserStatistics();
      
      // axiosClient đã unwrap response, statsData chính là result
      setStats({
        overview: {
          totalUsers: statsData?.overview?.totalUsers || 0,
          activeUsers: statsData?.overview?.activeUsers || 0,
          inactiveUsers: statsData?.overview?.inactiveUsers || 0
        },
        byRole: {
          admins: statsData?.byRole?.admins || 0,
          contentManagers: statsData?.byRole?.contentManagers || 0,
          deliveryManagers: statsData?.byRole?.deliveryManagers || 0,
          regularUsers: statsData?.byRole?.regularUsers || 0
        }
      });
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  // Handle toggle user status
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await userApi.toggleUserStatus(userId, newStatus);
      
      // Refresh current page
      if (searchTerm) {
        searchUsers();
      } else if (filterRole !== 'all') {
        fetchUsersByRole();
      } else if (filterStatus !== 'all') {
        fetchUsersByStatus();
      } else {
        fetchUsers();
      }
      
      await fetchUserStats();
      alert(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} người dùng thành công`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      await userApi.deleteUser(userId);
      
      // Refresh current view
      if (searchTerm) {
        searchUsers();
      } else if (filterRole !== 'all') {
        fetchUsersByRole();
      } else if (filterStatus !== 'all') {
        fetchUsersByStatus();
      } else {
        fetchUsers();
      }
      
      await fetchUserStats();
      alert('Đã xóa người dùng thành công');
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      alert('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedUsers.map(userId => userApi.deleteUser(userId))
      );
      
      // Refresh current view
      if (searchTerm) {
        searchUsers();
      } else if (filterRole !== 'all') {
        fetchUsersByRole();
      } else if (filterStatus !== 'all') {
        fetchUsersByStatus();
      } else {
        fetchUsers();
      }
      
      await fetchUserStats();
      setSelectedUsers([]);
      alert('Đã xóa các người dùng được chọn');
    } catch (error) {
      console.error('Lỗi khi xóa nhiều người dùng:', error);
      alert('Có lỗi xảy ra khi xóa các người dùng');
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  // Handle individual select
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    setCurrentPage(0);
  };

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [currentPage, pageSize]);

  // Apply filters when search term or filters change
  useEffect(() => {
    setCurrentPage(0); // Reset to first page when searching
    if (searchTerm) {
      searchUsers();
    } else if (filterRole !== 'all') {
      fetchUsersByRole();
    } else if (filterStatus !== 'all') {
      fetchUsersByStatus();
    } else {
      fetchUsers();
    }
  }, [searchTerm, filterRole, filterStatus]);

  return {
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
  };
};