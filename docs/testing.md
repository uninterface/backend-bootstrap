# Test with the Bootstrap 6 backend

[Documentation index](README.md)

Install `@uninterface/testing` and `@playwright/test` as development dependencies. Configure the selected backend once in a Playwright fixture:

```ts
import { test as base } from '@playwright/test'
import { createUiTest, type UiTest } from '@uninterface/testing/playwright'
import { uiTestAdapter } from '@uninterface/backend/testing'

export const test = base.extend<{ ui: UiTest }>({
  ui: async ({ page }, use) => {
    await use(createUiTest(page, uiTestAdapter))
  },
})
```

Use the same backend alias as application setup; installing only that alias does not also install the backend under its original package name. Business tests import the fixture and interact by accessible names, labels or application test IDs. Select candidates by semantic key and independently assert saved values. The mapping does not override core behavior or application acceptance policy.

The adapter locates actual rendered select/checkbox parts. It must not force clicks, modify state or repair focus to make tests pass. The harness supports composite single/multiple selectors, binary/tristate checkboxes and radio/checkbox groups. Single and multiple selectors map to Bootstrap Combobox triggers and owned listboxes; use the shared harness rather than native selectOption(). Other controls can use ordinary Playwright semantic locators. The testing package's own API reference defines the complete harness contract.

## Verify application behavior

The backend repository includes native conformance tests and their fixtures. The application Playwright fixture above uses your own app and test runner.

Verify shared keyboard, focus, naming, validation feedback, selection retention and layout behavior as well as native presentation. Capability declarations and simulated DOM results do not replace browser or manual accessibility checks. Applications select their own conformance policy; the adapter does not import another project's contrast exceptions.

The testing adapter also maps radio/checkbox group options by stable key through choice(group, key, kind). Shared drivers own pointer actions and checked-state verification; adapter mappings preserve native hit targets.
