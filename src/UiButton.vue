<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { focusBootstrapTarget as focusUiTarget } from './focusTarget'
  import { useControlSize } from './controlSize'
  import { useUiButtonPresentation } from '@uninterface/uninterface/backend'
  import { ref, useAttrs } from 'vue'
  import type { UiButtonViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const attrs = useAttrs()
  const props = withDefaults(defineProps<UiButtonViewProps>(), {
    color: 'secondary',
  })

  const variantClasses = {
    filled: 'btn-solid',
    outline: 'btn-outline',
    neutral: 'btn-outline',
    soft: 'btn-subtle',
    text: 'btn-text',
    icon: 'btn-text btn-icon',
  }
  const element = ref<HTMLButtonElement>()
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value,
        () => Boolean(props.disabled || props.loading),
      ),
  })
  const {
    variant: buttonVariant,
    width: buttonWidth,
    iconOnly,
    hint,
  } = useUiButtonPresentation(props, { collectionActionVariant: 'bordered' })
  const controlSize = useControlSize('UiButton')
</script>
<template>
  <span
    class="bootstrap-button-host"
    :data-ui-button-width="buttonWidth()"
    :data-ui-control-frame="frame?.owner"
  >
    <button
      ref="element"
      v-bind="attrs"
      :type="type"
      :form="form"
      :title="hint()"
      :data-ui-button-variant="buttonVariant()"
      :disabled="disabled || loading"
      :aria-busy="loading || undefined"
      class="bootstrap-control-focus"
      :class="[
        controlSize,
        [variantClasses[buttonVariant() ?? 'filled'], `theme-${color}`],
      ]"
    >
      <span
        v-if="loading"
        class="spinner-border"
        aria-hidden="true"
      ></span>
      <span
        v-if="$slots.icon"
        class="bootstrap-button-icon"
        aria-hidden="true"
      >
        <slot name="icon" />
      </span>
      <span
        class="bootstrap-button-label"
        :class="{ 'visually-hidden bootstrap-button-label-hidden': iconOnly() }"
      >
        <slot />
      </span>
    </button>
    <span
      class="visually-hidden bootstrap-button-status"
      role="status"
      aria-live="polite"
    >
      {{ loading ? loadingLabel : '' }}
    </span>
  </span>
</template>
