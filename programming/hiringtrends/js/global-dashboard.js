'use strict';

(function () {
  const FILTER_ALL = '__all__';
  const DEFAULT_KIND = 'Technology';
  const EXCLUDED_TERMS = new Set(['CAN']);
  const MIN_MOVER_COUNT = 5;
  const DEFAULT_SIZE = 10;
  const DEFAULT_WINDOW_START = 1;
  const MOVER_LIMIT = 10;

  const state = {
    startIndex: 0,
    endIndex: 0,
    size: DEFAULT_SIZE,
    windowStart: DEFAULT_WINDOW_START,
    kind: DEFAULT_KIND,
    family: FILTER_ALL,
    tag: FILTER_ALL,
    focusedTerm: ''
  };

  let months = [];
  let archiveHrefByMonth = new Map();
  let monthIndexByKey = new Map();
  let termCatalog = [];
  let termByNormalizedName = new Map();
  let trendsChart;
  let postingsChart;

  function init() {
    if (!window.globalData || !Array.isArray(window.globalData.months) || window.globalData.months.length === 0) {
      setText('dashboard-status', 'No generated global data is available yet.');
      return;
    }

    months = window.globalData.months.map(enrichMonth);
    archiveHrefByMonth = new Map((window.globalData.archives || []).map((archive) => [archive.month_key, archive.href]));
    monthIndexByKey = new Map(months.map((month, index) => [month.month_key, index]));
    termCatalog = buildTermCatalog(months);
    termByNormalizedName = new Map(termCatalog.map((term) => [normalizeTermName(term.term), term]));

    hydrateStateFromQuery();
    wireControls();
    render();
  }

  function enrichMonth(month) {
    const termMap = new Map((month.terms || []).map((term) => [term.term, term]));
    return Object.assign({}, month, { termMap: termMap });
  }

  function buildTermCatalog(months) {
    const catalog = new Map();
    months.forEach(function (month) {
      month.terms.forEach(function (term) {
        if (isExcludedTerm(term.term)) {
          return;
        }
        catalog.set(term.term, {
          term: term.term,
          kind: term.kind || 'Other',
          primary_family: term.primary_family || 'Other',
          tags: Array.isArray(term.tags) ? term.tags : []
        });
      });
    });
    return Array.from(catalog.values()).sort(function (left, right) {
      return left.term.localeCompare(right.term);
    });
  }

  function hydrateStateFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const minIndex = 0;
    const maxIndex = months.length - 1;

    state.startIndex = clampMonthIndex(resolveMonthIndex(params.get('start'), window.globalData.bounds.min_month), minIndex, maxIndex);
    state.endIndex = clampMonthIndex(resolveMonthIndex(params.get('end'), window.globalData.bounds.max_month), minIndex, maxIndex);
    if (state.startIndex > state.endIndex) {
      state.endIndex = state.startIndex;
    }

    const size = parseInt(params.get('size'), 10);
    if ([5, 10, 20, 50].includes(size)) {
      state.size = size;
    }

    const requestedWindowStart = parseInt(params.get('window_start'), 10);
    state.windowStart = Number.isFinite(requestedWindowStart) && requestedWindowStart > 0 ? requestedWindowStart : DEFAULT_WINDOW_START;

    state.kind = decodeFilterParam(params.get('kind'), DEFAULT_KIND);
    state.family = decodeFilterParam(params.get('family'), FILTER_ALL);
    state.tag = decodeFilterParam(params.get('tag'), FILTER_ALL);
    state.focusedTerm = resolveTermName(params.get('term')) || '';
  }

  function decodeFilterParam(value, fallback) {
    if (!value) {
      return fallback;
    }
    return value === 'all' ? FILTER_ALL : value;
  }

  function resolveMonthIndex(monthKey, fallbackMonthKey) {
    if (!monthKey || !monthIndexByKey.has(monthKey)) {
      return monthIndexByKey.get(fallbackMonthKey) || 0;
    }
    return monthIndexByKey.get(monthKey);
  }

  function clampMonthIndex(value, min, max) {
    if (!Number.isFinite(value)) {
      return min;
    }
    return Math.max(min, Math.min(max, value));
  }

  function wireControls() {
    const maxIndex = months.length - 1;
    const startInput = document.getElementById('range-start');
    const endInput = document.getElementById('range-end');
    startInput.max = String(maxIndex);
    endInput.max = String(maxIndex);

    startInput.addEventListener('input', function (event) {
      const nextValue = parseInt(event.target.value, 10);
      state.startIndex = clampMonthIndex(nextValue, 0, state.endIndex);
      if (state.startIndex > state.endIndex) {
        state.endIndex = state.startIndex;
      }
      render();
    });

    endInput.addEventListener('input', function (event) {
      const nextValue = parseInt(event.target.value, 10);
      state.endIndex = clampMonthIndex(nextValue, state.startIndex, maxIndex);
      if (state.endIndex < state.startIndex) {
        state.startIndex = state.endIndex;
      }
      render();
    });

    document.getElementById('top-size-controls').addEventListener('click', function (event) {
      const button = event.target.closest('[data-size]');
      if (!button) {
        return;
      }

      state.size = parseInt(button.getAttribute('data-size'), 10);
      state.windowStart = DEFAULT_WINDOW_START;
      render();
    });

    document.getElementById('window-start').addEventListener('change', function (event) {
      const nextValue = parseInt(event.target.value, 10);
      if (Number.isFinite(nextValue) && nextValue > 0) {
        state.windowStart = nextValue;
        render();
      }
    });

    document.getElementById('kind-filter').addEventListener('change', function (event) {
      state.kind = event.target.value;
      state.family = FILTER_ALL;
      state.tag = FILTER_ALL;
      state.windowStart = DEFAULT_WINDOW_START;
      render();
    });

    document.getElementById('family-filter').addEventListener('change', function (event) {
      state.family = event.target.value;
      state.tag = FILTER_ALL;
      state.windowStart = DEFAULT_WINDOW_START;
      render();
    });

    document.getElementById('tag-filter').addEventListener('change', function (event) {
      state.tag = event.target.value;
      state.windowStart = DEFAULT_WINDOW_START;
      render();
    });

    document.getElementById('term-search-form').addEventListener('submit', function (event) {
      event.preventDefault();
      const input = document.getElementById('term-search');
      const term = resolveTermName(input.value);
      state.focusedTerm = term || '';
      input.value = state.focusedTerm;
      render();
    });

    document.getElementById('term-search').addEventListener('change', function (event) {
      const term = resolveTermName(event.target.value);
      if (term) {
        state.focusedTerm = term;
        event.target.value = term;
        render();
      }
    });

    document.getElementById('clear-term-search').addEventListener('click', function () {
      state.focusedTerm = '';
      document.getElementById('term-search').value = '';
      render();
    });
  }

  function render() {
    const selectedMonths = months.slice(state.startIndex, state.endIndex + 1);
    const startMonth = selectedMonths[0];
    const endMonth = selectedMonths[selectedMonths.length - 1];

    populateFilterControls();
    syncControls(startMonth, endMonth);

    const filteredEndTerms = endMonth.terms.filter(isVisibleTerm);
    const availableWindowStarts = buildWindowStarts(filteredEndTerms.length, state.size);
    if (!availableWindowStarts.includes(state.windowStart)) {
      state.windowStart = availableWindowStarts[0];
    }
    populateWindowStartSelect(availableWindowStarts, state.size);

    const visibleTerms = filteredEndTerms.slice(state.windowStart - 1, state.windowStart - 1 + state.size);
    const movers = buildMovers(startMonth, endMonth);

    renderTrendChart(selectedMonths, visibleTerms);
    renderTermDetail(selectedMonths);
    renderPostingsChart(selectedMonths);
    renderCurrentWindowTable(visibleTerms, startMonth, endMonth, filteredEndTerms.length);
    renderMoverTable('rising', movers.risers, endMonth);
    renderMoverTable('falling', movers.fallers, endMonth);
    syncSummaryText(startMonth, endMonth, visibleTerms.length, selectedMonths.length, filteredEndTerms.length);
    syncQueryParams(startMonth, endMonth);
  }

  function populateFilterControls() {
    const availableKinds = sortedUnique(termCatalog.map((term) => term.kind || 'Other'));
    if (state.kind !== FILTER_ALL && !availableKinds.includes(state.kind)) {
      state.kind = FILTER_ALL;
    }

    const familyCandidates = termCatalog.filter(function (term) {
      return state.kind === FILTER_ALL || term.kind === state.kind;
    });
    const availableFamilies = sortedUnique(familyCandidates.map((term) => term.primary_family || 'Other'));
    if (state.family !== FILTER_ALL && !availableFamilies.includes(state.family)) {
      state.family = FILTER_ALL;
    }

    const tagCandidates = familyCandidates.filter(function (term) {
      return state.family === FILTER_ALL || term.primary_family === state.family;
    });
    const availableTags = sortedUnique(tagCandidates.flatMap(function (term) {
      return Array.isArray(term.tags) ? term.tags : [];
    }));
    if (state.tag !== FILTER_ALL && !availableTags.includes(state.tag)) {
      state.tag = FILTER_ALL;
    }

    populateSelect('kind-filter', availableKinds, state.kind, 'All categories');
    populateSelect('family-filter', availableFamilies, state.family, 'All families');
    populateSelect('tag-filter', availableTags, state.tag, 'All tags');
    populateTermSuggestions(termCatalog);
  }

  function populateSelect(id, values, selectedValue, allLabel) {
    const select = document.getElementById(id);
    select.innerHTML = '';
    select.appendChild(buildOption(FILTER_ALL, allLabel, selectedValue === FILTER_ALL));
    values.forEach(function (value) {
      select.appendChild(buildOption(value, value, value === selectedValue));
    });
  }

  function buildOption(value, label, selected) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.selected = selected;
    return option;
  }

  function populateTermSuggestions(terms) {
    const datalist = document.getElementById('term-suggestions');
    datalist.innerHTML = terms.map(function (term) {
      return '<option value="' + escapeAttribute(term.term) + '"></option>';
    }).join('');
  }

  function syncControls(startMonth, endMonth) {
    const startInput = document.getElementById('range-start');
    const endInput = document.getElementById('range-end');

    startInput.value = String(state.startIndex);
    endInput.value = String(state.endIndex);

    setText('selected-start', startMonth.label);
    setText('selected-end', endMonth.label);
    setText('selected-range-summary', startMonth.label + ' to ' + endMonth.label);
    setText('selected-month-count', String(state.endIndex - state.startIndex + 1));
    setText('dashboard-range', startMonth.label + ' to ' + endMonth.label);
    setText('dashboard-start', startMonth.label);
    setText('dashboard-end', endMonth.label);
    setText('dashboard-filter', buildFilterSummary());
    setText('dashboard-focused-term', state.focusedTerm || 'None');
    setText('dashboard-status', 'Using ' + startMonth.label + ' to ' + endMonth.label + ' with ' + buildFilterSummary().toLowerCase() + '.');

    const termSearch = document.getElementById('term-search');
    if (termSearch && document.activeElement !== termSearch) {
      termSearch.value = state.focusedTerm;
    }

    Array.from(document.querySelectorAll('#top-size-controls [data-size]')).forEach(function (button) {
      const selected = parseInt(button.getAttribute('data-size'), 10) === state.size;
      button.classList.toggle('active', selected);
      if (selected) {
        button.setAttribute('aria-pressed', 'true');
      } else {
        button.removeAttribute('aria-pressed');
      }
    });

    updateRangeFill();
  }

  function buildWindowStarts(totalTerms, size) {
    if (totalTerms === 0) {
      return [1];
    }
    const maxStart = Math.max(1, totalTerms - size + 1);
    const values = [];
    for (let start = 1; start <= maxStart; start += size) {
      values.push(start);
    }
    if (values[values.length - 1] !== maxStart) {
      values.push(maxStart);
    }
    return values;
  }

  function populateWindowStartSelect(starts, size) {
    const select = document.getElementById('window-start');
    select.innerHTML = '';
    starts.forEach(function (start) {
      const option = document.createElement('option');
      option.value = String(start);
      option.textContent = 'Filtered ranks ' + start + '-' + (start + size - 1);
      if (start === state.windowStart) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  function buildMovers(startMonth, endMonth) {
    const entries = endMonth.terms
      .filter(isVisibleTerm)
      .filter(function (term) { return term.count >= MIN_MOVER_COUNT; })
      .map(function (term) {
        const startTerm = startMonth.termMap.get(term.term);
        const entry = {
          term: term.term,
          primaryFamily: term.primary_family || 'Other',
          endRank: filteredRank(term.term, endMonth),
          startRank: startTerm && isVisibleTerm(startTerm) ? filteredRank(term.term, startMonth) : null,
          count: term.count,
          percentage: term.percentage,
          href: archiveHrefByMonth.get(endMonth.month_key) || '',
          isNew: !startTerm || !isVisibleTerm(startTerm)
        };
        if (!entry.isNew) {
          entry.delta = entry.startRank - entry.endRank;
        } else {
          entry.delta = null;
        }
        return entry;
      });

    const risers = entries
      .filter(function (entry) { return entry.isNew || entry.delta > 0; })
      .sort(function (left, right) {
        if (left.isNew !== right.isNew) {
          return left.isNew ? -1 : 1;
        }
        if (!left.isNew && !right.isNew && left.delta !== right.delta) {
          return right.delta - left.delta;
        }
        return left.endRank - right.endRank;
      })
      .slice(0, MOVER_LIMIT);

    const fallers = entries
      .filter(function (entry) { return !entry.isNew && entry.delta < 0; })
      .sort(function (left, right) {
        if (left.delta !== right.delta) {
          return left.delta - right.delta;
        }
        return left.endRank - right.endRank;
      })
      .slice(0, MOVER_LIMIT);

    return { risers: risers, fallers: fallers };
  }

  function filteredRank(termName, month) {
    const index = month.terms.filter(isVisibleTerm).findIndex(function (term) {
      return term.term === termName;
    });
    return index >= 0 ? index + 1 : null;
  }

  function renderTrendChart(selectedMonths, visibleTerms) {
    const categories = selectedMonths.map(function (month) { return month.label; });
    const seriesTerms = state.focusedTerm ? [{ term: state.focusedTerm }] : visibleTerms;
    const series = seriesTerms.map(function (term) {
      return {
        name: term.term,
        data: selectedMonths.map(function (month) {
          const monthTerm = month.termMap.get(term.term);
          return monthTerm && monthTerm.count > 0 ? termPercentage(monthTerm, month) : 0;
        })
      };
    });

    if (trendsChart) {
      trendsChart.destroy();
    }

    trendsChart = Highcharts.chart('global-trends-chart', {
      chart: { type: 'line' },
      title: { text: null },
      credits: { enabled: false },
      accessibility: { enabled: false },
      xAxis: {
        categories: categories,
        labels: {
          rotation: -35,
          step: Math.max(1, Math.ceil(categories.length / 8))
        }
      },
      yAxis: {
        title: { text: 'Percent of postings' },
        min: 0
      },
      legend: {
        enabled: true
      },
      tooltip: {
        shared: true,
        valueDecimals: 4,
        valueSuffix: '%'
      },
      series: series
    });
  }

  function renderTermDetail(selectedMonths) {
    const panel = document.getElementById('term-detail-panel');
    const body = document.getElementById('term-detail-table-body');
    const empty = document.getElementById('term-detail-empty');
    const stats = document.getElementById('term-detail-stats');

    if (!state.focusedTerm) {
      panel.classList.add('d-none');
      body.innerHTML = '';
      stats.innerHTML = '';
      return;
    }

    panel.classList.remove('d-none');
    setText('term-detail-title', state.focusedTerm + ' progression');
    setText('term-detail-caption', 'Monthly percentage, count, and rank from ' + selectedMonths[0].label + ' to ' + selectedMonths[selectedMonths.length - 1].label + '.');

    const rows = selectedMonths.map(function (month) {
      const term = month.termMap.get(state.focusedTerm);
      return {
        month: month,
        term: term && term.count > 0 ? term : null
      };
    });
    const mentions = rows.filter(function (row) { return row.term; });

    if (mentions.length === 0) {
      empty.classList.remove('d-none');
      body.innerHTML = '';
      stats.innerHTML = buildTermStats([]);
      return;
    }

    empty.classList.add('d-none');
    stats.innerHTML = buildTermStats(mentions);
    body.innerHTML = rows.map(function (row) {
      const term = row.term;
      return [
        '<tr>',
        '<td>', buildMonthLink(row.month.label, row.month.month_key, state.focusedTerm), '</td>',
        '<td>', term ? String(term.rank) : '-', '</td>',
        '<td>', term ? String(term.count) : '0', '</td>',
        '<td>', term ? formatPercentage(termPercentage(term, row.month)) : '0.0000%', '</td>',
        '<td>', term ? escapeHTML(term.primary_family || 'Other') : '-', '</td>',
        '<td>', term ? escapeHTML(formatTags(term.tags)) : '-', '</td>',
        '</tr>'
      ].join('');
    }).join('');
  }

  function buildTermStats(mentions) {
    if (mentions.length === 0) {
      return [
        buildStatCard('Mentions', '0 months'),
        buildStatCard('Peak', '-'),
        buildStatCard('Best rank', '-'),
        buildStatCard('Latest', '-')
      ].join('');
    }

    const peak = mentions.reduce(function (best, row) {
      return termPercentage(row.term, row.month) > termPercentage(best.term, best.month) ? row : best;
    }, mentions[0]);
    const bestRank = mentions.reduce(function (best, row) {
      return row.term.rank < best.term.rank ? row : best;
    }, mentions[0]);
    const latest = mentions[mentions.length - 1];

    return [
      buildStatCard('Mentions', mentions.length + ' months'),
      buildStatCard('Peak', formatPercentage(termPercentage(peak.term, peak.month)) + ' in ' + peak.month.label),
      buildStatCard('Best rank', '#' + bestRank.term.rank + ' in ' + bestRank.month.label),
      buildStatCard('Latest', formatPercentage(termPercentage(latest.term, latest.month)) + ', rank #' + latest.term.rank)
    ].join('');
  }

  function buildStatCard(label, value) {
    return [
      '<div class="term-detail-stat">',
      '<div class="small text-uppercase text-muted">', escapeHTML(label), '</div>',
      '<div class="fw-semibold">', escapeHTML(value), '</div>',
      '</div>'
    ].join('');
  }

  function renderPostingsChart(selectedMonths) {
    const categories = selectedMonths.map(function (month) { return month.label; });

    if (postingsChart) {
      postingsChart.destroy();
    }

    postingsChart = Highcharts.chart('global-postings-chart', {
      chart: { type: 'area' },
      title: { text: null },
      credits: { enabled: false },
      accessibility: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories: categories,
        labels: {
          rotation: -35,
          step: Math.max(1, Math.ceil(categories.length / 8))
        }
      },
      yAxis: {
        title: { text: 'Top-level postings' },
        min: 0
      },
      tooltip: {
        valueSuffix: ' postings'
      },
      series: [{
        name: 'Top-level postings',
        data: selectedMonths.map(function (month) { return month.num_comments; }),
        color: '#ff742b',
        fillOpacity: 0.2
      }]
    });
  }

  function renderCurrentWindowTable(visibleTerms, startMonth, endMonth, filteredTermCount) {
    const body = document.getElementById('current-window-table-body');
    const empty = document.getElementById('current-window-empty');
    setText('current-window-caption', 'Filtered ranks ' + state.windowStart + '-' + (state.windowStart + state.size - 1) + ' in ' + endMonth.label + ' across ' + filteredTermCount + ' matching terms.');

    if (visibleTerms.length === 0) {
      body.innerHTML = '';
      empty.classList.remove('d-none');
      return;
    }

    empty.classList.add('d-none');
    body.innerHTML = visibleTerms.map(function (term, index) {
      const startTerm = startMonth.termMap.get(term.term);
      const endFilteredRank = state.windowStart + index;
      const startFilteredRank = startTerm && isVisibleTerm(startTerm) ? filteredRank(term.term, startMonth) : null;
      const deltaText = formatDelta(startFilteredRank ? startFilteredRank - endFilteredRank : null, !startFilteredRank);
      return [
        '<tr>',
        '<td>', String(endFilteredRank), '</td>',
        '<td>', buildTermLink(term.term, endMonth.month_key), '</td>',
        '<td>', escapeHTML(term.primary_family || 'Other'), '</td>',
        '<td>', escapeHTML(formatTags(term.tags)), '</td>',
        '<td>', String(term.count), '</td>',
        '<td>', formatPercentage(termPercentage(term, endMonth)), '</td>',
        '<td>', startFilteredRank ? String(startFilteredRank) : '<span class="trend-pill trend-pill--new">New</span>', '</td>',
        '<td>', '<span class="', deltaClass(startFilteredRank ? startFilteredRank - endFilteredRank : null, !startFilteredRank), '">', deltaText, '</span>', '</td>',
        '</tr>'
      ].join('');
    }).join('');
  }

  function renderMoverTable(prefix, rows, endMonth) {
    const body = document.getElementById(prefix + '-table-body');
    const empty = document.getElementById(prefix + '-empty');
    const caption = document.getElementById(prefix + '-table-caption');
    caption.textContent = 'Filtered rank change from ' + months[state.startIndex].label + ' to ' + endMonth.label + '.';

    if (rows.length === 0) {
      body.innerHTML = '';
      empty.classList.remove('d-none');
      return;
    }

    empty.classList.add('d-none');
    body.innerHTML = rows.map(function (row) {
      return [
        '<tr>',
        '<td>', buildTermLink(row.term, endMonth.month_key), '</td>',
        '<td>', escapeHTML(row.primaryFamily || 'Other'), '</td>',
        '<td>', String(row.endRank), '</td>',
        '<td>', row.startRank ? String(row.startRank) : '<span class="trend-pill trend-pill--new">New</span>', '</td>',
        '<td>', '<span class="', deltaClass(row.delta, row.isNew), '">', formatDelta(row.delta, row.isNew), '</span>', '</td>',
        '</tr>'
      ].join('');
    }).join('');
  }

  function buildTermLink(term, monthKey) {
    const href = archiveHrefByMonth.get(monthKey);
    if (!href) {
      return escapeHTML(term);
    }
    return '<a href="' + escapeAttribute(href + '?compare=' + encodeURIComponent(term)) + '">' + escapeHTML(term) + '</a>';
  }

  function buildMonthLink(label, monthKey, term) {
    const href = archiveHrefByMonth.get(monthKey);
    if (!href) {
      return escapeHTML(label);
    }
    return '<a href="' + escapeAttribute(href + '?compare=' + encodeURIComponent(term)) + '">' + escapeHTML(label) + '</a>';
  }

  function matchesSelectedTaxonomy(term) {
    if (state.kind !== FILTER_ALL && (term.kind || 'Other') !== state.kind) {
      return false;
    }
    if (state.family !== FILTER_ALL && (term.primary_family || 'Other') !== state.family) {
      return false;
    }
    if (state.tag !== FILTER_ALL) {
      return Array.isArray(term.tags) && term.tags.includes(state.tag);
    }
    return true;
  }

  function isVisibleTerm(term) {
    return !isExcludedTerm(term.term) && term.count > 0 && matchesSelectedTaxonomy(term);
  }

  function isExcludedTerm(term) {
    return EXCLUDED_TERMS.has(String(term || '').trim());
  }

  function resolveTermName(value) {
    const normalized = normalizeTermName(value);
    if (!normalized) {
      return '';
    }
    const exact = termByNormalizedName.get(normalized);
    if (exact) {
      return exact.term;
    }
    const startsWith = termCatalog.find(function (term) {
      return normalizeTermName(term.term).startsWith(normalized);
    });
    if (startsWith) {
      return startsWith.term;
    }
    const contains = termCatalog.find(function (term) {
      return normalizeTermName(term.term).includes(normalized);
    });
    return contains ? contains.term : '';
  }

  function normalizeTermName(value) {
    return String(value || '').trim().toLowerCase();
  }

  function formatTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) {
      return '';
    }
    return tags.slice(0, 4).join(', ');
  }

  function syncSummaryText(startMonth, endMonth, visibleCount, monthCount, filteredTermCount) {
    setText('dashboard-window', 'Filtered ranks ' + state.windowStart + '-' + (state.windowStart + state.size - 1));
    setText('selected-window-summary', 'Showing ' + visibleCount + ' term(s) from filtered ranks ' + state.windowStart + '-' + (state.windowStart + state.size - 1) + ' in ' + endMonth.label + ' across ' + filteredTermCount + ' matching terms.');
    setText('selected-month-count', String(monthCount));
  }

  function syncQueryParams(startMonth, endMonth) {
    const params = new URLSearchParams(window.location.search);
    params.set('start', startMonth.month_key);
    params.set('end', endMonth.month_key);
    params.set('size', String(state.size));
    params.set('window_start', String(state.windowStart));
    params.set('kind', encodeFilterParam(state.kind));

    syncOptionalParam(params, 'family', state.family === FILTER_ALL ? '' : state.family);
    syncOptionalParam(params, 'tag', state.tag === FILTER_ALL ? '' : state.tag);
    syncOptionalParam(params, 'term', state.focusedTerm);

    const nextURL = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', nextURL);
  }

  function syncOptionalParam(params, name, value) {
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
  }

  function encodeFilterParam(value) {
    return value === FILTER_ALL ? 'all' : value;
  }

  function buildFilterSummary() {
    const parts = [];
    if (state.kind !== FILTER_ALL) {
      parts.push(state.kind);
    }
    if (state.family !== FILTER_ALL) {
      parts.push(state.family);
    }
    if (state.tag !== FILTER_ALL) {
      parts.push('#' + state.tag);
    }
    return parts.length > 0 ? parts.join(' / ') : 'All terms';
  }

  function sortedUnique(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (left, right) {
      return left.localeCompare(right);
    });
  }

  function updateRangeFill() {
    const fill = document.getElementById('range-fill');
    if (!fill || months.length <= 1) {
      return;
    }

    const maxIndex = months.length - 1;
    const left = (state.startIndex / maxIndex) * 100;
    const right = (state.endIndex / maxIndex) * 100;
    fill.style.left = left + '%';
    fill.style.width = (right - left) + '%';
  }

  function formatPercentage(value) {
    return value.toFixed(4) + '%';
  }

  function termPercentage(term, month) {
    if (!term || !month || !month.num_comments) {
      return 0;
    }
    return (term.count / month.num_comments) * 100;
  }

  function formatDelta(value, isNew) {
    if (isNew) {
      return 'New';
    }
    if (value === null || value === 0) {
      return '0';
    }
    if (value > 0) {
      return '+' + value;
    }
    return String(value);
  }

  function deltaClass(value, isNew) {
    if (isNew) {
      return 'trend-pill trend-pill--new';
    }
    if (value > 0) {
      return 'trend-pill trend-pill--up';
    }
    if (value < 0) {
      return 'trend-pill trend-pill--down';
    }
    return 'trend-pill';
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHTML(value);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
