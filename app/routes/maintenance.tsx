import { HttpServerRequest } from '@effect/platform'
import { Loader } from 'components/ui/shadcn-io/ai/loader'
import * as T from 'effect/Effect'
import { Minus, Plus, Wrench } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useNavigation } from 'react-router'
import { MaintenanceActions } from '~/components/maintenance/MaintenanceActions'
import MaintenanceForm from '~/components/maintenance/maintenanceForm'
import { matcherMaintenanceActions } from '~/components/maintenance/matcherMaintenanceActions'
import { useMaintenanceTable } from '~/components/maintenance/useMaintenanceTable'
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/ui/data-table'
import { Remix } from '~/runtime/Remix'
import { Redirect, Unexpected } from '~/runtime/ServerResponse'
import { MaintenanceService } from '~/services/maintenance'
import type { Maintenance } from '~/types/Maintenance'
export const loader = Remix.loader(
  T.gen(function* () {
    const maintenanceService = yield* MaintenanceService
    const maintenance = yield* maintenanceService.getAllMaintenance()
    return { maintenance }
  }).pipe(
    T.catchTag('RequestError', error => new Unexpected({ error: error.message })),
    T.catchTag('ResponseError', error => new Unexpected({ error: error.message }))
  )
)

export const action = Remix.action(
  T.gen(function* () {
    yield* T.logInfo(`Maintenance actions trigged....`)

    const request = yield* HttpServerRequest.schemaBodyForm(MaintenanceActions)
    return yield* matcherMaintenanceActions(request)
  }).pipe(
    T.tapError(T.logError),
    T.catchTag('RequestError', error => new Unexpected({ error: error.message })),
    T.catchAll(() => new Redirect({ location: '/maintenance' }))
  )
)

interface MaintenancePageProps {
  loaderData: { maintenance: readonly Maintenance[] }
  actionData?: {
    maintenanceName: string
    _tag: 'MaintenanceName'
  } | {
    message: string
    _tag: 'SimpleTaggedError'
  } | {
    readonly _tag: 'MaintenanceId'
    readonly maintenanceId: string
  } | undefined
}

export default function MaintenancePage({ loaderData, actionData }: MaintenancePageProps) {
  const navigation = useNavigation()
  const isLoading = navigation.formAction == '/maintenance'
  const [maintenanceUpdate, setMaintenanceUpdate] = useState<Maintenance | undefined>(undefined)

  const [showForm, setShowForm] = useState<boolean>(false)
  const { maintenance } = loaderData
  const table = useMaintenanceTable(maintenance, setMaintenanceUpdate)

  const handleToggleForm = () => {
    if (maintenanceUpdate) {
      setMaintenanceUpdate(undefined)
      return
    }

    setShowForm(!showForm)
  }

  // Calculate next maintenance due
  const nextMaintenance = maintenance.find(m => !m.isCompleted && (m.dueDate || m.dueMileage))
  const getNextMaintenanceText = () => {
    if (!nextMaintenance) return 'Aucun entretien prévu'

    if (nextMaintenance.dueDate) {
      const date = new Date(nextMaintenance.dueDate)
      return `${nextMaintenance.type} - ${date.toLocaleDateString('fr-FR')}`
    }

    if (nextMaintenance.dueMileage) {
      return `${nextMaintenance.type} - ${nextMaintenance.dueMileage} km`
    }

    return nextMaintenance.type
  }

  return (
    <div className="relative z-10 p-3 lg:p-12 w-full">
      <div className="space-y-6 lg:space-y-8 mx-auto sm:px-10">
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
              <Wrench className="h-6 w-6 text-[#F9F7F3]" />
            </motion.div>
            <div>
              <h1
                className="text-2xl lg:text-3xl font-semibold text-[#004D55] font-heading"
                style={{ fontFamily: 'Montserrat Alternates, sans-serif' }}
              >
                Maintenance (pas encore finis)
              </h1>
              <p
                className="text-[#6B7280] text-sm lg:text-base font-body"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Gestion des entretiens et maintenances
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
                showForm || maintenanceUpdate ?
                  'bg-red-600 hover:bg-red-700 text-white' :
                  'bg-[#004D55] hover:bg-[#003640] text-white'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {showForm || maintenanceUpdate ?
                (
                  <>
                    <Minus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    <span className="hidden sm:inline">Annuler</span>
                    <span className="sm:hidden">Annuler</span>
                  </>
                ) :
                (
                  <>
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    <span className="hidden sm:inline">Nouvel entretien</span>
                    <span className="sm:hidden">Nouveau</span>
                  </>
                )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Next Maintenance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-[#059669] to-[#047857] rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Prochain entretien</h3>
              <p className="text-white/90">{getNextMaintenanceText()}</p>
            </div>
          </div>
        </motion.div>

        <MaintenanceForm
          actionData={actionData}
          showForm={showForm}
          updateMaintenance={maintenanceUpdate}
          isLoading={isLoading}
          setShowForm={setShowForm}
          setMaintenanceUpdate={setMaintenanceUpdate}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-xl lg:text-2xl font-semibold text-[#004D55] font-heading">
            Historique des entretiens
          </h2>
        </motion.div>
        {isLoading ? <Loader /> : <DataTable table={table} />}
      </div>
    </div>
  )
}
