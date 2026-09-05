const SAVE_KEY = "mlbb_pro_manager_save_v08";

let game = {
  version: 8,
  year: 2026,

  managerName: "",
  country: null,
  league: null,
  team: null,

  budget: 500000,
  reputation: 50,
  organizationLevel: 1,
  target: "top3",

  standings: [],
  schedule: [],

  phase: "regular",
  currentMatch: null,

  marketPlayers: [],
  requests: [],

  playoff: null,
  champion: null,

  history: [],

  careerStarted: false
};

let leagueData = null;

/* =========================
   BASIC
========================= */

function money(value) {
  return "₱" + Math.round(value).toLocaleString("id-ID");
}

function esc(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
  });

  const el = document.getElementById(id);

  if (el) {
    el.classList.add("active");
    window.scrollTo(0, 0);
  }
}

function getLeagueData(id) {
  if (id === "mpl-id") return MPL_ID_2026;
  if (id === "mpl-ph") return MPL_PH_2026;
  if (id === "mpl-kh") return MPL_KH_2026;
  return null;
}

function getTeamSource(teamId) {
  if (game.team && game.team.id === teamId) {
    return game.team;
  }

  return leagueData?.teams?.find(t => t.id === teamId) || null;
}

function teamName(teamId) {
  return getTeamSource(teamId)?.name || teamId;
}

function teamRating(teamId) {
  const team = getTeamSource(teamId);

  if (!team || !team.players?.length) {
    return 70;
  }

  const ratings = team.players
    .map(p => Number(p.rating || 0))
    .sort((a, b) => b - a)
    .slice(0, 5);

  if (!ratings.length) return 70;

  return Math.round(
    ratings.reduce((sum, value) => sum + value, 0) / ratings.length
  );
}

/* =========================
   COUNTRY / LEAGUE / TEAM
========================= */

function renderCountries() {
  const box = document.getElementById("countryList");

  box.innerHTML = countries.map(country => `
    <button class="option" onclick="selectCountry('${country.id}')">
      <span class="flag">${country.flag}</span>
      <span class="option-info">
        <strong>${esc(country.name)}</strong>
        <small>${country.leagues.length} liga tersedia</small>
      </span>
    </button>
  `).join("");
}

function selectCountry(id) {
  game.country = countries.find(c => c.id === id);

  document.getElementById("selectedCountryText").textContent =
    game.country.name;

  renderLeagues();
  showScreen("leagueScreen");
}

function renderLeagues() {
  const box = document.getElementById("leagueList");

  const leagues = game.country.leagues
    .map(getLeagueData)
    .filter(Boolean);

  box.innerHTML = leagues.map(league => `
    <button class="option" onclick="selectLeague('${league.id}')">
      <span class="flag">🏆</span>
      <span class="option-info">
        <strong>${esc(league.name)}</strong>
        <small>Season ${league.season} • ${league.teams.length} Teams</small>
      </span>
    </button>
  `).join("");
}

function selectLeague(id) {
  leagueData = getLeagueData(id);

  game.league = {
    id: leagueData.id,
    name: leagueData.name,
    season: leagueData.season,
    region: leagueData.region
  };

  document.getElementById("selectedLeagueText").textContent =
    leagueData.name;

  renderTeams();
  showScreen("teamScreen");
}

function renderTeams() {
  const box = document.getElementById("teamList");

  box.innerHTML = leagueData.teams.map(team => `
    <button class="option" onclick="selectTeam('${team.id}')">
      <span class="flag">🏆</span>
      <span class="option-info">
        <strong>${esc(team.name)}</strong>
        <small>Roster ${team.players?.length || 0} pemain</small>
      </span>
    </button>
  `).join("");
}

function selectTeam(id) {
  const source = leagueData.teams.find(t => t.id === id);

  if (!source) return;

  game.team = clone(source);

  game.team.players = game.team.players.map(player => ({
    ...player,
    contractYears: player.contractYears ?? 2,
    morale: player.morale ?? 80
  }));

  showScreen("managerSetupScreen");
}

/* =========================
   CAREER
========================= */

function startCareer() {
  const nameInput = document.getElementById("managerName");

  game.managerName =
    nameInput.value.trim() || "Anonymous Manager";

  game.target =
    document.getElementById("managerTarget").value;

  game.careerStarted = true;
  game.year = 2026;
  game.phase = "regular";
  game.champion = null;
  game.history = [];
  game.requests = [];

  createSeason();

  saveGame();
  renderDashboard();

  showScreen("dashboardScreen");
}

function createSeason() {
  game.phase = "regular";
  game.currentMatch = null;
  game.champion = null;
  game.playoff = null;

  game.standings = game.league
    ? leagueData.teams.map(team => ({
        teamId: team.id,
        played: 0,
        wins: 0,
        losses: 0,
        mapWin: 0,
        mapLoss: 0,
        diff: 0,
        points: 0
      }))
    : [];

  game.schedule = generateRoundRobin(
    leagueData.teams.map(team => team.id)
  );

  game.marketPlayers = buildMarket();

  renderDashboard();
}

/* =========================
   ROUND ROBIN
========================= */

function generateRoundRobin(teamIds) {
  let ids = [...teamIds];

  if (ids.length % 2 === 1) {
    ids.push(null);
  }

  const n = ids.length;
  const rounds = n - 1;
  const half = n / 2;

  let rotation = [...ids];
  let matches = [];
  let matchId = 1;

  for (let round = 1; round <= rounds; round++) {

    for (let i = 0; i < half; i++) {

      let a = rotation[i];
      let b = rotation[n - 1 - i];

      if (!a || !b) continue;

      let home = a;
      let away = b;

      if (round % 2 === 0) {
        [home, away] = [away, home];
      }

      matches.push({
        id: matchId++,
        matchday: round,
        stage: "regular",
        home,
        away,
        played: false,
        winner: null,
        homeScore: null,
        awayScore: null
      });
    }

    rotation = [
      rotation[0],
      rotation[n - 1],
      ...rotation.slice(1, n - 1)
    ];
  }

  return matches;
}

/* =========================
   DASHBOARD
========================= */

function renderDashboard() {
  document.getElementById("managerDisplay").textContent =
    `Manager ${game.managerName}`;

  document.getElementById("teamDisplay").textContent =
    game.team?.name || "-";

  document.getElementById("budgetDisplay").textContent =
    money(game.budget);

  document.getElementById("reputationDisplay").textContent =
    game.reputation;

  document.getElementById("seasonDisplay").textContent =
    game.year;

  document.getElementById("orgDisplay").textContent =
    game.organizationLevel;

  renderSeasonBanner();
  renderNextMatch();
}

function renderSeasonBanner() {
  const el = document.getElementById("seasonBanner");

  if (game.phase === "regular") {
    const played = game.schedule.filter(m => m.played).length;
    const total = game.schedule.length;

    el.innerHTML =
      `🟢 REGULAR SEASON • ${played}/${total} pertandingan selesai`;
  }

  else if (game.phase === "playoff") {
    el.innerHTML =
      `🔥 PLAYOFF • Perjalanan menuju Grand Final`;
  }

  else if (game.phase === "offseason") {
    el.innerHTML =
      `🌙 OFFSEASON • Musim ${game.year} telah selesai`;
  }
}

function renderNextMatch() {
  const box = document.getElementById("nextMatch");

  if (game.phase === "offseason") {
    box.innerHTML = `
      <div class="champion">
        <div class="trophy">🏆</div>
        <h2>${esc(game.champion || "-")}</h2>
        <p>Champion Season ${game.year}</p>
      </div>
    `;
    return;
  }

  if (game.phase === "playoff") {
    box.innerHTML = `
      <div class="empty">
        🔥 Playoff sedang berlangsung.
        <button class="match-button" onclick="openPlayoff()">LIHAT PLAYOFF</button>
      </div>
    `;
    return;
  }

  const match = getNextUserMatch();

  if (!match) {
    box.innerHTML = `
      <div class="empty">
        Semua pertandingan regular season selesai.
      </div>
    `;
    return;
  }

  const opponent =
    match.home === game.team.id ? match.away : match.home;

  const home = teamName(match.home);
  const away = teamName(match.away);

  box.innerHTML = `
    <div class="next-match">
      <div class="next-team">
        <strong>${esc(home)}</strong>
        <small>HOME</small>
      </div>

      <div class="next-vs">VS</div>

      <div class="next-team">
        <strong>${esc(away)}</strong>
        <small>AWAY</small>
      </div>
    </div>

    <button class="match-button" onclick="openMatch('${match.id}')">
      MATCHDAY ${match.matchday} • MAIN
    </button>
  `;
}

/* =========================
   MATCH SYSTEM
========================= */

function getNextUserMatch() {
  if (!game.team) return null;

  return game.schedule.find(match =>
    !match.played &&
    (
      match.home === game.team.id ||
      match.away === game.team.id
    )
  );
}

function openMatch(matchId) {
  let match = game.schedule.find(m => String(m.id) === String(matchId));

  if (!match) return;

  game.currentMatch = match.id;

  renderMatch();
  showScreen("matchScreen");
}

function renderMatch() {
  const match = game.schedule.find(
    m => m.id === game.currentMatch
  );

  if (!match) return;

  const home = teamName(match.home);
  const away = teamName(match.away);

  const homeRate = teamRating(match.home);
  const awayRate = teamRating(match.away);

  const total = homeRate + awayRate;

  const homeChance =
    Math.round((homeRate / total) * 100);

  const awayChance = 100 - homeChance;

  document.getElementById("matchStage").textContent =
    "REGULAR SEASON";

  document.getElementById("matchTitle").textContent =
    `${home} vs ${away}`;

  document.getElementById("matchdayText").textContent =
    `Matchday ${match.matchday}`;

  document.getElementById("homeTeam").textContent = home;
  document.getElementById("awayTeam").textContent = away;

  document.getElementById("homeRating").textContent =
    `Rating ${homeRate}`;

  document.getElementById("awayRating").textContent =
    `Rating ${awayRate}`;

  document.getElementById("homeChance").textContent =
    `${homeChance}%`;

  document.getElementById("awayChance").textContent =
    `${awayChance}%`;

  renderStartingFive();
}

function renderStartingFive() {
  const box = document.getElementById("startingFive");

  const players = [...(game.team.players || [])]
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 5);

  box.innerHTML = players.map((p, index) => `
    <div class="player">
      <div class="player-main">
        <strong>${index + 1}. ${esc(p.name)}</strong>
        <small>${esc(p.role)} • ${esc(p.nationality)}</small>
      </div>
      <div class="rating">${p.rating}</div>
    </div>
  `).join("");
}

function playMatch() {
  const match = game.schedule.find(
    m => m.id === game.currentMatch
  );

  if (!match || match.played) return;

  const homeRate = teamRating(match.home);
  const awayRate = teamRating(match.away);

  const homePower =
    homeRate + Math.random() * 12;

  const awayPower =
    awayRate + Math.random() * 12;

  let winner;

  if (homePower >= awayPower) {
    winner = match.home;
  } else {
    winner = match.away;
  }

  const score = generateBO3(winner);

  finishMatch(
    match,
    winner,
    score.home,
    score.away
  );

  showResult(
    match,
    winner,
    score.home,
    score.away,
    true
  );
}
function generateBO3(winner) {
  const match = game.schedule.find(
    m => m.id === game.currentMatch
  );

  if (!match) {
    return { home: 2, away: 1 };
  }

  if (winner === match.home) {
    return {
      home: 2,
      away: Math.random() < 0.55 ? 0 : 1
    };
  }

  return {
    home: Math.random() < 0.55 ? 0 : 1,
    away: 2
  };
}


  return winner === game.schedule.find(
    m => m.id === game.currentMatch
  )?.home
    ? { home: 2, away: 1 }
    : { home: 1, away: 2 };
}

function simulateMatch(match) {
  if (!match || match.played) return;

  const homeRate = teamRating(match.home);
  const awayRate = teamRating(match.away);

  const homePower =
    homeRate + Math.random() * 15;

  const awayPower =
    awayRate + Math.random() * 15;

  const winner =
    homePower >= awayPower
      ? match.home
      : match.away;

  let homeScore;
  let awayScore;

  if (winner === match.home) {
    homeScore = 2;
    awayScore = Math.random() < .55 ? 0 : 1;
  } else {
    awayScore = 2;
    homeScore = Math.random() < .55 ? 0 : 1;
  }

  finishMatch(
    match,
    winner,
    homeScore,
    awayScore
  );
}

function finishMatch(
  match,
  winner,
  homeScore,
  awayScore
) {
  if (match.played) return;

  match.played = true;
  match.winner = winner;
  match.homeScore = homeScore;
  match.awayScore = awayScore;

  if (match.stage === "regular") {
    updateStandings(
      match.home,
      match.away,
      homeScore,
      awayScore
    );

    processMorale(match, winner);
  }

  saveGame();
}

function updateStandings(
  homeId,
  awayId,
  homeScore,
  awayScore
) {
  const home = game.standings.find(
    s => s.teamId === homeId
  );

  const away = game.standings.find(
    s => s.teamId === awayId
  );

  if (!home || !away) return;

  home.played++;
  away.played++;

  home.mapWin += homeScore;
  home.mapLoss += awayScore;

  away.mapWin += awayScore;
  away.mapLoss += homeScore;

  home.diff = home.mapWin - home.mapLoss;
  away.diff = away.mapWin - away.mapLoss;

  if (homeScore > awayScore) {
    home.wins++;
    home.points += 3;
    away.losses++;
  } else {
    away.wins++;
    away.points += 3;
    home.losses++;
  }
}

function processMorale(match, winner) {
  const userTeamId = game.team.id;

  if (
    match.home !== userTeamId &&
    match.away !== userTeamId
  ) return;

  const won = winner === userTeamId;

  game.team.players.forEach(player => {
    player.morale = Math.max(
      0,
      Math.min(
        100,
        Number(player.morale ?? 80) +
        (won ? 2 : -2)
      )
    );
  });
}

/* =========================
   RESULT
========================= */

function showResult(
  match,
  winner,
  homeScore,
  awayScore,
  userPlayed
) {
  const userWon =
    winner === game.team.id;

  document.getElementById("resultIcon").textContent =
    userWon ? "🏆" : "💀";

  document.getElementById("resultTitle").textContent =
    userWon ? "VICTORY!" : "DEFEAT";

  document.getElementById("resultTitle").className =
    userWon ? "result-win" : "result-loss";

  document.getElementById("resultStage").textContent =
    match.stage.toUpperCase();

  document.getElementById("resultScore").textContent =
    `${homeScore} - ${awayScore}`;

  document.getElementById("resultMessage").textContent =
    `${teamName(match.home)} vs ${teamName(match.away)}`;

  document.getElementById("resultDetails").innerHTML = `
    <p><strong>${esc(teamName(winner))}</strong> memenangkan pertandingan.</p>
    <p>Matchday: ${match.matchday}</p>
    <p>Reputation: ${userWon ? "+2" : "-1"}</p>
  `;

  game.reputation += userWon ? 2 : -1;
  game.reputation = Math.max(
    0,
    Math.min(100, game.reputation)
  );

  saveGame();

  showScreen("resultScreen");
}

function continueAfterMatch() {
  simulateCurrentMatchday();
  checkRegularSeasonEnd();

  if (game.phase === "playoff") {
    renderDashboard();
    showScreen("dashboardScreen");
    openPlayoff();
    return;
  }

  renderDashboard();
  showScreen("dashboardScreen");
}

/* =========================
   MATCHDAY
========================= */

function simulateCurrentMatchday() {
  const current = game.schedule.find(
    m => m.id === game.currentMatch
  );

  if (!current) return;

  game.schedule
    .filter(m =>
      m.stage === "regular" &&
      m.matchday === current.matchday &&
      !m.played
    )
    .forEach(simulateMatch);
}

function checkRegularSeasonEnd() {
  const remaining = game.schedule.some(
    m => m.stage === "regular" && !m.played
  );

  if (remaining) return;

  startPlayoffs();
}

/* =========================
   STANDINGS
========================= */

function sortedStandings() {
  return [...game.standings].sort((a, b) => {

    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.diff !== a.diff) {
      return b.diff - a.diff;
    }

    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }

    return teamName(a.teamId)
      .localeCompare(teamName(b.teamId));
  });
}

function openStandings() {
  renderStandings();
  showScreen("standingsScreen");
}

function renderStandings() {
  const table =
    document.getElementById("standingsTable");

  const list = sortedStandings();

  document.getElementById("standingsPhase").textContent =
    game.phase === "regular"
      ? "Regular Season"
      : game.phase === "playoff"
        ? "Playoffs"
        : "Season selesai";

  table.innerHTML = list.map((row, index) => {

    const user =
      row.teamId === game.team.id;

    const playoff =
      index < 4 && game.phase === "regular";

    return `
      <tr class="${user ? "user-row" : ""}">
        <td class="${playoff ? "rank-top" : ""}">
          ${index + 1}
        </td>

        <td>
          <strong>${esc(teamName(row.teamId))}</strong>
        </td>

        <td>${row.played}</td>
        <td>${row.wins}</td>
        <td>${row.losses}</td>
        <td>${row.diff > 0 ? "+" : ""}${row.diff}</td>
        <td><strong>${row.points}</strong></td>
      </tr>
    `;
  }).join("");
}

/* =========================
   PLAYOFF
========================= */

function startPlayoffs() {
  const ranking = sortedStandings();

  const top4 = ranking.slice(0, 4);

  game.phase = "playoff";

  game.playoff = {
    semifinal1: {
      id: "sf1",
      stage: "semifinal",
      home: top4[0].teamId,
      away: top4[3].teamId,
      played: false,
      winner: null,
      homeScore: null,
      awayScore: null
    },

    semifinal2: {
      id: "sf2",
      stage: "semifinal",
      home: top4[1].teamId,
      away: top4[2].teamId,
      played: false,
      winner: null,
      homeScore: null,
      awayScore: null
    },

    final: null,

    champion: null
  };

  saveGame();
}

function openPlayoff() {
  renderPlayoff();
  showScreen("playoffScreen");
}

function renderPlayoff() {
  const p = game.playoff;

  if (!p) return;

  const box =
    document.getElementById("playoffBracket");

  document.getElementById("playoffStatus").textContent =
    p.champion
      ? `Champion: ${teamName(p.champion)}`
      : "Top 4 memperebutkan gelar liga.";

  let html = `
    <div class="playoff-card">
      <h3>SEMIFINAL 1</h3>
      ${playoffMatchHTML(p.semifinal1)}
    </div>

    <div class="playoff-card">
      <h3>SEMIFINAL 2</h3>
      ${playoffMatchHTML(p.semifinal2)}
    </div>
  `;

  if (p.final) {
    html += `
      <div class="playoff-card">
        <h3>🏆 GRAND FINAL</h3>
        ${playoffMatchHTML(p.final)}
      </div>
    `;
  }

  if (p.champion) {
    html += `
      <div class="champion">
        <div class="trophy">🏆</div>
        <h2>${esc(teamName(p.champion))}</h2>
        <p>Champion Season ${game.year}</p>
      </div>
    `;
  }

  box.innerHTML = html;
}

function playoffMatchHTML(match) {
  if (!match) return "";

  const userInvolved =
    match.home === game.team.id ||
    match.away === game.team.id;

  let action = "";

  if (!match.played) {

    if (userInvolved) {
      action = `
        <button class="match-button"
          onclick="playPlayoffMatch('${match.id}')">
          PLAY
        </button>
      `;
    } else {
      action = `
        <button class="match-button"
          onclick="simulatePlayoff('${match.id}')">
          SIMULATE
        </button>
      `;
    }
  }

  return `
    <div class="playoff-match">
      <span>${esc(teamName(match.home))}</span>

      <strong>
        ${
          match.played
            ? `${match.homeScore} - ${match.awayScore}`
            : "VS"
        }
      </strong>

      <span>${esc(teamName(match.away))}</span>
    </div>

    ${action}
  `;
}

function getPlayoffMatch(id) {
  const p = game.playoff;

  if (!p) return null;

  if (p.semifinal1.id === id) {
    return p.semifinal1;
  }

  if (p.semifinal2.id === id) {
    return p.semifinal2;
  }

  if (p.final && p.final.id === id) {
    return p.final;
  }

  return null;
}

function playPlayoffMatch(id) {
  const match = getPlayoffMatch(id);

  if (!match || match.played) return;

  const homeRate = teamRating(match.home);
  const awayRate = teamRating(match.away);

  const winner =
    homeRate + Math.random() * 12 >=
    awayRate + Math.random() * 12
      ? match.home
      : match.away;

  let homeScore;
  let awayScore;

  if (winner === match.home) {
    homeScore = 2;
    awayScore = Math.random() < .5 ? 0 : 1;
  } else {
    awayScore = 2;
    homeScore = Math.random() < .5 ? 0 : 1;
  }

  finishPlayoffMatch(
    match,
    winner,
    homeScore,
    awayScore
  );
}

function simulatePlayoff(id) {
  const match = getPlayoffMatch(id);

  if (!match || match.played) return;

  const homeRate = teamRating(match.home);
  const awayRate = teamRating(match.away);

  const winner =
    homeRate + Math.random() * 15 >=
    awayRate + Math.random() * 15
      ? match.home
      : match.away;

  let homeScore;
  let awayScore;

  if (winner === match.home) {
    homeScore = 2;
    awayScore = Math.random() < .5 ? 0 : 1;
  } else {
    awayScore = 2;
    homeScore = Math.random() < .5 ? 0 : 1;
  }

  finishPlayoffMatch(
    match,
    winner,
    homeScore,
    awayScore
  );

  renderPlayoff();
}

function finishPlayoffMatch(
  match,
  winner,
  homeScore,
  awayScore
) {
  match.played = true;
  match.winner = winner;
  match.homeScore = homeScore;
  match.awayScore = awayScore;

  const p = game.playoff;

  if (
    p.semifinal1.played &&
    p.semifinal2.played &&
    !p.final
  ) {
    p.final = {
      id: "final",
      stage: "final",
      home: p.semifinal1.winner,
      away: p.semifinal2.winner,
      played: false,
      winner: null,
      homeScore: null,
      awayScore: null
    };
  }

  if (p.final && p.final.played) {
    finishSeason(p.final.winner);
  }

  saveGame();

  renderPlayoff();
}

/* =========================
   SEASON END
========================= */

function finishSeason(championId) {
  if (game.phase === "offseason") return;

  game.champion = teamName(championId);
  game.phase = "offseason";

  const ranking = sortedStandings();

  const userPosition =
    ranking.findIndex(
      row => row.teamId === game.team.id
    ) + 1;

  const playoffResult =
    championId === game.team.id
      ? "Champion"
      : game.playoff.final &&
        (
          game.playoff.final.home === game.team.id ||
          game.playoff.final.away === game.team.id
        )
        ? "Finalist"
        : ranking
            .slice(0, 4)
            .some(row => row.teamId === game.team.id)
          ? "Semifinalist"
          : "Regular Season";

  game.history.unshift({
    year: game.year,
    teamName: game.team.name,
    champion: game.champion,
    regularPosition: userPosition,
    playoffResult
  });

  let reward = 50000;
  let reputationChange = 1;

  if (playoffResult === "Champion") {
    reward = 250000;
    reputationChange = 15;
  }

  else if (playoffResult === "Finalist") {
    reward = 150000;
    reputationChange = 9;
  }

  else if (playoffResult === "Semifinalist") {
    reward = 100000;
    reputationChange = 5;
  }

  else if (
    game.target === "build"
  ) {
    reward = 75000;
    reputationChange = 3;
  }

  game.budget += reward;
  game.reputation = Math.max(
    0,
    Math.min(100, game.reputation + reputationChange)
  );

  processSeasonDevelopment();
  processContracts();

  saveGame();
  renderDashboard();
}

function processSeasonDevelopment() {

  if (!game.team?.players) return;

  game.team.players.forEach(player => {

    player.age =
      Number(player.age || 18) + 1;

    const rating =
      Number(player.rating || 60);

    const potential =
      Number(player.potential || rating);

    let change = 0;

    if (player.age <= 22) {

      if (rating < potential) {
        change = Math.ceil(
          Math.random() * 3
        );
      }

    } else if (player.age <= 25) {

      if (rating < potential) {
        change = Math.random() < .55 ? 1 : 0;
      }

    } else if (player.age <= 28) {

      change = Math.random() < .45 ? 0 : -1;

    } else {

      change = Math.random() < .65 ? -1 : 0;
    }

    player.rating = Math.max(
      50,
      Math.min(
        99,
        rating + change
      )
    );

    player.morale = Math.max(
      55,
      Math.min(
        100,
        Number(player.morale ?? 80)
      )
    );
  });
}

/* =========================
   CONTRACTS
========================= */

function processContracts() {

  if (!game.team?.players) return;

  game.team.players.forEach(player => {

    player.contractYears =
      Math.max(
        0,
        Number(player.contractYears ?? 2) - 1
      );
  });

  const leaving = [];

  game.team.players =
    game.team.players.filter(player => {

      if (player.contractYears > 0) {
        return true;
      }

      if (
        Number(player.rating) >= 85 &&
        Math.random() < .65
      ) {
        game.requests.push({
          type: "contract",
          playerId: player.id,
          playerName: player.name,
          demand: Math.round(
            Number(player.salary || 50000) * 1.25
          )
        });

        player.contractYears = 1;

        return true;
      }

      if (Math.random() < .55) {
        leaving.push(player.name);
        return false;
      }

      player.contractYears = 1;

      return true;
    });

  if (leaving.length) {
    console.log(
      "Players leaving:",
      leaving
    );
  }
}

/* =========================
   NEW SEASON
========================= */

function advanceSeason() {

  if (game.phase !== "offseason") {
    alert("Musim belum selesai.");
    return;
  }

  game.year++;

  game.team.players.forEach(player => {
    if (player.contractYears <= 0) {
      player.contractYears = 1;
    }
  });

  game.requests = [];

  createSeason();

  saveGame();
  renderDashboard();
  showScreen("dashboardScreen");
}

/* =========================
   ROSTER
========================= */

function openRoster() {
  renderRoster();
  showScreen("rosterScreen");
}

function renderRoster() {
  const players = game.team.players || [];

  document.getElementById("rosterCount").textContent =
    `${players.length} pemain`;

  document.getElementById("rosterList").innerHTML =
    players
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .map(player => `
        <div class="player">

          <div class="player-main">
            <strong>${esc(player.name)}</strong>

            <small>
              ${esc(player.role)}
              • Age ${player.age}
              • ${esc(player.nationality)}
            </small>

            <small>
              Contract:
              ${player.contractYears} tahun
              • Morale ${player.morale}
            </small>
          </div>

          <div>
            <div class="rating">${player.rating}</div>
            <small>
              POT ${player.potential}
            </small>
          </div>

        </div>
      `)
      .join("");
}

/* =========================
   TRANSFER
========================= */

function buildMarket() {

  const players = [];

  leagueData.teams.forEach(team => {

    if (team.id === game.team.id) return;

    (team.players || []).forEach(player => {

      players.push({
        ...clone(player),
        sourceTeam: team.name,
        value: calculatePlayerValue(player),
        marketId:
          `${team.id}_${player.id}`
      });

    });
  });

  return players;
}

function calculatePlayerValue(player) {

  const rating =
    Number(player.rating || 60);

  const potential =
    Number(player.potential || rating);

  const age =
    Number(player.age || 20);

  let value =
    30000 +
    rating * 2500 +
    potential * 1800;

  if (age <= 22) {
    value *= 1.25;
  }

  return Math.round(value);
}

function openTransfer() {
  renderTransfer();
  showScreen("transferScreen");
}

function renderTransfer() {

  document.getElementById("transferBudget").textContent =
    money(game.budget);

  const box =
    document.getElementById("transferList");

  box.innerHTML = game.marketPlayers
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .map(player => `
      <div class="player">

        <div class="player-main">
          <strong>${esc(player.name)}</strong>

          <small>
            ${esc(player.role)}
            • Age ${player.age}
            • Rating ${player.rating}
          </small>

          <small>
            ${esc(player.sourceTeam)}
            • Value ${money(player.value)}
          </small>
        </div>

        <div class="player-actions">
          <button
            onclick="buyPlayer('${player.marketId}')">
            BUY
          </button>
        </div>

      </div>
    `)
    .join("");
}

function buyPlayer(marketId) {

  const player =
    game.marketPlayers.find(
      p => p.marketId === marketId
    );

  if (!player) return;

  if (game.budget < player.value) {
    alert("Budget tidak cukup.");
    return;
  }

  if (game.team.players.length >= 10) {
    alert("Roster maksimal 10 pemain.");
    return;
  }

  if (game.reputation < 25) {
    alert("Reputasi manager terlalu rendah.");
    return;
  }

  game.budget -= player.value;

  game.team.players.push({
    ...clone(player),
    contractYears: 2,
    morale: 80
  });

  game.marketPlayers =
    game.marketPlayers.filter(
      p => p.marketId !== marketId
    );

  saveGame();
  renderTransfer();
  renderRoster();
}

/* =========================
   SCOUTING
========================= */

function openScouting() {
  renderScouting();
  showScreen("scoutingScreen");
}

function renderScouting() {

  const prospects =
    game.marketPlayers
      .filter(p => Number(p.potential) >= 80)
      .slice(0, 20);

  const box =
    document.getElementById("scoutingList");

  if (!prospects.length) {
    box.innerHTML =
      `<div class="empty">Tidak ada prospect ditemukan.</div>`;
    return;
  }

  box.innerHTML = prospects.map(player => `
    <div class="player">

      <div class="player-main">
        <strong>${esc(player.name)}</strong>

        <small>
          ${esc(player.role)}
          • Age ${player.age}
        </small>

        <small>
          Rating ${player.rating}
          • Potential ${player.potential}
        </small>
      </div>

      <div class="rating">
        ${player.potential}
      </div>

    </div>
  `).join("");
}

/* =========================
   SCHEDULE
========================= */

function openSchedule() {
  renderSchedule();
  showScreen("scheduleScreen");
}

function renderSchedule() {

  const box =
    document.getElementById("scheduleList");

  document.getElementById("schedulePhase").textContent =
    game.phase.toUpperCase();

  if (game.phase === "offseason") {
    box.innerHTML =
      `<div class="empty">Season telah selesai.</div>`;
    return;
  }

  let matches = [];

  if (game.phase === "regular") {
    matches = game.schedule;
  }

  box.innerHTML =
    matches.map(match => {

      const isUser =
        match.home === game.team.id ||
        match.away === game.team.id;

      const current =
        !match.played &&
        isUser &&
        getNextUserMatch()?.id === match.id;

      return `
        <div class="
          schedule-item
          ${match.played ? "played" : ""}
          ${current ? "current" : ""}
        ">

          <div class="schedule-teams">
            <strong>
              ${esc(teamName(match.home))}
              vs
              ${esc(teamName(match.away))}
            </strong>

            <small>
              Matchday ${match.matchday}
              ${match.played
                ? `• ${match.homeScore}-${match.awayScore}`
                : ""}
            </small>
          </div>

          ${
            match.played
              ? `<span class="badge">DONE</span>`
              : current
                ? `
                  <button
                    class="match-button"
                    onclick="openMatch('${match.id}')">
                    PLAY
                  </button>
                `
                : `<span class="badge">UPCOMING</span>`
          }

        </div>
      `;
    })
    .join("");
}

/* =========================
   MANAGER
========================= */

function openManager() {
  renderManager();
  showScreen("managerScreen");
}

function renderManager() {

  document.getElementById("managerInfo").textContent =
    `${game.managerName} • ${game.team.name}`;

  document.getElementById("targetSelect").value =
    game.target;

  document.getElementById("managerOrgLevel").textContent =
    game.organizationLevel;

  renderRequests();
}

function changeTarget() {
  game.target =
    document.getElementById("targetSelect").value;

  saveGame();
}

function upgradeOrganization() {

  const cost =
    game.organizationLevel * 100000;

  if (game.budget < cost) {
    alert(
      `Butuh ${money(cost)} untuk upgrade.`
    );
    return;
  }

  game.budget -= cost;
  game.organizationLevel++;

  game.reputation = Math.min(
    100,
    game.reputation + 2
  );

  saveGame();
  renderManager();
  renderDashboard();
}

function renderRequests() {

  const box =
    document.getElementById("requestsList");

  if (!game.requests.length) {
    box.innerHTML =
      `<div class="empty">Tidak ada request.</div>`;
    return;
  }

  box.innerHTML =
    game.requests.map((request, index) => `
      <div class="player">

        <div class="player-main">
          <strong>${esc(request.playerName)}</strong>
          <small>
            Minta salary baru:
            ${money(request.demand)}
          </small>
        </div>

        <div class="player-actions">

          <button
            onclick="acceptRequest(${index})">
            ACCEPT
          </button>

          <button
            class="sell"
            onclick="rejectRequest(${index})">
            REJECT
          </button>

        </div>

      </div>
    `).join("");
}

function acceptRequest(index) {

  const request =
    game.requests[index];

  const player =
    game.team.players.find(
      p => p.id === request.playerId
    );

  if (!player) {
    game.requests.splice(index, 1);
    renderRequests();
    return;
  }

  player.salary =
    request.demand;

  player.contractYears = 2;

  game.requests.splice(index, 1);

  saveGame();
  renderManager();
}

function rejectRequest(index) {

  const request =
    game.requests[index];

  const player =
    game.team.players.find(
      p => p.id === request.playerId
    );

  if (player) {
    player.morale = Math.max(
      30,
      Number(player.morale || 80) - 15
    );
  }

  game.requests.splice(index, 1);

  saveGame();
  renderManager();
}

/* =========================
   HISTORY
========================= */

function openHistory() {
  renderHistory();
  showScreen("historyScreen");
}

function renderHistory() {

  const box =
    document.getElementById("historyList");

  if (!game.history.length) {
    box.innerHTML =
      `<div class="empty">Belum ada history musim.</div>`;
    return;
  }

  box.innerHTML =
    game.history.map(history => `
      <div class="history-card">
        <strong>Season ${history.year}</strong>

        <span>
          Team:
          ${esc(history.teamName)}
        </span>

        <span>
          Regular Season:
          #${history.regularPosition}
        </span>

        <span>
          Result:
          ${esc(history.playoffResult)}
        </span>

        <span>
          Champion:
          ${esc(history.champion)}
        </span>
      </div>
    `).join("");
}

/* =========================
   NAVIGATION
========================= */

function backDashboard() {
  renderDashboard();
  showScreen("dashboardScreen");
}

/* =========================
   SAVE / LOAD
========================= */

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function saveGame() {

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(game)
  );
}

function loadGame() {

  const raw =
    localStorage.getItem(SAVE_KEY);

  if (!raw) return false;

  try {

    const saved =
      JSON.parse(raw);

    game = {
      ...game,
      ...saved
    };

    if (game.league?.id) {
      leagueData =
        getLeagueData(game.league.id);
    }

    return true;

  } catch (error) {

    console.error(
      "Save rusak:",
      error
    );

    return false;
  }
}

function restartGame() {

  const yes =
    confirm(
      "Yakin restart career? Semua progress akan hilang."
    );

  if (!yes) return;

  localStorage.removeItem(SAVE_KEY);

  location.reload();
}

/* =========================
   INITIALIZE
========================= */

function init() {

  const loaded =
    loadGame();

  renderCountries();

  if (
    loaded &&
    game.careerStarted &&
    game.team &&
    game.league
  ) {

    leagueData =
      getLeagueData(game.league.id);

    renderDashboard();
    showScreen("dashboardScreen");

  } else {

    showScreen("countryScreen");
  }
}

init();
