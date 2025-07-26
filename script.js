
let allData = [];

function showTab(tab) {
  document.getElementById('asian-tab').classList.remove('active');
  document.getElementById('ou-tab').classList.remove('active');
  document.getElementById('asian-tab-btn').classList.remove('active');
  document.getElementById('ou-tab-btn').classList.remove('active');
  if (tab === 'asian') {
    document.getElementById('asian-tab').classList.add('active');
    document.getElementById('asian-tab-btn').classList.add('active');
  } else {
    document.getElementById('ou-tab').classList.add('active');
    document.getElementById('ou-tab-btn').classList.add('active');
  }
}

// 盤口下拉
function generateAsianLines() {
  const select = document.getElementById('asian-line');
  select.innerHTML = '';
  for (let i = -4.5; i <= 4.5; i += 0.25) {
    let display = i > 0 ? '+' + i.toFixed(2).replace(/\.00$/, '') : i.toFixed(2).replace(/\.00$/, '');
    select.innerHTML += `<option value="${i}">${display}</option>`;
  }
}
function generateOULines() {
  const select = document.getElementById('ou-line');
  select.innerHTML = '';
  for (let i = 2.0; i <= 4.5; i += 0.25) {
    select.innerHTML += `<option value="${i}">${i.toFixed(2).replace(/\.00$/, '')}</option>`;
  }
}

function loadData() {
  fetch('compiled_odds.json')
    .then(res => res.json())
    .then(data => {
      allData = data;
    });
}

// 查詢亞洲盤
function searchAsian() {
  const mode = document.getElementById('asian-mode').value; // open/close
  const lineField = mode === 'open' ? 'handicap_open_line' : 'handicap_close_line';
  const homeOddsField = mode === 'open' ? 'handicap_open_home_odds' : 'handicap_close_home_odds';
  const awayOddsField = mode === 'open' ? 'handicap_open_away_odds' : 'handicap_close_away_odds';
  const line = parseFloat(document.getElementById('asian-line').value);
  const minHome = parseFloat(document.getElementById('asian-home-odds-min').value) || -Infinity;
  const maxHome = parseFloat(document.getElementById('asian-home-odds-max').value) || Infinity;
  const minAway = parseFloat(document.getElementById('asian-away-odds-min').value) || -Infinity;
  const maxAway = parseFloat(document.getElementById('asian-away-odds-max').value) || Infinity;

  const filtered = allData.filter(row =>
    parseFloat(row[lineField]) === line &&
    row[homeOddsField] >= minHome &&
    row[homeOddsField] <= maxHome &&
    row[awayOddsField] >= minAway &&
    row[awayOddsField] <= maxAway
  );
  renderResult('asian-result', filtered, 'asian', mode);
}

// 查詢大小球
function searchOU() {
  const mode = document.getElementById('ou-mode').value;
  const lineField = mode === 'open' ? 'ou_open_line' : 'ou_close_line';
  const overOddsField = mode === 'open' ? 'ou_open_over_odds' : 'ou_close_over_odds';
  const underOddsField = mode === 'open' ? 'ou_open_under_odds' : 'ou_close_under_odds';
  const line = parseFloat(document.getElementById('ou-line').value);
  const minOver = parseFloat(document.getElementById('ou-over-odds-min').value) || -Infinity;
  const maxOver = parseFloat(document.getElementById('ou-over-odds-max').value) || Infinity;
  const minUnder = parseFloat(document.getElementById('ou-under-odds-min').value) || -Infinity;
  const maxUnder = parseFloat(document.getElementById('ou-under-odds-max').value) || Infinity;

  const filtered = allData.filter(row =>
    parseFloat(row[lineField]) === line &&
    row[overOddsField] >= minOver &&
    row[overOddsField] <= maxOver &&
    row[underOddsField] >= minUnder &&
    row[underOddsField] <= maxUnder
  );
  renderResult('ou-result', filtered, 'ou', mode);
}

// 統一渲染結果
function renderResult(domId, data, mode, lineType) {
  let html = '';
  // 標示初盤/終盤
  const modeLabel = (lineType === 'open' ? '初盤' : '終盤');
  html += `<div class="stat-box">${modeLabel}｜總場數：${data.length}</div>`;
  if (mode === 'asian') {
    const win = data.filter(r => r.result === '主贏盤').length;
    const lose = data.filter(r => r.result === '主輸盤').length;
    const draw = data.filter(r => r.result === '走水').length;
    html += `<div class="stat-box">主贏盤：${win}　主輸盤：${lose}　走水：${draw}</div>`;
  } else {
    const win = data.filter(r => r.result === '大').length;
    const lose = data.filter(r => r.result === '細').length;
    html += `<div class="stat-box">大球：${win}　細球：${lose}</div>`;
  }
  html += `<div class="table-wrapper"><table class="result-table"><thead><tr>`;
  if (mode === 'asian') {
    html += `<th>比賽日期</th><th>主隊</th><th>客隊</th><th>比分</th><th>${modeLabel}盤口</th><th>主賠</th><th>客賠</th><th>結果</th>`;
  } else {
    html += `<th>比賽日期</th><th>主隊</th><th>客隊</th><th>比分</th><th>${modeLabel}盤口</th><th>大賠</th><th>細賠</th><th>結果</th>`;
  }
  html += `</tr></thead><tbody>`;
  data.forEach(row => {
    html += '<tr>';
    html += `<td>${row.match_date || ''}</td>`;
    html += `<td>${row.home_team || ''}</td>`;
    html += `<td>${row.away_team || ''}</td>`;
    html += `<td>${row.final_score || ''}</td>`;
    if (mode === 'asian') {
      html += `<td>${row[lineType === 'open' ? 'handicap_open_line' : 'handicap_close_line']}</td>`;
      html += `<td>${row[lineType === 'open' ? 'handicap_open_home_odds' : 'handicap_close_home_odds']}</td>`;
      html += `<td>${row[lineType === 'open' ? 'handicap_open_away_odds' : 'handicap_close_away_odds']}</td>`;
      html += `<td>${row.result || ''}</td>`;
    } else {
      html += `<td>${row[lineType === 'open' ? 'ou_open_line' : 'ou_close_line']}</td>`;
      html += `<td>${row[lineType === 'open' ? 'ou_open_over_odds' : 'ou_close_over_odds']}</td>`;
      html += `<td>${row[lineType === 'open' ? 'ou_open_under_odds' : 'ou_close_under_odds']}</td>`;
      html += `<td>${row.result || ''}</td>`;
    }
    html += '</tr>';
  });
  html += `</tbody></table></div>`;
  document.getElementById(domId).innerHTML = html;
}

// 標籤動態切換
function updateAsianLabels() {
  const mode = document.getElementById('asian-mode').value;
  document.getElementById('asian-line-label').textContent = mode === 'open' ? '讓球盤口' : '終盤盤口';
  document.getElementById('asian-home-odds-label').textContent = mode === 'open' ? '主隊賠率' : '終盤主隊賠率';
  document.getElementById('asian-away-odds-label').textContent = mode === 'open' ? '客隊賠率' : '終盤客隊賠率';
}
function updateOULabels() {
  const mode = document.getElementById('ou-mode').value;
  document.getElementById('ou-line-label').textContent = mode === 'open' ? '大小球盤口' : '終盤盤口';
  document.getElementById('ou-over-odds-label').textContent = mode === 'open' ? '大球賠率' : '終盤大賠率';
  document.getElementById('ou-under-odds-label').textContent = mode === 'open' ? '細球賠率' : '終盤細賠率';
}

window.onload = function() {
  generateAsianLines();
  generateOULines();
  showTab('asian');
  loadData();
  document.getElementById('asian-mode').onchange = updateAsianLabels;
  document.getElementById('ou-mode').onchange = updateOULabels;
  updateAsianLabels();
  updateOULabels();
};
