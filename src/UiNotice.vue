<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import InfoIcon from './icons/info.vue'
  import SuccessIcon from './icons/success.vue'
  import WarningIcon from './icons/warning.vue'
  import ErrorIcon from './icons/error.vue'
  const icons = {
    info: InfoIcon,
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon,
  }

  import type { UiNoticeViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiNoticeViewProps>()
</script>
<template>
  <div
    class="alert mb-0 bootstrap-notice"
    :data-variant="variant"
    :class="color ? `theme-${color}` : undefined"
    :style="
      color
        ? undefined
        : {
            '--bs-theme-fg': 'var(--bs-fg-1)',
            '--bs-theme-bg': 'var(--bs-fg-1)',
            '--bs-theme-bg-subtle': 'var(--bs-bg-1)',
            '--bs-theme-border': 'var(--bs-border-color)',
            '--bs-theme-contrast': 'var(--bs-bg-1)',
          }
    "
  >
    <span
      v-if="$slots.icon || kind !== 'custom'"
      class="bootstrap-notice-icon"
      aria-hidden="true"
    >
      <slot
        v-if="$slots.icon"
        name="icon"
      />
      <component
        v-else-if="kind !== 'custom'"
        :is="icons[kind]"
      />
    </span>
    <div class="bootstrap-notice-content">
      <strong
        v-if="title"
        class="d-block mb-2"
      >
        {{ title }}
      </strong>
      <div v-if="$slots.default || message || details?.length">
        <slot>
          <div v-if="message">{{ message }}</div>
          <ul v-if="details?.length">
            <li
              v-for="(detail, index) in details"
              :key="index"
            >
              {{ detail }}
            </li>
          </ul>
        </slot>
      </div>
      <div
        v-if="$slots.actions"
        class="bootstrap-notice-actions mt-3 d-flex flex-wrap gap-2"
      >
        <slot name="actions" />
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="btn-close ms-auto flex-shrink-0"
      :aria-label="dismissLabel"
      @click="onDismissRequest"
    />
  </div>
</template>
