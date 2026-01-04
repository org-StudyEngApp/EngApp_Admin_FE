import React from 'react';

const StatisticsCards = ({ overview }) => {
  if (!overview) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Users Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-4 border-l-4 border-indigo-600">
        <div className="text-4xl">👥</div>
        <div className="flex-1">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{overview.totalUsers}</p>
        </div>
      </div>

      {/* Total Exams Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-4 border-l-4 border-green-600">
        <div className="text-4xl">📝</div>
        <div className="flex-1">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Exams</h3>
          <p className="text-3xl font-bold text-gray-900">{overview.totalExamsTaken}</p>
          <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600">
            <span>📖 Reading: {overview.examsByType?.READING || 0}</span>
            <span>🎧 Listening: {overview.examsByType?.LISTENING || 0}</span>
            <span>📄 Full: {overview.examsByType?.FULL_TEST || 0}</span>
          </div>
        </div>
      </div>

      {/* Average Scores Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-4 border-l-4 border-orange-600">
        <div className="text-4xl">📊</div>
        <div className="flex-1">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Average Scores</h3>
          <p className="text-3xl font-bold text-gray-900">
            {overview.averageScores?.overall?.toFixed(1) || 0}%
          </p>
          <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600">
            <span>📖 Reading: {overview.averageScores?.reading?.toFixed(1) || 0}%</span>
            <span>🎧 Listening: {overview.averageScores?.listening?.toFixed(1) || 0}%</span>
            <span>📄 Full: {overview.averageScores?.fullTest?.toFixed(1) || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;
