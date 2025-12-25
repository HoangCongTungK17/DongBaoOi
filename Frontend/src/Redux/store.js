import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit"; // Sử dụng configureStore thay vì legacy_createStore
import { authReducer } from "./Auth/Reducer.js";
import { dashboardReducer } from "./Dashboard/Reducer.js";
import { disasterReducer } from "./DisasterZone/Reducer.js";
import { sosReducer } from "./SOS/Reducer.js";
import { safetyTipReducer } from "./SafetyTips/Reducer.js";
import { apiSlice } from "./apiSlice"; // Import apiSlice bạn đã tạo

const rootReducer = combineReducers({
  authStore: authReducer,
  dashboardStore: dashboardReducer,
  disasterStore: disasterReducer,
  sosStore: sosReducer,
  safetyTipsStore: safetyTipReducer,
  // Đăng ký reducerPath của apiSlice vào store
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  // Thêm middleware của RTK Query để hỗ trợ caching và đồng bộ dữ liệu
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Tắt kiểm tra tuần tự hóa để tương thích với code cũ nếu cần
    }).concat(apiSlice.middleware),
});