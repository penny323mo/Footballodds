
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

function searchAsian() {
  const line = parseFloat(document.getElementById('asian-line').value);
  const minHome = parseFloat(document.getElementById('asian-home-odds-min').value) || -Infinity;
  const maxHome = parseFloat(document.getElementById('asian-home-odds-max').value) || Infinity;
  const minAway = parseFloat(document.getElementById('asian-away-odds-min').value) || -Infinity;
  const maxAway = parseFloat(document.getElementById('asian-away-odds-max').value) || Infinity;
  const filtered = allData.filter(row =>
    parseFloat(row.handicap_open_line) === line &&
    row.handicap_open_home_odds >= minHome &&
    row.handicap_open_home_odds <= maxHome &&
    row.handicap_open_away_odds >= minAway &&
    row.handicap_open_away_odds <= maxAway
  );
  renderResult('asian-result', filtered, 'asian');
}

function searchOU() {
  const line = parseFloat(document.getElementById('ou-line').value);
  const minOver = parseFloat(document.getElementById('ou-over-odds-min').value) || -Infinity;
  const maxOver = parseFloat(document.getElementById('ou-over-odds-max').value) || Infinity;
  const minUnder = parseFloat(document.getElementById('ou-under-odds-min').value) || -Infinity;
  const maxUnder = parseFloat(document.getElementById('ou-under-odds-max').value) || Infinity;
  const filtered = allData.filter(row =>
    parseFloat(row.ou_open_line) === line &&
    row.ou_open_over_odds >= minOver &&
    row.ou_open_over_odds <= maxOver &&
    row.ou_open_under_odds >= minUnder &&
    row.ou_open_under_odds <= maxUnder
  );
  renderResult('ou-result', filtered, 'ou');
}

function renderResult(domId, data, mode) {
  let html = '';
  html += `<div class="stat-box">總場數：${data.length}</div>`;
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
    html += `<th>比賽日期</th><th>主隊</th><th>客隊</th><th>比分</th><th>初盤盤口</th><th>主賠</th><th>客賠</th><th>結果</th>`;
  } else {
    html += `<th>比賽日期</th><th>主隊</th><th>客隊</th><th>比分</th><th>初盤盤口</th><th>大賠</th><th>細賠</th><th>結果</th>`;
  }
  html += `</tr></thead><tbody>`;
  data.forEach(row => {
    html += '<tr>';
    html += `<td>${row.match_date || ''}</td>`;
    html += `<td>${row.home_team || ''}</td>`;
    html += `<td>${row.away_team || ''}</td>`;
    html += `<td>${row.final_score || ''}</td>`;
    if (mode === 'asian') {
      html += `<td>${row.handicap_open_line}</td><td>${row.handicap_open_home_odds}</td><td>${row.handicap_open_away_odds}</td><td>${row.result || ''}</td>`;
    } else {
      html += `<td>${row.ou_open_line}</td><td>${row.ou_open_over_odds}</td><td>${row.ou_open_under_odds}</td><td>${row.result || ''}</td>`;
    }
    html += '</tr>';
  });
  html += `</tbody></table></div>`;
  document.getElementById(domId).innerHTML = html;
}

window.onload = function() {
  generateAsianLines();
  generateOULines();
  showTab('asian');
  loadData();
};
