<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { useUiCollectionHeaderField } from '@uninterface/uninterface/backend'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import FieldFailureTooltip from './FieldFailureTooltip.vue'
  import { useControlSize } from './controlSize'
  import { useUiFieldStrategies } from '@uninterface/uninterface/backend'
  import { computed, provide, ref } from 'vue'
  import { checkboxLayoutKey, floatingLabelKey } from './fieldLayout'
  import type { UiFieldViewBinding } from '@uninterface/uninterface/backend'
  const element = ref()
  useUiCollectionHeaderField(
    element,
    '.bootstrap-input-frame, .form-control, .form-select',
  )
  const props = defineProps<{ binding: UiFieldViewBinding }>()
  const controlSize = useControlSize('UiField')
  const policy = useUiFieldStrategies(() => props.binding, {
    ...{ feedbackRoot: element },
    help: 'replace-help',
    failureModes: ['show-below', 'show-tooltip'],
    labels: (value) =>
      props.binding.checkable
        ? value === 'above' || value === 'beside'
        : value === 'beside' ||
          (!checkboxLayout.value && value === 'above') ||
          (value === 'floating' &&
            !props.binding.group &&
            !checkboxLayout.value &&
            floatingEditors.value === 1),
  })
  const deferFeedback = computed(
    () =>
      'inlineFeedbackDeferred' in policy.value &&
      policy.value.inlineFeedbackDeferred === true,
  )
  const floatingEditors = ref(0)
  provide(floatingLabelKey, {
    active: computed(() => policy.value.labels === 'floating'),
    register() {
      floatingEditors.value++
      return () => {
        floatingEditors.value--
      }
    },
  })
  const checkboxes = ref(0)
  provide(checkboxLayoutKey, {
    register() {
      checkboxes.value++
      return () => {
        checkboxes.value--
      }
    },
  })
  const checkboxLayout = computed(
    () =>
      !props.binding.group &&
      checkboxes.value > 0 &&
      policy.value.checkableMode !== 'separated',
  )
</script>
<template>
  <div
    ref="element"
    :data-ui-label-align="policy.labelAlignment"
    :data-ui-checkable="policy.checkableMode"
    :data-ui-checkable-group="
      binding.checkable && binding.group ? true : undefined
    "
    :data-ui-checkable-label-align="
      binding.checkable ? policy.checkableLabelAlignment : undefined
    "
    class="bootstrap-field"
    :class="[
      binding.group ? 'form-group bootstrap-group' : 'form-field',
      {
        'bootstrap-field-small': controlSize === 'form-control-sm',
        'bootstrap-field-large': controlSize === 'form-control-lg',
        'bootstrap-labels-beside':
          Boolean(policy.labels?.startsWith('beside')) && !checkboxLayout,
        'bootstrap-checkbox-field': checkboxLayout,
        'form-floating': policy.labels === 'floating',
      },
    ]"
    :role="binding.group ? 'group' : undefined"
    :aria-labelledby="binding.group ? `${binding.id}-label` : undefined"
    :aria-describedby="
      binding.group
        ? [
            policy.describedBy,
            binding.requiredLabel ? `${binding.id}-required` : undefined,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        : undefined
    "
    :aria-busy="binding.group && binding.validating ? true : undefined"
    :aria-invalid="binding.group && binding.issue ? true : undefined"
    v-bind="binding.group ? uiFocusPresentation : {}"
  >
    <component
      :is="policy.labels === 'floating' ? 'label' : 'div'"
      :for="policy.labels === 'floating' ? binding.id : undefined"
      v-if="!checkboxLayout"
      class="form-label"
      :class="{
        'visually-hidden': policy.labels === 'hidden',
        'col-form-label': policy.labels.startsWith('beside'),
        'col-form-label-sm':
          policy.labels.startsWith('beside') &&
          controlSize === 'form-control-sm',
        'col-form-label-lg':
          policy.labels.startsWith('beside') &&
          controlSize === 'form-control-lg',
      }"
    >
      <span
        v-if="binding.group"
        :id="`${binding.id}-label`"
        :class="{
          'bootstrap-required': policy.marker === 'required',
          'bootstrap-required-prefix':
            policy.marker === 'required' && policy.markerPosition === 'prefix',
        }"
      >
        {{ binding.label }}
      </span>
      <component
        :is="policy.labels === 'floating' ? 'span' : 'label'"
        v-else
        :for="binding.id"
        :class="{
          'bootstrap-required': policy.marker === 'required',
          'bootstrap-required-prefix':
            policy.marker === 'required' && policy.markerPosition === 'prefix',
        }"
      >
        {{ binding.label }}
      </component>
      <span
        v-if="binding.group && binding.requiredLabel"
        :id="`${binding.id}-required`"
        class="visually-hidden bootstrap-required-description"
      >
        {{ binding.requiredLabel }}
      </span>
    </component>
    <slot />
    <div
      v-if="checkboxLayout"
      class="form-field-content"
    >
      <label
        :for="binding.id"
        :class="{
          'visually-hidden': policy.labels === 'hidden',
          'bootstrap-required': policy.marker === 'required',
          'bootstrap-required-prefix':
            policy.marker === 'required' && policy.markerPosition === 'prefix',
        }"
      >
        {{ binding.label }}
      </label>
      <small
        v-if="policy.showHelp"
        :id="`${binding.id}-help`"
        class="form-text"
      >
        {{ binding.help }}
      </small>
      <div
        v-if="policy.issue && policy.failure !== 'show-tooltip'"
        :id="`${binding.id}-issue`"
        class="invalid-feedback d-block"
        :class="{ 'visually-hidden': deferFeedback }"
      >
        {{ policy.issue }}
      </div>
    </div>
    <template v-else>
      <small
        v-if="policy.showHelp"
        :id="`${binding.id}-help`"
        class="form-text"
      >
        {{ binding.help }}
      </small>
      <div
        v-if="policy.issue && policy.failure !== 'show-tooltip'"
        :id="`${binding.id}-issue`"
        class="invalid-feedback d-block"
        :class="{ 'visually-hidden': deferFeedback }"
      >
        {{ policy.issue }}
      </div>
    </template>
    <FieldFailureTooltip
      v-if="policy.failure === 'show-tooltip'"
      :target="element"
      :message="policy.issue"
      :id="`${binding.id}-issue`"
    />
  </div>
</template>
