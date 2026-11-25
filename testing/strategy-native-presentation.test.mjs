import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createUiDomTest } from '@uninterface/testing/dom'
import {
  withStrategies,
  settleUntil,
} from '../../../tests/strategy-dom-fixture.mjs'
import { build } from './fixture-build.mjs'
import { uiDomTestAdapter } from './dom.mjs'
test('strategies retain native sizing, labels, annotations and feedback', () =>
  withStrategies(build, async (example, window) => {
    const ui = createUiDomTest(uiDomTestAdapter)
    const target = example.host.querySelector('[data-strategy-target="text"]')
    const input = target.matches('input')
      ? target
      : target.querySelector('input')
    input.focus()
    const button = example.host.querySelector('[data-strategy-target="button"]')
    {
      assert.ok(input.classList.contains('form-control-sm'))
      assert.ok(button.classList.contains('btn-sm'))
    }
    const backendPrefix = 'bootstrap'
    const originalLabels = example.state.labels
    for (const labels of [originalLabels, undefined]) {
      example.state.labels = labels
      for (const mode of ['prefix', 'suffix', 'no', 'yes']) {
        example.state.requiredAnnotations = mode
        await example.tick()
        for (const controlName of [
          'text',
          'form-editor',
          'checkbox',
          'switch',
          'select',
        ]) {
          const control = example.host.querySelector(
            `[data-strategy-target="${controlName}"]`,
          )
          const field = control.closest(`.${backendPrefix}-field`)
          assert.ok(field, `${controlName} has a field`)
          const markers = field.querySelectorAll(`.${backendPrefix}-required`)
          if (mode === 'no') {
            assert.equal(
              markers.length,
              0,
              `${controlName}: no visible required annotation`,
            )
          } else {
            assert.equal(
              markers.length,
              1,
              `${controlName}: one annotated label or control`,
            )
            assert.equal(
              markers[0].classList.contains(`${backendPrefix}-required-prefix`),
              mode === 'prefix',
            )
          }
        }
        const group = example.host.querySelector('[data-strategy-group]')
        assert.equal(
          group.querySelector(`.${backendPrefix}-required`),
          null,
          'query barrier preserves local no annotation',
        )
      }
    }
    example.state.blockRequiredGroup = false
    const groupField = example.host.querySelector('[data-strategy-group]')
    assert.ok(
      ui.fieldGroup(groupField).label?.textContent.includes('Required group'),
    )
    assert.ok(ui.fieldGroup(groupField).controlArea)
    for (const mode of ['prefix', 'suffix', 'yes', 'no']) {
      example.state.requiredAnnotations = mode
      await example.tick()
      const marker = groupField.querySelector(`.${backendPrefix}-required`)
      assert.equal(
        Boolean(marker),
        mode !== 'no',
        'group annotation follows its own strategy query',
      )
      if (marker) {
        assert.equal(
          marker.classList.contains(`${backendPrefix}-required-prefix`),
          mode === 'prefix',
        )
      }
      const requiredDescription = groupField.querySelector(
        `[id$="-required"], .plain-strategy-hidden`,
      )
      if (mode === 'no')
        assert.ok(
          requiredDescription,
          'group retains semantic required description',
        )
      const optionalField = example.host
        .querySelector('[data-strategy-target="blocked-editor"]')
        .closest(`.${backendPrefix}-field`)
      assert.equal(
        optionalField.querySelector(`.${backendPrefix}-required`),
        null,
        'optional field receives no annotation',
      )
    }
    example.state.blockRequiredGroup = true
    example.state.labels = originalLabels
    example.state.requiredAnnotations = 'yes'
    await example.tick()
    for (const level of [-2, -1, 0, 1, 2]) {
      example.state.size = level
      await example.tick()
      {
        assert.equal(input.classList.contains('form-control-sm'), level < 0)
        assert.equal(input.classList.contains('form-control-lg'), level > 0)
        assert.equal(button.classList.contains('btn-xs'), level === -2)
        assert.equal(button.classList.contains('btn-lg'), level > 0)
      }
      {
        assert.equal(
          Boolean(input.closest('.bootstrap-field-small')),
          level < 0,
        )
        assert.equal(
          Boolean(input.closest('.bootstrap-field-large')),
          level > 0,
        )
        const label = input
          .closest('.bootstrap-field')
          .querySelector('.form-label')
        assert.equal(label.classList.contains('col-form-label-sm'), level < 0)
        assert.equal(label.classList.contains('col-form-label-lg'), level > 0)
      }
    }
    example.state.size = -1
    for (const limit of ['fieldOnly', 'sizeDepth']) {
      example.state[limit] = limit === 'fieldOnly' ? true : 1
      await example.tick()
      {
        assert.ok(input.closest('.bootstrap-field-small'))
        assert.equal(input.classList.contains('form-control-sm'), false)
      }
      example.state[limit] = limit === 'fieldOnly' ? false : undefined
    }
    await example.tick()
    for (const [name, control] of [
      ['text', example.text],
      ['checkbox', example.checkbox],
      ['select', example.selected],
    ]) {
      const surface = example.host.querySelector(
        `[data-strategy-target="${name}"]`,
      )
      const editor = surface.matches(
        'input,select,[role=checkbox],[role=combobox]',
      )
        ? surface
        : surface.querySelector(
            'input:not([type=hidden]),select,[role=checkbox],[role=combobox]',
          )
      control.state.issue = `Failure for ${name}`
      for (const mode of ['none', 'show-tooltip']) {
        example.state.failure = mode
        await example.tick()
        await settleUntil(
          example.tick,
          () =>
            mode === 'none'
              ? !ui.fieldFeedback(editor).message
              : ui.fieldFeedback(editor).tooltip,
          `native validation for ${name}/${mode}`,
        )
        const { message } = ui.fieldFeedback(editor)
        if (mode === 'none') {
          assert.ok(
            editor.closest('.is-invalid'),
            `${name}: none retains native visual invalidity`,
          )
        } else {
          {
            assert.ok(
              message.classList.contains('bootstrap-jumper-description'),
            )
            assert.ok(message.closest('.bootstrap-field'))
          }
        }
      }
      control.state.issue = null
      await control.validate()
      await example.tick()
    }
    for (const position of ['above', 'beside', 'beside-far', 'beside-near']) {
      example.state.labels = position
      await example.tick()
      {
        const prefix = 'bootstrap'
        assert.equal(
          Boolean(input.closest(`.${prefix}-labels-beside`)),
          position.startsWith('beside'),
          'beside requests resolve to a concrete beside alignment',
        )
      }
    }
    const checkableFields = [
      ...example.host.querySelectorAll('.bootstrap-field'),
    ].filter((field) =>
      ['Strategy checkbox', 'Strategy switch'].some((label) =>
        field.textContent.includes(label),
      ),
    )
    for (const position of [
      undefined,
      'show',
      'above',
      'beside',
      'beside-far',
      'beside-near',
      'floating',
    ]) {
      example.state.labels = position
      await example.tick()
      for (const field of checkableFields) {
        {
          assert.ok(field.querySelector(':scope > .form-field-content > label'))
          assert.ok(!field.classList.contains('form-floating'))
          assert.equal(field.querySelector(':scope > .form-label'), null)
        }
      }
    }
    for (const position of ['show', 'floating', 'hidden', undefined]) {
      example.state.labels = position
      await example.tick()
      for (const name of ['text', 'select', 'checkbox', 'switch']) {
        const surface = example.host.querySelector(
          `[data-strategy-target="${name}"]`,
        )
        const editor = surface.matches(
          'input,select,[role=checkbox],[role=switch],[role=combobox]',
        )
          ? surface
          : surface.querySelector(
              'input:not([type=hidden]),select,[role=checkbox],[role=switch],[role=combobox]',
            )
        if (position === 'hidden' && !['checkbox', 'switch'].includes(name)) {
          const field = editor.closest('.bootstrap-field')
          assert.ok(
            field.querySelector('.visually-hidden'),
            `${name}: hidden retains the native visually hidden label`,
          )
        }
      }
      {
        const field = input.closest('.bootstrap-field')
        assert.equal(
          field.classList.contains('form-floating'),
          position === 'floating',
        )
        if (position === 'floating') {
          const label = field.querySelector(':scope > label')
          assert.equal(label.htmlFor, input.id)
          assert.ok(
            label.nextElementSibling?.contains(input),
            'native Bootstrap 6 label precedes the input surface',
          )
          assert.equal(input.getAttribute('placeholder'), ' ')
          const select =
            example.host.querySelector(
              '[role=combobox][data-strategy-target="select"]',
            ) ??
            example.host.querySelector(
              '[data-strategy-target="select"] [role=combobox]',
            )
          assert.equal(
            select.closest('.form-floating').querySelector(':scope > label')
              .htmlFor,
            select.id,
          )
        }
      }
    }
  }))
