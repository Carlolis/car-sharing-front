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
import { ApiLayer } from '~/services/api'
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
  L.provideMerge(ApiLayer),
  L.provide(ConfigLive),
  L.provideMerge(FetchHttpClient.layer)
)
