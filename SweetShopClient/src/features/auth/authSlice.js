import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

// Async thunk for logout that clears API cache
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // Reset API cache
    dispatch(apiSlice.util.resetApiState());
    
    return null;
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Helper function to safely parse stored user data
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem('user');
    return null;
  }
};

// Update initial state to include stored user
const enhancedInitialState = {
  ...initialState,
  user: getStoredUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState: enhancedInitialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload
      state.user = user
      state.token = token
      state.refreshToken = refreshToken
      state.isAuthenticated = true
      state.error = null
      state.isLoading = false
      
      // Persist to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
    },
    
    logout: (state, action) => {
      console.log('Logging out user:', state.user);
      
      // Get the dispatch function if provided
      const { dispatch } = action.payload || {};
      
      // Clear auth state
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      state.isLoading = false
      
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Reset API cache if dispatch is available
      if (dispatch) {
        dispatch(apiSlice.util.resetApiState());
      }
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        // Update localStorage with the new user data
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    
    updateTokens: (state, action) => {
      const { token, refreshToken } = action.payload
      if (token) {
        state.token = token
        localStorage.setItem('token', token)
      }
      if (refreshToken) {
        state.refreshToken = refreshToken
        localStorage.setItem('refreshToken', refreshToken)
      }
    },

    // Initialize auth state from localStorage (for app startup)
    initializeAuth: (state) => {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      const user = getStoredUser()

      if (token && user) {
        state.token = token
        state.refreshToken = refreshToken
        state.user = user
        state.isAuthenticated = true
      } else {
        // Clear inconsistent state
        state.token = null
        state.refreshToken = null
        state.user = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('Logging out user:', state.user);
        // Clear auth state
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
        state.isLoading = false
      })
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
  setError,
  clearError,
  updateUser,
  updateTokens,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsProfileComplete = (state) => {
  // If user is not authenticated, return false
  if (!state.auth.isAuthenticated || !state.auth.user) {
    return false;
  }
  
  // Return the actual isProfileComplete value from user object
  return state.auth.user?.isProfileComplete ?? false;
};
