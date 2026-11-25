<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
  import type Collapse from 'bootstrap/js/dist/collapse.js'
  const props = defineProps<{ open: boolean }>()
  const element = ref<HTMLElement>()
  let native: Collapse | undefined
  let mounted = false
  onMounted(async () => {
    mounted = true
    const { default: Collapse } = await import('bootstrap/js/dist/collapse.js')
    if (!mounted) return
    native = new Collapse(element.value!)
    if (props.open) void native.show()
  })
  function sync() {
    if (props.open) void native?.show()
    else void native?.hide()
  }
  watch(() => props.open, sync)
  onBeforeUnmount(() => {
    mounted = false
    native?.dispose()
  })
</script>
<template>
  <div
    ref="element"
    class="collapse"
    v-on="{ 'shown.bs.collapse': sync, 'hidden.bs.collapse': sync }"
    :inert="!open || undefined"
  >
    <slot />
  </div>
</template>
