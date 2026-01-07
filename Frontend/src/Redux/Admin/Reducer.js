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

    // Create User
    case CREATE_USER_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_USER_SUCCESS:
      return {
        ...state,
        users: [...state.users, action.payload],
        loading: false,
        error: null,
      };
    case CREATE_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Update User  
    case UPDATE_USER_REQUEST:
      return { ...state, updateLoading: true, error: null };
    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
        updateLoading: false,
        error: null,
      };
    case UPDATE_USER_FAILURE:
      return { ...state, updateLoading: false, error: action.payload };

    // Delete User
    case DELETE_USER_REQUEST:
      return { ...state, loading: true, error: null };
    case DELETE_USER_SUCCESS:
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
        loading: false,
        error: null,
      };
    case DELETE_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CLEAR_ADMIN_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};
