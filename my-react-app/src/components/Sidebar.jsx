import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import {
  Home,
  FileText,
  Users,
  BookOpen,
  Settings,
  List,
  PlusCircle,
  BarChart3,
  ChevronDown,
  ChevronRight,
  User,
  CreditCard, // Icon cho Flash Card
  Edit3, // Icon cho Blog
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    tests: true,
    users: false,
    courses: false,
    flashcards: false,
    blogs: false,
  });

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home size={20} />,
      path: "/admin",
      exact: true,
    },
    {
      title: "Quản lý đề thi",
      icon: <FileText size={20} />,
      key: "tests",
      submenu: [
        {
          title: "Danh sách đề thi",
          icon: <List size={16} />,
          path: "/admin/tests",
        },
        {
          title: "Tạo đề thi mới",
          icon: <PlusCircle size={16} />,
          path: "/admin/tests/create",
        },
        {
          title: "Thống kê",
          icon: <BarChart3 size={16} />,
          path: "/admin/tests/statistics",
        },
      ],
    },
    {
      title: "Quản lý User",
      icon: <Users size={20} />,
      key: "users",
      submenu: [
        {
          title: "Danh sách người dùng",
          icon: <List size={16} />,
          path: "/admin/users",
        },
      ],
    },
    {
      title: "Quản lý khóa học",
      icon: <BookOpen size={20} />,
      key: "courses",
      submenu: [
        {
          title: "Danh sách khóa học",
          icon: <List size={16} />,
          path: "/admin/courses",
        }
      ],
    },
    {
      title: "Quản lý Flash Card",
      icon: <CreditCard size={20} />,
      key: "flashcards",
      submenu: [
        {
          title: "Danh sách Flash Card",
          icon: <List size={16} />,
          path: "/admin/flashcards",
        },
        {
          title: "Tạo Flash Card mới",
          icon: <PlusCircle size={16} />,
          path: "/admin/flashcards/create",
        },
      ],
    },

    
    {
      title: "Quản lý Blog",
      icon: <Edit3 size={20} />,
      key: "blogs",
      submenu: [
        {
          title: "Danh sách bài viết",
          icon: <List size={16} />,
          path: "/admin/blogs",
        },
        {
          title: "Tạo bài viết mới",
          icon: <PlusCircle size={16} />,
          path: "/admin/blogs/create",
        },
      ],
    },
    {
      title: "Cài đặt",
      icon: <Settings size={20} />,
      path: "/admin/settings",
    },

    {
    title: "Quản lý thông báo",
    icon: <IoNotificationsOutline className="text-lg" />, // Hoặc icon phù hợp khác
    path: "/admin/notifications",
    permissions: ["ADMIN"]
      },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="nav-logo flex items-center justify-center">
          <Link to="/" className="flex items-center">
            <img
              src="/bloom_black.png"
              alt="KoraStudy Logo"
              className="h-12 md:h-16 w-auto mr-2"
              // Bỏ các lớp dark:filter dark:brightness-0 dark:invert
            />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {expandedMenus[item.key] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  {expandedMenus[item.key] && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 ${
                              isActive(subItem.path)
                                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {subItem.icon}
                            <span className="text-sm">{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                    isActive(item.path, item.exact)
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">admin@korastudy.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
