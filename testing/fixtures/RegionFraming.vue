<script setup lang="ts">
  import { ref } from 'vue'
  import {
    UiCard,
    UiContent,
    UiNavbar,
    UiRegionLayout,
    UiStrategy,
    uiLayoutFraming,
  } from '@uninterface/uninterface'

  const direction = ref<'vertical' | 'horizontal'>('vertical')
  const framing = uiLayoutFraming(
    { separators: 'visible', regions: {} },
    { scope: { targets: ['region-layout'], depth: 1 } },
  )
</script>

<template>
  <button
    type="button"
    @click="direction = 'vertical'"
  >
    Vertical
  </button>
  <button
    type="button"
    @click="direction = 'horizontal'"
  >
    Horizontal
  </button>
  <UiCard :level="0">
    <template #layout>
      <div style="height: 24rem">
        <UiStrategy :use="framing">
          <UiRegionLayout
            data-testid="region-example-layout"
            :direction="direction"
            height="full"
            navigation-region="start"
            :division="
              direction === 'horizontal'
                ? { start: 1, main: 3, end: 1 }
                : undefined
            "
          >
            <template #start>
              <UiNavbar aria-label="Example navigation">
                <template #brand>Start</template>
                <a href="#example">Example link</a>
              </UiNavbar>
            </template>
            <template #main><UiContent>Reading area</UiContent></template>
            <template #end><UiContent>End</UiContent></template>
          </UiRegionLayout>
        </UiStrategy>
      </div>
    </template>
  </UiCard>
</template>
