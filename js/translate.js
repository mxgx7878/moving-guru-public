/* ═══════════════════════════════════════════════
   MOVING GURU — Translation Widget
   
   USAGE: Add this single line before </body> on each page:
   <script src="js/translate.js"></script>
   ═══════════════════════════════════════════════ */

(function () {
  // ─── LANGUAGES ───
  const LANGUAGES = [
    { code: "en", label: "English", flag: "GB" },
    { code: "es", label: "Español", flag: "ES" },
    { code: "fr", label: "Français", flag: "FR" },
    { code: "de", label: "Deutsch", flag: "DE" },
    { code: "pt", label: "Português", flag: "PT" },
    { code: "it", label: "Italiano", flag: "IT" },
    { code: "ja", label: "日本語", flag: "JP" },
    { code: "ko", label: "한국어", flag: "KR" },
    { code: "zh", label: "中文", flag: "CN" },
    { code: "ar", label: "العربية", flag: "SA" },
    { code: "hi", label: "हिन्दी", flag: "IN" },
    { code: "th", label: "ไทย", flag: "TH" },
    { code: "id", label: "Bahasa Indonesia", flag: "ID" },
    { code: "nl", label: "Nederlands", flag: "NL" },
    { code: "sv", label: "Svenska", flag: "SE" },
    { code: "ru", label: "Русский", flag: "RU" },
    { code: "tr", label: "Türkçe", flag: "TR" },
    { code: "pl", label: "Polski", flag: "PL" },
  ];

  // ─── FLAG EMOJI FROM COUNTRY CODE ───
  function flagEmoji(cc) {
    return String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
  }

  // ─── INJECT FONT AWESOME (if not already present) ───
  if (!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]')) {
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    document.head.appendChild(fa);
  }

  // ─── INJECT STYLES ───
  const style = document.createElement("style");
  style.textContent = `
    /* Translation FAB */
    .mg-translate-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #1A1A18;
      color: #D4FF00;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
      transition: transform 0.2s, box-shadow 0.2s;
      font-family: 'DM Sans', sans-serif;
    }
    .mg-translate-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(0,0,0,0.25);
    }
    .mg-translate-fab .fa-globe {
      font-size: 20px;
      color: #D4FF00;
    }

    /* Dropdown panel */
    .mg-translate-panel {
      position: fixed;
      bottom: 84px;
      right: 24px;
      z-index: 9999;
      width: 220px;
      max-height: 360px;
      background: #fff;
      border: 1px solid #E5E0D8;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.12);
      overflow: hidden;
      display: none;
      flex-direction: column;
      animation: mgTranslateIn 0.2s ease;
      font-family: 'DM Sans', sans-serif;
    }
    .mg-translate-panel.open {
      display: flex;
    }
    @keyframes mgTranslateIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mg-translate-header {
      padding: 14px 16px 10px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #9A9A94;
      border-bottom: 1px solid #E5E0D8;
      flex-shrink: 0;
    }

    .mg-translate-search {
      padding: 8px 12px;
      flex-shrink: 0;
    }
    .mg-translate-search input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #E5E0D8;
      border-radius: 8px;
      font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      color: #2A2A28;
      background: #F7F5F0;
      outline: none;
      transition: border-color 0.2s;
    }
    .mg-translate-search input:focus {
      border-color: #8B9A00;
    }
    .mg-translate-search input::placeholder {
      color: #9A9A94;
    }

    .mg-translate-list {
      overflow-y: auto;
      flex: 1;
      padding: 4px 0;
    }
    .mg-translate-list::-webkit-scrollbar { width: 4px; }
    .mg-translate-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

    .mg-translate-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      font-size: 14px;
      color: #2A2A28;
      cursor: pointer;
      transition: background 0.15s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: 'DM Sans', sans-serif;
    }
    .mg-translate-item:hover {
      background: #F7F5F0;
    }
    .mg-translate-item.active {
      background: rgba(212,255,0,0.1);
      color: #8B9A00;
      font-weight: 600;
    }
    .mg-translate-item .mg-flag {
      font-size: 18px;
      line-height: 1;
      flex-shrink: 0;
    }

    .mg-translate-credit {
      padding: 8px 16px;
      font-size: 10px;
      color: #bbb;
      text-align: center;
      border-top: 1px solid #E5E0D8;
      flex-shrink: 0;
    }

    /* Backdrop for mobile */
    @media (max-width: 600px) {
      .mg-translate-panel {
        right: 12px;
        bottom: 78px;
        width: calc(100vw - 24px);
        max-height: 50vh;
      }
      .mg-translate-fab {
        bottom: 18px;
        right: 12px;
      }
    }
  `;
  document.head.appendChild(style);

  // ─── BUILD DOM ───
  // FAB button
  const fab = document.createElement("button");
  fab.className = "mg-translate-fab";
  fab.setAttribute("aria-label", "Translate website");
  fab.innerHTML = `<i class="fa-solid fa-globe"></i>`;
  document.body.appendChild(fab);

  // Panel
  const panel = document.createElement("div");
  panel.className = "mg-translate-panel";
  panel.innerHTML = `
    <div class="mg-translate-header">Translate</div>
    <div class="mg-translate-search">
      <input type="text" placeholder="Search language..." id="mgLangSearch" />
    </div>
    <div class="mg-translate-list" id="mgLangList"></div>
    <div class="mg-translate-credit">Powered by Google Translate</div>
  `;
  document.body.appendChild(panel);

  const listEl = panel.querySelector("#mgLangList");
  const searchEl = panel.querySelector("#mgLangSearch");

  function renderList(filter) {
    const q = (filter || "").toLowerCase();
    const current = getCurrentLang();
    listEl.innerHTML = LANGUAGES
      .filter(l => !q || l.label.toLowerCase().includes(q) || l.code.includes(q))
      .map(l => `
        <button class="mg-translate-item${l.code === current ? ' active' : ''}" data-lang="${l.code}">
          <span class="mg-flag">${flagEmoji(l.flag)}</span>
          ${l.label}
        </button>
      `).join("");
  }

  renderList();

  // ─── EVENTS ───
  fab.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      searchEl.value = "";
      renderList();
      searchEl.focus();
    }
  });

  searchEl.addEventListener("input", () => renderList(searchEl.value));

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".mg-translate-item");
    if (!btn) return;
    const lang = btn.dataset.lang;
    translatePage(lang);
    panel.classList.remove("open");
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== fab) {
      panel.classList.remove("open");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") panel.classList.remove("open");
  });

  // ─── GOOGLE TRANSLATE INTEGRATION ───
  // Inject Google Translate element (hidden)
  function initGoogleTranslate() {
    // Add hidden container
    const container = document.createElement("div");
    container.id = "google_translate_element";
    container.style.cssText = "position:absolute;top:-9999px;left:-9999px;";
    document.body.appendChild(container);

    // Load Google Translate script
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=mgTranslateInit";
    document.body.appendChild(script);
  }

  // Callback for Google Translate
  window.mgTranslateInit = function () {
    new google.translate.TranslateElement(
      { pageLanguage: "en", autoDisplay: false },
      "google_translate_element"
    );
  };

  function translatePage(langCode) {
    if (langCode === "en") {
      // Revert to original
      const frame = document.querySelector("iframe.goog-te-banner-frame");
      if (frame) {
        const innerDoc = frame.contentDocument || frame.contentWindow.document;
        const restoreBtn = innerDoc.querySelector(".goog-close-link");
        if (restoreBtn) restoreBtn.click();
      }
      // Fallback: clear the cookie
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + location.hostname;
      setTimeout(() => location.reload(), 100);
      return;
    }

    // Set translation cookie and trigger
    document.cookie = "googtrans=/en/" + langCode + "; path=/;";
    document.cookie = "googtrans=/en/" + langCode + "; path=/; domain=." + location.hostname;

    // If Google Translate is already loaded, trigger via the select
    const sel = document.querySelector(".goog-te-combo");
    if (sel) {
      sel.value = langCode;
      sel.dispatchEvent(new Event("change"));
      renderList();
    } else {
      // Reload to pick up the cookie
      location.reload();
    }
  }

  function getCurrentLang() {
    const match = document.cookie.match(/googtrans=\/en\/(\w+)/);
    return match ? match[1] : "en";
  }

  // ─── HIDE GOOGLE TRANSLATE TOOLBAR ───
  const hideGTStyle = document.createElement("style");
  hideGTStyle.textContent = `
    .goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame,
    .goog-tooltip, .goog-tooltip:hover, .goog-text-highlight,
    #google_translate_element { display: none !important; }
    body { top: 0 !important; }
    .skiptranslate { display: none !important; }
  `;
  document.head.appendChild(hideGTStyle);

  // Init on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGoogleTranslate);
  } else {
    initGoogleTranslate();
  }
})();
