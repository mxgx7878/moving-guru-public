/* ═══════════════════════════════════════════════
   GROW LISTING FORM — grow-listing.js
   (open/close + drag-and-drop only)

   NOTE: File selection, preview and the real form submission are handled by
   grow-public-payment.js. This file must NOT touch fileInput.value — doing so
   clears the selected file and the cover image never reaches the API.
   ═══════════════════════════════════════════════ */

// ─── OPEN / CLOSE ───
function openGrowForm() {
  document.getElementById('growFormOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeGrowForm() {
  document.getElementById('growFormOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

function closeGrowFormOutside(e) {
  if (e.target === e.currentTarget) closeGrowForm();
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeGrowForm();
});

// ─── DRAG & DROP ───
// Feeds the dropped image into the real <input type="file"> and fires its
// change event, so grow-public-payment.js's previewGrowCoverImage() runs and
// the file stays attached for submission (single source of truth).
(function () {
  var uploadArea = document.getElementById('growUploadArea');
  var fileInput = document.getElementById('growFileInput');
  if (!uploadArea || !fileInput) return;

  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', function () {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    var image = Array.from(e.dataTransfer.files || []).find(function (f) {
      return f.type && f.type.startsWith('image/');
    });
    if (!image) return;
    try {
      var dt = new DataTransfer();
      dt.items.add(image);
      fileInput.files = dt.files;                 // assign to the real input
    } catch (_) { /* older browsers — ignore */ }
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  });
})();