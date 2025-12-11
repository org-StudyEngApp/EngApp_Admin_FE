import React from 'react';

const DebugToken = () => {
  const checkTokens = () => {
    const tokens = {
      accessToken: localStorage.getItem('accessToken'),
      token: localStorage.getItem('token'),
      adminToken: localStorage.getItem('adminToken'),
      userRoles: localStorage.getItem('userRoles'),
      username: localStorage.getItem('username')
    };
    
    console.log('=== TOKEN DEBUG ===');
    Object.entries(tokens).forEach(([key, value]) => {
      console.log(`${key}:`, value ? `${value.substring(0, 20)}...` : 'null');
    });
    
    return tokens;
  };

  const clearAllTokens = () => {
    localStorage.clear();
    console.log('All localStorage cleared');
    window.location.reload();
  };

  const tokens = checkTokens();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
      <h3 className="text-sm font-bold mb-2">Debug Token Info</h3>
      <div className="text-xs space-y-1">
        {Object.entries(tokens).map(([key, value]) => (
          <div key={key}>
            <span className="font-medium">{key}:</span> 
            <span className={value ? "text-green-600" : "text-red-600"}>
              {value ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 space-x-2">
        <button 
          onClick={checkTokens}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Check
        </button>
        <button 
          onClick={clearAllTokens}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default DebugToken;