---
layout: page
title: Legacy Font Awesome Icons
---

AdminLV ships an optional bundle with the original Font Awesome Free 5.15.4 SVG paths for the listed icons. The paths are embedded in the bundle, so applications do not need a Font Awesome 5 package. The bundle is not included in the default JavaScript bundle.

The icon artwork is from Font Awesome Free and is licensed under [CC BY 4.0](https://fontawesome.com/license/free).

The bundle expects Font Awesome 7 CSS to be loaded. It converts legacy class names to their Font Awesome 7 names, then renders the original Font Awesome 5 artwork as SVG. It also restores the previous artwork for selected AdminLV icons.

##### Script usage

Load the adapter after the Font Awesome stylesheet:

```html
<script src="dist/js/adminlv-legacy-icons.min.js"></script>
```

For Vite or another JavaScript bundler:

```js
import 'admin-lv/dist/js/adminlv-legacy-icons.js'
```

##### Supported legacy classes

The adapter supports `far fa-copy`, `far fa-file`, `fas fa-file-pdf`, `fas fa-photo-video`, `fas fa-file-csv`, `fas fa-file-upload`, `fas fa-file-download`, `fas fa-file-invoice`, `fas fa-exclamation-circle`, `fas fa-building`, `fas fa-home`, `fas fa-warehouse`, `fas fa-store`, `fas fa-map-marked-alt`, `fas fa-fire-alt`, `fas fa-fire`, `fas fa-dollar-sign`, `fas fa-bug`, `fas fa-barcode`, `fas fa-envelope`, `fas fa-language`, `far fa-money-bill-alt`, `fas fa-calendar`, `fas fa-magic`, `fas fa-eraser`, `far fa-edit`, `fas fa-list`, `fas fa-th`, `fas fa-coins`, `fas fa-chart-line`, `fas fa-cash-register`, `fas fa-chart-pie`, `fas fa-box`, `fas fa-key`, `fas fa-cubes` and `fas fa-cart-arrow-down`.

It also supports the existing AdminLV compatibility names `fa-gauge`, `fa-gauge-high`, `fa-tachometer-alt`, `fa-table-cells`, `fa-table`, `fa-lock`, `fa-trash-arrow-up` and `fa-trash-restore`.
