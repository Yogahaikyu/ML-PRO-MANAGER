/* =========================================================
   MLBB PRO MANAGER V1.5
   PLAYER + LINEUP + TRANSFER + MATCH + SEASON
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const SAVE_KEY = "mlbb_pro_manager_save_v15";

const ROLE_ORDER = [
  "EXP",
  "JG",
  "MID",
  "GOLD",
  "ROAM"
];

let game = null;

let selectedCountry = null;
let selectedLeagueId = null;
let selectedTeamId = null;
let selectedTarget = "top3";

let currentMatch = null;
let currentPlayerId = null;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function uid(prefix = "id") {
  return prefix + "_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(percent) {
  return Math.random() * 100 < percent;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function money(value) {

  value = Number(value || 0);

  if (value >= 1000000000) {
    return "Rp " + (value / 1000000000).toFixed(1) + " M";
  }

  if (value >= 1000000) {
    return "Rp " + (value / 1000000).toFixed(1) + " Jt";
  }

  if (value >= 1000) {
    return "Rp " + Math.round(value / 1000) + " K";
  }

  return "Rp " + value.toLocaleString("id-ID");
}

function formatDate(date) {

  const d = new Date(date + "T12:00:00");

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

}

function addDays(date, days) {

  const d = new Date(date + "T12:00:00");

  d.setDate(d.getDate() + days);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");

}

function normalizeRole(role) {

  role = String(role || "").toUpperCase();

  if (role === "JUNGLE") return "JG";
  if (role === "JUNG") return "JG";
  if (role === "MIDLANE") return "MID";
  if (role === "GOLDLANE") return "GOLD";
  if (role === "ROAMER") return "ROAM";

  return ROLE_ORDER.includes(role) ? role : "EXP";
}

function escapeHtml(text) {

  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   LEAGUE DATABASE
   ========================================================= */

function getAllLeagues() {

  return [
    typeof MPL_ID_2026 !== "undefined" ? MPL_ID_2026 : null,
    typeof MPL_PH_2026 !== "undefined" ? MPL_PH_2026 : null,
    typeof MPL_KH_2026 !== "undefined" ? MPL_KH_2026 : null
  ].filter(Boolean);

}

function getLeague(id) {

  return getAllLeagues().find(x => x.id === id);

}


/* =========================================================
   PLAYER
   ========================================================= */

function createPlayer(data = {}) {

  const rating = Number(data.rating || rand(70, 84));

  return {

    id: data.id || uid("player"),

    globalId: data.globalId || uid("global"),

    name: data.name || "Unknown Player",

    role: normalizeRole(data.role),

    nationality: data.nationality || "ID",

    age: Number(data.age || rand(18, 25)),

    rating,

    potential: Number(
      data.potential || clamp(rating + rand(3, 10), rating, 99)
    ),

    salary: Number(
      data.salary || rating * 100000
    ),

    marketValue: Number(
      data.marketValue || rating * rating * 10000
    ),

    contractUntil:
      data.contractUntil ||
      String((game?.year || 2026) + 2),

    morale: Number(data.morale ?? 75),

    form: Number(data.form ?? 75),

    fitness: Number(data.fitness ?? 95),

    fatigue: Number(data.fatigue ?? 5),

    stats: {

      matches: Number(data.stats?.matches || 0),

      wins: Number(data.stats?.wins || 0),

      losses: Number(data.stats?.losses || 0),

      kills: Number(data.stats?.kills || 0),

      deaths: Number(data.stats?.deaths || 0),

      assists: Number(data.stats?.assists || 0),

      mvp: Number(data.stats?.mvp || 0)

    },

    injury: data.injury || null,

    status: data.status || "active"

  };

}


/* =========================================================
   TEAM
   ========================================================= */

function createTeam(source) {

  const team = clone(source);

  team.players = (team.players || []).map(p =>
    createPlayer({
      ...p,
      salary: p.salary || Number(p.rating) * 100000,
      marketValue:
        p.marketValue ||
        Number(p.rating) * Number(p.rating) * 10000
    })
  );

  team.players.forEach((p, index) => {

    p.id = uid(team.id + "_p");

    p.globalId = team.id + "_" + index + "_" + p.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  });

  team.budget = 500000000;

  team.chemistry = 75;

  team.manager = {
    name: "AI Manager",
    reputation: rand(60, 80)
  };

  team.sponsor = {
    name: "Main Sponsor",
    income: rand(50000000, 100000000)
  };

  team.standings = {
    played: 0,
    wins: 0,
    losses: 0,
    points: 0,
    gameWins: 0,
    gameLosses: 0
  };

  team.seasonStats = {
    matches: 0,
    wins: 0,
    losses: 0
  };

  return team;

}


/* =========================================================
   GAME CREATION
   ========================================================= */

function createGame() {

  return {

    version: "1.5",

    year: 2026,

    date: "2026-01-01",

    phase: "regular",

    target: selectedTarget,

    countryId: selectedCountry?.id || "ID",

    leagueId: selectedLeagueId,

    teamId: selectedTeamId,

    team: null,

    teams: [],

    budget: 0,

    reputation: 50,

    organizationLevel: 1,

    chemistry: 75,

    schedule: [],

    currentMatch: null,

    freeAgents: [],

    transferOffers: [],

    inbox: [],

    news: [],

    history: [],

    awards: [],

    rivals: [],

    worldRanking: [],

    tournaments: [],

    seasonStats: {

      matches: 0,

      wins: 0,

      losses: 0

    }

  };

}


/* =========================================================
   TEAM LOOKUPS
   ========================================================= */

function getUserTeam() {

  if (!game) return null;

  return game.teams.find(t => t.id === game.teamId) || game.team;

}

function getTeam(id) {

  if (!game) return null;

  return game.teams.find(t => t.id === id) || null;

}

function getPlayer(team, id) {

  if (!team) return null;

  return team.players.find(p =>
    p.id === id ||
    p.globalId === id
  );

}

function syncUserTeam() {

  if (!game) return;

  const team = getUserTeam();

  if (team) {

    game.team = team;
    game.budget = team.budget;

  }

}


/* =========================================================
   LINEUP
   ========================================================= */

function playerLineupScore(player) {

  if (!player) return 0;

  return (

    player.rating * 0.55 +

    player.form * 0.15 +

    player.fitness * 0.15 +

    player.morale * 0.10 +

    (100 - player.fatigue) * 0.05

  );

}


function chooseBestLineup(team) {

  if (!team) return [];

  const available = team.players.filter(p =>
    p.status !== "injured" &&
    !p.injury
  );

  const selected = [];

  for (const role of ROLE_ORDER) {

    const candidates = available
      .filter(p =>
        normalizeRole(p.role) === role &&
        !selected.includes(p)
      )
      .sort(
        (a, b) =>
          playerLineupScore(b) -
          playerLineupScore(a)
      );

    if (candidates[0]) {
      selected.push(candidates[0]);
    }

  }

  // fallback kalau role tertentu kosong
  if (selected.length < 5) {

    const remaining = available
      .filter(p => !selected.includes(p))
      .sort(
        (a, b) =>
          playerLineupScore(b) -
          playerLineupScore(a)
      );

    while (
      selected.length < 5 &&
      remaining.length
    ) {

      selected.push(remaining.shift());

    }

  }

  return selected.slice(0, 5);

}


function getStartingPlayers(team) {

  if (!team) return [];

  let lineup = [];

  if (
    Array.isArray(team.lineup) &&
    team.lineup.length
  ) {

    lineup = team.lineup
      .map(id => getPlayer(team, id))
      .filter(Boolean)
      .filter(p => p.status !== "injured");

  }

  if (lineup.length < 5) {

    lineup = chooseBestLineup(team);

  }

  return lineup.slice(0, 5);

}


function autoLineup() {

  const team = getUserTeam();

  if (!team) return;

  const lineup = chooseBestLineup(team);

  team.lineup = lineup.map(p => p.id);

  team.chemistry = clamp(
    Number(team.chemistry || 70) + 3,
    0,
    100
  );

  addNews(
    "? Lineup",
    "Best lineup otomatis telah dipilih."
  );

  saveGame();

  renderRoster("starting");

}


/* =========================================================
   TEAM POWER
   ========================================================= */

function teamPower(team) {

  if (!team) return 0;

  const lineup = getStartingPlayers(team);

  if (!lineup.length) return 50;

  const avg =
    lineup.reduce(
      (sum, p) => sum + playerLineupScore(p),
      0
    ) / lineup.length;

  const chemistry =
    Number(team.chemistry || 70);

  const manager =
    Number(team.manager?.reputation || 60);

  return (

    avg * 0.72 +

    chemistry * 0.15 +

    manager * 0.08 +

    randFloat(-2, 2)

  );

}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}


/* =========================================================
   WORLD RANKING
   ========================================================= */

function updateWorldRanking() {

  if (!game) return;

  const ranking = game.teams.map(team => {

    const points =
      teamPower(team) * 10 +
      (team.standings?.points || 0) * 5 +
      rand(0, 80);

    return {

      teamId: team.id,

      teamName: team.name,

      region: game.leagueId,

      power: Math.round(teamPower(team)),

      points: Math.round(points)

    };

  });

  ranking.sort(
    (a, b) => b.points - a.points
  );

  ranking.forEach((r, index) => {
    r.rank = index + 1;
  });

  game.worldRanking = ranking;

}


/* =========================================================
   RIVALRY
   ========================================================= */

function initRivals() {

  const user = getUserTeam();

  if (!user) return;

  game.rivals = game.teams
    .filter(t => t.id !== user.id)
    .sort(
      (a, b) =>
        teamPower(b) - teamPower(a)
    )
    .slice(0, 3)
    .map(t => ({

      teamId: t.id,

      intensity: rand(50, 85)

    }));

}


/* =========================================================
   FREE AGENTS
   ========================================================= */

function generateFreeAgent() {

  const roles = ROLE_ORDER;

  const role =
    roles[rand(0, roles.length - 1)];

  const rating = rand(70, 86);

  return createPlayer({

    name:
      [
        "Raven",
        "Shadow",
        "Nova",
        "Blaze",
        "Zero",
        "Storm",
        "Viper",
        "Ace",
        "Ghost",
        "Frost"
      ][rand(0, 9)] +
      " " +
      rand(10, 99),

    role,

    rating,

    potential: clamp(
      rating + rand(3, 12),
      rating,
      99
    ),

    nationality: game?.countryId || "ID",

    age: rand(18, 24),

    salary: rating * 90000,

    marketValue:
      rating * rating * 8000,

    contractUntil:
      String((game?.year || 2026) + 1)

  });

}


function initFreeAgents() {

  game.freeAgents = [];

  for (let i = 0; i < 15; i++) {

    game.freeAgents.push(
      generateFreeAgent()
    );

  }

}


/* =========================================================
   SCHEDULE
   ========================================================= */

function createSeasonSchedule() {

  const teams = game.teams;

  const matches = [];

  let date = "2026-02-01";

  let round = 1;

  // double round robin
  for (let i = 0; i < teams.length; i++) {

    for (let j = i + 1; j < teams.length; j++) {

      const home = teams[i];
      const away = teams[j];

      matches.push({

        id: uid("match"),

        date,

        round,

        type: "regular",

        bestOf: 3,

        homeId: home.id,

        awayId: away.id,

        played: false,

        result: null

      });

      date = addDays(date, 2);

      matches.push({

        id: uid("match"),

        date,

        round: round + 100,

        type: "regular",

        bestOf: 3,

        homeId: away.id,

        awayId: home.id,

        played: false,

        result: null

      });

      date = addDays(date, 2);

      round++;

    }

  }

  matches.sort(
    (a, b) =>
      a.date.localeCompare(b.date)
  );

  game.schedule = matches;

}


/* =========================================================
   STANDINGS
   ========================================================= */

function resetStandings() {

  game.teams.forEach(team => {

    team.standings = {

      played: 0,

      wins: 0,

      losses: 0,

      points: 0,

      gameWins: 0,

      gameLosses: 0

    };

  });

}


function updateStandings(
  winner,
  loser,
  winnerGames,
  loserGames
) {

  winner.standings.played++;
  loser.standings.played++;

  winner.standings.wins++;
  loser.standings.losses++;

  winner.standings.points += 3;

  winner.standings.gameWins += winnerGames;
  winner.standings.gameLosses += loserGames;

  loser.standings.gameWins += loserGames;
  loser.standings.gameLosses += winnerGames;

}


/* =========================================================
   MATCH ENGINE
   ========================================================= */

function calculateWinChance(teamA, teamB) {

  const powerA = teamPower(teamA);
  const powerB = teamPower(teamB);

  const diff = powerA - powerB;

  return clamp(
    50 + diff * 1.4,
    12,
    88
  );

}


function simulateSeries(
  teamA,
  teamB,
  bestOf = 3
) {

  const needed = Math.ceil(bestOf / 2);

  let a = 0;
  let b = 0;

  while (a < needed && b < needed) {

    const chanceA =
      calculateWinChance(teamA, teamB);

    if (chance(chanceA)) {
      a++;
    } else {
      b++;
    }

  }

  return {

    winner:
      a > b ? teamA.id : teamB.id,

    loser:
      a > b ? teamB.id : teamA.id,

    scoreA: a,

    scoreB: b

  };

}


/* =========================================================
   PLAYER MATCH STATS
   ========================================================= */

function updatePlayerStats(
  team,
  won,
  seriesScore
) {

  const lineup =
    getStartingPlayers(team);

  lineup.forEach(player => {

    player.stats.matches++;

    if (won) {
      player.stats.wins++;
    } else {
      player.stats.losses++;
    }

    const kills =
      rand(
        Math.max(1, Math.round(player.rating / 15)),
        Math.max(3, Math.round(player.rating / 7))
      );

    const deaths = rand(0, 6);

    const assists =
      rand(3, 15);

    player.stats.kills += kills;

    player.stats.deaths += deaths;

    player.stats.assists += assists;

    player.fatigue = clamp(
      player.fatigue + rand(8, 18),
      0,
      100
    );

    player.fitness = clamp(
      player.fitness - rand(5, 12),
      0,
      100
    );

    if (won) {

      player.form = clamp(
        player.form + rand(1, 5),
        0,
        100
      );

      player.morale = clamp(
        player.morale + rand(2, 5),
        0,
        100
      );

    } else {

      player.form = clamp(
        player.form - rand(1, 4),
        0,
        100
      );

      player.morale = clamp(
        player.morale - rand(1, 4),
        0,
        100
      );

    }

    // injury
    if (
      chance(4) &&
      !player.injury
    ) {

      const major = chance(15);

      player.injury = {

        type:
          major
            ? "Major Injury"
            : "Minor Injury",

        days:
          major
            ? rand(10, 30)
            : rand(2, 7)

      };

      player.status = "injured";

    }

  });

}


/* =========================================================
   MVP
   ========================================================= */

function calculateMVP(team) {

  const lineup =
    getStartingPlayers(team);

  if (!lineup.length) return null;

  const sorted = [...lineup].sort(
    (a, b) =>
      (
        playerLineupScore(b) +
        b.stats.assists * 0.1
      ) -
      (
        playerLineupScore(a) +
        a.stats.assists * 0.1
      )
  );

  const mvp = sorted[0];

  if (mvp) {
    mvp.stats.mvp++;
  }

  return mvp;

}


/* =========================================================
   MATCH SIMULATION
   ========================================================= */

function simulateMatch(match) {

  const home =
    getTeam(match.homeId);

  const away =
    getTeam(match.awayId);

  if (!home || !away) return null;

  const result =
    simulateSeries(
      home,
      away,
      match.bestOf
    );

  const winner =
    getTeam(result.winner);

  const loser =
    getTeam(result.loser);

  updateStandings(
    winner,
    loser,
    result.winner === home.id
      ? result.scoreA
      : result.scoreB,
    result.winner === home.id
      ? result.scoreB
      : result.scoreA
  );

  updatePlayerStats(
    home,
    winner.id === home.id,
    result
  );

  updatePlayerStats(
    away,
    winner.id === away.id,
    result
  );

  const mvp =
    calculateMVP(winner);

  match.played = true;

  match.result = {

    winnerId: winner.id,

    loserId: loser.id,

    homeScore: result.scoreA,

    awayScore: result.scoreB,

    mvpId: mvp?.id || null

  };

  home.seasonStats.matches++;
  away.seasonStats.matches++;

  if (winner.id === home.id) {
    home.seasonStats.wins++;
    away.seasonStats.losses++;
  } else {
    away.seasonStats.wins++;
    home.seasonStats.losses++;
  }

  return match.result;

}


/* =========================================================
   AI MATCHES
   ========================================================= */

function simulateAIMatches() {

  if (!game) return;

  const userId = game.teamId;

  game.schedule
    .filter(m =>
      !m.played &&
      m.type === "regular" &&
      m.date <= game.date &&
      m.homeId !== userId &&
      m.awayId !== userId
    )
    .forEach(match => {

      simulateMatch(match);

    });

}


/* =========================================================
   PLAY NEXT MATCH
   ========================================================= */

function findNextUserMatch() {

  if (!game) return null;

  return game.schedule.find(m =>
    !m.played &&
    (
      m.homeId === game.teamId ||
      m.awayId === game.teamId
    )
  ) || null;

}


function ensureMatchDay() {

  const match =
    findNextUserMatch();

  if (!match) return;

  game.date = match.date;

  simulateAIMatches();

}


/* =========================================================
   PLAY MATCH SCREEN
   ========================================================= */

function openMatch(match) {

  const home =
    getTeam(match.homeId);

  const away =
    getTeam(match.awayId);

  if (!home || !away) return;

  currentMatch = match;

  document.getElementById(
    "matchLeague"
  ).textContent =
    match.type === "regular"
      ? "REGULAR SEASON"
      : "PLAYOFF";

  document.getElementById(
    "matchDate"
  ).textContent =
    formatDate(match.date);

  document.getElementById(
    "homeTeamName"
  ).textContent =
    home.name;

  document.getElementById(
    "awayTeamName"
  ).textContent =
    away.name;

  document.getElementById(
    "matchSeries"
  ).textContent =
    "BO" + match.bestOf;

  renderMatchLineup();

  showScreen("matchScreen");

}


function renderMatchLineup() {

  const container =
    document.getElementById(
      "matchLineup"
    );

  if (!currentMatch) return;

  const user =
    getUserTeam();

  if (!user) return;

  const lineup =
    getStartingPlayers(user);

  container.innerHTML = `

    <div class="panel">

      <h3>? Starting Lineup</h3>

      ${lineup.map(p => `

        <div class="lineup-slot">

          <strong>${escapeHtml(p.name)}</strong>

          <span class="role">
            ${p.role}
          </span>

          <span style="float:right">
            ${Math.round(p.rating)}
          </span>

        </div>

      `).join("")}

      <p class="muted">
        Team Power:
        ${Math.round(teamPower(user))}
      </p>

    </div>

  `;

}


/* =========================================================
   SIMULATE CURRENT MATCH
   ========================================================= */

function simulateCurrentMatch() {

  if (!currentMatch) return;

  const result =
    simulateMatch(currentMatch);

  if (!result) return;

  const home =
    getTeam(currentMatch.homeId);

  const away =
    getTeam(currentMatch.awayId);

  const winner =
    getTeam(result.winnerId);

  const mvp =
    winner.players.find(
      p => p.id === result.mvpId
    );

  document.getElementById(
    "resultIcon"
  ).textContent =
    winner.id === game.teamId
      ? "?"
      : "?";

  document.getElementById(
    "resultTitle"
  ).textContent =
    winner.id === game.teamId
      ? "VICTORY"
      : "DEFEAT";

  document.getElementById(
    "resultScore"
  ).textContent =
    `${result.homeScore} - ${result.awayScore}`;

  document.getElementById(
    "resultText"
  ).textContent =
    `${home.name} vs ${away.name}`;

  document.getElementById(
    "resultMvp"
  ).innerHTML = mvp
    ? `
      <div class="mvp-card">
        ? MVP<br>
        <strong>${escapeHtml(mvp.name)}</strong>
        <br>
        Rating ${Math.round(mvp.rating)}
      </div>
    `
    : "";

  currentMatch = null;

  game.currentMatch = null;

  updateWorldRanking();

  addNews(
    winner.id === game.teamId
      ? "? Victory"
      : "? Defeat",
    `${winner.name} memenangkan pertandingan.`
  );

  saveGame();

  showScreen("resultScreen");

}


/* =========================================================
   AFTER MATCH
   ========================================================= */

function afterMatch() {

  currentMatch = null;

  game.currentMatch = null;

  const next =
    findNextUserMatch();

  if (next) {

    game.date = next.date;

    simulateAIMatches();

  }

  renderDashboard();

  saveGame();

  showDashboard();

}


/* =========================================================
   ADVANCE DAY
   ========================================================= */

function advanceDay() {

  if (!game) return;

  const next =
    findNextUserMatch();

  if (!next) {

    finishSeason();

    return;

  }

  game.date = addDays(
    game.date,
    1
  );

  recoverPlayers();

  updatePlayerForm();

  processDailyFinance();

  simulateAIMatches();

  aiManagement();

  const match =
    game.schedule.find(m =>
      !m.played &&
      m.date === game.date &&
      (
        m.homeId === game.teamId ||
        m.awayId === game.teamId
      )
    );

  if (match) {

    currentMatch = match;

    game.currentMatch = match;

    openMatch(match);

    saveGame();

    return;

  }

  if (regularSeasonFinished()) {

    createPlayoffs();

  }

  renderDashboard();

  saveGame();

}


/* =========================================================
   PLAYER RECOVERY
   ========================================================= */

function recoverPlayers() {

  game.teams.forEach(team => {

    team.players.forEach(player => {

      player.fatigue =
        clamp(
          player.fatigue - rand(3, 8),
          0,
          100
        );

      player.fitness =
        clamp(
          player.fitness + rand(2, 6),
          0,
          100
        );

      if (player.injury) {

        player.injury.days--;

        if (player.injury.days <= 0) {

          player.injury = null;

          player.status = "active";

          player.morale =
            clamp(
              player.morale + 5,
              0,
              100
            );

        }

      }

    });

  });

}


function updatePlayerForm() {

  game.teams.forEach(team => {

    team.players.forEach(player => {

      if (chance(20)) {

        player.form =
          clamp(
            player.form + rand(-2, 2),
            0,
            100
          );

      }

    });

  });

}


/* =========================================================
   FINANCE
   ========================================================= */

function processDailyFinance() {

  if (!game) return;

  const date =
    new Date(game.date + "T12:00:00");

  if (date.getDate() !== 1) return;

  game.teams.forEach(team => {

    const payroll =
      team.players.reduce(
        (sum, p) =>
          sum + Number(p.salary || 0),
        0
      );

    team.budget -= payroll;

    team.budget +=
      Number(team.sponsor?.income || 0);

  });

  syncUserTeam();

  addNews(
    "? Finance",
    "Payroll dan pemasukan sponsor telah diproses."
  );

}


/* =========================================================
   AI MANAGEMENT
   ========================================================= */

function aiManagement() {

  if (!game) return;

  game.teams
    .filter(t => t.id !== game.teamId)
    .forEach(team => {

      const lineup =
        chooseBestLineup(team);

      team.lineup =
        lineup.map(p => p.id);

      // sign free agent kalau role kurang
      for (const role of ROLE_ORDER) {

        const hasRole =
          team.players.some(
            p =>
              normalizeRole(p.role) === role
          );

        if (!hasRole && game.freeAgents.length) {

          const candidate =
            game.freeAgents
              .filter(
                p =>
                  normalizeRole(p.role) === role
              )
              .sort(
                (a, b) =>
                  b.rating - a.rating
              )[0];

          if (candidate) {

            team.players.push(candidate);

            game.freeAgents =
              game.freeAgents.filter(
                p => p.id !== candidate.id
              );

          }

        }

      }

      // release pemain terlemah kalau roster terlalu besar
      if (team.players.length > 9) {

        const weakest =
          [...team.players]
            .sort(
              (a, b) =>
                a.rating - b.rating
            )[0];

        team.players =
          team.players.filter(
            p => p.id !== weakest.id
          );

        game.freeAgents.push(
          weakest
        );

      }

    });

}


/* =========================================================
   TRANSFER VALUE
   ========================================================= */

function calculateTransferValue(player) {

  const ageFactor =
    player.age <= 23
      ? 1.25
      : player.age <= 27
        ? 1
        : 0.8;

  const potentialFactor =
    1 +
    (player.potential - player.rating)
    / 100;

  return Math.round(
    player.rating *
    player.rating *
    10000 *
    ageFactor *
    potentialFactor
  );

}


/* =========================================================
   TRANSFER MARKET
   ========================================================= */

function getTransferPlayers() {

  const result = [];

  game.teams.forEach(team => {

    if (team.id === game.teamId) return;

    team.players.forEach(player => {

      result.push({

        player,

        team

      });

    });

  });

  return result.sort(
    (a, b) =>
      b.player.rating -
      a.player.rating
  );

}


function makeTransferOffer(
  sellingTeam,
  player
) {

  const value =
    calculateTransferValue(player);

  const offer =
    Math.round(value * 1.05);

  if (game.budget < offer) {

    alert(
      "Budget tidak cukup.\n" +
      "Harga: " +
      money(offer)
    );

    return;

  }

  const accept =
    chance(70);

  if (accept) {

    completeTransfer(
      sellingTeam,
      player,
      offer
    );

  } else {

    const counter =
      Math.round(
        value *
        randFloat(1.1, 1.35)
      );

    const yes =
      confirm(
        `Offer ditolak.\n\n` +
        `Counter offer:\n${money(counter)}\n\n` +
        `Terima?`
      );

    if (yes) {

      if (game.budget < counter) {

        alert("Budget tidak cukup.");

        return;

      }

      completeTransfer(
        sellingTeam,
        player,
        counter
      );

    }

  }

}


function completeTransfer(
  sellingTeam,
  player,
  price
) {

  const user =
    getUserTeam();

  if (!user) return;

  if (user.players.length >= 12) {

    alert(
      "Roster terlalu penuh. Maksimal 12 pemain."
    );

    return;

  }

  const index =
    sellingTeam.players.findIndex(
      p => p.id === player.id
    );

  if (index === -1) return;

  sellingTeam.players.splice(
    index,
    1
  );

  user.players.push(player);

  user.budget -= price;

  player.status = "active";

  player.morale =
    clamp(
      player.morale + 5,
      0,
      100
    );

  game.budget =
    user.budget;

  addNews(
    "? Transfer Completed",
    `${player.name} bergabung dengan ${user.name}.`
  );

  saveGame();

  renderTransfer();

  alert(
    `${player.name} berhasil direkrut!`
  );

}


/* =========================================================
   FREE AGENT SIGNING
   ========================================================= */

function signFreeAgent(playerId) {

  const user =
    getUserTeam();

  const player =
    game.freeAgents.find(
      p => p.id === playerId
    );

  if (!user || !player) return;

  if (user.players.length >= 12) {

    alert("Roster sudah maksimal.");

    return;

  }

  const signingFee =
    Math.round(
      calculateTransferValue(player) * 0.08
    );

  if (user.budget < signingFee) {

    alert("Budget tidak cukup.");

    return;

  }

  user.budget -= signingFee;

  user.players.push(player);

  game.freeAgents =
    game.freeAgents.filter(
      p => p.id !== player.id
    );

  game.budget =
    user.budget;

  addNews(
    "? Free Agent",
    `${player.name} bergabung secara gratis transfer.`
  );

  saveGame();

  renderScouting();

}


/* =========================================================
   CONTRACT
   ========================================================= */

function renewContract(playerId) {

  const user =
    getUserTeam();

  const player =
    getPlayer(
      user,
      playerId
    );

  if (!player) return;

  const increase =
    Math.round(
      player.salary * 0.15
    );

  player.salary += increase;

  player.contractUntil =
    String(game.year + 2);

  addNews(
    "? Contract",
    `${player.name} memperpanjang kontrak.`
  );

  saveGame();

  renderRoster();

}


/* =========================================================
   RELEASE PLAYER
   ========================================================= */

function releasePlayer(playerId) {

  const user =
    getUserTeam();

  if (!user) return;

  if (user.players.length <= 7) {

    alert(
      "Minimal roster adalah 7 pemain."
    );

    return;

  }

  const player =
    getPlayer(
      user,
      playerId
    );

  if (!player) return;

  const confirmRelease =
    confirm(
      `Lepaskan ${player.name}?`
    );

  if (!confirmRelease) return;

  user.players =
    user.players.filter(
      p => p.id !== player.id
    );

  player.status = "free";

  game.freeAgents.push(player);

  addNews(
    "? Release",
    `${player.name} dilepas dari roster.`
  );

  saveGame();

  renderRoster();

}


/* =========================================================
   DEVELOPMENT
   ========================================================= */

function developPlayer(player) {

  if (!player) return;

  const potentialGap =
    player.potential -
    player.rating;

  if (potentialGap <= 0) return;

  const chanceDevelop =
    clamp(
      35 +
      potentialGap * 3 -
      Math.max(0, player.age - 24) * 5,
      5,
      85
    );

  if (
    chance(chanceDevelop)
  ) {

    player.rating =
      clamp(
        player.rating + rand(1, 2),
        1,
        player.potential
      );

  }

}


function developAllPlayers() {

  game.teams.forEach(team => {

    team.players.forEach(
      developPlayer
    );

  });

}


/* =========================================================
   PLAYOFF
   ========================================================= */

function regularSeasonFinished() {

  if (!game.schedule.length)
    return false;

  return game.schedule
    .filter(m =>
      m.type === "regular"
    )
    .every(m => m.played);

}


function getStandings() {

  return [...game.teams].sort(
    (a, b) => {

      const A = a.standings;
      const B = b.standings;

      if (B.points !== A.points) {
        return B.points - A.points;
      }

      const gdA =
        A.gameWins -
        A.gameLosses;

      const gdB =
        B.gameWins -
        B.gameLosses;

      return gdB - gdA;

    }
  );

}


function createPlayoffs() {

  if (game.phase === "playoffs")
    return;

  const standings =
    getStandings();

  const top =
    standings.slice(0, 4);

  if (top.length < 4) {

    finishSeason();

    return;

  }

  game.phase = "playoffs";

  const start =
    addDays(game.date, 3);

  game.schedule.push({

    id: uid("playoff"),

    date: start,

    round: 1,

    type: "playoff",

    stage: "semifinal",

    bestOf: 5,

    homeId: top[0].id,

    awayId: top[3].id,

    played: false,

    result: null

  });

  game.schedule.push({

    id: uid("playoff"),

    date: addDays(start, 1),

    round: 2,

    type: "playoff",

    stage: "semifinal",

    bestOf: 5,

    homeId: top[1].id,

    awayId: top[2].id,

    played: false,

    result: null

  });

  addNews(
    "? Playoffs",
    "Regular season selesai. Playoffs dimulai!"
  );

}


/* =========================================================
   PLAYOFF PROCESSING
   ========================================================= */

function processPlayoffs() {

  if (game.phase !== "playoffs")
    return;

  const semis =
    game.schedule.filter(
      m =>
        m.type === "playoff" &&
        m.stage === "semifinal" &&
        m.played
    );

  if (
    semis.length === 2 &&
    !game.schedule.some(
      m => m.stage === "grand_final"
    )
  ) {

    const winners =
      semis.map(
        m =>
          getTeam(
            m.result.winnerId
          )
      );

    game.schedule.push({

      id: uid("final"),

      date: addDays(game.date, 2),

      round: 10,

      type: "playoff",

      stage: "grand_final",

      bestOf: 7,

      homeId: winners[0].id,

      awayId: winners[1].id,

      played: false,

      result: null

    });

    return;

  }

  const final =
    game.schedule.find(
      m =>
        m.stage === "grand_final" &&
        m.played
    );

  if (final) {

    finishSeason();

  }

}


/* =========================================================
   SEASON FINISH
   ========================================================= */

function evaluateTarget() {

  const standings =
    getStandings();

  const position =
    standings.findIndex(
      t => t.id === game.teamId
    ) + 1;

  let success = false;

  if (game.target === "champion") {
    success = position === 1;
  }

  if (game.target === "top3") {
    success = position <= 3;
  }

  if (game.target === "top5") {
    success = position <= 5;
  }

  if (game.target === "survive") {
    success = position <= standings.length;
  }

  return {
    position,
    success
  };

}


function processEndSeasonContracts() {

  game.teams.forEach(team => {

    const expired = [];

    team.players.forEach(player => {

      const year =
        Number(player.contractUntil);

      if (
        Number.isFinite(year) &&
        year <= game.year
      ) {

        if (
          player.rating < 78 &&
          team.id !== game.teamId
        ) {

          expired.push(player);

        } else {

          player.contractUntil =
            String(game.year + 1);

        }

      }

    });

    expired.forEach(player => {

      team.players =
        team.players.filter(
          p => p.id !== player.id
        );

      player.status = "free";

      game.freeAgents.push(player);

    });

  });

}


function finishSeason() {

  if (!game) return;

  if (
    game.phase === "finished"
  ) return;

  const evaluation =
    evaluateTarget();

  const standings =
    getStandings();

  const champion =
    standings[0];

  const user =
    getUserTeam();

  let prize = 0;

  if (evaluation.position === 1) {
    prize = 500000000;
  } else if (evaluation.position <= 3) {
    prize = 250000000;
  } else {
    prize = 100000000;
  }

  user.budget += prize;

  const record = {

    year: game.year,

    teamId: user.id,

    teamName: user.name,

    position: evaluation.position,

    champion: champion?.name || "-",

    target: game.target,

    targetSuccess: evaluation.success,

    wins: user.standings.wins,

    losses: user.standings.losses

  };

  game.history.unshift(record);

  if (evaluation.success) {

    game.reputation =
      clamp(
        game.reputation + 10,
        0,
        100
      );

  } else {

    game.reputation =
      clamp(
        game.reputation - 5,
        0,
        100
      );

  }

  developAllPlayers();

  processEndSeasonContracts();

  game.year++;

  game.date =
    `${game.year}-01-01`;

  game.phase = "regular";

  game.schedule = [];

  game.teams.forEach(team => {

    team.standings = {

      played: 0,

      wins: 0,

      losses: 0,

      points: 0,

      gameWins: 0,

      gameLosses: 0

    };

    team.seasonStats = {

      matches: 0,

      wins: 0,

      losses: 0

    };

    team.players.forEach(player => {

      player.age++;

      player.fatigue = 0;

      player.fitness = 100;

      player.form = 75;

      player.morale = 75;

    });

  });

  createSeasonSchedule();

  updateWorldRanking();

  addNews(
    "? New Season",
    `Musim ${game.year} dimulai. ${champion.name} adalah juara musim lalu.`
  );

  saveGame();

  renderDashboard();

  alert(
    `Musim selesai!\n\n` +
    `Posisi: #${evaluation.position}\n` +
    `Champion: ${champion.name}\n` +
    `Prize: ${money(prize)}\n\n` +
    (
      evaluation.success
        ? "TARGET BERHASIL! ?"
        : "Target gagal. Musim depan lebih kuat!"
    )
  );

}


/* =========================================================
   SCREENS
   ========================================================= */

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.remove("active");
    });

  const target =
    document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }

}

function showDashboard() {

  renderDashboard();

  showScreen(
    "dashboardScreen"
  );

}

function showRoster() {

  renderRoster();

  showScreen(
    "rosterScreen"
  );

}

function showTransfer() {

  renderTransfer();

  showScreen(
    "transferScreen"
  );

}

function showSchedule() {

  renderSchedule();

  showScreen(
    "scheduleScreen"
  );

}

function showScouting() {

  renderScouting();

  showScreen(
    "scoutingScreen"
  );

}

function showWorld() {

  updateWorldRanking();

  renderWorld();

  showScreen(
    "worldScreen"
  );

}

function showTournament() {

  renderTournament();

  showScreen(
    "tournamentScreen"
  );

}

function showHistory() {

  renderHistory();

  showScreen(
    "historyScreen"
  );

}


/* =========================================================
   COUNTRY / LEAGUE / TEAM SELECTION
   ========================================================= */

function renderCountries() {

  const container =
    document.getElementById(
      "countryList"
    );

  if (!container) return;

  container.innerHTML =
    countries.map(country => `

      <button onclick="selectCountry('${country.id}')">

        <div style="font-size:32px">
          ${country.flag}
        </div>

        <strong>
          ${escapeHtml(country.name)}
        </strong>

        <small>
          ${escapeHtml(country.description)}
        </small>

      </button>

    `).join("");

}


function selectCountry(id) {

  selectedCountry =
    countries.find(
      c => c.id === id
    );

  if (!selectedCountry) return;

  document.getElementById(
    "leagueCountryTitle"
  ).textContent =
    selectedCountry.name;

  renderLeagues();

  showScreen(
    "leagueScreen"
  );

}


function renderLeagues() {

  const container =
    document.getElementById(
      "leagueList"
    );

  if (!container) return;

  const leagues =
    getAllLeagues().filter(
      league =>
        league.region ===
        selectedCountry.name
    );

  if (!leagues.length) {

    container.innerHTML = `

      <div class="panel">

        <h3>Coming Soon</h3>

        <p class="muted">
          Liga region ini belum tersedia
          pada database V1.5.
        </p>

      </div>

    `;

    return;

  }

  container.innerHTML =
    leagues.map(league => `

      <button onclick="selectLeague('${league.id}')">

        <div style="font-size:30px">
          ?
        </div>

        <strong>
          ${escapeHtml(league.name)}
        </strong>

        <small>
          Season ${league.season}
        </small>

      </button>

    `).join("");

}


function selectLeague(id) {

  selectedLeagueId = id;

  const league =
    getLeague(id);

  if (!league) return;

  document.getElementById(
    "selectedLeagueName"
  ).textContent =
    league.name;

  renderTeams();

  showScreen(
    "teamScreen"
  );

}


function renderTeams() {

  const league =
    getLeague(selectedLeagueId);

  const container =
    document.getElementById(
      "teamList"
    );

  if (!league || !container)
    return;

  container.innerHTML =
    league.teams.map(team => `

      <button onclick="selectTeam('${team.id}')">

        <div style="font-size:30px">
          ??
        </div>

        <strong>
          ${escapeHtml(team.name)}
        </strong>

        <small>
          ${team.players.length} players
        </small>

      </button>

    `).join("");

}


function selectTeam(id) {

  selectedTeamId = id;

  showScreen(
    "managerSetupScreen"
  );

}


/* =========================================================
   START CAREER
   ========================================================= */

function selectTarget(target) {

  selectedTarget = target;

  document
    .querySelectorAll(
      ".target-grid button"
    )
    .forEach(
      b =>
        b.style.outline = ""
    );

  const map = {

    champion:
      "targetChampion",

    top3:
      "targetTop3",

    top5:
      "targetTop5",

    survive:
      "targetSurvive"

  };

  const button =
    document.getElementById(
      map[target]
    );

  if (button) {

    button.style.outline =
      "2px solid #f4c542";

  }

}


function startCareer() {

  const managerName =
    document
      .getElementById(
        "managerName"
      )
      .value.trim() ||
    "New Manager";

  const league =
    getLeague(
      selectedLeagueId
    );

  if (!league) {

    alert(
      "League tidak ditemukan."
    );

    return;

  }

  const original =
    league.teams;

  game =
    createGame();

  game.teams =
    original.map(
      createTeam
    );

  game.teamId =
    selectedTeamId;

  game.team =
    getUserTeam();

  game.team.manager = {

    name: managerName,

    reputation: 50

  };

  game.team.lineup =
    chooseBestLineup(
      game.team
    ).map(
      p => p.id
    );

  game.budget =
    game.team.budget;

  initFreeAgents();

  createSeasonSchedule();

  initRivals();

  updateWorldRanking();

  addNews(
    "? Career Started",
    `Selamat datang, ${managerName}!`
  );

  saveGame();

  renderDashboard();

  showDashboard();

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  if (!game) return;

  syncUserTeam();

  const team =
    getUserTeam();

  const standings =
    getStandings();

  const position =
    standings.findIndex(
      t => t.id === team.id
    ) + 1;

  const next =
    findNextUserMatch();

  document.getElementById(
    "dashTeamName"
  ).textContent =
    team.name;

  document.getElementById(
    "dashLeague"
  ).textContent =
    getLeague(game.leagueId)?.name ||
    "League";

  document.getElementById(
    "dashBudget"
  ).textContent =
    money(team.budget);

  document.getElementById(
    "dashboardMain"
  ).innerHTML = `

    <div class="dashboard-card">

      <div class="muted">
        Season ${game.year}
      </div>

      <h2>
        ${escapeHtml(team.name)}
      </h2>

      <div class="stat-grid">

        <div class="stat-box">
          Position
          <strong>
            #${position}
          </strong>
        </div>

        <div class="stat-box">
          Points
          <strong>
            ${team.standings.points}
          </strong>
        </div>

        <div class="stat-box">
          Record
          <strong>
            ${team.standings.wins}W -
            ${team.standings.losses}L
          </strong>
        </div>

        <div class="stat-box">
          Power
          <strong>
            ${Math.round(teamPower(team))}
          </strong>
        </div>

        <div class="stat-box">
          Chemistry
          <strong>
            ${Math.round(team.chemistry)}
          </strong>
        </div>

        <div class="stat-box">
          Reputation
          <strong>
            ${Math.round(game.reputation)}
          </strong>
        </div>

      </div>

    </div>

    <div class="dashboard-card">

      <div class="muted">
        Next Match
      </div>

      ${
        next
          ? `
            <h3>
              ${escapeHtml(
                getTeam(next.homeId).name
              )}
              vs
              ${escapeHtml(
                getTeam(next.awayId).name
              )}
            </h3>

            <p>
              ? ${formatDate(next.date)}
              <br>
              ? BO${next.bestOf}
            </p>

            <button
              class="primary"
              onclick="goToNextMatch()">
              OPEN MATCH
            </button>
          `
          : `
            <p>
              Tidak ada pertandingan berikutnya.
            </p>
          `
      }

    </div>

    <div class="dashboard-card">

      <div class="muted">
        Target
      </div>

      <h3>
        ${targetLabel(game.target)}
      </h3>

      <p>
        Finish sesuai target untuk meningkatkan
        reputasi organisasi.
      </p>

    </div>

  `;

}


function targetLabel(target) {

  return {

    champion:
      "? Champion",

    top3:
      "? Finish Top 3",

    top5:
      "? Finish Top 5",

    survive:
      "?? Survive Season"

  }[target] || target;

}


function goToNextMatch() {

  const match =
    findNextUserMatch();

  if (!match) return;

  game.date =
    match.date;

  simulateAIMatches();

  openMatch(match);

}


/* =========================================================
   ROSTER UI
   ========================================================= */

function renderRoster(filter = "all") {

  const team =
    getUserTeam();

  const container =
    document.getElementById(
      "rosterList"
    );

  if (!team || !container)
    return;

  const starters =
    getStartingPlayers(team);

  let players =
    [...team.players];

  if (filter === "starting") {

    players =
      starters;

  }

  if (filter === "bench") {

    players =
      players.filter(
        p => !starters.includes(p)
      );

  }

  players.sort(
    (a, b) =>
      b.rating - a.rating
  );

  container.innerHTML = `

    <div class="panel">

      <button
        class="primary"
        onclick="autoLineup()">
        ? AUTO BEST LINEUP
      </button>

      <p class="muted">
        ${team.players.length}/12 players
      </p>

    </div>

    ${players.map(player => {

      const starter =
        starters.includes(player);

      return `

        <div class="player-card"
             onclick="openPlayer('${player.id}')">

          <div class="player-card-main">

            <div class="player-avatar">
              ?
            </div>

            <div class="player-info">

              <h3>
                ${escapeHtml(player.name)}
              </h3>

              <small>

                <span class="role">
                  ${player.role}
                </span>

                ${player.nationality}

                ${starter
                  ? " ? STARTER"
                  : " ? BENCH"}

              </small>

            </div>

            <div class="rating">
              ${Math.round(player.rating)}
            </div>

          </div>

          <div class="player-meta">

            <span>
              Form ${Math.round(player.form)}
            </span>

            <span>
              Fitness ${Math.round(player.fitness)}
            </span>

            <span>
              Potential ${Math.round(player.potential)}
            </span>

          </div>

        </div>

      `;

    }).join("")}

  `;

}


/* =========================================================
   PLAYER PROFILE
   ========================================================= */

function openPlayer(playerId) {

  const player =
    getPlayer(
      getUserTeam(),
      playerId
    );

  if (!player) return;

  currentPlayerId =
    player.id;

  const container =
    document.getElementById(
      "playerProfile"
    );

  container.innerHTML = `

    <div style="text-align:center">

      <div class="player-avatar"
           style="margin:auto;width:80px;height:80px">
        ?
      </div>

      <h2>
        ${escapeHtml(player.name)}
      </h2>

      <span class="role">
        ${player.role}
      </span>

    </div>

    <div class="stat-grid">

      <div class="stat-box">
        Rating
        <strong>${player.rating}</strong>
      </div>

      <div class="stat-box">
        Potential
        <strong>${player.potential}</strong>
      </div>

      <div class="stat-box">
        Age
        <strong>${player.age}</strong>
      </div>

      <div class="stat-box">
        Morale
        <strong>${player.morale}</strong>
      </div>

      <div class="stat-box">
        Form
        <strong>${player.form}</strong>
      </div>

      <div class="stat-box">
        Fitness
        <strong>${player.fitness}</strong>
      </div>

      <div class="stat-box">
        Fatigue
        <strong>${player.fatigue}</strong>
      </div>

      <div class="stat-box">
        Salary
        <strong>${money(player.salary)}</strong>
      </div>

    </div>

    <div class="panel">

      <h3>? Career Stats</h3>

      <p>
        Matches:
        ${player.stats.matches}
      </p>

      <p>
        Wins:
        ${player.stats.wins}
      </p>

      <p>
        Losses:
        ${player.stats.losses}
      </p>

      <p>
        K/D:
        ${player.stats.kills}
        /
        ${player.stats.deaths}
      </p>

      <p>
        Assists:
        ${player.stats.assists}
      </p>

      <p>
        MVP:
        ${player.stats.mvp}
      </p>

    </div>

    <div class="panel">

      <p>
        Contract until:
        <strong>
          ${player.contractUntil}
        </strong>
      </p>

      ${
        player.injury
          ? `
            <p class="bad">
              ? ${player.injury.type}
              <br>
              Recovery:
              ${player.injury.days} days
            </p>
          `
          : `
            <p class="good">
              ? Healthy
            </p>
          `
      }

    </div>

    <button
      class="primary big"
      onclick="renewContract('${player.id}')">
      ? RENEW CONTRACT
    </button>

    <button
      class="primary big"
      onclick="closeModal()">
      CLOSE
    </button>

    <button
      class="big"
      style="
        width:100%;
        margin-top:10px;
        padding:15px;
        background:#2a1620;
        color:#fff;
        border:0;
        border-radius:12px;
      "
      onclick="releasePlayer('${player.id}')">
      ? RELEASE PLAYER
    </button>

  `;

  document
    .getElementById(
      "playerModal"
    )
    .classList.add("show");

}


function closeModal() {

  document
    .getElementById(
      "playerModal"
    )
    .classList.remove("show");

}


/* =========================================================
   TRANSFER UI
   ========================================================= */

function renderTransfer() {

  const container =
    document.getElementById(
      "transferList"
    );

  if (!container) return;

  const players =
    getTransferPlayers();

  container.innerHTML = players
    .map(item => {

      const p =
        item.player;

      const price =
        calculateTransferValue(p);

      return `

        <div class="player-card">

          <div class="player-card-main">

            <div class="player-avatar">
              ?
            </div>

            <div class="player-info">

              <h3>
                ${escapeHtml(p.name)}
              </h3>

              <small>
                ${p.role}
                ?
                ${item.team.name}
              </small>

            </div>

            <div class="rating">
              ${p.rating}
            </div>

          </div>

          <div class="player-meta">

            <span>
              Age ${p.age}
            </span>

            <span>
              POT ${p.potential}
            </span>

            <span>
              ${money(price)}
            </span>

          </div>

          <button
            class="primary"
            style="width:100%;margin-top:12px"
            onclick="
              makeTransferOffer(
                getTeam('${item.team.id}'),
                getPlayer(
                  getTeam('${item.team.id}'),
                  '${p.id}'
                )
              )
            ">
            ? MAKE OFFER
          </button>

        </div>

      `;

    })
    .join("");

}


/* =========================================================
   SCOUTING UI
   ========================================================= */

function renderScouting() {

  const container =
    document.getElementById(
      "scoutingList"
    );

  const role =
    document.getElementById(
      "scoutRole"
    )?.value ||
    "ALL";

  if (!container) return;

  const players =
    game.freeAgents
      .filter(
        p =>
          role === "ALL" ||
          p.role === role
      )
      .sort(
        (a, b) =>
          b.rating - a.rating
      );

  container.innerHTML =
    players.map(p => {

      const fee =
        Math.round(
          calculateTransferValue(p) * 0.08
        );

      return `

        <div class="player-card">

          <div class="player-card-main">

            <div class="player-avatar">
              ?
            </div>

            <div class="player-info">

              <h3>
                ${escapeHtml(p.name)}
              </h3>

              <small>
                ${p.role}
                ?
                Age ${p.age}
              </small>

            </div>

            <div class="rating">
              ${p.rating}
            </div>

          </div>

          <div class="player-meta">

            <span>
              POT ${p.potential}
            </span>

            <span>
              ${money(fee)}
            </span>

          </div>

          <button
            class="primary"
            style="width:100%;margin-top:12px"
            onclick="
              signFreeAgent('${p.id}')
            ">
            SIGN PLAYER
          </button>

        </div>

      `;

    }).join("");

}


/* =========================================================
   SCHEDULE UI
   ========================================================= */

function renderSchedule() {

  const container =
    document.getElementById(
      "scheduleList"
    );

  if (!container) return;

  const upcoming =
    game.schedule
      .filter(
        m =>
          m.homeId === game.teamId ||
          m.awayId === game.teamId
      )
      .slice()
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date)
      );

  container.innerHTML =
    upcoming.map(match => {

      const home =
        getTeam(match.homeId);

      const away =
        getTeam(match.awayId);

      const userMatch =
        !match.played &&
        (
          match.homeId === game.teamId ||
          match.awayId === game.teamId
        );

      return `

        <div class="
          match-row
          ${userMatch ? "playable" : ""}
        ">

          <div>

            <small>
              ${formatDate(match.date)}
            </small>

            <strong>
              ${escapeHtml(home.name)}
              vs
              ${escapeHtml(away.name)}
            </strong>

          </div>

          <div>

            ${
              match.played
                ? `
                  ${match.result.homeScore}
                  -
                  ${match.result.awayScore}
                `
                : userMatch
                  ? `
                    <button
                      class="primary"
                      onclick="
                        game.date='${match.date}';
                        openMatch(
                          game.schedule.find(
                            m=>m.id==='${match.id}'
                          )
                        );
                      ">
                      PLAY
                    </button>
                  `
                  : "UPCOMING"
            }

          </div>

        </div>

      `;

    }).join("");

}


/* =========================================================
   WORLD UI
   ========================================================= */

function renderWorld() {

  const container =
    document.getElementById(
      "worldList"
    );

  if (!container) return;

  container.innerHTML =
    game.worldRanking
      .map(r => `

        <div class="rank-row">

          <strong>
            #${r.rank}
          </strong>

          <div>

            <strong>
              ${escapeHtml(r.teamName)}
            </strong>

            <small class="muted">
              Power ${r.power}
            </small>

          </div>

          <strong>
            ${r.points}
          </strong>

        </div>

      `)
      .join("");

}


/* =========================================================
   TOURNAMENT
   ========================================================= */

function renderTournament() {

  const container =
    document.getElementById(
      "tournamentContent"
    );

  if (!container) return;

  const standings =
    getStandings();

  container.innerHTML = `

    <div class="panel">

      <h2>? Regional Championship</h2>

      <p class="muted">
        Posisi liga menentukan seed tournament.
      </p>

      <div class="stat-grid">

        <div class="stat-box">
          Your Seed
          <strong>
            #${
              standings.findIndex(
                t => t.id === game.teamId
              ) + 1
            }
          </strong>
        </div>

        <div class="stat-box">
          Team Power
          <strong>
            ${Math.round(
              teamPower(getUserTeam())
            )}
          </strong>
        </div>

      </div>

    </div>

    <div class="panel">

      <h3>MSC Qualification</h3>

      <p>
        Finish Top 3 untuk membuka peluang
        masuk tournament internasional.
      </p>

    </div>

  `;

}


/* =========================================================
   HISTORY UI
   ========================================================= */

function renderHistory() {

  const container =
    document.getElementById(
      "historyList"
    );

  if (!container) return;

  if (!game.history.length) {

    container.innerHTML = `

      <div class="panel">
        Belum ada sejarah musim.
      </div>

    `;

    return;

  }

  container.innerHTML =
    game.history.map(h => `

      <div class="panel">

        <h3>
          Season ${h.year}
        </h3>

        <p>
          ${escapeHtml(h.teamName)}
        </p>

        <p>
          Finish:
          <strong>
            #${h.position}
          </strong>
        </p>

        <p>
          Champion:
          ${escapeHtml(h.champion)}
        </p>

        <p>
          Record:
          ${h.wins}W -
          ${h.losses}L
        </p>

        <p>
          Target:
          ${
            h.targetSuccess
              ? "? Success"
              : "? Failed"
          }
        </p>

      </div>

    `).join("");

}


/* =========================================================
   NEWS / INBOX
   ========================================================= */

function addNews(title, message) {

  if (!game) return;

  game.inbox.unshift({

    id: uid("mail"),

    date: game.date,

    title,

    message,

    read: false

  });

  game.news.unshift({

    date: game.date,

    title,

    message

  });

  game.inbox =
    game.inbox.slice(0, 50);

  game.news =
    game.news.slice(0, 50);

}


function showInbox() {

  const container =
    document.getElementById(
      "inboxList"
    );

  container.innerHTML =
    game.inbox.map(mail => `

      <div class="news-card">

        <small>
          ${formatDate(mail.date)}
        </small>

        <h3>
          ${escapeHtml(mail.title)}
        </h3>

        <p>
          ${escapeHtml(mail.message)}
        </p>

      </div>

    `).join("");

  document
    .getElementById(
      "inboxModal"
    )
    .classList.add("show");

}


function closeInbox() {

  document
    .getElementById(
      "inboxModal"
    )
    .classList.remove("show");

}


/* =========================================================
   SAVE / LOAD
   ========================================================= */

function saveGame() {

  if (!game) return;

  try {

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );

  } catch (error) {

    console.error(
      "Save failed:",
      error
    );

  }

}


function normalizeLoadedPlayer(p) {

  return createPlayer({

    ...p,

    role:
      normalizeRole(p.role),

    rating:
      Number(p.rating || 70),

    potential:
      Number(
        p.potential ||
        Number(p.rating || 70) + 10
      )

  });

}


function migrateGame(data) {

  if (!data) return null;

  data.version = "1.5";

  data.teams =
    (data.teams || []).map(team => {

      team.players =
        (team.players || [])
          .map(normalizeLoadedPlayer);

      team.chemistry =
        Number(
          team.chemistry || 70
        );

      team.standings =
        team.standings || {

          played: 0,

          wins: 0,

          losses: 0,

          points: 0,

          gameWins: 0,

          gameLosses: 0

        };

      team.seasonStats =
        team.seasonStats || {

          matches: 0,

          wins: 0,

          losses: 0

        };

      return team;

    });

  data.freeAgents =
    (data.freeAgents || [])
      .map(normalizeLoadedPlayer);

  data.inbox =
    data.inbox || [];

  data.news =
    data.news || [];

  data.history =
    data.history || [];

  data.worldRanking =
    data.worldRanking || [];

  data.rivals =
    data.rivals || [];

  return data;

}


function loadGame() {

  try {

    const raw =
      localStorage.getItem(
        SAVE_KEY
      );

    if (!raw) return false;

    const parsed =
      JSON.parse(raw);

    game =
      migrateGame(parsed);

    if (!game) return false;

    syncUserTeam();

    updateWorldRanking();

    return true;

  } catch (error) {

    console.error(
      "Load failed:",
      error
    );

    return false;

  }

}


/* =========================================================
   RESET
   ========================================================= */

function resetGame() {

  const yes =
    confirm(
      "Reset career?\nSemua progress akan hilang."
    );

  if (!yes) return;

  localStorage.removeItem(
    SAVE_KEY
  );

  game = null;

  selectedCountry = null;

  selectedLeagueId = null;

  selectedTeamId = null;

  location.reload();

}


/* =========================================================
   DEBUG
   ========================================================= */

window.MLBB_PM = {

  getGame: () => game,

  save: saveGame,

  reset: resetGame,

  advance: advanceDay,

  rank: () => {

    updateWorldRanking();

    return game?.worldRanking;

  },

  lineup: () => {

    const team =
      getUserTeam();

    return chooseBestLineup(team);

  }

};


/* =========================================================
   BOOT
   ========================================================= */

function boot() {

  if (
    typeof countries === "undefined"
  ) {

    alert(
      "countries.js belum termuat."
    );

    return;

  }

  if (
    typeof MPL_ID_2026 === "undefined"
  ) {

    alert(
      "mpl_data.js belum termuat."
    );

    return;

  }

  if (loadGame()) {

    renderDashboard();

    showDashboard();

  } else {

    renderCountries();

    showScreen(
      "countryScreen"
    );

  }

}


document.addEventListener(
  "DOMContentLoaded",
  boot
);

