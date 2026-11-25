import '@uninterface/backend/style.css'
import { h, nextTick, ref } from 'vue'
import {
  createUiEntryControl,
  UiNavbar,
  UiNavMenu,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountNavigation(navbar: boolean) {
  const current = ref('overview')
  const control = createUiEntryControl([
    { key: 'overview', label: 'Overview' },
    {
      kind: 'submenu',
      key: 'destinations',
      label: 'Destinations',
      children: [
        { key: 'nearby', label: 'Nearby' },
        {
          kind: 'submenu',
          key: 'asia',
          label: 'Asia',
          children: [{ key: 'singapore', label: 'Singapore' }],
        },
      ],
    },
  ])
  const host = document.createElement('div')
  document.body.append(host)
  const errors: string[] = []
  const menu = () =>
    h(UiNavMenu, {
      control,
      modelValue: current.value,
      ariaLabel: 'Travel',
      onActivate: (key: string) => {
        current.value = key
      },
    })
  const app = createUiApplication({
    render: () =>
      navbar
        ? h(UiNavbar, { ariaLabel: 'Travel navbar' }, { default: menu })
        : menu(),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.entries')
  app.mount(host)
  await nextTick()
  return {
    host,
    errors,
    tick: async () => {
      await nextTick()
      await nextTick()
    },
    setCurrent: async (key: string) => {
      current.value = key
      await nextTick()
    },
    dispose: () => {
      app.unmount()
      control.dispose()
      host.remove()
    },
  }
}

export { mountTravel } from './travel-navigation'
