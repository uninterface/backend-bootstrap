import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { createUiTest } from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/select-browser.ts', import.meta.url),
)

// Shared suites cover values, sources and codecs. These cases exercise the
// Bootstrap picker keyboard extension and native floating-label integration.
test('Bootstrap single picker typeahead cycles duplicate labels and commits one value', async ({
  page,
}) => {
  await openFixture(page)
  const host = page.getByTestId('editor-0')
  const picker = createUiTest(page, uiTestAdapter)
    .within(host)
    .select({ name: 'Choice' })
  await picker.control.focus()
  await picker.control.press('s')
  const choices = await picker.candidates()
  await expect(choices.nth(0)).toBeFocused()
  await page.keyboard.press('s')
  await expect(choices.nth(1)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(host.getByTestId('value')).toHaveText('second"\\特殊')
  await expect(picker.control).toHaveAttribute('aria-expanded', 'false')
  await expect(picker.control).toBeFocused()
  await picker.open()
  await page.keyboard.press('End')
  await expect(choices.nth(1)).toBeFocused() // Last enabled choice.
  await page.keyboard.press('Home')
  await expect(choices.nth(0)).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(host.getByTestId('value')).toHaveText('second"\\特殊')
})

test('Bootstrap single picker selection and Escape do not submit or close its modal', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'modal' })
  await page.getByRole('button', { name: 'Edit record', exact: true }).click()
  const dialog = page.getByRole('dialog', {
    name: 'Record dialog',
    exact: true,
  })
  const picker = createUiTest(page, uiTestAdapter).select({ name: 'Category' })
  await picker.control.focus()
  await picker.control.press('s')
  await expect(
    (await picker.candidates()).filter({ hasText: /^Supplier$/ }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await picker.expectLabel('Supplier')
  await expect(dialog).toBeVisible()
  await expect(picker.control).toBeFocused()
  await picker.open()
  await picker.control.focus()
  await picker.control.press('Escape')
  await expect(dialog).toBeVisible()
  await expect(picker.control).toHaveAttribute('aria-expanded', 'false')
})

test('Bootstrap composite single picker retains native floating-label geometry', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'floating' })
  const picker = page.getByRole('combobox', {
    name: 'Choose an item',
    exact: true,
  })
  await expect(picker).toHaveClass(/form-control/)
  const native = await picker.evaluate((node) => {
    const field = node.closest('.form-floating')
    const label = field?.querySelector(
      ':scope > label',
    ) as HTMLLabelElement | null
    const style = getComputedStyle(node)
    return {
      associated: label?.htmlFor === node.id,
      direct: node.parentElement === field,
      floated: Boolean(label && getComputedStyle(label).transform !== 'none'),
      top: parseFloat(style.paddingTop),
      bottom: parseFloat(style.paddingBottom),
    }
  })
  expect(native.associated && native.direct && native.floated).toBe(true)
  expect(native.top).toBeGreaterThan(native.bottom)
})
