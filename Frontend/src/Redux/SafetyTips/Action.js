import { BASE_URL } from "../config";
import {
  GET_SAFETY_TIP_FAILURE,
  GET_SAFETY_TIP_REQUEST,
  GET_SAFETY_TIP_SUCCESS,
  GET_ALL_SAFETY_TIPS_REQUEST,
  GET_ALL_SAFETY_TIPS_SUCCESS,
  GET_ALL_SAFETY_TIPS_FAILURE,
  CREATE_SAFETY_TIP_REQUEST,
  CREATE_SAFETY_TIP_SUCCESS,
  CREATE_SAFETY_TIP_FAILURE,
  UPDATE_SAFETY_TIP_REQUEST,
  UPDATE_SAFETY_TIP_SUCCESS,
  UPDATE_SAFETY_TIP_FAILURE,
  DELETE_SAFETY_TIP_REQUEST,
  DELETE_SAFETY_TIP_SUCCESS,
  DELETE_SAFETY_TIP_FAILURE,
  CLEAR_SAFETY_TIP_ERROR,
} from "./ActionType";

// Get safety tips for a specific zone
export const getSafetyTips = (zoneId) => async (dispatch) => {
  try {
    dispatch({ type: GET_SAFETY_TIP_REQUEST });

    const res = await fetch(`${BASE_URL}/safetyTip/zone/${zoneId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    let resData;
    try {
      resData = await res.json();
    } catch {
      resData = {};
    }

    console.log("Safety tips: ", resData);

    if (!res.ok) {
      dispatch({ type: GET_SAFETY_TIP_FAILURE, payload: resData });
      return;
    }

    dispatch({
      type: GET_SAFETY_TIP_SUCCESS,
      payload: resData,
    });
  } catch (error) {
    console.log("Get safety tips (error): ", error);
    dispatch({ type: GET_SAFETY_TIP_FAILURE, payload: "Something went wrong!" });
  }
};

// Admin: Get all safety tips
export const getAllSafetyTips = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_SAFETY_TIPS_REQUEST });

    const res = await fetch(`${BASE_URL}/admin/safetyTip`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const resData = await res.json();

    if (!res.ok) {
      dispatch({ type: GET_ALL_SAFETY_TIPS_FAILURE, payload: resData.message || "Failed to fetch safety tips" });
      return;
    }

    dispatch({
      type: GET_ALL_SAFETY_TIPS_SUCCESS,
      payload: resData,
    });
  } catch (error) {
    console.log("Get all safety tips (error): ", error);
    dispatch({ type: GET_ALL_SAFETY_TIPS_FAILURE, payload: "Something went wrong!" });
  }
};

// Admin: Create safety tip
export const createSafetyTip = (tipData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_SAFETY_TIP_REQUEST });

    const res = await fetch(`${BASE_URL}/admin/safetyTip`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tipData),
    });

    const resData = await res.json();

    if (!res.ok) {
      dispatch({ type: CREATE_SAFETY_TIP_FAILURE, payload: resData.message || "Failed to create safety tip" });
      return { success: false, message: resData.message };
    }

    dispatch({
      type: CREATE_SAFETY_TIP_SUCCESS,
      payload: resData,
    });
    return { success: true };
  } catch (error) {
    console.log("Create safety tip (error): ", error);
    dispatch({ type: CREATE_SAFETY_TIP_FAILURE, payload: "Something went wrong!" });
    return { success: false };
  }
};

// Admin: Update safety tip
export const updateSafetyTip = (tipId, tipData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_SAFETY_TIP_REQUEST });

    const res = await fetch(`${BASE_URL}/admin/safetyTip/${tipId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tipData),
    });

    const resData = await res.json();

    if (!res.ok) {
      dispatch({ type: UPDATE_SAFETY_TIP_FAILURE, payload: resData.message || "Failed to update safety tip" });
      return { success: false };
    }

    dispatch({
      type: UPDATE_SAFETY_TIP_SUCCESS,
      payload: resData,
    });
    return { success: true };
  } catch (error) {
    console.log("Update safety tip (error): ", error);
    dispatch({ type: UPDATE_SAFETY_TIP_FAILURE, payload: "Something went wrong!" });
    return { success: false };
  }
};

// Admin: Delete safety tip
export const deleteSafetyTip = (tipId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_SAFETY_TIP_REQUEST });

    const res = await fetch(`${BASE_URL}/admin/safetyTip/${tipId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (!res.ok) {
      const resData = await res.json();
      dispatch({ type: DELETE_SAFETY_TIP_FAILURE, payload: resData.message || "Failed to delete safety tip" });
      return { success: false };
    }

    dispatch({
      type: DELETE_SAFETY_TIP_SUCCESS,
      payload: tipId,
    });
    return { success: true };
  } catch (error) {
    console.log("Delete safety tip (error): ", error);
    dispatch({ type: DELETE_SAFETY_TIP_FAILURE, payload: "Something went wrong!" });
    return { success: false };
  }
};

export const clearSafetyTipError = () => ({
  type: CLEAR_SAFETY_TIP_ERROR,
});
