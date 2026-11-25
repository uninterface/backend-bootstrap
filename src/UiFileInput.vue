<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { focusBootstrapTarget as focusUiTarget } from './focusTarget'
  import { computed, ref, nextTick, onMounted, watch } from 'vue'
  import {
    useUiFieldDescription,
    type UiFileInputViewProps,
  } from '@uninterface/uninterface/backend'
  import InputFrame from './UiInputFrame.vue'
  import { useControlSize } from './controlSize'

  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiFileInputViewProps>()
  const input = ref<HTMLInputElement>()
  const size = useControlSize('UiFileInput')
  const fieldDescription = useUiFieldDescription(
    () => props.binding,
    'replace-help',
  )
  const description = computed(
    () =>
      [
        fieldDescription.value,
        props.rejection ? props.binding.id + '-rejection' : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  )
  const frameBinding = computed(() => ({
    ...props.binding,
    id: props.binding.id + '-surface',
    invalid: props.binding.invalid || !!props.rejection,
    validating: props.binding.validating || props.pending,
  }))
  const focus = () =>
    focusUiTarget(
      () => input.value,
      () => props.binding.disabled || props.readonly,
    )
  // The accepted descriptor owns the native display, including rejected candidates,
  // external values and form reset. Assign only File objects already held by the app.
  function syncFileList() {
    const target = input.value
    if (!target) return
    const file = props.file
    if (!file) {
      target.value = ''
      return
    }
    const transfer = new DataTransfer()
    transfer.items.add(
      file.value.name === file.name
        ? file.value
        : new File([file.value], file.name, {
            type: file.value.type,
            lastModified: file.value.lastModified,
          }),
    )
    target.files = transfer.files
  }
  onMounted(syncFileList)
  watch(() => [props.file?.value, props.file?.name], syncFileList, {
    flush: 'post',
  })
  function openChooser() {
    if (props.binding.disabled || props.readonly) return
    // The browser may fire cancel when the selection is unchanged. Clear first
    // to allow same-file reselection and restore the accepted FileList on cancel.
    // https://html.spec.whatwg.org/multipage/input.html#file-upload-state-(type=file)
    if (input.value) input.value.value = ''
  }
  async function changed(event: Event) {
    const files = [...((event.target as HTMLInputElement).files ?? [])]
    syncFileList()
    try {
      if (files.length) await props.select(files)
    } finally {
      await nextTick()
      syncFileList()
    }
  }
  async function clearFile() {
    if (props.binding.disabled || props.readonly) return
    await props.clear()
    await nextTick()
    await focus()
  }
  defineExpose({ focus })
</script>
<template>
  <div
    class="bootstrap-file-input"
    data-ui-file-input
  >
    <InputFrame
      class="bootstrap-native-file-frame"
      :binding="frameBinding"
      :description-binding="binding"
      :label="label || chooseLabel"
      :readonly="readonly"
      :dirty="!!file"
      :focus-editor="focus"
    >
      <input
        v-bind="$attrs"
        ref="input"
        :id="binding.id"
        type="file"
        class="form-control bootstrap-native-file-editor"
        :class="size"
        :title="file?.name"
        :accept="accept"
        :capture="capture"
        :disabled="binding.disabled || readonly"
        :aria-label="String($attrs['aria-label'] ?? (label || chooseLabel))"
        :aria-describedby="
          [description, $attrs['aria-describedby']].filter(Boolean).join(' ') ||
          undefined
        "
        :aria-required="binding.required || undefined"
        :aria-invalid="binding.invalid || !!rejection || undefined"
        :aria-busy="pending || binding.validating || undefined"
        @click="openChooser"
        @cancel="syncFileList"
        @change="changed"
      />
      <button
        v-if="file"
        type="button"
        class="btn-text btn-icon theme-secondary bootstrap-control-focus bootstrap-input-action"
        :disabled="binding.disabled || readonly"
        :aria-label="clearLabel"
        data-ui-file-clear
        @click="clearFile"
      >
        <span aria-hidden="true">×</span>
      </button>
    </InputFrame>
    <div
      v-if="rejection"
      :id="binding.id + '-rejection'"
      role="status"
    >
      {{ rejection }}
    </div>
  </div>
</template>
