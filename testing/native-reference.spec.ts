import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { testReferenceFixture } from '@uninterface/testing/fixtures/reference-playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'
import { browserControlParts } from './browser-control-parts'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/native-reference.ts', import.meta.url),
)

testReferenceFixture(openFixture, uiTestAdapter, {
  collapsibleTrigger: browserControlParts.collapsibleTrigger,
  nativeCollapsibleTrigger: (scope, name) =>
    scope.locator('summary').filter({ hasText: name }),
  nativeModal: true,
  nestedNavigation: true,
})
