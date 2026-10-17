import { delegate, dispatch, getInstance, setInstance } from './Native'

const EVENT_TOGGLED = 'toggled.lte.directchat'
const SELECTOR_DATA_TOGGLE = '[data-widget="chat-pane-toggle"]'
const CLASS_NAME_DIRECT_CHAT_OPEN = 'direct-chat-contacts-open'

class DirectChat {
  constructor(element) {
    this._element = element
    setInstance(DirectChat, element, this)
  }

  toggle() {
    this._element.closest('.direct-chat')?.classList.toggle(CLASS_NAME_DIRECT_CHAT_OPEN)
    dispatch(this._element, EVENT_TOGGLED)
  }

  static getInstance(element) {
    return getInstance(DirectChat, element)
  }

  static getOrCreateInstance(element) {
    return DirectChat.getInstance(element) ?? new DirectChat(element)
  }
}

delegate(document, 'click', SELECTOR_DATA_TOGGLE, (event, element) => {
  event.preventDefault()
  DirectChat.getOrCreateInstance(element).toggle()
})

export default DirectChat
