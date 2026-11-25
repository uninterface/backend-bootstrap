<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { focusBootstrapTarget as focusUiTarget } from './focusTarget'
  import { computed, ref } from 'vue'
  import {
    useUiFieldDescription,
    useUiFieldFailure,
    type UiMultiSelectViewProps,
  } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { useSelectPopup } from './selectPopup'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiMultiSelectViewProps>()
  const emit = defineEmits<{
    update: [value: string[]]
    clear: []
    blur: []
    requestLoad: []
  }>()
  const root = ref<HTMLElement>()
  const element = ref<HTMLButtonElement>()
  const menu = ref<HTMLElement>()
  const description = useUiFieldDescription(() => props.binding, 'replace-help')
  const invalid = useUiFieldFailure(() => props.binding)
  const size = useControlSize('UiMultiSelect')
  const label = computed(() =>
    props.value
      .map(
        (key) =>
          props.options.find((option) => option.value === key)?.label ?? key,
      )
      .join(', '),
  )
  const popup = useSelectPopup({
    root,
    element,
    menu,
    multiple: true,
    disabled: () => props.binding.disabled,
    requestLoad: () => emit('requestLoad'),
    blur: () => emit('blur'),
    select(key) {
      if (props.binding.disabled || !props.available) return false
      const option = props.options.find((option) => option.value === key)
      if (!option || option.disabled || option.hidden) return false
      emit(
        'update',
        props.value.includes(key)
          ? props.value.filter((value) => value !== key)
          : [...props.value, key],
      )
      return true
    },
  })
  function clear() {
    if (!props.clearable) return
    emit('clear')
    popup.close()
    element.value?.focus()
  }
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value,
        () => props.binding.disabled,
      ),
  })
</script>
<template>
  <div
    ref="root"
    class="bootstrap-multiselect"
    @focusout="popup.blur"
    @keydown.capture="popup.keydown"
  >
    <button
      ref="element"
      v-bind="$attrs"
      :id="binding.id"
      type="button"
      role="combobox"
      class="form-control combobox-toggle bootstrap-control-focus"
      :class="[
        size,
        { 'is-invalid': invalid, 'bootstrap-multiselect-clearable': clearable },
      ]"
      :disabled="binding.disabled"
      aria-haspopup="listbox"
      aria-expanded="false"
      :aria-controls="`${binding.id}-choices`"
      :aria-required="binding.required || undefined"
      :aria-invalid="binding.invalid || undefined"
      :aria-busy="binding.validating || status.pending || undefined"
      :aria-describedby="
        [
          description,
          status.message ? `${binding.id}-source-status` : undefined,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      "
      @click="popup.toggle"
    >
      <span
        class="combobox-value"
        :class="{ 'combobox-placeholder': !value.length }"
      >
        <span>{{ label || placeholder || '\u00a0' }}</span>
      </span>
      <svg
        class="combobox-caret"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
        />
      </svg>
    </button>
    <div
      ref="menu"
      :id="`${binding.id}-choices`"
      class="menu bootstrap-entry-popup bootstrap-select-menu"
      role="listbox"
      aria-multiselectable="true"
      :aria-labelledby="binding.id"
      popover="manual"
    >
      <template
        v-for="(option, index) in options"
        :key="option.value"
      >
        <div
          v-if="
            option.group !== undefined &&
            option.group !== options[index - 1]?.group
          "
          class="menu-header"
          role="presentation"
        >
          {{ option.group }}
        </div>
        <button
          type="button"
          class="menu-item"
          :class="{ selected: value.includes(option.value) }"
          role="option"
          tabindex="-1"
          :data-bs-value="option.value"
          :data-bs-label="option.label"
          :data-uninterface-key="option.value"
          :aria-selected="value.includes(option.value)"
          :disabled="!available || option.disabled"
          :aria-disabled="!available || option.disabled || undefined"
        >
          <span class="menu-item-content">{{ option.label }}</span>
          <span
            class="menu-item-check"
            aria-hidden="true"
          >
            <svg
              v-if="value.includes(option.value)"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M13.485 1.929a1 1 0 0 1 .086 1.412l-7 8a1 1 0 0 1-1.498.01l-3.5-4a1 1 0 1 1 1.506-1.318L5.825 9.17l6.247-7.14a1 1 0 0 1 1.413-.1z"
              />
            </svg>
          </span>
        </button>
      </template>
      <div
        v-if="status.message"
        class="menu-item-text"
      >
        {{ status.message }}
      </div>
    </div>
    <button
      v-if="clearable"
      :id="`${binding.id}-clear`"
      type="button"
      class="btn-close bootstrap-multiselect-clear bootstrap-control-focus"
      :aria-label="clearLabel"
      :title="clearLabel"
      @click="clear"
    />
  </div>
  <span
    :id="`${binding.id}-source-status`"
    :data-uninterface-source-state="status.state"
    class="visually-hidden bootstrap-select-status"
    role="status"
  >
    {{ status.message }}
  </span>
</template>
