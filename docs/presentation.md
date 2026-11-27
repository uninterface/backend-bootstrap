# Bootstrap 6 presentation and native integration

[Documentation index](README.md) · [Application setup](setup.md)

This reference describes presentation policies, toolkit mappings and integration limits. Application consumers can start with setup; backend maintainers should also review the native coordination and upgrade-sensitive details here.

## Inline table alignment

UiTable selects Bootstrap's native `--bs-table-cell-vertical-align: middle` so mixed single-line fields, read-only values and row actions share the row center. Its private cell-content part middle-aligns a direct button host, preserving the native button treatment through the announcement wrapper without an extra baseline line above it. Button icon slots use flex alignment to avoid a second inline text strut. Caption baseline export remains unchanged in authored baseline layouts. Native cell padding, control dimensions and ordinary multiline cell flow remain toolkit-owned; there are no invoice-specific offsets. Verify in a standards-mode document (`<!doctype html>`), including hover and different font metrics.

## Content wrapping in narrow regions

UiContent allows an otherwise unbreakable word to wrap when it exceeds the available line width (`overflow-wrap: break-word`). This includes bare text and inline spans, independently of an enclosing card or paragraph. Ordinary word boundaries remain preferred; explicit descendant whitespace/wrapping rules retain ownership. The adapter supplies this default without author-side CSS, and without changing content insets or resize shares. Bootstrap's native card already provides equivalent inherited wrapping; UiContent also supplies it outside cards.

This is text wrapping, not a measured horizontal resize minimum: a panel narrower than its insets plus a glyph, or non-wrapping/non-text content, still needs an appropriate allocation or scrolling policy. Vertical measured minima remain separate. Verify both supporting regions near horizontal divider limits with enough width for insets and characters, and preserve mounted reading content.

## Native presentation

The package pins Bootstrap `6.0.0-alpha.1`; the manifest also records this backend dependency under `backend.name` and `backend.version`. It uses Bootstrap's form-field/control, checkbox, button, invalid-feedback, and focus styling. Standard control focus follows upstream rules and tokens, with no blanket custom focus outline. Group/status focus follows the same tokens. Forced-colors fallbacks target the backend’s non-native focus targets; native controls retain their toolkit treatment. Bootstrap JavaScript form management is not used. Importing this backend’s stylesheet includes the full upstream stylesheet and its document-wide defaults; selective CSS packaging is not yet implemented.

## Checkbox field presentation

The checkbox follows Bootstrap 6's [checkbox example](https://getbootstrap.com/docs/6.0/forms/checkbox/) and [field layout](https://getbootstrap.com/docs/6.0/forms/field/): a `.check` input followed by `.form-field-content` containing its associated label, optional `<small class="form-text">` description, and validation feedback. Bootstrap places this content beside the checkbox. The adapter extends Bootstrap's disabled-label color rule to the label inside this content wrapper.

A `.form-label` wrapper is an overhead heading in this layout and spans both columns. It is used for ordinary field headings, not for the checkbox's own label. The backend's `UiCheckbox.vue` registers its presentation role with the nearest backend `UiField.vue`; the field then renders the associated label after the checkbox. Registration ends when the checkbox unmounts. This coordination is private to the backend and does not change field value/validation ownership or add a business-facing layout prop. Nested fields establish separate contexts, and composite group headings remain intact.

Verify input/content structure, help associations, label activation and disabled behavior. In a browser, check side-by-side checkbox alignment, field spacing and disabled label treatment at narrow and wide widths. Checkbox layout coordination starts after mount, preserving the initial server/client tree. The form hydration baseline verifies text/multiline fields and checkbox editing, but does not establish every strategy combination.

## Spacing between fields

The form owns vertical spacing with Bootstrap's `vstack gap-7` layout (`1.5rem` in the pinned v6 release). Fields have no external bottom-margin utility. Help uses `small.form-text` and issues use `div.invalid-feedback`, avoiding paragraph margins that would make spacing depend on whether a field has help or an error. Inside a field, Bootstrap's own field/content layout supplies the spacing. The same backend rule applies to text, select, checkbox, and composed fields; business code does not set margins or gaps.

Forms use an unframed vertical stack. Composite fields use Bootstrap's `form-group` layout, retaining accessible group labels and invalid-group focus. Form and group containers add no decorative border, rounding or outer inset. Empty form feedback remains mounted as a visually hidden live region without reserving stack space; feedback enters normal flow when present. The navbar uses its toolkit surface without an added bottom border.

## Default validation feedback strategy

When a field has a displayed validation issue, Bootstrap shows the error and omits its helper text. When the issue clears through correction or reset, the helper returns. This applies to ordinary fields, checkbox content, and composite groups. Help and validation remain separate business inputs; this is a presentation default, not a change to validation rules or timing.

Inputs and groups reference the displayed error through `aria-describedby` while invalid; the hidden helper's identifier is omitted. Other supplied description associations are preserved. Once valid, the helper association returns. Error messages should provide enough guidance to correct the value. This is the ordinary default. UiStrategy can select together or replace-help explicitly; see [strategy support](strategies.md).

## Linear layouts

`UiLayout.vue` fulfills `layout.linear.v1`, `layout.division.v1`, `layout.reactive.v1`, `layout.wrap.v1`, `layout.align.v1`, and `layout.scroll.v1`. It consumes resolved options from core, allocates keyed children, preserves them during prop updates, and supplies backend spacing and scroll focus treatment. It works without a provider ancestor and never detects desktop/mobile itself. See **UiLayout** in `@uninterface/uninterface` (`docs/api/components/UiLayout.md`) for exact supported combinations and host-height requirements. Browser geometry verification is required in addition to declarations and DOM tests.

## Button color and treatment

`UiButton` consumes all supported theme roles independently of the six button variants (`button.color.v1` and `button.variant.v1`). Without an applicable strategy, omitted color/variant options default independently to secondary/filled. See **UiButton** in `@uninterface/uninterface` (`docs/api/components/UiButton.md`) for the contract.

The backend maps Uninterface’s `filled` treatment to Bootstrap’s `btn-solid` class and `outline` to `btn-outline`. Uninterface defines the public treatment contract; toolkit class names are implementation details.

## Default required marker

By default, required labels and group headings receive a backend class whose CSS `::after` displays an asterisk suffix in Bootstrap's danger foreground color (`--bs-danger-fg`). The required-annotation strategy can move it to a prefix or hide it. Optional fields have no marker. Ordinary fields need no marker element or hidden required text: their controls already expose `aria-required="true"`.

CSS generated content is decorative, with an empty alternative text where supported; it is not the source of accessible requiredness. Generic `role="group"` does not support `aria-required`, so required composite groups retain one localized, visually hidden description referenced by `aria-describedby`. Existing help/error associations are preserved. Browser and assistive-technology verification remain necessary, particularly for generated-content speech behavior.

See [ARIA required semantics](https://www.w3.org/TR/wai-aria-1.2/#aria-required) and [CSS content accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content#accessibility). Native HTML `required` also affects constraint validation; this presentation policy uses the existing ARIA state and leaves validation with Uninterface's controls.

Required-marker appearance belongs to form-level field presentation policy. Business fields declare requiredness and validation rules; they do not choose symbols or placement individually. Core UiStrategy can select required annotations and the other common field preferences; see [strategy support](strategies.md). This default does not change validation or submission behavior.

## Regions, application surface and content

Ordinary UiRegionLayout arrangements compose this UiLayout view into adjoining named start/main/end allocations with `spacing: 'none'`; public UiLayout/UiFlowLayout retain theme-owned peer spacing. Grouped region boundaries also adjoin without extra gaps, and UiContent insets travel with scrolling content; grouped scrolling uses UiRegionLayout.vue; see **UiRegionLayout** in `@uninterface/uninterface` (`docs/api/components/UiRegionLayout.md`).

UiFlowLayout composes this view for content-sized peer items. Cross-axis alignment applies to allocation wrappers; descendant controls retain their sizing contracts. No separate flow view module is required.

`UiApp.vue` fulfills `app.root.v1`: a document-flow application surface inheriting document typography with full available width for content, independent of application context wrappers. It preserves supplied content and landmarks without adding application-role semantics. Optional viewport hosting supplies a bounded height; document remains the default. See **UiApp** in `@uninterface/uninterface` (`docs/api/components/UiApp.md`).

`UiNavbar.vue` fulfills `navbar.v1`: brand, navigation and action slots appear in order and wrap without automatic hiding or collapse controls. It provides navigation semantics and backend-owned presentation independently of UiApp. See **UiNavbar** in `@uninterface/uninterface` (`docs/api/components/UiNavbar.md`).

`UiContent.vue` fulfills `content.inset.v1`: content insets fit within the full offered width, without a width cap, landmark, new surface or provider requirement. Insets coordinate with the navbar's horizontal spacing. See **UiContent** in `@uninterface/uninterface` (`docs/api/components/UiContent.md`).

Viewport UiApp hosting measures its available height (hosting.viewport.v1). UiRegionLayout.vue fulfills layout.region-scroll.v1 for one named vertical group, with retained supporting regions and a keyboard-accessible overflow escape. See **application layouts** in `@uninterface/uninterface` (`docs/guides/application-layouts.md`).

Shared entry views support single selection through Bootstrap Combobox/Menu, keeping placeholder and retained-value records out of the candidate list and showing nonselectable unloaded/loading/failed/empty status inside the popup without disabling opening or replacing the selected label. Business-owned source recovery controls, inline/popup command menus with host-authored buttonTrigger/contextTrigger bindings, and ordinary navigation lists remain separate compositions. Core supplies entries, selection and lifecycle state; this backend owns markup, keyboard focus and popup geometry. Submenus open attached floating surfaces without enlarging the parent; the single picker uses textual content and one group level. See [single-selection presentation](selection-feedback-panels.md#single-selection) for keyboard behavior and native-picker differences. See the **entry contract** in `@uninterface/uninterface` (`docs/contracts/entries.md`) for exact obligations and limitations.

## Theme-color vocabulary

The theme supports the six baseline roles and the accent extension. The manifest defines accent semantics and declares theme.color.accent.v1; TypeScript augmentation derives its name from that definition. Bootstrap supplies the actual native theme treatment. Colors belong to the shared theme vocabulary, not to individual component palettes. See the **theme-color guide** in `@uninterface/uninterface` (`docs/guides/theme-colors.md`).

### Known primary-button contrast limitation

The backend retains Bootstrap 6.0.0-alpha.1's native primary colors. White normal-sized text on its blue-500 primary background can fail WCAG AA's 4.5:1 text-contrast threshold; a browser audit of the filled primary button measured 3.63:1. Native hover/pressed treatments, including those of outline buttons, can also fall below that threshold. This is a native-theme limitation, not a WCAG AA conformance claim. Keyboard, focus, naming and interaction obligations still apply. Applications requiring AA conformance must assess their own theme and complete workflows.

Applications requiring higher contrast can optionally customize the theme after importing the backend stylesheet:

```css
:root,
:host {
  --bs-primary-bg: var(--bs-blue-600);
}
```

This uses Bootstrap's own darker palette shade while retaining its native button markup, geometry, focus and interaction formulas. It changes all consumers of the primary background token, not only buttons. Verify primary filled/outline normal, hover and pressed states, the complete application and any custom themes; this adjustment does not establish overall WCAG AA conformance.

## Loading presentation

Buttons use native button semantics and Bootstrap's `spinner-border` only while loading, with toolkit spacing and its reduced-motion treatment. A visually hidden polite status sits outside the busy button and uses the localized activity message. Loading disables activation while retaining the action name; the adapter does not reserve indicator space while idle.

## Focus presentation

Ordinary control focus follows Bootstrap's upstream focus rules. The adapter does not add a blanket custom outline or suppress visible focus. Composite group/status focus uses toolkit focus tokens with a forced-colors fallback. Browser verification remains necessary.

## Document baseline

The imported Bootstrap stylesheet establishes document typography and reset defaults. UiApp inherits that baseline and supplies only its frame surface and allocation.

## Native menu integration

Menus use the pinned Bootstrap 6 Menu implementation for Floating UI positioning and native ArrowUp/ArrowDown/Home/End movement, together with Bootstrap menu, submenu, nav and navbar classes. The native menu itself enters the browser top layer; an extra decorative popup wrapper is not introduced. Navigation disclosures use the Bootstrap Icons chevron-down SVG; the pinned v6 stylesheet does not supply a top-level menu-toggle caret. Nested menu chevrons come from its native submenu CSS. Top-level chevrons reuse the native select caret treatment: a nonshrinking square centered with the label, rotating down-to-up over 200 ms ease-in-out while expanded and reversing on close. Reduced-motion preferences suppress the transition. Nested chevrons retain their native lateral direction, including RTL. Navbar navigation composes both native `nav` and `navbar-nav` classes so alignment defaults and navbar-specific tokens apply together.

Navigation applies native active styling to the exact current destination and its known ancestors, independently of expansion or focus. For Destinations → Asia → Singapore, Destinations remains active while closed; Asia and Singapore receive active styling when displayed. Only Singapore receives `aria-current="page"`; ancestor disclosure buttons retain `aria-expanded`. This follows the application-confirmed current key and the available entry tree, without loading unknown branches solely to decorate ancestry. Native hover/open styles can temporarily supersede the active appearance of a submenu trigger. Business authors supply entries and the current key; no caret or ancestor-presentation option is required.

Navigation entry labels allow inline slot content such as a badge beside text.
The label wrapper uses normal inline formatting within its allocation. The
entry's optional description remains on a separate line with Bootstrap's
description styling and its existing accessible association.

A private controlled bridge is necessary because native submenu opening mutates DOM state without controlled branch events. Core controls lazy branch mounting, checked state and closing. The bridge adapts item discovery to logical groups, adds typeahead and controlled branch entry/exit, and excludes these instances from the uncontrolled document data API's open-instance set. Each surface retains native positioning observers; disposal removes them. This integration uses protected APIs from the pinned alpha version and must be reviewed on upgrades. Native context references are updated when the host or pointer location changes.

Native menu JavaScript is imported individually; it installs Bootstrap's standard delegated data-API listeners. Uninterface hosts do not opt into those listeners with data attributes. Independently authored native Bootstrap menus can still use the data API. Do not initialize a second Menu instance on Uninterface-owned elements.

Content/layout spacing uses Bootstrap spacer tokens. Navbar slot wrappers own wrapping and allocation; they do not restyle arbitrary descendant anchors or focus outlines. Input, select, checkbox, button and menu appearance remains the toolkit's responsibility.

Application localization and the icon catalogue are installed through `createUiApplication`; see [setup](setup.md#localization-and-icons). The integration declares matching locale identifiers with empty native resources and supplies the 58-name default subset; UI messages come from core.

Shared grid layout uses this backend’s static `./layout` export (`uiLayoutPresentation`) for peer spacing, also used by its linear layout. Core owns the grid geometry; no separate backend grid component is needed. See **UiGridLayout** in `@uninterface/uninterface` (`docs/api/components/UiGridLayout.md`).


See [strategy support](strategies.md) for optional regional preferences, control-size mappings and unsupported values.


## Shared appearance and text editing

All text modes use the same UiTextInput view, including single-line text, masked password, multiline text and readonly editing. The adapter applies Bootstrap's floating-label tokens to the input group so the label rises when the editor receives focus or contains a value. Native form controls retain size and validation integration. Readonly preserves focus/copy behavior and field participation while disabled remains a separate restriction.

The backend integrates shared light/dark/system setup using `data-bs-theme` on the document element. See [setup](setup.md#color-mode). Mode changes retain drafts and open menu sessions. Controller and DOM checks do not establish computed appearance, native picker styling or accessibility conformance; browser checks remain required.

## Button presentation preferences

Filled, outline, soft and text map to native btn-solid, btn-outline, btn-subtle and btn-text. Icon uses btn-text plus btn-icon, keeping the text in visually-hidden markup. Bootstrap owns icon spacing and geometry.

Icon-only actions retain the native square treatment, growing as needed for an explicitly sized icon and reserving its space for the native loading spinner.

All six variants support every declared color. The explicit variant prop takes precedence over an agreed uiButtonVariant regional preference. With neither specified, this adapter ordinarily uses filled; supported application-owned native configuration remains effective. Icon labels stay accessible and supply a native title hint; title display on focus/touch depends on the browser. Pass an explicit title when label content comes from an opaque component. These are support declarations; real-browser geometry and hint behavior need verification. See **UiButton** and **uiButtonVariant** in the core documentation.

## Cards and hierarchy

Cards support an absent header without reserving a blank header band or separator. The optional `top-end` slot anchors concise actions to the card frame using logical edges, independently of preview/media content. Its inset follows half the current card padding, including density changes; the enclosing frame stays positioned and focus remains unclipped. Collection cards use this slot for `card-action-placement="top-end"` and omit headers without selection or meaningful header fields.

UiCard supports five structural requests: -2/-1 higher, 0 ordinary, 1/2 subordinate. Its default map shares the two higher treatments; all other defaults differ. Every level retains a full outline and readable body content. Ordinary/higher levels use solid outlines; both subordinate levels use dashed outlines, independently of color. Higher cards use roomy insets, a band header, large title and raised surface; zero uses normal insets with a band, large title and raised surface; one uses compact insets and a band header; two retains the band and adds a tinted surface and smaller title. Headerless cards retain surface, boundary, density and elevation cues.

Bootstrap retains native card/header/body/footer markup, radius and body gap. Density uses native spacer-7/6/4 values; raised uses the native box-shadow token. Role boundaries read --bs-<role>-border, including accent. Scoped surface tinting and a native cap background for band headers fulfill the portable contract without applying an inherited theme class to arbitrary controls. Native body spacing is retained. The card-specific requests override native card padding/shadow defaults; application styles load after adapter styles for deliberate adjustments.

All eight portable treatment properties are supported through uiCardPresentation: color, header (band/plain), footer (normal/muted), density (roomy/normal/compact), surface (plain/tinted), elevation (flat/raised), border (solid/dashed/dotted/double) and titleSize (large/normal/small). A map can independently customize all five levels, including -2 and -1. Exact native values remain theme-owned; solid/dashed is a primary distinction in Uninterface’s default hierarchy; applications can override patterns, including double, through their presentation maps. This is an Uninterface convention, not a claim of a universal toolkit hierarchy.

UiCard.color overrides the level's color; null explicitly selects neutral and omission uses the profile. Colored boundaries and softly tinted body surfaces use the effective role; band headers share the native footer cap background, while body text retains ordinary foreground. Neutral uses the theme's ordinary boundary tone. Private tokens reset on every card, so a parent's explicit color does not color nested cards or controls. Shared profile scope still independently applies to each participating card. Title/description slots receive structured typography; arbitrary header content retains its own typography and replaces both slots.

The card grows with content, has no sticky regions or scrollport, and preserves descendants when level, color or profile changes. Parent layouts own peer spacing; card regions own insets. No heading rank or interaction role is inferred. See [customization](customization.md) for setup and stylesheet ordering. Structural tests do not establish visual hierarchy quality; compare representative nested content in both modes and at narrow widths.

Footer background and separator color/thickness retain native toolkit presentation; foreground follows the selected footer emphasis. Existing separator patterns follow solid/dashed/dotted card boundaries; double boundaries use solid separators. Pattern-only adaptation fulfills the shared border contract without imposing the card accent on the native footer. Card-density padding adjustments remain to fulfill the explicit shared density request. Native theme configuration can therefore affect footer appearance independently of the enclosing boundary.

Default headers at levels 1/2 retain full insets and a separator so the footer does not receive the only region boundary. Ordinary title typography is semibold, with footer decoration intended to be equal or quieter. Native footer decoration is retained. Application-owned themes, custom plain-header profiles and rich footer content require assessment of the complete pairing; the default styling cannot control the prominence of arbitrary business content.

Band headers use the same native theme-bg/card-cap-bg background expression as footers, rather than an independent 10% header tint. The header separator still uses the selected card accent, and title typography remains stronger than ordinary footer text. This pairing preserves native footer configuration while avoiding a weaker custom header fill.

Bootstrap adapts only the existing footer border-block-start-style and band-header border style; native separator width/color and cap styling remain intact. Pattern changes never add a separator to a plain header, reveal a missing footer, or change nested-card requests.

Footer emphasis defaults to muted at levels 1/2 and normal elsewhere. Muted uses --bs-fg-2 with --bs-font-size-sm. Normal retains the native/reference foreground and body text scale. No whole-region opacity or control-size strategy is applied. Both subordinate levels use the same small scale. Card roots reset typography to the backend body baseline to prevent a nested card from inheriting reduced footer type. Backgrounds, insets and separators retain their independent policies. These scoped text changes fulfill the explicit portable footer request; native HTML/third-party content retains normal CSS inheritance responsibilities. Verify custom content and theme legibility in both modes.


### Context-menu host focus

UiMenu supplies `buttonTrigger` for explicit button activation and `contextTrigger` for contextual interaction on a content group. Apply the complete binding with `v-bind`. The contextual binding includes a private backend class that gives its element a visible keyboard-focus boundary; it does not change child control styling. Focus colors follow this backend's theme, with a system-color outline in forced-colors mode. The boundary uses a backend default radius independent of nested content; it does not infer a child card's shape. Ordinary consumers need no backend class names or focus CSS.


### Reusable focus presentation

Use `useUiFocusPresentation()` from `@uninterface/uninterface` and apply its complete object with `v-bind` to an author-supplied focus target. This backend fulfills `focus.presentation.v1` through its static `./focus` module and stylesheet. The same theme treatment used by context-menu content is available on native links and suitable custom regions anywhere in the application. The binding supplies no tabindex, roles or interaction; callers retain those responsibilities. Branding applies it explicitly rather than relying on navbar ancestry. Avoid adding a second focus treatment to existing toolkit/Uninterface controls. Theme and forced-colors behavior follow the contextual focus treatment described above.

### Region framing

Ordinary UiRegionLayout supports optional separators, selectable adjacent numeric-share resize boundaries and relative sibling layers. Bootstrap uses --bs-border-color, --bs-bg-body and --bs-box-shadow. Separators occupy one theme-owned track; resizers replace that track with a pointer/touch target and use this backend's reusable focus treatment. The initial target is 0.5rem across the split; themes may customize the private layout handle/separator size properties. Raised surfaces do not add content insets.

The adapter owns markup/geometry and uses the optional useUiLayoutResizeView helper for measured pointer interaction, RTL-aware keys and cleanup. Core owns the adjusted ratio and validates relationships. This is allocation framing, not a card or a claim of a native splitter widget. Rendering stays stable while framing changes; the reading scrollport cannot clip a sibling header's shadow. Local layering does not establish global overlay order. Forced-colors uses system boundary colors. Shared browser acceptance remains necessary for hit targets, focus and geometry.

Region separation belongs to UiRegionLayout and spans the full allocation boundary, independent of navbar/UiContent size. A designated navigation child suppresses its matching local edge even when the layout explicitly hides ordinary separators. Standalone and unrelated nested navigation retain their own borders. A navbar whose shared boundary is owned by the allocation uses a transparent background so its containing surface, including rounded frame corners, remains visible; standalone navbars retain Bootstrap's native background. This avoids clipping content, focus or popups at the card.

Start–Main uses a 40% `--bs-fg-body` / 60% `--bs-border-color` mix; Main–End uses `--bs-border-color`. These line colors express stronger/quieter emphasis in both equal-depth and raised cases. They never change elevation, shadow opacity/reach or stacking order. This is the adapter's region-framing policy, not a claim that native toolkit navbars independently implement these region roles. Application theme overrides should preserve the distinction and both lines' visibility.

Raised region presentation decorates shared edges toward lower neighbours. The adapter retains `--bs-box-shadow` on a separate shadow plane: reflect vertically for a before/top edge, rotate for inline edges, and mirror logical mapping in RTL. Absolute decoration uses `container-type: size` and `cqw`/`cqh` units to keep the rotated plane's footprint equal to the allocation; this requires a browser supporting size container queries. Business content is neither size-contained nor clipped. The wrapper clips only edge decoration. Native shadow customization still feeds the plane, with the same recipe at both roles. No exposed outside edge gains a border.

Equal-depth boundaries retain requested ordinary separators, including all-raised and none-raised states. A raised edge replaces the ordinary separator. Resize handles retain their own tracks and boundary lines; the adjoining raised decoration omits its extra line and stays below the interactive handle. Forced-colors uses a system-color line and suppresses shadows; tone and depth distinctions may collapse. Verify short content, both axes, RTL, light/dark themes and custom theme values in a real browser.

## Button announcement containment

The native button and its persistent loading-announcement live region share a private positioned inline-flex host. The clipped announcement is anchored at the host origin so a button inside a long scrollport does not extend document overflow. Attributes, events, form association and focus still target the native button. The live region remains outside its accessible name and mounted while idle.

## Input-styled controls

The core **Input-styled controls** contract (`docs/contracts/input-styled-controls.md` in the core documentation) defines this shared look-and-feel agreement. Applicable text, scalar temporal, select and compact multiselect surfaces normally fill their field-control allocation, align to its logical start, use a coherent input frame with visible focus, and default to one row. Textarea and wrapping selections are explicit adaptations. Field labels and feedback retain their existing arrangement strategies. Native theme tokens and supported customization supply the appearance; business compositions do not compensate with CSS.

UiInputFrame composes sub-inputs and supporting content into one input-styled control. UiTextInput shares its frame without adding another border. Existing native controls can fulfill the same agreement directly. Temporal ranges share one frame; their endpoint editors defer whole-control focus and error presentation to it. UiFileInput is input-styled: chooser, accepted filename and clear action share the surface. UiUploadRegion retains its drop-area presentation and owns the internal arrangement of optional progress, preview and actions. UiFileInput keeps previews separate. See the [reviewed components](reviewed-components.md) for ownership and native adaptations. This documents obligations, not new visual acceptance evidence.

## Shared input frames

Framed text editors support `maxWidthCharacters` as an approximate character-cell display cap (`input.frame.sizing.v1`), applied to the real editor allocation while the inner input fills it. It never supplies maxlength or changes parsing. UiInputFrameSpacer receives remaining logical inline space through an automatic start margin after editor growth; it is decorative and has no tab stop. The price example uses eleven cells for ten digits plus a decimal separator and places the spacer after USD. Narrow-width/RTL geometry remains subject to browser verification.

Bootstrap 6 form-control/form-adorn and form-ghost provide the surface and editors. A div replaces the single-input label container so multiple named inputs and buttons are valid. Disabled and invalid focus states use native --bs-control-* and --bs-*-focus-ring tokens. Sizes use native form-control-sm/lg.

UiInputFrame with ordinary UiTextInput implement input.frame.v1 and input.frame.cooperation.v1; single-line search also declares input.text.search.v1. The frame consumes field invalid/busy/disabled state and existing failure/size strategies. Hidden failure presentation retains aria-invalid. Parts receive unique names/IDs and the owning field's visible feedback descriptions. Leading, default and trailing content share one wrapping surface. Readonly leaves text selectable and blocks in-frame buttons by default; allowWhenReadonly permits appropriate non-editing actions without bypassing disabled/loading. Owned popup engagement is coordinated; popup content has a separate field/surface scope.

Use the [customization guide](customization.md) for consumed configuration. Functional DOM acceptance covers focus movement, invalid-part focus, incomplete drafts, Save/Reset/Clear and restrictions. Check appearance and narrow geometry with the intended theme in a browser; DOM tests are not visual evidence.

The adapter composes the native file chooser and accepted filename within its backend input frame; Clear participates in the same surface. Filename text follows the accepted descriptor independently of the browser file list. Acquisition alone creates no preview object URL. Browser visual acceptance remains separate from functional DOM checks.

## Focus after revealing a collapsible

Bootstrap 6 animates the native `details::details-content` block size and content visibility. A mounted editor can therefore precede its focusable presentation. Chromium can report hidden details-content without exposing a reveal animation through `getAnimations`, even with subtree discovery. Backend focus requests therefore check the actual pseudo-element content visibility. Hidden content is checked again at rendering opportunities, bounded by the configured native transition interval and a final rendering opportunity. Already visible content has no rendering wait. The backend focuses once when visible and verifies the native result; it does not repeatedly attempt focus. Closing the panel, replacing or removing the editor, disabling it, or moving focus elsewhere abandons the pending request. Business compositions still expand their owned section and request editor focus after Vue's update; they do not supply toolkit delays.

The DOM regression reproduces hidden content with no discoverable reveal animation, then checks reveal, cancellation, already visible content and a permanently hidden target. Verify reveal and focus recovery in the browser using the application’s scroll and disclosure containers.

## Vertical navbar adaptation

UiNavbar follows core's resolved navigation-region orientation. In a side navigation allocation it stacks brand, links and actions vertically at every width; a top/bottom or standalone navbar retains horizontal wrapping. Theme spacing and child semantics remain native to this backend. Only the acknowledged logical edge is rendered; a region-owned edge is not duplicated. This implements the shared UiNavbar backend guidance in `@uninterface/uninterface` (`docs/api/backend/navigation.md#uinavbar-implementation-guidance`), rather than relying on incidental narrow-width wrapping.

## Suggestion popup arrow policy

Suggestions retain the arrowless [native menu presentation](https://getbootstrap.com/docs/6.0/components/menu/). The adapter uses Popover for positioning but renders a menu/list surface; its engine does not dictate popover decoration. Bootstrap has no matching autocomplete baseline established here, so this is an explicit adapter choice consistent with its menu presentation. Ordinary popovers, temporal popovers and tooltips retain their native arrows. Business consumers supply suggestion data and behavior without arrow markup or CSS.


### Context menus during window resizing

Popup menus use `width: max-content`, capped by the viewport, with the native menu minimum also capped by that viewport. This is required by the top-layer integration: automatic width can shrink against the previous positioned left edge while the window narrows, leaving the label squeezed beside its shortcut even when Floating UI subsequently shifts the menu. Content width must be independent of the old position; text still wraps when the full viewport actually requires it. Native row spacing, shortcut presentation and Floating UI placement remain unchanged. Check readable labels as well as popup containment through shrink/expand.

The adapter uses core's backend helper `useUiMenuPoint` to retain the original click coordinates and derive an effective point constrained to the current document viewport. Shrinking past the original click recalculates the anchor; expanding restores it where possible. A changed effective point refreshes the native Menu floating reference. Native Floating UI auto-update, flipping and shifting continue to own placement. Button and keyboard invocation keep their element anchors. Resize preserves menu identity, open state and focus; shared point observers disconnect on deactivation/unmount. This addresses ordinary window resizing; it does not claim separate pinch-zoom or virtual-keyboard acceptance. Verify root and nested menus across shrink/expand and ensure commands remain reachable. Automated DOM tests cover state/wiring; browser geometry remains a separate acceptance check.


## Compound-control baseline alignment

The backend declares `layout.baseline.v1` for horizontal UiLayout/UiFlowLayout rows, with and without wrapping. The existing native CSS Grid/Flexbox allocation consumes `align="baseline"`; keyed allocation and stacking wrappers stay in place. Each wrapped row aligns independently. Vertical baseline alignment and UiRegionLayout baseline requests fail in core.

Input-frame editor participants supply the first editable baseline, ahead of leading icons and trailing actions. Native minimum-height surplus is centered around the content line. Button hosts use baseline vertical alignment; visible captions participate in baseline export while decorations retain their centered treatment. Field/form wrappers propagate the reference naturally; above labels expose their first line, while hidden/floating labels expose editable content. These adaptations preserve native typography, padding and control ownership. Arbitrary opaque content retains native baseline/fallback behavior; no DOM search or measured offset selects its business target.

The Shared input frame keyword row and Collections OrderSearch row exercise this behavior. Source/DOM checks do not establish painted text alignment; browser acceptance must compare actual text baselines at supported sizes, RTL, wrapping, feedback and loading states.


Framed UiTextInput also supports `minWidthCharacters` (`input.frame.min-width.v1`). The real editor allocation consumes a minimum in font-relative `ch` units; the inner native input continues to fill it. This minimum takes precedence over shrinking/percentage maxima in an insufficient host and is never a minlength constraint. Omission preserves the existing compact minimum and maximum-width behavior. OrderSearch and the Shared input frame keyword example request 20 cells; this is a business-composition choice, not a backend-wide search width.

## Neutral buttons

Uses native btn-outline with the requested theme color. Resting text/border/background use native neutral body/border tokens. Hover retains Bootstrap 6’s stronger semantic filled treatment, rather than simulating Element Plus’s pale tint. Keyboard focus retains native theme focus and outlined semantic treatment. Disabled appearance stays neutral.

Select variant="neutral" independently of color. This fulfills the neutral-rest/semantic-interaction contract using backend-owned adaptations; it does not change omitted defaults. Test color changes, variant removal, loading/disabled behavior, keyboard focus, and light/dark themes. DOM mapping coverage does not establish browser visual acceptance.


See [Contract adaptations](contract-adaptations.md) for this backend’s native mappings, support limits, allocation defaults and verification qualifications.

## Infinite table continuation

The adapter places continuation in its native Bootstrap table tbody, spanning the declared and selection columns. Loading, append failure/Retry and completion scroll with the data, before any creation row and summary. The sentinel stays at that point. The adapter retains one announcement outside the table/loading mask; non-infinite and card status paths remain separate. Verify pending/retry/completion, bounded infinite and no-summary tables, plus switching to manual content-height accumulation, preserving keyed editor state and column alignment.

## Infinite continuation content

UiTable, UiList and collection card views forward `infinity-loading` and `infinity-complete` message-content slots with `{ message, loadedCount }`. The backend retains its loading indicator, status container, continuation position and independent sentinel; table continuation remains before creation/summary rows. Initial/refresh masks and non-infinite status paths retain their existing presentation. Missing/empty content uses the resolved default text. Core resolves per-view `messages.listAppending`/`listComplete` for visible defaults and the elected announcement. Error slots expose `placement` for initial, replacement and append recovery. See the `@uninterface/uninterface` Collection views guide, Infinite continuation content section for ownership and observable checks.

Default infinite loading/completion feedback is centered and subordinate to record text. Bootstrap uses its native `--bs-fg-3` supporting foreground and a smaller relative text size; this adapter targets Bootstrap 6 tokens. The local loading message inherits that size instead of enlarging with control-size strategies; the backend retains its indicator. Errors, empty states and non-infinite feedback keep their own treatment. Custom infinity content inherits the status tone/alignment.

## Progress bars

Standalone and upload-hosted bars share `UiProgressBar.vue` and `progress.bar.v1`. Both measured and unknown progress use horizontal bars. See the [shared progress guide](progress.md) for this backend’s native mapping, precise range, semantic color and reduced-motion adaptations. The producer retains operation and announcement ownership.
