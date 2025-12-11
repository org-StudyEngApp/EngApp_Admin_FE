import React from 'react';
import { Users, Shield, ShieldOff, User } from 'lucide-react';

const UserStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overview.totalUsers}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="text-blue-600" size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overview.activeUsers}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Shield className="text-green-600" size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Bị khóa</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overview.inactiveUsers}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <ShieldOff className="text-red-600" size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Quản trị viên</p>
            <p className="text-2xl font-bold text-gray-900">{stats.byRole.admins}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <User className="text-purple-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCards;