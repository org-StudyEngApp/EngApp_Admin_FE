import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

const LoginContainer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setLoading(true);
    setError("");

    console.log("=== LOGIN DEBUG ===");
    console.log("Form data:", formData);

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      console.log("Response status:", response.status);
      console.log("Response data:", data);
      console.log("Token received:", data.token);
      console.log("Roles:", data.roles);

      if (response.ok && data.token) {
        // Lưu token với tất cả các key có thể
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminToken", data.token);
        
        // Lưu thông tin user
        localStorage.setItem("userRoles", JSON.stringify(data.roles || []));
        localStorage.setItem("username", data.username || formData.username);

        // Kiểm tra roles
        const userRoles = data.roles || [];
        const hasAdminAccess = userRoles.some(role => 
          role === "ADMIN" || 
          role === "CONTENT_MANAGER" || 
          role === "DELIVERY_MANAGER"
        );

        console.log("User roles:", userRoles);
        console.log("Has admin access:", hasAdminAccess);

        if (hasAdminAccess) {
          console.log("✅ Access granted, navigating to /admin");
          navigate("/admin");
        } else {
          console.log("❌ Access denied. User roles:", userRoles);
          setError(`Bạn không có quyền truy cập trang quản trị. Roles: ${userRoles.join(', ')}`);
        }
      } else {
        console.log("❌ Login failed:", data);
        setError(data.message || "Đăng nhập không thành công");
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      setError("Lỗi kết nối với máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onLogin={handleLogin} loading={loading} error={error} />;
};

export default LoginContainer;