import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../config/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { PasswordInput } from "../components/ui/password-input";
import { useToast } from "../hooks/use-toast";
import { useLoginMutation, useGoogleAuthMutation } from "../features/api/apiSlice";
import { setCredentials } from "../features/auth/authSlice";
import logo from "../assets/favicon.svg";
const schema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
    mode: "onChange",
  });

  const isValid = form.formState.isValid;

  // Show success messages for password reset or email verification
  useEffect(() => {
    const passwordReset = searchParams.get('passwordReset');
    const emailVerified = searchParams.get('emailVerified');
    
    if (passwordReset === 'true') {
      toast({
        title: "Password Reset Complete",
        description: "Your password has been successfully reset. You can now sign in with your new password.",
      });
      // Clear the parameter after showing the toast
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('passwordReset');
      navigate(`/login?${newSearchParams.toString()}`, { replace: true });
    }
    
    if (emailVerified === 'true') {
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified. You can now sign in to your account.",
      });
      // Clear the parameter after showing the toast
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('emailVerified');
      navigate(`/login?${newSearchParams.toString()}`, { replace: true });
    }
  }, [searchParams, toast, navigate]);

  async function onSubmit(values) {
    try {
      const result = await login(values).unwrap();
      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.token,
        refreshToken: result.data.refreshToken,
      }));
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in",
      });
      
      // Check if user profile is complete
      if (!result.data.user.isProfileComplete) {
        // Redirect to onboarding if profile is incomplete
        navigate("/onboarding");
      } else {
        // Redirect to dashboard if profile is complete
        navigate("/dashboard");
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = "Invalid credentials";
      
      if (err.data && err.data.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 401) {
        errorMessage = "Invalid email/username or password";
      } else if (err.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }
  
  // Dummy handlers for social sign-in
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Send user info to your backend for authentication
      const response = await googleAuth({
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
      }).unwrap();

      dispatch(setCredentials({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      }));
      toast({
        title: "Google Sign-In Successful",
        description: `Welcome, ${response.data.user.displayName || response.data.user.email}`,
      });
      
      // Check if profile is complete to decide where to redirect
      if (response.data.user.isProfileComplete) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      toast({
        title: "Google Sign-In Failed",
        description: error.data?.message || error.message || "Failed to authenticate with Google",
        variant: "destructive"
      });
    }
  };

  return (
 <div
  className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
  style={{
    background: `
      radial-gradient(ellipse at 20% 80%, rgba(40, 40, 80, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(30, 60, 120, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, #050505 0%, #0a0a15 25%, #101020 50%, #0a0a15 75%, #000 100%),
      radial-gradient(circle at 70% 30%, rgba(50, 80, 140, 0.08) 0%, transparent 60%),
      radial-gradient(circle at 30% 70%, rgba(80, 120, 200, 0.05) 0%, transparent 60%)
    `,
    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 200% 200%, 200% 200%',
    animation: 'gradientShift 20s ease-in-out infinite'
  }}
>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-left flex flex-row mb-8 gap-3 items-center">
          <img src={logo}  alt="SweetShop Logo" />
          <h1 className="text-white text-xl font-semibold font-sans">SweetShop</h1>

        </div>

        {/* Login Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h2>
            <p className="text-gray-400 text-sm">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Email or Username"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormControl>
                      <PasswordInput
                        placeholder="Password"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              {/* Forgot Password */}
              <div className="text-right mb-6">
                <Link to="/forgot-password" className="text-gray-400 text-sm hover:text-gray-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              {/* Sign Up Link */}
              <div className="text-center mt-6">
                <span className="text-gray-400 text-sm">Need an account? </span>
                <Link to="/signup" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                  Sign up
                </Link>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-gray-500 text-xs uppercase tracking-wider">
                  OR CONTINUE WITH
                </span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full bg-gray-800 border border-gray-700 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-750 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isGoogleLoading ? "Signing in with Google..." : "Google"}
              </button>

              {/* Terms and Privacy */}
              <div className="text-center mt-6">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By signing in, you agree to our{' '}
                  <Link to="#" className="text-gray-400 hover:text-gray-300 transition-colors underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" className="text-gray-400 hover:text-gray-300 transition-colors underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}