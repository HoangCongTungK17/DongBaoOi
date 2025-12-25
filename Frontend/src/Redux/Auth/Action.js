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
      dispatch({ type: LOGIN_FAILURE, payload: { error: resData } });
      return;
    }

    // Lưu token vào localStorage
    localStorage.setItem("accessToken", resData.accessToken);
    localStorage.setItem("refreshToken", resData.refreshToken);

    dispatch({ type: LOGIN_SUCCESS, payload: resData });
    console.log("Login success", resData);

  } catch (error) {
    console.error("Login error catch:", error);
    dispatch({ type: LOGIN_FAILURE, payload: error });
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
