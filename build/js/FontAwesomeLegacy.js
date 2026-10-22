import { library, dom } from '@fortawesome/fontawesome-svg-core'
import legacyIcons from './FontAwesomeLegacyIcons'

// Keep the Font Awesome 7 name while restoring the previous tachometer artwork.
// The original f3fd Unicode is kept so it does not claim gauge-high's v7 codepoint.
const legacyGaugeHigh = {
  prefix: 'fas',
  iconName: 'gauge-high',
  icon: [
    576,
    512,
    [62461, 'tachometer-alt', 'tachometer-alt-fast'],
    'f3fd',
    'M288 32C128.94 32 0 160.94 0 320c0 52.8 14.25 102.26 39.06 144.8 5.61 9.62 16.3 15.2 27.44 15.2h443c11.14 0 21.83-5.58 27.44-15.2C561.75 422.26 576 372.8 576 320c0-159.06-128.94-288-288-288zm0 64c14.71 0 26.58 10.13 30.32 23.65-1.11 2.26-2.64 4.23-3.45 6.67l-9.22 27.67c-5.13 3.49-10.97 6.01-17.64 6.01-17.67 0-32-14.33-32-32S270.33 96 288 96zM96 384c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm48-160c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm246.77-72.41l-61.33 184C343.13 347.33 352 364.54 352 384c0 11.72-3.38 22.55-8.88 32H232.88c-5.5-9.45-8.88-20.28-8.88-32 0-33.94 26.5-61.43 59.9-63.59l61.34-184.01c4.17-12.56 17.73-19.45 30.36-15.17 12.57 4.19 19.35 17.79 15.17 30.36zm14.66 57.2l15.52-46.55c3.47-1.29 7.13-2.23 11.05-2.23 17.67 0 32 14.33 32 32s-14.33 32-32 32c-11.38-.01-20.89-6.28-26.57-15.22zM480 384c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z'
  ]
}

library.add(legacyGaugeHigh)

const legacyV5Icons = [
  {
    prefix: 'fas',
    iconName: 'table-cells',
    icon: [
      512,
      512,
      ['th'],
      'f00a',
      'M149.333 56v80c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24h101.333c13.255 0 24 10.745 24 24zm181.334 240v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm32-240v80c0 13.255 10.745 24 24 24H488c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24zm-32 80V56c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm-205.334 56H24c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24zM0 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm386.667-56H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zm0 160H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zM181.333 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24z'
    ]
  },
  {
    prefix: 'fas',
    iconName: 'table',
    icon: [512, 512, [], 'f0ce', 'M464 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM224 416H64v-96h160v96zm0-160H64v-96h160v96zm224 160H288v-96h160v96zm0-160H288v-96h160v96z']
  },
  {
    prefix: 'fas',
    iconName: 'lock',
    icon: [448, 512, [], 'f023', 'M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z']
  },
  {
    prefix: 'fas',
    iconName: 'calendar',
    icon: [448, 512, [], 'f133', 'M12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm436-44v-36c0-26.5-21.5-48-48-48h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v36c0 6.6 5.4 12 12 12h424c6.6 0 12-5.4 12-12z']
  },
  {
    prefix: 'fas',
    iconName: 'trash-arrow-up',
    icon: [448, 512, ['trash-restore'], 'f829', 'M53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32zm70.11-175.8l89.38-94.26a15.41 15.41 0 0 1 22.62 0l89.38 94.26c10.08 10.62 2.94 28.8-11.32 28.8H256v112a16 16 0 0 1-16 16h-32a16 16 0 0 1-16-16V320h-57.37c-14.26 0-21.4-18.18-11.32-28.8zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z']
  }
]

library.add(...legacyV5Icons, ...legacyIcons)

const legacyClassMap = {
  'fa-copy': 'fa-copy',
  'fa-file': 'fa-file',
  'fa-file-pdf': 'fa-file-pdf',
  'fa-photo-video': 'fa-photo-film',
  'fa-file-csv': 'fa-file-csv',
  'fa-file-upload': 'fa-file-arrow-up',
  'fa-file-download': 'fa-file-arrow-down',
  'fa-file-invoice': 'fa-file-invoice',
  'fa-exclamation-circle': 'fa-circle-exclamation',
  'fa-building': 'fa-building',
  'fa-home': 'fa-house',
  'fa-warehouse': 'fa-warehouse',
  'fa-store': 'fa-store',
  'fa-map-marked-alt': 'fa-map-location-dot',
  'fa-fire-alt': 'fa-fire-flame-curved',
  'fa-fire': 'fa-fire',
  'fa-dollar-sign': 'fa-dollar-sign',
  'fa-bug': 'fa-bug',
  'fa-barcode': 'fa-barcode',
  'fa-envelope': 'fa-envelope',
  'fa-language': 'fa-language',
  'fa-money-bill-alt': 'fa-money-bill-1',
  'fa-calendar': 'fa-calendar',
  'fa-magic': 'fa-wand-magic-sparkles',
  'fa-eraser': 'fa-eraser',
  'fa-edit': 'fa-pen-to-square',
  'fa-list': 'fa-list',
  'fa-th': 'fa-table-cells',
  'fa-table-cells': 'fa-table-cells',
  'fa-table': 'fa-table',
  'fa-lock': 'fa-lock',
  'fa-trash-arrow-up': 'fa-trash-arrow-up',
  'fa-trash-restore': 'fa-trash-arrow-up',
  'fa-coins': 'fa-coins',
  'fa-chart-line': 'fa-chart-line',
  'fa-cash-register': 'fa-cash-register',
  'fa-chart-pie': 'fa-chart-pie',
  'fa-box': 'fa-box',
  'fa-gauge': 'fa-gauge-high',
  'fa-gauge-high': 'fa-gauge-high',
  'fa-tachometer-alt': 'fa-gauge-high',
  'fa-tachometer-alt-fast': 'fa-gauge-high',
  'fa-key': 'fa-key',
  'fa-cubes': 'fa-cubes',
  'fa-cart-arrow-down': 'fa-cart-arrow-down'
}

const legacyIconDefinitions = [legacyGaugeHigh, ...legacyV5Icons, ...legacyIcons]
const legacyIconSelectors = legacyIconDefinitions.flatMap(iconDefinition => {
  const currentName = `fa-${iconDefinition.iconName}`
  const legacyNames = Object.entries(legacyClassMap)
    .filter(([, mappedName]) => mappedName === currentName)
    .map(([legacyName]) => legacyName.slice(3))
  const iconNames = [
    iconDefinition.iconName,
    ...(iconDefinition.icon[2] || []).filter(alias => typeof alias === 'string'),
    ...legacyNames
  ]
  const styleClasses = iconDefinition.prefix === 'far'
    ? ['far', 'fa-regular']
    : ['fas', 'fa-solid']

  return styleClasses.flatMap(styleClass => iconNames.map(iconName => `.${styleClass}.fa-${iconName}:not([data-fa-i2svg])`))
})
const legacyIconSelector = [...new Set(legacyIconSelectors)]
  .join(', ')

const processingIcons = new WeakSet()

const normalizeLegacyClasses = root => {
  const legacyIcons = []
  if (root.matches?.(legacyIconSelector)) {
    legacyIcons.push(root)
  }

  legacyIcons.push(...root.querySelectorAll(legacyIconSelector))

  for (const legacyIcon of legacyIcons) {
    for (const [legacyClass, modernClass] of Object.entries(legacyClassMap)) {
      if (legacyIcon.classList.contains(legacyClass) && legacyClass !== modernClass) {
        legacyIcon.classList.remove(legacyClass)
        legacyIcon.classList.add(modernClass)
      }
    }

    if (legacyIcon.classList.contains('fas')) {
      legacyIcon.classList.replace('fas', 'fa-solid')
    }

    if (legacyIcon.classList.contains('far')) {
      legacyIcon.classList.replace('far', 'fa-regular')
    }
  }
}

const replaceLegacyIcons = async (root) => {
  const legacyIcons = []
  if (root.matches?.(legacyIconSelector)) {
    legacyIcons.push(root)
  }

  legacyIcons.push(...root.querySelectorAll(legacyIconSelector))

  for (const legacyIcon of legacyIcons) {
    if (processingIcons.has(legacyIcon)) {
      continue
    }

    processingIcons.add(legacyIcon)

    // Give i2svg a root containing only this icon so unrelated webfont icons stay untouched.
    const iconContainer = document.createElement('span')
    legacyIcon.replaceWith(iconContainer)
    iconContainer.append(legacyIcon)

    await dom.i2svg({ node: iconContainer })

    if (iconContainer.firstElementChild) {
      iconContainer.replaceWith(iconContainer.firstElementChild)
    }
  }
}

const observeLegacyIcons = () => {
  // Keep the adapter opt-in and process only the initial tree and newly inserted subtrees.
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) {
          normalizeLegacyClasses(node)
          replaceLegacyIcons(node)
        }
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
  normalizeLegacyClasses(document.body)
  replaceLegacyIcons(document.body)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeLegacyIcons, { once: true })
} else {
  observeLegacyIcons()
}
