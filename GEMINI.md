# GEMINI Context: Car-Sharing Frontend

This document provides a comprehensive overview of the car-sharing frontend application, its architecture, and development conventions to guide future interactions and development.

## 1. Project Overview

This is a sophisticated full-stack TypeScript web application for a car-sharing service, built with a modern, functional-first approach.

- **Core Framework**: [React Router v7 (Remix)](https://reactrouter.com/) for server-side rendering (SSR), routing, and data loading.
- **Build Tool**: [Vite](https://vitejs.dev/) for fast development and bundling.
- **Language**: [TypeScript](https://www.typescriptlang.org/).
- **Package Manager**: [pnpm](https://pnpm.io/).
- **State & Logic Management**: [Effect-TS](https://effect.website/) is the foundational library for all business logic, side effects, and dependency injection.

## 2. Core Architecture & Concepts

### Effect-TS Integration

The application is architected around the Effect-TS ecosystem, which provides type-safe, composable, and testable logic.

- **Business Logic**: Route `loader` (data fetching) and `action` (mutations) functions are Effect programs wrapped in custom helpers found in `app/runtime/Remix.ts`.
- **Dependency Injection**: Uses Effect's `Layer` and `Tag` system. The `AppLayer` in `app/runtime/Runtime.ts` assembles all services (Auth, Trip, Car, Invoice, Maintenance, etc.).
- **Error Handling**: Uses a functional approach with custom error types (e.g., `Unexpected`, `NotFound`, `NotAuthenticated`) defined in `app/runtime/ServerResponse.ts` and `app/runtime/errors/`.
- **API Communication**: Services use `@effect/platform/HttpClient` for robust, type-safe HTTP requests.

**Key Directory: `app/services/`**
Contains the heart of the business logic. Each service is defined as an Effect `Service` and has a corresponding `Layer` for injection.

### File-Based Routing (React Router v7)

The application uses the standard file-based routing of React Router v7 (Remix).

- **`app/routes/`**: Each route file exports a `loader`, an `action` (using `Remix.loader` and `Remix.action`), and a default React component.
- **`app/root.tsx`**: The root layout and entry point for the application.

### AI Integration

The application integrates with local language models (Ollama) and the Vercel AI SDK.
- **`app/services/ia.ts`**: Service for AI-related operations.
- **`app/components/ia/`**: UI components for AI interaction (Chat, Select, etc.).

## 3. Development Workflow

### Key Commands

- **Install dependencies**: `pnpm install`
- **Development mode**: `pnpm dev` (starts on http://localhost:3000)
- **Production build**: `pnpm build`
- **Production start**: `pnpm start`
- **Code quality check**: `pnpm check` (runs type-checking, linting, and `effect-language-service` checks)

### Coding Standards

- **Functional Programming**: Prefer pure functions and Effect programs over imperative code.
- **Type Safety**: Use TypeScript strictly. Use Effect Schema where appropriate for data validation.
- **UI Components**: Follow [shadcn/ui](https://ui.shadcn.com/) patterns. Components are in `app/components/ui/`.
- **Styling**: Use utility-first Tailwind CSS classes.
- **Icons**: Use `lucide-react`.

## 4. Key Directory Structure

```text
/app
├── components/         # React components (UI, features, layout).
│   └── ui/             # shadcn-ui base components.
├── lib/                # Core libraries and data models.
├── routes/             # Application routes (loader/action + components).
├── runtime/            # Effect-Remix integration and core runtime setup.
│   └── errors/         # Custom error definitions.
├── services/           # Effect Services for business logic (API, Auth, etc.).
├── types/              # TypeScript types and Effect Schemas.
├── entry.client.tsx    # Client-side entry point.
├── entry.server.tsx    # Server-side entry point.
└── root.tsx            # Root application layout.
```

## 5. Summary for AI Assistants

When working on this project:
1.  **Always look for an Effect Service first** when you need to fetch data or perform actions.
2.  **Respect the `Remix.loader` and `Remix.action` wrappers**; they are essential for the Effect runtime to function correctly within React Router.
3.  **Check `app/runtime/Runtime.ts`** to see which services are available in the `AppLayer`.
4.  **Use functional error handling**; do not throw errors unless absolutely necessary. Use `T.fail` with tagged errors.
5.  **Follow the established UI pattern** using Tailwind and shadcn/ui components for a consistent look and feel.
