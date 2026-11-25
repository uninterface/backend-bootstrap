<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiUploadRegionView,
    type UiUploadRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import Preview from './UiFilePreview.vue'
  import Progress from './UiUploadProgress.vue'

  import UploadIcon from './icons/upload.vue'
  import RemoveIcon from './icons/delete.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiUploadRegionViewProps>()
  const {
    root,
    input,
    dragging,
    labelled,
    choose,
    changed,
    dragover,
    dragleave,
    drop,
    focus,
  } = useUiUploadRegionView(props)
  defineExpose({ focus })
</script>
<template>
  <div
    ref="root"
    v-bind="$attrs"
    role="group"
    :aria-label="label || chooseLabel"
    :aria-busy="busy || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-describedby="labelled['aria-describedby']"
    :tabindex="binding.disabled ? undefined : -1"
    data-ui-upload-region
    :data-upload-phase="phase"
    :data-upload-error="!!issue || undefined"
    :data-upload-recovery="!!issue || !!progress?.canRetry || undefined"
    class="form-control bootstrap-control-focus bootstrap-upload-region"
    :data-extent="extent"
    :style="
      allocatedHeight === undefined
        ? undefined
        : { blockSize: allocatedHeight + 'px' }
    "
    :data-drop-ready="canAcquire || undefined"
    :data-dragging="(dragging && canAcquire) || undefined"
    :data-invalid="binding.invalid || !!issue || undefined"
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
  >
    <span
      v-if="requiredLabel"
      :id="binding.id + '-upload-required'"
      class="upload-required-description"
    >
      {{ requiredLabel }}
    </span>
    <input
      ref="input"
      type="file"
      hidden
      tabindex="-1"
      aria-hidden="true"
      :accept="accept"
      :capture="capture"
      :disabled="!canAcquire"
      @change="changed"
    />
    <button
      v-if="phase === 'ready'"
      v-bind="labelled"
      type="button"
      class="btn-solid btn-icon theme-secondary"
      data-upload-choose
      :title="chooseLabel"
      :disabled="!canAcquire"
      @click="choose"
    >
      <UploadIcon
        aria-hidden="true"
        class="bootstrap-upload-choose-icon"
      />
    </button>
    <span
      v-if="
        fileName &&
        !preview &&
        !(
          progress?.fileName &&
          (progress.active || progress.issue || progress.canRetry)
        )
      "
      data-ui-file-name
      :title="fileName ?? undefined"
      class="bootstrap-upload-name"
    >
      {{ fileName }}
    </span>
    <div
      v-if="!progress?.issue"
      :id="binding.id + '-upload-issue'"
      role="status"
      class="bootstrap-upload-feedback"
      :title="issue ?? undefined"
    >
      {{ issue }}
    </div>
    <Progress
      v-if="progress"
      v-bind="progress"
    />
    <div
      v-if="preview"
      data-upload-preview
      class="bootstrap-upload-preview"
    >
      <Preview
        v-bind="preview"
        :presentation="issue ? 'row' : preview.presentation"
      />
    </div>
    <div
      v-if="actions.length"
      class="bootstrap-upload-actions"
    >
      <button
        v-for="action in actions"
        :key="action.name"
        type="button"
        class="btn"
        :class="action.name === 'remove' ? 'btn-link' : 'btn-secondary'"
        :data-upload-action="action.name"
        :aria-label="
          action.accessibleLabel ??
          (action.name === 'remove' ? action.label : undefined)
        "
        :title="action.name === 'remove' ? action.label : undefined"
        :disabled="action.disabled"
        @click="action.invoke"
      >
        <RemoveIcon
          v-if="action.name === 'remove'"
          aria-hidden="true"
          class="upload-remove-icon"
        />
        <template v-if="action.name !== 'remove'">{{ action.label }}</template>
      </button>
    </div>
  </div>
</template>
