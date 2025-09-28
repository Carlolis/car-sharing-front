# System Patterns

## Architecture Overview
The application follows a component-based architecture with clear separation of concerns:

- **Routes**: Define page structure and data loading
- **Components**: Encapsulate UI and behavior by feature/domain
- **Services**: Handle API communication and business logic
- **Types**: Define data structures and validation schemas

## Key Design Patterns

### 1. Service Layer Pattern
- Services (`app/services/`) abstract API calls and business logic
- Components interact with services rather than directly with APIs
- Example: `maintenance.ts` service handles all maintenance-related operations

### 2. Component Composition
- UI components are composed to build complex interfaces
- Reusable components in `app/components/ui/`
- Feature-specific components organized by domain

### 3. Type Safety
- Comprehensive TypeScript types define data structures
- Types used for API responses, form validation, and state management
- Example: `Maintenance.ts`, `Invoice.ts` types

### 4. Route-based Data Loading
- Remix route loaders handle data fetching
- Data flows from routes to components via props
- Example: `app/routes/maintenance.tsx` loads maintenance data

### 5. Form Management
- Forms are handled with controlled components
- Form state and validation logic in component files
- Example: `maintenanceForm.tsx`, `tripForm.tsx`

## Component Relationships

### Maintenance System
- `maintenance.tsx` (route) → `useMaintenanceTable.tsx` (data hook) → `MaintenanceActions.ts` (actions) → `maintenanceForm.tsx` (form component)

### Trip System
- `dashboard.tsx` (route) → `useTripTable.tsx` (data hook) → `TripActions.ts` (actions) → `tripForm.tsx` (form component)

### Invoice System
- `invoices.tsx` (route) → `useInvoiceTable.tsx` (data hook) → `InvoiceActions.ts` (actions) → `invoiceForm.tsx` (form component)

## Data Flow
1. API calls made through services
2. Data loaded in route loaders
3. Passed to components as props
4. Components manage local state and UI
5. Forms submit data back through services
