# Component presentation

Bootstrap uses native form/switch/link/breadcrumb classes, Bootstrap 6 Tooltip and Datepicker, and inline time text editing. Tooltip integration disables native trigger listeners because Uninterface coordinates the requested visibility. Review these protected methods when upgrading Bootstrap.

Password reveal preserves the editor and uses a named non-submit reveal action. Switches follow the shared switch-then-label arrangement. Search source/selection and temporal validation remain core-owned. Tooltips and suggestions use popup targets inside their owning modal. Directly owned tooltips paint below the header and footer. A managed tooltip requires at least half of its anchor area visible after clipping and overlap by known layout regions. File chooser/drop accepts one file; uploads use an application transport. Preview URLs are resolved and released by core.

Temporal inputs use a normal backend text field. Date/datetime inputs have a leading calendar button; time is edited once, inline, with locale/hour-cycle formatting. There is no second time editor in a popup. The button opens a floating picker; Alt+ArrowDown opens it from the editor, and Escape closes it. Selection and explicit dismissal return focus to the trigger. Disabled/readonly inputs cannot open the picker. Popups use the application/modal overlay target. Bootstrap composes its input-group, Popover and inline Datepicker; time stays in the outer text editor, including the time portion of a datetime. This follows the [Bootstrap Datepicker](https://getbootstrap.com/docs/6.0/forms/datepicker/) facilities while retaining lossless text editing. Native free-text date parsing can normalize impossible dates. The adapter therefore commits only eligible calendar candidates, and owns dismissal instead of the Popover trigger listeners. Its protected listener overrides need review on Bootstrap upgrades.

Picker candidates bypass the display-text parser and are validated by the owning control. Native selection is checked before commitment; a toolkit calendar may still display a candidate that a combined datetime or interval rule later rejects. Choosing a date for an empty datetime leaves a visible incomplete draft until its time is entered. Explicit open boundaries and extended hours remain text/control semantics, not claims of native picker support.

Use the existing application-owned [customization guide](customization.md) for theme setup and stylesheet ordering. These components consume the same native theme configuration; no extra business stylesheet or generic styling wrapper is required. Keep overrides after the backend stylesheet and test teleported popup coverage in light/dark modes. Do not style only the component wrapper when the actual editor or popup lives elsewhere.

Shared control and built-DOM checks exercise state, naming, calendar/time/datetime selection, preservation of milliseconds and invalid text, disabled/readonly behavior, Escape dismissal and focus return, file replacement and tooltip associations. Check picker geometry, touch and keyboard behavior, hover continuity, modal stacking and assistive technology in the intended environment.

Suggestions compose native Popover positioning with the native menu surface/items, preserving external-editor focus and avoiding a second query/filter owner. The adapter disables native tooltip trigger/dismissal listeners because shared combobox state owns those requests. Semantic link color uses Bootstrap 6 theme-* classes, not removed Bootstrap 5 link-color helpers. Upload progress uses the native progress component.

Breadcrumbs use the native breadcrumb/breadcrumb-item markup and ordinary anchors, preserving Bootstrap link and active-item treatments. Current and non-link items remain text. No extra breadcrumb visual overrides are applied.

Temporal ranges keep both endpoint positions and their separator inside UiInputFrame. An unrestricted end is a compact ∞ badge; both unrestricted ends remain ∞ – ∞. Endpoints use content width, with spare space before trailing actions. Narrow allocations use two rows while retaining the dash and endpoint order. Owned calendars and mode menus keep the frame engaged; inner editors defer boundary, background and whole-control focus/error paint to it. Bootstrap retains external labels for grouped fields.

Bounded date ranges use Bootstrap Datepicker's native `selectionMode: 'multiple-ranged'` with one trigger and native highlighting. The first click stays picker-local; the completed pair commits together, including same-day and reverse selections. Escape or outside dismissal discards an incomplete selection. Open date ranges use a single-date calendar. Bootstrap supplies no complete time-range or combined datetime-range picker; these retain composed text editors, with calendars for datetime dates. Calendar selection, Escape and outside interaction dismiss the popup without an added Close button.

The leading range-mode menu uses native Bootstrap Menu behavior and Bootstrap Icons arrows; labels remain localized. It offers only allowed combinations: both specified, start only, end only, unrestricted. Mode changes retain drafts; external synchronization/reset and Clear discard them. Unrestricted is distinct from an absent whole value. The compact × action clears the whole range. Overnight time ranges use the shared custom calendar +1 SVG with localized accessible text and a tooltip. Actions obey disabled/readonly state; an empty draft never implicitly opens a boundary.

Date text defaults to year-month-day, independently of calendar language. Text parsing accepts surrounding/repeated whitespace, unpadded numeric components and valid extra precision; discarded precision is validated first. Canonical control values and codecs remain unchanged.

Picker triggers occupy the leading side of the input. Their localized “Choose…” strings name the icon button and popup for assistive technology; the adapter does not add a visible popup heading from those strings.

UiFileInput exposes the native form-control file chooser (Browse plus empty status or filename) instead of hiding it behind custom text. Browser-owned wording follows browser language. The accepted File descriptor is mirrored through DataTransfer/FileList on mount, external replacement and reset; rejected candidates and chooser cancellation restore the accepted list. The list is cleared before opening so the same file can be selected again. Native file-selector-button styling is retained; the inner border/focus defers to the enclosing frame so Clear remains inside one surface. File Clear retains Bootstrap’s text/icon treatment with input-relative action dimensions. Range endpoints remove their separate form-control boundary while the enclosing form-control/form-adorn frame supplies focus and invalid presentation.

UiUploadRegion uses a workflow binding with retained-field or service destinations. Optional progress, preview and actions are arranged entirely by this backend. Bootstrap uses a native icon-only button with local Bootstrap upload artwork to trigger a hidden file input, alongside native progress/spinner and button classes. The chooser button carries the field name/state/descriptions and a localized Choose file title, with keyboard activation and focus recovery through the existing region mechanics. It appears only in the ready phase; the hidden input is not a separate tab stop. It has no dedicated uploader shell; the adapter supplies the themed drop boundary. The complete named region receives drops and fits its contents within an explicit extent without scrolling; optional contents no longer reserve blank rows. Upload/association locks persist when progress or preview is absent. Focus moves to an available chooser/action or the region when a focused action disappears. Preview URL lifetime remains core-owned; controller lifetime belongs to the business composition.

The upload group is excluded from ordinary Tab traversal (tabindex=-1 while enabled); Tab visits the chooser/actions directly. Named fallback focus remains available when no action accepts focus. Native Bootstrap icon-button focus is retained.

The upload boundary uses native form-control with the existing adapter layout. This establishes Bootstrap's scoped control tokens, native focus ring and disabled background/border/foreground; aria-disabled maps those native disabled tokens onto the group root. The adapter preserves containment-aware focus offsets. Shared input-frame wrappers also lose their focus target when disabled; live disabling releases internal surface focus, and upload recovery cannot focus a disabled region.

Verify appearance and geometry in the browser, including zoom and RTL.

### Concise upload states

The region shows its chooser/artwork only in the ready state. Working and retained states display file/progress or file/preview with available actions. Recovery uses one short error and a row of actions. Progress labels remain accessible without a duplicate visible caption; preview displays the filename once. Embedded previews use a compact file summary.

This backend's compact/regular/large allocations are currently 10/10/16rem. There is no shared minimum. The allocation remains stable across states; the host must respect the backend minimum size; content never introduces scrolling. These are adapter defaults, not business-authored dimensions or browser geometry acceptance.

### Image-only preview

UiImagePreview uses the container allocation or explicit dimensions, with contain by default and stretch when requested. It has no border, avatar shape, filename, caption or actions. Missing/failed content uses an accessible broken-image glyph, without visible failure prose. A parent with definite bounds retains its rectangle through failure; auto sizing cannot reserve unknown intrinsic dimensions before loading. Embedded upload previews use their region's available bounds instead of a fixed thumbnail limit. File metadata presentation remains separate.

Native img supplies object-fit; fallback is adapted SVG using inherited color. DOM checks pass separately from browser geometry/visual acceptance.


Upload regions declare minimum inline/block allocations and do not scroll internally. Long file/error text is abbreviated with full DOM text and title retained; recovery keeps its actions visible. This backend declares a minimum inline size of 12rem and block size of 10rem; hosts, including fill allocations, must respect those constraints. Browser acceptance of fitting is separate from DOM workflow checks.


### Upload minimum-size audit

Fill uses the same interior padding/gap as compact so a Tile fits at the declared minimum. Delivery failures use the same single error line and recovery-action arrangement as acquisition failures, avoiding an extra filename row.

In a browser, check compact, regular, large and fill allocations at the minimum and at narrow widths. Repeat at each supported control size with known, unknown and hidden progress, long file names and errors, delivery retry, portrait and landscape previews, and no preview. Verify that visible descendants stay within the allocated region and that actions remain reachable.



### Transfer failure and retry presentation

UiUploadProgress presents both active transfer progress/Cancel and transfer failure/Cancel/Retry. Failed transfers have concise feedback and available native Cancel and Retry buttons, without a progress indicator. The file name is visible inside the progress/recovery presentation and identifies the transfer group; Retry describes its failure. The view invokes guarded producer callbacks and never creates a task. The backend retains its existing button and progress primitives and arranges feedback/actions within the allocated width.

UiUploadRegion composes the same progress view for transfer recovery, without duplicating the filename, error or Retry. Acquisition rejection and delivery failure remain region-owned. Omitting the progress indicator does not omit essential transfer feedback or selected Retry; cancellation is not an error, but an owner may retain a Retry action. Recovery layout responds to recovery participation, including cancellation without an error message. Keyboard context is preserved across standalone Retry/Cancel changes; region focus coordination includes the chooser. DOM checks cover wiring and lifetime; browser fitting and assistive-technology checks remain separate.

To verify standalone recovery, render UiUploadProgress with a named file and a failing transfer. Check that the message and Cancel and Retry remain visible at narrow widths. Repeat the failure on Retry and verify focus stays in the recovery context. Exercise the same failure inside UiUploadRegion to check that the filename and actions appear once.

### Native integration safeguards

Tooltip/Popover JavaScript is loaded when a mounted popup needs it, so importing and rendering the backend on the server does not evaluate Bootstrap's document-dependent modules. The adapter still uses the native stylesheet and popup positioning. Modal entry animates opacity/transform without transitioning visibility, allowing the shared initial-focus request to run immediately; exit retains the native visibility transition. Normal-motion browser focus acceptance must still be checked.

Removing a focused missing selection from a multiple-choice popup moves focus to the nearest remaining enabled choice, or the trigger when none remain. This repair runs only when the original target was removed and focus fell to the document; it does not override a deliberate focus move.

Progress and transfer failure share a filename row above a context/action area. Failure uses the native danger/error foreground. Standalone messages wrap completely, including unbroken text; actions stay at logical end and wrap below if necessary. Inside UiUploadRegion, the concise summary retains full DOM text/title and Retry association. The chooser shares the identity row while the complete lower allocation is available to feedback/actions. Native action labels keep their ordinary dimensions.


The stable minimum block allocation is 10rem. Compact and regular use 10rem and large uses 16rem. This budget accommodates the file identity, error and native recovery actions at the minimum width, including a wrapped action row. Long diagnostics may require more space. Ordinary workflow states share the same allocation.


Transfer-failure text uses `--bs-danger-fg`, with color and mode mapping owned by the theme. The optional shared focus helper retains keyboard context across the brief activity-to-failure rendering gap, including an immediately repeated failed Retry. Verify focus after a failure and an immediate failed retry.
