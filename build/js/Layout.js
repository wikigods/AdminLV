/** AdminLTE Layout, implemented without jQuery. */
/* eslint-disable max-statements-per-line */
import { getConfig, getInstance, getOrCreateInstance, setInstance, onReady } from './Native'

const SELECTOR_CONTENT = '.content-wrapper'
const CLASS_FIXED = 'layout-fixed'
const DEFAULT = { scrollbarTheme: 'os-theme-light', scrollbarAutoHide: 'l', panelAutoHeight: true, panelAutoHeightMode: 'min-height', preloadDuration: 200, loginRegisterAutoHeight: true }

class Layout {
  constructor(element, config = {}) {
    this._element = element; this._config = getConfig(element, DEFAULT, config)
    setInstance(Layout, element, this)
  }

  fixLayoutHeight(extra = null) {
    const { body } = document
    const first = selector => document.querySelector(selector)
    const height = selector => first(selector)?.getBoundingClientRect().height || 0
    const control = body.classList.contains('control-sidebar-slide-open') || body.classList.contains('control-sidebar-open') || extra === 'control_sidebar' ? height('.control-sidebar-content') : 0
    const heights = { window: window.innerHeight, header: height('.main-header'), footer: height('.main-footer'), sidebar: height('.main-sidebar .sidebar'), control }
    const max = Math.max(...Object.values(heights))
    const content = first(SELECTOR_CONTENT)
    let offset = this._config.panelAutoHeight
    if (offset === true) {
      offset = 0
    }

    if (content && offset !== false) {
      let minHeight = max === heights.control ? max + offset : (max === heights.window ? max + offset - heights.header - heights.footer : max + offset - heights.header)
      if (getComputedStyle(first('.main-footer') || body).position === 'fixed') {
        minHeight += heights.footer
      }

      content.style[this._config.panelAutoHeightMode] = `${minHeight}px`
    }

    if (body.classList.contains(CLASS_FIXED)) {
      const sidebar = first('.main-sidebar .sidebar')
      if (sidebar) {
        sidebar.style.overflowY = 'auto'
      }
    }
  }

  fixLoginRegisterHeight() {
    const { body } = document
    const html = document.documentElement
    if (body.classList.contains('iframe-mode')) {
      body.style.height = '100%'
      html.style.height = '100%'
      const wrapper = document.querySelector('.wrapper'); if (wrapper) {
        wrapper.style.height = '100%'
      }

      return
    }

    const box = document.querySelector('.login-box, .register-box')
    if (!box) {
      body.style.height = 'auto'
      html.style.height = 'auto'
      return
    }

    body.style[this._config.panelAutoHeightMode] = `${box.getBoundingClientRect().height}px`
  }

  _init() {
    this.fixLayoutHeight()
    if (this._config.loginRegisterAutoHeight === true) {
      this.fixLoginRegisterHeight()
    } else if (this._config.loginRegisterAutoHeight !== false && Number.isInteger(Number(this._config.loginRegisterAutoHeight))) {
      window.setInterval(() => this.fixLoginRegisterHeight(), Number(this._config.loginRegisterAutoHeight))
    }

    window.addEventListener('resize', () => {
      this.fixLayoutHeight(); this.fixLoginRegisterHeight()
    })
    document.addEventListener('collapsed.lte.treeview', () => this.fixLayoutHeight())
    document.addEventListener('expanded.lte.treeview', () => this.fixLayoutHeight())
    document.addEventListener('mouseenter', event => {
      if (event.target.matches?.('.main-sidebar') && document.body.classList.contains('sidebar-collapse')) {
        this.fixLayoutHeight()
      }
    }, true)
    document.addEventListener('mouseleave', event => {
      if (event.target.matches?.('.main-sidebar') && document.body.classList.contains('sidebar-collapse')) {
        this.fixLayoutHeight()
      }
    }, true)
    document.addEventListener('collapsed.lte.pushmenu', () => window.setTimeout(() => this.fixLayoutHeight(), 300))
    document.addEventListener('shown.lte.pushmenu', () => window.setTimeout(() => this.fixLayoutHeight(), 300))
    document.addEventListener('collapsed.lte.controlsidebar', () => this.fixLayoutHeight())
    document.addEventListener('expanded.lte.controlsidebar', () => this.fixLayoutHeight('control_sidebar'))
    window.setTimeout(() => document.body.classList.remove('hold-transition'), 50)
    window.setTimeout(() => {
      const preloader = document.querySelector('.preloader')
      if (preloader) {
        preloader.style.height = '0'
        window.setTimeout(() => preloader.remove(), 200)
      }
    }, this._config.preloadDuration)
  }

  static _interface(element) {
    const instance = Layout.getOrCreateInstance(element); instance._init()
  }

  static getInstance(element) {
    return getInstance(Layout, element)
  }

  static getOrCreateInstance(element, config = {}) {
    return getOrCreateInstance(Layout, element, config)
  }
}

onReady(() => {
  const { body } = document
  Layout._interface(body)
  document.querySelectorAll('.main-sidebar .sidebar a').forEach(link => {
    link.addEventListener('focusin', () => document.querySelector('.main-sidebar')?.classList.add('sidebar-focused'))
    link.addEventListener('focusout', () => document.querySelector('.main-sidebar')?.classList.remove('sidebar-focused'))
  })
})

export default Layout
