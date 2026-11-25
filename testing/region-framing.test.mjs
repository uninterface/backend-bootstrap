import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// JSDOM cannot resolve native light-dark/color-mix expressions. Check their
// dependencies against the installed toolkit; browser cases check painted CSS.
test('Bootstrap region boundary colors reference available native theme tokens', () => {
  const native = readFileSync(
    new URL(
      '../node_modules/bootstrap/dist/css/bootstrap.css',
      import.meta.url,
    ),
    'utf8',
  )
  const adapter = readFileSync(
    new URL('../src/style.css', import.meta.url),
    'utf8',
  )
  const defined = new Set(
    [...native.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]),
  )
  const colors = [
    ...adapter.matchAll(/--bootstrap-layout-boundary-color:\s*([^;]+);/g),
  ]
  assert.ok(colors.length >= 2, 'both boundary roles have theme color mappings')
  for (const [, expression] of colors) {
    for (const [, token] of expression.matchAll(/var\((--bs-[\w-]+)/g)) {
      assert.ok(
        defined.has(token),
        `${token} must exist in the installed Bootstrap theme`,
      )
    }
  }
})
