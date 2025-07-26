let dataset = [];

async function loadData() {
  const res = await fetch("compiled_odds.json");
  dataset = await res.json();
}

function parse(value) {
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

function filterData() {
  const openLine = parse("openLine");
  const closeLine = parse("closeLine");
  const moho = parse("minOpenHomeOdds"), maho = parse("maxOpenHomeOdds");
  const moao = parse("minOpenAwayOdds"), maao = parse("maxOpenAwayOdds");
  const mcho = parse("minCloseHomeOdds"), macho = parse("maxCloseHomeOdds");
  const mcao = parse("minCloseAwayOdds"), macao = parse("maxCloseAwayOdds");

  const filtered = dataset.filter(item => {
    const ol = parseFloat(item.handicap_open_line);
    const cl = parseFloat(item.handicap_close_line);
    const oho = parseFloat(item.handicap_open_home_odds);
    const oao = parseFloat(item.handicap_open_away_odds);
    const cho = parseFloat(item.handicap_close_home_odds);
    const cao = parseFloat(item.handicap_close_away_odds);

    if (openLine !== null && Math.abs(ol - openLine) > 0.001) return false;
    if (closeLine !== null && Math.abs(cl - closeLine) > 0.001) return false;
    if (moho !== null && oho < moho) return false;
    if (maho !== null && oho > maho) return false;
    if (moao !== null && oao < moao) return false;
    if (maao !== null && oao > maao) return false;
    if (mcho !== null && cho < mcho) return false;
    if (macho !== null && cho > macho) return false;
    if (mcao !== null && cao < mcao) return false;
    if (macao !== null && cao > macao) return false;
    return true;
  });

  document.getElementById("summaryText").innerText = "找到 " + filtered.length + " 場比賽。";
}

window.onload = loadData;
function parse(id) {
  const val = document.getElementById(id).value;
  return parseFloat(val) || null;
}
