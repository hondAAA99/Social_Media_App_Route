# Saraha Frontend - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (comes with Node.js)
- Backend API running on `http://localhost:5000`

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env.development
```

Edit `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_APP_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

The app will automatically open at `http://localhost:5173`

---

## 🔧 Development

### Project Structure

```
src/
├── api/                    # API client services
├── components/             # Reusable React components
│   ├── auth/              # Authentication components
│   ├── common/            # Shared components (Toast, Modal, etc)
│   └── layout/            # Layout wrappers
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication logic
│   └── useCustomHooks.ts  # Utility hooks
├── pages/                 # Page components
│   ├── Auth/              # Login, signup, password reset
│   └── Dashboard/         # Main app pages
├── store/                 # Zustand state management
├── types/                 # TypeScript interfaces
├── utils/                 # Helper functions
└── styles/                # Global styles
```

### Code Standards

#### TypeScript

- Always use types/interfaces
- Avoid `any` type
- Use strict mode

#### Components

- Use functional components with hooks
- Name files with PascalCase
- Create reusable components
- Use proper prop typing

#### Styling

- Use Tailwind CSS classes
- Follow color palette from `tailwind.config.js`
- Use responsive design (mobile-first)

#### Error Handling

- Catch errors explicitly
- Show user-friendly messages via Toast
- Use Error Boundary for React errors
- Log errors in development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run test            # Run tests
npm run test:ui         # Run tests with UI
```

### Git Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make changes and commit**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/feature-name
   ```

---

## 🔐 Security Checklist

Before deploying to production, ensure:

- [ ] JWT tokens are in secure httpOnly cookies
- [ ] Environment variables don't contain secrets
- [ ] HTTPS is enforced
- [ ] CSP headers are configured
- [ ] Input validation is in place
- [ ] XSS prevention is active
- [ ] CORS is restricted to backend origin
- [ ] Rate limiting is enabled on backend
- [ ] Error messages don't leak system info
- [ ] Sensitive data isn't logged

---

## 📦 Building for Production

### 1. Production Build

```bash
npm run build
```

This creates an optimized `dist/` folder.

### 2. Environment Variables

Create `.env.production`:

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_ENV=production
```

### 3. Test Build Locally

```bash
npm run preview
```

---

## 🚢 Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

**Benefits:**

- Zero-config deployment
- Automatic HTTPS
- Edge caching
- Analytics included

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Benefits:**

- Simple deployment
- Automatic builds
- Form handling
- Edge functions

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build and run:

```bash
docker build -t saraha-frontend .
docker run -p 3000:3000 saraha-frontend
```

### Option 4: Traditional Server (Nginx)

1. Build the project:

   ```bash
   npm run build
   ```

2. Copy `dist/` folder to server:

   ```bash
   scp -r dist/ user@server:/var/www/saraha
   ```

3. Configure Nginx:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           root /var/www/saraha;
           try_files $uri $uri/ /index.html;
       }

       # API proxy
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. Enable HTTPS with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🧪 Testing

### Setup Testing

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Write Tests

Example test file (`Login.test.tsx`):

```typescript
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '@pages/Auth/Login'

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument()
  })
})
```

### Run Tests

```bash
npm run test                # Run all tests
npm run test -- --watch    # Watch mode
npm run test -- --coverage # Coverage report
```

---

## 🐛 Debugging

### Browser DevTools

1. Open Chrome DevTools (`F12`)
2. Check Console for errors
3. Use Network tab to inspect API calls
4. Use React DevTools extension

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathPrefix": "${webRoot}/"
    }
  ]
}
```

### Logging

```typescript
// Development only
if (import.meta.env.DEV) {
  console.log("Debug info:", data);
}
```

---

## 📊 Performance Monitoring

### Lighthouse

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit
4. Fix issues (target: 90+ score)

### Web Vitals

Monitor Core Web Vitals in production:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"

      - run: npm ci
      - run: npm run build
      - run: npm run test

      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
npm run dev -- --port 3000
```

### CORS Errors

Ensure backend CORS config matches:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Module Not Found

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear Vite cache
rm -rf .vite

# Rebuild
npm run build
```

### Blank Page After Deploy

- Check browser console for errors
- Verify API URL in .env
- Check Network tab for failed requests
- Ensure index.html is being served

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router](https://reactrouter.com/)
- [Zustand](https://github.com/pmndrs/zustand)

---

## 📞 Support

For issues or questions:

1. Check the README.md
2. Search existing GitHub issues
3. Create a new issue with details
4. Contact support team

---

**Happy coding! 🎉**
