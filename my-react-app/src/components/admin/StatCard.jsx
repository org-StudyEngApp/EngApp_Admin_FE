import React from 'react';

/**
 * Reusable Stat Card Component for Payment Dashboard
 */
const StatCard = ({ title, value, percentage, icon, color = 'blue', subtitle }) => {
  const colorClasses = {
    blue: 'border-blue-600 bg-blue-50',
    green: 'border-green-600 bg-green-50',
    red: 'border-red-600 bg-red-50',
    orange: 'border-orange-600 bg-orange-50',
    purple: 'border-purple-600 bg-purple-50',
    yellow: 'border-yellow-600 bg-yellow-50',
  };

  return (
    <div className={`stat-card ${colorClasses[color]}`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="text-4xl flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-600 text-sm font-medium mb-1 truncate">
            {title}
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
          </p>
          {percentage !== undefined && (
            <div className="text-sm font-semibold text-gray-700">
              {percentage.toFixed(1)}%
            </div>
          )}
          {subtitle && (
            <div className="text-xs text-gray-600 mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
