import React, { useState, useEffect, useCallback } from 'react';
import AdminPaymentService from '../../services/AdminPaymentService';

/**
 * Transaction Detail Modal Component
 */
const TransactionDetailModal = ({ transactionCode, isOpen, onClose }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactionDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await AdminPaymentService.fetchTransactionDetail(transactionCode);

      if (result.success) {
        setTransaction(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
      setError('Không thể tải thông tin giao dịch');
    } finally {
      setLoading(false);
    }
  }, [transactionCode]);

  useEffect(() => {
    if (isOpen && transactionCode) {
      fetchTransactionDetail();
    }
  }, [isOpen, transactionCode, fetchTransactionDetail]);

  if (!isOpen) return null;

  const statusBadge = transaction ? AdminPaymentService.getStatusBadge(transaction.paymentStatus) : null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Chi tiết giao dịch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-red-600">{error}</p>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`badge ${statusBadge.className} text-lg px-4 py-2`}>
                  {statusBadge.icon} {statusBadge.text}
                </span>
                <div className="text-sm text-gray-500">
                  {AdminPaymentService.formatDateTime(transaction.createdAt)}
                </div>
              </div>

              {/* User Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>👤</span> Thông tin người dùng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">User ID</div>
                    <div className="font-semibold">{transaction.userId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Họ và tên</div>
                    <div className="font-semibold">{transaction.userFullName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-semibold">{transaction.userEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Username</div>
                    <div className="font-semibold">{transaction.username}</div>
                  </div>
                </div>
              </div>

              {/* Transaction Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>💳</span> Thông tin giao dịch
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Mã giao dịch</div>
                    <div className="font-mono text-sm bg-white px-2 py-1 rounded">
                      {transaction.transactionCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Order ID</div>
                    <div className="font-mono text-sm bg-white px-2 py-1 rounded">
                      {transaction.orderId || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Loại gói</div>
                    <div className="font-semibold">
                      {AdminPaymentService.getSubscriptionTypeName(transaction.subscriptionType)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Số tiền</div>
                    <div className="text-2xl font-bold text-green-600">
                      {AdminPaymentService.formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>💰</span> Phương thức thanh toán
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Phương thức</div>
                    <div className="font-semibold">
                      {AdminPaymentService.getPaymentMethodName(transaction.paymentMethod)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Ngân hàng</div>
                    <div className="font-semibold">{transaction.bankCode || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Mã ngân hàng giao dịch</div>
                    <div className="font-mono text-sm">{transaction.bankTranNo || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Response */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🔐</span> Phản hồi từ VNPay
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Response Code</div>
                    <div className="font-mono">{transaction.responseCode || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Transaction No</div>
                    <div className="font-mono text-sm">{transaction.transactionNo || '-'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-600">Response Message</div>
                    <div className="font-semibold">{transaction.responseMessage || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⏰</span> Thời gian
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Ngày tạo</div>
                    <div className="font-semibold">
                      {AdminPaymentService.formatDateTime(transaction.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Ngày thanh toán</div>
                    <div className="font-semibold">
                      {AdminPaymentService.formatDateTime(transaction.paymentDate)}
                    </div>
                  </div>
                  {transaction.refundedAt && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-600">Ngày hoàn tiền</div>
                      <div className="font-semibold text-red-600">
                        {AdminPaymentService.formatDateTime(transaction.refundedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {transaction.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span>📝</span> Ghi chú
                  </h3>
                  <p className="text-gray-700">{transaction.notes}</p>
                </div>
              )}

              {/* Subscription Info */}
              {transaction.subscriptionId && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>👑</span> Thông tin gói Premium
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Subscription ID</div>
                      <div className="font-semibold">{transaction.subscriptionId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Trạng thái</div>
                      <div className="font-semibold">
                        {transaction.paymentStatus === 'SUCCESS' ? '✅ Đang hoạt động' : '❌ Không hoạt động'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">❓</div>
              <p className="text-gray-600">Không tìm thấy giao dịch</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
