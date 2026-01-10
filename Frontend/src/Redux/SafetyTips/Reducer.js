import {
  GET_SAFETY_TIP_REQUEST,
  GET_SAFETY_TIP_SUCCESS,
  GET_SAFETY_TIP_FAILURE,
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
} from "./ActionType.js";

const initialState = {
  safetyTips: null,
  allSafetyTips: [],
  safetyTipsLoading: false,
  safetyTipsError: null,
  updateLoading: false,
};

export const safetyTipReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    // Zone-specific tips
    case GET_SAFETY_TIP_REQUEST:
      return { ...state, safetyTipsLoading: true, safetyTipsError: null };
    case GET_SAFETY_TIP_SUCCESS:
      return { ...state, safetyTips: payload, safetyTipsLoading: false, safetyTipsError: null };
    case GET_SAFETY_TIP_FAILURE:
      return { ...state, safetyTipsLoading: false, safetyTipsError: payload };

    // All tips (admin)
    case GET_ALL_SAFETY_TIPS_REQUEST:
      return { ...state, safetyTipsLoading: true, safetyTipsError: null };
    case GET_ALL_SAFETY_TIPS_SUCCESS:
      return { ...state, allSafetyTips: payload, safetyTipsLoading: false, safetyTipsError: null };
    case GET_ALL_SAFETY_TIPS_FAILURE:
      return { ...state, safetyTipsLoading: false, safetyTipsError: payload };

    // Create tip
    case CREATE_SAFETY_TIP_REQUEST:
      return { ...state, updateLoading: true, safetyTipsError: null };
    case CREATE_SAFETY_TIP_SUCCESS:
      return {
        ...state,
        allSafetyTips: [...state.allSafetyTips, payload],
        updateLoading: false,
        safetyTipsError: null,
      };
    case CREATE_SAFETY_TIP_FAILURE:
      return { ...state, updateLoading: false, safetyTipsError: payload };

    // Update tip
    case UPDATE_SAFETY_TIP_REQUEST:
      return { ...state, updateLoading: true, safetyTipsError: null };
    case UPDATE_SAFETY_TIP_SUCCESS:
      return {
        ...state,
        allSafetyTips: state.allSafetyTips.map((tip) =>
          tip.id === payload.id ? payload : tip
        ),
        updateLoading: false,
        safetyTipsError: null,
      };
    case UPDATE_SAFETY_TIP_FAILURE:
      return { ...state, updateLoading: false, safetyTipsError: payload };

    // Delete tip
    case DELETE_SAFETY_TIP_REQUEST:
      return { ...state, updateLoading: true, safetyTipsError: null };
    case DELETE_SAFETY_TIP_SUCCESS:
      return {
        ...state,
        allSafetyTips: state.allSafetyTips.filter((tip) => tip.id !== payload),
        updateLoading: false,
        safetyTipsError: null,
      };
    case DELETE_SAFETY_TIP_FAILURE:
      return { ...state, updateLoading: false, safetyTipsError: payload };

    case CLEAR_SAFETY_TIP_ERROR:
      return { ...state, safetyTipsError: null };

    default:
      return state;
  }
};
