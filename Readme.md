# Disaster PWA - Quick Start Guide

## 🚀 Deploy lên Web (Vercel + Render)

Xem hướng dẫn chi tiết: [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)

### Checklist nhanh:
1. ✅ Tạo MySQL database (Railway/PlanetScale/Aiven)
2. ✅ Deploy Backend lên Render với Dockerfile
3. ✅ Cấu hình Environment Variables trên Render
4. ✅ Deploy Frontend lên Vercel
5. ✅ Cập nhật CORS và API URL

---

## 📦 Files đã tạo sẵn:

### Backend
- ✅ `Backend/Dockerfile` - Container config cho Render
- ✅ `Backend/.env.example` - Mẫu biến môi trường
- ✅ `Backend/src/main/resources/application-prod.yml` - Config production
- ✅ `Backend/.gitignore` - Ignore sensitive files

### Frontend
- ✅ `Frontend/.env.example` - Mẫu biến môi trường
- ✅ `Frontend/src/Redux/config.js` - Đã update để dùng env variables
- ✅ `Frontend/.gitignore` - Ignore sensitive files

---

## 🛠️ Chạy Local

### Backend (Port 8080)
```bash
cd Backend
./mvnw spring-boot:run
```

### Frontend (Port 5173)
```bash
cd Frontend
npm install
npm run dev
```

---

## 🌐 Sau khi Deploy

### URLs của bạn:
- **Frontend**: `https://[your-app].vercel.app`
- **Backend API**: `https://disaster-pwa-backend.onrender.com`

### Test API:
```bash
curl https://disaster-pwa-backend.onrender.com/actuator/health
```

---

## 📞 Support

Gặp vấn đề? Check logs:
- **Render**: Dashboard → Your Service → Logs
- **Vercel**: Project → Deployments → Logs
- **Database**: Service dashboard

---

## ⚡ Auto-Deploy

Mỗi khi push code lên GitHub:
- Render tự động deploy Backend
- Vercel tự động deploy Frontend

```bash
git add .
git commit -m "Update: your changes"
git push
```

---

**Tổng thời gian deploy: ~20 phút**
**Chi phí: $0-5/tháng** (Free tier available)
