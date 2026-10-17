/** AdminLV IFrame, implemented without jQuery. */
/* eslint-disable max-statements-per-line */
import { getConfig, getOrCreateInstance, setInstance, delegate, onReady } from './Native'

const DATA = '[data-widget="iframe"]'
const WRAPPER = '.content-wrapper'
const NAV = `${WRAPPER}.iframe-mode .navbar-nav`
const TABNAV = `${NAV} .nav-link`
const TABCONTENT = `${WRAPPER}.iframe-mode .tab-content`
const EMPTY = `${TABCONTENT} .tab-empty`
const LOADING = `${TABCONTENT} .tab-loading`
const PANES = `${TABCONTENT} .tab-pane`
const FULLSCREEN = '[data-widget="iframe-fullscreen"]'
const CLASS_IFRAME = 'iframe-mode'
const CLASS_FULLSCREEN = 'iframe-mode-fullscreen'
const DEFAULT = {
  onTabClick: item => item, onTabChanged: item => item, onTabCreated: item => item,
  autoIframeMode: true, autoItemActive: true, autoShowNewTab: true, autoDarkMode: false,
  allowDuplicates: false, allowReload: true, loadingScreen: true, useNavbarItems: true,
  scrollOffset: 40, scrollBehaviorSwap: false, iconMaximize: 'fa-expand', iconMinimize: 'fa-compress'
}

class IFrame {
  constructor(element, config = {}) {
    this._element = element; this._config = { ...DEFAULT, ...config }; setInstance(IFrame, element, this); this._init()
  }

  onTabClick(item) {
    this._config.onTabClick(item)
  }

  onTabChanged(item) {
    this._config.onTabChanged(item)
  }

  onTabCreated(item) {
    this._config.onTabCreated(item)
  }

  createTab(title, link, uniqueName, autoOpen = this._config.autoShowNewTab) {
    const nav = document.querySelector(NAV); const content = document.querySelector(TABCONTENT)
    if (!nav || !content) {
      return
    }

    let suffix = ''
    if (this._config.allowDuplicates) {
      suffix = `-${Math.floor(Math.random() * 100_000)}`
    }

    const tabId = `panel-${uniqueName}${suffix}`; const navId = `tab-${uniqueName}${suffix}`
    const item = document.createElement('li'); item.className = 'nav-item'; item.setAttribute('role', 'presentation')
    const close = document.createElement('a'); close.href = '#'; close.className = 'btn-iframe-close'; close.dataset.widget = 'iframe-close'; close.dataset.type = 'only-this'
    const closeIcon = document.createElement('i'); closeIcon.className = 'fa-solid fa-xmark'; close.append(closeIcon)
    const tab = document.createElement('a'); tab.className = 'nav-link'; tab.dataset.bsToggle = 'tab'; tab.id = navId; tab.href = `#${tabId}`; tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', tabId); tab.setAttribute('aria-selected', 'false'); tab.textContent = title
    item.append(close, tab); nav.append(item)
    const pane = document.createElement('div'); pane.className = 'tab-pane fade'; pane.id = tabId; pane.setAttribute('role', 'tabpanel'); pane.setAttribute('aria-labelledby', navId)
    const iframe = document.createElement('iframe'); iframe.src = link; iframe.setAttribute('title', title); pane.append(iframe); content.append(pane)
    if (autoOpen) {
      const loading = document.querySelector(LOADING)
      let handled = false
      const finish = () => {
        if (handled) {
          return
        }

        handled = true
        const delay = typeof this._config.loadingScreen === 'number' ? this._config.loadingScreen : 0
        window.setTimeout(() => {
          this.switchTab(tab); if (loading) {
            loading.style.display = 'none'
          }
        }, delay)
      }

      if (this._config.loadingScreen && loading) {
        loading.style.display = 'block'; iframe.addEventListener('load', finish, { once: true }); iframe.addEventListener('error', finish, { once: true })
      } else {
        this.switchTab(tab)
      }
    }

    this.onTabCreated(tab)
    return tab
  }

  openTabSidebar(item, autoOpen = this._config.autoShowNewTab) {
    const anchor = item?.closest?.('a') || item?.parentElement?.closest?.('a')
    if (!anchor) {
      return
    }

    const link = anchor.getAttribute('href')
    if (!link || link === '#') {
      return
    }

    const titleElement = anchor.querySelector('p')
    const title = (titleElement?.textContent || anchor.textContent).replace(/\s+/g, ' ').trim()
    const uniqueName = decodeURI(link).replace('./', '').replace(/["#&'./:=?[\]]/gi, '-').replace(/--/g, '')
    const navId = `tab-${uniqueName}`
    const existing = document.getElementById(navId)
    if (!this._config.allowDuplicates && existing) {
      return this.switchTab(existing, this._config.allowReload)
    }

    return this.createTab(title, link, uniqueName, autoOpen)
  }

  switchTab(item, reload = false) {
    const tab = typeof item === 'string' ? document.querySelector(item) : item
    if (!tab) {
      return
    }

    const paneId = tab.getAttribute('aria-controls') || tab.getAttribute('href')?.slice(1)
    const pane = paneId ? document.getElementById(paneId) : null
    const iframe = pane?.querySelector('iframe')
    document.querySelectorAll(EMPTY).forEach(element => {
      element.style.display = 'none'
    })
    const loading = document.querySelector(LOADING)
    if (reload && iframe) {
      if (this._config.loadingScreen && loading) {
        loading.style.display = 'block'
      }

      iframe.addEventListener('load', () => {
        if (loading) {
          window.setTimeout(() => {
            loading.style.display = 'none'
          }, typeof this._config.loadingScreen === 'number' ? this._config.loadingScreen : 0)
        }
      }, { once: true })
      iframe.src = iframe.getAttribute('src')
    }

    document.querySelectorAll(`${NAV} .active`).forEach(el => el.classList.remove('active'))
    const Tab = window.bootstrap?.Tab
    if (!Tab) {
      throw new Error('Bootstrap 5 Tab is required for AdminLV iframe tabs.')
    }

    Tab.getOrCreateInstance(tab).show()
    tab.closest('.nav-item')?.classList.add('active')
    this._fixHeight()
    this.onTabChanged(tab)
    if (this._config.autoItemActive && iframe) {
      this._setItemActive(iframe.src)
    }
  }

  removeActiveTab(type, element) {
    const navItems = [...document.querySelectorAll(`${NAV} .nav-item`)]
    const active = document.querySelector(`${NAV} .nav-item.active`)
    if (type === 'all') {
      navItems.forEach(item => item.remove()); document.querySelectorAll(PANES).forEach(pane => pane.remove()); document.querySelectorAll(EMPTY).forEach(el => {
        el.style.display = 'flex'
      }); return
    }

    if (type === 'all-other') {
      navItems.filter(item => !item.classList.contains('active')).forEach(item => item.remove())
      document.querySelectorAll(`${PANES}:not(.active)`).forEach(pane => pane.remove()); return
    }

    const item = type === 'only-this' ? element?.closest('.nav-item') : active
    if (!item) {
      return
    }

    const index = navItems.indexOf(item); const tab = item.querySelector('.nav-link')
    const paneId = tab?.getAttribute('aria-controls') || tab?.getAttribute('href')?.slice(1)
    item.remove(); if (paneId) {
      document.getElementById(paneId)?.remove()
    }

    const remaining = [...document.querySelectorAll(`${NAV} .nav-link`)]
    if (remaining.length === 0) {
      document.querySelectorAll(EMPTY).forEach(el => {
        el.style.display = 'flex'
      })
    } else {
      this.switchTab(remaining[Math.max(0, index - 1)])
    }
  }

  toggleFullscreen() {
    const enabled = document.body.classList.toggle(CLASS_FULLSCREEN)
    document.querySelectorAll(`${FULLSCREEN} i`).forEach(icon => {
      icon.classList.toggle(this._config.iconMinimize, enabled); icon.classList.toggle(this._config.iconMaximize, !enabled)
    })
    if (!enabled) {
      document.querySelectorAll(`${EMPTY}, ${LOADING}, ${WRAPPER}, ${SELECTOR_IFRAME}`).forEach(el => {
        el.style.height = '100%'
      })
    }

    window.dispatchEvent(new Event('resize')); this._fixHeight(true)
  }

  _init() {
    this._initFrameElement(); this._setupListeners(); this._fixHeight(true)
    const panes = document.querySelectorAll(PANES)
    if (document.querySelector(TABCONTENT)?.children.length > 2) {
      const first = panes[0]; const link = document.getElementById(first.getAttribute('aria-labelledby')); if (link) {
        this.switchTab(link, true)
      }
    }
  }

  _initFrameElement() {
    if (window.frameElement && this._config.autoIframeMode) {
      document.body.classList.add(CLASS_IFRAME); if (this._config.autoDarkMode) {
        document.body.setAttribute('data-bs-theme', 'dark')
      }
    }
  }

  _navScroll(offset) {
    const nav = document.querySelector(NAV); nav?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  _setupListeners() {
    if (this._listeners) {
      return
    }

    this._listeners = true
    window.addEventListener('resize', () => window.setTimeout(() => this._fixHeight(), 1))
    if (document.querySelector(`${WRAPPER}.${CLASS_IFRAME}`)) {
      delegate(document, 'click', '.main-sidebar .nav-item > a.nav-link, .sidebar-search-results .list-group-item', (event, target) => {
        event.preventDefault(); this.openTabSidebar(target)
      })
      if (this._config.useNavbarItems) {
        delegate(document, 'click', '.main-header .nav-item a.nav-link, .main-header a.dropdown-item', (event, target) => {
          event.preventDefault(); this.openTabSidebar(target)
        })
      }
    }

    delegate(document, 'click', TABNAV, (event, target) => {
      event.preventDefault(); this.onTabClick(target); this.switchTab(target)
    })
    delegate(document, 'click', '[data-widget="iframe-close"]', (event, target) => {
      event.preventDefault(); this.removeActiveTab(target.dataset.type, target)
    })
    delegate(document, 'click', FULLSCREEN, event => {
      event.preventDefault(); this.toggleFullscreen()
    })
    let interval = null
    const scroll = direction => {
      const offset = this._config.scrollOffset * (this._config.scrollBehaviorSwap ? -direction : direction); this._navScroll(offset); interval = window.setInterval(() => this._navScroll(offset), 250)
    }

    delegate(document, 'mousedown', '[data-widget="iframe-scrollleft"]', event => {
      event.preventDefault(); clearInterval(interval); scroll(-1)
    })
    delegate(document, 'mousedown', '[data-widget="iframe-scrollright"]', event => {
      event.preventDefault(); clearInterval(interval); scroll(1)
    })
    document.addEventListener('mouseup', () => {
      clearInterval(interval); interval = null
    })
  }

  _setItemActive(href) {
    document.querySelectorAll('.main-sidebar .nav-item > a.nav-link, .main-header a.dropdown-item, .main-header .nav-item a.nav-link').forEach(el => el.classList.remove('active'))
    document.querySelectorAll('.main-header .nav-item').forEach(el => el.classList.remove('active'))
    document.querySelectorAll('.main-sidebar .nav-item > a.nav-link, .main-header a.dropdown-item, .main-header .nav-item a.nav-link').forEach(el => {
      if (el.href !== href) {
        return
      }

      el.classList.add('active'); el.closest('.main-header .nav-item')?.classList.add('active')
      let parent = el.closest('.nav-treeview')?.previousElementSibling
      while (parent?.matches('.nav-link')) {
        parent.classList.add('active'); parent = parent.closest('.nav-item')?.parentElement?.closest('.nav-item')?.querySelector(':scope > .nav-link')
      }
    })
  }

  _fixHeight(tabEmpty = false) {
    const wrapper = document.querySelector(WRAPPER); const nav = document.querySelector(`${WRAPPER}.iframe-mode .nav`)
    if (!wrapper || !nav) {
      return
    }

    const navbarHeight = nav.getBoundingClientRect().height
    if (document.body.classList.contains(CLASS_FULLSCREEN)) {
      const height = window.innerHeight - navbarHeight
      document.querySelectorAll(`${EMPTY}, ${LOADING}, ${SELECTOR_IFRAME}`).forEach(el => {
        el.style.height = `${height}px`
      })
      wrapper.style.height = `${window.innerHeight}px`
    } else {
      const height = wrapper.getBoundingClientRect().height - navbarHeight
      if (tabEmpty) {
        window.setTimeout(() => document.querySelectorAll(`${EMPTY}, ${LOADING}`).forEach(el => {
          el.style.height = `${height}px`
        }), 50)
      } else {
        document.querySelectorAll(SELECTOR_IFRAME).forEach(el => {
          el.style.height = `${height}px`
        })
      }
    }
  }

  static getOrCreateInstance(element, config = {}) {
    return getOrCreateInstance(IFrame, element, config)
  }

  static _interface() {
    const element = document.querySelector(DATA)
    if (element) {
      const saved = JSON.parse(localStorage.getItem('AdminLTE:IFrame:Options') || '{}')
      const config = getConfig(element, DEFAULT, saved)
      localStorage.setItem('AdminLTE:IFrame:Options', JSON.stringify(config))
      const instance = IFrame.getOrCreateInstance(element, config); setInstance(IFrame, element, instance); window.iFrameInstance = instance
    } else {
      const saved = JSON.parse(localStorage.getItem('AdminLTE:IFrame:Options') || '{}')
      const config = { ...DEFAULT, ...saved }; const instance = new IFrame(document.body, config); window.iFrameInstance = instance; instance._initFrameElement()
    }
  }
}

const SELECTOR_IFRAME = `${WRAPPER} iframe`
onReady(IFrame._interface)
export default IFrame
