/* =========================================================
   MLBB PRO MANAGER
   V1.0
   Base: V0.9 STABLE
   ========================================================= */

const SAVE_KEY = "mlbb_pro_manager_save_v10";

let selectedTarget = "top3";


/* =========================================================
   DEFAULT GAME
   ========================================================= */

const DEFAULT_GAME = {
  version: 10,

  year: 2026,

  managerName: "",

  country: null,
  league: null,
  team: null,

  budget: 500000,

  reputation: 50,

  organizationLevel: 1,

  target: "top3",

  /* V1.0 CALENDAR */

  date: {
    month: 1,
    day: 1
  },

  totalDays: 0,

  /* V1.0 ECONOMY */

  monthlySalaryPaid: false,

  sponsor: {
    name: "Local Sponsor",
    monthlyIncome: 75000,
    seasonBonus: 100000
  },

  /* V1.0 TEAM */

  chemistry: 70,

  morale: 70,

  teamForm: 0,

  /* V1.0 NEWS */

  news: [],

  eventHistory: [],

  /* V1.0 AI TRANSFER */

  aiTransferLog: [],

  aiTransfersThisSeason: 0,

  /* SEASON */

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

  currentTeamData: null,

  /* WORLD */

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

  document.querySelectorAll(".screen")
    .forEach(screen => {
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

function chance(percent) {
  return Math.random() * 100 < percent;
}

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTargetName(target) {

  switch (target) {

    case "champion":
      return "Juara";

    case "top3":
      return "Top 3";

    case "playoff":
      return "Playoff";

    case "build":
      return "Build Team";

    default:
      return "Top 3";
  }
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

  return getAllLeagues()
    .find(league => league.id === id) || null;
}

function getTeamSource(teamId) {

  if (!teamId) return null;

  for (const league of getAllLeagues()) {

    const team =
      league.teams.find(
        team => team.id === teamId
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

function getCurrentLeague() {
  return getLeagueById(game.league);
}

function getCurrentTeam() {

  if (
    game.currentTeamData &&
    game.currentTeamData.id === game.team
  ) {

    return game.currentTeamData;
  }

  const source =
    getTeamSource(game.team);

  if (!source) {
    return null;
  }

  game.currentTeamData =
    deepClone(source.team);

  prepareTeamPlayers(
    game.currentTeamData
  );

  return game.currentTeamData;
}

function prepareTeamPlayers(team) {

  if (!team) return;

  team.players =
    team.players || [];

  team.players.forEach(player => {

    if (player.contractYears == null) {
      player.contractYears = 2;
    }

    if (player.morale == null) {
      player.morale = 70;
    }
  });
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

  if (teamId === game.team) {
    return getCurrentTeamName();
  }

  const source =
    getTeamSource(teamId);

  return source
    ? source.team.name
    : teamId || "-";
}

function getTeamPlayers(teamId) {

  if (teamId === game.team) {
    return getCurrentTeam()?.players || [];
  }

  const source =
    getTeamSource(teamId);

  return source?.team.players || [];
}

function getCountryById(id) {

  if (typeof countries === "undefined") {
    return null;
  }

  return countries.find(
    country => country.id === id
  ) || null;
}


/* =========================================================
   RATING
   ========================================================= */

function playerRating(player) {
  return Number(player?.rating || 0);
}

function teamRating(teamId) {

  const players =
    getTeamPlayers(teamId);

  if (!players.length) {
    return 70;
  }

  const ratings =
    players
      .map(player => playerRating(player))
      .sort((a, b) => b - a)
      .slice(0, 5);

  if (!ratings.length) {
    return 70;
  }

  const total =
    ratings.reduce(
      (sum, rating) =>
        sum + rating,
      0
    );

  return Math.round(
    total / ratings.length
  );
}

function getStartingFive(teamId) {

  const players =
    getTeamPlayers(teamId);

  if (!players.length) {
    return [];
  }

  const usedRoles =
    new Set();

  const selected = [];

  const roleOrder = [
    "EXP",
    "Jungle",
    "Mid",
    "Gold",
    "Roam"
  ];

  roleOrder.forEach(role => {

    const player =
      players
        .filter(p =>
          String(p.role || "")
            .toLowerCase() ===
          role.toLowerCase()
        )
        .sort(
          (a, b) =>
            playerRating(b) -
            playerRating(a)
        )
        .find(
          p => !usedRoles.has(p.id)
        );

    if (player) {

      selected.push(player);

      usedRoles.add(player.id);
    }
  });

  const remaining =
    players
      .filter(
        p => !usedRoles.has(p.id)
      )
      .sort(
        (a, b) =>
          playerRating(b) -
          playerRating(a)
      );

  while (
    selected.length < 5 &&
    remaining.length
  ) {

    selected.push(
      remaining.shift()
    );
  }

  return selected.slice(0, 5);
}


/* =========================================================
   COUNTRY
   ========================================================= */

function renderCountries() {

  const container =
    el("countryList");

  if (!container) return;

  if (typeof countries === "undefined") {

    container.innerHTML = `
      <div class="empty">
        Data negara tidak ditemukan.
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  countries.forEach(country => {

    const button =
      document.createElement("button");

    button.className =
      "country-btn";

    button.innerHTML = `
      <div class="country-flag">
        ${escapeHtml(country.flag || "🌎")}
      </div>

      <div class="country-info">
        <strong>
          ${escapeHtml(country.name)}
        </strong>

        <span>
          ${country.leagues?.length || 0}
          liga tersedia
        </span>
      </div>
    `;

    button.onclick =
      () => selectCountry(country.id);

    container.appendChild(button);
  });
}

function selectCountry(countryId) {

  const country =
    getCountryById(countryId);

  if (!country) {

    alert("Negara tidak ditemukan.");

    return;
  }

  game.country =
    countryId;

  const title =
    el("leagueCountryTitle");

  if (title) {

    title.textContent =
      `${country.flag || "🌎"} ${country.name}`;
  }

  renderLeagues();

  showScreen("leagueScreen");
}


/* =========================================================
   LEAGUE
   ========================================================= */

function renderLeagues() {

  const container =
    el("leagueList");

  if (!container) return;

  const country =
    getCountryById(game.country);

  if (!country) {

    container.innerHTML = `
      <div class="empty">
        Pilih negara terlebih dahulu.
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  const leagues =
    (country.leagues || [])
      .map(id => getLeagueById(id))
      .filter(Boolean);

  if (!leagues.length) {

    container.innerHTML = `
      <div class="empty">
        Belum ada liga untuk negara ini.
      </div>
    `;

    return;
  }

  leagues.forEach(league => {

    const button =
      document.createElement("button");

    button.className =
      "league-btn";

    button.innerHTML = `
      <div class="league-info">

        <strong>
          ${escapeHtml(league.name)}
        </strong>

        <span>
          Season ${league.season}
          • ${league.teams.length} tim
        </span>

      </div>
    `;

    button.onclick =
      () => selectLeague(league.id);

    container.appendChild(button);
  });
}

function selectLeague(leagueId) {

  const league =
    getLeagueById(leagueId);

  if (!league) {

    alert("Liga tidak ditemukan.");

    return;
  }

  game.league =
    leagueId;

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

  const league =
    getCurrentLeague();

  if (!league) {

    container.innerHTML = `
      <div class="empty">
        Liga tidak ditemukan.
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  league.teams.forEach(team => {

    const button =
      document.createElement("button");

    button.className =
      "team-btn";

    button.innerHTML = `
      <div class="team-info">

        <strong>
          ${escapeHtml(team.name)}
        </strong>

        <span>
          Rating tim: ${teamRating(team.id)}
        </span>

      </div>
    `;

    button.onclick =
      () => selectTeam(team.id);

    container.appendChild(button);
  });
}

function selectTeam(teamId) {

  const source =
    getTeamSource(teamId);

  if (!source) {

    alert("Data tim tidak ditemukan.");

    return;
  }

  game.team =
    teamId;

  game.currentTeamData =
    deepClone(source.team);

  prepareTeamPlayers(
    game.currentTeamData
  );

  const input =
    el("managerName");

  if (input) {
    input.value = "";
  }

  selectedTarget =
    "top3";

  document.querySelectorAll(
    ".target-btn"
  ).forEach(btn => {
    btn.classList.remove("selected");
  });

  const defaultTarget =
    el("target-top3");

  if (defaultTarget) {
    defaultTarget.classList.add(
      "selected"
    );
  }

  showScreen(
    "managerSetupScreen"
  );
}


/* =========================================================
   TARGET
   ========================================================= */

function selectTarget(target) {

  selectedTarget =
    target;

  document.querySelectorAll(
    ".target-btn"
  ).forEach(btn => {
    btn.classList.remove(
      "selected"
    );
  });

  const button =
    el(`target-${target}`);

  if (button) {
    button.classList.add(
      "selected"
    );
  }
}


/* =========================================================
   START CAREER
   ========================================================= */

function startCareer() {

  const input =
    el("managerName");

  if (!input) {

    alert(
      "Input nama manager tidak ditemukan."
    );

    return;
  }

  const name =
    input.value.trim();

  if (!name) {

    alert(
      "Masukkan nama manager dulu."
    );

    input.focus();

    return;
  }

  const league =
    getCurrentLeague();

  const source =
    getTeamSource(game.team);

  if (!league) {

    alert("Data liga tidak ditemukan.");

    return;
  }

  if (!source) {

    alert("Data tim tidak ditemukan.");

    return;
  }

  game.managerName =
    name;

  game.target =
    selectedTarget || "top3";

  game.careerStarted =
    true;

  game.year =
    Number(league.season) || 2026;

  game.budget =
    500000;

  game.reputation =
    50;

  game.organizationLevel =
    1;

  game.date = {
    month: 1,
    day: 1
  };

  game.totalDays =
    0;

  game.monthlySalaryPaid =
    false;

  game.chemistry =
    70;

  game.morale =
    70;

  game.teamForm =
    0;

  game.news = [];

  game.eventHistory = [];

  game.aiTransferLog = [];

  game.aiTransfersThisSeason =
    0;

  game.history = [];

  game.requests = [];

  game.marketPlayers = [];

  game.scoutingResult = null;

  game.seasonComplete =
    false;

  game.phase =
    "regular";

  game.currentTeamData =
    deepClone(source.team);

  prepareTeamPlayers(
    game.currentTeamData
  );

  game.world =
    createWorldState();

  createSeason();

  createSponsor();

  addNews(
    "career",
    "Karier baru dimulai!",
    `Manager ${name} resmi menangani ${source.team.name}.`
  );

  saveGame(false);

  renderDashboard();

  showScreen(
    "dashboardScreen"
  );
}


/* =========================================================
   SPONSOR
   ========================================================= */

function createSponsor() {

  const rep =
    Number(game.reputation || 50);

  let sponsorName =
    "Local Sponsor";

  if (rep >= 80) {
    sponsorName =
      "Elite Gaming Partner";
  } else if (rep >= 65) {
    sponsorName =
      "National Gaming Partner";
  } else if (rep >= 50) {
    sponsorName =
      "Regional Gaming Partner";
  }

  game.sponsor = {

    name: sponsorName,

    monthlyIncome:
      50000 + rep * 500,

    seasonBonus:
      75000 + rep * 1000
  };
}

function processSponsorIncome() {

  const income =
    Number(
      game.sponsor?.monthlyIncome || 0
    );

  if (income <= 0) {
    return;
  }

  game.budget +=
    income;

  addNews(
    "finance",
    "Sponsor membayar pemasukan bulanan",
    `${game.sponsor.name} memberikan ${money(income)}.`
  );
}


/* =========================================================
   CALENDAR
   ========================================================= */

function daysInMonth(month) {

  const days = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];

  return days[
    clamp(month, 1, 12) - 1
  ];
}

function getDateText() {

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];

  const month =
    clamp(
      Number(game.date?.month || 1),
      1,
      12
    );

  const day =
    clamp(
      Number(game.date?.day || 1),
      1,
      daysInMonth(month)
    );

  return `${day} ${monthNames[month - 1]} ${game.year}`;
}

function advanceCalendarDay(days = 1) {

  for (let i = 0; i < days; i++) {

    game.totalDays =
      Number(game.totalDays || 0) + 1;

    game.date.day++;

    const max =
      daysInMonth(
        game.date.month
      );

    if (
      game.date.day > max
    ) {

      game.date.day = 1;

      game.date.month++;

      if (
        game.date.month > 12
      ) {

        game.date.month = 1;

        game.year++;

      }

      game.monthlySalaryPaid =
        false;

      processMonthlyFinance();
    }

    randomDailyEvent();
  }
}

function processMonthlyFinance() {

  if (
    game.monthlySalaryPaid
  ) {
    return;
  }

  const salary =
    calculateSeasonSalary();

  const organizationCost =
    Number(
      game.organizationLevel || 1
    ) * 10000;

  const totalCost =
    salary + organizationCost;

  game.budget -=
    totalCost;

  processSponsorIncome();

  game.monthlySalaryPaid =
    true;

  if (game.budget < 0) {

    game.budget = 0;

    game.reputation =
      clamp(
        game.reputation - 4,
        0,
        100
      );

    addNews(
      "finance",
      "Masalah keuangan!",
      "Budget tidak cukup untuk menutup seluruh biaya operasional."
    );

  } else {

    addNews(
      "finance",
      "Laporan keuangan bulanan",
      `Gaji ${money(salary)} + operasional ${money(organizationCost)} telah dibayar.`
    );
  }
}


/* =========================================================
   NEWS
   ========================================================= */

function addNews(type, title, message) {

  game.news =
    game.news || [];

  game.news.push({

    id:
      Date.now() +
      Math.random(),

    day:
      getDateText(),

    type,
    title,
    message
  });

  if (game.news.length > 30) {
    game.news =
      game.news.slice(-30);
  }
}

function randomDailyEvent() {

  if (!chance(12)) {
    return;
  }

  const events = [

    {
      title: "Fans memberikan dukungan",
      message:
        "Dukungan fans meningkatkan semangat tim.",
      effect: () => {
        game.morale =
          clamp(
            game.morale + 3,
            0,
            100
          );
      }
    },

    {
      title: "Media menyoroti tim",
      message:
        "Performa tim menjadi pembicaraan komunitas.",
      effect: () => {
        game.reputation =
          clamp(
            game.reputation + 1,
            0,
            100
          );
      }
    },

    {
      title: "Latihan mandiri pemain",
      message:
        "Beberapa pemain berlatih sendiri dan menjaga performanya.",
      effect: () => {
        getCurrentTeam()?.players
          ?.forEach(player => {

            if (chance(35)) {

              player.morale =
                clamp(
                  player.morale + 2,
                  0,
                  100
                );
            }
          });
      }
    },

    {
      title: "Rumor transfer",
      message:
        "Rumor transfer membuat suasana roster sedikit tidak stabil.",
      effect: () => {
        game.chemistry =
          clamp(
            game.chemistry - 2,
            0,
            100
          );
      }
    },

    {
      title: "Konten viral",
      message:
        "Konten pemain menjadi viral dan meningkatkan popularitas organisasi.",
      effect: () => {
        game.reputation =
          clamp(
            game.reputation + 2,
            0,
            100
          );
      }
    },

    {
      title: "Hari buruk",
      message:
        "Performa latihan tidak maksimal hari ini.",
      effect: () => {
        game.morale =
          clamp(
            game.morale - 2,
            0,
            100
          );
      }
    }

  ];

  const event =
    events[
      random(0, events.length - 1)
    ];

  event.effect();

  game.eventHistory =
    game.eventHistory || [];

  game.eventHistory.push({

    date:
      getDateText(),

    title:
      event.title,

    message:
      event.message
  });

  addNews(
    "event",
    event.title,
    event.message
  );
}


/* =========================================================
   TEAM CHEMISTRY
   ========================================================= */

function calculateChemistry() {

  const players =
    getCurrentTeam()?.players || [];

  if (!players.length) {
    return 50;
  }

  const averageMorale =
    players.reduce(
      (sum, player) =>
        sum +
        Number(player.morale || 70),
      0
    ) / players.length;

  let chemistry =
    50 +
    ((averageMorale - 50) * 0.5);

  if (players.length >= 5) {
    chemistry += 10;
  }

  if (players.length >= 7) {
    chemistry += 5;
  }

  return Math.round(
    clamp(
      chemistry,
      0,
      100
    )
  );
}

function updateTeamChemistry() {

  game.chemistry =
    calculateChemistry();

  const players =
    getCurrentTeam()?.players || [];

  if (!players.length) {
    game.morale = 50;
    return;
  }

  game.morale =
    Math.round(
      players.reduce(
        (sum, player) =>
          sum +
          Number(player.morale || 70),
        0
      ) / players.length
    );
}


/* =========================================================
   STANDINGS
   ========================================================= */

function createStandings(league) {

  if (!league) {
    return [];
  }

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

function getStanding(teamId) {

  return game.standings.find(
    row =>
      row.teamId === teamId
  );
}

function sortStandings() {

  game.standings.sort(
    (a, b) => {

      if (
        b.points !== a.points
      ) {
        return (
          b.points -
          a.points
        );
      }

      if (
        b.diff !== a.diff
      ) {
        return (
          b.diff -
          a.diff
        );
      }

      if (
        b.mapWin !== a.mapWin
      ) {
        return (
          b.mapWin -
          a.mapWin
        );
      }

      return (
        teamRating(b.teamId) -
        teamRating(a.teamId)
      );
    }
  );
}

function updateStanding(
  teamId,
  won,
  mapWon,
  mapLost
) {

  const row =
    getStanding(teamId);

  if (!row) {
    return;
  }

  row.played++;

  if (won) {

    row.wins++;

    row.points += 3;

  } else {

    row.losses++;
  }

  row.mapWin +=
    mapWon;

  row.mapLoss +=
    mapLost;

  row.diff =
    row.mapWin -
    row.mapLoss;
}


/* =========================================================
   ROUND ROBIN
   ========================================================= */

function createRoundRobinSchedule(
  league
) {

  if (
    !league ||
    !league.teams
  ) {
    return [];
  }

  let teams =
    league.teams.map(
      team => team.id
    );

  if (
    teams.length % 2 !== 0
  ) {
    teams.push(null);
  }

  const total =
    teams.length;

  const rounds =
    total - 1;

  const half =
    total / 2;

  const rotation =
    [...teams];

  const schedule = [];

  let matchId = 1;

  for (
    let round = 0;
    round < rounds;
    round++
  ) {

    const matches = [];

    for (
      let i = 0;
      i < half;
      i++
    ) {

      const home =
        rotation[i];

      const away =
        rotation[
          total - 1 - i
        ];

      if (
        home &&
        away
      ) {

        let homeTeam =
          home;

        let awayTeam =
          away;

        if (
          round % 2 === 1
        ) {

          [
            homeTeam,
            awayTeam
          ] =
          [
            awayTeam,
            homeTeam
          ];
        }

        matches.push({

          id:
            `regular-${matchId++}`,

          matchday:
            round + 1,

          stage:
            "regular",

          home:
            homeTeam,

          away:
            awayTeam,

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
    }

    schedule.push(
      ...matches
    );

    rotation.splice(
      1,
      0,
      rotation.pop()
    );
  }

  return schedule;
}


/* =========================================================
   SEASON
   ========================================================= */

function createSeason() {

  const league =
    getCurrentLeague();

  if (!league) {
    return;
  }

  game.standings =
    createStandings(
      league
    );

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

  game.date = {
    month: 1,
    day: 1
  };

  game.totalDays =
    0;

  game.monthlySalaryPaid =
    false;

  game.aiTransfersThisSeason =
    0;
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  const team =
    getCurrentTeam();

  const league =
    getCurrentLeague();

  if (
    !team ||
    !league
  ) {
    return;
  }

  updateTeamChemistry();

  if (el("dashManager")) {
    el("dashManager").textContent =
      game.managerName || "-";
  }

  if (el("dashSeason")) {
    el("dashSeason").textContent =
      game.year;
  }

  if (el("dashTeam")) {
    el("dashTeam").textContent =
      team.name;
  }

  if (el("dashLeague")) {
    el("dashLeague").textContent =
      league.name;
  }

  if (el("dashBudget")) {
    el("dashBudget").textContent =
      money(game.budget);
  }

  if (el("dashRep")) {
    el("dashRep").textContent =
      game.reputation;
  }

  if (el("dashOrg")) {
    el("dashOrg").textContent =
      `Level ${game.organizationLevel}`;
  }

  if (el("dashTarget")) {
    el("dashTarget").textContent =
      getTargetName(game.target);
  }

  renderNextMatch();

  renderV10Dashboard();
}

function renderNextMatch() {

  const container =
    el("nextMatch");

  if (!container) {
    return;
  }

  const match =
    getNextUserMatch();

  if (!match) {

    container.innerHTML = `
      <div class="empty">
        Tidak ada pertandingan berikutnya.
      </div>
    `;

    return;
  }

  const opponentId =
    match.home === game.team
      ? match.away
      : match.home;

  container.innerHTML = `

    <div class="match-preview">

      <strong>
        ${escapeHtml(
          getCurrentTeamName()
        )}
      </strong>

      <span class="versus">
        VS
      </span>

      <strong>
        ${escapeHtml(
          getTeamDisplayName(
            opponentId
          )
        )}
      </strong>

    </div>

    <div class="player-meta">

      <span class="badge">
        Matchday ${match.matchday}
      </span>

      <span class="badge">
        ${
          match.stage === "regular"
            ? "Regular Season"
            : "Playoff"
        }
      </span>

    </div>
  `;
}

function getNextUserMatch() {

  return game.schedule.find(
    match => {

      return (
        !match.played &&
        (
          match.home === game.team ||
          match.away === game.team
        )
      );
    }
  ) || null;
}


/* =========================================================
   V1.0 DASHBOARD PANEL
   ========================================================= */

function renderV10Dashboard() {

  const anchor =
    el("nextMatch");

  if (!anchor) {
    return;
  }

  let panel =
    el("v10DashboardPanel");

  if (!panel) {

    panel =
      document.createElement("div");

    panel.id =
      "v10DashboardPanel";

    panel.className =
      "card";

    anchor.parentNode.insertBefore(
      panel,
      anchor.nextSibling
    );
  }

  const latestNews =
    [...(game.news || [])]
      .reverse()
      .slice(0, 3);

  const next =
    getNextUserMatch();

  const position =
    getCurrentPosition();

  panel.innerHTML = `

    <div style="
      margin-bottom:14px;
      padding:14px;
      border-radius:14px;
      background:rgba(255,255,255,.05);
    ">

      <strong>📅 KALENDER</strong>

      <div style="
        font-size:20px;
        font-weight:800;
        margin-top:5px;
      ">
        ${escapeHtml(getDateText())}
      </div>

      <div class="player-meta">

        <span class="badge">
          Phase:
          ${escapeHtml(game.phase)}
        </span>

        <span class="badge">
          Posisi:
          #${position || "-"}
        </span>

      </div>

    </div>


    <div style="
      margin-bottom:14px;
      padding:14px;
      border-radius:14px;
      background:rgba(255,255,255,.05);
    ">

      <strong>❤️ TEAM CONDITION</strong>

      <div class="player-meta">

        <span class="badge">
          Morale ${game.morale}
        </span>

        <span class="badge">
          Chemistry ${game.chemistry}
        </span>

        <span class="badge">
          Form ${game.teamForm >= 0 ? "+" : ""}
          ${game.teamForm}
        </span>

      </div>

    </div>


    <div style="
      margin-bottom:14px;
      padding:14px;
      border-radius:14px;
      background:rgba(255,255,255,.05);
    ">

      <strong>💰 FINANCE</strong>

      <div class="player-meta">

        <span class="badge">
          Sponsor:
          ${escapeHtml(
            game.sponsor?.name ||
            "-"
          )}
        </span>

        <span class="badge">
          +${money(
            game.sponsor?.monthlyIncome ||
            0
          )}/bulan
        </span>

      </div>

    </div>


    <div style="
      margin-bottom:14px;
      padding:14px;
      border-radius:14px;
      background:rgba(255,255,255,.05);
    ">

      <strong>📰 BERITA TERBARU</strong>

      ${
        latestNews.length
          ? latestNews.map(item => `
              <div style="
                padding:9px 0;
                border-bottom:1px solid rgba(255,255,255,.08);
              ">

                <strong>
                  ${escapeHtml(item.title)}
                </strong>

                <div style="
                  font-size:13px;
                  opacity:.75;
                  margin-top:3px;
                ">
                  ${escapeHtml(item.message)}
                </div>

                <small>
                  ${escapeHtml(item.day)}
                </small>

              </div>
            `).join("")
          : `
            <div class="empty">
              Belum ada berita.
            </div>
          `
      }

    </div>


    ${
      next
        ? `
          <div class="player-meta">
            <span class="badge">
              Match berikutnya:
              Matchday ${next.matchday}
            </span>
          </div>
        `
        : ""
    }

  `;
}

function getCurrentPosition() {

  sortStandings();

  const index =
    game.standings.findIndex(
      row =>
        row.teamId === game.team
    );

  return index >= 0
    ? index + 1
    : null;
}


/* =========================================================
   ROSTER
   ========================================================= */

function openRoster() {

  renderRoster();

  showScreen(
    "rosterScreen"
  );
}

function renderRoster() {

  const container =
    el("rosterList");

  if (!container) {
    return;
  }

  const players =
    getCurrentTeam()?.players || [];

  if (!players.length) {

    container.innerHTML = `
      <div class="empty">
        Tidak ada pemain.
      </div>
    `;

    return;
  }

  const sorted =
    [...players].sort(
      (a, b) =>
        playerRating(b) -
        playerRating(a)
    );

  container.innerHTML =
    sorted.map(player => {

      const contract =
        Number(
          player.contractYears || 0
        );

      const morale =
        Number(
          player.morale || 70
        );

      return `

        <div class="player-card">

          <div class="player-top">

            <div>

              <div class="player-name">
                ${escapeHtml(
                  player.name
                )}
              </div>

              <div class="player-role">
                ${escapeHtml(
                  player.role ||
                  "Player"
                )}
              </div>

            </div>

            <div class="rating">
              ${playerRating(player)}
            </div>

          </div>


          <div class="player-meta">

            <span class="badge">
              ${escapeHtml(
                player.nationality ||
                "-"
              )}
            </span>

            <span class="badge">
              Age ${player.age || "-"}
            </span>

            <span class="badge">
              POT ${
                player.potential ||
                player.rating ||
                "-"
              }
            </span>

            <span class="badge">
              Morale ${morale}
            </span>

            <span class="badge">
              Contract ${contract} thn
            </span>

          </div>


          <div class="transfer-price">
            Salary:
            ${money(player.salary || 0)}
          </div>


          ${
            contract <= 1
              ? `
                <button
                  class="small-btn buy"
                  onclick="extendContract('${player.id}')"
                >
                  EXTEND CONTRACT
                </button>
              `
              : ""
          }

        </div>

      `;
    }).join("");
}

function backDashboard() {

  renderDashboard();

  showScreen(
    "dashboardScreen"
  );
}


/* =========================================================
   CONTRACT
   ========================================================= */

function extendContract(playerId) {

  const team =
    getCurrentTeam();

  if (!team) {
    return;
  }

  const player =
    team.players.find(
      p => p.id === playerId
    );

  if (!player) {

    alert(
      "Pemain tidak ditemukan."
    );

    return;
  }

  const years =
    Number(
      player.contractYears || 0
    );

  if (years >= 3) {

    alert(
      "Kontrak pemain masih panjang."
    );

    return;
  }

  const salary =
    Number(
      player.salary || 0
    );

  const cost =
    Math.max(
      25000,
      Math.round(
        salary *
        (
          0.5 +
          (
            100 -
            Number(
              player.morale || 70
            )
          ) *
          0.005
        )
      )
    );

  if (
    game.budget < cost
  ) {

    alert(
      `Budget tidak cukup.\nButuh ${money(cost)}.`
    );

    return;
  }

  game.budget -=
    cost;

  player.contractYears =
    years + 2;

  player.morale =
    clamp(
      Number(
        player.morale || 70
      ) + 10,
      0,
      100
    );

  game.chemistry =
    clamp(
      game.chemistry + 3,
      0,
      100
    );

  addNews(
    "contract",
    "Kontrak pemain diperpanjang",
    `${player.name} memperpanjang kontrak.`
  );

  saveGame(false);

  renderRoster();

  renderDashboard();

  alert(
    `${player.name} memperpanjang kontrak 2 tahun.`
  );
}


/* =========================================================
   TRANSFER MARKET
   ========================================================= */

function calculatePlayerValue(player) {

  const rating =
    Number(
      player.rating || 0
    );

  const potential =
    Number(
      player.potential ||
      rating
    );

  const age =
    Number(
      player.age || 22
    );

  let value =
    20000 +
    rating * 4500 +
    potential * 2500;

  if (age <= 21) {
    value *= 1.25;
  }

  if (age >= 28) {
    value *= 0.8;
  }

  return Math.max(
    25000,
    Math.round(value)
  );
}

function createMarket() {

  const players = [];

  getAllLeagues()
    .forEach(league => {

      league.teams
        .forEach(team => {

          team.players
            .forEach(player => {

              if (
                team.id === game.team
              ) {
                return;
              }

              const copy =
                deepClone(player);

              copy.sourceTeam =
                team.id;

              copy.sourceLeague =
                league.id;

              copy.value =
                calculatePlayerValue(
                  copy
                );

              players.push(copy);
            });
        });
    });

  players.sort(
    (a, b) =>
      playerRating(b) -
      playerRating(a)
  );

  return players.slice(
    0,
    40
  );
}

function openTransfer() {

  if (
    !game.marketPlayers.length
  ) {

    game.marketPlayers =
      createMarket();
  }

  renderTransfer();

  showScreen(
    "transferScreen"
  );
}

function renderTransfer() {

  const info =
    el("transferInfo");

  const list =
    el("transferList");

  if (
    !info ||
    !list
  ) {
    return;
  }

  info.innerHTML = `

    <strong>
      Budget
    </strong>

    <div class="transfer-price">
      ${money(game.budget)}
    </div>

    <div class="player-meta">

      <span class="badge">
        Reputation ${game.reputation}
      </span>

      <span class="badge">
        Chemistry ${game.chemistry}
      </span>

      <span class="badge">
        Market ${game.marketPlayers.length}
        players
      </span>

    </div>

  `;

  if (
    !game.marketPlayers.length
  ) {

    list.innerHTML = `
      <div class="empty">
        Tidak ada pemain di market.
      </div>
    `;

    return;
  }

  list.innerHTML =
    game.marketPlayers
      .map(player => {

        const value =
          player.value ||
          calculatePlayerValue(
            player
          );

        const already =
          getCurrentTeam()
            ?.players
            ?.some(
              p => p.id === player.id
            );

        return `

          <div class="player-card">

            <div class="player-top">

              <div>

                <div class="player-name">
                  ${escapeHtml(
                    player.name
                  )}
                </div>

                <div class="player-role">
                  ${escapeHtml(
                    player.role ||
                    "-"
                  )}
                </div>

              </div>

              <div class="rating">
                ${playerRating(player)}
              </div>

            </div>


            <div class="player-meta">

              <span class="badge">
                Age ${player.age || "-"}
              </span>

              <span class="badge">
                POT ${
                  player.potential ||
                  "-"
                }
              </span>

              <span class="badge">
                ${escapeHtml(
                  getTeamDisplayName(
                    player.sourceTeam
                  )
                )}
              </span>

            </div>


            <div class="transfer-price">
              ${money(value)}
            </div>


            <button
              class="small-btn buy"
              ${already ? "disabled" : ""}
              onclick="buyPlayer('${player.id}')"
            >
              ${
                already
                  ? "SUDAH DIMILIKI"
                  : "BUY PLAYER"
              }
            </button>

          </div>

        `;
      })
      .join("");
}

function buyPlayer(playerId) {

  const marketPlayer =
    game.marketPlayers.find(
      p => p.id === playerId
    );

  if (!marketPlayer) {

    alert(
      "Pemain tidak ditemukan."
    );

    return;
  }

  const value =
    marketPlayer.value ||
    calculatePlayerValue(
      marketPlayer
    );

  if (
    game.budget < value
  ) {

    alert(
      `Budget tidak cukup.\nHarga pemain ${money(value)}.`
    );

    return;
  }

  const team =
    getCurrentTeam();

  if (!team) {
    return;
  }

  if (
    team.players.length >= 8
  ) {

    alert(
      "Roster sudah penuh. Maksimal 8 pemain."
    );

    return;
  }

  const foreignCount =
    team.players.filter(
      player =>
        player.nationality &&
        player.nationality !== "ID"
    ).length;

  if (
    game.country === "id" &&
    marketPlayer.nationality !== "ID" &&
    foreignCount >= 2
  ) {

    alert(
      "Maksimal 2 pemain asing untuk roster ini."
    );

    return;
  }

  game.budget -=
    value;

  const newPlayer =
    deepClone(
      marketPlayer
    );

  delete newPlayer.sourceTeam;

  delete newPlayer.sourceLeague;

  delete newPlayer.value;

  newPlayer.contractYears =
    2;

  newPlayer.morale =
    75;

  team.players.push(
    newPlayer
  );

  game.marketPlayers =
    game.marketPlayers.filter(
      p =>
        p.id !== playerId
    );

  game.chemistry =
    clamp(
      game.chemistry + 4,
      0,
      100
    );

  addNews(
    "transfer",
    "TRANSFER MASUK",
    `${newPlayer.name} resmi bergabung dengan ${team.name}.`
  );

  saveGame(false);

  renderTransfer();

  renderDashboard();

  alert(
    `${newPlayer.name} berhasil bergabung!`
  );
}


/* =========================================================
   SCOUTING
   ========================================================= */

function openScouting() {

  renderScouting();

  showScreen(
    "scoutingScreen"
  );
}

function renderScouting() {

  const container =
    el("scoutingResult");

  if (!container) {
    return;
  }

  if (!game.scoutingResult) {

    container.innerHTML = `
      <div class="empty">
        Tekan SCOUT PLAYER untuk mencari pemain.
      </div>
    `;

    return;
  }

  const player =
    game.scoutingResult;

  container.innerHTML = `

    <div class="player-card">

      <div class="player-top">

        <div>

          <div class="player-name">
            ${escapeHtml(
              player.name
            )}
          </div>

          <div class="player-role">
            ${escapeHtml(
              player.role || "-"
            )}
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
          ${escapeHtml(
            player.nationality || "-"
          )}
        </span>

      </div>


      <div class="transfer-price">
        Estimated value:
        ${money(
          calculatePlayerValue(
            player
          )
        )}
      </div>

    </div>
  `;
}

function runScouting() {

  const allPlayers = [];

  getAllLeagues()
    .forEach(league => {

      league.teams
        .forEach(team => {

          team.players
            .forEach(player => {

              if (
                team.id === game.team
              ) {
                return;
              }

              allPlayers.push({

                ...deepClone(
                  player
                ),

                sourceTeam:
                  team.id,

                sourceLeague:
                  league.id
              });
            });
        });
    });

  if (!allPlayers.length) {

    alert(
      "Tidak ada pemain yang bisa di-scout."
    );

    return;
  }

  game.scoutingResult =
    allPlayers[
      random(
        0,
        allPlayers.length - 1
      )
    ];

  renderScouting();

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

  if (!container) {
    return;
  }

  if (!game.schedule.length) {

    container.innerHTML = `
      <div class="empty">
        Jadwal belum tersedia.
      </div>
    `;

    return;
  }

  const sorted =
    [...game.schedule].sort(
      (a, b) =>
        a.matchday -
        b.matchday
    );

  container.innerHTML =
    sorted.map(match => {

      const userMatch =
        match.home === game.team ||
        match.away === game.team;

      let resultClass =
        "";

      if (
        match.played &&
        userMatch
      ) {

        resultClass =
          match.winner === game.team
            ? "win"
            : "loss";
      }

      return `

        <div class="schedule-item ${
          match.played
            ? "played"
            : ""
        }">

          <div class="schedule-head">

            <span>
              Matchday ${match.matchday}
            </span>

            <span>
              ${
                match.played
                  ? "PLAYED"
                  : "UPCOMING"
              }
            </span>

          </div>


          <div class="schedule-teams">

            <strong class="${resultClass}">

              ${escapeHtml(
                getTeamDisplayName(
                  match.home
                )
              )}

              ${
                match.played
                  ? `<br><small>${match.homeScore}</small>`
                  : ""
              }

            </strong>


            <span>
              VS
            </span>


            <strong class="${resultClass}">

              ${escapeHtml(
                getTeamDisplayName(
                  match.away
                )
              )}

              ${
                match.played
                  ? `<br><small>${match.awayScore}</small>`
                  : ""
              }

            </strong>

          </div>

        </div>

      `;
    }).join("");
}


/* =========================================================
   MATCH
   ========================================================= */

function playNextMatch() {

  const match =
    getNextUserMatch();

  if (!match) {

    if (
      game.phase === "regular" &&
      !game.seasonComplete
    ) {

      finishRegularSeason();

      return;
    }

    if (
      game.phase === "playoff"
    ) {

      createNextPlayoffMatch();

      if (
        game.currentMatch
      ) {

        renderMatch();

        showScreen(
          "matchScreen"
        );

        return;
      }
    }

    alert(
      "Tidak ada pertandingan untuk dimainkan."
    );

    return;
  }

  game.currentMatch =
    match.id;

  renderMatch();

  showScreen(
    "matchScreen"
  );
}

function renderMatch() {

  const match =
    game.schedule.find(
      m =>
        m.id === game.currentMatch
    );

  if (!match) {

    alert(
      "Pertandingan tidak ditemukan."
    );

    return;
  }

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

  if (el("matchStage")) {

    el("matchStage").textContent =
      match.stage === "regular"
        ? `Regular Season • Matchday ${match.matchday}`
        : "Playoff";
  }

  if (el("matchHome")) {
    el("matchHome").textContent =
      homeName;
  }

  if (el("matchAway")) {
    el("matchAway").textContent =
      awayName;
  }

  if (el("matchHomeRating")) {
    el("matchHomeRating").textContent =
      `Rating ${homeRating}`;
  }

  if (el("matchAwayRating")) {
    el("matchAwayRating").textContent =
      `Rating ${awayRating}`;
  }

  const chemistryBonus =
    game.team === match.home ||
    game.team === match.away
      ? (
        (
          game.chemistry - 50
        ) * 0.08
      )
      : 0;

  const total =
    homeRating +
    awayRating +
    chemistryBonus;

  let homeChance =
    total > 0
      ? Math.round(
          (
            (
              homeRating +
              (
                match.home === game.team
                  ? chemistryBonus
                  : 0
              )
            ) /
            total
          ) * 100
        )
      : 50;

  homeChance =
    clamp(
      homeChance,
      15,
      85
    );

  const awayChance =
    100 - homeChance;

  if (el("homeChance")) {

    el("homeChance").textContent =
      `${homeName}: ${homeChance}%`;
  }

  if (el("awayChance")) {

    el("awayChance").textContent =
      `${awayName}: ${awayChance}%`;
  }

  renderMatchRoster();
}

function renderMatchRoster() {

  const container =
    el("matchRoster");

  if (!container) {
    return;
  }

  const players =
    getStartingFive(
      game.team
    );

  if (!players.length) {

    container.innerHTML = `
      <div class="empty">
        Tidak ada roster.
      </div>
    `;

    return;
  }

  container.innerHTML =
    players.map(player => `

      <div class="match-player">

        <span>
          ${escapeHtml(
            player.name
          )}
        </span>

        <strong>
          ${player.rating}
        </strong>

      </div>

    `).join("");
}

function simulateCurrentMatch() {

  const match =
    game.schedule.find(
      m =>
        m.id === game.currentMatch
    );

  if (!match) {

    alert(
      "Pertandingan tidak ditemukan."
    );

    return;
  }

  if (match.played) {

    alert(
      "Pertandingan sudah dimainkan."
    );

    return;
  }

  const homeRating =
    teamRating(
      match.home
    );

  const awayRating =
    teamRating(
      match.away
    );

  let homePower =
    homeRating +
    random(-5, 5);

  let awayPower =
    awayRating +
    random(-5, 5);

  if (
    match.home === game.team
  ) {

    homePower +=
      (
        game.chemistry -
        50
      ) * 0.12;

    homePower +=
      (
        game.morale -
        50
      ) * 0.08;
  }

  if (
    match.away === game.team
  ) {

    awayPower +=
      (
        game.chemistry -
        50
      ) * 0.12;

    awayPower +=
      (
        game.morale -
        50
      ) * 0.08;
  }

  const winner =
    homePower >= awayPower
      ? match.home
      : match.away;

  const score =
    generateBO3ForMatch(
      match,
      winner
    );

  match.played =
    true;

  match.winner =
    winner;

  match.homeScore =
    score.home;

  match.awayScore =
    score.away;

  updateStanding(
    match.home,
    winner === match.home,
    score.home,
    score.away
  );

  updateStanding(
    match.away,
    winner === match.away,
    score.away,
    score.home
  );

  updatePostMatchCondition(
    winner
  );

  game.lastResult = {

    matchId:
      match.id,

    home:
      match.home,

    away:
      match.away,

    winner,

    homeScore:
      score.home,

    awayScore:
      score.away
  };

  game.currentMatch =
    null;

  advanceCalendarDay(
    random(1, 3)
  );

  runAITransferMarket();

  saveGame(false);

  renderResult();

  showScreen(
    "resultScreen"
  );
}

function updatePostMatchCondition(
  winner
) {

  const team =
    getCurrentTeam();

  if (!team) {
    return;
  }

  const won =
    winner === game.team;

  if (won) {

    game.morale =
      clamp(
        game.morale + 5,
        0,
        100
      );

    game.teamForm =
      clamp(
        game.teamForm + 1,
        -5,
        5
      );

    game.reputation =
      clamp(
        game.reputation + 1,
        0,
        100
      );

    team.players.forEach(
      player => {

        player.morale =
          clamp(
            Number(
              player.morale || 70
            ) + random(1, 4),
            0,
            100
          );
      }
    );

  } else {

    game.morale =
      clamp(
        game.morale - 4,
        0,
        100
      );

    game.teamForm =
      clamp(
        game.teamForm - 1,
        -5,
        5
      );

    team.players.forEach(
      player => {

        player.morale =
          clamp(
            Number(
              player.morale || 70
            ) - random(1, 3),
            0,
            100
          );
      }
    );
  }

  updateTeamChemistry();
}

function generateBO3ForMatch(
  match,
  winner
) {

  if (!match) {

    return {
      home: 2,
      away: 1
    };
  }

  if (
    winner === match.home
  ) {

    return {

      home: 2,

      away:
        chance(55)
          ? 0
          : 1
    };
  }

  return {

    home:
      chance(55)
        ? 0
        : 1,

    away: 2
  };
}


/* =========================================================
   RESULT
   ========================================================= */

function renderResult() {

  const result =
    game.lastResult;

  if (!result) {
    return;
  }

  const homeName =
    getTeamDisplayName(
      result.home
    );

  const awayName =
    getTeamDisplayName(
      result.away
    );

  const winnerName =
    getTeamDisplayName(
      result.winner
    );

  if (el("resultTeams")) {

    el("resultTeams").innerHTML = `

      <strong>
        ${escapeHtml(homeName)}
      </strong>

      <span>
        VS
      </span>

      <strong>
        ${escapeHtml(awayName)}
      </strong>

    `;
  }

  if (el("resultScore")) {

    el("resultScore").textContent =
      `${result.homeScore} - ${result.awayScore}`;
  }

  if (el("resultWinner")) {

    el("resultWinner").textContent =
      `${winnerName} MENANG`;
  }

  if (el("resultMessage")) {

    if (
      result.winner === game.team
    ) {

      el("resultMessage").textContent =
        "🔥 Kemenangan penting! Morale dan chemistry tim meningkat.";

    } else {

      el("resultMessage").textContent =
        "❌ Kekalahan. Evaluasi tim dan bangkit di pertandingan berikutnya.";
    }
  }
}

function finishMatch() {

  renderDashboard();

  renderSchedule();

  showScreen(
    "dashboardScreen"
  );

  checkSeasonProgress();
}


/* =========================================================
   AUTO SIMULATION
   ========================================================= */

function simulateMatch(match) {

  if (
    !match ||
    match.played
  ) {
    return;
  }

  const homeRating =
    teamRating(
      match.home
    );

  const awayRating =
    teamRating(
      match.away
    );

  const homePower =
    homeRating +
    random(-8, 8);

  const awayPower =
    awayRating +
    random(-8, 8);

  const winner =
    homePower >= awayPower
      ? match.home
      : match.away;

  const score =
    generateBO3ForMatch(
      match,
      winner
    );

  match.played =
    true;

  match.winner =
    winner;

  match.homeScore =
    score.home;

  match.awayScore =
    score.away;

  updateStanding(
    match.home,
    winner === match.home,
    score.home,
    score.away
  );

  updateStanding(
    match.away,
    winner === match.away,
    score.away,
    score.home
  );
}

function simulateRemainingMatches(
  matchday
) {

  game.schedule
    .filter(match =>
      !match.played &&
      match.matchday === matchday
    )
    .forEach(match =>
      simulateMatch(match)
    );
}


/* =========================================================
   ADVANCE DAY
   ========================================================= */

function advanceDay() {

  if (!game.careerStarted) {

    alert(
      "Karier belum dimulai."
    );

    return;
  }

  if (game.seasonComplete) {

    alert(
      "Season sudah selesai."
    );

    return;
  }

  const next =
    getNextUserMatch();

  if (!next) {

    checkSeasonProgress();

    return;
  }

  advanceCalendarDay(
    random(1, 3)
  );

  const matchday =
    next.matchday;

  simulateRemainingMatches(
    matchday
  );

  runAITransferMarket();

  renderDashboard();

  renderSchedule();

  saveGame(false);

  alert(
    `Waktu berjalan.\n\n` +
    `${getDateText()}\n\n` +
    `Matchday ${matchday} siap dimainkan.`
  );
}


/* =========================================================
   SEASON PROGRESS
   ========================================================= */

function checkSeasonProgress() {

  if (
    game.phase !== "regular"
  ) {
    return;
  }

  const remaining =
    game.schedule.some(
      match =>
        !match.played
    );

  if (!remaining) {

    finishRegularSeason();
  }
}

function finishRegularSeason() {

  sortStandings();

  const playoffTeams =
    game.standings
      .slice(0, 4)
      .map(row =>
        row.teamId
      );

  if (
    playoffTeams.length < 4
  ) {

    finishSeason(
      playoffTeams[0] ||
      game.team
    );

    return;
  }

  game.phase =
    "playoff";

  createPlayoffs(
    playoffTeams
  );

  saveGame(false);

  renderDashboard();

  alert(
    "Regular Season selesai!\nTop 4 masuk Playoff."
  );
}


/* =========================================================
   PLAYOFF
   ========================================================= */

function createPlayoffs(top4) {

  game.schedule =
    game.schedule.filter(
      match =>
        match.stage !==
        "playoff"
    );

  const semi1 = {

    id:
      `playoff-semi-1-${game.year}`,

    matchday: 0,

    stage:
      "playoff",

    playoffRound:
      "semifinal",

    bracket: 1,

    home:
      top4[0],

    away:
      top4[3],

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
      `playoff-semi-2-${game.year}`,

    matchday: 0,

    stage:
      "playoff",

    playoffRound:
      "semifinal",

    bracket: 2,

    home:
      top4[1],

    away:
      top4[2],

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

  game.currentMatch =
    null;
}

function getPlayoffMatches(
  round
) {

  return game.schedule.filter(
    match =>
      match.stage === "playoff" &&
      match.playoffRound === round
  );
}

function getNextPlayoffMatch() {

  return game.schedule.find(
    match =>
      match.stage === "playoff" &&
      !match.played
  ) || null;
}

function createNextPlayoffMatch() {

  const semifinalMatches =
    getPlayoffMatches(
      "semifinal"
    );

  const unfinishedSemi =
    semifinalMatches.find(
      match =>
        !match.played
    );

  if (unfinishedSemi) {

    game.currentMatch =
      unfinishedSemi.id;

    return;
  }

  const finalExists =
    game.schedule.some(
      match =>
        match.stage === "playoff" &&
        match.playoffRound === "final"
    );

  if (!finalExists) {

    const winners =
      semifinalMatches
        .map(
          match =>
            match.winner
        )
        .filter(Boolean);

    if (
      winners.length === 2
    ) {

      const finalMatch = {

        id:
          `playoff-final-${game.year}`,

        matchday: 0,

        stage:
          "playoff",

        playoffRound:
          "final",

        home:
          winners[0],

        away:
          winners[1],

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
        finalMatch
      );

      game.currentMatch =
        finalMatch.id;
    }

    return;
  }

  const finalMatch =
    game.schedule.find(
      match =>
        match.stage === "playoff" &&
        match.playoffRound === "final" &&
        !match.played
    );

  if (finalMatch) {

    game.currentMatch =
      finalMatch.id;
  }
}

function playNextPlayoffMatch() {

  createNextPlayoffMatch();

  if (!game.currentMatch) {
    return;
  }

  renderMatch();

  showScreen(
    "matchScreen"
  );
}


/* =========================================================
   SEASON FINISH
   ========================================================= */

function getSeasonChampion() {

  const final =
    game.schedule.find(
      match =>
        match.stage === "playoff" &&
        match.playoffRound === "final" &&
        match.played
    );

  if (final) {
    return final.winner;
  }

  sortStandings();

  return (
    game.standings[0]
      ?.teamId ||
    null
  );
}

function evaluateSeasonTarget() {

  sortStandings();

  const position =
    game.standings.findIndex(
      row =>
        row.teamId === game.team
    ) + 1;

  const champion =
    getSeasonChampion();

  switch (game.target) {

    case "champion":
      return champion === game.team;

    case "top3":
      return (
        position >= 1 &&
        position <= 3
      );

    case "playoff":
      return (
        position >= 1 &&
        position <= 4
      );

    case "build":
      return true;

    default:
      return position <= 3;
  }
}

function finishSeason(
  championId
) {

  if (
    game.seasonComplete
  ) {
    return;
  }

  sortStandings();

  game.seasonComplete =
    true;

  game.phase =
    "offseason";

  const position =
    game.standings.findIndex(
      row =>
        row.teamId === game.team
    ) + 1;

  const targetSuccess =
    evaluateSeasonTarget();

  let reward =
    50000;

  if (
    position === 1
  ) {

    reward +=
      200000;

  } else if (
    position === 2
  ) {

    reward +=
      125000;

  } else if (
    position === 3
  ) {

    reward +=
      75000;

  } else if (
    position <= 4
  ) {

    reward +=
      40000;
  }

  if (
    targetSuccess
  ) {

    reward +=
      75000;

    game.reputation +=
      8;

  } else {

    game.reputation -=
      3;
  }

  const sponsorBonus =
    Number(
      game.sponsor?.seasonBonus ||
      0
    );

  reward +=
    sponsorBonus;

  game.budget +=
    reward;

  game.reputation =
    clamp(
      game.reputation,
      0,
      100
    );

  const championName =
    championId
      ? getTeamDisplayName(
          championId
        )
      : "-";

  game.history.push({

    year:
      game.year,

    type:
      "season",

    league:
      getCurrentLeagueName(),

    team:
      getCurrentTeamName(),

    position,

    champion:
      championName,

    target:
      getTargetName(
        game.target
      ),

    targetSuccess,

    reward
  });

  developPlayers();

  processContracts();

  updateWorldRanking();

  qualifyForWorldEvents();

  addNews(
    "season",
    "Season selesai",
    `Tim finis di posisi #${position}. Champion: ${championName}.`
  );

  saveGame(false);

  renderDashboard();

  alert(

    `SEASON ${game.year} SELESAI!\n\n` +

    `Posisi: #${position}\n` +

    `Champion: ${championName}\n` +

    `Target: ${
      targetSuccess
        ? "BERHASIL"
        : "GAGAL"
    }\n` +

    `Reward: ${money(reward)}`
  );
}


/* =========================================================
   SALARY
   ========================================================= */

function calculateSeasonSalary() {

  const players =
    getCurrentTeam()?.players ||
    [];

  return players.reduce(
    (
      total,
      player
    ) =>
      total +
      Number(
        player.salary || 0
      ),
    0
  );
}

function processSeasonSalaries() {

  const salary =
    calculateSeasonSalary();

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

function developPlayers() {

  const players =
    getCurrentTeam()?.players ||
    [];

  players.forEach(
    player => {

      const age =
        Number(
          player.age || 22
        );

      const rating =
        Number(
          player.rating || 70
        );

      const potential =
        Number(
          player.potential ||
          rating
        );

      const morale =
        Number(
          player.morale || 70
        );

      let change = 0;

      if (
        age <= 20
      ) {

        change =
          random(-1, 3);

      } else if (
        age <= 23
      ) {

        change =
          random(-1, 2);

      } else if (
        age <= 26
      ) {

        change =
          random(-1, 1);

      } else if (
        age <= 29
      ) {

        change =
          random(-2, 1);

      } else {

        change =
          random(-3, 0);
      }

      if (
        rating < potential &&
        age <= 25 &&
        chance(60)
      ) {

        change++;
      }

      if (
        morale >= 85 &&
        chance(50)
      ) {

        change++;
      }

      if (
        morale <= 40 &&
        chance(50)
      ) {

        change--;
      }

      player.rating =
        clamp(
          rating + change,
          50,
          99
        );

      if (
        player.age != null
      ) {

        player.age =
          Number(
            player.age
          ) + 1;
      }

      player.morale =
        clamp(
          morale +
          random(-5, 5),
          30,
          100
        );
    }
  );

  updateTeamChemistry();
}


/* =========================================================
   CONTRACT PROCESS
   ========================================================= */

function processContracts() {

  const team =
    getCurrentTeam();

  if (!team) {
    return;
  }

  team.players =
    team.players.filter(
      player => {

        let years =
          Number(
            player.contractYears ||
            0
          );

        years--;

        player.contractYears =
          years;

        if (
          years > 0
        ) {
          return true;
        }

        const morale =
          Number(
            player.morale || 70
          );

        const leaveChance =
          morale < 50
            ? 0.8
            : 0.45;

        if (
          Math.random() <
          leaveChance
        ) {

          game.history.push({

            year:
              game.year,

            type:
              "contract",

            player:
              player.name,

            message:
              `${player.name} meninggalkan tim setelah kontraknya habis.`
          });

          addNews(
            "contract",
            "Pemain meninggalkan tim",
            `${player.name} pergi setelah kontraknya berakhir.`
          );

          return false;
        }

        player.contractYears =
          1;

        game.requests.push({

          type:
            "contract",

          playerId:
            player.id,

          playerName:
            player.name
        });

        return true;
      }
    );

  updateTeamChemistry();
}


/* =========================================================
   REQUESTS
   ========================================================= */

function processRequests() {

  if (
    !game.requests.length
  ) {
    return;
  }

  const request =
    game.requests[0];

  const player =
    getCurrentTeam()
      ?.players
      ?.find(
        p =>
          p.id ===
          request.playerId
      );

  if (!player) {

    game.requests.shift();

    return;
  }

  const salary =
    Number(
      player.salary || 0
    );

  const raise =
    Math.round(
      salary * 0.2
    );

  const cost =
    Math.max(
      10000,
      raise
    );

  const accept =
    confirm(

      `${player.name} meminta kenaikan kontrak.\n\n` +

      `Biaya tambahan: ${money(cost)}\n\n` +

      `Terima?`
    );

  if (
    accept &&
    game.budget >= cost
  ) {

    game.budget -=
      cost;

    player.salary =
      salary + cost;

    player.contractYears =
      2;

    player.morale =
      clamp(
        Number(
          player.morale || 70
        ) + 15,
        0,
        100
      );

    addNews(
      "contract",
      "Negosiasi berhasil",
      `${player.name} mendapatkan kontrak baru.`
    );

  } else if (
    !accept
  ) {

    player.morale =
      clamp(
        Number(
          player.morale || 70
        ) - 20,
        0,
        100
      );

    addNews(
      "contract",
      "Negosiasi gagal",
      `${player.name} kecewa dengan keputusan manajemen.`
    );

  } else {

    alert(
      "Budget tidak cukup."
    );
  }

  game.requests.shift();

  updateTeamChemistry();

  saveGame(false);
}


/* =========================================================
   ORGANIZATION
   ========================================================= */

function upgradeOrganization() {

  const current =
    Number(
      game.organizationLevel ||
      1
    );

  if (
    current >= 5
  ) {

    alert(
      "Organization sudah maksimal."
    );

    return;
  }

  const cost =
    current *
    100000;

  if (
    game.budget < cost
  ) {

    alert(
      `Budget tidak cukup.\nButuh ${money(cost)}.`
    );

    return;
  }

  game.budget -=
    cost;

  game.organizationLevel =
    current + 1;

  game.reputation =
    clamp(
      game.reputation + 3,
      0,
      100
    );

  game.sponsor.monthlyIncome +=
    15000;

  game.sponsor.seasonBonus +=
    25000;

  addNews(
    "organization",
    "Organisasi berkembang",
    `Organization naik ke Level ${game.organizationLevel}.`
  );

  saveGame(false);

  renderDashboard();

  alert(
    `Organization naik ke Level ${game.organizationLevel}!`
  );
}


/* =========================================================
   AI TRANSFER
   ========================================================= */

function runAITransferMarket() {

  if (
    !chance(30)
  ) {
    return;
  }

  const leagues =
    getAllLeagues();

  if (
    !leagues.length
  ) {
    return;
  }

  const candidates = [];

  leagues.forEach(
    league => {

      league.teams.forEach(
        team => {

          if (
            team.id === game.team
          ) {
            return;
          }

          team.players.forEach(
            player => {

              if (
                Number(
                  player.rating || 0
                ) >= 80 &&
                chance(20)
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
    }
  );

  if (
    !candidates.length
  ) {
    return;
  }

  const move =
    candidates[
      random(
        0,
        candidates.length - 1
      )
    ];

  const destinations =
    leagues
      .flatMap(
        league =>
          league.teams
            .filter(
              team =>
                team.id !==
                move.team.id &&
                team.id !==
                game.team
            )
      );

  if (
    !destinations.length
  ) {
    return;
  }

  const destination =
    destinations[
      random(
        0,
        destinations.length - 1
      )
    ];

  const playerIndex =
    move.team.players.findIndex(
      p =>
        p.id ===
        move.player.id
    );

  if (
    playerIndex < 0
  ) {
    return;
  }

  const player =
    move.team.players[
      playerIndex
    ];

  if (
    destination.players.length >= 8
  ) {
    return;
  }

  move.team.players.splice(
    playerIndex,
    1
  );

  destination.players.push(
    deepClone(player)
  );

  game.aiTransfersThisSeason++;

  game.aiTransferLog =
    game.aiTransferLog || [];

  game.aiTransferLog.push({

    date:
      getDateText(),

    player:
      player.name,

    from:
      move.team.name,

    to:
      destination.name
  });

  addNews(
    "transfer",
    "AI TRANSFER",
    `${player.name} pindah dari ${move.team.name} ke ${destination.name}.`
  );
}


/* =========================================================
   WORLD STATE
   ========================================================= */

function createWorldState() {

  return {

    ranking:
      createInitialWorldRanking(),

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

function createInitialWorldRanking() {

  const ranking = [];

  getAllLeagues()
    .forEach(league => {

      league.teams
        .forEach(team => {

          ranking.push({

            teamId:
              team.id,

            name:
              team.name,

            region:
              league.region,

            rating:
              teamRating(
                team.id
              )
          });
        });
    });

  ranking.sort(
    (a, b) =>
      b.rating -
      a.rating
  );

  return ranking;
}

function updateWorldRanking() {

  if (!game.world) {

    game.world =
      createWorldState();
  }

  const ranking =
    game.world.ranking || [];

  const updated = [];

  getAllLeagues()
    .forEach(league => {

      league.teams
        .forEach(team => {

          const old =
            ranking.find(
              row =>
                row.teamId ===
                team.id
            );

          let rating =
            teamRating(
              team.id
            );

          if (old) {

            rating =
              Math.round(
                (
                  old.rating *
                  0.5
                ) +
                (
                  rating *
                  0.5
                )
              );
          }

          if (
            team.id ===
            game.team
          ) {

            const standing =
              getStanding(
                team.id
              );

            if (standing) {

              rating +=
                standing.wins * 2;

              rating -=
                standing.losses;
            }
          }

          updated.push({

            teamId:
              team.id,

            name:
              team.name,

            region:
              league.region,

            rating:
              clamp(
                rating,
                50,
                99
              )
          });
        });
    });

  updated.sort(
    (a, b) =>
      b.rating -
      a.rating
  );

  game.world.ranking =
    updated;
}


/* =========================================================
   WORLD
   ========================================================= */

function openWorld() {

  if (!game.world) {

    game.world =
      createWorldState();
  }

  updateWorldRanking();

  renderWorld();

  showScreen(
    "worldScreen"
  );
}

function renderWorld() {

  renderWorldRanking();

  renderMSCStatus();

  renderMSeriesStatus();

  renderInternationalTransfer();
}

function renderWorldRanking() {

  const container =
    el("worldRanking");

  if (!container) {
    return;
  }

  const ranking =
    game.world?.ranking || [];

  if (!ranking.length) {

    container.innerHTML = `
      <div class="empty">
        Ranking belum tersedia.
      </div>
    `;

    return;
  }

  container.innerHTML =
    ranking
      .slice(0, 20)
      .map(
        (row, index) => `

          <div class="world-row">

            <div class="rank">
              #${index + 1}
            </div>

            <div class="world-team">

              <strong>
                ${escapeHtml(
                  row.name
                )}
              </strong>

              <span>
                ${escapeHtml(
                  row.region || "-"
                )}
              </span>

            </div>

            <div class="world-rating">
              ${Math.round(
                row.rating
              )}
            </div>

          </div>

        `
      )
      .join("");
}


/* =========================================================
   MSC
   ========================================================= */

function qualifyForWorldEvents() {

  if (!game.world) {

    game.world =
      createWorldState();
  }

  sortStandings();

  const position =
    game.standings.findIndex(
      row =>
        row.teamId === game.team
    ) + 1;

  game.world.msc.qualified =
    position > 0 &&
    position <= 3;
}

function getMSCTeams() {

  const teams = [];

  sortStandings();

  const local =
    game.standings
      .slice(0, 3)
      .map(
        row =>
          row.teamId
      );

  local.forEach(
    teamId => {

      teams.push({

        teamId,

        name:
          getTeamDisplayName(
            teamId
          ),

        region:
          getTeamSource(
            teamId
          )?.league?.region
      });
    }
  );

  const world =
    game.world?.ranking || [];

  world.forEach(
    row => {

      if (
        teams.some(
          team =>
            team.teamId ===
            row.teamId
        )
      ) {
        return;
      }

      if (
        teams.length >= 8
      ) {
        return;
      }

      teams.push({

        teamId:
          row.teamId,

        name:
          row.name,

        region:
          row.region
      });
    }
  );

  return teams.slice(
    0,
    8
  );
}

function renderMSCStatus() {

  const container =
    el("mscStatus");

  if (!container) {
    return;
  }

  const msc =
    game.world?.msc;

  if (!msc) {

    container.innerHTML = `
      <div class="empty">
        MSC belum tersedia.
      </div>
    `;

    return;
  }

  if (!msc.qualified) {

    container.innerHTML = `
      <div class="warning">
        Tim lu belum lolos MSC.
      </div>
    `;

    return;
  }

  if (msc.completed) {

    container.innerHTML = `

      <div class="success">
        MSC selesai.
      </div>

      <div class="player-meta">

        <span class="badge">
          Champion:
          ${escapeHtml(
            msc.champion || "-"
          )}
        </span>

      </div>
    `;

    return;
  }

  container.innerHTML = `

    <div class="success">
      Tim lu lolos MSC!
    </div>

    <div class="player-meta">

      <span class="badge">
        8 Teams
      </span>

      <span class="badge">
        International
      </span>

    </div>

  `;
}

function openMSC() {

  const msc =
    game.world?.msc;

  if (
    !msc?.qualified
  ) {

    alert(
      "Tim lu belum lolos MSC."
    );

    return;
  }

  if (
    msc.completed
  ) {

    alert(
      "MSC sudah selesai."
    );

    return;
  }

  if (
    !msc.teams.length
  ) {

    msc.teams =
      getMSCTeams();

    msc.matches =
      createTournamentBracket(
        msc.teams,
        "msc"
      );
  }

  renderTournament(
    "MSC",
    msc
  );

  showScreen(
    "tournamentScreen"
  );
}


/* =========================================================
   M-SERIES
   ========================================================= */

function renderMSeriesStatus() {

  const container =
    el("mSeriesStatus");

  if (!container) {
    return;
  }

  const ms =
    game.world?.mSeries;

  if (!ms) {

    container.innerHTML = `
      <div class="empty">
        M-Series belum tersedia.
      </div>
    `;

    return;
  }

  if (
    !game.world.msc.completed
  ) {

    container.innerHTML = `
      <div class="warning">
        M-Series terbuka setelah MSC selesai.
      </div>
    `;

    return;
  }

  if (
    ms.completed
  ) {

    container.innerHTML = `

      <div class="success">
        M-Series selesai.
      </div>

      <div class="player-meta">

        <span class="badge">
          Champion:
          ${escapeHtml(
            ms.champion || "-"
          )}
        </span>

      </div>

    `;

    return;
  }

  if (
    ms.qualified
  ) {

    container.innerHTML = `
      <div class="success">
        M-Series tersedia!
      </div>
    `;

  } else {

    container.innerHTML = `
      <div class="warning">
        Belum memenuhi syarat.
      </div>
    `;
  }
}

function prepareMSeries() {

  const ms =
    game.world.mSeries;

  const ranking =
    game.world.ranking || [];

  const teams = [];

  if (
    game.world.msc.championId
  ) {

    const championId =
      game.world.msc.championId;

    teams.push({

      teamId:
        championId,

      name:
        getTeamDisplayName(
          championId
        ),

      region:
        getTeamSource(
          championId
        )?.league?.region
    });
  }

  ranking.forEach(
    row => {

      if (
        teams.some(
          team =>
            team.teamId ===
            row.teamId
        )
      ) {
        return;
      }

      if (
        teams.length >= 8
      ) {
        return;
      }

      teams.push({

        teamId:
          row.teamId,

        name:
          row.name,

        region:
          row.region
      });
    }
  );

  ms.teams =
    teams.slice(
      0,
      8
    );

  ms.matches =
    createTournamentBracket(
      ms.teams,
      "mseries"
    );

  ms.round =
    1;
}

function openMSeries() {

  const ms =
    game.world?.mSeries;

  if (
    !game.world?.msc?.completed
  ) {

    alert(
      "MSC harus selesai terlebih dahulu."
    );

    return;
  }

  if (
    ms.completed
  ) {

    alert(
      "M-Series sudah selesai."
    );

    return;
  }

  if (
    !ms.teams.length
  ) {

    prepareMSeries();
  }

  renderTournament(
    "M-SERIES",
    ms
  );

  showScreen(
    "tournamentScreen"
  );
}


/* =========================================================
   TOURNAMENT
   ========================================================= */

function createTournamentBracket(
  teams,
  tournamentId
) {

  const matches = [];

  for (
    let i = 0;
    i < teams.length;
    i += 2
  ) {

    const home =
      teams[i];

    const away =
      teams[i + 1];

    if (
      !home ||
      !away
    ) {
      continue;
    }

    matches.push({

      id:
        `${tournamentId}-round1-${i / 2 + 1}-${game.year}`,

      tournament:
        tournamentId,

      round:
        1,

      home:
        home.teamId,

      away:
        away.teamId,

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

function getTournamentState(
  name
) {

  if (
    name.toLowerCase() ===
    "msc"
  ) {

    return game.world.msc;
  }

  return game.world.mSeries;
}

function renderTournament(
  title,
  state
) {

  if (
    el("tournamentTitle")
  ) {

    el(
      "tournamentTitle"
    ).textContent =
      `🏆 ${title}`;
  }

  if (
    el("tournamentSubtitle")
  ) {

    el(
      "tournamentSubtitle"
    ).textContent =
      "Kompetisi internasional.";
  }

  const container =
    el("tournamentContent");

  if (!container) {
    return;
  }

  if (
    !state.matches.length
  ) {

    container.innerHTML = `
      <div class="card empty">
        Belum ada pertandingan.
      </div>
    `;

    return;
  }

  container.innerHTML =
    state.matches
      .map(match => `

        <div class="tournament-match">

          <h4>
            Round ${match.round}
          </h4>

          <div class="tournament-teams">

            <span>
              ${escapeHtml(
                getTeamDisplayName(
                  match.home
                )
              )}
            </span>

            <strong>
              ${
                match.played
                  ? `${match.homeScore} - ${match.awayScore}`
                  : "VS"
              }
            </strong>

            <span>
              ${escapeHtml(
                getTeamDisplayName(
                  match.away
                )
              )}
            </span>

          </div>

          ${
            !match.played &&
            (
              match.home === game.team ||
              match.away === game.team
            )
              ? `
                <button
                  class="small-btn buy"
                  onclick="playWorldMatch('${match.id}')"
                >
                  PLAY MATCH
                </button>
              `
              : ""
          }

        </div>

      `)
      .join("");

  const pendingUserMatch =
    state.matches.find(
      match =>
        !match.played &&
        (
          match.home === game.team ||
          match.away === game.team
        )
    );

  if (!pendingUserMatch) {

    const pending =
      state.matches.find(
        match =>
          !match.played
      );

    if (pending) {

      const button =
        document.createElement(
          "button"
        );

      button.className =
        "primary";

      button.textContent =
        "SIMULATE NEXT ROUND";

      button.onclick =
        () =>
          simulateWorldRound(
            title
          );

      container.appendChild(
        button
      );
    }
  }
}

function playWorldMatch(
  matchId
) {

  let state =
    null;

  let title =
    "";

  if (
    game.world.msc.matches
      .some(
        match =>
          match.id ===
          matchId
      )
  ) {

    state =
      game.world.msc;

    title =
      "MSC";

  } else {

    state =
      game.world.mSeries;

    title =
      "M-SERIES";
  }

  const match =
    state.matches.find(
      m =>
        m.id ===
        matchId
    );

  if (!match) {

    alert(
      "Match tidak ditemukan."
    );

    return;
  }

  if (
    match.played
  ) {

    alert(
      "Match sudah dimainkan."
    );

    return;
  }

  const winner =
    determineTournamentWinner(
      match
    );

  const score =
    generateBO3ForMatch(
      match,
      winner
    );

  match.played =
    true;

  match.winner =
    winner;

  match.homeScore =
    score.home;

  match.awayScore =
    score.away;

  saveGame(false);

  advanceTournamentIfReady(
    state,
    title
  );
}

function determineTournamentWinner(
  match
) {

  const homeRating =
    teamRating(
      match.home
    );

  const awayRating =
    teamRating(
      match.away
    );

  const homePower =
    homeRating +
    random(-8, 8);

  const awayPower =
    awayRating +
    random(-8, 8);

  return homePower >=
    awayPower
    ? match.home
    : match.away;
}

function simulateWorldRound(
  title
) {

  const state =
    getTournamentState(
      title
    );

  state.matches
    .filter(
      match =>
        !match.played
    )
    .forEach(
      match => {

        const winner =
          determineTournamentWinner(
            match
          );

        const score =
          generateBO3ForMatch(
            match,
            winner
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

  advanceTournamentIfReady(
    state,
    title
  );
}

function advanceTournamentIfReady(
  state,
  title
) {

  const unfinished =
    state.matches.some(
      match =>
        !match.played
    );

  if (unfinished) {

    renderTournament(
      title,
      state
    );

    saveGame(false);

    return;
  }

  const winners =
    state.matches
      .map(
        match =>
          match.winner
      )
      .filter(Boolean);

  if (
    winners.length === 1
  ) {

    completeTournament(
      state,
      title,
      winners[0]
    );

    return;
  }

  const nextRound =
    state.round + 1;

  state.round =
    nextRound;

  const nextMatches = [];

  for (
    let i = 0;
    i < winners.length;
    i += 2
  ) {

    if (
      !winners[i] ||
      !winners[i + 1]
    ) {
      continue;
    }

    nextMatches.push({

      id:
        `${title.toLowerCase()}-round${nextRound}-${i / 2 + 1}-${game.year}`,

      tournament:
        title.toLowerCase(),

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

  state.matches =
    nextMatches;

  renderTournament(
    title,
    state
  );

  saveGame(false);
}

function completeTournament(
  state,
  title,
  championId
) {

  const championName =
    getTeamDisplayName(
      championId
    );

  state.completed =
    true;

  state.champion =
    championName;

  state.championId =
    championId;

  game.history.push({

    year:
      game.year,

    type:
      "international",

    tournament:
      title,

    champion:
      championName
  });

  if (
    title.toLowerCase() ===
    "msc"
  ) {

    game.world.msc =
      state;

    game.world.mSeries.qualified =
      true;

  } else {

    game.world.mSeries =
      state;
  }

  addNews(
    "international",
    `${title} selesai`,
    `${championName} menjadi juara ${title}.`
  );

  saveGame(false);

  renderWorld();

  showScreen(
    "worldScreen"
  );

  alert(
    `${title} selesai!\n\nChampion: ${championName}`
  );
}


/* =========================================================
   INTERNATIONAL TRANSFER
   ========================================================= */

function renderInternationalTransfer() {

  const container =
    el("internationalTransfer");

  if (!container) {
    return;
  }

  const ranking =
    game.world?.ranking || [];

  const international =
    ranking.filter(
      row =>
        row.region &&
        row.region !==
        (
          getCurrentLeague()
            ?.region ||
          ""
        )
    )
    .slice(
      0,
      8
    );

  if (
    !international.length
  ) {

    container.innerHTML = `
      <div class="empty">
        Belum ada pemain internasional.
      </div>
    `;

    return;
  }

  container.innerHTML = `

    <div class="empty">

      Transfer internasional tersedia
      melalui scouting dan market.

    </div>

  `;
}


/* =========================================================
   HISTORY
   ========================================================= */

function openHistory() {

  renderHistory();

  showScreen(
    "historyScreen"
  );
}

function renderHistory() {

  const container =
    el("historyList");

  if (!container) {
    return;
  }

  const history =
    game.history || [];

  if (!history.length) {

    container.innerHTML = `
      <div class="card empty">
        Belum ada riwayat karier.
      </div>
    `;

    return;
  }

  container.innerHTML =
    [...history]
      .reverse()
      .map(item => {

        if (
          item.type ===
          "season"
        ) {

          return `

            <div class="history-card">

              <h3>
                🏆 Season ${item.year}
              </h3>

              <p>
                ${escapeHtml(
                  item.league ||
                  "-"
                )}
              </p>

              <div class="player-meta">

                <span class="badge">
                  Position #
                  ${item.position || "-"}
                </span>

                <span class="badge">
                  Champion:
                  ${escapeHtml(
                    item.champion ||
                    "-"
                  )}
                </span>

                <span class="badge">
                  Target:
                  ${escapeHtml(
                    item.target ||
                    "-"
                  )}
                </span>

              </div>

              <p class="${
                item.targetSuccess
                  ? "success"
                  : "danger-text"
              }">

                ${
                  item.targetSuccess
                    ? "Target berhasil"
                    : "Target gagal"
                }

              </p>

            </div>

          `;
        }

        if (
          item.type ===
          "international"
        ) {

          return `

            <div class="history-card">

              <h3>
                🌎 ${escapeHtml(
                  item.tournament
                )}
              </h3>

              <p>
                Champion:
                <strong>
                  ${escapeHtml(
                    item.champion
                  )}
                </strong>
              </p>

              <small>
                Season ${item.year}
              </small>

            </div>

          `;
        }

        return `

          <div class="history-card">

            <p>
              ${escapeHtml(
                item.message ||
                ""
              )}
            </p>

          </div>

        `;
      })
      .join("");
}


/* =========================================================
   SAVE / LOAD
   ========================================================= */

function saveGame(
  showMessage = true
) {

  try {

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );

    if (
      showMessage
    ) {

      alert(
        "Game berhasil disimpan."
      );
    }

  } catch (error) {

    console.error(
      "Gagal menyimpan game:",
      error
    );

    if (
      showMessage
    ) {

      alert(
        "Gagal menyimpan game."
      );
    }
  }
}

function loadGame() {

  try {

    let saved =
      localStorage.getItem(
        SAVE_KEY
      );

    /*
      FALLBACK V0.9
    */

    if (!saved) {

      saved =
        localStorage.getItem(
          "mlbb_pro_manager_save_v09"
        );
    }

    if (!saved) {
      return false;
    }

    const parsed =
      JSON.parse(saved);

    game = {

      ...deepClone(
        DEFAULT_GAME
      ),

      ...parsed
    };

    /*
      MIGRATION V0.9
    */

    game.version =
      10;

    game.date =
      parsed.date || {
        month: 1,
        day: 1
      };

    game.totalDays =
      Number(
        parsed.totalDays || 0
      );

    game.sponsor =
      parsed.sponsor || {

        name:
          "Regional Gaming Partner",

        monthlyIncome:
          75000,

        seasonBonus:
          100000
      };

    game.chemistry =
      Number(
        parsed.chemistry || 70
      );

    game.morale =
      Number(
        parsed.morale || 70
      );

    game.teamForm =
      Number(
        parsed.teamForm || 0
      );

    game.news =
      parsed.news || [];

    game.eventHistory =
      parsed.eventHistory || [];

    game.aiTransferLog =
      parsed.aiTransferLog || [];

    game.aiTransfersThisSeason =
      Number(
        parsed.aiTransfersThisSeason || 0
      );

    game.world = {

      ...deepClone(
        DEFAULT_GAME.world
      ),

      ...(parsed.world || {})
    };

    game.world.msc = {

      ...deepClone(
        DEFAULT_GAME.world.msc
      ),

      ...(parsed.world?.msc || {})
    };

    game.world.mSeries = {

      ...deepClone(
        DEFAULT_GAME.world.mSeries
      ),

      ...(parsed.world?.mSeries || {})
    };

    if (
      game.currentTeamData
    ) {

      prepareTeamPlayers(
        game.currentTeamData
      );
    }

    return true;

  } catch (error) {

    console.error(
      "Load game error:",
      error
    );

    localStorage.removeItem(
      SAVE_KEY
    );

    return false;
  }
}


/* =========================================================
   RESTART
   ========================================================= */

function restartGame() {

  const confirmed =
    confirm(

      "Yakin mau restart career?\n\n" +
      "Semua progress career ini akan dihapus."
    );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(
    SAVE_KEY
  );

  localStorage.removeItem(
    "mlbb_pro_manager_save_v09"
  );

  game =
    deepClone(
      DEFAULT_GAME
    );

  selectedTarget =
    "top3";

  const input =
    el("managerName");

  if (input) {
    input.value = "";
  }

  document.querySelectorAll(
    ".target-btn"
  ).forEach(btn => {

    btn.classList.remove(
      "selected"
    );
  });

  const defaultTarget =
    el("target-top3");

  if (defaultTarget) {

    defaultTarget.classList.add(
      "selected"
    );
  }

  renderCountries();

  showScreen(
    "countryScreen"
  );
}


/* =========================================================
   CONTINUE
   ========================================================= */

function continueGame() {

  if (
    !game.careerStarted
  ) {

    showScreen(
      "countryScreen"
    );

    return;
  }

  renderDashboard();

  showScreen(
    "dashboardScreen"
  );
}


/* =========================================================
   DEBUG / SAFETY
   ========================================================= */

window.addEventListener(
  "error",
  function(event) {

    console.error(
      "GAME ERROR:",
      event.error ||
      event.message
    );
  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function init() {

  console.log(
    "=== MLBB PRO MANAGER V1.0 ==="
  );

  const loaded =
    loadGame();

  if (
    loaded &&
    game.careerStarted
  ) {

    console.log(
      "Save ditemukan."
    );

    renderDashboard();

    showScreen(
      "dashboardScreen"
    );

  } else {

    console.log(
      "Tidak ada save. Memulai dari awal."
    );

    game =
      deepClone(
        DEFAULT_GAME
      );

    renderCountries();

    showScreen(
      "countryScreen"
    );
  }
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);
