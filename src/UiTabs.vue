<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiTabList,
    type UiTabsViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiTabsViewProps>()
  const emit = defineEmits<{ select: [key: string] }>()
  const { setElement, tabIndex, focus, keydown } = useUiTabList(props)
</script>
<template>
  <div
    class="bootstrap-tabs"
    :data-orientation="orientation"
  >
    <div
      role="tablist"
      :aria-label="label"
      :aria-orientation="orientation"
      class="bootstrap-tab-list nav"
      :class="
        orientation === 'vertical' ? 'nav-pills nav-pills-vertical' : 'nav-tabs'
      "
    >
      <button
        v-for="item in items"
        :key="item.key"
        :ref="(element) => setElement(item.key, element)"
        v-bind="item.attributes"
        type="button"
        role="tab"
        :id="item.tabId"
        class="nav-link bootstrap-control-focus"
        :class="{ active: item.selected }"
        :aria-selected="item.selected"
        :aria-controls="item.panelId"
        :disabled="item.disabled"
        :tabindex="tabIndex(item.key)"
        @focus="focus(item.key)"
        @keydown="keydown($event, item.key)"
        @click="emit('select', item.key)"
      >
        <slot :item="item" />
      </button>
    </div>
  </div>
</template>
