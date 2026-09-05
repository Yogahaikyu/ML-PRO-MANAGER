/* =========================================================
   MLBB PRO MANAGER
   V0.9 FIX
   ========================================================= */

const SAVE_KEY = "mlbb_pro_manager_save_v09";

let selectedTarget = "top3";

let game = {
  version: 9,

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

  currentMatch: null,
  lastResult: null,

  marketPlayers: [],
  scoutingResult: null,

  requests: [],

  careerStarted: false,

  world: {
    ranking: [],
    msc: {
      qualified: false,
      completed: false,
      champion: null,
      matches: [],
      teams: []
    },
    mSeries: {
      qualified: false,
      completed: false,
      champion: null,
      matches: [],
      teams: []
    }
  },

  history: []
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function showScreen(id) {

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function money(value) {

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Math.round(value || 0));

}


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getTargetName(target) {

  const names = {
    champion: "Juara",
    top3: "Top 3",
    playoff: "Playoff",
    build: "Build Team"
  };

  return names[target] || target;
}


function getAllLeagues() {

  return [
    MPL_ID_2026,
    MPL_PH_2026,
    MPL_KH_2026
  ];
}


function getLeagueById(id) {

  return getAllLeagues().find(league => league.id === id);
}


function getTeamSource(teamId) {

  for (const league of getAllLeagues()) {

    const team = league.teams.find(t => t.id === teamId);

    if (team) {

      return {
        team,
        league
      };

    }

  }

  return null;
}


function getCurrentTeam() {

  const source = getTeamSource(game.team);

  return source ? source.team : null;
}


function getCurrentLeague() {

  return getLeagueById(game.league);
}


function getCurrentTeamName() {

  const team = getCurrentTeam();

  return team ? team.name : "-";
}


function getCurrentLeagueName() {

  const league = getCurrentLeague();

  return league ? league.name : "-";
}


/* =========================================================
   COUNTRY
   ========================================================= */

function renderCountries() {

  const container = document.getElementById("countryList");

  if (!container) return;

  container.innerHTML = "";

  countries.forEach(country => {

    const button = document.createElement("button");

    button.className = "country-btn";

    button.innerHTML = `
      <div class="country-flag">${country.flag}</div>

      <div class="country-info">
        <strong>${country.name}</strong>
        <span>${country.leagues.length} league tersedia</span>
      </div>
    `;

    button.onclick = () => selectCountry(country.id);

    container.appendChild(button);

  });

}


function selectCountry(countryId) {

  const country = countries.find(c => c.id === countryId);

  if (!country) return;

  game.country = country.id;

  document.getElementById("leagueCountryTitle").textContent =
    `${country.flag} ${country.name}`;

  renderLeagues();

  showScreen("leagueScreen");
}


function renderLeagues() {

  const container = document.getElementById("leagueList");

  if (!container) return;

  container.innerHTML = "";

  const country = countries.find(c => c.id === game.country);

  if (!country) return;

  country.leagues.forEach(leagueId => {

    const league = getLeagueById(leagueId);

    if (!league) return;

    const button = document.createElement("button");

    button.className = "league-btn";

    button.innerHTML = `
      <div class="league-info">
        <strong>${league.name}</strong>
        <span>Season ${league.season} • ${league.teams.length} teams</span>
      </div>
    `;

    button.onclick = () => selectLeague(league.id);

    container.appendChild(button);

  });

}


function selectLeague(leagueId) {

  const league = getLeagueById(leagueId);

  if (!league) return;

  game.league = league.id;

  renderTeams();

  showScreen("teamScreen");
}


/* =========================================================
   TEAM
   ========================================================= */

function renderTeams() {

  const container = document.getElementById("teamList");

  if (!container) return;

  container.innerHTML = "";

  const league = getCurrentLeague();

  if (!league) return;

  league.teams.forEach(team => {

    const rating = teamRating(team.id);

    const button = document.createElement("button");

    button.className = "team-btn";

    button.innerHTML = `
      <div class="team-info">
        <strong>${team.name}</strong>
        <span>Team Rating: ${rating}</span>
      </div>
    `;

    button.onclick = () => selectTeam(team.id);

    container.appendChild(button);

  });

}


function selectTeam(teamId) {

  const source = getTeamSource(teamId);

  if (!source) return;

  game.team = teamId;

  document.getElementById("managerName").value = "";

  selectedTarget = "top3";

  updateTargetButtons();

  showScreen("managerSetupScreen");
}


/* =========================================================
   MANAGER SETUP
   ========================================================= */

function selectTarget(target) {

  selectedTarget = target;

  updateTargetButtons();

}


function updateTargetButtons() {

  document.querySelectorAll(".target-btn").forEach(button => {
    button.classList.remove("selected");
  });

  const button = document.getElementById(
    `target-${selectedTarget}`
  );

  if (button) {
    button.classList.add("selected");
  }

}


function startCareer() {

  const nameInput =
    document.getElementById("managerName");

  const name =
    nameInput.value.trim();

  if (!name) {

    alert("Masukkan nama manager dulu.");

    return;
  }

  game.managerName = name;

  game.target = selectedTarget;

  game.careerStarted = true;

  game.year = 2026;

  game.budget = 500000;

  game.reputation = 50;

  game.organizationLevel = 1;

  game.history = [];

  game.world = createWorldState();

  createSeason();

  saveGame(false);

  renderDashboard();

  showScreen("dashboardScreen");

}


/* =========================================================
   SEASON
   ========================================================= */

function createSeason() {

  const league = getCurrentLeague();

  if (!league) return;

  game.year = league.season;

  game.standings =
    createStandings(league);

  game.schedule =
    createRoundRobinSchedule(league);

  game.currentMatch = null;

  game.lastResult = null;

  game.marketPlayers = [];

  game.scoutingResult = null;

  game.requests = [];

  resetWorldSeason();

}


function createStandings(league) {

  return league.teams.map(team => ({

    teamId: team.id,

    played: 0,

    wins: 0,

    losses: 0,

    mapWin: 0,

    mapLoss: 0,

    diff: 0,

    points: 0

  }));

}


function createRoundRobinSchedule(league) {

  const teams = league.teams.map(team => team.id);

  let list = [...teams];

  if (list.length % 2 !== 0) {
    list.push(null);
  }

  const rounds = list.length - 1;

  const half = list.length / 2;

  const matches = [];

  for (let round = 0; round < rounds; round++) {

    const matchday = round + 1;

    for (let i = 0; i < half; i++) {

      const home = list[i];

      const away = list[list.length - 1 - i];

      if (!home || !away) continue;

      const homeFirst = round % 2 === 0;

      matches.push({

        id: `regular-${matchday}-${i}`,

        matchday,

        stage: "regular",

        home: homeFirst ? home : away,

        away: homeFirst ? away : home,

        played: false,

        winner: null,

        homeScore: null,

        awayScore: null

      });

    }

    const fixed = list[0];

    const rest = list.slice(1);

    rest.unshift(rest.pop());

    list = [fixed, ...rest];

  }

  return matches;

}


/* =========================================================
   RATING
   ========================================================= */

function teamRating(teamId) {

  const source = getTeamSource(teamId);

  if (!source) return 50;

  return teamRatingFromData(source.team);

}


function teamRatingFromData(team) {

  if (!team || !team.players || !team.players.length) {
    return 50;
  }

  const sorted =
    [...team.players]
      .sort((a, b) => b.rating - a.rating);

  const starting =
    sorted.slice(0, Math.min(5, sorted.length));

  const average =
    starting.reduce(
      (sum, player) => sum + Number(player.rating || 0),
      0
    ) / starting.length;

  return Math.round(average);

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  document.getElementById("dashManager").textContent =
    game.managerName;

  document.getElementById("dashSeason").textContent =
    game.year;

  document.getElementById("dashTeam").textContent =
    getCurrentTeamName();

  document.getElementById("dashLeague").textContent =
    getCurrentLeagueName();

  document.getElementById("dashBudget").textContent =
    money(game.budget);

  document.getElementById("dashRep").textContent =
    game.reputation;

  document.getElementById("dashOrg").textContent =
    `Level ${game.organizationLevel}`;

  document.getElementById("dashTarget").textContent =
    getTargetName(game.target);

  renderNextMatch();

}


function renderNextMatch() {

  const container =
    document.getElementById("nextMatch");

  if (!container) return;

  const next =
    game.schedule.find(
      match =>
        !match.played &&
        (
          match.home === game.team ||
          match.away === game.team
        )
    );

  if (!next) {

    container.innerHTML = `
      <div class="empty">
        Tidak ada pertandingan tersisa.
      </div>
    `;

    return;
  }

  const opponentId =
    next.home === game.team
      ? next.away
      : next.home;

  const opponent =
    getTeamSource(opponentId);

  container.innerHTML = `
    <div class="match-preview">
      <strong>${getCurrentTeamName()}</strong>

      <span class="versus">VS</span>

      <strong>${opponent ? opponent.team.name : "Unknown"}</strong>
    </div>

    <div class="badge" style="margin-top:10px">
      Matchday ${next.matchday}
    </div>
  `;

}


function backDashboard() {

  renderDashboard();

  showScreen("dashboardScreen");

}


/* =========================================================
   ROSTER
   ========================================================= */

function getCurrentPlayers() {

  const team = getCurrentTeam();

  return team && team.players
    ? team.players
    : [];

}


function sortPlayers(players) {

  return [...players].sort(
    (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
  );

}


function openRoster() {

  renderRoster();

  showScreen("rosterScreen");

}


function renderRoster() {

  const container =
    document.getElementById("rosterList");

  if (!container) return;

  const players =
    sortPlayers(getCurrentPlayers());

  if (!players.length) {

    container.innerHTML =
      `<div class="empty">Roster kosong.</div>`;

    return;
  }

  container.innerHTML = players.map((player, index) => {

    const starting =
      index < 5
        ? "STARTING 5"
        : "BENCH";

    return `
      <div class="player-card">

        <div class="player-top">

          <div>
            <div class="player-name">
              ${player.name}
            </div>

            <div class="player-role">
              ${player.role || "Player"}
            </div>
          </div>

          <div class="rating">
            ${player.rating}
          </div>

        </div>

        <div class="player-meta">

          <span class="badge">
            ${starting}
          </span>

          <span class="badge">
            Age ${player.age}
          </span>

          <span class="badge">
            POT ${player.potential}
          </span>

          <span class="badge">
            ${player.nationality}
          </span>

        </div>

        <div class="player-meta">

          <span class="badge">
            Contract ${player.contractYears || 1} yr
          </span>

          <span class="badge">
            Salary ${money(player.salary || 0)}
          </span>

          <span class="badge">
            Morale ${player.morale || 70}
          </span>

        </div>

        <button
          class="small-btn"
          onclick="extendContract('${player.id}')"
        >
          📝 Extend Contract
        </button>

      </div>
    `;

  }).join("");

}


/* =========================================================
   CONTRACT
   ========================================================= */

function extendContract(playerId) {

  const team = getCurrentTeam();

  if (!team) return;

  const player =
    team.players.find(p => p.id === playerId);

  if (!player) return;

  const cost =
    Math.round(
      (player.salary || 10000) *
      2
    );

  if (game.budget < cost) {

    alert("Budget tidak cukup.");

    return;
  }

  game.budget -= cost;

  player.contractYears =
    Math.max(
      Number(player.contractYears || 1),
      1
    ) + 1;

  player.morale =
    clamp(
      Number(player.morale || 70) + 5,
      0,
      100
    );

  saveGame(false);

  renderRoster();

  alert(
    `${player.name} berhasil memperpanjang kontrak.`
  );

}


/* =========================================================
   TRANSFER MARKET
   ========================================================= */

function calculatePlayerValue(player) {

  const rating =
    Number(player.rating || 50);

  const potential =
    Number(player.potential || rating);

  const age =
    Number(player.age || 20);

  let value =
    rating * 4000 +
    potential * 2500;

  if (age <= 21) {
    value += 100000;
  }

  if (age >= 27) {
    value -= 50000;
  }

  return Math.max(
    50000,
    Math.round(value / 10000) * 10000
  );

}


function buildTransferMarket() {

  const currentLeague =
    getCurrentLeague();

  if (!currentLeague) return [];

  const players = [];

  getAllLeagues().forEach(league => {

    league.teams.forEach(team => {

      if (team.id === game.team) return;

      team.players.forEach(player => {

        players.push({

          ...player,

          sourceTeamId: team.id,

          sourceLeagueId: league.id,

          value: calculatePlayerValue(player),

          marketId:
            `${league.id}-${team.id}-${player.id}`

        });

      });

    });

  });

  return players
    .sort(
      (a, b) =>
        Number(b.rating) - Number(a.rating)
    )
    .slice(0, 40);

}


function openTransfer() {

  if (!game.marketPlayers.length) {

    game.marketPlayers =
      buildTransferMarket();

  }

  renderTransfer();

  showScreen("transferScreen");

}


function renderTransfer() {

  const info =
    document.getElementById("transferInfo");

  const container =
    document.getElementById("transferList");

  const players =
    game.marketPlayers;

  const foreignCount =
    getImportCount();

  info.innerHTML = `
    <strong>Budget: ${money(game.budget)}</strong>

    <p style="color:#8992a5;margin-top:7px">
      Foreign Players:
      ${foreignCount}/2
    </p>

    <p style="color:#8992a5;margin-top:7px">
      Reputation:
      ${game.reputation}
    </p>
  `;

  if (!players.length) {

    container.innerHTML =
      `<div class="empty">Tidak ada pemain di market.</div>`;

    return;
  }

  container.innerHTML =
    players.map(player => {

      const foreign =
        isForeignPlayer(player);

      const blocked =
        foreign &&
        !canRegisterForeignPlayer();

      return `
        <div class="player-card">

          <div class="player-top">

            <div>
              <div class="player-name">
                ${player.name}
              </div>

              <div class="player-role">
                ${player.role}
              </div>
            </div>

            <div class="rating">
              ${player.rating}
            </div>

          </div>

          <div class="player-meta">

            <span class="badge">
              ${player.nationality}
            </span>

            <span class="badge">
              Age ${player.age}
            </span>

            <span class="badge">
              POT ${player.potential}
            </span>

            ${
              foreign
                ? `<span class="badge">🌎 IMPORT</span>`
                : ""
            }

          </div>

          <div class="transfer-price">
            ${money(player.value)}
          </div>

          <button
            class="small-btn buy"
            onclick="buyPlayer('${player.marketId}')"
            ${blocked ? "disabled" : ""}
          >
            ${
              blocked
                ? "🔒 Import Limit"
                : "💰 BUY PLAYER"
            }
          </button>

        </div>
      `;

    }).join("");

}


function isForeignPlayer(player) {

  const source =
    getTeamSource(player.sourceTeamId);

  if (!source) return false;

  return source.league.region !==
    getCurrentLeague().region;

}


function getImportCount() {

  const currentTeam =
    getCurrentTeam();

  if (!currentTeam) return 0;

  const region =
    getCurrentLeague().region;

  return currentTeam.players.filter(player => {

    const nationality =
      String(player.nationality || "")
        .toLowerCase();

    const isHome =
      (
        region === "ID" &&
        (
          nationality === "id" ||
          nationality.includes("indonesia")
        )
      ) ||

      (
        region === "PH" &&
        (
          nationality === "ph" ||
          nationality.includes("philippines")
        )
      ) ||

      (
        region === "KH" &&
        (
          nationality === "kh" ||
          nationality.includes("cambodia")
        )
      );

    return !isHome;

  }).length;

}


function canRegisterForeignPlayer() {

  return getImportCount() < 2;

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

  if (
    isForeignPlayer(player) &&
    !canRegisterForeignPlayer()
  ) {

    alert("Maksimal 2 foreign player.");

    return;
  }

  const currentTeam =
    getCurrentTeam();

  const source =
    getTeamSource(player.sourceTeamId);

  if (!currentTeam || !source) return;

  const originalIndex =
    source.team.players.findIndex(
      p => p.id === player.id
    );

  if (originalIndex === -1) return;

  const boughtPlayer =
    source.team.players.splice(
      originalIndex,
      1
    )[0];

  currentTeam.players.push({

    ...boughtPlayer,

    contractYears: 2,

    morale: 80

  });

  game.budget -= player.value;

  game.reputation =
    clamp(
      game.reputation + 1,
      0,
      100
    );

  game.marketPlayers =
    buildTransferMarket();

  saveGame(false);

  renderTransfer();

  alert(
    `${player.name} bergabung dengan ${currentTeam.name}!`
  );

}


/* =========================================================
   SCOUTING
   ========================================================= */

function openScouting() {

  document.getElementById("scoutingResult").innerHTML = "";

  showScreen("scoutingScreen");

}


function getScoutingPlayers() {

  const players = [];

  getAllLeagues().forEach(league => {

    league.teams.forEach(team => {

      team.players.forEach(player => {

        if (
          Number(player.age || 30) <= 23
        ) {

          players.push({

            ...player,

            sourceTeamId: team.id,

            sourceLeagueId: league.id

          });

        }

      });

    });

  });

  return players;

}


function runScouting() {

  const cost = 10000;

  if (game.budget < cost) {

    alert("Budget scouting tidak cukup.");

    return;
  }

  game.budget -= cost;

  const pool =
    getScoutingPlayers();

  if (!pool.length) return;

  const player =
    pool[random(0, pool.length - 1)];

  game.scoutingResult = player;

  document.getElementById(
    "scoutingResult"
  ).innerHTML = `

    <div class="player-card" style="margin-top:15px">

      <div class="player-top">

        <div>
          <div class="player-name">
            ${player.name}
          </div>

          <div class="player-role">
            ${player.role}
          </div>
        </div>

        <div class="rating">
          ${player.rating}
        </div>

      </div>

      <div class="player-meta">

        <span class="badge">
          Age ${player.age}
        </span>

        <span class="badge">
          Potential ${player.potential}
        </span>

        <span class="badge">
          ${player.nationality}
        </span>

      </div>

      <p style="color:#8992a5;margin-top:12px">
        Current Team:
        ${getTeamSource(player.sourceTeamId)?.team.name || "-"}
      </p>

    </div>

  `;

  saveGame(false);

}


/* =========================================================
   SCHEDULE
   ========================================================= */

function openSchedule() {

  renderSchedule();

  showScreen("scheduleScreen");

}


function renderSchedule() {

  const container =
    document.getElementById("scheduleList");

  if (!container) return;

  if (!game.schedule.length) {

    container.innerHTML =
      `<div class="empty">Jadwal belum tersedia.</div>`;

    return;
  }

  container.innerHTML =
    game.schedule.map(match => {

      const home =
        getTeamSource(match.home);

      const away =
        getTeamSource(match.away);

      let result = "";

      if (match.played) {

        const userWon =
          match.winner === game.team;

        const userInMatch =
          match.home === game.team ||
          match.away === game.team;

        if (userInMatch) {

          result = `
            <div class="${userWon ? "win" : "loss"}"
                 style="margin-top:8px">
              ${match.homeScore} - ${match.awayScore}
              • ${userWon ? "WIN" : "LOSS"}
            </div>
          `;

        } else {

          result = `
            <div style="margin-top:8px;color:#8992a5">
              ${match.homeScore} - ${match.awayScore}
            </div>
          `;

        }

      }

      return `

        <div class="schedule-item ${match.played ? "played" : ""}">

          <div class="schedule-head">
            <span>Matchday ${match.matchday}</span>
            <span>${match.stage}</span>
          </div>

          <div class="schedule-teams">

            <strong>
              ${home ? home.team.name : "-"}
            </strong>

            <span>VS</span>

            <strong>
              ${away ? away.team.name : "-"}
            </strong>

          </div>

          ${result}

        </div>

      `;

    }).join("");

}


/* =========================================================
   MATCH
   ========================================================= */

function playNextMatch() {

  const next =
    game.schedule.find(
      match =>
        !match.played &&
        (
          match.home === game.team ||
          match.away === game.team
        )
    );

  if (!next) {

    alert("Tidak ada match lagi di regular season.");

    return;
  }

  game.currentMatch = next.id;

  renderMatch(next);

  showScreen("matchScreen");

}


function renderMatch(match) {

  const home =
    getTeamSource(match.home);

  const away =
    getTeamSource(match.away);

  const homeRating =
    teamRating(match.home);

  const awayRating =
    teamRating(match.away);

  const total =
    homeRating + awayRating;

  const homeChance =
    Math.round(
      (homeRating / total) * 100
    );

  const awayChance =
    100 - homeChance;

  document.getElementById("matchStage").textContent =
    `Regular Season • Matchday ${match.matchday}`;

  document.getElementById("matchHome").textContent =
    home?.team.name || "-";

  document.getElementById("matchAway").textContent =
    away?.team.name || "-";

  document.getElementById("matchHomeRating").textContent =
    `Rating ${homeRating}`;

  document.getElementById("matchAwayRating").textContent =
    `Rating ${awayRating}`;

  document.getElementById("homeChance").textContent =
    `${homeChance}% ${home?.team.name || ""}`;

  document.getElementById("awayChance").textContent =
    `${awayChance}% ${away?.team.name || ""}`;

  renderMatchRoster();

}


function renderMatchRoster() {

  const container =
    document.getElementById("matchRoster");

  const players =
    sortPlayers(getCurrentPlayers())
      .slice(0, 5);

  container.innerHTML =
    players.map(player => `
      <div class="match-player">
        <span>${player.name}</span>
        <strong>${player.rating}</strong>
      </div>
    `).join("");

}


function simulateCurrentMatch() {

  const match =
    game.schedule.find(
      m => m.id === game.currentMatch
    );

  if (!match) return;

  const homeRating =
    teamRating(match.home);

  const awayRating =
    teamRating(match.away);

  const winner =
    simulateWinner(
      homeRating,
      awayRating
    );

  const score =
    generateBO3(
      winner,
      match
    );

  match.played = true;

  match.winner = winner;

  match.homeScore = score.home;

  match.awayScore = score.away;

  updateStandingsFromMatch(match);

  game.lastResult = {

    type: "regular",

    matchId: match.id,

    winner,

    home: match.home,

    away: match.away,

    homeScore: score.home,

    awayScore: score.away

  };

  autoSimulateMatchday(match.matchday);

  saveGame(false);

  renderResult(match);

  showScreen("resultScreen");

}


function simulateWinner(homeRating, awayRating) {

  const total =
    homeRating + awayRating;

  const chance =
    homeRating / total;

  return Math.random() < chance
    ? game.schedule.find(m =>
        m.id === game.currentMatch
      ).home
    : game.schedule.find(m =>
        m.id === game.currentMatch
      ).away;

}


function generateBO3(winner, match) {

  if (!match) {

    return {
      home: 2,
      away: 1
    };

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


function updateStandingsFromMatch(match) {

  const home =
    game.standings.find(
      s => s.teamId === match.home
    );

  const away =
    game.standings.find(
      s => s.teamId === match.away
    );

  if (!home || !away) return;

  home.played++;
  away.played++;

  home.mapWin += match.homeScore;
  home.mapLoss += match.awayScore;

  away.mapWin += match.awayScore;
  away.mapLoss += match.homeScore;

  home.diff =
    home.mapWin - home.mapLoss;

  away.diff =
    away.mapWin - away.mapLoss;

  if (match.winner === match.home) {

    home.wins++;
    away.losses++;

    home.points += 3;

  } else {

    away.wins++;
    home.losses++;

    away.points += 3;

  }

}


function autoSimulateMatchday(matchday) {

  const matches =
    game.schedule.filter(
      m =>
        m.matchday === matchday &&
        !m.played
    );

  matches.forEach(match => {

    const winner =
      simulateGenericWinner(
        match.home,
        match.away
      );

    const score =
      generateBO3(
        winner,
        match
      );

    match.played = true;

    match.winner = winner;

    match.homeScore = score.home;

    match.awayScore = score.away;

    updateStandingsFromMatch(match);

  });

}


/* =========================================================
   RESULT
   ========================================================= */

function renderResult(match) {

  const home =
    getTeamSource(match.home);

  const away =
    getTeamSource(match.away);

  const winner =
    getTeamSource(match.winner);

  document.getElementById(
    "resultTeams"
  ).innerHTML = `
    <strong>
      ${home?.team.name || "-"}
    </strong>

    <span style="color:#8992a5">
      vs
    </span>

    <strong>
      ${away?.team.name || "-"}
    </strong>
  `;

  document.getElementById(
    "resultScore"
  ).textContent =
    `${match.homeScore} - ${match.awayScore}`;

  document.getElementById(
    "resultWinner"
  ).textContent =
    `🏆 ${winner?.team.name || "-"}`;

  const userWon =
    match.winner === game.team;

  document.getElementById(
    "resultMessage"
  ).textContent =
    userWon
      ? "Mantap! Tim lu menang."
      : "Kali ini belum berhasil. Gas lagi di match berikutnya.";

}


function finishMatch() {

  checkRegularSeason();

  renderDashboard();

  showScreen("dashboardScreen");

}


function checkRegularSeason() {

  const remaining =
    game.schedule.some(
      match => !match.played
    );

  if (remaining) return;

  finishRegularSeason();

}


/* =========================================================
   STANDINGS
   ========================================================= */

function getSortedStandings() {

  return [...game.standings].sort(
    (a, b) => {

      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.diff !== a.diff) {
        return b.diff - a.diff;
      }

      return b.mapWin - a.mapWin;

    }
  );

}


function finishRegularSeason() {

  const ranking =
    getSortedStandings();

  const position =
    ranking.findIndex(
      s => s.teamId === game.team
    ) + 1;

  if (position <= 4) {

    startPlayoffs();

  } else {

    finishSeason(null);

  }

}


/* =========================================================
   PLAYOFF
   ========================================================= */

function startPlayoffs() {

  const ranking =
    getSortedStandings()
      .slice(0, 4);

  const semi1 = {

    id: "playoff-sf-1",

    matchday: null,

    stage: "semifinal",

    home: ranking[0].teamId,

    away: ranking[3].teamId,

    played: false,

    winner: null,

    homeScore: null,

    awayScore: null

  };

  const semi2 = {

    id: "playoff-sf-2",

    matchday: null,

    stage: "semifinal",

    home: ranking[1].teamId,

    away: ranking[2].teamId,

    played: false,

    winner: null,

    homeScore: null,

    awayScore: null

  };

  game.schedule.push(
    semi1,
    semi2
  );

  game.currentMatch =
    semi1.id;

  playPlayoffMatch(semi1);

}


function playPlayoffMatch(match) {

  const winner =
    simulateGenericWinner(
      match.home,
      match.away
    );

  const score =
    generateBO3(
      winner,
      match
    );

  match.played = true;

  match.winner = winner;

  match.homeScore = score.home;

  match.awayScore = score.away;

  saveGame(false);

  setTimeout(() => {

    const nextSemi =
      game.schedule.find(
        m =>
          m.stage === "semifinal" &&
          !m.played
      );

    if (nextSemi) {

      game.currentMatch =
        nextSemi.id;

      playPlayoffMatch(nextSemi);

    } else {

      startGrandFinal();

    }

  }, 150);

}


function startGrandFinal() {

  const semifinal =
    game.schedule.filter(
      m => m.stage === "semifinal"
    );

  const finalists =
    semifinal.map(m => m.winner);

  const final = {

    id: "playoff-final",

    matchday: null,

    stage: "grand-final",

    home: finalists[0],

    away: finalists[1],

    played: false,

    winner: null,

    homeScore: null,

    awayScore: null

  };

  game.schedule.push(final);

  game.currentMatch =
    final.id;

  const winner =
    simulateGenericWinner(
      final.home,
      final.away
    );

  const score =
    generateBO3(
      winner,
      final
    );

  final.played = true;

  final.winner = winner;

  final.homeScore = score.home;

  final.awayScore = score.away;

  const champion =
    getTeamSource(winner);

  setTimeout(() => {

    alert(
      `🏆 GRAND FINAL\n\nChampion:\n${champion?.team.name || winner}`
    );

    finishSeason(winner);

  }, 150);

}


/* =========================================================
   GENERIC MATCH
   ========================================================= */

function simulateGenericWinner(homeId, awayId) {

  const homeRating =
    teamRating(homeId);

  const awayRating =
    teamRating(awayId);

  const total =
    homeRating + awayRating;

  const chance =
    homeRating / total;

  return Math.random() < chance
    ? homeId
    : awayId;

}


/* =========================================================
   SEASON END
   ========================================================= */

function finishSeason(championId) {

  const ranking =
    getSortedStandings();

  const position =
    ranking.findIndex(
      s => s.teamId === game.team
    ) + 1;

  let championName = "-";

  if (championId) {

    championName =
      getTeamSource(championId)
        ?.team.name || championId;

  } else if (ranking.length) {

    championName =
      getTeamSource(ranking[0].teamId)
        ?.team.name || "-";

  }

  const reward =
    calculateSeasonReward(
      position,
      championId
    );

  game.budget += reward;

  updateReputation(
    position,
    championId
  );

  processSeasonDevelopment();

  processContracts();

  addSeasonHistory(
    position,
    championName
  );

  game.year++;

  game.league =
    game.league;

  game.world =
    createWorldState();

  alert(
    `SEASON SELESAI!\n\n` +
    `Posisi: #${position}\n` +
    `Champion: ${championName}\n` +
    `Reward: ${money(reward)}\n\n` +
    `Season berikutnya: ${game.year}`
  );

  createSeason();

  saveGame(false);

  renderDashboard();

}


function calculateSeasonReward(position, championId) {

  if (championId === game.team) {
    return 300000;
  }

  if (position <= 3) {
    return 180000;
  }

  if (position <= 4) {
    return 120000;
  }

  return 50000;

}


function updateReputation(position, championId) {

  let change = 0;

  if (championId === game.team) {
    change += 15;
  } else if (position === 2) {
    change += 10;
  } else if (position === 3) {
    change += 6;
  } else if (position <= 4) {
    change += 2;
  } else {
    change -= 5;
  }

  game.reputation =
    clamp(
      game.reputation + change,
      0,
      100
    );

}


/* =========================================================
   PLAYER DEVELOPMENT
   ========================================================= */

function processSeasonDevelopment() {

  getAllLeagues().forEach(league => {

    league.teams.forEach(team => {

      team.players.forEach(player => {

        player.age =
          Number(player.age || 20) + 1;

        const rating =
          Number(player.rating || 50);

        const potential =
          Number(player.potential || rating);

        let change = 0;

        if (rating < potential) {

          if (player.age <= 23) {

            change =
              random(1, 4);

          } else if (player.age <= 26) {

            change =
              random(0, 2);

          }

        }

        if (player.age >= 28) {

          change -=
            random(0, 3);

        }

        player.rating =
          clamp(
            rating + change,
            1,
            100
          );

        player.morale =
          clamp(
            Number(player.morale || 70) +
            random(-8, 8),
            0,
            100
          );

      });

    });

  });

}


/* =========================================================
   CONTRACTS
   ========================================================= */

function processContracts() {

  getAllLeagues().forEach(league => {

    league.teams.forEach(team => {

      team.players =
        team.players.filter(player => {

          player.contractYears =
            Math.max(
              0,
              Number(player.contractYears || 1) - 1
            );

          if (player.contractYears <= 0) {

            const chance =
              Math.random();

            if (
              team.id === game.team &&
              chance < 0.65
            ) {

              game.requests.push({

                playerId: player.id,

                playerName: player.name,

                type: "contract",

                demand:
                  Math.round(
                    (player.salary || 10000) *
                    1.25
                  )

              });

              player.contractYears = 1;

              return true;

            }

            return false;

          }

          return true;

        });

    });

  });

}


/* =========================================================
   ADVANCE DAY
   ========================================================= */

function advanceDay() {

  const next =
    game.schedule.find(
      match =>
        !match.played &&
        (
          match.home === game.team ||
          match.away === game.team
        )
    );

  if (!next) {

    checkRegularSeason();

    return;
  }

  const previousMatchday =
    game.schedule
      .filter(m => m.played)
      .reduce(
        (max, m) =>
          Math.max(
            max,
            Number(m.matchday || 0)
          ),
        0
      );

  if (
    next.matchday >
    previousMatchday
  ) {

    alert(
      `Match berikutnya adalah Matchday ${next.matchday}.`
    );

  }

  playNextMatch();

}


/* =========================================================
   WORLD RANKING
   ========================================================= */

function createWorldState() {

  return {

    ranking:
      calculateWorldRanking(),

    msc: {

      qualified: false,

      completed: false,

      champion: null,

      matches: [],

      teams: []

    },

    mSeries: {

      qualified: false,

      completed: false,

      champion: null,

      matches: [],

      teams: []

    }

  };

}


function calculateWorldRanking() {

  const teams = [];

  getAllLeagues().forEach(league => {

    league.teams.forEach(team => {

      const rating =
        teamRatingFromData(team);

      const existing =
        game.history.filter(
          h =>
            h.championId === team.id
        ).length;

      const points =
        rating * 10 +
        existing * 100;

      teams.push({

        teamId: team.id,

        name: team.name,

        region: league.region,

        rating,

        points

      });

    });

  });

  return teams.sort(
    (a, b) =>
      b.points - a.points
  );

}


function openWorld() {

  ensureWorldState();

  renderWorld();

  showScreen("worldScreen");

}


function ensureWorldState() {

  if (!game.world) {

    game.world =
      createWorldState();

  }

  if (!Array.isArray(game.world.ranking)) {

    game.world.ranking =
      calculateWorldRanking();

  }

  if (!game.world.msc) {

    game.world.msc = {

      qualified: false,

      completed: false,

      champion: null,

      matches: [],

      teams: []

    };

  }

  if (!game.world.mSeries) {

    game.world.mSeries = {

      qualified: false,

      completed: false,

      champion: null,

      matches: [],

      teams: []

    };

  }

}


function renderWorld() {

  ensureWorldState();

  const ranking =
    calculateWorldRanking();

  game.world.ranking =
    ranking;

  const container =
    document.getElementById(
      "worldRanking"
    );

  container.innerHTML =
    ranking.map((team, index) => `

      <div class="world-row">

        <div class="rank">
          #${index + 1}
        </div>

        <div class="world-team">

          <strong>
            ${team.name}
          </strong>

          <span>
            ${team.region} • ${team.points} pts
          </span>

        </div>

        <div class="world-rating">
          ${team.rating}
        </div>

      </div>

    `).join("");

  renderTournamentStatus();

  renderInternationalTransfer();

}


function renderTournamentStatus() {

  const msc =
    document.getElementById("mscStatus");

  const mseries =
    document.getElementById("mSeriesStatus");

  if (
    game.world.msc.completed
  ) {

    msc.innerHTML = `
      <p class="success">
        🏆 Champion:
        ${game.world.msc.champion}
      </p>
    `;

  } else if (
    game.world.msc.qualified
  ) {

    msc.innerHTML = `
      <p class="warning">
        Qualified — tournament tersedia.
      </p>
    `;

  } else {

    msc.innerHTML = `
      <p class="empty">
        Belum qualified.
      </p>
    `;

  }

  if (
    game.world.mSeries.completed
  ) {

    mseries.innerHTML = `
      <p class="success">
        👑 Champion:
        ${game.world.mSeries.champion}
      </p>
    `;

  } else if (
    game.world.mSeries.qualified
  ) {

    mseries.innerHTML = `
      <p class="warning">
        Qualified — tournament tersedia.
      </p>
    `;

  } else {

    mseries.innerHTML = `
      <p class="empty">
        Belum qualified.
      </p>
    `;

  }

}


/* =========================================================
   MSC QUALIFICATION
   ========================================================= */

function checkMSCQualification() {

  const ranking =
    getSortedStandings();

  const position =
    ranking.findIndex(
      s => s.teamId === game.team
    ) + 1;

  return position > 0 &&
    position <= 3;

}


function openMSC() {

  if (
    game.world.msc.completed
  ) {

    renderTournament(
      "msc"
    );

    showScreen("tournamentScreen");

    return;
  }

  if (
    !checkMSCQualification()
  ) {

    alert(
      "Lu harus finish Top 3 regular season untuk membuka MSC."
    );

    return;
  }

  if (
    game.world.msc.qualified
  ) {

    renderTournament(
      "msc"
    );

    showScreen("tournamentScreen");

    return;
  }

  const teams =
    getMSCTeams();

  game.world.msc.qualified =
    true;

  game.world.msc.teams =
    teams;

  game.world.msc.matches =
    createKnockoutMatches(
      teams,
      "msc"
    );

  saveGame(false);

  renderTournament("msc");

  showScreen("tournamentScreen");

}


function getMSCTeams() {

  const ranking =
    getSortedStandings();

  const topLocal =
    ranking
      .slice(0, 3)
      .map(
        s => s.teamId
      );

  const world =
    calculateWorldRanking();

  const foreign =
    world
      .filter(
        team =>
          !topLocal.includes(
            team.teamId
          ) &&
          team.region !==
            getCurrentLeague().region
      )
      .slice(0, 5)
      .map(
        team =>
          team.teamId
      );

  return [
    ...topLocal,
    ...foreign
  ].slice(0, 8);

}


/* =========================================================
   M-SERIES
   ========================================================= */

function openMSeries() {

  if (
    !game.world.msc.completed
  ) {

    alert(
      "M-Series baru terbuka setelah MSC selesai."
    );

    return;
  }

  if (
    game.world.mSeries.completed ||
    game.world.mSeries.qualified
  ) {

    renderTournament(
      "mseries"
    );

    showScreen("tournamentScreen");

    return;
  }

  const teams =
    getMSeriesTeams();

  game.world.mSeries.qualified =
    true;

  game.world.mSeries.teams =
    teams;

  game.world.mSeries.matches =
    createKnockoutMatches(
      teams,
      "mseries"
    );

  saveGame(false);

  renderTournament("mseries");

  showScreen("tournamentScreen");

}


function getMSeriesTeams() {

  const ranking =
    calculateWorldRanking();

  const result = [];

  if (
    game.world.msc.championId
  ) {

    result.push(
      game.world.msc.championId
    );

  }

  ranking.forEach(team => {

    if (
      result.length >= 8
    ) return;

    if (
      !result.includes(team.teamId)
    ) {

      result.push(team.teamId);

    }

  });

  return result.slice(0, 8);

}


/* =========================================================
   TOURNAMENT SYSTEM
   ========================================================= */

function createKnockoutMatches(
  teams,
  type
) {

  const matches = [];

  for (
    let i = 0;
    i < teams.length;
    i += 2
  ) {

    if (!teams[i + 1]) break;

    matches.push({

      id:
        `${type}-r1-${i}`,

      tournament:
        type,

      round: 1,

      home:
        teams[i],

      away:
        teams[i + 1],

      played: false,

      winner: null,

      homeScore: null,

      awayScore: null

    });

  }

  return matches;

}


function renderTournament(type) {

  const isMSC =
    type === "msc";

  const data =
    isMSC
      ? game.world.msc
      : game.world.mSeries;

  document.getElementById(
    "tournamentTitle"
  ).textContent =
    isMSC
      ? "🏆 MSC"
      : "👑 M-Series";

  document.getElementById(
    "tournamentSubtitle"
  ).textContent =
    isMSC
      ? "Mid Season Cup"
      : "World Championship";

  const container =
    document.getElementById(
      "tournamentContent"
    );

  if (
    data.completed
  ) {

    container.innerHTML = `

      <div class="card result-card">

        <h2>
          🏆 Champion
        </h2>

        <div class="big-score">
          ${data.champion}
        </div>

      </div>

    `;

    return;

  }

  if (!data.matches.length) {

    container.innerHTML =
      `<div class="empty">Tournament belum dimulai.</div>`;

    return;
  }

  container.innerHTML = `

    <div class="card">

      <h3>
        ${data.matches[0].round === 1
          ? "Quarterfinal / Round 1"
          : "Next Round"}
      </h3>

      <button
        class="primary"
        onclick="playInternationalTournament('${type}')"
      >
        ⚔️ PLAY TOURNAMENT
      </button>

    </div>

    ${data.matches.map(match => {

      const home =
        getTeamSource(match.home);

      const away =
        getTeamSource(match.away);

      return `

        <div class="tournament-match">

          <h4>
            Round ${match.round}
          </h4>

          <div class="tournament-teams">

            <span>
              ${home?.team.name || "-"}
            </span>

            <strong>
              ${
                match.played
                  ? `${match.homeScore}-${match.awayScore}`
                  : "VS"
              }
            </strong>

            <span>
              ${away?.team.name || "-"}
            </span>

          </div>

        </div>

      `;

    }).join("")}

  `;

}


function playInternationalTournament(type) {

  const data =
    type === "msc"
      ? game.world.msc
      : game.world.mSeries;

  const currentRound =
    Math.min(
      ...data.matches
        .filter(m => !m.played)
        .map(m => m.round)
    );

  const matches =
    data.matches.filter(
      m =>
        !m.played &&
        m.round === currentRound
    );

  matches.forEach(match => {

    const winner =
      simulateGenericWinner(
        match.home,
        match.away
      );

    const score =
      generateBO3(
        winner,
        match
      );

    match.played = true;

    match.winner = winner;

    match.homeScore =
      score.home;

    match.awayScore =
      score.away;

  });

  const winners =
    data.matches
      .filter(
        m =>
          m.round === currentRound &&
          m.played
      )
      .map(
        m => m.winner
      );

  const remaining =
    data.matches.some(
      m =>
        !m.played
    );

  if (!remaining) {

    if (winners.length === 1) {

      completeInternationalTournament(
        type,
        winners[0]
      );

      return;

    }

    const nextRound =
      currentRound + 1;

    data.matches =
      data.matches.filter(
        m =>
          m.round !== currentRound
      );

    for (
      let i = 0;
      i < winners.length;
      i += 2
    ) {

      if (!winners[i + 1]) break;

      data.matches.push({

        id:
          `${type}-r${nextRound}-${i}`,

        tournament:
          type,

        round:
          nextRound,

        home:
          winners[i],

        away:
          winners[i + 1],

        played: false,

        winner: null,

        homeScore: null,

        awayScore: null

      });

    }

  }

  saveGame(false);

  renderTournament(type);

}


function completeInternationalTournament(
  type,
  championId
) {

  const data =
    type === "msc"
      ? game.world.msc
      : game.world.mSeries;

  const champion =
    getTeamSource(championId);

  data.completed = true;

  data.championId =
    championId;

  data.champion =
    champion?.team.name || championId;

  if (type === "msc") {

    game.budget += 400000;

    game.reputation =
      clamp(
        game.reputation + 12,
        0,
        100
      );

  } else {

    game.budget += 1000000;

    game.reputation =
      clamp(
        game.reputation + 25,
        0,
        100
      );

  }

  addInternationalHistory(
    type,
    data.champion
  );

  saveGame(false);

  alert(
    `🏆 ${type === "msc" ? "MSC" : "M-Series"} Champion:\n\n${data.champion}`
  );

  renderTournament(type);

}


/* =========================================================
   INTERNATIONAL TRANSFER
   ========================================================= */

function renderInternationalTransfer() {

  const container =
    document.getElementById(
      "internationalTransfer"
    );

  if (!container) return;

  const players =
    getInternationalPlayers()
      .slice(0, 5);

  if (!players.length) {

    container.innerHTML =
      `<div class="empty">Tidak ada player internasional.</div>`;

    return;
  }

  container.innerHTML =
    players.map(player => `

      <div class="player-card">

        <div class="player-top">

          <div>
            <div class="player-name">
              ${player.name}
            </div>

            <div class="player-role">
              ${player.role}
            </div>
          </div>

          <div class="rating">
            ${player.rating}
          </div>

        </div>

        <div class="player-meta">

          <span class="badge">
            ${player.nationality}
          </span>

          <span class="badge">
            Age ${player.age}
          </span>

          <span class="badge">
            POT ${player.potential}
          </span>

        </div>

      </div>

    `).join("");

}


function getInternationalPlayers() {

  const region =
    getCurrentLeague()?.region;

  const players = [];

  getAllLeagues().forEach(league => {

    if (league.region === region) {
      return;
    }

    league.teams.forEach(team => {

      team.players.forEach(player => {

        players.push({

          ...player,

          sourceTeamId: team.id,

          sourceLeagueId: league.id

        });

      });

    });

  });

  return players.sort(
    (a, b) =>
      b.rating - a.rating
  );

}


/* =========================================================
   HISTORY
   ========================================================= */

function addSeasonHistory(
  position,
  champion
) {

  game.history.unshift({

    year:
      game.year,

    teamId:
      game.team,

    teamName:
      getCurrentTeamName(),

    position,

    champion,

    championId:
      champion === getCurrentTeamName()
        ? game.team
        : null

  });

}


function addInternationalHistory(
  tournament,
  champion
) {

  game.history.unshift({

    year:
      game.year,

    teamId:
      game.team,

    teamName:
      getCurrentTeamName(),

    tournament,

    champion

  });

}


function openHistory() {

  renderHistory();

  showScreen("historyScreen");

}


function renderHistory() {

  const container =
    document.getElementById(
      "historyList"
    );

  if (!game.history.length) {

    container.innerHTML =
      `<div class="empty">Belum ada history.</div>`;

    return;
  }

  container.innerHTML =
    game.history.map(history => {

      if (history.tournament) {

        return `

          <div class="history-card">

            <strong>
              ${history.year} • ${history.tournament.toUpperCase()}
            </strong>

            <p style="margin-top:8px;color:#8992a5">
              Champion:
              ${history.champion}
            </p>

          </div>

        `;

      }

      return `

        <div class="history-card">

          <strong>
            Season ${history.year}
          </strong>

          <p style="margin-top:8px">
            ${history.teamName}
          </p>

          <p style="margin-top:6px;color:#8992a5">
            Regular Season:
            #${history.position}
          </p>

          <p style="margin-top:6px;color:#8992a5">
            Champion:
            ${history.champion}
          </p>

        </div>

      `;

    }).join("");

}


/* =========================================================
   SAVE / LOAD
   ========================================================= */

function saveGame(showMessage = false) {

  try {

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );

    if (showMessage) {
      alert("Game berhasil disimpan.");
    }

  } catch (error) {

    console.error(
      "Save error:",
      error
    );

  }

}


function loadGame() {

  try {

    const saved =
      localStorage.getItem(
        SAVE_KEY
      );

    if (!saved) return false;

    const parsed =
      JSON.parse(saved);

    if (!parsed || !parsed.careerStarted) {
      return false;
    }

    game = {

      ...game,

      ...parsed,

      world: {

        ...game.world,

        ...(parsed.world || {}),

        msc: {

          ...game.world.msc,

          ...(parsed.world?.msc || {})

        },

        mSeries: {

          ...game.world.mSeries,

          ...(parsed.world?.mSeries || {})

        }

      }

    };

    return true;

  } catch (error) {

    console.error(
      "Load error:",
      error
    );

    return false;

  }

}


/* =========================================================
   RESTART
   ========================================================= */

function restartGame() {

  const confirmRestart =
    confirm(
      "Yakin mau restart career? Semua save akan dihapus."
    );

  if (!confirmRestart) return;

  localStorage.removeItem(
    SAVE_KEY
  );

  location.reload();

}


/* =========================================================
   INIT
   ========================================================= */

function init() {

  renderCountries();

  const loaded =
    loadGame();

  if (loaded) {

    selectedTarget =
      game.target || "top3";

    renderDashboard();

    showScreen(
      "dashboardScreen"
    );

  } else {

    showScreen(
      "countryScreen"
    );

  }

}


init();
