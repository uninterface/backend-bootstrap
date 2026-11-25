<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiEmptyViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiEmptyViewProps>()
</script>
<template>
  <div
    class="bootstrap-empty d-flex flex-column align-items-center gap-3 p-3 text-center"
  >
    <div v-if="$slots.icon"><slot name="icon" /></div>
    <div>
      <slot>{{ label }}</slot>
    </div>
    <div
      v-if="$slots.actions"
      class="d-flex flex-wrap justify-content-center gap-2"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
