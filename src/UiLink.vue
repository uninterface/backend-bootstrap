<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiLinkViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiLinkViewProps>()
</script>
<template>
  <a
    :href="href"
    :aria-current="current ? 'page' : undefined"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? 0 : undefined"
    :class="color ? `theme-${color}` : undefined"
  >
    <slot name="icon" />
    <slot />
  </a>
</template>
