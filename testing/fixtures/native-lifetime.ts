import '@uninterface/backend/style.css'
import { h } from 'vue'
import {
  createUiFieldControl,
  createUiEntryControl,
  UiField,
  UiSelect,
  UiMenu,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function prepare() {
  const field = createUiFieldControl('a')
  const choices = createUiEntryControl([
    { key: 'a', label: 'Alpha' },
    { key: 'b', label: 'Beta' },
  ])
  const menu = createUiEntryControl([
    { key: 'first', label: 'First' },
    { key: 'second', label: 'Second' },
  ])
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h('div', [
        h(UiField, { field, label: 'Category' }, () =>
          h(UiSelect, { control: choices }),
        ),
        h(UiMenu, { control: menu, ariaLabel: 'Actions' }),
      ]),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  const host = document.createElement('div')
  document.body.append(host)
  await app.ui.ready
  return {
    host,
    errors,
    mount: () => app.mount(host),
    dispose() {
      app.unmount()
      choices.dispose()
      menu.dispose()
      host.remove()
    },
  }
}
