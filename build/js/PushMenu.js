/** AdminLTE PushMenu, implemented without jQuery. */
import { dispatch, getConfig, getOrCreateInstance, setInstance, delegate, onReady } from './Native'

const EVENT_KEY = '.lte.pushmenu'
const COLLAPSED = 'sidebar-collapse'
const OPEN = 'sidebar-open'
const OPENING = 'sidebar-is-opening'
const CLOSED = 'sidebar-closed'
const DEFAULT = { autoCollapseSize: 992, enableRemember: false, noTransitionAfterReload: true, animationSpeed: 300 }

class PushMenu {
  constructor(element, options = {}) {
    this._element = element
    this._options = getConfig(element, DEFAULT, options)
    setInstance(PushMenu, element, this)
    this._addOverlay()
    this._init()
  }

  expand() {
    const { body } = document
    if (this._options.autoCollapseSize && window.innerWidth <= this._options.autoCollapseSize) {
      body.classList.add(OPEN)
    }

    body.classList.add(OPENING)
    body.classList.remove(COLLAPSED, CLOSED)
    window.setTimeout(() => body.classList.remove(OPENING), 50)
    if (this._options.enableRemember) {
      localStorage.setItem(`remember${EVENT_KEY}`, OPEN)
    }

    dispatch(this._element, `shown${EVENT_KEY}`)
  }

  collapse() {
    const { body } = document
    if (this._options.autoCollapseSize && window.innerWidth <= this._options.autoCollapseSize) {
      body.classList.remove(OPEN)
      body.classList.add(CLOSED)
    }

    body.classList.add(COLLAPSED)
    if (this._options.enableRemember) {
      localStorage.setItem(`remember${EVENT_KEY}`, COLLAPSED)
    }

    dispatch(this._element, `collapsed${EVENT_KEY}`)
    window.setTimeout(() => dispatch(this._element, `collapsed-done${EVENT_KEY}`), this._options.animationSpeed)
  }

  toggle() {
    if (document.body.classList.contains(COLLAPSED)) {
      this.expand()
    } else {
      this.collapse()
    }
  }

  autoCollapse(resize = false) {
    if (!this._options.autoCollapseSize) {
      return
    }

    const { body } = document
    if (window.innerWidth <= this._options.autoCollapseSize) {
      if (!body.classList.contains(OPEN)) {
        this.collapse()
      }
    } else if (resize) {
      if (body.classList.contains(OPEN)) {
        body.classList.remove(OPEN)
      } else if (body.classList.contains(CLOSED)) {
        this.expand()
      }
    }
  }

  remember() {
    if (!this._options.enableRemember) {
      return
    }

    const { body } = document
    const state = localStorage.getItem(`remember${EVENT_KEY}`)
    if (state === COLLAPSED) {
      body.classList.add(COLLAPSED)
    } else {
      body.classList.remove(COLLAPSED)
    }

    if (this._options.noTransitionAfterReload) {
      body.classList.add('hold-transition')
      window.setTimeout(() => body.classList.remove('hold-transition'), 50)
    }
  }

  _init() {
    this.remember()
    this.autoCollapse()
    if (!this._resizeHandler) {
      this._resizeHandler = () => this.autoCollapse(true)
      window.addEventListener('resize', this._resizeHandler)
    }
  }

  _addOverlay() {
    if (document.querySelector('#sidebar-overlay')) {
      return
    }

    const wrapper = document.querySelector('.wrapper')
    if (!wrapper) {
      return
    }

    const overlay = document.createElement('div')
    overlay.id = 'sidebar-overlay'
    overlay.addEventListener('click', () => this.collapse())
    wrapper.append(overlay)
  }

  static getOrCreateInstance(element, config = {}) {
    return getOrCreateInstance(PushMenu, element, config)
  }

  static _interface(element, method) {
    const instance = PushMenu.getOrCreateInstance(element)
    if (method) {
      instance[method]()
    } else {
      setInstance(PushMenu, element, instance)
    }
  }
}

delegate(document, 'click', '[data-widget="pushmenu"]', (event, button) => {
  event.preventDefault()
  PushMenu._interface(button, 'toggle')
})
onReady(() => document.querySelectorAll('[data-widget="pushmenu"]').forEach(button => PushMenu._interface(button)))

export default PushMenu
