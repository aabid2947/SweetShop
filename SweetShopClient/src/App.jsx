import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth, updateUser } from './features/auth/authSlice';
import { useGetProfileQuery } from './features/api/apiSlice';
import AppRoutes from "./routes/index.jsx"; 

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  
  // Fetch fresh user profile data if authenticated
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !user,
    refetchOnMountOrArgChange: true
  });

  useEffect(() => {
    // Initialize auth state from localStorage on app startup
    dispatch(initializeAuth());
  }, [dispatch]);

  // Update user data when fresh profile data is received
  useEffect(() => {
    if (profileData?.data?.user && isAuthenticated) {
      dispatch(updateUser(profileData.data.user));
    }
  }, [profileData, isAuthenticated, dispatch]);

  return <AppRoutes />;
}

export default App;