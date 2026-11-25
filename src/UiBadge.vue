<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiBadgeViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiBadgeViewProps>()
</script>
<template>
  <span
    class="badge bootstrap-badge"
    :class="`theme-${color}`"
  >
    <slot />
  </span>
</template>
