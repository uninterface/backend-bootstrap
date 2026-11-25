<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import {
    useUiCollectionFooterNavigation,
    useUiCollectionFooterCompact,
  } from '@uninterface/uninterface/backend'
  const footerCompact = useUiCollectionFooterCompact()

  import { computed } from 'vue'
  import type { UiPaginatorViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiPaginatorViewProps>()
  const footerWidth = useUiCollectionFooterNavigation(
    () => 22 + Math.min(props.pageCount ?? 1, 7) * 2.5,
    () => 11.5 + String(props.page ?? 1).length * 0.65,
  )
  const compact = computed(() => footerCompact?.value ?? false)
  const numbered = computed(
    () =>
      props.page !== undefined &&
      props.pageCount !== undefined &&
      props.pageCount > 0 &&
      props.page <= props.pageCount &&
      props.canJump,
  )
  const canGoFirst = computed(() =>
    numbered.value ? !props.pending && props.page! > 1 : props.canFirst,
  )
  // Bootstrap supplies the markup/style pattern, not a page-window engine.
  const pages = computed(() => {
    if (!numbered.value) return []
    if (compact.value) {
      const count = props.pageCount!,
        current = props.page!
      const visible = (footerWidth?.value ?? 0) >= 360 ? Math.min(3, count) : 1
      const start = Math.max(
        1,
        Math.min(current - Math.floor(visible / 2), count - visible + 1),
      )
      return Array.from({ length: visible }, (_, index) => start + index)
    }
    const count = props.pageCount!,
      current = props.page!
    const visible = new Set([1, count])
    const start =
      count <= 7
        ? 1
        : current <= 4
          ? 1
          : current >= count - 3
            ? count - 4
            : current - 1
    const end =
      count <= 7
        ? count
        : current <= 4
          ? 5
          : current >= count - 3
            ? count
            : current + 1
    for (let page = start; page <= end; page++) visible.add(page)
    const result: (number | string)[] = []
    let previous = 0
    for (const page of [...visible].sort((a, b) => a - b)) {
      if (page - previous > 1) result.push(`gap-${page}`)
      result.push(page)
      previous = page
    }
    return result
  })
</script>
<template>
  <nav
    class="bootstrap-paginator"
    :data-compact="compact ? '' : undefined"
    :aria-label="label"
    :aria-busy="pending"
  >
    <ul
      class="pagination mb-0"
      :class="compact ? 'flex-nowrap' : 'flex-wrap'"
    >
      <li
        class="page-item"
        :class="{ disabled: !canGoFirst }"
      >
        <button
          class="page-link"
          type="button"
          :disabled="!canGoFirst"
          :aria-label="firstLabel"
          @click="numbered ? goTo(1) : first()"
        >
          <span
            v-if="compact"
            class="bootstrap-paginator-direction"
            aria-hidden="true"
          >
            «
          </span>
          <template v-else>{{ firstLabel }}</template>
        </button>
      </li>
      <li
        class="page-item"
        :class="{ disabled: !canPrevious }"
      >
        <button
          class="page-link"
          type="button"
          :disabled="!canPrevious"
          :aria-label="previousLabel"
          @click="previous"
        >
          <span
            v-if="compact"
            class="bootstrap-paginator-direction"
            aria-hidden="true"
          >
            ‹
          </span>
          <template v-else>{{ previousLabel }}</template>
        </button>
      </li>
      <li
        v-for="item in pages"
        :key="item"
        class="page-item"
        :class="{ active: item === page, disabled: typeof item !== 'number' }"
      >
        <button
          v-if="typeof item === 'number'"
          class="page-link"
          type="button"
          :aria-label="pageName(item)"
          :aria-current="item === page ? 'page' : undefined"
          :disabled="pending"
          @click="goTo(item)"
        >
          {{ item }}
        </button>
        <span
          v-else
          class="page-link"
          aria-hidden="true"
        >
          …
        </span>
      </li>
      <li
        v-if="!numbered && pageLabel"
        class="page-item"
      >
        <span class="page-link">{{ compact ? page : pageLabel }}</span>
      </li>
      <li
        class="page-item"
        :class="{ disabled: !canNext }"
      >
        <button
          class="page-link"
          type="button"
          :disabled="!canNext"
          :aria-label="nextLabel"
          @click="next"
        >
          <span
            v-if="compact"
            class="bootstrap-paginator-direction"
            aria-hidden="true"
          >
            ›
          </span>
          <template v-else>{{ nextLabel }}</template>
        </button>
      </li>
      <li
        class="page-item"
        :class="{ disabled: !canLast }"
      >
        <button
          class="page-link"
          type="button"
          :disabled="!canLast"
          :aria-label="lastLabel"
          @click="last"
        >
          <span
            v-if="compact"
            class="bootstrap-paginator-direction"
            aria-hidden="true"
          >
            »
          </span>
          <template v-else>{{ lastLabel }}</template>
        </button>
      </li>
    </ul>
  </nav>
</template>
