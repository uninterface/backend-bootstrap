import { popupTarget } from './zOrder'
import { useUiZPopup } from '@uninterface/uninterface/backend'
import {
  ref,
  watch,
  nextTick,
  onMounted,
  onScopeDispose,
  onDeactivated,
} from 'vue'
import type { UiTemporalEditorViewProps } from '@uninterface/uninterface/backend'

/** Backend popup interaction; the owning temporal control retains the draft. */
export function useTemporalPopup(props: UiTemporalEditorViewProps) {
  const open = ref(false),
    anchor = ref<HTMLElement>(),
    surface = ref<HTMLElement>()
  useUiZPopup(() => popupTarget(surface.value))
  function show() {
    if (!props.binding.disabled && !props.readonly) open.value = true
  }
  function close(restore = true) {
    open.value = false
    if (restore) void nextTick(() => anchor.value?.focus())
  }
  function outside(event: Event) {
    if (!open.value || !(event.target instanceof Node)) return
    if (
      !anchor.value?.contains(event.target) &&
      !surface.value?.contains(event.target)
    )
      close(false)
  }
  function key(event: KeyboardEvent) {
    if (open.value && event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
    }
  }
  watch(
    () => [props.binding.disabled, props.readonly],
    () => {
      if (props.binding.disabled || props.readonly) close(false)
    },
  )
  watch(surface, (value) => {
    if (open.value)
      void nextTick(() =>
        (
          value?.querySelector(
            'input, button, [tabindex="0"]',
          ) as HTMLElement | null
        )?.focus(),
      )
  })
  onMounted(() => {
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('focusin', outside)
    document.addEventListener('keydown', key, true)
  })
  onScopeDispose(() => {
    if (typeof document === 'undefined') return
    document.removeEventListener('pointerdown', outside, true)
    document.removeEventListener('focusin', outside)
    document.removeEventListener('keydown', key, true)
  })
  onDeactivated(() => close(false))
  return { open, anchor, surface, show, close }
}
