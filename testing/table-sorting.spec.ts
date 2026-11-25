import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/table-sorting.ts', import.meta.url),
)

test('Bootstrap sort artwork fills and centers in its icon viewport', async ({
  page,
}) => {
  await openFixture(page)
  const header = page.getByRole('columnheader').filter({ hasText: 'Amount' })
  await expect(header).toBeVisible()
  for (const state of [null, 'ascending', 'descending']) {
    if (state) {
      await header.locator('button').click()
      await expect(header).toHaveAttribute('aria-sort', state)
    }
    const bounds = await header
      .locator('svg')
      .evaluate((node: SVGSVGElement) => {
        const artwork = node.getBBox()
        const viewport = node.viewBox.baseVal
        return {
          width: artwork.width / viewport.width,
          height: artwork.height / viewport.height,
          centerX:
            (artwork.x + artwork.width / 2 - viewport.x) / viewport.width,
          centerY:
            (artwork.y + artwork.height / 2 - viewport.y) / viewport.height,
        }
      })
    expect(bounds.width).toBeGreaterThan(0.75)
    expect(bounds.height).toBeGreaterThan(0.65)
    expect(Math.abs(bounds.centerX - 0.5)).toBeLessThan(0.1)
    expect(Math.abs(bounds.centerY - 0.5)).toBeLessThan(0.1)
  }
})
