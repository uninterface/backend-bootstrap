import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Bootstrap navigation retains current ancestry independently of expansion in standalone and navbar contexts', async () => {
  const result = await build({
    logLevel: 'silent',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}',
    },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/navigation.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'NavigationExample',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((entry) => entry.output)
    .find((item) => item.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  try {
    const { window } = dom
    installDomEnvironment(window)
    // DOM wiring only; the browser suite checks real geometry and motion.
    window.HTMLElement.prototype.showPopover = function () {}
    window.HTMLElement.prototype.hidePopover = function () {}
    window.HTMLDialogElement.prototype.showModal = function () {
      this.open = true
    }
    window.HTMLDialogElement.prototype.close = function () {
      this.open = false
      this.dispatchEvent(new window.Event('close'))
    }
    window.eval(code)
    for (const navbar of [false, true]) {
      const example = await window.NavigationExample.mountNavigation(navbar)
      try {
        const item = (key) =>
          example.host.querySelector(`[data-entry-key="${key}"]`)
        const destinations = item('destinations')
        const caret = destinations.querySelector('svg')
        assert.ok(destinations.closest('ul').classList.contains('nav'))
        assert.equal(
          destinations.closest('ul').classList.contains('navbar-nav'),
          navbar,
        )
        assert.ok(caret.classList.contains('combobox-caret'))
        assert.equal(destinations.getAttribute('aria-expanded'), 'false')
        assert.equal(destinations.classList.contains('active'), false)
        destinations.click()
        await example.tick()
        item('asia').click()
        await example.tick()
        item('singapore').click()
        await example.tick()
        assert.ok(destinations.classList.contains('active'))
        assert.equal(destinations.getAttribute('aria-expanded'), 'false')
        assert.equal(destinations.classList.contains('show'), false)
        assert.equal(destinations.hasAttribute('aria-current'), false)
        assert.equal(
          destinations.querySelector('svg'),
          caret,
          'caret survives closing for reverse transition',
        )
        assert.equal(item('overview').classList.contains('active'), false)
        destinations.click()
        await example.tick()
        assert.ok(destinations.classList.contains('show'))
        assert.ok(item('asia').classList.contains('active'))
        assert.equal(item('asia').hasAttribute('aria-current'), false)
        item('asia').click()
        await example.tick()
        assert.equal(item('singapore').getAttribute('aria-current'), 'page')
        assert.equal(
          example.host.querySelectorAll('[aria-current=page]').length,
          1,
        )
        item('singapore').dispatchEvent(
          new window.KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          }),
        )
        await example.tick()
        assert.equal(item('asia').getAttribute('aria-expanded'), 'false')
        assert.ok(item('asia').classList.contains('active'))
        item('nearby').click()
        await example.tick()
        destinations.click()
        await example.tick()
        assert.ok(item('nearby').classList.contains('active'))
        assert.equal(item('asia').classList.contains('active'), false)
        await example.setCurrent('overview')
        await example.tick()
        assert.equal(destinations.classList.contains('active'), false)
        assert.equal(destinations.classList.contains('show'), false)
        assert.equal(destinations.getAttribute('aria-expanded'), 'false')
        assert.equal(item('overview').getAttribute('aria-current'), 'page')
        await example.setCurrent('unknown')
        assert.equal(example.host.querySelector('.active'), null)
        assert.deepEqual(Array.from(example.errors), [])
      } finally {
        example.dispose()
      }
    }
    // Only adapter declarations are evaluated by JSDOM; native layered CSS and
    // physical text/icon geometry are covered by the browser scenario.
    const style = window.document.createElement('style')
    style.textContent = readFileSync(
      new URL('../src/style.css', import.meta.url),
      'utf8',
    ).replace(/^@import[^;]+;/gm, '')
    window.document.head.append(style)
    const travel = await window.NavigationExample.mountTravel()
    try {
      assert.deepEqual(Array.from(travel.errors), [])
      const item = (key) =>
        [...window.document.querySelectorAll(`[data-entry-key="${key}"]`)].find(
          (node) => !node.closest('[hidden], [style*="display: none"]'),
        )
      for (const mode of [
        'horizontal',
        'vertical-tree',
        'vertical-popup',
        'icon-popup',
      ]) {
        await travel.setPresentation(mode)
        for (const key of ['overview', 'destinations']) {
          const row = item(key)
          assert.equal(window.getComputedStyle(row).textAlign, 'start')
          const icon = row.querySelector(':scope > .menu-item-icon')
          assert.equal(window.getComputedStyle(icon).display, 'inline-flex')
          assert.equal(window.getComputedStyle(icon).alignItems, 'center')
          if (mode === 'icon-popup') {
            assert.equal(window.getComputedStyle(row).justifyContent, 'center')
            assert.ok(
              row.getAttribute('aria-label'),
              'rail retains its accessible name',
            )
          }
        }
        if (mode === 'icon-popup')
          assert.equal(
            window.getComputedStyle(
              item('destinations').querySelector('.combobox-caret'),
            ).position,
            'absolute',
          )
        for (const key of ['destinations', 'asia']) {
          if (item(key).getAttribute('aria-expanded') !== 'true')
            item(key).click()
          await travel.tick()
        }
        for (const key of ['asia', 'allDestinations', 'singapore']) {
          const row = item(key)
          assert.equal(window.getComputedStyle(row).textAlign, 'start')
          assert.equal(
            row.classList.contains('bootstrap-navigation-rail-item'),
            false,
          )
          assert.equal(
            window.getComputedStyle(
              row.querySelector(':scope > .menu-item-icon'),
            ).display,
            'inline-flex',
          )
        }
        item('singapore').click()
        await travel.tick()
        assert.equal(
          travel.host
            .querySelector('[data-testid="navigation-content"] h3')
            .textContent.trim(),
          'Singapore',
        )
      }
      assert.deepEqual(Array.from(travel.errors), [])
    } finally {
      travel.dispose()
    }
  } finally {
    dom.window.close()
  }
})
