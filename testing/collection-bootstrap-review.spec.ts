import { test, expect, type Locator } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { createUiTest } from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/collection-browser.ts', import.meta.url),
)

const message = 'Minimum amount must not exceed maximum amount.'

async function artwork(button: Locator) {
  return button.locator('svg').evaluate((svg: SVGSVGElement) => {
    const box = svg.getBBox(),
      view = svg.viewBox.baseVal
    return {
      width: box.width / view.width,
      height: box.height / view.height,
      centerX: (box.x + box.width / 2) / view.width,
      centerY: (box.y + box.height / 2) / view.height,
    }
  })
}

for (const scenario of [
  { width: 1500, height: 1000, direction: 'ltr', theme: 'light' },
  { width: 600, height: 650, direction: 'rtl', theme: 'dark' },
]) {
  test(`Bootstrap collection geometry ${scenario.width}px ${scenario.direction} ${scenario.theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(scenario)
    await openFixture(page, { dir: scenario.direction, theme: scenario.theme })
    const table = page.getByRole('table', { name: 'Orders', exact: true })
    const header = page.locator('[data-ui-collection-header]')
    const reset = header.locator('[data-ui-collection-reset]')
    const resetArtwork = await artwork(reset)
    expect(resetArtwork.width).toBeGreaterThan(0.7)
    expect(Math.abs(resetArtwork.centerX - 0.5)).toBeLessThan(0.1)
    expect(Math.abs(resetArtwork.centerY - 0.5)).toBeLessThan(0.1)

    const ui = createUiTest(page, uiTestAdapter)
    const headers = ui.columnHeaders(table)
    const initialHeaderHeight = (await table.locator('thead').boundingBox())!
      .height
    // Sort only two columns; compare text in sorted, unsorted and plain headers.
    for (const name of ['Customer', 'Amount']) {
      const { sortTarget } = await ui
        .columnHeader(headers.filter({ hasText: name }))
        .parts()
      await sortTarget.click()
      expect(
        Math.abs(
          (await table.locator('thead').boundingBox())!.height -
            initialHeaderHeight,
        ),
      ).toBeLessThan(1)
    }
    const centers = await table
      .locator('.bootstrap-table-header')
      .evaluateAll((headers) =>
        headers.map((header) => {
          const walker = document.createTreeWalker(header, NodeFilter.SHOW_TEXT)
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (!node.textContent?.trim()) continue
            const range = document.createRange()
            range.selectNodeContents(node)
            const box = range.getBoundingClientRect()
            return box.top + box.height / 2
          }
          throw new Error('Missing header text')
        }),
      )
    expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(1)
    await expect(table.locator('[data-ui-sort-priority]')).toHaveText([
      '1',
      '2',
    ])
    const trigger = page.locator(
      '[data-ui-column-filter][aria-label^="Filter Amount"]',
    )
    const inactiveColor = await trigger.evaluate(
      (el) => getComputedStyle(el).color,
    )
    await trigger.click()
    const popup = page.getByRole('dialog', {
      name: 'Filter Amount (USD)',
      exact: true,
    })
    const panel = await ui.popover(popup).surface()
    const body = panel.getByRole('region', {
      name: 'Filter Amount (USD)',
      exact: true,
    })
    const frame = panel.locator('[data-ui-input-frame]')
    const initialHeight = (await frame.boundingBox())!.height
    const minimum = page.getByRole('textbox', {
      name: 'Minimum amount (USD)',
      exact: true,
    })
    const maximum = page.getByRole('textbox', {
      name: 'Maximum amount (USD)',
      exact: true,
    })
    const apply = page.getByRole('button', {
      name: 'Apply amount range',
      exact: true,
    })
    const clear = page.getByRole('button', {
      name: 'Clear amount range',
      exact: true,
    })
    for (const button of [apply, clear]) {
      const bounds = await artwork(button)
      expect(bounds.width).toBeGreaterThan(0.65)
      expect(Math.abs(bounds.centerX - 0.5)).toBeLessThan(0.1)
      expect(Math.abs(bounds.centerY - 0.5)).toBeLessThan(0.1)
    }
    const rows = await table.locator('tbody').innerText()
    await minimum.fill('250')
    await maximum.fill('125')
    await apply.click()
    await expect(minimum).toHaveAttribute('aria-invalid', 'true')
    await expect(minimum).toHaveAccessibleDescription(message)
    await expect.poll(() => table.locator('tbody').innerText()).toBe(rows)
    const tooltip = page.getByRole('tooltip').filter({ hasText: message })
    await expect(tooltip).toBeVisible()
    // Visibility alone misses clipping/top-layer occlusion; sample the actual surface.
    await expect
      .poll(() =>
        tooltip.evaluate((el) => {
          const r = el.getBoundingClientRect()
          return [0.1, 0.5, 0.9].every((f) =>
            el.contains(
              document.elementFromPoint(
                r.left + r.width * f,
                r.top + r.height / 2,
              ),
            ),
          )
        }),
      )
      .toBe(true)
    const tipBounds = (await tooltip.boundingBox())!
    expect(tipBounds.x).toBeGreaterThanOrEqual(0)
    expect(tipBounds.y).toBeGreaterThanOrEqual(0)
    expect(tipBounds.x + tipBounds.width).toBeLessThanOrEqual(scenario.width)
    expect(tipBounds.y + tipBounds.height).toBeLessThanOrEqual(scenario.height)
    expect(
      await body.evaluate((el) => el.scrollHeight - el.clientHeight),
    ).toBeLessThanOrEqual(1)
    expect((await frame.boundingBox())!.height).toBe(initialHeight)
    await page.screenshot({ path: info.outputPath('invalid-range.png') })
    // A persistent floating failure must disappear with its owning filter run.
    await page.keyboard.press('Escape')
    await expect(tooltip).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await trigger.click()
    await expect(minimum).toHaveValue('')
    await minimum.fill('125')
    await maximum.fill('250')
    await maximum.press('Enter')
    await expect(tooltip).toHaveCount(0)
    await expect(trigger).toHaveAttribute('data-filter-active')
    await expect
      .poll(() => trigger.evaluate((el) => getComputedStyle(el).color))
      .not.toBe(inactiveColor)
    // Verify the active color is the installed theme's foreground token.
    expect(
      await trigger.evaluate((el) => {
        const probe = document.createElement('span')
        probe.style.color = 'var(--bs-primary-fg)'
        el.append(probe)
        const matches =
          getComputedStyle(probe).color === getComputedStyle(el).color
        probe.remove()
        return matches
      }),
    ).toBe(true)
    await trigger.click()
    await expect(minimum).toHaveValue('125.00')
    await clear.click()
    await expect(trigger).not.toHaveAttribute('data-filter-active')
    await expect
      .poll(() => trigger.evaluate((el) => getComputedStyle(el).color))
      .toBe(inactiveColor)
    if (await popup.count()) await page.keyboard.press('Escape')
    await reset.click()
    await expect(table.locator('[data-ui-sort-priority]')).toHaveCount(0)
    await expect(reset).toBeDisabled()
    expect(
      Math.abs(
        (await table.locator('thead').boundingBox())!.height -
          initialHeaderHeight,
      ),
    ).toBeLessThan(1)
  })
}
