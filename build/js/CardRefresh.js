import { delegate, dispatch, getConfig, getInstance, onReady, setInstance } from './Native'

const EVENT_LOADED = 'loaded.lte.cardrefresh'
const EVENT_OVERLAY_ADDED = 'overlay.added.lte.cardrefresh'
const EVENT_OVERLAY_REMOVED = 'overlay.removed.lte.cardrefresh'
const SELECTOR_DATA_REFRESH = '[data-card-widget="card-refresh"]'

const Default = {
  source: '',
  sourceSelector: '',
  params: {},
  trigger: SELECTOR_DATA_REFRESH,
  content: '.card-body',
  loadInContent: true,
  loadOnInit: true,
  loadErrorTemplate: true,
  responseType: '',
  overlayTemplate: '<div class="overlay"><i class="fa-solid fa-2xl fa-rotate fa-spin"></i></div>',
  errorTemplate: '<span class="text-danger"></span>',
  onLoadStart() {},
  onLoadDone(response) {
    return response
  },
  onLoadFail() {}
}

class CardRefresh {
  constructor(element, settings = {}) {
    this._element = element
    this._settings = getConfig(element, Default, settings)
    this._parent = element.matches('.card') ? element : element.closest('.card')
    this._initialized = false
    this._controller = null
    if (!this._parent) {
      throw new Error('CardRefresh control must be inside a .card element.')
    }

    if (!this._settings.source) {
      throw new Error('Source url was not defined. Please specify a url in your CardRefresh source option.')
    }

    setInstance(CardRefresh, element, this)
  }

  async load() {
    this._controller?.abort()
    this._controller = new AbortController()
    this._removeOverlay()
    this._addOverlay()
    this._settings.onLoadStart.call(this._element)
    dispatch(this._element, EVENT_LOADED)

    // fetch and URL are unavailable in legacy Opera Mini, which is outside the supported browser set.
    const url = new URL(this._settings.source, window.location.href)
    for (const [key, value] of Object.entries(this._settings.params ?? {})) {
      if (Array.isArray(value)) {
        value.forEach(item => url.searchParams.append(key, item))
      } else if (value != null) {
        url.searchParams.set(key, value)
      }
    }

    // Browsers block fetch() for file:// URLs. The widgets demo embeds the
    // refresh response in the same document, so use that local template there.
    if (url.protocol === 'file:' && url.pathname === window.location.pathname && this._settings.sourceSelector) {
      const localSource = document.querySelector(this._settings.sourceSelector)
      if (localSource) {
        const content = localSource.innerHTML
        if (this._settings.loadInContent) {
          const target = this._parent.querySelector(this._settings.content)
          if (target) {
            target.innerHTML = content
          }
        }

        this._settings.onLoadDone.call(this._element, content)
        this._removeOverlay()
        return
      }
    }

    let response
    try {
      response = await fetch(url, { signal: this._controller.signal })
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }

      let content = this._settings.responseType === 'json' ? await response.json() : await response.text()
      if (this._settings.loadInContent) {
        if (this._settings.sourceSelector) {
          const parser = new DOMParser()
          const remote = parser.parseFromString(String(content), 'text/html')
          content = remote.querySelector(this._settings.sourceSelector)?.innerHTML ?? ''
        }

        const target = this._parent.querySelector(this._settings.content)
        if (target) {
          target.innerHTML = typeof content === 'string' ? content : JSON.stringify(content)
        }
      }

      this._settings.onLoadDone.call(this._element, content)
      this._removeOverlay()
    } catch (error) {
      if (error.name === 'AbortError') {
        return
      }

      this._removeOverlay()
      if (this._settings.loadErrorTemplate) {
        const target = this._parent.querySelector(this._settings.content)
        if (target) {
          const template = document.createElement('template')
          template.innerHTML = this._settings.errorTemplate
          const message = template.content.firstElementChild ?? document.createElement('span')
          message.textContent = error.message
          target.replaceChildren(message)
        }
      }

      this._settings.onLoadFail.call(this._element, response, 'error', error)
    }
  }

  _addOverlay() {
    const template = document.createElement('template')
    template.innerHTML = this._settings.overlayTemplate.trim()
    this._overlay = template.content.firstElementChild
    if (this._overlay) {
      this._parent.append(this._overlay)
    }

    dispatch(this._element, EVENT_OVERLAY_ADDED)
  }

  _removeOverlay() {
    if (!this._overlay) {
      return
    }

    this._overlay?.remove()
    this._overlay = null
    dispatch(this._element, EVENT_OVERLAY_REMOVED)
  }

  init() {
    if (this._initialized) {
      return
    }

    this._initialized = true
    if (this._settings.loadOnInit) {
      this.load()
    }
  }

  static getInstance(element) {
    return getInstance(CardRefresh, element)
  }

  static getOrCreateInstance(element, config = {}) {
    return CardRefresh.getInstance(element) ?? new CardRefresh(element, config)
  }
}

delegate(document, 'click', SELECTOR_DATA_REFRESH, (event, element) => {
  event.preventDefault()
  CardRefresh.getOrCreateInstance(element).load()
})

onReady(() => {
  document.querySelectorAll(SELECTOR_DATA_REFRESH).forEach(element => CardRefresh.getOrCreateInstance(element).init())
})

export default CardRefresh
