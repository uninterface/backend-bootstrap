import '@uninterface/backend/style.css'
import { h } from 'vue'
import {
  createUiListControl,
  UiTable,
  UiTableColumn,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

async function mountSortingTable() {
  const items = [
    { id: 'z', name: 'Zulu', amount: 2 },
    { id: 'a', name: 'Alpha', amount: 1 },
  ]
  const control = createUiListControl<
    (typeof items)[number],
    Record<string, never>,
    'name' | 'amount'
  >({
    itemKey: (item) => item.id,
    sorting: { mode: 'multiple', keys: ['name', 'amount'] },
    query: { filters: {}, sort: [] },
    source: () => ({ items, complete: true }),
  })
  const app = createUiApplication({
    render: () =>
      h(
        UiTable,
        { binding: control.bindings.list, ariaLabel: 'Sort records' },
        {
          default: () => [
            h(
              UiTableColumn,
              { columnKey: 'name', label: 'Name', sortBy: 'name' },
              {
                default: ({ item }: { item: (typeof items)[number] }) =>
                  item.name,
              },
            ),
            h(
              UiTableColumn,
              {
                columnKey: 'amount',
                label: 'Amount',
                sortBy: 'amount',
                spring: true,
              },
              {
                default: ({ item }: { item: (typeof items)[number] }) =>
                  String(item.amount),
              },
            ),
          ],
        },
      ),
  })
  await app.ui.ready
  await control.refresh()
  const host = document.body.appendChild(document.createElement('div'))
  host.style.width = '900px'
  app.mount(host)
}

void mountSortingTable()
