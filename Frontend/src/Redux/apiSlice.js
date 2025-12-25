import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from './config';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Lấy token từ localStorage (đảm bảo key là "jwt" khớp với code Auth cũ của bạn)
      const token = localStorage.getItem("jwt");
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['SOS', 'Zone', 'Dashboard'],
  endpoints: (builder) => ({
    // Query lấy danh sách SOS
    getSosRequests: builder.query({
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
  useUpdateSosStatusMutation, 
  useGetZonesQuery 
} = apiSlice;