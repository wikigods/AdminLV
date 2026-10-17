---
layout: page
title: Upgrade Guide
---

#### Migration from v2.4.x

When migrating an older AdminLV project that uses Bootstrap 3 or 4 to AdminLV v4, first follow the [Bootstrap 5 migration guide](https://getbootstrap.com/docs/5.3/migration/), then update the AdminLV markup and components.

#### CSS / JS Files

Since AdminLV v4.0 Bootstrap 5 is complete included in AdminLV's CSS file. You will not need to load the Bootstrap CSS file `bootstrap(.min).css`, but you will need the Bootstrap JS file `bootstrap(.min).js`.

##### Main Header

The biggest change in Main Header is the Logo is moved to Main Sidebar and the Main Header has now color variations, here are all changes:

1. Logo
  - `<a href="index2.html" class="logo">` moved & rebuild to `.brand-link` inside `.main-sidebar`
2. Header / Nav
  - `<header class="main-header">` & `<nav class="navbar navbar-static-top">` merged with `<nav class="main-header navbar navbar-expand navbar-white navbar-light">`
3. Sidebar Toggle / Left Navbar
  - `<a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button"><span class="visually-hidden">Toggle navigation</span></a>` replaced with `<ul class="navbar-nav"><li class="nav-item"><a class="nav-link" data-widget="pushmenu" href="#"><i class="fa-solid fa-bars"></i></a></li></ul>`
3. Right Navbar
  - `<div class="navbar-custom-menu">` & `<ul class="nav navbar-nav">` merged with `<ul class="navbar-nav ms-auto">`

##### Main Sidebar

Like above the biggest change is the Main Sidebar contains now the Logo and the sidebar has now color variations, here all changes:

1. Main Sidebar Color
  - `<aside class="main-sidebar">` replaced with `<aside class="main-sidebar sidebar-dark-primary">`
2. Logo / Brand Link
  - `<a href="index3.html" class="brand-link"><img src="dist/img/AdminLVLogo.png" alt="AdminLV Logo" class="brand-image img-circle elevation-3" style="opacity: .8"><span class="brand-text fw-light">AdminLV 4</span></a>` replaces the old logo
3. Sidebar
  - `<section class="sidebar">` replaced with `<div class="sidebar">`
4. User Panel
  - `<div class="user-panel"><div class="pull-left image"><img src="dist/img/user2-160x160.jpg" class="img-circle" alt="User Image"></div><div class="pull-left info"><p>Alexander Pierce</p><a href="#"><i class="fa-solid fa-circle text-success"></i> Online</a></div></div>` replaced with `<div class="user-panel mt-3 pb-3 mb-3 d-flex"><div class="image"><img src="dist/img/user2-160x160.jpg" class="img-circle elevation-2" alt="User Image"></div><div class="info"><a href="#" class="d-block">Alexander Pierce</a></div></div>`
5. Sidebar Menu
  - `<nav class="mt-2">` now around `<ul class="sidebar-menu" data-widget="tree">`
  - `<ul class="sidebar-menu" data-widget="tree">` replaced with `<ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">`
  - `<li class="header">` repalced with `<li class="nav-header">`
  - `<li>` need a new class `.nav-item`
  - `<li> <a>` need a new class `.nav-link`
  - `<li> <a> <i>` need a new class `.nav-icon`
  - `<li> <a> <span>` replaced with `<p>`
  - `<span class="pull-right-container">` removed
  - `<i class="fa-solid fa-angle-left pull-right"></i>` replaced with `<i class="right fa-solid fa-angle-left"></i>`
  - `<small class="label pull-right bg-green">new</small>` replaced with `<span class="right badge bg-danger">New</span>`
  - `<li> <ul class="treeview-menu">` replaced with `<ul class="nav nav-treeview">`


<div class="row">
  <div class="col-md-6" markdown="1">
Old sample entry
```html
<li>
  <a href="pages/widgets.html">
    <i class="fa-solid fa-table-cells"></i> <span>Widgets</span>
    <span class="pull-right-container">
      <small class="label pull-right bg-green">new</small>
    </span>
  </a>
</li>
```
  </div>
  <div class="col-md-6" markdown="1">
New sample entry
```html
<li class="nav-item">
  <a href="pages/widgets.html" class="nav-link">
    <i class="nav-icon fa-solid fa-table-cells"></i>
    <p>
      Widgets
      <span class="right badge bg-danger">New</span>
    </p>
  </a>
</li>
```
  </div>
</div>

<div class="row">
  <div class="col-md-6" markdown="1">
Old sample entry (with tree menu)
```html
<li class="treeview">
  <a href="#">
    <i class="fa-solid fa-gauge"></i> <span>Dashboard</span>
    <span class="pull-right-container">
      <i class="fa-solid fa-angle-left pull-right"></i>
    </span>
  </a>
  <ul class="treeview-menu">
    <li class="active"><a href="index.html">
      <i class="fa-solid fa-circle-o"></i> Dashboard v1</a>
    </li>
  </ul>
</li>
```
  </div>
  <div class="col-md-6" markdown="1">
New sample entry (with tree menu)
```html
<li class="nav-item">
  <a href="#" class="nav-link">
    <i class="nav-icon fa-solid fa-gauge-high"></i>
    <p>
      Dashboard
      <i class="right fa-solid fa-angle-left"></i>
    </p>
  </a>
  <ul class="nav nav-treeview">
    <li class="nav-item">
      <a href="index.html" class="nav-link active">
        <i class="fa-regular fa-circle nav-icon"></i>
        <p>Dashboard v1</p>
      </a>
    </li>
  </ul>
</li>
```
  </div>
</div>

##### Content Header

The biggest change in content header is AdminLV use here now `.container-fluid`, `.row` & `.col-*` and the breadcrumb markup changed, here are all changes:

- `<section class="content-header">` replaced with `<div class="content-header">`
- `<div class="container-fluid">` added in `<div class="content-header">`
- `<h1>` & `<ol class="breadcrumb">` rebuild in `<div class="row">` & `<div class="col-sm-6">`
- `<h1>` replaced with `<h1 class="m-0 text-dark">`
- Bootstrap 5 uses `.float-sm-end` (renamed from Bootstrap 4 `.float-sm-right`) to align the breadcrumb to the end.
- `<ol class="breadcrumb"> <li>` need new class `.breadcrumb-item`


<div class="row">
  <div class="col-md-6" markdown="1">
Old Content Header Markup
```html
<section class="content-header">
  <h1>
    Dashboard
    <small>Control panel</small>
  </h1>
  <ol class="breadcrumb">
    <li><a href="#"><i class="fa-solid fa-gauge"></i> Home</a></li>
    <li class="active">Dashboard</li>
  </ol>
</section>
```
  </div>
  <div class="col-md-6" markdown="1">
New Content Header Markup
```html
<div class="content-header">
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-sm-6">
        <h1 class="m-0 text-dark">
          Dashboard
          <small>Control panel</small>
        </h1>
      </div>
      <div class="col-sm-6">
        <ol class="breadcrumb float-sm-end">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item active">Dashboard v1</li>
        </ol>
      </div>
    </div>
  </div>
</div>
```
  </div>
</div>

##### Content

The content has no change, we only split `<section class="content container-fluid">` in two elements:

- `<section class="content">`
- `<div class="container-fluid">`

##### Footer

The footer has only one little change for the right sided div.

- `<div class="pull-right hidden-xs">` changed to `<div class="float-end d-none d-sm-inline">`

##### Miscellaneous

Here are some other little css/html changes since v3.0:

- `.label` renamed to `.badge`

##### JavaScript Plugins

Here are some other little JavaScript changes since v3.0:

- `data-toggle="*"` renamed to `data-widget="*"` instead of CardWidget items
  - for CardWidget it's now `data-card-widget="*"`
