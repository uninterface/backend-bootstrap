<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { computed, ref } from 'vue'
  import {
    useUiChoiceGroupView,
    useUiFieldDescription,
    useUiFieldFailure,
  } from '@uninterface/uninterface/backend'
  import type { UiChoiceGroupViewProps } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'

  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiChoiceGroupViewProps & { multiple: boolean }>()
  const emit = defineEmits<{ choose: [key: string]; blur: [] }>()
  const root = ref<HTMLElement>()
  const size = useControlSize(props.multiple ? 'UiCheckbox' : 'UiRadioGroup')
  const description = useUiFieldDescription(() => props.binding, 'replace-help')
  const failure = useUiFieldFailure(() => props.binding)
  const describedBy = computed(
    () =>
      [
        description.value,
        props.status.message ? `${props.binding.id}-source-status` : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  )
  function targets() {
    return Array.from(
      root.value?.querySelectorAll<HTMLElement>(
        'input[type=radio], input[type=checkbox], [role=radio], [role=checkbox]',
      ) ?? [],
    )
      .filter(
        (element) =>
          element.getAttribute('aria-hidden') !== 'true' &&
          element.tabIndex >= -1,
      )
      .flatMap((element) => {
        const key =
          element
            .closest('[data-uninterface-key]')
            ?.getAttribute('data-uninterface-key') ??
          element.getAttribute('value')
        return key === null || key === undefined ? [] : [{ key, element }]
      })
  }
  const { focus, keydown, focusout } = useUiChoiceGroupView(
    props,
    () => props.multiple,
    () => root.value,
    targets,
    (key) => emit('choose', key),
    () => emit('blur'),
  )
  defineExpose({ focus })
  function optionDescription(index: number) {
    return (
      [
        description.value,
        props.options[index].description
          ? `${props.binding.id}-option-${index}-help`
          : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined
    )
  }
</script>
<template>
  <div
    ref="root"
    v-bind="$attrs"
    :id="binding.id"
    :role="multiple ? 'group' : 'radiogroup'"
    :aria-label="label"
    :aria-required="(!multiple && binding.required) || undefined"
    :aria-describedby="describedBy"
    :aria-invalid="binding.invalid || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-busy="binding.validating || status.pending || undefined"
    :class="uiFocusPresentation.class"
    data-uninterface-choice-group
    class="bootstrap-choice-group d-flex flex-column gap-2"
    @keydown.capture="keydown"
    @focusout="focusout"
  >
    <div
      class="d-flex gap-2"
      :class="
        orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-column'
      "
    >
      <div
        v-for="(option, index) in options"
        :key="option.key"
        :data-uninterface-key="option.key"
        class="form-field"
      >
        <input
          :id="`${binding.id}-option-${index}`"
          :type="multiple ? 'checkbox' : 'radio'"
          :name="binding.id"
          :value="option.key"
          :checked="option.selected"
          :disabled="binding.disabled || !available || option.disabled"
          class="bootstrap-control-focus"
          :class="[
            multiple ? 'check' : 'radio',
            size,
            { 'is-invalid': failure },
          ]"
          :aria-describedby="optionDescription(index)"
          :aria-invalid="binding.invalid || undefined"
          @change="emit('choose', option.key)"
        />
        <div class="form-field-content">
          <label :for="`${binding.id}-option-${index}`">
            {{ option.label }}
          </label>
          <div
            v-if="option.description"
            :id="`${binding.id}-option-${index}-help`"
            class="form-text"
          >
            {{ option.description }}
          </div>
        </div>
      </div>
    </div>
    <div
      v-for="item in retained"
      :key="item.key"
      data-uninterface-retained
    >
      {{ item.label }}
      <template v-if="unavailableLabel">— {{ unavailableLabel }}</template>
    </div>
    <div
      :id="`${binding.id}-source-status`"
      role="status"
      :data-uninterface-source-state="status.state"
    >
      {{ status.message }}
    </div>
  </div>
</template>

<style scoped></style>
