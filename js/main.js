/* ═══════════════════════════════════════════════
   MOVING GURU — Shared JavaScript
   ═══════════════════════════════════════════════ */

// ─── DATA ───
const DISCIPLINES = [
  { category: "Yoga & Mind-Body", items: ["Hatha Yoga", "Vinyasa Yoga", "Ashtanga Yoga", "Yin Yoga", "Restorative Yoga", "Hot Yoga / Bikram", "Prenatal Yoga", "Chair Yoga", "Acro Yoga", "Yoga Flow / Power Yoga", "Somatic Movement"] },
  { category: "Pilates & Similar", items: ["Mat Pilates", "Reformer Pilates", "Barre", "Clinical / Physical Therapy Pilates", "Hot Matt Pilates", "Lagree"] },
  { category: "Martial Arts", items: ["Brazilian Jiu-Jitsu", "Boxing", "Muay Thai", "Kickboxing", "Taekwondo", "Karate", "Judo", "Wrestling", "Krav Maga", "MMA"] },
  { category: "Cardio & Functional", items: ["Spinning / Indoor Cycling", "HIIT", "Bootcamp", "Dance Cardio (Zumba, Jungle Body)"] },
  { category: "Mind & Wellness", items: ["Breathwork / Pranayama", "Meditation", "Reiki Healer", "Sound Bath / Sound Healing", "Tai Chi", "Qigong"] },
  { category: "Recovery", items: ["Massage", "Bowen Therapy", "Physio Therapy", "Myofascial Release", "Cupping"] },
  { category: "Dance & Expression", items: ["Ballet Fitness", "Contemporary Dance", "Hip-Hop Dance", "Latin Dance (Salsa, Bachata)", "Ballroom Dance", "Pole Fitness", "Dance + Strength Fusion", "Dance Movement Therapy", "Aerial Fitness / Silks"] },
];

const ALL_DISCIPLINES = DISCIPLINES.flatMap(d => d.items.map(item => ({ name: item, category: d.category })));

const PROFILES = [
  { name: "Bambi R.", from: "Sydney, Australia", to: "South America & Italy", discipline: "Reformer Pilates", languages: "English", availability: "Aug\u2013Dec 2026", openTo: "Swap or Direct", initials: "BR" },
  { name: "Mateo C.", from: "Berlin, Germany", to: "Flexible", discipline: "Mat & Reformer Pilates, Vinyasa", languages: "Spanish, German, English", availability: "Open", openTo: "Swap or Direct", initials: "MC" },
  { name: "Hnia.", from: "Melbourne, Australia", to: "India", discipline: "Reformer, Breathwork, PT", languages: "English, German, Arabic", availability: "Feb\u2013Apr 2027", openTo: "Swap or Direct", initials: "H" },
  { name: "Studio Mouvoir", from: "Sydney, Australia", to: "Studio-Based", discipline: "Mat Pilates, Reformer Pilates", languages: "English, Spanish", availability: "December 2026", openTo: "Direct", initials: "SM" },
];

const GROW_EVENTS = [
  { type: "Training", date: "November 2026", month: "November", country: "Thailand", title: "Imagine Studios Thailand \u2014 500h Pilates Teacher Training", location: "Koh Samui, Thailand", desc: "Internationally accredited immersive Pilates training. Blend classical foundations with contemporary movement, anatomy, and intelligent cueing.", tag: "Internationally Accredited", disc: "Pilates" },
  { type: "Retreat", date: "March 2027", month: "March", country: "Indonesia", title: "Bali Soul Flow \u2014 10 Day Yoga Immersion", location: "Ubud, Bali", desc: "Reconnect with your practice in the heart of Bali. Daily yoga, meditation, breathwork, and cultural excursions.", tag: "Limited Spots", disc: "Yoga" },
  { type: "Event", date: "July 2026", month: "July", country: "Germany", title: "Movement Festival Europe \u2014 Berlin Edition", location: "Berlin, Germany", desc: "3 days of workshops, masterclasses, and networking across dance, yoga, martial arts, and beyond.", tag: "Community Event", disc: "Mixed / Multi-Discipline" },
  { type: "Training", date: "September 2026", month: "September", country: "India", title: "Rishikesh Ashtanga Intensive \u2014 200h YTT", location: "Rishikesh, India", desc: "Traditional Ashtanga Yoga teacher training in the yoga capital of the world. Mysore style, pranayama, and philosophy.", tag: "Yoga Alliance Certified", disc: "Yoga" },
  { type: "Retreat", date: "January 2027", month: "January", country: "Costa Rica", title: "Jungle Breathwork & Movement Retreat", location: "Nosara, Costa Rica", desc: "7 days of breathwork, functional movement, and nature immersion in the Costa Rican jungle.", tag: "All Levels Welcome", disc: "Breathwork" },
  { type: "Training", date: "May 2026", month: "May", country: "Australia", title: "Boxing Coaching Certification \u2014 Sydney", location: "Sydney, Australia", desc: "Become a certified boxing coach. Pad work, technique, class programming, and business skills for fitness professionals.", tag: "Nationally Recognised", disc: "Martial Arts" },
];

const COUNTRIES = [
"Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
"Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
"Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czechia",
"Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic",
"Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
"Fiji","Finland","France",
"Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
"Haiti","Honduras","Hungary",
"Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
"Jamaica","Japan","Jordan",
"Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
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


// // ─── AUTH MODAL ───
// let authMode = 'login';

// function openModal(mode) {
//   authMode = mode;
//   const overlay = document.getElementById('authModal');
//   const title = document.getElementById('modalTitle');
//   const desc = document.getElementById('modalDesc');
//   const nameField = document.getElementById('nameField');
//   const submit = document.getElementById('modalSubmit');
//   const toggle = document.getElementById('modalToggle');

//   if (mode === 'login') {
//     title.textContent = 'Log In';
//     desc.textContent = 'Welcome back. Sign in to your Moving Guru account.';
//     nameField.style.display = 'none';
//     submit.textContent = 'Log In';
//     toggle.innerHTML = "Don't have an account? <a onclick=\"toggleAuthMode()\">Sign Up</a>";
//   } else {
//     title.textContent = 'Sign Up';
//     desc.textContent = 'Create your Moving Guru profile and start connecting.';
//     nameField.style.display = 'block';
//     submit.textContent = 'Create Account';
//     toggle.innerHTML = 'Already have an account? <a onclick="toggleAuthMode()">Log In</a>';
//   }
//   overlay.classList.add('show');
// }

// function closeModal() {
//   document.getElementById('authModal').classList.remove('show');
// }

// function closeModalOutside(e) {
//   if (e.target === e.currentTarget) closeModal();
// }

// function toggleAuthMode() {
//   openModal(authMode === 'login' ? 'signup' : 'login');
// }


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
    `<div class="autocomplete-item" onclick="selectDiscipline('${m.name}')">${m.name} <span class="ac-cat">${m.category}</span></div>`
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

  if (cSel) COUNTRIES.sort().forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; cSel.appendChild(o); });
  if (lSel) LANGUAGES.sort().forEach(l => { const o = document.createElement('option'); o.value = l; o.textContent = l; lSel.appendChild(o); });
  if (mSel) MONTHS.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; mSel.appendChild(o); });
}
document.addEventListener('DOMContentLoaded', populateFilters);


// ─── DISCIPLINES TABS (Home page) ───
let activeDisc = 0;

function renderDisc() {
  const tabsEl = document.getElementById('discTabs');
  const itemsEl = document.getElementById('discItems');
  if (!tabsEl || !itemsEl) return;

  tabsEl.innerHTML = DISCIPLINES.map((d, i) =>
    `<button class="disc-tab${i === activeDisc ? ' active' : ''}" onclick="setDisc(${i})">${d.category}</button>`
  ).join('');
  itemsEl.innerHTML = DISCIPLINES[activeDisc].items.map((item, i) =>
    `<div class="disc-item" style="animation-delay:${i * 0.04}s">${item}</div>`
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


// ─── COMMUNITY PAGE ───
function initCommunity() {
  const filterEl = document.getElementById('communityDiscFilter');
  const grid = document.getElementById('communityGrid');
  if (!filterEl || !grid) return;

  filterEl.innerHTML = '<button class="disc-tab active" onclick="filterCommunity(null, this)">All</button>' +
    DISCIPLINES.map(d =>
      `<button class="disc-tab" onclick="filterCommunity('${d.category}', this)">${d.category}</button>`
    ).join('');

  renderProfiles(PROFILES);
}

function filterCommunity(cat, btn) {
  document.querySelectorAll('#communityDiscFilter .disc-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProfiles(PROFILES);
}

function renderProfiles(profiles) {
  const grid = document.getElementById('communityGrid');
  if (!grid) return;

  grid.innerHTML = profiles.map((p, i) => `
    <div class="profile-card reveal reveal-d${Math.min(i + 1, 4)}">
      <div class="profile-stripe"></div>
      <div class="profile-header">
        <div class="profile-avatar">${p.initials}</div>
        <div>
          <h3>${p.name}</h3>
          <p>${p.from}</p>
        </div>
      </div>
      <div class="profile-info">
        <div class="info-row"><span class="info-label">Discipline</span><span class="info-value">${p.discipline}</span></div>
        <div class="info-row"><span class="info-label">Travelling To</span><span class="info-value">${p.to}</span></div>
        <div class="info-row"><span class="info-label">Languages</span><span class="info-value">${p.languages}</span></div>
        <div class="info-row"><span class="info-label">Available</span><span class="info-value">${p.availability}</span></div>
        <div class="info-row"><span class="info-label">Open To</span><span class="info-value">${p.openTo}</span></div>
      </div>
      <button onclick="openModal('signup');return false;" class="profile-btn">View Details</button>
    </div>
  `).join('');
  setTimeout(observeAll, 50);
}

document.addEventListener('DOMContentLoaded', initCommunity);


// ─── GROW PAGE ───
function renderGrowEvents() {
  const countryEl = document.getElementById('growCountry');
  const monthEl = document.getElementById('growMonth');
  const discEl = document.getElementById('growDisc');
  const typeEl = document.getElementById('growType');
  const grid = document.getElementById('growGrid');
  if (!grid) return;

  const country = countryEl ? countryEl.value : '';
  const month = monthEl ? monthEl.value : '';
  const disc = discEl ? discEl.value : '';
  const type = typeEl ? typeEl.value : '';

  let events = GROW_EVENTS.filter(e => {
    if (country && e.country !== country) return false;
    if (month && e.month !== month) return false;
    if (disc && e.disc !== disc) return false;
    if (type && e.type !== type) return false;
    return true;
  });

  if (!events.length) {
    grid.innerHTML = '<p style="color:var(--text-light);font-size:15px;padding:40px 0;">No events match your filters. Try adjusting your search.</p>';
    return;
  }

  grid.innerHTML = events.map((e, i) => `
    <div class="grow-card reveal reveal-d${Math.min(i + 1, 4)}">
      <div class="grow-card-head">
        <span class="grow-type">${e.type}</span>
        <span class="grow-date">${e.date}</span>
      </div>
      <h3>${e.title}</h3>
      <p class="grow-location">${e.location}</p>
      <p>${e.desc}</p>
      <div class="grow-card-foot">
        <span class="grow-tag">${e.tag}</span>
        <button class="grow-btn">More Info</button>
      </div>
    </div>
  `).join('');
  setTimeout(observeAll, 50);
}

function initGrow() {
  ['growCountry', 'growMonth', 'growDisc', 'growType'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderGrowEvents);
  });
  renderGrowEvents();
}

document.addEventListener('DOMContentLoaded', initGrow);
