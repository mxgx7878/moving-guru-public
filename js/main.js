/* ═══════════════════════════════════════════════
   MOVING GURU — Shared JavaScript
   ═══════════════════════════════════════════════ */

// ─── API CONFIG ───
// Same backend the React portal talks to. The instructors / grow-posts /
// plans endpoints are all publicly accessible (no auth header needed).
// See routes/api.php — these routes sit above the auth:sanctum group.
const API_BASE = 'https://demowebportals.com/moving-guru-backend/public/api';


// ─── DATA ───
// NOTE: This list is the single source of truth for the public
// marketing site. It MUST stay in sync with src/data/disciplines.js
// (the portal-side master). When you add/remove a discipline, update
// both files.
const DISCIPLINES = [
  { category: "Yoga & Mind-Body Movement", items: [
    "Hatha Yoga", "Vinyasa Yoga", "Ashtanga Yoga", "Yin Yoga",
    "Restorative Yoga", "Hot Yoga / Bikram", "Prenatal Yoga",
    "Chair Yoga", "Acro Yoga", "Yoga Flow / Power Yoga", "Somatic Movement",
  ]},
  { category: "Pilates & Similar", items: [
    "Mat Pilates", "Reformer Pilates", "Barre",
    "Clinical / Physical Therapy Pilates", "Hot Matt Pilates", "Lagree",
  ]},
  { category: "Martial Arts & Combat Sports", items: [
    "Brazilian Jiu-Jitsu (BJJ)", "Boxing", "Muay Thai", "Kickboxing",
    "Taekwondo", "Karate", "Judo", "Wrestling", "Krav Maga",
    "Mixed Martial Arts (MMA)",
  ]},
  { category: "Cardio & Functional Training", items: [
    "Spinning / Indoor Cycling", "HIIT", "Bootcamp",
    "Dance Cardio (e.g., Zumba, Jungle Body)",
    "Personal Trainer", "Aerobics",
  ]},
  { category: "Sports & Outdoor", items: [
    "Swimming", "Horse Riding", "Tennis", "Climbing / Bouldering",
    "Snow Sports", "Soccer", "Surfing", "Sailing", "Archery", "Fencing",
    "Paddle Boarding", "Rowing", "Gymnastics", "AFL", "Basketball",
    "Rugby", "Cricket", "Coach (Other)",
  ]},
  { category: "Mind Body / Wellness Relaxation", items: [
    "Breathwork / Pranayama", "Meditation", "Reiki Healer / Light Workers",
    "Sound Bath / Sound Healing", "Tai Chi", "Qigong",
  ]},
  { category: "Holistic & Wellness Therapies", items: [
    "Acupuncture", "Somatic Therapy", "Traditional Chinese Medicine",
    "Naturopath", "Nutritionist",
  ]},
  { category: "Recovery & Regeneration", items: [
    "Massage", "Bowen Therapy", "Physio Therapy",
    "Myofascial Release", "Cupping",
  ]},
  { category: "Dance & Expressive Movement", items: [
    "Ballet Fitness", "Contemporary Dance", "Hip-Hop Dance",
    "Latin Dance (Salsa, Bachata)", "Ballroom Dance",
    "Pole Fitness and Exotic Dance", "Dance + Strength Fusion",
    "Dance Movement Therapy", "Aerial Fitness / Silks",
  ]},
  { category: "Studio Operations", items: [
    "Administration Staff", "Other",
  ]},
];

const ALL_DISCIPLINES = DISCIPLINES.flatMap(d => d.items.map(item => ({ name: item, category: d.category })));

// Reverse lookup: discipline name → category. Used by the community
// page to filter instructors by category client-side (the API filters
// by individual discipline only).
const DISCIPLINE_TO_CATEGORY = (() => {
  const m = {};
  DISCIPLINES.forEach(cat => cat.items.forEach(item => { m[item] = cat.category; }));
  return m;
})();


const COUNTRIES = [
"Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
"Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
"Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
"Denmark","Djibouti","Dominica","Dominican Republic",
"Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
"Fiji","Finland","France",
"Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
"Haiti","Honduras","Hungary",
"Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
"Jamaica","Japan","Jordan",
"Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan",
"Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
"Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
"Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
"Oman",
"Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
"Qatar",
"Romania","Russia","Rwanda",
"Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
"Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
"Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
"Vanuatu","Vatican City","Venezuela","Vietnam",
"Yemen",
"Zambia","Zimbabwe"
];
const LANGUAGES = ["English", "Spanish", "German", "French", "Portuguese", "Japanese", "Korean", "Arabic", "Mandarin", "Hindi", "Italian", "Thai"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


// ─── HELPERS ───
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s) {
  // Safe to embed inside a single-quoted onclick attribute.
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}


// ─── NAVBAR SCROLL ───
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 30);
});

// ─── SET ACTIVE NAV LINK ───
function setActiveNav(page) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const active = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (active) active.classList.add('active');
}

// ─── SCROLL REVEAL ───
function observeAll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}
document.addEventListener('DOMContentLoaded', observeAll);


// ─── SEARCH AUTOCOMPLETE (Home page) ───
function handleSearchInput() {
  const input = document.getElementById('searchInput');
  const ac = document.getElementById('searchAC');
  if (!input || !ac) return;

  const val = input.value.toLowerCase().trim();
  if (!val) { ac.classList.remove('show'); return; }

  const matches = ALL_DISCIPLINES.filter(d => d.name.toLowerCase().includes(val)).slice(0, 8);
  if (!matches.length) { ac.classList.remove('show'); return; }

  ac.innerHTML = matches.map(m =>
    `<div class="autocomplete-item" onclick="selectDiscipline('${escapeAttr(m.name)}')">${escapeHtml(m.name)} <span class="ac-cat">${escapeHtml(m.category)}</span></div>`
  ).join('');
  ac.classList.add('show');
}

function selectDiscipline(name) {
  const input = document.getElementById('searchInput');
  const ac = document.getElementById('searchAC');
  if (input) input.value = name;
  if (ac) ac.classList.remove('show');
}

document.addEventListener('click', (e) => {
  const bar = document.getElementById('searchBar');
  const ac = document.getElementById('searchAC');
  if (bar && ac && !bar.contains(e.target)) ac.classList.remove('show');
});


// ─── POPULATE FILTER DROPDOWNS ───
function populateFilters() {
  const cSel = document.getElementById('filterCountry');
  const lSel = document.getElementById('filterLanguage');
  const mSel = document.getElementById('filterMonth');

  if (cSel) COUNTRIES.slice().sort().forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; cSel.appendChild(o); });
  if (lSel) LANGUAGES.slice().sort().forEach(l => { const o = document.createElement('option'); o.value = l; o.textContent = l; lSel.appendChild(o); });
  if (mSel) MONTHS.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; mSel.appendChild(o); });

  // Grow page — populate any discipline <select> with the full categorised
  // list. We target by id so adding more selects later is just a matter of
  // giving them one of these ids.
  ['growDisc', 'growFormDisc'].forEach(id => populateDisciplineSelect(id));
}
document.addEventListener('DOMContentLoaded', populateFilters);


/**
 * Replace the contents of a <select> with the full discipline list,
 * grouped by category via <optgroup>. The first existing <option>
 * (which carries the placeholder like "All Disciplines" / "Select
 * discipline") is preserved.
 */
function populateDisciplineSelect(id) {
  const sel = document.getElementById(id);
  if (!sel) return;

  const placeholder = sel.querySelector('option');
  sel.innerHTML = '';
  if (placeholder) sel.appendChild(placeholder);

  DISCIPLINES.forEach(cat => {
    const grp = document.createElement('optgroup');
    grp.label = cat.category;
    cat.items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      grp.appendChild(opt);
    });
    sel.appendChild(grp);
  });
}


// ─── DISCIPLINES TABS (Home page) ───
let activeDisc = 0;

function renderDisc() {
  const tabsEl = document.getElementById('discTabs');
  const itemsEl = document.getElementById('discItems');
  if (!tabsEl || !itemsEl) return;

  tabsEl.innerHTML = DISCIPLINES.map((d, i) =>
    `<button class="disc-tab${i === activeDisc ? ' active' : ''}" onclick="setDisc(${i})">${escapeHtml(d.category)}</button>`
  ).join('');
  itemsEl.innerHTML = DISCIPLINES[activeDisc].items.map((item, i) =>
    `<div class="disc-item" style="animation-delay:${i * 0.04}s">${escapeHtml(item)}</div>`
  ).join('');
}

function setDisc(i) {
  activeDisc = i;
  renderDisc();
}

document.addEventListener('DOMContentLoaded', renderDisc);


// ─── HERO SLIDE DOTS ───
function initHeroDots() {
  const dots = document.querySelectorAll('.hero-dot');
  if (!dots.length) return;
  let current = 0;
  setInterval(() => {
    dots[current].classList.remove('active');
    current = (current + 1) % dots.length;
    dots[current].classList.add('active');
  }, 6000);
}
document.addEventListener('DOMContentLoaded', initHeroDots);


// ═══════════════════════════════════════════════
//  COMMUNITY PAGE — live data from the API
// ═══════════════════════════════════════════════
//
// Hits GET /api/instructors, maps each instructor to the existing
// community-card shape, and renders the grid.
//
// Two-level filter (mirrors the homepage discTabs/discItems pattern):
//   Row 1 — "All" + 10 category tabs
//   Row 2 — individual discipline chips for whichever category is active

let communityProfiles  = [];
let activeCommunityCat  = null; // category name | null = "All"
let activeCommunityDisc = null; // specific discipline | null = "all in active cat / everything"

function communityGridEl()   { return document.getElementById('communityGrid');       }
function communityFilterEl() { return document.getElementById('communityDiscFilter'); }

/**
 * Inject the community-chip stylesheet once (so we don't have to edit
 * css/style.css to ship the two-row filter).
 */
function ensureCommunityChipStyles() {
  if (document.getElementById('community-chip-styles')) return;
  const s = document.createElement('style');
  s.id = 'community-chip-styles';
  s.textContent = `
    .community-chip {
      padding: 7px 14px; border-radius: var(--radius-pill); cursor: pointer;
      border: 1px solid var(--border); background: var(--white);
      color: var(--text-mid); font-family: 'DM Sans', sans-serif;
      font-size: 12px; font-weight: 600; transition: all 0.2s;
      letter-spacing: 0.2px;
    }
    .community-chip:hover { border-color: var(--text-light); color: var(--text); }
    .community-chip.active {
      border-color: var(--lime-dark);
      background: var(--lime-soft);
      color: var(--lime-dark);
    }
  `;
  document.head.appendChild(s);
}


async function initCommunity() {
  const filterEl = communityFilterEl();
  const grid = communityGridEl();
  if (!filterEl || !grid) return;

  ensureCommunityChipStyles();

  // The wrapper div has class "disc-tabs" (flex row) baked in by the page
  // markup. Our two-row content needs block stacking — override here.
  filterEl.style.display = 'block';
  filterEl.style.flexWrap = '';
  filterEl.style.gap = '';

  renderCommunityFilters();

  grid.innerHTML = communityMessage('Loading instructors…');

  try {
    const res = await fetch(`${API_BASE}/instructors?active_only=true&per_page=50`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json || json.success === false) {
      throw new Error(json?.message || 'Request failed');
    }
    const list = json?.data?.instructors ?? [];
    communityProfiles = list.map(toCommunityProfile);
  } catch (err) {
    console.error('Failed to load instructors:', err);
    grid.innerHTML = communityMessage(
      "Couldn't load instructors right now. Please refresh the page or try again later.",
      'error'
    );
    return;
  }

  renderProfiles(getFilteredCommunityProfiles());
}

document.addEventListener('DOMContentLoaded', initCommunity);


function renderCommunityFilters() {
  const filterEl = communityFilterEl();
  if (!filterEl) return;

  const catRow = `
    <div class="disc-tabs" style="margin-bottom:14px;">
      <button class="disc-tab${activeCommunityCat === null ? ' active' : ''}"
        onclick="setCommunityCategory(null)">All</button>
      ${DISCIPLINES.map(c => `
        <button class="disc-tab${activeCommunityCat === c.category ? ' active' : ''}"
          onclick="setCommunityCategory('${escapeAttr(c.category)}')">${escapeHtml(c.category)}</button>
      `).join('')}
    </div>
  `;

  let discRow = '';
  if (activeCommunityCat) {
    const cat = DISCIPLINES.find(c => c.category === activeCommunityCat);
    if (cat) {
      const chip = (label, value, isActive) => `
        <button class="community-chip${isActive ? ' active' : ''}"
          onclick="setCommunityDiscipline(${value === null ? 'null' : `'${escapeAttr(value)}'`})">${escapeHtml(label)}</button>
      `;
      discRow = `
        <div class="community-discipline-row" style="display:flex;flex-wrap:wrap;gap:8px;padding-top:14px;border-top:1px dashed var(--border);">
          ${chip(`All ${cat.category}`, null, activeCommunityDisc === null)}
          ${cat.items.map(d => chip(d, d, activeCommunityDisc === d)).join('')}
        </div>
      `;
    }
  }

  filterEl.innerHTML = catRow + discRow;
}

function setCommunityCategory(cat) {
  activeCommunityCat = cat || null;
  activeCommunityDisc = null;
  renderCommunityFilters();
  renderProfiles(getFilteredCommunityProfiles());
}

function setCommunityDiscipline(disc) {
  activeCommunityDisc = disc || null;
  renderCommunityFilters();
  renderProfiles(getFilteredCommunityProfiles());
}

function getFilteredCommunityProfiles() {
  if (activeCommunityDisc) {
    return communityProfiles.filter(p =>
      (p.disciplines || []).includes(activeCommunityDisc));
  }
  if (activeCommunityCat) {
    return communityProfiles.filter(p =>
      (p.disciplines || []).some(d => DISCIPLINE_TO_CATEGORY[d] === activeCommunityCat));
  }
  return communityProfiles;
}


function toCommunityProfile(inst) {
  const d = inst?.detail || {};
  const disciplines = Array.isArray(d.disciplines) ? d.disciplines : [];
  const languages   = Array.isArray(d.languages)   ? d.languages   : [];
  const openTo      = Array.isArray(d.openTo)      ? d.openTo      : [];

  const from = d.countryFrom || d.location || '—';
  const to   = d.travelingTo || 'Flexible';

  const availability = d.availability
    || formatAvailabilityRange(d.availableFrom, d.availableTo)
    || 'Open';

  const initials = (inst?.name || '?')
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(p => p[0].toUpperCase()).join('') || '?';

  return {
    id:           inst?.id,
    name:         inst?.name || 'Anonymous',
    from,
    to,
    disciplines,
    disciplineLabel: disciplines.length
      ? disciplines.slice(0, 3).join(', ') + (disciplines.length > 3 ? '…' : '')
      : '—',
    languages:    languages.length ? languages.join(', ') : '—',
    availability,
    openTo:       openTo.length ? openTo.join(' or ') : 'Open',
    initials,
    profilePic:   d.profile_picture_url || d.profile_picture || null,
  };
}

function formatAvailabilityRange(from, to) {
  if (!from && !to) return null;
  if (from && to)   return `${from} – ${to}`;
  return from || to;
}


function renderProfiles(profiles) {
  const grid = communityGridEl();
  if (!grid) return;

  if (!profiles.length) {
    const emptyLabel = activeCommunityDisc
      ? `No instructors found for ${activeCommunityDisc}.`
      : activeCommunityCat
        ? `No instructors found for ${activeCommunityCat}.`
        : 'No instructors are currently active.';
    grid.innerHTML = communityMessage(emptyLabel);
    return;
  }

  grid.innerHTML = profiles.map((p, i) => {
    const avatar = p.profilePic
      ? `<div class="profile-avatar" style="background-image:url('${escapeAttr(p.profilePic)}');background-size:cover;background-position:center;color:transparent;">${escapeHtml(p.initials)}</div>`
      : `<div class="profile-avatar">${escapeHtml(p.initials)}</div>`;

    return `
    <div class="profile-card reveal reveal-d${Math.min(i + 1, 4)}">
      <div class="profile-stripe"></div>
      <div class="profile-header">
        ${avatar}
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.from)}</p>
        </div>
      </div>
      <div class="profile-info">
        <div class="info-row"><span class="info-label">Discipline</span><span class="info-value">${escapeHtml(p.disciplineLabel)}</span></div>
        <div class="info-row"><span class="info-label">Travelling To</span><span class="info-value">${escapeHtml(p.to)}</span></div>
        <div class="info-row"><span class="info-label">Languages</span><span class="info-value">${escapeHtml(p.languages)}</span></div>
        <div class="info-row"><span class="info-label">Available</span><span class="info-value">${escapeHtml(p.availability)}</span></div>
        <div class="info-row"><span class="info-label">Open To</span><span class="info-value">${escapeHtml(p.openTo)}</span></div>
      </div>
      <button onclick="openModal('signup');return false;" class="profile-btn">View Details</button>
    </div>
    `;
  }).join('');

  setTimeout(observeAll, 50);
}

function communityMessage(text, kind = 'info') {
  const color = kind === 'error' ? 'var(--coral)' : 'var(--text-light)';
  return `<p style="grid-column:1/-1;text-align:center;color:${color};font-size:15px;padding:40px 0;">${escapeHtml(text)}</p>`;
}


// ═══════════════════════════════════════════════
//  GROW PAGE — live data from the API
// ═══════════════════════════════════════════════
//
// Replaces the old hardcoded GROW_EVENTS array. Hits GET /api/grow-posts,
// then filters client-side based on the four selects (country / month /
// discipline / type). Client-side filtering keeps the UI snappy on
// small datasets and means changing a filter doesn't trigger a refetch.

let growPosts = [];

function growGridEl() { return document.getElementById('growGrid'); }

async function initGrow() {
  const grid = growGridEl();
  if (!grid) return;

  // Wire up filter change listeners
  ['growCountry', 'growMonth', 'growDisc', 'growType'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderGrowEvents);
  });

  grid.innerHTML = growMessage('Loading opportunities…');

  try {
    const res = await fetch(`${API_BASE}/grow-posts?per_page=50`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json || json.success === false) {
      throw new Error(json?.message || 'Request failed');
    }

    // /api/grow-posts returns posts as an array directly under .data
    // (unlike the wrapped {posts:[...]} shape used elsewhere).
    const list = Array.isArray(json?.data) ? json.data : [];
    growPosts = list.map(toGrowEvent);
  } catch (err) {
    console.error('Failed to load grow posts:', err);
    grid.innerHTML = growMessage(
      "Couldn't load opportunities right now. Please refresh the page or try again later.",
      'error'
    );
    return;
  }

  renderGrowEvents();
}

document.addEventListener('DOMContentLoaded', initGrow);


/**
 * Map a GrowPost API record to the lean shape the Grow card expects.
 */
function toGrowEvent(p) {
  const dateLabel  = formatGrowDateLabel(p?.date_from, p?.date_to);
  const monthName  = monthFromDate(p?.date_from);
  const country    = countryFromLocation(p?.location);
  const typeLabel  = capitalize(p?.type || 'Event');
  const tag        = pickTag(p);
  const disciplineNames = Array.isArray(p?.disciplines) ? p.disciplines : [];
  const cover      = Array.isArray(p?.images) && p.images[0] ? p.images[0] : null;

  return {
    id:        p?.id,
    type:      typeLabel,
    typeRaw:   p?.type,
    date:      dateLabel || 'TBA',
    month:     monthName,
    country,
    location:  p?.location || '',
    title:     p?.title || 'Untitled',
    desc:      p?.description || '',
    tag,
    disciplines: disciplineNames,
    cover,
    externalUrl: p?.external_url || null,
    isFeatured:  !!p?.is_featured,
  };
}

/** "Nov 2026" or "Nov 6 – Nov 13, 2026" depending on whether ranges differ. */
function formatGrowDateLabel(from, to) {
  if (!from) return null;
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  const f = new Date(from);
  if (isNaN(f.getTime())) return null;
  if (!to) return f.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const t = new Date(to);
  if (isNaN(t.getTime())) return f.toLocaleDateString('en-US', opts);
  if (f.getMonth() === t.getMonth() && f.getFullYear() === t.getFullYear()) {
    return f.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  return `${f.toLocaleDateString('en-US', opts)} – ${t.toLocaleDateString('en-US', opts)}`;
}

function monthFromDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return MONTHS[date.getMonth()] || '';
}

/** "Koh Samui, Thailand" → "Thailand". Returns last comma-separated part. */
function countryFromLocation(loc) {
  if (!loc) return '';
  const parts = String(loc).split(',').map(s => s.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

/** Pick a single tag to show on the card — first explicit tag wins, then falls back. */
function pickTag(p) {
  if (Array.isArray(p?.tags) && p.tags.length) return p.tags[0];
  if (p?.is_featured) return 'Featured';
  if (p?.spots_left === 0) return 'Sold Out';
  if (typeof p?.spots_left === 'number' && p.spots_left <= 5) return 'Almost Full';
  return '';
}

function capitalize(s) {
  s = String(s || '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}


function renderGrowEvents() {
  const grid = growGridEl();
  if (!grid) return;

  const country = document.getElementById('growCountry')?.value || '';
  const month   = document.getElementById('growMonth')?.value   || '';
  const disc    = document.getElementById('growDisc')?.value    || '';
  const type    = document.getElementById('growType')?.value    || '';

  const filtered = growPosts.filter(e => {
    if (country && e.country !== country) return false;
    if (month   && e.month   !== month)   return false;
    if (disc    && !e.disciplines.includes(disc)) return false;
    if (type    && e.typeRaw !== type.toLowerCase()) return false;
    return true;
  });

  if (!filtered.length) {
    grid.innerHTML = growMessage(
      growPosts.length === 0
        ? 'No opportunities posted yet. Check back soon.'
        : 'No events match your filters. Try adjusting your search.'
    );
    return;
  }

  grid.innerHTML = filtered.map((e, i) => `
    <div class="grow-card reveal reveal-d${Math.min(i + 1, 4)}">
      <div class="grow-card-head">
        <span class="grow-type">${escapeHtml(e.type)}</span>
        <span class="grow-date">${escapeHtml(e.date)}</span>
      </div>
      <h3>${escapeHtml(e.title)}</h3>
      <p class="grow-location">${escapeHtml(e.location)}</p>
      <p>${escapeHtml(e.desc)}</p>
      <div class="grow-card-foot">
        <span class="grow-tag">${escapeHtml(e.tag)}</span>
        ${e.externalUrl
          ? `<a class="grow-btn" href="${escapeAttr(e.externalUrl)}" target="_blank" rel="noopener noreferrer">More Info</a>`
          : `<button class="grow-btn" onclick="openModal('signup');return false;">More Info</button>`}
      </div>
    </div>
  `).join('');
  setTimeout(observeAll, 50);
}

function growMessage(text, kind = 'info') {
  const color = kind === 'error' ? 'var(--coral)' : 'var(--text-light)';
  return `<p style="grid-column:1/-1;text-align:center;color:${color};font-size:15px;padding:40px 0;">${escapeHtml(text)}</p>`;
}


// ═══════════════════════════════════════════════
//  PRICING PAGE — live plans from the API
// ═══════════════════════════════════════════════
//
// Replaces the three hardcoded plan cards on pricing.html. Hits
// GET /api/plans (publicly accessible via routes/api.php) and renders
// the response into the existing .plans-grid container. The page's
// .plan-card / .plan-features / .plan-cta CSS classes do all the
// styling — we just produce the same DOM shape.
//
// Targeting .plans-grid via querySelector means no edit to pricing.html
// is needed.

async function initPricing() {
  const grid = document.querySelector('.plans-grid');
  if (!grid) return;

  grid.innerHTML = pricingMessage('Loading plans…');

  let plans = [];
  try {
    const res = await fetch(`${API_BASE}/plans`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json || json.success === false) {
      throw new Error(json?.message || 'Request failed');
    }
    plans = Array.isArray(json?.data?.plans) ? json.data.plans : [];
  } catch (err) {
    console.error('Failed to load plans:', err);
    grid.innerHTML = pricingMessage(
      "Couldn't load pricing right now. Please refresh the page or try again later.",
      'error'
    );
    return;
  }

  if (!plans.length) {
    grid.innerHTML = pricingMessage('No plans are currently available.');
    return;
  }

  // Sort: featured first, then by sortOrder, then by price.
  plans.sort((a, b) => {
    if (!!b.isFeatured - !!a.isFeatured) return !!b.isFeatured - !!a.isFeatured;
    const so = (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
    if (so) return so;
    return (Number(a.price) || 0) - (Number(b.price) || 0);
  });

  grid.innerHTML = plans.map((plan, i) => renderPlanCard(plan, i)).join('');
  setTimeout(observeAll, 50);
}

document.addEventListener('DOMContentLoaded', initPricing);


function renderPlanCard(plan, idx) {
  const isFeatured = !!plan.isFeatured;
  const currencySym = currencySymbol(plan.currency || 'USD');
  const priceWhole = formatPriceWhole(plan.price);
  const periodLabel = formatPlanPeriod(plan);
  const desc = plan.description || '';
  const features = Array.isArray(plan.features) ? plan.features : [];

  const checkSvg = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>`;

  const featuresHtml = features.length
    ? `
      <ul class="plan-features">
        ${features.map(f => `
          <li class="plan-feature">
            <div class="feature-check">${checkSvg}</div>
            ${escapeHtml(f)}
          </li>
        `).join('')}
      </ul>
    `
    : `<ul class="plan-features"><li class="plan-feature" style="color:var(--text-light);font-style:italic;">Full access to the network</li></ul>`;

  const ctaClass = isFeatured ? 'plan-cta plan-cta-filled' : 'plan-cta plan-cta-outline';

  return `
    <div class="plan-card${isFeatured ? ' popular' : ''} reveal reveal-d${Math.min(idx + 1, 4)}">
      ${isFeatured ? '<div class="plan-popular-badge">Most Popular</div>' : ''}
      <div class="plan-name">${escapeHtml(plan.name || plan.id || 'Plan')}</div>
      <div class="plan-price">
        <span class="plan-currency"${isFeatured ? ' style="color:var(--coral);"' : ''}>${escapeHtml(currencySym)}</span>
        <span class="plan-amount${isFeatured ? ' popular-price' : ''}">${escapeHtml(priceWhole)}</span>
        <span class="plan-per">${escapeHtml(periodLabel)}</span>
      </div>
      ${desc ? `<div class="plan-desc">${escapeHtml(desc)}</div>` : ''}
      <div class="plan-divider"></div>
      ${featuresHtml}
      <button class="${ctaClass}" onclick="openModal('signup')">Get Started</button>
    </div>
  `;
}


/** "/ month" for monthly, "total" for prepaid lump sums (3-month, 6-month, yearly). */
function formatPlanPeriod(plan) {
  const interval = (plan.interval || 'month').toLowerCase();
  const count    = Number(plan.intervalCount) || 1;
  if (interval === 'month' && count === 1) return '/ month';
  if (interval === 'year'  && count === 1) return 'total';
  if (interval === 'month' && count >  1) return 'total';
  // Fallback to whatever the backend says
  return plan.period || '/ ' + interval;
}

function formatPriceWhole(p) {
  const n = Number(p);
  if (!Number.isFinite(n)) return '0';
  // Whole dollars if no fractional part, else 2 decimals
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

const CURRENCY_SYMBOLS = {
  USD: '$', AUD: '$', CAD: '$', NZD: '$', SGD: '$', HKD: '$',
  EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AED: 'د.إ',
};
function currencySymbol(code) {
  return CURRENCY_SYMBOLS[String(code || '').toUpperCase()] || '$';
}

function pricingMessage(text, kind = 'info') {
  const color = kind === 'error' ? 'var(--coral)' : 'var(--text-light)';
  return `<p style="grid-column:1/-1;text-align:center;color:${color};font-size:15px;padding:40px 0;">${escapeHtml(text)}</p>`;
}