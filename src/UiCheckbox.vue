<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { focusBootstrapTarget as focusUiTarget } from './focusTarget'
  import { useUiFieldFailure } from '@uninterface/uninterface/backend'
  import { useUiFieldDescription } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { ref, watchPostEffect } from 'vue'
  import { inject, onMounted, onScopeDispose } from 'vue'
  import { checkboxLayoutKey } from './fieldLayout'
  import type { UiCheckboxViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiCheckboxViewProps>()
  const invalidPresentation = useUiFieldFailure(() => props.binding)
  defineEmits<{ update: [value: boolean] }>()
  const layout = inject(checkboxLayoutKey, undefined)
  let release: (() => void) | undefined
  onMounted(() => {
    release = layout?.register()
  })
  onScopeDispose(() => release?.())
  const element = ref<HTMLInputElement>()
  // Native activation can change checked while two logical states project to
  // the same false boolean. Restore both properties from the accepted value.
  watchPostEffect(() => {
    if (element.value) {
      element.value.checked = props.value === true
      element.value.indeterminate = props.value === 'indeterminate'
    }
  })
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value,
        () => props.binding.disabled,
      ),
  })
  const description = useUiFieldDescription(() => props.binding, 'replace-help')
  const controlSize = useControlSize('UiCheckbox')
</script>
<template>
  <input
    ref="element"
    v-bind="$attrs"
    :id="binding.id"
    type="checkbox"
    class="check bootstrap-control-focus"
    :class="[controlSize, { 'is-invalid': invalidPresentation }]"
    :checked="value === true"
    :indeterminate.prop="value === 'indeterminate'"
    :aria-checked="value === 'indeterminate' ? 'mixed' : value"
    :disabled="binding.disabled"
    :aria-busy="binding.validating || undefined"
    :aria-required="binding.required || undefined"
    :aria-describedby="description"
    :aria-invalid="binding.invalid || undefined"
    @change="$emit('update', ($event.target as HTMLInputElement).checked)"
  />
</template>
