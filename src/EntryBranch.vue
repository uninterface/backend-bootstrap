<script setup lang="ts">
  import {
    computed,
    inject,
    useId,
    ref,
    onMounted,
    onBeforeUnmount,
    nextTick,
  } from 'vue'
  import {
    loadNativeMenu,
    menuItemSelector,
    type NativeMenu,
  } from './nativeMenu'
  import { navbarContextKey } from './navbarContext'
  import EntryPopup from './EntryPopup.vue'
  import EntryCollapse from './EntryCollapse.vue'
  import { useUiMenuIconColumn } from '@uninterface/uninterface/backend'
  import type {
    UiEntryViewNode,
    UiEntryStatusViewBinding,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<{
    entries: readonly UiEntryViewNode[]
    status?: UiEntryStatusViewBinding
    label: string
    navigation?: boolean
    group?: boolean
    presentation?: import('@uninterface/uninterface').UiNavMenuPresentation
    parentKey?: string
  }>()
  const emit = defineEmits<{
    close: []
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  defineSlots<{
    entry(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
    }): any
    icon(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
      icon?: unknown
    }): any
  }>()
  // Current ancestry comes from the controlled entry tree, even while closed.
  function containsCurrent(node: UiEntryViewNode): boolean {
    return Boolean(node.current || node.children?.some(containsCurrent))
  }
  const navbar = inject(navbarContextKey, false)
  const tree = computed(
    () => props.navigation && props.presentation === 'vertical-tree',
  )
  const rail = computed(
    () =>
      props.navigation &&
      props.parentKey === undefined &&
      props.presentation === 'icon-popup',
  )
  const iconColumn = useUiMenuIconColumn(() => props.entries, {
    group: () => Boolean(props.group),
    reserve: () =>
      Boolean(
        props.navigation &&
          (props.presentation === 'vertical-tree' ||
            (props.parentKey === undefined &&
              props.presentation !== 'horizontal')),
      ),
    enabled: () =>
      !(
        props.navigation &&
        props.parentKey === undefined &&
        (!props.presentation || props.presentation === 'horizontal')
      ),
  })
  const id = useId()
  const anchors = new Map<string, HTMLElement>()
  const surface = ref<HTMLElement>()
  let native: NativeMenu | undefined
  let mounted = false
  let initialization: Promise<void> | undefined
  let search = ''
  let typedAt = 0
  onMounted(() => {
    mounted = true
    if (
      !tree.value &&
      !props.group &&
      (!props.navigation || props.parentKey !== undefined)
    )
      return (initialization = loadNativeMenu().then((NativeMenu) => {
        if (mounted)
          native = new NativeMenu(surface.value, { menu: surface.value })
      }))
  })
  onBeforeUnmount(() => {
    mounted = false
    native?.dispose()
  })
  async function keyboard(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if (tree.value || target.closest('.menu') !== surface.value) return
    if (
      !native &&
      initialization &&
      ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
    ) {
      event.preventDefault()
      event.stopPropagation()
      await initialization
      if (!mounted) return
    }
    if (native?.navigate(event)) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    const rtl = getComputedStyle(surface.value!).direction === 'rtl'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft'
    if (event.key === forward && target.hasAttribute('aria-expanded')) {
      if (target.getAttribute('aria-disabled') === 'true') return
      emit('expand', target.dataset.entryKey!, true)
    } else if (event.key === 'Escape' || event.key === backward) {
      if (props.parentKey !== undefined) {
        event.preventDefault()
        event.stopPropagation()
        const parent = document.querySelector<HTMLElement>(
          `[aria-controls="${surface.value!.id}"]`,
        )
        emit('expand', props.parentKey, false)
        await nextTick()
        parent?.focus()
      } else if (event.key === 'Escape') emit('close')
      else return
    } else if (event.key === 'Tab') {
      emit('close')
      return
    } else if (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      // Bootstrap 6 has no typeahead. Supplement only that missing behavior.
      search = Date.now() - typedAt > 600 ? event.key : search + event.key
      typedAt = Date.now()
      const items = [
        ...surface.value!.querySelectorAll<HTMLElement>(menuItemSelector),
      ].filter((item) => item.closest('.menu') === surface.value)
      const index = items.indexOf(target)
      const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
      ordered
        .find((item) =>
          (item.getAttribute('aria-label') ?? item.textContent ?? '')
            .toLocaleLowerCase()
            .startsWith(search.toLocaleLowerCase()),
        )
        ?.focus()
    } else return
    event.preventDefault()
    event.stopPropagation()
  }
</script>
<template>
  <ul
    ref="surface"
    @keydown="keyboard"
    :class="
      group
        ? 'bootstrap-entry-group'
        : navigation && (parentKey === undefined || tree)
          ? navbar && presentation === 'horizontal'
            ? 'nav navbar-nav flex-row flex-wrap bootstrap-entry-navigation-list'
            : `nav bootstrap-entry-navigation-list ${presentation !== 'horizontal' ? 'flex-column' : ''} ${tree ? 'bootstrap-navigation-tree' : ''} ${rail ? 'bootstrap-navigation-rail' : ''}`
          : 'menu show bootstrap-entry-menu'
    "
    :role="navigation ? undefined : group ? 'group' : 'menu'"
    :aria-label="label"
    :aria-busy="status?.pending || undefined"
    :data-parent="parentKey"
    :tabindex="!navigation && !group ? -1 : undefined"
  >
    <li
      v-for="(node, index) in entries"
      :key="node.entry.key"
      :role="navigation ? undefined : 'none'"
      :class="{ submenu: node.entry.kind === 'submenu', show: node.expanded }"
    >
      <hr
        v-if="node.entry.kind === 'separator'"
        class="menu-divider"
      />
      <template v-else-if="node.entry.kind === 'group'">
        <div
          :id="`${id}-${index}`"
          class="menu-header bootstrap-entry-group-label"
          :data-rail-heading="rail || undefined"
        >
          <span
            v-if="node.entry.icon || iconColumn"
            aria-hidden="true"
            class="menu-item-icon bootstrap-entry-icon"
          >
            <slot
              v-if="node.entry.icon"
              name="icon"
              :entry="node.entry"
              :icon="node.entry.icon"
            />
          </span>
          <slot
            name="entry"
            :entry="node.entry"
          >
            {{ node.entry.label }}
          </slot>
        </div>
        <small v-if="node.entry.description">
          {{ node.entry.description }}
        </small>
        <EntryBranch
          :entries="node.children ?? []"
          :label="node.entry.label"
          :aria-labelledby="`${id}-${index}`"
          :navigation="navigation"
          :presentation="presentation"
          :parent-key="parentKey"
          group
          @activate="$emit('activate', $event)"
          @expand="(key, open) => $emit('expand', key, open)"
          @retry="$emit('retry', $event)"
        >
          <template #entry="scope">
            <slot
              name="entry"
              v-bind="scope"
            />
          </template>
          <template #icon="scope">
            <slot
              name="icon"
              v-bind="scope"
            />
          </template>
        </EntryBranch>
      </template>
      <template v-else>
        <component
          :ref="
            (element: any) => {
              if (element) anchors.set(node.entry.key, element)
              else anchors.delete(node.entry.key)
            }
          "
          :is="
            navigation && node.entry.kind !== 'submenu' && node.entry.href
              ? 'a'
              : 'button'
          "
          :class="[
            navigation && (parentKey === undefined || tree)
              ? 'nav-link'
              : 'menu-item',
            {
              'bootstrap-navigation-item': navigation,
              'bootstrap-navigation-rail-item': rail,
              active: navigation ? containsCurrent(node) : node.current,
              show: Boolean(node.expanded),
              selected: node.selected,
              disabled: node.entry.disabled,
            },
          ]"
          :type="
            navigation && node.entry.kind !== 'submenu' && node.entry.href
              ? undefined
              : 'button'
          "
          :role="
            navigation
              ? node.entry.kind !== 'submenu' &&
                node.entry.href &&
                node.entry.disabled
                ? 'link'
                : undefined
              : node.selectionMode === 'multiple'
                ? 'menuitemcheckbox'
                : node.selectionMode === 'single'
                  ? 'menuitemradio'
                  : 'menuitem'
          "
          :href="
            navigation && node.entry.kind !== 'submenu' && !node.entry.disabled
              ? node.entry.href
              : undefined
          "
          :tabindex="navigation ? (node.entry.disabled ? -1 : undefined) : -1"
          :data-entry-key="node.entry.key"
          :data-navigation-row="
            navigation && (parentKey === undefined || tree)
              ? rail
                ? 'rail'
                : 'labelled'
              : undefined
          "
          :aria-disabled="node.entry.disabled || undefined"
          :aria-current="node.current ? 'page' : undefined"
          :aria-checked="
            node.selectionMode ? Boolean(node.selected) : undefined
          "
          :aria-haspopup="
            !navigation && node.entry.kind === 'submenu' ? 'menu' : undefined
          "
          :aria-expanded="
            node.entry.kind === 'submenu' ? Boolean(node.expanded) : undefined
          "
          :aria-controls="
            node.entry.kind === 'submenu' && node.expanded
              ? `${id}-sub-${index}`
              : undefined
          "
          :aria-label="node.entry.label"
          :aria-describedby="
            node.entry.description ? `${id}-description-${index}` : undefined
          "
          @click="
            (event: MouseEvent) => {
              if ('disabled' in node.entry && node.entry.disabled) {
                event.preventDefault()
                return
              }
              if (
                navigation &&
                'href' in node.entry &&
                node.entry.href &&
                (event.ctrlKey ||
                  event.metaKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0)
              )
                return
              if (node.entry.kind === 'submenu')
                $emit('expand', node.entry.key, !node.expanded)
              else if (node.request) node.request(event)
              else $emit('activate', node.entry.key)
            }
          "
        >
          <span
            v-if="node.entry.icon || iconColumn"
            aria-hidden="true"
            class="menu-item-icon bootstrap-entry-icon"
          >
            <slot
              v-if="node.entry.icon"
              name="icon"
              :entry="node.entry"
              :icon="node.entry.icon"
            />
          </span>
          <span
            class="menu-item-content"
            :class="{ 'visually-hidden': rail }"
          >
            <slot
              name="entry"
              :entry="node.entry"
            >
              {{ node.entry.label }}
            </slot>
            <small
              class="menu-item-description"
              v-if="node.entry.description"
              :id="`${id}-description-${index}`"
            >
              {{ node.entry.description }}
            </small>
          </span>
          <kbd v-if="node.entry.kind !== 'submenu' && node.entry.shortcut">
            {{ node.entry.shortcut }}
          </kbd>

          <span
            v-if="node.selectionMode"
            aria-hidden="true"
            class="menu-item-check"
          >
            {{
              node.selected ? (node.selectionMode === 'single' ? '●' : '✓') : ''
            }}
          </span>
          <!-- Bootstrap Icons chevron-down, MIT: https://icons.getbootstrap.com/icons/chevron-down/ -->
          <svg
            v-if="
              navigation &&
              (parentKey === undefined || tree) &&
              node.entry.kind === 'submenu'
            "
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-down combobox-caret"
            :class="{
              'bootstrap-navigation-side-caret':
                !tree && presentation !== 'horizontal',
            }"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill-rule="evenodd"
              d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
            />
          </svg>
        </component>
        <component
          :is="tree ? EntryCollapse : EntryPopup"
          :open="Boolean(node.expanded)"
          v-if="node.entry.kind === 'submenu' && (tree || node.expanded)"
          :anchor="anchors.get(node.entry.key)"
          :side="
            !tree &&
            (!navigation ||
              parentKey !== undefined ||
              presentation !== 'horizontal')
          "
          :navigation="navigation"
          :presentation="presentation"
          @close="$emit('expand', node.entry.key, false)"
        >
          <EntryBranch
            :id="`${id}-sub-${index}`"
            :entries="node.children ?? []"
            :status="node.status"
            :label="node.entry.label"
            :navigation="navigation"
            :presentation="presentation"
            :parent-key="node.entry.key"
            @close="$emit('close')"
            @activate="$emit('activate', $event)"
            @expand="(key, open) => $emit('expand', key, open)"
            @retry="$emit('retry', $event)"
          >
            <template #entry="scope">
              <slot
                name="entry"
                v-bind="scope"
              />
            </template>
            <template #icon="scope">
              <slot
                name="icon"
                v-bind="scope"
              />
            </template>
          </EntryBranch>
        </component>
      </template>
    </li>
    <li
      v-if="status?.message"
      :role="navigation ? undefined : 'none'"
      class="menu-text"
    >
      <span role="status">{{ status.message }}</span>
      <button
        v-if="status.failed"
        type="button"
        class="bootstrap-menu-retry bootstrap-control-focus btn-text theme-primary"
        :role="navigation ? undefined : 'menuitem'"
        :tabindex="navigation ? undefined : -1"
        @click="$emit('retry', parentKey)"
      >
        {{ status.retryLabel }}
      </button>
    </li>
  </ul>
</template>
