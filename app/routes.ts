import { route, type RouteConfig } from '@react-router/dev/routes'

const routeDefs = [
  ['', './routes/index.tsx'],
  ['/dashboard', './routes/dashboard.tsx'],
  ['/login', './routes/login.tsx'],
  ['/ia', './routes/ia.tsx'],
  ['/health', './routes/health.tsx'],
  ['/calendar', './routes/calendar.tsx'],
  ['/invoices', './routes/invoices.tsx'],
  ['/invoices/download', './routes/invoicesDownload.ts'],
  ['/maintenance', './routes/maintenance.tsx'],
  ['/car', './routes/car.tsx']
] as const

export type RoutePaths = typeof routeDefs[number][0]

// export default flatRoutes() satisfies RouteConfig;
export default routeDefs.map(([path, mod]) => route(path, mod)) as RouteConfig
