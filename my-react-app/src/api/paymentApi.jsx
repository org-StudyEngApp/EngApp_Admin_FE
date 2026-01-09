import axiosClient from './axiosClient';

/**
 * Payment API Service
 * Handles all payment and transaction related API calls for Admin
 */
const paymentApi = {
  /**
   * Get all payment transactions with filters and pagination
   * @param {Object} params - Filter and pagination parameters
   * @returns {Promise} Page of AdminPaymentTransactionResponse
   */
  getAllPayments: (params = {}) => {
    const {
      page = 0,
      size = 20,
      sortBy = 'createdAt',
      sortDir = 'DESC',
      userId = null,
      username = '',
      email = '',
      transactionCode = '',
      paymentStatus = null,
      paymentMethod = null,
      subscriptionType = null,
      bankCode = '',
      fromDate = null,
      toDate = null,
      minAmount = null,
      maxAmount = null
    } = params;

    const queryParams = new URLSearchParams({
      page,
      size,
      sortBy,
      sortDir
    });

    // Add filters if provided
    if (userId) queryParams.append('userId', userId);
    if (username) queryParams.append('username', username);
    if (email) queryParams.append('email', email);
    if (transactionCode) queryParams.append('transactionCode', transactionCode);
    if (paymentStatus) queryParams.append('paymentStatus', paymentStatus);
    if (paymentMethod) queryParams.append('paymentMethod', paymentMethod);
    if (subscriptionType) queryParams.append('subscriptionType', subscriptionType);
    if (bankCode) queryParams.append('bankCode', bankCode);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);
    if (minAmount !== null) queryParams.append('minAmount', minAmount);
    if (maxAmount !== null) queryParams.append('maxAmount', maxAmount);

    return axiosClient.get(`/admin/payments?${queryParams.toString()}`);
  },

  /**
   * Get payment transaction detail by transaction code
   * @param {string} transactionCode - Unique transaction code
   * @returns {Promise} AdminPaymentTransactionResponse
   */
  getPaymentDetail: (transactionCode) => {
    return axiosClient.get(`/admin/payments/${transactionCode}`);
  },

  /**
   * Get payment statistics overview
   * @returns {Promise} PaymentStatisticsResponse
   */
  getStatistics: () => {
    return axiosClient.get('/admin/payments/statistics');
  },

  /**
   * Refund a successful transaction
   * @param {string} transactionCode - Transaction code to refund
   * @param {string} reason - Reason for refund
   * @returns {Promise} AdminPaymentTransactionResponse
   */
  refund: (transactionCode, reason) => {
    return axiosClient.post('/admin/payments/refund', {
      transactionCode,
      reason
    });
  },

  /**
   * Cancel a pending transaction
   * @param {string} transactionCode - Transaction code to cancel
   * @param {string} reason - Reason for cancellation
   * @returns {Promise} ApiSuccess
   */
  cancelTransaction: (transactionCode, reason) => {
    return axiosClient.delete(`/admin/payments/${transactionCode}/cancel`, {
      params: { reason }
    });
  },

  /**
   * Process all timeout transactions (pending > 30 minutes)
   * @returns {Promise} ApiSuccess
   */
  processTimeout: () => {
    return axiosClient.post('/admin/payments/process-timeout');
  },

  /**
   * Export payment report (Coming soon)
   * @param {Object} filters - Export filters
   * @returns {Promise} File blob
   */
  exportReport: (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return axiosClient.get(`/admin/payments/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
  }
};

export default paymentApi;
