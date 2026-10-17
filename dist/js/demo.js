/**
 * AdminLV Demo Menu
 * ------------------
 * You should not use this file in production.
 * This file is for demo purposes only.
 */

(function () {
  'use strict'

  window.setTimeout(function () {
    try {
      if (window.___browserSync___ === undefined && Number(localStorage.getItem('AdminLTE:Demo:MessageShowed')) < Date.now()) {
        localStorage.setItem('AdminLTE:Demo:MessageShowed', Date.now() + (15 * 60 * 1000))
        window.alert('You load AdminLV\'s "demo.js", \nthis file is only created for testing purposes!')
      }
    } catch (error) {
      // The demo menu should still work when browser storage is unavailable.
    }
  }, 1000)

  var sidebar = document.querySelector('.control-sidebar')
  if (!sidebar) {
    return
  }

  var body = document.body
  var header = document.querySelector('.main-header')
  var mainSidebar = document.querySelector('.main-sidebar')
  var navSidebar = document.querySelector('.nav-sidebar')
  var brand = document.querySelector('.brand-link')
  var footer = document.querySelector('.main-footer')
  var sidebarScrollers = document.querySelectorAll('.sidebar')
  var container = document.createElement('div')
  container.className = 'p-3 control-sidebar-content'
  sidebar.append(container)

  function addText(text, tag) {
    var element = document.createElement(tag || 'span')
    element.textContent = text
    return element
  }

  function addHeading(text, tag) {
    container.append(addText(text, tag || 'h6'))
  }

  function addToggle(label, targets, className, spacing, onChange) {
    var wrapper = document.createElement('div')
    wrapper.className = spacing || 'mb-1'

    var input = document.createElement('input')
    input.type = 'checkbox'
    input.value = '1'
    input.className = 'me-1'
    input.checked = targets.some(function (target) {
      return target.classList.contains(className)
    })
    input.addEventListener('change', function () {
      targets.forEach(function (target) {
        target.classList.toggle(className, input.checked)
      })
      if (onChange) {
        onChange(input.checked)
      }
    })

    wrapper.append(input, addText(label))
    container.append(wrapper)
    return input
  }

  function getTargets(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector))
  }

  function forceResize() {
    window.dispatchEvent(new Event('resize'))
  }

  function addOptionSection(title, options) {
    addHeading(title)
    options.forEach(function (option) {
      var checkbox = addToggle(option.label, option.targets, option.className, option.spacing, option.onChange)
      if (option.onCreate) {
        option.onCreate(checkbox)
      }
    })
  }

  container.append(addText('Customize AdminLV', 'h5'))
  var divider = document.createElement('hr')
  divider.className = 'mb-2'
  container.append(divider)

  addToggle('Dark Mode', [], 'unused', 'mb-4', function (enabled) {
    document.documentElement.setAttribute('data-bs-theme', enabled ? 'dark' : 'light')
  }).checked = document.documentElement.getAttribute('data-bs-theme') === 'dark'

  addOptionSection('Header Options', [
    { label: 'Fixed', targets: [body], className: 'layout-navbar-fixed' },
    { label: 'Dropdown Legacy Offset', targets: getTargets('.main-header'), className: 'dropdown-legacy' },
    { label: 'No border', targets: getTargets('.main-header'), className: 'border-bottom-0', spacing: 'mb-4' }
  ])

  var collapsedToggle
  addOptionSection('Sidebar Options', [
    {
      label: 'Collapsed', targets: [body], className: 'sidebar-collapse',
      onChange: forceResize,
      onCreate: function (checkbox) { collapsedToggle = checkbox }
    },
    { label: 'Fixed', targets: [body], className: 'layout-fixed', onChange: forceResize },
    { label: 'Sidebar Mini', targets: [body], className: 'sidebar-mini' },
    { label: 'Sidebar Mini MD', targets: [body], className: 'sidebar-mini-md' },
    { label: 'Sidebar Mini XS', targets: [body], className: 'sidebar-mini-xs' },
    { label: 'Nav Flat Style', targets: getTargets('.nav-sidebar'), className: 'nav-flat' },
    { label: 'Nav Legacy Style', targets: getTargets('.nav-sidebar'), className: 'nav-legacy' },
    { label: 'Nav Compact', targets: getTargets('.nav-sidebar'), className: 'nav-compact' },
    { label: 'Nav Child Indent', targets: getTargets('.nav-sidebar'), className: 'nav-child-indent' },
    { label: 'Nav Child Hide on Collapse', targets: getTargets('.nav-sidebar'), className: 'nav-collapse-hide-child' },
    { label: 'Disable Hover/Focus Auto-Expand', targets: getTargets('.main-sidebar'), className: 'sidebar-no-expand', spacing: 'mb-4' }
  ])

  document.addEventListener('shown.lte.pushmenu', function () {
    if (collapsedToggle) collapsedToggle.checked = false
  })
  document.addEventListener('collapsed.lte.pushmenu', function () {
    if (collapsedToggle) collapsedToggle.checked = true
  })

  addOptionSection('Footer Options', [
    { label: 'Fixed', targets: [body], className: 'layout-footer-fixed', spacing: 'mb-4' }
  ])

  addOptionSection('Small Text Options', [
    { label: 'Body', targets: [body], className: 'text-sm' },
    { label: 'Navbar', targets: getTargets('.main-header'), className: 'text-sm' },
    { label: 'Brand', targets: getTargets('.brand-link'), className: 'text-sm' },
    { label: 'Sidebar Nav', targets: getTargets('.nav-sidebar'), className: 'text-sm' },
    { label: 'Footer', targets: getTargets('.main-footer'), className: 'text-sm', spacing: 'mb-4' }
  ])

  var navbarDarkSkins = [
    'navbar-primary', 'navbar-secondary', 'navbar-info', 'navbar-success', 'navbar-danger',
    'navbar-indigo', 'navbar-purple', 'navbar-pink', 'navbar-navy', 'navbar-lightblue',
    'navbar-teal', 'navbar-cyan', 'navbar-dark', 'navbar-gray-dark', 'navbar-gray'
  ]
  var navbarLightSkins = ['navbar-light', 'navbar-warning', 'navbar-white', 'navbar-orange']
  var navbarAllColors = navbarDarkSkins.concat(navbarLightSkins)
  var sidebarColors = [
    'bg-primary', 'bg-warning', 'bg-info', 'bg-danger', 'bg-success', 'bg-indigo',
    'bg-lightblue', 'bg-navy', 'bg-purple', 'bg-fuchsia', 'bg-pink', 'bg-maroon',
    'bg-orange', 'bg-lime', 'bg-teal', 'bg-olive'
  ]
  var accentColors = sidebarColors.map(function (color) { return color.replace('bg-', 'accent-') })
  var sidebarSkins = sidebarColors.map(function (color) { return 'sidebar-dark-' + color.replace('bg-', '') })
    .concat(sidebarColors.map(function (color) { return 'sidebar-light-' + color.replace('bg-', '') }))

  function titleForColor(color) {
    return color.replace(/^(navbar-|accent-|bg-)/, '').replace(/-/g, ' ').replace(/^\w/, function (letter) { return letter.toUpperCase() })
  }

  function makeSelect(colors, noneSelected, onChange) {
    var select = document.createElement('select')
    select.className = 'form-select mb-3 border-0' + (noneSelected ? '' : ' text-light')
    if (noneSelected) {
      var empty = document.createElement('option')
      empty.textContent = 'None Selected'
      select.append(empty)
    }
    colors.forEach(function (color) {
      var option = document.createElement('option')
      option.className = color.replace(/^(navbar-|accent-)/, 'bg-')
      option.textContent = titleForColor(color)
      select.append(option)
    })
    select.addEventListener('change', onChange)
    return select
  }

  function colorOf(select) {
    var option = select.options[select.selectedIndex]
    return option ? option.className : ''
  }

  function setSelectColor(select, color, darkText) {
    select.className = 'form-select mb-3 border-0'
    if (color) {
      if (darkText) select.classList.add('text-light')
      select.classList.add(color)
    }
  }

  function selectCurrentColor(select, element, colors, fromPrefix) {
    if (!element) return ''
    var current = colors.find(function (color) { return element.classList.contains(color) }) || ''
    var optionColor = current ? current.replace(fromPrefix, 'bg-') : ''
    var optionIndex = Array.prototype.findIndex.call(select.options, function (option) { return option.classList.contains(optionColor) })
    if (optionIndex >= 0) select.selectedIndex = optionIndex
    setSelectColor(select, optionColor, true)
    return current
  }

  function appendSelect(title, select) {
    addHeading(title)
    var row = document.createElement('div')
    row.className = 'd-flex'
    row.append(select)
    container.append(row)
  }

  var navbarSelect = makeSelect(navbarAllColors, false, function () {
    if (!header) return
    var selectedColor = colorOf(navbarSelect).replace('bg-', 'navbar-')
    header.classList.remove('navbar-dark', 'navbar-light')
    navbarAllColors.forEach(function (color) { header.classList.remove(color) })
    var dark = navbarDarkSkins.includes(selectedColor)
    header.classList.add(dark ? 'navbar-dark' : 'navbar-light', selectedColor)
    setSelectColor(navbarSelect, colorOf(navbarSelect), dark)
  })
  selectCurrentColor(navbarSelect, header, navbarAllColors, 'navbar-')
  appendSelect('Navbar Variants', navbarSelect)

  addHeading('Accent Color Variants')
  var accentSelect = makeSelect(accentColors, true, function () {
    accentColors.forEach(function (color) { body.classList.remove(color) })
    var selectedColor = colorOf(accentSelect).replace('bg-', 'accent-')
    if (selectedColor) body.classList.add(selectedColor)
  })
  container.append(accentSelect)

  function syncSidebarScrollers(themeToRemove, themeToAdd) {
    sidebarScrollers.forEach(function (element) {
      element.classList.remove(themeToRemove)
      element.classList.add(themeToAdd)
    })
  }

  addHeading('Dark Sidebar Variants')
  var darkSidebarSelect = makeSelect(sidebarColors, true, function () {
    var selectedColor = colorOf(darkSidebarSelect)
    sidebarSkins.forEach(function (skin) { if (mainSidebar) mainSidebar.classList.remove(skin) })
    var lightColorClasses = sidebarColors.concat(['text-light'])
    lightColorClasses.forEach(function (className) { lightSidebarSelect.classList.remove(className) })
    lightSidebarSelect.selectedIndex = 0
    var sidebarClass = 'sidebar-dark-' + selectedColor.replace('bg-', '')
    if (mainSidebar && selectedColor) mainSidebar.classList.add(sidebarClass)
    setSelectColor(darkSidebarSelect, selectedColor, true)
    syncSidebarScrollers('os-theme-dark', 'os-theme-light')
  })
  container.append(darkSidebarSelect)

  addHeading('Light Sidebar Variants')
  var lightSidebarSelect = makeSelect(sidebarColors, true, function () {
    var selectedColor = colorOf(lightSidebarSelect)
    sidebarSkins.forEach(function (skin) { if (mainSidebar) mainSidebar.classList.remove(skin) })
    sidebarColors.concat(['text-light']).forEach(function (className) { darkSidebarSelect.classList.remove(className) })
    darkSidebarSelect.selectedIndex = 0
    var sidebarClass = 'sidebar-light-' + selectedColor.replace('bg-', '')
    if (mainSidebar && selectedColor) mainSidebar.classList.add(sidebarClass)
    setSelectColor(lightSidebarSelect, selectedColor, true)
    syncSidebarScrollers('os-theme-light', 'os-theme-dark')
  })
  container.append(lightSidebarSelect)
  selectCurrentColor(darkSidebarSelect, mainSidebar, sidebarSkins.filter(function (skin) { return skin.indexOf('sidebar-dark-') === 0 }), 'sidebar-dark-')
  selectCurrentColor(lightSidebarSelect, mainSidebar, sidebarSkins.filter(function (skin) { return skin.indexOf('sidebar-light-') === 0 }), 'sidebar-light-')

  addHeading('Brand Logo Variants')
  var brandRow = document.createElement('div')
  brandRow.className = 'd-flex'
  var brandSelect = makeSelect(navbarAllColors, true, function () {
    if (!brand) return
    var selectedColor = colorOf(brandSelect).replace('bg-', 'navbar-')
    navbarAllColors.forEach(function (color) { brand.classList.remove(color) })
    brand.classList.toggle('text-black', selectedColor === 'navbar-light' || selectedColor === 'navbar-white')
    if (selectedColor) brand.classList.add(selectedColor)
    setSelectColor(brandSelect, colorOf(brandSelect), selectedColor !== 'navbar-light' && selectedColor !== 'navbar-white')
  })
  brandRow.append(brandSelect)
  container.append(brandRow)
  selectCurrentColor(brandSelect, brand, navbarAllColors, 'navbar-')
})()
