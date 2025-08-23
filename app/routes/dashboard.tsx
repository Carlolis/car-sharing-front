import * as T from 'effect/Effect'

import { Remix } from '~/runtime/Remix'
import { TripService } from '../services/trip'

import { stringify } from 'effect/FastCheck'
import { motion } from 'motion/react'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { Unexpected } from '~/runtime/ServerResponse'

import {
  type RowData
} from '@tanstack/react-table'

import { HttpServerRequest } from '@effect/platform'

import { BarChart3, Car, Gauge, MapPin, Minus, Plus, Wrench } from 'lucide-react'
import { useState } from 'react'
import { DashboardArguments } from '~/components/car/DashboardArguments'
import { NewTripForm } from '~/components/car/NewTripForm'
import { StatsCard } from '~/components/car/StatsCard'
import { useTripTable } from '~/components/car/useTripTable'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { matchTripArgs } from '~/lib/utils'
import type { TripUpdate } from '~/types/api'
import type { Route } from './+types/dashboard'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData,> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

export const loader = Remix.loader(
  T.gen(function* () {
    yield* T.logInfo(`Loading Dashboard...`)
    const cookieSession = yield* CookieSessionStorage

    yield* T.logDebug(`CookieSessionStorage - loader`)

    const user = yield* cookieSession.getUserName()
    const api = yield* TripService

    const userStats = yield* api.getTripStatsByUser()

    const trips = yield* api.getAllTrips()

    yield* T.logDebug(
      `Trips and stats fetched: ${stringify(trips)}, stringify(userStats)}`
    )

    return { user, trips, userStats, _tag: 'data' as const }
  }).pipe(
    T.catchTag('RequestError', error => new Unexpected({ error: error.message })),
    T.catchTag('ResponseError', error => new Unexpected({ error: error.message }))
  )
)

export const action = Remix.unwrapAction(
  T.succeed(
    T.gen(function* () {
      yield* T.logInfo(`Dashboard action trigged....`)

      const request = yield* HttpServerRequest.schemaBodyJson(DashboardArguments)
      return yield* matchTripArgs(request)
    }).pipe(
      T.tapError(T.logError),
      T.catchTag('RequestError', error => new Unexpected({ error: error.message }))
    )
  )
)

export default function Dashboard(
  { loaderData, actionData }: Route.ComponentProps
) {
  const [tripToUpdate, setTripToUpdate] = useState<TripUpdate | undefined>(undefined)
  const trips = loaderData.trips || []
  const table = useTripTable(
    trips,
    setTripToUpdate
  )
  const [showForm, setShowForm] = useState<boolean>(false)
  const handleToggleForm = () => {
    if (tripToUpdate) {
      setTripToUpdate(undefined)
      return
    }

    setShowForm(!showForm)
  }
  return (
    <div className="relative z-10 p-6 lg:p-12 w-full">
      <div className="space-y-6 lg:space-y-8 mx-auto px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 lg:gap-4"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="w-12 h-12 bg-gradient-title-icon rounded-2xl flex items-center justify-center"
          >
            <Gauge className="h-6 w-6 text-[#F9F7F3]" />
          </motion.div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-semibold text-[#004D55] font-heading"
              style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
            >
              Dashboard
            </h1>
            <p
              className="text-[#6B7280] text-sm lg:text-base font-body"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Vue d&apos;ensemble de l&apos;activité familiale
            </p>
          </div>
        </motion.div>
        <>
          {actionData?._tag === 'create' ?
            (
              <>
                {actionData.tripId}
              </>
            ) :
            <></>}
        </>
        {actionData?._tag === 'SimpleTaggedError' && (
          <div className="rounded-md bg-red-50  p-4">
            <div className="text-sm text-red-700 ">
              {actionData.message}
            </div>
          </div>
        )}

        {loaderData.trips && (
          <>
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Bravo !</strong>
              <span>{' '}</span>
              <span className="block sm:inline">
                Vous êtes connecté en tant que {loaderData.user}
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-24"
            >
              <StatsCard
                title="Ta distance totale (km)"
                value={loaderData.userStats.totalKilometers}
                icon={Car}
                bgColor="distance"
              />
              <StatsCard
                title="Prochain entretien (km)"
                value={'A faire'}
                icon={Wrench}
                bgColor="entretien"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-3 lg:gap-4 mt-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="w-12 h-12 bg-gradient-title-icon rounded-2xl flex items-center justify-center"
                >
                  <MapPin className="h-6 w-6 text-[#F9F7F3]" />
                </motion.div>
                <div>
                  <h2
                    className="text-2xl lg:text-3xl font-semibold text-[#004D55] font-heading"
                    style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
                  >
                    Historique de trajets
                  </h2>
                  <p
                    className="text-[#6B7280] text-sm lg:text-base font-body"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Gestion des déplacements familiaux
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 ml-auto"
              >
                <Button
                  onClick={handleToggleForm}
                  className={`shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base px-4 lg:px-6 py-2 lg:py-3 min-h-[44px] whitespace-nowrap rounded-lg ${
                    showForm ?
                      'bg-red-600 hover:bg-red-700 text-white' :
                      'bg-[#004D55] hover:bg-[#003640] text-white'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {showForm ?
                    <Minus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" /> :
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />}
                  <span className="hidden sm:inline">
                    {showForm ? 'Annuler' : 'Nouveau trajet'}
                  </span>
                  <span className="sm:hidden">{showForm ? 'Annuler' : 'Nouveau'}</span>
                </Button>
              </motion.div>
            </motion.div>
            <NewTripForm
              key={tripToUpdate ? tripToUpdate.id : 'new-trip-form'}
              showForm={showForm}
              setShowForm={setShowForm}
              updateTrip={tripToUpdate}
              setTripUpdate={setTripToUpdate}
            />
            <DataTable table={table} />
          </>
        )}
      </div>
    </div>
  )
}
