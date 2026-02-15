(function(){
  function init() {
    const slides = Array.from(document.querySelectorAll('.slide'));
    const total = slides.length;
    if (!total) return;
    
    const indicator = document.getElementById('slide-indicator');
    const titleEl = document.getElementById('slide-title');
    const progressBar = document.getElementById('progress-bar');
    const STORAGE_KEY = 'modern-cpp-slide-index';

    let current = 0;

    // Restore state
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) current = parseInt(stored, 10);
        if (isNaN(current) || current < 0) current = 0;
        if (current >= total) current = total - 1;
    } catch(e) {}

    function update() {
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === current);
        });
        
        const slide = slides[current];
        const title = slide.getAttribute('data-title') || 'Slide';
        titleEl.textContent = title;
        indicator.textContent = `${current + 1} / ${total}`;
        
        const pct = ((current + 1) / total) * 100;
        progressBar.style.width = `${pct}%`;
        
        localStorage.setItem(STORAGE_KEY, current);
    }

    function next() {
        if (current < total - 1) {
            current++;
            update();
        }
    }

    function prev() {
        if (current > 0) {
            current--;
            update();
        }
    }

    document.getElementById('next-btn').addEventListener('click', next);
    document.getElementById('prev-btn').addEventListener('click', prev);
    document.getElementById('quiz-btn').addEventListener('click', () => {
        window.location.href = '../index.html?id=modern-low-latency';
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'ArrowRight') {
            if (e.shiftKey) prev(); else next();
        } else if (e.key === 'ArrowLeft') {
            prev();
        } else if (e.key === 'Home') {
            current = 0; update();
        } else if (e.key === 'End') {
            current = total - 1; update();
        }
    });

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
