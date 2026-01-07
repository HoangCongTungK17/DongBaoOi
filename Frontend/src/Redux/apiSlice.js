import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from './config';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Lấy token từ localStorage - phải dùng key "accessToken"
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['SOS', 'Zone', 'Dashboard'],
  endpoints: (builder) => ({
    // Query lấy tất cả SOS (admin only)
    getSosRequests: builder.query({
      query: () => '/sos/all',
      transformResponse: (response) => {
        // Backend trả về Page<SosRequestDto> có cấu trúc: { content: [...], totalElements, totalPages, ... }
        // Transform để trả về mảng content
        return response.content || response;
      },
      providesTags: ['SOS'],
    }),
    // Query lấy SOS của user hiện tại
    getUserSosRequests: builder.query({
      query: () => '/sos',
      providesTags: ['SOS'],
    }),
    // Mutation cập nhật trạng thái SOS
    updateSosStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/sos/${id}/status?status=${status}`,
        method: 'PUT',
      }),
      // Khi cập nhật thành công, tự động làm mới các query có tag 'SOS' và 'Dashboard'
      invalidatesTags: ['SOS', 'Dashboard'],
    }),
    // Query lấy danh sách các vùng thiên tai
    getZones: builder.query({
      query: () => '/zones',
      providesTags: ['Zone'],
    }),
  }),
});

export const { 
  useGetSosRequestsQuery, 
  useGetUserSosRequestsQuery,
  useUpdateSosStatusMutation, 
  useGetZonesQuery 
} = apiSlice;