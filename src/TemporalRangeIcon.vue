<script setup lang="ts">
  import type { UiTemporalBoundaryMode } from '@uninterface/uninterface/backend'
  defineProps<{ mode: UiTemporalBoundaryMode | 'next-day' }>()
  // Bootstrap Icons v1.13.1, MIT; see docs/icon-licenses/Bootstrap-Icons.txt.
  const paths = {
    start:
      'M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8',
    end: 'M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8',
    bounded:
      'M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5',
  }
</script>
<template>
  <span
    class="bootstrap-temporal-symbol"
    aria-hidden="true"
  >
    <span v-if="mode === 'unrestricted'">∞</span>
    <svg
      v-else-if="mode === 'next-day'"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M8 3v4m8-4v4M3 10h18M6 15h6m-3-3v6m6-4 2-2v6" />
    </svg>
    <svg
      v-else
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="currentColor"
      focusable="false"
    >
      <path
        fill-rule="evenodd"
        :d="paths[mode]"
      />
    </svg>
  </span>
</template>
