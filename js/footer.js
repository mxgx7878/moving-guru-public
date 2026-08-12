/* ═══════════════════════════════════════════════
   MOVING GURU — Centralized Footer
   footer.js — Sirf yahi ek file manage karo

   Har page par sirf yeh chahiye:
     1) <div id="mg-footer"></div>   (jahan footer chahiye)
     2) <script src="js/footer.js"></script>  (navbar.js ke baad)

   openModal() navbar.js define karta hai — isliye footer.js
   ko navbar.js ke baad load karo.
   ═══════════════════════════════════════════════ */

(function () {

  // ─── FOOTER LINKS (ek hi jagah se manage) ───
  const PLATFORM_LINKS = [
    { href: 'index.html',        label: 'Home' },
    { href: 'how-it-works.html', label: 'How It Works' },
    { href: 'community.html',    label: 'Community' },
    { href: 'grow.html',         label: 'Grow' },
    { href: 'pricing.html',      label: 'Pricing' },
  ];

  const COMPANY_LINKS = [
    { href: 'how-it-works.html', label: 'Our Story' },
    { href: 'terms.html#terms',   label: 'Terms &amp; Conditions' },
    { href: 'terms.html#privacy', label: 'Privacy Policy' },
  ];

  const YEAR = 2026;

  // ─── BUILD FOOTER HTML ───
  function buildFooter() {
    const platformHtml = PLATFORM_LINKS
      .map(l => `<a href="${l.href}">${l.label}</a>`).join('\n            ');
    const companyHtml = COMPANY_LINKS
      .map(l => `<a href="${l.href}">${l.label}</a>`).join('\n            ');

    return `
<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">MOVING GURU</div>
        <p class="footer-brand-desc">
          The global wellness network connecting movement professionals worldwide.
        </p>
        <p class="footer-email">Admin@movingguru.co</p>
      </div>
      <div class="footer-col">
        <h4>Platform</h4>
        ${platformHtml}
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        ${companyHtml}
      </div>
      <div class="footer-col">
        <h4>Connect</h4>
        <a href="https://www.instagram.com/movingguru.co/">Instagram</a>
        <a href="#" onclick="openModal('signup');return false;">Join Now</a>
        <a href="#" onclick="openModal('login');return false;">Log In</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${YEAR} Moving Guru. All rights reserved.</p>
    </div>
  </div>
</footer>`;
  }

  // ─── INJECT FOOTER ───
  function injectFooter() {
    const placeholder = document.getElementById('mg-footer');
    if (!placeholder) return;
    placeholder.outerHTML = buildFooter();
  }

  // ─── INIT ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }

})();
