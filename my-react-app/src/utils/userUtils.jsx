// Get user roles display
export const getUserRoles = (user) => {
  if (!user.roles || user.roles.length === 0) {
    return 'USER';
  }
  return user.roles.join(', ');
};

// Get role color
export const getRoleColor = (roles) => {
  const roleString = Array.isArray(roles) ? roles.join(',') : roles;
  if (roleString.includes('ADMIN')) return 'bg-red-100 text-red-800';
  if (roleString.includes('CONTENT_MANAGER')) return 'bg-blue-100 text-blue-800';
  if (roleString.includes('DELIVERY_MANAGER')) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

// Get status color
export const getStatusColor = (isEnabled) => {
  return isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

// Get status text
export const getStatusText = (isEnabled) => {
  return isEnabled ? 'Hoạt động' : 'Bị khóa';
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN');
};