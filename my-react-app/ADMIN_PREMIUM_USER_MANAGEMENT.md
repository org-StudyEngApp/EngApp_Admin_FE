# 📊 ADMIN USER PREMIUM MANAGEMENT - API DOCUMENTATION

## 🎯 TỔNG QUAN

Hệ thống quản lý user premium cho admin với các tính năng:
- ✅ Xem tất cả premium users
- ✅ Lọc theo loại gói (Monthly/Yearly)
- ✅ Lọc users sắp hết hạn premium
- ✅ Xem tất cả free users
- ✅ Hiển thị thông tin premium đầy đủ

---

## 📋 API ENDPOINTS

### 1. **Lấy tất cả Premium Users**

```http
GET /api/v1/admin/users/premium
```

**Query Parameters:**
- `page` (int, default: 0) - Số trang
- `size` (int, default: 20) - Kích thước trang
- `sort` (string, optional) - Sắp xếp (vd: "createdAt,desc")

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com",
      "fullName": "John Doe",
      "isPremium": true,
      "subscriptionType": "PREMIUM_MONTHLY",
      "premiumStartDate": "2026-01-01T00:00:00",
      "premiumEndDate": "2026-02-01T00:00:00",
      "daysRemaining": 27,
      "autoRenew": false,
      "roles": ["USER"],
      "isUserEnabled": true,
      "createdAt": "2025-12-01T00:00:00"
    }
  ],
  "totalElements": 50,
  "totalPages": 3,
  "number": 0,
  "size": 20
}
```

---

### 2. **Lọc Premium Users theo loại gói**

#### a) Premium Monthly

```http
GET /api/v1/admin/users/premium/PREMIUM_MONTHLY
```

#### b) Premium Yearly

```http
GET /api/v1/admin/users/premium/PREMIUM_YEARLY
```

**Query Parameters:** Giống endpoint #1

**Response:** Giống endpoint #1, nhưng chỉ trả về users có gói tương ứng

---

### 3. **Lấy Premium Users sắp hết hạn**

```http
GET /api/v1/admin/users/premium/expiring?days=7
```

**Query Parameters:**
- `days` (int, default: 7) - Số ngày sắp hết hạn
- `page`, `size`, `sort` - Pagination params

**Use Cases:**
- `days=7` - Users hết hạn trong 7 ngày
- `days=3` - Users hết hạn trong 3 ngày
- `days=30` - Users hết hạn trong 1 tháng

**Response:** Giống endpoint #1

---

### 4. **Lấy tất cả Free Users**

```http
GET /api/v1/admin/users/free
```

**Query Parameters:** Giống endpoint #1

**Response:**
```json
{
  "content": [
    {
      "id": 2,
      "username": "freeuser",
      "email": "free@example.com",
      "fullName": "Jane Smith",
      "isPremium": false,
      "subscriptionType": null,
      "premiumStartDate": null,
      "premiumEndDate": null,
      "daysRemaining": null,
      "autoRenew": false,
      "roles": ["USER"],
      "isUserEnabled": true,
      "createdAt": "2025-12-15T00:00:00"
    }
  ],
  "totalElements": 100,
  "totalPages": 5,
  "number": 0,
  "size": 20
}
```

---

### 5. **Thống kê Premium Users (Existing API)**

```http
GET /api/v1/admin/payments/statistics
```

**Response:**
```json
{
  "totalPremiumUsers": 150,
  "activePremiumUsers": 142,
  "totalRevenue": 15000000,
  "monthlyRevenue": 5000000,
  "transactionsBySubscriptionType": {
    "PREMIUM_MONTHLY": 80,
    "PREMIUM_YEARLY": 70
  }
}
```

---

## 🎨 FRONTEND INTEGRATION

### Component Example (React + Tailwind CSS)

```jsx
// AdminPremiumUserManagement.jsx
import { useState, useEffect } from 'react';
import { Users, Crown, Calendar, AlertTriangle } from 'lucide-react';

function AdminPremiumUserManagement() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all | monthly | yearly | expiring | free
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/v1/admin/users';
      
      switch(filter) {
        case 'all':
          endpoint += '/premium';
          break;
        case 'monthly':
          endpoint += '/premium/PREMIUM_MONTHLY';
          break;
        case 'yearly':
          endpoint += '/premium/PREMIUM_YEARLY';
          break;
        case 'expiring':
          endpoint += '/premium/expiring?days=7';
          break;
        case 'free':
          endpoint += '/free';
          break;
      }

      const response = await fetch(
        `${endpoint}?page=${page}&size=20`,
        {
          headers: {
            'Authorization': `Bearer ${getAdminToken()}`
          }
        }
      );

      const data = await response.json();
      setUsers(data.content);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const response = await fetch(
      '/api/v1/admin/payments/statistics',
      {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      }
    );
    const data = await response.json();
    setStats(data);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
        <p className="text-gray-600">Quản lý tài khoản và thông tin người dùng trong hệ thống (15 người dùng)</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">Tổng người dùng</span>
          </div>
          <div className="text-2xl font-bold mt-2">15</div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <span className="text-sm">Premium Users</span>
          </div>
          <div className="text-3xl font-bold mt-2">{stats?.activePremiumUsers || 0}</div>
          <div className="text-sm opacity-90">
            {stats ? ((stats.activePremiumUsers / stats.totalPremiumUsers) * 100).toFixed(1) : 0}% của tổng
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Đang hoạt động</span>
          </div>
          <div className="text-2xl font-bold mt-2">13</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">Bị khóa</span>
          </div>
          <div className="text-2xl font-bold mt-2">2</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">Quản trị viên</span>
          </div>
          <div className="text-2xl font-bold mt-2">1</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-gray-900">Bộ lọc Premium nhanh</span>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 p-3 rounded-lg border transition ${
              filter === 'all' 
                ? 'bg-white border-yellow-400 shadow' 
                : 'bg-white border-gray-200 hover:border-yellow-300'
            }`}
          >
            <Crown className="w-5 h-5 text-yellow-600" />
            <div className="text-left">
              <div className="font-medium">Tất cả Premium</div>
              <div className="text-xs text-gray-500">Active + Expired</div>
            </div>
          </button>

          <button
            onClick={() => setFilter('monthly')}
            className={`flex items-center gap-2 p-3 rounded-lg border transition ${
              filter === 'monthly' 
                ? 'bg-white border-blue-400 shadow' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <Calendar className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Premium Monthly</div>
              <div className="text-xs text-gray-500">Gói tháng</div>
            </div>
          </button>

          <button
            onClick={() => setFilter('yearly')}
            className={`flex items-center gap-2 p-3 rounded-lg border transition ${
              filter === 'yearly' 
                ? 'bg-white border-purple-400 shadow' 
                : 'bg-white border-gray-200 hover:border-purple-300'
            }`}
          >
            <Calendar className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <div className="font-medium">Premium Yearly</div>
              <div className="text-xs text-gray-500">Gói năm</div>
            </div>
          </button>

          <button
            onClick={() => setFilter('expiring')}
            className={`flex items-center gap-2 p-3 rounded-lg border transition ${
              filter === 'expiring' 
                ? 'bg-white border-red-400 shadow' 
                : 'bg-white border-gray-200 hover:border-red-300'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <div className="font-medium">Sắp hết hạn</div>
              <div className="text-xs text-gray-500">&lt; 7 ngày</div>
            </div>
          </button>
        </div>
      </div>

      {/* Search & Additional Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, mã user..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option>Tất cả vai trò</option>
          <option>Admin</option>
          <option>User</option>
        </select>

        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option>Tất cả trạng thái</option>
          <option>Hoạt động</option>
          <option>Bị khóa</option>
        </select>

        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-yellow-400 bg-yellow-50 rounded-lg"
        >
          <option value="all">Tất cả gói</option>
          <option value="monthly">Premium Monthly</option>
          <option value="yearly">Premium Yearly</option>
          <option value="expiring">Sắp hết hạn</option>
          <option value="free">Free</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Premium
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hết hạn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  Không có người dùng nào
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || '/default-avatar.png'} 
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {user.fullName}
                          {user.isPremium && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isPremium ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Crown className="w-3 h-3" />
                        {user.subscriptionType === 'PREMIUM_MONTHLY' ? 'Monthly' : 'Yearly'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.isPremium ? (
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {new Date(user.premiumEndDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className={`text-xs ${
                          user.daysRemaining <= 7 ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                          Còn {user.daysRemaining} ngày
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.roles?.[0] || 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isUserEnabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isUserEnabled ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:text-blue-700 text-sm font-medium">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          Hiển thị {users.length} người dùng
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <button 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPremiumUserManagement;
```

---

## 🔧 BACKEND CHANGES SUMMARY

### 1. **UserManagementResponse DTO**
✅ Added premium fields:
- `isPremium`
- `subscriptionType`
- `premiumStartDate`
- `premiumEndDate`
- `daysRemaining`
- `autoRenew`

### 2. **IAdminUserService Interface**
✅ Added methods:
- `getAllPremiumUsers()`
- `getPremiumUsersByType()`
- `getExpiringPremiumUsers()`
- `getAllFreeUsers()`

### 3. **AdminUserService Implementation**
✅ Implemented all new methods with premium subscription integration

### 4. **AdminUserController**
✅ Added endpoints:
- `GET /admin/users/premium`
- `GET /admin/users/premium/{type}`
- `GET /admin/users/premium/expiring`
- `GET /admin/users/free`

### 5. **Repositories**
✅ Updated:
- `UserRepository` - Added `findByIdIn()` and `findByIdNotIn()`
- `PremiumSubscriptionRepository` - Added `findBySubscriptionTypeAndIsActiveTrue()`

---

## 🧪 TESTING

### Test với Postman

```bash
# 1. Get all premium users
GET http://localhost:8080/api/v1/admin/users/premium
Authorization: Bearer {admin_token}

# 2. Get premium monthly users
GET http://localhost:8080/api/v1/admin/users/premium/PREMIUM_MONTHLY
Authorization: Bearer {admin_token}

# 3. Get expiring premium users (< 7 days)
GET http://localhost:8080/api/v1/admin/users/premium/expiring?days=7
Authorization: Bearer {admin_token}

# 4. Get all free users
GET http://localhost:8080/api/v1/admin/users/free
Authorization: Bearer {admin_token}
```

---

## 📊 USE CASES

### Use Case 1: Marketing Campaign
**Scenario:** Gửi email marketing cho users sắp hết hạn premium

```javascript
// Get users expiring in 3 days
const response = await fetch(
  '/api/v1/admin/users/premium/expiring?days=3',
  { headers: { 'Authorization': `Bearer ${token}` } }
);

const users = await response.json();
users.content.forEach(user => {
  sendRenewalEmail(user.email, user.daysRemaining);
});
```

### Use Case 2: Revenue Analysis
**Scenario:** Phân tích doanh thu theo loại gói

```javascript
const [monthly, yearly] = await Promise.all([
  fetch('/api/v1/admin/users/premium/PREMIUM_MONTHLY'),
  fetch('/api/v1/admin/users/premium/PREMIUM_YEARLY')
]);

const monthlyRevenue = monthlyUsers.totalElements * 99000;
const yearlyRevenue = yearlyUsers.totalElements * 990000;
```

### Use Case 3: User Retention
**Scenario:** Đo lường tỷ lệ free vs premium

```javascript
const stats = await fetch('/api/v1/admin/payments/statistics');
const freeUsers = await fetch('/api/v1/admin/users/free');

const premiumRate = (stats.activePremiumUsers / (stats.activePremiumUsers + freeUsers.totalElements)) * 100;
console.log(`Premium conversion rate: ${premiumRate}%`);
```

---

## 🎯 NEXT STEPS

### Phase 2 Features (Future)
- [ ] Export premium users to Excel/CSV
- [ ] Bulk email to premium users
- [ ] Premium user analytics dashboard
- [ ] Auto-renewal management
- [ ] Premium usage statistics

---

**✅ Implementation Complete!**

Tất cả API đã được implement và sẵn sàng sử dụng. Frontend có thể tích hợp ngay với các endpoint trên.
