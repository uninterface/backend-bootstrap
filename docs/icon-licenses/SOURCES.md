# Common icon asset provenance

The mappings below use selected artwork from Bootstrap Icons from `@iconify-json/bi` 1.2.7 in local Vue templates. The license texts in this directory apply to the distributed artwork.

`create` reuses the plus component. Each semantic name remains independently overridable. `first` and `last` use directional metadata. Sort artwork retains its direction.

| Meaning | Artwork |
| --- | --- |
| `create` | `plus` |
| `remove` | `dash` |
| `reset` | `arrow-counterclockwise` |
| `clear` | `eraser` |
| `retry` | `arrow-clockwise` |
| `home` | `house` |
| `help` | `question-circle` |
| `bookmark` | `bookmark` |
| `location` | `geo-alt` |
| `globe` | `globe` |
| `calendar` | `calendar` |
| `time` | `clock` |
| `file` | `file-earmark` |
| `image` | `image` |
| `attachment` | `paperclip` |
| `email` | `envelope` |
| `filter` | `funnel` |
| `sort` | `arrow-down-up` |
| `sort-ascending` | `sort-up` |
| `sort-descending` | `sort-down` |
| `first` | `chevron-double-left` |
| `last` | `chevron-double-right` |
| `external-link` | `box-arrow-up-right` |

Follow-up common `link` uses `link-45deg` from the same collection/version listed above. It depicts chain links, distinct from the outward-arrow `external-link` artwork. Existing asset licenses apply.

The three sort assets retain the upstream 16×16 viewports: [arrow-down-up](https://icons.getbootstrap.com/icons/arrow-down-up/), [sort-up](https://icons.getbootstrap.com/icons/sort-up/) and [sort-down](https://icons.getbootstrap.com/icons/sort-down/). Their paths are unchanged from the upstream assets.

## Native-first common mappings

`menu-item` reuses Bootstrap Icons `file-earmark`, the same component as `file`, with an independent override key. `more-vertical` uses the native `three-dots-vertical` glyph from the collection/version above, without rotation.

For new mappings, inspect the supported icon set first and retain suitable native artwork. Transform it only when the required variant is absent; draw new artwork only when the set cannot express the meaning. Record the source/version, license and reason for each transformation or custom asset. See `@uninterface/uninterface` documentation at `docs/contracts/icon.md#backend-artwork-selection`.

Common `settings` uses `gear` from the pinned collection/version above. Its upstream 16×16 viewport is retained so the gear fills and centers within the square icon frame. Paths are preserved without rotation or redrawing; the existing asset license applies.

The common `filter` asset retains the upstream Bootstrap Icons [funnel](https://icons.getbootstrap.com/icons/funnel/) path and 16×16 viewport.

The `clear` mapping uses the unmodified `eraser` from the pinned collection in a local Vue component. The source license applies. Toolkit-owned input clear glyphs use their own presentation.

The `move-up` and `move-down` semantic names reuse the existing `arrow-up` and `arrow-down` shafted arrow artwork respectively, with independent override keys and no RTL mirroring. No additional artwork is bundled for these aliases.

The four physical direction icons, `arrow-up`, `arrow-down`, `arrow-left` and `arrow-right`, use the unmodified `arrow-up`, `arrow-down`, `arrow-left` and `arrow-right` artwork from the pinned collection/version above. Existing licenses apply. These arrows have shafts and retain their physical direction in RTL; they are distinct from navigation chevrons and logical previous/next actions.

`reset` (`arrow-counterclockwise`) and `clear` (`eraser`) use their upstream
16×16 viewports and paths. `confirm`
uses the unmodified [check-lg](https://icons.getbootstrap.com/icons/check-lg/)
from Bootstrap Icons 1.13.1 (MIT; existing Bootstrap Icons license), retrieved
from `bootstrap-icons@1.13.1/icons/check-lg.svg`. This native variant fills more
of the icon square than `check`, making integrated Apply readable without
changing the button or input-frame height.
