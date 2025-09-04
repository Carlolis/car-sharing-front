import { Match, pipe } from 'effect'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import { SimpleTaggedError } from '~/runtime/errors/SimpleTaggedError'

import { TreeFormatter } from 'effect/ParseResult'
import { MaintenanceService } from '~/services/maintenance'
import { type MaintenanceActions } from './MaintenanceActions'

export const matcherMaintenanceActions = (request: MaintenanceActions) =>
  T.gen(function* () {
    yield* T.logInfo(`Maintenance action request: ${stringify(request)}`)
    const api = yield* MaintenanceService
    return yield* Match.type<MaintenanceActions>().pipe(
      Match.tag('delete', ({ maintenanceId: maintenanceId }) =>
        T.gen(function* () {
          yield* T.logInfo('Deleting maintenance...')
          return yield* api.deleteMaintenance(maintenanceId)
        })),
      Match.tag('update', maintenanceUpdate =>
        T.gen(function* () {
          yield* T.logInfo(
            `Maintenance updating maintenance action .... ${stringify(maintenanceUpdate)}`
          )

          const maintenanceId = yield* api.updateMaintenance({
            ...maintenanceUpdate,
            dueMileage: maintenanceUpdate.dueMileage ?
              Number(maintenanceUpdate.dueMileage) :
              undefined,
            completedMileage: maintenanceUpdate.completedMileage ?
              Number(maintenanceUpdate.completedMileage) :
              undefined,
            dueDate: maintenanceUpdate.dueDate ? new Date(maintenanceUpdate.dueDate) : undefined,
            completedDate: maintenanceUpdate.completedDate ?
              new Date(maintenanceUpdate.completedDate) :
              undefined,
            isCompleted: maintenanceUpdate.isCompleted ?? false
          }).pipe(
            T.as({ maintenanceName: maintenanceUpdate.type, _tag: 'MaintenanceName' as const })
          )

          yield* T.logInfo(`Maintenance updated .... ${stringify(maintenanceId)}`)

          return maintenanceId
        })),
      Match.tag('create', maintenanceCreate =>
        T.gen(function* () {
          yield* T.logInfo(
            `Maintenance creating maintenance action .... ${stringify(maintenanceCreate)}`
          )

          yield* T.logInfo(`Creating Maintenance....`)

          const api = yield* MaintenanceService

          const maintenanceId = yield* api.createMaintenance({
            ...maintenanceCreate,
            dueMileage: maintenanceCreate.dueMileage ?
              Number(maintenanceCreate.dueMileage) :
              undefined,
            completedMileage: maintenanceCreate.completedMileage ?
              Number(maintenanceCreate.completedMileage) :
              undefined,
            dueDate: maintenanceCreate.dueDate ? new Date(maintenanceCreate.dueDate) : undefined,
            completedDate: maintenanceCreate.completedDate ?
              new Date(maintenanceCreate.completedDate) :
              undefined,
            invoiceId: maintenanceCreate.invoiceId ? maintenanceCreate.invoiceId : undefined,
            isCompleted: maintenanceCreate.isCompleted ?? false
          }).pipe(
            T.as({ maintenanceName: maintenanceCreate.type, _tag: 'MaintenanceName' as const })
          )
          yield* T.logInfo(`Maintenance created .... ${stringify(maintenanceId)}`)

          return maintenanceId
        })),
      Match.exhaustive
    )(request)
  }).pipe(
    T.tapError(T.logError),
    T.catchTag('ResponseError', error =>
      T.gen(function* () {
        if (error.response.status === 405) {
          return yield* pipe(
            error.response.text,
            T.tap(error => T.logError('Unauthorized Error 405', error)),
            T.flatMap(errorText =>
              T.succeed(
                SimpleTaggedError(
                  `Unauthorized Error 405  ${errorText} for url : ${error.methodAndUrl}`
                )
              )
            )
          )
        }
        return yield* T.fail(error)
      })),
    T.catchTags({
      ResponseError: error =>
        T.gen(function* () {
          const text = yield* error.response.text
          yield* T.logError('Status Code : ', error.response.status)
          yield* T.logError('Error text : ', text)
          yield* T.logError('Description :', error.description)

          return yield* T.succeed(SimpleTaggedError(stringify(text)))
        }),
      ParseError: error =>
        T.gen(function* () {
          yield* T.logError(
            'Maintenance Action Parse error  : ',
            TreeFormatter.formatErrorSync(error)
          )
          return yield* T.succeed(SimpleTaggedError(TreeFormatter.formatErrorSync(error)))
        })
    }),
    T.catchAll(error => T.succeed(SimpleTaggedError(stringify(error))))
  )
