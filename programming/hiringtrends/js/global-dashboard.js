'use strict';

(function () {
  const MIN_MOVER_COUNT = 5;
  const DEFAULT_SIZE = 10;
  const DEFAULT_WINDOW_START = 1;
  const MOVER_LIMIT = 10;

  const state = {
    startIndex: 0,
    endIndex: 0,
    size: DEFAULT_SIZE,
    windowStart: DEFAULT_WINDOW_START
  };

  let months = [];
  let archiveHrefByMonth = new Map();
  let monthIndexByKey = new Map();
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

    hydrateStateFromQuery();
    wireControls();
    render();
  }

  function enrichMonth(month) {
    const termMap = new Map((month.terms || []).map((term) => [term.term, term]));
    return Object.assign({}, month, { termMap: termMap });
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
  }

  function render() {
    const selectedMonths = months.slice(state.startIndex, state.endIndex + 1);
    const startMonth = selectedMonths[0];
    const endMonth = selectedMonths[selectedMonths.length - 1];

    syncControls(startMonth, endMonth);

    const availableWindowStarts = buildWindowStarts(endMonth.terms.length, state.size);
    if (!availableWindowStarts.includes(state.windowStart)) {
      state.windowStart = availableWindowStarts[0];
    }
    populateWindowStartSelect(availableWindowStarts, state.size);

    const visibleTerms = endMonth.terms.slice(state.windowStart - 1, state.windowStart - 1 + state.size);
    const movers = buildMovers(startMonth, endMonth);

    renderTrendChart(selectedMonths, visibleTerms);
    renderPostingsChart(selectedMonths);
    renderCurrentWindowTable(visibleTerms, startMonth, endMonth);
    renderMoverTable('rising', movers.risers, endMonth);
    renderMoverTable('falling', movers.fallers, endMonth);
    syncSummaryText(startMonth, endMonth, visibleTerms.length, selectedMonths.length);
    syncQueryParams(startMonth, endMonth);
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
    setText('dashboard-status', 'Using ' + startMonth.label + ' to ' + endMonth.label + ' with ranks ' + state.windowStart + '-' + (state.windowStart + state.size - 1) + ' from the selected end month.');

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
      option.textContent = 'Ranks ' + start + '-' + (start + size - 1);
      if (start === state.windowStart) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  function buildMovers(startMonth, endMonth) {
    const entries = endMonth.terms
      .filter(function (term) { return term.count >= MIN_MOVER_COUNT; })
      .map(function (term) {
        const startTerm = startMonth.termMap.get(term.term);
        const entry = {
          term: term.term,
          endRank: term.rank,
          startRank: startTerm ? startTerm.rank : null,
          count: term.count,
          percentage: term.percentage,
          href: archiveHrefByMonth.get(endMonth.month_key) || '',
          isNew: !startTerm
        };
        if (startTerm) {
          entry.delta = startTerm.rank - term.rank;
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

  function renderTrendChart(selectedMonths, visibleTerms) {
    const categories = selectedMonths.map(function (month) { return month.label; });
    const series = visibleTerms.map(function (term) {
      return {
        name: term.term,
        data: selectedMonths.map(function (month) {
          const monthTerm = month.termMap.get(term.term);
          return monthTerm ? monthTerm.percentage : 0;
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
        valueSuffix: '%'
      },
      series: series
    });
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

  function renderCurrentWindowTable(visibleTerms, startMonth, endMonth) {
    const body = document.getElementById('current-window-table-body');
    const empty = document.getElementById('current-window-empty');
    setText('current-window-caption', 'Ranks ' + state.windowStart + '-' + (state.windowStart + state.size - 1) + ' in ' + endMonth.label + '.');

    if (visibleTerms.length === 0) {
      body.innerHTML = '';
      empty.classList.remove('d-none');
      return;
    }

    empty.classList.add('d-none');
    body.innerHTML = visibleTerms.map(function (term) {
      const startTerm = startMonth.termMap.get(term.term);
      const deltaText = formatDelta(startTerm ? startTerm.rank - term.rank : null, !startTerm);
      return [
        '<tr>',
        '<td>', String(term.rank), '</td>',
        '<td>', buildTermLink(term.term, endMonth.month_key), '</td>',
        '<td>', String(term.count), '</td>',
        '<td>', formatPercentage(term.percentage), '</td>',
        '<td>', startTerm ? String(startTerm.rank) : '<span class="trend-pill trend-pill--new">New</span>', '</td>',
        '<td>', '<span class="', deltaClass(startTerm ? startTerm.rank - term.rank : null, !startTerm), '">', deltaText, '</span>', '</td>',
        '</tr>'
      ].join('');
    }).join('');
  }

  function renderMoverTable(prefix, rows, endMonth) {
    const body = document.getElementById(prefix + '-table-body');
    const empty = document.getElementById(prefix + '-empty');
    const caption = document.getElementById(prefix + '-table-caption');
    caption.textContent = 'Rank change from ' + months[state.startIndex].label + ' to ' + endMonth.label + '.';

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

  function syncSummaryText(startMonth, endMonth, visibleCount, monthCount) {
    setText('dashboard-window', 'Ranks ' + state.windowStart + '-' + (state.windowStart + state.size - 1));
    setText('selected-window-summary', 'Showing ' + visibleCount + ' term(s) from ranks ' + state.windowStart + '-' + (state.windowStart + state.size - 1) + ' in ' + endMonth.label + '.');
    setText('selected-month-count', String(monthCount));
  }

  function syncQueryParams(startMonth, endMonth) {
    const params = new URLSearchParams(window.location.search);
    params.set('start', startMonth.month_key);
    params.set('end', endMonth.month_key);
    params.set('size', String(state.size));
    params.set('window_start', String(state.windowStart));

    const nextURL = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', nextURL);
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
    return value.toFixed(2) + '%';
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
