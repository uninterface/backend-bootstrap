<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { focusBootstrapTarget as focusUiTarget } from './focusTarget'
  import { useUiFieldFailure } from '@uninterface/uninterface/backend'
  import { useUiFieldDescription } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { ref } from 'vue'
  import { inject, onMounted, onScopeDispose } from 'vue'
  import { checkboxLayoutKey } from './fieldLayout'
  import type { UiSwitchViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiSwitchViewProps>()
  const invalidPresentation = useUiFieldFailure(() => props.binding)
  defineEmits<{ update: [value: boolean] }>()
  const layout = inject(checkboxLayoutKey, undefined)
  let release: (() => void) | undefined
  onMounted(() => {
    release = layout?.register()
  })
  onScopeDispose(() => release?.())
  const element = ref<HTMLInputElement>()
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value,
        () => props.binding.disabled,
      ),
  })
  const description = useUiFieldDescription(() => props.binding, 'replace-help')
  const controlSize = useControlSize('UiSwitch')
</script>
<template>
  <span
    class="switch"
    :class="controlSize"
  >
    <input
      ref="element"
      v-bind="$attrs"
      :id="binding.id"
      type="checkbox"
      role="switch"
      :class="{ 'is-invalid': invalidPresentation }"
      :checked="value === true"
      :aria-readonly="readonly || undefined"
      @click="readonly && $event.preventDefault()"
      :aria-checked="value"
      :disabled="binding.disabled"
      :aria-busy="binding.validating || undefined"
      :aria-required="binding.required || undefined"
      :aria-describedby="description"
      :aria-invalid="binding.invalid || undefined"
      @change="$emit('update', ($event.target as HTMLInputElement).checked)"
    />
  </span>
</template>
