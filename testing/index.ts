import {
  uiNativeTestAdapter,
  type UiTestAdapter,
} from '@uninterface/testing/playwright'

import {
  cardParts,
  fieldGroupParts,
  fieldSelectors,
} from './presentation-parts.mjs'
import { presentationParts } from './presentation-parts.js'

export const uiTestAdapter: UiTestAdapter = {
  ...presentationParts,
  card: (card) => cardParts((selector) => card.locator(selector)),
  ...uiNativeTestAdapter,
  fieldGroup(group) {
    const parts = fieldGroupParts((selector) => group.locator(selector), group)
    const { label } = parts
    const generated = label
      .and(group.page().locator(fieldSelectors.required))
      .or(label.locator(fieldSelectors.required))
    return {
      ...parts,
      required: {
        elements: label.locator(':not(*)'),
        before: generated,
        after: generated,
      },
    }
  },
  inputFrame: (frame) => ({ surface: frame }),
  buttonFocus: (button) => ({ target: button, kind: 'outline' }),
  async checkable(control) {
    const parts = await uiNativeTestAdapter.checkable!(control)
    const container = control
      .locator('xpath=ancestor::*')
      .and(control.page().locator('.switch'))
      .last()
    const surface = container
    return { ...parts, surface: (await surface.count()) ? surface : control }
  },
  stepSkipReason(step, { browserName, viewportWidth }) {
    if (
      step === 'demo.flow.no-wrap.export-click' &&
      browserName === 'chromium' &&
      viewportWidth === 390
    ) {
      return 'At 390 px the Bootstrap Archive label can intercept the Export click.'
    }
  },
  menuPopup(menu) {
    // The native menu itself enters the top layer.
    return menu.and(menu.page().locator('.bootstrap-entry-popup[popover]'))
  },
  async field(control) {
    const parts = await uiNativeTestAdapter.field!(control)
    const segments = control.locator('.btn-group, .btn-group-vertical')
    return {
      ...parts,
      surface: (await segments.count()) ? segments : parts.surface,
    }
  },
  modal(dialog) {
    return {
      body: dialog.locator(':scope > .bootstrap-modal-body'),
      actions: dialog.locator(':scope > .dialog-footer'),
    }
  },
  columnHeaderParts(header) {
    return {
      caption: header.locator(
        '.bootstrap-table-sort, .bootstrap-table-header:not(:has(.bootstrap-table-sort))',
      ),
      sortTarget: header.locator('.bootstrap-table-sort'),
      sortIndicator: header.locator('.bootstrap-table-sort-icon'),
    }
  },
  popoverSurface(dialog) {
    return dialog.and(
      dialog.page().locator('[data-ui-overlay="popover"].popover'),
    )
  },
  select(control) {
    return {
      kind: 'composite',
      trigger: control,
      selection: control.locator('.combobox-value'),
      async popup() {
        const id = await control.getAttribute('aria-controls')
        if (!id || /\s/.test(id))
          throw new Error('UiSelect must identify its listbox.')
        return control.page().locator(`[id=${JSON.stringify(id)}]`)
      },
    }
  },
  async multiSelect(control) {
    const native = await uiNativeTestAdapter.multiSelect!(control)
    return { ...uiTestAdapter.select(control), clear: native.clear }
  },
}

export { browserControlParts } from './browser-control-parts.js'
