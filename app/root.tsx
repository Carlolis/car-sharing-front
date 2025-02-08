import type { LinksFunction } from 'react-router'
import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError
} from 'react-router'

import { Remix } from './runtime/Remix'
import stylesheet from './tailwind.css?url'

export const links: LinksFunction = () => [
  //  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: 'stylesheet', href: stylesheet }
]

import * as T from 'effect/Effect'
import { CookieSessionStorage } from './runtime/CookieSessionStorage'

interface NavigationPros {
  isAuthenticated: boolean
}

const Navigation = ({ isAuthenticated }: NavigationPros) => {
  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/" className="text-white font-bold text-xl">
                Car Share
              </NavLink>
            </div>
            {isAuthenticated && (
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink
                  to="/dashboard"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Tableau de bord
                </NavLink>
                <NavLink
                  to="/trip/new"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Nouveau trajet
                </NavLink>
              </div>
            )}
            <NavLink
              to="/ia"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              IA
            </NavLink>
          </div>
          <div className="flex items-center">
            {isAuthenticated ?
              (
                <NavLink to="/logout">
                  <button
                    type="submit"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Déconnexion
                  </button>
                </NavLink>
              ) :
              null}
          </div>
        </div>
      </div>
    </nav>
  )
}

export const loader = Remix.loader(
  T.gen(function* () {
    const cookieSession = yield* CookieSessionStorage
    const token = yield* cookieSession.getUserToken()

    return { isAuthenticated: token !== undefined }
  }).pipe(T.catchAll(_ => T.succeed({ isAuthenticated: false })))
)

export default function App() {
  const { isAuthenticated } = useLoaderData<typeof loader>()

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen bg-gray-100">
          <Navigation isAuthenticated={isAuthenticated} />
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
