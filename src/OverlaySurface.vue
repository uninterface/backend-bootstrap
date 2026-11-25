<script setup lang="ts">
  import DrawerDepth from './DrawerDepth.vue'
  import FooterActions from './FooterActions.vue'
  import {
    useUiOverlayView,
    useUiDrawerResize,
    createUiModalCssMotion,
    type UiOverlayViewProps,
  } from '@uninterface/uninterface/backend'
  import type { UiOverlayCloseTrigger } from '@uninterface/uninterface'
  import { uiFocusPresentation } from './focus'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiOverlayViewProps & {
      kind: 'drawer' | 'popover'
      anchor?: HTMLElement
      trigger?: HTMLElement
    }
  >()
  const emit = defineEmits<{
    cancel: [reason: UiOverlayCloseTrigger]
    'update:expanded': [expanded: boolean]
    failure: [error: unknown]
  }>()
  const {
    surface,
    visible,
    cssPanel,
    heading,
    arrow,
    placedSide,
    open,
    close,
    widthStyle,
    cancel,
    pointerdown,
    click,
  } = useUiOverlayView(
    () => props,
    props.kind,
    () => props.anchor,
    () => props.trigger,
    emit,
    props.kind === 'drawer' ? createUiModalCssMotion('bootstrap-drawer') : {},
  )
  const resize = useUiDrawerResize(() => props, surface)
  defineExpose({ open, close, element: surface })
</script>
<template>
  <!-- Native open state owns visibility; show supplies Bootstrap's opaque surface. -->
  <component
    v-bind="$attrs"
    :is="modal ? 'dialog' : 'div'"
    :role="modal ? undefined : 'dialog'"
    :id="`${id}-surface`"
    ref="surface"
    :popover="modal || docked || cssPanel ? undefined : 'manual'"
    :inert="!active || undefined"
    :class="[
      'bootstrap-overlay',
      kind === 'drawer'
        ? ['drawer', 'drawer-instant', `drawer-${edge}`]
        : 'popover show bs-popover-auto',
    ]"
    :style="[
      widthStyle,
      drawerSizing
        ? ['start', 'end'].includes(edge)
          ? { width: `${drawerSizing.extent}px` }
          : { height: `${drawerSizing.extent}px` }
        : undefined,
      kind === 'drawer' ? resize.style() : undefined,
    ]"
    :data-docked="docked || undefined"
    :data-css-panel="cssPanel || undefined"
    :hidden="((docked || cssPanel) && !active && !visible) || undefined"
    :data-ui-overlay="kind"
    :data-bs-placement="kind === 'popover' ? placedSide : undefined"
    :data-edge="edge"
    :data-panel="panel || undefined"
    :aria-modal="modal ? true : undefined"
    :aria-labelledby="title ? `${id}-title` : undefined"
    :aria-label="title ? undefined : name"
    @cancel="cancel"
    @pointerdown="pointerdown"
    @click="click"
  >
    <div class="bootstrap-overlay-content">
      <header
        v-if="
          title || closeOn.includes('close-button') || $slots['header-extra']
        "
        :class="kind === 'drawer' ? 'drawer-header' : 'popover-header'"
      >
        <div class="bootstrap-overlay-heading">
          <h2
            v-if="title"
            :id="`${id}-title`"
            ref="heading"
            tabindex="-1"
            v-bind="uiFocusPresentation"
          >
            {{ title }}
          </h2>
          <button
            v-if="closeOn.includes('close-button')"
            type="button"
            class="btn-close"
            :aria-label="closeLabel"
            :disabled="pendingClose || disabled"
            @click="emit('cancel', 'close-button')"
          />
        </div>
        <slot name="header-extra" />
      </header>
      <div
        :class="kind === 'drawer' ? 'drawer-body' : 'popover-body'"
        :ref="!title ? (el: any) => (heading = el?.$el ?? el) : undefined"
        role="region"
        tabindex="0"
        :aria-label="name"
        v-bind="uiFocusPresentation"
      >
        <slot />
      </div>
      <footer
        v-if="$slots.actions || $slots.footer"
        :class="kind === 'drawer' ? 'drawer-footer' : 'popover-body'"
      >
        <FooterActions v-if="$slots.actions">
          <slot name="actions" />
        </FooterActions>
        <slot
          v-else
          name="footer"
        />
      </footer>
    </div>
    <div
      v-if="kind === 'popover'"
      ref="arrow"
      class="popover-arrow"
      aria-hidden="true"
    />
    <DrawerDepth
      v-if="kind === 'drawer' && !docked"
      :edge="edge"
    />
    <div
      v-if="drawerSizing?.enabled"
      class="bootstrap-drawer-resize"
      v-bind="resize.attributes()"
    />
  </component>
</template>
