import React, { useEffect, Suspense, lazy } from "react"; // Thêm Suspense và lazy
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "sonner";

// Giữ lại các thành phần nhẹ hoặc dùng chung
import Navbar from "./components/Navbar.jsx";
import Auth from "./pages/auth/Auth";
import { isTokenValid } from "./Redux/Auth/isTokenValid.js";
import { LOGOUT } from "./Redux/Auth/ActionType.js";
import { Toaster } from "sonner";
import ProfilePage from "./pages/ProfilePage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import ContactsPage from "./pages/ContactsPage.jsx";

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
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/zones" element={<DisasterZonesPage />} />
            <Route path="/zones/:id" element={<ZonesDetailsPage />} />
            <Route path="/sos" element={<SOSRequestsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
          </Routes>
        </div>
      )}
    </>
  );
}

export default App;