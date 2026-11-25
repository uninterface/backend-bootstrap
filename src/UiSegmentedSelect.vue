<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { computed, ref } from 'vue'
  import {
    useUiChoiceGroupView,
    useUiFieldDescription,
    useUiFieldFailure,
  } from '@uninterface/uninterface/backend'
  import type { UiChoiceGroupViewProps } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'

  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiChoiceGroupViewProps>()
  const emit = defineEmits<{ choose: [key: string]; blur: [] }>()
  const root = ref<HTMLElement>()
  const size = useControlSize('UiSegmentedSelect')
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
    () => false,
    () => root.value,
    targets,
    (key) => emit('choose', key),
    () => emit('blur'),
    { fieldLabel: true },
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
    role="radiogroup"
    :aria-orientation="orientation"
    :aria-label="label"
    :aria-required="binding.required || undefined"
    :aria-describedby="describedBy"
    :aria-invalid="binding.invalid || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-busy="binding.validating || status.pending || undefined"
    :class="uiFocusPresentation.class"
    data-uninterface-segmented-select
    data-uninterface-choice-group
    class="bootstrap-choice-group"
    @keydown.capture="keydown"
    @focusout="focusout"
  >
    <div class="segmented-scroll">
      <div
        :class="orientation === 'vertical' ? 'btn-group-vertical' : 'btn-group'"
      >
        <label
          v-for="(option, index) in options"
          :key="option.key"
          :data-uninterface-key="option.key"
          class="btn-outline btn-check"
          :class="[
            size,
            option.selected ? 'theme-primary' : 'theme-secondary',
            { 'segmented-invalid': failure },
          ]"
        >
          <input
            :id="`${binding.id}-option-${index}`"
            type="radio"
            :name="binding.id"
            :value="option.key"
            :checked="option.selected"
            :disabled="binding.disabled || !available || option.disabled"
            :aria-label="option.label"
            :aria-describedby="optionDescription(index)"
            :aria-invalid="binding.invalid || undefined"
            @change="emit('choose', option.key)"
          />
          <span>{{ option.label }}</span>
          <small
            v-if="option.description"
            :id="`${binding.id}-option-${index}-help`"
          >
            {{ option.description }}
          </small>
        </label>
      </div>
    </div>
    <div
      v-for="item in retained"
      :key="item.key"
      data-uninterface-retained
      class="mt-2"
    >
      {{ item.label }}
      <template v-if="unavailableLabel">— {{ unavailableLabel }}</template>
    </div>
    <div
      :id="`${binding.id}-source-status`"
      role="status"
      :data-uninterface-source-state="status.state"
      :class="status.message ? 'mt-2' : undefined"
    >
      {{ status.message }}
    </div>
  </div>
</template>

<style scoped>
  .bootstrap-choice-group {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
  .segmented-scroll {
    max-width: 100%;
    overflow-x: auto;
  }
  /* The scrollport must not clip the native ring or inset the surface. */
  .btn-check:has(input:focus-visible) {
    outline-offset: calc(-1 * var(--bs-focus-ring-width));
  }
  .btn-check {
    position: relative;
    white-space: nowrap;
    flex: 1 0 0;
    min-width: max-content;
    flex-direction: column;
  }
  .btn-group,
  .btn-group-vertical {
    display: flex;
    width: 100%;
    min-width: max-content;
  }
  .btn-check.segmented-invalid {
    border-color: var(--bs-danger-border);
    box-shadow: inset 0 0 0 var(--bs-border-width) var(--bs-danger-border);
  }
  .btn-check > input {
    inset: 0 auto auto 0;
    width: 1px;
    height: 1px;
  }
  .btn-check > small {
    display: block;
  }
</style>
