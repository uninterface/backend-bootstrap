import { h } from 'vue'
import { UiIcon } from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mount(custom = false) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication(
    {
      render: () =>
        h('section', { 'data-icons': '' }, [h(UiIcon, { name: 'settings' })]),
    },
    {
      icons: custom
        ? {
            add: {
              component: { render: () => h('svg', { viewBox: '0 0 24 24' }) },
            },
          }
        : undefined,
    },
  )
  await app.ui.ready
  app.mount(host)
  return {
    host,
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
