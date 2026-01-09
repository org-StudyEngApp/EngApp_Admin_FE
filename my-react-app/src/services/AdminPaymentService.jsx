import paymentApi from '../api/paymentApi';

/**
 * Admin Payment Service
 * Business logic layer for payment management
 */
class AdminPaymentService {
  /**
   * Fetch transactions with filters
   */
  static async fetchTransactions(filters) {
    try {
      const response = await paymentApi.getAllPayments(filters);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch transactions'
      };
    }
  }

  /**
   * Fetch transaction detail
   */
  static async fetchTransactionDetail(transactionCode) {
    try {
      const response = await paymentApi.getPaymentDetail(transactionCode);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch transaction detail'
      };
    }
  }

  /**
   * Fetch payment statistics
   */
  static async fetchStatistics() {
    try {
      const response = await paymentApi.getStatistics();
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch statistics'
      };
    }
  }

  /**
   * Refund a transaction
   */
  static async refundTransaction(transactionCode, reason) {
    try {
      if (!reason || reason.trim() === '') {
        throw new Error('Reason for refund is required');
      }

      const response = await paymentApi.refund(transactionCode, reason);
      return {
        success: true,
        data: response,
        message: 'Refund successful'
      };
    } catch (error) {
      console.error('Error refunding transaction:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to refund transaction'
      };
    }
  }

  /**
   * Cancel a pending transaction
   */
  static async cancelTransaction(transactionCode, reason = 'Admin cancelled') {
    try {
      const response = await paymentApi.cancelTransaction(transactionCode, reason);
      return {
        success: true,
        data: response,
        message: 'Transaction cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to cancel transaction'
      };
    }
  }

  /**
   * Process timeout transactions
   */
  static async processTimeoutTransactions() {
    try {
      const response = await paymentApi.processTimeout();
      return {
        success: true,
        data: response,
        message: 'Timeout transactions processed successfully'
      };
    } catch (error) {
      console.error('Error processing timeout transactions:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to process timeout transactions'
      };
    }
  }

  /**
   * Format currency VND
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format date time
   */
  static formatDateTime(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Get status badge configuration
   */
  static getStatusBadge(status) {
    const badges = {
      SUCCESS: {
        text: 'Thành công',
        className: 'badge-success',
        icon: '✅'
      },
      PENDING: {
        text: 'Đang xử lý',
        className: 'badge-warning',
        icon: '⏳'
      },
      FAILED: {
        text: 'Thất bại',
        className: 'badge-danger',
        icon: '❌'
      },
      CANCELLED: {
        text: 'Đã hủy',
        className: 'badge-secondary',
        icon: '🚫'
      },
      REFUNDED: {
        text: 'Đã hoàn tiền',
        className: 'badge-info',
        icon: '↩️'
      }
    };
    return badges[status] || badges.PENDING;
  }

  /**
   * Get subscription type display name
   */
  static getSubscriptionTypeName(type) {
    const names = {
      PREMIUM_MONTHLY: 'Premium Monthly',
      PREMIUM_YEARLY: 'Premium Yearly'
    };
    return names[type] || type;
  }

  /**
   * Get payment method display name
   */
  static getPaymentMethodName(method) {
    const names = {
      VNPAY: 'VNPay',
      BANKING: 'Chuyển khoản ngân hàng',
      MOMO: 'MoMo',
      ZALOPAY: 'ZaloPay'
    };
    return names[method] || method;
  }

  /**
   * Validate refund eligibility
   */
  static canRefund(transaction) {
    return transaction.paymentStatus === 'SUCCESS' && 
           transaction.paymentStatus !== 'REFUNDED';
  }

  /**
   * Validate cancel eligibility
   */
  static canCancel(transaction) {
    return transaction.paymentStatus === 'PENDING';
  }

  /**
   * Calculate success rate
   */
  static calculateSuccessRate(successful, total) {
    if (total === 0) return 0;
    return ((successful / total) * 100).toFixed(1);
  }

  /**
   * Export transactions to CSV
   */
  static exportToCSV(transactions) {
    const headers = [
      'Transaction Code',
      'User',
      'Email',
      'Subscription Type',
      'Amount',
      'Payment Method',
      'Bank',
      'Status',
      'Created At'
    ];

    const rows = transactions.map(tx => [
      tx.transactionCode,
      tx.userFullName,
      tx.userEmail,
      this.getSubscriptionTypeName(tx.subscriptionType),
      tx.amount,
      this.getPaymentMethodName(tx.paymentMethod),
      tx.bankCode || '-',
      tx.paymentStatus,
      this.formatDateTime(tx.createdAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default AdminPaymentService;
