import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { build } from './fixture-build.mjs'

test('Bootstrap button assembly excludes deferred native menu/select/calendar modules', async () => {
  const result = await build({
    logLevel: 'silent',
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/button-only.ts', import.meta.url),
        ),
        formats: ['es'],
      },
      rollupOptions: { external: ['vue'] },
    },
  })
  const modules = (Array.isArray(result) ? result : [result])
    .flatMap((item) => item.output)
    .flatMap((chunk) =>
      chunk.type === 'chunk' ? Object.keys(chunk.modules) : [],
    )
  assert.ok(
    modules.some((path) =>
      path.includes('/uninterface-backend-bootstrap/src/UiButton.vue'),
    ),
  )
  assert.ok(
    !modules.some((path) => /native(Menu|Select)(\.client)?\.ts/.test(path)),
  )
  assert.ok(
    !modules.some((path) =>
      /bootstrap\/js\/dist\/(menu|combobox|collapse|datepicker)\.js/.test(path),
    ),
  )
})
