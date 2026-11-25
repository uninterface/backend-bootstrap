<script lang="ts">
  import {
    cloneVNode,
    defineComponent,
    nextTick,
    onBeforeUnmount,
    onDeactivated,
    onMounted,
    ref,
    watch,
    type PropType,
  } from 'vue'
  import {
    useUiZPopup,
    useUiMenuPopup,
    useUiMenuPoint,
  } from '@uninterface/uninterface/backend'
  import {
    loadNativeMenu,
    menuItemSelector,
    type NativeMenu,
  } from './nativeMenu'
  export default defineComponent({
    props: {
      anchor: Object as PropType<HTMLElement>,
      point: Object as PropType<{ x: number; y: number }>,
      side: Boolean,
      navigation: Boolean,
    },
    emits: ['close'],
    setup(props, { slots, emit }) {
      const surface = ref<HTMLElement>()
      const scope = useUiMenuPopup(surface)
      const zPopup = useUiZPopup(() => surface.value, {
        topLayer: true,
        scope: true,
        source: 'menu popup',
      })
      let native: NativeMenu | undefined
      let active = false
      let restoreClasses: (() => void) | undefined
      const effectivePoint = useUiMenuPoint(
        () => props.point,
        () => props.anchor,
      )
      const reference = () =>
        effectivePoint.value
          ? {
              getBoundingClientRect: () =>
                new DOMRect(
                  effectivePoint.value!.x,
                  effectivePoint.value!.y,
                  0,
                  0,
                ),
              contextElement: props.anchor,
            }
          : props.anchor!
      function outside(event: Event) {
        if (
          !scope.contains(event.target as Node) &&
          !props.anchor?.contains(event.target as Node)
        )
          emit('close')
      }
      function cleanup() {
        active = false
        zPopup.closed()
        document.removeEventListener('pointerdown', outside)
        document.removeEventListener('focusin', outside)
        if (surface.value?.isConnected) surface.value.hidePopover?.()
        // Vue owns removal. Dispose native observers synchronously, without a
        // delayed hide transition writing to an already disposed instance.
        native?.dispose()
        native = undefined
        restoreClasses?.()
      }
      onMounted(async () => {
        const menu = surface.value!
        if (!props.anchor || !menu?.showPopover)
          throw new Error(
            'Menu popups require an anchor and browser Popover API support.',
          )
        active = true
        const NativeMenu = await loadNativeMenu()
        if (!active) return
        menu.classList.remove('show')
        const decorated = [props.anchor, props.anchor.parentElement].filter(
          (element): element is HTMLElement =>
            Boolean(element) && !element!.classList.contains('show'),
        )
        restoreClasses = () =>
          decorated.forEach((element) => element.classList.remove('show'))
        native = new NativeMenu(props.anchor, {
          menu,
          reference: reference(),
          autoClose: false,
          strategy: 'fixed',
          placement: props.side
            ? getComputedStyle(props.anchor).direction === 'rtl'
              ? 'left-start'
              : 'right-start'
            : 'bottom-start',
        })
        zPopup.prepare(menu)
        try {
          menu.showPopover()
        } catch (error) {
          zPopup.closed()
          throw error
        }
        void native.show()
        document.addEventListener('pointerdown', outside)
        document.addEventListener('focusin', outside)
        await nextTick()
        if (active)
          (menu.querySelector<HTMLElement>(menuItemSelector) ?? menu).focus()
      })
      watch([effectivePoint, () => props.anchor], () =>
        native?.setReference(reference()),
      )
      onBeforeUnmount(cleanup)
      onDeactivated(cleanup)
      return () => {
        const child = slots
          .default?.()
          .find((node) => typeof node.type !== 'symbol')
        if (!child) return null
        return cloneVNode(
          child,
          {
            ref: (instance: any) => {
              surface.value = instance?.$el ?? instance
            },
            popover: 'manual',
            class: 'bootstrap-entry-popup',
          },
          true,
        )
      }
    },
  })
</script>
