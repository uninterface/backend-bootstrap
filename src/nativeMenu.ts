// The pinned native toolkit registers document listeners at module evaluation.
// Import this bridge freely on the server; load its implementation after mount.
export type { NativeMenu } from './nativeMenu.client'
export const menuItemSelector =
  ':is(.menu-item, .bootstrap-menu-retry):not(.disabled, :disabled, [aria-disabled="true"])'

export async function loadNativeMenu() {
  return (await import('./nativeMenu.client')).NativeMenu
}
