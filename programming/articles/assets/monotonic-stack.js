(function(){
  function init() {
    const slides = Array.from(document.querySelectorAll('.slide'));
    const total = slides.length;
    if (!total) return;
    const indicator = document.getElementById('slide-indicator');
    const titleEl = document.getElementById('slide-title');
    const progressBar = document.getElementById('progress-bar');
    const progressLabel = document.getElementById('progress-label');
    const STORAGE_KEY = 'monotonic-stack-slide-index';
    const COOKIE_KEY = 'monotonic_stack_slide';
    const DEFAULT_LEETCODE = 'https://leetcode.com/discuss/study-guide/2347639/a-comprehensive-guide-and-template-for-monotonic-stack-based-problems';
    const DEFAULT_LABEL = 'Monotonic Stack Guide';

    function ensureLeetCodeRefs() {
      slides.forEach(slide => {
        if (slide.querySelector('a[href*="leetcode.com"]')) return;
        const url = slide.dataset.leetcode || DEFAULT_LEETCODE;
        const title = slide.getAttribute('data-title') || '';
        const label = slide.dataset.leetcodeTitle || (slide.dataset.leetcode ? (title ? title + ' on LeetCode' : 'LeetCode') : DEFAULT_LABEL);
        const wrap = document.createElement('div');
        wrap.className = 'leetcode-ref';
        wrap.append('LeetCode: ');
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = label;
        wrap.appendChild(link);
        slide.appendChild(wrap);
      });
    }

    function setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/; SameSite=Lax';
    }

    function readCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    }

    function clamp(value) {
      if (value < 0) return 0;
      if (value >= total) return total - 1;
      return value;
    }

    function readStoredIndex() {
      let idx = 0;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) idx = parseInt(stored, 10);
      } catch (err) {
        idx = 0;
      }
      if (Number.isNaN(idx)) {
        const cookie = parseInt(readCookie(COOKIE_KEY), 10);
        idx = Number.isNaN(cookie) ? 0 : cookie;
      }
      return clamp(idx);
    }

    function saveIndex(idx) {
      try {
        localStorage.setItem(STORAGE_KEY, String(idx));
      } catch (err) {
        // ignore
      }
      setCookie(COOKIE_KEY, String(idx), 365);
    }

    function updateSlide(idx) {
      slides.forEach(s => s.classList.remove('active'));
      const slide = slides[idx];
      slide.classList.add('active');
      const title = slide.getAttribute('data-title') || 'Slide';
      titleEl.textContent = title;
      indicator.textContent = (idx + 1) + ' / ' + total;
      const pct = Math.round(((idx + 1) / total) * 100);
      progressBar.style.width = pct + '%';
      progressLabel.textContent = 'Progress: ' + (idx + 1) + ' / ' + total + ' (' + pct + '%)';
      saveIndex(idx);
    }

    ensureLeetCodeRefs();

    let current = readStoredIndex();
    updateSlide(current);

    function next() {
      current = clamp(current + 1);
      updateSlide(current);
    }

    function prev() {
      current = clamp(current - 1);
      updateSlide(current);
    }

    document.getElementById('next-btn').addEventListener('click', next);
    document.getElementById('prev-btn').addEventListener('click', prev);
    document.getElementById('quiz-btn').addEventListener('click', () => {
      window.location.href = '../index.html?id=monotonic-stack-patterns';
    });

    document.addEventListener('keydown', (event) => {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space') {
        event.preventDefault();
        if (event.shiftKey) prev();
        else next();
        return;
      }
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        next();
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        prev();
      }
      if (event.key === 'Home') {
        event.preventDefault();
        current = 0;
        updateSlide(current);
      }
      if (event.key === 'End') {
        event.preventDefault();
        current = total - 1;
        updateSlide(current);
      }
    });

    let startX = null;
    document.addEventListener('touchstart', (event) => {
      if (!event.changedTouches || event.changedTouches.length === 0) return;
      startX = event.changedTouches[0].clientX;
    }, { passive: true });
    document.addEventListener('touchend', (event) => {
      if (startX === null || !event.changedTouches || event.changedTouches.length === 0) return;
      const dx = event.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) next();
        else prev();
      }
      startX = null;
    }, { passive: true });

    // Tabs and Quiz Logic
    function setupTabs() {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const targetTab = e.target.dataset.tab; // e.g., 'code' or 'quiz'
          const slide = e.target.closest('.slide');
          
          // Deactivate all in this slide
          slide.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          slide.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          
          // Activate clicked
          e.target.classList.add('active');
          slide.querySelector(`.tab-content[data-content="${targetTab}"]`).classList.add('active');
        });
      });

      document.querySelectorAll('.cloze').forEach(el => {
        el.addEventListener('click', () => {
          el.classList.add('reveal');
        });
      });
    }
    setupTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
