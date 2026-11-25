<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiPaginatorSizeSelectViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiPaginatorSizeSelectViewProps>()
</script>
<template>
  <label class="bootstrap-paginator-size">
    {{ label }}
    <select
      class="form-control"
      :value="value"
      :disabled="disabled"
      :aria-busy="pending"
      @change="select(Number(($event.target as HTMLSelectElement).value))"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
