/*
=========================================
MLBB PRO MANAGER
VERSION 0.3
MATCH ENGINE
=========================================
*/

const leagues = [
  MPL_ID_2026,
  MPL_PH_2026,
  MPL_KH_2026
];


// =======================================
// GAME STATE
// =======================================

let game = {
  year: 2026,

  country: null,
  league: null,
  team: null,

  budget: 500000,
  reputation: 50,

  standings: {},

  schedule: [],

  currentMatch: 0,

  starters: [],

  careerStarted: false
};


// =======================================
// DOM
// =======================================

const countryScreen =
  document.getElementById("countryScreen");

const leagueScreen =
  document.getElementById("leagueScreen");

const teamScreen =
  document.getElementById("teamScreen");

const dashboardScreen =
  document.getElementById("dashboardScreen");

const countryList =
  document.getElementById("countryList");

const leagueList =
  document.getElementById("leagueList");

const teamList =
  document.getElementById("teamList");


// =======================================
// SCREEN
// =======================================

function showScreen(screen) {

  document
    .querySelectorAll(".screen")
    .forEach(element => {
      element.classList.remove("active");
    });

  if (screen) {
    screen.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// =======================================
// COUNTRIES
// =======================================

function renderCountries() {

  if (!countryList) return;

  countryList.innerHTML = "";

  countries.forEach(country => {

    const button =
      document.createElement("button");

    button.className = "option-button";

    button.innerHTML = `
      <strong>
        ${country.flag} ${country.name}
      </strong>

      <small>
        ${country.leagues.length} liga tersedia
      </small>
    `;

    button.onclick = () => {
      selectCountry(country.id);
    };

    countryList.appendChild(button);
  });
}


// =======================================
// SELECT COUNTRY
// =======================================

function selectCountry(countryId) {

  game.country =
    countries.find(
      country => country.id === countryId
    );

  if (!game.country) return;

  const title =
    document.getElementById(
      "selectedCountryTitle"
    );

  if (title) {
    title.textContent =
      game.country.name;
  }

  renderLeagues();

  showScreen(leagueScreen);
}


// =======================================
// LEAGUES
// =======================================

function renderLeagues() {

  if (!leagueList) return;

  leagueList.innerHTML = "";

  game.country.leagues.forEach(
    leagueId => {

      const league =
        leagues.find(
          item => item.id === leagueId
        );

      if (!league) return;

      const button =
        document.createElement("button");

      button.className =
        "option-button";

      button.innerHTML = `
        <strong>
          ${league.name}
        </strong>

        <small>
          Season ${league.season}
          • ${league.teams.length} teams
        </small>
      `;

      button.onclick = () => {
        selectLeague(league.id);
      };

      leagueList.appendChild(button);
    }
  );
}


// =======================================
// SELECT LEAGUE
// =======================================

function selectLeague(leagueId) {

  game.league =
    leagues.find(
      league => league.id === leagueId
    );

  if (!game.league) return;

  const title =
    document.getElementById(
      "selectedLeagueTitle"
    );

  if (title) {
    title.textContent =
      game.league.name;
  }

  renderTeams();

  showScreen(teamScreen);
}


// =======================================
// TEAMS
// =======================================

function renderTeams() {

  if (!teamList) return;

  teamList.innerHTML = "";

  game.league.teams.forEach(team => {

    const button =
      document.createElement("button");

    button.className =
      "team-button";

    button.innerHTML = `
      <div class="team-logo">
        ${team.short}
      </div>

      <div>
        <strong>
          ${team.name}
        </strong>

        <small>
          ${team.players.length}
          pemain
        </small>
      </div>
    `;

    button.onclick = () => {
      selectTeam(team.id);
    };

    teamList.appendChild(button);
  });
}


// =======================================
// SELECT TEAM
// =======================================

function selectTeam(teamId) {

  game.team =
    game.league.teams.find(
      team => team.id === teamId
    );

  if (!game.team) return;

  game.careerStarted = true;

  createStandings();

  createStarters();

  createSeasonSchedule();

  saveGame();

  renderDashboard();

  showScreen(dashboardScreen);
}


// =======================================
// CREATE STARTERS
// =======================================

function createStarters() {

  if (!game.team) return;

  const players =
    [...game.team.players];

  players.sort(
    (a, b) =>
      b.rating - a.rating
  );

  game.starters =
    players
      .slice(0, 5)
      .map(player => player.id);
}


// =======================================
// GET STARTERS
// =======================================

function getStarters() {

  if (!game.team) return [];

  return game.team.players.filter(
    player =>
      game.starters.includes(
        player.id
      )
  );
}


// =======================================
// CHANGE STARTER
// =======================================

function toggleStarter(playerId) {

  if (
    game.starters.includes(playerId)
  ) {

    if (game.starters.length <= 5) {
      alert(
        "Tim utama harus memiliki 5 pemain."
      );
      return;
    }

    game.starters =
      game.starters.filter(
        id => id !== playerId
      );

    saveGame();

    return;
  }

  if (game.starters.length >= 5) {

    alert(
      "Maksimal 5 pemain utama."
    );

    return;
  }

  game.starters.push(playerId);

  saveGame();
}


// =======================================
// TEAM RATING
// =======================================

function calculateTeamRating(team) {

  if (!team) return 0;

  let players;

  if (team.id === game.team.id) {

    players =
      getStarters();

  } else {

    players =
      [...team.players]
        .sort(
          (a, b) =>
            b.rating - a.rating
        )
        .slice(0, 5);
  }

  if (!players.length) return 0;

  const total =
    players.reduce(
      (sum, player) =>
        sum + player.rating,
      0
    );

  let rating =
    total / players.length;


  // =====================================
  // ROLE BALANCE
  // =====================================

  const roles =
    players.map(
      player => player.role
    );

  const requiredRoles = [
    "EXP",
    "Jungle",
    "Mid",
    "Gold",
    "Roam"
  ];

  const uniqueRoles =
    new Set(roles).size;

  if (uniqueRoles === 5) {

    rating += 3;

  } else if (uniqueRoles >= 4) {

    rating += 1;

  } else {

    rating -= 3;
  }


  // =====================================
  // CHEMISTRY
  // =====================================

  if (players.length === 5) {

    rating += 2;
  }


  return rating;
}


// =======================================
// WIN PROBABILITY
// =======================================

function calculateWinProbability(
  myTeam,
  enemyTeam
) {

  const myRating =
    calculateTeamRating(myTeam);

  const enemyRating =
    calculateTeamRating(enemyTeam);

  const difference =
    myRating - enemyRating;


  /*
  Base 50%.

  Setiap 1 rating difference
  memberi sekitar 2% perubahan.

  Dibatasi 10% - 90%.
  */

  let probability =
    50 + difference * 2;


  // Randomness

  probability +=
    (Math.random() * 10) - 5;


  probability =
    Math.max(
      10,
      Math.min(
        90,
        probability
      )
    );


  return probability;
}


// =======================================
// CREATE SCHEDULE
// =======================================

function createSeasonSchedule() {

  if (!game.league || !game.team) {
    return;
  }

  game.schedule = [];

  game.currentMatch = 0;

  const teams =
    game.league.teams;


  /*
  Setiap tim bertemu satu kali.

  Untuk tim yang dipilih,
  kita hanya membutuhkan
  pertandingan tim player.
  */

  teams.forEach(
    opponent => {

      if (
        opponent.id ===
        game.team.id
      ) {
        return;
      }

      game.schedule.push({

        week:
          game.schedule.length + 1,

        home:
          game.team.id,

        away:
          opponent.id,

        played: false,

        result: null

      });
    }
  );
}


// =======================================
// NEXT MATCH
// =======================================

function getNextMatch() {

  return game.schedule.find(
    match =>
      !match.played
  );
}


// =======================================
// GET TEAM
// =======================================

function getTeamById(teamId) {

  return game.league.teams.find(
    team =>
      team.id === teamId
  );
}


// =======================================
// PLAY MATCH
// =======================================

function playNextMatch() {

  if (!game.careerStarted) {

    alert(
      "Karier belum dimulai."
    );

    return;
  }


  const match =
    getNextMatch();


  if (!match) {

    alert(
      "Semua pertandingan regular season telah selesai."
    );

    return;
  }


  if (
    game.starters.length !== 5
  ) {

    alert(
      "Pilih 5 pemain utama terlebih dahulu."
    );

    return;
  }


  const enemy =
    getTeamById(
      match.away
    );


  if (!enemy) return;


  const probability =
    calculateWinProbability(
      game.team,
      enemy
    );


  const random =
    Math.random() * 100;


  const playerWin =
    random < probability;


  let playerScore;
  let enemyScore;


  // =====================================
  // BO3
  // =====================================

  if (playerWin) {

    const closeMatch =
      Math.random() < 0.42;

    if (closeMatch) {

      playerScore = 2;
      enemyScore = 1;

    } else {

      playerScore = 2;
      enemyScore = 0;
    }

  } else {

    const closeMatch =
      Math.random() < 0.42;

    if (closeMatch) {

      playerScore = 1;
      enemyScore = 2;

    } else {

      playerScore = 0;
      enemyScore = 2;
    }
  }


  // =====================================
  // UPDATE MATCH
  // =====================================

  match.played = true;

  match.result = {

    playerScore,

    enemyScore,

    playerWin,

    probability:

      Math.round(
        probability
      )

  };


  updateStandings(
    game.team.id,
    enemy.id,
    playerScore,
    enemyScore
  );


  game.currentMatch++;


  // =====================================
  // REPUTATION
  // =====================================

  if (playerWin) {

    game.reputation +=
      playerScore === 2 &&
      enemyScore === 0
        ? 2
        : 1;

  } else {

    game.reputation -= 1;
  }


  game.reputation =
    Math.max(
      0,
      Math.min(
        100,
        game.reputation
      )
    );


  saveGame();

  renderDashboard();

  showMatchResult(
    enemy,
    playerScore,
    enemyScore,
    probability
  );
}


// =======================================
// UPDATE STANDINGS
// =======================================

function updateStandings(
  myTeamId,
  enemyTeamId,
  myScore,
  enemyScore
) {

  const myStanding =
    game.standings[
      myTeamId
    ];

  const enemyStanding =
    game.standings[
      enemyTeamId
    ];


  if (!myStanding ||
      !enemyStanding) {

    return;
  }


  myStanding.played++;
  enemyStanding.played++;


  myStanding.gameWins +=
    myScore;

  myStanding.gameLosses +=
    enemyScore;

  enemyStanding.gameWins +=
    enemyScore;

  enemyStanding.gameLosses +=
    myScore;


  if (myScore > enemyScore) {

    myStanding.wins++;
    myStanding.points += 3;

    enemyStanding.losses++;

  } else {

    myStanding.losses++;

    enemyStanding.wins++;
    enemyStanding.points += 3;
  }
}


// =======================================
// CREATE STANDINGS
// =======================================

function createStandings() {

  game.standings = {};

  if (!game.league) return;

  game.league.teams.forEach(team => {

    game.standings[team.id] = {

      teamId:
        team.id,

      played: 0,

      wins: 0,

      losses: 0,

      points: 0,

      gameWins: 0,

      gameLosses: 0
    };
  });
}


// =======================================
// MATCH RESULT
// =======================================

function showMatchResult(
  enemy,
  playerScore,
  enemyScore,
  probability
) {

  const result =
    playerScore > enemyScore
      ? "MENANG 🏆"
      : "KALAH";


  alert(
    `${game.team.name}\n` +
    `vs\n` +
    `${enemy.name}\n\n` +

    `HASIL BO3\n` +

    `${game.team.short} ` +
    `${playerScore} - ` +
    `${enemyScore} ` +
    `${enemy.short}\n\n` +

    `${result}\n\n` +

    `Win Probability: ` +
    `${Math.round(probability)}%`
  );
}


// =======================================
// RENDER DASHBOARD
// =======================================

function renderDashboard() {

  updateDashboard();

  renderNextMatch();

  renderRoster();

  renderStandings();
}


// =======================================
// DASHBOARD BASIC
// =======================================

function updateDashboard() {

  const teamElement =
    document.getElementById(
      "dashboardTeam"
    );

  if (teamElement &&
      game.team) {

    teamElement.textContent =
      game.team.name;
  }


  const leagueElement =
    document.getElementById(
      "dashboardLeague"
    );

  if (
    leagueElement &&
    game.league
  ) {

    leagueElement.textContent =
      `${game.league.name} • ` +
      `${game.country.name}`;
  }


  const season =
    document.querySelector(
      ".season strong"
    );

  if (season) {

    season.textContent =
      game.year;
  }


  updateStats();
}


// =======================================
// STATS
// =======================================

function updateStats() {

  const standing =
    game.standings[
      game.team?.id
    ];


  if (!standing) return;


  const statCards =
    document.querySelectorAll(
      ".stat-card strong"
    );


  if (statCards.length >= 4) {

    statCards[0].textContent =
      formatMoney(
        game.budget
      );

    statCards[1].textContent =
      standing.wins;

    statCards[2].textContent =
      game.reputation;

    statCards[3].textContent =
      `${standing.points} PTS`;
  }
}


// =======================================
// NEXT MATCH UI
// =======================================

function renderNextMatch() {

  const container =
    document.getElementById(
      "nextMatch"
    );

  if (!container) return;


  const match =
    getNextMatch();


  if (!match) {

    container.innerHTML = `
      <div class="match-card">
        <strong>
          REGULAR SEASON SELESAI
        </strong>

        <small>
          Semua pertandingan sudah dimainkan.
        </small>
      </div>
    `;

    return;
  }


  const enemy =
    getTeamById(
      match.away
    );


  container.innerHTML = `

    <div class="match-card">

      <small>
        MATCH WEEK ${match.week}
      </small>

      <h3>
        ${game.team.name}
        VS
        ${enemy.name}
      </h3>

      <p>
        Format: BO3
      </p>

      <button
        class="primary-button"
        onclick="playNextMatch()"
      >
        PLAY MATCH
      </button>

    </div>

  `;
}


// =======================================
// ROSTER UI
// =======================================

function renderRoster() {

  const container =
    document.getElementById(
      "rosterContainer"
    );

  if (!container ||
      !game.team) {
    return;
  }


  container.innerHTML = `

    <div class="section-title">
      STARTING 5
    </div>

  `;


  game.team.players.forEach(
    player => {

      const starter =
        game.starters.includes(
          player.id
        );


      const card =
        document.createElement(
          "div"
        );

      card.className =
        "player-card";


      card.innerHTML = `

        <div>

          <strong>
            ${player.name}
          </strong>

          <small>
            ${player.role}
            • OVR ${player.rating}
          </small>

        </div>

        <button>
          ${
            starter
              ? "STARTER"
              : "BENCH"
          }
        </button>

      `;


      card
        .querySelector("button")
        .onclick = () => {

          toggleStarter(
            player.id
          );

          renderRoster();
        };


      container.appendChild(
        card
      );
    }
  );
}


// =======================================
// STANDINGS UI
// =======================================

function renderStandings() {

  const container =
    document.getElementById(
      "standingsContainer"
    );

  if (!container ||
      !game.league) {
    return;
  }


  const rows =
    Object.values(
      game.standings
    );


  rows.sort(
    (a, b) => {

      if (
        b.points !==
        a.points
      ) {

        return (
          b.points -
          a.points
        );
      }


      const bDiff =
        b.gameWins -
        b.gameLosses;


      const aDiff =
        a.gameWins -
        a.gameLosses;


      return bDiff - aDiff;
    }
  );


  container.innerHTML = `

    <div class="section-title">
      STANDINGS
    </div>

  `;


  rows.forEach(
    (row, index) => {

      const team =
        getTeamById(
          row.teamId
        );


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "standing-row";


      item.innerHTML = `

        <span>
          #${index + 1}
        </span>

        <strong>
          ${team.short}
        </strong>

        <span>
          ${row.wins}W
          -
          ${row.losses}L
        </span>

        <span>
          ${row.points} PTS
        </span>

      `;


      container.appendChild(
        item
      );
    }
  );
}


// =======================================
// ROSTER POPUP
// =======================================

function showRoster() {

  renderRoster();

  const container =
    document.getElementById(
      "rosterContainer"
    );

  if (container) {

    container.scrollIntoView({
      behavior: "smooth"
    });

  }
}


// =======================================
// TRANSFER MARKET
// =======================================

function showTransferMarket() {

  if (!game.league) return;


  let players = [];


  game.league.teams.forEach(
    team => {

      if (
        team.id ===
        game.team.id
      ) {
        return;
      }


      team.players.forEach(
        player => {

          players.push({

            ...player,

            teamName:
              team.name

          });

        }
      );
    }
  );


  players.sort(
    (a, b) =>
      b.rating -
      a.rating
  );


  let message =
    "TRANSFER MARKET\n\n";


  players
    .slice(0, 20)
    .forEach(
      (player, index) => {

        message +=
          `${index + 1}. ` +
          `${player.name}\n` +

          `${player.teamName}\n` +

          `${player.role} | ` +

          `OVR ${player.rating}\n\n`;
      }
    );


  alert(message);
}


// =======================================
// SCOUTING
// =======================================

function showScouting() {

  if (!game.league) return;


  let players = [];


  game.league.teams.forEach(
    team => {

      if (
        team.id ===
        game.team.id
      ) {
        return;
      }


      team.players.forEach(
        player => {

          players.push({

            ...player,

            club:
              team.name

          });

        }
      );
    }
  );


  players.sort(
    (a, b) =>
      b.potential -
      a.potential
  );


  let message =
    "SCOUTING REPORT\n\n";


  players
    .slice(0, 15)
    .forEach(
      player => {

        message +=
          `${player.name}\n` +

          `${player.club}\n` +

          `${player.role}\n` +

          `OVR ${player.rating} | ` +

          `POT ${player.potential}\n\n`;
      }
    );


  alert(message);
}


// =======================================
// SAVE
// =======================================

function saveGame() {

  localStorage.setItem(
    "mlbbProManagerSave",
    JSON.stringify(game)
  );
}


// =======================================
// LOAD
// =======================================

function loadGame() {

  const saved =
    localStorage.getItem(
      "mlbbProManagerSave"
    );


  if (!saved) return;


  try {

    const savedGame =
      JSON.parse(saved);


    game = savedGame;


    if (game.country) {

      game.country =
        countries.find(
          country =>
            country.id ===
            game.country.id
        );
    }


    if (game.league) {

      game.league =
        leagues.find(
          league =>
            league.id ===
            game.league.id
        );
    }


    if (
      game.league &&
      game.team
    ) {

      game.team =
        game.league.teams.find(
          team =>
            team.id ===
            game.team.id
        );


      /*
      Jika save lama belum memiliki
      starters atau schedule,
      buat ulang.
      */

      if (
        !Array.isArray(
          game.starters
        ) ||
        game.starters.length !== 5
      ) {

        createStarters();
      }


      if (
        !Array.isArray(
          game.schedule
        ) ||
        game.schedule.length === 0
      ) {

        createSeasonSchedule();
      }


      renderDashboard();

      showScreen(
        dashboardScreen
      );
    }

  } catch (error) {

    console.error(
      "Save error:",
      error
    );

  }
}


// =======================================
// ADVANCE SEASON
// =======================================

function advanceSeason() {

  if (!game.careerStarted) {

    alert(
      "Mulai karier terlebih dahulu."
    );

    return;
  }


  const unfinished =
    game.schedule.some(
      match =>
        !match.played
    );


  if (unfinished) {

    alert(
      "Selesaikan semua pertandingan season terlebih dahulu."
    );

    return;
  }


  const confirmAdvance =
    confirm(
      `Akhiri Season ${game.year} ` +
      `dan lanjut ke ${game.year + 1}?`
    );


  if (!confirmAdvance) return;


  developPlayers();


  game.year++;


  createStandings();

  createStarters();

  createSeasonSchedule();


  saveGame();

  renderDashboard();


  alert(
    `Selamat datang di Season ${game.year}!`
  );
}


// =======================================
// PLAYER DEVELOPMENT
// =======================================

function developPlayers() {

  if (!game.league) return;


  game.league.teams.forEach(
    team => {

      team.players.forEach(
        player => {

          player.age++;


          let change = 0;


          // Young
          if (player.age <= 21) {

            const roll =
              Math.random();

            if (roll < 0.60) {

              change =
                Math.floor(
                  Math.random() * 3
                ) + 1;

            } else if (
              roll < 0.72
            ) {

              change = -1;
            }
          }


          // Prime
          else if (
            player.age <= 25
          ) {

            const roll =
              Math.random();

            if (roll < 0.45) {

              change = 1;

            } else if (
              roll < 0.55
            ) {

              change = -1;
            }
          }


          // Veteran
          else {

            const roll =
              Math.random();

            if (roll < 0.35) {

              change = -1;

            } else if (
              roll < 0.50
            ) {

              change = -2;
            }
          }


          // Potential bonus
          if (
            player.potential >= 94 &&
            change > 0
          ) {

            change++;
          }


          player.rating +=
            change;


          player.rating =
            Math.max(
              50,
              Math.min(
                player.potential,
                player.rating
              )
            );
        }
      );
    }
  );
}


// =======================================
// MONEY
// =======================================

function formatMoney(value) {

  if (value >= 1000000) {

    return (
      "$" +
      (value / 1000000)
        .toFixed(1) +
      "M"
    );
  }


  if (value >= 1000) {

    return (
      "$" +
      Math.round(
        value / 1000
      ) +
      "K"
    );
  }


  return "$" + value;
}


// =======================================
// MENU
// =======================================

function setupMenu() {

  document
    .querySelectorAll(
      ".menu-card"
    )
    .forEach(button => {

      const title =
        button.querySelector(
          "strong"
        );

      if (!title) return;


      const name =
        title.textContent
          .trim()
          .toLowerCase();


      if (
        name === "roster"
      ) {

        button.onclick =
          showRoster;
      }


      if (
        name === "transfer"
      ) {

        button.onclick =
          showTransferMarket;
      }


      if (
        name === "training"
      ) {

        /*
        TRAINING DIHAPUS
        */

        button.style.display =
          "none";
      }


      if (
        name === "schedule"
      ) {

        button.onclick =
          showSchedule;
      }


      if (
        name === "standings"
      ) {

        button.onclick =
          () => {

            renderStandings();

            const element =
              document.getElementById(
                "standingsContainer"
              );

            if (element) {

              element.scrollIntoView({
                behavior: "smooth"
              });
            }
          };
      }


      if (
        name === "scouting"
      ) {

        button.onclick =
          showScouting;
      }
    });
}


// =======================================
// SCHEDULE
// =======================================

function showSchedule() {

  if (!game.schedule.length) {

    alert(
      "Schedule belum tersedia."
    );

    return;
  }


  let message =
    `SCHEDULE ${game.year}\n\n`;


  game.schedule.forEach(
    match => {

      const enemy =
        getTeamById(
          match.away
        );


      if (match.played) {

        message +=
          `Week ${match.week}: ` +
          `${game.team.short} ` +
          `${match.result.playerScore}` +
          `-${match.result.enemyScore} ` +
          `${enemy.short}\n`;

      } else {

        message +=
          `Week ${match.week}: ` +
          `${game.team.short} vs ` +
          `${enemy.short}\n`;
      }
    }
  );


  alert(message);
}


// =======================================
// RESTART
// =======================================

function restartGame() {

  const confirmRestart =
    confirm(
      "Mulai career baru?\n" +
      "Save saat ini akan dihapus."
    );


  if (!confirmRestart) return;


  localStorage.removeItem(
    "mlbbProManagerSave"
  );


  location.reload();
}


// =======================================
// ADVANCE BUTTON
// =======================================

function createAdvanceButton() {

  const existing =
    document.getElementById(
      "advanceSeasonButton"
    );


  if (existing) return;


  const button =
    document.createElement(
      "button"
    );


  button.id =
    "advanceSeasonButton";


  button.className =
    "restart-button";


  button.textContent =
    "→ AKHIRI SEASON";


  button.onclick =
    advanceSeason;


  const restart =
    document.querySelector(
      ".restart-button"
    );


  if (restart &&
      restart.parentNode) {

    restart.parentNode.appendChild(
      button
    );
  }
}


// =======================================
// INIT
// =======================================

renderCountries();

setupMenu();

loadGame();


setTimeout(() => {

  createAdvanceButton();

}, 100);


console.log(
  "MLBB Pro Manager V0.3 loaded."
);
