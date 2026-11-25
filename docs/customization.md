# Customize the Bootstrap backend

[Documentation index](README.md) · [Application setup](setup.md)

This adapter uses Bootstrap 6.0.0-alpha.1. Use its native CSS tokens; Bootstrap 5
recipes may refer to different variables, classes or Sass configuration.
Component defaults remain native; typography uses the documented Uninterface font defaults.

## One application stylesheet

Create `src/ui.theme.css`:

```css
@import '@uninterface/backend/style.css';

:root {
  --uninterface-font-family: system-ui, sans-serif;
  --bs-spacer-7: 1.25rem;
}
```

Replace the direct backend stylesheet import in `src/main.ts` with
`import './ui.theme.css'`. Leave application initialization unchanged. Import
core's stylesheet separately if using core styling utilities.

The example changes document typography and one native spacing token. That token
also drives this adapter's ordinary layout peer separation and content insets;
it does not uniformly scale every control. The stylesheet alone uses system fonts without downloads. Import font.css or font-bundled.css before it to select the backend set; supply your own assets when selecting another non-system family.

## Colors and other native tokens

The pinned Bootstrap CSS exposes tokens for semantic colors, typography,
spacing, radii, shadows, focus and component details. Supply application overrides
after the backend import. Preserve complete state treatments: a role has more
than a base color, including foreground, background and focus-related values.
Changing only `--bs-primary-base` is not a promise that every primary treatment
has a coordinated replacement palette.

Inspect the installed `bootstrap/dist/css/bootstrap.css` and `bootstrap/scss`
for this alpha's definitions. The adapter maps Uninterface's theme roles to native
`theme-*` treatments and filled/outline/neutral/soft/text/icon to native button presentations. Recoloring a
role does not change its semantic meaning or action behavior. The
[presentation reference](presentation.md) describes the native contrast limitation
and optional higher-contrast customization; it is not applied automatically.

## Limits

The package imports compiled Bootstrap CSS. Although Bootstrap supports Sass
customization, this adapter does not currently export a separate integration-only
stylesheet for replacing that compiled build. Importing a second complete custom
Bootstrap build creates overlapping rules and is not the documented path. CSS
token overrides are the supported simple route; Sass configuration alone cannot
alter the already-compiled imported stylesheet.

Shared color-mode setup owns or inherits native `data-bs-theme` selection;
application token overrides can target light and dark selectors. There is no
application-wide density configuration or arbitrary runtime theme-switching API.
Private adapter classes are implementation details, not stable theme selectors.

## Verify a customized presentation

Check the same business components with and without your customization: filled
and outline buttons, disabled/loading states, field help/errors, select and menu
popups, icons, layout wrapping and scrolling. Confirm visible keyboard focus and
readable text. Check both supported color modes, including an already-open popup.
Do not infer whole-application coverage from a single button or claim WCAG
conformance from a theme's name. Customization must preserve Uninterface's model,
validation, selection and interaction contracts.

Keep theme authoring in application setup and styles; business views should not
need native toolkit props or per-component CSS to activate the theme. An existing
color role can be recolored without changing its meaning. Adding a role requires
backend implementation and capability support across all relevant components;
CSS alone does not extend Uninterface's theme vocabulary.

## Portable card hierarchy customization

For changes that should survive switching backends, configure a shared strategy in an application-owned Vue composition; no additional stylesheet is required:

```vue
<script setup lang="ts">
import { UiStrategy, uiCardPresentation } from '@uninterface/uninterface'
const cards = uiCardPresentation({
  [-2]: { color: 'primary', border: 'double' },
  [-1]: { color: 'primary', elevation: 'flat' },
  1: { header: 'band', density: 'compact' },
  2: { color: 'secondary', surface: 'tinted' },
})
</script>
<template><UiStrategy :use="cards"><slot /></UiStrategy></template>
```

Place the application's cards under this composition. Omitted properties retain the shared defaults. Each UiCard can override its effective role with color, or explicitly request neutral with :color="null". Customizing palette values remains an application theme task using the setup above; raw CSS/native variant names do not belong in this map. The same configuration works across conforming adapters, with each retaining its own concrete theme values. [Presentation mappings](presentation.md#cards-and-hierarchy) specify which native values are consumed. Test nested/peer cards, headerless units, both color modes and narrow layouts before adopting a custom profile.

## Default font delivery

Import a selected font.css or font-bundled.css entry first, then the stable backend style.css. Omit font imports for system or application-owned fonts, using --uninterface-font-family for a complete override. See [typography](typography.md) for all four choices, setup steps, CSP sources, licenses and limits.

The ordinary font setup offers four choices: backend or Uninterface default, each with Network or Bundled delivery. Import one font entry before the stable backend stylesheet, following [typography](typography.md); the Uninterface choices require the optional `@uninterface/fonts` package.

## Shared input frame coverage

Bootstrap 6 form-control/form-adorn and form-ghost provide the surface and editors. A div replaces the single-input label container so multiple named inputs and buttons are valid. Disabled and invalid focus states use native --bs-control-* and --bs-*-focus-ring tokens. Sizes use native form-control-sm/lg.

The frame follows the input theme through the supported setup described above; private adapter selectors are not a stable public styling API. Check ordinary inputs beside the compound frame under the chosen light/dark theme, sizes, focus, invalid, disabled and readonly states. Interior part wrapping is adapter-owned and is not a global layout-spacing customization contract. See [presentation mappings](presentation.md#shared-input-frames) for limits.


## Drawers and popovers

UiDrawer (modal and retained panel modes) and UiPopover consume this backend's normal surface, typography and color-mode setup. The adapter renders native-themed content over browser dialog/manual-popover hosting so Uninterface remains the only lifecycle and stacking owner. Application styles load after backend style.css; preserve hidden/inert behavior, bounded scrolling, focus treatment and core-owned stacking when customizing. Popups are teleported to body or the owning overlay; scope application theme variables accordingly. Toolkit gesture/snap-point/resizing options and docked/compact drawer allocation are not exposed. Layout peer spacing remains owned by the existing layout components.

Popover surfaces supply Bootstrap's native `popover show` presentation, including its opacity and entry fade. Browser dialog/manual-popover open state controls actual visibility; the `show` class alone does not indicate an open Uninterface session. Preserve this mapping when customizing: removing `show` leaves the native surface transparent. Verify opacity as well as display, placement and focus at ordinary/narrow widths and with reduced motion.

Popover footers reuse the native `.popover-body` padding/color treatment, including application overrides of `--bs-popover-body-padding-x` and `--bs-popover-body-padding-y`. Drawer footers use `.drawer-footer` and the drawer surface tokens. These footers stay outside the body scrollport; do not rely on dialog-only variables to inset a popover or drawer. Verify wrapped actions remain inside those insets.

Popover arrows use Bootstrap’s native `.popover-arrow`, automatic side selectors and surface/header tokens. Their final attachment follows flips and viewport clamping. The decorative arrow alone retains physical border-color orientation in RTL; content direction is unchanged. Header-facing fill is adapted across the internal content wrapper. No public arrow prop is needed.

## Suggestion popup arrow review

UiSuggestions uses native Popover positioning with a menu-styled template that omits the Popover arrow. This composition needs a contextual fidelity review: native Popover supplies an arrow, while native Menu does not. The general UiPopover, ordinary native tooltips and calendar popovers retain arrow presentation. Do not infer that every menu needs a pointer from the positioning engine alone.
