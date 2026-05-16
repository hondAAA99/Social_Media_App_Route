# Contributing to Saraha Frontend

Thank you for contributing! Please follow these guidelines to maintain code quality.

## Code Standards

### TypeScript

```typescript
// ✅ Good: explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = (id: string): Promise<User> => {
  // implementation
};

// ❌ Bad: using any
const getUser = (id: any): any => {
  // implementation
};
```

### React Components

```typescript
// ✅ Good: proper typing and structure
interface ProfileProps {
  userId: string
  onClose: () => void
}

const Profile: React.FC<ProfileProps> = ({ userId, onClose }) => {
  return <div>...</div>
}

// ❌ Bad: missing types
const Profile = ({ userId, onClose }) => {
  return <div>...</div>
}
```

### Error Handling

```typescript
// ✅ Good: proper error handling
try {
  const data = await apiClient.post("/endpoint", payload);
  addToast("Success!", "success");
} catch (error: any) {
  const message = error.response?.data?.message || "Failed";
  addToast(message, "error");
}

// ❌ Bad: no error handling
const data = await apiClient.post("/endpoint", payload);
```

## File Naming

- **Components**: `PascalCase.tsx` → `UserProfile.tsx`
- **Pages**: `PascalCase.tsx` → `LoginPage.tsx`
- **Utilities**: `camelCase.ts` → `validation.ts`
- **Types**: `index.ts` → `types/index.ts`
- **Hooks**: `useCamelCase.ts` → `useAuth.ts`

## Component Structure

```typescript
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Button from '@components/common/Button'
import { loginSchema } from '@utils/validation'

interface Props {
  onSuccess?: () => void
}

const LoginPage: React.FC<Props> = ({ onSuccess }) => {
  // Hooks at top
  const navigate = useNavigate()
  const { login } = useAuth()

  // State and logic
  const [email, setEmail] = React.useState('')

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // implementation
  }

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

export default LoginPage
```

## Commit Messages

Follow conventional commits:

```
feat: add user authentication
fix: resolve login redirect issue
docs: update README
style: format code with prettier
refactor: simplify auth logic
test: add login tests
chore: update dependencies
```

Format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Pull Request Process

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make commits**
   - Keep commits small and focused
   - Write descriptive messages

3. **Push and create PR**

   ```bash
   git push origin feature/your-feature
   ```

4. **PR Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   How was this tested?

   ## Checklist

   - [ ] Code follows style guidelines
   - [ ] Changes are tested
   - [ ] Documentation updated
   - [ ] No console errors/warnings
   ```

## Performance Tips

### Avoid Unnecessary Re-renders

```typescript
// ✅ Good: memoize components
const UserCard = React.memo(({ user }: Props) => {
  return <div>{user.name}</div>
})

// ✅ Good: useCallback for handlers
const handleClick = useCallback(() => {
  doSomething()
}, [])

// ❌ Bad: inline function
<Button onClick={() => doSomething()} />
```

### Code Splitting

```typescript
// ✅ Good: lazy load heavy components
const Dashboard = React.lazy(() => import('@pages/Dashboard/Home'))

// In routes:
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

## Security Practices

### Input Validation

```typescript
// ✅ Always validate and sanitize
import { sendMessageSchema } from "@utils/validation";

const { content, attachments } = sendMessageSchema.parse(data);

// ❌ Never trust user input
const message = userInput;
```

### API Security

```typescript
// ✅ Use environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ❌ Don't hardcode secrets
const API_BASE_URL = "https://api.example.com";
```

### XSS Prevention

```typescript
// ✅ React auto-escapes by default
<div>{userInput}</div>

// ✅ Use DOMPurify for HTML
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />

// ❌ Never use dangerouslySetInnerHTML without sanitizing
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

## Testing Guidelines

### Write Tests For:

- API integration
- Complex business logic
- Form validation
- Error scenarios
- Security-sensitive code

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '@pages/Auth/Login'

describe('LoginPage', () => {
  it('displays validation error for invalid email', async () => {
    render(<LoginPage />)

    const input = screen.getByPlaceholderText(/email/i)
    fireEvent.change(input, { target: { value: 'invalid' } })

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })
})
```

## Documentation

### Add Comments For:

- Complex algorithms
- Non-obvious logic
- Security decisions
- Performance implications

### Component Documentation

```typescript
/**
 * User profile card component
 * @param userId - The ID of the user to display
 * @param onClose - Callback when card is closed
 * @returns Profile card component
 */
const UserCard: React.FC<{ userId: string; onClose: () => void }> = ({
  userId,
  onClose,
}) => {
  // implementation
};
```

## Code Review Checklist

Reviewers should check:

- [ ] Code follows style guidelines
- [ ] Types are properly defined
- [ ] Error handling is present
- [ ] Security best practices followed
- [ ] No console errors/warnings
- [ ] Performance optimized
- [ ] Tests written and passing
- [ ] Documentation updated

## Running Tests Before Commit

```bash
# Run linting
npm run lint

# Run tests
npm run test

# Run build
npm run build

# Only commit if all pass!
```

## Common Mistakes to Avoid

1. **Missing error handling**

   ```typescript
   // ❌ Bad
   const data = await apiClient.get("/endpoint");

   // ✅ Good
   try {
     const data = await apiClient.get("/endpoint");
   } catch (error) {
     addToast("Failed to load", "error");
   }
   ```

2. **Not validating user input**

   ```typescript
   // ❌ Bad
   const { email, password } = formData;

   // ✅ Good
   const { email, password } = loginSchema.parse(formData);
   ```

3. **Hardcoding strings**

   ```typescript
   // ❌ Bad
   if (status === "pending") {
   }

   // ✅ Good
   const STATUS = { PENDING: "pending" } as const;
   if (status === STATUS.PENDING) {
   }
   ```

4. **Not using TypeScript advantages**

   ```typescript
   // ❌ Bad
   const user = {} as any;

   // ✅ Good
   const user: IUser = { id: "", name: "", email: "" };
   ```

## Questions?

- Check existing documentation
- Look at similar implementations
- Ask in PR comments
- Create an issue for discussion

---

**Thanks for contributing! 🎉**
