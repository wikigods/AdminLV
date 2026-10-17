import { getInstance, setInstance } from './Native'

const SELECTOR_NAVBAR = '.navbar'
const SELECTOR_DROPDOWN_MENU = '.dropdown-menu'
const SELECTOR_DROPDOWN_TOGGLE = '[data-bs-toggle="dropdown"]'
const SELECTOR_SUBMENU_TOGGLE = `${SELECTOR_DROPDOWN_MENU} ${SELECTOR_DROPDOWN_TOGGLE}`
const SELECTOR_SUBMENU_OPEN = '.dropdown-submenu .dropdown-menu.show'
const CLASS_NAME_DROPDOWN_SUBMENU = 'dropdown-submenu'

class Dropdown {
  constructor(element) {
    this._element = element
    setInstance(Dropdown, element, this)
  }

  toggleSubmenu() {
    const parent = this._element.closest(`.${CLASS_NAME_DROPDOWN_SUBMENU}`)
    const submenu = this._element.nextElementSibling ?? parent?.querySelector(':scope > .dropdown-menu')
    if (!submenu) {
      return
    }

    const isOpen = submenu.classList.toggle('show')
    submenu.style.display = isOpen ? 'block' : 'none'

    if (!isOpen) {
      parent?.closest('.dropdown-menu')?.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show')
        menu.style.display = 'none'
      })
    }
  }

  static getInstance(element) {
    return getInstance(Dropdown, element)
  }

  static getOrCreateInstance(element) {
    return Dropdown.getInstance(element) ?? new Dropdown(element)
  }

  static fixPosition() {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
      menu.style.left = ''
      menu.style.right = ''
      if (menu.classList.contains('dropdown-menu-end')) {
        return
      }

      const bounds = menu.getBoundingClientRect()
      if (bounds.left < 0) {
        menu.style.left = '0'
        menu.style.right = 'auto'
      } else if (bounds.right > window.innerWidth) {
        menu.style.left = 'auto'
        menu.style.right = '0'
      }
    })
  }
}

document.addEventListener('click', event => {
  const element = event.target instanceof Element ? event.target.closest(SELECTOR_SUBMENU_TOGGLE) : null
  if (!element || !element.closest(`.${CLASS_NAME_DROPDOWN_SUBMENU}`)) {
    return
  }

  event.preventDefault()
  event.stopImmediatePropagation()
  Dropdown.getOrCreateInstance(element).toggleSubmenu()
}, true)

document.querySelectorAll(`${SELECTOR_NAVBAR} ${SELECTOR_DROPDOWN_TOGGLE}`).forEach(toggle => {
  toggle.addEventListener('shown.bs.dropdown', () => requestAnimationFrame(Dropdown.fixPosition))
})

document.addEventListener('hidden.bs.dropdown', () => {
  document.querySelectorAll(SELECTOR_SUBMENU_OPEN).forEach(menu => {
    menu.classList.remove('show')
    menu.style.display = 'none'
  })
})

export default Dropdown
