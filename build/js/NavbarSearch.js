import { delegate, getConfig, getInstance, setInstance } from './Native'

const SELECTOR_TOGGLE_BUTTON = '[data-widget="navbar-search"]'
const SELECTOR_SEARCH_INPUT = '.form-control'
const CLASS_NAME_OPEN = 'navbar-search-open'

const Default = {
  resetOnClose: true,
  target: '.navbar-search-block'
}

class NavbarSearch {
  constructor(element, options = {}) {
    this._element = element
    this._config = getConfig(element, Default, options)
    this._target = document.querySelector(this._config.target)
    setInstance(NavbarSearch, element, this)
  }

  open() {
    if (!this._target) {
      return
    }

    this._target.style.display = 'flex'
    requestAnimationFrame(() => this._target.classList.add(CLASS_NAME_OPEN))
    this._target.querySelector(SELECTOR_SEARCH_INPUT)?.focus()
  }

  close() {
    if (!this._target) {
      return
    }

    this._target.classList.remove(CLASS_NAME_OPEN)
    this._target.style.display = 'none'
    if (this._config.resetOnClose) {
      const input = this._target.querySelector(SELECTOR_SEARCH_INPUT)
      if (input) {
        input.value = ''
      }
    }
  }

  toggle() {
    if (this._target?.classList.contains(CLASS_NAME_OPEN)) {
      this.close()
    } else {
      this.open()
    }
  }

  static getInstance(element) {
    return getInstance(NavbarSearch, element)
  }

  static getOrCreateInstance(element, options = {}) {
    return NavbarSearch.getInstance(element) ?? new NavbarSearch(element, options)
  }
}

delegate(document, 'click', SELECTOR_TOGGLE_BUTTON, (event, element) => {
  event.preventDefault()
  NavbarSearch.getOrCreateInstance(element).toggle()
})

export default NavbarSearch
