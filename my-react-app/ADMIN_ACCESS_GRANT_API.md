# 🔐 Admin Access Grant API Documentation (V13)

> **Logic mới**: Content Locking với Admin Control  
> Admin đánh dấu content là "locked" (premium only), và có thể grant quyền cho FREE users cụ thể.

---

## 📌 Tổng quan Logic V13

### **Quy tắc truy cập:**

| Loại Content       | FREE User (no grant) | FREE User (có grant) | PREMIUM User     |
| ------------------ | -------------------- | -------------------- | ---------------- |
| `isLocked = false` | ✅ Truy cập được     | ✅ Truy cập được     | ✅ Truy cập được |
| `isLocked = true`  | ❌ HTTP 403          | ✅ Truy cập được     | ✅ Truy cập được |

### **Flow hoạt động:**

```
1. Admin tạo exam/article → mặc định isLocked = false (public)

2. Admin lock content:
   - Admin đánh dấu isLocked = true → Chỉ premium users truy cập được

3. Admin grant quyền cho FREE user:
   - POST /admin/access-grants/exam → Grant cho user cụ thể
   - User này giờ access được exam locked
   - Grant có thể có expiration date

4. Admin revoke quyền:
   - DELETE /admin/access-grants/exam/{grantId}
   - User mất quyền truy cập ngay lập tức
```

---

## 🔌 API Endpoints Overview

**Base URL:** `/admin/access-grants`  
**Authentication:** Required - Role `ADMIN`

### **Exam Grants (4 endpoints):**

```
POST   /admin/access-grants/exam                    - Grant exam access
DELETE /admin/access-grants/exam/{grantId}          - Revoke grant
GET    /admin/access-grants/user/{userId}/exams     - List user's exam grants
GET    /admin/access-grants/exam/{examId}/users     - List exam's grants
```

### **Article Grants (4 endpoints):**

```
POST   /admin/access-grants/article                 - Grant article access
DELETE /admin/access-grants/article/{grantId}       - Revoke grant
GET    /admin/access-grants/user/{userId}/articles  - List user's article grants
GET    /admin/access-grants/article/{articleId}/users - List article's grants
```

---

## 📋 API Details - EXAM GRANTS

### 1. Grant Exam Access

**Mở khóa exam cho FREE user cụ thể**

```http
POST /admin/access-grants/exam
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": 123, // ID của user nhận quyền
  "examId": 456, // ID của exam bị locked
  "expiresAt": "2026-12-31T23:59:59", // NULL = vĩnh viễn
  "reason": "Student performance reward" // Lý do (optional)
}
```

**Response Success (200):**

```json
{
  "status": 200,
  "message": "Exam access granted successfully",
  "data": {
    "id": 789,
    "user": {
      "id": 123,
      "username": "student01"
    },
    "exam": {
      "id": 456,
      "title": "TOEIC Part 1 Practice Test"
    },
    "grantedByAdmin": {
      "id": 1,
      "username": "admin"
    },
    "grantedAt": "2026-01-05T10:30:00",
    "expiresAt": "2026-12-31T23:59:59",
    "reason": "Student performance reward",
    "isActive": true,
    "revokedAt": null,
    "revokedByAdmin": null
  }
}
```

**Response Error (400):**

```json
{
  "status": 400,
  "message": "User already has active grant for this exam",
  "data": null
}
```

**Response Error (404):**

```json
{
  "status": 400,
  "message": "User not found" // hoặc "Exam not found"
}
```

---

### 2. Revoke Exam Access

**Thu hồi quyền truy cập exam**

```http
DELETE /admin/access-grants/exam/{grantId}
Authorization: Bearer {admin_token}
```

**Path Parameters:**

- `grantId` (Long): ID của grant cần revoke

**Response Success (200):**

```json
{
  "status": 200,
  "message": "Exam access revoked successfully",
  "data": null
}
```

**Response Error (400):**

```json
{
  "status": 400,
  "message": "Grant not found"
}
```

**⚠️ Lưu ý:**

- Grant bị revoke: `isActive = false`, `revokedAt` được set
- User **NGAY LẬP TỨC** mất quyền truy cập exam

---

### 3. Get User's Exam Grants

**Xem tất cả exam grants của user (active + revoked)**

```http
GET /admin/access-grants/user/{userId}/exams
Authorization: Bearer {admin_token}
```

**Path Parameters:**

- `userId` (Long): ID của user

**Response Success (200):**

```json
{
  "status": 200,
  "message": "Retrieved user exam grants",
  "data": [
    {
      "id": 789,
      "exam": {
        "id": 456,
        "title": "TOEIC Part 1 Practice Test",
        "isLocked": true
      },
      "grantedByAdmin": {
        "id": 1,
        "username": "admin"
      },
      "grantedAt": "2026-01-01T10:00:00",
      "expiresAt": "2026-12-31T23:59:59",
      "reason": "Good performance",
      "isActive": true,
      "revokedAt": null
    },
    {
      "id": 790,
      "exam": {
        "id": 457,
        "title": "TOEIC Part 2 Practice Test",
        "isLocked": true
      },
      "grantedByAdmin": {
        "id": 1,
        "username": "admin"
      },
      "grantedAt": "2025-12-01T10:00:00",
      "expiresAt": "2025-12-31T23:59:59",
      "reason": "Trial access",
      "isActive": false,
      "revokedAt": "2026-01-02T15:00:00",
      "revokedByAdmin": {
        "id": 1,
        "username": "admin"
      }
    }
  ]
}
```

**Use case:**

- Admin xem lịch sử grants của user
- Hiển thị trong user profile

---

### 4. Get Exam's Grants

**Xem tất cả users có quyền truy cập exam này**

```http
GET /admin/access-grants/exam/{examId}/users
Authorization: Bearer {admin_token}
```

**Path Parameters:**

- `examId` (Long): ID của exam

**Response Success (200):**

```json
{
  "status": 200,
  "message": "Retrieved exam grants",
  "data": [
    {
      "id": 789,
      "user": {
        "id": 123,
        "username": "student01",
        "email": "student01@example.com"
      },
      "grantedByAdmin": {
        "id": 1,
        "username": "admin"
      },
      "grantedAt": "2026-01-01T10:00:00",
      "expiresAt": null, // Vĩnh viễn
      "reason": "Beta tester",
      "isActive": true
    },
    {
      "id": 791,
      "user": {
        "id": 124,
        "username": "student02"
      },
      "grantedAt": "2026-01-03T14:00:00",
      "expiresAt": "2026-06-30T23:59:59",
      "reason": "6 months trial",
      "isActive": true
    }
  ]
}
```

**Use case:**

- Admin quản lý access cho từng exam
- Xem ai đang có quyền truy cập

---

## 📋 API Details - ARTICLE GRANTS

**Hoàn toàn tương tự Exam Grants**, chỉ khác endpoint path:

### 1. Grant Article Access

```http
POST /admin/access-grants/article
```

Request/Response giống hệt exam, thay `examId` → `articleId`

### 2. Revoke Article Access

```http
DELETE /admin/access-grants/article/{grantId}
```

### 3. Get User's Article Grants

```http
GET /admin/access-grants/user/{userId}/articles
```

### 4. Get Article's Grants

```http
GET /admin/access-grants/article/{articleId}/users
```

---

## 🎨 Frontend Integration Guide

### **A. Admin UI - Lock/Unlock Content**

#### 1. Exam Management Page

```typescript
// API để lock/unlock exam
PUT /admin/exams/{examId}
{
  "isLocked": true  // true = chỉ premium, false = public
}

// Frontend hiển thị:
<Toggle
  checked={exam.isLocked}
  onChange={(value) => updateExam(exam.id, { isLocked: value })}
  label={exam.isLocked ? "🔒 Locked (Premium Only)" : "🔓 Public"}
/>
```

#### 2. Article Management Page

```typescript
// Tương tự
PUT /admin/articles/{articleId}
{
  "isLocked": true
}
```

---

### **B. Admin UI - Grant Management**

#### **Page 1: User Detail Page**

Hiển thị tất cả grants của user

```typescript
// Component: UserGrantsList.tsx
const UserGrantsList = ({ userId }) => {
  const [examGrants, setExamGrants] = useState([]);
  const [articleGrants, setArticleGrants] = useState([]);

  useEffect(() => {
    // Fetch grants
    fetch(`/admin/access-grants/user/${userId}/exams`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setExamGrants(data.data));

    // Tương tự cho articles
  }, [userId]);

  return (
    <div>
      <h3>Exam Access Grants</h3>
      <table>
        <thead>
          <tr>
            <th>Exam</th>
            <th>Granted Date</th>
            <th>Expires</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {examGrants.map((grant) => (
            <tr key={grant.id}>
              <td>{grant.exam.title}</td>
              <td>{formatDate(grant.grantedAt)}</td>
              <td>{grant.expiresAt || "Never"}</td>
              <td>
                {grant.isActive ? (
                  <Badge color="green">Active</Badge>
                ) : (
                  <Badge color="red">Revoked</Badge>
                )}
              </td>
              <td>
                {grant.isActive && (
                  <Button danger onClick={() => revokeGrant(grant.id)}>
                    Revoke
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

#### **Page 2: Exam Detail Page**

Hiển thị users có quyền access exam này

```typescript
// Component: ExamGrantsList.tsx
const ExamGrantsList = ({ examId }) => {
  const [grants, setGrants] = useState([]);

  useEffect(() => {
    fetch(`/admin/access-grants/exam/${examId}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setGrants(data.data));
  }, [examId]);

  return (
    <div>
      <h3>Users with Access ({grants.length})</h3>
      <table>{/* Similar table structure */}</table>
    </div>
  );
};
```

#### **Page 3: Grant Access Modal**

Modal để grant quyền cho user

```typescript
// Component: GrantAccessModal.tsx
const GrantAccessModal = ({ examId, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: "",
    expiresAt: null,
    reason: "",
  });

  const handleSubmit = async () => {
    const response = await fetch("/admin/access-grants/exam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: parseInt(formData.userId),
        examId: examId,
        expiresAt: formData.expiresAt,
        reason: formData.reason,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      message.success("Access granted successfully!");
      onSuccess();
    } else {
      message.error(result.message);
    }
  };

  return (
    <Modal title="Grant Exam Access">
      <Form>
        <Form.Item label="User ID">
          <Input
            type="number"
            value={formData.userId}
            onChange={(e) =>
              setFormData({ ...formData, userId: e.target.value })
            }
          />
        </Form.Item>

        <Form.Item label="Expires At (Optional)">
          <DatePicker
            showTime
            onChange={(date) => setFormData({ ...formData, expiresAt: date })}
          />
          <small>Leave empty for permanent access</small>
        </Form.Item>

        <Form.Item label="Reason">
          <TextArea
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            placeholder="Why grant access to this user?"
          />
        </Form.Item>

        <Button type="primary" onClick={handleSubmit}>
          Grant Access
        </Button>
      </Form>
    </Modal>
  );
};
```

---

### **C. User UI - Display Logic**

#### **Exam List Page (User View)**

```typescript
const ExamCard = ({ exam }) => {
  return (
    <Card>
      <h3>{exam.title}</h3>

      {/* Hiển thị badge locked */}
      {exam.isLocked && <Badge color="gold">🔒 Premium Only</Badge>}

      <Button onClick={() => navigateToExam(exam.id)}>
        {exam.isLocked ? "Upgrade to Access" : "Start Exam"}
      </Button>
    </Card>
  );
};
```

#### **Error Handling khi access bị denied**

```typescript
const fetchExamDetail = async (examId) => {
  try {
    const response = await fetch(`/exams/${examId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 403) {
      const error = await response.json();

      // Hiển thị upgrade modal
      Modal.warning({
        title: "Premium Content",
        content: error.message,
        okText: "Upgrade to Premium",
        onOk: () => navigate(error.upgradeUrl),
      });

      return null;
    }

    return await response.json();
  } catch (err) {
    console.error(err);
  }
};
```

---

## 🔄 Common Use Cases

### **Use Case 1: Admin lock exam và grant cho 1 học sinh xuất sắc**

```typescript
// Step 1: Admin lock exam
await updateExam(examId, { isLocked: true });

// Step 2: Grant access cho user
await fetch("/admin/access-grants/exam", {
  method: "POST",
  body: JSON.stringify({
    userId: 123,
    examId: examId,
    expiresAt: null, // Vĩnh viễn
    reason: "Top student reward",
  }),
});
```

### **Use Case 2: Trial access - Grant 7 ngày**

```typescript
const sevenDaysLater = new Date();
sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

await fetch("/admin/access-grants/article", {
  method: "POST",
  body: JSON.stringify({
    userId: 456,
    articleId: 789,
    expiresAt: sevenDaysLater.toISOString(),
    reason: "7-day trial access",
  }),
});
```

### **Use Case 3: Revoke access khi user vi phạm**

```typescript
// Tìm grant ID từ list
const grant = grants.find((g) => g.user.id === userId && g.exam.id === examId);

// Revoke
await fetch(`/admin/access-grants/exam/${grant.id}`, {
  method: "DELETE",
});
```

---

## ⚠️ Important Notes

### **Backend Behavior:**

1. **Grant validation:**

   - Không cho phép duplicate grants (1 user + 1 exam = tối đa 1 active grant)
   - Expired grants tự động invalid (check trong code)

2. **Revoke behavior:**

   - Set `isActive = false`, không xóa record
   - Keep audit trail (ai revoke, khi nào)

3. **Access check order:**
   ```
   1. Premium user? → Allow
   2. Content unlocked (isLocked = false)? → Allow
   3. Content locked + has valid grant? → Allow
   4. Else → HTTP 403
   ```

### **Frontend Best Practices:**

1. **Cache grants list** - Refresh khi có thay đổi
2. **Show expiration warnings** - Alert admin khi grant sắp hết hạn
3. **Confirm before revoke** - Tránh revoke nhầm
4. **Filter active/inactive grants** - UI rõ ràng
5. **Search user by email/username** - Để grant dễ dàng

---

## 📊 Database Schema Reference

### **user_exam_access_grants**

```sql
CREATE TABLE user_exam_access_grants (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    granted_by_admin_id BIGINT NOT NULL,
    granted_at DATETIME2 NOT NULL,
    expires_at DATETIME2 NULL,           -- NULL = permanent
    reason NVARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    revoked_at DATETIME2 NULL,
    revoked_by_admin_id BIGINT NULL
);
```

### **user_article_access_grants**

Tương tự, chỉ thay `exam_id` → `article_id`

---

## 🧪 Testing Checklist

### **Admin Testing:**

- [ ] Lock/unlock exam/article
- [ ] Grant access cho FREE user
- [ ] Grant với expiration date
- [ ] Grant permanent access (expiresAt = null)
- [ ] Revoke active grant
- [ ] View user's grants
- [ ] View exam's grants
- [ ] Try duplicate grant (should fail)

### **User Testing:**

- [ ] FREE user access unlocked content → OK
- [ ] FREE user access locked content → HTTP 403
- [ ] FREE user với grant access locked content → OK
- [ ] PREMIUM user access all content → OK
- [ ] Grant expired → User bị block
- [ ] Grant revoked → User bị block ngay lập tức

---

## 📞 Support

Nếu có vấn đề:

1. Check logs trong `UsageTrackingService` và `AccessGrantService`
2. Verify database: `SELECT * FROM user_exam_access_grants WHERE user_id = ?`
3. Test với Postman trước khi integrate frontend

Happy coding! 🚀
