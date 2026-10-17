/** AdminLTE Toasts, implemented without jQuery. */
/* eslint-disable max-statements-per-line */
import { dispatch } from './Native'

const DEFAULT = { position: 'topRight', fixed: true, autohide: false, autoremove: true, delay: 1000, fade: true, icon: null, image: null, imageAlt: null, imageHeight: '25px', title: null, subtitle: null, close: true, body: null, class: null }
const POSITIONS = {
  topRight: ['toastsContainerTopRight', 'toasts-top-right'], topLeft: ['toastsContainerTopLeft', 'toasts-top-left'],
  bottomRight: ['toastsContainerBottomRight', 'toasts-bottom-right'], bottomLeft: ['toastsContainerBottomLeft', 'toasts-bottom-left']
}

class Toasts {
  constructor(element = document.body, config = {}) {
    this._element = element; this._config = { ...DEFAULT, ...config }; this._prepareContainer(); dispatch(document.body, 'init.lte.toasts')
  }

  create() {
    const toast = document.createElement('div'); toast.className = `toast${this._config.class ? ` ${this._config.class}` : ''}`
    toast.setAttribute('role', 'alert'); toast.setAttribute('aria-live', 'assertive'); toast.setAttribute('aria-atomic', 'true')
    toast.dataset.autohide = String(this._config.autohide); toast.dataset.animation = String(this._config.fade)
    if (this._config.delay && this._config.delay !== 500) {
      toast.dataset.delay = String(this._config.delay)
    }

    const header = document.createElement('div'); header.className = 'toast-header'
    if (this._config.image != null) {
      const image = document.createElement('img'); image.className = 'rounded me-2'; image.src = this._config.image; image.alt = this._config.imageAlt || ''; if (this._config.imageHeight) {
        image.style.height = this._config.imageHeight
      }

      image.style.width = 'auto'; header.append(image)
    }

    if (this._config.icon) {
      const icon = document.createElement('i'); icon.className = `me-2 ${this._config.icon}`; header.append(icon)
    }

    if (this._config.title != null) {
      const title = document.createElement('strong'); title.className = 'me-auto'; title.innerHTML = this._config.title; header.append(title)
    }

    if (this._config.subtitle != null) {
      const subtitle = document.createElement('small'); subtitle.innerHTML = this._config.subtitle; header.append(subtitle)
    }

    if (this._config.close) {
      const close = document.createElement('button'); close.type = 'button'; close.dataset.bsDismiss = 'toast'; close.className = `btn-close ${this._config.title == null ? 'ms-auto' : 'ms-2'} mb-1`; close.setAttribute('aria-label', 'Close'); header.append(close)
    }

    toast.append(header)
    if (this._config.body != null) {
      const body = document.createElement('div'); body.className = 'toast-body'; body.innerHTML = this._config.body; toast.append(body)
    }

    const container = document.getElementById(POSITIONS[this._config.position]?.[0])
    if (!container) {
      return null
    }

    container.prepend(toast); dispatch(document.body, 'created.lte.toasts')
    if (!window.bootstrap?.Toast) {
      throw new Error('Bootstrap 5 Toast is required to display AdminLTE toasts.')
    }

    window.bootstrap.Toast.getOrCreateInstance(toast, { autohide: this._config.autohide, animation: this._config.fade, delay: this._config.delay }).show()
    if (this._config.autoremove) {
      toast.addEventListener('hidden.bs.toast', () => {
        toast.remove(); dispatch(document.body, 'removed.lte.toasts')
      }, { once: true })
    }

    return toast
  }

  _prepareContainer() {
    const position = POSITIONS[this._config.position] || POSITIONS.topRight
    let container = document.getElementById(position[0])
    if (!container) {
      container = document.createElement('div'); container.id = position[0]; container.className = position[1]; document.body.append(container)
    }

    container.classList.toggle('fixed', Boolean(this._config.fixed))
  }

  static create(config = {}) {
    return new Toasts(document.body, config).create()
  }
}

export default Toasts
