import { nextTick } from 'vue'
import { focusUiTarget } from '@uninterface/uninterface/backend'

/** Native details-content can still be non-focusable during its opening transition. */
export async function focusBootstrapTarget(
  target: () => HTMLElement | null | undefined,
  disabled: () => boolean,
): Promise<boolean | null> {
  await nextTick()
  const element = target()
  if (!element?.isConnected || disabled()) return false
  const document = element.ownerDocument
  const previous = document.activeElement
  const accordions: HTMLElement[] = []
  for (
    let ancestor = element.parentElement;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    if (!ancestor.matches('details.accordion-item[open]')) continue
    accordions.push(ancestor)
  }
  if (!accordions.length) return focusUiTarget(target, disabled)
  const view = document.defaultView
  const current = () =>
    element.isConnected &&
    !disabled() &&
    target() === element &&
    document.activeElement === previous &&
    !element.closest('details.accordion-item:not([open])')
  const render = () =>
    new Promise<void>((resolve) => {
      if (view?.requestAnimationFrame)
        view.requestAnimationFrame(() => resolve())
      else resolve()
    })
  const styles = () =>
    accordions.map((ancestor) =>
      view?.getComputedStyle(ancestor, '::details-content'),
    )
  const visible = () =>
    styles().every((style) => style?.contentVisibility !== 'hidden')
  // Chromium can report hidden details-content without exposing its reveal
  // through getAnimations(). Check the actual native focus gate instead.
  if (!visible()) {
    if (!view?.requestAnimationFrame) return false
    const milliseconds = (value: string) =>
      Number.parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000) || 0
    const transitionTime = Math.max(
      0,
      ...styles().map((style) => {
        const durations = (style?.transitionDuration ?? '0s')
          .split(',')
          .map(milliseconds)
        const delays = (style?.transitionDelay ?? '0s')
          .split(',')
          .map(milliseconds)
        return Math.max(
          ...durations.map(
            (duration, index) => duration + delays[index % delays.length]!,
          ),
        )
      }),
    )
    // Allow native rendering first, then at most its configured transition
    // interval and a final rendering opportunity. Never poll focus itself or
    // leave an inaccessible target pending indefinitely.
    await render()
    const deadline = view.performance.now() + transitionTime
    while (current() && !visible()) {
      const expired = view.performance.now() >= deadline
      await render()
      if (expired) break
    }
  }
  if (!current() || !visible()) return false
  return focusUiTarget(target, disabled)
}
