/* =========================================================
   MLBB PRO MANAGER
   V0.5
   TRANSFER MARKET
========================================================= */


/* =========================================================
   LEAGUES
========================================================= */

const leagues = [
  MPL_ID_2026,
  MPL_PH_2026,
  MPL_KH_2026
];


/* =========================================================
   GAME STATE
========================================================= */

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
   SCREEN
========================================================= */

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.add(
        "hidden"
      );

    });


  const target =
    document.getElementById(id);


  if (target) {

    target.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   SAVE
========================================================= */

function saveGame() {

  localStorage.setItem(
    "mlbb_pro_manager_save",
    JSON.stringify(game)
  );

}


/* =========================================================
   LOAD
========================================================= */

function loadGame() {

  const saved =
    localStorage.getItem(
      "mlbb_pro_manager_save"
    );


  if (!saved) return;


  try {

    const data =
      JSON.parse(saved);


    game = data;


    /*
      Reconnect country.
    */

    if (game.country) {

      const countryId =
        game.country.id;


      game.country =
        countries.find(
          country =>
            country.id ===
            countryId
        ) || null;

    }


    /*
      Reconnect league.
    */

    if (
      game.country &&
      game.league
    ) {

      const leagueId =
        game.league.id;


      game.league =
        leagues.find(
          league =>
            league.id ===
            leagueId
        ) || null;

    }


    /*
      Reconnect team.
    */

    if (
      game.league &&
      game.team
    ) {

      const teamId =
        game.team.id;


      game.team =
        game.league.teams.find(
          team =>
            team.id ===
            teamId
        ) || null;

    }


    if (!Array.isArray(
      game.starters
    )) {

      game.starters = [];

    }


    if (!Array.isArray(
      game.schedule
    )) {

      game.schedule = [];

    }


    if (!Array.isArray(
      game.standings
    )) {

      game.standings = [];

    }


    if (
      game.careerStarted &&
      game.team
    ) {

      renderDashboard();

      showScreen(
        "dashboardScreen"
      );

    }


  } catch (error) {

    console.error(
      "Load error:",
      error
    );


    localStorage.removeItem(
      "mlbb_pro_manager_save"
    );

  }

}


/* =========================================================
   COUNTRY
========================================================= */

function renderCountries() {

  const container =
    document.getElementById(
      "countryList"
    );


  if (!container) return;


  container.innerHTML = "";


  countries.forEach(
    country => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "country-card";


      button.innerHTML = `

        <div>

          <strong>
            ${country.name}
          </strong>

          <div class="card-right">
            ${country.leagues.length}
            League
          </div>

        </div>

        <div class="country-flag">
          ${country.flag}
        </div>

      `;


      button.onclick = () =>
        selectCountry(
          country.id
        );


      container.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   SELECT COUNTRY
========================================================= */

function selectCountry(
  countryId
) {

  const country =
    countries.find(
      c =>
        c.id === countryId
    );


  if (!country) return;


  game.country =
    country;


  game.league = null;

  game.team = null;


  renderLeagues();


  showScreen(
    "leagueScreen"
  );

}


/* =========================================================
   LEAGUE
========================================================= */

function renderLeagues() {

  const container =
    document.getElementById(
      "leagueList"
    );


  if (!container) return;


  container.innerHTML = "";


  if (!game.country)
    return;


  const available =
    leagues.filter(
      league =>
        league.region ===
        game.country.id
          .toUpperCase()
    );


  if (!available.length) {

    container.innerHTML = `

      <div class="game-card">

        <h3>
          No League Available
        </h3>

        <p>
          Belum ada liga untuk negara ini.
        </p>

      </div>

    `;


    return;

  }


  available.forEach(
    league => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "league-card";


      button.innerHTML = `

        <div>

          <strong>
            ${league.name}
          </strong>

          <div class="card-right">
            Season ${league.season}
          </div>

        </div>

        <span class="card-right">
          ${league.teams.length}
          Teams →
        </span>

      `;


      button.onclick = () =>
        selectLeague(
          league
        );


      container.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   SELECT LEAGUE
========================================================= */

function selectLeague(
  league
) {

  if (!league) return;


  game.league =
    league;


  game.team = null;


  renderTeams();


  showScreen(
    "teamScreen"
  );

}


/* =========================================================
   TEAM
========================================================= */

function renderTeams() {

  const container =
    document.getElementById(
      "teamList"
    );


  if (!container) return;


  container.innerHTML = "";


  if (!game.league)
    return;


  game.league.teams.forEach(
    team => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "team-card";


      button.innerHTML = `

        <div>

          <strong>
            ${team.name}
          </strong>

          <div class="card-right">
            ${team.players.length}
            Players
          </div>

        </div>

        <span class="card-right">
          Select →
        </span>

      `;


      button.onclick = () =>
        selectTeam(
          team
        );


      container.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   SELECT TEAM
========================================================= */

function selectTeam(
  team
) {

  if (!team) return;


  game.team =
    team;


  game.careerStarted =
    true;


  game.budget =
    500000;


  game.reputation =
    50;


  createStarters();

  createStandings();

  createSeasonSchedule();


  game.currentMatch =
    null;


  saveGame();


  renderDashboard();


  showScreen(
    "dashboardScreen"
  );

}


/* =========================================================
   STARTING 5
========================================================= */

function createStarters() {

  if (!game.team)
    return;


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
      .map(
        player =>
          player.id
      );

}


function getStarters() {

  if (!game.team)
    return [];


  return game.team.players.filter(
    player =>
      game.starters.includes(
        player.id
      )
  );

}


function toggleStarter(
  playerId
) {

  if (
    game.starters.includes(
      playerId
    )
  ) {

    game.starters =
      game.starters.filter(
        id =>
          id !== playerId
      );

  } else {

    if (
      game.starters.length >= 5
    ) {

      alert(
        "Starting 5 sudah penuh."
      );

      return;

    }


    game.starters.push(
      playerId
    );

  }


  saveGame();

  renderRoster();

}


/* =========================================================
   TEAM RATING
========================================================= */

function calculateTeamRating(
  team
) {

  if (!team) return 0;


  let players;


  if (
    team === game.team
  ) {

    players =
      getStarters();

  } else {

    players =
      [...team.players]
        .sort(
          (a, b) =>
            (b.rating || 0) -
            (a.rating || 0)
        )
        .slice(0, 5);

  }


  if (!players.length)
    return 0;


  const average =
    players.reduce(
      (sum, player) =>
        sum +
        (player.rating || 0),
      0
    ) /
    players.length;


  const roles =
    new Set(
      players.map(
        player =>
          player.role
      )
    );


  let bonus;


  if (
    roles.size >= 5
  ) {

    bonus = 3;

  } else if (
    roles.size >= 4
  ) {

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
    myRating -
    enemyRating;


  let probability =
    50 +
    difference * 2;


  probability =
    Math.max(
      10,
      Math.min(
        90,
        probability
      )
    );


  return Math.round(
    probability
  );

}


/* =========================================================
   SCHEDULE
========================================================= */

function createSeasonSchedule() {

  if (
    !game.league ||
    !game.team
  )
    return;


  game.schedule = [];


  game.league.teams.forEach(
    team => {

      if (
        team.id ===
        game.team.id
      )
        return;


      game.schedule.push({

        opponentId:
          team.id,

        played:
          false,

        result:
          null,

        myGames:
          0,

        opponentGames:
          0

      });

    }
  );

}


function getTeamById(
  id
) {

  if (!game.league)
    return null;


  return game.league.teams.find(
    team =>
      team.id === id
  );

}


function getNextMatch() {

  return game.schedule.find(
    match =>
      !match.played
  );

}


/* =========================================================
   OPEN MATCH
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


  game.currentMatch =
    match;


  renderMatchScreen();


  showScreen(
    "matchScreen"
  );

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


  result.className =
    "hidden";


  result.innerHTML =
    "";


  document.getElementById(
    "playMatchButton"
  ).disabled =
    false;

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


  getStarters().forEach(
    player => {

      const div =
        document.createElement(
          "div"
        );


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


      container.appendChild(
        div
      );

    }
  );

}


/* =========================================================
   SIMULATE BO3
========================================================= */

function simulateCurrentMatch() {

  const match =
    game.currentMatch;


  if (!match)
    return;


  if (
    game.starters.length !== 5
  ) {

    alert(
      "Pilih tepat 5 pemain sebagai Starting 5."
    );

    return;

  }


  if (match.played)
    return;


  const opponent =
    getTeamById(
      match.opponentId
    );


  if (!opponent)
    return;


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
    Math.random() *
    100;


  const won =
    roll <
    probability;


  let myGames;

  let enemyGames;


  if (won) {

    if (
      Math.random() < 0.58
    ) {

      myGames = 2;
      enemyGames = 0;

    } else {

      myGames = 2;
      enemyGames = 1;

    }

  } else {

    if (
      Math.random() < 0.58
    ) {

      myGames = 0;
      enemyGames = 2;

    } else {

      myGames = 1;
      enemyGames = 2;

    }

  }


  match.played =
    true;


  match.myGames =
    myGames;


  match.opponentGames =
    enemyGames;


  match.result =
    won
      ? "WIN"
      : "LOSS";


  updateStandings(
    game.team.id,
    opponent.id,
    won,
    myGames,
    enemyGames
  );


  if (won) {

    game.reputation +=
      2;

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


  result.className =
    `match-result ${
      won
        ? "result-win"
        : "result-loss"
    }`;


  result.innerHTML = `

    <h2>
      ${
        won
          ? "🏆 VICTORY"
          : "💀 DEFEAT"
      }
    </h2>

    <p>
      ${game.team.name}
      vs
      ${opponent.name}
    </p>

    <div class="result-score">
      ${myGames}
      -
      ${enemyGames}
    </div>

    <p>
      ${
        won
          ? "Kamu mendapatkan 3 poin!"
          : "Belum berhasil mendapatkan poin."
      }
    </p>

    <button
      class="primary-button"
      onclick="finishMatch()"
    >
      CONTINUE
    </button>

  `;


  document.getElementById(
    "playMatchButton"
  ).disabled =
    true;

}


/* =========================================================
   FINISH MATCH
========================================================= */

function finishMatch() {

  game.currentMatch =
    null;


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

  if (!game.league)
    return;


  game.standings =
    game.league.teams.map(
      team => ({

        teamId:
          team.id,

        played:
          0,

        wins:
          0,

        losses:
          0,

        gameWins:
          0,

        gameLosses:
          0,

        points:
          0

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
      standing =>
        standing.teamId ===
        myTeamId
    );


  const enemy =
    game.standings.find(
      standing =>
        standing.teamId ===
        opponentId
    );


  if (!mine || !enemy)
    return;


  mine.played++;

  enemy.played++;


  mine.gameWins +=
    myGames;

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
   NEXT MATCH
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
          Semua pertandingan musim ini
          sudah dimainkan.
        </p>

      </div>

    `;


    return;

  }


  const opponent =
    getTeamById(
      match.opponentId
    );


  if (!opponent)
    return;


  container.innerHTML = `

    <div class="game-card">

      <h3>
        ${game.team.name}
        <br>
        VS
        <br>
        ${opponent.name}
      </h3>

      <p>
        BO3 • Regular Season
      </p>

      <button
        class="primary-button"
        onclick="openNextMatch()"
        style="margin-top:15px;"
      >
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


  if (
    !container ||
    !game.team
  )
    return;


  container.innerHTML = "";


  game.team.players.forEach(
    player => {

      const selected =
        game.starters.includes(
          player.id
        );


      const div =
        document.createElement(
          "div"
        );


      div.className =
        "match-player";


      div.innerHTML = `

        <div>

          <strong>
            ${player.name}
          </strong>

          <div class="match-player-role">

            ${player.role}

            • Age
            ${player.age}

          </div>

        </div>


        <div
          style="text-align:right;"
        >

          <strong>
            ${player.rating}
          </strong>

          <br>

          <button
            onclick="toggleStarter('${player.id}')"
          >
            ${
              selected
                ? "STARTER"
                : "SUB"
            }
          </button>

        </div>

      `;


      container.appendChild(
        div
      );

    }
  );

}


/* =========================================================
   SCROLL ROSTER
========================================================= */

function scrollToRoster() {

  const roster =
    document.getElementById(
      "rosterContainer"
    );


  if (roster) {

    roster.scrollIntoView({
      behavior: "smooth"
    });

  }

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
        (a, b) => {

          const aDiff =
            a.gameWins -
            a.gameLosses;


          const bDiff =
            b.gameWins -
            b.gameLosses;


          return (

            b.points -
            a.points ||

            b.wins -
            a.wins ||

            bDiff -
            aDiff

          );

        }
      );


  container.innerHTML = "";


  sorted.forEach(
    (standing, index) => {

      const team =
        getTeamById(
          standing.teamId
        );


      if (!team)
        return;


      const div =
        document.createElement(
          "div"
        );


      div.className =
        "match-player";


      div.innerHTML = `

        <div>

          <strong>

            #${index + 1}

            ${
              team.short ||
              team.name
            }

          </strong>

          <div class="match-player-role">

            ${standing.wins}W -
            ${standing.losses}L

            •

            ${standing.gameWins}-
            ${standing.gameLosses}

          </div>

        </div>


        <strong>
          ${standing.points}
          PTS
        </strong>

      `;


      container.appendChild(
        div
      );

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


      if (!opponent)
        return;


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
   TRANSFER MARKET
========================================================= */

function showTransferMarket() {

  if (!game.team) {

    alert(
      "Kamu belum memilih team."
    );

    return;

  }


  updateMarketInfo();

  renderTransferMarket();

  showScreen(
    "transferScreen"
  );

}


/* =========================================================
   MARKET INFO
========================================================= */

function updateMarketInfo() {

  const budget =
    document.getElementById(
      "marketBudget"
    );


  if (budget) {

    budget.textContent =
      formatMoney(
        game.budget
      );

  }


  const roster =
    document.getElementById(
      "marketRosterCount"
    );


  if (roster) {

    roster.textContent =
      game.team.players.length;

  }

}


/* =========================================================
   GET ALL MARKET PLAYERS
========================================================= */

function getMarketPlayers() {

  if (!game.league)
    return [];


  const players = [];


  game.league.teams.forEach(
    team => {

      /*
        Pemain dari tim sendiri
        tidak muncul sebagai pemain
        yang bisa dibeli.
      */

      if (
        team.id ===
        game.team.id
      )
        return;


      team.players.forEach(
        player => {

          players.push({

            player:
              player,

            team:
              team

          });

        }
      );

    }
  );


  return players;

}


/* =========================================================
   TRANSFER PRICE
========================================================= */

function calculateTransferPrice(
  player
) {

  const rating =
    player.rating ||
    50;


  const potential =
    player.potential ||
    rating;


  const age =
    player.age ||
    20;


  /*
    Base price.
  */

  let price =
    25000;


  /*
    Rating.
  */

  price +=
    rating *
    3500;


  /*
    Potential.
  */

  price +=
    Math.max(
      0,
      potential -
      rating
    ) *
    3000;


  /*
    Young player premium.
  */

  if (age <= 21) {

    price *=
      1.15;

  }


  /*
    Veteran discount.
  */

  if (age >= 28) {

    price *=
      0.80;

  }


  /*
    High rating premium.
  */

  if (rating >= 90) {

    price *=
      1.25;

  }


  return Math.round(
    price /
    1000
  ) * 1000;

}


/* =========================================================
   MARKET RENDER
========================================================= */

function renderTransferMarket() {

  const container =
    document.getElementById(
      "transferList"
    );


  if (!container)
    return;


  const searchInput =
    document.getElementById(
      "playerSearch"
    );


  const roleInput =
    document.getElementById(
      "roleFilter"
    );


  const search =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";


  const role =
    roleInput
      ? roleInput.value
      : "ALL";


  let players =
    getMarketPlayers();


  /*
    Search.
  */

  if (search) {

    players =
      players.filter(
        item =>
          item.player.name
            .toLowerCase()
            .includes(search)
      );

  }


  /*
    Role filter.
  */

  if (role !== "ALL") {

    players =
      players.filter(
        item =>
          String(
            item.player.role
          ).toUpperCase() ===
          role
      );

  }


  /*
    Sort rating tertinggi.
  */

  players.sort(
    (a, b) =>
      (b.player.rating || 0) -
      (a.player.rating || 0)
  );


  container.innerHTML = "";


  if (!players.length) {

    container.innerHTML = `

      <div class="empty-market">

        Tidak ada pemain
        yang cocok.

      </div>

    `;


    return;

  }


  players.forEach(
    item => {

      const player =
        item.player;


      const team =
        item.team;


      const price =
        calculateTransferPrice(
          player
        );


      const affordable =
        game.budget >=
        price;


      const div =
        document.createElement(
          "div"
        );


      div.className =
        "transfer-card";


      div.innerHTML = `

        <div class="transfer-top">

          <div>

            <div class="transfer-player-name">
              ${player.name}
            </div>

            <div class="transfer-role">
              ${player.role}
            </div>

            <div class="transfer-team">
              ${team.name}
            </div>

          </div>


          <div class="transfer-rating">

            <strong>
              ${player.rating}
            </strong>

            <span>
              RATING
            </span>

          </div>

        </div>


        <div class="transfer-bottom">

          <div class="transfer-price">

            ${formatMoney(price)}

          </div>


          <div class="transfer-actions">

            <button
              class="market-button"
              onclick="showPlayerDetail(
                '${player.id}',
                '${team.id}'
              )"
            >
              DETAILS
            </button>


            <button
              class="market-button buy"
              ${
                affordable
                  ? ""
                  : "disabled"
              }
              onclick="buyPlayer(
                '${player.id}',
                '${team.id}'
              )"
            >
              ${
                affordable
                  ? "BUY"
                  : "NO BUDGET"
              }
            </button>

          </div>

        </div>

      `;


      container.appendChild(
        div
      );

    }
  );

}


/* =========================================================
   FIND MARKET PLAYER
========================================================= */

function findMarketPlayer(
  playerId,
  teamId
) {

  if (!game.league)
    return null;


  const team =
    game.league.teams.find(
      t =>
        t.id === teamId
    );


  if (!team)
    return null;


  const player =
    team.players.find(
      p =>
        p.id === playerId
    );


  if (!player)
    return null;


  return {

    player:
      player,

    team:
      team

  };

}


/* =========================================================
   PLAYER DETAIL
========================================================= */

function showPlayerDetail(
  playerId,
  teamId
) {

  const item =
    findMarketPlayer(
      playerId,
      teamId
    );


  if (!item)
    return;


  const player =
    item.player;


  const team =
    item.team;


  const price =
    calculateTransferPrice(
      player
    );


  const modal =
    document.getElementById(
      "playerModal"
    );


  const content =
    document.getElementById(
      "playerModalContent"
    );


  content.innerHTML = `

    <div class="player-detail">

      <div class="small-label">
        PLAYER PROFILE
      </div>


      <h2>
        ${player.name}
      </h2>


      <div class="player-detail-role">
        ${player.role}
      </div>


      <div class="player-detail-team">
        ${team.name}
      </div>


      <div class="detail-grid">

        <div class="detail-box">

          <span>
            RATING
          </span>

          <strong>
            ${player.rating}
          </strong>

        </div>


        <div class="detail-box">

          <span>
            POTENTIAL
          </span>

          <strong>
            ${player.potential}
          </strong>

        </div>


        <div class="detail-box">

          <span>
            AGE
          </span>

          <strong>
            ${player.age}
          </strong>

        </div>


        <div class="detail-box">

          <span>
            SALARY
          </span>

          <strong>
            ${formatMoney(
              player.salary || 0
            )}
          </strong>

        </div>

      </div>


      <div class="detail-price">

        <span>
          TRANSFER FEE
        </span>

        <strong>
          ${formatMoney(price)}
        </strong>

      </div>


      <button
        class="primary-button"
        onclick="buyPlayer(
          '${player.id}',
          '${team.id}'
        ); closePlayerModal();"
        ${
          game.budget >= price
            ? ""
            : "disabled"
        }
      >
        ${
          game.budget >= price
            ? "BUY PLAYER"
            : "BUDGET TIDAK CUKUP"
        }
      </button>

    </div>

  `;


  modal.classList.remove(
    "hidden"
  );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closePlayerModal() {

  const modal =
    document.getElementById(
      "playerModal"
    );


  modal.classList.add(
    "hidden"
  );

}


/* =========================================================
   BUY PLAYER
========================================================= */

function buyPlayer(
  playerId,
  teamId
) {

  const item =
    findMarketPlayer(
      playerId,
      teamId
    );


  if (!item) {

    alert(
      "Pemain tidak ditemukan."
    );

    return;

  }


  const player =
    item.player;


  const sourceTeam =
    item.team;


  const price =
    calculateTransferPrice(
      player
    );


  if (
    sourceTeam.id ===
    game.team.id
  ) {

    alert(
      "Pemain ini sudah berada di tim kamu."
    );

    return;

  }


  if (
    game.budget <
    price
  ) {

    alert(
      "Budget kamu tidak cukup."
    );

    return;

  }


  const confirmed =
    confirm(

      `Rekrut ${player.name} ` +

      `dari ${sourceTeam.name} ` +

      `seharga ${formatMoney(price)}?`

    );


  if (!confirmed)
    return;


  /*
    Hapus pemain dari tim asal.
  */

  const playerIndex =
    sourceTeam.players.findIndex(
      p =>
        p.id === playerId
    );


  if (
    playerIndex === -1
  )
    return;


  sourceTeam.players.splice(
    playerIndex,
    1
  );


  /*
    Masukkan ke tim kita.
  */

  game.team.players.push(
    player
  );


  /*
    Kurangi budget.
  */

  game.budget -=
    price;


  /*
    Jika roster baru masuk,
    jadikan SUB terlebih dahulu.
  */

  if (
    game.starters.length < 5
  ) {

    /*
      Tidak otomatis menjadi starter.
      User tetap memilih sendiri.
    */

  }


  /*
    Recreate standings/schedule
    supaya struktur liga tetap aman.
  */

  ensureStandingsIntegrity();

  ensureScheduleIntegrity();


  saveGame();


  updateDashboard();

  updateMarketInfo();

  renderRoster();

  renderStandings();

  renderTransferMarket();


  alert(
    `${player.name} berhasil direkrut!`
  );

}


/* =========================================================
   SELL PLAYER
========================================================= */

function sellPlayer(
  playerId
) {

  if (!game.team)
    return;


  const playerIndex =
    game.team.players.findIndex(
      player =>
        player.id ===
        playerId
    );


  if (
    playerIndex === -1
  ) {

    alert(
      "Pemain tidak ditemukan."
    );

    return;

  }


  const player =
    game.team.players[
      playerIndex
    ];


  /*
    Jangan menjual jika
    roster terlalu kecil.
  */

  if (
    game.team.players.length <= 5
  ) {

    alert(
      "Minimal harus ada 5 pemain di roster."
    );

    return;

  }


  const value =
    Math.round(
      calculateTransferPrice(
        player
      ) * 0.60
    );


  const confirmed =
    confirm(

      `Jual ${player.name} ` +

      `seharga ${formatMoney(value)}?`

    );


  if (!confirmed)
    return;


  game.team.players.splice(
    playerIndex,
    1
  );


  /*
    Hapus dari starter.
  */

  game.starters =
    game.starters.filter(
      id =>
        id !== playerId
    );


  /*
    Tambahkan budget.
  */

  game.budget +=
    value;


  saveGame();


  renderDashboard();


  alert(
    `${player.name} terjual seharga ${formatMoney(value)}.`
  );

}


/* =========================================================
   ENSURE STANDINGS
========================================================= */

function ensureStandingsIntegrity() {

  if (!game.league)
    return;


  const validIds =
    game.league.teams.map(
      team =>
        team.id
    );


  game.standings =
    game.standings.filter(
      standing =>
        validIds.includes(
          standing.teamId
        )
    );


  game.league.teams.forEach(
    team => {

      const exists =
        game.standings.some(
          standing =>
            standing.teamId ===
            team.id
        );


      if (!exists) {

        game.standings.push({

          teamId:
            team.id,

          played:
            0,

          wins:
            0,

          losses:
            0,

          gameWins:
            0,

          gameLosses:
            0,

          points:
            0

        });

      }

    }
  );

}


/* =========================================================
   ENSURE SCHEDULE
========================================================= */

function ensureScheduleIntegrity() {

  if (
    !game.league ||
    !game.team
  )
    return;


  const existing =
    new Map();


  game.schedule.forEach(
    match => {

      existing.set(
        match.opponentId,
        match
      );

    }
  );


  const newSchedule = [];


  game.league.teams.forEach(
    team => {

      if (
        team.id ===
        game.team.id
      )
        return;


      if (
        existing.has(
          team.id
        )
      ) {

        newSchedule.push(
          existing.get(
            team.id
          )
        );

      } else {

        newSchedule.push({

          opponentId:
            team.id,

          played:
            false,

          result:
            null,

          myGames:
            0,

          opponentGames:
            0

        });

      }

    }
  );


  game.schedule =
    newSchedule;

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


      if (!opponent)
        return;


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
   SCOUTING
========================================================= */

function showScouting() {

  alert(
    "Scouting System akan hadir di V0.6."
  );

}


/* =========================================================
   ADVANCE SEASON
========================================================= */

function advanceSeason() {

  if (!game.schedule.length) {

    alert(
      "Season belum dimulai."
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
      "Selesaikan semua pertandingan sebelum lanjut season."
    );

    return;

  }


  developPlayers();


  game.year++;


  createStandings();


  createSeasonSchedule();


  createStarters();


  game.currentMatch =
    null;


  saveGame();


  renderDashboard();


  alert(
    `Selamat datang di Season ${game.year}!`
  );

}


/* =========================================================
   PLAYER DEVELOPMENT
   NO TRAINING SYSTEM
========================================================= */

function developPlayers() {

  if (!game.league)
    return;


  game.league.teams.forEach(
    team => {

      team.players.forEach(
        player => {

          player.age =
            (player.age || 20) +
            1;


          const potential =
            player.potential ||
            90;


          let change = 0;


          /*
            Young.
          */

          if (
            player.age <= 21
          ) {

            change =
              Math.random() < 0.8
                ? randomInt(1, 3)
                : -1;

          }


          /*
            Prime.
          */

          else if (
            player.age <= 25
          ) {

            change =
              Math.random() < 0.65
                ? randomInt(0, 1)
                : -1;

          }


          /*
            Veteran.
          */

          else {

            change =
              Math.random() < 0.35
                ? -randomInt(1, 2)
                : 0;

          }


          /*
            High potential.
          */

          if (
            player.rating <
              potential &&
            player.potential >=
              94 &&
            change > 0
          ) {

            change++;

          }


          player.rating =
            Math.max(
              50,
              Math.min(
                potential,
                player.rating +
                  change
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

function randomInt(
  min,
  max
) {

  return Math.floor(
    Math.random() *
      (max - min + 1)
  ) + min;

}


function formatMoney(
  value
) {

  return new Intl.NumberFormat(
    "id-ID",
    {

      style:
        "currency",

      currency:
        "IDR",

      maximumFractionDigits:
        0

    }
  ).format(value);

}


/* =========================================================
   BACK DASHBOARD
========================================================= */

function backToDashboard() {

  closePlayerModal();

  showScreen(
    "dashboardScreen"
  );

  renderDashboard();

}


/* =========================================================
   RESTART
========================================================= */

function restartGame() {

  const confirmed =
    confirm(
      "Yakin ingin memulai game baru?"
    );


  if (!confirmed)
    return;


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

    showScreen(
      "countryScreen"
    );


    renderCountries();


    loadGame();

  }
);
