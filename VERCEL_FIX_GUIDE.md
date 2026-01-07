# 🚨 FIX LỖI VERCEL "Missing script: build"

## ❌ **VẤN ĐỀ:**
Vercel đang build từ thư mục ROOT thay vì thư mục FRONTEND!

---

## ✅ **GIẢI PHÁP - CHỌN 1 TRONG 2:**

### **CÁCH 1: Cấu hình lại Project trên Vercel (Khuyến nghị)**

1. **Commit code mới:**
   ```bash
   git add vercel.json
   git commit -m "Fix Vercel root directory"
   git push
   ```

2. **Xóa và tạo lại project trên Vercel:**
   - Vào [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click vào project → **Settings** → **General**
   - Cuộn xuống dưới → Click **Delete Project**
   - Confirm xóa

3. **Tạo lại project:**
   - Click **Add New** → **Project**
   - Import repository **DongBaoOi**
   - **QUAN TRỌNG**: Trong phần **Configure Project**:
     - **Framework Preset**: Vite
     - **Root Directory**: Click **Edit** → Chọn `Frontend` ✅
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

4. **Thêm Environment Variables:**
   ```
   VITE_API_BASE_URL=https://disaster-pwa-backend.onrender.com
   VITE_API_TIMEOUT=30000
   VITE_APP_NAME=Disaster PWA
   VITE_APP_VERSION=1.0.0
   ```

5. **Deploy:**
   - Click **Deploy**
   - Đợi 2-3 phút

---

### **CÁCH 2: Chỉnh Settings của Project hiện tại**

1. **Commit code:**
   ```bash
   git add vercel.json
   git commit -m "Fix Vercel configuration"
   git push
   ```

2. **Vào Vercel Settings:**
   - [vercel.com/dashboard](https://vercel.com/dashboard) → Your Project
   - Click **Settings** → **General**

3. **Sửa Root Directory:**
   - Tìm mục **Root Directory**
   - Click **Edit**
   - Nhập: `Frontend`
   - Click **Save**

4. **Sửa Build & Development Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Clear Cache & Redeploy:**
   - Vào tab **Deployments**
   - Click vào deployment mới nhất → **...** menu
   - Click **Redeploy**
   - ✅ **Check: "Clear cache"**
   - Click **Redeploy**

---

## 🔍 **KIỂM TRA NẾU VẪN LỖI:**

### Test build local trước:
```bash
cd Frontend
npm install
npm run build
```

Nếu local OK → Vấn đề chắc chắn ở Vercel settings!

### Xem lại package.json của Frontend:
```bash
# File: Frontend/package.json
# Phải có script "build"
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",  ← Phải có dòng này
    "preview": "vite preview"
  }
}
```

---

## 📝 **TẠI SAO LỖI NÀY XẢY RA?**

Vercel đang chạy:
```bash
# Sai - Ở thư mục root
cd /vercel/path0
npm run build  ← File package.json ở root không có script "build"

# Đúng - Ở thư mục Frontend  
cd /vercel/path0/Frontend
npm run build  ← File Frontend/package.json có script "build"
```

---

## ⚡ **KHUYẾN NGHỊ:**

Tôi khuyên bạn dùng **CÁCH 1** (xóa và tạo lại project) vì:
- ✅ Sạch sẽ, không cache
- ✅ Cấu hình lại từ đầu
- ✅ Chỉ mất 3 phút

Xóa project không ảnh hưởng gì, chỉ cần import lại repository!

---

## 🎯 **SAU KHI FIX XONG:**

Deploy thành công, bạn sẽ thấy:
```
✓ Building...
✓ Compiled successfully
✓ Deployment ready
```

URL của bạn: `https://[your-app].vercel.app`
