import { computed } from 'vue'
import {
  useUiStrategy,
  uiControlSizeQuery,
} from '@uninterface/uninterface/backend'
export function useControlSize(component: string) {
  const result = useUiStrategy(uiControlSizeQuery, [-2, -1, 0, 1, 2])
  const prefix =
    component === 'UiSwitch'
      ? 'switch'
      : component === 'UiButton' || component === 'UiSegmentedSelect'
        ? 'btn'
        : component === 'UiCheckbox'
          ? 'check'
          : component === 'UiRadioGroup'
            ? 'radio'
            : 'form-control'
  return computed(() => {
    if (result.value.status !== 'answered' || result.value.value === 0)
      return undefined
    const suffix = (
      { '-2': 'xs', '-1': 'sm', '1': 'lg' } as Record<number, string>
    )[
      Math.max(
        component === 'UiButton' || component === 'UiSegmentedSelect' ? -2 : -1,
        Math.min(1, result.value.value),
      )
    ]
    return `${prefix}-${suffix}`
  })
}
