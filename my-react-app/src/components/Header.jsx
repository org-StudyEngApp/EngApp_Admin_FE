import React, { useState } from 'react';
import { Bell, Search, Settings, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  
  // Mock user data - sau này sẽ lấy từ context hoặc API
  const user = {
    name: 'Admin User',
    email: 'admin@korastudy.com',
    avatar: null // URL hình ảnh nếu có
  };
  
  const handleLogout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Chuyển hướng về trang login
    navigate('/login');
  };
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
            <Bell size={20} />
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User size={16} className="text-blue-600" />
                )}
              </div>
              <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </button>
            
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                <div className="py-1">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <a 
                    href="/admin/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} className="mr-2" />
                    Thông tin tài khoản
                  </a>
                  <a 
                    href="/admin/settings" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} className="mr-2" />
                    Cài đặt
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;