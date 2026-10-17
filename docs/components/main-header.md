---
layout: page
title: Main Header Component
---

> ##### Reminder!
> AdminLV uses all of Bootstrap 5 components. It's a good start to review the [Bootstrap documentation](https://getbootstrap.com/) to get an idea of the various components that this documentation __does not__ cover.
{: .quote-orange .mt-0}


> ##### Tip!
> If you go through the example pages and would like to copy a component, right-click on the component and choose "inspect element" to get to the HTML quicker than scanning the HTML page.
{: .quote-info}

The main header contains the navbar. Construction of the navbar differs slightly from Bootstrap because it has components that Bootstrap doesn't provide. The navbar can be constructed in two ways. This is an example for the normal navbar and next we will provide an example for the top nav layout with a logo too.


<nav class="navbar navbar-expand navbar-white navbar-light ms-0">
  <!-- Left navbar links -->
  <ul class="navbar-nav">
    <li class="nav-item">
      <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fa-solid fa-bars"></i></a>
    </li>
    <li class="nav-item d-none d-sm-inline-block">
      <a href="index3.html" class="nav-link">Home</a>
    </li>
    <li class="nav-item d-none d-sm-inline-block">
      <a href="#" class="nav-link">Contact</a>
    </li>
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Help
      </a>
      <div class="dropdown-menu" aria-labelledby="navbarDropdown">
        <a class="dropdown-item" href="#">FAQ</a>
        <a class="dropdown-item" href="#">Support</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="#">Contact</a>
      </div>
    </li>
  </ul>

  <!-- SEARCH FORM -->
  <form class="d-flex flex-wrap align-items-center ms-3">
    <div class="input-group input-group-sm">
      <input class="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search">
      
        <button class="btn btn-navbar" type="submit">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
      
    </div>
  </form>

  <!-- Right navbar links -->
  <ul class="navbar-nav ms-auto">
    <!-- Messages Dropdown Menu -->
    <li class="nav-item dropdown">
      <a class="nav-link" data-bs-toggle="dropdown" href="#">
        <i class="fa-regular fa-comments"></i>
        <span class="badge bg-danger navbar-badge">3</span>
      </a>
      <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
        <a href="#" class="dropdown-item">
          <!-- Message Start -->
          <div class="d-flex">
            <img src="{{ '/assets/img/user1-128x128.jpg' | prepend: site.baseurl }}" alt="User Avatar" class="img-size-50 me-3 img-circle">
            <div class="flex-fill">
              <h3 class="dropdown-item-title">
                Brad Diesel
                <span class="float-end text-sm text-danger"><i class="fa-solid fa-star"></i></span>
              </h3>
              <p class="text-sm">Call me whenever you can...</p>
              <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
            </div>
          </div>
          <!-- Message End -->
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <!-- Message Start -->
          <div class="d-flex">
            <img src="{{ '/assets/img/user8-128x128.jpg' | prepend: site.baseurl }}" alt="User Avatar" class="img-size-50 img-circle me-3">
            <div class="flex-fill">
              <h3 class="dropdown-item-title">
                John Pierce
                <span class="float-end text-sm text-muted"><i class="fa-solid fa-star"></i></span>
              </h3>
              <p class="text-sm">I got your message bro</p>
              <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
            </div>
          </div>
          <!-- Message End -->
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <!-- Message Start -->
          <div class="d-flex">
            <img src="{{ '/assets/img/user3-128x128.jpg' | prepend: site.baseurl }}" alt="User Avatar" class="img-size-50 img-circle me-3">
            <div class="flex-fill">
              <h3 class="dropdown-item-title">
                Nora Silvester
                <span class="float-end text-sm text-warning"><i class="fa-solid fa-star"></i></span>
              </h3>
              <p class="text-sm">The subject goes here</p>
              <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
            </div>
          </div>
          <!-- Message End -->
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item dropdown-footer">See All Messages</a>
      </div>
    </li>
    <!-- Notifications Dropdown Menu -->
    <li class="nav-item dropdown">
      <a class="nav-link" data-bs-toggle="dropdown" href="#">
        <i class="fa-regular fa-bell"></i>
        <span class="badge bg-warning navbar-badge">15</span>
      </a>
      <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
        <span class="dropdown-header">15 Notifications</span>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <i class="fa-solid fa-envelope me-2"></i> 4 new messages
          <span class="float-end text-muted text-sm">3 mins</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <i class="fa-solid fa-users me-2"></i> 8 friend requests
          <span class="float-end text-muted text-sm">12 hours</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <i class="fa-solid fa-file me-2"></i> 3 new reports
          <span class="float-end text-muted text-sm">2 days</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
      </div>
    </li>
    <li class="nav-item">
      <a class="nav-link" data-widget="control-sidebar" data-bs-slide="true" href="#" role="button"><i
          class="fa-solid fa-table-cells-large"></i></a>
    </li>
  </ul>
</nav>

```html
<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light">
  <!-- Left navbar links -->
  <ul class="navbar-nav">
    <li class="nav-item">
      <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fa-solid fa-bars"></i></a>
    </li>
    <li class="nav-item d-none d-sm-inline-block">
      <a href="index3.html" class="nav-link">Home</a>
    </li>
    <li class="nav-item d-none d-sm-inline-block">
      <a href="#" class="nav-link">Contact</a>
    </li>
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Help
      </a>
      <div class="dropdown-menu" aria-labelledby="navbarDropdown2">
        <a class="dropdown-item" href="#">FAQ</a>
        <a class="dropdown-item" href="#">Support</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="#">Contact</a>
      </div>
    </li>
  </ul>

  <!-- SEARCH FORM -->
  <form class="d-flex flex-wrap align-items-center ms-3">
    <div class="input-group input-group-sm">
      <input class="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search">
      
        <button class="btn btn-navbar" type="submit">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
      
    </div>
  </form>

  <!-- Right navbar links -->
  <ul class="navbar-nav ms-auto">
    <!-- Messages Dropdown Menu -->
    <li class="nav-item dropdown">
      <a class="nav-link" data-bs-toggle="dropdown" href="#">
        <i class="fa-regular fa-comments"></i>
        <span class="badge bg-danger navbar-badge">3</span>
      </a>
      <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
        <a href="#" class="dropdown-item">
          <!-- Message Start -->
          <div class="d-flex">
            <img src="dist/img/user1-128x128.jpg" alt="User Avatar" class="img-size-50 me-3 img-circle">
            <div class="flex-fill">
              <h3 class="dropdown-item-title">
                Brad Diesel
                <span class="float-end text-sm text-danger"><i class="fa-solid fa-star"></i></span>
              </h3>
              <p class="text-sm">Call me whenever you can...</p>
              <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
            </div>
          </div>
          <!-- Message End -->
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <!-- Message Start -->
          <div class="d-flex">
            <img src="dist/img/user8-128x128.jpg" alt="User Avatar" class="img-size-50 img-circle me-3">
            <div class="flex-fill">
              <h3 class="dropdown-item-title">
                John Pierce
                <span class="float-end text-sm text-muted"><i class="fa-solid fa-star"></i></span>
              </h3>
              <p class="text-sm">I got your message bro</p>
              <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
            </div>
          </div>
          <!-- Message End -->
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <!-- Message Start -->
          <div class="d-flex">
            <img src="dist/img/user3-128x128.jpg" alt="User Avatar" class="img-size-50 img-circle me-3">
            <div class="flex-fill">
              <h3 class="dropdown-item-title">
                Nora Silvester
                <span class="float-end text-sm text-warning"><i class="fa-solid fa-star"></i></span>
              </h3>
              <p class="text-sm">The subject goes here</p>
              <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
            </div>
          </div>
          <!-- Message End -->
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item dropdown-footer">See All Messages</a>
      </div>
    </li>
    <!-- Notifications Dropdown Menu -->
    <li class="nav-item dropdown">
      <a class="nav-link" data-bs-toggle="dropdown" href="#">
        <i class="fa-regular fa-bell"></i>
        <span class="badge bg-warning navbar-badge">15</span>
      </a>
      <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
        <span class="dropdown-header">15 Notifications</span>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <i class="fa-solid fa-envelope me-2"></i> 4 new messages
          <span class="float-end text-muted text-sm">3 mins</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <i class="fa-solid fa-users me-2"></i> 8 friend requests
          <span class="float-end text-muted text-sm">12 hours</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item">
          <i class="fa-solid fa-file me-2"></i> 3 new reports
          <span class="float-end text-muted text-sm">2 days</span>
        </a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
      </div>
    </li>
    <li class="nav-item">
      <a class="nav-link" data-widget="control-sidebar" data-bs-slide="true" href="#" role="button"><i
          class="fa-solid fa-table-cells-large"></i></a>
    </li>
  </ul>
</nav>
<!-- /.navbar -->
```
{: .max-height-300}


#### Top Nav Layout. Main Header Example.

> ##### Reminder!
> To use this main header instead of the regular one, you must add the `layout-top-nav` class to the body tag.
{: .quote-orange}

Top navbar example can be found in this [demo page](https://adminlte.io/themes/dev/AdminLTE/pages/layout/top-nav.html). 


<nav class="navbar navbar-expand navbar-light navbar-white">
  <div class="container">
    <a href="index3.html" class="navbar-brand">
      <img src="{{ '/assets/img/AdminLVLogo.png' | prepend: site.baseurl }}" alt="AdminLV Logo" class="brand-image img-circle elevation-3"
           style="opacity: .8; max-height: 33px;">
      <span class="brand-text fw-light">AdminLV 4</span>
    </a>
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
      </li>
      <li class="nav-item d-none d-sm-inline-block">
        <a href="index3.html" class="nav-link">Home</a>
      </li>
      <li class="nav-item d-none d-sm-inline-block">
        <a href="#" class="nav-link">Contact</a>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown3" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Help
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown3">
          <a class="dropdown-item" href="#">FAQ</a>
          <a class="dropdown-item" href="#">Support</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#">Contact</a>
        </div>
      </li>
    </ul>
    <!-- SEARCH FORM -->
    <form class="d-flex flex-wrap align-items-center ms-3">
      <div class="input-group input-group-sm">
        <input class="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search">
        
          <button class="btn btn-navbar" type="submit">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        
      </div>
    </form>
    <!-- Right navbar links -->
    <ul class="navbar-nav ms-auto">
      <!-- Messages Dropdown Menu -->
      <li class="nav-item dropdown">
        <a class="nav-link" data-bs-toggle="dropdown" href="#">
          <i class="fa-solid fa-comments"></i>
          <span class="badge bg-danger navbar-badge">3</span>
        </a>
       <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
          <a href="#" class="dropdown-item">
            <!-- Message Start -->
            <div class="d-flex">
              <img src="{{ '/assets/img/user1-128x128.jpg' | prepend: site.baseurl }}" alt="User Avatar" class="img-size-50 me-3 img-circle">
              <div class="flex-fill">
                <h3 class="dropdown-item-title">
                  Brad Diesel
                  <span class="float-end text-sm text-danger"><i class="fa-solid fa-star"></i></span>
                </h3>
                <p class="text-sm">Call me whenever you can...</p>
                <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
              </div>
            </div>
            <!-- Message End -->
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <!-- Message Start -->
            <div class="d-flex">
              <img src="{{ '/assets/img/user8-128x128.jpg' | prepend: site.baseurl }}" alt="User Avatar" class="img-size-50 img-circle me-3">
              <div class="flex-fill">
                <h3 class="dropdown-item-title">
                  John Pierce
                  <span class="float-end text-sm text-muted"><i class="fa-solid fa-star"></i></span>
                </h3>
                <p class="text-sm">I got your message bro</p>
                <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
              </div>
            </div>
            <!-- Message End -->
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <!-- Message Start -->
            <div class="d-flex">
              <img src="{{ '/assets/img/user3-128x128.jpg' | prepend: site.baseurl }}" alt="User Avatar" class="img-size-50 img-circle me-3">
              <div class="flex-fill">
                <h3 class="dropdown-item-title">
                  Nora Silvester
                  <span class="float-end text-sm text-warning"><i class="fa-solid fa-star"></i></span>
                </h3>
                <p class="text-sm">The subject goes here</p>
                <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
              </div>
            </div>
            <!-- Message End -->
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item dropdown-footer">See All Messages</a>
        </div>
      </li>
      <!-- Notifications Dropdown Menu -->
      <li class="nav-item dropdown">
        <a class="nav-link" data-bs-toggle="dropdown" href="#">
          <i class="fa-regular fa-bell"></i>
          <span class="badge bg-warning navbar-badge">15</span>
        </a>
        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
          <span class="dropdown-header">15 Notifications</span>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="fa-solid fa-envelope me-2"></i> 4 new messages
            <span class="float-end text-muted text-sm">3 mins</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="fa-solid fa-users me-2"></i> 8 friend requests
            <span class="float-end text-muted text-sm">12 hours</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="fa-solid fa-file me-2"></i> 3 new reports
            <span class="float-end text-muted text-sm">2 days</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
        </div>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-widget="control-sidebar" data-bs-slide="true" href="#" role="button"><i
            class="fa-solid fa-table-cells-large"></i></a>
      </li>
    </ul>
  </div>
</nav>

```html
<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-light navbar-white">
  <div class="container">
    <a href="index3.html" class="navbar-brand">
      <img src="dist/img/AdminLVLogo.png" alt="AdminLV Logo" class="brand-image img-circle elevation-3"
           style="opacity: .8">
      <span class="brand-text fw-light">AdminLV 4</span>
    </a>
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
      </li>
      <li class="nav-item d-none d-sm-inline-block">
        <a href="index3.html" class="nav-link">Home</a>
      </li>
      <li class="nav-item d-none d-sm-inline-block">
        <a href="#" class="nav-link">Contact</a>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown4" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Help
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown4">
          <a class="dropdown-item" href="#">FAQ</a>
          <a class="dropdown-item" href="#">Support</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#">Contact</a>
        </div>
      </li>
    </ul>
    <!-- SEARCH FORM -->
    <form class="d-flex flex-wrap align-items-center ms-3">
      <div class="input-group input-group-sm">
        <input class="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search">
        
          <button class="btn btn-navbar" type="submit">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        
      </div>
    </form>
    <!-- Right navbar links -->
    <ul class="navbar-nav ms-auto">
      <!-- Messages Dropdown Menu -->
      <li class="nav-item dropdown">
        <a class="nav-link" data-bs-toggle="dropdown" href="#">
          <i class="fa-solid fa-comments"></i>
          <span class="badge bg-danger navbar-badge">3</span>
        </a>
        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
          <a href="#" class="dropdown-item">
            <!-- Message Start -->
            <div class="d-flex">
              <img src="dist/img/user1-128x128.jpg" alt="User Avatar" class="img-size-50 me-3 img-circle">
              <div class="flex-fill">
                <h3 class="dropdown-item-title">
                  Brad Diesel
                  <span class="float-end text-sm text-danger"><i class="fa-solid fa-star"></i></span>
                </h3>
                <p class="text-sm">Call me whenever you can...</p>
                <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
              </div>
            </div>
            <!-- Message End -->
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <!-- Message Start -->
            <div class="d-flex">
              <img src="dist/img/user8-128x128.jpg" alt="User Avatar" class="img-size-50 img-circle me-3">
              <div class="flex-fill">
                <h3 class="dropdown-item-title">
                  John Pierce
                  <span class="float-end text-sm text-muted"><i class="fa-solid fa-star"></i></span>
                </h3>
                <p class="text-sm">I got your message bro</p>
                <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
              </div>
            </div>
            <!-- Message End -->
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <!-- Message Start -->
            <div class="d-flex">
              <img src="dist/img/user3-128x128.jpg" alt="User Avatar" class="img-size-50 img-circle me-3">
              <div class="flex-fill">
                <h3 class="dropdown-item-title">
                  Nora Silvester
                  <span class="float-end text-sm text-warning"><i class="fa-solid fa-star"></i></span>
                </h3>
                <p class="text-sm">The subject goes here</p>
                <p class="text-sm text-muted"><i class="fa-regular fa-clock me-1"></i> 4 Hours Ago</p>
              </div>
            </div>
            <!-- Message End -->
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item dropdown-footer">See All Messages</a>
        </div>
      </li>
      <!-- Notifications Dropdown Menu -->
      <li class="nav-item dropdown">
        <a class="nav-link" data-bs-toggle="dropdown" href="#">
          <i class="fa-regular fa-bell"></i>
          <span class="badge bg-warning navbar-badge">15</span>
        </a>
        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
          <span class="dropdown-header">15 Notifications</span>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="fa-solid fa-envelope me-2"></i> 4 new messages
            <span class="float-end text-muted text-sm">3 mins</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="fa-solid fa-users me-2"></i> 8 friend requests
            <span class="float-end text-muted text-sm">12 hours</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="fa-solid fa-file me-2"></i> 3 new reports
            <span class="float-end text-muted text-sm">2 days</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
        </div>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-widget="control-sidebar" data-bs-slide="true" href="#" role="button"><i
            class="fa-solid fa-table-cells-large"></i></a>
      </li>
    </ul>
  </div>
</nav>
<!-- /.navbar -->
```
{: .max-height-300}


> ##### Tip!
> To get a bigger dropdown menu you can add `.dropdown-menu-lg` or `.dropdown-menu-xl` to `.dropdown-menu`.
> You can also get the legacy dropdown offset with adding `.dropdown-legacy` to `.main-header`.
{: .quote-info}
