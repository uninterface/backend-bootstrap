# Set up the Bootstrap backend

This guide owns the application integration requirements for `@uninterface/backend-bootstrap`. Business components use `@uninterface/uninterface`; toolkit configuration stays at application assembly.

## Requirements

Use Vue compatible with core's `^3.5.43` peer dependency, Vue-aware TypeScript checking, and Vite with `@vitejs/plugin-vue`. Keep one runtime copy of Vue and core.

## Select Bootstrap

The npm package ships compiled ES modules and TypeScript declarations. Install it under the alias `@uninterface/backend` so Core can resolve its views and integration descriptor.

```sh
npm install @uninterface/uninterface@0.0.3 @uninterface/backend@npm:@uninterface/backend-bootstrap@6.0.0-alpha1
```

Use TypeScript's `Bundler` module resolution to resolve the package's type exports. For source development, resolve `@uninterface/backend` to the checkout and use the workspace's local Core.

## Configure Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

## Initialize the application

```ts
// src/main.ts
import type {} from '@uninterface/backend'
import { createUiApplication } from '@uninterface/uninterface/setup'
import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import App from './App.vue'

const app = createUiApplication(App, { document })
await app.ui.ready
app.mount('#app')
```

The type-only import registers Bootstrap's `accent` color with TypeScript.

No backend Vite plugin is needed. The required `./integration` export is a descriptor consumed automatically by createUiApplication, not a Vue plugin to install directly. The adapter declares Bootstrap 6.0.0-alpha.1 as its dependency. Its stylesheet imports the full Bootstrap CSS, including global document styles; selective CSS packaging is not implemented. The adapter loads individual native JavaScript modules behind browser lifecycle boundaries and bridges their mechanics to core-owned state. Menu, Combobox, Collapse and Datepicker data-API registration does not run during ordinary server imports; see the [collection server-rendering scope](collections.md#server-rendering-and-hydration). Do not initialize additional Bootstrap JavaScript instances or validation behavior on Uninterface-owned controls.

The integration descriptor is loaded by core through the selected alias; business components need no backend imports. Import the stylesheet once. The top-level `document` option grants ownership of document language attributes; omit it for an embedded application. Await readiness before mounting. For SSR/hydration, supply the same explicit `idPrefix` on both sides, create a fresh application per request and call `app.ui.dispose()` in `finally`. The core application-isolation guide defines the verified editing baseline and request-owned business-session cleanup.

Create a minimal `App.vue` to verify the configured application:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UiApp, UiButton, UiContent } from '@uninterface/uninterface'

const acknowledged = ref(false)
</script>

<template>
  <UiApp>
    <UiContent>
      <h1>Application ready</h1>
      <UiButton
        :disabled="acknowledged"
        @click="acknowledged = true"
      >
        Acknowledge
      </UiButton>
      <p v-if="acknowledged" role="status">Acknowledged.</p>
    </UiContent>
  </UiApp>
</template>
```

Mount into the existing Vue application's `#app` element. Use its configured Vite and Vue type-check commands to build/check the source. Confirm that the button responds, becomes disabled and displays the status. This verifies a basic interaction, not every backend capability or browser.

## Scope and verification

The [presentation reference](presentation.md) documents native mappings and limitations; [exports](exports.md) documents assembly modules. Capability declarations describe supported contracts; they do not certify accessibility. Browser keyboard, focus, popup, contrast and scrolling checks remain necessary in addition to builds and DOM simulation.

## Localization and icons

Use `createUiApplication` to install core resources and this backend’s icon catalogue. Core’s application-localization service owns language selection. This backend has no separate native translation pack: its locale declarations use empty native resources, and its UI messages come from core.

Core supplies English, Simplified Chinese, Traditional Chinese and Arabic. The integration declares matching locale identifiers and aliases; `app.ui.i18n.state.value.resolved.backend` reports that resolution even though no native message pack is needed. Additional languages require complete core resources; full RTL requires acceptance beyond translated messages.

The catalogue supplies 58 semantic icon names. Application overrides affect UiIcon and menu entry icons; native internal glyphs retain their toolkit defaults. Assets are bundled locally without an external icon service. See [Bootstrap Icons license](icon-licenses/Bootstrap-Icons.txt) and [Vue wrapper license](icon-licenses/Bootstrap-Icons-Vue.txt) for its bundled subset.

Arabic (`ar`, العربية) uses script-derived RTL direction. No native message pack is needed; Arabic library wording comes from core. `resolved.backend` reports `ar`, including for compatible regional requests. Message and direction support do not certify full RTL layout or browser acceptance.

Request a language through the installed service; do not install another native locale manager:

```ts
await app.ui.i18n.setLocale('zh-Hans')
```

Register your own headings, field labels and business messages through `i18n.resources` at createUiApplication setup. Core packs translate library-owned text, not arbitrary strings in your application. Resource failures retain the previous language; handle the rejected request. Additional catalogue definitions use the setup `icons` option. Exact resource and icon contracts are documented by `@uninterface/uninterface` under `docs/guides/localization-and-icons.md`.

## Color mode

This backend declares `theme.color-mode.v1`. Configure `createUiApplication(App, { colorMode: { document } })` to own the document's appearance; optional `preference` selects light, dark or system and optional `storageKey` enables persistence. Omit ownership in embedded apps to inherit the host. The native document selector is `data-bs-theme="light"` or `data-bs-theme="dark"`; without a host selector, ordinary appearance follows the system. Do not install a competing preference controller. SSR must emit the selector matching the initial resolved mode before hydration. Both ordinary content and popups must receive the same theme.

## Customize presentation

See [customization](customization.md) for supported application-owned styling,
native configuration possibilities and adapter limitations.

See [strategy support](strategies.md) for optional regional preferences, control-size mappings and unsupported values.

## Typography: fonts first, backend styles second

| Choice | First import: fonts |
|---|---|
| **Backend default · Network** (recommended starting setup) | `@uninterface/backend/font.css` |
| **Backend default · Bundled** | `@uninterface/backend/font-bundled.css` |
| **Uninterface default · Network** | `@uninterface/fonts/font.css` |
| **Uninterface default · Bundled** | `@uninterface/fonts/font-bundled.css` |

Import one selected font entry before the stable `@uninterface/backend/style.css`, as shown in the setup example. The Uninterface choices require the optional `@uninterface/fonts` package. Omitting the font import uses system fonts without downloads. See [typography and fonts](typography.md) for installation, CSP, deployment, language coverage and verification steps.

[Native HTML content defaults](native-html.md): supported element baseline, toolkit mappings, setup, spacing and verification limits.


### Common icon assets

The common catalogue supplies 58 semantic names with independent override keys. The November 2026 additions use Bootstrap Icons via `@iconify-json/bi` 1.2.7. Assets are local, with static component imports; no runtime icon service is introduced. Setup includes this bounded catalogue, which grows from 26 to 58 names; individual name-based tree shaking is not promised. Existing native internal glyphs remain private to the backend. See `@uninterface/uninterface` documentation at `docs/api/constants/uiIconNames.md` and `docs/guides/localization-and-icons.md`. See local [asset sources and mappings](icon-licenses/SOURCES.md).
