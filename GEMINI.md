# GEMINI.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a car-sharing application built with React Router v7 (formerly Remix) using TypeScript and Effect-TS for functional programming patterns. The application features trip management, invoice tracking, calendar views, and an AI chat interface.

## Development Commands

### Core Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Code Quality

- `pnpm typecheck` - Run TypeScript compiler and generate types
- `pnpm lint` - Run ESLint
- `pnpm effectLint` - Run Effect-TS specific linting
- `pnpm check` - Run all quality checks (typecheck + lint + effectLint)
- `pnpm knip` - Check for unused dependencies and exports

### Formatting

- `dprint fmt` - Format code using dprint (configured for TypeScript, JSON, Markdown, TOML)

## Architecture

### Core Technologies

- **React Router v7** (formerly Remix) for SSR framework
- **Effect-TS** for functional programming and error handling
- **TypeScript** with strict configuration
- **Tailwind CSS** for styling
- **Radix UI** for accessible component primitives
- **pnpm** for package management

### Project Structure

- `app/routes/` - Route components (dashboard, calendar, invoices, ia, login)
- `app/components/` - Reusable UI components organized by feature
- `app/services/` - Business logic services (auth, trip, invoice, ia)
- `app/runtime/` - Effect-TS runtime configuration and server setup
- `app/lib/` - Data models and utilities
- `app/types/` - TypeScript type definitions

### Effect-TS Architecture
The application uses Effect-TS for:

- **Dependency Injection** via Layers (see `app/runtime/Runtime.ts`)
- **Error Handling** with structured error types
- **HTTP Client** abstraction
- **Session Management** with cookie-based authentication
- **Service Layer** pattern for business logic

Key Effect layers:

- `AuthLayer` - Authentication service
- `TripLayer` - Trip management
- `InvoiceLayer` - Invoice management  
- `IALayer` - AI chat functionality
- `HttpLayer` - HTTP client configuration

### Authentication

- Cookie-based session storage via `CookieSessionStorage`
- Authentication required for most routes except `/login` and `/health`
- Logout functionality integrated in root layout

### Special Features

- **Multi-domain support** - Different behavior for `ia.ilieff.fr` subdomain
- **AI Chat Interface** - Integrated AI functionality with streaming responses
- **Calendar Integration** - Trip booking and visualization
- **Invoice Management** - Full CRUD operations with table interface

## Code Style & Standards

### TypeScript Configuration

- Strict mode enabled
- Path aliases: `~/*` maps to `./app/*`
- Effect-TS language service plugin enabled
- Verbatim module syntax for better import/export handling

### ESLint Rules

- Effect-TS specific rules enabled
- Consistent type imports required (`@typescript-eslint/consistent-type-imports`)
- No console statements allowed in production code
- Arrow functions prefer no parentheses when possible
- Object shorthand syntax enforced

### Formatting Standards (dprint)

- Single quotes for TypeScript, double quotes for JSX
- No semicolons (ASI)
- 2-space indentation
- 100 character line width
- Trailing commas for type parameters only

### Effect-TS Conventions

- Use generators (`T.gen`) for Effect composition
- Structured error handling with tagged unions
- Layer-based dependency injection
- Prefer `pipe` for transformation chains
- Log operations use structured logging levels

## Testing & Quality Assurance

- ALWAYS ALWAYS Run `pnpm check` before commits to ensure code quality
- Effect linting catches Effect-TS specific issues
- TypeScript strict mode prevents runtime errors
- Husky pre-commit hooks ensure code standards

## Environment Requirements

- Node.js >= 22
- pnpm 10.13.1
- Volta configuration available for version management
