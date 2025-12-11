import React from 'react';

const UserLoadingState = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    </div>
  );
};

export default UserLoadingState;