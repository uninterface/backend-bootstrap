import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

const entry = new URL('./fixtures/presentation.ts', import.meta.url)

test('collapsible uses native presentation and indicator', async () => {
  await withBuiltDomFixture(build, entry, async (fixture) => {
    const example = await fixture.mountExpandedCollapsible()
    try {
      const root = example.host.querySelector('[data-fixture="collapsible"]')
      assert.ok(root)
      assert.ok(root.classList.contains('accordion'))
      assert.ok(
        root.querySelector(
          ':scope > details.accordion-item[open] > summary.accordion-header',
        ),
      )
      assert.ok(root.querySelector('.accordion-icon path'))
      assert.ok(root.querySelector('details > .accordion-body'))
      const item = root.querySelector('details')
      const body = root.querySelector('.accordion-body')
      for (const color of [
        'primary',
        'success',
        'danger',
        'warning',
        'info',
        'secondary',
        'accent',
      ]) {
        await example.update({ color })
        assert.ok(item.classList.contains(`theme-${color}`))
        assert.ok(
          body.classList.contains('theme-reset'),
          'theme tokens stop at the content boundary',
        )
        assert.ok(
          root.querySelector('.badge').classList.contains('theme-warning'),
          'explicit badge color stays independent',
        )
      }
      await example.update({ color: undefined })
      assert.equal(item.className, 'accordion-item')
      assert.equal(body.classList.contains('theme-reset'), false)
      assert.deepEqual(Array.from(example.errors), [])
    } finally {
      example.dispose()
    }
  })
})
