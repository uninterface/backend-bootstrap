import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'
import { test, expect } from '@playwright/test'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/temporal-browser.ts', import.meta.url),
)

test('temporal ranges preserve endpoint positions, fit mobile, and share the outer focus/error surface', async ({
  page,
}) => {
  await openFixture(page)
  for (const width of [1100, 390]) {
    await page.setViewportSize({ width, height: 900 })
    for (const kind of ['date', 'time', 'datetime']) {
      const range = page.locator(`[data-range=${kind}]`)
      const frame = range.locator('[data-ui-input-frame]')
      const first = range.locator('input').first()
      const separator = range.locator('.bootstrap-temporal-separator')
      const mode = range.locator('[data-temporal-mode]')
      const initial = await frame.boundingBox()
      await expect(separator).toBeVisible()
      await first.focus()
      await expect(frame).toHaveAttribute('data-focused', '')
      await expect(first).toHaveCSS('border-top-width', '0px')
      await expect(first).toHaveCSS('outline-style', 'none')
      await expect(first).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      for (const value of ['start', 'end', 'unrestricted', 'bounded']) {
        await mode.click()
        await expect(frame).toHaveAttribute('data-engaged', '')
        await page.locator(`[data-temporal-mode-value=${value}]`).click()
        await expect(mode).toBeFocused()
        await expect(separator).toBeVisible()
        await expect(range.locator('[data-temporal-infinity]')).toHaveCount(
          value === 'bounded' ? 0 : value === 'unrestricted' ? 2 : 1,
        )
        const bounds = await frame.boundingBox()
        expect(Math.abs(bounds!.width - initial!.width)).toBeLessThan(1)
        expect(Math.abs(bounds!.height - initial!.height)).toBeLessThan(2)
        for (const element of await range
          .locator(
            'input, [data-temporal-infinity], [data-temporal-clear], .bootstrap-temporal-separator',
          )
          .all()) {
          const box = await element.boundingBox()
          expect(box!.width).toBeGreaterThan(0)
          expect(box!.x).toBeGreaterThanOrEqual(bounds!.x)
          expect(box!.x + box!.width).toBeLessThanOrEqual(
            bounds!.x + bounds!.width + 1,
          )
        }
      }
      if (kind === 'datetime' && width === 390) {
        const start = await range.locator('[data-side=start]').boundingBox()
        const end = await range.locator('[data-side=end]').boundingBox()
        expect(end!.y).toBeGreaterThanOrEqual(start!.y + start!.height)
      }
      await first.fill('unfinished')
      await page.getByLabel('Password', { exact: true }).focus()
      await expect(frame).toHaveClass(/is-invalid/)
      await expect(first).not.toHaveClass(/is-invalid/)
      const trigger = range.locator('[data-temporal-trigger]').first()
      if (await trigger.count()) {
        await trigger.click()
        await expect(frame).toHaveAttribute('data-engaged', '')
        await expect(page.locator('[data-temporal-popup]')).toBeVisible()
        await expect(
          page
            .locator('[data-temporal-popup]')
            .getByRole('button', { name: 'Close', exact: true }),
        ).toHaveCount(0)
        await page.keyboard.press('Escape')
        await expect(trigger).toBeFocused()
      }
    }
    // Reset each independent fixture before the next viewport measurement.
    await page.reload()
  }
})
