import React, { useState, useEffect } from 'react';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import AdminPaymentService from '../../services/AdminPaymentService';
import StatCard from './StatCard';
import { RefreshCw } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Admin Payment Dashboard Component
 */
const AdminPaymentDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();

    // Auto refresh every 5 minutes
    const interval = setInterval(() => {
      fetchStatistics(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const result = await AdminPaymentService.fetchStatistics();

      if (result.success) {
        setStatistics(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Không thể tải thống kê');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">❌</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => fetchStatistics()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-600">Không có dữ liệu thống kê</p>
      </div>
    );
  }

  // Prepare chart data
  const paymentMethodChartData = {
    labels: Object.keys(statistics.transactionsByPaymentMethod || {}),
    datasets: [
      {
        label: 'Số giao dịch',
        data: Object.values(statistics.transactionsByPaymentMethod || {}),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const subscriptionTypeChartData = {
    labels: Object.keys(statistics.transactionsBySubscriptionType || {}).map(
      type => AdminPaymentService.getSubscriptionTypeName(type)
    ),
    datasets: [
      {
        label: 'Số giao dịch',
        data: Object.values(statistics.transactionsBySubscriptionType || {}),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const bankChartData = {
    labels: Object.keys(statistics.transactionsByBank || {}),
    datasets: [
      {
        label: 'Số giao dịch',
        data: Object.values(statistics.transactionsByBank || {}),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Payment Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan về thanh toán và gói Premium</p>
        </div>
        <button
          onClick={() => fetchStatistics(true)}
          disabled={refreshing}
          className={`flex items-center gap-2 btn-secondary ${refreshing ? 'opacity-50' : ''}`}
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Đang cập nhật...' : 'Làm mới'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng giao dịch"
          value={statistics.totalTransactions}
          icon="💳"
          color="blue"
        />
        <StatCard
          title="Thành công"
          value={statistics.successfulTransactions}
          percentage={
            (statistics.successfulTransactions / statistics.totalTransactions) * 100 || 0
          }
          icon="✅"
          color="green"
        />
        <StatCard
          title="Thất bại"
          value={statistics.failedTransactions}
          percentage={
            (statistics.failedTransactions / statistics.totalTransactions) * 100 || 0
          }
          icon="❌"
          color="red"
        />
        <StatCard
          title="Đang xử lý"
          value={statistics.pendingTransactions}
          percentage={
            (statistics.pendingTransactions / statistics.totalTransactions) * 100 || 0
          }
          icon="⏳"
          color="orange"
        />
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>💰</span> Doanh thu
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Tổng doanh thu</div>
                <div className="text-2xl font-bold text-green-600">
                  {AdminPaymentService.formatCurrency(statistics.totalRevenue)}
                </div>
              </div>
              <div className="text-4xl">💵</div>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Doanh thu tháng này</div>
                <div className="text-xl font-bold text-blue-600">
                  {AdminPaymentService.formatCurrency(statistics.monthlyRevenue)}
                </div>
              </div>
              <div className="text-3xl">📅</div>
            </div>

            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Doanh thu hôm nay</div>
                <div className="text-lg font-bold text-purple-600">
                  {AdminPaymentService.formatCurrency(statistics.todayRevenue)}
                </div>
              </div>
              <div className="text-2xl">🌅</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📈</span> Tỷ lệ thành công
          </h3>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-6xl font-bold text-green-600 mb-2">
              {statistics.successRate?.toFixed(1) || 0}%
            </div>
            <div className="text-gray-600 mb-6">
              {statistics.successfulTransactions} / {statistics.totalTransactions} giao dịch
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${statistics.successRate || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>💳</span> Phương thức thanh toán
          </h3>
          <div className="h-64 flex items-center justify-center">
            {Object.keys(statistics.transactionsByPaymentMethod || {}).length > 0 ? (
              <Pie data={paymentMethodChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-400">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Subscription Types Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>👑</span> Loại gói Premium
          </h3>
          <div className="h-64 flex items-center justify-center">
            {Object.keys(statistics.transactionsBySubscriptionType || {}).length > 0 ? (
              <Doughnut data={subscriptionTypeChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-400">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Banks Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🏦</span> Ngân hàng
          </h3>
          <div className="h-64">
            {Object.keys(statistics.transactionsByBank || {}).length > 0 ? (
              <Bar data={bankChartData} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Users Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>👑</span> Premium Users
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm mb-1">Tổng người dùng Premium</div>
            <div className="text-3xl font-bold">{statistics.totalPremiumUsers}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm mb-1">Đang hoạt động</div>
            <div className="text-3xl font-bold">{statistics.activePremiumUsers}</div>
            <div className="text-sm mt-2">
              {statistics.totalPremiumUsers > 0
                ? ((statistics.activePremiumUsers / statistics.totalPremiumUsers) * 100).toFixed(1)
                : 0}
              % retention rate
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Đã hủy</div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.cancelledTransactions}
              </div>
            </div>
            <div className="text-4xl">🚫</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Đã hoàn tiền</div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.refundedTransactions || 0}
              </div>
            </div>
            <div className="text-4xl">↩️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Giá trị TB / GD</div>
              <div className="text-xl font-bold text-gray-900">
                {AdminPaymentService.formatCurrency(
                  statistics.totalTransactions > 0
                    ? statistics.totalRevenue / statistics.successfulTransactions
                    : 0
                )}
              </div>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentDashboard;
