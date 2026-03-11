/* ═══════════════════════════════════════════════
   MOVING GURU — Centralized Navbar + Auth State
   navbar.js — Sirf yahi ek file manage karo
   ═══════════════════════════════════════════════ */

(function () {

  // ─── AUTH HELPERS ───
  function getUser() {
    try { return JSON.parse(localStorage.getItem('mg_user')); } catch { return null; }
  }
  function setUser(u) { localStorage.setItem('mg_user', JSON.stringify(u)); }
  function clearUser() { localStorage.removeItem('mg_user'); }

  // ─── DETECT CURRENT PAGE ───
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const pageMap = {
    'index.html': 'home', '': 'home',
    'how-it-works.html': 'how-it-works',
    'community.html': 'community',
    'grow.html': 'grow'
  };
  const currentPage = pageMap[path] || 'home';

  // ─── BUILD NAVBAR HTML ───
  function buildNavbar() {
    const user = getUser();

    const links = [
      { page: 'home',         href: 'index.html',        label: 'Home' },
      { page: 'how-it-works', href: 'how-it-works.html', label: 'How It Works' },
      { page: 'community',    href: 'community.html',     label: 'Community' },
      { page: 'grow',         href: 'grow.html',          label: 'Grow' },
      { page: 'pricing',      href: 'pricing.html',       label: 'Pricing' }
    ];

    const navLinksHtml = links.map(l =>
      `<a href="${l.href}" class="nav-link${currentPage === l.page ? ' active' : ''}" data-page="${l.page}">${l.label}</a>`
    ).join('');

    // Auth section — logged in vs logged out
    const authHtml = user ? buildUserMenu(user) : `
      <div class="nav-divider"></div>
      <button class="btn-nav-login" onclick="openModal('login')">Log In</button>
      <button class="btn-nav-signup" onclick="openModal('signup')">Sign Up</button>
    `;

    // Drawer auth section
    const drawerAuthHtml = user ? `
      <div class="drawer-auth">
        <div class="drawer-user-info">
          <div class="drawer-user-avatar">${getInitials(user.name)}</div>
          <div>
            <div class="drawer-user-name">${user.name}</div>
            <div class="drawer-user-email">${user.email}</div>
          </div>
        </div>
        <a href="#" class="drawer-link" onclick="return false;">
          <span class="drawer-link-icon">⚡</span> Dashboard
        </a>
        <div class="drawer-divider"></div>
        <button class="drawer-btn-logout" onclick="mgLogout()">Log Out</button>
      </div>
    ` : `
      <div class="drawer-auth">
        <button class="drawer-btn-login" onclick="closeDrawerAndOpenModal('login')">Log In</button>
        <button class="drawer-btn-signup" onclick="closeDrawerAndOpenModal('signup')">Sign Up — It's Free</button>
      </div>
    `;

    // Drawer links
    const drawerLinksHtml = links.map(l => `
      <a href="${l.href}" class="drawer-link${currentPage === l.page ? ' active' : ''}" data-page="${l.page}">
        <span class="drawer-link-icon">${drawerIcon(l.page)}</span> ${l.label}
      </a>
    `).join('');

    return `
<!-- NAVBAR -->
<nav class="navbar" id="navbar">
  <a href="index.html" class="nav-logo">MOVING <em>GURU</em></a>
  <div class="nav-links">
    ${navLinksHtml}
    ${authHtml}
  </div>
  <button class="hamburger" id="hamburger" aria-label="Open menu">
    <span></span><span></span><span></span>
  </button>
</nav>

<!-- AUTH MODAL -->
<div class="modal-overlay" id="authModal" onclick="closeModalOutside(event)">
  <div class="modal">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <h2 id="modalTitle">Log In</h2>
    <p id="modalDesc">Welcome back. Sign in to your Moving Guru account.</p>
    <div class="modal-field" id="nameField" style="display:none;">
      <label>Full Name</label>
      <input type="text" id="inputName" placeholder="Your name" />
    </div>
    <div class="modal-field">
      <label>Email</label>
      <input type="email" id="inputEmail" placeholder="you@email.com" />
    </div>
    <div class="modal-field">
      <label>Password</label>
      <input type="password" id="inputPassword" placeholder="Your password" />
    </div>
    <button class="modal-submit" id="modalSubmit" onclick="handleAuthSubmit()">Log In</button>
    <div class="modal-toggle" id="modalToggle">
      Don't have an account? <a onclick="toggleAuthMode()">Sign Up</a>
    </div>
  </div>
</div>

<!-- DRAWER OVERLAY -->
<div class="drawer-overlay" id="drawerOverlay"></div>

<!-- MOBILE DRAWER -->
<div class="mobile-drawer" id="mobileDrawer">
  <div class="drawer-header">
    <span class="drawer-logo">MOVING <em>GURU</em></span>
    <button class="drawer-close" id="drawerClose">&times;</button>
  </div>
  <nav class="drawer-nav">
    ${drawerLinksHtml}
  </nav>
  <div class="drawer-divider"></div>
  ${drawerAuthHtml}
</div>
    `;
  }

  function drawerIcon(page) {
    return { home: '🏠', 'how-it-works': '💡', community: '🌍', grow: '🌱' }[page] || '📄';
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // ─── USER MENU (Desktop) ───
  function buildUserMenu(user) {
    return `
      <div class="nav-divider"></div>
      <div class="nav-user-wrap" id="navUserWrap">
        <button class="nav-user-btn" id="navUserBtn" onclick="toggleUserDropdown()">
          <div class="nav-user-avatar">${getInitials(user.name)}</div>
          <span class="nav-user-name">${user.name.split(' ')[0]}</span>
          <svg class="nav-user-caret" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="nav-user-dropdown" id="navUserDropdown">
          <div class="dropdown-user-info">
            <div class="dropdown-avatar">${getInitials(user.name)}</div>
            <div>
              <div class="dropdown-name">${user.name}</div>
              <div class="dropdown-email">${user.email}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" onclick="return false;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a href="#" class="dropdown-item" onclick="return false;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </a>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item dropdown-logout" onclick="mgLogout()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Log Out
          </button>
        </div>
      </div>
    `;
  }

  // ─── INJECT NAVBAR ───
  function injectNavbar() {
    const placeholder = document.getElementById('mg-navbar');
    if (!placeholder) return;
    placeholder.outerHTML = buildNavbar();
    bindNavbarEvents();
  }

  // ─── BIND EVENTS ───
  function bindNavbarEvents() {
    // Navbar scroll
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('navbar');
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
    });

    // Hamburger + Drawer
    const hamburger = document.getElementById('hamburger');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const drawerClose = document.getElementById('drawerClose');

    function openDrawer() {
      hamburger.classList.add('open');
      drawer.classList.add('open');
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
      setTimeout(() => overlay.classList.add('visible'), 10);
    }
    function closeDrawerFn() {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
      setTimeout(() => overlay.classList.remove('show'), 300);
    }

    if (hamburger) hamburger.addEventListener('click', () =>
      drawer.classList.contains('open') ? closeDrawerFn() : openDrawer()
    );
    if (overlay) overlay.addEventListener('click', closeDrawerFn);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawerFn);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDropdown(); closeDrawerFn(); } });

    // Close dropdown on outside click
    document.addEventListener('click', e => {
      const wrap = document.getElementById('navUserWrap');
      if (wrap && !wrap.contains(e.target)) closeDropdown();
    });

    // Store closeDrawer globally for modal
    window._closeDrawer = closeDrawerFn;
  }

  // ─── DROPDOWN ───
  window.toggleUserDropdown = function () {
    const dd = document.getElementById('navUserDropdown');
    if (dd) dd.classList.toggle('open');
  };
  function closeDropdown() {
    const dd = document.getElementById('navUserDropdown');
    if (dd) dd.classList.remove('open');
  }

  // ─── AUTH MODAL ───
  let authMode = 'login';

  window.openModal = function (mode) {
    authMode = mode;
    const overlay = document.getElementById('authModal');
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDesc');
    const nameField = document.getElementById('nameField');
    const submit = document.getElementById('modalSubmit');
    const toggle = document.getElementById('modalToggle');
    if (!overlay) return;

    if (mode === 'login') {
      title.textContent = 'Log In';
      desc.textContent = 'Welcome back. Sign in to your Moving Guru account.';
      nameField.style.display = 'none';
      submit.textContent = 'Log In';
      toggle.innerHTML = "Don't have an account? <a onclick=\"toggleAuthMode()\">Sign Up</a>";
    } else {
      title.textContent = 'Sign Up';
      desc.textContent = 'Create your Moving Guru profile and start connecting.';
      nameField.style.display = 'block';
      submit.textContent = 'Create Account';
      toggle.innerHTML = 'Already have an account? <a onclick="toggleAuthMode()">Log In</a>';
    }
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function () {
    const el = document.getElementById('authModal');
    if (el) el.classList.remove('show');
    document.body.style.overflow = '';
  };

  window.closeModalOutside = function (e) {
    if (e.target === e.currentTarget) window.closeModal();
  };

  window.toggleAuthMode = function () {
    window.openModal(authMode === 'login' ? 'signup' : 'login');
  };

  // Handle submit — save user, rebuild navbar
  window.handleAuthSubmit = function () {
    const email = document.getElementById('inputEmail')?.value?.trim();
    const password = document.getElementById('inputPassword')?.value;
    const nameInput = document.getElementById('inputName');

    if (!email || !password) return;

    let name = '';
    if (authMode === 'signup') {
      name = nameInput?.value?.trim();
      if (!name) { nameInput.focus(); return; }
    } else {
      // For demo: use email prefix as name if no stored user
      const existing = getUser();
      name = existing?.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    setUser({ name, email });
    window.closeModal();
    // Rebuild navbar with logged-in state
    rebuildNavbar();
  };

  // ─── LOGOUT ───
  window.mgLogout = function () {
    clearUser();
    rebuildNavbar();
  };

  // ─── CLOSE DRAWER & OPEN MODAL ───
  window.closeDrawerAndOpenModal = function (mode) {
    if (window._closeDrawer) window._closeDrawer();
    setTimeout(() => window.openModal(mode), 200);
  };

  // ─── REBUILD NAVBAR (after login/logout) ───
  function rebuildNavbar() {
    const nav = document.getElementById('navbar');
    const authModal = document.getElementById('authModal');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const mobileDrawer = document.getElementById('mobileDrawer');

    // Remove old navbar elements
    [nav, authModal, drawerOverlay, mobileDrawer].forEach(el => { if (el) el.remove(); });

    // Re-inject
    const temp = document.createElement('div');
    temp.id = 'mg-navbar';
    document.body.insertBefore(temp, document.body.firstChild);
    injectNavbar();
  }

  // ─── INIT ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
  } else {
    injectNavbar();
  }

})();