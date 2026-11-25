// The pinned native toolkit registers document listeners at module evaluation.
// Import this bridge freely on the server; load its implementation after mount.
export type { NativeSelect } from './nativeSelect.client'
export async function loadNativeSelect() {
  return (await import('./nativeSelect.client')).NativeSelect
}
