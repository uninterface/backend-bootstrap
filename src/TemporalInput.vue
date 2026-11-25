<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useUiTemporalRange } from '@uninterface/uninterface/backend'
  import type {
    UiTemporalInputViewProps,
    UiFocusHandle,
  } from '@uninterface/uninterface/backend'
  import TemporalEditor from './TemporalEditor.vue'
  import TemporalAction from './TemporalAction.vue'
  import TemporalPicker from './TemporalPicker.vue'
  import TemporalMode from './TemporalMode.vue'
  import TemporalRangeIcon from './TemporalRangeIcon.vue'
  import InputFrame from './UiInputFrame.vue'
  const props = defineProps<UiTemporalInputViewProps>()
  defineOptions({ inheritAttrs: false })
  const editor = ref<UiFocusHandle>()
  const modeTarget = ref<UiFocusHandle>()
  const endpoints = new Map<string, UiFocusHandle>()
  function endpointRef(side: string, value: unknown) {
    if (value) endpoints.set(side, value as UiFocusHandle)
    else endpoints.delete(side)
  }
  const {
    range,
    mode,
    modes,
    messages,
    nextDay,
    display: displayEndpoint,
    selectMode,
    updateEndpoint,
    updateRange,
    clear,
  } = useUiTemporalRange(props)
  const rangePicker = ref<{ show(): void }>()
  const nativeRange = computed(
    () => props.kind === 'date' && mode.value === 'bounded',
  )
  const openRangePicker = () => rangePicker.value?.show()
  async function focus() {
    if (!props.options.range) return editor.value?.focus() ?? null
    for (const side of ['start', 'end'] as const) {
      const result = await endpoints.get(side)?.focus()
      if (result === true) return true
    }
    return modeTarget.value?.focus() ?? null
  }
  defineExpose({ focus })
</script>
<template>
  <InputFrame
    v-if="options.range"
    :binding="binding"
    :description-binding="binding"
    :label="label"
    :readonly="readonly"
    :dirty="!!value"
    :focus-editor="focus"
    data-temporal-range
  >
    <template #leading>
      <TemporalMode
        v-if="modes.length > 1"
        ref="modeTarget"
        :mode="mode"
        :modes="modes"
        :label="messages.rangeMode"
        :disabled="binding.disabled || readonly"
        @update="selectMode"
      />
      <TemporalPicker
        v-if="nativeRange"
        ref="rangePicker"
        :binding="binding"
        :kind="kind"
        :value="displayEndpoint('start')"
        :range="{
          start: displayEndpoint('start'),
          end: displayEndpoint('end'),
        }"
        :update-range="updateRange"
        :precision="options.precision ?? 'minute'"
        :readonly="readonly"
        :label="label"
        :eligible="eligible"
        :update="(value) => updateEndpoint('start', value)"
        :blur="blur"
      />
    </template>
    <div
      class="bootstrap-temporal-range"
      :data-kind="kind"
    >
      <template
        v-for="side in ['start', 'end'] as const"
        :key="side"
      >
        <span
          v-if="side === 'end'"
          class="bootstrap-temporal-separator"
          aria-hidden="true"
        >
          –
        </span>
        <div
          class="bootstrap-temporal-boundary"
          :data-side="side"
        >
          <span
            v-if="range[side] === null"
            class="badge theme-secondary"
            data-temporal-infinity
            :aria-label="
              (side === 'start' ? startLabel : endLabel) +
              ' — ' +
              messages.rangeUnrestricted
            "
            :title="
              (side === 'start' ? startLabel : endLabel) +
              ' — ' +
              messages.rangeUnrestricted
            "
          >
            ∞
          </span>
          <TemporalEditor
            v-else
            :open-range-picker="nativeRange ? openRangePicker : undefined"
            :ref="(value) => endpointRef(side, value)"
            v-bind="$attrs"
            :binding="{
              ...binding,
              id: binding.id + '-' + side,
              disabled: binding.disabled,
            }"
            :kind="kind"
            :value="displayEndpoint(side)"
            :precision="options.precision ?? 'minute'"
            :presentation="presentation"
            :date-format-wish="dateFormatWish ?? 'YMD'"
            :readonly="readonly"
            :label="label + ' — ' + (side === 'start' ? startLabel : endLabel)"
            :eligible="eligible"
            :update="(value) => updateEndpoint(side, value)"
            :blur="blur"
          />
        </div>
      </template>
    </div>
    <span
      class="bootstrap-temporal-spacer"
      aria-hidden="true"
    />
    <template #trailing>
      <span
        v-if="kind === 'time' && mode === 'bounded'"
        :style="{ visibility: nextDay ? undefined : 'hidden' }"
        :aria-hidden="!nextDay || undefined"
        data-temporal-next-day
        role="img"
        :aria-label="nextDay ? messages.rangeNextDay : undefined"
        :title="nextDay ? messages.rangeNextDay : undefined"
      >
        <TemporalRangeIcon mode="next-day" />
      </span>
      <TemporalAction
        clear
        :label="clearLabel"
        :disabled="binding.disabled || readonly"
        @click="clear"
      />
    </template>
  </InputFrame>
  <TemporalEditor
    v-else
    ref="editor"
    v-bind="$attrs"
    :binding="binding"
    :kind="kind"
    :value="typeof value === 'string' ? display(value) : ''"
    :precision="options.precision ?? 'minute'"
    :presentation="presentation"
    :date-format-wish="dateFormatWish ?? 'YMD'"
    :readonly="readonly"
    :label="label"
    :eligible="eligible"
    :update="(value) => update(value === '' ? null : candidate(value))"
    :blur="blur"
  />
</template>
