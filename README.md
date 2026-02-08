# Snugglr Backend - Modular Monolithic Architecture

A well-structured Node.js backend built with Express, TypeScript, and MongoDB following modular monolithic architecture principles.

## Architecture Overview

```
server/
├── src/
│   ├── config/                  # Centralized Configuration
│   │   ├── db.ts                # Database connection
│   │   ├── env.ts               # Environment variables
│   │   └── swagger.ts           # API documentation
│   │
│   ├── core/                    # Shared Kernel
│   │   ├── errors/              # Custom error classes
│   │   ├── middleware/          # Global middleware
│   │   ├── utils/               # Shared utilities
│   │   └── types/               # Global type definitions
│   │
│   ├── modules/                 # Feature Modules
│   │   ├── admin/               # Admin management
│   │   ├── auth/                # Authentication
│   │   ├── chat/                # Messaging & chat rooms
│   │   ├── matching/            # Matchmaking system
│   │   ├── social/              # Confessions & social feed
│   │   └── user/                # User profiles
│   │
│   ├── app.ts                   # Express app setup
│   └── index.ts                 # Entry point
│
├── .env
├── package.json
└── tsconfig.json
```

## Module Structure

Each module follows a consistent structure:

```
module/
├── module.controller.ts         # Request handlers
├── module.service.ts            # Business logic
├── module.routes.ts             # Route definitions
├── dtos/                        # Validation schemas (optional)
└── models/                      # Database models
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the server root:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/snugglr
JWT_SECRET=your-secret-key
JWT_EXPIRY=21d
CLIENT_URL=http://localhost:5173
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## API Documentation

Swagger documentation is available at `/api-docs` when the server is running.

## Modules

### Auth Module

- User registration with college email verification
- Login with email or phone number
- JWT-based authentication

### User Module

- Profile management
- Settings & preferences
- Notifications

### Chat Module

- Personal and group chats
- Anonymous messaging
- Real-time message delivery

### Matching Module

- Mood-based matchmaking
- Match pool management
- Temporary match sessions

### Social Module

- Confessions feed
- Comments & replies
- Like system

### Admin Module

- User management
- Domain/institution management
- Chat & match moderation
- Analytics & statistics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

## Code Style

- Minimal comments (self-documenting code)
- Service layer for business logic
- Controller layer for HTTP handling
- Repository pattern via Mongoose models
