import { X, Crown, Calendar, Clock, CheckCircle, TrendingUp, CreditCard } from 'lucide-react';
import { 
  formatSubscriptionType, 
  getSubscriptionShortLabel,
  formatDate, 
  formatDateTime,
  getSubscriptionBadge,
  getExpiryStatusBadge,
  getSubscriptionFeatures,
  formatCurrency,
  getSubscriptionPrice,
  getProgressBarColor,
  calculateDaysRemaining
} from '../../utils/premiumUtils';

/**
 * Modal hiển thị chi tiết subscription của user
 */
export default function PremiumDetailModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const isPremium = user.isPremium || user.subscriptionType !== null;
  const subscriptionType = user.subscriptionType || 'FREE';
  const daysRemaining = user.premiumUntil ? calculateDaysRemaining(user.premiumUntil) : 0;
  const subscriptionBadge = getSubscriptionBadge(subscriptionType);
  const expiryBadge = getExpiryStatusBadge(daysRemaining);
  const features = getSubscriptionFeatures(subscriptionType);
  
  // Tính total days cho progress bar
  const startDate = user.premiumSince || user.subscriptionStartDate;
  const endDate = user.premiumUntil || user.subscriptionEndDate;
  let totalDays = 30; // Default
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }
  
  const progressPercentage = totalDays > 0 ? (daysRemaining / totalDays * 100) : 0;
  const progressBarColor = getProgressBarColor(daysRemaining, totalDays);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user.fullName || user.username}</h2>
                <p className="text-yellow-100">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Subscription Status Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Trạng thái Premium</h3>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${subscriptionBadge.className}`}>
                <span>{subscriptionBadge.icon}</span>
                {subscriptionBadge.text}
              </span>
            </div>

            {isPremium ? (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Thời gian còn lại</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${expiryBadge.className}`}>
                      <span>{expiryBadge.icon}</span>
                      {expiryBadge.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${progressBarColor} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, progressPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>{formatDate(startDate)}</span>
                    <span className="font-semibold">{daysRemaining}/{totalDays} ngày</span>
                    <span>{formatDate(endDate)}</span>
                  </div>
                </div>

                {/* Date Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Ngày bắt đầu</p>
                      <p className="font-semibold text-gray-900">{formatDate(startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Ngày hết hạn</p>
                      <p className="font-semibold text-gray-900">{formatDate(endDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Loại gói</p>
                      <p className="font-semibold text-gray-900">{formatSubscriptionType(subscriptionType)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Giá trị</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(getSubscriptionPrice(subscriptionType))}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Auto Renew</p>
                      <p className="font-semibold text-gray-900">
                        {user.autoRenew ? '✅ Có' : '❌ Không'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Trạng thái</p>
                      <p className="font-semibold text-gray-900">
                        {daysRemaining > 0 ? '🟢 Active' : '🔴 Expired'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🆓</div>
                <p className="text-gray-600 font-medium">Người dùng Free</p>
                <p className="text-sm text-gray-500 mt-1">Chưa có gói Premium nào</p>
              </div>
            )}
          </div>

          {/* Features List */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Quyền lợi hiện tại
            </h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isPremium ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-sm ${isPremium ? 'text-gray-900' : 'text-gray-500'}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Usage Stats (nếu có) */}
          {isPremium && (user.dailyTranslationUsed !== undefined || user.monthlyTestUsed !== undefined) && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê sử dụng</h3>
              <div className="grid grid-cols-2 gap-4">
                {user.dailyTranslationUsed !== undefined && (
                  <div>
                    <p className="text-xs text-gray-600">Dịch thuật hôm nay</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {user.dailyTranslationUsed}
                      {user.dailyTranslationLimit && (
                        <span className="text-sm text-gray-500">/{user.dailyTranslationLimit}</span>
                      )}
                    </p>
                  </div>
                )}
                {user.monthlyTestUsed !== undefined && (
                  <div>
                    <p className="text-xs text-gray-600">Bài test tháng này</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {user.monthlyTestUsed}
                      {user.monthlyTestLimit && (
                        <span className="text-sm text-gray-500">/{user.monthlyTestLimit}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // TODO: Navigate to payment history
                console.log('View payment history for user:', user.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
            >
              <CreditCard size={20} />
              Lịch sử thanh toán
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
