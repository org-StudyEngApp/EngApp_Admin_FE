import React from 'react';
import { Users, Shield, ShieldOff, User, Crown, TrendingUp, Calendar } from 'lucide-react';

const UserStatsCards = ({ stats }) => {
  const premiumUsers = stats.overview.premiumUsers || 0;
  const monthlyPremium = stats.overview.monthlyPremiumUsers || 0;
  const yearlyPremium = stats.overview.yearlyPremiumUsers || 0;
  const expiringSoon = stats.overview.premiumExpiringSoon || 0;
  
  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
        
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-lg shadow-lg border-2 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-900">👑 Premium Users</p>
              <p className="text-3xl font-bold text-white">{premiumUsers}</p>
              <p className="text-xs text-yellow-100 mt-1">
                {stats.overview.totalUsers > 0 
                  ? `${(premiumUsers / stats.overview.totalUsers * 100).toFixed(1)}%` 
                  : '0%'} của tổng
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Crown className="text-white" size={28} />
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

      {/* Premium Breakdown - Only show if there are premium users */}
      {premiumUsers > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="text-yellow-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Chi tiết Premium</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Monthly Premium */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={16} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Monthly</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{monthlyPremium}</p>
              <p className="text-xs text-gray-500 mt-1">
                {premiumUsers > 0 ? `${(monthlyPremium / premiumUsers * 100).toFixed(0)}%` : '0%'} Premium users
              </p>
            </div>

            {/* Yearly Premium */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={16} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Yearly</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{yearlyPremium}</p>
              <p className="text-xs text-gray-500 mt-1">
                {premiumUsers > 0 ? `${(yearlyPremium / premiumUsers * 100).toFixed(0)}%` : '0%'} Premium users
              </p>
            </div>

            {/* Expiring Soon */}
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">{expiringSoon}</p>
              <p className="text-xs text-gray-500 mt-1">
                Trong 7 ngày tới
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatsCards;