# Navigation menus in Bootstrap

Bootstrap 6 nav/menu markup and tokens; native Collapse for tree branches and existing attached menu popups for flyouts. Horizontal top carets retain the combobox-caret transition; lateral modes retain directional carets. Current ancestors use native active treatment, with no ornamental indicator.

All four UiNavMenu presentations are implemented: horizontal, vertical-tree, vertical-popup, and icon-popup. The shared controller owns current/path/requests, while each view owns expansion. Current changes reveal persistent ancestry without opening closed flyouts. Native markup, focus mechanics and styling remain backend-owned. Group and descendant slots preserve leading icons; check selection and shortcut hints are absent from navigation projections.

Icon-popup uses labelled flyouts and accessible root names; missing root destination icons receive neutral menu-item artwork without changing modes. Navigation labels are required. Responsive selection is application-owned; UiNavbar does not automatically collapse.

The existing application-owned theme/configuration and stylesheet ordering continue to apply; there are no new business-side spacing, caret or native-widget props. See this backend's customization guide for toolkit settings actually consumed by the adapter.

Focused shared DOM tests cover the four presentations, three levels, icons, command-metadata isolation, current/breadcrumb synchronization, synchronous link interception, single request dispatch and accepted/refused navigation. DOM checks do not establish browser geometry, animation, mobile/RTL placement or assistive-technology acceptance.

Vertical roots and all persistent tree levels retain a leading icon column, including empty decorative slots. This keeps hierarchy independent of icon presence and supports consistent icon coordinates across vertical modes. Independent floating surfaces retain per-level icon-presence decisions. Rail labels appear on hover/focus; grouped headings retain hidden accessible text without widening the rail. Fallback artwork is a view projection, never a source mutation.

Navigation labels align to the logical start inside Bootstrap's expanding content slot. Leading artwork is centered inside a square wrapper, using the native menu icon-size token in popups and a text-sized fallback in nav links. Popup description alignment remains native; nav-link icons align with the label block. Icon/text gaps continue to use the native nav/menu tokens.

Icon-rail root buttons use a square derived from the icon size, native nav padding and border. Icons stay centered for both leaves and branches; a smaller directional caret occupies the trailing padding without adding a second icon column. Logical placement supports RTL. Hidden labels remain locally anchored, and descendant flyouts retain the ordinary labelled menu layout.

The backend DOM regression exercises the actual travel example in all four modes, checks adapter style matching and three-level activation. Browser scenarios check physical text start, icon/text gap, vertical alignment, square rail sizing and caret separation in LTR and RTL.

Drawer-based navigation is not a UiNavMenu presentation. Support for a hamburger trigger, drawer container and vertical hierarchy composition is planned; its public API and coordination solution remain undetermined.

Root navigation renders a logical themed separator unless an eligible UiNavbar or explicitly designated UiRegionLayout navigation region owns the adjoining boundary. The backend surface coordinates allocation transitions, focus and rail hints through useUiNavigationPresentation; it retains native row/icon geometry. Reduced motion suppresses transitions. DOM regressions cover ownership, fallbacks, expansion retention and hints. Compare geometry, focus and reduced-motion behavior in a browser.
