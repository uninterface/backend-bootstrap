import type { BrowserControlParts } from '@uninterface/testing/playwright'

// Map rendered parts without performing interactions.
export const browserControlParts: BrowserControlParts = {
  collapsibleTrigger(scope, name) {
    const text =
      typeof name === 'string'
        ? new RegExp(`^\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`)
        : name
    return scope
      .locator('summary[aria-controls][aria-expanded]')
      .filter({ hasText: text })
  },
  temporalMode: (trigger, value) => ({
    kind: 'menu',
    option: trigger
      .page()
      .locator(`[data-temporal-mode-value="${value}"]:visible`),
  }),
  fileInputName: (root) => ({
    kind: 'native',
    control: root.locator('input[type=file]'),
  }),
  fileInput(root, clearName) {
    const clear = root.getByRole('button', { name: clearName, exact: true })
    const frame = root.locator('.bootstrap-native-file-frame')
    return {
      chooser: root.locator('input[type=file]'),
      frame,
      focusedFrame: frame.and(root.locator('[data-focused]')),
      clear,
      clearFocus: { target: clear, kind: 'outline' },
    }
  },
}
