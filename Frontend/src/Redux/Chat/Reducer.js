import {
  SEND_MESSAGE_REQUEST,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_FAILURE,
  ADD_USER_MESSAGE,
  CLEAR_CHAT,
  SET_CHAT_CONTEXT,
} from "./ActionType.js";

const initialState = {
  messages: [
    {
      role: "assistant",
      content: "Xin chào! Tôi là DongBaoOi AI Assistant - trợ lý khẩn cấp của bạn. Tôi có thể giúp bạn về:\n\n• Hướng dẫn sơ tán khi có thảm họa\n• Sơ cứu và cấp cứu cơ bản\n• Ứng phó với lũ lụt, động đất, bão, cháy\n• Số điện thoại khẩn cấp\n\nBạn cần hỗ trợ gì?",
    },
  ],
  loading: false,
  error: null,
  context: "",
};

export const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };

    case SEND_MESSAGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SEND_MESSAGE_SUCCESS:
      return {
        ...state,
        loading: false,
        messages: [...state.messages, action.payload],
      };

    case SEND_MESSAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline 112 nếu khẩn cấp.",
            isError: true,
          },
        ],
      };

    case CLEAR_CHAT:
      return {
        ...initialState,
      };

    case SET_CHAT_CONTEXT:
      return {
        ...state,
        context: action.payload,
      };

    default:
      return state;
  }
};
