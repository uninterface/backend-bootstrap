<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { uiFocusPresentation } from './focus'
  import {
    useUiMenuView,
    type UiMenuViewBinding,
  } from '@uninterface/uninterface/backend'
  import EntryBranch from './EntryBranch.vue'
  import EntryPopup from './EntryPopup.vue'
  const props = defineProps<{ binding: UiMenuViewBinding }>()
  const emit = defineEmits<{
    open: []
    close: []
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  const {
    host,
    surface,
    id,
    anchor,
    point,
    hostBindings,
    expanded,
    activated,
    close,
    first,
  } = useUiMenuView(() => props.binding, emit, {
    contextTriggerClass: uiFocusPresentation.class,
    nativeInteraction: () => true,
  })
</script>
<template>
  <div
    ref="host"
    class="bootstrap-entry-host"
  >
    <slot
      v-if="binding.mode === 'popup'"
      name="host"
      v-bind="hostBindings"
    />

    <component
      :is="binding.mode === 'popup' ? EntryPopup : 'div'"
      v-if="binding.open"
      :anchor="anchor"
      :point="point"
      @close="close(false)"
    >
      <EntryBranch
        :ref="
          (instance: any) => {
            surface = instance?.$el
          }
        "
        :id="id"
        @close="close()"
        :entries="binding.entries"
        :status="binding.status"
        :label="binding.label"
        :tabindex="binding.mode === 'inline' ? 0 : -1"
        @focus="
          (event: FocusEvent) => {
            if (event.target === event.currentTarget) first()?.focus()
          }
        "
        @activate="activated"
        @expand="expanded"
        @retry="$emit('retry', $event)"
      >
        <template #entry="scope">
          <slot
            name="entry"
            v-bind="scope"
          />
        </template>
        <template #icon="scope">
          <slot
            name="icon"
            v-bind="scope"
          />
        </template>
      </EntryBranch>
    </component>
  </div>
</template>
