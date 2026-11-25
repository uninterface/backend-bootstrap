<script setup lang="ts">
  import FooterActions from './FooterActions.vue'
  import { useId } from 'vue'
  import { uiFocusPresentation } from './focus'
  import {
    useUiModalView,
    settleUiModalMotion,
    type UiModalViewProps,
  } from '@uninterface/uninterface/backend'

  const props = defineProps<UiModalViewProps>()
  const emit = defineEmits<{
    cancel: [reason: UiModalViewProps['closeOn'][number]]
  }>()
  const {
    widthStyle,
    vModalPart,
    ModalPart,
    dialog,
    body,
    title: heading,
    open,
    close,
    cancel,
    pointerdown,
    click,
  } = useUiModalView(() => props, emit, {
    beforeEnter: (element) => {
      // Commit Bootstrap's closed styles before showModal() starts entry.
      // `hiding` is an exit state: using it here blocks initial title focus.
      void element.offsetWidth
    },
    enter: settleUiModalMotion,
    leave: async (element) => {
      element.classList.add('hiding')
      await settleUiModalMotion(element)
    },
  })
  const id = useId()
  defineExpose({ open, close })
</script>
<template>
  <dialog
    ref="dialog"
    :style="widthStyle"
    class="dialog dialog-scrollable bootstrap-modal"
    :aria-labelledby="`${id}-title`"
    @cancel="cancel"
    @pointerdown="pointerdown"
    @click="click"
  >
    <header
      v-modal-part="'header'"
      class="dialog-header"
      :class="{ 'bootstrap-modal-header-extra': $slots['header-extra'] }"
    >
      <h2
        :id="`${id}-title`"
        ref="heading"
        v-bind="uiFocusPresentation"
        tabindex="-1"
        class="dialog-title"
      >
        {{ title }}
      </h2>
      <button
        v-if="closeOn.includes('close-button')"
        type="button"
        class="btn-close"
        :disabled="pendingClose"
        :aria-label="closeLabel"
        @click="emit('cancel', 'close-button')"
      ></button>
      <div
        v-if="$slots['header-extra']"
        class="bootstrap-modal-extra"
      >
        <ModalPart part="header">
          <slot name="header-extra" />
        </ModalPart>
      </div>
    </header>
    <div
      ref="body"
      :data-content-scroll="bodyScroll === 'content' || undefined"
      v-bind="uiFocusPresentation"
      role="region"
      :aria-labelledby="`${id}-title`"
      tabindex="0"
      class="dialog-body bootstrap-modal-body"
    >
      <slot />
    </div>
    <footer
      v-modal-part="'footer'"
      v-if="$slots.footer || $slots.actions"
      class="dialog-footer"
    >
      <ModalPart part="footer">
        <FooterActions v-if="$slots.actions">
          <slot name="actions" />
        </FooterActions>
        <slot
          v-else
          name="footer"
        />
      </ModalPart>
    </footer>
  </dialog>
</template>
