<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { provide } from 'vue'
  import { navbarContextKey } from './navbarContext'
  provide(navbarContextKey, true)
</script>
<template>
  <nav class="navbar bootstrap-navbar">
    <div
      v-if="$slots.brand"
      class="navbar-brand bootstrap-navbar-brand"
    >
      <slot name="brand" />
    </div>
    <div
      v-if="$slots.default"
      class="bootstrap-navbar-links"
    >
      <slot />
    </div>
    <div
      v-if="$slots.actions"
      class="bootstrap-navbar-actions"
    >
      <slot name="actions" />
    </div>
  </nav>
</template>
