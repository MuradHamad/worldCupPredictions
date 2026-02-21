# World Cup Predictor 2026 - Technical Documentation

## Overview
A full-stack Next.js web application for predicting FIFA World Cup 2026 tournament results, allowing users to compete with friends in private prediction rooms.

---

## Frontend

### Framework & Libraries
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.3** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion 12.34.0** - Animation library for smooth transitions

### Key Features
- Responsive design with mobile-first approach
- WC 2026 themed gradient colors (teal/green palette)
- Animated UI components with Framer Motion
- Custom scrollbar styling
- Mobile-responsive layouts

### Styling
- Custom CSS variables for theming
- Gradient backgrounds (`.wc-gradient`, `.wc-gradient-subtle`)
- WC 2026 color palette: Teal (#0d9488), Green (#10b981), Light Green (#34d399)

---

## Backend

### API Architecture
- **Next.js API Routes** - Serverless API endpoints
- **RESTful patterns** - Standard HTTP methods (GET, POST)

### Implemented Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rooms` | POST | Create a new room |
| `/api/rooms/join` | POST | Join existing room |
| `/api/auth/[...nextauth]` | * | NextAuth.js handlers |

---

## Authentication

### Provider
- **Google OAuth** via NextAuth.js

### Configuration
- JWT session strategy
- Protected routes with `getServerSession`
- Custom login page at `/login`
- Session includes user ID for database operations

### Environment Variables
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_URL
NEXTAUTH_SECRET
```

---

## Database

### ORM
- **Prisma** with SQLite provider

### Schema Models

| Model | Description |
|-------|-------------|
| `User` | Registered users with OAuth |
| `Account` | OAuth provider accounts |
| `Session` | User sessions |
| `Room` | Prediction rooms with unique codes |
| `RoomMember` | Room participation with scores |
| `Team` | World Cup teams with group assignments |
| `Prediction` | User predictions for groups/knockouts |

### Database File
- SQLite: `dev.db` (file-based)

---

## Security

### Measures
- JWT tokens for session management
- Environment variables for secrets (`.env` file)
- Server-side session validation on all protected routes
- Input validation on API endpoints
- CORS protection via Next.js defaults
- Prisma parameterized queries (SQL injection safe)

### Secrets Management
- `NEXTAUTH_SECRET` - Session encryption key
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- Never committed to version control

---

## Deployment

### Recommended Platform
- **Vercel** - Native Next.js deployment

### Build Configuration
- Next.js config in `next.config.ts`
- TypeScript with strict mode
- ESLint for code quality

### Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

### Production Considerations
- Replace SQLite with PostgreSQL for production
- Set proper `NEXTAUTH_URL` (production URL)
- Generate new `NEXTAUTH_SECRET`
- Configure Google OAuth credentials for production

---

## Project Structure

```
world-cup-predictor/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # NextAuth handlers
│   │   │   └── rooms/     # Room endpoints
│   │   ├── login/         # Login screen
│   │   ├── rooms/         # Room management screens
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Root redirect
│   │   └── globals.css    # Global styles
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   └── prisma.ts      # Prisma client
│   └── types/
│       └── next-auth.d.ts # TypeScript types
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## Screen Flow

1. **Login** (`/login`) - Google OAuth sign-in
2. **Rooms** (`/rooms`) - Create or join room choice
3. **Create Room** (`/rooms/create`) - Form to create room
4. **Join Room** (`/rooms/join`) - Enter room code
5. **Dashboard** (`/dashboard`) - User predictions & leaderboard
6. **Group Stage** (`/groups`) - Predict group rankings
7. **Summary** (`/summary`) - Review predictions
8. **Knockouts** (`/knockouts`) - Predict knockout rounds
