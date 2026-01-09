import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import AdminPaymentService from '../../services/AdminPaymentService';
import FilterPanel from './FilterPanel';
import TransactionDetailModal from './TransactionDetailModal';
import RefundModal from './RefundModal';
import Pagination from '../common/Pagination';

/**
 * Admin Transaction List Component
 */
const AdminTransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    userId: null,
    username: '',
    email: '',
    transactionCode: '',
    paymentStatus: null,
    paymentMethod: null,
    subscriptionType: null,
    bankCode: '',
    fromDate: null,
    toDate: null,
    minAmount: null,
    maxAmount: null
  });

  // Fetch transactions function
  const fetchTransactions = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      setError('');

      const result = await AdminPaymentService.fetchTransactions({
        ...filters,
        page: pageNum,
        size: 20,
        sortBy: 'createdAt',
        sortDir: 'DESC'
      });

      if (result.success) {
        setTransactions(result.data.content || []);
        setTotalPages(result.data.totalPages || 0);
        setTotalElements(result.data.totalElements || 0);
      } else {
        setError(result.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Không thể tải danh sách giao dịch');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounced search with useMemo
  const debouncedFetch = useMemo(
    () => debounce(() => {
      setPage(0);
      fetchTransactions(0);
    }, 500),
    [fetchTransactions]
  );

  useEffect(() => {
    fetchTransactions(page);
  }, [page, fetchTransactions]);

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      userId: null,
      username: '',
      email: '',
      transactionCode: '',
      paymentStatus: null,
      paymentMethod: null,
      subscriptionType: null,
      bankCode: '',
      fromDate: null,
      toDate: null,
      minAmount: null,
      maxAmount: null
    });
    setPage(0);
  };

  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleRefund = (transaction) => {
    setSelectedTransaction(transaction);
    setShowRefundModal(true);
  };

  const handleCancelTransaction = async (transaction) => {
    const reason = prompt('Nhập lý do hủy giao dịch:');
    if (!reason) return;

    if (!confirm(`Xác nhận hủy giao dịch ${transaction.transactionCode}?`)) {
      return;
    }

    const result = await AdminPaymentService.cancelTransaction(
      transaction.transactionCode,
      reason
    );

    if (result.success) {
      alert('✅ Hủy giao dịch thành công!');
      fetchTransactions(page);
    } else {
      alert('❌ ' + result.error);
    }
  };

  const handleProcessTimeout = async () => {
    if (!confirm('Xử lý tất cả giao dịch pending quá 30 phút?')) {
      return;
    }

    const result = await AdminPaymentService.processTimeoutTransactions();

    if (result.success) {
      alert('✅ Xử lý timeout thành công!');
      fetchTransactions(page);
    } else {
      alert('❌ ' + result.error);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Không có dữ liệu để export');
      return;
    }
    AdminPaymentService.exportToCSV(transactions);
  };

  const handleRefreshData = () => {
    fetchTransactions(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💳 Quản lý giao dịch</h1>
          <p className="text-gray-600 mt-1">
            Tổng số: <span className="font-semibold">{totalElements}</span> giao dịch
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefreshData}
            className="btn-secondary"
            disabled={loading}
          >
            🔄 Làm mới
          </button>
          <button
            onClick={handleProcessTimeout}
            className="btn-warning"
            title="Xử lý các giao dịch pending quá 30 phút"
          >
            ⏰ Xử lý Timeout
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-primary"
            disabled={transactions.length === 0}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : transactions.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-600 mb-2">Không tìm thấy giao dịch</p>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tạo giao dịch mới</p>
        </div>
      ) : (
        /* Transactions Table */
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã GD
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại gói
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngân hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onViewDetail={handleViewDetail}
                      onRefund={handleRefund}
                      onCancel={handleCancelTransaction}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modals */}
      <TransactionDetailModal
        transactionCode={selectedTransaction?.transactionCode}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
      />

      <RefundModal
        transaction={selectedTransaction}
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedTransaction(null);
        }}
        onSuccess={() => {
          fetchTransactions(page);
        }}
      />
    </div>
  );
};

/**
 * Transaction Row Component
 */
const TransactionRow = ({ transaction, onViewDetail, onRefund, onCancel }) => {
  const [showActions, setShowActions] = useState(false);

  const statusBadge = AdminPaymentService.getStatusBadge(transaction.paymentStatus);
  const canRefund = AdminPaymentService.canRefund(transaction);
  const canCancel = AdminPaymentService.canCancel(transaction);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900">
            {transaction.userFullName}
          </div>
          <div className="text-sm text-gray-500">{transaction.userEmail}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-mono text-gray-900">
          {transaction.transactionCode.substring(0, 8)}...
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {AdminPaymentService.getSubscriptionTypeName(transaction.subscriptionType)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900">
          {transaction.amount.toLocaleString('vi-VN')} ₫
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {transaction.bankCode || '-'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`badge ${statusBadge.className}`}>
          {statusBadge.icon} {statusBadge.text}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {AdminPaymentService.formatDateTime(transaction.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative inline-block text-left">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <span className="text-xl">⋮</span>
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onViewDetail(transaction);
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    👁️ Xem chi tiết
                  </button>

                  {canRefund && (
                    <button
                      onClick={() => {
                        onRefund(transaction);
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                    >
                      ↩️ Hoàn tiền
                    </button>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => {
                        onCancel(transaction);
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚫 Hủy giao dịch
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default AdminTransactionList;
