import { h, ref } from 'vue'
import {
  UiButton,
  UiDrawer,
  UiPopover,
  createUiDrawerControl,
  createUiExpansionControl,
  createUiPopoverControl,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountPopover() {
  const popover = createUiPopoverControl<string>()
  const drawer = createUiDrawerControl<void>()
  const panels = createUiExpansionControl({ mode: 'multiple' })
  const popoverModal = ref(false)
  const errors: string[] = []
  const renderPopover = () =>
    h(
      UiPopover,
      {
        key: String(popoverModal.value),
        control: popover,
        title: 'Quick edit',
        modal: popoverModal.value,
        placement: 'bottom',
      },
      {
        host: ({
          buttonTrigger,
          anchor,
        }: {
          buttonTrigger: Record<string, unknown>
          anchor: Record<string, unknown>
        }) => [
          h(
            UiButton,
            { ...buttonTrigger, id: 'popover-trigger' },
            () => 'Quick edit',
          ),
          h('span', { ...anchor, id: 'separate-anchor' }, 'Anchor'),
        ],
        default: () => 'Edit details',
      },
    )
  const app = createUiApplication({
    render: () => [
      h(
        UiDrawer,
        { mode: 'modal', control: drawer, title: 'Edit' },
        () => 'Drawer content',
      ),
      h(
        UiDrawer,
        {
          mode: 'panel',
          binding: panels.bindings.drawer('filters'),
          title: 'Filters',
        },
        {
          host: ({
            buttonTrigger,
          }: {
            buttonTrigger: Record<string, unknown>
          }) =>
            h(
              UiButton,
              { ...buttonTrigger, id: 'panel-trigger' },
              () => 'Filters',
            ),
          default: () => 'Filters content',
        },
      ),
      renderPopover(),
    ],
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.body.appendChild(document.createElement('div'))
  app.mount(host)
  return {
    drawer,
    popover,
    popoverModal,
    errors,
    async dispose() {
      app.unmount()
      await drawer.dispose()
      await popover.dispose()
      panels.dispose()
      host.remove()
    },
  }
}
