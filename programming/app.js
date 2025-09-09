// Minimal, dependency-free quiz app using programming/data/json
(function(){
  const API = {
    surveys: './data/json/surveys.json',
    resolveQuestionsPath(p) {
      // surveys.json entries are like "data/json/python/..." relative to programming/
      if (p.startsWith('./')) return p.slice(2);
      return p; // already relative to programming/
    }
  };

  const state = {
    surveys: [],
    filtered: [],
    categories: [],
    currentSurvey: null,
    questions: [],
    index: 0,
    answers: {},
    score: null
  };

  const ui = {
    main: () => document.querySelector('#main'),
    search: () => document.querySelector('#search'),
    category: () => document.querySelector('#category'),
    clear: () => document.querySelector('#clear'),
  };

  async function fetchJSON(url) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r.json();
  }

  function h(tag, attrs={}, children=[]) {
    const el = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'onclick') el.addEventListener('click', v);
      else el.setAttribute(k, v);
    }
    for (const c of ([]).concat(children)) {
      if (c == null) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  function escapeHtml(s){
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Minimal Markdown: fenced code blocks and inline code; preserve newlines
  function mdToHtml(src){
    if (src == null) return '';
    let s = String(src);
    // Normalize CRLF
    s = s.replace(/\r\n?/g, '\n');
    // Convert common double-escaped sequences (\\n, \\t) into real characters
    s = s.replace(/\\n/g, '\n').replace(/\\t/g, '    ');
    // Extract fenced code blocks first and replace with placeholders
    const blocks = [];
    s = s.replace(/```([\w-]+)?\s*\n([\s\S]*?)```/g, (m, lang, code) => {
      const klass = lang ? `language-${lang.toLowerCase()}` : '';
      const html = `<pre><code class="${klass}">${escapeHtml(code)}</code></pre>`;
      blocks.push(html);
      return `@@CODE_BLOCK_${blocks.length - 1}@@`;
    });
    // Inline code outside fenced blocks
    s = s.replace(/`([^`]+)`/g, (m, code) => `<code>${escapeHtml(code)}</code>`);
    // Preserve newlines outside code blocks
    s = s.replace(/\n/g, '<br>');
    // Restore fenced code blocks
    s = s.replace(/@@CODE_BLOCK_(\d+)@@/g, (m, i) => blocks[Number(i)]);
    return s;
  }

  function normalizeQuestion(q) {
    const text = q.title || q.question || 'Question';
    const choices = Array.isArray(q.choices) ? q.choices : (Array.isArray(q.options) ? q.options : []);
    const correct = q.correctAnswer; // index, value, or array
    return { text, choices, correct };
  }

  function countAnswered(){
    return Object.prototype.hasOwnProperty.call(state, 'answers')
      ? Object.keys(state.answers).filter(k => state.answers[k] != null).length
      : 0;
  }

  function updateProgressUI(){
    const total = state.questions.length || 0;
    const answered = countAnswered();
    const pct = total ? Math.round((answered/total)*100) : 0;
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = `Answered ${answered} of ${total} • ${pct}%`;
  }

  function computeCorrect(q, selectedIndex){
    if (selectedIndex == null) return false;
    const correct = q.correct;
    if (typeof correct === 'number') return selectedIndex === correct;
    if (Array.isArray(correct)) return correct.includes(selectedIndex) || correct.includes(q.choices[selectedIndex]);
    return String(q.choices[selectedIndex]) === String(correct);
  }

  function correctIndices(q){
    const out = [];
    if (typeof q.correct === 'number') {
      if (q.correct >= 0 && q.correct < q.choices.length) out.push(q.correct);
    } else if (Array.isArray(q.correct)) {
      // may contain indices or values
      q.correct.forEach(v => {
        if (typeof v === 'number' && v >= 0 && v < q.choices.length) out.push(v);
        else {
          const idx = q.choices.findIndex(c => String(c) === String(v));
          if (idx >= 0) out.push(idx);
        }
      });
    } else if (q.correct != null) {
      const idx = q.choices.findIndex(c => String(c) === String(q.correct));
      if (idx >= 0) out.push(idx);
    }
    // dedupe
    return Array.from(new Set(out));
  }

  function dedupe(arr){ return Array.from(new Set(arr)); }

  function filterSurveys() {
    const s = (ui.search().value || '').toLowerCase();
    const cat = ui.category().value || '';
    state.filtered = state.surveys.filter(x => {
      const matchesText = !s || `${x.title} ${x.description || ''}`.toLowerCase().includes(s);
      const matchesCat = !cat || (x.category || '') === cat;
      return matchesText && matchesCat;
    });
  }

  function renderHome(){
    const main = ui.main();
    filterSurveys();
    main.innerHTML = '';
    main.append(h('div', { class:'title', text:'Quizzes'}));
    main.append(h('div', { class:'subtitle', text: `${state.filtered.length} available`}));
    const grid = h('div', { class:'grid' });
    state.filtered.forEach(s => {
      const card = h('div', { class:'card' }, [
        h('h3', { text: s.title }),
        h('p', { text: s.description || '' }),
        h('div', {}, [
          h('span', { class:'badge', text: s.category || 'Quiz' }), ' ',
          h('span', { class:'badge', text: s.difficulty || '' })
        ]),
        (function(){
          const row = h('div', { class:'row' });
          row.append(h('button', { onclick: () => startQuiz(s), text:'Start Quiz' }));
          if (s.articleFile) {
            row.append(h('button', { class:'ghost', onclick: () => { window.location.href = s.articleFile; }, text:'Read Article' }));
          }
          return row;
        })()
      ]);
      grid.append(card);
    });
    main.append(grid);
  }

  async function startQuiz(survey){
    state.currentSurvey = survey;
    state.index = 0; state.answers = {}; state.score = null;
    const url = API.resolveQuestionsPath(survey.questionsFile);
    const data = await fetchJSON(url);
    const normalized = (Array.isArray(data) ? data : []).map(normalizeQuestion).filter(q => q.choices.length > 0);
    if (!normalized.length) throw new Error('No valid questions');
    state.questions = normalized;
    renderQuiz();
  }

  function renderQuiz(){
    const main = ui.main();
    const s = state.currentSurvey;
    const q = state.questions[state.index];
    const total = state.questions.length;
    main.innerHTML = '';

    const title = h('div', { class:'title' }); title.innerHTML = mdToHtml(s.title);
    main.append(title);
    if (s.description) { const desc = h('div', { class:'subtitle' }); desc.innerHTML = mdToHtml(s.description); main.append(desc); }
    // progress bar based on answered count
    const pbar = h('div', { class:'pbar' }, [
      h('div', { class:'pbar-track' }, [ h('div', { id:'progress-fill', class:'pbar-fill', style:'width:0%' }) ]),
      h('div', { id:'progress-label', class:'pbar-label', text:'' })
    ]);
    main.append(pbar);

    const wrap = h('div', { class:'question' });
    const qTitle = h('div', { class:'title' }); qTitle.innerHTML = mdToHtml(q.text); wrap.append(qTitle);

    const answers = h('div', { class:'answers' });
    q.choices.forEach((choice, i) => {
      const id = `q_${state.index}_${i}`;
      const label = h('label', { class:'answer', for: id });
      const input = h('input', { type:'radio', name:'answer', id, value: String(i) });
      if (state.answers[state.index] === i) input.checked = true;
      label.addEventListener('click', () => { state.answers[state.index] = i; updateProgressUI(); });
      const content = h('span'); content.innerHTML = mdToHtml(String(choice));
      label.append(input, content);
      answers.append(label);
    });
    wrap.append(answers);

    const controls = h('div', { class:'footer' });
    const left = h('div');
    const right = h('div');
    left.append(
      h('button', { class:'ghost', disabled: state.index === 0 ? 'true' : null, onclick: prev, text:'Back' }),
      h('button', { class:'danger', onclick: stop, text:'Stop & View Result' })
    );
    // Quick reference to article scenarios while in-quiz
    if (s && s.articleFile) {
      left.append(
        h('button', { class:'ghost', onclick: () => { window.location.href = s.articleFile + '#scenarios'; }, text:'See Scenarios' })
      );
    }
    if (state.index < total - 1) right.append(h('button', { onclick: next, text:'Next' }));
    else right.append(h('button', { onclick: submit, text:'Submit' }));
    controls.append(left, right);
    wrap.append(controls);
    main.append(wrap);

    // initialize progress values on first render
    updateProgressUI();
    // apply syntax highlighting after DOM updates
    applySyntaxHighlighting();
  }

  function prev(){ if (state.index > 0) { state.index--; renderQuiz(); } }
  function next(){ if (state.index < state.questions.length - 1) { state.index++; renderQuiz(); } }

  function submit(){
    let score = 0;
    state.questions.forEach((q, i) => { if (computeCorrect(q, state.answers[i])) score++; });
    state.score = score;
    renderResult();
  }

  function stop(){
    // compute partial score; unanswered count shown in result
    let score = 0;
    state.questions.forEach((q, i) => { if (computeCorrect(q, state.answers[i])) score++; });
    state.score = score;
    renderResult(true);
  }

  function renderResult(){
    const main = ui.main();
    const total = state.questions.length;
    const answered = countAnswered();
    const summary = h('div', { class:'result' });
    summary.append(
      h('div', { text: `You scored ${state.score} / ${total}.` }),
      h('div', { text: `Answered: ${answered} • Unanswered: ${total - answered}` })
    );
    main.append(summary);
    const actions = h('div', { class:'row' });
    actions.append(
      h('button', { class:'secondary', onclick: () => { state.currentSurvey = null; renderHome(); }, text:'Back to Quizzes' }),
      h('button', { onclick: () => { state.index = 0; state.answers = {}; state.score = null; renderQuiz(); }, text:'Retry Quiz' })
    );
    // Deep link to article scenarios section when available
    const s = state.currentSurvey;
    if (s && s.articleFile) {
      actions.append(
        h('button', { class:'ghost', onclick: () => { window.location.href = s.articleFile + '#scenarios'; }, text:'See Scenarios & Model Answers' })
      );
    }
    main.append(actions);

    // Per-question review
    const review = h('div', { class:'review' });
    review.append(h('div', { class:'title', text:'Review' }));
    state.questions.forEach((q, i) => {
      const block = h('div', { class:'q-review' });
      const heading = h('h4');
      heading.innerHTML = mdToHtml(`Q${i+1}. ${q.text}`);
      block.append(heading);
      const list = h('div', { class:'anslist' });
      const correctIdxs = correctIndices(q);
      const selected = state.answers[i];
      q.choices.forEach((choice, j) => {
        const row = h('div', { class: 'ans' + (correctIdxs.includes(j) ? ' correct' : '') + (selected === j && !correctIdxs.includes(j) ? ' selected' : '') });
        const mark = correctIdxs.includes(j) ? h('span', { class:'pill', text:'Correct' }) : (selected === j ? h('span', { class:'pill', text:'Your choice' }) : null);
        const content = h('div'); content.innerHTML = mdToHtml(String(choice));
        row.append(mark || h('span', { class:'pill', text:' ' }), content);
        list.append(row);
      });
      block.append(list);
      review.append(block);
    });
    main.append(review);
    applySyntaxHighlighting();
  }

  function populateFilters(){
    state.categories = dedupe(state.surveys.map(s => s.category).filter(Boolean)).sort();
    const sel = ui.category();
    state.categories.forEach(c => sel.append(h('option', { value:c, text:c })));
  }

  function attachFilterEvents(){
    ui.search().addEventListener('input', renderHome);
    ui.category().addEventListener('change', renderHome);
    ui.clear().addEventListener('click', () => { ui.search().value=''; ui.category().value=''; renderHome(); });
  }

  function deepLinkId(){
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get('id') || (url.hash.startsWith('#id=') ? url.hash.slice(4) : null);
    } catch { return null; }
  }

  async function init(){
    const data = await fetchJSON(API.surveys);
    state.surveys = (Array.isArray(data) ? data : []).filter(s => typeof s.questionsFile === 'string' && s.questionsFile.includes('data/json/'));
    populateFilters();
    attachFilterEvents();
    const id = deepLinkId();
    if (id) {
      const s = state.surveys.find(x => x.id === id);
      if (s) return startQuiz(s);
    }
    renderHome();
    applySyntaxHighlighting();
  }

  window.addEventListener('DOMContentLoaded', () => { init().catch(err => {
    const main = ui.main();
    main.innerHTML = '';
    main.append(h('div', { class:'error' }, [ h('strong', { text:'Error: ' }), document.createTextNode(err.message || String(err)) ]));
  }); });

  // Lightweight syntax highlighting for Python
  function applySyntaxHighlighting(){
    const blocks = document.querySelectorAll('pre code');
    blocks.forEach(codeEl => {
      const cls = codeEl.className || '';
      if (/(^|\s)language-python(\s|$)/.test(cls)) {
        try {
          const raw = codeEl.textContent || '';
          codeEl.innerHTML = highlightPython(raw);
        } catch (e) { /* ignore */ }
      }
    });
  }

  function highlightPython(src){
    if (!src) return '';
    // Protect strings and comments with placeholders
    const holders = [];
    function keep(html){ holders.push(html); return `@@H${holders.length-1}@@`; }

    // Triple-quoted strings
    src = src.replace(/('{3}[\s\S]*?'{3}|"{3}[\s\S]*?"{3})/g, m => keep(`<span class="tok-str">${escapeHtml(m)}</span>`));
    // Single/double quoted strings
    src = src.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, m => keep(`<span class="tok-str">${escapeHtml(m)}</span>`));
    // Comments
    src = src.replace(/#.*/g, m => keep(`<span class="tok-com">${escapeHtml(m)}</span>`));

    // Escape remaining
    let html = escapeHtml(src);

    // Keywords
    const KW = [
      'def','return','if','elif','else','for','while','in','not','and','or','class','import','from','as','try','except','finally','with','lambda','True','False','None','pass','break','continue','yield','global','nonlocal','assert','raise','del','is'
    ];
    const kwRe = new RegExp(`\\b(${KW.join('|')})\\b`,'g');
    html = html.replace(kwRe, '<span class="tok-kw">$1</span>');

    // Builtins (common subset)
    const BI = ['len','range','print','dict','list','set','tuple','int','str','float','bool','sum','min','max','sorted','enumerate','zip','map','filter'];
    const biRe = new RegExp(`\\b(${BI.join('|')})\\b`,'g');
    html = html.replace(biRe, '<span class="tok-builtin">$1</span>');

    // Numbers
    html = html.replace(/\b0x[0-9a-fA-F_]+\b|\b\d+(?:\.\d+)?\b/g, '<span class="tok-num">$&</span>');

    // Restore placeholders
    html = html.replace(/@@H(\d+)@@/g, (m, i) => holders[Number(i)]);
    return html;
  }
})();
