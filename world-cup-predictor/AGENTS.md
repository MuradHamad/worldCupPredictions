# Agent Guidelines for World Cup Predictor

This document provides guidelines for AI agents working on this codebase.

## Project Overview

- **Framework**: Next.js 16.1.6 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + custom CSS variables
- **Database**: Prisma with SQLite (default)
- **Auth**: NextAuth.js with Google OAuth
- **Animations**: Framer Motion
- **Package Manager**: npm

## Build Commands

```bash
# Development
npm run dev              # Start development server (port 3000)

# Production
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma studio        # Open Prisma database GUI
```

## Code Style Guidelines

### General Principles

1. **Use TypeScript**: Always use TypeScript. Avoid `any` type.
2. **Client vs Server Components**: Use `"use client"` only when needed (hooks, browser APIs, interactive UI).
3. **Error Handling**: Always wrap async operations in try-catch. Return proper error responses in API routes.
4. **Environment Variables**: Never commit secrets. Use `.env.local` for local development.
5. **Use Context7 MCP**: Always use Context7 MCP when you need library/API documentation, code generation, setup or configuration steps. Do not guess or hallucinate APIs.

### Imports

- Use `@/` path alias for internal imports (e.g., `import { authOptions } from "@/lib/auth"`)
- Order imports: external libs → internal libs → components → utilities
- Group imports with blank lines between groups

```typescript
// External
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Internal
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Components
import DashboardCard from "@/components/DashboardCard";
```

### Naming Conventions

- **Files**: PascalCase for components (`LoginPage.tsx`), camelCase for utilities (`auth.ts`)
- **Components**: PascalCase (`LoginPage`, `RoomCard`)
- **Functions**: camelCase (`handleSubmit`, `fetchData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ROOM_SIZE`, `API_TIMEOUT`)
- **Interfaces/Types**: PascalCase with descriptive names (`RoomMember`, `UserPrediction`)

### Component Structure

```typescript
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  onSubmit: (data: Data) => void;
}

export default function ComponentName({ title, onSubmit }: Props) {
  const [state, setState] = useState<string>("");

  useEffect(() => {
    // Effect logic
  }, []);

  const handleAction = () => {
    // Handler logic
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### API Routes

- Use named exports for HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
- Always validate input before processing
- Return appropriate status codes:
  - `200` for success
  - `400` for bad request
  - `401` for unauthorized
  - `500` for server errors

```typescript
export async function POST(req: NextRequest) {
  try {
    // Validate auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    // Process
    const result = await prisma.room.create({ /* ... */ });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### CSS & Styling

- Use Tailwind utility classes as primary styling
- Define custom colors in `globals.css` CSS variables
- Use `font-display` class for headings (defined in globals.css)
- Avoid inline styles; use CSS classes

```tsx
// Good
<div className="flex items-center justify-between p-4 bg-card rounded-xl">

// Avoid
<div style={{ display: "flex", padding: "16px" }}>
```

### Database (Prisma)

- Use Prisma Client for all database operations
- Always handle potential null values from queries
- Use transactions for multi-step operations

```typescript
// Query with error handling
const room = await prisma.room.findUnique({ where: { id } });
if (!room) {
  return NextResponse.json({ error: "Room not found" }, { status: 404 });
}
```

### Authentication

- Use `getServerSession` for server-side auth checks
- Use `useSession` hook for client-side auth
- Protect all API routes with auth validation

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth routes
│   │   ├── rooms/         # Room API
│   │   └── predictions/   # Predictions API
│   ├── dashboard/         # Dashboard page
│   ├── groups/            # Groups predictions page
│   ├── login/             # Login page
│   └── rooms/             # Room management pages
├── components/            # Reusable components
├── lib/                   # Utilities (auth, prisma)
└── types/                 # TypeScript type definitions
```

## Common Patterns

### Loading States

```tsx
const [isLoading, setIsLoading] = useState(true);

// In JSX
{isLoading ? (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
  </div>
) : (
  <Content />
)}
```

### Form Handling

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    if (!res.ok) throw new Error("Failed");
    
    // Handle success
  } catch (err) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
};
```

### Conditional Classes

Use template literals for conditional classes:

```tsx
<div className={`base-class ${isActive ? "active-class" : ""} ${disabled ? "opacity-50" : ""}`}>
```

## Important Notes

1. **No Copyright/Trademark**: Do not use "World Cup", "FIFA", "2026 WC" in UI text. Use "Global Cup" instead.
2. **Font**: This project uses Barlow Condensed (loaded via Google Fonts).
3. **Colors**: Primary colors are defined in globals.css as CSS variables.
4. **Mobile First**: Design responsive layouts starting from mobile.
5. **Accessibility**: Use semantic HTML, proper ARIA labels, and keyboard navigation.

## Skill References

When working on frontend, reference:
- `.agents/skills/frontend-design/` - For design best practices
- `.agents/skills/vercel-react-best-practices/` - For React/Next.js optimization

## Testing

No test framework is currently configured. To add tests:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Then add to package.json:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```
