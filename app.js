/*
=========================================
MLBB PRO MANAGER
VERSION 0.2
=========================================
*/


// =======================================
// DATABASE
// =======================================

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

  screen.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// =======================================
// COUNTRIES
// =======================================

function renderCountries() {

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

  document.getElementById(
    "selectedCountryTitle"
  ).textContent = game.country.name;

  renderLeagues();

  showScreen(leagueScreen);
}


// =======================================
// LEAGUES
// =======================================

function renderLeagues() {

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

      button.className = "option-button";

      button.innerHTML = `
        <strong>${league.name}</strong>
        <small>
          Season ${league.season} •
          ${league.teams.length} teams
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

  document.getElementById(
    "selectedLeagueTitle"
  ).textContent = game.league.name;

  renderTeams();

  showScreen(teamScreen);
}


// =======================================
// TEAMS
// =======================================

function renderTeams() {

  teamList.innerHTML = "";

  game.league.teams.forEach(team => {

    const button =
      document.createElement("button");

    button.className = "team-button";

    button.innerHTML = `
      <div class="team-logo">
        ${team.short}
      </div>

      <div>
        <strong>${team.name}</strong>

        <small>
          ${team.players.length} pemain
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

  updateDashboard();

  saveGame();

  showScreen(dashboardScreen);
}


// =======================================
// DASHBOARD
// =======================================

function updateDashboard() {

  document.getElementById(
    "dashboardTeam"
  ).textContent = game.team.name;

  document.getElementById(
    "dashboardLeague"
  ).textContent =
    `${game.league.name} • ${game.country.name}`;

  const season =
    document.querySelector(".season strong");

  if (season) {
    season.textContent = game.year;
  }

  updateBudget();

  renderManagerInfo();
}


// =======================================
// BUDGET
// =======================================

function updateBudget() {

  const budgetElement =
    document.querySelector(
      ".stat-card strong"
    );

  if (!budgetElement) return;

  budgetElement.textContent =
    formatMoney(game.budget);
}


// =======================================
// MONEY
// =======================================

function formatMoney(value) {

  if (value >= 1000000) {

    return "$" +
      (value / 1000000)
        .toFixed(1) +
      "M";

  }

  if (value >= 1000) {

    return "$" +
      Math.round(value / 1000) +
      "K";

  }

  return "$" + value;
}


// =======================================
// MANAGER INFO
// =======================================

function renderManagerInfo() {

  const cards =
    document.querySelectorAll(
      ".stat-card strong"
    );

  if (cards.length >= 4) {

    cards[1].textContent =
      game.team.trophies || 0;

    cards[2].textContent =
      game.reputation;

    cards[3].textContent =
      "TOP 4";
  }
}


// =======================================
// STANDINGS
// =======================================

function createStandings() {

  game.standings = {};

  game.league.teams.forEach(team => {

    game.standings[team.id] = {

      teamId: team.id,

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
// GET ROSTER
// =======================================

function getRoster() {

  if (!game.team) return [];

  return game.team.players || [];
}


// =======================================
// PLAYER DEVELOPMENT
// =======================================

function developPlayers() {

  if (!game.league) return;

  game.league.teams.forEach(team => {

    team.players.forEach(player => {

      player.age += 1;

      let change = 0;


      // -------------------------------
      // YOUNG PLAYER
      // -------------------------------

      if (player.age <= 21) {

        const roll =
          Math.random();

        if (roll < 0.60) {

          change =
            Math.floor(
              Math.random() * 3
            ) + 1;

        } else if (roll < 0.72) {

          change = -1;

        }

      }


      // -------------------------------
      // PRIME
      // -------------------------------

      else if (player.age <= 25) {

        const roll =
          Math.random();

        if (roll < 0.45) {

          change = 1;

        } else if (roll < 0.55) {

          change = -1;

        }

      }


      // -------------------------------
      // VETERAN
      // -------------------------------

      else {

        const roll =
          Math.random();

        if (roll < 0.35) {

          change = -1;

        } else if (roll < 0.50) {

          change = -2;

        }

      }


      // -------------------------------
      // POTENTIAL BONUS
      // -------------------------------

      if (
        player.potential >= 94 &&
        change > 0
      ) {

        change += 1;

      }


      // -------------------------------
      // RATING
      // -------------------------------

      player.rating += change;


      // MIN / MAX

      if (player.rating < 50) {

        player.rating = 50;

      }

      if (player.rating > player.potential) {

        player.rating =
          player.potential;

      }

    });

  });

}


// =======================================
// END SEASON
// =======================================

function advanceSeason() {

  if (!game.careerStarted) {

    alert(
      "Mulai karier terlebih dahulu."
    );

    return;

  }


  const confirmAdvance =
    confirm(
      `Akhiri Season ${game.year} dan lanjut ke ${game.year + 1}?`
    );

  if (!confirmAdvance) return;


  // DEVELOPMENT

  developPlayers();


  // YEAR

  game.year += 1;


  // RESET STANDINGS

  createStandings();


  // SAVE

  saveGame();


  updateDashboard();


  alert(
    `Season ${game.year - 1} selesai.\n\n` +
    `Pemain telah mengalami perkembangan berdasarkan umur dan potential.\n\n` +
    `Selamat datang di Season ${game.year}!`
  );

}


// =======================================
// ROSTER VIEW
// =======================================

function showRoster() {

  const roster =
    getRoster();

  if (!roster.length) return;


  let message =
    `${game.team.name} - ROSTER\n\n`;


  roster.forEach(
    (player, index) => {

      message +=
        `${index + 1}. ` +
        `${player.name}\n` +
        `   ${player.role} | ` +
        `Age ${player.age}\n` +
        `   Rating ${player.rating} | ` +
        `Potential ${player.potential}\n` +
        `   Salary $${player.salary}/bulan\n\n`;

    }
  );


  alert(message);
}


// =======================================
// TRANSFER MARKET
// =======================================

function showTransferMarket() {

  if (!game.league) return;


  let players = [];


  game.league.teams.forEach(team => {

    if (team.id === game.team.id) return;

    team.players.forEach(player => {

      players.push({
        ...player,
        teamName: team.name
      });

    });

  });


  players.sort(
    (a, b) =>
      b.rating - a.rating
  );


  let message =
    "TRANSFER MARKET\n\n";


  players
    .slice(0, 20)
    .forEach(
      (player, index) => {

        message +=
          `${index + 1}. ${player.name}\n` +
          `${player.teamName}\n` +
          `${player.role} | ` +
          `OVR ${player.rating}\n\n`;

      }
    );


  alert(message);
}


// =======================================
// MENU
// =======================================

function setupMenu() {

  const buttons =
    document.querySelectorAll(
      ".menu-card"
    );


  buttons.forEach(button => {

    const title =
      button.querySelector(
        "strong"
      );

    if (!title) return;


    const name =
      title.textContent
        .trim()
        .toLowerCase();


    if (name === "roster") {

      button.onclick =
        showRoster;

    }


    if (name === "transfer") {

      button.onclick =
        showTransferMarket;

    }


    if (name === "training") {

      button.style.display =
        "none";

    }


    if (name === "schedule") {

      button.onclick =
        showSchedule;

    }


    if (name === "standings") {

      button.onclick =
        showStandings;

    }


    if (name === "scouting") {

      button.onclick =
        showScouting;

    }

  });

}


// =======================================
// SCHEDULE
// =======================================

function showSchedule() {

  alert(
    "SCHEDULE\n\n" +
    "Regular Season\n\n" +
    "Match Week 1\n" +
    "• Match akan tersedia pada sistem simulasi berikutnya.\n\n" +
    "Format: BO3"
  );

}


// =======================================
// STANDINGS
// =======================================

function showStandings() {

  if (!game.league) return;


  const table =
    Object.values(
      game.standings
    )
    .sort(
      (a, b) =>
        b.points - a.points
    );


  let message =
    `${game.league.name}\n` +
    `SEASON ${game.year}\n\n`;


  table.forEach(
    (row, index) => {

      const team =
        game.league.teams.find(
          t => t.id === row.teamId
        );


      message +=
        `${index + 1}. ` +
        `${team.name}\n` +
        `${row.wins}W - ` +
        `${row.losses}L | ` +
        `${row.points} pts\n\n`;

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

      if (team.id === game.team.id)
        return;


      team.players.forEach(
        player => {

          players.push({
            ...player,
            club: team.name
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
    .slice(0, 10)
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
// SAVE GAME
// =======================================

function saveGame() {

  localStorage.setItem(
    "mlbbProManagerSave",
    JSON.stringify(game)
  );

}


// =======================================
// LOAD GAME
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
          c =>
            c.id ===
            game.country.id
        );

    }


    if (game.league) {

      game.league =
        leagues.find(
          l =>
            l.id ===
            game.league.id
        );

    }


    if (
      game.league &&
      game.team
    ) {

      game.team =
        game.league.teams.find(
          t =>
            t.id ===
            game.team.id
        );

      updateDashboard();

      showScreen(
        dashboardScreen
      );

    }

  } catch (error) {

    console.error(
      "Save rusak:",
      error
    );

  }

}


// =======================================
// RESTART
// =======================================

function restartGame() {

  const confirmRestart =
    confirm(
      "Mulai career baru?\nSave saat ini akan dihapus."
    );


  if (!confirmRestart) return;


  localStorage.removeItem(
    "mlbbProManagerSave"
  );


  location.reload();

}


// =======================================
// ADVANCE SEASON BUTTON
// =======================================

function createAdvanceButton() {

  const button =
    document.createElement(
      "button"
    );


  button.className =
    "restart-button";


  button.style.marginLeft =
    "10px";


  button.style.color =
    "#ffb800";


  button.style.borderColor =
    "#5a4918";


  button.textContent =
    "→ Akhiri Season";


  button.onclick =
    advanceSeason;


  const restart =
    document.querySelector(
      ".restart-button"
    );


  if (restart) {

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


// Hanya buat tombol jika
// belum ada career saat startup

setTimeout(() => {

  createAdvanceButton();

}, 100);


console.log(
  "MLBB Pro Manager V0.2 loaded."
);
