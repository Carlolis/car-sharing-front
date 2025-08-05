import * as T from 'effect/Effect'
import { DateTime } from 'luxon'

import { HttpServerRequest } from '@effect/platform'
import { pipe, Schema as Sc } from 'effect'
import * as A from 'effect/Array'
import { stringify } from 'effect/FastCheck'
import { useCallback, useMemo, useState } from 'react'
import { Calendar, type Event, luxonLocalizer } from 'react-big-calendar'
import { useSubmit } from 'react-router'
import { TripDialog } from '~/components/calendar/AddDialog'
import { DashboardArguments } from '~/components/car/DashboardArguments'
import { DeleteButton } from '~/components/car/DeleteButton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog'
import { matchTripArgs } from '~/lib/utils'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { Remix } from '~/runtime/Remix'
import { NotFound, Redirect } from '~/runtime/ServerResponse'
import { ApiService } from '~/services/api'
import type { TripUpdate } from '~/types/api'
import { DriversArrayEnsure } from '~/types/api'
import '../components/calendar/calendar.css'
import type { Route as t } from './+types/calendar'

export const TripCalendar = Sc.Struct({
  id: Sc.String,
  name: Sc.String,
  startDate: Sc.DateFromSelf,
  endDate: Sc.DateFromSelf,
  distance: Sc.Number,
  drivers: DriversArrayEnsure
})

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

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Dashboard action trigged....`)
    const cookieSession = yield* CookieSessionStorage
    const user = yield* cookieSession.getUserName()

    const request = yield* HttpServerRequest.schemaBodyJson(DashboardArguments)
    return yield* matchTripArgs(request, user)
  }).pipe(
    T.tapError(T.logError),
    T.catchAll(() => new Redirect({ location: '/calendar' }))
  )
)

export default function CalendarPage({ loaderData: { trips } }: t.ComponentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState(new Date())

  const [tripToUpdate, setTripToUpdate] = useState<TripUpdate | undefined>(undefined)
  const myEvents = pipe(
    trips,
    A.map(trip => ({
      title: trip.name,
      start: new Date(trip.startDate),
      end: new Date(trip.endDate),
      resource: trip
    }))
  )

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

  const handleSelectSlot = useCallback(
    (event: Event) => {
      if (event.start) {
        const startDate = event.start
        startDate.setDate(startDate.getDate() + 1)
        setStartDate(startDate)
      }

      setIsOpen(true)
    },
    []
  )

  const handleSelectEvent = useCallback(
    (event: Event) => {
      const resourceTrip = Sc.decodeUnknownSync(TripCalendar)(event.resource)
      setTripToUpdate(resourceTrip)
      setIsOpen(true)

      // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // if (event.resource && event.resource.id) {
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      //   setTripIdToDelete(event.resource.id)
      // }
    },
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
          selectable="ignoreEvents"
          onSelectEvent={handleSelectEvent}
        />
      </div>
      <TripDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        startDate={startDate}
        updateTrip={tripToUpdate}
        setTripUpdate={setTripToUpdate}
      />
    </div>
  )
}
