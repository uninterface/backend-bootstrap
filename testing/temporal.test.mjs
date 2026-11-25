import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Bootstrap native date ranges commit both dates, including same-day ranges, without losing drafts', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/temporal.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'Ranges',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((r) => r.output)
    .find((r) => r.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let demo
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(code)
    demo = await dom.window.Ranges.mount()
    const doc = dom.window.document
    const section = (name) => demo.host.querySelector(`[data-case=${name}]`)
    const range = section('range')
    const control = demo.controls.range.field
    const popup = () => doc.querySelector('[data-temporal-range-popup]')
    const trigger = () => range.querySelector('[data-temporal-range-trigger]')
    const state = () => JSON.stringify(control.state.input)
    const pair = (start, end) =>
      JSON.stringify({ start: `2026-03-${start}`, end: `2026-03-${end}` })
    const open = async () => {
      assert.equal(range.querySelectorAll('[data-temporal-trigger]').length, 1)
      trigger().click()
      await demo.tick()
      assert.ok(popup()?.querySelector('[data-vc]'))
      assert.ok(range.querySelector('[data-engaged]'))
      assert.ok(
        ![...popup().querySelectorAll('button')].some(
          (button) => button.textContent.trim() === 'Close',
        ),
      )
    }
    const close = async () => {
      popup().dispatchEvent(
        new dom.window.KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        }),
      )
      await demo.tick()
      assert.equal(popup(), null)
      assert.equal(doc.activeElement, trigger())
    }
    const day = (n) =>
      popup().querySelector(
        `[data-vc-date="2026-03-${String(n).padStart(2, '0')}"] button, button[data-vc-date="2026-03-${String(n).padStart(2, '0')}"]`,
      )
    const choose = async (start, end) => {
      const before = state()
      day(start).click()
      await demo.tick()
      assert.equal(
        state(),
        before,
        'first date is a picker draft, not a partial control update',
      )
      await demo.format('DMY')
      day(end).click()
      await demo.tick()
      assert.equal(popup(), null)
      assert.equal(doc.activeElement, trigger())
    }
    await open()
    assert.ok(
      popup().querySelector('[data-vc-date-selected]'),
      'native range highlighting',
    )
    await choose(5, 7)
    assert.equal(state(), pair('05', '07'))
    await open()
    await choose(5, 7)
    assert.equal(state(), pair('05', '07'), 'unchanged selection still closes')
    await open()
    await choose(9, 6)
    assert.equal(
      state(),
      pair('06', '09'),
      'native reverse selection is normalized',
    )
    await open()
    await choose(8, 8)
    assert.equal(state(), pair('08', '08'))
    assert.equal(
      await control.validate(),
      true,
      'same-day dates are an inclusive one-day interval',
    )
    await open()
    assert.ok(popup().querySelector('[data-vc-date-selected]'))
    day(10).click()
    await demo.tick()
    await close()
    assert.equal(
      state(),
      pair('08', '08'),
      'dismissal discards only the incomplete picker selection',
    )
    await open()
    day(12).click()
    await demo.tick()
    control.reset()
    await demo.tick()
    await choose(5, 6)
    assert.equal(
      state(),
      pair('05', '06'),
      'external reset replaces the pending native selection',
    )

    const editors = [...range.querySelectorAll('input')]
    editors[0].focus()
    editors[0].value = 'unfinished'
    editors[0].dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    await demo.tick()
    editors[1].dispatchEvent(
      new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowDown',
        altKey: true,
        bubbles: true,
      }),
    )
    await demo.tick()
    assert.ok(popup(), 'either endpoint can open the shared picker')
    await close()
    assert.equal(editors[0].value, 'unfinished')
    assert.equal(control.state.input.start, 'unfinished')
    control.reset()
    await demo.tick()

    await open()
    const outside = doc.createElement('button')
    doc.body.append(outside)
    outside.dispatchEvent(
      new dom.window.MouseEvent('pointerdown', { bubbles: true }),
    )
    outside.focus()
    outside.click()
    await demo.tick()
    assert.equal(popup(), null)
    assert.equal(doc.activeElement, outside)
    outside.remove()

    const mode = async (value) => {
      range.querySelector('[data-temporal-mode]').click()
      await demo.tick()
      doc.querySelector(`[data-temporal-mode-value=${value}]`).click()
      await demo.tick()
      assert.equal(
        doc.activeElement,
        range.querySelector('[data-temporal-mode]'),
      )
    }
    await mode('start')
    assert.equal(trigger(), null)
    assert.equal(range.querySelectorAll('[data-temporal-trigger]').length, 1)
    assert.equal(range.querySelectorAll('[data-temporal-infinity]').length, 1)
    await mode('bounded')
    assert.ok(trigger())
    for (const name of ['datetimeRange', 'timeRange']) {
      assert.equal(
        section(name).querySelector('[data-temporal-range-trigger]'),
        null,
      )
      assert.equal(
        section(name).querySelectorAll('[data-temporal-trigger]').length,
        name === 'timeRange' ? 0 : 2,
      )
    }
    for (const value of ['start', 'end', 'unrestricted', 'bounded']) {
      await mode(value)
      assert.equal(
        range.querySelectorAll('[data-temporal-infinity]').length,
        value === 'bounded' ? 0 : value === 'unrestricted' ? 2 : 1,
      )
      assert.equal(
        range.querySelector('.bootstrap-temporal-separator').textContent.trim(),
        '–',
      )
      assert.ok(range.querySelector('.bootstrap-temporal-spacer'))
    }
    const time = section('timeRange')
    assert.ok(time.querySelector('[data-temporal-next-day] svg'))
    time.querySelector('[data-temporal-mode]').click()
    await demo.tick()
    assert.equal(doc.querySelectorAll('[data-temporal-mode-value]').length, 4)
    assert.equal(doc.querySelectorAll('.menu-item-icon svg').length, 3)
    doc.querySelector('[data-temporal-mode-value=unrestricted]').click()
    await demo.tick()
    assert.equal(time.querySelectorAll('[data-temporal-infinity]').length, 2)
    for (const [format, expected] of [
      [undefined, '2026-03-02'],
      ['DMY', '02/03/2026'],
      ['MDY', '03/02/2026'],
    ]) {
      await demo.format(format)
      assert.equal(section('date').querySelector('input').value, expected)
      assert.equal(
        section('independent').querySelector('input').value,
        '03/02/2026',
      )
    }
    await demo.format('YMD')
    const datetime = section('datetime').querySelector('input')
    assert.equal(datetime.value, '2026-03-02 09:05')
    datetime.focus()
    datetime.value = '  2026-3-2   12:33:32  '
    datetime.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    datetime.blur()
    await demo.tick()
    assert.equal(demo.controls.datetime.field.state.input, '2026-03-02T12:33')
    assert.equal(datetime.value, '2026-03-02 12:33')
    await open()
    day(16).click()
    await demo.tick()
    day(18).click()
    await demo.tick()
    assert.ok(popup(), 'ineligible range is rejected without closing')
    assert.equal(state(), pair('02', '04'))
    await close()
    await open()
    await demo.disabled(true)
    assert.equal(popup(), null)
    assert.ok(trigger().disabled)
    await demo.disabled(false)
    await open()
    await demo.readonly(true)
    assert.equal(popup(), null)
    assert.ok(trigger().disabled)
    assert.deepEqual(Array.from(demo.errors), [])
  } finally {
    demo?.dispose()
    dom.window.close()
  }
})
