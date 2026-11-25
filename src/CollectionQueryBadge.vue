<script setup lang="ts">
  import {
    useUiCollectionBadgeReorder,
    type UiCollectionBadgeReorder,
  } from '@uninterface/uninterface/backend'
  import { ref } from 'vue'
  import { uiFocusPresentation } from './focus'
  const props = defineProps<{
    label: string
    removeLabel: string
    disabled: boolean
    reorder?: UiCollectionBadgeReorder
  }>()
  const removeButton = ref<HTMLButtonElement>()
  defineExpose({
    focus() {
      if (!props.disabled) removeButton.value?.focus()
    },
  })
  const reorderBody = ref<HTMLElement>()
  const reorderView = useUiCollectionBadgeReorder(reorderBody, () => props)
  const emit = defineEmits<{ remove: [] }>()
  function remove() {
    if (!props.disabled) emit('remove')
  }
</script>
<template>
  <span
    class="badge bootstrap-query-badge theme-secondary"
    role="group"
    :aria-label="label"
  >
    <span
      ref="reorderBody"
      class="bootstrap-query-badge-content"
      v-bind="reorderView.bindings.value"
      :class="reorder ? uiFocusPresentation.class : undefined"
    >
      <slot />
    </span>
    <span
      v-if="reorder"
      class="bootstrap-query-badge-announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ reorderView.announcement.value }}
    </span>
    <button
      ref="removeButton"
      type="button"
      class="btn-close"
      :disabled="disabled"
      :aria-label="removeLabel"
      @click="remove"
    />
  </span>
</template>
