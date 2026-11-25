import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Bootstrap single/multiple combobox delegates selection, supports typeahead and preserves popup keyboard mechanics', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('../src/nativeSelect.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'SelectBridge',
      },
    },
  })
  const bundle = (Array.isArray(result) ? result : [result])
    .flatMap((entry) => entry.output)
    .find((item) => item.type === 'chunk').code
  const dom = new JSDOM(
    '<!doctype html><body><div><button class="combobox-toggle"><span class="combobox-value">Retained</span></button><div class="menu" popover="manual"><button class="menu-item" data-bs-value="" aria-selected="false">Empty key</button><button class="menu-item selected" data-bs-value="locked" aria-selected="true" disabled>Locked</button><button class="menu-item" data-bs-value="last" aria-selected="false">Last</button></div></div></body>',
    {
      url: 'http://localhost/',
      runScripts: 'outside-only',
      pretendToBeVisual: true,
    },
  )
  try {
    const { window } = dom
    installDomEnvironment(window)
    const errors = []
    window.console.error = (...values) => errors.push(values.join(' '))
    let popoverOpen = false
    window.HTMLElement.prototype.showPopover = function () {
      popoverOpen = true
    }
    window.HTMLElement.prototype.hidePopover = function () {
      popoverOpen = false
    }
    // jsdom has no layout. Only establish visibility for native keyboard tests.
    window.HTMLElement.prototype.getClientRects = function () {
      return [new window.DOMRect(0, 0, 100, 30)]
    }
    window.eval(bundle)
    const NativeSelect = await window.SelectBridge.loadNativeSelect()
    const trigger = window.document.querySelector('.combobox-toggle')
    const items = [...window.document.querySelectorAll('.menu-item')]
    const native = new NativeSelect(trigger, {
      multiple: true,
    })
    const requests = []
    native.requestSelection = (key) => requests.push(key)
    await native.show()
    assert.equal(popoverOpen, true)
    assert.equal(trigger.getAttribute('aria-expanded'), 'true')
    items[0].click()
    items[1].click()
    assert.deepEqual(requests, [''])
    assert.equal(items[0].getAttribute('aria-selected'), 'false')
    assert.equal(items[1].getAttribute('aria-selected'), 'true')
    assert.equal(trigger.textContent, 'Retained')
    trigger.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    )
    assert.equal(window.document.activeElement, items[0])
    items[0].dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    )
    assert.equal(window.document.activeElement, items[2])
    items[2].dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    )
    assert.deepEqual(requests, ['', 'last'])
    items[2].dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    )
    assert.equal(popoverOpen, false)
    assert.equal(trigger.getAttribute('aria-expanded'), 'false')
    assert.equal(window.document.activeElement, trigger)
    await native.show()
    assert.equal(popoverOpen, true)
    native.dispose()
    assert.deepEqual(errors, [])
    assert.equal(popoverOpen, false)
    items[0].click()
    assert.deepEqual(requests, ['', 'last'])

    // Single selection closes only after an accepted request. Repeated keys
    // cycle, prefixes narrow, and disabled candidates never receive focus.
    const extra = window.document.createElement('button')
    extra.className = 'menu-item'
    extra.dataset.bsValue = 'lime'
    extra.textContent = 'Lime'
    items[2].after(extra)
    const single = new NativeSelect(trigger, {
      multiple: false,
    })
    const selections = []
    single.requestSelection = (key) => {
      selections.push(key)
      return true
    }
    const key = (target, value, extra = {}) =>
      target.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: value,
          bubbles: true,
          cancelable: true,
          ...extra,
        }),
      )
    trigger.focus()
    key(trigger, 'l')
    assert.equal(window.document.activeElement, items[2])
    key(items[2], 'l')
    assert.equal(window.document.activeElement, extra)
    key(extra, 'Enter')
    assert.deepEqual(selections, ['lime'])
    assert.equal(popoverOpen, false)
    assert.equal(window.document.activeElement, trigger)
    assert.equal(
      trigger.textContent,
      'Retained',
      'Vue owns the displayed value',
    )
    key(trigger, 'e')
    key(items[0], 'm')
    assert.equal(window.document.activeElement, items[0])
    key(items[0], ' ')
    assert.deepEqual(selections, ['lime', ''])
    assert.equal(popoverOpen, false)
    key(trigger, 'End')
    assert.equal(window.document.activeElement, extra)
    key(extra, 'Home')
    assert.equal(window.document.activeElement, items[0])
    single.requestSelection = () => false
    key(items[0], 'Enter')
    assert.equal(popoverOpen, true, 'a denied request cannot close the picker')
    key(items[0], 'Escape')
    key(trigger, 'x', { isComposing: true })
    assert.equal(popoverOpen, false, 'IME composition is not typeahead')
    single.dispose()

    // Missing selected options disappear when removed. Retain a keyboard
    // destination in the open popup, including when no items remain.
    const removable = new NativeSelect(trigger, {
      multiple: true,
    })
    removable.requestSelection = (value) => {
      window.document.querySelector(`[data-bs-value="${value}"]`).remove()
      return true
    }
    await removable.show()
    extra.focus()
    key(extra, ' ')
    await Promise.resolve()
    assert.equal(window.document.activeElement, items[2])
    key(items[2], 'Escape')
    assert.equal(popoverOpen, false)
    assert.equal(window.document.activeElement, trigger)
    await removable.show()
    items[2].focus()
    key(items[2], ' ')
    await Promise.resolve()
    assert.equal(window.document.activeElement, items[0])
    key(items[0], ' ')
    await Promise.resolve()
    assert.equal(window.document.activeElement, trigger)
    removable.dispose()
    assert.deepEqual(errors, [])
  } finally {
    dom.window.close()
  }
})
