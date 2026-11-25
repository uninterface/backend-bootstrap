import type { UiBackendDescriptor } from '@uninterface/uninterface/backend'
import { uiTheme } from '@uninterface/uninterface/theme'
import metadata from '../package.json'
import manifest from '../capabilities.json'
const themeColors = uiTheme.colors.define(manifest.themeColors)

export const uiBackend: UiBackendDescriptor = {
  name: 'Bootstrap 6',
  packageName: metadata.name,
  version: metadata.version,
  description: metadata.description,
  dependencies: [
    { packageName: manifest.backend.name, version: manifest.backend.version },
  ],
  capabilities: manifest.provides,
  themeColors,
}

// Extension names come from the same definitions used at runtime.
declare module '@uninterface/uninterface/theme' {
  interface UiThemeColorExtensions
    extends Record<keyof typeof themeColors, true> {}
}
