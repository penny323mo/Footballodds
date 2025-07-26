
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

function generateAsianLines(id) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">--</option>';
  for (let i = -4.5; i <= 4.5; i += 0.25) {
    let display = i > 0 ? '+' + i.toFixed(2).replace(/\.00$/, '') : i.toFixed(2).replace(/\.00$/, '');
    select.innerHTML += `<option value="${i}">${display}</option>`;
  }
}
function generateOULines(id) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">--</option>';
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

function filterNum(val, min, max) {
  if (min && val < min) return false;
  if (max && val > max) return false;
  return true;
}
function filterStr(val, want) {
  if (!want) return true;
  return val == want;
}

function searchAsian() {
  const open_line = document.getElementById('asian-open-line').value;
  const open_home_min = parseFloat(document.getElementById('asian-open-home-odds-min').value);
  const open_home_max = parseFloat(document.getElementById('asian-open-home-odds-max').value);
  const open_away_min = parseFloat(document.getElementById('asian-open-away-odds-min').value);
  const open_away_max = parseFloat(document.getElementById('asian-open-away-odds-max').value);
  const close_line = document.getElementById('asian-close-line').value;
  const close_home_min = parseFloat(document.getElementById('asian-close-home-odds-min').value);
  const close_home_max = parseFloat(document.getElementById('asian-close-home-odds-max').value);
  const close_away_min = parseFloat(document.getElementById('asian-close-away-odds-min').value);
  const close_away_max = parseFloat(document.getElementById('asian-close-away-odds-max').value);
  const filtered = allData.filter(row =>
    (open_line === "" || parseFloat(row.handicap_open_line) === parseFloat(open_line)) &&
    (isNaN(open_home_min) || row.handicap_open_home_odds >= open_home_min) &&
    (isNaN(open_home_max) || row.handicap_open_home_odds <= open_home_max) &&
    (isNaN(open_away_min) || row.handicap_open_away_odds >= open_away_min) &&
    (isNaN(open_away_max) || row.handicap_open_away_odds <= open_away_max) &&
    (close_line === "" || parseFloat(row.handicap_close_line) === parseFloat(close_line)) &&
    (isNaN(close_home_min) || row.handicap_close_home_odds >= close_home_min) &&
    (isNaN(close_home_max) || row.handicap_close_home_odds <= close_home_max) &&
    (isNaN(close_away_min) || row.handicap_close_away_odds >= close_away_min) &&
    (isNaN(close_away_max) || row.handicap_close_away_odds <= close_away_max)
  );
  renderResult('asian-result', filtered, 'asian');
}
function searchOU() {
  const open_line = document.getElementById('ou-open-line').value;
  const open_over_min = parseFloat(document.getElementById('ou-open-over-odds-min').value);
  const open_over_max = parseFloat(document.getElementById('ou-open-over-odds-max').value);
  const open_under_min = parseFloat(document.getElementById('ou-open-under-odds-min').value);
  const open_under_max = parseFloat(document.getElementById('ou-open-under-odds-max').value);
  const close_line = document.getElementById('ou-close-line').value;
  const close_over_min = parseFloat(document.getElementById('ou-close-over-odds-min').value);
  const close_over_max = parseFloat(document.getElementById('ou-close-over-odds-max').value);
  const close_under_min = parseFloat(document.getElementById('ou-close-under-odds-min').value);
  const close_under_max = parseFloat(document.getElementById('ou-close-under-odds-max').value);
  const filtered = allData.filter(row =>
    (open_line === "" || parseFloat(row.ou_open_line) === parseFloat(open_line)) &&
    (isNaN(open_over_min) || row.ou_open_over_odds >= open_over_min) &&
    (isNaN(open_over_max) || row.ou_open_over_odds <= open_over_max) &&
    (isNaN(open_under_min) || row.ou_open_under_odds >= open_under_min) &&
    (isNaN(open_under_max) || row.ou_open_under_odds <= open_under_max) &&
    (close_line === "" || parseFloat(row.ou_close_line) === parseFloat(close_line)) &&
    (isNaN(close_over_min) || row.ou_close_over_odds >= close_over_min) &&
    (isNaN(close_over_max) || row.ou_close_over_odds <= close_over_max) &&
    (isNaN(close_under_min) || row.ou_close_under_odds >= close_under_min) &&
    (isNaN(close_under_max) || row.ou_close_under_odds <= close_under_max)
  );
  renderResult('ou-result', filtered, 'ou');
}

// 百分比格式
function pct(val, total) {
  if (total === 0) return "0.00%";
  return (val / total * 100).toFixed(2) + "%";
}
function renderResult(domId, data, mode) {
  let html = '';
  // 統計（場數＋百分比）
  const total = data.length;
  if (mode === 'asian') {
    const win = data.filter(r => r.result === 'H').length;
    const lose = data.filter(r => r.result === 'A').length;
    const draw = data.filter(r => r.result === 'D').length;
    html += `<div class="stat-box">主贏盤 ${win} 場（${pct(win,total)}）　主輸盤 ${lose} 場（${pct(lose,total)}）　走水 ${draw} 場（${pct(draw,total)}）</div>`;
  } else {
    // 大小球暫時假設 H=大, A=細, D=和
    const win = data.filter(r => r.result === 'H').length;
    const lose = data.filter(r => r.result === 'A').length;
    const draw = data.filter(r => r.result === 'D').length;
    html += `<div class="stat-box">大球 ${win} 場（${pct(win,total)}）　細球 ${lose} 場（${pct(lose,total)}）　和 ${draw} 場（${pct(draw,total)}）</div>`;
  }
  // 比賽列表
  if (data.length === 0) {
    html += `<div style="margin-top:20px;">冇賽事符合條件。</div>`;
  } else {
    html += `<div class="table-wrapper"><table class="result-table"><thead><tr>`;
    if (mode === 'asian') {
      html += `<th>比賽日期</th><th>主隊</th><th>客隊</th><th>比分</th><th>初盤盤口</th><th>初盤主賠</th><th>初盤客賠</th><th>終盤盤口</th><th>終盤主賠</th><th>終盤客賠</th><th>結果</th>`;
    } else {
      html += `<th>比賽日期</th><th>主隊</th><th>客隊</th><th>比分</th><th>初盤盤口</th><th>初盤大賠</th><th>初盤細賠</th><th>終盤盤口</th><th>終盤大賠</th><th>終盤細賠</th><th>結果</th>`;
    }
    html += `</tr></thead><tbody>`;
    data.forEach(row => {
      html += '<tr>';
      html += `<td>${row.match_date || ''}</td>`;
      html += `<td>${row.home_team || ''}</td>`;
      html += `<td>${row.away_team || ''}</td>`;
      html += `<td>${row.final_score || ''}</td>`;
      if (mode === 'asian') {
        html += `<td>${row.handicap_open_line}</td><td>${row.handicap_open_home_odds}</td><td>${row.handicap_open_away_odds}</td>`;
        html += `<td>${row.handicap_close_line}</td><td>${row.handicap_close_home_odds}</td><td>${row.handicap_close_away_odds}</td>`;
        html += `<td>${row.result || ''}</td>`;
      } else {
        html += `<td>${row.ou_open_line}</td><td>${row.ou_open_over_odds}</td><td>${row.ou_open_under_odds}</td>`;
        html += `<td>${row.ou_close_line}</td><td>${row.ou_close_over_odds}</td><td>${row.ou_close_under_odds}</td>`;
        html += `<td>${row.result || ''}</td>`;
      }
      html += '</tr>';
    });
    html += `</tbody></table></div>`;
  }
  document.getElementById(domId).innerHTML = html;
}

window.onload = function() {
  generateAsianLines('asian-open-line');
  generateAsianLines('asian-close-line');
  generateOULines('ou-open-line');
  generateOULines('ou-close-line');
  showTab('asian');
  loadData();
};
