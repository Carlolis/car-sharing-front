import styles from 'react-datepicker/dist/react-datepicker.css?url'
import type { LinksFunction } from 'react-router'
import {
  Form,
  href,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useRouteError
} from 'react-router'
import { Remix } from './runtime/Remix'
import stylesheet from './tailwind.css?url'

export const links: LinksFunction = () => [
  //  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'stylesheet', href: styles }
]

import { HttpServerRequest } from '@effect/platform'
import { pipe } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'

import { useEffect } from 'react'
import { CookieSessionStorage } from './runtime/CookieSessionStorage'
import { Unexpected } from './runtime/ServerResponse'
interface NavigationPros {
  isAuthenticated: boolean
}

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

const Navigation = ({ isAuthenticated }: NavigationPros) => (
  <nav className="bg-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-white font-bold text-xl">
              PartageAuto
            </NavLink>
          </div>
          {isAuthenticated && (
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink
                to={href('/dashboard')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Tableau de bord
              </NavLink>
              <NavLink
                to={href('/calendar')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Calendrier
              </NavLink>
              <NavLink
                to={href('/trip/new')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Nouveau trajet
              </NavLink>
              <NavLink
                to={href('/invoice/new')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Facture/Entretien
              </NavLink>
              <NavLink
                to={href('/invoices')}
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Factures
              </NavLink>
            </div>
          )}
          <NavLink
            to={href('/ia')}
            className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            IA
          </NavLink>
        </div>

        <div className="flex items-center">
          {isAuthenticated
            && (
              <Form method="post">
                <button
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
                  type="submit"
                >
                  Déconnexion
                </button>
              </Form>
            )}
        </div>
      </div>
    </div>
  </nav>
)

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
        <div className="min-h-screen bg-white">
          {!isIAUrl && <Navigation isAuthenticated={isAuthenticated} />}
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
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
        {/* add the UI you want your users to see */}
        <Scripts />
      </body>
    </html>
  )
}
