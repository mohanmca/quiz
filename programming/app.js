// Minimal, dependency-free quiz app using programming/data/json
(function(){
  const API = {
    surveys: './data/json/surveys.json',
    articles: './data/json/articles.json',
    journal: './data/json/logs.json',
    resolveQuestionsPath(p) {
      // surveys.json entries are like "data/json/python/..." relative to programming/
      if (p.startsWith('./')) return p.slice(2);
      return p; // already relative to programming/
    }
  };

  const TABS = [
    { id: 'quizzes', label: 'Quizzes', color: '#1e88e5', background: '#eff6ff' },
    { id: 'articles', label: 'Articles', color: '#10b981', background: '#ecfdf5' },
    { id: 'journal', label: 'Learning Journal', color: '#8b5cf6', background: '#f5f3ff' }
  ];

  const state = {
    surveys: [],
    articles: [],
    filtered: [],
    categories: [],
    currentSurvey: null,
    questions: [],
    sequence: [],
    index: 0,
    answers: {},
    checked: {},
    incorrect: new Set(),
    retrying: false,
    score: null,
    tagFilter: '',
    logs: [],
    activeTab: 'quizzes'
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
    const correct = normalizeCorrect(q.correctAnswer, choices); // index, value, or array
    const shuffled = shuffleArray(choices.slice());
    return { text, choices: shuffled, correct };
  }

  function normalizeCorrect(correct, choices){
    if (typeof correct === 'number') return choices[correct];
    if (Array.isArray(correct)) return correct.map(v => (typeof v === 'number' ? choices[v] : v));
    return correct;
  }

  function shuffleArray(arr){
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function countAnswered(){
    if (!Array.isArray(state.sequence) || !state.sequence.length) return 0;
    return state.sequence.filter(idx => state.answers[idx] != null).length;
  }

  function updateProgressUI(){
    const total = Array.isArray(state.sequence) ? state.sequence.length : 0;
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
    const tag = state.tagFilter || '';
    state.filtered = state.surveys.filter(x => {
      const matchesText = !s || `${x.title} ${x.description || ''}`.toLowerCase().includes(s);
      const matchesCat = !cat || (x.category || '') === cat;
      const tags = Array.isArray(x.tags) ? x.tags : [];
      const matchesTag = !tag || tags.includes(tag);
      return matchesText && matchesCat && matchesTag;
    });
  }

  function renderHome(){
    const main = ui.main();
    filterSurveys();
    main.innerHTML = '';
    const wrap = h('div', { class:'tab-wrap' });
    wrap.append(renderTabBar(), renderActiveTabPanel());
    main.append(wrap);
    applySyntaxHighlighting();
  }

  function getTabMeta(id){
    return TABS.find(t => t.id === id) || TABS[0];
  }

  function renderTabBar(){
    const bar = h('div', { class:'tab-bar' });
    TABS.forEach(tab => {
      const classes = 'tab-btn' + (state.activeTab === tab.id ? ' active' : '');
      const btn = h('button', { class: classes, text: tab.label });
      btn.style.setProperty('--tab-color', tab.color);
      if (tab.background) btn.style.setProperty('--tab-bg', tab.background);
      btn.addEventListener('click', () => {
        if (state.activeTab === tab.id) return;
        state.activeTab = tab.id;
        renderHome();
      });
      bar.append(btn);
    });
    return bar;
  }

  function renderActiveTabPanel(){
    const meta = getTabMeta(state.activeTab);
    if (state.activeTab === 'articles') return renderArticlesPanel(meta);
    if (state.activeTab === 'journal') return renderLogsPanel(meta);
    return renderQuizzesPanel(meta);
  }

  function renderQuizzesPanel(meta){
    const panel = h('div', { class:'tab-panel tab-quizzes' });
    panel.style.setProperty('--tab-color', meta.color);
    if (meta.background) panel.style.setProperty('--tab-bg', meta.background);
    panel.append(h('div', { class:'title', text:'Quizzes' }));
    panel.append(h('div', { class:'subtitle', text: `${state.filtered.length} available` }));
    if (!state.filtered.length) {
      panel.append(h('div', { class:'subtitle', text:'No quizzes match the current filters yet.' }));
      return panel;
    }
    const grid = h('div', { class:'grid' });
    state.filtered.forEach(s => {
      const card = h('div', { class:'card' }, [
        h('h3', { text: s.title }),
        h('p', { text: s.description || '' }),
        h('div', {}, [
          h('span', { class:'badge', text: s.category || 'Quiz' }), ' ',
          h('span', { class:'badge', text: s.difficulty || '' })
        ]),
        renderTagsRow(s.tags || []),
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
    panel.append(grid);
    return panel;
  }

  function renderTagsRow(tags){
    const row = h('div', { class:'row' });
    const shown = (tags || []).slice(0, 8);
    shown.forEach(t => {
      const cls = 'ghost' + (state.tagFilter === t ? ' active' : '');
      const btn = h('button', { class: cls, text: `#${t}` });
      btn.addEventListener('click', () => {
        state.tagFilter = state.tagFilter === t ? '' : t;
        renderHome();
      });
      row.append(btn);
    });
    return row;
  }

  function computeItemTags(item){
    if (Array.isArray(item.tags) && item.tags.length) return item.tags;
    const extra = [];
    if (item.category) extra.push(String(item.category).toLowerCase());
    if (item.id) extra.push(...String(item.id).toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean));
    const words = String(item.title || '').toLowerCase().match(/[a-z0-9]+/g) || [];
    const stop = new Set(['the','and','for','with','into','from','your','you','are','about','part','overview','fundamentals','guide','notes','design','api','deep','dive','internals','concepts','principles','mastery','quiz','questions']);
    const toks = words.filter(w => w.length >= 3 && !stop.has(w));
    const tags = [];
    const seen = new Set();
    function add(t){ if (t && !seen.has(t)) { seen.add(t); tags.push(t); } }
    toks.forEach(add); extra.forEach(add);
    ['quiz','practice','mcq','revision','study','reference','cheatsheet','guide'].forEach(add);
    return tags.slice(0, 12);
  }

  function renderArticlesPanel(meta){
    const panel = h('div', { class:'tab-panel tab-articles' });
    panel.style.setProperty('--tab-color', meta.color);
    if (meta.background) panel.style.setProperty('--tab-bg', meta.background);
    panel.append(h('div', { class:'title', text:'Articles' }));
    panel.append(h('div', { class:'subtitle', text: `${state.articles.length} long-form explanations linked with quizzes` }));

    if (!(state.articles || []).length) {
      panel.append(h('div', { class:'subtitle', text: 'No articles found in the registry yet.' }));
      return panel;
    }

    const tableWrap = h('div', { class:'table-wrap' });
    const table = h('table', { class:'article-table' });
    const thead = h('thead');
    const thr = h('tr');
    ['Title','Tags','Open','Path'].forEach(label => thr.append(h('th', { text: label })));
    thead.append(thr);
    table.append(thead);

    const tbody = h('tbody');
    (state.articles || []).forEach(article => {
      const tr = h('tr');
      const titleCell = h('td'); titleCell.textContent = article.title || article.path;

      const tagsCell = h('td');
      const tagRow = renderTagsRow(article.tags || []);
      if (tagRow.childNodes.length) {
        tagRow.classList.add('tag-pills');
        tagsCell.append(tagRow);
      } else {
        tagsCell.textContent = '—';
      }

      const openCell = h('td');
      openCell.append(h('button', { class:'ghost', onclick: () => { window.location.href = article.path; }, text:'Open' }));

      const pathCell = h('td'); pathCell.textContent = article.path;

      tr.append(titleCell, tagsCell, openCell, pathCell);
      tbody.append(tr);
    });
    table.append(tbody);
    tableWrap.append(table);
    panel.append(tableWrap);
    return panel;
  }

  function normalizeLog(entry){
    const obj = entry && typeof entry === 'object' ? { ...entry } : {};
    obj.date = obj.date || '';
    obj.title = obj.title || obj.id || 'Journal entry';
    obj.content = obj.content || '';
    const providedTags = Array.isArray(obj.tags) ? obj.tags.filter(Boolean) : [];
    const derived = [];
    if (obj.category) derived.push(String(obj.category).toLowerCase());
    if (obj.mood) derived.push(`mood:${String(obj.mood).toLowerCase()}`);
    if (obj.date) derived.push(obj.date);
    const words = String(obj.title).toLowerCase().match(/[a-z0-9]+/g) || [];
    const stop = new Set(['the','and','for','with','about','practice','practiced','strings','lists']);
    words.forEach(w => {
      if (w.length >= 3 && !stop.has(w)) derived.push(w);
    });
    obj.tags = dedupe([...providedTags, ...derived]);
    return obj;
  }

  function renderLogsPanel(meta){
    const panel = h('div', { class:'tab-panel tab-journal' });
    panel.style.setProperty('--tab-color', meta.color);
    if (meta.background) panel.style.setProperty('--tab-bg', meta.background);
    const activeTag = state.tagFilter;
    const logs = (state.logs || []).filter(entry => {
      if (!activeTag) return true;
      const tags = Array.isArray(entry.tags) ? entry.tags : [];
      return tags.includes(activeTag);
    }).slice().sort((a, b) => {
      const da = Date.parse(a.date || '') || 0;
      const db = Date.parse(b.date || '') || 0;
      return db - da;
    });

    panel.append(h('div', { class:'title', text:'Learning Journal' }));
    const subtitleText = activeTag
      ? `Focused on #${activeTag} • ${logs.length} entries`
      : `${logs.length} captured lessons`;
    panel.append(h('div', { class:'subtitle', text: subtitleText }));

    if (!logs.length) {
      const msg = activeTag
        ? `No journal entries found for #${activeTag}.`
        : 'No journal entries yet. Come back after your next lesson learned.';
      panel.append(h('div', { class:'subtitle', text: msg }));
      return panel;
    }

    const logList = h('div', { class:'log-panel' });
    logs.forEach(entry => logList.append(renderLogEntry(entry)));
    panel.append(logList);
    return panel;
  }

  function renderLogEntry(entry){
    const details = h('details', { class:'log-entry' });
    const summary = h('summary', { class:'log-summary' });
    const title = h('span', { class:'log-title', text: entry.title });
    const date = entry.date ? h('span', { class:'log-date', text: formatLogDate(entry.date) }) : null;
    summary.append(title);
    if (date) summary.append(document.createTextNode(' • '), date);
    if (entry.mood) {
      const mood = h('span', { class:'log-mood', text: `mood: ${entry.mood}` });
      summary.append(document.createTextNode(' • '), mood);
    }
    const body = h('div', { class:'log-body' });
    body.innerHTML = mdToHtml(entry.content);
    const tags = renderTagsRow(entry.tags || []);
    if (tags.childNodes.length) {
      tags.classList.add('log-tags');
      body.prepend(tags);
    }
    details.append(summary, body);
    details.addEventListener('toggle', () => {
      if (details.open) applySyntaxHighlighting();
    });
    return details;
  }

  function formatLogDate(value){
    try {
      const date = new Date(value);
      if (!Number.isFinite(date.getTime())) return value;
      return date.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
    } catch { return value; }
  }

  async function startQuiz(survey){
    state.currentSurvey = survey;
    state.index = 0;
    state.answers = {};
    state.checked = {};
    state.incorrect = new Set();
    state.retrying = false;
    state.score = null;
    const url = API.resolveQuestionsPath(survey.questionsFile);
    const data = await fetchJSON(url);
    const normalized = (Array.isArray(data) ? data : []).map(normalizeQuestion).filter(q => q.choices.length > 0);
    if (!normalized.length) throw new Error('No valid questions');
    state.questions = normalized;
    state.sequence = normalized.map((_, i) => i);
    renderQuiz();
  }

  function renderQuiz(){
    const main = ui.main();
    const s = state.currentSurvey;
    const total = state.sequence.length;
    const qIndex = state.sequence[state.index];
    const q = state.questions[qIndex];
    const selected = state.answers[qIndex];
    const checked = Boolean(state.checked[qIndex]);
    const isCorrect = checked ? computeCorrect(q, selected) : null;
    main.innerHTML = '';

    const title = h('div', { class:'title' }); title.innerHTML = mdToHtml(s.title);
    main.append(title);
    if (s.description) { const desc = h('div', { class:'subtitle' }); desc.innerHTML = mdToHtml(s.description); main.append(desc); }
    if (state.retrying) {
      main.append(h('div', { class:'subtitle', text:'Retrying incorrect questions' }));
    }
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
      if (selected === i) input.checked = true;
      label.addEventListener('click', () => {
        const wasChecked = state.checked[qIndex];
        state.answers[qIndex] = i;
        if (wasChecked) state.checked[qIndex] = false;
        updateProgressUI();
        if (wasChecked) renderQuiz();
      });
      const content = h('span'); content.innerHTML = mdToHtml(String(choice));
      label.append(input, content);
      answers.append(label);
    });
    wrap.append(answers);

    const feedback = h('div', { class:'feedback' });
    if (checked) {
      feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
      feedback.textContent = isCorrect ? 'Correct. Moving on...' : 'Incorrect. Review the explanation and try again.';
    } else {
      feedback.textContent = 'Select an answer, then click Check.';
    }
    wrap.append(feedback);

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
    const canCheck = selected != null;
    right.append(h('button', { class:'secondary', disabled: canCheck ? null : 'true', onclick: checkAnswer, text:'Check' }));
    if (state.index < total - 1) right.append(h('button', { disabled: checked ? null : 'true', onclick: next, text:'Next' }));
    else right.append(h('button', { disabled: checked ? null : 'true', onclick: submit, text:'Submit' }));
    controls.append(left, right);
    wrap.append(controls);
    main.append(wrap);

    // initialize progress values on first render
    updateProgressUI();
    // apply syntax highlighting after DOM updates
    applySyntaxHighlighting();
  }

  function prev(){ if (state.index > 0) { state.index--; renderQuiz(); } }
  function next(){ if (state.index < state.sequence.length - 1) { state.index++; renderQuiz(); } }

  function checkAnswer(){
    const qIndex = state.sequence[state.index];
    const selected = state.answers[qIndex];
    if (selected == null) return;
    const q = state.questions[qIndex];
    const correct = computeCorrect(q, selected);
    state.checked[qIndex] = true;
    if (correct) state.incorrect.delete(qIndex);
    else state.incorrect.add(qIndex);
    renderQuiz();
    if (correct) {
      const isLast = state.index >= state.sequence.length - 1;
      setTimeout(() => {
        if (isLast) submit();
        else { state.index++; renderQuiz(); }
      }, 500);
    }
  }

  function evaluateSequence(){
    let score = 0;
    const incorrect = [];
    state.sequence.forEach(qIndex => {
      const q = state.questions[qIndex];
      if (computeCorrect(q, state.answers[qIndex])) score++;
      else incorrect.push(qIndex);
    });
    return { score, incorrect };
  }

  function submit(){
    const { score, incorrect } = evaluateSequence();
    state.score = score;
    state.incorrect = new Set(incorrect);
    renderResult();
  }

  function stop(){
    // compute partial score; unanswered count shown in result
    const { score, incorrect } = evaluateSequence();
    state.score = score;
    state.incorrect = new Set(incorrect);
    renderResult(true);
  }

  function renderResult(){
    const main = ui.main();
    const total = state.sequence.length;
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
      h('button', { onclick: () => {
        state.index = 0;
        state.answers = {};
        state.checked = {};
        state.sequence = state.questions.map((_, i) => i);
        state.retrying = false;
        state.score = null;
        renderQuiz();
      }, text:'Retry Quiz' })
    );
    const incorrectList = Array.from(state.incorrect || []);
    if (incorrectList.length) {
      actions.append(
        h('button', { class:'ghost', onclick: () => {
          state.sequence = incorrectList;
          state.index = 0;
          state.answers = {};
          state.checked = {};
          state.retrying = true;
          state.score = null;
          renderQuiz();
        }, text:`Retry Incorrect (${incorrectList.length})` })
      );
    }
    // Deep link to article scenarios section when available
    const s = state.currentSurvey;
    if (s && s.articleFile) {
      actions.append(
        h('button', { class:'ghost', onclick: () => { window.location.href = s.articleFile + '#scenarios'; }, text:'See Scenarios & Model Answers' })
      );
    }
    // Offer Anki download when available
    if (s && s.ankiFile) {
      actions.append(
        h('button', { class:'ghost', onclick: () => { window.location.href = s.ankiFile; }, text:'Download Anki CSV' })
      );
    }
    main.append(actions);

    // Per-question review
    const review = h('div', { class:'review' });
    review.append(h('div', { class:'title', text:'Review' }));
    state.sequence.forEach((qIndex, pos) => {
      const q = state.questions[qIndex];
      const block = h('div', { class:'q-review' });
      const heading = h('h4');
      heading.innerHTML = mdToHtml(`Q${pos+1}. ${q.text}`);
      block.append(heading);
      const list = h('div', { class:'anslist' });
      const correctIdxs = correctIndices(q);
      const selected = state.answers[qIndex];
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
    ui.clear().addEventListener('click', () => {
      ui.search().value = '';
      ui.category().value = '';
      state.tagFilter = '';
      renderHome();
    });
  }

  function deepLinkId(){
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get('id') || (url.hash.startsWith('#id=') ? url.hash.slice(4) : null);
    } catch { return null; }
  }

  async function init(){
    const [survData, artData, logData] = await Promise.all([
      fetchJSON(API.surveys).catch(() => []),
      fetchJSON(API.articles).catch(() => []),
      fetchJSON(API.journal).catch(() => [])
    ]);
    state.surveys = (Array.isArray(survData) ? survData : []).filter(s => typeof s.questionsFile === 'string' && s.questionsFile.includes('data/json/')).map(s => ({...s, tags: computeItemTags(s)}));
    state.articles = (Array.isArray(artData) ? artData : []).filter(a => a && typeof a.path === 'string');
    state.logs = (Array.isArray(logData) ? logData : []).map(normalizeLog);
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
