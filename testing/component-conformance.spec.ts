import { expect, test, type Page } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import {
  createUiTest,
  expectContainedFocusPaint,
} from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/native-conformance.ts', import.meta.url),
)
const uiTest = (page: Page) => createUiTest(page, uiTestAdapter)

test('Bootstrap paints inset focus on each native segment label', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'segmented-focus' })
  const group = uiTest(page).radioGroup({ name: 'Choices' })
  await expect(group.option('one')).toBeChecked()
  await page.keyboard.press('Tab')
  for (const key of ['one', 'two', 'three']) {
    const option = group.option(key)
    // Programmatic focus exercises unselected paint without changing the selection.
    await option.focus()
    await expect(option).toBeFocused()
    await expectContainedFocusPaint({
      target: option
        .locator('xpath=ancestor::label[1]')
        .and(page.locator('.btn-check')),
      kind: 'outline',
      inset: true,
    })
  }
})

test('Bootstrap input focus follows the theme ring tokens', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'fields' })
  const name = page.getByRole('textbox', { name: 'Name', exact: true })
  await expect(name).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(name).toBeFocused()
  await expect(name).toHaveCSS('outline-style', 'solid')
  const original = await name.evaluate(
    (node) => getComputedStyle(node).outlineColor,
  )
  expect(original).not.toBe('rgb(131, 18, 143)')
  await page.addStyleTag({
    content:
      ':root { --bs-focus-ring-color: rgb(131 18 143); --bs-focus-ring-width: 5px; }',
  })
  await expect(name).toHaveCSS('outline-color', 'rgb(131, 18, 143)')
  await expect(name).toHaveCSS('outline-width', '5px')
})

test('Bootstrap required suffix and checkbox help use native field presentation', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'fields' })
  for (const name of ['Name', 'Category']) {
    const editor = page.getByRole(
      name === 'Category' ? 'combobox' : 'textbox',
      { name, exact: true },
    )
    await expect(editor).toHaveAttribute('aria-required', 'true')
    const field = page.locator('.form-field').filter({ has: editor })
    const label = field.locator('label.bootstrap-required')
    await expect(label).toBeVisible()
    await expect(label).toHaveText(name)
    const marker = await label.evaluate((element) => {
      const pseudo = getComputedStyle(element, '::after')
      const probe = document.createElement('span')
      probe.style.color = 'var(--bs-danger-fg)'
      element.append(probe)
      const danger = getComputedStyle(probe).color
      probe.remove()
      return { content: pseudo.content, color: pseudo.color, danger }
    })
    expect(marker.content).toContain('*')
    expect(marker.color).toBe(marker.danger)
  }
  const checkbox = page.getByRole('checkbox', { name: 'Enabled' })
  const field = page.locator('.form-field').filter({ has: checkbox })
  const content = checkbox.locator('+ .form-field-content')
  await expect(content.locator('label')).toHaveText('Enabled')
  await expect(content.locator('small.form-text')).toHaveText(
    'Allow notifications.',
  )
  await expect(content.locator('label')).not.toHaveClass(/\bform-label\b/)
  await expect(field.locator('.bootstrap-required')).toHaveCount(0)
  await expect(page.locator('.bootstrap-field.form-field.mb-4')).toHaveCount(0)
  await expect(checkbox).toHaveAccessibleDescription('Allow notifications.')
  await content.locator('label').click()
  await expect(checkbox).toBeChecked()
})

test('Bootstrap command menu uses its native rows, heading and separators', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'commands' })
  await page.getByRole('button', { name: 'Open commands' }).click()
  const menu = page.getByRole('menu', { name: 'Commands', exact: true })
  await expect(menu).toContainClass('menu')
  await expect(
    menu.getByRole('menuitemcheckbox', { name: 'Copy' }),
  ).toContainClass('menu-item')
  await expect(menu.locator('.menu-header')).toHaveText('Actions')
  await expect(menu.locator('.menu-header')).toBeVisible()
  const dividers = menu.locator('.menu-divider')
  await expect(dividers).toHaveCount(2)
  for (const divider of await dividers.all())
    await expect(divider).toBeVisible()
})
