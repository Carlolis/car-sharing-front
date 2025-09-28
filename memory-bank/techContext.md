# Technical Context

## Development Environment
- Operating System: Linux 6.16
- IDE: VSCode
- Default Shell: zsh
- Package Manager: pnpm (based on pnpm-lock.yaml)

## Core Technologies
- **Framework**: Remix
- **Language**: TypeScript
- **Effect-TS** for functional programming and error handling
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Key Dependencies
- React
- TypeScript
- Tailwind CSS
- Various UI component libraries
- HTTP client utilities
- Form handling libraries

## Development Tools
- ESLint for linting
- Docker for containerization
- Git for version control

## Project Configuration
- TypeScript configuration: `tsconfig.json`
- Tailwind configuration: `tailwind.config.ts`
- Vite configuration: `vite.config.ts`
- ESLint configuration: `eslint.config.mjs`
- Docker configuration: `Dockerfile`

## API Integration
The project appears to integrate with backend services through:
- HTTP client in `app/services/httpClient.ts`
- Various service files for different domains (trip, maintenance, invoice, etc.)

## Code Organization
- Routes define page structure and data loading
- Components are organized by feature/domain
- Services handle API communication
- Types define data structures and validation
- UI components provide reusable interface elements
