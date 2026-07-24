(function () {
  'use strict';

  //const apiBase = 'http://localhost:8000/api'
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
    return modal;
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
    [
      'contact_name', 'contact_email', 'contact_phone', 'organization_name', 'type', 'title',
      'description', 'location', 'date_label', 'external_url', 'spots', 'spots_left',
    ].forEach((key) => {
      const value = source.get(key);
      if (value !== null && value !== '') payload.append(key, value);
    });
    const discipline = source.get('discipline');
    if (discipline) payload.append('disciplines[0]', discipline);
    if (fileInput?.files?.[0]) payload.append('cover_image', fileInput.files[0]);
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
      const selectedTier = form.querySelector('[name="pricing_tier_id"]:checked');
      if (!selectedTier) throw new Error('Choose a listing duration.');
      submitButton.disabled = true;
      submitButton.textContent = 'Preparing secure payment…';
      const body = await request('/public/grow-payments/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: data.get('contact_name'),
          contactEmail: data.get('contact_email'),
          pricingTierId: Number(selectedTier.value),
        }),
      });
      payment = { ...body.data, confirmed: false };
      if (!payment.publishableKey) throw new Error('Stripe publishable key is not configured.');
      stripe = window.Stripe(payment.publishableKey);
      card?.unmount();
      card = stripe.elements().create('card', { hidePostalCode: true });
      const paymentModal = ensureModal();
      showError('');
      paymentModal.querySelector('[data-summary]').textContent =
        `Listing: ${selectedTier.closest('label')?.innerText?.trim() || 'selected duration'}`;
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