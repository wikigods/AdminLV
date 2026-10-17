import { getConfig, getInstance, onReady, setInstance } from './Native'

const SELECTOR_DATA_TOGGLE = '[data-widget="todo-list"]'
const CLASS_NAME_TODO_LIST_DONE = 'done'

const Default = {
  onCheck(item) {
    return item
  },
  onUnCheck(item) {
    return item
  }
}

class TodoList {
  constructor(element, config = {}) {
    this._element = element
    this._config = getConfig(element, Default, config)
    this._onChange = event => {
      if (event.target.matches('input[type="checkbox"]')) {
        this.toggle(event.target)
      }
    }

    this._element.addEventListener('change', this._onChange)
    setInstance(TodoList, element, this)
    this.init()
  }

  init() {
    this._element.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.closest('li')?.classList.toggle(CLASS_NAME_TODO_LIST_DONE, input.checked)
    })
  }

  toggle(item) {
    const isChecked = item.checked
    item.closest('li')?.classList.toggle(CLASS_NAME_TODO_LIST_DONE, isChecked)
    if (isChecked) {
      this.check(item)
    } else {
      this.unCheck(item)
    }
  }

  check(item) {
    this._config.onCheck(item)
  }

  unCheck(item) {
    this._config.onUnCheck(item)
  }

  static getInstance(element) {
    return getInstance(TodoList, element)
  }

  static getOrCreateInstance(element, config = {}) {
    return TodoList.getInstance(element) ?? new TodoList(element, config)
  }
}

onReady(() => {
  document.querySelectorAll(SELECTOR_DATA_TOGGLE).forEach(element => TodoList.getOrCreateInstance(element))
})

export default TodoList
