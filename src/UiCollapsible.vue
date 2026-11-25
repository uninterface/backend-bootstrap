<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { nextTick, ref } from 'vue'
  import type { UiCollapsibleViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiCollapsibleViewProps>()
  const emit = defineEmits<{ 'update:expanded': [expanded: boolean] }>()
  const details = ref<HTMLDetailsElement>()
  function request() {
    if (!props.disabled) emit('update:expanded', !props.expanded)
  }
  async function nativeToggle() {
    const element = details.value
    if (!element || element.open === props.expanded) return
    // Browser find-in-page or another native route must still consult the owner.
    if (!props.disabled) emit('update:expanded', element.open)
    await nextTick()
    if (details.value) details.value.open = props.expanded
  }
</script>
<template>
  <div class="accordion">
    <details
      ref="details"
      class="accordion-item"
      :class="color ? `theme-${color}` : undefined"
      :open="expanded"
      @toggle="nativeToggle"
    >
      <summary
        :id="triggerId"
        class="accordion-header"
        :aria-expanded="expanded"
        :aria-controls="panelId"
        :aria-disabled="disabled || undefined"
        :tabindex="disabled ? -1 : undefined"
        @click.prevent="request"
      >
        <span class="d-inline-flex flex-wrap align-items-center gap-2">
          <slot name="summary" />
        </span>
        <svg
          class="accordion-icon"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
          />
        </svg>
      </summary>
      <div
        :id="panelId"
        class="accordion-body"
        :class="color ? 'theme-reset' : undefined"
        :inert="!expanded"
        :aria-hidden="!expanded"
      >
        <slot v-if="mounted" />
      </div>
    </details>
  </div>
</template>
