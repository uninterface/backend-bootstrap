import { test, expect } from '@playwright/test'
import { createUiTest } from '@uninterface/testing/playwright'
import type { Locator, Page } from '@playwright/test'
import { uiTestAdapter } from './index'
import type { mount as mountProgress } from '../../../tests/fixtures/progress-bar'
import type { mount as mountSurfaces } from '../../../tests/fixtures/disabled-surfaces'
import { build } from './fixture-build.mjs'
import {
  openPresentationFixture,
  measureSurfacePaint,
} from '../../../tests/presentation-browser-fixture.mjs'

type ProgressPage = Window & {
  fixture: Awaited<ReturnType<typeof mountProgress>>
}
type SurfacesPage = Window & {
  fixture: Awaited<ReturnType<typeof mountSurfaces>>
}

test('suggestion highlighting stays inline in Bootstrap menu rows', async ({
  page,
}) => {
  await page.goto('/#/features/examples/search')
  const input = page.getByRole('combobox', {
    name: 'Suggested name',
    exact: true,
  })
  await input.fill('al')
  const option = page.getByRole('option', { name: 'Cedar Falls', exact: true })
  const match = option.locator('mark')
  await expect(match).toHaveText('al')
  const spacing = await match.evaluate((mark) => {
    const range = mark.ownerDocument.createRange()
    range.setStartBefore(mark.parentNode!.firstChild!)
    range.setEndBefore(mark)
    const prefix = range.getBoundingClientRect()
    range.setStartAfter(mark)
    range.setEndAfter(mark.parentNode!.lastChild!)
    const suffix = range.getBoundingClientRect()
    const highlighted = mark.getBoundingClientRect()
    return Math.max(
      Math.abs(prefix.top - suffix.top),
      Math.abs(prefix.right - highlighted.left),
      Math.abs(highlighted.right - suffix.left),
    )
  })
  expect(spacing).toBeLessThan(1)

  await input.fill('zzz')
  const status = page.getByRole('status').filter({ hasText: 'No matches.' })
  await expect(status).toBeVisible()
  const padding = await status.evaluate((node) => {
    const style = getComputedStyle(node)
    return Math.min(
      parseFloat(style.paddingInlineStart),
      parseFloat(style.paddingBlockStart),
    )
  })
  expect(padding).toBeGreaterThan(0)
})

test('progress colors use the native semantic palette', async ({ page }) => {
  await openPresentationFixture(
    page,
    build,
    new URL('../../../tests/fixtures/progress-bar.ts', import.meta.url),
    'ProgressBars',
  )
  const ui = createUiTest(page, uiTestAdapter)
  const bar = page.locator('#standalone')
  for (const color of [
    'primary',
    'success',
    'danger',
    'warning',
    'info',
    'secondary',
  ] as const) {
    await page.evaluate(async (color) => {
      const { fixture } = window as unknown as ProgressPage
      fixture.color.value = color
      await fixture.tick()
    }, color)
    const token = '--bs-' + color + '-bg'
    const expected = await bar.evaluate(
      (root, cssColor) => {
        const sample = document.createElement('span')
        sample.style.backgroundColor = cssColor
        root.append(sample)
        const paint = getComputedStyle(sample).backgroundColor
        sample.remove()
        return paint
      },
      'var(' + token + ')',
    )
    expect(
      await ui
        .progressBar(bar)
        .fill.evaluate((node) => getComputedStyle(node).backgroundColor),
    ).toBe(expected)
  }
})

async function focusedPaint(
  page: Page,
  name: 'frame' | 'upload',
  surface: Locator,
) {
  expect(
    await page.evaluate(
      (name) => (window as unknown as SurfacesPage).fixture.focus(name),
      name,
    ),
  ).toBe(true)
  await page.evaluate(async () => {
    await (window as unknown as SurfacesPage).fixture.flush()
    for (const animation of document.getAnimations())
      if (Number.isFinite(animation.effect?.getComputedTiming().endTime))
        animation.finish()
  })
  return measureSurfacePaint(surface)
}

test('upload and input frame use coordinated native focus paint', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPresentationFixture(
    page,
    build,
    new URL('../../../tests/fixtures/disabled-surfaces.ts', import.meta.url),
    'Surfaces',
  )
  const ui = createUiTest(page, uiTestAdapter)
  const frameRoot = page.locator('[data-surface=frame] [data-ui-input-frame]')
  const uploadRoot = page.locator(
    '[data-surface=upload] [data-ui-upload-region]',
  )
  const frameSurface = ui.inputFrame(frameRoot).surface
  for (const mode of ['light', 'dark'] as const)
    for (const retained of [false, true]) {
      await page.evaluate(
        async ({ mode, retained }) => {
          const { fixture } = window as unknown as SurfacesPage
          fixture.mode(mode)
          await fixture.retained(retained)
        },
        { mode, retained },
      )
      const frame = await focusedPaint(page, 'frame', frameSurface)
      const upload = await focusedPaint(
        page,
        'upload',
        (await ui.uploadRegion(uploadRoot)).surface,
      )
      for (const key of [
        'outlineColor',
        'outlineWidth',
        'outlineStyle',
        'outlineOffset',
      ] as const)
        expect(upload[key]).toBe(frame[key])
    }
})

test('feedback footer uses its native action direction', async ({ page }) => {
  await page.goto('/tests/fixtures/floating-feedback.html')
  for (const kind of ['toast', 'notification'] as const) {
    await page.evaluate(async (kind) => {
      window.floating.dispose()
      window.floating = await window.mountFloatingFeedback(
        { duration: null },
        kind,
      )
      window.floating.route.send({
        message: 'Action check',
        actions: [
          { key: 'first', label: 'First' },
          { key: 'next', label: 'Next' },
        ],
      })
    }, kind)
    await expect(page.locator('[data-ui-footer-actions]')).toHaveCSS(
      'flex-direction',
      'row-reverse',
    )
  }
})
