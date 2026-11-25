import { waitForPresentation } from '@uninterface/testing/playwright'
import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/presentation-browser.ts', import.meta.url),
)

test('Bootstrap context-menu width follows content and viewport, not its previous position', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openFixture(page, { scenario: 'menu' })
  const record = page.getByRole('group', { name: 'Sample record: Alex Morgan' })
  await record.scrollIntoViewIfNeeded()
  await record.click({ button: 'right', position: { x: 20, y: 20 } })
  const menu = page.getByRole('menu', { name: 'Record actions', exact: true })
  await waitForPresentation(menu)
  const naturalWidth = (await menu.boundingBox())!.width
  await menu.press('Escape')
  await expect(menu).toHaveCount(0)
  const recordBox = (await record.boundingBox())!
  await record.click({
    button: 'right',
    position: { x: recordBox.width - 20, y: recordBox.height - 20 },
  })
  await waitForPresentation(menu)
  const refresh = menu.getByRole('menuitem', { name: 'Refresh', exact: true })
  await refresh.focus()
  for (const width of [1280, 640, 400, 240, 400, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(refresh).toBeFocused()
    await expect
      .poll(async () => {
        const box = (await menu.boundingBox())!
        return Math.abs(box.width - Math.min(naturalWidth, width))
      })
      .toBeLessThanOrEqual(1)
    await expect
      .poll(() =>
        refresh.locator('.menu-item-content').evaluate((copy) => {
          const text = [...copy.childNodes].find(
            (node) =>
              node.nodeType === Node.TEXT_NODE &&
              node.textContent?.includes('Refresh'),
          )!
          const start = text.textContent!.indexOf('Refresh')
          const range = document.createRange()
          range.setStart(text, start)
          range.setEnd(text, start + 'Refresh'.length)
          return range.getClientRects().length
        }),
      )
      .toBe(1)
    await expect
      .poll(async () => {
        const box = (await menu.boundingBox())!
        return box.x >= -1 && box.x + box.width <= width + 1
      })
      .toBe(true)
  }
})

for (const width of [1280, 390]) {
  for (const direction of ['ltr', 'rtl'] as const) {
    test(`Bootstrap drawer close control uses the full header (${width}px, ${direction})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await openFixture(page, { scenario: 'overlays' })
      await page.evaluate((dir) => {
        document.documentElement.dir = dir
      }, direction)
      for (const mode of ['modal', 'panel']) {
        const trigger = page.getByTestId(
          mode === 'modal' ? 'open-modal-drawer' : 'toggle-panel-drawer',
        )
        await trigger.click()
        const drawer = page.locator('[data-ui-overlay="drawer"]:visible')
        await waitForPresentation(drawer)
        const header = drawer.locator('.drawer-header')
        const close = header.getByRole('button', { name: 'Close', exact: true })
        await expect(close).toBeVisible()
        for (const longTitle of [false, true]) {
          const bounds = await header.evaluate((element, long) => {
            const title = element.querySelector('h2')!
            if (long) title.textContent = 'LongUnbrokenDrawerTitle'.repeat(12)
            const button = element.querySelector('button')!
            const style = getComputedStyle(element)
            const box = element.getBoundingClientRect()
            const control = button.getBoundingClientRect()
            const text = title.getBoundingClientRect()
            const rtl = style.direction === 'rtl'
            return {
              endInset: rtl
                ? control.left - box.left
                : box.right - control.right,
              expectedInset: parseFloat(style.paddingInlineEnd),
              separation: rtl
                ? text.left - control.right
                : control.left - text.right,
              contained: text.left >= box.left && text.right <= box.right,
              buttonWidth: control.width,
            }
          }, longTitle)
          expect(bounds.expectedInset).toBeGreaterThan(0)
          expect(bounds.endInset).toBeCloseTo(bounds.expectedInset, 0)
          expect(bounds.separation).toBeGreaterThan(0)
          expect(bounds.contained).toBe(true)
          expect(bounds.buttonWidth).toBeGreaterThan(0)
        }
        await close.focus()
        await expect(close).toBeFocused()
        await page.keyboard.press('Enter')
        await expect(drawer).toHaveCount(0)
        await expect(trigger).toBeFocused()
      }
    })
  }
}

for (const width of [1280, 390]) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`Bootstrap popover is opaque before and after drawer use (${width}px, ${reducedMotion})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.emulateMedia({ reducedMotion })
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await openFixture(page, { scenario: 'overlays' })
      const trigger = page.getByTestId('open-popover')
      for (const preceding of ['fresh', 'modal', 'panel']) {
        if (preceding !== 'fresh') {
          const modal = preceding === 'modal'
          await page
            .getByTestId(modal ? 'open-modal-drawer' : 'toggle-panel-drawer')
            .click()
          const drawer = page.getByRole('dialog', {
            name: modal ? 'Edit note' : 'Scratchpad',
            exact: true,
          })
          await expect(drawer).toBeVisible()
          await drawer
            .getByRole('button', {
              name: modal ? 'Cancel' : 'Close',
              exact: true,
            })
            .click()
          await expect(drawer).not.toBeVisible()
        }
        await trigger.click()
        const popover = page.getByRole('dialog', {
          name: 'Edit note',
          exact: true,
        })
        await expect(popover).toBeVisible()
        await expect(popover).toHaveCSS('opacity', '1')
        const insets = await popover.evaluate((element) => {
          const body = element.querySelector('[role="region"]')!
          const footer = element.querySelector('footer')!
          const bodyStyle = getComputedStyle(body)
          const footerStyle = getComputedStyle(footer)
          const bounds = footer.getBoundingClientRect()
          return {
            body: [
              bodyStyle.paddingInlineStart,
              bodyStyle.paddingInlineEnd,
              bodyStyle.paddingBlockStart,
              bodyStyle.paddingBlockEnd,
            ],
            footer: [
              footerStyle.paddingInlineStart,
              footerStyle.paddingInlineEnd,
              footerStyle.paddingBlockStart,
              footerStyle.paddingBlockEnd,
            ],
            contained: [...footer.querySelectorAll('button')].every(
              (button) => {
                const action = button.getBoundingClientRect()
                return (
                  action.left >=
                    bounds.left + parseFloat(footerStyle.paddingLeft) - 1 &&
                  action.right <=
                    bounds.right - parseFloat(footerStyle.paddingRight) + 1 &&
                  action.top >=
                    bounds.top + parseFloat(footerStyle.paddingTop) - 1 &&
                  action.bottom <=
                    bounds.bottom - parseFloat(footerStyle.paddingBottom) + 1
                )
              },
            ),
          }
        })
        expect(insets.footer).toEqual(insets.body)
        expect(insets.footer.every((value) => parseFloat(value) > 0)).toBe(true)
        expect(insets.contained).toBe(true)
        const box = (await popover.boundingBox())!
        const anchor = (await trigger.boundingBox())!
        expect(box.width).toBeGreaterThan(0)
        expect(box.height).toBeGreaterThan(0)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.y).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1)
        expect(box.y + box.height).toBeLessThanOrEqual(845)
        // Default bottom placement may flip above when space is insufficient.
        const distance = Math.min(
          Math.abs(box.y - (anchor.y + anchor.height)),
          Math.abs(anchor.y - (box.y + box.height)),
        )
        if (
          anchor.y >= box.height + 16 ||
          844 - (anchor.y + anchor.height) >= box.height + 16
        )
          expect(distance).toBeLessThanOrEqual(9)
        await expect(
          popover.getByRole('textbox', { name: 'Notes', exact: true }),
        ).toBeFocused()
        await page.keyboard.press('Escape')
        await expect(popover).toHaveCount(0)
        await expect(trigger).toBeFocused()
      }
      expect(errors).toEqual([])
    })
  }
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`Bootstrap modal initial focus and reopening with ${reducedMotion} motion`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion })
    await openFixture(page, { scenario: 'modal' })
    const opener = page.getByRole('button', {
      name: 'Read long content',
      exact: true,
    })
    for (let opening = 0; opening < 2; opening++) {
      await opener.click()
      const dialog = page.getByRole('dialog', {
        name: 'Read long content',
        exact: true,
      })
      const title = dialog.getByRole('heading', {
        name: 'Read long content',
        exact: true,
      })
      await expect(title).toBeFocused()
      await page.keyboard.press('Shift+Tab')
      const done = dialog.getByRole('button', { name: 'Done', exact: true })
      await expect(done).toBeFocused()
      await waitForPresentation(dialog)
      // Finishing entry motion must not override the user's focus movement.
      await expect(done).toBeFocused()
      await done.click()
      await expect(dialog).toHaveCount(0)
      await expect(opener).toBeFocused()
    }
  })
}

// Bootstrap's documented checkbox field places its control and label side by side.
test('Bootstrap checkbox label, instructions, and disabled presentation', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'checkbox' })
  const checkbox = page.getByRole('checkbox', { name: 'Enabled', exact: true })
  const label = page.locator('label').filter({ hasText: /^Enabled$/ })
  const help = page.getByText(
    'An unchecked record is still saved, with Enabled set to false.',
    { exact: true },
  )
  for (const width of [1100, 390]) {
    await page.setViewportSize({ width, height: 900 })
    const box = await checkbox.boundingBox()
    const text = await label.boundingBox()
    const description = await help.boundingBox()
    expect(box && text && description).toBeTruthy()
    expect(text!.x).toBeGreaterThan(box!.x + box!.width)
    expect(Math.abs(text!.y - box!.y)).toBeLessThan(6)
    expect(description!.y).toBeGreaterThan(text!.y)
    expect(Math.abs(description!.x - text!.x)).toBeLessThan(2)
    const spacing = await page
      .getByRole('form', { name: 'Record editor' })
      .evaluate((form) => {
        const fields = Array.from(form.children).filter((child) =>
          child.classList.contains('bootstrap-field'),
        )
        const expected = parseFloat(getComputedStyle(form).rowGap)
        const gaps = fields
          .slice(1)
          .map(
            (field, index) =>
              field.getBoundingClientRect().top -
              fields[index].getBoundingClientRect().bottom,
          )
        return {
          expected,
          gaps,
          margins: fields.map((field) => getComputedStyle(field).marginBottom),
        }
      })
    expect(spacing.expected).toBeGreaterThanOrEqual(16)
    for (const gap of spacing.gaps)
      expect(Math.abs(gap - spacing.expected)).toBeLessThan(1)
    expect(spacing.margins.every((margin) => margin === '0px')).toBe(true)
  }
  await label.click()
  await expect(checkbox).not.toBeChecked()
  await checkbox.focus()
  await page.keyboard.press('Space')
  await expect(checkbox).toBeChecked()
  await page.getByRole('button', { name: 'Save record', exact: true }).click()
  await expect(checkbox).toBeDisabled()
  const colors = await label.evaluate((element) => {
    const reference = document.createElement('span')
    reference.style.color = 'var(--bs-fg-3)'
    element.parentElement!.append(reference)
    const expected = getComputedStyle(reference).color
    reference.remove()
    return { actual: getComputedStyle(element).color, expected }
  })
  expect(colors.actual).toBe(colors.expected)
})

test('Bootstrap tabs retain native square bottom corners and focus styling', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'tabs' })
  const tabs = page.getByRole('tab')
  for (const tab of await tabs.all()) {
    await expect(tab).not.toHaveClass(/bootstrap-focus-presentation/)
    const corners = await tab.evaluate((element) => {
      const style = getComputedStyle(element)
      return [style.borderBottomLeftRadius, style.borderBottomRightRadius]
    })
    expect(corners).toEqual(['0px', '0px'])
  }
  const details = page.getByRole('tab', { name: 'Details', exact: true })
  await details.focus()
  await page.keyboard.press('ArrowRight')
  const notes = page.getByRole('tab', { name: 'Notes', exact: true })
  await expect(notes).toBeFocused()
  const focus = await notes.evaluate((element) => {
    const style = getComputedStyle(element)
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) }
  })
  expect(focus.style).not.toBe('none')
  expect(focus.width).toBeGreaterThan(0)
})

test('Bootstrap vertical tabs use native vertical pills', async ({ page }) => {
  await openFixture(page, { scenario: 'tabs' })
  const vertical = page.getByRole('checkbox', { name: 'Vertical tab bar' })
  await vertical.check()
  const bar = page.getByRole('tablist')
  await expect(bar).toHaveClass(/nav-pills-vertical/)
  await expect(bar).not.toHaveClass(/nav-tabs/)
  await page.mouse.move(0, 0)
  await waitForPresentation(
    bar.getByRole('tab', { name: 'Details', exact: true }),
  )
  const presentation = await bar.evaluate((element) => {
    const reference = document.createElement('div')
    reference.className = 'nav nav-pills nav-pills-vertical'
    reference.innerHTML = '<button class="nav-link active">Details</button>'
    element.parentElement!.append(reference)
    const sample = (list: Element) => {
      const listStyle = getComputedStyle(list)
      const tabStyle = getComputedStyle(list.querySelector('.active')!)
      return {
        direction: listStyle.flexDirection,
        shadow: listStyle.boxShadow,
        background: listStyle.backgroundColor,
        radius: listStyle.borderRadius,
        tabBackground: tabStyle.backgroundColor,
        tabBorder: tabStyle.borderBottomColor,
        tabRadius: tabStyle.borderRadius,
      }
    }
    const result = { actual: sample(element), native: sample(reference) }
    reference.remove()
    return result
  })
  expect(presentation.actual).toEqual(presentation.native)
  expect(presentation.actual.direction).toBe('column')
  const details = page.getByRole('tab', { name: 'Details', exact: true })
  const notes = page.getByRole('tab', { name: 'Notes', exact: true })
  await details.focus()
  await page.keyboard.press('ArrowDown')
  await expect(notes).toBeFocused()
  await expect(details).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Enter')
  await expect(notes).toHaveClass(/active/)
  await vertical.uncheck()
  await expect(bar).toHaveClass(/nav-tabs/)
  await expect(bar).not.toHaveClass(/nav-pills/)
  await expect(notes).toHaveAttribute('aria-selected', 'true')
})

test('native file input preserves accepted files and the region opens an icon chooser', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'files' })
  const form = page.locator('form[data-file-example=input]')
  const editor = form.locator('[data-ui-file-input]')
  const input = editor.locator('input[type=file].form-control')
  await expect(input).toBeVisible()
  await expect(input).toHaveCSS('opacity', '1')
  const emptyBounds = (await editor.boundingBox())!
  const file = {
    name: 'attachment.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('sample'),
  }
  await input.setInputFiles(file)
  const filename = () =>
    input.evaluate((el: HTMLInputElement) => el.files?.[0]?.name)
  await expect.poll(filename).toBe(file.name)
  expect((await editor.boundingBox())!.height).toBeCloseTo(
    emptyBounds.height,
    0,
  )
  await form
    .getByRole('button', { name: 'Keep attachment', exact: true })
    .click()
  await editor.getByRole('button', { name: 'Clear file', exact: true }).click()
  await expect(input).toBeFocused()
  await expect.poll(filename).toBeUndefined()
  await form.getByRole('button', { name: 'Reset changes', exact: true }).click()
  await expect.poll(filename).toBe(file.name)
  const region = page.locator(
    'form[data-file-example=region] [data-ui-upload-region]',
  )
  const choose = region.locator('button[data-upload-choose]')
  await expect(choose).toHaveAccessibleName('Local attachment')
  await expect(choose).toHaveText('')
  await expect(choose.locator('svg')).toBeVisible()
  await expect(region.locator('input[type=file]')).toBeHidden()
  await choose.focus()
  const opened = page.waitForEvent('filechooser')
  await choose.press('Enter')
  await (await opened).setFiles(file)
  await expect(region.locator('[data-upload-preview]')).toBeVisible()
  await expect(choose).toHaveCount(0)
})
