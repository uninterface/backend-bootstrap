import { nextTick } from 'vue'
import Combobox from 'bootstrap/js/dist/combobox.js'
import type { BootstrapEvent } from 'bootstrap/js/dist/dom/event-handler.js'
import Data from 'bootstrap/js/dist/dom/data.js'
import { NativeMenu } from './nativeMenu.client'

/** Native navigation/positioning with selection and display controlled by Vue. */
export class NativeSelect extends Combobox {
  requestSelection?: (key: string) => boolean | void
  opened?: () => void
  closed?: () => void

  protected override _syncInitialSelection() {}
  protected override _selectItem(item: HTMLElement) {
    if (item.matches(':disabled, .disabled, [aria-disabled="true"]')) return
    const document = this._toggle.ownerDocument
    const focused = document.activeElement
    const index = this._getVisibleItems().indexOf(item)
    if (this.requestSelection?.(item.dataset.bsValue!) === false) return
    if (this._config.multiple) {
      void nextTick(() => {
        // Removing a selected missing option can remove the focused button.
        // Restore the live popup's navigation context only if focus was lost.
        if (
          !focused ||
          focused.isConnected ||
          !this._isShown() ||
          document.activeElement !== document.body
        )
          return
        const items = this._getVisibleItems()
        ;(
          items[Math.min(Math.max(0, index), items.length - 1)] ?? this._toggle
        ).focus()
      })
    }
    if (!this._config.multiple) {
      void this.hide()
      this._toggle.focus()
    }
  }
  private lookup = ''
  private lookupTime = 0

  private navigate(event: BootstrapEvent): boolean {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey)
      return false
    if (event.key === 'Home' || event.key === 'End' || event.key === 'F4') {
      this.lookup = ''
      this.lookupTime = 0
      event.preventDefault()
      void this.show()
      const items = this._getVisibleItems()
      ;(event.key === 'End' ? items.at(-1) : items[0])?.focus()
      return true
    }
    if (event.key.length !== 1 || event.key === ' ') {
      this.lookup = ''
      this.lookupTime = 0
      return false
    }
    event.preventDefault()
    const now = Date.now()
    const character = event.key.toLocaleLowerCase()
    this.lookup =
      now - this.lookupTime > 700 ? character : this.lookup + character
    this.lookupTime = now
    // Repeated characters cycle matching choices; other characters build a prefix.
    const query = [...this.lookup].every((value) => value === character)
      ? character
      : this.lookup
    void this.show()
    const items = this._getVisibleItems()
    const current = items.indexOf(document.activeElement as HTMLElement)
    const start = query.length === 1 ? current + 1 : Math.max(current, 0)
    for (let offset = 0; offset < items.length; offset++) {
      const item = items[(start + offset) % items.length]
      if (
        (item.dataset.bsLabel ?? item.textContent ?? '')
          .trim()
          .toLocaleLowerCase()
          .startsWith(query)
      ) {
        item.focus()
        break
      }
    }
    return true
  }
  protected override _handleToggleKeydown(event: BootstrapEvent) {
    if (!this.navigate(event)) super._handleToggleKeydown(event)
  }
  protected override _handleMenuKeydown(event: BootstrapEvent) {
    if (!this.navigate(event)) super._handleMenuKeydown(event)
  }
  // Finish a first key intent captured while the browser module was loading.
  handleKeydown(event: KeyboardEvent) {
    if (this._menu.contains(event.target as Node))
      this._handleMenuKeydown(event)
    else this._handleToggleKeydown(event)
  }
  protected override _createMenuInstance() {
    // The pinned alpha permits only one registered component per element, even
    // though Combobox constructs a Menu on its trigger. This bridge is owned
    // explicitly by Vue, so only Menu needs the native registration.
    Data.remove(this._toggle, 'bs.combobox')
    this._menuInstance = new NativeMenu(this._toggle, {
      menu: this._menu,
      autoClose: false,
      strategy: 'fixed',
      placement:
        getComputedStyle(this._toggle).direction === 'rtl'
          ? 'bottom-end'
          : 'bottom-start',
    })
  }
  // Native Combobox owns keyboard movement and activation. Keep its data API
  // off this element; the view explicitly connects pointer activation.
  override async show() {
    if (this._toggle.matches(':disabled') || this._isShown()) return
    this.opened?.()
    this._menu.style.minWidth = `${this._toggle.getBoundingClientRect().width}px`
    this._menu.showPopover()
    if (!this._menuInstance) this._createMenuInstance()
    await this._menuInstance!.show()
  }
  override async hide() {
    if (!this._isShown()) return
    // Dispose synchronously: no delayed transition may mutate a disposed view.
    this._menuInstance?.dispose()
    this._menuInstance = null
    this._menu.hidePopover()
    this._menu.classList.remove('show')
    this._toggle.classList.remove('show')
    this._toggle.parentElement?.classList.remove('show')
    this._toggle.setAttribute('aria-expanded', 'false')
    this.lookup = ''
    this.lookupTime = 0
    this.closed?.()
  }
  override dispose() {
    void this.hide()
    super.dispose()
  }
}
