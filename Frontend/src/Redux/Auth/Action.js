import { BASE_URL } from "../config.js";
import { UPDATE_STATUS_FAILURE } from "../SOS/ActionType.js";
import {
  GET_DETAILS_FAILURE,
  GET_DETAILS_REQUEST,
  GET_DETAILS_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  REGISTER_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  UPDATE_DETAILS_FAILURE,
  UPDATE_DETAILS_REQUEST,
  UPDATE_DETAILS_SUCCESS,
} from "./ActionType.js";

// --- ĐĂNG KÝ (Giữ nguyên nếu đã chạy đúng) ---
export const register = (userData) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_REQUEST });
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const resData = await res.json();
    if (!res.ok) {
      dispatch({ type: REGISTER_FAILURE, payload: { error: resData } });
      return;
    }
    // Lưu token
    localStorage.setItem("accessToken", resData.accessToken);
    localStorage.setItem("refreshToken", resData.refreshToken);
    dispatch({ type: REGISTER_SUCCESS, payload: resData });
    console.log("Register success", resData);
  } catch (error) {
    dispatch({ type: REGISTER_FAILURE, payload: error });
    console.log(error);
  }
};

// --- ĐĂNG NHẬP (CẦN SỬA CHỖ NÀY) ---
export const login = (loginData) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    // ⚠️ SỬA: Đổi "/auth/login" thành "/auth/authenticate" cho khớp với Backend
    const res = await fetch(`${BASE_URL}/auth/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Login failed:", resData);
      // Thêm message cụ thể hơn
      const errorMessage = res.status === 403 ? "Email hoặc mật khẩu không đúng" : 
                          res.status === 401 ? "Không có quyền truy cập" :
                          resData.message || "Đăng nhập thất bại";
      dispatch({ type: LOGIN_FAILURE, payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }

    // ===== VALIDATION: Kiểm tra role vs loginMode =====
    const loginMode = sessionStorage.getItem("loginMode");
    console.log("Login mode from sessionStorage:", loginMode);
    
    // Decode JWT để lấy role
    const { jwtDecode } = await import("jwt-decode");
    const decoded = jwtDecode(resData.accessToken);
    const userRole = decoded.role;
    const isAdmin = userRole === "ADMIN";
    
    console.log("User role:", userRole, "isAdmin:", isAdmin, "loginMode:", loginMode);
    
    // Nếu user login qua trang admin -> CHẶN
    if (loginMode === "admin" && !isAdmin) {
      console.log("BLOCKED: User trying to login via admin page");
      sessionStorage.removeItem("loginMode");
      dispatch({ 
        type: LOGIN_FAILURE, 
        payload: { error: "Bạn không có quyền admin! Vui lòng đăng nhập bằng tài khoản admin." } 
      });
      return { success: false, error: "Bạn không có quyền admin!" };
    }
    
    // Nếu admin login qua trang user -> CHẶN
    if ((loginMode === "login" || loginMode === "register") && isAdmin) {
      console.log("BLOCKED: Admin trying to login via user page");
      sessionStorage.removeItem("loginMode");
      dispatch({ 
        type: LOGIN_FAILURE, 
        payload: { error: "Bạn đang dùng tài khoản admin. Vui lòng sử dụng 'Login as Admin'." } 
      });
      return { success: false, error: "Vui lòng sử dụng 'Login as Admin'" };
    }
    // ===== END VALIDATION =====
    
    // Clear loginMode after successful validation
    sessionStorage.removeItem("loginMode");

    // Lưu token vào localStorage
    localStorage.setItem("accessToken", resData.accessToken);
    localStorage.setItem("refreshToken", resData.refreshToken);

    dispatch({ type: LOGIN_SUCCESS, payload: resData });
    console.log("Login success", resData);
    return { success: true };

  } catch (error) {
    console.error("Login error catch:", error);
    sessionStorage.removeItem("loginMode");
    dispatch({ type: LOGIN_FAILURE, payload: { error: "Lỗi kết nối server" } });
    return { success: false, error: "Lỗi kết nối server" };
  }
};

export const getMyDetails = () => async (dispatch) => {
  try {
    dispatch({ type: GET_DETAILS_REQUEST });

    const res = await fetch(`${BASE_URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    let resData;
    try {
      resData = await res.json();
    } catch (err) {
      resData = {};
    }
    console.log("My details: ", resData);

    if (!res.ok) {
      dispatch({ type: GET_DETAILS_FAILURE, payload: { error: resData } });
      return;
    }

    dispatch({
      type: GET_DETAILS_SUCCESS,
      payload: resData,
    });
  } catch (error) {
    console.log("Get my details (error): ", error);
    dispatch({ type: GET_DETAILS_FAILURE, payload: "Something went wrong!" });
  }
};

export const updateMyDetails = (reqData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_DETAILS_REQUEST });

    const res = await fetch(`${BASE_URL}/user`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    });

    let resData;
    try {
      resData = await res.json();
    } catch (err) {
      resData = {};
    }
    console.log("Updated details: ", resData);

    if (!res.ok) {
      dispatch({ type: UPDATE_DETAILS_FAILURE, payload: { error: resData } });
      return;
    }

    dispatch({
      type: UPDATE_DETAILS_SUCCESS,
      payload: resData,
    });
  } catch (error) {
    console.log("update my details (error): ", error);
    dispatch({ type: UPDATE_DETAILS_FAILURE, payload: "Something went wrong!" });
  }
};
