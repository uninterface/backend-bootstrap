import type { UiLayoutPresentation } from '@uninterface/uninterface/backend'

export const uiLayoutPresentation: UiLayoutPresentation = {
  scrollFocus: { class: 'bootstrap-scroll-focus' },
  peerSpacing: {
    gap: 'var(--bs-spacer-7)',
  },
  peerSpacingLevels: {
    [-1]: { gap: 'var(--bs-spacer-2)' },
    1: { gap: 'var(--bs-spacer-9)' },
  },
}
