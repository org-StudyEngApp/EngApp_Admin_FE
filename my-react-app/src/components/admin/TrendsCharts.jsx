import React from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TrendsCharts = ({ analytics }) => {
  if (!analytics) return null;

  // Exam Trends Bar Chart Data
  const examTrendsData = {
    labels: analytics.examTrends?.labels || [],
    datasets: [
      {
        label: 'Reading Exams',
        data: analytics.examTrends?.readingExams || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
      {
        label: 'Listening Exams',
        data: analytics.examTrends?.listeningExams || [],
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2,
      },
      {
        label: 'Full Test Exams',
        data: analytics.examTrends?.fullTestExams || [],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      },
    ],
  };

  // Score Trends Line Chart Data
  const scoreTrendsData = {
    labels: analytics.averageScoreTrends?.labels || [],
    datasets: [
      {
        label: 'Reading Scores',
        data: analytics.averageScoreTrends?.readingScores || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Listening Scores',
        data: analytics.averageScoreTrends?.listeningScores || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Full Test Scores',
        data: analytics.averageScoreTrends?.fullTestScores || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // User Engagement Doughnut Chart Data
  const userEngagementData = {
    labels: ['Active Users', 'New Users', 'Returning Users'],
    datasets: [
      {
        data: [
          analytics.userEngagement?.activeUsers || 0,
          analytics.userEngagement?.newUsers || 0,
          analytics.userEngagement?.returningUsers || 0,
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Exam Activity Trends - Bar Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6" style={{ height: '400px' }}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Exam Activity Trends</h3>
        <div style={{ height: 'calc(100% - 40px)' }}>
          <Bar 
            data={examTrendsData} 
            options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Average Score Trends - Line Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6" style={{ height: '400px' }}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Average Score Trends</h3>
        <div style={{ height: 'calc(100% - 40px)' }}>
          <Line 
            data={scoreTrendsData} 
            options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* User Engagement - Doughnut Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6" style={{ height: '400px' }}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">User Engagement</h3>
        <div style={{ height: 'calc(100% - 40px)' }} className="flex items-center justify-center">
          <Doughnut 
            data={userEngagementData} 
            options={{
              ...chartOptions,
              maintainAspectRatio: true,
            }}
          />
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="bg-white rounded-lg shadow-lg p-6" style={{ height: '400px', overflow: 'auto' }}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
        <div className="space-y-3">
          {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.userName}</p>
                  <p className="text-sm text-gray-600">{activity.examTitle}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.testDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-indigo-600">
                    {activity.score}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendsCharts;
