import { test } from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { readFile } from 'node:fs/promises'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

const entry = new URL('./fixtures/feedback-presentation.ts', import.meta.url)
test('Bootstrap feedback consumes native v6 toast theme, discrete fade and close control', async () => {
  const css = await readFile(
    new URL('../src/style.css', import.meta.url),
    'utf8',
  )
  const nativeCss = await readFile(
    new URL(import.meta.resolve('bootstrap/scss/_toasts.scss')),
    'utf8',
  )
  assert.match(nativeCss, /@starting-style/)
  assert.match(nativeCss, /allow-discrete/)
  assert.match(nativeCss, /box-shadow: var\(--toast-box-shadow\)/)
  // Match direct focus against the native CSS rule. Paint is verified in the browser.
  const focusRule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(
    ([, selector, declarations]) =>
      selector.includes(':has(') &&
      selector.includes('feedback') &&
      /outline:/.test(declarations),
  )
  assert.ok(focusRule)
  const focusedSurface = focusRule[1]
    .trim()
    .replaceAll(':focus-visible', ':focus')
  assert.match(css, /feedback-viewport\s*\{[^}]*padding: 1rem;/s)

  await withBuiltDomFixture(build, entry, async ({ mountFeedback }, window) => {
    for (const kind of ['toast', 'notification']) {
      const example = await mountFeedback({ duration: null }, kind)
      try {
        const handle = example.send(`${kind} native surface`, true)
        await delay(150)
        const item = window.document.getElementById(handle.id)
        assert.ok(item)
        const content = item.querySelector('.bootstrap-feedback-content')
        assert.ok(content)
        assert.equal(content.getAttribute('role'), 'region')
        const surface = content.closest('.bootstrap-feedback-item')
        assert.ok(surface)
        function verifyCue(target, expected) {
          assert.ok(target)
          target.focus()
          assert.equal(window.document.activeElement, target)
          assert.equal(surface.matches(focusedSurface), expected)
        }
        verifyCue(content, true)
        verifyCue(content.querySelector('input'), false)
        verifyCue(item.querySelector('button[aria-label="Close"]'), false)
        verifyCue(item.querySelector('[data-ui-footer-actions] button'), false)
        verifyCue(content, true)
        content.blur()
        assert.equal(surface.matches(focusedSurface), false)

        assert.ok(item.matches('.toast.show.theme-info'))
        if (kind === 'toast') {
          assert.equal(item.querySelector('.toast-header'), null)
          assert.ok(item.querySelector('.toast-body .btn-close'))
          assert.ok(item.querySelector('.bootstrap-toast-title'))
        } else {
          assert.ok(item.querySelector('.toast-header .btn-close'))
          assert.equal(item.querySelector('.bootstrap-toast-title'), null)
        }
        assert.ok(item.querySelector('.toast-body input'))
        assert.ok(!item.classList.contains('toast-instant'))
        handle.update({ kind: 'success' })
        await example.flush()
        assert.ok(
          item.matches('.toast.show.theme-success'),
          'a reactive color update retains native visibility',
        )
        item.querySelector('.btn-close').click()
        await delay(150)
        assert.equal(handle.phase, 'closed')
        assert.equal(await handle.closed, 'dismissed')
        assert.deepEqual(Array.from(example.state.errors), [])
      } finally {
        example.dispose()
      }
    }
  })
})
