# Google Authentication Setup Guide

This guide explains how to enable Google OAuth authentication for the Finance Tracker application.

## Prerequisites

1. A Supabase project (already configured in `.env.local`)
2. A Google Cloud Platform account
3. Access to the Supabase dashboard

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode
6. Create the OAuth client ID:
   - Application type: **Web application**
   - Name: `Finance Tracker` (or your preferred name)
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://your-production-domain.com` (production)
   - Authorized redirect URIs:
     - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
7. Save and copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list of providers
5. Toggle **Enable Sign in with Google**
6. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Step 1
   - **Client Secret**: Paste from Step 1
7. Click **Save**

## Step 3: Configure Redirect URLs

Ensure your Supabase project has the correct redirect URLs configured:

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Add the following to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-production-domain.com/auth/callback` (production)

## Step 4: Verify Configuration

1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's sign-in page
5. After signing in, you should be redirected back to the dashboard

## Troubleshooting

### "Unsupported provider: provider is not enabled"

This error occurs when Google OAuth is not enabled in Supabase. Follow Step 2 to enable it.

### "redirect_uri_mismatch"

This error occurs when the redirect URI doesn't match what's configured in Google Cloud Console. Ensure:
- The Supabase callback URL is added to Google's authorized redirect URIs
- The format is exactly: `https://<project-ref>.supabase.co/auth/v1/callback`

### "access_denied"

This can occur when:
- The user cancelled the sign-in process
- The app is in testing mode and the user is not added as a test user
- Required scopes are not properly configured

### Google Sign-In Button Disabled

If the button shows "Google Sign-In Unavailable", the application detected that Google OAuth is not properly configured. Check the Supabase provider settings.

## Production Checklist

Before going to production:

- [ ] Move Google OAuth app from testing to production status
- [ ] Update authorized origins with production domain
- [ ] Update redirect URIs with production callback URL
- [ ] Verify OAuth consent screen information is accurate
- [ ] Consider enabling Google's security features (app verification if needed)

## Security Considerations

1. **Never expose** your Client Secret in frontend code
2. **Always use HTTPS** in production for OAuth callbacks
3. **Regularly rotate** your OAuth credentials
4. **Monitor** your Google Cloud Console for unauthorized access
5. **Review** the OAuth consent screen permissions periodically

## Environment Variables

The following environment variables are required (already configured):

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Note: Google OAuth credentials are stored in Supabase, not in environment variables, which is the recommended secure approach.
