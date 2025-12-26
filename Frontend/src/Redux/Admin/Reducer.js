import {
  GET_ALL_USERS_REQUEST,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAILURE,
  UPDATE_USER_ROLE_REQUEST,
  UPDATE_USER_ROLE_SUCCESS,
  UPDATE_USER_ROLE_FAILURE,
  CLEAR_ADMIN_ERROR,
} from "./ActionType.js";

const initialState = {
  users: [],
  loading: false,
  error: null,
  updateLoading: false,
};

export const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_USERS_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_ALL_USERS_SUCCESS:
      return { ...state, loading: false, users: action.payload };
    case GET_ALL_USERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case UPDATE_USER_ROLE_REQUEST:
      return { ...state, updateLoading: true, error: null };
    case UPDATE_USER_ROLE_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        users: state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case UPDATE_USER_ROLE_FAILURE:
      return { ...state, updateLoading: false, error: action.payload };

    case CLEAR_ADMIN_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};
