# 🚀 HƯỚNG DẪN DEPLOY DISASTER PWA
## Vercel (Frontend) + Render (Backend)

---

## 📦 **PHẦN 1: CHUẨN BỊ DATABASE (MySQL)**

### Option 1: Railway (Miễn phí, dễ dùng)
1. Truy cập [railway.app](https://railway.app)
2. Đăng nhập với GitHub
3. Click **New Project** → **Provision MySQL**
4. Copy thông tin kết nối:
   - MYSQL_HOST
   - MYSQL_PORT
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE

### Option 2: PlanetScale (Miễn phí)
1. Truy cập [planetscale.com](https://planetscale.com)
2. Tạo database mới
3. Copy connection string

### Option 3: Aiven (Miễn phí)
1. Truy cập [aiven.io](https://aiven.io)
2. Tạo MySQL service
3. Copy connection details

---

## 🔧 **PHẦN 2: DEPLOY BACKEND LÊN RENDER**

### Bước 1: Chuẩn bị Backend
1. Đảm bảo file `Backend/Dockerfile` đã có (đã tạo sẵn)
2. Commit tất cả thay đổi lên Git:
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push
   ```

### Bước 2: Deploy trên Render
1. Truy cập [render.com](https://render.com)
2. Đăng nhập với GitHub
3. Click **New** → **Web Service**
4. Chọn repository **DongBaoOi**
5. Cấu hình:
   - **Name**: `disaster-pwa-backend`
   - **Region**: Singapore (gần VN nhất)
   - **Branch**: `main` hoặc `master`
   - **Root Directory**: `Backend`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`

### Bước 3: Thêm Environment Variables
Click **Environment** và thêm các biến sau:

```
DB_URL=jdbc:mysql://[HOST]:[PORT]/dongbaooi?useSSL=true&serverTimezone=UTC
DB_USERNAME=[your_db_username]
DB_PASSWORD=[your_db_password]

JWT_SECRET=disaster-pwa-super-secret-key-2026-min-256-bits-for-security
JWT_EXPIRATION=86400000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=[your-email@gmail.com]
MAIL_PASSWORD=[your-gmail-app-password]

SERVER_PORT=8080
ALLOWED_ORIGINS=https://[your-app].vercel.app

SPRING_PROFILES_ACTIVE=prod
```

**Lưu ý Gmail App Password:**
1. Truy cập [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Tạo App Password mới
3. Copy và paste vào `MAIL_PASSWORD`

### Bước 4: Deploy
1. Click **Create Web Service**
2. Đợi 5-10 phút để build
3. **Quan trọng**: Kiểm tra logs để đảm bảo không có lỗi:
   - Click vào service → Tab **Logs**
   - Tìm dòng: `Started Application in X.XXX seconds`
   - Kiểm tra health: `curl https://your-app.onrender.com/actuator/health`
4. Copy URL backend: `https://disaster-pwa-backend.onrender.com`

---

## 🎨 **PHẦN 3: DEPLOY FRONTEND LÊN VERCEL**

### Bước 1: Tạo file .env.production
Trong thư mục `Frontend`, tạo file `.env.production`:

```env
VITE_API_BASE_URL=https://disaster-pwa-backend.onrender.com
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Disaster PWA
VITE_APP_VERSION=1.0.0
```

### Bước 2: Commit thay đổi
```bash
git add .
git commit -m "Add production config"
git push
```

### Bước 3: Deploy trên Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập với GitHub
3. Click **Add New** → **Project**
4. Import repository **DongBaoOi**
5. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Bước 4: Thêm Environment Variables
Trong Vercel project settings, thêm:
```
VITE_API_BASE_URL=https://disaster-pwa-backend.onrender.com
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Disaster PWA
VITE_APP_VERSION=1.0.0
```

### Bước 5: Deploy
1. Click **Deploy**
2. Đợi 2-3 phút
3. Copy URL: `https://[your-app].vercel.app`

### Bước 6: Cập nhật CORS trên Render
Quay lại Render → Backend → Environment Variables:
- Cập nhật `ALLOWED_ORIGINS` = URL Vercel của bạn

---

## ✅ **PHẦN 4: XÁC NHẬN DEPLOYMENT**

### Test Backend
```bash
curl https://disaster-pwa-backend.onrender.com/actuator/health
```

### Test Frontend
Mở trình duyệt: `https://[your-app].vercel.app`

### Kiểm tra tính năng:
- ✅ Đăng nhập/Đăng ký
- ✅ Xem bản đồ
- ✅ Tạo SOS request
- ✅ Dashboard hiển thị đúng
- ✅ Notification hoạt động
- ✅ Chat bot

---

## 🔄 **DEPLOY LẠI (Khi có thay đổi code)**

### Backend (Render)
```bash
git add .
git commit -m "Update backend"
git push
```
→ Render tự động deploy lại

### Frontend (Vercel)
```bash
cd Frontend
git add .
git commit -m "Update frontend"
git push
```
→ Vercel tự động deploy lại

---

## 🐛 **TROUBLESHOOTING**

### Lỗi CORS
- Kiểm tra `ALLOWED_ORIGINS` trên Render
- Đảm bảo URL Vercel chính xác (có https://)

### Backend không kết nối Database
- Kiểm tra DB_URL, DB_USERNAME, DB_PASSWORD
- Đảm bảo database đã tạo và đang chạy
- Test kết nối từ local trước
- **Database URL format phải đúng:**
  ```
  jdbc:mysql://[HOST]:[PORT]/[DATABASE]?useSSL=true&serverTimezone=UTC
  ```
- Với Railway: `useSSL=true` (bắt buộc)
- Kiểm tra database cho phép kết nối từ IP của Render

### Frontend không gọi được API
- Kiểm tra `VITE_API_BASE_URL` 
- Mở DevTools → Network tab để xem lỗi
- Kiểm tra Backend đã deploy thành công chưa

### Render service sleep (free tier)
- Service sẽ sleep sau 15 phút không hoạt động
- Request đầu tiên sẽ mất ~30s để wake up
- Giải pháp: Upgrade lên paid plan hoặc dùng cron job ping

### Build Backend failed (Exited with status 1)
- **Kiểm tra Logs trên Render** để xem lỗi cụ thể
- Lỗi thường gặp:
  1. **Database connection failed**: Kiểm tra DB_URL, DB_USERNAME, DB_PASSWORD
  2. **Port already in use**: Đảm bảo SERVER_PORT=8080
  3. **Missing dependencies**: Commit lại pom.xml
  4. **Environment variables missing**: Kiểm tra tất cả biến môi trường đã nhập
- **Test local trước:**
  ```bash
  cd Backend
  ./mvnw clean package -DskipTests
  java -jar target/disaster_pwa.jar
  ```

### Build frontend failed
- Kiểm tra Node version (cần Node 18+)
- Chạy `npm install` trước
- Xóa `node_modules` và `package-lock.json` rồi install lại

---

## 💰 **CHI PHÍ**

- **Render Free**: Miễn phí mãi mãi (có giới hạn 750h/tháng, service sleep)
- **Vercel Free**: Miễn phí mãi mãi (100GB bandwidth/tháng)
- **Railway MySQL**: $5/tháng (có $5 credit miễn phí)
- **PlanetScale**: Miễn phí (có giới hạn)

**Tổng: $0-5/tháng**

---

## 📞 **HỖ TRỢ**

Nếu gặp lỗi, check logs:
- **Render**: Dashboard → Logs
- **Vercel**: Project → Deployments → Click deployment → Logs
- **Database**: Railway/PlanetScale dashboard

---

## 🎉 **HOÀN THÀNH!**

Sau khi deploy xong:
1. Chia sẻ URL với team/users
2. Setup custom domain (nếu cần)
3. Enable analytics (Vercel Analytics)
4. Setup monitoring (Sentry, LogRocket)

**URL ứng dụng của bạn:**
- Frontend: `https://[your-app].vercel.app`
- Backend API: `https://disaster-pwa-backend.onrender.com`
