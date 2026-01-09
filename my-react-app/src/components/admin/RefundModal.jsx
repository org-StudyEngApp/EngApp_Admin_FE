import React, { useState } from 'react';
import AdminPaymentService from '../../services/AdminPaymentService';

/**
 * Refund Modal Component
 */
const RefundModal = ({ transaction, isOpen, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleRefund = async () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hoàn tiền');
      return;
    }

    const confirmed = window.confirm(
      `Xác nhận hoàn tiền ${AdminPaymentService.formatCurrency(transaction.amount)} cho user ${transaction.userEmail}?`
    );

    if (!confirmed) return;

    try {
      setProcessing(true);
      setError('');

      const result = await AdminPaymentService.refundTransaction(
        transaction.transactionCode,
        reason
      );

      if (result.success) {
        alert('✅ Hoàn tiền thành công!');
        onSuccess && onSuccess(result.data);
        onClose();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Refund error:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !transaction) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">↩️ Hoàn tiền</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Transaction Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Người dùng</div>
                <div className="font-semibold">{transaction.userFullName}</div>
                <div className="text-sm text-gray-600">{transaction.userEmail}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Mã giao dịch</div>
                <div className="font-mono text-sm">{transaction.transactionCode}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Loại gói</div>
                <div className="font-semibold">
                  {AdminPaymentService.getSubscriptionTypeName(transaction.subscriptionType)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Số tiền</div>
                <div className="text-xl font-bold text-green-600">
                  {AdminPaymentService.formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Lưu ý quan trọng
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Hoàn tiền sẽ hủy gói Premium của user</li>
                    <li>Không thể hoàn tác sau khi thực hiện</li>
                    <li>Vui lòng nhập lý do hoàn tiền rõ ràng</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do hoàn tiền <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Nhập lý do hoàn tiền (bắt buộc)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              disabled={processing}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={processing}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={handleRefund}
              disabled={processing || !reason.trim()}
              className="btn-warning"
            >
              {processing ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Đang xử lý...
                </>
              ) : (
                '↩️ Xác nhận hoàn tiền'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
