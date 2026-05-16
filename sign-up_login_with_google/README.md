# Saraha - Frontend

A secure, modern React frontend for the Saraha messaging platform. Built with React 18, TypeScript, Tailwind CSS, and modern security best practices.

## Features

### Authentication

- ✅ User registration with profile picture upload
- ✅ Email confirmation flow
- ✅ Secure login with JWT tokens
- ✅ Password reset via email
- ✅ Two-factor authentication (2FA)
- ✅ Automatic token refresh
- ✅ Secure session management

### User Profile

- ✅ View public profiles
- ✅ Edit profile information
- ✅ Upload/manage profile picture
- ✅ Upload/manage cover photos (up to 2)
- ✅ Profile privacy settings
- ✅ Account security status

### Messaging

- ✅ Send messages with file attachments
- ✅ View message history
- ✅ Delete messages
- ✅ File upload with progress indication
- ✅ Message pagination

### Security

- ✅ JWT authentication with refresh tokens
- ✅ httpOnly cookies for refresh tokens
- ✅ Access tokens stored in memory
- ✅ CORS configuration
- ✅ Content Security Policy (CSP) headers
- ✅ Input validation with Zod
- ✅ XSS prevention with DOMPurify
- ✅ CSRF protection via JWT

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query (TanStack Query)** - Server state
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Runtime validation
- **Lucide React** - Icons

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Steps

1. **Clone the repository**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env.development
   ```

   Update `.env.development` with your configuration:

   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_APP_ENV=development
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

## Available Scripts

```bash
# Development
npm run dev                 # Start dev server with hot reload
npm run build             # Build for production
npm run preview           # Preview production build locally
npm run lint              # Run ESLint
npm run test              # Run tests
npm run test:ui           # Run tests with UI
```

## Project Structure

```
src/
├── api/                      # API client and services
│   ├── axios.config.ts       # Axios instance with interceptors
│   ├── auth.api.ts           # Authentication endpoints
│   ├── user.api.ts           # User profile endpoints
│   └── message.api.ts        # Messaging endpoints
├── components/               # Reusable React components
│   ├── auth/                 # Auth-specific components
│   ├── common/               # Shared components
│   │   ├── LoadingSpinner
│   │   ├── ProtectedRoute
│   │   └── ...
│   └── layout/               # Layout components
│       ├── AuthLayout
│       ├── DashboardLayout
│       ├── Sidebar
│       └── Header
├── hooks/                    # Custom React hooks
│   └── useAuth.ts            # Auth state and methods
├── pages/                    # Page components
│   ├── Auth/                 # Authentication pages
│   │   ├── Login
│   │   ├── Signup
│   │   ├── ConfirmEmail
│   │   ├── ForgotPassword
│   │   ├── ResetPassword
│   │   └── TwoFactor
│   ├── Dashboard/            # Dashboard pages
│   │   ├── Home
│   │   ├── Profile
│   │   ├── EditProfile
│   │   └── Messages
│   ├── NotFound
│   └── Unauthorized
├── store/                    # Zustand state stores
│   └── authStore.ts          # Authentication state
├── types/                    # TypeScript type definitions
│   └── index.ts              # Type exports
├── utils/                    # Utility functions
│   └── validation.ts         # Validation schemas and helpers
├── styles/                   # Global styles
│   └── globals.css           # Tailwind setup
├── App.tsx                   # Main App component with routes
└── main.tsx                  # Entry point
```

## API Integration

The frontend communicates with the backend API at `http://localhost:5000`. The Axios client is configured with:

- **Automatic token refresh** - Handles 401 responses by refreshing tokens
- **Error handling** - Global error interceptors for consistent error handling
- **Request logging** - (Development only) Logs all API requests
- **CORS** - Configured for backend origin

### Key API Endpoints

#### Authentication

- `POST /users/signup` - Register new user
- `GET /users/confirm-sign-up` - Confirm email
- `GET /users/login` - Login
- `POST /users/signup/gmail` - Google OAuth login
- `GET /users/generate-access-token` - Refresh access token
- `DELETE /users/logout` - Logout

#### User Management

- `GET /users/getProfile` - Get current user profile
- `GET /users/share-profile/:userId` - Get shared profile
- `PATCH /users/update-user` - Update profile info
- `PATCH /users/updateProfilePicture` - Upload profile picture
- `PATCH /users/updateCoverPictures` - Upload cover photos

#### Messages

- `GET /message/` - Get all messages
- `POST /message/send-message` - Send new message
- `GET /message/get-message/:messageId` - Get specific message
- `DELETE /message/delete-message/:messageId` - Delete message

## Security Features

### Authentication Security

- JWT tokens with short expiration (15 minutes)
- Refresh tokens stored in secure httpOnly cookies
- Automatic token refresh on 401 responses
- Token rotation on login/logout

### Data Security

- Input validation on all forms (Zod schemas)
- XSS prevention with DOMPurify
- CSRF protection via JWT in Authorization header
- Secure password requirements (8+ chars, mixed case, numbers, special chars)

### Network Security

- CORS restricted to backend origin
- Content Security Policy (CSP) headers
- HTTPS enforced in production
- Secure cookie flags (Secure, SameSite)

### Code Security

- TypeScript for type safety
- ESLint with security rules
- No sensitive data in logs
- Error messages don't leak system info
- File upload validation (type + size)

## Environment Variables

| Variable                  | Description                          | Default                 |
| ------------------------- | ------------------------------------ | ----------------------- |
| `VITE_API_BASE_URL`       | Backend API base URL                 | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID`   | Google OAuth client ID               | -                       |
| `VITE_APP_ENV`            | Environment (development/production) | `development`           |
| `VITE_APP_NAME`           | App name for display                 | `Saraha`                |
| `VITE_ENABLE_2FA`         | Enable 2FA features                  | `true`                  |
| `VITE_ENABLE_GOOGLE_AUTH` | Enable Google OAuth                  | `true`                  |

## Error Handling

The application implements comprehensive error handling:

- **401 Unauthorized** - Automatically redirects to login after token refresh fails
- **403 Forbidden** - Shows unauthorized page
- **422 Validation** - Displays field-level error messages
- **5xx Server Errors** - Shows generic error with retry option
- **Network Errors** - Shows error toast with retry logic

## Performance Optimizations

- **Code Splitting** - Lazy load pages with React.lazy()
- **Memoization** - useMemo, useCallback for expensive computations
- **Image Optimization** - Cloudinary URLs for responsive images
- **Request Caching** - React Query cache strategy
- **Tree Shaking** - Remove unused code during build
- **Minification** - Terser for bundle optimization

## Testing

Tests are organized by component type:

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# With coverage
npm run test -- --coverage

# UI mode
npm run test:ui
```

## Deployment

### Production Build

```bash
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

### Environment Variables (Production)

Set these for production:

```env
VITE_API_BASE_URL=https://api.saraha.com
VITE_APP_ENV=production
```

### Deployment Platforms

Easily deploy to:

- **Vercel** - `vercel deploy`
- **Netlify** - `netlify deploy`
- **GitHub Pages** - Configure in vite.config.ts
- **Docker** - Create Dockerfile for containerization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port Already in Use

```bash
# Use a different port
npm run dev -- --port 3000
```

### CORS Errors

- Ensure backend is running on the correct URL
- Check `VITE_API_BASE_URL` in .env file
- Verify backend CORS configuration

### Token Refresh Issues

- Check that refresh token cookie is being set
- Verify backend token endpoint returns valid tokens
- Check browser cookie settings

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## License

ISC

## Support

For issues and support, please open an issue in the repository.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
