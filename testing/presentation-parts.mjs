export function cardParts(find) {
  return {
    header: find(':scope > .card-header'),
    body: find(':scope > .card-body'),
    footer: find(':scope > .card-footer'),
    topEnd: find(':scope > .bootstrap-card-top-end'),
  }
}

export const fieldSelectors = {
  root: '.bootstrap-field',
  surface: '.bootstrap-input-frame,.form-control',
  required: '.bootstrap-required',
  invalid: '.is-invalid',
}

export function fieldGroupParts(find, group) {
  return {
    label: find(':scope > .form-label'),
    controlArea: group,
  }
}

export function temporalPickerParts(find) {
  return {
    dateInput: find('input[type=date],input[type=datetime-local]'),
    timeInput: find('input[type=time],input[type=datetime-local]'),
    day(isoDate) {
      return find(
        '[data-vc-date="DATE"] button,button[data-vc-date="DATE"]'.replaceAll(
          'DATE',
          isoDate,
        ),
      )
    },
    timeSegment() {
      return find(':not(*)')
    },
  }
}

export const entryIconColumn = '.menu-item-icon'
