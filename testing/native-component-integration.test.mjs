import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('native button variants and indicators follow the declared treatments', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/buttons.ts', import.meta.url),
    async ({ mountButton }) => {
      const treatment = (value) =>
        ({
          filled: 'btn-solid',
          outline: 'btn-outline',
          neutral: 'btn-outline',
          soft: 'btn-subtle',
          text: 'btn-text',
          icon: 'btn-text',
        })[value]
      const strategies = await mountButton({}, { strategy: 'text', icon: true })
      const strategyButton = strategies.host.querySelector('button')
      try {
        assert.ok(strategyButton.classList.contains(treatment('text')))
        await strategies.update({ variant: 'outline' })
        assert.ok(strategyButton.classList.contains(treatment('outline')))
        await strategies.update({ variant: undefined })
        await strategies.updateContent({ strategy: 'soft' })
        assert.ok(strategyButton.classList.contains(treatment('soft')))
      } finally {
        strategies.dispose()
      }
      const example = await mountButton()
      const button = example.host.querySelector('button')
      try {
        for (const color of [
          'primary',
          'success',
          'danger',
          'warning',
          'info',
          'secondary',
          'accent',
        ]) {
          for (const variant of [
            'filled',
            'outline',
            'neutral',
            'soft',
            'text',
          ]) {
            await example.update({ color, variant })
            assert.ok(button.classList.contains(`theme-${color}`))
            assert.ok(button.classList.contains(treatment(variant)))
          }
        }
        await example.update({ color: undefined, variant: undefined })
        assert.ok(button.classList.contains('theme-secondary'))
        assert.ok(button.classList.contains(treatment('filled')))
        const indicator = () => button.querySelector('.spinner-border')
        assert.equal(indicator(), null)
        await example.update({ loading: true })
        assert.ok(indicator())
        await example.update({ loading: false })
        assert.equal(indicator(), null)
      } finally {
        example.dispose()
      }
    },
  ))

test('settings icon uses the native 16px artwork viewport', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/common-icons.ts', import.meta.url),
    async ({ mount }) => {
      for (const custom of [false, true]) {
        const app = await mount(custom)
        try {
          const gear = app.host.querySelector(
            '[data-icons] [data-icon="settings"] svg',
          )
          assert.equal(
            gear.getAttribute('viewBox'),
            '0 0 16 16',
            'Bootstrap gear artwork uses its native 16px viewport, filling and centering in the icon frame',
          )
        } finally {
          app.dispose()
        }
      }
    },
  ))

test('layout density uses the native spacing at each strategy scope', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/layout-density.ts', import.meta.url),
    async ({ mountDensity }) => {
      const expected = [
        'var(--bs-spacer-2)',
        'var(--bs-spacer-7)',
        'var(--bs-spacer-9)',
      ]
      const example = await mountDensity()
      try {
        const root = (name) =>
          example.host.querySelector(`[data-density=${name}]`)
        const spacing = (name, level) => {
          const element = root(name)
          assert.ok(element, name)
          assert.equal(element.style.gap, expected[level + 1], name)
        }

        for (const level of [-1, 1, 0, -1]) {
          await example.update([level])
          for (const name of ['linear', 'flow', 'grid', 'parent', 'nested'])
            spacing(name, level)
          spacing('blocked', 0)
          spacing('reset', 0)
          assert.equal(root('regions').style.gap, '0')
        }
        await example.update([-1, 1])
        for (const name of ['linear', 'flow', 'grid', 'nested'])
          spacing(name, 0)
        await example.update([-1], { depth: 1 })
        for (const name of ['linear', 'flow', 'grid', 'parent'])
          spacing(name, -1)
        spacing('nested', 0)
        await example.update([1], { targets: ['grid-layout'] })
        spacing('grid', 1)
        spacing('linear', 0)
        spacing('flow', 0)
        await example.update([-1], { stopAt: ['layout'] })
        spacing('linear', 0)
        spacing('nested', 0)
        spacing('grid', -1)
        await example.update([])
        for (const name of ['linear', 'flow', 'grid', 'nested'])
          spacing(name, 0)
      } finally {
        example.dispose()
      }
    },
  ))

test('collection footer slots follow the native DOM order', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/collection-footer.ts', import.meta.url),
    async ({ mountCollectionFooter }) => {
      const example = await mountCollectionFooter()
      try {
        const parts = [
          ...example.host.querySelectorAll('#order-footer [data-part]'),
        ]
        assert.deepEqual(
          parts.map((part) => part.dataset.part),
          ['info', 'size', 'paginator', 'jumper'],
        )
      } finally {
        example.dispose()
      }
    },
  ))

test('temporal pickers use their native parts and date format', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/temporal-pickers.ts', import.meta.url),
    async ({ mount }, window) => {
      const demo = await mount()
      const { document } = window
      try {
        const triggers = [
          ...demo.host.querySelectorAll('[data-temporal-trigger]'),
        ]
        const inline = demo.host.querySelector('[data-temporal-inline-time]')
        assert.equal(Boolean(inline), true)
        assert.equal(triggers.length, 2)
        for (const trigger of triggers) {
          const input = trigger
            .closest('[class$="-temporal-editor"]')
            .querySelector('input')
          assert.ok(
            trigger.compareDocumentPosition(input) &
              window.Node.DOCUMENT_POSITION_FOLLOWING,
          )
        }
        await demo.date.field.set('2024-02-15')
        await demo.tick()
        assert.equal(
          demo.host.querySelector('input[aria-label=Date]').value,
          '2024-02-15',
        )
      } finally {
        demo.dispose()
      }
    },
  ))

test('table cell alignment uses physical direction after RTL changes', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/table-sizing.ts', import.meta.url),
    async ({ mountSizing }, window) => {
      Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
        get: () => 800,
      })
      const example = await mountSizing()
      try {
        const cells = () => [
          ...example.host.querySelectorAll(
            'table[aria-label="Sized table"] tbody td',
          ),
        ]
        const matches = (cell, align) => cell.style.textAlign === align
        assert.ok(matches(cells()[1], 'right'))
        assert.ok(matches(cells()[2], 'center'))
        example.host.setAttribute('dir', 'rtl')
        example.align.value = 'left'
        await example.flush()
        assert.ok(matches(cells()[1], 'left'))
      } finally {
        example.dispose()
      }
    },
  ))
