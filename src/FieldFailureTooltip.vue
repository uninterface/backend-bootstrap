<script setup lang="ts">
  import { ref, computed, watch, onDeactivated } from 'vue'
  import {
    useUiTooltipPosition,
    useUiTooltipAnchorVisibility,
    useUiTooltipPlacement,
    useUiZPopup,
    useUiOverlayTarget,
  } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  const props = defineProps<{
    message: string | null
    id: string
    target?: HTMLElement
  }>()
  const anchor = ref<HTMLElement>()
  const surface = ref<HTMLElement>()
  const suppressed = ref(false)
  const reference = computed(() => props.target ?? anchor.value)
  const placement = useUiTooltipPlacement(
    () => reference.value,
    () => 'top',
  )
  const visible = useUiTooltipAnchorVisibility(
    () => reference.value,
    () => Boolean(props.message) && !suppressed.value,
  )
  onDeactivated(() => {
    suppressed.value = true
  })
  watch(
    () => props.message,
    () => {
      suppressed.value = false
    },
  )
  const portal = useUiOverlayTarget()
  useUiTooltipPosition(
    reference,
    surface,
    () => placement.value,
    () => visible.value,
  )
  useUiZPopup(() => popupTarget(surface.value), {
    tooltip: { anchor: () => reference.value, visible: () => visible.value },
    source: 'field failure tooltip',
  })
</script>
<template>
  <div
    ref="anchor"
    class="bootstrap-jumper-tooltip-anchor"
    :class="{ 'bootstrap-field-tooltip-host': target }"
  >
    <slot />
    <span
      v-if="message"
      :id="id"
      class="bootstrap-jumper-description"
    >
      {{ message }}
    </span>
    <Teleport :to="portal ?? 'body'">
      <div
        v-if="visible"
        ref="surface"
        :data-ui-field-tooltip-for="id"
        class="tooltip invalid-tooltip d-block bootstrap-jumper-tooltip"
        role="tooltip"
      >
        {{ message }}
      </div>
    </Teleport>
  </div>
</template>
