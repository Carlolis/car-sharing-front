import { HttpServerRequest } from '@effect/platform'
import { pipe, Schema as Sc } from 'effect'
import * as A from 'effect/Array'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { DateTime } from 'luxon'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Calendar, type Event, luxonLocalizer } from 'react-big-calendar'
import { matcherTripActions } from '~/components/dashboard/matcherTripActions'
import { TripActions } from '~/components/dashboard/TripActions'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { Remix } from '~/runtime/Remix'
import { NotFound, Redirect, Unexpected } from '~/runtime/ServerResponse'
import { TripService } from '~/services/trip'
import type { TripUpdate } from '~/types/api'
import { DriversArrayEnsure } from '~/types/api'

import { Calendar1, Minus, Plus } from 'lucide-react'
import { NewTripForm } from '~/components/dashboard/tripForm'
import { Button } from '~/components/ui/button'
import { useIsMobile } from '~/components/ui/use-mobile'
import { DistanceService } from '~/services/distance'
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
    const api = yield* TripService
    const distance = yield* DistanceService
    // yield* distance.calculateDistance('paris', 'lyon')
    const trips = yield* api.getAllTrips()

    yield* T.logInfo(
      `Trips and stats fetched: ${stringify(trips)}, stringify(userStats)}`
    )
    return { user, trips }
  }).pipe(
    T.catchTag('RequestError', error => T.fail(new Unexpected({ error: error.message }))),
    T.catchTag('ResponseError', error => T.fail(new Unexpected({ error: error.message })))
  )
)

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Trip actions trigged....`)

    const request = yield* HttpServerRequest.schemaBodyJson(TripActions)
    return yield* matcherTripActions(request)
  }).pipe(
    T.tapError(T.logError),
    T.catchAll(() => new Redirect({ location: '/calendar' }))
  )
)

export default function CalendarPage({ loaderData: { trips } }: t.ComponentProps) {
  const isMobile = useIsMobile()

  const [showForm, setShowForm] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)

  const [updateTrip, setUpdateTrip] = useState<TripUpdate | undefined>(undefined)
  const myEvents = pipe(
    trips,
    A.map(trip => ({
      title: trip.drivers.length > 0 ?
        (
          <span>
            <strong>{trip.drivers.join(', ')}</strong> : {trip.name}
          </span>
        ) :
        trip.name,
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

        showMore: (total: number) => `+${total} plus`
      }
    }),
    []
  )

  const handleSelectSlot = (event: Event) => {
    if (event.start) {
      const startDate = event.start
      startDate.setDate(startDate.getDate() + 1)
      setStartDate(startDate)
    }
    setUpdateTrip(undefined)
    setShowForm(true)
  }

  const handleSelectEvent = (event: Event) => {
    const resourceTrip = Sc.decodeUnknownSync(TripCalendar)(event.resource)
    setShowForm(false)
    setStartDate(undefined)
    setUpdateTrip({ ...resourceTrip })

    // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // if (event.resource && event.resource.id) {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    //   setTripIdToDelete(event.resource.id)
    // }
  }

  const handleToggleForm = () => {
    setStartDate(undefined)
    if (updateTrip) {
      setUpdateTrip(undefined)
      return
    }

    setShowForm(!showForm)
  }

  return (
    <div className="relative z-10 p-3 lg:p-12 w-full">
      <div className="space-y-6 lg:space-y-8 mx-auto lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3 lg:gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="w-12 h-12 bg-gradient-title-icon rounded-2xl flex items-center justify-center"
            >
              <Calendar1 className="h-6 w-6 text-[#F9F7F3]" />
            </motion.div>
            <div>
              <h1
                className="text-2xl lg:text-3xl font-semibold text-[#004D55] font-heading"
                style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
              >
                Calendrier des réservations
              </h1>
              <p
                className="text-[#6B7280] text-sm lg:text-base font-body"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Gérer la disponibilité de la voiture
              </p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Button
              onClick={handleToggleForm}
              className={`shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base px-4 lg:px-6 py-2 lg:py-3 min-h-[44px] whitespace-nowrap rounded-lg ${
                (showForm || updateTrip) ?
                  'bg-red-600 hover:bg-red-700 text-white' :
                  'bg-[#004D55] hover:bg-[#003640] text-white'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {(showForm || updateTrip) ?
                <Minus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" /> :
                <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />}

              <span className="inline">
                {(showForm || updateTrip) ?
                  'Annuler' :
                  `${isMobile ? 'Nouveau' : 'Nouveau trajet'}`}
              </span>
            </Button>
          </motion.div>
        </motion.div>
        <NewTripForm
          key={updateTrip ? updateTrip.id : 'new-trip-form'}
          showForm={showForm}
          setShowForm={setShowForm}
          setTripUpdate={setUpdateTrip}
          updateTrip={updateTrip}
          startDate={startDate}
        />
        <Calendar
          className="w-full bg-white border-gray-200 shadow-sm rounded-xl"
          culture="fr"
          messages={messages}
          views={views}
          localizer={localizer}
          events={myEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={handleSelectSlot}
          selectable="ignoreEvents"
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  )
}
