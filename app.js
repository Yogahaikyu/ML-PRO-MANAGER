/* =========================================================
   MLBB PRO MANAGER
   VERSION 0.6

   FEATURES:
   - Country selection
   - League selection
   - Team selection
   - Dashboard
   - Starting 5
   - League standings
   - Schedule
   - Match simulation
   - Transfer market
   - Buy player
   - Sell player
   - Scouting
   - Automatic player development
   - Save game
   ========================================================= */


/* =========================================================
   DATA
========================================================= */

const leagues = [
  MPL_ID_2026,
  MPL_PH_2026,
  MPL_KH_2026
];

const SAVE_KEY = "mlbb_pro_manager_save_v06";


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
   TEMP STATE
========================================================= */

let currentTransferRole = "ALL";


/* =========================================================
   DOM
========================================================= */

const $ = id => document.getElementById(id);


/* =========================================================
   SAVE
========================================================= */

function saveGame() {

  try {

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );

  } catch (error) {

    console.error("Save error:", error);

  }
}


/* =========================================================
   LOAD
========================================================= */

function loadGame() {

  try {

    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return false;
    }

    const data = JSON.parse(saved);

    game = {
      ...game,
      ...data
    };


    /* Re-link country */

    if (game.country) {

      game.country =
        countries.find(
          c => c.id === game.country.id
        ) || null;

    }


    /* Re-link league */

    if (game.league) {

      game.league =
        leagues.find(
          l => l.id === game.league.id
        ) || null;

    }


    /* Re-link team */

    if (game.league && game.team) {

      game.team =
        game.league.teams.find(
          t => t.id === game.team.id
        ) || null;

    }


    if (
      game.careerStarted &&
      game.league &&
      game.team
    ) {

      if (
        !Array.isArray(game.team.players) ||
        game.team.players.length === 0
      ) {
        game.careerStarted = false;
        return false;
      }


      if (
        !Array.isArray(game.standings) ||
        game.standings.length === 0
      ) {
        game.standings =
          createStandings();
      }


      if (
        !Array.isArray(game.schedule)
      ) {
        game.schedule = [];
      }


      if (
        game.schedule.length === 0
      ) {
        game.schedule =
          createSchedule();
      }


      if (
        !Array.isArray(game.starters) ||
        game.starters.length === 0
      ) {
        game.starters =
          createStarters();
      }


      renderDashboard();

      return true;

    }

  } catch (error) {

    console.error("Load error:", error);

  }

  return false;
}


/* =========================================================
   SCREEN SYSTEM
========================================================= */

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.add("hidden");

    });


  const screen = $(id);

  if (screen) {
    screen.classList.remove("hidden");
  }

}


/* =========================================================
   COUNTRY
========================================================= */

function renderCountries() {

  const container = $("countryList");

  container.innerHTML = "";


  countries.forEach(country => {

    const leagueCount =
      leagues.filter(
        league =>
          league.region &&
          league.region.toLowerCase() ===
          country.id.toLowerCase()
      ).length;


    const button =
      document.createElement("button");

    button.className = "country-card";

    button.innerHTML = `
      <div class="country-main">

        <div class="country-flag">
          ${country.flag || "🌎"}
        </div>

        <div class="country-info">

          <strong>${country.name}</strong>

          <small>
            ${leagueCount || country.leagues?.length || 0}
            Liga tersedia
          </small>

        </div>

        <div class="arrow">›</div>

      </div>
    `;


    button.addEventListener(
      "click",
      () => selectCountry(country)
    );


    container.appendChild(button);

  });

}


/* =========================================================
   SELECT COUNTRY
========================================================= */

function selectCountry(country) {

  game.country = country;

  $("leagueCountryTitle").textContent =
    `${country.flag || ""} ${country.name}`;


  renderLeagues();

  showScreen("leagueScreen");

}


/* =========================================================
   LEAGUE
========================================================= */

function renderLeagues() {

  const container = $("leagueList");

  container.innerHTML = "";


  let countryLeagues =
    leagues.filter(
      league =>
        league.region &&
        game.country &&
        league.region.toLowerCase() ===
        game.country.id.toLowerCase()
    );


  /* fallback */

  if (
    countryLeagues.length === 0 &&
    game.country?.leagues
  ) {

    countryLeagues =
      leagues.filter(
        league =>
          game.country.leagues.includes(
            league.id
          )
      );

  }


  countryLeagues.forEach(league => {

    const button =
      document.createElement("button");

    button.className = "league-card";


    button.innerHTML = `
      <div class="league-main">

        <div class="country-flag">
          🏆
        </div>

        <div class="league-info">

          <strong>${league.name}</strong>

          <small>
            Season ${league.season}
            • ${league.teams.length} Teams
          </small>

        </div>

        <div class="arrow">›</div>

      </div>
    `;


    button.addEventListener(
      "click",
      () => selectLeague(league)
    );


    container.appendChild(button);

  });


  if (countryLeagues.length === 0) {

    container.innerHTML = `
      <div class="scouting-info">
        Belum ada data liga untuk negara ini.
      </div>
    `;

  }

}


/* =========================================================
   SELECT LEAGUE
========================================================= */

function selectLeague(league) {

  game.league = league;

  $("teamLeagueTitle").textContent =
    league.name;


  renderTeams();

  showScreen("teamScreen");

}


/* =========================================================
   TEAMS
========================================================= */

function renderTeams() {

  const container = $("teamList");

  container.innerHTML = "";


  if (!game.league) {
    return;
  }


  game.league.teams.forEach(team => {

    const button =
      document.createElement("button");

    button.className = "team-card";


    const rating =
      calculateTeamRatingFromPlayers(
        team.players
      );


    button.innerHTML = `
      <div class="team-main">

        <div class="country-flag">
          🛡️
        </div>

        <div class="team-info">

          <strong>${team.name}</strong>

          <small>
            ${team.players.length} Players
            • Rating ${rating}
          </small>

        </div>

        <div class="arrow">›</div>

      </div>
    `;


    button.addEventListener(
      "click",
      () => selectTeam(team)
    );


    container.appendChild(button);

  });

}


/* =========================================================
   SELECT TEAM
========================================================= */

function selectTeam(team) {

  game.team = team;

  game.year =
    game.league.season || 2026;

  game.budget = 500000;

  game.reputation = 50;

  game.standings =
    createStandings();

  game.schedule =
    createSchedule();

  game.starters =
    createStarters();

  game.careerStarted = true;


  saveGame();

  renderDashboard();

  showScreen("dashboardScreen");

}


/* =========================================================
   CREATE STARTERS
========================================================= */

function createStarters() {

  if (
    !game.team ||
    !Array.isArray(game.team.players)
  ) {
    return [];
  }


  const players =
    [...game.team.players]
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );


  const starters = [];

  const usedRoles = new Set();


  /* Try one player per role */

  players.forEach(player => {

    if (
      starters.length >= 5
    ) {
      return;
    }


    const role =
      normalizeRole(player.role);


    if (
      !usedRoles.has(role)
    ) {

      starters.push(player);

      usedRoles.add(role);

    }

  });


  /* Fill remaining slots */

  players.forEach(player => {

    if (
      starters.length >= 5
    ) {
      return;
    }


    if (
      !starters.includes(player)
    ) {

      starters.push(player);

    }

  });


  return starters.slice(0, 5);

}


/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRole(role) {

  if (!role) {
    return "FLEX";
  }


  const value =
    String(role).toUpperCase();


  if (
    value.includes("EXP") ||
    value.includes("OFFLANE") ||
    value.includes("FIGHTER")
  ) {
    return "EXP";
  }


  if (
    value.includes("JUNGLE") ||
    value.includes("JG")
  ) {
    return "JUNGLE";
  }


  if (
    value.includes("MID") ||
    value.includes("MAGE")
  ) {
    return "MID";
  }


  if (
    value.includes("GOLD") ||
    value.includes("GOLDLANE")
  ) {
    return "GOLD";
  }


  if (
    value.includes("ROAM") ||
    value.includes("SUPPORT")
  ) {
    return "ROAM";
  }


  return value;

}


/* =========================================================
   TEAM RATING
========================================================= */

function calculateTeamRating() {

  return calculateTeamRatingFromPlayers(
    game.starters || []
  );

}


function calculateTeamRatingFromPlayers(players) {

  if (
    !players ||
    players.length === 0
  ) {
    return 0;
  }


  const selected =
    players.slice(0, 5);


  const total =
    selected.reduce(
      (sum, player) =>
        sum + Number(player.rating || 0),
      0
    );


  let rating =
    total / selected.length;


  const roles =
    new Set(
      selected.map(
        player =>
          normalizeRole(player.role)
      )
    );


  if (roles.size >= 5) {

    rating += 3;

  } else if (roles.size >= 4) {

    rating += 1;

  } else {

    rating -= 3;

  }


  rating += 2;


  return Math.round(
    rating * 10
  ) / 10;

}


/* =========================================================
   STANDINGS
========================================================= */

function createStandings() {

  if (!game.league) {
    return [];
  }


  return game.league.teams.map(team => ({

    teamId: team.id,

    teamName: team.name,

    played: 0,

    wins: 0,

    losses: 0,

    gameWins: 0,

    gameLosses: 0,

    points: 0

  }));

}


/* =========================================================
   SCHEDULE
========================================================= */

function createSchedule() {

  if (
    !game.league ||
    !game.team
  ) {
    return [];
  }


  return game.league.teams
    .filter(
      team =>
        team.id !== game.team.id
    )
    .map(
      (team, index) => ({

        id:
          `${game.year}-${team.id}-${index}`,

        opponentId:
          team.id,

        opponentName:
          team.name,

        played: false,

        result: null,

        myScore: 0,

        opponentScore: 0

      })
    );

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  if (
    !game.team ||
    !game.league
  ) {
    return;
  }


  $("dashboardTeam").textContent =
    game.team.name;


  $("dashboardLeague").textContent =
    game.league.name;


  $("dashboardYear").textContent =
    game.year;


  $("budgetValue").textContent =
    formatMoney(game.budget);


  $("reputationValue").textContent =
    game.reputation;


  const myStanding =
    getMyStanding();


  $("positionValue").textContent =
    myStanding
      ? `#${getMyPosition()}`
      : "-";


  const played =
    game.schedule.filter(
      match => match.played
    ).length;


  $("matchCountValue").textContent =
    `${played}/${game.schedule.length}`;


  renderNextMatch();

  renderStartingFive();

  renderStandings();

}


/* =========================================================
   NEXT MATCH
========================================================= */

function renderNextMatch() {

  const container =
    $("nextMatchCard");


  const next =
    game.schedule.find(
      match =>
        !match.played
    );


  if (!next) {

    container.innerHTML = `
      <div style="text-align:center">

        <strong>
          Semua pertandingan musim ini selesai.
        </strong>

        <p style="color:#8d9aad">
          Kamu bisa Advance Season.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML = `

    <div class="next-match-top">

      <span>
        Match ${getCurrentMatchNumber()}
      </span>

      <span>
        BO3
      </span>

    </div>


    <div class="match-opponents">

      <div class="opponent">

        <div class="mini-logo">
          🛡️
        </div>

        <strong>
          ${game.team.name}
        </strong>

        <small>
          ${calculateTeamRating()}
        </small>

      </div>


      <div class="next-vs">
        VS
      </div>


      <div class="opponent">

        <div class="mini-logo">
          ⚔️
        </div>

        <strong>
          ${next.opponentName}
        </strong>

        <small>
          ${getOpponentRating(next.opponentId)}
        </small>

      </div>

    </div>


    <button
      class="play-btn"
      onclick="openNextMatch()"
    >
      Play Match
    </button>

  `;

}


/* =========================================================
   STARTING FIVE
========================================================= */

function renderStartingFive() {

  const container =
    $("startingFive");


  container.innerHTML = "";


  game.starters.forEach(player => {

    const div =
      document.createElement("div");

    div.className =
      "starting-player";


    div.innerHTML = `

      <div class="role-badge">
        ${normalizeRole(player.role)}
      </div>

      <div class="player-name">

        <strong>
          ${player.name}
        </strong>

        <small>
          ${player.nationality || ""}
        </small>

      </div>

      <div class="player-rating">
        ${player.rating}
      </div>

    `;


    container.appendChild(div);

  });

}


/* =========================================================
   STANDINGS RENDER
========================================================= */

function renderStandings() {

  const container =
    $("standings");


  if (
    !game.standings ||
    game.standings.length === 0
  ) {

    container.innerHTML =
      "Belum ada standings.";

    return;

  }


  const sorted =
    [...game.standings].sort(
      sortStandings
    );


  let html = `

    <table>

      <thead>

        <tr>

          <th>#</th>

          <th>Team</th>

          <th>P</th>

          <th>W</th>

          <th>L</th>

          <th>GD</th>

          <th>PTS</th>

        </tr>

      </thead>

      <tbody>

  `;


  sorted.forEach(
    (row, index) => {

      const isMine =
        row.teamId ===
        game.team.id;


      const gd =
        row.gameWins -
        row.gameLosses;


      html += `

        <tr class="${isMine ? "my-team-row" : ""}">

          <td class="rank">
            ${index + 1}
          </td>

          <td>
            ${row.teamName}
          </td>

          <td>
            ${row.played}
          </td>

          <td>
            ${row.wins}
          </td>

          <td>
            ${row.losses}
          </td>

          <td>
            ${gd > 0 ? "+" : ""}${gd}
          </td>

          <td>
            <strong>${row.points}</strong>
          </td>

        </tr>

      `;

    }
  );


  html += `

      </tbody>

    </table>

  `;


  container.innerHTML = html;

}


/* =========================================================
   STANDINGS SORT
========================================================= */

function sortStandings(a, b) {

  if (b.points !== a.points) {

    return b.points - a.points;

  }


  if (b.wins !== a.wins) {

    return b.wins - a.wins;

  }


  const gdA =
    a.gameWins - a.gameLosses;

  const gdB =
    b.gameWins - b.gameLosses;


  return gdB - gdA;

}


/* =========================================================
   MY STANDING
========================================================= */

function getMyStanding() {

  return game.standings.find(
    row =>
      row.teamId ===
      game.team.id
  );

}


function getMyPosition() {

  const sorted =
    [...game.standings].sort(
      sortStandings
    );


  return (
    sorted.findIndex(
      row =>
        row.teamId ===
        game.team.id
    ) + 1
  );

}


/* =========================================================
   MATCH
========================================================= */

function openNextMatch() {

  const next =
    game.schedule.find(
      match =>
        !match.played
    );


  if (!next) {

    alert(
      "Semua pertandingan musim ini sudah selesai."
    );

    return;

  }


  game.currentMatch = next;


  renderMatchScreen();

  showScreen("matchScreen");

}


/* =========================================================
   MATCH SCREEN
========================================================= */

function renderMatchScreen() {

  const match =
    game.currentMatch;


  if (!match) {
    return;
  }


  const opponent =
    getTeamById(
      match.opponentId
    );


  const myRating =
    calculateTeamRating();


  const enemyRating =
    calculateTeamRatingFromPlayers(
      opponent.players
    );


  const chance =
    calculateWinProbability(
      myRating,
      enemyRating
    );


  $("matchTitle").textContent =
    `MATCH ${getCurrentMatchNumber()}`;


  $("myTeamName").textContent =
    game.team.name;


  $("enemyTeamName").textContent =
    opponent.name;


  $("myTeamRating").textContent =
    myRating;


  $("enemyTeamRating").textContent =
    enemyRating;


  $("winChance").textContent =
    `${chance}%`;


  $("winChanceBar").style.width =
    `${chance}%`;


  const container =
    $("matchStartingFive");


  container.innerHTML = "";


  game.starters.forEach(player => {

    const div =
      document.createElement("div");

    div.className =
      "starting-player";


    div.innerHTML = `

      <div class="role-badge">
        ${normalizeRole(player.role)}
      </div>

      <div class="player-name">
        <strong>
          ${player.name}
        </strong>
      </div>

      <div class="player-rating">
        ${player.rating}
      </div>

    `;


    container.appendChild(div);

  });

}


/* =========================================================
   WIN PROBABILITY
========================================================= */

function calculateWinProbability(
  myRating,
  enemyRating
) {

  let probability =
    50 +
    (myRating - enemyRating) * 2;


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
   PLAY MATCH
========================================================= */

function playMatch() {

  const match =
    game.currentMatch;


  if (!match) {
    return;
  }


  const opponent =
    getTeamById(
      match.opponentId
    );


  const myRating =
    calculateTeamRating();


  const enemyRating =
    calculateTeamRatingFromPlayers(
      opponent.players
    );


  const winChance =
    calculateWinProbability(
      myRating,
      enemyRating
    );


  const win =
    Math.random() * 100 <
    winChance;


  let myScore;

  let enemyScore;


  if (win) {

    if (Math.random() < 0.55) {

      myScore = 2;
      enemyScore = 0;

    } else {

      myScore = 2;
      enemyScore = 1;

    }

  } else {

    if (Math.random() < 0.55) {

      myScore = 0;
      enemyScore = 2;

    } else {

      myScore = 1;
      enemyScore = 2;

    }

  }


  match.played = true;

  match.result =
    win ? "WIN" : "LOSS";

  match.myScore =
    myScore;

  match.opponentScore =
    enemyScore;


  updateStandingsAfterMatch(
    match,
    win,
    myScore,
    enemyScore
  );


  let budgetReward = 0;

  let reputationReward = 0;


  if (win) {

    budgetReward = 15000;

    reputationReward = 2;

    game.budget +=
      budgetReward;

    game.reputation +=
      reputationReward;

  } else {

    reputationReward = -1;

    game.reputation =
      Math.max(
        0,
        game.reputation +
        reputationReward
      );

  }


  saveGame();


  showResult(
    win,
    myScore,
    enemyScore,
    budgetReward,
    reputationReward,
    opponent.name
  );

}


/* =========================================================
   UPDATE STANDINGS
========================================================= */

function updateStandingsAfterMatch(
  match,
  win,
  myScore,
  enemyScore
) {

  const myStanding =
    game.standings.find(
      row =>
        row.teamId ===
        game.team.id
    );


  const enemyStanding =
    game.standings.find(
      row =>
        row.teamId ===
        match.opponentId
    );


  if (!myStanding || !enemyStanding) {
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


  if (win) {

    myStanding.wins++;

    myStanding.points += 3;

    enemyStanding.losses++;

  } else {

    myStanding.losses++;

    enemyStanding.wins++;

    enemyStanding.points += 3;

  }


  /* Simulate the effect on opponent
     and leave other teams unchanged.
     This version focuses on user's matches. */

}


/* =========================================================
   RESULT
========================================================= */

function showResult(
  win,
  myScore,
  enemyScore,
  budgetReward,
  reputationReward,
  opponentName
) {

  $("resultIcon").textContent =
    win ? "🏆" : "💀";


  $("resultTitle").textContent =
    win ? "VICTORY" : "DEFEAT";


  $("resultScore").textContent =
    `${myScore} - ${enemyScore}`;


  $("resultDescription").textContent =
    win
      ? `Kamu berhasil mengalahkan ${opponentName}.`
      : `Kamu kalah dari ${opponentName}.`;


  $("resultBudget").textContent =
    budgetReward > 0
      ? `+${formatMoney(budgetReward)}`
      : "Rp0";


  $("resultReputation").textContent =
    reputationReward > 0
      ? `+${reputationReward}`
      : `${reputationReward}`;


  showScreen("resultScreen");

}


/* =========================================================
   CONTINUE RESULT
========================================================= */

function continueAfterResult() {

  game.currentMatch = null;

  saveGame();

  renderDashboard();

  showScreen("dashboardScreen");

}


/* =========================================================
   ROSTER SCREEN
========================================================= */

function showRoster() {

  renderRoster();

  showScreen("rosterScreen");

}


function renderRoster() {

  if (!game.team) {
    return;
  }


  $("rosterSubtitle").textContent =
    `${game.team.name} • ${game.team.players.length} pemain`;


  $("rosterCount").textContent =
    game.team.players.length;


  $("rosterRating").textContent =
    calculateTeamRatingFromPlayers(
      game.team.players
    );


  const totalSalary =
    game.team.players.reduce(
      (sum, player) =>
        sum +
        Number(player.salary || 0),
      0
    );


  $("rosterSalary").textContent =
    formatMoney(totalSalary);


  const container =
    $("rosterList");


  container.innerHTML = "";


  game.team.players.forEach(player => {

    container.appendChild(
      createPlayerCard(
        player,
        {
          mode: "roster"
        }
      )
    );

  });


  /* Sell button */

  const sellButton =
    document.createElement("button");

  sellButton.className =
    "primary-btn";

  sellButton.textContent =
    "💰 Jual Pemain";


  sellButton.onclick =
    showSellPlayers;


  container.appendChild(
    sellButton
  );

}


/* =========================================================
   PLAYER CARD
========================================================= */

function createPlayerCard(
  player,
  options = {}
) {

  const card =
    document.createElement("div");

  card.className =
    "player-card";


  const age =
    player.age ?? "-";


  const rating =
    Number(player.rating || 0);


  const potential =
    Number(player.potential || 0);


  const salary =
    Number(player.salary || 0);


  card.innerHTML = `

    <div class="player-top">

      <div class="player-avatar">
        👤
      </div>

      <div class="player-main">

        <strong>
          ${player.name}
        </strong>

        <small>
          ${normalizeRole(player.role)}
          • ${player.nationality || "-"}
        </small>

      </div>

      <div class="rating-box">

        <strong>
          ${rating}
        </strong>

        <small>
          Rating
        </small>

      </div>

    </div>


    <div class="player-details">

      <div class="player-detail">

        <span>Age</span>

        <strong>
          ${age}
        </strong>

      </div>

      <div class="player-detail">

        <span>Potential</span>

        <strong>
          ${potential}
        </strong>

      </div>

      <div class="player-detail">

        <span>Salary</span>

        <strong>
          ${formatMoney(salary)}
        </strong>

      </div>

    </div>

  `;


  if (options.mode === "roster") {

    const actions =
      document.createElement("div");

    actions.className =
      "player-actions";


    const sellBtn =
      document.createElement("button");

    sellBtn.className =
      "action-btn sell-btn";

    sellBtn.textContent =
      "Jual";


    sellBtn.onclick =
      () => sellPlayer(player.id);


    actions.appendChild(
      sellBtn
    );


    card.appendChild(actions);

  }


  if (options.mode === "transfer") {

    const actions =
      document.createElement("div");

    actions.className =
      "player-actions";


    const buyBtn =
      document.createElement("button");

    buyBtn.className =
      "action-btn buy-btn";


    const price =
      getTransferPrice(player);


    buyBtn.textContent =
      `Beli • ${formatMoney(price)}`;


    buyBtn.onclick =
      () => buyPlayer(player);


    actions.appendChild(
      buyBtn
    );


    card.appendChild(actions);

  }


  return card;

}


/* =========================================================
   TRANSFER MARKET
========================================================= */

function showTransferMarket() {

  renderTransferMarket();

  showScreen("transferScreen");

}


function renderTransferMarket() {

  $("marketBudget").textContent =
    formatMoney(game.budget);


  const container =
    $("transferList");


  container.innerHTML = "";


  const players =
    getTransferPlayers();


  let filtered =
    players;


  if (
    currentTransferRole !==
    "ALL"
  ) {

    filtered =
      players.filter(
        player => {

          const role =
            normalizeRole(
              player.role
            );

          return role ===
            currentTransferRole;

        }
      );

  }


  filtered =
    filtered
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );


  if (filtered.length === 0) {

    container.innerHTML = `
      <div class="scouting-info">
        Tidak ada pemain yang tersedia.
      </div>
    `;

    return;

  }


  filtered.forEach(player => {

    container.appendChild(
      createPlayerCard(
        player,
        {
          mode: "transfer"
        }
      )
    );

  });

}


/* =========================================================
   GET TRANSFER PLAYERS
========================================================= */

function getTransferPlayers() {

  if (!game.league) {
    return [];
  }


  const result = [];


  game.league.teams.forEach(team => {

    if (
      team.id ===
      game.team.id
    ) {
      return;
    }


    team.players.forEach(player => {

      result.push({

        ...player,

        currentTeam:
          team.name,

        sourceTeamId:
          team.id,

        transferPrice:
          getTransferPrice(player)

      });

    });

  });


  /* Add free agents */

  const freeAgents =
    generateFreeAgents();


  freeAgents.forEach(player => {

    result.push(player);

  });


  return result;

}


/* =========================================================
   TRANSFER PRICE
========================================================= */

function getTransferPrice(player) {

  const rating =
    Number(player.rating || 50);

  const potential =
    Number(player.potential || rating);


  let price =
    30000 +
    rating * 2500 +
    potential * 1000;


  if (
    Number(player.age || 25) <= 21
  ) {

    price += 25000;

  }


  return Math.round(
    price / 5000
  ) * 5000;

}


/* =========================================================
   BUY PLAYER
========================================================= */

function buyPlayer(player) {

  const price =
    getTransferPrice(player);


  if (
    game.team.players.length >= 10
  ) {

    alert(
      "Roster sudah penuh. Maksimal 10 pemain."
    );

    return;

  }


  if (
    game.budget < price
  ) {

    alert(
      `Budget tidak cukup.\nHarga: ${formatMoney(price)}`
    );

    return;

  }


  const confirmed =
    confirm(
      `Beli ${player.name} seharga ${formatMoney(price)}?`
    );


  if (!confirmed) {
    return;
  }


  game.budget -= price;


  const newPlayer = {

    ...player,

    id:
      `signed-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)`

  };


  delete newPlayer.currentTeam;

  delete newPlayer.sourceTeamId;

  delete newPlayer.transferPrice;


  game.team.players.push(
    newPlayer
  );


  /* Remove from source team */

  if (
    player.sourceTeamId
  ) {

    const sourceTeam =
      getTeamById(
        player.sourceTeamId
      );


    if (sourceTeam) {

      const index =
        sourceTeam.players.findIndex(
          p =>
            p.id ===
            player.id
        );


      if (index !== -1) {

        sourceTeam.players.splice(
          index,
          1
        );

      }

    }

  }


  game.starters =
    createStarters();


  saveGame();


  alert(
    `${player.name} berhasil bergabung ke ${game.team.name}!`
  );


  renderTransferMarket();

  renderDashboard();

}


/* =========================================================
   SELL PLAYER
========================================================= */

function showSellPlayers() {

  renderSellPlayers();

  showScreen("sellScreen");

}


function renderSellPlayers() {

  const container =
    $("sellList");


  container.innerHTML = "";


  game.team.players.forEach(player => {

    const card =
      createPlayerCard(
        player
      );


    const action =
      document.createElement("div");

    action.className =
      "player-actions";


    const button =
      document.createElement("button");

    button.className =
      "action-btn sell-btn";


    const value =
      getSellPrice(player);


    button.textContent =
      `Jual • ${formatMoney(value)}`;


    button.onclick =
      () => sellPlayer(player.id);


    action.appendChild(button);

    card.appendChild(action);


    container.appendChild(card);

  });

}


/* =========================================================
   SELL PRICE
========================================================= */

function getSellPrice(player) {

  const transferPrice =
    getTransferPrice(player);


  return Math.round(
    transferPrice * 0.6 / 5000
  ) * 5000;

}


/* =========================================================
   SELL PLAYER
========================================================= */

function sellPlayer(playerId) {

  if (
    game.team.players.length <= 5
  ) {

    alert(
      "Minimal roster harus memiliki 5 pemain."
    );

    return;

  }


  const player =
    game.team.players.find(
      p =>
        p.id === playerId
    );


  if (!player) {
    return;
  }


  const value =
    getSellPrice(player);


  const confirmed =
    confirm(
      `Jual ${player.name} seharga ${formatMoney(value)}?`
    );


  if (!confirmed) {
    return;
  }


  game.budget += value;


  game.team.players =
    game.team.players.filter(
      p =>
        p.id !== playerId
    );


  game.starters =
    createStarters();


  saveGame();


  alert(
    `${player.name} berhasil dijual.`
  );


  renderRoster();

  renderDashboard();

}


/* =========================================================
   SCOUTING
========================================================= */

function showScouting() {

  renderScouting();

  showScreen("scoutingScreen");

}


function renderScouting() {

  const container =
    $("scoutingList");


  container.innerHTML = "";


  const players =
    getTransferPlayers()
      .sort(
        (a, b) =>
          Number(b.potential || 0) -
          Number(a.potential || 0)
      )
      .slice(0, 15);


  players.forEach(player => {

    const card =
      createPlayerCard(
        player,
        {
          mode: "transfer"
        }
      );


    container.appendChild(card);

  });

}


/* =========================================================
   FREE AGENTS
========================================================= */

function generateFreeAgents() {

  const agents = [

    {
      id: "fa-1",
      name: "Rex",
      role: "Jungle",
      nationality: "ID",
      age: 19,
      rating: 67,
      potential: 82,
      salary: 9000
    },

    {
      id: "fa-2",
      name: "Kairo",
      role: "Mid",
      nationality: "PH",
      age: 20,
      rating: 69,
      potential: 84,
      salary: 10000
    },

    {
      id: "fa-3",
      name: "Vynn",
      role: "Roam",
      nationality: "ID",
      age: 22,
      rating: 70,
      potential: 78,
      salary: 11000
    },

    {
      id: "fa-4",
      name: "Lance",
      role: "Gold",
      nationality: "PH",
      age: 21,
      rating: 71,
      potential: 83,
      salary: 12000
    },

    {
      id: "fa-5",
      name: "Arka",
      role: "EXP",
      nationality: "ID",
      age: 20,
      rating: 68,
      potential: 80,
      salary: 9500
    }

  ];


  return agents.map(
    player => ({

      ...player,

      currentTeam:
        "Free Agent"

    })
  );

}


/* =========================================================
   SCHEDULE SCREEN
========================================================= */

function showSchedule() {

  renderSchedule();

  showScreen("scheduleScreen");

}


function renderSchedule() {

  const container =
    $("scheduleList");


  container.innerHTML = "";


  game.schedule.forEach(
    (match, index) => {

      const item =
        document.createElement("div");

      item.className =
        "schedule-item";


      let status =
        "UPCOMING";


      let statusClass =
        "status-pending";


      if (match.played) {

        status =
          match.result === "WIN"
            ? `WIN ${match.myScore}-${match.opponentScore}`
            : `LOSS ${match.myScore}-${match.opponentScore}`;


        statusClass =
          match.result === "WIN"
            ? "status-win"
            : "status-loss";

      }


      item.innerHTML = `

        <div class="match-number">
          #${index + 1}
        </div>

        <div class="schedule-opponent">

          <strong>
            ${match.opponentName}
          </strong>

          <small>
            Best of 3
          </small>

        </div>

        <div class="schedule-status ${statusClass}">
          ${status}
        </div>

      `;


      container.appendChild(item);

    }
  );

}


/* =========================================================
   ADVANCE SEASON
========================================================= */

function advanceSeason() {

  const unfinished =
    game.schedule.some(
      match =>
        !match.played
    );


  if (unfinished) {

    alert(
      "Selesaikan semua pertandingan musim ini terlebih dahulu."
    );

    return;

  }


  const confirmed =
    confirm(
      `Musim ${game.year} selesai.\n\nLanjut ke musim berikutnya?`
    );


  if (!confirmed) {
    return;
  }


  developPlayers();


  game.year++;


  game.budget += 100000;


  game.reputation =
    Math.max(
      0,
      game.reputation
    );


  game.standings =
    createStandings();


  game.schedule =
    createSchedule();


  game.starters =
    createStarters();


  saveGame();


  renderDashboard();


  alert(
    `Selamat datang di musim ${game.year}!`
  );

}


/* =========================================================
   PLAYER DEVELOPMENT
   NO TRAINING SYSTEM
========================================================= */

function developPlayers() {

  if (!game.league) {
    return;
  }


  game.league.teams.forEach(team => {

    team.players.forEach(player => {

      const age =
        Number(player.age || 25);


      const rating =
        Number(player.rating || 50);


      const potential =
        Number(
          player.potential ||
          rating
        );


      let change = 0;


      /* Young players */

      if (
        age <= 20
      ) {

        if (
          rating < potential &&
          Math.random() < 0.75
        ) {

          change =
            Math.random() < 0.7
              ? 2
              : 1;

        }

      }

      else if (
        age <= 23
      ) {

        if (
          rating < potential &&
          Math.random() < 0.60
        ) {

          change = 1;

        }

      }

      /* Prime */

      else if (
        age <= 27
      ) {

        const roll =
          Math.random();


        if (
          roll < 0.55
        ) {

          change = 0;

        } else if (
          roll < 0.75
        ) {

          change = 1;

        } else if (
          roll < 0.95
        ) {

          change = -1;

        }

      }

      /* Older players */

      else {

        const roll =
          Math.random();


        if (
          roll < 0.55
        ) {

          change = -1;

        } else if (
          roll < 0.80
        ) {

          change = -2;

        }

      }


      player.rating =
        Math.max(
          40,
          Math.min(
            99,
            rating + change
          )
        );


      player.age =
        age + 1;


      /* Potential slowly decreases */

      if (
        age >= 25 &&
        Math.random() < 0.35
      ) {

        player.potential =
          Math.max(
            player.rating,
            potential - 1
          );

      }

    });

  });

}


/* =========================================================
   TEAM FINDER
========================================================= */

function getTeamById(id) {

  if (!game.league) {
    return null;
  }


  return game.league.teams.find(
    team =>
      team.id === id
  ) || null;

}


/* =========================================================
   OPPONENT RATING
========================================================= */

function getOpponentRating(teamId) {

  const team =
    getTeamById(teamId);


  if (!team) {
    return 0;
  }


  return calculateTeamRatingFromPlayers(
    team.players
  );

}


/* =========================================================
   CURRENT MATCH NUMBER
========================================================= */

function getCurrentMatchNumber() {

  const played =
    game.schedule.filter(
      match =>
        match.played
    ).length;


  return played + 1;

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(value) {

  const number =
    Number(value || 0);


  if (
    number >= 1000000000
  ) {

    return (
      "Rp" +
      (number / 1000000000)
        .toFixed(1)
        .replace(".0", "") +
      " M"
    );

  }


  if (
    number >= 1000000
  ) {

    return (
      "Rp" +
      (number / 1000000)
        .toFixed(1)
        .replace(".0", "") +
      " Jt"
    );

  }


  if (
    number >= 1000
  ) {

    return (
      "Rp" +
      (number / 1000)
        .toFixed(0) +
      " Rb"
    );

  }


  return (
    "Rp" +
    number.toLocaleString("id-ID")
  );

}


/* =========================================================
   RESTART GAME
========================================================= */

function restartGame() {

  const confirmed =
    confirm(
      "Hapus career dan mulai dari awal?"
    );


  if (!confirmed) {
    return;
  }


  localStorage.removeItem(
    SAVE_KEY
  );


  location.reload();

}


/* =========================================================
   BACK BUTTONS
========================================================= */

function setupButtons() {

  $("backToCountryBtn").onclick =
    () => showScreen("countryScreen");


  $("backToLeagueBtn").onclick =
    () => showScreen("leagueScreen");


  $("backToDashboardRosterBtn").onclick =
    () => {
      renderDashboard();
      showScreen("dashboardScreen");
    };


  $("backToDashboardTransferBtn").onclick =
    () => {
      renderDashboard();
      showScreen("dashboardScreen");
    };


  $("backToRosterSellBtn").onclick =
    () => {
      renderRoster();
      showScreen("rosterScreen");
    };


  $("backToDashboardScheduleBtn").onclick =
    () => {
      renderDashboard();
      showScreen("dashboardScreen");
    };


  $("backToDashboardScoutingBtn").onclick =
    () => {
      renderDashboard();
      showScreen("dashboardScreen");
    };


  $("openRosterBtn").onclick =
    showRoster;


  $("rosterBtn").onclick =
    showRoster;


  $("transferBtn").onclick =
    showTransferMarket;


  $("scheduleBtn").onclick =
    showSchedule;


  $("scoutingBtn").onclick =
    showScouting;


  $("advanceSeasonBtn").onclick =
    advanceSeason;


  $("playMatchBtn").onclick =
    playMatch;


  $("continueResultBtn").onclick =
    continueAfterResult;


  $("restartBtn").onclick =
    restartGame;


  /* Transfer filters */

  document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".filter-btn")
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          currentTransferRole =
            button.dataset.role;


          renderTransferMarket();

        }
      );

    });

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderCountries();

    setupButtons();


    const loaded =
      loadGame();


    if (loaded) {

      showScreen(
        "dashboardScreen"
      );

    } else {

      showScreen(
        "countryScreen"
      );

    }

  }
);
