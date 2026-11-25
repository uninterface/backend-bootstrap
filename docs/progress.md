# Progress bars

[Documentation index](README.md)

The adapter uses native `.progress` and `.progress-bar`, preserving native track/fill tokens and applying the resolved `theme-*` role (primary by default). Unknown progress adds a moving partial segment because Bootstrap has no native indeterminate-bar mode. Reduced motion fixes that segment in place. No native spinner substitutes for unknown progress.

Standalone and upload-hosted bars share this backend’s `UiProgressBar.vue`, requiring `progress.bar.v1`. Both modes are horizontal bars filling the offered inline allocation. The producer owns outcomes, actions, visibility and announcements; the bar has no live region or default tab stop. Null means unknown; numeric value/max retain their original units and fractional precision. A full bar does not automatically declare success.

Verify accessible naming/range and no unknown current number, known/unknown transitions, narrow/wide containment, light/dark, LTR/RTL and reduced motion. Functional/DOM evidence is separate from browser geometry/paint, human visual review and assistive-technology acceptance. The shared consumer API and usage guide are in `@uninterface/uninterface`, under `docs/api/components/UiProgressBar.md` and `docs/guides/progress.md`.
