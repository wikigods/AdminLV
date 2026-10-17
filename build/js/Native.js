const componentInstances = new WeakMap()

export function getInstance(Component, element) {
  return componentInstances.get(Component)?.get(element) ?? null
}

export function setInstance(Component, element, instance) {
  let instances = componentInstances.get(Component)
  if (!instances) {
    instances = new WeakMap()
    componentInstances.set(Component, instances)
  }

  instances.set(element, instance)
}

export function getOrCreateInstance(Component, element, config = {}) {
  return getInstance(Component, element) ?? new Component(element, config)
}

export function getConfig(element, defaults, config = {}) {
  const result = { ...defaults }

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const value = element.dataset[key]
    if (value === undefined) {
      continue
    }

    if (typeof defaultValue === 'boolean') {
      result[key] = value === 'true'
    } else if (typeof defaultValue === 'number') {
      result[key] = Number(value)
    } else if (defaultValue !== null && typeof defaultValue === 'object') {
      try {
        result[key] = JSON.parse(value)
      } catch {
        result[key] = value
      }
    } else {
      result[key] = value
    }
  }

  return Object.assign(result, config)
}

export function dispatch(element, eventName, detail = {}) {
  element.dispatchEvent(new CustomEvent(eventName, {
    bubbles: true,
    detail
  }))
}

export function delegate(root, eventName, selector, callback) {
  root.addEventListener(eventName, event => {
    const target = event.target instanceof Element ? event.target.closest(selector) : null
    if (target && root.contains(target)) {
      callback(event, target)
    }
  })
}

export function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true })
  } else {
    callback()
  }
}

export function animateHeight(element, expand, duration = 300, done = () => {}) {
  let finished = false
  const startHeight = element.getBoundingClientRect().height
  const endHeight = expand ? element.scrollHeight : 0

  element.style.overflow = 'hidden'
  element.style.height = `${startHeight}px`
  element.hidden = false

  requestAnimationFrame(() => {
    element.style.transition = `height ${duration}ms ease`
    element.style.height = `${endHeight}px`
  })

  const finish = event => {
    if (finished || (event && event.target !== element)) {
      return
    }

    finished = true
    element.removeEventListener('transitionend', finish)
    element.style.removeProperty('transition')
    element.style.removeProperty('height')
    element.style.removeProperty('overflow')
    if (!expand) {
      element.hidden = true
    }

    done()
  }

  element.addEventListener('transitionend', finish)
  window.setTimeout(() => finish(), duration + 50)
}
