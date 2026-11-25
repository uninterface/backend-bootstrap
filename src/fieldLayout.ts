import type { InjectionKey, ComputedRef } from 'vue'

// Private presentation coordination. It never owns field values or validation.
export const checkboxLayoutKey: InjectionKey<{ register(): () => void }> =
  Symbol('bootstrap.checkbox-layout')

export const floatingLabelKey: InjectionKey<{
  active: ComputedRef<boolean>
  register(): () => void
}> = Symbol('bootstrap.floating-label')
