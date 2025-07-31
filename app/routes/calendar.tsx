import * as T from 'effect/Effect'
import { DateTime } from 'luxon'

import { Calendar, type Event, luxonLocalizer } from 'react-big-calendar'

import '../components/calendar/calendar.css'
import { pipe } from 'effect'
import * as A from 'effect/Array'
import { stringify } from 'effect/FastCheck'
import { useCallback, useMemo, useState } from 'react'
import { TripDialog } from '~/components/calendar/AddDialog'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { Remix } from '~/runtime/Remix'
import { NotFound } from '~/runtime/ServerResponse'
import { ApiService } from '~/services/api'
import type { Route } from './+types/calendar'
export const loader = Remix.loader(
  T.gen(function* () {
    const cookieSession = yield* CookieSessionStorage
    const user = yield* cookieSession.getUserName()
    const api = yield* ApiService
    const trips = yield* api.getAllTrips()

    yield* T.logDebug(
      `Trips and stats fetched: ${stringify(trips)}, stringify(userStats)}`
    )
    return { user, trips }
  }).pipe(
    T.catchAll(error => T.fail(new NotFound({ message: stringify(error) }))),
    T.annotateLogs('Calendar', 'Loader')
  )
)

export default function Calendar2({ loaderData: { trips } }: Route.ComponentProps) {
  const [isOpen, setIsOpen] = useState(false)

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

  const events: Event[] = pipe(
    trips,
    A.map(trip => ({
      title: trip.name,
      start: trip.startDate,
      end: trip.endDate,
      resource: trip
    }))
  )
  const [myEvents, setEvents] = useState(events)
  const handleSelectSlot = useCallback(
    ({ start, end }: Event) => {
      setIsOpen(true)
    },
    []
  )

  const handleSelectEvent = useCallback(
    (event: Event) => window.alert(event.title),
    []
  )

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
          events={myEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '50rem', margin: '20px' }}
          onSelectSlot={handleSelectSlot}
          selectable
          onSelectEvent={handleSelectEvent}
        />
      </div>
      <TripDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}
