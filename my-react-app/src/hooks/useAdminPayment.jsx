import { useState, useEffect, useCallback } from 'react';
import AdminPaymentService from '../services/AdminPaymentService';

/**
 * Custom hook for managing payment-related state and operations
 */
export const useAdminPayment = () => {
  const [statistics, setStatistics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await AdminPaymentService.fetchStatistics();

    if (result.success) {
      setStatistics(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    const result = await AdminPaymentService.fetchTransactions(filters);

    if (result.success) {
      setTransactions(result.data.content || []);
    } else {
      setError(result.error);
      setTransactions([]);
    }

    setLoading(false);
    return result;
  }, []);

  // Refund transaction
  const refundTransaction = useCallback(async (transactionCode, reason) => {
    const result = await AdminPaymentService.refundTransaction(transactionCode, reason);
    return result;
  }, []);

  // Cancel transaction
  const cancelTransaction = useCallback(async (transactionCode, reason) => {
    const result = await AdminPaymentService.cancelTransaction(transactionCode, reason);
    return result;
  }, []);

  // Process timeout transactions
  const processTimeoutTransactions = useCallback(async () => {
    const result = await AdminPaymentService.processTimeoutTransactions();
    return result;
  }, []);

  return {
    statistics,
    transactions,
    loading,
    error,
    fetchStatistics,
    fetchTransactions,
    refundTransaction,
    cancelTransaction,
    processTimeoutTransactions
  };
};

/**
 * Custom hook for checking admin authorization
 */
export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = () => {
      try {
        // Check if user has admin role
        const userRoles = localStorage.getItem('userRoles');
        const roles = userRoles ? JSON.parse(userRoles) : [];
        const hasAdminRole = roles.some(role => 
          role === 'ADMIN' || role === 'ROLE_ADMIN'
        );
        
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, []);

  return { isAdmin, loading };
};

export default useAdminPayment;
