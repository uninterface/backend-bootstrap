# Bootstrap contract adaptations

[Documentation index](README.md) · [Presentation and integration](presentation.md)

This backend-owned reference records native mappings, support limits and integration decisions. Shared API semantics remain in @uninterface/uninterface; native component names and concrete appearance do not add business-side parameters. This documentation move adds no runtime support or browser acceptance evidence.
## Fields, controls and strategies

Field size uses native label sizing classes/tokens. Above/beside ordinary and group labels and native floating text/select labels are supported; near/far are supported across participating beside labels, with general beside resolved to beside-far before rendering. Checkable labels remain adjacent except in explicit separated presentation; required annotations default to suffix. Help replacement and below/tooltip failures are supported; embedded requests approximate below. Native floating select markup requires the select to remain a direct field child, including when containing hidden accessibility helpers.

Single and multiple selection use the installed Bootstrap 6 Combobox/Menu integration. Multi-selection presents a single-line summary (long summaries truncate), popup choices and inset native close icon. Segmented selection uses joined btn-check/btn-group labels containing native radio inputs and bordered segments. Native beside-label sizing and contained segmented focus remain; no extra 3px outer scroll inset. Input frames use form-adorn and ghost integration. Full-width buttons fill their host/control. Neutral buttons retain native outline hover fill; lower emphasis alone does not justify secondary color.

File input remains a visible native input[type=file].form-control within the Clear frame. Browser-owned Browse/empty-selection wording follows browser language. FileList assignment mirrors accepted File objects on mount/replacement/reset; rejection/cancellation restores acceptance, and the native list clears before opening for same-file reselection. No local path is assigned. Physical chooser behavior still requires browser verification.

Preview regions use form-control framing without a fake editor. Image previews use native images and an accessible contained broken-image glyph. File preview artwork is local scalable family-marked artwork.

Ordinary beside form-label arrangements and separated checkable label/control areas stack below a 40rem viewport. Flushed/control-aligned standalone labels and individual option labels stay adjacent. Checkable labels and group titles remain visible under hidden; see the checkable modes in [strategy support](strategies.md).

## Collections and navigation

Tables use native table/form classes, colgroups, sticky thead for bounded headers, and sortable header controls with inherited header typography and no ordinary button chrome. Priority text participates in width allocation without duplicate accessible announcements. The outer collection host owns bounded scrolling and the business footer stays outside the semantic table. Column filters compose themed header buttons and existing popovers for arbitrary business editors; removable criteria combine the badge and native close button.

Pagination uses native pagination markup/form controls with bounded page windows and named directional symbols at constrained widths. Footer info sits at start, with size → paginator → jumper at end; multi-row navigation retains end alignment and flexible info space. This grouping is an Uninterface adaptation. Size/jumper views are independent, and native widgets do not fetch data or reconcile pages. Context menus refresh their native floating reference on viewport changes.

## Feedback and surfaces

Notices use native alert for default/soft, theme background/contrast adaptation for filled, and transparent native border for outline. Neutral custom notices reset inherited semantic colors. Text-led action rows hang native inset into notice space while preserving padded targets; non-text-led rows retain boundary alignment.

Toasts use actual native Toast instances with autohide disabled and native show/hide/hidden transitions. Brief toast has a headerless body with optional inline title and adjacent close; notification retains native header/body regions. Installed v6 theme classes and discrete toast fade are preserved. No native toast countdown is supplied. Managed feedback variant does not select floating surface variants.

FooterActions places the first action at inline-end with reverse-inline flow across managed modal/drawer/popover/feedback surfaces, retaining declaration/DOM/Tab order. Drawers/popovers use Bootstrap 6 Drawer/Popover classes. UiPopover retains native default arrows. Suggestions remain menu/list presentation without a pointer: using the popover positioning engine does not require its decoration. Menus use owned top-layer popovers within modal interaction, and stacking registers the actual native tooltip/popover wrapper. Native loading spinners combine with an adapter mask. Empty states use native layout utilities/buttons, with spanning table body rows.

## Appearance and artwork

Color mode uses data-bs-theme and follows system appearance without an explicit host selector; explicit selectors win. Default fonts are Geist Variable then Inter Variable, intentionally differing from upstream system fonts. Font entries supply actual faces and language fallbacks. Native card wrapping already provides the long-word behavior also supplied by UiContent outside cards.

Clear uses Bootstrap Icons eraser artwork; more-vertical uses three-dots-vertical and menu-item reuses file-earmark with an independent semantic key. File previews use local scalable glyphs. Popup geometry, contrast and native visual behavior remain separately verified; the workspace does not impose an automated WCAG AA gate on this toolkit backend.

See [presentation](presentation.md), [strategy support](strategies.md), [collections](collections.md), [typography](typography.md) and [customization](customization.md).

## Support and native defaults

The following mappings describe this installed adapter. Shared strategy requests can generalize to supported fallbacks; native feature availability alone does not imply adapter support. Three-level control scales map out-of-range requests to the nearest native level. Embedded validation is not implemented and is approximated to below feedback. Browser geometry, wrapping, focus paint and assistive-technology acceptance remain separate from source/DOM checks.

### Native size and field-label support

| Backend | Native editor levels | Native button levels | Supported field labels |
|---|---|---|---|
| Bootstrap | -1/0/1 | -2/-1/0/1 | above/beside-near/beside-far for ordinary/group fields; floating for text/select; native beside checkbox/switch labels; hidden throughout |

### Collapsible color

| Backend | Color behavior |
|---|---|
| Bootstrap | Native theme treatment on the expanded header and border; collapsed header remains native. Body content does not inherit the requested theme tokens. |

### Upload allocation

| Backend | Minimum inline size | Minimum block size | Compact / regular / large block size |
| --- | --- | --- | --- |
| Bootstrap | 12rem | 10rem | 10 / 10 / 16rem |

### Upload integration

| Backend | Presentation and concrete adaptation |
|---|---|
| Bootstrap 6 alpha | Native icon button with Bootstrap upload artwork opens a hidden file input; native progress/spinner and buttons. No dedicated upload-region component; themed outer boundary supplies the shared region contract |

### Notice variants

| Backend | Omitted | filled | outline | soft |
| --- | --- | --- | --- | --- |
| Bootstrap | Native alert | Theme background/contrast token adaptation | Native border with transparent background | Native alert |

### Multiple selection

| Backend | Presentation |
| --- | --- |
| Bootstrap | Native Bootstrap 6 Combobox navigation and popup positioning, controlled selected values, a single-line label summary and an inset native close icon for clearing. Long summaries truncate; the popup exposes individual choices. |

### Floating feedback integration

| Backend | Implementation |
|---|---|
| Bootstrap | Actual native Toast instances with autohide disabled; native show/hide/hidden lifecycle, authored rich toast bodies |

### Default font families

| Backend | Family order |
|---|---|
| Bootstrap | Geist Variable, Inter Variable |


## Checkable label and description alignment

Standalone checkboxes and switches retain Bootstrap 6's input/switch followed by `.form-field-content`, which owns the label, help and displayed error. Bootstrap's native small/large check/switch label rules assume a directly adjacent label; the adapter applies the same `--bs-font-size-sm`/`--bs-font-size-lg` tokens through its described-content wrapper, including group options. Native control dimensions, margins and focus treatment remain intact.

Business authors supply the existing UiField label/help and business value; no alignment CSS or new public prop is required. Verify short/wrapped labels, descriptions present/absent, requested sizes, narrow/wide fields and both text directions while preserving label activation, keyboard behavior, disabled state and help/error associations. Whole-field flushed/control-aligned/separated arrangements are implemented; see [strategy support](strategies.md) for resolution, alignment and responsive behavior.

Checkable validation recovery focuses the first enabled checkbox or selected enabled/first enabled radio without changing values. Named group/status and form fallbacks get temporary programmatic focusability with blur/disposal cleanup. Native options retain their toolkit indicators and feedback descriptions; fallback containers use the shared backend focus-visible treatment, including forced colors and scrolling containment. Group/field wrappers do not gain standing focusability merely from validation failure.
