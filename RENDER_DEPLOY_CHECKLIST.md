# 🚨 CHECKLIST DEPLOY RENDER - PHẢI LÀM TRƯỚC KHI DEPLOY

## ✅ **BƯỚC 1: CHUẨN BỊ DATABASE**

### Railway MySQL (Khuyến nghị):
1. ✅ Đã tạo MySQL service trên Railway
2. ✅ Database đang chạy (status = Running)
3. ✅ Đã copy đầy đủ thông tin:
   - [ ] MYSQL_HOST
   - [ ] MYSQL_PORT  
   - [ ] MYSQL_USER
   - [ ] MYSQL_PASSWORD
   - [ ] MYSQL_DATABASE (tên database, VD: railway)

---

## ✅ **BƯỚC 2: ENVIRONMENT VARIABLES TRÊN RENDER**

### Kiểm tra ĐẦY ĐỦ các biến sau (không được thiếu):

```bash
# DATABASE (BẮT BUỘC - Nếu thiếu sẽ lỗi Hibernate Dialect)
DB_URL=jdbc:mysql://[HOST]:[PORT]/[DATABASE_NAME]?useSSL=true&serverTimezone=UTC
DB_USERNAME=[your_username]
DB_PASSWORD=[your_password]

# JWT (BẮT BUỘC)
JWT_SECRET=disaster-pwa-super-secret-key-2026-min-256-bits-for-security
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# EMAIL (BẮT BUỘC - Dùng Gmail App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=datdo16112004@gmail.com
MAIL_PASSWORD=[Gmail App Password - 16 ký tự]

# SERVER (BẮT BUỘC)
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod
SHOW_SQL=false

# CORS (Thêm URL Vercel sau khi deploy Frontend)
ALLOWED_ORIGINS=http://localhost:5173
```

---

## ✅ **BƯỚC 3: FORMAT DATABASE URL ĐÚNG**

### ❌ SAI:
```
jdbc:mysql://host:3306?useSSL=true
jdbc:mysql://host:3306/
mysql://host:3306/railway
```

### ✅ ĐÚNG:
```
jdbc:mysql://containers-us-west-145.railway.app:7892/railway?useSSL=true&serverTimezone=UTC
```

**Quy tắc:**
- Phải có `jdbc:mysql://`
- Phải có tên database (VD: `/railway`, `/dongbaooi`)
- Phải có `?useSSL=true&serverTimezone=UTC`

---

## ✅ **BƯỚC 4: GMAIL APP PASSWORD**

**KHÔNG dùng mật khẩu email thường!**

1. Vào: https://myaccount.google.com/apppasswords
2. Tạo App Password mới
3. Copy 16 ký tự (VD: `abcd efgh ijkl mnop`)
4. Dán vào `MAIL_PASSWORD` (bỏ khoảng trắng: `abcdefghijklmnop`)

---

## ✅ **BƯỚC 5: COMMIT CODE**

```bash
git add .
git commit -m "Fix deployment configuration"
git push
```

---

## ✅ **BƯỚC 6: DEPLOY TRÊN RENDER**

1. Vào Render Dashboard
2. Click service → **Manual Deploy** → **Deploy latest commit**
3. Đợi 5-10 phút
4. Xem **Logs** để kiểm tra

---

## 🔍 **LOGS THÀNH CÔNG PHẢI CÓ:**

```
✓ Started Application in 25.432 seconds
✓ Tomcat started on port 8080
✓ Hibernate: create table if not exists...
```

## ❌ **LOGS LỖI THƯỜNG GẶP:**

```
❌ "Unable to determine Dialect" → Thiếu DB_URL hoặc sai format
❌ "Access denied for user" → DB_USERNAME hoặc DB_PASSWORD sai  
❌ "Unknown database" → Tên database trong DB_URL sai
❌ "Communications link failure" → Database không chạy hoặc host/port sai
```

---

## 📞 **NẾU VẪN LỖI:**

1. Copy toàn bộ logs từ Render
2. Kiểm tra lại TỪNG biến environment
3. Test connection từ local trước
4. Paste logs để được hỗ trợ

---

**Hoàn thành checklist này → Deploy thành công 99%!**
