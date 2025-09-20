import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from 'react-redux';
import { Button } from "../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { PasswordInput } from "../components/ui/password-input";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { useRegisterMutation, useGoogleAuthMutation } from "../features/api/apiSlice";
import { setCredentials } from "../features/auth/authSlice";
import logo from "../assets/favicon.svg";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, "Password must contain both letters and numbers"),
  confirmPassword: z.string(),
  agree: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms to continue" }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function SignUpForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();

  // Email verification state
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agree: false
    },
    mode: "onChange",
  });

  const isValid = form.formState.isValid;

  async function onSubmit(values) {
    try {
      // Email signup flow
      const firebaseResult = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = firebaseResult.user;

      // Configure action code settings for email verification
      const actionCodeSettings = {
        url: `${window.location.origin}/login?emailVerified=true`,
        handleCodeInApp: false,
      };

      // Send email verification with custom settings
      try {
        await sendEmailVerification(firebaseUser, actionCodeSettings);
        console.log('✅ Email verification sent successfully');
      } catch (emailError) {
        console.error('⚠️ Email verification failed:', emailError);
        // Continue with registration even if email fails
        toast({
          title: "Email verification failed",
          description: "Account created but verification email couldn't be sent. You can still use your account.",
          variant: "destructive"
        });
      }

      // Create user account in our backend
      const userData = {
        email: values.email,
        password: values.password,
        firebaseUid: firebaseUser.uid,
        // Profile is incomplete since role is not selected during signup
      };

      const result = await register(userData).unwrap();

      // Show email verification message
      setUserEmail(values.email);
      setIsEmailSent(true);

      toast({
        title: "Account created successfully!",
        description: "Please check your email and click the verification link to complete your registration.",
      });
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = "Something went wrong";

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      } else if (err.data && err.data.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 400) {
        errorMessage = "Invalid input data. Please check your information.";
      } else if (err.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }

  // Resend email verification
  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    try {
      if (auth.currentUser) {
        const actionCodeSettings = {
          url: `${window.location.origin}/login?emailVerified=true`,
          handleCodeInApp: false,
        };

        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        toast({
          title: "Verification email sent",
          description: "Please check your email for the verification link.",
        });
      } else {
        toast({
          title: "Session expired",
          description: "Please try signing up again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      let errorMessage = "Please try again later.";

      if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      } else if (error.code === 'auth/user-token-expired') {
        errorMessage = "Session expired. Please sign up again.";
      }

      toast({
        title: "Failed to resend email",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Google Sign-Up handler
  const handleGoogleSignUp = async () => {
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
        title: "Google Sign-Up Successful",
        description: `Welcome to SweetShop, ${response.data.user.displayName || response.data.user.email}!`,
      });

      // Check if profile is complete to decide where to redirect
      if (response.data.user.isProfileComplete) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      toast({
        title: "Google Sign-Up Failed",
        description: error.data?.message || error.message || "Failed to authenticate with Google",
        variant: "destructive"
      });
    }
  };

  // Show email verification screen if email was sent
  if (isEmailSent) {
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
          

          {/* Email Verification Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            {/* Email Icon */}
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Header */}
            <h2 className="text-2xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                Verify Your Email
              </span>
            </h2>

            <p className="text-gray-400 mb-6">
              We've sent a verification link to:
              <br />
              <span className="text-white font-medium">{userEmail}</span>
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                Please check your email and click the verification link to activate your account.
                You may need to check your spam folder.
              </p>
              {import.meta.env.NODE_ENV === 'development' && (
                <div className="mt-3 pt-3 border-t border-blue-500/20">
                  <p className="text-yellow-300 text-xs mb-2">
                    Development Mode: Skip email verification for testing
                  </p>
                  <button
                    onClick={() => {
                      toast({
                        title: "Email verification skipped",
                        description: "Proceeding to login for testing purposes",
                      });
                      navigate("/login");
                    }}
                    className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                  >
                    Skip Verification (Dev Only)
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={isResendingEmail}
                className="w-full bg-gray-800 border border-gray-700 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-750 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResendingEmail ? "Sending..." : "Resend Verification Email"}
              </button>

              <Link
                to="/login"
                className="block w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Go to Login
              </Link>

              <button
                onClick={() => {
                  setIsEmailSent(false);
                  setUserEmail('');
                }}
                className="w-full text-gray-400 hover:text-white transition-colors py-2"
              >
                Back to Registration
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try resending.
                <br />
                For help, contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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


        {/* SignUp Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                Create Account
              </span>
            </h2>
            <p className="text-gray-400 text-sm">Start shopping with SweetShop today</p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="mb-2">
                  <FormControl>
                    <PasswordInput
                      placeholder="Password"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      {...field}
                    />
                  </FormControl>
                  <p className="mt-1 text-xs text-gray-500">Use 8+ characters with letters and numbers.</p>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem className="mb-2">
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm Password"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />

              <FormField control={form.control} name="agree" render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="flex items-start gap-3 mb-6">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="text-sm text-gray-400">
                      I have read and agree to SweetShop's{" "}
                      <Link to="#" className="text-gray-300 hover:text-gray-100 transition-colors underline">Terms of Service</Link>{" "}
                      &{" "}
                      <Link to="#" className="text-gray-300 hover:text-gray-100 transition-colors underline">Privacy Policy</Link>.
                    </div>
                  </div>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Sign Up"}
              </button>

              {/* Sign In Link */}
              <div className="text-center mt-6">
                <span className="text-gray-400 text-sm">Already have an account? </span>
                <Link to="/login" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                  Log in
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

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                {isGoogleLoading ? "Signing up with Google..." : "Google"}
              </button>

              {/* Terms and Privacy */}
              <div className="text-center mt-6">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By signing up, you agree to our{' '}
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

export default function SignUpPage() {
  return <SignUpForm />;
}