<script setup lang="ts">
  import { computed, ref, shallowRef } from 'vue'
  import type { UiTemporalEditorViewProps } from '@uninterface/uninterface/backend'
  import { useUiI18n } from '@uninterface/uninterface'
  const props = defineProps<
    UiTemporalEditorViewProps & {
      range?: { start: string; end: string }
      updateRange?: (value: { start: string; end: string }) => void
    }
  >()
  import {
    useUiOverlayTarget,
    useUiControlFrameParticipant,
  } from '@uninterface/uninterface/backend'
  import type Popover from 'bootstrap/js/dist/popover.js'
  import TemporalIcon from './TemporalIcon.vue'
  import { useTemporalPopup } from './temporalPopup'
  const { open, anchor, surface, show, close } = useTemporalPopup(props)
  const portal = useUiOverlayTarget()
  const i18n = useUiI18n()
  const { setEngaged } = useUiControlFrameParticipant({
    focus: async () => null,
  })
  watch(open, setEngaged, { flush: 'sync' })
  const pickerLabel = computed(() =>
    i18n.text({
      namespace: 'uninterface',
      key:
        props.kind === 'date'
          ? 'pickDate'
          : props.kind === 'time'
            ? 'pickTime'
            : 'pickDateTime',
    }),
  )
  const draftDate = ref(''),
    draftTime = ref('')
  function syncDraft(value: string) {
    draftDate.value = props.kind === 'time' ? '' : (value.split('T')[0] ?? '')
    draftTime.value =
      props.kind === 'time' ? value : (value.split('T')[1] ?? '')
  }
  watch(() => props.value, syncDraft, { immediate: true })
  watch(open, (visible) => {
    if (visible) syncDraft(props.value)
  })
  const date = computed(() => draftDate.value)
  const clock = computed(() => draftTime.value)
  function chosen(value: string) {
    if (props.binding.disabled || props.readonly) return
    if (props.eligible(value)) {
      props.update(value)
      void nextTick(() => props.blur())
      if (props.kind === 'date') close()
    }
  }
  function chooseDate(value: string) {
    if (props.binding.disabled || props.readonly) return
    draftDate.value = value
    if (props.kind === 'datetime') {
      if (clock.value) chosen(value + 'T' + clock.value)
      else {
        props.update(value + 'T')
        void nextTick(() => props.blur())
      }
      close()
    } else chosen(value)
  }

  import { watch, nextTick, onScopeDispose } from 'vue'
  import type Datepicker from 'bootstrap/js/dist/datepicker.js'
  const calendar = ref<HTMLElement>()
  let picker: Datepicker | undefined
  function validDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const parsed = new Date(value + 'T00:00:00Z')
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    )
  }
  function selectedDates() {
    if (props.range)
      return validDate(props.range.start) && validDate(props.range.end)
        ? [props.range.start, props.range.end]
        : []
    return validDate(date.value) ? [date.value] : []
  }
  // Watch endpoint values, not the range object's identity: presentation rerenders
  // must not overwrite the first native calendar click while a pair is pending.
  watch([date, () => props.range?.start, () => props.range?.end], () => {
    picker?.setSelectedDates(selectedDates())
  })
  function changed(event: Event) {
    if (props.binding.disabled || props.readonly) return
    const dates = (event as Event & { dates: string[] }).dates ?? []
    if (props.range) {
      if (dates.length < 2) return
      const ordered = [...dates].sort()
      const start = ordered[0]!,
        end = ordered.at(-1)!
      if (
        ![start, end].every(
          (value) => validDate(value) && props.eligible(value),
        )
      )
        return
      props.updateRange?.({ start, end })
      void nextTick(() => props.blur())
      close()
    } else if (dates[0]) chooseDate(dates[0])
  }
  const contentTarget = shallowRef<HTMLElement>()
  let native: Popover | undefined,
    generation = 0
  watch(
    () => [open.value, portal.value],
    async () => {
      const version = ++generation
      calendar.value?.removeEventListener('change.bs.datepicker', changed)
      picker?.dispose()
      picker = undefined
      native?.dispose()
      native = undefined
      contentTarget.value = undefined
      if (!open.value || !anchor.value) return
      const { default: Popover } = await import('bootstrap/js/dist/popover.js')
      if (version !== generation) return
      class TemporalPopover extends Popover {
        protected override _setEscapeListener() {}
        protected override _setTipListeners() {}
      }
      const instance = new TemporalPopover(anchor.value, {
        trigger: 'manual',
        placement: 'bottom-start',
        container: portal.value ?? false,
        html: true,
        content: ' ',
        animation: false,
        template:
          '<div class="popover" role="presentation"><div class="popover-arrow"></div><div class="popover-body"></div></div>',
      })
      native = instance
      await instance.show()
      if (generation !== version) return
      anchor.value?.removeAttribute('aria-describedby')
      contentTarget.value =
        instance.tip?.querySelector<HTMLElement>('.popover-body') ?? undefined
      await nextTick()
      if (generation !== version || !calendar.value || props.kind === 'time')
        return
      const { default: Datepicker } = await import(
        'bootstrap/js/dist/datepicker.js'
      )
      if (generation !== version || !calendar.value) return
      picker = new Datepicker(calendar.value, {
        inline: true,
        displayElement: false,
        selectedDates: selectedDates(),
        selectionMode: props.range ? 'multiple-ranged' : 'single',
        vcpOptions: { enableDateToggle: false },
        locale: i18n.state.value.locale,
      })
      calendar.value.addEventListener('change.bs.datepicker', changed)
    },
    { flush: 'post' },
  )
  onScopeDispose(() => {
    setEngaged(false)
    calendar.value?.removeEventListener('change.bs.datepicker', changed)
    picker?.dispose()
    generation++
    native?.dispose()
  })
  defineExpose({ show })
  const emit = defineEmits<{ 'open-change': [open: boolean] }>()
  watch(open, (value) => emit('open-change', value), { flush: 'sync' })
  onScopeDispose(() => emit('open-change', false))
</script>
<template>
  <button
    ref="anchor"
    type="button"
    class="btn btn-plain"
    :disabled="binding.disabled || readonly"
    :aria-label="pickerLabel + (label ? ' — ' + label : '')"
    :aria-expanded="open"
    aria-haspopup="dialog"
    data-temporal-trigger
    :data-temporal-range-trigger="range ? '' : undefined"
    @click="open ? close() : show()"
  >
    <TemporalIcon :time="kind === 'time'" />
  </button>
  <Teleport
    v-if="contentTarget"
    :to="contentTarget"
  >
    <div
      ref="surface"
      role="dialog"
      :aria-label="pickerLabel"
      data-temporal-popup
      :data-temporal-range-popup="range ? '' : undefined"
      class="vstack gap-2"
    >
      <div
        v-if="kind !== 'time'"
        ref="calendar"
        :aria-label="pickerLabel"
      ></div>
    </div>
  </Teleport>
</template>
