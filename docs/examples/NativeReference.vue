<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import Menu from 'bootstrap/js/dist/menu.js'
  const nativeModal = ref<HTMLDialogElement>()
  const props = defineProps<{
    invalid: boolean
    loading: boolean
    disabled: boolean
    sourceState: string
  }>()
  const status = computed(
    () =>
      ({
        idle: 'Entries not loaded.',
        loading: 'Loading entries…',
        error: 'Entries could not be loaded.',
        empty: 'No entries available.',
      })[props.sourceState],
  )
  const trigger = ref<HTMLElement>()
  const navigation = ref<HTMLElement>()
  let menu: Menu
  let nav: Menu
  onMounted(() => {
    menu = new Menu(trigger.value)
    nav = new Menu(navigation.value)
  })
  onBeforeUnmount(() => {
    menu?.dispose()
    nav?.dispose()
  })
</script>
<template>
  <div
    class="accordion"
    data-native-collapsible
  >
    <details class="accordion-item">
      <summary class="accordion-header">
        Additional information
        <svg
          class="accordion-icon"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
          />
        </svg>
      </summary>
      <div class="accordion-body"><p>Retained detail content.</p></div>
    </details>
  </div>
  <button
    class="btn btn-solid theme-secondary"
    @click="nativeModal?.showModal()"
  >
    Open native modal
  </button>
  <dialog
    ref="nativeModal"
    class="dialog dialog-scrollable"
    aria-labelledby="native-modal-title"
  >
    <header class="dialog-header">
      <h1
        id="native-modal-title"
        class="dialog-title"
      >
        Modal presentation
      </h1>
      <button
        class="btn-close"
        aria-label="Close"
        @click="nativeModal?.close()"
      ></button>
    </header>
    <div class="dialog-body">
      <p>Review the operation before continuing.</p>
    </div>
    <footer class="dialog-footer">
      <button
        class="btn btn-solid theme-secondary"
        @click="nativeModal?.close()"
      >
        Cancel
      </button>
      <button
        class="btn btn-solid theme-primary"
        @click="nativeModal?.close()"
      >
        OK
      </button>
    </footer>
  </dialog>
  <nav
    aria-label="Native destinations"
    class="navbar"
  >
    <div class="navbar-nav flex-row">
      <button class="nav-link active">Editor</button>
      <div>
        <button
          ref="navigation"
          class="nav-link"
          data-bs-toggle="menu"
        >
          Examples
        </button>
        <div class="menu">
          <button class="menu-item">Buttons</button>
          <div class="submenu">
            <button class="menu-item">More</button>
            <div class="menu"><button class="menu-item">Forms</button></div>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <form
    class="vstack gap-7"
    @submit.prevent
  >
    <div>
      <label
        class="form-label"
        for="native-name"
      >
        Name
      </label>
      <input
        id="native-name"
        class="form-control"
        :class="{ 'is-invalid': invalid }"
        value="Ada"
        :disabled="disabled"
      />
      <div
        v-if="invalid"
        class="invalid-feedback"
      >
        Enter a name.
      </div>
      <div
        v-else
        class="form-text"
      >
        Use a recognizable name.
      </div>
    </div>
    <div>
      <label
        class="form-label"
        for="native-location"
      >
        Location
      </label>
      <select
        id="native-location"
        class="form-control"
      >
        <option
          :hidden="sourceState !== 'ready'"
          selected
        >
          Shanghai
        </option>
        <option
          v-if="status"
          disabled
        >
          {{ status }}
        </option>
      </select>
    </div>
    <div class="form-field">
      <input
        id="native-active"
        type="checkbox"
        class="check"
        checked
      />
      <div class="form-field-content">
        <label for="native-active">Active</label>
      </div>
    </div>
    <div class="hstack gap-3">
      <button
        class="btn-solid theme-primary"
        :disabled="disabled || loading"
      >
        <span
          v-if="loading"
          class="spinner-border spinner-sm"
          aria-hidden="true"
        ></span>
        Save
      </button>
      <button
        type="button"
        class="btn-solid theme-secondary"
      >
        Reset
      </button>
      <button
        type="button"
        class="btn-outline theme-primary"
      >
        Outline
      </button>
    </div>
  </form>
  <div>
    <button
      ref="trigger"
      type="button"
      class="btn-solid theme-secondary"
      data-bs-toggle="menu"
    >
      Commands
    </button>
    <div
      class="menu"
      role="menu"
    >
      <button
        class="menu-item"
        role="menuitem"
      >
        Refresh
      </button>
      <div class="submenu">
        <button
          class="menu-item"
          role="menuitem"
        >
          More
        </button>
        <div
          class="menu"
          role="menu"
        >
          <button
            class="menu-item"
            role="menuitem"
          >
            Inspect
          </button>
          <button
            class="menu-item disabled"
            role="menuitem"
            disabled
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
