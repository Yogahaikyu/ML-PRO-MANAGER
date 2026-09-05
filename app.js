/* =========================================================
   MLBB PRO MANAGER
   V0.9 FIXED
   ========================================================= */

const SAVE_KEY = "mlbb_pro_manager_save_v09";

let selectedTarget = "top3";

const DEFAULT_GAME = {
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

  seasonComplete: false,
  phase: "regular",

  world: {
    ranking: [],

    msc: {
      qualified: false,
      completed: false,
      champion: null,
      championId: null,
      teams: [],
      matches: [],
      round: 1
    },

    mSeries: {
      qualified: false,
      completed: false,
      champion: null,
      championId: null,
      teams: [],
      matches: [],
      round: 1
    }
  },

  history: []
};

let game = deepClone(DEFAULT_GAME);


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


function el(id) {
  return document.getElementById(id);
}


function showScreen(id) {

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = el(id);

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
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
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


/* =========================================================
   DATA
   ========================================================= */

function getAllLeagues() {

  const leagues = [];

  if (typeof MPL_ID_2026 !== "undefined") {
    leagues.push(MPL_ID_2026);
  }

  if (typeof MPL_PH_2026 !== "undefined") {
    leagues.push(MPL_PH_2026);
  }

  if (typeof MPL_KH_2026 !== "undefined") {
    leagues.push(MPL_KH_2026);
  }

  return leagues;
}


function getLeagueById(id) {

  return getAllLeagues().find(
    league => league.id === id
  );
}


function getTeamSource(teamId) {

  if (!teamId) return null;

  for (const league of getAllLeagues()) {

    const team =
      league.teams.find(
        t => t.id === teamId
      );

    if (team) {

      return {
        team,
        league
      };

    }
  }

  return null;
}


/*
  PENTING:
  Team milik user disimpan sebagai object sendiri.
  Jadi database asli tidak ikut berubah.
*/

function getCurrentTeam() {

  if (
    game.currentTeamData &&
    game.currentTeamData.id === game.team
  ) {
    return game.currentTeamData;
  }

  const source =
    getTeamSource(game.team);

  if (!source) return null;

  game.currentTeamData =
    deepClone(source.team);

  game.currentTeamData.players =
    game.currentTeamData.players || [];

  game.currentTeamData.players.forEach(
    player => {

      if (player.contractYears == null) {
        player.contractYears = 2;
      }

      if (player.morale == null) {
        player.morale = 70;
      }

    }
  );

  return game.currentTeamData;
}


function getCurrentLeague() {
  return getLeagueById(game.league);
}


function getCurrentTeamName() {

  const team =
    getCurrentTeam();

  return team
    ? team.name
    : "-";
}


function getCurrentLeagueName() {

  const league =
    getCurrentLeague();

  return league
    ? league.name
    : "-";
}


function getTeamDisplayName(teamId) {

  if (
    teamId === game.team
  ) {
    return getCurrentTeamName();
  }

  const source =
    getTeamSource(teamId);

  return source
    ? source.team.name
    : "-";
}


function getTeamPlayers(teamId) {

  if (
    teamId === game.team
  ) {
    return getCurrentTeam()?.players || [];
  }

  const source =
    getTeamSource(teamId);

  return source?.team.players || [];
}


/* =========================================================
   COUNTRY
   ========================================================= */

function renderCountries() {

  const container =
    el("countryList");

  if (!container) return;

  container.innerHTML = "";

  countries.forEach(country => {

    const button =
      document.createElement("button");

    button.className =
      "country-btn";

    button.innerHTML = `
      <div class="country-flag">
        ${country.flag}
      </div>

      <div class="country-info">
        <strong>${country.name}</strong>
        <span>
          ${country.leagues.length} league tersedia
        </span>
      </div>
    `;

    button.onclick = () =>
      selectCountry(country.id);

    container.appendChild(button);

  });

}


function selectCountry(countryId) {

  const country =
    countries.find(
      c => c.id === countryId
    );

  if (!country) return;

  game.country =
    country.id;

  const title =
    el("leagueCountryTitle");

  if (title) {

    title.textContent =
      `${country.flag} ${country.name}`;

  }

  renderLeagues();

  showScreen("leagueScreen");

}


function renderLeagues() {

  const container =
    el("leagueList");

  if (!container) return;

  container.innerHTML = "";

  const country =
    countries.find(
      c => c.id === game.country
    );

  if (!country) return;

  country.leagues.forEach(
    leagueId => {

      const league =
        getLeagueById(leagueId);

      if (!league) return;

      const button =
        document.createElement("button");

      button.className =
        "league-btn";

      button.innerHTML = `
        <div class="league-info">
          <strong>
            ${league.name}
          </strong>

          <span>
            Season ${league.season}
            • ${league.teams.length} teams
          </span>
        </div>
      `;

      button.onclick = () =>
        selectLeague(league.id);

      container.appendChild(button);

    }
  );

}


function selectLeague(leagueId) {

  const league =
    getLeagueById(leagueId);

  if (!league) return;

  game.league =
    league.id;

  renderTeams();

  showScreen("teamScreen");

}


/* =========================================================
   TEAM
   ========================================================= */

function renderTeams() {

  const container =
    el("teamList");

  if (!container) return;

  container.innerHTML = "";

  const league =
    getCurrentLeague();

  if (!league) return;

  league.teams.forEach(team => {

    const button =
      document.createElement("button");

    button.className =
      "team-btn";

    button.innerHTML = `
      <div class="team-info">
        <strong>
          ${team.name}
        </strong>

        <span>
          Team Rating:
          ${teamRating(team.id)}
        </span>
      </div>
    `;

    button.onclick = () =>
      selectTeam(team.id);

    container.appendChild(button);

  });

}


function selectTeam(teamId) {

  const source =
    getTeamSource(teamId);

  if (!source) return;

  game.team =
    teamId;

  game.currentTeamData =
    deepClone(source.team);

  game.currentTeamData.players =
    game.currentTeamData.players || [];

  game.currentTeamData.players.forEach(
    player => {

      player.contractYears =
        Number(player.contractYears || 2);

      player.morale =
        Number(player.morale || 70);

    }
  );

  const manager =
    el("managerName");

  if (manager) {
    manager.value = "";
  }

  selectedTarget =
    "top3";

  updateTargetButtons();

  showScreen("managerSetupScreen");

}


/* =========================================================
   MANAGER SETUP
   ========================================================= */

function selectTarget(target) {

  selectedTarget =
    target;

  updateTargetButtons();

}


function updateTargetButtons() {

  document
    .querySelectorAll(".target-btn")
    .forEach(button => {

      button.classList.remove(
        "selected"
      );

    });

  const button =
    el(`target-${selectedTarget}`);

  if (button) {
    button.classList.add("selected");
  }

}


function startCareer() {

  const input =
    el("managerName");

  const name =
    input
      ? input.value.trim()
      : "";

  if (!name) {

    alert(
      "Masukkan nama manager dulu."
    );

    return;
  }

  game.managerName =
    name;

  game.target =
    selectedTarget;

  game.careerStarted =
    true;

  game.year =
    getCurrentLeague()?.season || 2026;

  game.budget =
    500000;

  game.reputation =
    50;

  game.organizationLevel =
    1;

  game.history =
    [];

  game.requests =
    [];

  game.seasonComplete =
    false;

  game.phase =
    "regular";

  game.world =
    createWorldState();

  createSeason();

  saveGame(false);

  renderDashboard();

  showScreen(
    "dashboardScreen"
  );

}


/* =========================================================
   SEASON
   ========================================================= */

function createSeason() {

  const league =
    getCurrentLeague();

  if (!league) return;

  game.standings =
    createStandings(league);

  game.schedule =
    createRoundRobinSchedule(
      league
    );

  game.currentMatch =
    null;

  game.lastResult =
    null;

  game.marketPlayers =
    [];

  game.scoutingResult =
    null;

  game.seasonComplete =
    false;

  game.phase =
    "regular";

}


function createStandings(league) {

  return league.teams.map(team => ({

    teamId:
      team.id,

    played: 0,

    wins: 0,

    losses: 0,

    mapWin: 0,

    mapLoss: 0,

    diff: 0,

    points: 0

  }));

}


function createRoundRobinSchedule(
  league
) {

  const teams =
    league.teams.map(
      team => team.id
    );

  let list =
    [...teams];

  if (
    list.length % 2 !== 0
  ) {
    list.push(null);
  }

  const rounds =
    list.length - 1;

  const half =
    list.length / 2;

  const matches = [];

  for (
    let round = 0;
    round < rounds;
    round++
  ) {

    const matchday =
      round + 1;

    for (
      let i = 0;
      i < half;
      i++
    ) {

      const a =
        list[i];

      const b =
        list[
          list.length - 1 - i
        ];

      if (!a || !b) continue;

      const homeFirst =
        round % 2 === 0;

      matches.push({

        id:
          `regular-${matchday}-${i}`,

        matchday,

        stage:
          "regular",

        home:
          homeFirst ? a : b,

        away:
          homeFirst ? b : a,

        played:
          false,

        winner:
          null,

        homeScore:
          null,

        awayScore:
          null

      });

    }

    const fixed =
      list[0];

    const rest =
      list.slice(1);

    const moved =
      rest.pop();

    rest.unshift(moved);

    list =
      [fixed, ...rest];

  }

  return matches;

}


/* =========================================================
   RATING
   ========================================================= */

function teamRating(teamId) {

  const players =
    getTeamPlayers(teamId);

  if (!players.length) {
    return 50;
  }

  const sorted =
    [...players]
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );

  const starting =
    sorted.slice(0, 5);

  const total =
    starting.reduce(
      (sum, player) =>
        sum +
        Number(player.rating || 0),
      0
    );

  return Math.round(
    total /
    starting.length
  );

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  const values = {

    dashManager:
      game.managerName,

    dashSeason:
      game.year,

    dashTeam:
      getCurrentTeamName(),

    dashLeague:
      getCurrentLeagueName(),

    dashBudget:
      money(game.budget),

    dashRep:
      game.reputation,

    dashOrg:
      `Level ${game.organizationLevel}`,

    dashTarget:
      getTargetName(game.target)

  };

  Object.entries(values)
    .forEach(([id, value]) => {

      const node =
        el(id);

      if (node) {
        node.textContent =
          value;
      }

    });

  renderNextMatch();

  ensureWorldButton();

}


function renderNextMatch() {

  const container =
    el("nextMatch");

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
        ${
          game.seasonComplete
            ? "Season selesai."
            : "Tidak ada pertandingan tersisa."
        }
      </div>
    `;

    return;
  }

  const opponentId =
    next.home === game.team
      ? next.away
      : next.home;

  container.innerHTML = `
    <div class="match-preview">

      <strong>
        ${getCurrentTeamName()}
      </strong>

      <span class="versus">
        VS
      </span>

      <strong>
        ${getTeamDisplayName(opponentId)}
      </strong>

    </div>

    <div class="badge" style="margin-top:10px">
      Matchday ${next.matchday}
    </div>
  `;

}


function backDashboard() {

  renderDashboard();

  showScreen(
    "dashboardScreen"
  );

}


/* =========================================================
   MANAGER
   ========================================================= */

function openManager() {

  renderManager();

  showScreen(
    "managerScreen"
  );

}


function renderManager() {

  const container =
    el("managerContent");

  if (!container) return;

  const team =
    getCurrentTeam();

  const salary =
    team
      ? team.players.reduce(
          (sum, player) =>
            sum +
            Number(player.salary || 0),
          0
        )
      : 0;

  container.innerHTML = `

    <div class="card">

      <h3>👔 Manager</h3>

      <div class="stat-grid">

        <div>
          <span>Manager</span>
          <strong>
            ${game.managerName}
          </strong>
        </div>

        <div>
          <span>Reputation</span>
          <strong>
            ${game.reputation}
          </strong>
        </div>

        <div>
          <span>Organization</span>
          <strong>
            Level ${game.organizationLevel}
          </strong>
        </div>

        <div>
          <span>Target</span>
          <strong>
            ${getTargetName(game.target)}
          </strong>
        </div>

      </div>

    </div>

    <div class="card">

      <h3>💰 Financial</h3>

      <p>
        Budget:
        <strong>${money(game.budget)}</strong>
      </p>

      <p style="margin-top:8px">
        Annual Player Salary:
        <strong>${money(salary)}</strong>
      </p>

    </div>

    <div class="card">

      <h3>⬆️ Organization Upgrade</h3>

      <p>
        Upgrade cost:
        ${money(game.organizationLevel * 200000)}
      </p>

      <button
        class="primary"
        onclick="upgradeOrganization()"
      >
        Upgrade Organization
      </button>

    </div>

    ${
      game.requests.length
        ? `
          <div class="card">

            <h3>📩 Contract Requests</h3>

            ${game.requests.map(
              request => `

                <div class="player-card">

                  <strong>
                    ${request.playerName}
                  </strong>

                  <p style="margin-top:8px">
                    Salary request:
                    ${money(request.demand)}
                  </p>

                  <button
                    class="small-btn"
                    onclick="acceptRequest('${request.playerId}')"
                  >
                    Accept
                  </button>

                  <button
                    class="small-btn"
                    onclick="rejectRequest('${request.playerId}')"
                  >
                    Reject
                  </button>

                </div>

              `
            ).join("")}

          </div>
        `
        : ""
    }

  `;

}


function upgradeOrganization() {

  const cost =
    game.organizationLevel *
    200000;

  if (
    game.budget < cost
  ) {

    alert(
      "Budget tidak cukup."
    );

    return;
  }

  game.budget -=
    cost;

  game.organizationLevel++;

  game.reputation =
    clamp(
      game.reputation + 3,
      0,
      100
    );

  saveGame(false);

  renderManager();

}


/* =========================================================
   ROSTER
   ========================================================= */

function getCurrentPlayers() {

  return getCurrentTeam()?.players || [];

}


function sortPlayers(players) {

  return [...players].sort(
    (a, b) =>
      Number(b.rating || 0) -
      Number(a.rating || 0)
  );

}


function openRoster() {

  renderRoster();

  showScreen(
    "rosterScreen"
  );

}


function renderRoster() {

  const container =
    el("rosterList");

  if (!container) return;

  const players =
    sortPlayers(
      getCurrentPlayers()
    );

  if (!players.length) {

    container.innerHTML =
      `<div class="empty">Roster kosong.</div>`;

    return;
  }

  container.innerHTML =
    players.map(
      (player, index) => {

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
                Contract
                ${player.contractYears || 1} yr
              </span>

              <span class="badge">
                Salary
                ${money(player.salary)}
              </span>

              <span class="badge">
                Morale
                ${player.morale || 70}
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

      }
    ).join("");

}


/* =========================================================
   CONTRACT
   ========================================================= */

function extendContract(playerId) {

  const team =
    getCurrentTeam();

  if (!team) return;

  const player =
    team.players.find(
      p => p.id === playerId
    );

  if (!player) return;

  const cost =
    Math.round(
      Number(player.salary || 10000) *
      2
    );

  if (
    game.budget < cost
  ) {

    alert(
      "Budget tidak cukup."
    );

    return;
  }

  game.budget -=
    cost;

  player.contractYears =
    Math.max(
      Number(
        player.contractYears || 1
      ),
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
   TRANSFER
   ========================================================= */

function calculatePlayerValue(player) {

  const rating =
    Number(player.rating || 50);

  const potential =
    Number(
      player.potential || rating
    );

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

  const players = [];

  getAllLeagues()
    .forEach(league => {

      league.teams.forEach(team => {

        if (
          team.id === game.team
        ) return;

        team.players.forEach(
          player => {

            players.push({

              ...deepClone(player),

              sourceTeamId:
                team.id,

              sourceLeagueId:
                league.id,

              value:
                calculatePlayerValue(player),

              marketId:
                `${league.id}-${team.id}-${player.id}`

            });

          }
        );

      });

    });

  return players
    .sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    )
    .slice(0, 50);

}


function openTransfer() {

  if (
    !game.marketPlayers.length
  ) {

    game.marketPlayers =
      buildTransferMarket();

  }

  renderTransfer();

  showScreen(
    "transferScreen"
  );

}


function renderTransfer() {

  const info =
    el("transferInfo");

  const container =
    el("transferList");

  if (!info || !container) return;

  const foreignCount =
    getImportCount();

  info.innerHTML = `

    <strong>
      Budget:
      ${money(game.budget)}
    </strong>

    <p style="color:#8992a5;margin-top:7px">
      Foreign Players:
      ${foreignCount}/2
    </p>

    <p style="color:#8992a5;margin-top:7px">
      Reputation:
      ${game.reputation}
    </p>

  `;

  if (
    !game.marketPlayers.length
  ) {

    container.innerHTML =
      `<div class="empty">Market kosong.</div>`;

    return;
  }

  container.innerHTML =
    game.marketPlayers.map(
      player => {

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

      }
    ).join("");

}


function isForeignPlayer(player) {

  const league =
    getCurrentLeague();

  if (!league) return false;

  const source =
    getTeamSource(
      player.sourceTeamId
    );

  if (!source) return false;

  return (
    source.league.region !==
    league.region
  );

}


function getImportCount() {

  const team =
    getCurrentTeam();

  const league =
    getCurrentLeague();

  if (!team || !league) {
    return 0;
  }

  const region =
    league.region;

  return team.players.filter(
    player => {

      const nationality =
        String(
          player.nationality || ""
        ).toLowerCase();

      let home = false;

      if (region === "ID") {

        home =
          nationality === "id" ||
          nationality.includes("indonesia");

      }

      if (region === "PH") {

        home =
          nationality === "ph" ||
          nationality.includes("philippines");

      }

      if (region === "KH") {

        home =
          nationality === "kh" ||
          nationality.includes("cambodia");

      }

      return !home;

    }
  ).length;

}


function canRegisterForeignPlayer() {

  return (
    getImportCount() < 2
  );

}


function buyPlayer(marketId) {

  const marketPlayer =
    game.marketPlayers.find(
      p =>
        p.marketId === marketId
    );

  if (!marketPlayer) return;

  if (
    game.budget <
    marketPlayer.value
  ) {

    alert(
      "Budget tidak cukup."
    );

    return;
  }

  if (
    isForeignPlayer(marketPlayer) &&
    !canRegisterForeignPlayer()
  ) {

    alert(
      "Maksimal 2 foreign player."
    );

    return;
  }

  const source =
    getTeamSource(
      marketPlayer.sourceTeamId
    );

  const team =
    getCurrentTeam();

  if (!source || !team) return;

  const index =
    source.team.players.findIndex(
      p =>
        p.id ===
        marketPlayer.id
    );

  if (index === -1) {

    alert(
      "Player sudah tidak tersedia."
    );

    game.marketPlayers =
      buildTransferMarket();

    renderTransfer();

    return;
  }

  /*
    Kita COPY player.
    Database asli tidak disentuh.
  */

  const bought =
    deepClone(
      source.team.players[index]
    );

  team.players.push({

    ...bought,

    contractYears: 2,

    morale: 80

  });

  game.budget -=
    marketPlayer.value;

  game.reputation =
    clamp(
      game.reputation + 1,
      0,
      100
    );

  /*
    Player hanya dihapus dari market.
    Database asli tetap aman.
  */

  game.marketPlayers =
    game.marketPlayers.filter(
      p =>
        p.marketId !== marketId
    );

  saveGame(false);

  renderTransfer();

  alert(
    `${bought.name} bergabung dengan ${team.name}!`
  );

}


/* =========================================================
   SCOUTING
   ========================================================= */

function openScouting() {

  const result =
    el("scoutingResult");

  if (result) {
    result.innerHTML = "";
  }

  showScreen(
    "scoutingScreen"
  );

}


function getScoutingPlayers() {

  const players = [];

  getAllLeagues()
    .forEach(league => {

      league.teams.forEach(team => {

        team.players.forEach(player => {

          if (
            Number(player.age || 30) <= 23
          ) {

            players.push({

              ...deepClone(player),

              sourceTeamId:
                team.id,

              sourceLeagueId:
                league.id

            });

          }

        });

      });

    });

  return players;

}


function runScouting() {

  const cost =
    10000;

  if (
    game.budget < cost
  ) {

    alert(
      "Budget scouting tidak cukup."
    );

    return;
  }

  const pool =
    getScoutingPlayers();

  if (!pool.length) return;

  game.budget -=
    cost;

  const player =
    pool[
      random(0, pool.length - 1)
    ];

  game.scoutingResult =
    player;

  const container =
    el("scoutingResult");

  if (!container) return;

  container.innerHTML = `

    <div class="player-card"
         style="margin-top:15px">

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
        ${getTeamDisplayName(
          player.sourceTeamId
        )}
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

  showScreen(
    "scheduleScreen"
  );

}


function renderSchedule() {

  const container =
    el("scheduleList");

  if (!container) return;

  if (!game.schedule.length) {

    container.innerHTML =
      `<div class="empty">Jadwal belum tersedia.</div>`;

    return;
  }

  container.innerHTML =
    game.schedule.map(
      match => {

        const userMatch =
          match.home === game.team ||
          match.away === game.team;

        let result = "";

        if (match.played) {

          if (userMatch) {

            const won =
              match.winner === game.team;

            result = `

              <div
                class="${won ? "win" : "loss"}"
                style="margin-top:8px"
              >
                ${match.homeScore}
                -
                ${match.awayScore}

                •
                ${won ? "WIN" : "LOSS"}

              </div>

            `;

          } else {

            result = `

              <div
                style="margin-top:8px;color:#8992a5"
              >
                ${match.homeScore}
                -
                ${match.awayScore}
              </div>

            `;

          }

        }

        return `

          <div class="
            schedule-item
            ${match.played ? "played" : ""}
          ">

            <div class="schedule-head">

              <span>
                ${
                  match.matchday
                    ? `Matchday ${match.matchday}`
                    : "Playoff"
                }
              </span>

              <span>
                ${match.stage}
              </span>

            </div>

            <div class="schedule-teams">

              <strong>
                ${getTeamDisplayName(
                  match.home
                )}
              </strong>

              <span>VS</span>

              <strong>
                ${getTeamDisplayName(
                  match.away
                )}
              </strong>

            </div>

            ${result}

          </div>

        `;

      }
    ).join("");

}


/* =========================================================
   MATCH
   ========================================================= */

function playNextMatch() {

  if (
    game.seasonComplete
  ) {

    alert(
      "Season sudah selesai."
    );

    return;
  }

  const next =
    game.schedule.find(
      match =>
        !match.played &&
        match.stage === "regular" &&
        (
          match.home === game.team ||
          match.away === game.team
        )
    );

  if (!next) {

    checkRegularSeason();

    return;
  }

  game.currentMatch =
    next.id;

  renderMatch(next);

  showScreen(
    "matchScreen"
  );

}


function renderMatch(match) {

  const homeName =
    getTeamDisplayName(
      match.home
    );

  const awayName =
    getTeamDisplayName(
      match.away
    );

  const homeRating =
    teamRating(
      match.home
    );

  const awayRating =
    teamRating(
      match.away
    );

  const total =
    homeRating +
    awayRating;

  const homeChance =
    total > 0
      ? Math.round(
          homeRating /
          total *
          100
        )
      : 50;

  const awayChance =
    100 - homeChance;

  const stage =
    el("matchStage");

  const home =
    el("matchHome");

  const away =
    el("matchAway");

  const homeR =
    el("matchHomeRating");

  const awayR =
    el("matchAwayRating");

  const homeC =
    el("homeChance");

  const awayC =
    el("awayChance");

  if (stage) {
    stage.textContent =
      `${match.stage === "regular"
        ? "Regular Season"
        : match.stage}
       •
       ${match.matchday
         ? `Matchday ${match.matchday}`
         : ""}`;
  }

  if (home) {
    home.textContent =
      homeName;
  }

  if (away) {
    away.textContent =
      awayName;
  }

  if (homeR) {
    homeR.textContent =
      `Rating ${homeRating}`;
  }

  if (awayR) {
    awayR.textContent =
      `Rating ${awayRating}`;
  }

  if (homeC) {
    homeC.textContent =
      `${homeChance}% ${homeName}`;
  }

  if (awayC) {
    awayC.textContent =
      `${awayChance}% ${awayName}`;
  }

  renderMatchRoster();

}


function renderMatchRoster() {

  const container =
    el("matchRoster");

  if (!container) return;

  const players =
    sortPlayers(
      getCurrentPlayers()
    ).slice(0, 5);

  container.innerHTML =
    players.map(
      player => `

        <div class="match-player">

          <span>
            ${player.name}
          </span>

          <strong>
            ${player.rating}
          </strong>

        </div>

      `
    ).join("");

}


function simulateCurrentMatch() {

  const match =
    game.schedule.find(
      m =>
        m.id ===
        game.currentMatch
    );

  if (!match || match.played) {
    return;
  }

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

  finishMatchObject(
    match,
    winner,
    score
  );

  game.lastResult = {

    type: "regular",

    matchId:
      match.id,

    winner,

    home:
      match.home,

    away:
      match.away,

    homeScore:
      score.home,

    awayScore:
      score.away

  };

  autoSimulateMatchday(
    match.matchday
  );

  saveGame(false);

  renderResult(match);

  showScreen(
    "resultScreen"
  );

}


function finishMatchObject(
  match,
  winner,
  score
) {

  match.played =
    true;

  match.winner =
    winner;

  match.homeScore =
    score.home;

  match.awayScore =
    score.away;

  if (
    match.stage === "regular"
  ) {

    updateStandingsFromMatch(
      match
    );

  }

}


function simulateGenericWinner(
  homeId,
  awayId
) {

  const homeRating =
    teamRating(homeId);

  const awayRating =
    teamRating(awayId);

  const total =
    homeRating +
    awayRating;

  if (total <= 0) {
    return homeId;
  }

  const chance =
    homeRating /
    total;

  return Math.random() <
    chance
      ? homeId
      : awayId;

}


function generateBO3(
  winner,
  match
) {

  if (
    winner ===
    match.home
  ) {

    return {

      home: 2,

      away:
        Math.random() < 0.55
          ? 0
          : 1

    };

  }

  return {

    home:
      Math.random() < 0.55
        ? 0
        : 1,

    away: 2

  };

}


function updateStandingsFromMatch(
  match
) {

  const home =
    game.standings.find(
      s =>
        s.teamId ===
        match.home
    );

  const away =
    game.standings.find(
      s =>
        s.teamId ===
        match.away
    );

  if (!home || !away) return;

  home.played++;
  away.played++;

  home.mapWin +=
    match.homeScore;

  home.mapLoss +=
    match.awayScore;

  away.mapWin +=
    match.awayScore;

  away.mapLoss +=
    match.homeScore;

  home.diff =
    home.mapWin -
    home.mapLoss;

  away.diff =
    away.mapWin -
    away.mapLoss;

  if (
    match.winner ===
    match.home
  ) {

    home.wins++;

    away.losses++;

    home.points += 3;

  } else {

    away.wins++;

    home.losses++;

    away.points += 3;

  }

}


function autoSimulateMatchday(
  matchday
) {

  const matches =
    game.schedule.filter(
      match =>
        match.matchday ===
        matchday &&
        !match.played
    );

  matches.forEach(
    match => {

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

      finishMatchObject(
        match,
        winner,
        score
      );

    }
  );

}


/* =========================================================
   RESULT
   ========================================================= */

function renderResult(match) {

  const teams =
    el("resultTeams");

  const score =
    el("resultScore");

  const winner =
    el("resultWinner");

  const message =
    el("resultMessage");

  if (teams) {

    teams.innerHTML = `

      <strong>
        ${getTeamDisplayName(
          match.home
        )}
      </strong>

      <span style="color:#8992a5">
        vs
      </span>

      <strong>
        ${getTeamDisplayName(
          match.away
        )}
      </strong>

    `;

  }

  if (score) {

    score.textContent =
      `${match.homeScore}
       -
       ${match.awayScore}`;

  }

  if (winner) {

    winner.textContent =
      `🏆 ${getTeamDisplayName(
        match.winner
      )}`;

  }

  if (message) {

    message.textContent =
      match.winner === game.team
        ? "Mantap! Tim lu menang."
        : "Kali ini belum berhasil. Gas lagi.";

  }

}


function finishMatch() {

  checkRegularSeason();

  if (
    !game.seasonComplete
  ) {

    renderDashboard();

    showScreen(
      "dashboardScreen"
    );

  }

}


/* =========================================================
   STANDINGS
   ========================================================= */

function getSortedStandings() {

  return [...game.standings]
    .sort((a, b) => {

      if (
        b.points !==
        a.points
      ) {

        return (
          b.points -
          a.points
        );

      }

      if (
        b.diff !==
        a.diff
      ) {

        return (
          b.diff -
          a.diff
        );

      }

      return (
        b.mapWin -
        a.mapWin
      );

    });

}


function openStandings() {

  renderStandings();

  showScreen(
    "standingsScreen"
  );

}


function renderStandings() {

  const container =
    el("standingsList");

  if (!container) return;

  const ranking =
    getSortedStandings();

  container.innerHTML =
    ranking.map(
      (row, index) => `

        <div class="standing-row">

          <div>
            <strong>
              #${index + 1}
            </strong>
          </div>

          <div>
            <strong>
              ${getTeamDisplayName(
                row.teamId
              )}
            </strong>

            <span>
              ${row.wins}W
              -
              ${row.losses}L
            </span>
          </div>

          <div>
            ${row.points} pts
          </div>

        </div>

      `
    ).join("");

}


/* =========================================================
   REGULAR SEASON
   ========================================================= */

function checkRegularSeason() {

  const remaining =
    game.schedule.some(
      match =>
        match.stage === "regular" &&
        !match.played
    );

  if (remaining) return;

  if (
    game.phase !==
    "regular"
  ) return;

  finishRegularSeason();

}


function finishRegularSeason() {

  game.phase =
    "playoffs";

  const ranking =
    getSortedStandings();

  const position =
    ranking.findIndex(
      row =>
        row.teamId ===
        game.team
    ) + 1;

  if (
    position <= 4
  ) {

    startPlayoffs();

  } else {

    /*
      User tidak lolos playoff.
      Playoff tetap disimulasikan.
    */

    simulatePlayoffsAutomatically();

  }

}


/* =========================================================
   PLAYOFF
   ========================================================= */

function startPlayoffs() {

  const existing =
    game.schedule.filter(
      m =>
        m.stage === "semifinal" ||
        m.stage === "grand-final"
    );

  if (existing.length) {
    return;
  }

  const ranking =
    getSortedStandings()
      .slice(0, 4);

  if (
    ranking.length < 4
  ) {

    finishSeason(
      ranking[0]?.teamId || null
    );

    return;
  }

  const semi1 = {

    id:
      "playoff-sf-1",

    stage:
      "semifinal",

    home:
      ranking[0].teamId,

    away:
      ranking[3].teamId,

    played:
      false,

    winner:
      null,

    homeScore:
      null,

    awayScore:
      null

  };

  const semi2 = {

    id:
      "playoff-sf-2",

    stage:
      "semifinal",

    home:
      ranking[1].teamId,

    away:
      ranking[2].teamId,

    played:
      false,

    winner:
      null,

    homeScore:
      null,

    awayScore:
      null

  };

  game.schedule.push(
    semi1,
    semi2
  );

  /*
    Jika user ada di semifinal,
    biarkan user memainkan match.
  */

  const userSemi =
    [semi1, semi2].find(
      match =>
        match.home === game.team ||
        match.away === game.team
    );

  if (userSemi) {

    game.currentMatch =
      userSemi.id;

    renderMatch(
      userSemi
    );

    showScreen(
      "matchScreen"
    );

  } else {

    simulateRemainingPlayoffs();

  }

}


function simulateRemainingPlayoffs() {

  const semifinals =
    game.schedule.filter(
      m =>
        m.stage === "semifinal"
    );

  semifinals.forEach(
    match => {

      if (match.played) return;

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

      finishMatchObject(
        match,
        winner,
        score
      );

    }
  );

  startGrandFinal();

}


function startGrandFinal() {

  const finalExists =
    game.schedule.find(
      m =>
        m.stage ===
        "grand-final"
    );

  if (finalExists) {

    if (
      !finalExists.played &&
      (
        finalExists.home === game.team ||
        finalExists.away === game.team
      )
    ) {

      game.currentMatch =
        finalExists.id;

      renderMatch(
        finalExists
      );

      showScreen(
        "matchScreen"
      );

    }

    return;
  }

  const semifinal =
    game.schedule.filter(
      m =>
        m.stage ===
        "semifinal" &&
        m.played
    );

  if (
    semifinal.length < 2
  ) return;

  const final = {

    id:
      "playoff-final",

    stage:
      "grand-final",

    home:
      semifinal[0].winner,

    away:
      semifinal[1].winner,

    played:
      false,

    winner:
      null,

    homeScore:
      null,

    awayScore:
      null

  };

  game.schedule.push(
    final
  );

  const userInFinal =
    final.home === game.team ||
    final.away === game.team;

  if (userInFinal) {

    game.currentMatch =
      final.id;

    renderMatch(
      final
    );

    showScreen(
      "matchScreen"
    );

  } else {

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

    finishMatchObject(
      final,
      winner,
      score
    );

    finishSeason(
      winner
    );

  }

}


function simulatePlayoffsAutomatically() {

  const ranking =
    getSortedStandings()
      .slice(0, 4);

  if (
    ranking.length < 4
  ) {

    finishSeason(
      ranking[0]?.teamId ||
      null
    );

    return;
  }

  const semiWinners = [];

  const pairs = [

    [
      ranking[0].teamId,
      ranking[3].teamId
    ],

    [
      ranking[1].teamId,
      ranking[2].teamId
    ]

  ];

  pairs.forEach(
    pair => {

      const winner =
        simulateGenericWinner(
          pair[0],
          pair[1]
        );

      semiWinners.push(
        winner
      );

    }
  );

  const champion =
    simulateGenericWinner(
      semiWinners[0],
      semiWinners[1]
    );

  finishSeason(
    champion
  );

}


/* =========================================================
   SEASON END
   ========================================================= */

function finishSeason(
  championId
) {

  if (
    game.seasonComplete
  ) return;

  const ranking =
    getSortedStandings();

  const position =
    ranking.findIndex(
      row =>
        row.teamId ===
        game.team
    ) + 1;

  const champion =
    championId ||
    ranking[0]?.teamId ||
    null;

  const championName =
    champion
      ? getTeamDisplayName(
          champion
        )
      : "-";

  const reward =
    calculateSeasonReward(
      position,
      champion
    );

  game.budget +=
    reward;

  updateReputation(
    position,
    champion
  );

  processSeasonDevelopment();

  processContracts();

  deductAnnualSalary();

  addSeasonHistory(
    position,
    champion,
    championName
  );

  /*
    PENTING:
    Jangan langsung membuat season baru.
    Season tetap selesai supaya user bisa
    masuk MSC/M-Series.
  */

  game.seasonComplete =
    true;

  game.phase =
    "offseason";

  updateWorldRankingAfterSeason(
    position,
    champion
  );

  updateMSCQualification();

  saveGame(false);

  renderDashboard();

  alert(
    `🏁 SEASON ${game.year} SELESAI!\n\n` +
    `Posisi: #${position}\n` +
    `Champion: ${championName}\n` +
    `Reward: ${money(reward)}\n\n` +
    `${
      game.world.msc.qualified
        ? "🌎 Lu qualified untuk MSC!"
        : "Lu belum qualified MSC."
    }\n\n` +
    `Buka menu 🌎 World untuk lanjut.`
  );

}


function calculateSeasonReward(
  position,
  championId
) {

  if (
    championId ===
    game.team
  ) {

    return 300000;
  }

  if (
    position <= 3
  ) {

    return 180000;
  }

  if (
    position <= 4
  ) {

    return 120000;
  }

  return 50000;

}


function updateReputation(
  position,
  championId
) {

  let change = 0;

  if (
    championId ===
    game.team
  ) {

    change = 15;

  } else if (
    position === 2
  ) {

    change = 10;

  } else if (
    position === 3
  ) {

    change = 6;

  } else if (
    position <= 4
  ) {

    change = 2;

  } else {

    change = -5;

  }

  game.reputation =
    clamp(
      game.reputation + change,
      0,
      100
    );

}


/* =========================================================
   SALARY
   ========================================================= */

function deductAnnualSalary() {

  const team =
    getCurrentTeam();

  if (!team) return;

  const salary =
    team.players.reduce(
      (sum, player) =>
        sum +
        Number(
          player.salary || 0
        ),
      0
    );

  /*
    Salary dianggap biaya satu season.
  */

  game.budget -=
    salary;

  if (
    game.budget < 0
  ) {

    game.budget = 0;

    game.reputation =
      clamp(
        game.reputation - 5,
        0,
        100
      );

  }

}


/* =========================================================
   PLAYER DEVELOPMENT
   ========================================================= */

function processSeasonDevelopment() {

  const team =
    getCurrentTeam();

  if (!team) return;

  /*
    Hanya roster career user
    yang berkembang.
    Database global tidak dirusak.
  */

  team.players.forEach(
    player => {

      player.age =
        Number(
          player.age || 20
        ) + 1;

      const rating =
        Number(
          player.rating || 50
        );

      const potential =
        Number(
          player.potential ||
          rating
        );

      let change = 0;

      if (
        rating < potential
      ) {

        if (
          player.age <= 23
        ) {

          change =
            random(1, 4);

        } else if (
          player.age <= 26
        ) {

          change =
            random(0, 2);

        }

      }

      if (
        player.age >= 28
      ) {

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
          Number(
            player.morale || 70
          ) +
          random(-8, 8),
          0,
          100
        );

    }
  );

}


/* =========================================================
   CONTRACTS
   ========================================================= */

function processContracts() {

  const team =
    getCurrentTeam();

  if (!team) return;

  team.players =
    team.players.filter(
      player => {

        player.contractYears =
          Math.max(
            0,
            Number(
              player.contractYears || 1
            ) - 1
          );

        if (
          player.contractYears > 0
        ) {

          return true;
        }

        /*
          Player kontrak habis.
          65% kemungkinan minta
          kontrak baru.
        */

        if (
          Math.random() < 0.65
        ) {

          const exists =
            game.requests.some(
              request =>
                request.playerId ===
                player.id
            );

          if (!exists) {

            game.requests.push({

              playerId:
                player.id,

              playerName:
                player.name,

              type:
                "contract",

              demand:
                Math.round(
                  Number(
                    player.salary || 10000
                  ) * 1.25
                )

            });

          }

          player.contractYears =
            1;

          return true;

        }

        /*
          Player meninggalkan team.
        */

        return false;

      }
    );

}


function acceptRequest(
  playerId
) {

  const request =
    game.requests.find(
      r =>
        r.playerId ===
        playerId
    );

  if (!request) return;

  const team =
    getCurrentTeam();

  const player =
    team?.players.find(
      p =>
        p.id === playerId
    );

  if (!player) {

    game.requests =
      game.requests.filter(
        r =>
          r.playerId !==
          playerId
      );

    saveGame(false);

    return;
  }

  player.salary =
    request.demand;

  player.contractYears =
    2;

  player.morale =
    clamp(
      Number(
        player.morale || 70
      ) + 5,
      0,
      100
    );

  game.requests =
    game.requests.filter(
      r =>
        r.playerId !==
        playerId
    );

  saveGame(false);

  renderManager();

}


function rejectRequest(
  playerId
) {

  game.requests =
    game.requests.filter(
      r =>
        r.playerId !==
        playerId
    );

  const team =
    getCurrentTeam();

  if (team) {

    team.players =
      team.players.filter(
        player =>
          player.id !==
          playerId
      );

  }

  saveGame(false);

  renderManager();

}


/* =========================================================
   NEXT SEASON
   ========================================================= */

function advanceSeason() {

  /*
    Kalau season masih berjalan,
    selesaikan semua pertandingan.
  */

  if (
    !game.seasonComplete
  ) {

    game.schedule
      .filter(
        match =>
          match.stage === "regular" &&
          !match.played
      )
      .forEach(
        match => {

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

          finishMatchObject(
            match,
            winner,
            score
          );

        }
      );

    checkRegularSeason();

    /*
      Jika user lolos playoff,
      otomatis selesaikan playoff.
    */

    if (
      !game.seasonComplete
    ) {

      simulatePlayoffsAutomatically();

    }

    return;
  }

  /*
    Jangan bisa mulai season baru
    kalau MSC masih belum selesai.
  */

  if (
    game.world.msc.qualified &&
    !game.world.msc.completed
  ) {

    alert(
      "Selesaikan MSC dulu sebelum masuk season berikutnya."
    );

    return;
  }

  if (
    game.world.mSeries.qualified &&
    !game.world.mSeries.completed
  ) {

    alert(
      "Selesaikan M-Series dulu sebelum masuk season berikutnya."
    );

    return;
  }

  game.year++;

  game.phase =
    "regular";

  game.seasonComplete =
    false;

  game.currentMatch =
    null;

  game.lastResult =
    null;

  game.marketPlayers =
    [];

  game.scoutingResult =
    null;

  createSeason();

  saveGame(false);

  renderDashboard();

  alert(
    `🚀 Season ${game.year} dimulai!`
  );

}


/* =========================================================
   WORLD RANKING
   ========================================================= */

function calculateInitialWorldRanking() {

  const teams = [];

  getAllLeagues()
    .forEach(league => {

      league.teams.forEach(
        team => {

          teams.push({

            teamId:
              team.id,

            name:
              team.name,

            region:
              league.region,

            rating:
              teamRatingFromSource(
                team
              ),

            points:
              teamRatingFromSource(
                team
              ) * 10

          });

        }
      );

    });

  return teams.sort(
    (a, b) =>
      b.points -
      a.points
  );

}


function teamRatingFromSource(
  team
) {

  if (
    !team ||
    !team.players ||
    !team.players.length
  ) {

    return 50;
  }

  const players =
    [...team.players]
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
      .slice(0, 5);

  const total =
    players.reduce(
      (sum, p) =>
        sum +
        Number(p.rating || 0),
      0
    );

  return Math.round(
    total /
    players.length
  );

}


function createWorldState() {

  return {

    ranking:
      calculateInitialWorldRanking(),

    msc: {

      qualified:
        false,

      completed:
        false,

      champion:
        null,

      championId:
        null,

      teams:
        [],

      matches:
        [],

      round:
        1

    },

    mSeries: {

      qualified:
        false,

      completed:
        false,

      champion:
        null,

      championId:
        null,

      teams:
        [],

      matches:
        [],

      round:
        1

    }

  };

}


function ensureWorldState() {

  if (!game.world) {

    game.world =
      createWorldState();

  }

  if (
    !Array.isArray(
      game.world.ranking
    )
  ) {

    game.world.ranking =
      calculateInitialWorldRanking();

  }

  if (!game.world.msc) {

    game.world.msc = {
      qualified: false,
      completed: false,
      champion: null,
      championId: null,
      teams: [],
      matches: [],
      round: 1
    };

  }

  if (!game.world.mSeries) {

    game.world.mSeries = {
      qualified: false,
      completed: false,
      champion: null,
      championId: null,
      teams: [],
      matches: [],
      round: 1
    };

  }

}


function updateWorldRankingAfterSeason(
  position,
  championId
) {

  ensureWorldState();

  const ranking =
    game.world.ranking;

  const user =
    ranking.find(
      team =>
        team.teamId ===
        game.team
    );

  if (user) {

    user.rating =
      teamRating(
        game.team
      );

    let bonus =
      Math.max(
        0,
        50 -
        position * 5
      );

    if (
      championId ===
      game.team
    ) {

      bonus += 100;

    }

    user.points +=
      bonus;

  }

  ranking.forEach(
    team => {

      if (
        team.teamId ===
        game.team
      ) return;

      const source =
        getTeamSource(
          team.teamId
        );

      if (!source) return;

      team.rating =
        teamRatingFromSource(
          source.team
        );

      /*
        Small yearly world movement.
      */

      team.points +=
        Math.max(
          0,
          Math.round(
            team.rating / 10
          )
        );

    }
  );

  ranking.sort(
    (a, b) =>
      b.points -
      a.points
  );

}


/* =========================================================
   WORLD SCREEN
   ========================================================= */

function ensureWorldButton() {

  const grid =
    document.querySelector(
      ".menu-grid"
    );

  if (!grid) return;

  if (
    document.getElementById(
      "worldMenuButton"
    )
  ) return;

  const button =
    document.createElement("button");

  button.id =
    "worldMenuButton";

  button.onclick =
    openWorld;

  button.innerHTML =
    `
      <span>🌎</span>
      <strong>World</strong>
    `;

  grid.appendChild(
    button
  );

}


function ensureWorldScreens() {

  if (
    !el("worldScreen")
  ) {

    const section =
      document.createElement(
        "section"
      );

    section.id =
      "worldScreen";

    section.className =
      "screen";

    section.innerHTML = `

      <button
        class="back"
        onclick="backDashboard()"
      >
        ← Dashboard
      </button>

      <div class="page-title">

        <h1>
          🌎 World Stage
        </h1>

        <p>
          Dunia kompetitif MLBB.
        </p>

      </div>

      <div class="card">

        <h3>
          🌍 World Ranking
        </h3>

        <div id="worldRanking"></div>

      </div>

      <div class="card">

        <h3>
          🏆 MSC
        </h3>

        <div id="mscStatus"></div>

        <button
          class="primary"
          onclick="openMSC()"
        >
          OPEN MSC
        </button>

      </div>

      <div class="card">

        <h3>
          👑 M-Series
        </h3>

        <div id="mSeriesStatus"></div>

        <button
          class="primary"
          onclick="openMSeries()"
        >
          OPEN M-SERIES
        </button>

      </div>

      <div class="card">

        <h3>
          ✈️ International Transfer
        </h3>

        <div id="internationalTransfer"></div>

      </div>

      <button
        class="primary"
        onclick="advanceSeason()"
      >
        🚀 Start / Advance Season
      </button>

    `;

    document.body.appendChild(
      section
    );

  }


  if (
    !el("tournamentScreen")
  ) {

    const section =
      document.createElement(
        "section"
      );

    section.id =
      "tournamentScreen";

    section.className =
      "screen";

    section.innerHTML = `

      <button
        class="back"
        onclick="openWorld()"
      >
        ← World
      </button>

      <div class="page-title">

        <h1 id="tournamentTitle">
          🏆 Tournament
        </h1>

        <p id="tournamentSubtitle"></p>

      </div>

      <div id="tournamentContent"></div>

    `;

    document.body.appendChild(
      section
    );

  }

}


function openWorld() {

  ensureWorldState();

  ensureWorldScreens();

  renderWorld();

  showScreen(
    "worldScreen"
  );

}


function renderWorld() {

  ensureWorldState();

  const ranking =
    game.world.ranking;

  const container =
    el("worldRanking");

  if (container) {

    container.innerHTML =
      ranking.map(
        (team, index) => `

          <div class="world-row">

            <div class="rank">
              #${index + 1}
            </div>

            <div class="world-team">

              <strong>
                ${team.name}
              </strong>

              <span>
                ${team.region}
                •
                ${team.points} pts
              </span>

            </div>

            <div class="world-rating">
              ${team.rating}
            </div>

          </div>

        `
      ).join("");

  }

  renderTournamentStatus();

  renderInternationalTransfer();

}


/* =========================================================
   MSC
   ========================================================= */

function updateMSCQualification() {

  ensureWorldState();

  const ranking =
    getSortedStandings();

  const position =
    ranking.findIndex(
      row =>
        row.teamId ===
        game.team
    ) + 1;

  game.world.msc.qualified =
    position > 0 &&
    position <= 3;

}


function getMSCTeams() {

  const ranking =
    getSortedStandings();

  const local =
    ranking
      .slice(0, 3)
      .map(
        row =>
          row.teamId
      );

  const result =
    [...local];

  const world =
    [...game.world.ranking]
      .sort(
        (a, b) =>
          b.points -
          a.points
      );

  /*
    Ambil tim dari region lain.
  */

  world.forEach(
    team => {

      if (
        result.length >= 8
      ) return;

      if (
        result.includes(
          team.teamId
        )
      ) return;

      if (
        team.region ===
        getCurrentLeague()?.region
      ) return;

      result.push(
        team.teamId
      );

    }
  );

  /*
    Kalau foreign region kurang,
    isi dengan world ranking lain.
  */

  world.forEach(
    team => {

      if (
        result.length >= 8
      ) return;

      if (
        !result.includes(
          team.teamId
        )
      ) {

        result.push(
          team.teamId
        );

      }

    }
  );

  return result.slice(
    0,
    8
  );

}


function openMSC() {

  ensureWorldState();

  if (
    !game.seasonComplete
  ) {

    alert(
      "Selesaikan regular season dan playoff dulu."
    );

    return;
  }

  if (
    !game.world.msc.qualified
  ) {

    alert(
      "Lu belum qualified MSC. Minimal finish Top 3."
    );

    return;
  }

  if (
    !game.world.msc.teams.length
  ) {

    game.world.msc.teams =
      getMSCTeams();

    game.world.msc.matches =
      createKnockoutMatches(
        game.world.msc.teams,
        "msc"
      );

    game.world.msc.round =
      1;

    saveGame(false);

  }

  renderTournament(
    "msc"
  );

  showScreen(
    "tournamentScreen"
  );

}


/* =========================================================
   M-SERIES
   ========================================================= */

function getMSeriesTeams() {

  const result = [];

  if (
    game.world.msc.championId
  ) {

    result.push(
      game.world.msc.championId
    );

  }

  game.world.ranking
    .forEach(
      team => {

        if (
          result.length >= 8
        ) return;

        if (
          !result.includes(
            team.teamId
          )
        ) {

          result.push(
            team.teamId
          );

        }

      }
    );

  return result.slice(
    0,
    8
  );

}


function openMSeries() {

  ensureWorldState();

  if (
    !game.world.msc.completed
  ) {

    alert(
      "Selesaikan MSC dulu."
    );

    return;
  }

  if (
    !game.world.mSeries.teams.length
  ) {

    game.world.mSeries.teams =
      getMSeriesTeams();

    game.world.mSeries.matches =
      createKnockoutMatches(
        game.world.mSeries.teams,
        "mseries"
      );

    game.world.mSeries.round =
      1;

    game.world.mSeries.qualified =
      true;

    saveGame(false);

  }

  renderTournament(
    "mseries"
  );

  showScreen(
    "tournamentScreen"
  );

}


/* =========================================================
   TOURNAMENT
   ========================================================= */

function createKnockoutMatches(
  teams,
  type
) {

  const matches = [];

  /*
    Pastikan selalu 8 tim.
  */

  const list =
    teams.slice(0, 8);

  for (
    let i = 0;
    i < list.length;
    i += 2
  ) {

    if (
      !list[i + 1]
    ) continue;

    matches.push({

      id:
        `${type}-r1-${i / 2}`,

      tournament:
        type,

      round:
        1,

      home:
        list[i],

      away:
        list[i + 1],

      played:
        false,

      winner:
        null,

      homeScore:
        null,

      awayScore:
        null

    });

  }

  return matches;

}


function getTournamentData(
  type
) {

  return type === "msc"
    ? game.world.msc
    : game.world.mSeries;

}


function getTournamentRound(
  data
) {

  const unplayed =
    data.matches.filter(
      match =>
        !match.played
    );

  if (!unplayed.length) {
    return null;
  }

  return Math.min(
    ...unplayed.map(
      match =>
        match.round
    )
  );

}


function renderTournament(
  type
) {

  ensureWorldScreens();

  const data =
    getTournamentData(
      type
    );

  const title =
    el("tournamentTitle");

  const subtitle =
    el("tournamentSubtitle");

  const container =
    el("tournamentContent");

  if (!container) return;

  if (title) {

    title.textContent =
      type === "msc"
        ? "🏆 MSC"
        : "👑 M-Series";

  }

  if (subtitle) {

    subtitle.textContent =
      type === "msc"
        ? "Mid Season Cup"
        : "World Championship";

  }

  if (
    data.completed
  ) {

    container.innerHTML = `

      <div class="card">

        <h2>
          🏆 CHAMPION
        </h2>

        <div class="big-score">
          ${data.champion}
        </div>

        <p style="margin-top:15px">
          ${
            type === "msc"
              ? "Reward: Rp400.000"
              : "Reward: Rp1.000.000"
          }
        </p>

      </div>

    `;

    return;

  }

  const currentRound =
    getTournamentRound(
      data
    );

  if (
    currentRound == null
  ) {

    container.innerHTML =
      `<div class="empty">Tournament selesai.</div>`;

    return;
  }

  const matches =
    data.matches.filter(
      match =>
        match.round ===
        currentRound
    );

  container.innerHTML = `

    <div class="card">

      <h3>
        ${
          currentRound === 1
            ? "Quarterfinal"
            : currentRound === 2
              ? "Semifinal"
              : "Grand Final"
        }
      </h3>

      <button
        class="primary"
        onclick="playInternationalTournament('${type}')"
      >
        ⚔️ PLAY ROUND
      </button>

    </div>

    ${matches.map(
      match => `

        <div class="tournament-match">

          <h4>
            ${
              currentRound === 1
                ? "Quarterfinal"
                : currentRound === 2
                  ? "Semifinal"
                  : "Grand Final"
            }
          </h4>

          <div class="tournament-teams">

            <span>
              ${getTeamDisplayName(
                match.home
              )}
            </span>

            <strong>
              ${
                match.played
                  ? `${match.homeScore}-${match.awayScore}`
                  : "VS"
              }
            </strong>

            <span>
              ${getTeamDisplayName(
                match.away
              )}
            </span>

          </div>

        </div>

      `
    ).join("")}

  `;

}


function playInternationalTournament(
  type
) {

  const data =
    getTournamentData(
      type
    );

  const round =
    getTournamentRound(
      data
    );

  if (round == null) return;

  const matches =
    data.matches.filter(
      match =>
        match.round === round &&
        !match.played
    );

  matches.forEach(
    match => {

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

      match.played =
        true;

      match.winner =
        winner;

      match.homeScore =
        score.home;

      match.awayScore =
        score.away;

    }
  );

  const winners =
    data.matches
      .filter(
        match =>
          match.round ===
            round &&
          match.played
      )
      .map(
        match =>
          match.winner
      );

  /*
    1 winner = champion.
  */

  if (
    winners.length === 1
  ) {

    completeInternationalTournament(
      type,
      winners[0]
    );

    return;

  }

  /*
    Buat ronde baru.
    8 → 4 → 2 → 1.
  */

  const nextRound =
    round + 1;

  for (
    let i = 0;
    i < winners.length;
    i += 2
  ) {

    if (
      !winners[i + 1]
    ) continue;

    data.matches.push({

      id:
        `${type}-r${nextRound}-${i / 2}`,

      tournament:
        type,

      round:
        nextRound,

      home:
        winners[i],

      away:
        winners[i + 1],

      played:
        false,

      winner:
        null,

      homeScore:
        null,

      awayScore:
        null

    });

  }

  data.round =
    nextRound;

  saveGame(false);

  renderTournament(
    type
  );

}


function completeInternationalTournament(
  type,
  championId
) {

  const data =
    getTournamentData(
      type
    );

  const championName =
    getTeamDisplayName(
      championId
    );

  data.completed =
    true;

  data.championId =
    championId;

  data.champion =
    championName;

  /*
    Tambahkan poin world ranking.
  */

  const ranked =
    game.world.ranking.find(
      team =>
        team.teamId ===
        championId
    );

  if (ranked) {

    ranked.points +=
      type === "msc"
        ? 250
        : 500;

  }

  if (
    type === "msc"
  ) {

    game.budget +=
      400000;

    game.reputation =
      clamp(
        game.reputation + 12,
        0,
        100
      );

  } else {

    game.budget +=
      1000000;

    game.reputation =
      clamp(
        game.reputation + 25,
        0,
        100
      );

  }

  addInternationalHistory(
    type,
    championName,
    championId
  );

  saveGame(false);

  alert(
    `🏆 ${type === "msc" ? "MSC" : "M-Series"} CHAMPION!\n\n${championName}`
  );

  renderTournament(
    type
  );

}


/* =========================================================
   TOURNAMENT STATUS
   ========================================================= */

function renderTournamentStatus() {

  const msc =
    el("mscStatus");

  const mseries =
    el("mSeriesStatus");

  if (msc) {

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
          ✅ Qualified — MSC tersedia.
        </p>
      `;

    } else {

      msc.innerHTML = `
        <p class="empty">
          Belum qualified.
        </p>
      `;

    }

  }

  if (mseries) {

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
          ✅ M-Series tersedia.
        </p>
      `;

    } else {

      mseries.innerHTML = `
        <p class="empty">
          Belum tersedia.
        </p>
      `;

    }

  }

}


/* =========================================================
   INTERNATIONAL TRANSFER
   ========================================================= */

function getInternationalPlayers() {

  const currentRegion =
    getCurrentLeague()?.region;

  const players = [];

  getAllLeagues()
    .forEach(league => {

      if (
        league.region ===
        currentRegion
      ) return;

      league.teams.forEach(
        team => {

          team.players.forEach(
            player => {

              players.push({

                ...deepClone(player),

                sourceTeamId:
                  team.id,

                sourceLeagueId:
                  league.id

              });

            }
          );

        }
      );

    });

  return players.sort(
    (a, b) =>
      Number(b.rating || 0) -
      Number(a.rating || 0)
  );

}


function renderInternationalTransfer() {

  const container =
    el(
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
    players.map(
      player => `

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

      `
    ).join("");

}


/* =========================================================
   HISTORY
   ========================================================= */

function addSeasonHistory(
  position,
  championId,
  championName
) {

  game.history.unshift({

    type:
      "season",

    year:
      game.year,

    teamId:
      game.team,

    teamName:
      getCurrentTeamName(),

    position,

    champion:
      championName,

    championId

  });

}


function addInternationalHistory(
  tournament,
  championName,
  championId
) {

  game.history.unshift({

    type:
      "international",

    year:
      game.year,

    teamId:
      game.team,

    teamName:
      getCurrentTeamName(),

    tournament,

    champion:
      championName,

    championId

  });

}


function openHistory() {

  renderHistory();

  showScreen(
    "historyScreen"
  );

}


function renderHistory() {

  const container =
    el("historyList");

  if (!container) return;

  if (
    !game.history.length
  ) {

    container.innerHTML =
      `<div class="empty">Belum ada history.</div>`;

    return;
  }

  container.innerHTML =
    game.history.map(
      history => {

        if (
          history.type ===
          "international"
        ) {

          return `

            <div class="history-card">

              <strong>
                ${history.year}
                •
                ${history.tournament.toUpperCase()}
              </strong>

              <p style="margin-top:8px">
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

      }
    ).join("");

}


/* =========================================================
   SAVE
   ========================================================= */

function saveGame(
  showMessage = false
) {

  try {

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );

    if (showMessage) {

      alert(
        "Game berhasil disimpan."
      );

    }

  } catch (error) {

    console.error(
      "Save error:",
      error
    );

  }

}


/* =========================================================
   LOAD
   ========================================================= */

function loadGame() {

  try {

    const saved =
      localStorage.getItem(
        SAVE_KEY
      );

    if (!saved) {
      return false;
    }

    const parsed =
      JSON.parse(saved);

    if (
      !parsed ||
      !parsed.careerStarted
    ) {

      return false;
    }

    game = {

      ...deepClone(
        DEFAULT_GAME
      ),

      ...parsed,

      world: {

        ...deepClone(
          DEFAULT_GAME.world
        ),

        ...(parsed.world || {}),

        msc: {

          ...deepClone(
            DEFAULT_GAME.world.msc
          ),

          ...(parsed.world?.msc || {})

        },

        mSeries: {

          ...deepClone(
            DEFAULT_GAME.world.mSeries
          ),

          ...(parsed.world?.mSeries || {})

        }

      }

    };

    /*
      Backward compatibility
      dengan save lama.
    */

    if (
      !game.currentTeamData
    ) {

      const source =
        getTeamSource(
          game.team
        );

      if (source) {

        game.currentTeamData =
          deepClone(
            source.team
          );

      }

    }

    if (
      !game.phase
    ) {

      game.phase =
        game.seasonComplete
          ? "offseason"
          : "regular";

    }

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

  const yes =
    confirm(
      "Yakin mau restart career? Semua save V0.9 akan dihapus."
    );

  if (!yes) return;

  localStorage.removeItem(
    SAVE_KEY
  );

  location.reload();

}


/* =========================================================
   INIT
   ========================================================= */

function init() {

  ensureWorldScreens();

  renderCountries();

  const loaded =
    loadGame();

  if (loaded) {

    selectedTarget =
      game.target ||
      "top3";

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
