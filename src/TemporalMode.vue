<script setup lang="ts">
  import { focusBootstrapTarget as focusUiTarget } from './focusTarget'
  import {
    computed,
    nextTick,
    onDeactivated,
    onScopeDispose,
    ref,
    useId,
    watch,
  } from 'vue'
  import {
    useUiControlFrameParticipant,
    type UiTemporalBoundaryMode,
    type UiEntryViewNode,
  } from '@uninterface/uninterface/backend'
  import EntryPopup from './EntryPopup.vue'
  import EntryBranch from './EntryBranch.vue'
  import TemporalRangeIcon from './TemporalRangeIcon.vue'
  const props = defineProps<{
    mode: UiTemporalBoundaryMode
    modes: { value: UiTemporalBoundaryMode; label: string }[]
    label: string
    disabled: boolean
  }>()
  const emit = defineEmits<{ update: [mode: UiTemporalBoundaryMode] }>()
  const anchor = ref<HTMLButtonElement>()
  const open = ref(false)
  const id = useId()
  const focus = () =>
    focusUiTarget(
      () => anchor.value,
      () => props.disabled,
    )
  const { setEngaged } = useUiControlFrameParticipant({
    focus: async () => null,
  })
  defineExpose({ focus })
  const entries = computed<UiEntryViewNode[]>(() =>
    props.modes.map((item) => ({
      entry: {
        kind: 'item',
        key: item.value,
        label: item.label,
        icon: { name: `temporal-${item.value}` },
      },
      selectionMode: 'single',
      selected: props.mode === item.value,
    })),
  )
  function show() {
    if (!props.disabled) open.value = true
  }
  async function close(restore = true) {
    open.value = false
    if (restore) {
      await nextTick()
      await focus()
    }
  }
  function select(value: string) {
    if (props.disabled) return
    emit('update', value as UiTemporalBoundaryMode)
    void close()
  }
  watch(open, setEngaged, { flush: 'sync' })
  watch(
    () => props.disabled,
    (value) => {
      if (value) void close(false)
    },
  )
  onDeactivated(() => {
    open.value = false
  })
  onScopeDispose(() => setEngaged(false))
</script>
<template>
  <button
    ref="anchor"
    type="button"
    class="btn btn-plain bootstrap-input-action"
    data-temporal-mode
    :disabled="disabled"
    :aria-label="
      label + ': ' + modes.find((item) => item.value === mode)?.label
    "
    :title="modes.find((item) => item.value === mode)?.label"
    aria-haspopup="menu"
    :aria-expanded="open"
    :aria-controls="open ? id : undefined"
    @click="open ? close() : show()"
    @keydown.down.prevent="show()"
    @keydown.up.prevent="show()"
  >
    <TemporalRangeIcon :mode="mode" />
  </button>
  <EntryPopup
    v-if="open"
    :anchor="anchor"
    @close="close(false)"
  >
    <EntryBranch
      :id="id"
      :entries="entries"
      :label="label"
      @activate="select"
      @close="close()"
    >
      <template #icon="{ entry }">
        <TemporalRangeIcon :mode="entry.key as UiTemporalBoundaryMode" />
      </template>
      <template #entry="{ entry }">
        <span :data-temporal-mode-value="entry.key">{{ entry.label }}</span>
      </template>
    </EntryBranch>
  </EntryPopup>
</template>
