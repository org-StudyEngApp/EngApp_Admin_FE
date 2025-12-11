import React from "react";
import LoginContainer from "../../containers/LoginContainer";

const LoginPages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative">
        {/* Background Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
          {/* Truyền prop để LoginContainer biết dùng username */}
          <LoginContainer useUsername />

          {/* Error message (if login fails) */}
          <div className="mt-4">
            <p className="text-red-500 text-xs font-light">
              Thông tin đăng nhập không chính xác. Vui lòng thử lại.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="hidden lg:block absolute top-10 left-10">
          <div className="w-20 h-20 bg-white opacity-10 rounded-full"></div>
        </div>
        <div className="hidden lg:block absolute bottom-10 right-10">
          <div className="w-32 h-32 bg-white opacity-10 rounded-full"></div>
        </div>
        <div className="hidden lg:block absolute top-1/2 left-20">
          <div className="w-16 h-16 bg-white opacity-10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPages;
