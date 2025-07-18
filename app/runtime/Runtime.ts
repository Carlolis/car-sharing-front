import { DevTools } from '@effect/experimental'
import { FetchHttpClient, Path } from '@effect/platform'
import { NodeContext, NodeFileSystem, NodeSocket } from '@effect/platform-node'
import { Layer, Logger, LogLevel, pipe } from 'effect'
import * as L from 'effect/Layer'
import { IaServiceLayer } from '~/contexts/ia.util'
import { ApiLayer } from '~/services/api'

export const DevToolsLive = DevTools.layerWebSocket().pipe(
  Layer.provide(NodeSocket.layerWebSocketConstructor)
)

export const AppLayer = pipe(
  NodeFileSystem.layer,
  L.provideMerge(Path.layer),
  Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
  L.provideMerge(NodeContext.layer),
  L.provideMerge(IaServiceLayer),
  Layer.provideMerge(ApiLayer),
  L.provideMerge(FetchHttpClient.layer)
)
