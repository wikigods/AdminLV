import { animateHeight, dispatch, getConfig, getInstance, onReady, setInstance } from './Native'
import PushMenu from './PushMenu'

const EVENT_EXPANDED = 'expanded.lte.treeview'
const EVENT_COLLAPSED = 'collapsed.lte.treeview'
const SELECTOR_TREEVIEW = '[data-widget="treeview"]'
const SELECTOR_NAV_ITEM = '.nav-item'
const SELECTOR_LINK = '.nav-link'
const SELECTOR_TREEVIEW_MENU = '.nav-treeview'
const CLASS_NAME_OPEN = 'menu-open'
const CLASS_NAME_IS_OPENING = 'menu-is-opening'
const CLASS_NAME_SIDEBAR_COLLAPSED = 'sidebar-collapse'

const Default = {
  trigger: '.nav-link',
  animationSpeed: 300,
  accordion: true,
  expandSidebar: false,
  sidebarButtonSelector: '[data-widget="pushmenu"]'
}

class Treeview {
  constructor(element, config = {}) {
    this._element = element
    this._config = getConfig(element, Default, config)
    setInstance(Treeview, element, this)
  }

  init() {
    this._element.querySelectorAll(`${SELECTOR_NAV_ITEM}.${CLASS_NAME_OPEN} > ${SELECTOR_TREEVIEW_MENU}`).forEach(menu => {
      menu.hidden = false
      menu.style.display = 'block'
    })
  }

  expand(menu, parentItem) {
    if (this._config.accordion) {
      [...parentItem.parentElement.children]
        .filter(item => item !== parentItem && item.classList.contains(CLASS_NAME_OPEN))
        .forEach(item => this.collapse(item.querySelector(`:scope > ${SELECTOR_TREEVIEW_MENU}`), item))
    }

    parentItem.classList.add(CLASS_NAME_IS_OPENING)
    menu.hidden = false
    menu.style.display = 'block'
    animateHeight(menu, true, this._config.animationSpeed, () => {
      parentItem.classList.add(CLASS_NAME_OPEN)
      parentItem.classList.remove(CLASS_NAME_IS_OPENING)
      dispatch(this._element, EVENT_EXPANDED, { relatedTarget: parentItem })
    })

    if (this._config.expandSidebar) {
      this._expandSidebar()
    }
  }

  collapse(menu, parentItem) {
    if (!menu || !parentItem) {
      return
    }

    parentItem.classList.remove(CLASS_NAME_IS_OPENING, CLASS_NAME_OPEN)
    animateHeight(menu, false, this._config.animationSpeed, () => {
      menu.hidden = true
      menu.querySelectorAll(`${SELECTOR_NAV_ITEM}.${CLASS_NAME_OPEN}`).forEach(item => {
        item.classList.remove(CLASS_NAME_IS_OPENING, CLASS_NAME_OPEN)
        const childMenu = item.querySelector(`:scope > ${SELECTOR_TREEVIEW_MENU}`)
        if (childMenu) {
          childMenu.hidden = true
        }
      })
      dispatch(this._element, EVENT_COLLAPSED, { relatedTarget: parentItem })
    })
  }

  toggle(event, link) {
    const parentItem = link.closest(SELECTOR_NAV_ITEM)
    const menu = parentItem?.querySelector(`:scope > ${SELECTOR_TREEVIEW_MENU}`)
    if (!parentItem || !menu) {
      return
    }

    event.preventDefault()
    if (parentItem.classList.contains(CLASS_NAME_OPEN)) {
      this.collapse(menu, parentItem)
    } else {
      this.expand(menu, parentItem)
    }
  }

  _expandSidebar() {
    if (document.body.classList.contains(CLASS_NAME_SIDEBAR_COLLAPSED)) {
      const button = document.querySelector(this._config.sidebarButtonSelector)
      if (button) {
        PushMenu.getOrCreateInstance(button).expand()
      }
    }
  }

  static getInstance(element) {
    return getInstance(Treeview, element)
  }

  static getOrCreateInstance(element, config = {}) {
    return Treeview.getInstance(element) ?? new Treeview(element, config)
  }
}

onReady(() => {
  document.querySelectorAll(SELECTOR_TREEVIEW).forEach(element => {
    Treeview.getOrCreateInstance(element).init()
  })
})

document.addEventListener('click', event => {
  const link = event.target instanceof Element ? event.target.closest(`${SELECTOR_TREEVIEW} ${SELECTOR_LINK}`) : null
  const root = link?.closest(SELECTOR_TREEVIEW)
  if (!root) {
    return
  }

  const instance = Treeview.getOrCreateInstance(root)
  if (link.matches(instance._config.trigger)) {
    instance.toggle(event, link)
  }
})

export default Treeview
