<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { nextTick, onScopeDispose, shallowRef, watch } from 'vue'
  import {
    useUiSuggestionsView,
    useUiOverlayTarget,
    type UiSuggestionsViewProps,
  } from '@uninterface/uninterface/backend'
  import type Popover from 'bootstrap/js/dist/popover.js'
  const props = defineProps<UiSuggestionsViewProps>()
  const { anchor, anchorWidth, surface, visible, host, active, accept } =
    useUiSuggestionsView(props)
  const portal = useUiOverlayTarget(),
    contentTarget = shallowRef<HTMLElement>(),
    popupElement = shallowRef<HTMLElement>()
  // Shared combobox state owns dismissal and keeps focus on the external editor.
  // Native Popover owns placement and its surface; native menu items own presentation.
  let native: Popover | undefined,
    generation = 0
  watch(
    () => [anchor.value, visible.value, portal.value],
    async () => {
      const version = ++generation,
        target = anchor.value
      const describedBy = target?.getAttribute('aria-describedby')
      native?.dispose()
      native = undefined
      contentTarget.value = undefined
      popupElement.value = undefined
      if (!target || !visible.value) return
      const { default: Popover } = await import('bootstrap/js/dist/popover.js')
      if (version !== generation) return
      class SuggestionPopover extends Popover {
        protected override _setEscapeListener() {}
        protected override _setTipListeners() {}
      }
      const instance = new SuggestionPopover(target, {
        trigger: 'manual',
        placement: 'bottom',
        container: portal.value ?? false,
        html: true,
        content: ' ',
        animation: false,
        template:
          '<div class="menu bootstrap-suggestions-menu" role="presentation"><div class="popover-body"></div></div>',
      })
      native = instance
      await instance.show()
      if (version !== generation) return
      popupElement.value = instance.tip ?? undefined
      contentTarget.value =
        instance.tip?.querySelector<HTMLElement>('.popover-body') ?? undefined
      if (describedBy) target.setAttribute('aria-describedby', describedBy)
      else target.removeAttribute('aria-describedby')
      await nextTick()
    },
    { flush: 'post' },
  )
  watch([popupElement, anchorWidth], ([popup, width]) => {
    if (!popup || width === undefined) return
    popup.style.width = `${width}px`
    native?.update()
  })
  onScopeDispose(() => {
    generation++
    native?.dispose()
  })
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  useUiZPopup(() => popupElement.value, { source: 'UiSuggestions' })
</script>
<template>
  <slot
    name="host"
    :host="host"
  />
  <Teleport
    v-if="contentTarget"
    :to="contentTarget"
  >
    <div
      ref="surface"
      class="bootstrap-suggestions"
    >
      <div
        :id="id"
        role="listbox"
        :aria-busy="pending || undefined"
        :aria-label="label"
      >
        <div
          v-for="(item, index) in results"
          :id="`${id}-${index}`"
          :key="item.key"
          class="menu-item"
          :class="{ active: active === index, disabled: item.disabled }"
          role="option"
          :aria-label="item.label"
          :aria-selected="active === index"
          :aria-disabled="item.disabled || undefined"
          @mousedown.prevent
          @click="accept(index)"
        >
          <span class="menu-item-content">
            <span>
              <slot
                name="suggestion"
                :item="item"
                :active="active === index"
              >
                {{ item.label }}
              </slot>
            </span>
          </span>
        </div>
      </div>
      <div
        v-if="message"
        class="menu-text"
        role="status"
      >
        <small v-if="results.length">{{ message }}</small>
        <template v-else>{{ message }}</template>
      </div>
    </div>
  </Teleport>
</template>
