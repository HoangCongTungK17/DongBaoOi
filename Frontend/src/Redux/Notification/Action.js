import {
  ADD_NOTIFICATION,
  MARK_AS_READ,
  MARK_ALL_AS_READ,
  CLEAR_NOTIFICATIONS,
} from "./ActionType.js";

export const addNotification = (notification) => ({
  type: ADD_NOTIFICATION,
  payload: {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notification,
  },
});

export const markAsRead = (id) => ({
  type: MARK_AS_READ,
  payload: id,
});

export const markAllAsRead = () => ({
  type: MARK_ALL_AS_READ,
});

export const clearNotifications = () => ({
  type: CLEAR_NOTIFICATIONS,
});
