import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from '../auth/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const token = getState().auth.token
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  // If we get a 401, check if this is a protected endpoint before trying to refresh
  // if (result.error && result.error.status === 401) {
  //   const url = typeof args === 'string' ? args : args.url
    
  //   // List of public endpoints that don't require authentication
  //   const publicEndpoints = ['/listings']
  //   const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint) && !url.includes('/my-listings'))
    
  //   // If it's a public endpoint, don't try to refresh token or logout
  //   if (isPublicEndpoint) {
  //     return result
  //   }
    
  //   const refreshToken = api.getState().auth.refreshToken
    
  //   if (refreshToken) {
  //     // Try to refresh the token
  //     const refreshResult = await baseQuery(
  //       {
  //         url: '/users/refresh-token',
  //         method: 'POST',
  //         body: { refreshToken }
  //       },
  //       api,
  //       extraOptions
  //     )
      
  //     if (refreshResult.data && refreshResult.data.success) {
  //       // Store the new token
  //       api.dispatch(setCredentials({
  //         user: api.getState().auth.user,
  //         token: refreshResult.data.data.token,
  //         refreshToken: refreshResult.data.data.refreshToken
  //       }))
  //       // Retry the original query
  //       result = await baseQuery(args, api, extraOptions)
  //     } else {
  //       // Refresh failed, logout user
  //       api.dispatch(logout())
  //     }
  //   } else {
  //     api.dispatch(logout())
  //   }
  // }
  
  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Profile', 'Sweet', 'Admin'],
  endpoints: (builder) => ({
    // Authentication endpoints
    register: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    googleAuth: builder.mutation({
      query: (googleData) => ({
        url: '/users/google-auth',
        method: 'POST',
        body: googleData,
      }),
    }),
    
    logout: builder.mutation({
      query: (body) => ({
        url: '/users/logout',
        method: 'POST',
        body: body || {},
      }),
    }),
    
    logoutAll: builder.mutation({
      query: () => ({
        url: '/users/logout-all',
        method: 'POST',
      }),
    }),
    
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/users/refresh-token',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    
    // Profile endpoints (basic profile management for authenticated users)
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['Profile'],
    }),
    
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),
    
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/users/change-password',
        method: 'PUT',
        body: passwordData,
      }),
    }),

    // Sweet endpoints
    getAllSweets: builder.query({
      query: (params = {}) => ({
        url: '/sweets',
        params,
      }),
      providesTags: ['Sweet'],
    }),

    getSweetById: builder.query({
      query: (id) => `/sweets/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sweet', id }],
    }),

    searchSweets: builder.query({
      query: (params) => ({
        url: '/sweets/search',
        params,
      }),
      providesTags: ['Sweet'],
    }),

    getSweetsByCategory: builder.query({
      query: ({ category, ...params }) => ({
        url: `/sweets/category/${category}`,
        params,
      }),
      providesTags: ['Sweet'],
    }),

    getFeaturedSweets: builder.query({
      query: (params = {}) => ({
        url: '/sweets/featured',
        params,
      }),
      providesTags: ['Sweet'],
    }),

    getDiscountedSweets: builder.query({
      query: (params = {}) => ({
        url: '/sweets/discounted',
        params,
      }),
      providesTags: ['Sweet'],
    }),

    getSweetCategories: builder.query({
      query: () => '/sweets/categories',
      providesTags: ['Sweet'],
    }),

    addSweetReview: builder.mutation({
      query: ({ id, ...reviewData }) => ({
        url: `/sweets/${id}/review`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Sweet', id }],
    }),

    // User sweet creation
    createSweetByUser: builder.mutation({
      query: (sweetData) => ({
        url: '/sweets/user/create',
        method: 'POST',
        body: sweetData,
      }),
      invalidatesTags: ['Sweet'],
    }),

    // Admin endpoints
    loginAdmin: builder.mutation({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    registerAdmin: builder.mutation({
      query: (adminData) => ({
        url: '/admin/register',
        method: 'POST',
        body: adminData,
      }),
      invalidatesTags: ['Admin'],
    }),

    getAdminProfile: builder.query({
      query: () => '/admin/profile',
      providesTags: ['Admin'],
    }),

    updateAdminProfile: builder.mutation({
      query: (profileData) => ({
        url: '/admin/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Admin'],
    }),

    logoutAdmin: builder.mutation({
      query: (body) => ({
        url: '/admin/logout',
        method: 'POST',
        body: body || {},
      }),
    }),

    getAllAdmins: builder.query({
      query: (params = {}) => ({
        url: '/admin/all',
        params,
      }),
      providesTags: ['Admin'],
    }),

    // Admin sweet management
    createSweet: builder.mutation({
      query: (sweetData) => ({
        url: '/sweets',
        method: 'POST',
        body: sweetData,
      }),
      invalidatesTags: ['Sweet'],
    }),

    updateSweet: builder.mutation({
      query: ({ id, ...sweetData }) => ({
        url: `/sweets/${id}`,
        method: 'PUT',
        body: sweetData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Sweet', id }, 'Sweet'],
    }),

    deleteSweet: builder.mutation({
      query: (id) => ({
        url: `/sweets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sweet'],
    }),

    getSweetStats: builder.query({
      query: () => '/sweets/admin/stats',
      providesTags: ['Sweet'],
    }),
  }),
})

export const {
  // Authentication hooks
  useRegisterMutation,
  useLoginMutation,
  useGoogleAuthMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useRefreshTokenMutation,
  
  // Profile hooks
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,

  // Sweet hooks
  useGetAllSweetsQuery,
  useGetSweetByIdQuery,
  useSearchSweetsQuery,
  useGetSweetsByCategoryQuery,
  useGetFeaturedSweetsQuery,
  useGetDiscountedSweetsQuery,
  useGetSweetCategoriesQuery,
  useAddSweetReviewMutation,
  useCreateSweetByUserMutation,

  // Admin hooks
  useLoginAdminMutation,
  useRegisterAdminMutation,
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useLogoutAdminMutation,
  useGetAllAdminsQuery,

  // Admin sweet management hooks
  useCreateSweetMutation,
  useUpdateSweetMutation,
  useDeleteSweetMutation,
  useGetSweetStatsQuery,
} = apiSlice
