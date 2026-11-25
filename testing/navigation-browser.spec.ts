import { test, expect, type Locator } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/travel-navigation-browser.ts', import.meta.url),
)

async function expectCentered(trigger: Locator) {
  const geometry = await trigger.evaluate((node) => {
    const label = node
      .querySelector('.menu-item-content')!
      .getBoundingClientRect()
    const caret = node.querySelector('.combobox-caret')!.getBoundingClientRect()
    return {
      offset: Math.abs(caret.y + caret.height / 2 - label.y - label.height / 2),
      shrink: getComputedStyle(node.querySelector('.combobox-caret')!)
        .flexShrink,
    }
  })
  expect(geometry.offset).toBeLessThanOrEqual(1)
  expect(geometry.shrink).toBe('0')
}

for (const width of [1280, 390]) {
  for (const direction of ['ltr', 'rtl']) {
    test(`Bootstrap navigation caret geometry, motion and ancestry at ${width}px ${direction}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await openFixture(page, { dir: direction })
      const navigation = page.locator('[aria-label="Travel navigation"]')
      const destinations = navigation.getByRole('button', {
        name: 'Destinations',
        exact: true,
      })
      const caret = destinations.locator('.combobox-caret')
      await expectCentered(destinations)
      await expect(caret).toHaveCSS('transition-duration', '0.2s')
      await expect(caret).toHaveCSS('transition-timing-function', 'ease-in-out')
      const before = await destinations.boundingBox()
      await destinations.click()
      await expect(destinations).toHaveAttribute('aria-expanded', 'true')
      await expect(caret).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)')
      const after = await destinations.boundingBox()
      expect(after!.width).toBeCloseTo(before!.width, 1)
      expect(after!.height).toBeCloseTo(before!.height, 1)
      const asia = page.locator('[data-entry-key="asia"]:visible').first()
      const arrow = await asia.evaluate(
        (node) => getComputedStyle(node, '::after').transform,
      )
      await asia.click()
      await page.locator('[data-entry-key="singapore"]:visible').first().click()
      await expect(destinations).toHaveClass(/active/)
      await expect(destinations).toHaveAttribute('aria-expanded', 'false')
      await expect(caret).toHaveCSS('transform', 'none')
      await expect(destinations).not.toHaveAttribute('aria-current')
      await destinations.click()
      await expect(asia).toHaveClass(/active/)
      await expect(asia).not.toHaveAttribute('aria-current')
      await asia.click()
      expect(
        await asia.evaluate(
          (node) => getComputedStyle(node, '::after').transform,
        ),
      ).toBe(arrow)
      await expect(
        page.locator('[data-entry-key="singapore"]:visible').first(),
      ).toHaveAttribute('aria-current', 'page')
      await page.keyboard.press('Escape')
      await expect(asia).toHaveAttribute('aria-expanded', 'false')
      await page.keyboard.press('Escape')
      await expect(destinations).toHaveAttribute('aria-expanded', 'false')
      await expect(caret).toHaveCSS('transform', 'none')
      await expect(destinations).toHaveClass(/active/)
      await expect(destinations).toBeFocused()
      await destinations.click()
      await page.getByRole('button', { name: 'Outside navigation' }).click()
      await expect(destinations).toHaveAttribute('aria-expanded', 'false')
      await expect(caret).toHaveCSS('transform', 'none')
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await expect(caret).toHaveCSS('transition-duration', '0s')
      await destinations.click()
      await expect(caret).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)')
      await destinations.click()
      await expect(caret).toHaveCSS('transform', 'none')
    })
  }
}

for (const direction of ['ltr', 'rtl']) {
  for (const mode of [
    'horizontal',
    'vertical-tree',
    'vertical-popup',
    'icon-popup',
  ]) {
    test(`Bootstrap navigation icon geometry in ${mode} ${direction}`, async ({
      page,
    }) => {
      await openFixture(page, { mode, dir: direction })
      const item = (key: string) =>
        page.locator(`[data-entry-key="${key}"]:visible`)
      const aligned = async (key: string) => {
        const geometry = await item(key).evaluate((row) => {
          const column = row.querySelector(':scope > .menu-item-icon')!
          const icon = column.querySelector('.icon-frame') ?? column
          const copy = row.querySelector(':scope > .menu-item-content')!
          const text = document.createRange()
          text.selectNodeContents(copy)
          const textBox = text.getBoundingClientRect()
          const copyBox = copy.getBoundingClientRect()
          const iconBox = icon.getBoundingClientRect()
          const columnBox = column.getBoundingClientRect()
          const rtl = getComputedStyle(row).direction === 'rtl'
          return {
            textOffset: rtl
              ? copyBox.right - textBox.right
              : textBox.left - copyBox.left,
            gap: rtl
              ? columnBox.left - copyBox.right
              : copyBox.left - columnBox.right,
            nativeGap: parseFloat(getComputedStyle(row).columnGap),
            centerOffset: Math.abs(
              iconBox.y + iconBox.height / 2 - copyBox.y - copyBox.height / 2,
            ),
          }
        })
        expect(Math.abs(geometry.textOffset)).toBeLessThanOrEqual(1)
        expect(Math.abs(geometry.gap - geometry.nativeGap)).toBeLessThanOrEqual(
          1,
        )
        expect(geometry.centerOffset).toBeLessThanOrEqual(1)
      }
      if (mode === 'icon-popup') {
        for (const key of ['overview', 'destinations']) {
          const geometry = await item(key).evaluate((row) => {
            const box = row.getBoundingClientRect()
            const icon = row
              .querySelector('.icon-frame')!
              .getBoundingClientRect()
            const caret = row
              .querySelector('.combobox-caret')
              ?.getBoundingClientRect()
            const rtl = getComputedStyle(row).direction === 'rtl'
            return {
              width: box.width,
              height: box.height,
              x: Math.abs(icon.x + icon.width / 2 - box.x - box.width / 2),
              y: Math.abs(icon.y + icon.height / 2 - box.y - box.height / 2),
              caretY:
                caret &&
                Math.abs(caret.y + caret.height / 2 - icon.y - icon.height / 2),
              separation:
                caret &&
                (rtl ? icon.left - caret.right : caret.left - icon.right),
            }
          })
          expect(
            Math.abs(geometry.width - geometry.height),
          ).toBeLessThanOrEqual(1)
          expect(geometry.width).toBeLessThan(50)
          expect(geometry.x).toBeLessThanOrEqual(1)
          expect(geometry.y).toBeLessThanOrEqual(1)
          if (geometry.caretY !== undefined) {
            expect(geometry.caretY).toBeLessThanOrEqual(1)
            expect(geometry.separation).toBeGreaterThanOrEqual(0)
          }
        }
      } else {
        await aligned('overview')
        await aligned('destinations')
      }
      for (const key of ['destinations', 'asia']) {
        if ((await item(key).getAttribute('aria-expanded')) !== 'true')
          await item(key).click()
        await expect(item(key)).toHaveAttribute('aria-expanded', 'true')
      }
      for (const key of ['asia', 'allDestinations', 'singapore'])
        await aligned(key)
      await item('singapore').click()
      await expect(
        page
          .getByTestId('navigation-content')
          .getByRole('heading', { level: 3 }),
      ).toHaveText('Singapore')
    })
  }
}
