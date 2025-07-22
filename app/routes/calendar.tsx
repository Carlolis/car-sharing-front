import * as T from 'effect/Effect'
import { DateTime } from 'luxon'

import { Calendar, luxonLocalizer } from 'react-big-calendar'

import '../components/calendar/calendar.css'

import { useMemo } from 'react'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { Remix } from '~/runtime/Remix'
import type { Route } from './+types'
export const loader = Remix.loader(
  T.gen(function* () {
    const cookieSession = yield* CookieSessionStorage
    const user = yield* cookieSession.getUserName()

    return { user }
  }).pipe(T.catchAll(_ => T.succeed({ user: undefined })))
)

export default function Index({ loaderData: { user } }: Route.ComponentProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 7 })

  const { views } = useMemo(() => ({
    views: {
      month: true,
      week: false,
      day: false
    }
  }), [])

  const { defaultDate, messages } = useMemo(
    () => ({
      defaultDate: new Date(2015, 3, 1),
      messages: {
        week: 'La semaine',
        work_week: 'Semaine de travail',
        day: 'Jour',
        month: 'Mois',
        previous: 'Précédent',
        next: 'Suivant',
        today: `Aujourd'hui`,
        agenda: 'Ordre du jour',

        showMore: (total: number) => `+${total} plus`
      }
    }),
    []
  )

  return (
    <div className=" px-6 pt-14 lg:px-8">
      {user && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Bravo !</strong>
          <span className="block sm:inline">
            {' '}Vous êtes connecté en tant que {user}.
          </span>
        </div>
      )}
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Calendrier de réservations
          </h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Calendar
          culture="fr"
          defaultDate={defaultDate}
          messages={messages}
          views={views}
          localizer={localizer}
          events={[]}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, margin: '50px' }}
        />
      </div>
    </div>
  )
}
