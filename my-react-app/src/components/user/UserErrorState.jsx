import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const UserErrorState = ({ error, onRetry }) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={onRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserErrorState;