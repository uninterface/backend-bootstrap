import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h, nextTick } from 'vue'
import {
  createUiEntryControl,
  createUiFieldControl,
  createUiFormControl,
  createUiModalControl,
  UiButton,
  UiField,
  UiForm,
  UiModal,
  UiSelect,
  UiStrategy,
  uiFieldLabels,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

const scenario = new URLSearchParams(location.search).get('scenario')
const initial = scenario === 'floating' ? 'customer' : 'first'
const field = createUiFieldControl(initial)
const form = createUiFormControl({ category: field })
const modal = createUiModalControl<void>()
const categories = createUiEntryControl([
  { key: 'customer', label: 'Customer' },
  { key: 'supplier', label: 'Supplier' },
])
const duplicateChoices = createUiEntryControl([
  { key: 'first', label: 'Same label' },
  { key: 'second"\\特殊', label: 'Same label' },
  { key: 'disabled', label: 'Unavailable', disabled: true },
])
const category = (label: string) =>
  h(UiField, { field, label }, () => h(UiSelect, { control: categories }))

const app = createUiApplication({
  render: () => {
    if (scenario === 'modal') {
      return h('main', [
        h(UiButton, { onClick: () => void modal.run() }, () => 'Edit record'),
        h(
          UiModal<void>,
          { control: modal, title: 'Record dialog' },
          {
            default: () =>
              h(
                UiForm,
                { control: form, label: 'Edit record', save: async () => {} },
                () => [
                  category('Category'),
                  h(
                    UiButton,
                    { binding: form.bindings.submitButton },
                    () => 'Save',
                  ),
                ],
              ),
          },
        ),
      ])
    }
    if (scenario === 'floating')
      return h(UiStrategy, { use: uiFieldLabels('floating') }, () =>
        category('Choose an item'),
      )
    return h('section', { 'data-testid': 'editor-0' }, [
      h(UiField, { field, label: 'Choice' }, () =>
        h(UiSelect, { control: duplicateChoices }),
      ),
      h('output', { 'data-testid': 'value' }, field.state.input),
    ])
  },
})
const host = document.body.appendChild(document.createElement('div'))
void app.ui.ready.then(async () => {
  app.mount(host)
  await nextTick()
})
