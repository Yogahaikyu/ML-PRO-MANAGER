/* =========================================================
   MLBB PRO MANAGER
   V0.4
   MATCH SCREEN + BO3
========================================================= */

let leagues = [
  MPL_ID_2026,
  MPL_PH_2026,
  MPL_KH_2026
];

let game = {

  year: 2026,

  country: null,
  league: null,
  team: null,

  budget: 500000,
  reputation: 50,

  standings: [],
  schedule: [],

  currentMatch: null,

  starters: [],

  careerStarted: false
};


/* =========================================================
   SAVE / LOAD
========================================================= */

function saveGame() {

  localStorage.setItem(
    "mlbb_pro_manager_save",
    JSON.stringify(game)
  );

}


function loadGame() {

  const save = localStorage.getItem(
    "mlbb_pro_manager_save"
  );

  if (!save) return;

  try {

    game = JSON.parse(save);

    if (game.careerStarted) {

      renderDashboard();
      showScreen("dashboardScreen");

    }

  } catch (error) {

    console.log("Save corrupt");

  }

}


/* =========================================================
   SCREEN
========================================================= */

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.add("hidden");

    });

  const target = document.getElementById(id);

  if (target) {
    target.classList.remove("hidden");
  }

}


function backToDashboard() {

  showScreen("dashboardScreen");

  renderDashboard();

}


/* =========================================================
   COUNTRY
========================================================= */

function renderCountries() {

  const container =
    document.getElementById("countryList");

  if (!container) return;

  container.innerHTML = "";

  countries.forEach(country => {

    const button =
      document.createElement("button");

    button.className = "country-card";

    button.innerHTML = `
      <strong>${country.name}</strong>
    `;

    button.onclick = () =>
      selectCountry(country.id);

    container.appendChild(button);

  });

}


function selectCountry(countryId) {

  const country =
    countries.find(c => c.id === countryId);

  if (!country) return;

  game.country = country;

  renderLeagues();

  showScreen("leagueScreen");

}


/* =========================================================
   LEAGUE
========================================================= */

function renderLeagues() {

  const container =
    document.getElementById("leagueList");

  if (!container) return;

  container.innerHTML = "";

  const available =
    leagues.filter(
      league =>
        league.country === game.country.id
    );

  available.forEach(league => {

    const button =
      document.createElement("button");

    button.className = "league-card";

    button.innerHTML = `
      <strong>${league.name}</strong>
      <span>${league.teams.length} Teams</span>
    `;

    button.onclick = () =>
      selectLeague(league);

    container.appendChild(button);

  });

}


function selectLeague(league) {

  game.league = league;

  renderTeams();

  showScreen("teamScreen");

}


/* =========================================================
   TEAM
========================================================= */

function renderTeams() {

  const container =
    document.getElementById("teamList");

  if (!container) return;

  container.innerHTML = "";

  game.league.teams.forEach(team => {

    const button =
      document.createElement("button");

    button.className = "team-card";

    button.innerHTML = `
      <strong>${team.name}</strong>
      <span>${team.players.length} Players</span>
    `;

    button.onclick = () =>
      selectTeam(team);

    container.appendChild(button);

  });

}


function selectTeam(team) {

  game.team = team;

  game.careerStarted = true;

  createStarters();

  createStandings();

  createSeasonSchedule();

  saveGame();

  renderDashboard();

  showScreen("dashboardScreen");

}


/* =========================================================
   STARTING 5
========================================================= */

function createStarters() {

  if (!game.team) return;

  const players =
    [...game.team.players];

  players.sort(
    (a, b) =>
      (b.rating || 0) -
      (a.rating || 0)
  );

  game.starters =
    players
      .slice(0, 5)
      .map(player => player.id);

}


function getStarters() {

  if (!game.team) return [];

  return game.team.players.filter(
    player =>
      game.starters.includes(player.id)
  );

}


function toggleStarter(playerId) {

  if (
    game.starters.includes(playerId)
  ) {

    game.starters =
      game.starters.filter(
        id => id !== playerId
      );

  } else {

    if (game.starters.length >= 5) {

      alert("Starting 5 sudah penuh.");

      return;

    }

    game.starters.push(playerId);

  }

  saveGame();

  renderRoster();

}


/* =========================================================
   TEAM RATING
========================================================= */

function calculateTeamRating(team) {

  if (!team) return 0;

  const players =
    team === game.team
      ? getStarters()
      : team.players
          .slice()
          .sort(
            (a, b) =>
              (b.rating || 0) -
              (a.rating || 0)
          )
          .slice(0, 5);

  if (!players.length) return 0;

  const average =
    players.reduce(
      (sum, player) =>
        sum + (player.rating || 0),
      0
    ) / players.length;

  const roles =
    new Set(
      players.map(
        player => player.role
      )
    );

  let bonus = 0;

  if (roles.size >= 5) {

    bonus = 3;

  } else if (roles.size >= 4) {

    bonus = 1;

  } else {

    bonus = -3;

  }

  return Math.round(
    average +
    bonus +
    2
  );

}


/* =========================================================
   WIN PROBABILITY
========================================================= */

function calculateWinProbability(
  myRating,
  enemyRating
) {

  const difference =
    myRating - enemyRating;

  let probability =
    50 + difference * 2;

  probability =
    Math.max(
      10,
      Math.min(
        90,
        probability
      )
    );

  return Math.round(probability);

}


/* =========================================================
   SCHEDULE
========================================================= */

function createSeasonSchedule() {

  if (!game.league || !game.team)
    return;

  game.schedule = [];

  game.league.teams.forEach(team => {

    if (
      team.id === game.team.id
    ) return;

    game.schedule.push({

      opponentId: team.id,

      played: false,

      result: null,

      myGames: 0,

      opponentGames: 0

    });

  });

}


function getTeamById(id) {

  return game.league.teams.find(
    team => team.id === id
  );

}


function getNextMatch() {

  return game.schedule.find(
    match => !match.played
  );

}


/* =========================================================
   OPEN MATCH SCREEN
========================================================= */

function openNextMatch() {

  if (!game.careerStarted) {

    alert(
      "Mulai career terlebih dahulu."
    );

    return;

  }

  const match =
    getNextMatch();

  if (!match) {

    alert(
      "Semua pertandingan musim ini sudah selesai."
    );

    return;

  }

  game.currentMatch = match;

  renderMatchScreen();

  showScreen("matchScreen");

}


/* =========================================================
   MATCH SCREEN
========================================================= */

function renderMatchScreen() {

  const match =
    game.currentMatch;

  if (!match) return;

  const opponent =
    getTeamById(
      match.opponentId
    );

  if (!opponent) return;

  const myRating =
    calculateTeamRating(
      game.team
    );

  const enemyRating =
    calculateTeamRating(
      opponent
    );

  const probability =
    calculateWinProbability(
      myRating,
      enemyRating
    );

  document.getElementById(
    "myTeamName"
  ).textContent =
    game.team.name;

  document.getElementById(
    "enemyTeamName"
  ).textContent =
    opponent.name;

  document.getElementById(
    "myTeamRating"
  ).textContent =
    `Rating: ${myRating}`;

  document.getElementById(
    "enemyTeamRating"
  ).textContent =
    `Rating: ${enemyRating}`;

  document.getElementById(
    "winProbability"
  ).textContent =
    `${probability}%`;

  renderMatchStarters();

  const result =
    document.getElementById(
      "matchResult"
    );

  result.classList.add("hidden");

  document.getElementById(
    "playMatchButton"
  ).disabled = false;

}


/* =========================================================
   MATCH STARTERS
========================================================= */

function renderMatchStarters() {

  const container =
    document.getElementById(
      "matchStarters"
    );

  if (!container) return;

  container.innerHTML = "";

  const players =
    getStarters();

  players.forEach(player => {

    const div =
      document.createElement("div");

    div.className =
      "match-player";

    div.innerHTML = `

      <div>
        <strong>
          ${player.name}
        </strong>

        <div class="match-player-role">
          ${player.role}
        </div>
      </div>

      <strong>
        ${player.rating}
      </strong>

    `;

    container.appendChild(div);

  });

}


/* =========================================================
   SIMULATE BO3
========================================================= */

function simulateCurrentMatch() {

  const match =
    game.currentMatch;

  if (!match) return;

  if (game.starters.length !== 5) {

    alert(
      "Pilih tepat 5 pemain sebagai Starting 5."
    );

    return;

  }

  const opponent =
    getTeamById(
      match.opponentId
    );

  if (!opponent) return;

  const myRating =
    calculateTeamRating(
      game.team
    );

  const enemyRating =
    calculateTeamRating(
      opponent
    );

  const probability =
    calculateWinProbability(
      myRating,
      enemyRating
    );

  const roll =
    Math.random() * 100;

  const won =
    roll < probability;

  let myGames;
  let enemyGames;

  if (won) {

    if (Math.random() < 0.58) {

      myGames = 2;
      enemyGames = 0;

    } else {

      myGames = 2;
      enemyGames = 1;

    }

  } else {

    if (Math.random() < 0.58) {

      myGames = 0;
      enemyGames = 2;

    } else {

      myGames = 1;
      enemyGames = 2;

    }

  }

  match.played = true;

  match.myGames = myGames;

  match.opponentGames =
    enemyGames;

  match.result =
    won ? "WIN" : "LOSS";

  updateStandings(
    game.team.id,
    opponent.id,
    won,
    myGames,
    enemyGames
  );

  if (won) {

    game.reputation += 2;

  } else {

    game.reputation =
      Math.max(
        0,
        game.reputation - 1
      );

  }

  saveGame();

  showMatchResult(
    opponent,
    won,
    myGames,
    enemyGames
  );

}


/* =========================================================
   RESULT
========================================================= */

function showMatchResult(
  opponent,
  won,
  myGames,
  enemyGames
) {

  const result =
    document.getElementById(
      "matchResult"
    );

  result.classList.remove(
    "hidden"
  );

  result.className =
    `match-result ${
      won
        ? "result-win"
        : "result-loss"
    }`;

  result.innerHTML = `

    <h2>
      ${won
        ? "🏆 VICTORY"
        : "💀 DEFEAT"}
    </h2>

    <p>
      ${game.team.name}
      vs
      ${opponent.name}
    </p>

    <div class="result-score">
      ${myGames} - ${enemyGames}
    </div>

    <p>
      ${won
        ? "Kamu mendapatkan 3 poin!"
        : "Belum berhasil mendapatkan poin."}
    </p>

    <button
      class="primary-button"
      onclick="finishMatch()">
      CONTINUE
    </button>

  `;

  document.getElementById(
    "playMatchButton"
  ).disabled = true;

}


/* =========================================================
   FINISH MATCH
========================================================= */

function finishMatch() {

  game.currentMatch = null;

  saveGame();

  renderDashboard();

  showScreen(
    "dashboardScreen"
  );

}


/* =========================================================
   STANDINGS
========================================================= */

function createStandings() {

  if (!game.league) return;

  game.standings =
    game.league.teams.map(
      team => ({

        teamId: team.id,

        played: 0,

        wins: 0,

        losses: 0,

        gameWins: 0,

        gameLosses: 0,

        points: 0

      })
    );

}


function updateStandings(
  myTeamId,
  opponentId,
  won,
  myGames,
  opponentGames
) {

  const mine =
    game.standings.find(
      s =>
        s.teamId === myTeamId
    );

  const enemy =
    game.standings.find(
      s =>
        s.teamId === opponentId
    );

  if (!mine || !enemy)
    return;

  mine.played++;

  enemy.played++;

  mine.gameWins += myGames;

  mine.gameLosses +=
    opponentGames;

  enemy.gameWins +=
    opponentGames;

  enemy.gameLosses +=
    myGames;

  if (won) {

    mine.wins++;

    mine.points += 3;

    enemy.losses++;

  } else {

    enemy.wins++;

    enemy.points += 3;

    mine.losses++;

  }

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  if (!game.team)
    return;

  updateDashboard();

  renderNextMatch();

  renderRoster();

  renderStandings();

}


function updateDashboard() {

  const name =
    document.getElementById(
      "teamName"
    );

  if (name) {

    name.textContent =
      game.team.name;

  }

  const budget =
    document.getElementById(
      "budget"
    );

  if (budget) {

    budget.textContent =
      formatMoney(
        game.budget
      );

  }

  const reputation =
    document.getElementById(
      "reputation"
    );

  if (reputation) {

    reputation.textContent =
      game.reputation;

  }

  const year =
    document.getElementById(
      "seasonYear"
    );

  if (year) {

    year.textContent =
      game.year;

  }

}


/* =========================================================
   NEXT MATCH DASHBOARD
========================================================= */

function renderNextMatch() {

  const container =
    document.getElementById(
      "nextMatch"
    );

  if (!container)
    return;

  const match =
    getNextMatch();

  if (!match) {

    container.innerHTML = `

      <div class="game-card">

        <h3>
          Season Complete
        </h3>

        <p>
          Semua pertandingan sudah dimainkan.
        </p>

      </div>

    `;

    return;

  }

  const opponent =
    getTeamById(
      match.opponentId
    );

  container.innerHTML = `

    <div class="game-card">

      <h3>
        ${game.team.name}
        vs
        ${opponent.name}
      </h3>

      <p>
        BO3
      </p>

      <button
        class="primary-button"
        onclick="openNextMatch()">
        OPEN MATCH
      </button>

    </div>

  `;

}


/* =========================================================
   ROSTER
========================================================= */

function renderRoster() {

  const container =
    document.getElementById(
      "rosterContainer"
    );

  if (!container)
    return;

  container.innerHTML = "";

  game.team.players.forEach(
    player => {

      const selected =
        game.starters.includes(
          player.id
        );

      const div =
        document.createElement("div");

      div.className =
        "match-player";

      div.innerHTML = `

        <div>

          <strong>
            ${player.name}
          </strong>

          <div class="match-player-role">
            ${player.role}
          </div>

        </div>

        <div>

          <strong>
            ${player.rating}
          </strong>

          <button
            onclick="toggleStarter('${player.id}')">
            ${selected
              ? "STARTER"
              : "SUB"}
          </button>

        </div>

      `;

      container.appendChild(div);

    }
  );

}


/* =========================================================
   STANDINGS UI
========================================================= */

function renderStandings() {

  const container =
    document.getElementById(
      "standingsContainer"
    );

  if (!container)
    return;

  const sorted =
    [...game.standings]
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.wins - a.wins ||
          (
            b.gameWins -
            b.gameLosses
          ) -
          (
            a.gameWins -
            a.gameLosses
          )
      );

  container.innerHTML = "";

  sorted.forEach(
    (standing, index) => {

      const team =
        getTeamById(
          standing.teamId
        );

      const div =
        document.createElement("div");

      div.className =
        "match-player";

      div.innerHTML = `

        <div>

          <strong>
            #${index + 1}
            ${team.name}
          </strong>

          <div class="match-player-role">
            ${standing.wins}W -
            ${standing.losses}L
          </div>

        </div>

        <strong>
          ${standing.points} PTS
        </strong>

      `;

      container.appendChild(div);

    }
  );

}


/* =========================================================
   SCHEDULE
========================================================= */

function showSchedule() {

  if (!game.schedule.length) {

    alert(
      "Schedule belum tersedia."
    );

    return;

  }

  let text =
    `SEASON ${game.year}\n\n`;

  game.schedule.forEach(
    (match, index) => {

      const opponent =
        getTeamById(
          match.opponentId
        );

      text +=
        `${index + 1}. ` +
        `${opponent.name} - ` +
        `${
          match.played
            ? match.result +
              ` ${match.myGames}-${match.opponentGames}`
            : "UPCOMING"
        }\n`;

    }
  );

  alert(text);

}


/* =========================================================
   TRANSFER / SCOUTING
========================================================= */

function showTransferMarket() {

  alert(
    "Transfer Market akan dibuat di V0.5."
  );

}


function showScouting() {

  alert(
    "Scouting System akan dibuat di V0.5."
  );

}


/* =========================================================
   MENU
========================================================= */

function setupMenu() {

  const roster =
    document.getElementById(
      "menuRoster"
    );

  if (roster) {

    roster.onclick = () => {

      renderRoster();

    };

  }

  const schedule =
    document.getElementById(
      "menuSchedule"
    );

  if (schedule) {

    schedule.onclick =
      showSchedule;

  }

  const transfer =
    document.getElementById(
      "menuTransfer"
    );

  if (transfer) {

    transfer.onclick =
      showTransferMarket;

  }

  const scouting =
    document.getElementById(
      "menuScouting"
    );

  if (scouting) {

    scouting.onclick =
      showScouting;

  }

}


/* =========================================================
   ADVANCE SEASON
========================================================= */

function advanceSeason() {

  const unfinished =
    game.schedule.some(
      match => !match.played
    );

  if (unfinished) {

    alert(
      "Selesaikan semua pertandingan sebelum lanjut season."
    );

    return;

  }

  developPlayers();

  game.year++;

  createStandings();

  createSeasonSchedule();

  createStarters();

  saveGame();

  renderDashboard();

  alert(
    `Selamat datang di Season ${game.year}!`
  );

}


/* =========================================================
   PLAYER DEVELOPMENT
========================================================= */

function developPlayers() {

  game.league.teams.forEach(
    team => {

      team.players.forEach(
        player => {

          player.age =
            (player.age || 20) + 1;

          const potential =
            player.potential ||
            90;

          let change = 0;

          if (player.age <= 21) {

            change =
              Math.random() < 0.8
                ? randomInt(1, 3)
                : -1;

          } else if (
            player.age <= 25
          ) {

            change =
              Math.random() < 0.65
                ? randomInt(0, 1)
                : -1;

          } else {

            change =
              Math.random() < 0.35
                ? -randomInt(1, 2)
                : 0;

          }

          if (
            player.rating < potential &&
            player.potential >= 94 &&
            change > 0
          ) {

            change++;

          }

          player.rating =
            Math.max(
              50,
              Math.min(
                potential,
                player.rating + change
              )
            );

        }
      );

    }
  );

}


/* =========================================================
   HELPERS
========================================================= */

function randomInt(min, max) {

  return Math.floor(
    Math.random() *
      (max - min + 1)
  ) + min;

}


function formatMoney(value) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(value);

}


/* =========================================================
   RESTART
========================================================= */

function restartGame() {

  if (
    !confirm(
      "Yakin ingin memulai game baru?"
    )
  ) return;

  localStorage.removeItem(
    "mlbb_pro_manager_save"
  );

  location.reload();

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderCountries();

    setupMenu();

    loadGame();

  }
);
