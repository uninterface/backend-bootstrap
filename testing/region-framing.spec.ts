import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/region-framing-browser.ts', import.meta.url),
)

test('Bootstrap flat regions have a painted header separator and a navbar that preserves the frame surface', async ({
  page,
}) => {
  await openFixture(page)
  const layout = page.getByTestId('region-example-layout')
  const navbar = layout.getByRole('navigation', { name: 'Example navigation' })
  await expect(navbar).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(navbar).toHaveAttribute('data-navigation-boundary', 'none')
  for (const direction of ['Vertical', 'Horizontal']) {
    await page.getByRole('button', { name: direction, exact: true }).click()
    const header = layout.locator('[data-boundary-role=start]')
    const footer = layout.locator('[data-boundary-role=end]')
    const color = await header.evaluate(
      (node) => getComputedStyle(node).backgroundColor,
    )
    expect(color).not.toBe('rgba(0, 0, 0, 0)')
    expect(color).not.toBe('transparent')
    expect(color).not.toBe(
      await footer.evaluate((node) => getComputedStyle(node).backgroundColor),
    )
    const rect = (await header.boundingBox())!
    expect(direction === 'Vertical' ? rect.height : rect.width).toBeGreaterThan(
      0,
    )
    const frame = navbar.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " bootstrap-card ")][1]',
    )
    await expect(frame).toHaveCSS('overflow', 'visible')
    const frameBox = (await frame.boundingBox())!
    const navBox = (await navbar.boundingBox())!
    expect(navBox.x).toBeGreaterThanOrEqual(frameBox.x)
    expect(navBox.y).toBeGreaterThanOrEqual(frameBox.y)
    expect(navBox.x + navBox.width).toBeLessThanOrEqual(
      frameBox.x + frameBox.width,
    )
    const link = navbar.getByRole('link', { name: 'Example link' })
    await link.focus()
    await expect(link).toBeFocused()
  }
})
