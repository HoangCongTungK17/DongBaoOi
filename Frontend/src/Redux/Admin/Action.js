import { BASE_URL } from "../config.js";
import {
  GET_ALL_USERS_REQUEST,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAILURE,
  UPDATE_USER_ROLE_REQUEST,
  UPDATE_USER_ROLE_SUCCESS,
  UPDATE_USER_ROLE_FAILURE,
  CLEAR_ADMIN_ERROR,
} from "./ActionType.js";

export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_USERS_REQUEST });

    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const resData = await res.json();

    if (!res.ok) {
      dispatch({ type: GET_ALL_USERS_FAILURE, payload: resData.message || "Failed to fetch users" });
      return;
    }

    dispatch({
      type: GET_ALL_USERS_SUCCESS,
      payload: resData,
    });
  } catch (error) {
    console.log("Get all users (error): ", error);
    dispatch({ type: GET_ALL_USERS_FAILURE, payload: "Something went wrong!" });
  }
};

export const updateUserRole = (userId, role) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_ROLE_REQUEST });

    const res = await fetch(`${BASE_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    const resData = await res.json();

    if (!res.ok) {
      dispatch({ type: UPDATE_USER_ROLE_FAILURE, payload: resData.message || "Failed to update role" });
      return { success: false };
    }

    dispatch({
      type: UPDATE_USER_ROLE_SUCCESS,
      payload: resData,
    });
    return { success: true };
  } catch (error) {
    console.log("Update user role (error): ", error);
    dispatch({ type: UPDATE_USER_ROLE_FAILURE, payload: "Something went wrong!" });
    return { success: false };
  }
};

export const clearAdminError = () => ({
  type: CLEAR_ADMIN_ERROR,
});
