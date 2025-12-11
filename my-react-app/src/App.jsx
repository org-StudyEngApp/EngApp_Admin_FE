import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import TestList from "./pages/Exam/TestList";
import LoginPages from "./pages/auth/LoginPages";
import ExamEditor from "./pages/Exam/ExamEditor";
import ExamDetail from "./pages/Exam/ExamDetail";
import UserDetail from './pages/user/UserDetails';
import UserEdit from './pages/user/UserEdit';

// Import course management components
import CourseList from "./pages/Admin/CourseList";
import CourseEditor from "./pages/Admin/CourseEditor";

// Thêm vào file routes hoặc menu của ứng dụng
import NotificationManagement from './pages/NotificationManagement';




// Import ApiDebugger để có sẵn trong console

// Import các component mới cho Flash Card và Blog
import FlashCardList from "./pages/flashcard/FlashCardList";
import CreateFlashCard from "./pages/flashcard/CreateFlashCard";
import BlogList from "./pages/blog/BlogList";
import CreateBlog from "./pages/blog/CreateBlog";

// Import User Management components
import UserList from "./pages/user/UserList";



function App() {
  return (
  
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPages />} />

        {/* Dashboard routes */}
        <Route
          path="/"
          element={
            <AdminLayout title="Dashboard">
              <Dashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminLayout title="Dashboard">
              <Dashboard />
            </AdminLayout>
          }
        />

        {/* Test Management Routes */}
        <Route
          path="/admin/tests"
          element={
            <AdminLayout title="Quản lý đề thi">
              <TestList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tests/create"
          element={
            <AdminLayout title="Tạo đề thi mới">
              <ExamEditor />
            </AdminLayout>
          }
        />
        {/* ✅ Route mới cho xem chi tiết user */}
        <Route
          path="/admin/users/view/:id"
          element={
            <AdminLayout title="Xem thông tin người dùng">
              <UserDetail />
            </AdminLayout>
          }
        />
        {/* ✅ Route mới cho chỉnh sửa user */}
        <Route
          path="/admin/users/edit/:id"
          element={
            <AdminLayout title="Chỉnh sửa người dùng">
              <UserEdit />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tests/:id"
          element={
            <AdminLayout title="Chi tiết đề thi">
              <ExamDetail />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/tests/:id/edit"
          element={
            <AdminLayout title="Chỉnh sửa đề thi">
              <ExamEditor />
            </AdminLayout>
          }
        />

       
        {/* User Management Routes */}
        <Route
          path="/admin/users"
          element={
            <AdminLayout title="Quản lý người dùng">
              <UserList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users/view/:id"
          element={
            <AdminLayout title="Xem thông tin người dùng">
              <div className="p-6">Chi tiết người dùng - Coming Soon</div>
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users/edit/:id"
          element={
            <AdminLayout title="Chỉnh sửa người dùng">
              <div className="p-6">Chỉnh sửa người dùng - Coming Soon</div>
            </AdminLayout>
          }
        />

        {/* Course Management Routes */}
        <Route
          path="/admin/courses"
          element={
            <AdminLayout title="Quản lý khóa học">
              <CourseList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/courses/new"
          element={
            <AdminLayout title="Tạo khóa học mới">
              <CourseEditor />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/courses/:id/edit"
          element={
            <AdminLayout title="Chỉnh sửa khóa học">
              <CourseEditor />
            </AdminLayout>
          }
        />

        {/* Flash Card Management Routes */}
        <Route
          path="/admin/flashcards"
          element={
            <AdminLayout title="Quản lý Flash Card">
              <FlashCardList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/flashcards/create"
          element={
            <AdminLayout title="Tạo Flash Card mới">
              <CreateFlashCard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/flashcards/edit/:id"
          element={
            <AdminLayout title="Chỉnh sửa Flash Card">
              <CreateFlashCard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/flashcards/view/:id"
          element={
            <AdminLayout title="Xem Flash Card">
              <CreateFlashCard />
            </AdminLayout>
          }
        />

        {/* Blog Management Routes */}
        <Route
          path="/admin/blogs"
          element={
            <AdminLayout title="Quản lý Blog">
              <BlogList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blogs/create"
          element={
            <AdminLayout title="Tạo bài viết mới">
              <CreateBlog />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/blogs/edit/:id"
          element={
            <AdminLayout title="Chỉnh sửa bài viết">
              <CreateBlog />
            </AdminLayout>
          }
        />

        {/* Notification Management Route */}
        <Route
          path="/admin/notifications"
          element={
            <AdminLayout title="Quản lý thông báo">
              <NotificationManagement />
            </AdminLayout>
          }
        />

        {/* Settings Route */}
        <Route
          path="/admin/settings"
          element={
            <AdminLayout title="Cài đặt">
              <div className="p-6">Cài đặt - Coming Soon</div>
            </AdminLayout>
          }
        />

        

        {/* Fallback route - 404 Page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-6">
                  Trang không tồn tại
                </p>
                <a
                  href="/admin"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Quay lại Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
  
  );
}

export default App;
