import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('native radio and checkbox variants retain semantics at every size', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/checkable-alignment.ts', import.meta.url),
    async ({ mountCheckableAlignment }) => {
      const fixture = await mountCheckableAlignment()
      try {
        const radioGroup = fixture.host.querySelector(
          '[data-checkable-field=radio]',
        )
        const radios = [...radioGroup.querySelectorAll('input')]
        const checks = [
          ...fixture.host.querySelectorAll(
            '[data-checkable-field=checks] input',
          ),
        ]
        assert.ok(radios.length > 1)
        assert.ok(checks.length > 1)
        for (const size of [-2, -1, 0, 1, 2]) {
          await fixture.update({ size })
          const suffix = size < 0 ? '-sm' : size > 0 ? '-lg' : ''
          for (const radio of radios) {
            assert.equal(radio.type, 'radio')
            assert.ok(radio.classList.contains('radio'))
            assert.ok(!radio.classList.contains('check'))
            if (suffix) assert.ok(radio.classList.contains(`radio${suffix}`))
            assert.ok(!radio.classList.contains('check-sm'))
            assert.ok(!radio.classList.contains('check-lg'))
          }
          for (const check of checks) {
            assert.equal(check.type, 'checkbox')
            assert.ok(check.classList.contains('check'))
            if (suffix) assert.ok(check.classList.contains(`check${suffix}`))
          }
        }
        for (const radio of radios) {
          radio.click()
          await fixture.update({})
          assert.equal(radios.filter((input) => input.checked).length, 1)
          assert.equal(radio.checked, true)
        }
        await fixture.update({ size: 0 })
      } finally {
        fixture.dispose()
      }
    },
  ))
