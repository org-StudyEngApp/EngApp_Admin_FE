/**
 * Premium Subscription Utilities
 * Các hàm tiện ích để xử lý thông tin Premium subscription
 */

/**
 * Format subscription type thành text dễ đọc
 */
export const formatSubscriptionType = (type) => {
  const types = {
    PREMIUM_MONTHLY: 'Premium Monthly',
    PREMIUM_YEARLY: 'Premium Yearly',
    FREE: 'Free'
  };
  return types[type] || type;
};

/**
 * Lấy short label cho subscription type
 */
export const getSubscriptionShortLabel = (type) => {
  const labels = {
    PREMIUM_MONTHLY: 'Monthly',
    PREMIUM_YEARLY: 'Yearly',
    FREE: 'Free'
  };
  return labels[type] || 'Unknown';
};

/**
 * Tính số ngày còn lại đến hết hạn
 */
export const calculateDaysRemaining = (endDate) => {
  if (!endDate) return 0;
  
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Format date sang định dạng Việt Nam
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format datetime đầy đủ
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Lấy badge config dựa trên subscription type
 */
export const getSubscriptionBadge = (type) => {
  const badges = {
    PREMIUM_MONTHLY: {
      text: 'Monthly',
      className: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
      icon: '📅'
    },
    PREMIUM_YEARLY: {
      text: 'Yearly',
      className: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white',
      icon: '🎯'
    },
    FREE: {
      text: 'Free',
      className: 'bg-gray-200 text-gray-700',
      icon: '🆓'
    }
  };
  return badges[type] || badges.FREE;
};

/**
 * Lấy status badge dựa trên days remaining
 */
export const getExpiryStatusBadge = (daysRemaining) => {
  if (daysRemaining <= 0) {
    return {
      text: 'Đã hết hạn',
      className: 'bg-red-100 text-red-800',
      icon: '❌'
    };
  } else if (daysRemaining <= 3) {
    return {
      text: `Còn ${daysRemaining} ngày`,
      className: 'bg-red-100 text-red-800',
      icon: '⚠️'
    };
  } else if (daysRemaining <= 7) {
    return {
      text: `Còn ${daysRemaining} ngày`,
      className: 'bg-yellow-100 text-yellow-800',
      icon: '⏰'
    };
  } else if (daysRemaining <= 14) {
    return {
      text: `Còn ${daysRemaining} ngày`,
      className: 'bg-blue-100 text-blue-800',
      icon: '📅'
    };
  } else {
    return {
      text: `Còn ${daysRemaining} ngày`,
      className: 'bg-green-100 text-green-800',
      icon: '✅'
    };
  }
};

/**
 * Check xem premium có sắp hết hạn không
 */
export const isPremiumExpiringSoon = (endDate, daysThreshold = 7) => {
  const daysRemaining = calculateDaysRemaining(endDate);
  return daysRemaining > 0 && daysRemaining <= daysThreshold;
};

/**
 * Check xem premium đã hết hạn chưa
 */
export const isPremiumExpired = (endDate) => {
  const daysRemaining = calculateDaysRemaining(endDate);
  return daysRemaining <= 0;
};

/**
 * Lấy mô tả features theo subscription type
 */
export const getSubscriptionFeatures = (type) => {
  const features = {
    PREMIUM_MONTHLY: [
      'Dịch thuật không giới hạn',
      'Tất cả bài test',
      'Đọc mọi bài báo',
      'Tải audio miễn phí',
      'Lịch sử chi tiết',
      'Hỗ trợ ưu tiên'
    ],
    PREMIUM_YEARLY: [
      'Tất cả tính năng Monthly',
      'Tiết kiệm 17%',
      'Hỗ trợ VIP',
      'Tính năng độc quyền',
      'Không giới hạn tải xuống',
      'Ưu tiên trải nghiệm mới'
    ],
    FREE: [
      'Dịch thuật 10 lượt/ngày',
      '5 bài test/tháng',
      'Đọc bài báo giới hạn',
      'Không tải audio',
      'Lịch sử cơ bản'
    ]
  };
  return features[type] || features.FREE;
};

/**
 * Tính giá trị của subscription (VNĐ)
 */
export const getSubscriptionPrice = (type) => {
  const prices = {
    PREMIUM_MONTHLY: 99000,
    PREMIUM_YEARLY: 990000
  };
  return prices[type] || 0;
};

/**
 * Format tiền VNĐ
 */
export const formatCurrency = (amount) => {
  if (!amount) return '0 ₫';
  return `${amount.toLocaleString('vi-VN')} ₫`;
};

/**
 * Tính % tiết kiệm khi mua yearly
 */
export const calculateYearlySavings = () => {
  const monthly = getSubscriptionPrice('PREMIUM_MONTHLY') * 12;
  const yearly = getSubscriptionPrice('PREMIUM_YEARLY');
  const savings = ((monthly - yearly) / monthly * 100).toFixed(0);
  return savings;
};

/**
 * Get color class cho progress bar dựa trên days remaining
 */
export const getProgressBarColor = (daysRemaining, totalDays) => {
  const percentage = (daysRemaining / totalDays) * 100;
  
  if (percentage <= 10) return 'bg-red-500';
  if (percentage <= 25) return 'bg-orange-500';
  if (percentage <= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

/**
 * Parse premium info từ user object
 */
export const parsePremiumInfo = (user) => {
  if (!user) return null;
  
  const isPremium = user.isPremium || user.subscriptionType !== null;
  const subscriptionType = user.subscriptionType || 'FREE';
  
  // Backend có thể trả về premiumEndDate hoặc premiumUntil
  const endDate = user.premiumEndDate || user.premiumUntil;
  const startDate = user.premiumStartDate || user.premiumSince || user.subscriptionStartDate;
  
  // Calculate days remaining từ backend hoặc tính toán
  const daysRemaining = user.daysRemaining !== undefined 
    ? user.daysRemaining 
    : (endDate ? calculateDaysRemaining(endDate) : 0);
  
  return {
    isPremium,
    subscriptionType,
    startDate,
    endDate,
    daysRemaining,
    isExpiringSoon: isPremiumExpiringSoon(endDate),
    isExpired: daysRemaining <= 0
  };
};
