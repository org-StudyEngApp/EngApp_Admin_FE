import React, { useEffect, useState } from 'react';
import AdminExamService from '../../services/AdminExamService';
import StatisticsCards from '../../components/admin/StatisticsCards';
import TrendsCharts from '../../components/admin/TrendsCharts';

const ExamResultsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewResponse, analyticsResponse] = await Promise.all([
        AdminExamService.getStatisticsOverview(),
        AdminExamService.getDashboardAnalytics(period),
      ]);

      setOverview(overviewResponse.data || overviewResponse);
      setAnalytics(analyticsResponse.data || analyticsResponse);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Results Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor exam statistics and user performance</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'year'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setPeriod('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {overview && <StatisticsCards overview={overview} />}

      {/* Charts */}
      {analytics && <TrendsCharts analytics={analytics} />}

      {/* Top Performers Section */}
      {overview && overview.topPerformers && overview.topPerformers.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">🏆 Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-semibold text-gray-700">Rank</th>
                  <th className="p-3 text-left font-semibold text-gray-700">User</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Average Score</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Total Exams</th>
                </tr>
              </thead>
              <tbody>
                {overview.topPerformers.map((performer, index) => (
                  <tr key={performer.userId} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-gray-900">{performer.userName}</td>
                    <td className="p-3">
                      <span className="text-lg font-bold text-indigo-600">
                        {performer.averageScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{performer.totalExams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResultsDashboard;
