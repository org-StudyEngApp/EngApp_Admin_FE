import React from 'react';

/**
 * Filter Panel Component for Transaction List
 */
const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const handleInputChange = (field, value) => {
    onFilterChange(field, value);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🔍 Bộ lọc</h3>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Đặt lại
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Info Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên người dùng
          </label>
          <input
            type="text"
            className="filter-input w-full"
            placeholder="Nhập tên..."
            value={filters.username || ''}
            onChange={(e) => handleInputChange('username', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="filter-input w-full"
            placeholder="Nhập email..."
            value={filters.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã giao dịch
          </label>
          <input
            type="text"
            className="filter-input w-full"
            placeholder="Nhập mã..."
            value={filters.transactionCode || ''}
            onChange={(e) => handleInputChange('transactionCode', e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            className="filter-select w-full"
            value={filters.paymentStatus || ''}
            onChange={(e) => handleInputChange('paymentStatus', e.target.value || null)}
          >
            <option value="">Tất cả</option>
            <option value="SUCCESS">Thành công</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="FAILED">Thất bại</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>
        </div>

        {/* Payment Method Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phương thức
          </label>
          <select
            className="filter-select w-full"
            value={filters.paymentMethod || ''}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value || null)}
          >
            <option value="">Tất cả</option>
            <option value="VNPAY">VNPay</option>
            <option value="BANKING">Chuyển khoản</option>
            <option value="MOMO">MoMo</option>
            <option value="ZALOPAY">ZaloPay</option>
          </select>
        </div>

        {/* Subscription Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại gói
          </label>
          <select
            className="filter-select w-full"
            value={filters.subscriptionType || ''}
            onChange={(e) => handleInputChange('subscriptionType', e.target.value || null)}
          >
            <option value="">Tất cả</option>
            <option value="PREMIUM_MONTHLY">Premium Monthly</option>
            <option value="PREMIUM_YEARLY">Premium Yearly</option>
          </select>
        </div>

        {/* Bank Code Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngân hàng
          </label>
          <input
            type="text"
            className="filter-input w-full"
            placeholder="Mã ngân hàng..."
            value={filters.bankCode || ''}
            onChange={(e) => handleInputChange('bankCode', e.target.value)}
          />
        </div>

        {/* Date Range Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Từ ngày
          </label>
          <input
            type="datetime-local"
            className="filter-input w-full"
            value={filters.fromDate || ''}
            onChange={(e) => handleInputChange('fromDate', e.target.value || null)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đến ngày
          </label>
          <input
            type="datetime-local"
            className="filter-input w-full"
            value={filters.toDate || ''}
            onChange={(e) => handleInputChange('toDate', e.target.value || null)}
          />
        </div>

        {/* Amount Range Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền tối thiểu
          </label>
          <input
            type="number"
            className="filter-input w-full"
            placeholder="VND"
            value={filters.minAmount || ''}
            onChange={(e) => handleInputChange('minAmount', e.target.value ? Number(e.target.value) : null)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền tối đa
          </label>
          <input
            type="number"
            className="filter-input w-full"
            placeholder="VND"
            value={filters.maxAmount || ''}
            onChange={(e) => handleInputChange('maxAmount', e.target.value ? Number(e.target.value) : null)}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
