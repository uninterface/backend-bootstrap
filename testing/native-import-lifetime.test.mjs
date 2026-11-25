import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Bootstrap native bridges import without DOM globals and retain early input/disposal during initialization', async () => {
  assert.equal(typeof document, 'undefined')
  const menuBridge = await import('../src/nativeMenu.ts')
  const selectBridge = await import('../src/nativeSelect.ts')
  assert.equal(typeof menuBridge.loadNativeMenu, 'function')
  assert.equal(typeof selectBridge.loadNativeSelect, 'function')
  assert.equal(typeof document, 'undefined')
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"development"', 'process.env': '{}' },
    plugins: [
      {
        name: 'delay-bootstrap-native-imports-for-lifetime-test',
        transform(code, id) {
          if (/\/native(Menu|Select)\.ts$/.test(id))
            return code.replace(
              'return (await import(',
              'await globalThis.__bootstrapNativeReady; return (await import(',
            )
        },
      },
    ],
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/native-lifetime.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'NativeLifetime',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((item) => item.output)
    .find((item) => item.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'http://localhost/',
  })
  try {
    const window = dom.window
    installDomEnvironment(window)
    window.HTMLElement.prototype.getClientRects = function () {
      return [new window.DOMRect(0, 0, 100, 30)]
    }
    const errors = []
    window.console.error = (...args) => errors.push(args.map(String).join(' '))
    window.eval(code)
    const settle = () => new Promise((resolve) => setTimeout(resolve, 40))
    for (const intent of [
      'dispose',
      'pointer',
      'select-keyboard',
      'menu-keyboard',
      'cancel',
      'double-click',
    ]) {
      let release
      window.__bootstrapNativeReady = new Promise((resolve) => {
        release = resolve
      })
      const example = await window.NativeLifetime.prepare()
      example.mount()
      // The IIFE resolves component message packs in microtasks after mount.
      await new Promise(setImmediate)
      assert.deepEqual(Array.from(example.errors), [], 'fixture mount')
      const trigger = example.host.querySelector('[role=combobox]')
      assert.ok(trigger, 'the category combobox is mounted')
      if (intent === 'menu-keyboard') {
        const first = example.host.querySelector('[data-entry-key=first]')
        first.focus()
        first.dispatchEvent(
          new window.KeyboardEvent('keydown', {
            key: 'ArrowDown',
            bubbles: true,
            cancelable: true,
          }),
        )
      } else if (intent === 'select-keyboard') {
        trigger.dispatchEvent(
          new window.KeyboardEvent('keydown', {
            key: 'Home',
            bubbles: true,
            cancelable: true,
          }),
        )
      } else trigger.click()
      if (intent === 'cancel')
        trigger.dispatchEvent(
          new window.KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          }),
        )
      if (intent === 'double-click') trigger.click()
      if (intent === 'dispose') example.dispose()
      release()
      await settle()
      assert.deepEqual(Array.from(example.errors), [], intent)
      if (intent === 'dispose') assert.equal(example.host.isConnected, false)
      else {
        if (intent === 'menu-keyboard')
          assert.equal(window.document.activeElement.dataset.entryKey, 'second')
        else if (['cancel', 'double-click'].includes(intent))
          assert.equal(trigger.getAttribute('aria-expanded'), 'false', intent)
        else assert.equal(trigger.getAttribute('aria-expanded'), 'true', intent)
        example.dispose()
      }
      await settle()
      assert.deepEqual(Array.from(example.errors), [], `${intent} cleanup`)
    }
    assert.deepEqual(errors, [])
  } finally {
    dom.window.close()
  }
})
