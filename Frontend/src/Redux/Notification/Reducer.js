import {
  ADD_NOTIFICATION,
  MARK_AS_READ,
  MARK_ALL_AS_READ,
  CLEAR_NOTIFICATIONS,
} from "./ActionType.js";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications].slice(0, 50);
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.read).length,
      };

    case MARK_AS_READ:
      const updatedNotifications = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.read).length,
      };

    case MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };

    case CLEAR_NOTIFICATIONS:
      return initialState;

    default:
      return state;
  }
};
