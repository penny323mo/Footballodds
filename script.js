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

  const rows = data.map((item) => [
    item.league,
    item.season,
    item.match_date,
    item.home_team,
    item.away_team,
    item.final_score,
    item.handicap_open_line,
    item.handicap_open_home_odds,
    item.handicap_open_away_odds,
    item.handicap_close_line,
    item.handicap_close_home_odds,
    item.handicap_close_away_odds,
    item.result,
  ]);

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
  // 取得單一初盤讓球與終盤讓球輸入值（改為非範圍）
  const openLine = parseNumberInput($('#openLine').val());
  const minOpenHomeOdds = parseNumberInput($('#minOpenHomeOdds').val());
  const maxOpenHomeOdds = parseNumberInput($('#maxOpenHomeOdds').val());
  const minOpenAwayOdds = parseNumberInput($('#minOpenAwayOdds').val());
  const maxOpenAwayOdds = parseNumberInput($('#maxOpenAwayOdds').val());
  const closeLine = parseNumberInput($('#closeLine').val());
  const minCloseHomeOdds = parseNumberInput($('#minCloseHomeOdds').val());
  const maxCloseHomeOdds = parseNumberInput($('#maxCloseHomeOdds').val());
  const minCloseAwayOdds = parseNumberInput($('#minCloseAwayOdds').val());
  const maxCloseAwayOdds = parseNumberInput($('#maxCloseAwayOdds').val());

  const filtered = dataset.filter((item) => {
    const itemOpenLine = parseFloat(item.handicap_open_line);
    const openHomeOddsVal = parseFloat(item.handicap_open_home_odds);
    const openAwayOddsVal = parseFloat(item.handicap_open_away_odds);
    const itemCloseLine = parseFloat(item.handicap_close_line);
    const closeHomeOddsVal = parseFloat(item.handicap_close_home_odds);
    const closeAwayOddsVal = parseFloat(item.handicap_close_away_odds);

    // 初盤讓球若有輸入，要求與資料相近（容許微小誤差）
    if (openLine !== null && !(Math.abs(itemOpenLine - openLine) < 0.001)) return false;
    // 初盤主隊賠率區間
    if (minOpenHomeOdds !== null && !(openHomeOddsVal >= minOpenHomeOdds)) return false;
    if (maxOpenHomeOdds !== null && !(openHomeOddsVal <= maxOpenHomeOdds)) return false;
    // 初盤客隊賠率區間
    if (minOpenAwayOdds !== null && !(openAwayOddsVal >= minOpenAwayOdds)) return false;
    if (maxOpenAwayOdds !== null && !(openAwayOddsVal <= maxOpenAwayOdds)) return false;
    // 終盤讓球若有輸入，要求與資料相近（容許微小誤差）
    if (closeLine !== null && !(Math.abs(itemCloseLine - closeLine) < 0.001)) return false;
    // 終盤主隊賠率區間
    if (minCloseHomeOdds !== null && !(closeHomeOddsVal >= minCloseHomeOdds)) return false;
    if (maxCloseHomeOdds !== null && !(closeHomeOddsVal <= maxCloseHomeOdds)) return false;
    // 終盤客隊賠率區間
    if (minCloseAwayOdds !== null && !(closeAwayOddsVal >= minCloseAwayOdds)) return false;
    if (maxCloseAwayOdds !== null && !(closeAwayOddsVal <= maxCloseAwayOdds)) return false;
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
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  data.forEach((item) => {
    if (item.result === 'H') homeWins++;
    else if (item.result === 'D') draws++;
    else if (item.result === 'A') awayWins++;
  });
  const total = data.length;
  const homePct = ((homeWins / total) * 100).toFixed(1);
  const drawPct = ((draws / total) * 100).toFixed(1);
  const awayPct = ((awayWins / total) * 100).toFixed(1);
  const summaryHtml = `符合條件的比賽共有 <strong>${total}</strong> 場。<br/>主隊勝出：<strong>${homeWins}</strong> 場 (${homePct}%); 平局：<strong>${draws}</strong> 場 (${drawPct}%); 客隊勝出：<strong>${awayWins}</strong> 場 (${awayPct}%)`;
  summaryEl.html(summaryHtml);
}

$(document).ready(function () {
  loadData();
  $('#filterButton').on('click', function () {
    filterData();
  });
});
