import * as T from 'effect/Effect'
import { DateTime } from 'luxon'

import { Calendar, type Event, luxonLocalizer } from 'react-big-calendar'

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
  const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 7 })

  const { views } = useMemo(() => ({
    views: {
      month: true,
      week: false,
      day: false
    }
  }), [])

  const { messages } = useMemo(
    () => ({
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

  // export interface Event {
  //     allDay?: boolean | undefined;
  //     title?: React.ReactNode | undefined;
  //     start?: Date | undefined;
  //     end?: Date | undefined;
  //     resource?: any;
  // }

  const events: Event[] = [{
    title: 'maé',
    start: new Date(2025, 6, 1),
    end: new Date(2025, 6, 30)
  }]

  return (
    <div className=" px-6 pt-14 lg:px-4">
      <div className="mx-auto max-w-2xl py-4 sm:py-6 lg:py-7">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">
            Calendrier des réservations
          </h2>
        </div>
      </div>
      <div className="max-w-7xl mx-auto ">
        <Calendar
          culture="fr"
          messages={messages}
          views={views}
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '50rem', margin: '20px' }}
        />
      </div>
    </div>
  )
}
