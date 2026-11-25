import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('upload region preserves native acquisition presentation and independent controls', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/upload-presentation.ts', import.meta.url),
    async ({ mountUpload }) => {
      const example = await mountUpload()
      try {
        const { root } = example
        assert.ok(root)
        const chooser = root.querySelector('[data-upload-choose]')
        assert.ok(
          chooser.matches('button.btn-icon'),
          'Bootstrap icon-only chooser button',
        )
        assert.equal(chooser.hidden, false)
        assert.equal(chooser.getAttribute('type'), 'button')
        assert.equal(chooser.getAttribute('aria-label'), 'Image')
        assert.equal(chooser.textContent.trim(), '')
        assert.ok(chooser.querySelector('svg[aria-hidden=true]'))
        assert.equal(root.querySelector('input[type=file]').hidden, true)
        assert.equal(root.getAttribute('role'), 'group')
        assert.equal(root.querySelectorAll('input[type=file]').length, 1)
        assert.deepEqual(Array.from(example.errors), [])
      } finally {
        example.dispose()
      }
    },
  )
})
