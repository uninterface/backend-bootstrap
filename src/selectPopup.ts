import { onMounted, onBeforeUnmount, onDeactivated, watch, type Ref } from 'vue'
import { useUiMenuPopup } from '@uninterface/uninterface/backend'
import { loadNativeSelect, type NativeSelect } from './nativeSelect'

/** Shared popup lifetime; the two views retain their distinct value contracts. */
export function useSelectPopup(options: {
  root: Ref<HTMLElement | undefined>
  element: Ref<HTMLButtonElement | undefined>
  menu: Ref<HTMLElement | undefined>
  multiple: boolean
  disabled(): boolean
  requestLoad(): void
  select(key: string): boolean
  blur(): void
}) {
  const { root, element, menu } = options
  const scope = useUiMenuPopup(menu)
  let native: NativeSelect | undefined
  let mounted = false
  let initialization: Promise<NativeSelect | undefined> | undefined
  let pendingOpen = false
  let intent = 0
  let blurTimer: ReturnType<typeof setTimeout> | undefined
  const contains = (target: Node | null) =>
    Boolean(root.value?.contains(target) || scope.contains(target))
  function requestLoad() {
    if (!options.disabled()) options.requestLoad()
  }
  function close() {
    intent++
    pendingOpen = false
    void native?.hide()
  }
  function outside(event: Event) {
    if (!contains(event.target as Node)) close()
  }
  function blur() {
    clearTimeout(blurTimer)
    blurTimer = setTimeout(() => {
      if (!contains(document.activeElement)) options.blur()
    }, 0)
  }
  function keydown(event: KeyboardEvent) {
    if (event.isComposing) return
    const activates =
      ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'F4'].includes(
        event.key,
      ) ||
      (event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey)
    if (activates) requestLoad()
    if (activates && !native && initialization) {
      const version = intent
      pendingOpen = true
      event.preventDefault()
      event.stopImmediatePropagation()
      void initialization.then(() => {
        if (mounted && version === intent && !options.disabled()) {
          pendingOpen = false
          native?.handleKeydown(event)
        }
      })
      return
    }
    if (
      event.key === 'Escape' &&
      (pendingOpen || element.value?.getAttribute('aria-expanded') === 'true')
    ) {
      event.preventDefault()
      event.stopPropagation()
      close()
      element.value?.focus()
    }
    if (event.key === 'Tab' && menu.value?.contains(event.target as Node)) {
      element.value?.focus()
      close()
    }
  }
  onMounted(async () => {
    mounted = true
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    initialization = loadNativeSelect().then((NativeSelect) => {
      if (!mounted) return
      native = new NativeSelect(element.value!, { multiple: options.multiple })
      native.opened = requestLoad
      native.requestSelection = options.select
      return native
    })
    await initialization
  })
  watch(options.disabled, (disabled) => {
    if (disabled) close()
  })
  onDeactivated(close)
  onBeforeUnmount(() => {
    mounted = false
    intent++
    clearTimeout(blurTimer)
    document.removeEventListener('pointerdown', outside)
    document.removeEventListener('focusin', outside)
    native?.dispose()
    native = undefined
  })
  return {
    toggle: async () => {
      if (native) {
        if (!options.disabled()) await native.toggle()
        return
      }
      const version = ++intent
      pendingOpen = !pendingOpen
      const current = await initialization
      if (mounted && version === intent && pendingOpen && !options.disabled()) {
        pendingOpen = false
        await current?.show()
      }
    },
    close,
    blur,
    keydown,
  }
}
