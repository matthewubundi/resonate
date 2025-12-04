# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Identity Preserver application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - Project name
   - Database password (save this securely)
   - Region (choose closest to your users)
4. Click "Create new project"

## Step 2: Get Your API Keys

1. Once your project is created, go to **Settings** → **API**
2. You'll find two important values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Configure Authentication Providers

### Email/Password Authentication (Already Enabled)

Email/password authentication is enabled by default in Supabase.

### OAuth Providers (Optional)

To enable Google and GitHub sign-in:

#### Google OAuth

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Find **Google** and click to configure
3. Follow the instructions to create OAuth credentials in Google Cloud Console
4. Add your Google Client ID and Secret
5. Add the callback URL: `https://your-project-id.supabase.co/auth/v1/callback`

#### GitHub OAuth

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Find **GitHub** and click to configure
3. Create a new OAuth App in GitHub Settings → Developer settings → OAuth Apps
4. Add your GitHub Client ID and Secret
5. Set the Authorization callback URL to: `https://your-project-id.supabase.co/auth/v1/callback`

## Step 5: Configure Email Templates (Optional)

Customize your authentication emails:

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Step 6: Set Up Row Level Security (RLS)

To secure your database, enable Row Level Security:

1. Go to **Database** → **Tables**
2. For each table, enable RLS
3. Create policies to control access

Example policy for a `profiles` table:
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

## Step 7: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the signup page and create a test account
3. Check your email for the confirmation link (if email confirmation is enabled)
4. Try logging in with your credentials

## Features Implemented

✅ **Email/Password Authentication**
- Sign up with email and password
- Sign in with email and password
- Password strength validation
- Email confirmation (configurable in Supabase)

✅ **OAuth Authentication**
- Google Sign-In
- GitHub Sign-In

✅ **Password Reset**
- Forgot password functionality
- Password reset email

✅ **Session Management**
- Automatic session refresh
- Persistent authentication state
- Secure token storage

✅ **Protected Routes**
- Automatic redirect to login for unauthenticated users
- Route protection for dashboard and other pages

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file has the correct values
- Ensure you're using the **anon/public** key, not the service role key
- Restart your development server after changing environment variables

### OAuth not working
- Verify your OAuth provider is enabled in Supabase
- Check that redirect URLs are correctly configured
- Ensure your OAuth app credentials are correct

### Email confirmation not received
- Check your spam folder
- Verify email settings in Supabase Authentication settings
- For development, you can disable email confirmation

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use Row Level Security** - Always enable RLS on your tables
3. **Validate on the server** - Don't trust client-side validation alone
4. **Use HTTPS in production** - Supabase requires HTTPS for OAuth
5. **Rotate keys regularly** - Update your API keys periodically

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues:
1. Check the [Supabase Discord](https://discord.supabase.com)
2. Review [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
3. Check the browser console for error messages
