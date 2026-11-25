<script setup lang="ts">
  import { ref } from 'vue'
  import {
    createUiDrawerControl,
    createUiEntryControl,
    createUiFieldControl,
    createUiFormControl,
    createUiModalControl,
    createUiPopoverControl,
    createUiTabsControl,
    createUiUploadController,
    createUiUploadRegionControl,
    UiButton,
    UiCheckbox,
    UiDrawer,
    UiField,
    UiFileInput,
    UiForm,
    UiLayout,
    UiMenu,
    UiModal,
    UiPopover,
    UiTab,
    UiTabPanel,
    UiTabs,
    UiTextInput,
    UiUploadRegion,
    type UiFileDescriptor,
  } from '@uninterface/uninterface'

  const scenario = new URLSearchParams(location.search).get('scenario')
  const commands = createUiEntryControl([
    {
      key: 'refresh',
      label: 'Refresh',
      description:
        'Reload the record and display the latest available information.',
      shortcut: 'Alt+Shift+R',
      icon: { name: 'info' },
    },
    { key: 'duplicate', label: 'Duplicate this record' },
  ])
  const drawer = createUiDrawerControl<void>()
  const panel = ref(false)
  const popover = createUiPopoverControl<void>()
  const notes = createUiFieldControl('')
  const editor = ref<InstanceType<typeof UiTextInput>>()
  const information = createUiModalControl<void>()
  const enabled = createUiFieldControl(true)
  const form = createUiFormControl({
    name: createUiFieldControl('Customer'),
    enabled,
    notes: createUiFieldControl(''),
  })
  // Keep the save pending while measuring the disabled label.
  const saveRecord = () => new Promise<void>(() => {})
  const tabs = createUiTabsControl({ selectedKey: 'details' })
  const vertical = ref(false)
  const attachment = createUiFieldControl<UiFileDescriptor<File> | null>(null)
  const attachments = createUiFormControl(
    { attachment },
    { acceptOnSave: true },
  )
  const uploaded = createUiFieldControl<UiFileDescriptor<File> | null>(null)
  const uploads = createUiFormControl({ uploaded })
  const transport = createUiUploadController<File>({
    transport: async (file) => file,
  })
  const upload = createUiUploadRegionControl({
    uploadController: transport,
    destination: { field: uploaded },
  })
  const saveAttachment = async () => {}
</script>

<template>
  <UiMenu
    v-if="scenario === 'menu'"
    :control="commands"
    mode="popup"
    aria-label="Record actions"
  >
    <template #host="{ contextTrigger }">
      <div
        v-bind="contextTrigger"
        role="group"
        aria-label="Sample record: Alex Morgan"
        style="padding: 3rem"
      >
        Alex Morgan
      </div>
    </template>
  </UiMenu>
  <UiLayout
    v-else-if="scenario === 'overlays'"
    direction="vertical"
  >
    <UiDrawer
      mode="modal"
      :control="drawer"
      title="Edit note"
    >
      <template #host="{ buttonTrigger }">
        <UiButton
          v-bind="buttonTrigger"
          data-testid="open-modal-drawer"
          @click="drawer.run()"
        >
          Edit note
        </UiButton>
      </template>
      <p>Modal drawer content</p>
      <template #actions="{ session }">
        <UiButton @click="session.cancel()">Cancel</UiButton>
      </template>
    </UiDrawer>
    <UiDrawer
      v-model:expanded="panel"
      mode="panel"
      title="Scratchpad"
      edge="start"
    >
      <template #host="{ buttonTrigger }">
        <UiButton
          v-bind="buttonTrigger"
          data-testid="toggle-panel-drawer"
        >
          Scratchpad
        </UiButton>
      </template>
      <p>Retained drawer content</p>
    </UiDrawer>
    <UiPopover
      :control="popover"
      mode="modal"
      title="Edit note"
    >
      <template #host="{ buttonTrigger }">
        <UiButton
          v-bind="buttonTrigger"
          data-testid="open-popover"
          @click="popover.run({ opened: () => void editor?.focus() })"
        >
          Quick edit
        </UiButton>
      </template>
      <UiField
        :field="notes"
        label="Notes"
      >
        <UiTextInput
          ref="editor"
          multiline
        />
      </UiField>
      <template #actions="{ session }">
        <UiButton @click="session.complete()">Save note</UiButton>
        <UiButton @click="session.cancel()">Cancel</UiButton>
      </template>
    </UiPopover>
  </UiLayout>
  <template v-else-if="scenario === 'modal'">
    <UiButton @click="information.run()">Read long content</UiButton>
    <UiModal
      :control="information"
      title="Read long content"
    >
      <p
        v-for="index in 30"
        :key="index"
      >
        {{ index }}. Read the delivery instructions before completing the
        action.
      </p>
      <template #actions="{ session }">
        <UiButton @click="session.complete()">Done</UiButton>
      </template>
    </UiModal>
  </template>
  <UiForm
    v-else-if="scenario === 'checkbox'"
    :control="form"
    :save="saveRecord"
    label="Record editor"
  >
    <UiField
      :field="form.fields.name"
      label="Name"
    >
      <UiTextInput />
    </UiField>
    <UiField
      :field="enabled"
      label="Enabled"
      help="An unchecked record is still saved, with Enabled set to false."
    >
      <UiCheckbox />
    </UiField>
    <UiField
      :field="form.fields.notes"
      label="Notes"
    >
      <UiTextInput />
    </UiField>
    <UiButton :binding="form.bindings.submitButton">Save record</UiButton>
  </UiForm>
  <template v-else-if="scenario === 'tabs'">
    <label>
      <input
        v-model="vertical"
        type="checkbox"
      />
      Vertical tab bar
    </label>
    <div style="height: 22rem">
      <UiLayout
        height="full"
        :direction="vertical ? 'horizontal' : 'vertical'"
        :division="['content', 1]"
      >
        <UiTabs
          :binding="tabs.bindings.tabs"
          aria-label="Record"
          :orientation="vertical ? 'vertical' : 'horizontal'"
        >
          <UiTab value="details">Details</UiTab>
          <UiTab value="notes">Notes</UiTab>
          <UiTab
            value="history"
            disabled
          >
            History
          </UiTab>
        </UiTabs>
        <div style="height: 100%; min-height: 0">
          <UiTabPanel :binding="tabs.bindings.panel('details')">
            <p>Record details</p>
          </UiTabPanel>
          <UiTabPanel :binding="tabs.bindings.panel('notes')">
            <p>Notes</p>
          </UiTabPanel>
        </div>
      </UiLayout>
    </div>
  </template>
  <template v-else-if="scenario === 'files'">
    <UiForm
      :control="attachments"
      :save="saveAttachment"
      label="File input"
      data-file-example="input"
    >
      <UiField
        :field="attachment"
        label="Local attachment"
      >
        <UiFileInput />
      </UiField>
      <UiButton :binding="attachments.bindings.submitButton">
        Keep attachment
      </UiButton>
      <UiButton :binding="attachments.bindings.resetButton">
        Reset changes
      </UiButton>
    </UiForm>
    <UiForm
      :control="uploads"
      :save="saveAttachment"
      label="Upload region"
      data-file-example="region"
    >
      <UiField
        :field="uploaded"
        label="Local attachment"
      >
        <UiUploadRegion :binding="upload.bindings.region" />
      </UiField>
    </UiForm>
  </template>
</template>
