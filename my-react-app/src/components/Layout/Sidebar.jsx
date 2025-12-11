import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BookOpen,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/exams', icon: FileText, label: 'Quản lý đề thi' },
    { path: '/admin/courses', icon: BookOpen, label: 'Khóa học' },
    { path: '/admin/users', icon: Users, label: 'Người dùng' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Thống kê' },
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">K</span>
        </div>
        <span className="text-xl font-bold">KoraStudy Admin</span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
