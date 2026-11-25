import '@uninterface/backend/font.css'
import '@uninterface/uninterface/style.css'
import type { UiNavMenuPresentation } from '@uninterface/uninterface'
import { mountTravel } from './travel-navigation'

const params = new URLSearchParams(location.search)
document.documentElement.dir = params.get('dir') === 'rtl' ? 'rtl' : 'ltr'
const mode = params.get('mode') ?? 'horizontal'
void mountTravel(mode as UiNavMenuPresentation).then(({ host }) => {
  const outside = document.createElement('button')
  outside.type = 'button'
  outside.textContent = 'Outside navigation'
  host.after(outside)
})
