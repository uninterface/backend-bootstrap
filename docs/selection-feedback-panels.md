# Selection, feedback and panels

## Single selection

UiSelect uses Bootstrap 6 Combobox and Menu presentation with a button trigger and a popup listbox. It replaces the browser-native select picker; mobile users receive the same themed popup instead of an operating-system selector. Use the testing adapter rather than native `selectOption()` operations.

The public single-value contract is unchanged. A selection closes the popup and restores trigger focus; choosing the current option retains it. There is no clear button or editable search input. Placeholder and retained-value records supply the collapsed label but are absent from the candidate list. An explicit empty-string candidate remains selectable. Loading, failure and empty messages are nonselectable popup content and are announced separately from the selected value. Merely focusing the control does not load candidates.

Arrow keys navigate enabled options; Home/End reach their boundaries. Printable characters focus a label-prefix match without committing a value, and repeated characters cycle matches. Enter/Space commits; Escape dismisses without changing the value. Composition input and modified shortcuts are not treated as typeahead. Tab leaves the popup from the trigger's document position. Escape dismisses an open picker before reaching a hosting modal.

Single and multiple pickers share a private native bridge and popup lifecycle. Vue owns the accepted value and label; Bootstrap provides menu positioning and base keyboard mechanics. The popup uses the Popover top layer while retaining its DOM ownership. The single trigger remains a direct form-control sibling of its label, allowing Bootstrap's native floating-label selectors, sizing and validation presentation to apply. Focus, naming, descriptions and consumer attributes/listeners target the actual trigger.

## Multiple selection

UiMultiSelect uses Bootstrap 6 Combobox mechanics and native combobox/menu styling, with a one-row selected-label summary and an inset btn-close clear control. The popup uses the Popover top layer while remaining in its owning DOM scope. Vue owns selected values and display; the native bridge delegates selection requests without maintaining a second business value. It edits the complete field-owned string array; codecs translate business values. Clearing preserves loaded disabled selections and is available only when editable memberships exist in a ready source. Missing selected choices remain visible and removable after a ready response. Pending/error sources retain current values and block candidate edits. This is separate from UiSelect's single-value surface.

The popup keeps its choices inside the owning modal's interaction scope. Selected values, available choices and source feedback are independent. See the core multiple-selection guide for source lifetime and validation.

## Inline feedback and record details

UiNotice and UiBadge use Bootstrap alert and badge utilities. Severity never forces announcement: core supplies explicit off/polite/assertive policy. Badges are passive textual labels, not action chips or live counters.

UiKeyValueList/Item render dl/dt/dd with a two-column desktop arrangement and stacked labels/values below 40rem. Rich values remain opaque; business code supplies Intl formatting, empty/redacted wording and access policy. Exact spacing, typography and native theme colors are adapter presentation. Ordinary content needs no consumer stylesheet. Application-owned configuration and styles from the existing customization guide also cover these surfaces; there are no new business presentation knobs.

## Tabs and collapsibles

Horizontal bars use Bootstrap nav/nav-tabs/nav-link markup and active treatment. Vertical bars use native nav-pills/nav-pills-vertical presentation: Bootstrap’s bordered nav-tabs styling is horizontal, so stacking it does not produce a native vertical tab design. This presentation mapping is adapter-owned; both orientations retain tab semantics and the same control binding. Native nav-link focus styling is retained; the generic focus-presentation class is not applied to native tabs because its all-corner radius conflicts with native square bottom corners. The optional Bootstrap JavaScript tabs plugin is not installed as a competing state owner; the shared manual keyboard contract routes requests to core. Manual activation uses arrows/Home/End for focus and Enter/Space or pointer activation for selection. UiTab default slots supply labels, including passive icons/badges. UiTabsBinding and separately placed UiTabPanelBindings share one selection; no panel containment in the tab bar is required. Stable values preserve panels and disabled triggers are skipped. Full-height panels fill a definite business-owned allocation; their inner layout owns scrolling.


UiCollapsible uses the installed Bootstrap 6 details/summary accordion structure, direct accordion-header/accordion-body children, open-state selectors and the Bootstrap Icons chevron. Native CSS supplies expanded colors, borders, padding and reduced-motion-aware transitions. Toggle requests are intercepted before browser mutation so a controlled owner can decline; non-click native toggle routes are reconciled to owner state. HTML details has no disabled attribute: the adapter blocks user requests and exposes aria-disabled. Rich summary children use native inline-flex/gap utilities. Each component is one independent accordion surface; sharing an expansion control does not create a visually joined accordion.

UiCollapsible accepts a plain label or noninteractive summary slot. The backend supplies the operable toggle; summary content must include meaningful accessible text and cannot contain nested buttons, links or inputs. Core resolves standalone v-model or UiCollapsibleBinding, including local disabled restrictions. No backend imports the expansion control. That control supports at-most-one or multiple expanded keys, preserving state across view unmount/remount.

UiTabPanel and UiCollapsible retain mounted content. Lazy defers only first mount. Collapsing does not stop validation or background work. Reveal content before focusing a field. Native motion, markup and theme treatment vary; application-level theme customization follows this backend's existing customization guide. Controls do not require business-side CSS.

## Collapsible color

Supports `collapsible.color.v1`. An explicit semantic color applies the native theme class to the accordion item. Native CSS colors the expanded header and border; closed treatment is unchanged. The body receives native theme-reset while colored to stop this request from recoloring nested content. Omission removes both the explicit theme and reset. Baseline roles and the installed accent extension are supported.

## Verification and limits

Verify selection codecs, retained values, clearing and source states, notice urgency, passive badge semantics, definition-list associations, manual tab activation and lazy content retention. In a browser, check geometry, focus containment, visible focus and touch behavior. Check announcements with assistive technology. Use the core component references for shared behavior and the installed theme’s guidance for contrast.

For collapsible sections, exercise denied requests, accessible summary names, local disabled state, lazy retention and disposal. See [native testing](testing.md#run-the-backends-native-tests) for the source-checkout runner.

## Scrolling content and focus clearance

UiContent supports content/full height and named scrolling, with insets inside the scroll boundary. Use it when a content inset is intended. Use scrolling UiLayout/UiGridLayout for flush content; unpadded scrolling scopes adapt supported outward focus outlines inward without changing alignment. Padded content/card/modal surfaces reset that placement context. The backend keeps scroll-host and tab-panel focus indicators inward. Modal bodies own their own internal clearance and preserve native browser focus scrolling. Do not add another content inset solely to repair focus. Allocation-only layouts still add no content gutter. Native control focus offsets adapt inside unpadded scroll hosts. Custom or third-party focus treatments need their own integration checks. See the core package’s `docs/guides/scrolling-content.md` guide. Browser clearance checks cover the public focus binding; native paint/custom-theme acceptance still requires browser verification.

## Notice dismissal and presentation

UiNotice uses Bootstrap 6 alert/theme classes, a native btn-close button and flex/gap utilities for recovery actions. The close button has no data-bs-dismiss attribute: activation requests business-owned removal instead of letting Bootstrap remove Vue-owned DOM. The content column can shrink beside the close button.

Dismissal is opt-in through dismissible. The close control requests dismissal; business code decides visibility and focus handoff. Recovery actions retain source and tab order with backend-owned spacing and wrapping below the message. No automatic dismissal, timer or Escape handling is installed. Rich custom actions own their internal layout. Exercise denied, repeated and accepted dismissal, then change the language and verify content retention. In a browser, dismiss with the keyboard and check that the application restores focus to the intended target. Verify narrow LTR and RTL layouts and check announcements with assistive technology.

## Notice presentation

Default and soft retain the native Bootstrap 6 alert. Filled adapts theme-bg/theme-contrast tokens; outline retains the native border with a transparent background. Bootstrap 6 has no alert variant API for these two adaptations. Neutral custom resets inherited theme roles to native foreground/background/border tokens. Default icons reuse the local Bootstrap semantic artwork, with native alert gap/spacing. Ordinary links on filled notices inherit foreground.

UiNotice now supports custom kind/color and filled/outline/soft variants. The core rejects color on standard kinds and rejects undeclared or unsupported theme roles. A supplied icon slot always wins, even if empty; otherwise standard kinds supply their icon and custom supplies none. Icons are decorative/noninteractive; message text carries meaning. Declaration requires notice.color.v1, notice.variant.v1 and notice.icon.v1 alongside notice.v1. Applications customize through the existing backend theme setup; no business-side CSS is required. Native theme defaults remain in force unless a notice requests a treatment.

Focused five-backend DOM checks cover slot replacement, empty-slot suppression, neutral/custom colors, rejected combinations, retained content/focus and controlled dismissal. Browser cases cover variant/color/mode combinations, narrow geometry, icons and keyboard dismissal. Execution/visual acceptance must be recorded separately; passing DOM checks does not establish paint, contrast or assistive-technology conformance. See the shared feedback guide in `@uninterface/uninterface` (`docs/guides/feedback-and-details.md`).


### Notice action alignment

When the action row starts with a directly rendered text UiButton, its leading content aligns with the message column by hanging the native button inset into the notice's leading space. The row moves as a unit: button padding, height, hit targets, hover/focus treatment and gaps remain native. Logical margins support RTL; filled/outline/soft/icon-led rows retain ordinary boundary alignment. A leading icon or loading indicator is the aligned content; subsequent labels keep native icon/indicator spacing. Rich compositions own their internal alignment. Wrapped rows share the same origin; differently sized controls retain their own padding.

Without a notice icon, hanging is limited to the available inset so targets and focus remain inside the frame; exact label alignment can yield to containment. Applications that customize button padding can set `--bootstrap-notice-action-inset` on `.bootstrap-notice-actions` to the leading button's padding plus border inset. Native size mappings supply the ordinary value; this is backend-owned integration, not a business prop. If changing notice insets too, review target/focus containment and the backend's private maximum-hang rule.

Check wide/narrow LTR and RTL, native size levels, a single action, multiple/wrapped actions, explicit variants, loading and keyboard focus. DOM checks verify selectors match live button hosts; browser geometry and visual acceptance remain separate.

## Toast and notification targets

Supports core createUiToastTarget/createUiNotificationTarget and feedback.floating.v1. Targets render automatically in their creation scope, with configurable admission/capacity/duration and per-delivery Vue content. Uses actual Bootstrap Toast instances with autohide disabled, show/hide/hidden lifecycle events and authored toast bodies. A persistent native toast also supplies notification presentation. Native global queues are not used. Core owns the sole duration clock and summary announcement policy; native auto-dismiss timers are disabled. The core package documents full options in docs/guides/toasts-and-notifications.md. Configure appearance through this backend's existing customization setup and style.css; queue options belong to target creation, not toolkit-global service configuration. Verify concurrent rich forms, changing-height content, modal scope, narrow/RTL layout and native exit behavior before claiming browser/AT acceptance.

The adapter targets the installed Bootstrap 6 API: `theme-*` classes supply native header/border colors, and Toast owns `show`, discrete display/opacity transitions and `@starting-style`. No Bootstrap 5 fade class or separate animation is added. The viewport reserves native shadow clearance. This toolkit has no native toast countdown indicator. Native/source DOM regressions are in `testing/feedback-presentation.test.mjs`; actual geometry and motion still require browser acceptance.

Toast and notification now use distinct compositions of the native Toast surface: toast has no header band, an optional inline title in the body and an adjacent native close button; notification keeps the native header/body separation. Both retain native transitions, theme and shared FooterActions. Kind determines this distinction even with identical lifetime/placement/capacity options.

### Toast and notification focus

Both kinds implement the core backend delivery focus standard. A named, keyboard-focusable content region represents the delivery: direct keyboard focus there draws the indicator around the complete toast/notification surface, using Bootstrap’s `--bs-focus-ring` and `--bs-focus-ring-offset` tokens. The body has no duplicate inner outline. Moving into a rich input, link, close button or footer action removes the outer cue and retains the focused control's own treatment. Returning to the content region restores the outer cue. There is no extra equivalent root Tab stop and arrival does not take focus. Forced colors use `Highlight`; the fallback viewport has its own inward indicator.

The outer indicator preserves native shadows/elevation. Focus anywhere inside still follows the configured timer-pause policy. Verify both Tab directions, light/dark, narrow LTR/RTL, forced colors and viewport clearance. DOM selector checks do not establish browser paint or assistive-technology acceptance.
