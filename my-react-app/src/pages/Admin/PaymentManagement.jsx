import React, { useState } from 'react';
import AdminPaymentDashboard from '../../components/admin/AdminPaymentDashboard';
import AdminTransactionList from '../../components/admin/AdminTransactionList';

/**
 * Payment Management Page
 * Main page for managing premium payments and transactions
 */
const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            💳 Quản lý thanh toán Premium
          </h1>
          <p className="mt-2 text-gray-600">
            Quản lý giao dịch, thống kê doanh thu và gói Premium của người dùng
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>📊</span>
                  <span>Dashboard</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'transactions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>💰</span>
                  <span>Giao dịch</span>
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'dashboard' && <AdminPaymentDashboard />}
          {activeTab === 'transactions' && <AdminTransactionList />}
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
