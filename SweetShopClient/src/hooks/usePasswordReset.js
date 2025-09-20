import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useToast } from './use-toast';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { toast } = useToast();

  const sendPasswordReset = async (email) => {
    setIsLoading(true);
    try {
      // Configure action code settings for password reset
      const actionCodeSettings = {
        url: `${window.location.origin}/login?passwordReset=true`,
        handleCodeInApp: false,
      };

      // Send password reset email
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      setUserEmail(email);
      setIsEmailSent(true);
      
      toast({
        title: "Password reset email sent!",
        description: "Please check your email for instructions to reset your password.",
      });

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = "Something went wrong";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resendPasswordReset = async () => {
    if (!userEmail) return { success: false, error: "No email address available" };
    
    return await sendPasswordReset(userEmail);
  };

  const resetForm = () => {
    setIsEmailSent(false);
    setUserEmail('');
    setIsLoading(false);
  };

  return {
    isLoading,
    isEmailSent,
    userEmail,
    sendPasswordReset,
    resendPasswordReset,
    resetForm,
  };
};