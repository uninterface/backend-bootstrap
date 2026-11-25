import { h, reactive, nextTick } from 'vue'
import {
  UiField,
  UiTextInput,
  UiCheckbox,
  UiSwitch,
  UiRadioGroup,
  UiCheckboxGroup,
  UiStrategy,
  uiControlSize,
  uiFieldLabels,
  uiCheckablePresentation,
  uiFieldHelp,
  uiValidationFailure,
  createUiFieldControl,
  createUiEntryControl,
  createUiFormControl,
  type UiControlSize,
  type UiCheckboxValue,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'
import '@uninterface/backend/style.css'

export async function mountCheckableAlignment() {
  const state = reactive({
    size: 0 as UiControlSize,
    labels: 'show' as
      | 'show'
      | 'above'
      | 'hidden'
      | 'beside'
      | 'beside-near'
      | 'beside-far'
      | undefined,
    mode: undefined as
      | 'adapt'
      | 'flushed'
      | 'control-aligned'
      | 'separated'
      | undefined,
    cycleIndeterminate: false,
    tristate: false,
    failureNone: false,
    long: false,
    help: true,
    together: false,
    tooltip: false,
    disabled: false,
    required: false,
  })
  const ordinary = createUiFieldControl('Ordinary value')
  const checkbox = createUiFieldControl<UiCheckboxValue>(false)
  const toggle = createUiFieldControl(false)
  const radio = createUiFieldControl('one')
  const checks = createUiFieldControl<string[]>([])
  const form = createUiFormControl({
    ordinary,
    checkbox,
    toggle,
    radio,
    checks,
  })
  const label = () =>
    state.long
      ? 'Receive updates about delivery dates and changes to the delivery address for this order'
      : 'Receive updates'
  const source = createUiEntryControl(() => [
    {
      key: 'one',
      label: label(),
      description: state.help ? 'Option description' : undefined,
    },
    { key: 'two', label: 'Other option' },
  ])
  const host = document.createElement('main')
  document.body.append(host)
  const app = createUiApplication(
    {
      render: () =>
        h(
          UiStrategy,
          {
            use: [
              uiControlSize(state.size),
              ...(state.labels ? [uiFieldLabels(state.labels)] : []),
              ...(state.mode ? [uiCheckablePresentation(state.mode)] : []),
              uiFieldHelp(state.together ? 'together' : 'replace-help'),
              uiValidationFailure(
                state.failureNone
                  ? 'none'
                  : state.tooltip
                    ? 'show-tooltip'
                    : 'show-below',
              ),
            ],
          },
          {
            default: () => [
              h(
                UiField,
                {
                  field: ordinary,
                  label: 'Ordinary field',
                  'data-ordinary-field': '',
                },
                {
                  default: () => h(UiTextInput),
                },
              ),
              ...(['checkbox', 'switch'] as const).map((kind) =>
                h(
                  UiField,
                  {
                    field: kind === 'checkbox' ? checkbox : toggle,
                    label: label(),
                    help: state.help
                      ? 'Updates describe delivery dates and changes to the address for this order.'
                      : undefined,
                    required: state.required,
                    'data-checkable-field': kind,
                  },
                  {
                    default: () =>
                      h(kind === 'checkbox' ? UiCheckbox : UiSwitch, {
                        disabled: state.disabled,
                        ...(kind === 'checkbox'
                          ? {
                              tristate: state.tristate,
                              cycleIndeterminate: state.cycleIndeterminate,
                            }
                          : {}),
                      }),
                  },
                ),
              ),
              ...(['radio', 'checks'] as const).map((kind) =>
                h(
                  UiField,
                  {
                    field: kind === 'radio' ? radio : checks,
                    group: true,
                    label: 'Delivery options',
                    help: state.help ? 'Group description' : undefined,
                    'data-checkable-field': kind,
                  },
                  {
                    default: () =>
                      h(kind === 'radio' ? UiRadioGroup : UiCheckboxGroup, {
                        control: source,
                        disabled: state.disabled,
                      }),
                  },
                ),
              ),
            ],
          },
        ),
    },
    { i18n: { preloadCore: ['uninterface.entries'] } },
  )
  const errors: string[] = []
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.entries')
  app.mount(host)
  await source.load()
  await nextTick()
  let release: (() => void)[] = []
  return {
    host,
    state,
    ordinary,
    checkbox,
    toggle,
    form,
    errors,
    async update(patch: Partial<typeof state>) {
      Object.assign(state, patch)
      if ('long' in patch || 'help' in patch) await source.refresh()
      await nextTick()
    },
    async invalid(value: boolean) {
      release.forEach((fn) => fn())
      release = value
        ? [ordinary, checkbox, toggle].map((field) =>
            field.addCheck(() => 'Review this setting'),
          )
        : []
      await checkbox.validate()
      await toggle.validate()
      await nextTick()
    },
    dispose() {
      app.unmount()
      release.forEach((fn) => fn())
      source.dispose()
      form.dispose()
      host.remove()
    },
  }
}
