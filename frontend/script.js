/* ===============================================
   CMRS Transliterator — script.js
=============================================== */

(function () {
  'use strict';

  // ─- references to HTML elements ──
  const inputEl    = document.getElementById('inputText');
  const outputEl   = document.getElementById('outputArea');
  const loaderEl   = document.getElementById('loader');
  const copyBtn    = document.getElementById('copyBtn');
  const clearBtn   = document.getElementById('clearBtn');
  const transBtn   = document.getElementById('translateBtn');
  const counterEl  = document.getElementById('charCounter');
  const toastEl    = document.getElementById('toast');
  const chunkBadge = document.getElementById('chunkBadge');
  const chunkText  = document.getElementById('chunkText');

  // ── icons ──
  const ICON_COPY  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
  const ICON_CHECK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied`;

  // ── chunk splitting function (for counting chunks) ──
  function splitChunks(text) {
    if (!text.trim()) return [];
    return text.trim().split(/(?<=[.!?])\s+|\n+/)
               .map(s => s.trim()).filter(Boolean);
  }

  // ── char counter + chunk preview ──
  inputEl.addEventListener('input', () => {
    const len    = inputEl.value.length;
    const chunks = splitChunks(inputEl.value);

    counterEl.textContent = `${len} / 1000`;
    counterEl.classList.toggle('warn', len > 900);

    if (chunks.length > 1) {
      chunkText.textContent = `${chunks.length} sentences — processed separately`;
      chunkBadge.style.display = 'flex';
    } else {
      chunkBadge.style.display = 'none';
    }
  });

  // ── example chips ──
  document.querySelectorAll('.example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      inputEl.value = chip.dataset.text;
      inputEl.dispatchEvent(new Event('input'));
      inputEl.focus();
    });
  });

  // ── clear ──
  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    inputEl.dispatchEvent(new Event('input'));
    resetOutput();
    inputEl.focus();
  });

  function resetOutput() {
    outputEl.innerHTML = '<span class="output-placeholder">Sinhala transliteration will appear here...</span>';
    copyBtn.innerHTML = ICON_COPY;
    copyBtn.classList.remove('copied');
  }

  // ── copy ──
  let copyTimer = null;
  copyBtn.addEventListener('click', () => {
    const text = outputEl.innerText.trim();
    if (!text || outputEl.querySelector('.output-placeholder')) return;

    navigator.clipboard.writeText(text).then(() => {
      copyBtn.innerHTML = ICON_CHECK;
      copyBtn.classList.add('copied');
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copyBtn.innerHTML = ICON_COPY;
        copyBtn.classList.remove('copied');
      }, 2200);
    }).catch(() => showToast('Could not access clipboard.'));
  });

  // ── toast message ──
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
  }

  // ── transliterate ──
  transBtn.addEventListener('click', runTransliterate);

  inputEl.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runTransliterate();
    }
  });

  // ── transliteration function ──
  async function runTransliterate() {
    // input validation
    const text = inputEl.value.trim();
    if (!text) { showToast('Please enter some text first.'); return; }

    // setting loading state
    loaderEl.classList.add('active');
    transBtn.disabled = true;
    outputEl.innerHTML = '';

    try {
      // API request
      const res = await fetch('/transliterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      // error checking response
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      // processing successful response
      const data = await res.json();
      outputEl.innerHTML = `<span class="output-text">${escapeHtml(data.output)}</span>`;

    } catch (err) {
      resetOutput();
      showToast(err.message || 'Could not connect to the model server.');
    } finally {
      loaderEl.classList.remove('active');
      transBtn.disabled = false;
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();