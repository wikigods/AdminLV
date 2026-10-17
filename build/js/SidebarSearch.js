/** AdminLTE SidebarSearch, implemented without jQuery. */
/* eslint-disable max-statements-per-line */
import { getConfig, getInstance, getOrCreateInstance, setInstance, delegate, onReady } from './Native'

const WIDGET = '[data-widget="sidebar-search"]'
const DEFAULT = { arrowSign: '->', minLength: 3, maxResults: 7, highlightName: true, highlightPath: false, highlightClass: 'text-light', notFoundText: 'No element found!' }

class SidebarSearch {
  constructor(element, options = {}) {
    this.element = element; this.options = getConfig(element, DEFAULT, options); this.items = []
    setInstance(SidebarSearch, element, this)
  }

  _init() {
    if (!this.element) {
      return
    }

    let results = this.element.nextElementSibling
    if (!results?.classList.contains('sidebar-search-results')) {
      results = document.createElement('div'); results.className = 'sidebar-search-results'; this.element.after(results)
    }

    let group = results.querySelector('.list-group')
    if (!group) {
      group = document.createElement('div'); group.className = 'list-group'; results.append(group)
    }

    this.resultsGroup = group
    this.items = []
    document.querySelectorAll('.main-sidebar .nav-sidebar').forEach(sidebar => [...sidebar.children].forEach(item => this._parseItem(item)))
    this._addNotFound()
  }

  search() {
    const input = this.element.querySelector('.form-control')
    const value = input?.value.trim().toLowerCase() || ''
    if (value.length < this.options.minLength) {
      this.resultsGroup?.replaceChildren(); this._addNotFound(); this.close(); return
    }

    const matches = this.items.filter(item => item.name.toLowerCase().includes(value)).slice(0, this.options.maxResults)
    this.resultsGroup?.replaceChildren()
    if (matches.length === 0) {
      this._addNotFound()
    } else {
      matches.forEach(item => this.resultsGroup.append(this._renderItem(item.name, item.link, item.path, value)))
    }

    this.open()
  }

  open() {
    this.element.parentElement?.classList.add('sidebar-search-open'); const icon = this.element.querySelector('.btn i'); icon?.classList.replace('fa-magnifying-glass', 'fa-xmark')
  }

  close() {
    this.element.parentElement?.classList.remove('sidebar-search-open'); const icon = this.element.querySelector('.btn i'); icon?.classList.replace('fa-xmark', 'fa-magnifying-glass')
  }

  toggle() {
    if (this.element.parentElement?.classList.contains('sidebar-search-open')) {
      this.close()
    } else {
      this.open()
    }
  }

  _parseItem(item, path = []) {
    if (item.classList.contains('nav-header')) {
      return
    }

    const linkElement = item.querySelector(':scope > .nav-link')
    if (!linkElement) {
      return
    }

    const nameNode = linkElement.querySelector('p') || linkElement
    const name = (nameNode.textContent || '').replace(/(\r\n|\n|\r)/gm, ' ').trim()
    const childList = item.querySelector(':scope > .nav-treeview')
    if (childList) {
      [...childList.children].forEach(child => this._parseItem(child, [...path, name]))
    } else {
      this.items.push({ name, link: linkElement.getAttribute('href') || '#', path })
    }
  }

  _highlight(container, text, query) {
    if (!query) {
      container.textContent = text; return
    }

    const lower = text.toLowerCase(); const q = query.toLowerCase(); let offset = 0
    while (offset < text.length) {
      const index = lower.indexOf(q, offset)
      if (index < 0) {
        container.append(document.createTextNode(text.slice(offset))); break
      }

      container.append(document.createTextNode(text.slice(offset, index)))
      const strong = document.createElement('strong'); strong.className = this.options.highlightClass; strong.textContent = text.slice(index, index + q.length); container.append(strong)
      offset = index + q.length
    }
  }

  _renderItem(name, link, path, query = '') {
    const anchor = document.createElement('a'); anchor.href = link; anchor.className = 'list-group-item'
    const title = document.createElement('div'); title.className = 'search-title'
    if (this.options.highlightName) {
      this._highlight(title, name, query)
    } else {
      title.textContent = name
    }

    const pathEl = document.createElement('div'); pathEl.className = 'search-path'
    const pathText = path.join(` ${this.options.arrowSign} `)
    if (this.options.highlightPath) {
      this._highlight(pathEl, pathText, query)
    } else {
      pathEl.textContent = pathText
    }

    anchor.append(title, pathEl)
    return anchor
  }

  _addNotFound() {
    if (this.resultsGroup) {
      this.resultsGroup.append(this._renderItem(this.options.notFoundText, '#', []))
    }
  }

  static _interface(element, method) {
    const instance = SidebarSearch.getOrCreateInstance(element); if (method) {
      instance[method]()
    }
  }

  static getInstance(element) {
    return getInstance(SidebarSearch, element)
  }

  static getOrCreateInstance(element, options = {}) {
    return getOrCreateInstance(SidebarSearch, element, options)
  }
}

delegate(document, 'click', `${WIDGET} .btn`, event => {
  event.preventDefault(); const element = event.target.closest(WIDGET); SidebarSearch._interface(element, 'toggle')
})
delegate(document, 'input', `${WIDGET} .form-control`, event => SidebarSearch._interface(event.target.closest(WIDGET), 'search'))
delegate(document, 'keydown', `${WIDGET} .form-control`, (event, input) => {
  const results = input.closest(WIDGET)?.nextElementSibling?.querySelectorAll('.list-group-item')
  if (!results?.length) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault(); results[0].focus()
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault(); results[results.length - 1].focus()
  }
})
delegate(document, 'keydown', '.sidebar-search-results .list-group', (event, group) => {
  const items = [...group.querySelectorAll('.list-group-item')]
  if (items.length === 0 || !['ArrowUp', 'ArrowDown'].includes(event.key)) {
    return
  }

  event.preventDefault(); const index = items.indexOf(document.activeElement); const direction = event.key === 'ArrowDown' ? 1 : -1
  items[(index + direction + items.length) % items.length].focus()
})
onReady(() => document.querySelectorAll(WIDGET).forEach(element => SidebarSearch._interface(element)))
export default SidebarSearch
