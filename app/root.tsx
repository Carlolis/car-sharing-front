import styles from 'react-datepicker/dist/react-datepicker.css?url'
import type { LinksFunction } from 'react-router'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useRouteError
} from 'react-router'
import calendar from './components/calendar/calendar.css?url'
import { Remix } from './runtime/Remix'
import stylesheet from './tailwind.css?url'
export const links: LinksFunction = () => [
  //  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'stylesheet', href: calendar },
  { rel: 'stylesheet', href: styles }
]

import { HttpServerRequest } from '@effect/platform'
import { pipe } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'

import { BarChart3, Brain, Calendar, MapPin, Receipt } from 'lucide-react'
import { useEffect } from 'react'
import { SideBar } from './components/sideBar'
import { CookieSessionStorage } from './runtime/CookieSessionStorage'
import { Unexpected } from './runtime/ServerResponse'

export const loader = Remix.loader(
  T.gen(function* () {
    const cookieSession = yield* CookieSessionStorage

    const request = yield* HttpServerRequest.HttpServerRequest
    const url = yield* HttpServerRequest.toURL(request)

    const isAuthenticated = yield* pipe(
      cookieSession.getUserToken(),
      T.map(_ => true),
      T.catchAll(_ => T.succeed(false))
    )

    yield* T.logDebug(`Loader - isAuthenticated: ${isAuthenticated}`, url)
    return { isAuthenticated, url }
  })
)

export const action = Remix.action(
  T.gen(function* () {
    const cookieSession = yield* CookieSessionStorage

    const user = yield* cookieSession.getUserName()

    yield* T.logDebug(`User ${user} logging out`)
    const result = yield* cookieSession.logout()
    yield* T.logDebug(`Logout result ${stringify(result)}`)
    return result
  }).pipe(T.catchAll(error => T.fail(new Unexpected({ error: error.toString() }))))
)

const menuItems = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: BarChart3
  },
  {
    id: 'calendar',
    label: 'Réservations',
    icon: Calendar
  },
  {
    id: 'invoice/new',
    label: 'Nouvelle Facture',
    icon: MapPin
  },
  { id: 'invoices', label: 'Factures', icon: Receipt },
  { id: 'ia', label: 'IA', icon: Brain }
]

export default function App() {
  const { isAuthenticated, url } = useLoaderData<typeof loader>()

  const isIAUrl = url && url.hostname === 'ia.ilieff.fr'
  const navigate = useNavigate()

  useEffect(() => {
    if (isIAUrl) {
      navigate('/ia')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" href="/favicon.svg" />
        {isIAUrl ? <title>AI by Charles</title> : <title>Partage</title>}
      </head>
      <body>
        <main className="flex-1  relative overflow-hidden">
          <div className="min-h-screen  flex  ">
            {!isIAUrl && (
              <div className="min-h-screen  flex max-w-150 ">
                <SideBar menuItems={menuItems} isAuthenticated={isAuthenticated} />
              </div>
            )}
            <Outlet />
          </div>

          <ScrollRestoration />
          <Scripts />
        </main>
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  // eslint-disable-next-line no-console
  console.error(error)
  return (
    <html lang="fr">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        {stringify(error)}
        <Scripts />
      </body>
    </html>
  )
}
