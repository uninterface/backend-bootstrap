<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiTooltipView,
    useUiOverlayTarget,
    type UiTooltipViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiTooltipViewProps>()
  const {
    anchor,
    surface,
    trigger,
    surfaceEvents,
    visible,
    describe,
    placement,
  } = useUiTooltipView(props)
  const portal = useUiOverlayTarget()
  import { nextTick, onScopeDispose, shallowRef, watch } from 'vue'
  import type Tooltip from 'bootstrap/js/dist/tooltip.js'
  const contentTarget = shallowRef<HTMLElement>()
  let native: Tooltip | undefined
  let generation = 0
  watch(
    () => [anchor.value, placement.value, visible.value],
    async () => {
      const version = ++generation
      const old = anchor.value?.getAttribute('aria-describedby')
      native?.dispose()
      native = undefined
      contentTarget.value = undefined
      if (!anchor.value || !visible.value) return
      const { default: Tooltip } = await import('bootstrap/js/dist/tooltip.js')
      if (version !== generation) return
      class ControlledTooltip extends Tooltip {
        protected override _setEscapeListener() {}
        protected override _setTipListeners() {}
      }
      const instance = new ControlledTooltip(anchor.value, {
        trigger: 'manual',
        placement: placement.value,
        container: portal.value ?? false,
        html: true,
        title: ' ',
        animation: false,
      })
      native = instance
      await instance.show()
      if (version !== generation) return
      contentTarget.value =
        instance.tip?.querySelector<HTMLElement>('.tooltip-inner') ?? undefined
      if (old) anchor.value.setAttribute('aria-describedby', old)
      await nextTick()
      describe()
    },
    { flush: 'post' },
  )
  onScopeDispose(() => {
    generation++
    native?.dispose()
  })
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  useUiZPopup(() => popupTarget(surface.value), {
    tooltip: { anchor: () => anchor.value, visible: () => visible.value },
    source: 'UiTooltip',
  })
</script>
<template>
  <slot
    name="host"
    :trigger="trigger"
  />
  <Teleport
    v-if="contentTarget"
    :to="contentTarget"
  >
    <div
      :id="id"
      ref="surface"
      v-bind="surfaceEvents"
    >
      <slot />
    </div>
  </Teleport>
</template>
