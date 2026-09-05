/* =========================================================
   MLBB PRO MANAGER
   V0.5
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
   SAVE
========================================================= */

function saveGame() {

  try {

    localStorage.setItem(
      "mlbb_pro_manager_save",
      JSON.stringify(game)
    );

  } catch (error) {

    console.log(
      "Failed to save game:",
      error
    );

  }

}


/* =========================================================
   LOAD
========================================================= */

function loadGame() {

  const save =
    localStorage.getItem(
      "mlbb_pro_manager_save"
    );

  if (!save) return;

  try {

    const saved =
      JSON.parse(save);

    if (!saved.careerStarted) {
      return;
    }


    /*
      Re-link country
    */

    const country =
      countries.find(
        c =>
          c.id ===
          saved.country?.id
      );


    /*
      Re-link league
    */

    const league =
      leagues.find(
        l =>
          l.id ===
          saved.league?.id
      );


    /*
      Re-link team
    */

    const team =
      league?.teams.find(
        t =>
          t.id ===
          saved.team?.id
      );


    if (
      !country ||
      !league ||
      !team
    ) {

      console.log(
        "Save tidak cocok dengan data game."
      );

      return;

    }


    game = {

      year:
        saved.year ||
        2026,

      country,

      league,

      team,

      budget:
        saved.budget ??
        500000,

      reputation:
        saved.reputation ??
        50,

      standings:
        Array.isArray(
          saved.standings
        )
          ? saved.standings
          : [],

      schedule:
        Array.isArray(
          saved.schedule
        )
          ? saved.schedule
          : [],

      currentMatch:
        null,

      starters:
        Array.isArray(
          saved.starters
        )
          ? saved.starters
          : [],

      careerStarted:
        true

    };


    /*
      Make sure standings exist
    */

    if (
      !game.standings.length
    ) {

      createStandings();

    }


    /*
      Make sure schedule exists
    */

    if (
      !game.schedule.length
    ) {

      createSeasonSchedule();

    }


    /*
      Make sure Starting 5 exists
    */

    if (
      game.starters.length !== 5
    ) {

      createStarters();

    }


    renderDashboard();

    showScreen(
      "dashboardScreen"
    );


  } catch (error) {

    console.log(
      "Save corrupt:",
      error
    );

  }

}


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

    window.scrollTo({
      top: 0,
      behavior: "instant"
    });

  }

}


/* =========================================================
   BACK
========================================================= */

function backToDashboard() {

  showScreen(
    "dashboardScreen"
  );

  renderDashboard();

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

        <div class="country-left">

          <div class="country-flag">
            ${country.flag || "🌐"}
          </div>

          <div>

            <strong>
              ${country.name}
            </strong>

            <span>
              ${country.leagues.length}
              League
            </span>

          </div>

        </div>

        <div class="card-arrow">
          →
        </div>

      `;


      button.onclick = () => {

        selectCountry(
          country.id
        );

      };


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


  if (!game.country) return;


  /*
    FIX V0.5:
    Country ID sekarang dicocokkan
    dengan league.region.
  */

  const available =
    leagues.filter(
      league =>
        league.region &&
        league.region.toLowerCase() ===
        game.country.id
    );


  /*
    Fallback menggunakan daftar
    league ID milik country.
  */

  const finalLeagues =
    available.length
      ? available
      : leagues.filter(
          league =>
            game.country.leagues.includes(
              league.id
            )
        );


  finalLeagues.forEach(
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

          <span>
            Season ${league.season}
            •
            ${league.teams.length}
            Teams
          </span>

        </div>

        <div class="card-arrow">
          →
        </div>

      `;


      button.onclick = () => {

        selectLeague(
          league
        );

      };


      container.appendChild(
        button
      );

    }
  );


  if (!finalLeagues.length) {

    container.innerHTML = `

      <div class="game-card">

        <h3>
          No League Found
        </h3>

        <p>
          Belum ada data league untuk
          negara ini.
        </p>

      </div>

    `;

  }

}


/* =========================================================
   SELECT LEAGUE
========================================================= */

function selectLeague(
  league
) {

  game.league =
    league;


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


  if (!game.league) return;


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

          <span>
            ${team.players.length}
            Players
          </span>

        </div>

        <div class="card-arrow">
          →
        </div>

      `;


      button.onclick = () => {

        selectTeam(
          team
        );

      };


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

  game.team =
    team;

  game.careerStarted =
    true;

  game.year =
    game.league.season ||
    2026;

  game.budget =
    500000;

  game.reputation =
    50;

  createStarters();

  createStandings();

  createSeasonSchedule();

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

  if (!game.team) return;


  const players =
    [...game.team.players];


  /*
    Try to pick one player
    from each unique role first.
  */

  const selected = [];

  const roles = [];


  players
    .slice()
    .sort(
      (a, b) =>
        (b.rating || 0) -
        (a.rating || 0)
    )
    .forEach(player => {

      if (
        !roles.includes(
          player.role
        ) &&
        selected.length < 5
      ) {

        selected.push(
          player.id
        );

        roles.push(
          player.role
        );

      }

    });


  /*
    Fill remaining slots
    with highest rating.
  */

  players
    .slice()
    .sort(
      (a, b) =>
        (b.rating || 0) -
        (a.rating || 0)
    )
    .forEach(player => {

      if (
        selected.length < 5 &&
        !selected.includes(
          player.id
        )
      ) {

        selected.push(
          player.id
        );

      }

    });


  game.starters =
    selected.slice(0, 5);

}


/* =========================================================
   GET STARTERS
========================================================= */

function getStarters() {

  if (!game.team) return [];


  return game.team.players.filter(
    player =>
      game.starters.includes(
        player.id
      )
  );

}


/* =========================================================
   TOGGLE STARTER
========================================================= */

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


  let bonus = 0;


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
  ) return;


  game.schedule = [];


  game.league.teams.forEach(
    team => {

      if (
        team.id ===
        game.team.id
      ) return;


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


/* =========================================================
   GET TEAM
========================================================= */

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


/* =========================================================
   NEXT MATCH
========================================================= */

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

  if (
    !game.careerStarted
  ) {

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


  const playButton =
    document.getElementById(
      "playMatchButton"
    );


  playButton.disabled =
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


  if (!container)
    return;


  container.innerHTML = "";


  const players =
    getStarters();


  players.forEach(
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

        <strong class="player-rating">
          ${player.rating}
        </strong>

      `;


      container.appendChild(
        div
      );

    }
  );


  if (
    players.length !== 5
  ) {

    container.innerHTML += `

      <div class="game-card">

        <p>
          Starting 5 belum lengkap.
          Kembali ke dashboard untuk
          memilih pemain.
        </p>

      </div>

    `;

  }

}


/* =========================================================
   SIMULATE BO3
========================================================= */

function simulateCurrentMatch() {

  const match =
    game.currentMatch;


  if (!match) return;


  if (
    game.starters.length !== 5
  ) {

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

    game.reputation += 2;

    game.budget += 15000;

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
      ${myGames} - ${enemyGames}
    </div>

    <p>
      ${
        won
          ? "Kamu mendapatkan 3 poin dan bonus Rp 15.000."
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
  ).disabled = true;

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


/* =========================================================
   UPDATE STANDINGS
========================================================= */

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
        s.teamId ===
        myTeamId
    );


  const enemy =
    game.standings.find(
      s =>
        s.teamId ===
        opponentId
    );


  if (
    !mine ||
    !enemy
  ) return;


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


/* =========================================================
   UPDATE DASHBOARD
========================================================= */

function updateDashboard() {

  const name =
    document.getElementById(
      "teamName"
    );


  if (name) {

    name.textContent =
      game.team.name;

  }


  const leagueName =
    document.getElementById(
      "leagueName"
    );


  if (leagueName) {

    leagueName.textContent =
      game.league?.name ||
      "MPL";

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


  const playedCount =
    game.schedule.filter(
      m =>
        m.played
    ).length;


  const total =
    game.schedule.length;


  container.innerHTML = `

    <div class="game-card">

      <h3>
        ${game.team.name}
        vs
        ${opponent.name}
      </h3>

      <p>
        BO3 • Match
        ${playedCount + 1}
        / ${total}
      </p>

      <button
        class="primary-button"
        onclick="openNextMatch()"
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


  if (!container)
    return;


  container.innerHTML = "";


  if (!game.team)
    return;


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
            • Age ${player.age}
          </div>

        </div>

        <div class="player-right">

          <strong class="player-rating">
            ${player.rating}
          </strong>

          <button
            class="starter-button ${
              selected
                ? "active"
                : ""
            }"
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
   STANDINGS UI
========================================================= */

function renderStandings() {

  const container =
    document.getElementById(
      "standingsContainer"
    );


  if (!container)
    return;


  if (
    !game.standings.length
  ) {

    container.innerHTML = "";

    return;

  }


  const sorted =
    [...game.standings]
      .sort(
        (a, b) => {

          const gdA =
            a.gameWins -
            a.gameLosses;

          const gdB =
            b.gameWins -
            b.gameLosses;


          return (
            b.points -
            a.points
          ) ||
          (
            b.wins -
            a.wins
          ) ||
          (
            gdB -
            gdA
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
        "standing-row";


      const gd =
        standing.gameWins -
        standing.gameLosses;


      div.innerHTML = `

        <div class="standing-rank">
          #${index + 1}
        </div>

        <div class="standing-team">

          <strong>
            ${team.name}
          </strong>

          <div class="standing-record">
            ${standing.wins}W -
            ${standing.losses}L
          </div>

        </div>

        <div class="standing-gd">
          ${gd >= 0 ? "+" : ""}
          ${gd}
        </div>

        <div class="standing-points">
          ${standing.points}
          PTS
        </div>

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

  if (
    !game.schedule.length
  ) {

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

  if (
    !game.league ||
    !game.team
  ) return;


  const candidates = [];


  game.league.teams.forEach(
    team => {

      if (
        team.id ===
        game.team.id
      ) return;


      team.players.forEach(
        player => {

          candidates.push({
            player,
            team
          });

        }
      );

    }
  );


  candidates.sort(
    (a, b) =>
      (b.player.rating || 0) -
      (a.player.rating || 0)
  );


  const top =
    candidates.slice(0, 5);


  let message =
    "TRANSFER MARKET V0.5\n\n";


  top.forEach(
    item => {

      const price =
        calculateTransferPrice(
          item.player
        );


      message +=
        `${item.player.name}\n` +
        `${item.player.role} • ` +
        `Rating ${item.player.rating}\n` +
        `Club: ${item.team.name}\n` +
        `Price: ${formatMoney(price)}\n\n`;

    }
  );


  message +=
    "Transfer penuh akan dikembangkan di V0.6.";


  alert(message);

}


/* =========================================================
   TRANSFER PRICE
========================================================= */

function calculateTransferPrice(
  player
) {

  const rating =
    player.rating || 60;


  const age =
    player.age || 20;


  let price =
    rating * 3000;


  if (age <= 21) {

    price *= 1.4;

  } else if (
    age <= 24
  ) {

    price *= 1.2;

  } else if (
    age >= 28
  ) {

    price *= 0.8;

  }


  return Math.round(
    price / 5000
  ) * 5000;

}


/* =========================================================
   SCOUTING
========================================================= */

function showScouting() {

  if (
    !game.league
  ) return;


  const candidates = [];


  game.league.teams.forEach(
    team => {

      team.players.forEach(
        player => {

          if (
            team.id !==
            game.team.id
          ) {

            candidates.push({
              player,
              team
            });

          }

        }
      );

    }
  );


  candidates.sort(
    (a, b) => {

      const potentialA =
        a.player.potential ||
        a.player.rating ||
        0;

      const potentialB =
        b.player.potential ||
        b.player.rating ||
        0;

      return (
        potentialB -
        potentialA
      );

    }
  );


  const top =
    candidates.slice(0, 5);


  let message =
    "SCOUTING REPORT V0.5\n\n";


  top.forEach(
    item => {

      const potential =
        item.player.potential ||
        "?";


      message +=
        `${item.player.name}\n` +
        `${item.player.role}\n` +
        `Rating: ${item.player.rating}\n` +
        `Potential: ${potential}\n` +
        `Club: ${item.team.name}\n\n`;

    }
  );


  message +=
    "Scouting lengkap akan dikembangkan di V0.6.";


  alert(message);

}


/* =========================================================
   ADVANCE SEASON
========================================================= */

function advanceSeason() {

  if (
    !game.schedule.length
  ) {

    alert(
      "Schedule belum tersedia."
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


  const confirmAdvance =
    confirm(
      `Lanjut ke Season ${
        game.year + 1
      }?\n\n` +
      "Player akan mengalami perkembangan atau penurunan otomatis."
    );


  if (!confirmAdvance)
    return;


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

  if (
    !game.league
  ) return;


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


          /*
            Young players
            mostly improve.
          */

          if (
            player.age <= 21
          ) {

            change =
              Math.random() < 0.8
                ? randomInt(1, 3)
                : -1;


          /*
            Prime age
          */

          } else if (
            player.age <= 25
          ) {

            change =
              Math.random() < 0.65
                ? randomInt(0, 1)
                : -1;


          /*
            Older players
            are more likely to decline.
          */

          } else {

            change =
              Math.random() < 0.35
                ? -randomInt(1, 2)
                : 0;

          }


          /*
            High potential players
            can improve faster.
          */

          if (
            player.rating <
              potential &&
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
   RANDOM
========================================================= */

function randomInt(
  min,
  max
) {

  return Math.floor(
    Math.random() *
      (
        max -
        min +
        1
      )
  ) + min;

}


/* =========================================================
   MONEY
========================================================= */

function formatMoney(
  value
) {

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

  const confirmRestart =
    confirm(
      "Yakin ingin memulai game baru?\n\nSave career sekarang akan dihapus."
    );


  if (!confirmRestart)
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

    renderCountries();

    loadGame();

  }
);
