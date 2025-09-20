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
  tagTypes: ['User', 'Profile'],
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
} = apiSlice
