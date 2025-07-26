/*
 * 大小球搜尋邏輯
 * 此腳本與亞洲盤篩選的 script.js 類似，但針對大小球盤口與賠率。
 */

let dataset = [];

async function loadData() {
  try {
    const response = await fetch('compiled_odds.json');
    const data = await response.json();
    dataset = data;
    initDataTable(dataset);
  } catch (error) {
    console.error('數據載入失敗:', error);
  }
}

function initDataTable(data) {
  // Destroy existing table if exists
  if ($.fn.DataTable.isDataTable('#resultsTable')) {
    $('#resultsTable').DataTable().destroy();
    $('#resultsTable tbody').empty();
  }

  const rows = data.map((item) => {
    // 計算大小球結果：總進球與盤口比較
    let ouResult = '';
    const homeScore = parseInt(item.home_score);
    const awayScore = parseInt(item.away_score);
    const totalGoals = homeScore + awayScore;
    const ouLine = parseFloat(item.ou_open_line);
    if (!isNaN(totalGoals) && !isNaN(ouLine)) {
      if (totalGoals > ouLine) ouResult = '大';
      else if (totalGoals < ouLine) ouResult = '小';
      else ouResult = '走';
    }
    return [
      item.league,
      item.season,
      item.match_date,
      item.home_team,
      item.away_team,
      item.final_score,
      item.ou_open_line,
      item.ou_open_over_odds,
      item.ou_open_under_odds,
      item.ou_close_over_odds,
      item.ou_close_under_odds,
      ouResult,
    ];
  });

  $('#resultsTable').DataTable({
    data: rows,
    responsive: true,
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    language: {
      search: '搜尋:',
      lengthMenu: '每頁顯示 _MENU_ 條',
      info: '顯示第 _START_ 至 _END_ 條，共 _TOTAL_ 條',
      paginate: {
        previous: '上一頁',
        next: '下一頁',
      },
      infoEmpty: '沒有符合條件的數據',
      zeroRecords: '沒有符合條件的比賽',
    },
    columnDefs: [
      { responsivePriority: 1, targets: 0 }, // league
      { responsivePriority: 2, targets: 3 }, // home team
      { responsivePriority: 3, targets: 4 }, // away team
      { responsivePriority: 4, targets: 5 }, // final score
    ],
  });
}

function parseNumberInput(value) {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function filterData() {
  const ouLine = parseNumberInput($('#ouLine').val());
  const minOpenOverOdds = parseNumberInput($('#minOpenOverOdds').val());
  const maxOpenOverOdds = parseNumberInput($('#maxOpenOverOdds').val());
  const minOpenUnderOdds = parseNumberInput($('#minOpenUnderOdds').val());
  const maxOpenUnderOdds = parseNumberInput($('#maxOpenUnderOdds').val());
  const minCloseOverOdds = parseNumberInput($('#minCloseOverOdds').val());
  const maxCloseOverOdds = parseNumberInput($('#maxCloseOverOdds').val());
  const minCloseUnderOdds = parseNumberInput($('#minCloseUnderOdds').val());
  const maxCloseUnderOdds = parseNumberInput($('#maxCloseUnderOdds').val());

  const filtered = dataset.filter((item) => {
    const lineVal = parseFloat(item.ou_open_line);
    const openOverVal = parseFloat(item.ou_open_over_odds);
    const openUnderVal = parseFloat(item.ou_open_under_odds);
    const closeOverVal = parseFloat(item.ou_close_over_odds);
    const closeUnderVal = parseFloat(item.ou_close_under_odds);

    // 盤口匹配：有輸入則要求近似相等（容許微小誤差）
    if (ouLine !== null && !(Math.abs(lineVal - ouLine) < 0.001)) return false;
    // 開盤大球賠率區間
    if (minOpenOverOdds !== null && !(openOverVal >= minOpenOverOdds)) return false;
    if (maxOpenOverOdds !== null && !(openOverVal <= maxOpenOverOdds)) return false;
    // 開盤小球賠率區間
    if (minOpenUnderOdds !== null && !(openUnderVal >= minOpenUnderOdds)) return false;
    if (maxOpenUnderOdds !== null && !(openUnderVal <= maxOpenUnderOdds)) return false;
    // 終盤大球賠率區間
    if (minCloseOverOdds !== null && !(closeOverVal >= minCloseOverOdds)) return false;
    if (maxCloseOverOdds !== null && !(closeOverVal <= maxCloseOverOdds)) return false;
    // 終盤小球賠率區間
    if (minCloseUnderOdds !== null && !(closeUnderVal >= minCloseUnderOdds)) return false;
    if (maxCloseUnderOdds !== null && !(closeUnderVal <= maxCloseUnderOdds)) return false;
    return true;
  });
  updateSummary(filtered);
  initDataTable(filtered);
}

function updateSummary(data) {
  const summaryEl = $('#summaryText');
  if (data.length === 0) {
    summaryEl.text('沒有符合條件的比賽。');
    return;
  }
  let overCount = 0;
  let underCount = 0;
  let pushCount = 0;
  data.forEach((item) => {
    const homeScore = parseInt(item.home_score);
    const awayScore = parseInt(item.away_score);
    const totalGoals = homeScore + awayScore;
    const lineVal = parseFloat(item.ou_open_line);
    if (!isNaN(totalGoals) && !isNaN(lineVal)) {
      if (totalGoals > lineVal) overCount++;
      else if (totalGoals < lineVal) underCount++;
      else pushCount++;
    }
  });
  const total = data.length;
  const overPct = ((overCount / total) * 100).toFixed(1);
  const underPct = ((underCount / total) * 100).toFixed(1);
  const pushPct = ((pushCount / total) * 100).toFixed(1);
  const summaryHtml = `符合條件的比賽共有 <strong>${total}</strong> 場。<br/>大球：<strong>${overCount}</strong> 場 (${overPct}%); 小球：<strong>${underCount}</strong> 場 (${underPct}%); 走水：<strong>${pushCount}</strong> 場 (${pushPct}%)`;
  summaryEl.html(summaryHtml);
}

$(document).ready(function () {
  loadData();
  $('#filterButton').on('click', function () {
    filterData();
  });
});