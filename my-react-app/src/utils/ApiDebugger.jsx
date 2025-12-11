/**
 * Công cụ giúp debug các vấn đề liên quan đến API
 */
export const debugApiConfig = () => {
  console.group('🔍 API & Auth Debug Info');
  
  // Kiểm tra token
  const token = localStorage.getItem('accessToken');
  console.log('🔐 Token exists:', !!token);
  if (token) {
    console.log('Token:', token.substring(0, 20) + '...');
    
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', payload);
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          console.log('Token expiration:', expDate.toLocaleString());
          console.log('Is token expired:', expDate < new Date());
        }
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  }
  
  // API settings
  const apiBaseUrl = 'http://localhost:8080/api/v1';
  console.log('🌐 API Base URL:', apiBaseUrl);
  
  // Test endpoints
  console.log('🧪 Testing API endpoints...');
  fetch(`${apiBaseUrl}/health`, { method: 'GET' })
    .then(res => {
      console.log('Health check status:', res.status);
      if (res.ok) return res.json();
      return { status: 'error', code: res.status };
    })
    .then(data => console.log('Health response:', data))
    .catch(err => console.error('Health check failed:', err));

  // Network status
  console.log('📡 Network status:', navigator.onLine ? 'Online' : 'Offline');

  // Cloudinary config
  console.log('☁️ Cloudinary Config:');
  console.log(' - Cloud name:', 'dfqfh3hzu');
  console.log(' - Upload preset:', 'korastudy_preset');
  
  console.groupEnd();
  
  return 'Debug info output to console';
};

// Export a function to test a specific upload to Cloudinary
export const testCloudinaryUpload = async (file) => {
  if (!file) {
    console.error('No file provided');
    return;
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'korastudy_preset');
  formData.append('cloud_name', 'dfqfh3hzu');
  
  try {
    console.log('Testing upload with file:', file);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dfqfh3hzu/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const responseJson = await response.json();
    console.log('Cloudinary test upload response:', responseJson);
    return responseJson;
  } catch (error) {
    console.error('Cloudinary test upload failed:', error);
    return { error };
  }
};

// Make debugApiConfig available in console for debugging
if (process.env.NODE_ENV === 'development') {
  window.debugApiConfig = debugApiConfig;
  window.testCloudinaryUpload = testCloudinaryUpload;
}

export default debugApiConfig;
