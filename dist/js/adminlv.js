/*!
 * AdminLV v2.0.4 (https://github.com/wikigods/AdminLV)
 * Copyright 2014-2026 Colorlib <https://colorlib.com>
 * Licensed under MIT (https://github.com/ColorlibHQ/AdminLTE/blob/master/LICENSE)
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.adminlte = {}));
})(this, (function (exports) { 'use strict';

  const componentInstances = new WeakMap();
  function getInstance(Component, element) {
    return componentInstances.get(Component)?.get(element) ?? null;
  }
  function setInstance(Component, element, instance) {
    let instances = componentInstances.get(Component);
    if (!instances) {
      instances = new WeakMap();
      componentInstances.set(Component, instances);
    }
    instances.set(element, instance);
  }
  function getOrCreateInstance(Component, element, config = {}) {
    return getInstance(Component, element) ?? new Component(element, config);
  }
  function getConfig(element, defaults, config = {}) {
    const result = {
      ...defaults
    };
    for (const [key, defaultValue] of Object.entries(defaults)) {
      const value = element.dataset[key];
      if (value === undefined) {
        continue;
      }
      if (typeof defaultValue === 'boolean') {
        result[key] = value === 'true';
      } else if (typeof defaultValue === 'number') {
        result[key] = Number(value);
      } else if (defaultValue !== null && typeof defaultValue === 'object') {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
    return Object.assign(result, config);
  }
  function dispatch(element, eventName, detail = {}) {
    element.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      detail
    }));
  }
  function delegate(root, eventName, selector, callback) {
    root.addEventListener(eventName, event => {
      const target = event.target instanceof Element ? event.target.closest(selector) : null;
      if (target && root.contains(target)) {
        callback(event, target);
      }
    });
  }
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, {
        once: true
      });
    } else {
      callback();
    }
  }
  function animateHeight(element, expand, duration = 300, done = () => {}) {
    let finished = false;
    const startHeight = element.getBoundingClientRect().height;
    const endHeight = expand ? element.scrollHeight : 0;
    element.style.overflow = 'hidden';
    element.style.height = `${startHeight}px`;
    element.hidden = false;
    requestAnimationFrame(() => {
      element.style.transition = `height ${duration}ms ease`;
      element.style.height = `${endHeight}px`;
    });
    const finish = event => {
      if (finished || event && event.target !== element) {
        return;
      }
      finished = true;
      element.removeEventListener('transitionend', finish);
      element.style.removeProperty('transition');
      element.style.removeProperty('height');
      element.style.removeProperty('overflow');
      if (!expand) {
        element.hidden = true;
      }
      done();
    };
    element.addEventListener('transitionend', finish);
    window.setTimeout(() => finish(), duration + 50);
  }

  const EVENT_LOADED = 'loaded.lte.cardrefresh';
  const EVENT_OVERLAY_ADDED = 'overlay.added.lte.cardrefresh';
  const EVENT_OVERLAY_REMOVED = 'overlay.removed.lte.cardrefresh';
  const SELECTOR_DATA_REFRESH = '[data-card-widget="card-refresh"]';
  const Default$4 = {
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
      return response;
    },
    onLoadFail() {}
  };
  class CardRefresh {
    constructor(element, settings = {}) {
      this._element = element;
      this._settings = getConfig(element, Default$4, settings);
      this._parent = element.matches('.card') ? element : element.closest('.card');
      this._initialized = false;
      this._controller = null;
      if (!this._parent) {
        throw new Error('CardRefresh control must be inside a .card element.');
      }
      if (!this._settings.source) {
        throw new Error('Source url was not defined. Please specify a url in your CardRefresh source option.');
      }
      setInstance(CardRefresh, element, this);
    }
    async load() {
      this._controller?.abort();
      this._controller = new AbortController();
      this._removeOverlay();
      this._addOverlay();
      this._settings.onLoadStart.call(this._element);
      dispatch(this._element, EVENT_LOADED);

      // fetch and URL are unavailable in legacy Opera Mini, which is outside the supported browser set.
      const url = new URL(this._settings.source, window.location.href);
      for (const [key, value] of Object.entries(this._settings.params ?? {})) {
        if (Array.isArray(value)) {
          value.forEach(item => url.searchParams.append(key, item));
        } else if (value != null) {
          url.searchParams.set(key, value);
        }
      }

      // Browsers block fetch() for file:// URLs. The widgets demo embeds the
      // refresh response in the same document, so use that local template there.
      if (url.protocol === 'file:' && url.pathname === window.location.pathname && this._settings.sourceSelector) {
        const localSource = document.querySelector(this._settings.sourceSelector);
        if (localSource) {
          const content = localSource.innerHTML;
          if (this._settings.loadInContent) {
            const target = this._parent.querySelector(this._settings.content);
            if (target) {
              target.innerHTML = content;
            }
          }
          this._settings.onLoadDone.call(this._element, content);
          this._removeOverlay();
          return;
        }
      }
      let response;
      try {
        response = await fetch(url, {
          signal: this._controller.signal
        });
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        let content = this._settings.responseType === 'json' ? await response.json() : await response.text();
        if (this._settings.loadInContent) {
          if (this._settings.sourceSelector) {
            const parser = new DOMParser();
            const remote = parser.parseFromString(String(content), 'text/html');
            content = remote.querySelector(this._settings.sourceSelector)?.innerHTML ?? '';
          }
          const target = this._parent.querySelector(this._settings.content);
          if (target) {
            target.innerHTML = typeof content === 'string' ? content : JSON.stringify(content);
          }
        }
        this._settings.onLoadDone.call(this._element, content);
        this._removeOverlay();
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        this._removeOverlay();
        if (this._settings.loadErrorTemplate) {
          const target = this._parent.querySelector(this._settings.content);
          if (target) {
            const template = document.createElement('template');
            template.innerHTML = this._settings.errorTemplate;
            const message = template.content.firstElementChild ?? document.createElement('span');
            message.textContent = error.message;
            target.replaceChildren(message);
          }
        }
        this._settings.onLoadFail.call(this._element, response, 'error', error);
      }
    }
    _addOverlay() {
      const template = document.createElement('template');
      template.innerHTML = this._settings.overlayTemplate.trim();
      this._overlay = template.content.firstElementChild;
      if (this._overlay) {
        this._parent.append(this._overlay);
      }
      dispatch(this._element, EVENT_OVERLAY_ADDED);
    }
    _removeOverlay() {
      if (!this._overlay) {
        return;
      }
      this._overlay?.remove();
      this._overlay = null;
      dispatch(this._element, EVENT_OVERLAY_REMOVED);
    }
    init() {
      if (this._initialized) {
        return;
      }
      this._initialized = true;
      if (this._settings.loadOnInit) {
        this.load();
      }
    }
    static getInstance(element) {
      return getInstance(CardRefresh, element);
    }
    static getOrCreateInstance(element, config = {}) {
      return CardRefresh.getInstance(element) ?? new CardRefresh(element, config);
    }
  }
  delegate(document, 'click', SELECTOR_DATA_REFRESH, (event, element) => {
    event.preventDefault();
    CardRefresh.getOrCreateInstance(element).load();
  });
  onReady(() => {
    document.querySelectorAll(SELECTOR_DATA_REFRESH).forEach(element => CardRefresh.getOrCreateInstance(element).init());
  });

  /**
   * AdminLV CardWidget.js
   * Native JavaScript implementation
   */

  const EVENT_KEY$1 = '.lte.cardwidget';
  const EVENT_EXPANDED$2 = `expanded${EVENT_KEY$1}`;
  const EVENT_COLLAPSED$2 = `collapsed${EVENT_KEY$1}`;
  const EVENT_MAXIMIZED = `maximized${EVENT_KEY$1}`;
  const EVENT_MINIMIZED = `minimized${EVENT_KEY$1}`;
  const EVENT_REMOVED = `removed${EVENT_KEY$1}`;
  const CARD = '.card';
  const COLLAPSED$1 = 'collapsed-card';
  const MAXIMIZED = 'maximized-card';
  const DEFAULT$6 = {
    animationSpeed: 300,
    collapseTrigger: '[data-card-widget="collapse"]',
    removeTrigger: '[data-card-widget="remove"]',
    maximizeTrigger: '[data-card-widget="maximize"]',
    collapseIcon: 'fa-minus',
    expandIcon: 'fa-plus',
    maximizeIcon: 'fa-expand',
    minimizeIcon: 'fa-compress'
  };
  class CardWidget {
    constructor(element, config = {}) {
      this._element = element;
      this._config = getConfig(element, DEFAULT$6, config);
      if (!Number.isFinite(Number(this._config.animationSpeed))) {
        this._config.animationSpeed = this._config.animationSpeed === 'fast' ? 200 : this._config.animationSpeed === 'slow' ? 600 : 400;
      } else {
        this._config.animationSpeed = Number(this._config.animationSpeed);
      }
      this._card = element.matches(CARD) ? element : element.closest(CARD);
      setInstance(CardWidget, element, this);
    }
    collapse() {
      if (!this._card) {
        return;
      }
      this._card.classList.add('collapsing-card');
      this._card.querySelectorAll(':scope > .card-body, :scope > .card-footer').forEach(child => {
        child.style.transition = `height ${this._config.animationSpeed}ms ease`;
        child.style.height = `${child.getBoundingClientRect().height}px`;
        requestAnimationFrame(() => {
          child.style.height = '0px';
          child.style.overflow = 'hidden';
        });
        window.setTimeout(() => {
          child.hidden = true;
          child.style.removeProperty('height');
          child.style.removeProperty('overflow');
          child.style.removeProperty('transition');
        }, this._config.animationSpeed);
      });
      window.setTimeout(() => {
        this._card.classList.add(COLLAPSED$1);
        this._card.classList.remove('collapsing-card');
      }, this._config.animationSpeed);
      this._updateIcon(this._config.collapseTrigger, this._config.collapseIcon, this._config.expandIcon);
      dispatch(this._element, EVENT_COLLAPSED$2, {
        card: this._card
      });
    }
    expand() {
      if (!this._card) {
        return;
      }
      this._card.classList.add('expanding-card');
      this._card.classList.remove(COLLAPSED$1);
      this._card.querySelectorAll(':scope > .card-body, :scope > .card-footer').forEach(child => {
        child.hidden = false;
        child.style.display = '';
        const height = child.scrollHeight;
        child.style.height = '0px';
        child.style.overflow = 'hidden';
        requestAnimationFrame(() => {
          child.style.transition = `height ${this._config.animationSpeed}ms ease`;
          child.style.height = `${height}px`;
        });
        window.setTimeout(() => {
          child.style.removeProperty('height');
          child.style.removeProperty('overflow');
          child.style.removeProperty('transition');
        }, this._config.animationSpeed);
      });
      this._card.classList.remove('expanding-card');
      this._updateIcon(this._config.collapseTrigger, this._config.expandIcon, this._config.collapseIcon);
      dispatch(this._element, EVENT_EXPANDED$2, {
        card: this._card
      });
    }
    remove() {
      const card = this._card;
      if (!card) {
        return;
      }
      card.style.transition = `height ${this._config.animationSpeed}ms ease`;
      card.style.height = `${card.getBoundingClientRect().height}px`;
      requestAnimationFrame(() => {
        card.style.height = '0px';
        card.style.overflow = 'hidden';
      });
      dispatch(this._element, EVENT_REMOVED, {
        card
      });
      window.setTimeout(() => card.remove(), this._config.animationSpeed);
    }
    toggle() {
      if (this._card?.classList.contains(COLLAPSED$1)) {
        this.expand();
      } else {
        this.collapse();
      }
    }
    maximize() {
      if (!this._card || this._card.classList.contains(MAXIMIZED)) {
        return;
      }
      const card = this._card;
      const rect = card.getBoundingClientRect();
      card.style.height = `${rect.height}px`;
      card.style.width = `${rect.width}px`;
      card.style.position = 'fixed';
      card.style.transition = 'all .15s';
      window.setTimeout(() => {
        card.classList.add(MAXIMIZED);
        document.documentElement.classList.add(MAXIMIZED);
        if (card.classList.contains(COLLAPSED$1)) {
          card.classList.add('was-collapsed');
        }
        card.style.removeProperty('position');
        this._updateIcon(this._config.maximizeTrigger, this._config.maximizeIcon, this._config.minimizeIcon);
      }, 150);
      dispatch(this._element, EVENT_MAXIMIZED, {
        card
      });
    }
    minimize() {
      if (!this._card) {
        return;
      }
      const card = this._card;
      card.classList.remove(MAXIMIZED);
      document.documentElement.classList.remove(MAXIMIZED);
      card.style.height = 'inherit';
      card.style.width = 'inherit';
      card.style.removeProperty('transition');
      card.classList.remove('was-collapsed');
      this._updateIcon(this._config.maximizeTrigger, this._config.minimizeIcon, this._config.maximizeIcon);
      dispatch(this._element, EVENT_MINIMIZED, {
        card
      });
    }
    toggleMaximize() {
      if (this._card?.classList.contains(MAXIMIZED)) {
        this.minimize();
      } else {
        this.maximize();
      }
    }
    _updateIcon(trigger, from, to) {
      this._card?.querySelectorAll(`${trigger} .${from}`).forEach(icon => {
        icon.classList.remove(from);
        icon.classList.add(to);
      });
    }
    static getOrCreateInstance(element, config = {}) {
      return getOrCreateInstance(CardWidget, element, config);
    }
    static _interface(element, method) {
      const instance = CardWidget.getOrCreateInstance(element);
      if (method) {
        instance[method]();
      } else {
        setInstance(CardWidget, element, instance);
      }
    }
  }
  delegate(document, 'click', '[data-card-widget="collapse"], [data-card-widget="remove"], [data-card-widget="maximize"]', (event, trigger) => {
    event.preventDefault();
    const action = trigger.dataset.cardWidget === 'collapse' ? 'toggle' : trigger.dataset.cardWidget === 'remove' ? 'remove' : 'toggleMaximize';
    CardWidget._interface(trigger, action);
  });

  /** AdminLV ControlSidebar, implemented without jQuery. */
  /* eslint-disable max-statements-per-line */
  const KEY = '.lte.controlsidebar';
  const SELECTOR = '.control-sidebar';
  const CLASS_OPEN = 'control-sidebar-open';
  const CLASS_SLIDE = 'control-sidebar-slide-open';
  const CLASS_ANIMATE = 'control-sidebar-animate';
  const DEFAULT$5 = {
    controlsidebarSlide: true,
    scrollbarTheme: 'os-theme-light',
    scrollbarAutoHide: 'l',
    target: SELECTOR,
    animationSpeed: 300
  };
  class ControlSidebar {
    constructor(element, config = {}) {
      this._element = element;
      this._config = getConfig(element, DEFAULT$5, config);
      setInstance(ControlSidebar, element, this);
      this._init();
    }
    collapse() {
      const {
        body
      } = document;
      if (this._config.controlsidebarSlide) {
        document.documentElement.classList.add(CLASS_ANIMATE);
        body.classList.remove(CLASS_SLIDE);
        window.setTimeout(() => {
          document.querySelectorAll(SELECTOR).forEach(sidebar => {
            sidebar.style.display = 'none';
          });
          document.documentElement.classList.remove(CLASS_ANIMATE);
        }, 300);
      } else {
        body.classList.remove(CLASS_OPEN);
      }
      dispatch(this._element, `collapsed${KEY}`);
      window.setTimeout(() => dispatch(this._element, `collapsed-done${KEY}`), this._config.animationSpeed);
    }
    show(toggle = false) {
      const {
        body
      } = document;
      const target = document.querySelector(this._config.target);
      if (!target) {
        return;
      }
      if (toggle) {
        document.querySelectorAll(SELECTOR).forEach(sidebar => {
          sidebar.style.display = 'none';
        });
      }
      if (this._config.controlsidebarSlide) {
        document.documentElement.classList.add(CLASS_ANIMATE);
        target.style.display = 'block';
        window.setTimeout(() => {
          body.classList.add(CLASS_SLIDE);
          window.setTimeout(() => document.documentElement.classList.remove(CLASS_ANIMATE), 300);
        }, 10);
      } else {
        target.style.display = 'block';
        body.classList.add(CLASS_OPEN);
      }
      this._fixHeight();
      this._fixScrollHeight();
      dispatch(this._element, `expanded${KEY}`);
    }
    toggle() {
      const target = document.querySelector(this._config.target);
      const {
        body
      } = document;
      const isOpen = body.classList.contains(CLASS_OPEN) || body.classList.contains(CLASS_SLIDE);
      if (!target || getComputedStyle(target).display === 'none' || !isOpen) {
        this.show(!isOpen);
      } else {
        this.collapse();
      }
    }
    _init() {
      const open = document.body.classList.contains(CLASS_OPEN) || document.body.classList.contains(CLASS_SLIDE);
      document.querySelectorAll(SELECTOR).forEach(sidebar => {
        if (open && sidebar.matches(this._config.target)) {
          sidebar.style.display = 'block';
        } else if (!open) {
          sidebar.style.display = 'none';
        }
      });
      this._fixHeight();
      this._fixScrollHeight();
      if (!this._listeners) {
        this._listeners = true;
        window.addEventListener('resize', () => {
          this._fixHeight();
          this._fixScrollHeight();
        });
        window.addEventListener('scroll', () => {
          if (document.body.classList.contains(CLASS_OPEN) || document.body.classList.contains(CLASS_SLIDE)) {
            this._fixScrollHeight();
          }
        });
      }
    }
    _isNavbarFixed() {
      return ['layout-navbar-fixed', 'layout-sm-navbar-fixed', 'layout-md-navbar-fixed', 'layout-lg-navbar-fixed', 'layout-xl-navbar-fixed'].some(cls => document.body.classList.contains(cls));
    }
    _isFooterFixed() {
      return ['layout-footer-fixed', 'layout-sm-footer-fixed', 'layout-md-footer-fixed', 'layout-lg-footer-fixed', 'layout-xl-footer-fixed'].some(cls => document.body.classList.contains(cls));
    }
    _fixHeight() {
      const content = document.querySelector(`${this._config.target} .control-sidebar-content`);
      if (!content) {
        return;
      }
      if (!document.body.classList.contains('layout-fixed')) {
        content.removeAttribute('style');
        return;
      }
      const header = document.querySelector('.main-header')?.getBoundingClientRect().height || 0;
      const footer = document.querySelector('.main-footer')?.getBoundingClientRect().height || 0;
      const footerFixed = this._isFooterFixed() && getComputedStyle(document.querySelector('.main-footer') || document.body).position === 'fixed';
      content.style.height = `${window.innerHeight - header - (footerFixed ? footer : 0)}px`;
      content.style.overflowY = 'auto';
    }
    _fixScrollHeight() {
      if (!document.body.classList.contains('layout-fixed')) {
        return;
      }
      const sidebar = document.querySelector(this._config.target);
      const content = sidebar?.querySelector('.control-sidebar-content');
      if (!sidebar || !content) {
        return;
      }
      const header = document.querySelector('.main-header')?.getBoundingClientRect().height || 0;
      const footer = document.querySelector('.main-footer')?.getBoundingClientRect().height || 0;
      const top = window.scrollY;
      const bottom = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - top);
      const navFixed = this._isNavbarFixed() && getComputedStyle(document.querySelector('.main-header') || document.body).position === 'fixed';
      const footerFixed = this._isFooterFixed() && getComputedStyle(document.querySelector('.main-footer') || document.body).position === 'fixed';
      if (top === 0 && bottom === 0) {
        sidebar.style.top = `${header}px`;
        sidebar.style.bottom = `${footer}px`;
        content.style.height = `${window.innerHeight - header - footer}px`;
      } else if (bottom <= footer && !footerFixed) {
        sidebar.style.bottom = `${footer - bottom}px`;
        sidebar.style.top = `${Math.max(0, header - top)}px`;
        content.style.height = `${window.innerHeight - footer + bottom}px`;
      } else if (top <= header && !navFixed) {
        sidebar.style.top = `${header - top}px`;
        content.style.height = `${window.innerHeight - header + top}px`;
      } else if (!navFixed) {
        sidebar.style.top = '0';
        content.style.height = `${window.innerHeight}px`;
      } else {
        sidebar.style.top = `${header}px`;
      }
      if (footerFixed && navFixed) {
        content.style.height = '100%';
        sidebar.style.height = '';
      }
    }
    static getOrCreateInstance(element, config = {}) {
      return getOrCreateInstance(ControlSidebar, element, config);
    }
    static _interface(element, method) {
      const instance = ControlSidebar.getOrCreateInstance(element);
      setInstance(ControlSidebar, element, instance);
      if (method) {
        instance[method]();
      }
    }
  }
  delegate(document, 'click', '[data-widget="control-sidebar"]', (event, trigger) => {
    event.preventDefault();
    ControlSidebar._interface(trigger, 'toggle');
  });
  onReady(() => document.querySelectorAll('[data-widget="control-sidebar"]').forEach(element => ControlSidebar._interface(element)));

  const EVENT_TOGGLED = 'toggled.lte.directchat';
  const SELECTOR_DATA_TOGGLE$2 = '[data-widget="chat-pane-toggle"]';
  const CLASS_NAME_DIRECT_CHAT_OPEN = 'direct-chat-contacts-open';
  class DirectChat {
    constructor(element) {
      this._element = element;
      setInstance(DirectChat, element, this);
    }
    toggle() {
      this._element.closest('.direct-chat')?.classList.toggle(CLASS_NAME_DIRECT_CHAT_OPEN);
      dispatch(this._element, EVENT_TOGGLED);
    }
    static getInstance(element) {
      return getInstance(DirectChat, element);
    }
    static getOrCreateInstance(element) {
      return DirectChat.getInstance(element) ?? new DirectChat(element);
    }
  }
  delegate(document, 'click', SELECTOR_DATA_TOGGLE$2, (event, element) => {
    event.preventDefault();
    DirectChat.getOrCreateInstance(element).toggle();
  });

  const SELECTOR_NAVBAR = '.navbar';
  const SELECTOR_DROPDOWN_MENU = '.dropdown-menu';
  const SELECTOR_DROPDOWN_TOGGLE = '[data-bs-toggle="dropdown"]';
  const SELECTOR_SUBMENU_TOGGLE = `${SELECTOR_DROPDOWN_MENU} ${SELECTOR_DROPDOWN_TOGGLE}`;
  const SELECTOR_SUBMENU_OPEN = '.dropdown-submenu .dropdown-menu.show';
  const CLASS_NAME_DROPDOWN_SUBMENU = 'dropdown-submenu';
  class Dropdown {
    constructor(element) {
      this._element = element;
      setInstance(Dropdown, element, this);
    }
    toggleSubmenu() {
      const parent = this._element.closest(`.${CLASS_NAME_DROPDOWN_SUBMENU}`);
      const submenu = this._element.nextElementSibling ?? parent?.querySelector(':scope > .dropdown-menu');
      if (!submenu) {
        return;
      }
      const isOpen = submenu.classList.toggle('show');
      submenu.style.display = isOpen ? 'block' : 'none';
      if (!isOpen) {
        parent?.closest('.dropdown-menu')?.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
          menu.style.display = 'none';
        });
      }
    }
    static getInstance(element) {
      return getInstance(Dropdown, element);
    }
    static getOrCreateInstance(element) {
      return Dropdown.getInstance(element) ?? new Dropdown(element);
    }
    static fixPosition() {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.style.left = '';
        menu.style.right = '';
        if (menu.classList.contains('dropdown-menu-end')) {
          return;
        }
        const bounds = menu.getBoundingClientRect();
        if (bounds.left < 0) {
          menu.style.left = '0';
          menu.style.right = 'auto';
        } else if (bounds.right > window.innerWidth) {
          menu.style.left = 'auto';
          menu.style.right = '0';
        }
      });
    }
  }
  document.addEventListener('click', event => {
    const element = event.target instanceof Element ? event.target.closest(SELECTOR_SUBMENU_TOGGLE) : null;
    if (!element || !element.closest(`.${CLASS_NAME_DROPDOWN_SUBMENU}`)) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    Dropdown.getOrCreateInstance(element).toggleSubmenu();
  }, true);
  document.querySelectorAll(`${SELECTOR_NAVBAR} ${SELECTOR_DROPDOWN_TOGGLE}`).forEach(toggle => {
    toggle.addEventListener('shown.bs.dropdown', () => requestAnimationFrame(Dropdown.fixPosition));
  });
  document.addEventListener('hidden.bs.dropdown', () => {
    document.querySelectorAll(SELECTOR_SUBMENU_OPEN).forEach(menu => {
      menu.classList.remove('show');
      menu.style.display = 'none';
    });
  });

  const EVENT_EXPANDED$1 = 'expanded.lte.expandableTable';
  const EVENT_COLLAPSED$1 = 'collapsed.lte.expandableTable';
  const SELECTOR_TABLE = '.expandable-table';
  const SELECTOR_DATA_TOGGLE$1 = '[data-widget="expandable-table"]';
  const CLASS_NAME_HIDDEN = 'd-none';
  function getRow(element) {
    return element.closest('tr');
  }
  function getContent(row) {
    return row?.nextElementSibling?.querySelector(':scope > td > :first-child') ?? null;
  }
  function animate(content, expand, done = () => {}) {
    if (!content) {
      done();
      return;
    }
    const {
      height
    } = content.getBoundingClientRect();
    const targetHeight = expand ? content.scrollHeight : 0;
    content.style.overflow = 'hidden';
    const animation = content.animate([{
      height: `${expand ? 0 : height}px`,
      opacity: expand ? 0 : 1
    }, {
      height: `${targetHeight}px`,
      opacity: expand ? 1 : 0
    }], {
      duration: 500,
      easing: 'ease'
    });
    animation.onfinish = () => {
      content.style.removeProperty('overflow');
      if (expand) {
        content.style.removeProperty('height');
        content.style.removeProperty('opacity');
      }
      done();
    };
  }
  class ExpandableTable {
    constructor(element) {
      this._element = element;
      setInstance(ExpandableTable, element, this);
    }
    init() {
      this._element.querySelectorAll(SELECTOR_DATA_TOGGLE$1).forEach(row => {
        const body = row.nextElementSibling;
        const content = getContent(row);
        const expanded = row.getAttribute('aria-expanded') === 'true';
        body?.classList.toggle(CLASS_NAME_HIDDEN, !expanded);
        if (content) {
          content.style.display = expanded ? '' : 'none';
        }
      });
    }
    toggleRow(trigger = this._element) {
      const row = getRow(trigger);
      if (!row) {
        return;
      }
      const body = row.nextElementSibling;
      const content = getContent(row);
      const expanded = row.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        row.setAttribute('aria-expanded', 'false');
        animate(content, false, () => body?.classList.add(CLASS_NAME_HIDDEN));
        dispatch(row, EVENT_COLLAPSED$1);
      } else {
        body?.classList.remove(CLASS_NAME_HIDDEN);
        if (content) {
          content.style.display = '';
        }
        row.setAttribute('aria-expanded', 'true');
        animate(content, true);
        dispatch(row, EVENT_EXPANDED$1);
      }
    }
    static getInstance(element) {
      return getInstance(ExpandableTable, element);
    }
    static getOrCreateInstance(element) {
      return ExpandableTable.getInstance(element) ?? new ExpandableTable(element);
    }
  }
  onReady(() => {
    document.querySelectorAll(SELECTOR_TABLE).forEach(table => {
      ExpandableTable.getOrCreateInstance(table).init();
    });
  });
  delegate(document, 'click', SELECTOR_DATA_TOGGLE$1, (_event, element) => {
    const table = element.closest(SELECTOR_TABLE) ?? element.closest('table');
    if (table) {
      ExpandableTable.getOrCreateInstance(table).toggleRow(element);
    }
  });

  const SELECTOR_DATA_WIDGET = '[data-widget="fullscreen"]';
  const SELECTOR_ICON = `${SELECTOR_DATA_WIDGET} i`;
  const Default$3 = {
    minimizeIcon: 'fa-minimize',
    maximizeIcon: 'fa-maximize'
  };
  class Fullscreen {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        ...Default$3,
        ...options
      };
      setInstance(Fullscreen, element, this);
    }
    toggle() {
      if (document.fullscreenElement) {
        return this.windowed();
      }
      return this.fullscreen();
    }
    toggleIcon() {
      const isFullscreen = Boolean(document.fullscreenElement);
      document.querySelectorAll(SELECTOR_ICON).forEach(icon => {
        icon.classList.toggle(this.options.maximizeIcon, !isFullscreen);
        icon.classList.toggle(this.options.minimizeIcon, isFullscreen);
      });
    }
    fullscreen() {
      return document.documentElement.requestFullscreen?.();
    }
    windowed() {
      return document.exitFullscreen?.();
    }
    static getInstance(element) {
      return getInstance(Fullscreen, element);
    }
    static getOrCreateInstance(element, options = {}) {
      return getOrCreateInstance(Fullscreen, element, options);
    }
  }
  delegate(document, 'click', SELECTOR_DATA_WIDGET, (event, element) => {
    event.preventDefault();
    Fullscreen.getOrCreateInstance(element).toggle();
  });
  document.addEventListener('fullscreenchange', () => {
    document.querySelectorAll(SELECTOR_DATA_WIDGET).forEach(element => {
      Fullscreen.getOrCreateInstance(element).toggleIcon();
    });
  });

  /** AdminLV IFrame, implemented without jQuery. */
  /* eslint-disable max-statements-per-line */
  const DATA = '[data-widget="iframe"]';
  const WRAPPER = '.content-wrapper';
  const NAV = `${WRAPPER}.iframe-mode .navbar-nav`;
  const TABNAV = `${NAV} .nav-link`;
  const TABCONTENT = `${WRAPPER}.iframe-mode .tab-content`;
  const EMPTY = `${TABCONTENT} .tab-empty`;
  const LOADING = `${TABCONTENT} .tab-loading`;
  const PANES = `${TABCONTENT} .tab-pane`;
  const FULLSCREEN = '[data-widget="iframe-fullscreen"]';
  const CLASS_IFRAME = 'iframe-mode';
  const CLASS_FULLSCREEN = 'iframe-mode-fullscreen';
  const DEFAULT$4 = {
    onTabClick: item => item,
    onTabChanged: item => item,
    onTabCreated: item => item,
    autoIframeMode: true,
    autoItemActive: true,
    autoShowNewTab: true,
    autoDarkMode: false,
    allowDuplicates: false,
    allowReload: true,
    loadingScreen: true,
    useNavbarItems: true,
    scrollOffset: 40,
    scrollBehaviorSwap: false,
    iconMaximize: 'fa-expand',
    iconMinimize: 'fa-compress'
  };
  class IFrame {
    constructor(element, config = {}) {
      this._element = element;
      this._config = {
        ...DEFAULT$4,
        ...config
      };
      setInstance(IFrame, element, this);
      this._init();
    }
    onTabClick(item) {
      this._config.onTabClick(item);
    }
    onTabChanged(item) {
      this._config.onTabChanged(item);
    }
    onTabCreated(item) {
      this._config.onTabCreated(item);
    }
    createTab(title, link, uniqueName, autoOpen = this._config.autoShowNewTab) {
      const nav = document.querySelector(NAV);
      const content = document.querySelector(TABCONTENT);
      if (!nav || !content) {
        return;
      }
      let suffix = '';
      if (this._config.allowDuplicates) {
        suffix = `-${Math.floor(Math.random() * 100_000)}`;
      }
      const tabId = `panel-${uniqueName}${suffix}`;
      const navId = `tab-${uniqueName}${suffix}`;
      const item = document.createElement('li');
      item.className = 'nav-item';
      item.setAttribute('role', 'presentation');
      const close = document.createElement('a');
      close.href = '#';
      close.className = 'btn-iframe-close';
      close.dataset.widget = 'iframe-close';
      close.dataset.type = 'only-this';
      const closeIcon = document.createElement('i');
      closeIcon.className = 'fa-solid fa-xmark';
      close.append(closeIcon);
      const tab = document.createElement('a');
      tab.className = 'nav-link';
      tab.dataset.bsToggle = 'tab';
      tab.id = navId;
      tab.href = `#${tabId}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', tabId);
      tab.setAttribute('aria-selected', 'false');
      tab.textContent = title;
      item.append(close, tab);
      nav.append(item);
      const pane = document.createElement('div');
      pane.className = 'tab-pane fade';
      pane.id = tabId;
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-labelledby', navId);
      const iframe = document.createElement('iframe');
      iframe.src = link;
      iframe.setAttribute('title', title);
      pane.append(iframe);
      content.append(pane);
      if (autoOpen) {
        const loading = document.querySelector(LOADING);
        let handled = false;
        const finish = () => {
          if (handled) {
            return;
          }
          handled = true;
          const delay = typeof this._config.loadingScreen === 'number' ? this._config.loadingScreen : 0;
          window.setTimeout(() => {
            this.switchTab(tab);
            if (loading) {
              loading.style.display = 'none';
            }
          }, delay);
        };
        if (this._config.loadingScreen && loading) {
          loading.style.display = 'block';
          iframe.addEventListener('load', finish, {
            once: true
          });
          iframe.addEventListener('error', finish, {
            once: true
          });
        } else {
          this.switchTab(tab);
        }
      }
      this.onTabCreated(tab);
      return tab;
    }
    openTabSidebar(item, autoOpen = this._config.autoShowNewTab) {
      const anchor = item?.closest?.('a') || item?.parentElement?.closest?.('a');
      if (!anchor) {
        return;
      }
      const link = anchor.getAttribute('href');
      if (!link || link === '#') {
        return;
      }
      const titleElement = anchor.querySelector('p');
      const title = (titleElement?.textContent || anchor.textContent).replace(/\s+/g, ' ').trim();
      const uniqueName = decodeURI(link).replace('./', '').replace(/["#&'./:=?[\]]/gi, '-').replace(/--/g, '');
      const navId = `tab-${uniqueName}`;
      const existing = document.getElementById(navId);
      if (!this._config.allowDuplicates && existing) {
        return this.switchTab(existing, this._config.allowReload);
      }
      return this.createTab(title, link, uniqueName, autoOpen);
    }
    switchTab(item, reload = false) {
      const tab = typeof item === 'string' ? document.querySelector(item) : item;
      if (!tab) {
        return;
      }
      const paneId = tab.getAttribute('aria-controls') || tab.getAttribute('href')?.slice(1);
      const pane = paneId ? document.getElementById(paneId) : null;
      const iframe = pane?.querySelector('iframe');
      document.querySelectorAll(EMPTY).forEach(element => {
        element.style.display = 'none';
      });
      const loading = document.querySelector(LOADING);
      if (reload && iframe) {
        if (this._config.loadingScreen && loading) {
          loading.style.display = 'block';
        }
        iframe.addEventListener('load', () => {
          if (loading) {
            window.setTimeout(() => {
              loading.style.display = 'none';
            }, typeof this._config.loadingScreen === 'number' ? this._config.loadingScreen : 0);
          }
        }, {
          once: true
        });
        iframe.src = iframe.getAttribute('src');
      }
      document.querySelectorAll(`${NAV} .active`).forEach(el => el.classList.remove('active'));
      const Tab = window.bootstrap?.Tab;
      if (!Tab) {
        throw new Error('Bootstrap 5 Tab is required for AdminLV iframe tabs.');
      }
      Tab.getOrCreateInstance(tab).show();
      tab.closest('.nav-item')?.classList.add('active');
      this._fixHeight();
      this.onTabChanged(tab);
      if (this._config.autoItemActive && iframe) {
        this._setItemActive(iframe.src);
      }
    }
    removeActiveTab(type, element) {
      const navItems = [...document.querySelectorAll(`${NAV} .nav-item`)];
      const active = document.querySelector(`${NAV} .nav-item.active`);
      if (type === 'all') {
        navItems.forEach(item => item.remove());
        document.querySelectorAll(PANES).forEach(pane => pane.remove());
        document.querySelectorAll(EMPTY).forEach(el => {
          el.style.display = 'flex';
        });
        return;
      }
      if (type === 'all-other') {
        navItems.filter(item => !item.classList.contains('active')).forEach(item => item.remove());
        document.querySelectorAll(`${PANES}:not(.active)`).forEach(pane => pane.remove());
        return;
      }
      const item = type === 'only-this' ? element?.closest('.nav-item') : active;
      if (!item) {
        return;
      }
      const index = navItems.indexOf(item);
      const tab = item.querySelector('.nav-link');
      const paneId = tab?.getAttribute('aria-controls') || tab?.getAttribute('href')?.slice(1);
      item.remove();
      if (paneId) {
        document.getElementById(paneId)?.remove();
      }
      const remaining = [...document.querySelectorAll(`${NAV} .nav-link`)];
      if (remaining.length === 0) {
        document.querySelectorAll(EMPTY).forEach(el => {
          el.style.display = 'flex';
        });
      } else {
        this.switchTab(remaining[Math.max(0, index - 1)]);
      }
    }
    toggleFullscreen() {
      const enabled = document.body.classList.toggle(CLASS_FULLSCREEN);
      document.querySelectorAll(`${FULLSCREEN} i`).forEach(icon => {
        icon.classList.toggle(this._config.iconMinimize, enabled);
        icon.classList.toggle(this._config.iconMaximize, !enabled);
      });
      if (!enabled) {
        document.querySelectorAll(`${EMPTY}, ${LOADING}, ${WRAPPER}, ${SELECTOR_IFRAME}`).forEach(el => {
          el.style.height = '100%';
        });
      }
      window.dispatchEvent(new Event('resize'));
      this._fixHeight(true);
    }
    _init() {
      this._initFrameElement();
      this._setupListeners();
      this._fixHeight(true);
      const panes = document.querySelectorAll(PANES);
      if (document.querySelector(TABCONTENT)?.children.length > 2) {
        const first = panes[0];
        const link = document.getElementById(first.getAttribute('aria-labelledby'));
        if (link) {
          this.switchTab(link, true);
        }
      }
    }
    _initFrameElement() {
      if (window.frameElement && this._config.autoIframeMode) {
        document.body.classList.add(CLASS_IFRAME);
        if (this._config.autoDarkMode) {
          document.body.setAttribute('data-bs-theme', 'dark');
        }
      }
    }
    _navScroll(offset) {
      const nav = document.querySelector(NAV);
      nav?.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
    _setupListeners() {
      if (this._listeners) {
        return;
      }
      this._listeners = true;
      window.addEventListener('resize', () => window.setTimeout(() => this._fixHeight(), 1));
      if (document.querySelector(`${WRAPPER}.${CLASS_IFRAME}`)) {
        delegate(document, 'click', '.main-sidebar .nav-item > a.nav-link, .sidebar-search-results .list-group-item', (event, target) => {
          event.preventDefault();
          this.openTabSidebar(target);
        });
        if (this._config.useNavbarItems) {
          delegate(document, 'click', '.main-header .nav-item a.nav-link, .main-header a.dropdown-item', (event, target) => {
            event.preventDefault();
            this.openTabSidebar(target);
          });
        }
      }
      delegate(document, 'click', TABNAV, (event, target) => {
        event.preventDefault();
        this.onTabClick(target);
        this.switchTab(target);
      });
      delegate(document, 'click', '[data-widget="iframe-close"]', (event, target) => {
        event.preventDefault();
        this.removeActiveTab(target.dataset.type, target);
      });
      delegate(document, 'click', FULLSCREEN, event => {
        event.preventDefault();
        this.toggleFullscreen();
      });
      let interval = null;
      const scroll = direction => {
        const offset = this._config.scrollOffset * (this._config.scrollBehaviorSwap ? -direction : direction);
        this._navScroll(offset);
        interval = window.setInterval(() => this._navScroll(offset), 250);
      };
      delegate(document, 'mousedown', '[data-widget="iframe-scrollleft"]', event => {
        event.preventDefault();
        clearInterval(interval);
        scroll(-1);
      });
      delegate(document, 'mousedown', '[data-widget="iframe-scrollright"]', event => {
        event.preventDefault();
        clearInterval(interval);
        scroll(1);
      });
      document.addEventListener('mouseup', () => {
        clearInterval(interval);
        interval = null;
      });
    }
    _setItemActive(href) {
      document.querySelectorAll('.main-sidebar .nav-item > a.nav-link, .main-header a.dropdown-item, .main-header .nav-item a.nav-link').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.main-header .nav-item').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.main-sidebar .nav-item > a.nav-link, .main-header a.dropdown-item, .main-header .nav-item a.nav-link').forEach(el => {
        if (el.href !== href) {
          return;
        }
        el.classList.add('active');
        el.closest('.main-header .nav-item')?.classList.add('active');
        let parent = el.closest('.nav-treeview')?.previousElementSibling;
        while (parent?.matches('.nav-link')) {
          parent.classList.add('active');
          parent = parent.closest('.nav-item')?.parentElement?.closest('.nav-item')?.querySelector(':scope > .nav-link');
        }
      });
    }
    _fixHeight(tabEmpty = false) {
      const wrapper = document.querySelector(WRAPPER);
      const nav = document.querySelector(`${WRAPPER}.iframe-mode .nav`);
      if (!wrapper || !nav) {
        return;
      }
      const navbarHeight = nav.getBoundingClientRect().height;
      if (document.body.classList.contains(CLASS_FULLSCREEN)) {
        const height = window.innerHeight - navbarHeight;
        document.querySelectorAll(`${EMPTY}, ${LOADING}, ${SELECTOR_IFRAME}`).forEach(el => {
          el.style.height = `${height}px`;
        });
        wrapper.style.height = `${window.innerHeight}px`;
      } else {
        const height = wrapper.getBoundingClientRect().height - navbarHeight;
        if (tabEmpty) {
          window.setTimeout(() => document.querySelectorAll(`${EMPTY}, ${LOADING}`).forEach(el => {
            el.style.height = `${height}px`;
          }), 50);
        } else {
          document.querySelectorAll(SELECTOR_IFRAME).forEach(el => {
            el.style.height = `${height}px`;
          });
        }
      }
    }
    static getOrCreateInstance(element, config = {}) {
      return getOrCreateInstance(IFrame, element, config);
    }
    static _interface() {
      const element = document.querySelector(DATA);
      if (element) {
        const saved = getSavedOptions();
        const config = getConfig(element, DEFAULT$4, saved);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        const instance = IFrame.getOrCreateInstance(element, config);
        setInstance(IFrame, element, instance);
        window.iFrameInstance = instance;
      } else {
        const saved = getSavedOptions();
        const config = {
          ...DEFAULT$4,
          ...saved
        };
        const instance = new IFrame(document.body, config);
        window.iFrameInstance = instance;
        instance._initFrameElement();
      }
    }
  }
  const STORAGE_KEY = 'AdminLV:IFrame:Options';
  const LEGACY_STORAGE_KEY = 'AdminLTE:IFrame:Options';
  function getSavedOptions() {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }
  const SELECTOR_IFRAME = `${WRAPPER} iframe`;
  onReady(IFrame._interface);

  /** AdminLV Layout, implemented without jQuery. */
  /* eslint-disable max-statements-per-line */
  const SELECTOR_CONTENT = '.content-wrapper';
  const CLASS_FIXED = 'layout-fixed';
  const DEFAULT$3 = {
    scrollbarTheme: 'os-theme-light',
    scrollbarAutoHide: 'l',
    panelAutoHeight: true,
    panelAutoHeightMode: 'min-height',
    preloadDuration: 200,
    loginRegisterAutoHeight: true
  };
  class Layout {
    constructor(element, config = {}) {
      this._element = element;
      this._config = getConfig(element, DEFAULT$3, config);
      setInstance(Layout, element, this);
    }
    fixLayoutHeight(extra = null) {
      const {
        body
      } = document;
      const first = selector => document.querySelector(selector);
      const height = selector => first(selector)?.getBoundingClientRect().height || 0;
      const control = body.classList.contains('control-sidebar-slide-open') || body.classList.contains('control-sidebar-open') || extra === 'control_sidebar' ? height('.control-sidebar-content') : 0;
      const heights = {
        window: window.innerHeight,
        header: height('.main-header'),
        footer: height('.main-footer'),
        sidebar: height('.main-sidebar .sidebar'),
        control
      };
      const max = Math.max(...Object.values(heights));
      const content = first(SELECTOR_CONTENT);
      let offset = this._config.panelAutoHeight;
      if (offset === true) {
        offset = 0;
      }
      if (content && offset !== false) {
        let minHeight = max === heights.control ? max + offset : max === heights.window ? max + offset - heights.header - heights.footer : max + offset - heights.header;
        if (getComputedStyle(first('.main-footer') || body).position === 'fixed') {
          minHeight += heights.footer;
        }
        content.style[this._config.panelAutoHeightMode] = `${minHeight}px`;
      }
      if (body.classList.contains(CLASS_FIXED)) {
        const sidebar = first('.main-sidebar .sidebar');
        if (sidebar) {
          sidebar.style.overflowY = 'auto';
        }
      }
    }
    fixLoginRegisterHeight() {
      const {
        body
      } = document;
      const html = document.documentElement;
      if (body.classList.contains('iframe-mode')) {
        body.style.height = '100%';
        html.style.height = '100%';
        const wrapper = document.querySelector('.wrapper');
        if (wrapper) {
          wrapper.style.height = '100%';
        }
        return;
      }
      const box = document.querySelector('.login-box, .register-box');
      if (!box) {
        body.style.height = 'auto';
        html.style.height = 'auto';
        return;
      }
      body.style[this._config.panelAutoHeightMode] = `${box.getBoundingClientRect().height}px`;
    }
    _init() {
      this.fixLayoutHeight();
      if (this._config.loginRegisterAutoHeight === true) {
        this.fixLoginRegisterHeight();
      } else if (this._config.loginRegisterAutoHeight !== false && Number.isInteger(Number(this._config.loginRegisterAutoHeight))) {
        window.setInterval(() => this.fixLoginRegisterHeight(), Number(this._config.loginRegisterAutoHeight));
      }
      window.addEventListener('resize', () => {
        this.fixLayoutHeight();
        this.fixLoginRegisterHeight();
      });
      document.addEventListener('collapsed.lte.treeview', () => this.fixLayoutHeight());
      document.addEventListener('expanded.lte.treeview', () => this.fixLayoutHeight());
      document.addEventListener('mouseenter', event => {
        if (event.target.matches?.('.main-sidebar') && document.body.classList.contains('sidebar-collapse')) {
          this.fixLayoutHeight();
        }
      }, true);
      document.addEventListener('mouseleave', event => {
        if (event.target.matches?.('.main-sidebar') && document.body.classList.contains('sidebar-collapse')) {
          this.fixLayoutHeight();
        }
      }, true);
      document.addEventListener('collapsed.lte.pushmenu', () => window.setTimeout(() => this.fixLayoutHeight(), 300));
      document.addEventListener('shown.lte.pushmenu', () => window.setTimeout(() => this.fixLayoutHeight(), 300));
      document.addEventListener('collapsed.lte.controlsidebar', () => this.fixLayoutHeight());
      document.addEventListener('expanded.lte.controlsidebar', () => this.fixLayoutHeight('control_sidebar'));
      window.setTimeout(() => document.body.classList.remove('hold-transition'), 50);
      window.setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
          preloader.style.height = '0';
          window.setTimeout(() => preloader.remove(), 200);
        }
      }, this._config.preloadDuration);
    }
    static _interface(element) {
      const instance = Layout.getOrCreateInstance(element);
      instance._init();
    }
    static getInstance(element) {
      return getInstance(Layout, element);
    }
    static getOrCreateInstance(element, config = {}) {
      return getOrCreateInstance(Layout, element, config);
    }
  }
  onReady(() => {
    const {
      body
    } = document;
    Layout._interface(body);
    document.querySelectorAll('.main-sidebar .sidebar a').forEach(link => {
      link.addEventListener('focusin', () => document.querySelector('.main-sidebar')?.classList.add('sidebar-focused'));
      link.addEventListener('focusout', () => document.querySelector('.main-sidebar')?.classList.remove('sidebar-focused'));
    });
  });

  /** AdminLV PushMenu, implemented without jQuery. */
  const EVENT_KEY = '.lte.pushmenu';
  const COLLAPSED = 'sidebar-collapse';
  const OPEN = 'sidebar-open';
  const OPENING = 'sidebar-is-opening';
  const CLOSED = 'sidebar-closed';
  const DEFAULT$2 = {
    autoCollapseSize: 992,
    enableRemember: false,
    noTransitionAfterReload: true,
    animationSpeed: 300
  };
  class PushMenu {
    constructor(element, options = {}) {
      this._element = element;
      this._options = getConfig(element, DEFAULT$2, options);
      setInstance(PushMenu, element, this);
      this._addOverlay();
      this._init();
    }
    expand() {
      const {
        body
      } = document;
      if (this._options.autoCollapseSize && window.innerWidth <= this._options.autoCollapseSize) {
        body.classList.add(OPEN);
      }
      body.classList.add(OPENING);
      body.classList.remove(COLLAPSED, CLOSED);
      window.setTimeout(() => body.classList.remove(OPENING), 50);
      if (this._options.enableRemember) {
        localStorage.setItem(`remember${EVENT_KEY}`, OPEN);
      }
      dispatch(this._element, `shown${EVENT_KEY}`);
    }
    collapse() {
      const {
        body
      } = document;
      if (this._options.autoCollapseSize && window.innerWidth <= this._options.autoCollapseSize) {
        body.classList.remove(OPEN);
        body.classList.add(CLOSED);
      }
      body.classList.add(COLLAPSED);
      if (this._options.enableRemember) {
        localStorage.setItem(`remember${EVENT_KEY}`, COLLAPSED);
      }
      dispatch(this._element, `collapsed${EVENT_KEY}`);
      window.setTimeout(() => dispatch(this._element, `collapsed-done${EVENT_KEY}`), this._options.animationSpeed);
    }
    toggle() {
      if (document.body.classList.contains(COLLAPSED)) {
        this.expand();
      } else {
        this.collapse();
      }
    }
    autoCollapse(resize = false) {
      if (!this._options.autoCollapseSize) {
        return;
      }
      const {
        body
      } = document;
      if (window.innerWidth <= this._options.autoCollapseSize) {
        if (!body.classList.contains(OPEN)) {
          this.collapse();
        }
      } else if (resize) {
        if (body.classList.contains(OPEN)) {
          body.classList.remove(OPEN);
        } else if (body.classList.contains(CLOSED)) {
          this.expand();
        }
      }
    }
    remember() {
      if (!this._options.enableRemember) {
        return;
      }
      const {
        body
      } = document;
      const state = localStorage.getItem(`remember${EVENT_KEY}`);
      if (state === COLLAPSED) {
        body.classList.add(COLLAPSED);
      } else {
        body.classList.remove(COLLAPSED);
      }
      if (this._options.noTransitionAfterReload) {
        body.classList.add('hold-transition');
        window.setTimeout(() => body.classList.remove('hold-transition'), 50);
      }
    }
    _init() {
      this.remember();
      this.autoCollapse();
      if (!this._resizeHandler) {
        this._resizeHandler = () => this.autoCollapse(true);
        window.addEventListener('resize', this._resizeHandler);
      }
    }
    _addOverlay() {
      if (!document.querySelector('#sidebar-overlay')) {
        const wrapper = document.querySelector('.wrapper');
        if (!wrapper) {
          return;
        }
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        wrapper.append(overlay);
      }
    }
    static getOrCreateInstance(element, config = {}) {
      return getOrCreateInstance(PushMenu, element, config);
    }
    static _interface(element, method) {
      const instance = PushMenu.getOrCreateInstance(element);
      if (method) {
        instance[method]();
      } else {
        setInstance(PushMenu, element, instance);
      }
    }
  }
  delegate(document, 'click', '[data-widget="pushmenu"]', (event, button) => {
    event.preventDefault();
    PushMenu._interface(button, 'toggle');
  });
  delegate(document, 'click', '#sidebar-overlay', () => {
    const button = document.querySelector('[data-widget="pushmenu"]');
    if (button) {
      PushMenu._interface(button, 'collapse');
    }
  });
  onReady(() => document.querySelectorAll('[data-widget="pushmenu"]').forEach(button => PushMenu._interface(button)));

  /** AdminLV SidebarSearch, implemented without jQuery. */
  /* eslint-disable max-statements-per-line */
  const WIDGET = '[data-widget="sidebar-search"]';
  const DEFAULT$1 = {
    arrowSign: '->',
    minLength: 3,
    maxResults: 7,
    highlightName: true,
    highlightPath: false,
    highlightClass: 'text-light',
    notFoundText: 'No element found!'
  };
  class SidebarSearch {
    constructor(element, options = {}) {
      this.element = element;
      this.options = getConfig(element, DEFAULT$1, options);
      this.items = [];
      setInstance(SidebarSearch, element, this);
    }
    _init() {
      if (!this.element) {
        return;
      }
      let results = this.element.nextElementSibling;
      if (!results?.classList.contains('sidebar-search-results')) {
        results = document.createElement('div');
        results.className = 'sidebar-search-results';
        this.element.after(results);
      }
      let group = results.querySelector('.list-group');
      if (!group) {
        group = document.createElement('div');
        group.className = 'list-group';
        results.append(group);
      }
      this.resultsGroup = group;
      this.items = [];
      document.querySelectorAll('.main-sidebar .nav-sidebar').forEach(sidebar => [...sidebar.children].forEach(item => this._parseItem(item)));
      this._addNotFound();
    }
    search() {
      const input = this.element.querySelector('.form-control');
      const value = input?.value.trim().toLowerCase() || '';
      if (value.length < this.options.minLength) {
        this.resultsGroup?.replaceChildren();
        this._addNotFound();
        this.close();
        return;
      }
      const matches = this.items.filter(item => item.name.toLowerCase().includes(value)).slice(0, this.options.maxResults);
      this.resultsGroup?.replaceChildren();
      if (matches.length === 0) {
        this._addNotFound();
      } else {
        matches.forEach(item => this.resultsGroup.append(this._renderItem(item.name, item.link, item.path, value)));
      }
      this.open();
    }
    open() {
      this.element.parentElement?.classList.add('sidebar-search-open');
      const icon = this.element.querySelector('.btn i');
      icon?.classList.replace('fa-magnifying-glass', 'fa-xmark');
    }
    close() {
      this.element.parentElement?.classList.remove('sidebar-search-open');
      const icon = this.element.querySelector('.btn i');
      icon?.classList.replace('fa-xmark', 'fa-magnifying-glass');
    }
    toggle() {
      if (this.element.parentElement?.classList.contains('sidebar-search-open')) {
        this.close();
      } else {
        this.open();
      }
    }
    _parseItem(item, path = []) {
      if (item.classList.contains('nav-header')) {
        return;
      }
      const linkElement = item.querySelector(':scope > .nav-link');
      if (!linkElement) {
        return;
      }
      const nameNode = linkElement.querySelector('p') || linkElement;
      const name = (nameNode.textContent || '').replace(/(\r\n|\n|\r)/gm, ' ').trim();
      const childList = item.querySelector(':scope > .nav-treeview');
      if (childList) {
        [...childList.children].forEach(child => this._parseItem(child, [...path, name]));
      } else {
        this.items.push({
          name,
          link: linkElement.getAttribute('href') || '#',
          path
        });
      }
    }
    _highlight(container, text, query) {
      if (!query) {
        container.textContent = text;
        return;
      }
      const lower = text.toLowerCase();
      const q = query.toLowerCase();
      let offset = 0;
      while (offset < text.length) {
        const index = lower.indexOf(q, offset);
        if (index < 0) {
          container.append(document.createTextNode(text.slice(offset)));
          break;
        }
        container.append(document.createTextNode(text.slice(offset, index)));
        const strong = document.createElement('strong');
        strong.className = this.options.highlightClass;
        strong.textContent = text.slice(index, index + q.length);
        container.append(strong);
        offset = index + q.length;
      }
    }
    _renderItem(name, link, path, query = '') {
      const anchor = document.createElement('a');
      anchor.href = link;
      anchor.className = 'list-group-item';
      const title = document.createElement('div');
      title.className = 'search-title';
      if (this.options.highlightName) {
        this._highlight(title, name, query);
      } else {
        title.textContent = name;
      }
      const pathEl = document.createElement('div');
      pathEl.className = 'search-path';
      const pathText = path.join(` ${this.options.arrowSign} `);
      if (this.options.highlightPath) {
        this._highlight(pathEl, pathText, query);
      } else {
        pathEl.textContent = pathText;
      }
      anchor.append(title, pathEl);
      return anchor;
    }
    _addNotFound() {
      if (this.resultsGroup) {
        this.resultsGroup.append(this._renderItem(this.options.notFoundText, '#', []));
      }
    }
    static _interface(element, method) {
      const instance = SidebarSearch.getOrCreateInstance(element);
      if (method) {
        instance[method]();
      }
    }
    static getInstance(element) {
      return getInstance(SidebarSearch, element);
    }
    static getOrCreateInstance(element, options = {}) {
      return getOrCreateInstance(SidebarSearch, element, options);
    }
  }
  delegate(document, 'click', `${WIDGET} .btn`, event => {
    event.preventDefault();
    const element = event.target.closest(WIDGET);
    SidebarSearch._interface(element, 'toggle');
  });
  delegate(document, 'input', `${WIDGET} .form-control`, event => SidebarSearch._interface(event.target.closest(WIDGET), 'search'));
  delegate(document, 'keydown', `${WIDGET} .form-control`, (event, input) => {
    const results = input.closest(WIDGET)?.nextElementSibling?.querySelectorAll('.list-group-item');
    if (!results?.length) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      results[0].focus();
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      results[results.length - 1].focus();
    }
  });
  delegate(document, 'keydown', '.sidebar-search-results .list-group', (event, group) => {
    const items = [...group.querySelectorAll('.list-group-item')];
    if (items.length === 0 || !['ArrowUp', 'ArrowDown'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const index = items.indexOf(document.activeElement);
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    items[(index + direction + items.length) % items.length].focus();
  });
  onReady(() => document.querySelectorAll(WIDGET).forEach(element => SidebarSearch._interface(element)));

  const SELECTOR_TOGGLE_BUTTON = '[data-widget="navbar-search"]';
  const SELECTOR_SEARCH_INPUT = '.form-control';
  const CLASS_NAME_OPEN$1 = 'navbar-search-open';
  const Default$2 = {
    resetOnClose: true,
    target: '.navbar-search-block'
  };
  class NavbarSearch {
    constructor(element, options = {}) {
      this._element = element;
      this._config = getConfig(element, Default$2, options);
      this._target = document.querySelector(this._config.target);
      setInstance(NavbarSearch, element, this);
    }
    open() {
      if (!this._target) {
        return;
      }
      this._target.style.display = 'flex';
      requestAnimationFrame(() => this._target.classList.add(CLASS_NAME_OPEN$1));
      this._target.querySelector(SELECTOR_SEARCH_INPUT)?.focus();
    }
    close() {
      if (!this._target) {
        return;
      }
      this._target.classList.remove(CLASS_NAME_OPEN$1);
      this._target.style.display = 'none';
      if (this._config.resetOnClose) {
        const input = this._target.querySelector(SELECTOR_SEARCH_INPUT);
        if (input) {
          input.value = '';
        }
      }
    }
    toggle() {
      if (this._target?.classList.contains(CLASS_NAME_OPEN$1)) {
        this.close();
      } else {
        this.open();
      }
    }
    static getInstance(element) {
      return getInstance(NavbarSearch, element);
    }
    static getOrCreateInstance(element, options = {}) {
      return NavbarSearch.getInstance(element) ?? new NavbarSearch(element, options);
    }
  }
  delegate(document, 'click', SELECTOR_TOGGLE_BUTTON, (event, element) => {
    event.preventDefault();
    NavbarSearch.getOrCreateInstance(element).toggle();
  });

  /** AdminLV Toasts, implemented without jQuery. */
  /* eslint-disable max-statements-per-line */
  const DEFAULT = {
    position: 'topRight',
    fixed: true,
    autohide: false,
    autoremove: true,
    delay: 1000,
    fade: true,
    icon: null,
    image: null,
    imageAlt: null,
    imageHeight: '25px',
    title: null,
    subtitle: null,
    close: true,
    body: null,
    class: null
  };
  const POSITIONS = {
    topRight: ['toastsContainerTopRight', 'toasts-top-right'],
    topLeft: ['toastsContainerTopLeft', 'toasts-top-left'],
    bottomRight: ['toastsContainerBottomRight', 'toasts-bottom-right'],
    bottomLeft: ['toastsContainerBottomLeft', 'toasts-bottom-left']
  };
  class Toasts {
    constructor(element = document.body, config = {}) {
      this._element = element;
      this._config = {
        ...DEFAULT,
        ...config
      };
      this._prepareContainer();
      dispatch(document.body, 'init.lte.toasts');
    }
    create() {
      const toast = document.createElement('div');
      toast.className = `toast${this._config.class ? ` ${this._config.class}` : ''}`;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.setAttribute('aria-atomic', 'true');
      toast.dataset.autohide = String(this._config.autohide);
      toast.dataset.animation = String(this._config.fade);
      if (this._config.delay && this._config.delay !== 500) {
        toast.dataset.delay = String(this._config.delay);
      }
      const header = document.createElement('div');
      header.className = 'toast-header';
      if (this._config.image != null) {
        const image = document.createElement('img');
        image.className = 'rounded me-2';
        image.src = this._config.image;
        image.alt = this._config.imageAlt || '';
        if (this._config.imageHeight) {
          image.style.height = this._config.imageHeight;
        }
        image.style.width = 'auto';
        header.append(image);
      }
      if (this._config.icon) {
        const icon = document.createElement('i');
        icon.className = `me-2 ${this._config.icon}`;
        header.append(icon);
      }
      if (this._config.title != null) {
        const title = document.createElement('strong');
        title.className = 'me-auto';
        title.innerHTML = this._config.title;
        header.append(title);
      }
      if (this._config.subtitle != null) {
        const subtitle = document.createElement('small');
        subtitle.innerHTML = this._config.subtitle;
        header.append(subtitle);
      }
      if (this._config.close) {
        const close = document.createElement('button');
        close.type = 'button';
        close.dataset.bsDismiss = 'toast';
        close.className = `btn-close ${this._config.title == null ? 'ms-auto' : 'ms-2'} mb-1`;
        close.setAttribute('aria-label', 'Close');
        header.append(close);
      }
      toast.append(header);
      if (this._config.body != null) {
        const body = document.createElement('div');
        body.className = 'toast-body';
        body.innerHTML = this._config.body;
        toast.append(body);
      }
      const container = document.getElementById(POSITIONS[this._config.position]?.[0]);
      if (!container) {
        return null;
      }
      container.prepend(toast);
      dispatch(document.body, 'created.lte.toasts');
      if (!window.bootstrap?.Toast) {
        throw new Error('Bootstrap 5 Toast is required to display AdminLV toasts.');
      }
      window.bootstrap.Toast.getOrCreateInstance(toast, {
        autohide: this._config.autohide,
        animation: this._config.fade,
        delay: this._config.delay
      }).show();
      if (this._config.autoremove) {
        toast.addEventListener('hidden.bs.toast', () => {
          toast.remove();
          dispatch(document.body, 'removed.lte.toasts');
        }, {
          once: true
        });
      }
      return toast;
    }
    _prepareContainer() {
      const position = POSITIONS[this._config.position] || POSITIONS.topRight;
      let container = document.getElementById(position[0]);
      if (!container) {
        container = document.createElement('div');
        container.id = position[0];
        container.className = position[1];
        document.body.append(container);
      }
      container.classList.toggle('fixed', Boolean(this._config.fixed));
    }
    static create(config = {}) {
      return new Toasts(document.body, config).create();
    }
  }

  const SELECTOR_DATA_TOGGLE = '[data-widget="todo-list"]';
  const CLASS_NAME_TODO_LIST_DONE = 'done';
  const Default$1 = {
    onCheck(item) {
      return item;
    },
    onUnCheck(item) {
      return item;
    }
  };
  class TodoList {
    constructor(element, config = {}) {
      this._element = element;
      this._config = getConfig(element, Default$1, config);
      this._onChange = event => {
        if (event.target.matches('input[type="checkbox"]')) {
          this.toggle(event.target);
        }
      };
      this._element.addEventListener('change', this._onChange);
      setInstance(TodoList, element, this);
      this.init();
    }
    init() {
      this._element.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.closest('li')?.classList.toggle(CLASS_NAME_TODO_LIST_DONE, input.checked);
      });
    }
    toggle(item) {
      const isChecked = item.checked;
      item.closest('li')?.classList.toggle(CLASS_NAME_TODO_LIST_DONE, isChecked);
      if (isChecked) {
        this.check(item);
      } else {
        this.unCheck(item);
      }
    }
    check(item) {
      this._config.onCheck(item);
    }
    unCheck(item) {
      this._config.onUnCheck(item);
    }
    static getInstance(element) {
      return getInstance(TodoList, element);
    }
    static getOrCreateInstance(element, config = {}) {
      return TodoList.getInstance(element) ?? new TodoList(element, config);
    }
  }
  onReady(() => {
    document.querySelectorAll(SELECTOR_DATA_TOGGLE).forEach(element => TodoList.getOrCreateInstance(element));
  });

  const EVENT_EXPANDED = 'expanded.lte.treeview';
  const EVENT_COLLAPSED = 'collapsed.lte.treeview';
  const SELECTOR_TREEVIEW = '[data-widget="treeview"]';
  const SELECTOR_NAV_ITEM = '.nav-item';
  const SELECTOR_LINK = '.nav-link';
  const SELECTOR_TREEVIEW_MENU = '.nav-treeview';
  const CLASS_NAME_OPEN = 'menu-open';
  const CLASS_NAME_IS_OPENING = 'menu-is-opening';
  const CLASS_NAME_SIDEBAR_COLLAPSED = 'sidebar-collapse';
  const Default = {
    trigger: '.nav-link',
    animationSpeed: 300,
    accordion: true,
    expandSidebar: false,
    sidebarButtonSelector: '[data-widget="pushmenu"]'
  };
  class Treeview {
    constructor(element, config = {}) {
      this._element = element;
      this._config = getConfig(element, Default, config);
      setInstance(Treeview, element, this);
    }
    init() {
      this._element.querySelectorAll(`${SELECTOR_NAV_ITEM}.${CLASS_NAME_OPEN} > ${SELECTOR_TREEVIEW_MENU}`).forEach(menu => {
        menu.hidden = false;
        menu.style.display = 'block';
      });
    }
    expand(menu, parentItem) {
      if (this._config.accordion) {
        [...parentItem.parentElement.children].filter(item => item !== parentItem && item.classList.contains(CLASS_NAME_OPEN)).forEach(item => this.collapse(item.querySelector(`:scope > ${SELECTOR_TREEVIEW_MENU}`), item));
      }
      parentItem.classList.add(CLASS_NAME_IS_OPENING);
      menu.hidden = false;
      menu.style.display = 'block';
      animateHeight(menu, true, this._config.animationSpeed, () => {
        parentItem.classList.add(CLASS_NAME_OPEN);
        parentItem.classList.remove(CLASS_NAME_IS_OPENING);
        dispatch(this._element, EVENT_EXPANDED, {
          relatedTarget: parentItem
        });
      });
      if (this._config.expandSidebar) {
        this._expandSidebar();
      }
    }
    collapse(menu, parentItem) {
      if (!menu || !parentItem) {
        return;
      }
      parentItem.classList.remove(CLASS_NAME_IS_OPENING, CLASS_NAME_OPEN);
      animateHeight(menu, false, this._config.animationSpeed, () => {
        menu.hidden = true;
        menu.querySelectorAll(`${SELECTOR_NAV_ITEM}.${CLASS_NAME_OPEN}`).forEach(item => {
          item.classList.remove(CLASS_NAME_IS_OPENING, CLASS_NAME_OPEN);
          const childMenu = item.querySelector(`:scope > ${SELECTOR_TREEVIEW_MENU}`);
          if (childMenu) {
            childMenu.hidden = true;
          }
        });
        dispatch(this._element, EVENT_COLLAPSED, {
          relatedTarget: parentItem
        });
      });
    }
    toggle(event, link) {
      const parentItem = link.closest(SELECTOR_NAV_ITEM);
      const menu = parentItem?.querySelector(`:scope > ${SELECTOR_TREEVIEW_MENU}`);
      if (!parentItem || !menu) {
        return;
      }
      event.preventDefault();
      if (parentItem.classList.contains(CLASS_NAME_OPEN)) {
        this.collapse(menu, parentItem);
      } else {
        this.expand(menu, parentItem);
      }
    }
    _expandSidebar() {
      if (document.body.classList.contains(CLASS_NAME_SIDEBAR_COLLAPSED)) {
        const button = document.querySelector(this._config.sidebarButtonSelector);
        if (button) {
          PushMenu.getOrCreateInstance(button).expand();
        }
      }
    }
    static getInstance(element) {
      return getInstance(Treeview, element);
    }
    static getOrCreateInstance(element, config = {}) {
      return Treeview.getInstance(element) ?? new Treeview(element, config);
    }
  }
  onReady(() => {
    document.querySelectorAll(SELECTOR_TREEVIEW).forEach(element => {
      Treeview.getOrCreateInstance(element).init();
    });
  });
  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest(`${SELECTOR_TREEVIEW} ${SELECTOR_LINK}`) : null;
    const root = link?.closest(SELECTOR_TREEVIEW);
    if (!root) {
      return;
    }
    const instance = Treeview.getOrCreateInstance(root);
    if (link.matches(instance._config.trigger)) {
      instance.toggle(event, link);
    }
  });

  exports.CardRefresh = CardRefresh;
  exports.CardWidget = CardWidget;
  exports.ControlSidebar = ControlSidebar;
  exports.DirectChat = DirectChat;
  exports.Dropdown = Dropdown;
  exports.ExpandableTable = ExpandableTable;
  exports.Fullscreen = Fullscreen;
  exports.IFrame = IFrame;
  exports.Layout = Layout;
  exports.NavbarSearch = NavbarSearch;
  exports.PushMenu = PushMenu;
  exports.SidebarSearch = SidebarSearch;
  exports.Toasts = Toasts;
  exports.TodoList = TodoList;
  exports.Treeview = Treeview;

}));
//# sourceMappingURL=adminlv.js.map
