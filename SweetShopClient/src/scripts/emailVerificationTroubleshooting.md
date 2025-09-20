# 📧 Email Verification Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. **Firebase Console Configuration**

You need to configure email verification in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tradeflow-1950a`
3. Go to **Authentication** → **Templates**
4. Click on **Email address verification**
5. **Enable** the template
6. Customize the email template if needed
7. Set the **Action URL** to: `http://localhost:5173/login`

### 2. **Authorized Domains**

Ensure your domain is authorized:

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `localhost`
   - `tradeflow-1950a.firebaseapp.com`
   - Your production domain (if any)

### 3. **SMTP Configuration**

Firebase might not have SMTP properly configured for your project. You may need to:

1. Go to **Authentication** → **Templates**
2. Check if **Custom SMTP** is configured
3. If not, Firebase will use their default SMTP (which sometimes has delays)

## 🔧 Testing Steps

### Step 1: Test Firebase Connection
Run this in browser console on your site:

```javascript
// Test Firebase Auth
import { auth } from '/src/config/firebase.js';
console.log('Firebase Auth Domain:', auth.app.options.authDomain);
console.log('Firebase Project ID:', auth.app.options.projectId);
```

### Step 2: Test Email Verification Manually
```javascript
// In browser console after signing up
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '/src/config/firebase.js';

if (auth.currentUser) {
  sendEmailVerification(auth.currentUser).then(() => {
    console.log('Email sent successfully');
  }).catch((error) => {
    console.error('Email failed:', error);
  });
}
```

### Step 3: Check Email Logs
1. Go to Firebase Console → **Authentication** → **Users**
2. Find your test user
3. Check if email verification is pending

## 🐛 Debug Information

When testing, check browser console for:
- ✅ "Email verification sent successfully"
- ❌ Any Firebase errors
- 🔍 Network tab for failed requests

## 🔀 Alternative: Skip Email Verification (for Testing)

If you want to test without email verification temporarily:

1. **Option A: Disable in Firebase**
   - Go to Firebase Console → Authentication → Sign-in method
   - Edit Email/Password provider
   - Disable "Require email verification"

2. **Option B: Auto-verify in code**
   ```javascript
   // In SignUpPage.jsx, after user creation
   if (import.meta.env.NODE_ENV === 'development') {
     // Skip email verification in development
     navigate("/login");
     return;
   }
   ```

## 📝 Common Error Codes

- `auth/operation-not-allowed`: Email verification not enabled in Firebase Console
- `auth/too-many-requests`: Rate limited, wait 15 minutes
- `auth/user-token-expired`: User session expired, need to sign up again
- `auth/invalid-continue-uri`: Action URL not properly configured

## 🚀 Production Setup

For production, you'll need to:

1. **Custom Domain**: Set up custom email sender domain
2. **Custom Templates**: Design branded email templates  
3. **SMTP Provider**: Consider using SendGrid, Mailgun, etc.
4. **Domain Verification**: Verify your production domain

## 📞 Next Steps

1. **Check Firebase Console** settings first
2. **Test with a real email** (not temporary/disposable)
3. **Check spam folder** in email
4. **Try different email provider** (Gmail, Outlook, etc.)
5. **Enable Firebase Debug Mode** in development

If emails still don't arrive after Firebase Console configuration, the issue might be:
- Firebase free tier limitations
- Email provider blocking Firebase emails
- Need to upgrade to paid Firebase plan