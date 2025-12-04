<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Identity Preserver

An AI-powered application that helps preserve and maintain your unique communication identity across different platforms and contexts.

## Features

- 🔐 **Secure Authentication** - Email/password and OAuth (Google, GitHub) via Supabase
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔒 **Protected Routes** - Automatic authentication checks for secure pages
- 📊 **Dashboard** - Track and analyze your identity patterns
- ✨ **Identity Transformation** - AI-powered identity preservation tools

## Run Locally

**Prerequisites:** Node.js 16+ and npm

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Authentication

This app uses Supabase for authentication. You'll need to:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy `.env.local.example` to `.env.local`
4. Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

📖 **For detailed setup instructions**, see [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Features

- ✅ Email/Password signup and login
- ✅ OAuth with Google and GitHub
- ✅ Password reset functionality
- ✅ Session management
- ✅ Protected routes
- ✅ User profile management

## Project Structure

```
identity-preserver/
├── app/                    # Next.js app directory
├── components/             # Reusable UI components
├── contexts/              # React contexts (Auth, etc.)
├── docs/                  # Project documentation
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries (Supabase client)
├── pages/                 # Application pages
└── App.tsx                # Main app component
```

## Tech Stack

- **Framework**: Next.js 16
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **Charts**: Recharts
- **Language**: TypeScript

## Development

To build for production:

```bash
npm run build
npm start
```

## Documentation

Comprehensive documentation is available in the [`/docs`](./docs) folder:

- **[System Architecture](./docs/SYSTEM_ARCHITECTURE.md)** - Complete system architecture documentation
- **[Authentication Architecture](./docs/AUTH_ARCHITECTURE.md)** - Authentication flow and implementation
- **[Supabase Setup Guide](./docs/SUPABASE_SETUP.md)** - Detailed authentication setup

## Support

For authentication setup issues, see [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)

## License

MIT
