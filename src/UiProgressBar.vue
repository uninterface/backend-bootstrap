<script setup lang="ts">
  import {
    useUiZView,
    type UiProgressBarViewProps,
  } from '@uninterface/uninterface/backend'
  useUiZView()
  defineProps<UiProgressBarViewProps>()
</script>
<template>
  <div
    class="progress bootstrap-progress-bar"
    data-ui-progress-bar
    :data-state="value === null ? 'indeterminate' : 'determinate'"
    role="progressbar"
    :aria-label="label"
    :aria-valuetext="valueText"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="value ?? undefined"
  >
    <div
      class="progress-bar"
      :class="`theme-${color}`"
      :style="{ width: fraction === null ? undefined : `${fraction * 100}%` }"
    />
  </div>
</template>
