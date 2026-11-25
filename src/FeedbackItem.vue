<script setup lang="ts">
  import FooterActions from './FooterActions.vue'
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
  import {
    useUiFeedbackView,
    type UiFeedbackItemViewProps,
  } from '@uninterface/uninterface/backend'
  import type Toast from 'bootstrap/js/dist/toast.js'
  const props = defineProps<UiFeedbackItemViewProps>()
  const root = ref<HTMLElement>()
  const { events, summary, role } = useUiFeedbackView(props, root, {
    autoPresent: false,
  })
  let toast: Toast | undefined
  let gone = false
  onMounted(async () => {
    const { default: Toast } = await import('bootstrap/js/dist/toast.js')
    if (gone || !root.value) return
    toast = new Toast(root.value, { autohide: false })
    root.value.addEventListener('hidden.bs.toast', props.onExited)
    root.value.addEventListener('shown.bs.toast', props.onPresented)
    if (props.open) {
      await toast.show()
      if (!props.open) await toast.hide()
    } else props.onExited()
  })
  watch(
    () => props.open,
    (open) => {
      if (!open) void toast?.hide()
    },
  )
  onBeforeUnmount(() => {
    gone = true
    root.value?.removeEventListener('hidden.bs.toast', props.onExited)
    root.value?.removeEventListener('shown.bs.toast', props.onPresented)
    toast?.dispose()
  })
</script>
<template>
  <section
    ref="root"
    v-bind="events"
    :id="id"
    data-ui-feedback-item
    :data-feedback-surface="surface"
    :data-closing="!open || undefined"
    class="toast bootstrap-feedback-item"
    :class="[
      color ? `theme-${color}` : undefined,
      // Preserve native visibility when Vue patches the class for a color update.
      // Bootstrap owns show/hide and its exit callback; do not derive this from open.
      { show: toast?.isShown() },
    ]"
    :aria-label="title"
  >
    <div
      v-if="surface === 'notification' && (title || dismissible)"
      class="toast-header"
    >
      <strong class="me-auto">{{ title }}</strong>
      <button
        v-if="dismissible"
        type="button"
        class="btn-close"
        :aria-label="closeLabel"
        @click="onDismissRequest"
      />
    </div>
    <div
      class="toast-body bootstrap-feedback-content"
      tabindex="0"
      role="region"
      :aria-label="title || viewportLabel"
    >
      <div
        :class="surface === 'toast' ? 'bootstrap-toast-copy-row' : undefined"
      >
        <div class="bootstrap-feedback-copy">
          <strong
            v-if="surface === 'toast' && title"
            class="bootstrap-toast-title"
          >
            {{ title }}
          </strong>
          <slot>
            <span v-if="message">{{ message }}</span>
            <ul v-if="details?.length">
              <li
                v-for="(detail, index) in details"
                :key="index"
              >
                {{ detail }}
              </li>
            </ul>
          </slot>
        </div>
        <button
          v-if="surface === 'toast' && dismissible"
          type="button"
          class="btn-close"
          :aria-label="closeLabel"
          @click="onDismissRequest"
        />
      </div>
      <FooterActions v-if="$slots.actions">
        <slot name="actions" />
      </FooterActions>
    </div>
    <span
      class="bootstrap-feedback-announcement"
      :role="role"
      :aria-live="announcement"
      aria-atomic="true"
    >
      {{ summary }}
    </span>
  </section>
</template>
