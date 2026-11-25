import Menu, { type MenuConfig } from 'bootstrap/js/dist/menu.js'
import { menuItemSelector } from './nativeMenu'

/** Controlled bridge to the pinned Bootstrap 6 Menu implementation. */
export class NativeMenu extends Menu {
  // Bootstrap has no controlled branch event. Vue mounts each requested branch;
  // do not let native hover listeners mutate a second expansion state.
  protected override _setupSubmenuListeners() {}
  protected override _initSubmenuTriggers() {}

  protected override _getItemsInMenu(menu: Element): HTMLElement[] {
    // Logical groups add wrappers. Retry joins navigation with its button styling.
    return [...menu.querySelectorAll<HTMLElement>(menuItemSelector)].filter(
      (item) => item.closest('.menu') === menu,
    )
  }

  protected override _isShown() {
    // A native entry transition can settle after Vue removes a lazy branch.
    return Boolean(this._menu?.classList.contains('show'))
  }

  setReference(reference: MenuConfig['reference']) {
    this._disposeFloating()
    this._config.reference = reference
    this._createFloating()
  }

  navigate(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      this._selectMenuItem(event)
      return true
    }
    if (event.key === 'Home' || event.key === 'End')
      return this._handleSubmenuKeydown(event)
    return false
  }

  override async show() {
    const shown = super.show()
    // The data API is uncontrolled and document-global. This adapter dispatches
    // supported native navigation explicitly; only core may close a surface.
    Menu._openInstances.delete(this)
    await shown
  }
}
