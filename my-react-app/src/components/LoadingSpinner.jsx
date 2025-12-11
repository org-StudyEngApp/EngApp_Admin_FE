import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Đang tải...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {text && <p className="text-gray-600 mt-2 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
