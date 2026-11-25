<script setup lang="ts">
  import { onScopeDispose, ref } from 'vue'
  import {
    UiButton,
    UiCheckbox,
    UiField,
    UiForm,
    UiMenu,
    UiNavbar,
    UiSegmentedSelect,
    UiSelect,
    UiStrategy,
    createUiEntryControl,
    createUiFieldControl,
    createUiFormControl,
    uiFieldLabels,
    UiTextInput,
  } from '@uninterface/uninterface'

  const scenario = new URLSearchParams(location.search).get('scenario')
  const choice = createUiFieldControl('one')
  const entries = createUiEntryControl([
    { key: 'one', label: 'First' },
    { key: 'two', label: 'Second' },
    { key: 'three', label: 'Third' },
  ])
  onScopeDispose(entries.dispose)
  const name = createUiFieldControl('Ada', undefined, [
    (value) => (value.trim() ? null : 'Enter a name.'),
  ])
  const reference = createUiFieldControl('')
  const category = createUiFieldControl('general')
  const categories = createUiEntryControl([
    { key: 'general', label: 'General' },
  ])
  const enabled = createUiFieldControl(false)
  const form = createUiFormControl({ name, reference, category, enabled })
  onScopeDispose(form.dispose)
  const lastCommand = ref('')
  const commands = createUiEntryControl(
    [
      { key: 'refresh', label: 'Refresh' },
      { kind: 'separator', key: 'before-actions' },
      {
        kind: 'group',
        key: 'actions',
        label: 'Actions',
        entries: [{ key: 'copy', label: 'Copy' }],
      },
      { kind: 'separator', key: 'after-actions' },
      {
        kind: 'submenu',
        key: 'more',
        label: 'More actions',
        children: [
          { key: 'archive', label: 'Archive' },
          { key: 'delete', label: 'Delete', disabled: true },
          {
            kind: 'submenu',
            key: 'organize',
            label: 'Organize',
            children: [{ key: 'tag', label: 'Add tag' }],
          },
        ],
      },
    ],
    {
      selection: [{ key: 'actions', mode: 'multiple', keys: ['copy'] }],
    },
  )
  onScopeDispose(commands.dispose)
</script>

<template>
  <main>
    <UiStrategy
      v-if="scenario === 'segmented-focus'"
      :use="uiFieldLabels('above')"
    >
      <UiNavbar aria-label="Field alignment">
        <template #actions>
          <UiField
            :field="choice"
            label="Selection"
          >
            <UiSelect :control="entries" />
          </UiField>
          <UiField
            :field="choice"
            label="Choices"
          >
            <UiSegmentedSelect :control="entries" />
          </UiField>
        </template>
      </UiNavbar>
    </UiStrategy>
    <UiForm
      v-else-if="scenario === 'fields'"
      :control="form"
      label="Field conformance"
      :save="async () => {}"
    >
      <UiField
        :field="name"
        label="Name"
        help="Use your full name."
        required
      >
        <UiTextInput />
      </UiField>
      <UiField
        :field="reference"
        label="Reference"
      >
        <UiTextInput />
      </UiField>
      <UiField
        :field="category"
        label="Category"
        required
      >
        <UiSelect :control="categories" />
      </UiField>
      <UiField
        :field="enabled"
        label="Enabled"
        help="Allow notifications."
      >
        <UiCheckbox />
      </UiField>
      <UiButton @click="name.validate()">Validate name</UiButton>
    </UiForm>
    <template v-else-if="scenario === 'commands'">
      <UiMenu
        :control="commands"
        mode="popup"
        aria-label="Commands"
        @activate="lastCommand = $event"
      >
        <template #host="{ buttonTrigger }">
          <UiButton v-bind="buttonTrigger">Open commands</UiButton>
        </template>
      </UiMenu>
      <output aria-label="Last command">{{ lastCommand }}</output>
    </template>
  </main>
</template>
