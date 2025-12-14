# 🚨 KHẨN CẤP: Xử Lý Secret Bị Leak trên GitHub

## ⚠️ Vấn Đề
GitHub đã phát hiện **Azure Storage Account Access Key** trong file `.env.production` và chặn push.

## 🔐 Hậu Quả Bảo Mật
- **Storage Account Key đã bị lộ** trong Git history
- Ai có quyền truy cập repo cũng có thể xem key này
- **PHẢI thay đổi key ngay lập tức!**

## ✅ Các Bước Xử Lý

### Bước 1: Xóa File .env Khỏi Git
```bash
cd e:/DA_TotNghiep_Eng/EngApp_Admin_FE/my-react-app

# Xóa file khỏi Git (nhưng giữ lại file local)
git rm --cached .env.production
git rm --cached .env.development

# Commit thay đổi
git add .gitignore .env.example
git commit -m "security: Remove .env files with secrets from Git tracking"
```

### Bước 2: Xóa Secret Khỏi Git History
Vì file `.env.production` đã từng được commit, cần xóa khỏi toàn bộ history:

#### Option A: Sử dụng BFG Repo-Cleaner (Khuyến nghị)
```bash
# Download BFG từ https://rtyley.github.io/bfg-repo-cleaner/
# hoặc cài qua chocolatey: choco install bfg-repo-cleaner

# Chạy BFG để xóa file
bfg --delete-files .env.production
bfg --delete-files .env.development

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### Option B: Sử dụng git filter-repo (Alternative)
```bash
# Cài đặt git-filter-repo
pip install git-filter-repo

# Xóa file khỏi history
git filter-repo --path my-react-app/.env.production --invert-paths
git filter-repo --path my-react-app/.env.development --invert-paths
```

#### Option C: Sử dụng git filter-branch (Manual - Không khuyến nghị)
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch my-react-app/.env.production my-react-app/.env.development" \
  --prune-empty --tag-name-filter cat -- --all

git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Bước 3: ⚠️ **QUAN TRỌNG** - Regenerate Azure Storage Key

1. **Truy cập Azure Portal**
   - Vào Storage Account `toeicmedia`
   - Chọn **Access keys**

2. **Rotate Key**
   - Click **Regenerate** cho key1 hoặc key2
   - Copy connection string mới

3. **Cập nhật Connection String**
   - Cập nhật file `.env.production` local với connection string mới
   - Cập nhật file `.env.development` local với connection string mới
   - **KHÔNG commit file .env vào Git!**

4. **Cập nhật trên Azure App Service** (nếu có)
   - Vào App Service → Configuration → Application settings
   - Update `VITE_AZURE_STORAGE_CONNECTION_STRING` với connection string mới

### Bước 4: Force Push (Sau khi đã clean history)
```bash
# CẢNH BÁO: Force push sẽ ghi đè lên remote repository
# Thông báo với team members trước khi làm!
git push origin trung-admin --force
```

### Bước 5: Thông Báo Team Members
Nếu có team members khác đang làm việc trên repo:
```bash
# Họ cần re-clone hoặc reset local repo
git fetch origin
git reset --hard origin/trung-admin
```

## 📝 Setup Môi Trường Mới

Sau khi clean, mỗi developer cần:

1. **Copy `.env.example` thành `.env.production`**
   ```bash
   cp .env.example .env.production
   cp .env.example .env.development
   ```

2. **Điền thông tin thật**
   - Lấy Azure Storage connection string từ Azure Portal
   - Cập nhật API URLs
   - Cập nhật TinyMCE API key

3. **Verify .env files không bị track**
   ```bash
   git status
   # .env.production và .env.development KHÔNG được xuất hiện
   ```

## 🛡️ Ngăn Chặn Trong Tương Lai

### 1. Git Hooks - Pre-commit
Tạo file `.git/hooks/pre-commit`:
```bash
#!/bin/sh
# Prevent committing .env files with secrets

if git diff --cached --name-only | grep -E '\\.env(\\.production|\\.development)?$'; then
  echo "Error: Attempting to commit .env files!"
  echo "Please remove them from the commit."
  exit 1
fi
```

```bash
chmod +x .git/hooks/pre-commit
```

### 2. Sử dụng Environment Variables
Trong production, sử dụng environment variables thay vì .env files:
- Azure App Service: Application Settings
- GitHub Actions: Secrets
- Docker: Environment variables

### 3. Sử dụng Azure Key Vault
Lưu trữ secrets trong Azure Key Vault và truy cập qua Managed Identity:
```javascript
// Thay vì hardcode connection string
import { SecretClient } from '@azure/keyvault-secrets';
```

## 📚 Tài Liệu Tham Khảo
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Azure Storage Security](https://learn.microsoft.com/en-us/azure/storage/common/storage-security-guide)
- [Rotating Storage Account Keys](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage)

## ❓ FAQ

**Q: Có cần rotate key ngay lập tức không?**  
A: **CÓ!** Key đã bị lộ trong Git history. Bất kỳ ai có quyền truy cập repo đều có thể thấy.

**Q: Force push có an toàn không?**  
A: Force push sẽ ghi đè history. Thông báo với team trước. Backup trước khi force push.

**Q: Làm sao biết key đã bị sử dụng trái phép?**  
A: Kiểm tra Azure Portal → Storage Account → Monitoring → Metrics để xem unusual activity.

**Q: File .env.local có cần xóa không?**  
A: Không, file .env.local đã được .gitignore và không bao giờ được commit.

---

**Status:** ⚠️ CHƯA HOÀN THÀNH - Cần thực hiện ngay!  
**Priority:** 🔴 CRITICAL  
**Deadline:** Càng sớm càng tốt
