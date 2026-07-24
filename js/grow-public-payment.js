(function () {
  'use strict';

  // const apiBase = 'http://localhost:8000/api'
  const apiBase = 'https://movingguru.co/moving-guru-backend/public/api'
  const form = document.getElementById('growListingForm');
  const tierContainer = document.getElementById('growTierOptions');
  const disciplineSelect = document.getElementById('growFormDisc');
  const filterDisciplineSelect = document.getElementById('growDisc');
  const fileInput = document.getElementById('growFileInput');
  const fileList = document.getElementById('growFileList');
  const imagePreview = document.getElementById('growImagePreview');

  // Keep this list aligned with src/data/disciplines.js in the authenticated app.
  const PUBLIC_DISCIPLINES = [
    'Yoga', 'Pilates', 'Barre', 'Dance', 'Fitness', 'Personal Training',
    'Strength & Conditioning', 'Mobility', 'Stretching', 'Breathwork',
    'Meditation', 'Mindfulness', 'Tai Chi', 'Qigong', 'Martial Arts',
    'Boxing', 'Massage Therapy', 'Physiotherapy', 'Osteopathy',
    'Chiropractic', 'Nutrition', 'Ayurveda', 'Reiki', 'Sound Healing',
    'Energy Healing', 'Life Coaching', 'Wellness Coaching', 'Mental Health',
    'Retreat Facilitation', 'Teacher Training',
  ];

  let payment = null;
  let stripe = null;
  let card = null;
  let modal = null;
  let submitting = false;
  let appliedPromo = null;       // { code, discountAmount, finalAmount, currency, ... }
  let selectedTierInfo = null;   // { id, name, price, currency } for the modal session
  let intentInputs = null;       // { contactName, contactEmail, pricingTierId } for intent (re)creation
  const tiersById = {};          // id -> tier record

  if (!form) return;

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, {
      headers: { Accept: 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const firstErrors = Object.values(body.errors || {}).flat();
      throw new Error(firstErrors[0] || body.message || 'Something went wrong.');
    }
    return body;
  };

  const money = (tier) => new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: String(tier.currency || 'AUD').toUpperCase(),
  }).format(Number(tier.price));

  const loadTiers = async () => {
    if (!tierContainer) return;
    try {
      const body = await request('/grow-post-tiers');
      const tiers = Array.isArray(body.data) ? body.data : [];
      tiers.forEach((tier) => { tiersById[String(tier.id)] = tier; });
      tierContainer.innerHTML = tiers.map((tier, index) => `
        <label class="grow-form-duration">
          <input type="radio" name="pricing_tier_id" value="${tier.id}" ${index === 0 ? 'required checked' : ''} />
          <div class="grow-form-duration-card">
            <span class="grow-form-duration-label">${escapeHtml(tier.name)}</span>
            <span class="grow-form-duration-price">${escapeHtml(money(tier))}</span>
            <small>${Number(tier.duration_days)} days live after approval</small>
          </div>
        </label>
      `).join('');
    } catch (error) {
      tierContainer.innerHTML = `<p class="grow-form-note">${escapeHtml(error.message)}</p>`;
    }
  };

  const loadDisciplines = () => {
    if (!disciplineSelect && !filterDisciplineSelect) return;
    const options = PUBLIC_DISCIPLINES.map((discipline) => (
      `<option value="${escapeHtml(discipline)}">${escapeHtml(discipline)}</option>`
    ));
    if (disciplineSelect) {
      disciplineSelect.innerHTML = [
        '<option value="" disabled selected>Select discipline</option>',
        ...options,
      ].join('');
      disciplineSelect.disabled = false;
    }
    if (filterDisciplineSelect) {
      filterDisciplineSelect.innerHTML = [
        '<option value="">All Disciplines</option>',
        ...options,
      ].join('');
    }
  };

  const validateSpots = (data) => {
    const spots = data.get('spots');
    const left = data.get('spots_left');
    if (left !== '' && spots === '') throw new Error('Enter total spots before entering spots left.');
    if (spots !== '' && Number(spots) < 1) throw new Error('Total spots must be at least 1.');
    if (left !== '' && Number(left) > Number(spots)) {
      throw new Error('Spots left cannot be greater than total spots.');
    }
  };

  const validateDates = (data) => {
    const from = data.get('date_from');
    const to = data.get('date_to');
    if (from && to && from > to) {
      throw new Error('Start date must be on or before the end date.');
    }
  };

  const ensureModal = () => {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(20,20,18,.62);display:none;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = `
      <div style="width:min(480px,100%);background:#fff;border-radius:22px;padding:24px;font-family:'DM Sans',sans-serif;box-shadow:0 24px 70px rgba(0,0,0,.25)">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:start">
          <div><h2 style="margin:0;font-family:'Unbounded',sans-serif;font-size:20px">Secure payment</h2>
          <p style="margin:8px 0 0;color:#6b6b66;font-size:13px">Payment is charged now. Your listing is published after admin approval.</p></div>
          <button type="button" data-close style="border:0;background:transparent;font-size:24px;cursor:pointer">&times;</button>
        </div>
        <div data-summary style="margin:18px 0;padding:14px;border-radius:14px;background:#f7f5f0;font-weight:700"></div>
        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:8px">Promo code</label>
        <div style="display:flex;gap:8px;margin-bottom:6px">
          <input data-promo-input type="text" placeholder="Have a promo code?" autocomplete="off"
            style="flex:1;min-width:0;border:1px solid #dcd6cc;border-radius:12px;padding:12px;text-transform:uppercase;font-size:13px" />
          <button type="button" data-promo-apply
            style="border:0;border-radius:12px;background:#1a1a18;color:#fff;padding:0 16px;font-weight:700;font-size:13px;cursor:pointer">Apply</button>
        </div>
        <p data-promo-msg style="display:none;font-size:12px;margin:0 0 14px"></p>
        <div style="height:8px"></div>
        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:8px">Card details</label>
        <div data-card style="border:1px solid #dcd6cc;border-radius:12px;padding:14px;background:#fff"></div>
        <p data-error style="display:none;color:#b42318;font-size:12px;margin:10px 0 0"></p>
        <button type="button" data-pay style="width:100%;margin-top:18px;border:0;border-radius:12px;background:#b4ff5a;padding:14px;font-weight:800;cursor:pointer">Pay and submit listing</button>
        <p style="font-size:10px;text-align:center;color:#77736c;margin:10px 0 0">Securely processed by Stripe. Card details never touch our server.</p>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-close]').addEventListener('click', () => {
      if (submitting) return;
      if (payment?.confirmed) {
        window.alert('Your payment succeeded but the post has not been submitted yet. Please retry the submission first.');
        return;
      }
      modal.style.display = 'none';
    });
    modal.querySelector('[data-pay]').addEventListener('click', payAndSubmit);
    const promoInput = modal.querySelector('[data-promo-input]');
    modal.querySelector('[data-promo-apply]').addEventListener('click', applyPromo);
    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyPromo(); }
    });
    return modal;
  };

  const fmtMoney = (amount, currency) => new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: String(currency || selectedTierInfo?.currency || 'AUD').toUpperCase(),
  }).format(Number(amount || 0));

  // Render the price summary block, reflecting any applied promo discount.
  const renderSummary = () => {
    if (!modal || !selectedTierInfo) return;
    const box = modal.querySelector('[data-summary]');
    const name = escapeHtml(selectedTierInfo.name || 'selected duration');
    if (appliedPromo) {
      box.innerHTML =
        `<div>Listing: ${name}</div>` +
        `<div style="display:flex;justify-content:space-between;font-weight:500;margin-top:8px;color:#6b6b66">` +
          `<span>Subtotal</span><span>${escapeHtml(fmtMoney(selectedTierInfo.price))}</span></div>` +
        `<div style="display:flex;justify-content:space-between;font-weight:500;color:#3f7d17">` +
          `<span>Discount (${escapeHtml(appliedPromo.code)})</span><span>-${escapeHtml(fmtMoney(appliedPromo.discountAmount))}</span></div>` +
        `<div style="display:flex;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:1px solid #e5e0d8">` +
          `<span>Total due</span><span>${escapeHtml(fmtMoney(appliedPromo.finalAmount))}</span></div>`;
    } else {
      box.textContent = `Listing: ${selectedTierInfo.name || 'selected duration'} — ${fmtMoney(selectedTierInfo.price)}`;
    }
  };

  const showPromoMsg = (message, ok) => {
    if (!modal) return;
    const el = modal.querySelector('[data-promo-msg]');
    el.textContent = message || '';
    el.style.color = ok ? '#3f7d17' : '#b42318';
    el.style.display = message ? 'block' : 'none';
  };

  // Validate the entered code against the selected tier and update the summary.
  const applyPromo = async () => {
    if (submitting || !selectedTierInfo) return;
    const input = modal.querySelector('[data-promo-input]');
    const code = (input.value || '').trim().toUpperCase();
    if (!code) { appliedPromo = null; renderSummary(); showPromoMsg('', false); return; }
    const applyBtn = modal.querySelector('[data-promo-apply]');
    applyBtn.disabled = true;
    try {
      const body = await request('/grow-promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, pricingTierId: Number(selectedTierInfo.id) }),
      });
      appliedPromo = { ...body.data, code };
      renderSummary();
      showPromoMsg(`Code applied — you save ${fmtMoney(appliedPromo.discountAmount)}.`, true);
    } catch (error) {
      appliedPromo = null;
      renderSummary();
      showPromoMsg(error.message || 'Invalid promo code.', false);
    } finally {
      applyBtn.disabled = false;
    }
  };

  const resetPromoUI = () => {
    appliedPromo = null;
    if (!modal) return;
    const input = modal.querySelector('[data-promo-input]');
    if (input) input.value = '';
    showPromoMsg('', false);
  };

  const showError = (message) => {
    const target = ensureModal().querySelector('[data-error]');
    target.textContent = message;
    target.style.display = message ? 'block' : 'none';
  };

  const setBusy = (busy) => {
    submitting = busy;
    const button = ensureModal().querySelector('[data-pay]');
    button.disabled = busy;
    button.style.opacity = busy ? '.6' : '1';
    button.textContent = busy
      ? 'Processing…'
      : payment?.confirmed ? 'Retry post submission' : 'Pay and submit listing';
  };

  const buildPostData = () => {
    const source = new FormData(form);
    const payload = new FormData();

    // Every scalar field the /public/grow-posts API accepts — kept in sync
    // with the authenticated portal's Grow form.
    [
      'contact_name', 'contact_email', 'contact_phone', 'organization_name',
      'type', 'title', 'subtitle', 'description', 'location', 'price',
      'date_from', 'date_to', 'external_url', 'spots', 'spots_left',
    ].forEach((key) => {
      const value = source.get(key);
      if (value !== null && value !== '') payload.append(key, value);
    });

    // Disciplines — single select on the public form, sent as an array.
    const discipline = source.get('discipline');
    if (discipline) payload.append('disciplines[0]', discipline);

    // Tags — comma-separated input → tags[] array (same as the portal).
    const tagsRaw = source.get('tags') || '';
    String(tagsRaw)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((tag, i) => payload.append(`tags[${i}]`, tag));

    // Cover image — the actual File, so it is uploaded and stored server-side.
    const coverFile = fileInput?.files?.[0]
      || (source.get('cover_image') instanceof File ? source.get('cover_image') : null);
    if (coverFile) payload.append('cover_image', coverFile);

    payload.append('payment_intent_id', payment.paymentIntentId);
    payload.append('submission_token', payment.submissionToken);
    return payload;
  };

  const payAndSubmit = async () => {
    if (submitting || !payment || !stripe || !card) return;
    setBusy(true);
    showError('');
    try {
      if (!payment.confirmed) {
        // Make sure the intent reflects the currently-applied promo (or lack of
        // one). Re-create it only when the desired code differs from the code
        // baked into the existing intent. The previous un-confirmed intent is
        // never captured, so no charge is duplicated.
        const desiredCode = appliedPromo?.code || null;
        if (desiredCode !== payment.promoCode) {
          const body = await request('/public/grow-payments/intents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...intentInputs,
              ...(desiredCode ? { promoCode: desiredCode } : {}),
            }),
          });
          payment = { ...body.data, confirmed: false, promoCode: desiredCode };
        }

        const result = await stripe.confirmCardPayment(payment.clientSecret, {
          payment_method: { card },
        });
        if (result.error) throw new Error(result.error.message || 'Payment failed.');
        if (result.paymentIntent?.status !== 'succeeded') {
          throw new Error('Stripe has not completed the payment. Please try again.');
        }
        await request('/public/grow-payments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: payment.paymentIntentId,
            submissionToken: payment.submissionToken,
          }),
        });
        payment.confirmed = true;
      }

      await request('/public/grow-posts', { method: 'POST', body: buildPostData() });
      modal.style.display = 'none';
      form.reset();
      if (imagePreview) {
        imagePreview.removeAttribute('src');
        imagePreview.style.display = 'none';
      }
      if (fileList) fileList.textContent = '';
      payment = null;
      if (typeof window.closeGrowForm === 'function') window.closeGrowForm();
      window.alert('Payment received. Your Grow listing is now pending admin approval.');
    } catch (error) {
      showError(error.message);
    } finally {
      setBusy(false);
    }
  };

  window.submitPaidGrowForm = async function (event) {
    event.preventDefault();
    if (submitting) return;
    const data = new FormData(form);
    const submitButton = form.querySelector('[type="submit"]');
    try {
      validateSpots(data);
      validateDates(data);
      const selectedTier = form.querySelector('[name="pricing_tier_id"]:checked');
      if (!selectedTier) throw new Error('Choose a listing duration.');
      submitButton.disabled = true;
      submitButton.textContent = 'Preparing secure payment…';

      // Remember the inputs so the intent can be re-created with a promo at pay time.
      intentInputs = {
        contactName: data.get('contact_name'),
        contactEmail: data.get('contact_email'),
        pricingTierId: Number(selectedTier.value),
      };
      const tierRecord = tiersById[String(selectedTier.value)] || {};
      selectedTierInfo = {
        id: selectedTier.value,
        name: tierRecord.name || selectedTier.closest('label')?.innerText?.trim() || 'selected duration',
        price: Number(tierRecord.price ?? 0),
        currency: tierRecord.currency || 'AUD',
      };

      // Initial (full-price) intent — needed to obtain the publishable key and
      // mount the card. If a promo is applied, the intent is re-created with the
      // discounted amount at pay time (the un-confirmed full-price intent is
      // never charged).
      const body = await request('/public/grow-payments/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intentInputs),
      });
      payment = { ...body.data, confirmed: false, promoCode: null };
      if (!payment.publishableKey) throw new Error('Stripe publishable key is not configured.');
      stripe = window.Stripe(payment.publishableKey);
      card?.unmount();
      card = stripe.elements().create('card', { hidePostalCode: true });
      const paymentModal = ensureModal();
      showError('');
      resetPromoUI();
      renderSummary();
      paymentModal.style.display = 'flex';
      card.mount(paymentModal.querySelector('[data-card]'));
    } catch (error) {
      window.alert(error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit & Proceed to Payment';
    }
  };

  window.previewGrowCoverImage = function (event) {
    const input = event?.target || fileInput;
    const file = input?.files?.[0];
    if (!fileList) return;
    if (!file) {
      fileList.textContent = '';
      if (imagePreview) {
        imagePreview.removeAttribute('src');
        imagePreview.style.display = 'none';
      }
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      input.value = '';
      fileList.textContent = 'Please select a JPG, PNG, GIF or WEBP image.';
      if (imagePreview) imagePreview.style.display = 'none';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      input.value = '';
      fileList.textContent = 'Image must be 5 MB or smaller.';
      if (imagePreview) imagePreview.style.display = 'none';
      return;
    }
    fileList.textContent = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      if (!imagePreview) return;
      imagePreview.src = String(reader.result || '');
      imagePreview.style.setProperty('display', 'block', 'important');
      imagePreview.style.setProperty('visibility', 'visible', 'important');
      imagePreview.style.setProperty('opacity', '1', 'important');
    };
    reader.onerror = () => {
      input.value = '';
      fileList.textContent = 'Could not preview this image. Please choose another file.';
      if (imagePreview) imagePreview.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  loadTiers();
  loadDisciplines();
}());