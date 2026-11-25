import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Bootstrap popovers consume native opaque presentation on fresh and subsequent runs', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/popover-presentation.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'Overlays',
      },
    },
  })
  const bundle = (Array.isArray(result) ? result : [result])
    .flatMap((entry) => entry.output)
    .find((item) => item.type === 'chunk').code
  const nativeCss = await readFile(
    new URL(import.meta.resolve('bootstrap/dist/css/bootstrap.css')),
    'utf8',
  )
  // Exercise the installed toolkit's stable opacity rules against real mounted
  // views. JSDOM cannot evaluate its cascade layers, starting styles or motion;
  // the browser regression separately checks the complete assembled cascade.
  const rules = nativeCss.match(/\.popover(?:\.show)? \{[^}]*\}/g)
  assert.equal(rules?.length, 2, 'review native visibility rules on upgrades')
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let example
  try {
    const win = dom.window,
      doc = win.document
    installDomEnvironment(win)
    win.HTMLDialogElement.prototype.showModal = function () {
      this.open = true
    }
    win.HTMLDialogElement.prototype.close = function () {
      this.open = false
    }
    const style = doc.createElement('style')
    style.textContent = rules.join('\n')
    doc.head.append(style)
    win.eval(bundle)
    example = await win.Overlays.mountPopover()
    const tick = () => new Promise((resolve) => setTimeout(resolve, 40))
    for (const modal of [false, true]) {
      example.popoverModal.value = modal
      await tick()
      for (const preceding of ['fresh', 'modal drawer', 'panel drawer']) {
        if (preceding === 'modal drawer') {
          const run = example.drawer.run()
          await tick()
          await example.drawer.state.session.cancel()
          await run
        } else if (preceding === 'panel drawer') {
          doc.querySelector('#panel-trigger').click()
          await tick()
          doc.querySelector('#panel-trigger').click()
          await tick()
        }
        const trigger = doc.querySelector('#popover-trigger')
        trigger.focus()
        const run = example.popover.run()
        await tick()
        assert.deepEqual(Array.from(example.errors), [])
        assert.equal(example.popover.state.phase, 'open')
        const surface = doc.querySelector('[data-ui-overlay="popover"]')
        assert.equal(
          win.getComputedStyle(surface).opacity,
          '1',
          `${modal ? 'modal' : 'nonmodal'} popover is opaque after ${preceding}`,
        )
        await example.popover.state.session.complete('saved')
        assert.equal((await run).value, 'saved')
        await tick()
        assert.equal(doc.querySelector('[data-ui-overlay="popover"]'), null)
        assert.equal(doc.activeElement, trigger)
      }
    }
  } finally {
    await example?.dispose()
    dom.window.close()
  }
})
