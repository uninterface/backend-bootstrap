<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { focusBootstrapTarget as focusUiTarget } from './focusTarget'
  import { inject, onScopeDispose } from 'vue'
  import { floatingLabelKey } from './fieldLayout'
  const floatingField = inject(floatingLabelKey, undefined)
  import { useUiFieldFailure } from '@uninterface/uninterface/backend'
  import { useUiFieldDescription } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { ref } from 'vue'
  import type { UiTextInputViewProps } from '@uninterface/uninterface/backend'
  import ShowIcon from './icons/show.vue'
  import HideIcon from './icons/hide.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiTextInputViewProps>()
  if (floatingField && props.frame?.owner !== 'parent')
    onScopeDispose(floatingField.register())
  const invalidPresentation = useUiFieldFailure(
    () => props.descriptionBinding ?? props.binding,
  )
  defineEmits<{ update: [value: string]; blur: [] }>()
  const element = ref<HTMLInputElement | HTMLTextAreaElement>()
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value,
        () => props.binding.disabled,
      ),
  })
  const description = useUiFieldDescription(
    () => props.descriptionBinding ?? props.binding,
    'replace-help',
  )
  const controlSize = useControlSize('UiTextInput')
</script>
<template>
  <span
    class="input-group"
    :data-ui-control-frame="frame?.owner"
    :style="{
      '--ui-text-min-width':
        minWidthCharacters === undefined
          ? undefined
          : `${minWidthCharacters}ch`,
      '--ui-text-max-width':
        maxWidthCharacters === undefined
          ? undefined
          : `${maxWidthCharacters}ch`,
    }"
    :data-ui-frame-editor="frame?.owner === 'parent' ? '' : undefined"
  >
    <slot name="leading" />
    <component
      :is="multiline ? 'textarea' : 'input'"
      v-bind="$attrs"
      ref="element"
      :id="binding.id"
      :type="multiline ? undefined : type"
      :readonly="readonly"
      class="form-control bootstrap-control-focus"
      :class="[
        controlSize,
        { 'is-invalid': frame?.owner !== 'parent' && invalidPresentation },
      ]"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :placeholder="
        ($attrs.placeholder as string) ??
        (floatingField?.active.value ? ' ' : undefined)
      "
      :value="value"
      :disabled="binding.disabled"
      :aria-busy="binding.validating || undefined"
      :aria-required="binding.required || undefined"
      :aria-describedby="description"
      :aria-invalid="binding.invalid || undefined"
      @input="
        $emit(
          'update',
          ($event.target as HTMLInputElement | HTMLTextAreaElement).value,
        )
      "
      @keydown="reveal?.keydown($event)"
      @blur="$emit('blur')"
    />
    <slot name="trailing" />
    <button
      v-if="reveal"
      type="button"
      class="btn btn-plain"
      :disabled="binding.disabled"
      :aria-label="reveal.label"
      data-password-reveal
      :aria-pressed="reveal.shown"
      @mousedown.prevent
      @click="reveal.toggle"
    >
      <component
        :is="reveal.shown ? HideIcon : ShowIcon"
        aria-hidden="true"
      />
    </button>
  </span>
</template>
