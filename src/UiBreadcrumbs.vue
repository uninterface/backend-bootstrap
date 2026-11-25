<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { useUiZPart } from '@uninterface/uninterface/backend'
  const vUiZPart = useUiZPart()

  import type { UiBreadcrumbsViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiBreadcrumbsViewProps>()
</script>
<template>
  <nav :aria-label="label">
    <ol class="breadcrumb">
      <li
        v-for="item in items"
        :key="item.key"
        v-ui-z-part="item.z"
        class="breadcrumb-item"
        :class="{ active: item.current }"
      >
        <component
          :is="
            item.href === undefined
              ? item.actionable
                ? 'button'
                : 'span'
              : 'a'
          "
          v-bind="item.attributes"
          :href="item.href"
          :type="
            item.actionable && item.href === undefined ? 'button' : undefined
          "
          :aria-current="item.current ? 'page' : undefined"
          :aria-disabled="item.disabled || undefined"
        >
          <slot :item="item" />
        </component>
      </li>
    </ol>
    <div
      v-if="status?.message"
      role="status"
      :aria-busy="status.pending || undefined"
    >
      {{ status.message }}
      <button
        type="button"
        class="btn-link"
        v-if="status.failed"
        @click="retry?.()"
      >
        {{ status.retryLabel }}
      </button>
    </div>
  </nav>
</template>
