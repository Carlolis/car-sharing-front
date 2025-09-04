import { DevTools } from '@effect/experimental'
import { FetchHttpClient, Path } from '@effect/platform'
import { NodeContext, NodeFileSystem, NodeSocket } from '@effect/platform-node'
import {
  Layer,
  Logger,
  pipe
} from 'effect'
import * as T from 'effect/Effect'
import * as L from 'effect/Layer'
import { IaServiceLayer } from '~/contexts/ia.util'
import { AuthLayer } from '~/services/auth'
import { HttpLayer } from '~/services/httpClient'
import { IALayer } from '~/services/ia'
import { InvoiceLayer } from '~/services/invoice'
import { MaintenanceLayer } from '~/services/maintenance'
import { TripLayer } from '~/services/trip'

import { Config, ConfigLive } from './Config'

export const DevToolsLive = DevTools.layerWebSocket().pipe(
  Layer.provide(NodeSocket.layerWebSocketConstructor)
)

const LogLevel = T.gen(function* () {
  const config = yield* Config
  const logLEvel = yield* pipe(config.getConfig, T.map(c => c.logLevel))
  return Logger.minimumLogLevel(logLEvel)
}).pipe(L.unwrapEffect)

export const AppLayer = pipe(
  NodeFileSystem.layer,
  L.provideMerge(Path.layer),
  L.provide(LogLevel),
  L.provideMerge(NodeContext.layer),
  L.provideMerge(IaServiceLayer),
  L.provideMerge(AuthLayer),
  L.provideMerge(TripLayer),
  L.provideMerge(InvoiceLayer),
  L.provideMerge(MaintenanceLayer),
  L.provideMerge(IALayer),
  L.provide(HttpLayer),
  L.provide(ConfigLive),
  L.provideMerge(FetchHttpClient.layer)
)
