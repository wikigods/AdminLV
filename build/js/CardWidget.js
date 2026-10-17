/**
 * AdminLV CardWidget.js
 * Native JavaScript implementation
 */

/* eslint-disable max-statements-per-line */
import { dispatch, getConfig, getOrCreateInstance, setInstance, delegate } from './Native'

const EVENT_KEY = '.lte.cardwidget'
const EVENT_EXPANDED = `expanded${EVENT_KEY}`
const EVENT_COLLAPSED = `collapsed${EVENT_KEY}`
const EVENT_MAXIMIZED = `maximized${EVENT_KEY}`
const EVENT_MINIMIZED = `minimized${EVENT_KEY}`
const EVENT_REMOVED = `removed${EVENT_KEY}`
const CARD = '.card'
const COLLAPSED = 'collapsed-card'
const MAXIMIZED = 'maximized-card'
const DEFAULT = {
  animationSpeed: 300,
  collapseTrigger: '[data-card-widget="collapse"]',
  removeTrigger: '[data-card-widget="remove"]',
  maximizeTrigger: '[data-card-widget="maximize"]',
  collapseIcon: 'fa-minus',
  expandIcon: 'fa-plus',
  maximizeIcon: 'fa-expand',
  minimizeIcon: 'fa-compress'
}

class CardWidget {
  constructor(element, config = {}) {
    this._element = element
    this._config = getConfig(element, DEFAULT, config)
    if (!Number.isFinite(Number(this._config.animationSpeed))) {
      this._config.animationSpeed = this._config.animationSpeed === 'fast' ? 200 : (this._config.animationSpeed === 'slow' ? 600 : 400)
    } else {
      this._config.animationSpeed = Number(this._config.animationSpeed)
    }

    this._card = element.matches(CARD) ? element : element.closest(CARD)
    setInstance(CardWidget, element, this)
  }

  collapse() {
    if (!this._card) {
      return
    }

    this._card.classList.add('collapsing-card')
    this._card.querySelectorAll(':scope > .card-body, :scope > .card-footer').forEach(child => {
      child.style.transition = `height ${this._config.animationSpeed}ms ease`
      child.style.height = `${child.getBoundingClientRect().height}px`
      requestAnimationFrame(() => {
        child.style.height = '0px'; child.style.overflow = 'hidden'
      })
      window.setTimeout(() => {
        child.hidden = true; child.style.removeProperty('height'); child.style.removeProperty('overflow'); child.style.removeProperty('transition')
      }, this._config.animationSpeed)
    })
    window.setTimeout(() => {
      this._card.classList.add(COLLAPSED)
      this._card.classList.remove('collapsing-card')
    }, this._config.animationSpeed)
    this._updateIcon(this._config.collapseTrigger, this._config.collapseIcon, this._config.expandIcon)
    dispatch(this._element, EVENT_COLLAPSED, { card: this._card })
  }

  expand() {
    if (!this._card) {
      return
    }

    this._card.classList.add('expanding-card')
    this._card.classList.remove(COLLAPSED)
    this._card.querySelectorAll(':scope > .card-body, :scope > .card-footer').forEach(child => {
      child.hidden = false
      child.style.display = ''
      const height = child.scrollHeight
      child.style.height = '0px'; child.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        child.style.transition = `height ${this._config.animationSpeed}ms ease`; child.style.height = `${height}px`
      })
      window.setTimeout(() => {
        child.style.removeProperty('height'); child.style.removeProperty('overflow'); child.style.removeProperty('transition')
      }, this._config.animationSpeed)
    })
    this._card.classList.remove('expanding-card')
    this._updateIcon(this._config.collapseTrigger, this._config.expandIcon, this._config.collapseIcon)
    dispatch(this._element, EVENT_EXPANDED, { card: this._card })
  }

  remove() {
    const card = this._card
    if (!card) {
      return
    }

    card.style.transition = `height ${this._config.animationSpeed}ms ease`
    card.style.height = `${card.getBoundingClientRect().height}px`
    requestAnimationFrame(() => {
      card.style.height = '0px'; card.style.overflow = 'hidden'
    })
    dispatch(this._element, EVENT_REMOVED, { card })
    window.setTimeout(() => card.remove(), this._config.animationSpeed)
  }

  toggle() {
    if (this._card?.classList.contains(COLLAPSED)) {
      this.expand()
    } else {
      this.collapse()
    }
  }

  maximize() {
    if (!this._card || this._card.classList.contains(MAXIMIZED)) {
      return
    }

    const card = this._card
    const rect = card.getBoundingClientRect()
    card.style.height = `${rect.height}px`; card.style.width = `${rect.width}px`; card.style.position = 'fixed'
    card.style.transition = 'all .15s'
    window.setTimeout(() => {
      card.classList.add(MAXIMIZED); document.documentElement.classList.add(MAXIMIZED)
      if (card.classList.contains(COLLAPSED)) {
        card.classList.add('was-collapsed')
      }

      card.style.removeProperty('position')
      this._updateIcon(this._config.maximizeTrigger, this._config.maximizeIcon, this._config.minimizeIcon)
    }, 150)
    dispatch(this._element, EVENT_MAXIMIZED, { card })
  }

  minimize() {
    if (!this._card) {
      return
    }

    const card = this._card
    card.classList.remove(MAXIMIZED); document.documentElement.classList.remove(MAXIMIZED)
    card.style.height = 'inherit'; card.style.width = 'inherit'; card.style.removeProperty('transition')
    card.classList.remove('was-collapsed')
    this._updateIcon(this._config.maximizeTrigger, this._config.minimizeIcon, this._config.maximizeIcon)
    dispatch(this._element, EVENT_MINIMIZED, { card })
  }

  toggleMaximize() {
    if (this._card?.classList.contains(MAXIMIZED)) {
      this.minimize()
    } else {
      this.maximize()
    }
  }

  _updateIcon(trigger, from, to) {
    this._card?.querySelectorAll(`${trigger} .${from}`).forEach(icon => {
      icon.classList.remove(from); icon.classList.add(to)
    })
  }

  static getOrCreateInstance(element, config = {}) {
    return getOrCreateInstance(CardWidget, element, config)
  }

  static _interface(element, method) {
    const instance = CardWidget.getOrCreateInstance(element)
    if (method) {
      instance[method]()
    } else {
      setInstance(CardWidget, element, instance)
    }
  }
}

delegate(document, 'click', '[data-card-widget="collapse"], [data-card-widget="remove"], [data-card-widget="maximize"]', (event, trigger) => {
  event.preventDefault()
  const action = trigger.dataset.cardWidget === 'collapse' ? 'toggle' : (trigger.dataset.cardWidget === 'remove' ? 'remove' : 'toggleMaximize')
  CardWidget._interface(trigger, action)
})

export default CardWidget
