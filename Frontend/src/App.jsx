import React, { useEffect, Suspense, lazy } from "react"; // Thêm Suspense và lazy
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "sonner";

// Giữ lại các thành phần nhẹ hoặc dùng chung
import Navbar from "./components/Navbar.jsx";
import Auth from "./pages/auth/Auth";
import { isTokenValid } from "./Redux/Auth/isTokenValid.js";
import { LOGOUT } from "./Redux/Auth/ActionType.js";

// TỐI ƯU: Tải chậm các trang có nhiều logic hoặc component nặng
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const DisasterZonesPage = lazy(() => import("./pages/DisasterZonesPage.jsx"));
const ZonesDetailsPage = lazy(() => import("./pages/ZonesDetailsPage.jsx"));
const SOSRequestsPage = lazy(() => import("./pages/SOSRequest/SOSRequestsPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const ReportPage = lazy(() => import("./pages/ReportPage.jsx"));

function App() {
  const { isAuthenticated, accessToken } = useSelector((store) => store.authStore);
  const dispatch = useDispatch();

  useEffect(() => {
    if (accessToken && !isTokenValid(accessToken)) {
      dispatch({ type: LOGOUT });
    }
  }, [accessToken, dispatch]);

  return (
    <>
      <Toaster richColors position="top-right" />
      {!isAuthenticated ? (
        <Auth />
      ) : (
        <div>
          <Navbar />
          {/* TỐI ƯU: Bọc các Route trong Suspense để hiển thị trạng thái chờ khi tải trang */}
          <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-900 text-white">Đang tải dữ liệu...</div>}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/zones" element={<DisasterZonesPage />} />
              <Route path="/zones/:id" element={<ZonesDetailsPage />} />
              <Route path="/sos" element={<SOSRequestsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/report" element={<ReportPage />} />
            </Routes>
          </Suspense>
        </div>
      )}
    </>
  );
}

export default App;