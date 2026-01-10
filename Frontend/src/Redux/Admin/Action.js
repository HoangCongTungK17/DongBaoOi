import { BASE_URL } from "../config.js";
import {
  GET_ALL_USERS_REQUEST,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAILURE,
  UPDATE_USER_ROLE_REQUEST,
  UPDATE_USER_ROLE_SUCCESS,
  UPDATE_USER_ROLE_FAILURE,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
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
    console.log("Get all users response:", { status: res.status, data: resData });

    if (!res.ok) {
      dispatch({ type: GET_ALL_USERS_FAILURE, payload: resData.message || "Failed to fetch users" });
      return;
    }

    dispatch({
      type: GET_ALL_USERS_SUCCESS,
      payload: resData,
    });
  } catch (error) {
    console.error("Get all users (error): ", error);
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

// Create user
export const createUser = (userData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_USER_REQUEST });

    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const resData = await res.json();

    if (!res.ok) {
      dispatch({ type: CREATE_USER_FAILURE, payload: resData.message || "Failed to create user" });
      return { success: false, message: resData.message };
    }

    dispatch({
      type: CREATE_USER_SUCCESS,
      payload: resData,
    });
    dispatch(getAllUsers()); // Refresh user list
    return { success: true };
  } catch (error) {
    console.log("Create user (error): ", error);
    dispatch({ type: CREATE_USER_FAILURE, payload: "Something went wrong!" });
    return { success: false };
  }
};

// Update user
export const updateUser = (userId, userData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_REQUEST });

    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const resData = await res.json();

    if (!res.ok) {
      dispatch({ type: UPDATE_USER_FAILURE, payload: resData.message || "Failed to update user" });
      return { success: false };
    }

    dispatch({
      type: UPDATE_USER_SUCCESS,
      payload: resData,
    });
    dispatch(getAllUsers()); // Refresh user list
    return { success: true };
  } catch (error) {
    console.log("Update user (error): ", error);
    dispatch({ type: UPDATE_USER_FAILURE, payload: "Something went wrong!" });
    return { success: false };
  }
};

// Delete user
export const deleteUser = (userId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_USER_REQUEST });

    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const resData = await res.json();

    if (!res.ok) {
      dispatch({ type: DELETE_USER_FAILURE, payload: resData.message || "Failed to delete user" });
      return { success: false };
    }

    dispatch({
      type: DELETE_USER_SUCCESS,
      payload: userId,
    });
    dispatch(getAllUsers()); // Refresh user list
    return { success: true };
  } catch (error) {
    console.log("Delete user (error): ", error);
    dispatch({ type: DELETE_USER_FAILURE, payload: "Something went wrong!" });
    return { success: false };
  }
};
