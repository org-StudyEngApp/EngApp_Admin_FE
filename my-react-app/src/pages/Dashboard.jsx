import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Eye, 
  Plus, 
  Calendar,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import userApi from '../api/userApi';
import blogApi from '../api/blogApi';
import courseApi from '../api/courseApi';
import AdminExamService from '../services/AdminExamService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalCourses: 0,
    todayTests: 0,
    userGrowth: 0,
    examGrowth: 0,
    courseGrowth: 0,
    testGrowth: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch users data với unwrapped response
        const usersData = await userApi.getAllUsers({ page: 0, size: 1 });
        
        // Fetch user statistics
        let userStatsData = null;
        try {
          userStatsData = await userApi.getUserStatistics();
          setUserStats(userStatsData);
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }
        
        // Fetch exams data
        let examsData = [];
        try {
          const examsResponse = await AdminExamService.getAllExams();
          examsData = examsResponse.result || examsResponse.data || examsResponse || [];
        } catch (error) {
          console.error('Error fetching exams:', error);
        }
        
        // Fetch courses data
        let coursesData = { totalElements: 0 };
        try {
          coursesData = await courseApi.getAllCoursesAdmin({ page: 0, size: 1 });
        } catch (error) {
          console.error('Error fetching courses:', error);
        }

        // Fetch course stats
        let courseStatsData = null;
        try {
          courseStatsData = await courseApi.getCourseStats();
          setCourseStats(courseStatsData);
        } catch (error) {
          console.error('Error fetching course stats:', error);
        }
        
        // Calculate today's tests (exams created today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTests = Array.isArray(examsData) ? examsData.filter(exam => {
          if (exam.createdAt) {
            const examDate = new Date(exam.createdAt);
            examDate.setHours(0, 0, 0, 0);
            return examDate.getTime() === today.getTime();
          }
          return false;
        }).length : 0;
        
        setStats({
          totalUsers: usersData?.totalElements || userStatsData?.overview?.totalUsers || 0,
          totalExams: Array.isArray(examsData) ? examsData.length : 0,
          totalCourses: coursesData?.totalElements || courseStatsData?.totalCourses || 0,
          todayTests: todayTests,
          userGrowth: 12, // Có thể tính từ user stats nếu có data
          examGrowth: 8,
          courseGrowth: 23,
          testGrowth: -5
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data for other sections
  const recentActivities = [
    {
      id: 1,
      type: 'test_created',
      title: 'Đề thi TOPIK I - Đề số 15 đã được tạo',
      user: 'Admin User',
      time: '2 phút trước',
      icon: <FileText size={16} />,
      color: 'blue'
    },
    {
      id: 2,
      type: 'user_registered',
      title: 'Người dùng mới đăng ký: nguyenvana@email.com',
      user: 'System',
      time: '15 phút trước',
      icon: <Users size={16} />,
      color: 'green'
    },
    {
      id: 3,
      type: 'test_completed',
      title: '25 thí sinh hoàn thành đề thi TOPIK II',
      user: 'System',
      time: '1 giờ trước',
      icon: <Award size={16} />,
      color: 'purple'
    },
    {
      id: 4,
      type: 'course_updated',
      title: 'Khóa học "Ngữ pháp cơ bản" đã được cập nhật',
      user: 'Admin User',
      time: '2 giờ trước',
      icon: <BookOpen size={16} />,
      color: 'orange'
    }
  ];

  const quickActions = [
    {
      title: 'Tạo đề thi mới',
      description: 'Tạo đề thi TOPIK mới',
      icon: <Plus size={20} />,
      color: 'blue',
      path: '/admin/tests/create'
    },
    {
      title: 'Xem bài viết',
      description: 'Quản lý bài viết blog',
      icon: <Eye size={20} />,
      color: 'green',
      path: '/admin/blogs'
    },
    {
      title: 'Tạo khóa học',
      description: 'Tạo khóa học mới',
      icon: <BookOpen size={20} />,
      color: 'purple',
      path: '/admin/courses/create'
    },
    {
      title: 'Xem thống kê',
      description: 'Xem báo cáo chi tiết',
      icon: <Activity size={20} />,
      color: 'orange',
      path: '/admin/tests/statistics'
    }
  ];

  const topTests = [
    {
      id: 1,
      title: 'TOPIK I - Đề thi thử số 1',
      participants: 156,
      completionRate: 89,
      avgScore: 78
    },
    {
      id: 2,
      title: 'TOPIK II - Đề thi thử số 2',
      participants: 134,
      completionRate: 92,
      avgScore: 82
    },
    {
      id: 3,
      title: 'Kiểm tra ngữ pháp cơ bản',
      participants: 234,
      completionRate: 95,
      avgScore: 85
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color] || colors.blue;
  };

  // Cập nhật stats data với dữ liệu thực
  const statsData = [
    {
      title: 'Tổng số người dùng',
      value: loading ? '...' : stats.totalUsers.toLocaleString(),
      change: `${stats.userGrowth > 0 ? '+' : ''}${stats.userGrowth}%`,
      changeType: stats.userGrowth >= 0 ? 'increase' : 'decrease',
      icon: <Users size={24} />,
      color: 'blue'
    },
    {
      title: 'Đề thi đang hoạt động',
      value: loading ? '...' : stats.totalExams.toString(),
      change: `${stats.examGrowth > 0 ? '+' : ''}${stats.examGrowth}%`,
      changeType: stats.examGrowth >= 0 ? 'increase' : 'decrease',
      icon: <FileText size={24} />,
      color: 'green'
    },
    {
      title: 'Khóa học',
      value: loading ? '...' : stats.totalCourses.toString(),
      change: `${stats.courseGrowth > 0 ? '+' : ''}${stats.courseGrowth}%`,
      changeType: stats.courseGrowth >= 0 ? 'increase' : 'decrease',
      icon: <BookOpen size={24} />,
      color: 'purple'
    },
    {
      title: 'Lượt thi hôm nay',
      value: loading ? '...' : stats.todayTests.toString(),
      change: `${stats.testGrowth > 0 ? '+' : ''}${stats.testGrowth}%`,
      changeType: stats.testGrowth >= 0 ? 'increase' : 'decrease',
      icon: <TrendingUp size={24} />,
      color: 'orange'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống KoraStudy Admin</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsData.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight size={16} className="text-green-600" />
                    ) : (
                      <ArrowDownRight size={16} className="text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                  <div className={colorClasses.text}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
            </div>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const colorClasses = getColorClasses(action.color);
                return (
                  <a
                    key={index}
                    href={action.path}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses.border} ${colorClasses.bg} hover:opacity-80 transition-opacity group`}
                  >
                    <div className={`w-10 h-10 ${colorClasses.bg} rounded-lg flex items-center justify-center ${colorClasses.text} group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Xem tất cả
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const colorClasses = getColorClasses(activity.color);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${colorClasses.bg} rounded-lg flex items-center justify-center ${colorClasses.text} flex-shrink-0`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">bởi {activity.user}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Tests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Đề thi phổ biến nhất</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Xem chi tiết
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tên đề thi</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Thí sinh</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tỷ lệ hoàn thành</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Điểm TB</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {topTests.map((test) => (
                <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{test.title}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users size={14} />
                      <span>{test.participants}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${test.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{test.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">{test.avgScore}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;