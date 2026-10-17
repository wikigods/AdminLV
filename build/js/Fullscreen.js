import { delegate, getInstance, getOrCreateInstance as _getOrCreateInstance, setInstance } from './Native'

const SELECTOR_DATA_WIDGET = '[data-widget="fullscreen"]'
const SELECTOR_ICON = `${SELECTOR_DATA_WIDGET} i`

const Default = {
  minimizeIcon: 'fa-minimize',
  maximizeIcon: 'fa-maximize'
}

class Fullscreen {
  constructor(element, options = {}) {
    this.element = element
    this.options = { ...Default, ...options }
    setInstance(Fullscreen, element, this)
  }

  toggle() {
    if (document.fullscreenElement) {
      return this.windowed()
    }

    return this.fullscreen()
  }

  toggleIcon() {
    const isFullscreen = Boolean(document.fullscreenElement)
    document.querySelectorAll(SELECTOR_ICON).forEach(icon => {
      icon.classList.toggle(this.options.maximizeIcon, !isFullscreen)
      icon.classList.toggle(this.options.minimizeIcon, isFullscreen)
    })
  }

  fullscreen() {
    return document.documentElement.requestFullscreen?.()
  }

  windowed() {
    return document.exitFullscreen?.()
  }

  static getInstance(element) {
    return getInstance(Fullscreen, element)
  }

  static getOrCreateInstance(element, options = {}) {
    return _getOrCreateInstance(Fullscreen, element, options)
  }
}

delegate(document, 'click', SELECTOR_DATA_WIDGET, (event, element) => {
  event.preventDefault()
  Fullscreen.getOrCreateInstance(element).toggle()
})

document.addEventListener('fullscreenchange', () => {
  document.querySelectorAll(SELECTOR_DATA_WIDGET).forEach(element => {
    Fullscreen.getOrCreateInstance(element).toggleIcon()
  })
})

export default Fullscreen
