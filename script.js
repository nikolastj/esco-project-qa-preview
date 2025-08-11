/* Theme handling: auto (system), light, dark with persistence */
(function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const KEY = 'qa_theme';

  // Apply saved theme if present
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  } else {
    root.setAttribute('data-theme', 'auto'); // falls back to prefers-color-scheme
  }

  function current() {
    return root.getAttribute('data-theme');
  }

  function cycleTheme() {
    const cur = current();
    // auto → light → dark → auto
    const next = cur === 'auto' ? 'light' : cur === 'light' ? 'dark' : 'auto';
    root.setAttribute('data-theme', next);
    if (next === 'auto') {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, next);
    }
    btn.querySelector('.toggle-label').textContent = next[0].toUpperCase() + next.slice(1);
  }

  // Initialize label
  btn.querySelector('.toggle-label').textContent = (current()[0].toUpperCase() + current().slice(1));
  btn.addEventListener('click', cycleTheme);
})();

/* Data loading and rendering */
async function loadQA() {
  const listEl = document.getElementById('qaList');
  const tmpl = document.getElementById('qaCardTemplate');

  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();

    if (!Array.isArray(items)) throw new Error('Invalid data.json format. Expected an array.');

    // Clear
    listEl.innerHTML = '';

    // Render
    for (const item of items) {
      const node = tmpl.content.cloneNode(true);
      const nameEl = node.querySelector('.name');
      const qEl = node.querySelector('.question');
      const aEl = node.querySelector('.answer');

      nameEl.textContent = item.name ?? 'Anonymous';
      qEl.textContent = item.question ?? '';
      
      // Convert markdown-style formatting: \n to <br> and **text** to <strong>text</strong>
      const answerText = (item.answer ?? '')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      aEl.innerHTML = answerText;


      listEl.appendChild(node);
    }

    // Fallback if empty
    if (!listEl.children.length) {
      listEl.innerHTML = `<p style="color:var(--muted);text-align:center;">No Q&A yet.</p>`;
    }
  } catch (err) {
    listEl.innerHTML = `<p style="color:var(--muted);text-align:center;">Failed to load Q&A. ${String(err)}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadQA);
