<script setup lang="ts">
  import type { UiDrawerEdge } from '@uninterface/uninterface'
  defineProps<{ edge: UiDrawerEdge }>()
</script>
<template>
  <span
    class="bootstrap-drawer-depth"
    :data-edge="edge"
    aria-hidden="true"
  >
    <span class="bootstrap-drawer-depth-shadow" />
  </span>
</template>
