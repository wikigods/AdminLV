import { delegate, dispatch, getInstance, onReady, setInstance } from './Native'

const EVENT_EXPANDED = 'expanded.lte.expandableTable'
const EVENT_COLLAPSED = 'collapsed.lte.expandableTable'
const SELECTOR_TABLE = '.expandable-table'
const SELECTOR_DATA_TOGGLE = '[data-widget="expandable-table"]'
const CLASS_NAME_HIDDEN = 'd-none'

function getRow(element) {
  return element.closest('tr')
}

function getContent(row) {
  return row?.nextElementSibling?.querySelector(':scope > td > :first-child') ?? null
}

function animate(content, expand, done = () => {}) {
  if (!content) {
    done()
    return
  }

  const { height } = content.getBoundingClientRect()
  const targetHeight = expand ? content.scrollHeight : 0
  content.style.overflow = 'hidden'
  const animation = content.animate([
    { height: `${expand ? 0 : height}px`, opacity: expand ? 0 : 1 },
    { height: `${targetHeight}px`, opacity: expand ? 1 : 0 }
  ], { duration: 500, easing: 'ease' })
  animation.onfinish = () => {
    content.style.removeProperty('overflow')
    if (expand) {
      content.style.removeProperty('height')
      content.style.removeProperty('opacity')
    }

    done()
  }
}

class ExpandableTable {
  constructor(element) {
    this._element = element
    setInstance(ExpandableTable, element, this)
  }

  init() {
    this._element.querySelectorAll(SELECTOR_DATA_TOGGLE).forEach(row => {
      const body = row.nextElementSibling
      const content = getContent(row)
      const expanded = row.getAttribute('aria-expanded') === 'true'
      body?.classList.toggle(CLASS_NAME_HIDDEN, !expanded)
      if (content) {
        content.style.display = expanded ? '' : 'none'
      }
    })
  }

  toggleRow(trigger = this._element) {
    const row = getRow(trigger)
    if (!row) {
      return
    }

    const body = row.nextElementSibling
    const content = getContent(row)
    const expanded = row.getAttribute('aria-expanded') === 'true'
    if (expanded) {
      row.setAttribute('aria-expanded', 'false')
      animate(content, false, () => body?.classList.add(CLASS_NAME_HIDDEN))
      dispatch(row, EVENT_COLLAPSED)
    } else {
      body?.classList.remove(CLASS_NAME_HIDDEN)
      if (content) {
        content.style.display = ''
      }

      row.setAttribute('aria-expanded', 'true')
      animate(content, true)
      dispatch(row, EVENT_EXPANDED)
    }
  }

  static getInstance(element) {
    return getInstance(ExpandableTable, element)
  }

  static getOrCreateInstance(element) {
    return ExpandableTable.getInstance(element) ?? new ExpandableTable(element)
  }
}

onReady(() => {
  document.querySelectorAll(SELECTOR_TABLE).forEach(table => {
    ExpandableTable.getOrCreateInstance(table).init()
  })
})

delegate(document, 'click', SELECTOR_DATA_TOGGLE, (_event, element) => {
  const table = element.closest(SELECTOR_TABLE) ?? element.closest('table')
  if (table) {
    ExpandableTable.getOrCreateInstance(table).toggleRow(element)
  }
})

export default ExpandableTable
