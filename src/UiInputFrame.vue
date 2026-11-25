<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiFieldFailure,
    useUiFieldDescription,
    useUiInputFrameSurface,
    type UiInputFrameViewProps,
  } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiInputFrameViewProps>()
  const emit = defineEmits<{ enter: []; leave: [] }>()
  const { attrs, focus } = useUiInputFrameSurface(props, emit)
  defineExpose({ focus })
  const invalid = useUiFieldFailure(() => props.binding)
  const description = useUiFieldDescription(
    () => props.descriptionBinding,
    'replace-help',
  )
  const size = useControlSize('UiInputFrame')
</script>
<template>
  <div
    v-bind="{ ...$attrs, ...attrs }"
    class="form-control form-adorn bootstrap-input-frame"
    :class="[size, { 'is-invalid': invalid }]"
    :aria-describedby="description"
  >
    <slot name="leading" />
    <slot />
    <slot name="trailing" />
  </div>
</template>
