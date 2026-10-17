/** AdminLV ControlSidebar, implemented without jQuery. */
/* eslint-disable max-statements-per-line */
import { dispatch, getConfig, getOrCreateInstance, setInstance, delegate, onReady } from './Native'

const KEY = '.lte.controlsidebar'
const SELECTOR = '.control-sidebar'
const CLASS_OPEN = 'control-sidebar-open'
const CLASS_SLIDE = 'control-sidebar-slide-open'
const CLASS_ANIMATE = 'control-sidebar-animate'
const DEFAULT = { controlsidebarSlide: true, scrollbarTheme: 'os-theme-light', scrollbarAutoHide: 'l', target: SELECTOR, animationSpeed: 300 }

class ControlSidebar {
  constructor(element, config = {}) {
    this._element = element; this._config = getConfig(element, DEFAULT, config); setInstance(ControlSidebar, element, this); this._init()
  }

  collapse() {
    const { body } = document
    if (this._config.controlsidebarSlide) {
      document.documentElement.classList.add(CLASS_ANIMATE); body.classList.remove(CLASS_SLIDE)
      window.setTimeout(() => {
        document.querySelectorAll(SELECTOR).forEach(sidebar => {
          sidebar.style.display = 'none'
        }); document.documentElement.classList.remove(CLASS_ANIMATE)
      }, 300)
    } else {
      body.classList.remove(CLASS_OPEN)
    }

    dispatch(this._element, `collapsed${KEY}`)
    window.setTimeout(() => dispatch(this._element, `collapsed-done${KEY}`), this._config.animationSpeed)
  }

  show(toggle = false) {
    const { body } = document
    const target = document.querySelector(this._config.target)
    if (!target) {
      return
    }

    if (toggle) {
      document.querySelectorAll(SELECTOR).forEach(sidebar => {
        sidebar.style.display = 'none'
      })
    }

    if (this._config.controlsidebarSlide) {
      document.documentElement.classList.add(CLASS_ANIMATE); target.style.display = 'block'
      window.setTimeout(() => {
        body.classList.add(CLASS_SLIDE); window.setTimeout(() => document.documentElement.classList.remove(CLASS_ANIMATE), 300)
      }, 10)
    } else {
      target.style.display = 'block'
      body.classList.add(CLASS_OPEN)
    }

    this._fixHeight(); this._fixScrollHeight()
    dispatch(this._element, `expanded${KEY}`)
  }

  toggle() {
    const target = document.querySelector(this._config.target)
    const { body } = document
    const isOpen = body.classList.contains(CLASS_OPEN) || body.classList.contains(CLASS_SLIDE)
    if (!target || getComputedStyle(target).display === 'none' || !isOpen) {
      this.show(!isOpen)
    } else {
      this.collapse()
    }
  }

  _init() {
    const open = document.body.classList.contains(CLASS_OPEN) || document.body.classList.contains(CLASS_SLIDE)
    document.querySelectorAll(SELECTOR).forEach(sidebar => {
      if (open && sidebar.matches(this._config.target)) {
        sidebar.style.display = 'block'
      } else if (!open) {
        sidebar.style.display = 'none'
      }
    })
    this._fixHeight(); this._fixScrollHeight()
    if (!this._listeners) {
      this._listeners = true
      window.addEventListener('resize', () => {
        this._fixHeight(); this._fixScrollHeight()
      })
      window.addEventListener('scroll', () => {
        if (document.body.classList.contains(CLASS_OPEN) || document.body.classList.contains(CLASS_SLIDE)) {
          this._fixScrollHeight()
        }
      })
    }
  }

  _isNavbarFixed() {
    return ['layout-navbar-fixed', 'layout-sm-navbar-fixed', 'layout-md-navbar-fixed', 'layout-lg-navbar-fixed', 'layout-xl-navbar-fixed'].some(cls => document.body.classList.contains(cls))
  }

  _isFooterFixed() {
    return ['layout-footer-fixed', 'layout-sm-footer-fixed', 'layout-md-footer-fixed', 'layout-lg-footer-fixed', 'layout-xl-footer-fixed'].some(cls => document.body.classList.contains(cls))
  }

  _fixHeight() {
    const content = document.querySelector(`${this._config.target} .control-sidebar-content`)
    if (!content) {
      return
    }

    if (!document.body.classList.contains('layout-fixed')) {
      content.removeAttribute('style'); return
    }

    const header = document.querySelector('.main-header')?.getBoundingClientRect().height || 0
    const footer = document.querySelector('.main-footer')?.getBoundingClientRect().height || 0
    const footerFixed = this._isFooterFixed() && getComputedStyle(document.querySelector('.main-footer') || document.body).position === 'fixed'
    content.style.height = `${window.innerHeight - header - (footerFixed ? footer : 0)}px`
    content.style.overflowY = 'auto'
  }

  _fixScrollHeight() {
    if (!document.body.classList.contains('layout-fixed')) {
      return
    }

    const sidebar = document.querySelector(this._config.target)
    const content = sidebar?.querySelector('.control-sidebar-content')
    if (!sidebar || !content) {
      return
    }

    const header = document.querySelector('.main-header')?.getBoundingClientRect().height || 0
    const footer = document.querySelector('.main-footer')?.getBoundingClientRect().height || 0
    const top = window.scrollY
    const bottom = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - top)
    const navFixed = this._isNavbarFixed() && getComputedStyle(document.querySelector('.main-header') || document.body).position === 'fixed'
    const footerFixed = this._isFooterFixed() && getComputedStyle(document.querySelector('.main-footer') || document.body).position === 'fixed'
    if (top === 0 && bottom === 0) {
      sidebar.style.top = `${header}px`; sidebar.style.bottom = `${footer}px`; content.style.height = `${window.innerHeight - header - footer}px`
    } else if (bottom <= footer && !footerFixed) {
      sidebar.style.bottom = `${footer - bottom}px`; sidebar.style.top = `${Math.max(0, header - top)}px`; content.style.height = `${window.innerHeight - footer + bottom}px`
    } else if (top <= header && !navFixed) {
      sidebar.style.top = `${header - top}px`; content.style.height = `${window.innerHeight - header + top}px`
    } else if (!navFixed) {
      sidebar.style.top = '0'; content.style.height = `${window.innerHeight}px`
    } else {
      sidebar.style.top = `${header}px`
    }

    if (footerFixed && navFixed) {
      content.style.height = '100%'; sidebar.style.height = ''
    }
  }

  static getOrCreateInstance(element, config = {}) {
    return getOrCreateInstance(ControlSidebar, element, config)
  }

  static _interface(element, method) {
    const instance = ControlSidebar.getOrCreateInstance(element); setInstance(ControlSidebar, element, instance); if (method) {
      instance[method]()
    }
  }
}

delegate(document, 'click', '[data-widget="control-sidebar"]', (event, trigger) => {
  event.preventDefault(); ControlSidebar._interface(trigger, 'toggle')
})
onReady(() => document.querySelectorAll('[data-widget="control-sidebar"]').forEach(element => ControlSidebar._interface(element)))
export default ControlSidebar
