import { HttpBody, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { pipe, Schema as Sc } from 'effect'

import type { HttpBodyError } from '@effect/platform/HttpBody'
import type { HttpClientError } from '@effect/platform/HttpClientError'
import * as T from 'effect/Effect'
import { stringify } from 'effect/FastCheck'
import type { ParseError } from 'effect/ParseResult'
import { CookieSessionStorage } from '~/runtime/CookieSessionStorage'
import { NotAuthenticated } from '~/runtime/errors/NotAuthenticatedError'
import type { Redirect } from '~/runtime/ServerResponse'
import { Maintenance } from '~/types/Maintenance'
import { MaintenanceCreate } from '~/types/MaintenanceCreate'
import { HttpService } from './httpClient'

// @effect-diagnostics-next-line leakingRequirements:off
export class MaintenanceService extends T.Service<MaintenanceService>()('MaintenanceService', {
  effect: T.gen(function* () {
    const { defaultClient, postRequest, getRequest, deleteRequest, putRequest } = yield* HttpService

    const createMaintenance: (
      maintenance: MaintenanceCreate
    ) => T.Effect<
      string,
      HttpClientError | ParseError | Redirect | HttpBodyError,
      CookieSessionStorage
    > = (
      maintenance: MaintenanceCreate
    ) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage

        const token = yield* cookieSession.getUserToken()
        yield* T.logInfo(`About to save maintenance...`, maintenance)

        const maintenanceUrl = pipe(postRequest, HttpClientRequest.appendUrl('/maintenance'))

        const body = yield* HttpBody.jsonSchema(MaintenanceCreate)({ ...maintenance })
        const createMaintenanceRequest = pipe(
          maintenanceUrl,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(createMaintenanceRequest).pipe(
          T.tapError(T.logError)
        )

        return yield* HttpClientResponse.schemaBodyJson(Sc.String)(response)
      }).pipe(
        T.tapError(T.logError),
        T.annotateLogs(MaintenanceService.name, createMaintenance.name)
      )

    const getAllMaintenance = () =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()
        yield* T.logDebug(`Found token....`, token)

        const getAllMaintenanceRequest = pipe(
          getRequest,
          HttpClientRequest.appendUrl('/maintenance'),
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`)
        )
        const response = yield* defaultClient.execute(getAllMaintenanceRequest)

        const responseJson = yield* pipe(
          HttpClientResponse.schemaBodyJson(Sc.Array(Maintenance))(response),
          T.tapError(e => T.logError('Error parsing maintenance response', stringify(e))),
          T.catchAll(() => T.succeed<readonly Maintenance[]>([]))
        )

        yield* T.logInfo(`Found ${stringify(responseJson.length)} maintenance records`)

        return responseJson
      }).pipe(
        T.catchTag('ResponseError', error =>
          T.gen(function* () {
            if (error.response.status === 401 || error.response.status === 400) {
              return yield* pipe(
                error.response.text,
                T.tap(T.logError),
                T.flatMap(error => T.fail(NotAuthenticated.of(error)))
              )
            }
            return yield* T.fail(error)
          })),
        T.tapError(T.logError),
        T.annotateLogs(MaintenanceService.name, getAllMaintenance.name)
      )

    const deleteMaintenance = (maintenanceId: string) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()

        const deleteUrl = pipe(
          deleteRequest,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.appendUrl(`/maintenance/${maintenanceId}`)
        )
        const response = yield* defaultClient.execute(deleteUrl)
        yield* T.logInfo('MaintenanceService deleteMaintenance response :', response)

        return yield* pipe(
          response,
          HttpClientResponse.schemaBodyJson(Sc.String),
          T.map(maintenanceId => ({ _tag: 'MaintenanceId' as const, maintenanceId }))
        )
      }).pipe(
        T.catchTag('ResponseError', error =>
          T.gen(function* () {
            if (error.response.status === 401 || error.response.status === 400) {
              return yield* pipe(
                error.response.text,
                T.tap(T.logError),
                T.flatMap(error => T.fail(NotAuthenticated.of(error)))
              )
            }
            return yield* T.fail(error)
          })),
        T.tapError(T.logError),
        T.annotateLogs(MaintenanceService.name, deleteMaintenance.name)
      )

    const updateMaintenance = (maintenance: Maintenance) =>
      T.gen(function* () {
        const cookieSession = yield* CookieSessionStorage
        yield* T.logDebug(`Getting token....`)
        const token = yield* cookieSession.getUserToken()

        yield* T.logInfo(`About to update maintenance...`, maintenance)

        const maintenanceUrl = pipe(putRequest, HttpClientRequest.appendUrl('/maintenance'))

        const body = yield* HttpBody.jsonSchema(Maintenance)({
          ...maintenance,
          dueDate: maintenance.dueDate,
          completedDate: maintenance.completedDate !== null ? maintenance.completedDate : undefined
        })
        const updateMaintenanceRequest = pipe(
          maintenanceUrl,
          HttpClientRequest.setHeader('Authorization', `Bearer ${token}`),
          HttpClientRequest.setBody(body)
        )

        const response = yield* defaultClient.execute(updateMaintenanceRequest)

        return yield* pipe(
          response,
          HttpClientResponse.schemaBodyJson(Sc.String),
          T.map(maintenanceId => ({ _tag: 'MaintenanceId' as const, maintenanceId }))
        )
      }).pipe(
        T.catchTag('ResponseError', error =>
          T.gen(function* () {
            if (error.response.status === 401 || error.response.status === 400) {
              return yield* pipe(
                error.response.text,
                // T.tap(T.logError),
                T.flatMap(error => T.fail(NotAuthenticated.of(error)))
              )
            }
            return yield* T.fail(error)
          })),
        // T.tapError(T.logError),
        T.annotateLogs(MaintenanceService.name, updateMaintenance.name)
      )

    return ({
      updateMaintenance,
      deleteMaintenance,
      createMaintenance,
      getAllMaintenance
    })
  })
}) {}

export const MaintenanceLayer = MaintenanceService.Default
