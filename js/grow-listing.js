/* ═══════════════════════════════════════════════
   GROW LISTING FORM — grow-listing.js
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

// ─── FILE UPLOAD PREVIEW ───
(function () {
  const fileInput = document.getElementById('growFileInput');
  const fileList = document.getElementById('growFileList');
  if (!fileInput || !fileList) return;

  let selectedFiles = [];

  fileInput.addEventListener('change', function () {
    const newFiles = Array.from(this.files);
    selectedFiles = selectedFiles.concat(newFiles);
    renderFileList();
    // Reset input so same file can be re-selected
    fileInput.value = '';
  });

  function renderFileList() {
    if (!selectedFiles.length) {
      fileList.innerHTML = '';
      return;
    }
    fileList.innerHTML = selectedFiles.map(function (file, i) {
      return '<div class="grow-form-file-item">' +
        '<span class="grow-form-file-name">' + file.name + '</span>' +
        '<span class="grow-form-file-size">' + formatSize(file.size) + '</span>' +
        '<button type="button" class="grow-form-file-remove" onclick="removeGrowFile(' + i + ')">&times;</button>' +
        '</div>';
    }).join('');
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // Expose remove function
  window.removeGrowFile = function (index) {
    selectedFiles.splice(index, 1);
    renderFileList();
  };

  // Drag and drop
  var uploadArea = document.getElementById('growUploadArea');
  if (uploadArea) {
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
      var droppedFiles = Array.from(e.dataTransfer.files).filter(function (f) {
        return f.type.startsWith('image/');
      });
      selectedFiles = selectedFiles.concat(droppedFiles);
      renderFileList();
    });
  }
})();

// ─── FORM SUBMIT ───
function submitGrowForm(e) {
  e.preventDefault();
  var form = document.getElementById('growListingForm');
  var submitBtn = form.querySelector('.grow-form-submit');

  // Simple validation feedback
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  // Simulate submission (replace with real endpoint later)
  setTimeout(function () {
    submitBtn.textContent = 'Submitted!';
    submitBtn.style.background = '#8B9A00';

    setTimeout(function () {
      closeGrowForm();
      // Reset
      form.reset();
      var fileList = document.getElementById('growFileList');
      if (fileList) fileList.innerHTML = '';
      submitBtn.textContent = 'Submit & Proceed to Payment';
      submitBtn.disabled = false;
      submitBtn.style.background = '';
    }, 1800);
  }, 1200);
}
