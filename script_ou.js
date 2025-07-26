let dataset = [];

async function loadData() {
  const res = await fetch("compiled_odds.json");
  dataset = await res.json();
}

function parse(id) {
  const val = document.getElementById(id).value;
  return parseFloat(val) || null;
}

function filterData() {
  const ouLine = parse("ouLine");
  const minO = parse("minOuOpenOverOdds"), maxO = parse("maxOuOpenOverOdds");
  const minU = parse("minOuOpenUnderOdds"), maxU = parse("maxOuOpenUnderOdds");
  const minCO = parse("minOuCloseOverOdds"), maxCO = parse("maxOuCloseOverOdds");
  const minCU = parse("minOuCloseUnderOdds"), maxCU = parse("maxOuCloseUnderOdds");

  const result = dataset.filter(item => {
    const ol = parseFloat(item.ou_open_line);
    const oO = parseFloat(item.ou_open_over_odds);
    const oU = parseFloat(item.ou_open_under_odds);
    const cO = parseFloat(item.ou_close_over_odds);
    const cU = parseFloat(item.ou_close_under_odds);

    if (ouLine !== null && Math.abs(ol - ouLine) > 0.001) return false;
    if (minO !== null && oO < minO) return false;
    if (maxO !== null && oO > maxO) return false;
    if (minU !== null && oU < minU) return false;
    if (maxU !== null && oU > maxU) return false;
    if (minCO !== null && cO < minCO) return false;
    if (maxCO !== null && cO > maxCO) return false;
    if (minCU !== null && cU < minCU) return false;
    if (maxCU !== null && cU > maxCU) return false;

    return true;
  });

  document.getElementById("summaryText").innerText = "找到 " + result.length + " 場比賽。";
}

window.onload = loadData;
