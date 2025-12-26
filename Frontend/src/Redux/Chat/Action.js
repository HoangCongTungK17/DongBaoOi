import { BASE_URL } from "../config.js";
import {
  SEND_MESSAGE_REQUEST,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_FAILURE,
  ADD_USER_MESSAGE,
  CLEAR_CHAT,
  SET_CHAT_CONTEXT,
} from "./ActionType.js";

export const sendMessage = (message, history = [], context = "") => async (dispatch) => {
  try {
    // Add user message to chat immediately
    dispatch({
      type: ADD_USER_MESSAGE,
      payload: { role: "user", content: message },
    });

    dispatch({ type: SEND_MESSAGE_REQUEST });

    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: history.slice(-10), // Keep last 10 messages for context
        context,
      }),
    });

    const resData = await res.json();

    if (!res.ok || !resData.success) {
      dispatch({
        type: SEND_MESSAGE_FAILURE,
        payload: resData.error || "Failed to get response",
      });
      return;
    }

    dispatch({
      type: SEND_MESSAGE_SUCCESS,
      payload: { role: "assistant", content: resData.message },
    });
  } catch (error) {
    console.error("Chat error:", error);
    dispatch({
      type: SEND_MESSAGE_FAILURE,
      payload: "Network error. Please try again.",
    });
  }
};

export const clearChat = () => ({
  type: CLEAR_CHAT,
});

export const setChatContext = (context) => ({
  type: SET_CHAT_CONTEXT,
  payload: context,
});
