/* =========================================================
   MLBB PRO MANAGER
   VERSION 1.3
   PART 1 / 2
   ========================================================= */

const SAVE_KEY = "mlbb_pro_manager_save_v13";
const OLD_SAVE_KEYS = [
  "mlbb_pro_manager_save_v12",
  "mlbb_pro_manager_save_v11",
  "mlbb_pro_manager_save_v10"
];

let game = null;
let selectedTarget = "top3";

/* =========================================================
   BASIC HELPERS
   ========================================================= */

function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).slice(2, 10);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(percent) {
  return Math.random() * 100 < percent;
}

function money(value) {
  return "Rp " + Math.round(value || 0).toLocaleString("id-ID");
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function yearOf(date) {
  return new Date(date).getFullYear();
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function addDays(dateString, days) {
  const d = new Date(dateString);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function addMonths(dateString, months) {
  const d = new Date(dateString);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function monthOf(dateString) {
  return new Date(dateString).getMonth() + 1;
}

function getPhase() {
  if (!game) return "Preseason";

  if (game.phase === "regular") return "Regular Season";
  if (game.phase === "playoff") return "Playoffs";
  if (game.phase === "final") return "Grand Final";
  return "Preseason";
}

/* =========================================================
   DATA ACCESS
   ========================================================= */

function allLeagues() {
  return [
    typeof MPL_ID_2026 !== "undefined" ? MPL_ID_2026 : null,
    typeof MPL_PH_2026 !== "undefined" ? MPL_PH_2026 : null,
    typeof MPL_KH_2026 !== "undefined" ? MPL_KH_2026 : null
  ].filter(Boolean);
}

function getLeague(id) {
  return allLeagues().find(l => l.id === id);
}

function getTeamData(teamId, leagueId) {
  const league = getLeague(leagueId);
  if (!league) return null;

  return league.teams.find(t => t.id === teamId) || null;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function normalizePlayer(player, teamId) {
  const p = player || {};

  return {
    id: p.id || uid("player"),
    name: p.name || "Unknown Player",
    role: p.role || "FLEX",
    nationality: p.nationality || "ID",
    age: Number(p.age || 18),
    rating: Number(p.rating || 70),
    potential: Number(p.potential || p.rating || 75),
    salary: Number(p.salary || 5000000),

    form: Number(p.form ?? 70),
    morale: Number(p.morale ?? 75),
    fitness: Number(p.fitness ?? 100),
    fatigue: Number(p.fatigue ?? 0),

    matchesPlayed: Number(p.matchesPlayed || 0),
    wins: Number(p.wins || 0),
    losses: Number(p.losses || 0),

    mvp: Number(p.mvp || 0),
    gameWins: Number(p.gameWins || 0),
    gameLosses: Number(p.gameLosses || 0),

    kills: Number(p.kills || 0),
    deaths: Number(p.deaths || 0),
    assists: Number(p.assists || 0),

    injured: Boolean(p.injured),
    injuryUntil: p.injuryUntil || null,

    contractUntil:
      p.contractUntil ||
      `${game ? game.year : 2026}-12-31`,

    marketValue:
      Number(p.marketValue) ||
      Math.round(Number(p.rating || 70) * 1000000),

    contractDemand:
      Number(p.contractDemand) ||
      Number(p.salary || 5000000),

    status: p.status || "active",
    formerTeam: p.formerTeam || null,
    teamId: teamId || p.teamId || null
  };
}

function normalizeTeam(team, leagueId) {
  const t = team || {};

  const roster = (t.players || []).map(p =>
    normalizePlayer(p, t.id)
  );

  return {
    id: t.id,
    name: t.name,

    leagueId,

    players: roster,

    startingFive:
      Array.isArray(t.startingFive)
        ? t.startingFive
        : roster.slice(0, 5).map(p => p.id),

    budget:
      Number(t.budget) ||
      rand(250, 700) * 1000000,

    chemistry:
      Number(t.chemistry ?? 70),

    manager:
      t.manager || {
        name: pick([
          "Raven",
          "Kairo",
          "Nova",
          "Axel",
          "Vega",
          "Rex",
          "Dante",
          "Argo"
        ]),
        style: pick([
          "aggressive",
          "balanced",
          "strategic",
          "defensive"
        ]),
        ambition: rand(55, 95),
        transferAggression: rand(40, 90)
      },

    standings: {
      played: Number(t.standings?.played || 0),
      wins: Number(t.standings?.wins || 0),
      losses: Number(t.standings?.losses || 0),
      gameWins: Number(t.standings?.gameWins || 0),
      gameLosses: Number(t.standings?.gameLosses || 0),
      points: Number(t.standings?.points || 0)
    },

    seasonStats: t.seasonStats || {
      wins: 0,
      losses: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      mvp: 0
    },

    contractsProcessed: Boolean(t.contractsProcessed)
  };
}

/* =========================================================
   GAME DEFAULT
   ========================================================= */

function createDefaultGame() {
  return {
    version: 13,

    managerName: "",
    year: 2026,
    date: "2026-01-05",

    phase: "regular",

    selectedCountry: null,
    selectedLeague: null,
    selectedTeam: null,

    target: "top3",

    budget: 500000000,
    reputation: 50,
    organizationLevel: 1,

    chemistry: 70,

    team: null,

    teams: [],

    schedule: [],
    currentMatch: null,

    freeAgents: [],

    transferOffers: [],

    inbox: [],

    news: [],

    history: [],

    awards: [],

    seasonStats: {
      matches: 0,
      wins: 0,
      losses: 0,
      playerStats: {},
      teamStats: {}
    },

    rivals: {},

    worldRanking: [],

    aiManagers: [],

    msc: {
      status: "Not Qualified"
    },

    mSeries: {
      status: "Not Qualified"
    },

    sponsor: {
      name: "Local Sponsor",
      monthlyIncome: 25000000,
      bonus: 0
    },

    settings: {
      sound: true
    }
  };
}

/* =========================================================
   TEAM INITIALIZATION
   ========================================================= */

function buildLeagueTeams(league) {
  if (!league) return [];

  return league.teams.map(raw =>
    normalizeTeam(clone(raw), league.id)
  );
}

function initializeAIManagers() {
  game.aiManagers = game.teams.map(team => ({
    teamId: team.id,
    name: team.manager?.name || "AI Manager",
    style: team.manager?.style || "balanced",
    ambition: team.manager?.ambition || rand(60, 90),
    transferAggression:
      team.manager?.transferAggression || rand(40, 85)
  }));
}

function initializeTeamBudgets() {
  game.teams.forEach(team => {
    if (!team.budget || team.budget < 1000000) {
      team.budget = rand(250, 700) * 1000000;
    }
  });

  if (game.team) {
    const realTeam = game.teams.find(
      t => t.id === game.team.id
    );

    if (realTeam) {
      game.budget = realTeam.budget;
    }
  }
}

/* =========================================================
   FREE AGENTS
   ========================================================= */

function initializeFreeAgents() {
  if (!Array.isArray(game.freeAgents)) {
    game.freeAgents = [];
  }

  if (game.freeAgents.length >= 8) return;

  const pool = [];

  game.teams.forEach(team => {
    team.players.forEach(player => {
      if (player.status === "free_agent") {
        pool.push(player);
      }
    });
  });

  game.freeAgents.push(...pool);

  while (game.freeAgents.length < 8) {
    const role = pick([
      "EXP",
      "JUNGLE",
      "MID",
      "GOLD",
      "ROAM"
    ]);

    game.freeAgents.push(
      normalizePlayer({
        id: uid("fa"),
        name: pick([
          "Raptor",
          "Miko",
          "Zane",
          "Frost",
          "Keen",
          "Nero",
          "Blaze",
          "Echo",
          "Ryu",
          "Kai"
        ]),
        role,
        nationality: pick(["ID", "PH", "KH"]),
        age: rand(17, 24),
        rating: rand(68, 82),
        potential: rand(78, 92),
        salary: rand(5, 15) * 1000000,
        form: rand(65, 80),
        morale: rand(65, 85),
        fitness: 100,
        fatigue: 0,
        contractUntil: `${game.year}-12-31`,
        marketValue: rand(70, 150) * 1000000,
        status: "free_agent"
      })
    );
  }
}

/* =========================================================
   ROSTER HELPERS
   ========================================================= */

function getPlayer(team, playerId) {
  if (!team) return null;

  return team.players.find(p => p.id === playerId) || null;
}

function getStartingPlayers(team) {
  if (!team) return [];

  const result = team.startingFive
    .map(id => getPlayer(team, id))
    .filter(Boolean);

  return result;
}

function roleCoverage(players) {
  const wanted = ["EXP", "JUNGLE", "MID", "GOLD", "ROAM"];

  let score = 100;

  wanted.forEach(role => {
    if (!players.some(p => p.role === role)) {
      score -= 12;
    }
  });

  const roles = players.map(p => p.role);

  const duplicatePenalty =
    roles.length - new Set(roles).size;

  score -= duplicatePenalty * 5;

  return clamp(score, 40, 100);
}

function calculateTeamPower(team) {
  if (!team) return 0;

  const players = getStartingPlayers(team);

  if (!players.length) return 50;

  const playerPower = avg(
    players.map(p => {
      const formBonus = (p.form - 70) * 0.18;
      const fitnessPenalty = (100 - p.fitness) * 0.15;
      const fatiguePenalty = p.fatigue * 0.10;

      return p.rating +
        formBonus -
        fitnessPenalty -
        fatiguePenalty;
    })
  );

  const synergy = roleCoverage(players);

  const chemistryBonus =
    (team.chemistry - 70) * 0.15;

  return clamp(
    playerPower +
      (synergy - 70) * 0.18 +
      chemistryBonus,
    40,
    110
  );
}

/* =========================================================
   AI LINEUP
   ========================================================= */

function chooseBestLineup(team) {
  if (!team || !team.players.length) return;

  const available = team.players.filter(p =>
    p.status !== "free_agent" &&
    !p.injured &&
    p.fitness >= 35
  );

  if (!available.length) return;

  const roles = [
    "EXP",
    "JUNGLE",
    "MID",
    "GOLD",
    "ROAM"
  ];

  const selected = [];

  roles.forEach(role => {
    const candidates = available
      .filter(p =>
        p.role === role &&
        !selected.includes(p)
      )
      .sort((a, b) =>
        lineupScore(b) - lineupScore(a)
      );

    if (candidates[0]) {
      selected.push(candidates[0]);
    }
  });

  while (selected.length < 5) {
    const candidates = available
      .filter(p => !selected.includes(p))
      .sort((a, b) =>
        lineupScore(b) - lineupScore(a)
      );

    if (!candidates.length) break;

    selected.push(candidates[0]);
  }

  team.startingFive = selected
    .slice(0, 5)
    .map(p => p.id);
}

function lineupScore(player) {
  return (
    player.rating +
    player.form * 0.20 +
    player.fitness * 0.10 -
    player.fatigue * 0.15 +
    player.morale * 0.05 +
    randFloat(-2, 2)
  );
}

function chooseAllAILineups() {
  game.teams.forEach(team => {
    if (team.id !== game.team?.id) {
      chooseBestLineup(team);
    }
  });
}

/* =========================================================
   PLAYER FORM
   ========================================================= */

function updatePlayerForm(player, played = false, won = false) {
  if (!player) return;

  let change = randFloat(-2.5, 2.5);

  if (played) {
    change += won ? randFloat(0.5, 2) : randFloat(-1.5, 0.5);
  }

  if (player.morale >= 85) {
    change += 0.5;
  }

  if (player.fatigue >= 70) {
    change -= 1.5;
  }

  if (player.injured) {
    change -= 2;
  }

  player.form = clamp(
    player.form + change,
    40,
    100
  );

  if (won) {
    player.morale = clamp(
      player.morale + randFloat(0.5, 2),
      30,
      100
    );
  } else if (played) {
    player.morale = clamp(
      player.morale - randFloat(0, 1.5),
      30,
      100
    );
  }
}

function updateAllPlayerForms() {
  game.teams.forEach(team => {
    team.players.forEach(player => {
      updatePlayerForm(player);
    });
  });
}

/* =========================================================
   FITNESS / FATIGUE / INJURY
   ========================================================= */

function recoverPlayers() {
  game.teams.forEach(team => {
    team.players.forEach(player => {
      if (player.injured) {
        if (
          player.injuryUntil &&
          game.date >= player.injuryUntil
        ) {
          player.injured = false;
          player.injuryUntil = null;
          player.fitness = 70;
          player.fatigue = 20;

          addNews(
            `${player.name} telah pulih dari cedera.`
          );
        }
      } else {
        player.fatigue = clamp(
          player.fatigue - rand(5, 12),
          0,
          100
        );

        player.fitness = clamp(
          player.fitness + rand(3, 8),
          40,
          100
        );
      }
    });
  });
}

function applyMatchFatigue(team) {
  if (!team) return;

  getStartingPlayers(team).forEach(player => {
    player.fatigue = clamp(
      player.fatigue + rand(12, 25),
      0,
      100
    );

    player.fitness = clamp(
      player.fitness - rand(5, 12),
      25,
      100
    );
  });
}

function checkInjuries(team) {
  if (!team) return;

  team.players.forEach(player => {
    if (
      !player.injured &&
      player.fitness < 45 &&
      chance(4)
    ) {
      const days = rand(3, 18);

      player.injured = true;
      player.injuryUntil =
        addDays(game.date, days);

      addNews(
        `🩹 ${player.name} (${team.name}) mengalami cedera dan absen ${days} hari.`
      );
    }
  });
}

/* =========================================================
   RIVALRY
   ========================================================= */

function rivalryKey(a, b) {
  return [a, b].sort().join("__");
}

function getRivalry(a, b) {
  if (!game.rivals) game.rivals = {};

  const key = rivalryKey(a, b);

  if (!game.rivals[key]) {
    game.rivals[key] = {
      teamA: a,
      teamB: b,
      intensity: 0,
      matches: 0,
      transfers: 0
    };
  }

  return game.rivals[key];
}

function updateRivalry(home, away, reason = "match") {
  const rivalry = getRivalry(home.id, away.id);

  rivalry.matches++;

  if (reason === "transfer") {
    rivalry.transfers++;
    rivalry.intensity += 10;
  } else {
    rivalry.intensity += 3;
  }

  rivalry.intensity =
    clamp(rivalry.intensity, 0, 100);

  return rivalry;
}

function rivalryBonus(home, away) {
  const rivalry = getRivalry(home.id, away.id);

  return rivalry.intensity * 0.04;
}

/* =========================================================
   WORLD RANKING
   ========================================================= */

function initializeWorldRanking() {
  game.worldRanking = [];

  game.teams.forEach(team => {
    game.worldRanking.push({
      teamId: team.id,
      teamName: team.name,
      leagueId: team.leagueId,
      points: 1000,
      wins: 0,
      losses: 0,
      international: 0
    });
  });

  sortWorldRanking();
}

function getWorldEntry(teamId) {
  return game.worldRanking.find(
    x => x.teamId === teamId
  );
}

function updateWorldRankingMatch(
  winner,
  loser,
  international = false
) {
  const w = getWorldEntry(winner.id);
  const l = getWorldEntry(loser.id);

  if (!w || !l) return;

  w.wins++;
  l.losses++;

  w.points += international ? 35 : 12;
  l.points -= international ? 15 : 4;

  if (international) {
    w.international += 1;
  }

  w.points = Math.max(500, w.points);
  l.points = Math.max(500, l.points);

  sortWorldRanking();
}

function sortWorldRanking() {
  game.worldRanking.sort(
    (a, b) => b.points - a.points
  );
}

/* =========================================================
   NEWS / INBOX
   ========================================================= */

function addNews(message) {
  if (!game) return;

  game.news.unshift({
    id: uid("news"),
    date: game.date,
    message
  });

  game.news = game.news.slice(0, 50);
}

function addInbox(title, message) {
  game.inbox.unshift({
    id: uid("mail"),
    date: game.date,
    title,
    message,
    read: false
  });

  game.inbox = game.inbox.slice(0, 50);
}

/* =========================================================
   AI TRANSFER SYSTEM
   ========================================================= */

function transferWindowOpen() {
  const month = monthOf(game.date);

  return (
    month === 1 ||
    month === 7 ||
    month === 8
  );
}

function getAIManager(team) {
  return game.aiManagers.find(
    m => m.teamId === team.id
  );
}

function teamNeedsRole(team) {
  const players = team.players;

  const roles = {
    EXP: 0,
    JUNGLE: 0,
    MID: 0,
    GOLD: 0,
    ROAM: 0
  };

  players.forEach(p => {
    if (roles[p.role] !== undefined) {
      roles[p.role]++;
    }
  });

  const missing = Object.keys(roles)
    .filter(role => roles[role] === 0);

  return missing.length
    ? pick(missing)
    : null;
}

function findBestFreeAgent(role, maxRating = 100) {
  return game.freeAgents
    .filter(p =>
      (!role || p.role === role) &&
      p.rating <= maxRating
    )
    .sort(
      (a, b) =>
        lineupScore(b) - lineupScore(a)
    )[0] || null;
}

function aiSignFreeAgent(team) {
  if (!team || team.id === game.team?.id) return;

  const manager = getAIManager(team);

  if (!manager) return;

  if (
    team.budget < 50000000 ||
    !chance(manager.transferAggression * 0.35)
  ) {
    return;
  }

  const need = teamNeedsRole(team);

  const player = findBestFreeAgent(
    need,
    100
  );

  if (!player) return;

  const signingBonus =
    Math.max(
      5000000,
      player.marketValue * 0.08
    );

  const totalCost =
    signingBonus + player.salary;

  if (team.budget < totalCost) return;

  team.budget -= signingBonus;

  player.status = "active";
  player.teamId = team.id;
  player.formerTeam = "Free Agent";

  team.players.push(player);

  game.freeAgents =
    game.freeAgents.filter(
      p => p.id !== player.id
    );

  chooseBestLineup(team);

  addNews(
    `🔄 ${team.name} merekrut ${player.name} dari Free Agent.`
  );
}

function aiReleasePlayer(team) {
  if (!team || team.id === game.team?.id) return;

  const manager = getAIManager(team);

  if (!manager) return;

  const candidates = team.players
    .filter(p =>
      p.status === "active" &&
      p.rating < 68 &&
      !team.startingFive.includes(p.id)
    )
    .sort((a, b) => a.rating - b.rating);

  if (!candidates.length) return;

  if (!chance(15)) return;

  const player = candidates[0];

  team.players =
    team.players.filter(
      p => p.id !== player.id
    );

  player.status = "free_agent";
  player.teamId = null;
  player.formerTeam = team.name;

  game.freeAgents.push(player);

  addNews(
    `📤 ${team.name} melepas ${player.name} ke Free Agent.`
  );
}

function processAITransfers() {
  if (!transferWindowOpen()) return;

  game.teams.forEach(team => {
    if (team.id === game.team?.id) return;

    aiReleasePlayer(team);
    aiSignFreeAgent(team);
  });
}

/* =========================================================
   AI CONTRACTS
   ========================================================= */

function contractEndingThisSeason(player) {
  if (!player.contractUntil) return false;

  return (
    yearOf(player.contractUntil) <= game.year
  );
}

function aiRenewContracts() {
  game.teams.forEach(team => {
    if (team.id === game.team?.id) return;

    const manager = getAIManager(team);

    if (!manager) return;

    team.players.forEach(player => {
      if (!contractEndingThisSeason(player)) return;

      const important =
        team.startingFive.includes(player.id) ||
        player.rating >= 78;

      if (
        important &&
        team.budget >= player.salary * 2
      ) {
        player.contractUntil =
          `${game.year + 1}-12-31`;

        player.salary = Math.round(
          player.salary *
          randFloat(1.03, 1.12)
        );

        addNews(
          `📝 ${team.name} memperpanjang kontrak ${player.name}.`
        );
      }
    });
  });
}

/* =========================================================
   USER FREE AGENT SIGNING
   ========================================================= */

function signFreeAgent(playerId) {
  const player = game.freeAgents.find(
    p => p.id === playerId
  );

  if (!player) return;

  if (!transferWindowOpen()) {
    alert("Free Agent hanya bisa direkrut saat transfer window.");
    return;
  }

  const signingBonus =
    Math.max(
      5000000,
      player.marketValue * 0.08
    );

  if (game.budget < signingBonus) {
    alert("Budget tidak cukup untuk signing bonus.");
    return;
  }

  game.budget -= signingBonus;

  player.status = "active";
  player.teamId = game.team.id;
  player.contractUntil =
    `${game.year + 1}-12-31`;

  game.team.players.push(player);

  game.freeAgents =
    game.freeAgents.filter(
      p => p.id !== player.id
    );

  chooseBestLineup(game.team);

  addNews(
    `🆕 Kamu merekrut ${player.name} sebagai Free Agent.`
  );

  saveGame(false);

  if (typeof openFreeAgents === "function") {
    openFreeAgents();
  }
}

/* =========================================================
   TRANSFER NEGOTIATION
   ========================================================= */

function createTransferOffer(teamId, playerId, fee) {
  const sellingTeam = game.teams.find(
    t => t.id === teamId
  );

  if (!sellingTeam) return;

  const player = getPlayer(
    sellingTeam,
    playerId
  );

  if (!player) return;

  if (!transferWindowOpen()) {
    alert("Transfer window sedang tutup.");
    return;
  }

  fee = Number(fee);

  if (!fee || fee <= 0) {
    alert("Masukkan nilai transfer.");
    return;
  }

  if (game.budget < fee) {
    alert("Budget kamu tidak cukup.");
    return;
  }

  if (sellingTeam.id === game.team.id) {
    alert("Pemain tersebut sudah berada di tim kamu.");
    return;
  }

  const manager =
    getAIManager(sellingTeam);

  const value =
    player.marketValue ||
    player.rating * 1000000;

  let acceptance =
    (fee / value) * 60;

  if (
    sellingTeam.startingFive.includes(player.id)
  ) {
    acceptance -= 20;
  }

  if (player.rating >= 85) {
    acceptance -= 10;
  }

  if (manager) {
    acceptance +=
      (manager.transferAggression - 50) * 0.15;
  }

  const rivalry =
    getRivalry(
      sellingTeam.id,
      game.team.id
    );

  acceptance -= rivalry.intensity * 0.08;

  const accepted =
    acceptance >= rand(45, 75);

  const offer = {
    id: uid("offer"),
    type: "transfer",
    fromTeam: game.team.id,
    toTeam: sellingTeam.id,
    playerId: player.id,
    playerName: player.name,
    fee,
    accepted,
    date: game.date,
    status: accepted ? "accepted" : "rejected"
  };

  game.transferOffers.unshift(offer);

  if (accepted) {
    addNews(
      `🤝 ${sellingTeam.name} menerima tawaran ${money(fee)} untuk ${player.name}.`
    );

    addInbox(
      "Transfer Diterima",
      `${sellingTeam.name} menerima tawaran kamu untuk ${player.name} sebesar ${money(fee)}.`
    );
  } else {
    addNews(
      `❌ ${sellingTeam.name} menolak tawaran untuk ${player.name}.`
    );

    addInbox(
      "Transfer Ditolak",
      `${sellingTeam.name} menolak tawaran kamu untuk ${player.name}.`
    );
  }

  saveGame(false);
}

/* =========================================================
   COMPLETE TRANSFER
   ========================================================= */

function completeTransfer(offerId) {
  const offer =
    game.transferOffers.find(
      o => o.id === offerId
    );

  if (!offer || offer.status !== "accepted") {
    return;
  }

  const sellingTeam =
    game.teams.find(
      t => t.id === offer.toTeam
    );

  const buyingTeam =
    game.teams.find(
      t => t.id === offer.fromTeam
    );

  if (!sellingTeam || !buyingTeam) return;

  const player =
    getPlayer(
      sellingTeam,
      offer.playerId
    );

  if (!player) return;

  if (buyingTeam.budget < offer.fee) {
    alert("Budget tidak cukup untuk menyelesaikan transfer.");
    return;
  }

  buyingTeam.budget -= offer.fee;
  sellingTeam.budget += offer.fee;

  sellingTeam.players =
    sellingTeam.players.filter(
      p => p.id !== player.id
    );

  player.teamId = buyingTeam.id;
  player.status = "active";
  player.formerTeam = sellingTeam.name;
  player.contractUntil =
    `${game.year + 2}-12-31`;

  buyingTeam.players.push(player);

  offer.status = "completed";

  updateRivalry(
    buyingTeam,
    sellingTeam,
    "transfer"
  );

  chooseBestLineup(buyingTeam);
  chooseBestLineup(sellingTeam);

  addNews(
    `🚨 TRANSFER: ${player.name} pindah dari ${sellingTeam.name} ke ${buyingTeam.name} dengan biaya ${money(offer.fee)}.`
  );

  saveGame(false);

  if (
    typeof openOffers === "function"
  ) {
    openOffers();
  }
}

/* =========================================================
   SEASON DEVELOPMENT
   ========================================================= */

function developPlayer(player) {
  if (!player) return;

  const ageFactor =
    player.age <= 21
      ? 1.5
      : player.age <= 24
        ? 1
        : player.age <= 27
          ? 0.3
          : -0.7;

  const performance =
    player.matchesPlayed > 0
      ? (player.wins / player.matchesPlayed) * 2
      : 0;

  const formFactor =
    (player.form - 70) * 0.05;

  let change =
    ageFactor +
    performance +
    formFactor +
    randFloat(-1.5, 1.5);

  if (
    player.rating >= player.potential
  ) {
    change = Math.min(change, 0.5);
  }

  player.rating = clamp(
    Math.round(
      player.rating + change
    ),
    45,
    player.potential
  );

  if (player.age >= 28 && chance(25)) {
    player.rating = clamp(
      player.rating - rand(1, 2),
      45,
      100
    );
  }

  player.age++;

  player.form = clamp(
    65 + rand(-5, 10),
    40,
    100
  );

  player.fitness = 100;
  player.fatigue = 0;
}

function developAllPlayers() {
  game.teams.forEach(team => {
    team.players.forEach(player => {
      developPlayer(player);
    });
  });

  game.freeAgents.forEach(player => {
    developPlayer(player);
  });
}

/* =========================================================
   SEASON RESET
   ========================================================= */

function resetPlayerSeasonStats(player) {
  player.matchesPlayed = 0;
  player.wins = 0;
  player.losses = 0;

  player.mvp = 0;

  player.gameWins = 0;
  player.gameLosses = 0;

  player.kills = 0;
  player.deaths = 0;
  player.assists = 0;

  player.fatigue = 0;
  player.fitness = 100;

  player.injured = false;
  player.injuryUntil = null;
}

function resetTeamSeasonStats(team) {
  team.standings = {
    played: 0,
    wins: 0,
    losses: 0,
    gameWins: 0,
    gameLosses: 0,
    points: 0
  };

  team.seasonStats = {
    wins: 0,
    losses: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    mvp: 0
  };

  team.chemistry = clamp(
    team.chemistry + rand(-4, 4),
    50,
    100
  );

  team.players.forEach(
    resetPlayerSeasonStats
  );

  chooseBestLineup(team);
}

/* =========================================================
   SAVE / LOAD
   ========================================================= */

function saveGame(showMessage = true) {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );

    if (showMessage) {
      alert("Game berhasil disimpan.");
    }
  } catch (error) {
    console.error(error);
    alert("Gagal menyimpan game.");
  }
}

function migrateGame(oldGame) {
  const fresh = createDefaultGame();

  const migrated = {
    ...fresh,
    ...oldGame,
    version: 13
  };

  migrated.freeAgents =
    Array.isArray(oldGame.freeAgents)
      ? oldGame.freeAgents
      : [];

  migrated.transferOffers =
    Array.isArray(oldGame.transferOffers)
      ? oldGame.transferOffers
      : [];

  migrated.inbox =
    Array.isArray(oldGame.inbox)
      ? oldGame.inbox
      : [];

  migrated.news =
    Array.isArray(oldGame.news)
      ? oldGame.news
      : [];

  migrated.history =
    Array.isArray(oldGame.history)
      ? oldGame.history
      : [];

  migrated.awards =
    Array.isArray(oldGame.awards)
      ? oldGame.awards
      : [];

  migrated.rivals =
    oldGame.rivals || {};

  migrated.worldRanking =
    Array.isArray(oldGame.worldRanking)
      ? oldGame.worldRanking
      : [];

  migrated.seasonStats =
    oldGame.seasonStats || fresh.seasonStats;

  migrated.aiManagers =
    Array.isArray(oldGame.aiManagers)
      ? oldGame.aiManagers
      : [];

  if (
    oldGame.teams &&
    Array.isArray(oldGame.teams)
  ) {
    migrated.teams =
      oldGame.teams.map(team =>
        normalizeTeam(
          team,
          team.leagueId ||
          oldGame.selectedLeague
        )
      );
  }

  if (oldGame.team) {
    const found =
      migrated.teams.find(
        t => t.id === oldGame.team.id
      );

    migrated.team =
      found ||
      normalizeTeam(
        oldGame.team,
        oldGame.selectedLeague
      );
  }

  if (!migrated.team && migrated.selectedTeam) {
    const found =
      migrated.teams.find(
        t => t.id === migrated.selectedTeam
      );

    if (found) {
      migrated.team = found;
    }
  }

  return migrated;
}

function loadGame() {
  try {
    let raw =
      localStorage.getItem(SAVE_KEY);

    if (!raw) {
      for (const key of OLD_SAVE_KEYS) {
        const old = localStorage.getItem(key);

        if (old) {
          raw = old;
          break;
        }
      }
    }

    if (!raw) return false;

    const parsed =
      JSON.parse(raw);

    game = migrateGame(parsed);

    initializeAIManagers();
    initializeTeamBudgets();
    initializeFreeAgents();

    if (!game.worldRanking.length) {
      initializeWorldRanking();
    }

    chooseAllAILineups();

    return true;
  } catch (error) {
    console.error(
      "LOAD ERROR:",
      error
    );

    return false;
  }
}

/* =========================================================
   CAREER SETUP
   ========================================================= */

function selectTarget(target) {
  selectedTarget = target;

  document
    .querySelectorAll(".target-btn")
    .forEach(btn =>
      btn.classList.remove("selected")
    );

  const el =
    document.getElementById(
      "target-" + target
    );

  if (el) {
    el.classList.add("selected");
  }
}

function startCareer() {
  const managerInput =
    document.getElementById(
      "managerName"
    );

  const managerName =
    managerInput?.value.trim();

  if (!managerName) {
    alert("Masukkan nama manager.");
    return;
  }

  if (
    !game.selectedCountry ||
    !game.selectedLeague ||
    !game.selectedTeam
  ) {
    alert("Pilih negara, liga, dan tim terlebih dahulu.");
    return;
  }

  const league =
    getLeague(game.selectedLeague);

  if (!league) {
    alert("Liga tidak ditemukan.");
    return;
  }

  game.managerName = managerName;
  game.target = selectedTarget;

  game.year = 2026;
  game.date = "2026-01-05";
  game.phase = "regular";

  game.teams =
    buildLeagueTeams(league);

  const selected =
    game.teams.find(
      t => t.id === game.selectedTeam
    );

  if (!selected) {
    alert("Tim tidak ditemukan.");
    return;
  }

  game.team = selected;

  game.budget =
    selected.budget;

  initializeAIManagers();
  initializeTeamBudgets();
  initializeFreeAgents();
  initializeWorldRanking();

  createSeason();

  addNews(
    `Selamat datang Manager ${managerName}. Target musim ini: ${targetLabel(game.target)}.`
  );

  saveGame(false);

  showScreen("dashboardScreen");
  renderDashboard();
}

function targetLabel(target) {
  const labels = {
    champion: "Juara",
    top3: "Top 3",
    playoff: "Lolos Playoff",
    build: "Membangun Tim"
  };

  return labels[target] || target;
}

/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach(screen =>
      screen.classList.remove("active")
    );

  const target =
    document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }
}

function backDashboard() {
  showScreen("dashboardScreen");
  renderDashboard();
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeGame() {
  game = createDefaultGame();

  if (!loadGame()) {
    renderCountries();
  } else {
    if (game.team) {
      showScreen("dashboardScreen");
      renderDashboard();
    } else {
      renderCountries();
    }
  }
}

/* =========================================================
   COUNTRY / LEAGUE / TEAM
   ========================================================= */

function renderCountries() {
  showScreen("countryScreen");

  const container =
    document.getElementById(
      "countryList"
    );

  if (!container) return;

  container.innerHTML = "";

  if (
    typeof countries === "undefined"
  ) {
    container.innerHTML =
      "<p>Data negara tidak ditemukan.</p>";
    return;
  }

  countries.forEach(country => {
    const button =
      document.createElement("button");

    button.className =
      "country-btn";

    button.innerHTML = `
      <span class="country-flag">
        ${country.flag}
      </span>
      <span>
        ${country.name}
      </span>
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

  game.selectedCountry =
    country.id;

  const title =
    document.getElementById(
      "leagueCountryTitle"
    );

  if (title) {
    title.textContent =
      `${country.flag} ${country.name}`;
  }

  const list =
    document.getElementById(
      "leagueList"
    );

  if (!list) return;

  list.innerHTML = "";

  country.leagues.forEach(
    leagueId => {
      const league =
        getLeague(leagueId);

      if (!league) return;

      const button =
        document.createElement("button");

      button.className =
        "league-btn";

      button.textContent =
        league.name;

      button.onclick = () =>
        selectLeague(league.id);

      list.appendChild(button);
    }
  );

  showScreen("leagueScreen");
}

function selectLeague(leagueId) {
  const league =
    getLeague(leagueId);

  if (!league) return;

  game.selectedLeague =
    league.id;

  const list =
    document.getElementById(
      "teamList"
    );

  if (!list) return;

  list.innerHTML = "";

  league.teams.forEach(team => {
    const button =
      document.createElement("button");

    button.className =
      "team-btn";

    button.innerHTML = `
      <strong>${team.name}</strong>
      <small>${team.players?.length || 0} Players</small>
    `;

    button.onclick = () =>
      selectTeam(team.id);

    list.appendChild(button);
  });

  showScreen("teamScreen");
}

function selectTeam(teamId) {
  game.selectedTeam =
    teamId;

  showScreen(
    "managerSetupScreen"
  );
}

/* =========================================================
   SEASON CREATION
   ========================================================= */

function createSeason() {
  if (!game.teams.length) return;

  game.phase = "regular";

  game.schedule = [];
  game.currentMatch = null;

  game.teams.forEach(team => {
    resetTeamSeasonStats(team);
  });

  const pairs = [];

  for (
    let i = 0;
    i < game.teams.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < game.teams.length;
      j++
    ) {
      pairs.push([
        game.teams[i],
        game.teams[j]
      ]);

      pairs.push([
        game.teams[j],
        game.teams[i]
      ]);
    }
  }

  pairs.forEach(
    ([home, away], index) => {
      game.schedule.push({
        id: uid("match"),
        date: addDays(
          `${game.year}-02-01`,
          Math.floor(index / 2) * 2
        ),
        phase: "regular",
        bestOf: 3,
        home: home.id,
        away: away.id,
        played: false,
        winner: null,
        homeScore: 0,
        awayScore: 0
      });
    }
  );

  game.schedule.sort(
    (a, b) =>
      new Date(a.date) -
      new Date(b.date)
  );

  chooseAllAILineups();

  addNews(
    `📅 Musim ${game.year} resmi dimulai.`
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {
  if (!game || !game.team) return;

  const map = {
    dashManager: game.managerName,
    dashSeason: game.year,
    dashTeam: game.team.name,
    dashLeague:
      getLeague(game.selectedLeague)?.name ||
      "",
    dashBudget: money(game.budget),
    dashRep: game.reputation,
    dashOrg: game.organizationLevel,
    dashTarget: targetLabel(game.target)
  };

  Object.entries(map).forEach(
    ([id, value]) => {
      const el =
        document.getElementById(id);

      if (el) {
        el.textContent = value;
      }
    }
  );

  const next =
    game.schedule.find(
      m =>
        !m.played &&
        (
          m.home === game.team.id ||
          m.away === game.team.id
        )
    );

  const nextMatch =
    document.getElementById(
      "nextMatch"
    );

  if (nextMatch) {
    if (next) {
      const home =
        game.teams.find(
          t => t.id === next.home
        );

      const away =
        game.teams.find(
          t => t.id === next.away
        );

      nextMatch.innerHTML = `
        <strong>${next.phase === "final" ? "🏆 GRAND FINAL" : "⚔️ NEXT MATCH"}</strong>
        <div>${home?.name || "?"} vs ${away?.name || "?"}</div>
        <small>${formatDate(next.date)}</small>
      `;
    } else {
      nextMatch.innerHTML =
        "<strong>Season selesai</strong>";
    }
  }

  injectV13Dashboard();
}

/* =========================================================
   V1.3 DASHBOARD PANEL
   ========================================================= */

function injectV13Dashboard() {
  let panel =
    document.getElementById(
      "v13DashboardPanel"
    );

  if (!panel) {
    panel =
      document.createElement("div");

    panel.id =
      "v13DashboardPanel";

    panel.className =
      "v13-panel";

    const dashboard =
      document.getElementById(
        "dashboardScreen"
      );

    if (dashboard) {
      dashboard.appendChild(panel);
    }
  }

  const rivalryCount =
    Object.values(
      game.rivals || {}
    ).filter(
      r =>
        r.intensity >= 50
    ).length;

  panel.innerHTML = `
    <div class="v13-title">
      ⚡ V1.3 MANAGER CENTER
    </div>

    <div class="v13-grid">

      <div class="v13-card">
        <small>📅 DATE</small>
        <strong>${formatDate(game.date)}</strong>
      </div>

      <div class="v13-card">
        <small>🎮 PHASE</small>
        <strong>${getPhase()}</strong>
      </div>

      <div class="v13-card">
        <small>🧪 CHEMISTRY</small>
        <strong>${Math.round(game.team.chemistry)}</strong>
      </div>

      <div class="v13-card">
        <small>🆓 FREE AGENT</small>
        <strong>${game.freeAgents.length}</strong>
      </div>

      <div class="v13-card">
        <small>⚔️ RIVALRIES</small>
        <strong>${rivalryCount}</strong>
      </div>

      <div class="v13-card">
        <small>🌍 RANK</small>
        <strong>#${getWorldRank(game.team.id)}</strong>
      </div>

    </div>

    <div class="v13-actions">

      <button onclick="openFreeAgents()">
        🆓 Free Agents
      </button>

      <button onclick="openOffers()">
        🤝 Transfer Offers
      </button>

      <button onclick="openRivalries()">
        ⚔️ Rivalries
      </button>

      <button onclick="openAwards()">
        🏆 Awards
      </button>

    </div>
  `;
}

function getWorldRank(teamId) {
  const index =
    game.worldRanking.findIndex(
      r => r.teamId === teamId
    );

  return index >= 0
    ? index + 1
    : "-";
}

/* =========================================================
   ROSTER
   ========================================================= */

function openRoster() {
  showScreen("rosterScreen");

  const list =
    document.getElementById(
      "rosterList"
    );

  if (!list) return;

  list.innerHTML =
    game.team.players
      .map(player => `
        <div class="player-card">
          <div>
            <strong>${player.name}</strong>
            <div>
              ${player.role} • OVR ${player.rating}
            </div>
          </div>

          <div>
            <small>
              Form ${Math.round(player.form)}
            </small>
            <br>
            <small>
              Fit ${Math.round(player.fitness)}
            </small>
          </div>
        </div>
      `)
      .join("");
}

/* =========================================================
   TRANSFER SCREEN
   ========================================================= */

function openTransfer() {
  showScreen("transferScreen");

  const list =
    document.getElementById(
      "transferList"
    );

  const info =
    document.getElementById(
      "transferInfo"
    );

  if (info) {
    info.innerHTML = `
      <strong>Transfer Window:</strong>
      ${transferWindowOpen() ? "🟢 OPEN" : "🔴 CLOSED"}
      <br>
      Budget:
      ${money(game.budget)}
    `;
  }

  if (!list) return;

  list.innerHTML = "";

  game.teams
    .filter(
      team => team.id !== game.team.id
    )
    .forEach(team => {
      team.players
        .filter(
          p =>
            p.status === "active"
        )
        .forEach(player => {
          const card =
            document.createElement("div");

          card.className =
            "player-card";

          card.innerHTML = `
            <div>
              <strong>${player.name}</strong>
              <div>
                ${team.name}
              </div>
              <small>
                ${player.role} • OVR ${player.rating}
              </small>
            </div>

            <div>
              <small>
                Value:
                ${money(player.marketValue)}
              </small>

              <button
                onclick="promptTransferOffer('${team.id}','${player.id}')"
              >
                Offer
              </button>
            </div>
          `;

          list.appendChild(card);
        });
    });
}

function promptTransferOffer(
  teamId,
  playerId
) {
  const team =
    game.teams.find(
      t => t.id === teamId
    );

  const player =
    getPlayer(team, playerId);

  if (!player) return;

  const suggested =
    Math.round(
      player.marketValue
    );

  const input =
    prompt(
      `Transfer fee untuk ${player.name}?\nSuggested: ${money(suggested)}`,
      suggested
    );

  if (input === null) return;

  createTransferOffer(
    teamId,
    playerId,
    Number(input)
  );
}

/* =========================================================
   SCHEDULE
   ========================================================= */

function openSchedule() {
  showScreen("scheduleScreen");

  const list =
    document.getElementById(
      "scheduleList"
    );

  if (!list) return;

  list.innerHTML =
    game.schedule
      .filter(
        m =>
          m.home === game.team.id ||
          m.away === game.team.id
      )
      .map(match => {
        const home =
          game.teams.find(
            t => t.id === match.home
          );

        const away =
          game.teams.find(
            t => t.id === match.away
          );

        return `
          <div class="schedule-item">
            <strong>
              ${home?.name} vs ${away?.name}
            </strong>

            <small>
              ${formatDate(match.date)}
              • ${match.phase}
              • BO${match.bestOf}
            </small>

            <span>
              ${
                match.played
                  ? `${match.homeScore} - ${match.awayScore}`
                  : "⏳ Belum dimainkan"
              }
            </span>
          </div>
        `;
      })
      .join("");
}

/* =========================================================
   SCOUTING
   ========================================================= */

function openScouting() {
  showScreen("scoutingScreen");
}

function runScouting() {
  const result =
    document.getElementById(
      "scoutingResult"
    );

  if (!result) return;

  const available =
    game.teams
      .filter(
        t => t.id !== game.team.id
      )
      .flatMap(
        t =>
          t.players.map(
            p => ({
              ...p,
              teamName: t.name
            })
          )
      )
      .sort(
        (a, b) =>
          b.rating - a.rating
      );

  const top =
    available.slice(0, 5);

  result.innerHTML = top
    .map(
      p => `
        <div class="player-card">
          <div>
            <strong>${p.name}</strong>
            <div>${p.teamName}</div>
          </div>

          <div>
            ${p.role}
            <br>
            OVR ${p.rating}
          </div>
        </div>
      `
    )
    .join("");
}

/* =========================================================
   WORLD
   ========================================================= */

function openWorld() {
  showScreen("worldScreen");

  renderWorldRanking();
}

function renderWorldRanking() {
  const container =
    document.getElementById(
      "worldRanking"
    );

  if (!container) return;

  container.innerHTML =
    game.worldRanking
      .slice(0, 20)
      .map(
        (team, index) => `
          <div class="ranking-item">
            <strong>#${index + 1}</strong>
            <span>${team.teamName}</span>
            <b>${Math.round(team.points)}</b>
          </div>
        `
      )
      .join("");
}

function openMSC() {
  alert(
    "MSC system V1.3 aktif. Qualification akan ditentukan dari performa musim."
  );
}

function openMSeries() {
  alert(
    "M-Series system V1.3 aktif. Qualification akan ditentukan dari World Ranking dan hasil internasional."
  );
}

/* =========================================================
   HISTORY
   ========================================================= */

function openHistory() {
  showScreen("historyScreen");

  const list =
    document.getElementById(
      "historyList"
    );

  if (!list) return;

  list.innerHTML =
    game.history.length
      ? game.history
          .map(
            item => `
              <div class="history-item">
                <strong>
                  Season ${item.year}
                </strong>
                <div>
                  ${item.teamName}
                </div>
                <small>
                  ${item.result}
                </small>
              </div>
            `
          )
          .join("")
      : "<p>Belum ada history.</p>";
}

/* =========================================================
   ADVANCE DAY
   ========================================================= */

function advanceDay() {
  if (!game) return;

  game.date =
    addDays(game.date, 1);

  recoverPlayers();

  updateAllPlayerForms();

  if (
    transferWindowOpen()
  ) {
    processAITransfers();
  }

  chooseAllAILineups();

  checkInjuries(game.team);

  if (
    monthOf(game.date) === 1 &&
    new Date(game.date).getDate() === 1
  ) {
    processMonthlyFinance();
  }

  processDueMatches();

  renderDashboard();

  saveGame(false);
}

function processMonthlyFinance() {
  const salary =
    game.team.players.reduce(
      (sum, p) =>
        sum + Number(p.salary || 0),
      0
    );

  game.budget -= salary;

  game.budget +=
    game.sponsor.monthlyIncome;

  game.budget =
    Math.max(0, game.budget);

  addNews(
    `💰 Finansial bulanan: payroll ${money(salary)}, sponsor +${money(game.sponsor.monthlyIncome)}.`
  );
}

/* =========================================================
   MATCH AUTO PROCESS
   ========================================================= */

function processDueMatches() {
  const due =
    game.schedule.find(
      m =>
        !m.played &&
        m.date <= game.date &&
        (
          m.home === game.team.id ||
          m.away === game.team.id
        )
    );

  if (due) {
    openMatch(due.id);
  }
}

/* =========================================================
   PLACEHOLDER MATCH FUNCTIONS
   PART 2 WILL REPLACE / COMPLETE THESE
   ========================================================= */

function openMatch(matchId) {
  const match =
    game.schedule.find(
      m => m.id === matchId
    );

  if (!match) return;

  game.currentMatch = match;

  const home =
    game.teams.find(
      t => t.id === match.home
    );

  const away =
    game.teams.find(
      t => t.id === match.away
    );

  if (!home || !away) return;

  const stage =
    document.getElementById(
      "matchStage"
    );

  const homeName =
    document.getElementById(
      "matchHome"
    );

  const awayName =
    document.getElementById(
      "matchAway"
    );

  const homeRating =
    document.getElementById(
      "matchHomeRating"
    );

  const awayRating =
    document.getElementById(
      "matchAwayRating"
    );

  if (stage) {
    stage.textContent =
      `${match.phase.toUpperCase()} • BO${match.bestOf}`;
  }

  if (homeName) {
    homeName.textContent =
      home.name;
  }

  if (awayName) {
    awayName.textContent =
      away.name;
  }

  if (homeRating) {
    homeRating.textContent =
      Math.round(
        calculateTeamPower(home)
      );
  }

  if (awayRating) {
    awayRating.textContent =
      Math.round(
        calculateTeamPower(away)
      );
  }

  const homeChanceEl =
    document.getElementById(
      "homeChance"
    );

  const awayChanceEl =
    document.getElementById(
      "awayChance"
    );

  const hp =
    calculateTeamPower(home);

  const ap =
    calculateTeamPower(away);

  const total =
    hp + ap;

  if (homeChanceEl) {
    homeChanceEl.textContent =
      `${Math.round(hp / total * 100)}%`;
  }

  if (awayChanceEl) {
    awayChanceEl.textContent =
      `${Math.round(ap / total * 100)}%`;
  }

  showScreen("matchScreen");
}

/* =========================================================
   END PART 1
   ========================================================= */

/*
   PART 2 akan melanjutkan:

   - Match Engine BO3 / BO5
   - Player Match Stats
   - MVP
   - Standings
   - Playoffs
   - Grand Final
   - Season Finish
   - Awards
   - Free Agent UI
   - Offer UI
   - Rivalry UI
   - Organization upgrade
   - Save migration completion
   - Restart
   - CSS injection
   - initializeGame()
*/
/* =========================================================
   MLBB PRO MANAGER V1.3
   PART 2 / 2
   ========================================================= */

/* =========================================================
   MATCH ENGINE
   ========================================================= */

function simulateCurrentMatch() {
  if (!game.currentMatch) {
    alert("Tidak ada match aktif.");
    return;
  }

  const match = game.currentMatch;

  const home = game.teams.find(
    t => t.id === match.home
  );

  const away = game.teams.find(
    t => t.id === match.away
  );

  if (!home || !away) {
    alert("Data tim tidak ditemukan.");
    return;
  }

  if (match.played) {
    alert("Match sudah dimainkan.");
    return;
  }

  chooseBestLineup(home);
  chooseBestLineup(away);

  const homePlayers = getStartingPlayers(home);
  const awayPlayers = getStartingPlayers(away);

  let homePower = calculateTeamPower(home);
  let awayPower = calculateTeamPower(away);

  /* Home advantage */
  const homeAdvantage = 2.5;

  homePower += homeAdvantage;

  /* Rivalry */
  const rivalry = updateRivalry(home, away);
  const rivalryEffect = rivalryBonus(home, away);

  homePower += rivalryEffect;

  /* Manager style */
  homePower += managerMatchBonus(home);
  awayPower += managerMatchBonus(away);

  /* Small randomness */
  homePower += randFloat(-5, 5);
  awayPower += randFloat(-5, 5);

  const bestOf =
    Number(match.bestOf || 3);

  const winsNeeded =
    Math.ceil(bestOf / 2);

  let homeWins = 0;
  let awayWins = 0;

  const homeGameStats = [];
  const awayGameStats = [];

  while (
    homeWins < winsNeeded &&
    awayWins < winsNeeded
  ) {
    let hp =
      homePower +
      randFloat(-7, 7);

    let ap =
      awayPower +
      randFloat(-7, 7);

    if (hp >= ap) {
      homeWins++;
      homeGameStats.push(
        createGamePlayerStats(
          homePlayers,
          true
        )
      );
      awayGameStats.push(
        createGamePlayerStats(
          awayPlayers,
          false
        )
      );
    } else {
      awayWins++;
      awayGameStats.push(
        createGamePlayerStats(
          awayPlayers,
          true
        )
      );
      homeGameStats.push(
        createGamePlayerStats(
          homePlayers,
          false
        )
      );
    }
  }

  const homeWon =
    homeWins > awayWins;

  const winner =
    homeWon ? home : away;

  const loser =
    homeWon ? away : home;

  match.homeScore = homeWins;
  match.awayScore = awayWins;
  match.winner = winner.id;
  match.played = true;

  applyTeamMatchResult(
    winner,
    loser,
    homeWon,
    match
  );

  applyPlayerMatchStats(
    home,
    away,
    homeGameStats,
    awayGameStats,
    homeWins,
    awayWins
  );

  applyMatchFatigue(home);
  applyMatchFatigue(away);

  checkInjuries(home);
  checkInjuries(away);

  updateWorldRankingMatch(
    winner,
    loser,
    match.phase !== "regular"
  );

  game.seasonStats.matches++;

  if (winner.id === game.team.id) {
    game.seasonStats.wins++;
  } else if (loser.id === game.team.id) {
    game.seasonStats.losses++;
  }

  const mvp =
    calculateMatchMVP(
      winner,
      homeGameStats,
      awayGameStats
    );

  if (mvp) {
    mvp.mvp++;
    mvp.morale =
      clamp(
        mvp.morale + 5,
        30,
        100
      );
  }

  addNews(
    `🎮 ${home.name} ${homeWins}-${awayWins} ${away.name}. ${winner.name} menang!`
  );

  if (mvp) {
    addNews(
      `⭐ MVP: ${mvp.name}`
    );
  }

  showResultScreen(
    match,
    home,
    away,
    winner,
    mvp
  );

  saveGame(false);
}

/* =========================================================
   MANAGER BONUS
   ========================================================= */

function managerMatchBonus(team) {
  const manager = team.manager;

  if (!manager) return 0;

  if (manager.style === "aggressive") {
    return randFloat(1, 3);
  }

  if (manager.style === "strategic") {
    return randFloat(1, 2.5);
  }

  if (manager.style === "defensive") {
    return randFloat(0, 2);
  }

  return randFloat(0, 1.5);
}

/* =========================================================
   GAME PLAYER STATS
   ========================================================= */

function createGamePlayerStats(
  players,
  won
) {
  if (!players.length) return [];

  return players.map(player => {
    const base =
      player.rating +
      (player.form - 70) * 0.15;

    const kills = Math.max(
      0,
      Math.round(
        base / 12 +
        randFloat(-2, 3)
      )
    );

    const deaths = Math.max(
      0,
      Math.round(
        5 -
        base / 25 +
        randFloat(0, 3)
      )
    );

    const assists = Math.max(
      0,
      Math.round(
        base / 7 +
        randFloat(1, 5)
      )
    );

    return {
      playerId: player.id,
      kills,
      deaths,
      assists,
      performance:
        base +
        (won ? randFloat(2, 7) : randFloat(-5, 2))
    };
  });
}

function applyPlayerMatchStats(
  home,
  away,
  homeStats,
  awayStats,
  homeWins,
  awayWins
) {
  const allHomePlayers =
    getStartingPlayers(home);

  const allAwayPlayers =
    getStartingPlayers(away);

  allHomePlayers.forEach(player => {
    player.matchesPlayed++;

    if (homeWins > awayWins) {
      player.wins++;
    } else {
      player.losses++;
    }

    const stat =
      homeStats
        .flat()
        .find(
          s => s.playerId === player.id
        );

    if (stat) {
      player.kills += stat.kills;
      player.deaths += stat.deaths;
      player.assists += stat.assists;

      player.gameWins += homeWins;
      player.gameLosses += awayWins;

      updatePlayerForm(
        player,
        true,
        homeWins > awayWins
      );
    }
  });

  allAwayPlayers.forEach(player => {
    player.matchesPlayed++;

    if (awayWins > homeWins) {
      player.wins++;
    } else {
      player.losses++;
    }

    const stat =
      awayStats
        .flat()
        .find(
          s => s.playerId === player.id
        );

    if (stat) {
      player.kills += stat.kills;
      player.deaths += stat.deaths;
      player.assists += stat.assists;

      player.gameWins += awayWins;
      player.gameLosses += homeWins;

      updatePlayerForm(
        player,
        true,
        awayWins > homeWins
      );
    }
  });

  updateTeamStats(
    home,
    homeStats.flat()
  );

  updateTeamStats(
    away,
    awayStats.flat()
  );
}

function updateTeamStats(
  team,
  stats
) {
  stats.forEach(stat => {
    team.seasonStats.kills +=
      stat.kills;

    team.seasonStats.deaths +=
      stat.deaths;

    team.seasonStats.assists +=
      stat.assists;
  });
}

/* =========================================================
   MVP
   ========================================================= */

function calculateMatchMVP(
  winner,
  homeStats,
  awayStats
) {
  const stats =
    [
      ...homeStats.flat(),
      ...awayStats.flat()
    ];

  if (!stats.length) return null;

  const candidates =
    stats
      .map(stat => {
        const player =
          findPlayerEverywhere(
            stat.playerId
          );

        return {
          player,
          performance:
            stat.performance
        };
      })
      .filter(x => x.player);

  candidates.sort(
    (a, b) =>
      b.performance -
      a.performance
  );

  return candidates[0]?.player || null;
}

function findPlayerEverywhere(playerId) {
  for (const team of game.teams) {
    const player =
      team.players.find(
        p => p.id === playerId
      );

    if (player) return player;
  }

  return game.freeAgents.find(
    p => p.id === playerId
  ) || null;
}

/* =========================================================
   TEAM MATCH RESULT
   ========================================================= */

function applyTeamMatchResult(
  winner,
  loser,
  winnerIsHome,
  match
) {
  if (match.phase === "regular") {
    winner.standings.played++;
    loser.standings.played++;

    winner.standings.wins++;
    loser.standings.losses++;

    winner.standings.gameWins +=
      winnerIsHome
        ? match.homeScore
        : match.awayScore;

    winner.standings.gameLosses +=
      winnerIsHome
        ? match.awayScore
        : match.homeScore;

    loser.standings.gameWins +=
      winnerIsHome
        ? match.awayScore
        : match.homeScore;

    loser.standings.gameLosses +=
      winnerIsHome
        ? match.homeScore
        : match.awayScore;

    winner.standings.points += 3;

    winner.seasonStats.wins++;
    loser.seasonStats.losses++;

    winner.chemistry =
      clamp(
        winner.chemistry + 2,
        40,
        100
      );

    loser.chemistry =
      clamp(
        loser.chemistry - 1,
        40,
        100
      );
  }

  if (winner.id === game.team.id) {
    game.reputation =
      clamp(
        game.reputation + 1,
        0,
        100
      );
  }

  if (loser.id === game.team.id) {
    game.reputation =
      clamp(
        game.reputation - 1,
        0,
        100
      );
  }
}

/* =========================================================
   RESULT SCREEN
   ========================================================= */

function showResultScreen(
  match,
  home,
  away,
  winner,
  mvp
) {
  const teams =
    document.getElementById(
      "resultTeams"
    );

  const score =
    document.getElementById(
      "resultScore"
    );

  const winnerEl =
    document.getElementById(
      "resultWinner"
    );

  const message =
    document.getElementById(
      "resultMessage"
    );

  if (teams) {
    teams.textContent =
      `${home.name} vs ${away.name}`;
  }

  if (score) {
    score.textContent =
      `${match.homeScore} - ${match.awayScore}`;
  }

  if (winnerEl) {
    winnerEl.textContent =
      `🏆 ${winner.name}`;
  }

  if (message) {
    message.innerHTML = `
      ${winner.name} memenangkan pertandingan.
      ${
        mvp
          ? `<br>⭐ MVP: ${mvp.name}`
          : ""
      }
    `;
  }

  showScreen("resultScreen");
}

function finishMatch() {
  game.currentMatch = null;

  checkSeasonProgress();

  saveGame(false);

  renderDashboard();

  showScreen("dashboardScreen");
}

/* =========================================================
   SEASON PROGRESS
   ========================================================= */

function checkSeasonProgress() {
  if (game.phase === "regular") {
    const remaining =
      game.schedule.filter(
        m =>
          m.phase === "regular" &&
          !m.played
      );

    if (!remaining.length) {
      startPlayoffs();
    }
  }

  if (game.phase === "playoff") {
    const remaining =
      game.schedule.filter(
        m =>
          m.phase === "playoff" &&
          !m.played
      );

    if (!remaining.length) {
      startGrandFinal();
    }
  }

  if (game.phase === "final") {
    const final =
      game.schedule.find(
        m =>
          m.phase === "final"
      );

    if (
      final &&
      final.played
    ) {
      finishSeason();
    }
  }
}

/* =========================================================
   STANDINGS
   ========================================================= */

function getStandings() {
  return [...game.teams].sort(
    (a, b) => {
      if (
        b.standings.points !==
        a.standings.points
      ) {
        return (
          b.standings.points -
          a.standings.points
        );
      }

      const bDiff =
        b.standings.gameWins -
        b.standings.gameLosses;

      const aDiff =
        a.standings.gameWins -
        a.standings.gameLosses;

      return bDiff - aDiff;
    }
  );
}

function openStandings() {
  const standings =
    getStandings();

  let html =
    `<div class="v13-modal">
      <h2>📊 Standings</h2>`;

  standings.forEach(
    (team, index) => {
      html += `
        <div class="ranking-item">
          <strong>#${index + 1}</strong>
          <span>${team.name}</span>
          <b>${team.standings.points} PTS</b>
        </div>
      `;
    }
  );

  html += `
      <button onclick="closeV13Modal()">
        Tutup
      </button>
    </div>`;

  showV13Modal(html);
}

/* =========================================================
   PLAYOFFS
   ========================================================= */

function startPlayoffs() {
  game.phase = "playoff";

  const standings =
    getStandings();

  const top4 =
    standings.slice(0, 4);

  if (top4.length < 4) {
    startGrandFinal();
    return;
  }

  const existing =
    game.schedule.filter(
      m => m.phase === "playoff"
    );

  if (existing.length) {
    return;
  }

  const semi1 = {
    id: uid("semi"),
    date: addDays(
      game.date,
      2
    ),
    phase: "playoff",
    bestOf: 3,
    home: top4[0].id,
    away: top4[3].id,
    played: false,
    winner: null,
    homeScore: 0,
    awayScore: 0
  };

  const semi2 = {
    id: uid("semi"),
    date: addDays(
      game.date,
      4
    ),
    phase: "playoff",
    bestOf: 3,
    home: top4[1].id,
    away: top4[2].id,
    played: false,
    winner: null,
    homeScore: 0,
    awayScore: 0
  };

  game.schedule.push(
    semi1,
    semi2
  );

  addNews(
    `🏆 Playoffs dimulai! ${top4.map(t => t.name).join(", ")} lolos ke Top 4.`
  );

  saveGame(false);
}

/* =========================================================
   GRAND FINAL
   ========================================================= */

function startGrandFinal() {
  const semis =
    game.schedule.filter(
      m => m.phase === "playoff"
    );

  if (
    semis.length < 2 ||
    semis.some(
      m => !m.played
    )
  ) {
    return;
  }

  const finalExists =
    game.schedule.some(
      m => m.phase === "final"
    );

  if (finalExists) {
    game.phase = "final";
    return;
  }

  const finalists =
    semis.map(
      m =>
        game.teams.find(
          t => t.id === m.winner
        )
    ).filter(Boolean);

  if (finalists.length !== 2) {
    return;
  }

  game.phase = "final";

  game.schedule.push({
    id: uid("final"),
    date: addDays(
      game.date,
      3
    ),
    phase: "final",
    bestOf: 5,
    home: finalists[0].id,
    away: finalists[1].id,
    played: false,
    winner: null,
    homeScore: 0,
    awayScore: 0
  });

  addNews(
    `🔥 GRAND FINAL: ${finalists[0].name} vs ${finalists[1].name}.`
  );

  saveGame(false);
}

/* =========================================================
   PLAY NEXT MATCH
   ========================================================= */

function playNextMatch() {
  const match =
    game.schedule.find(
      m =>
        !m.played &&
        (
          m.home === game.team.id ||
          m.away === game.team.id
        )
    );

  if (!match) {
    checkSeasonProgress();
    alert("Tidak ada match berikutnya.");
    return;
  }

  if (
    new Date(match.date) >
    new Date(game.date)
  ) {
    game.date = match.date;
  }

  openMatch(match.id);
}

/* =========================================================
   AI MATCH SIMULATION
   ========================================================= */

function simulateAIMatches() {
  let simulated = 0;

  const matches =
    game.schedule.filter(
      m =>
        !m.played &&
        m.date <= game.date
    );

  matches.forEach(match => {
    const involvesUser =
      match.home === game.team.id ||
      match.away === game.team.id;

    if (involvesUser) return;

    const old =
      game.currentMatch;

    game.currentMatch =
      match;

    simulateCurrentMatch();

    game.currentMatch = old;

    simulated++;
  });

  return simulated;
}

/* =========================================================
   ADVANCE DAY OVERRIDE
   ========================================================= */

const originalAdvanceDay =
  advanceDay;

advanceDay = function () {
  if (!game) return;

  game.date =
    addDays(
      game.date,
      1
    );

  recoverPlayers();

  updateAllPlayerForms();

  if (transferWindowOpen()) {
    processAITransfers();
    aiRenewContracts();
  }

  chooseAllAILineups();

  checkInjuries(
    game.team
  );

  simulateAIMatches();

  if (
    new Date(game.date).getDate() === 1
  ) {
    processMonthlyFinance();
  }

  checkSeasonProgress();

  renderDashboard();

  saveGame(false);
};

/* =========================================================
   FREE AGENT UI
   ========================================================= */

function openFreeAgents() {
  let html = `
    <div class="v13-modal">
      <h2>🆓 Free Agent Market</h2>

      <p>
        Transfer Window:
        ${
          transferWindowOpen()
            ? "🟢 OPEN"
            : "🔴 CLOSED"
        }
      </p>

      <div class="v13-list">
  `;

  if (!game.freeAgents.length) {
    html += `
      <p>Tidak ada free agent.</p>
    `;
  }

  game.freeAgents.forEach(
    player => {
      html += `
        <div class="v13-player">
          <div>
            <strong>
              ${player.name}
            </strong>

            <small>
              ${player.role}
              • OVR ${player.rating}
              • POT ${player.potential}
            </small>

            <small>
              Salary:
              ${money(player.salary)}
            </small>
          </div>

          <button
            onclick="signFreeAgent('${player.id}')"
          >
            Sign
          </button>
        </div>
      `;
    }
  );

  html += `
      </div>

      <button
        onclick="closeV13Modal()"
      >
        Tutup
      </button>
    </div>
  `;

  showV13Modal(html);
}

/* =========================================================
   TRANSFER OFFERS UI
   ========================================================= */

function openOffers() {
  let html = `
    <div class="v13-modal">
      <h2>🤝 Transfer Offers</h2>
  `;

  const offers =
    game.transferOffers;

  if (!offers.length) {
    html += `
      <p>Belum ada transfer offer.</p>
    `;
  }

  offers.forEach(
    offer => {
      html += `
        <div class="v13-player">
          <div>
            <strong>
              ${offer.playerName}
            </strong>

            <small>
              Fee:
              ${money(offer.fee)}
            </small>

            <small>
              Status:
              ${offer.status}
            </small>
          </div>

          ${
            offer.status === "accepted"
              ? `
                <button
                  onclick="completeTransfer('${offer.id}')"
                >
                  Complete
                </button>
              `
              : ""
          }
        </div>
      `;
    }
  );

  html += `
      <button
        onclick="closeV13Modal()"
      >
        Tutup
      </button>
    </div>
  `;

  showV13Modal(html);
}

/* =========================================================
   RIVALRY UI
   ========================================================= */

function openRivalries() {
  let html = `
    <div class="v13-modal">
      <h2>⚔️ Rivalries</h2>
  `;

  const rivalries =
    Object.values(
      game.rivals || {}
    ).sort(
      (a, b) =>
        b.intensity -
        a.intensity
    );

  if (!rivalries.length) {
    html += `
      <p>Belum ada rivalry.</p>
    `;
  }

  rivalries.forEach(
    rivalry => {
      const a =
        game.teams.find(
          t =>
            t.id ===
            rivalry.teamA
        );

      const b =
        game.teams.find(
          t =>
            t.id ===
            rivalry.teamB
        );

      html += `
        <div class="v13-player">
          <div>
            <strong>
              ${a?.name || "?"}
              vs
              ${b?.name || "?"}
            </strong>

            <small>
              Intensity:
              ${Math.round(
                rivalry.intensity
              )}/100
            </small>

            <small>
              Matches:
              ${rivalry.matches}
            </small>

            <small>
              Transfers:
              ${rivalry.transfers}
            </small>
          </div>
        </div>
      `;
    }
  );

  html += `
      <button
        onclick="closeV13Modal()"
      >
        Tutup
      </button>
    </div>
  `;

  showV13Modal(html);
}

/* =========================================================
   AWARDS
   ========================================================= */

function calculateAwards() {
  const players =
    game.teams.flatMap(
      team =>
        team.players.map(
          p => ({
            ...p,
            teamName: team.name
          })
        )
    );

  if (!players.length) return [];

  const mvp =
    [...players].sort(
      (a, b) =>
        b.mvp - a.mvp
    )[0];

  const kills =
    [...players].sort(
      (a, b) =>
        b.kills - a.kills
    )[0];

  const assists =
    [...players].sort(
      (a, b) =>
        b.assists - a.assists
    )[0];

  return [
    {
      award: "MVP Season",
      player: mvp
    },
    {
      award: "Top Killer",
      player: kills
    },
    {
      award: "Top Assist",
      player: assists
    }
  ];
}

function openAwards() {
  const awards =
    game.awards.length
      ? game.awards
      : calculateAwards();

  let html = `
    <div class="v13-modal">
      <h2>🏆 Season Awards</h2>
  `;

  if (!awards.length) {
    html += `
      <p>Award belum tersedia.</p>
    `;
  }

  awards.forEach(
    award => {
      const player =
        award.player;

      if (!player) return;

      html += `
        <div class="v13-player">
          <div>
            <strong>
              ${award.award}
            </strong>

            <small>
              ${player.name}
            </small>

            <small>
              ${player.teamName || ""}
            </small>
          </div>
        </div>
      `;
    }
  );

  html += `
      <button
        onclick="closeV13Modal()"
      >
        Tutup
      </button>
    </div>
  `;

  showV13Modal(html);
}

/* =========================================================
   SEASON FINISH
   ========================================================= */

function finishSeason() {
  const standings =
    getStandings();

  const champion =
    game.schedule
      .filter(
        m =>
          m.phase === "final"
      )
      .map(
        m =>
          game.teams.find(
            t => t.id === m.winner
          )
      )
      .filter(Boolean)[0];

  const position =
    standings.findIndex(
      t =>
        t.id === game.team.id
    ) + 1;

  let resultText =
    `Finish posisi #${position}`;

  if (
    champion &&
    champion.id === game.team.id
  ) {
    resultText =
      "🏆 JUARA";
  }

  const awards =
    calculateAwards();

  game.awards = awards;

  game.history.unshift({
    year: game.year,
    teamName: game.team.name,
    result: resultText,
    position,
    champion:
      champion?.name || null,
    awards: clone(awards)
  });

  evaluateTarget(position);

  addNews(
    `🏁 Musim ${game.year} selesai. ${game.team.name}: ${resultText}.`
  );

  processEndSeasonContracts();

  developAllPlayers();

  game.year++;

  game.date =
    `${game.year}-01-05`;

  game.phase = "regular";

  game.seasonStats = {
    matches: 0,
    wins: 0,
    losses: 0,
    playerStats: {},
    teamStats: {}
  };

  createSeason();

  saveGame(false);

  alert(
    `Musim selesai!\n${resultText}\nMusim baru ${game.year} dimulai.`
  );
}

/* =========================================================
   TARGET EVALUATION
   ========================================================= */

function evaluateTarget(position) {
  let success = false;

  if (game.target === "champion") {
    success = position === 1;
  }

  if (game.target === "top3") {
    success = position <= 3;
  }

  if (game.target === "playoff") {
    success = position <= 4;
  }

  if (game.target === "build") {
    success =
      game.team.players.some(
        p => p.rating >= 80
      );
  }

  if (success) {
    game.reputation =
      clamp(
        game.reputation + 8,
        0,
        100
      );

    game.budget +=
      100000000;

    addNews(
      `🎯 Target musim tercapai! Bonus organisasi +Rp 100 juta.`
    );
  } else {
    game.reputation =
      clamp(
        game.reputation - 5,
        0,
        100
      );

    addNews(
      `⚠️ Target musim belum tercapai.`
    );
  }
}

/* =========================================================
   CONTRACT END SEASON
   ========================================================= */

function processEndSeasonContracts() {
  game.teams.forEach(team => {
    const remaining = [];

    team.players.forEach(player => {
      if (
        !contractEndingThisSeason(player)
      ) {
        remaining.push(player);
        return;
      }

      if (
        team.id === game.team.id
      ) {
        remaining.push(player);
        return;
      }

      const important =
        team.startingFive.includes(
          player.id
        ) ||
        player.rating >= 78;

      if (
        important &&
        team.budget >=
          player.salary * 2
      ) {
        player.contractUntil =
          `${game.year + 1}-12-31`;

        remaining.push(player);

        return;
      }

      player.status =
        "free_agent";

      player.teamId = null;
      player.formerTeam =
        team.name;

      game.freeAgents.push(
        player
      );

      addNews(
        `📤 ${player.name} meninggalkan ${team.name} dan masuk Free Agent.`
      );
    });

    team.players =
      remaining;

    chooseBestLineup(team);
  });

  game.freeAgents =
    game.freeAgents.filter(
      p =>
        p.status === "free_agent"
    );
}

/* =========================================================
   ORGANIZATION
   ========================================================= */

function upgradeOrganization() {
  const costs = {
    1: 100000000,
    2: 175000000,
    3: 275000000,
    4: 400000000
  };

  const cost =
    costs[game.organizationLevel];

  if (!cost) {
    alert(
      "Organization sudah level maksimal."
    );
    return;
  }

  if (game.budget < cost) {
    alert(
      `Budget tidak cukup.\nButuh ${money(cost)}`
    );
    return;
  }

  game.budget -= cost;

  game.organizationLevel++;

  game.team.chemistry =
    clamp(
      game.team.chemistry + 5,
      0,
      100
    );

  addNews(
    `🏢 Organization naik ke Level ${game.organizationLevel}.`
  );

  saveGame(false);

  renderDashboard();
}

/* =========================================================
   PROFILE PLAYER
   ========================================================= */

function openPlayerProfile(playerId) {
  const player =
    findPlayerEverywhere(
      playerId
    );

  if (!player) return;

  showV13Modal(`
    <div class="v13-modal">
      <h2>${player.name}</h2>

      <div class="v13-profile">
        <div>Role: <b>${player.role}</b></div>
        <div>OVR: <b>${player.rating}</b></div>
        <div>Potential: <b>${player.potential}</b></div>
        <div>Age: <b>${player.age}</b></div>
        <div>Form: <b>${Math.round(player.form)}</b></div>
        <div>Fitness: <b>${Math.round(player.fitness)}</b></div>
        <div>Morale: <b>${Math.round(player.morale)}</b></div>
        <div>Salary: <b>${money(player.salary)}</b></div>
        <div>Market Value: <b>${money(player.marketValue)}</b></div>
        <div>Matches: <b>${player.matchesPlayed}</b></div>
        <div>Wins: <b>${player.wins}</b></div>
        <div>Losses: <b>${player.losses}</b></div>
        <div>MVP: <b>${player.mvp}</b></div>
        <div>Kills: <b>${player.kills}</b></div>
        <div>Deaths: <b>${player.deaths}</b></div>
        <div>Assists: <b>${player.assists}</b></div>
      </div>

      <button onclick="closeV13Modal()">
        Tutup
      </button>
    </div>
  `);
}

/* =========================================================
   V1.3 MODAL
   ========================================================= */

function showV13Modal(html) {
  let modal =
    document.getElementById(
      "v13Modal"
    );

  if (!modal) {
    modal =
      document.createElement("div");

    modal.id =
      "v13Modal";

    modal.className =
      "v13-overlay";

    document.body.appendChild(
      modal
    );
  }

  modal.innerHTML = html;
  modal.style.display = "flex";
}

function closeV13Modal() {
  const modal =
    document.getElementById(
      "v13Modal"
    );

  if (modal) {
    modal.style.display =
      "none";
  }
}

/* =========================================================
   SAVE / RESTART
   ========================================================= */

function restartGame() {
  const confirmRestart =
    confirm(
      "Yakin ingin menghapus career dan mulai dari awal?"
    );

  if (!confirmRestart) return;

  localStorage.removeItem(
    SAVE_KEY
  );

  OLD_SAVE_KEYS.forEach(
    key =>
      localStorage.removeItem(key)
  );

  game =
    createDefaultGame();

  selectedTarget =
    "top3";

  renderCountries();
}

function loadSavedCareer() {
  if (loadGame()) {
    if (game.team) {
      renderDashboard();
      showScreen(
        "dashboardScreen"
      );
    }
  }
}

/* =========================================================
   INBOX
   ========================================================= */

function openInbox() {
  let html = `
    <div class="v13-modal">
      <h2>📨 Inbox</h2>
  `;

  if (!game.inbox.length) {
    html += `
      <p>Inbox kosong.</p>
    `;
  }

  game.inbox.forEach(
    mail => {
      html += `
        <div class="v13-player">
          <div>
            <strong>
              ${mail.title}
            </strong>

            <small>
              ${formatDate(mail.date)}
            </small>

            <p>
              ${mail.message}
            </p>
          </div>
        </div>
      `;
    }
  );

  html += `
      <button
        onclick="closeV13Modal()"
      >
        Tutup
      </button>
    </div>
  `;

  showV13Modal(html);
}

/* =========================================================
   LINEUP
   ========================================================= */

function openLineup() {
  let html = `
    <div class="v13-modal">
      <h2>🎮 Starting Five</h2>

      <p>
        Role coverage:
        ${Math.round(
          roleCoverage(
            getStartingPlayers(
              game.team
            )
          )
        )}
      </p>
  `;

  game.team.players
    .sort(
      (a, b) =>
        lineupScore(b) -
        lineupScore(a)
    )
    .forEach(
      player => {
        const starter =
          game.team.startingFive.includes(
            player.id
          );

        html += `
          <div class="v13-player">
            <div>
              <strong>
                ${player.name}
              </strong>

              <small>
                ${player.role}
                • OVR ${player.rating}
                • Form ${Math.round(player.form)}
              </small>
            </div>

            <button
              onclick="toggleStarter('${player.id}')"
            >
              ${
                starter
                  ? "Starter"
                  : "Bench"
              }
            </button>
          </div>
        `;
      }
    );

  html += `
      <button onclick="autoLineup()">
        🤖 Auto Lineup
      </button>

      <button onclick="closeV13Modal()">
        Tutup
      </button>
    </div>
  `;

  showV13Modal(html);
}

function toggleStarter(playerId) {
  const index =
    game.team.startingFive
      .indexOf(playerId);

  if (index >= 0) {
    if (
      game.team.startingFive.length <= 5
    ) {
      alert(
        "Starting Five harus berisi 5 pemain."
      );
      return;
    }

    game.team.startingFive.splice(
      index,
      1
    );
  } else {
    if (
      game.team.startingFive.length >= 5
    ) {
      alert(
        "Starting Five sudah penuh."
      );
      return;
    }

    game.team.startingFive.push(
      playerId
    );
  }

  game.team.chemistry =
    clamp(
      game.team.chemistry + rand(-1, 1),
      40,
      100
    );

  saveGame(false);
  openLineup();
}

function autoLineup() {
  chooseBestLineup(
    game.team
  );

  saveGame(false);

  openLineup();
}

/* =========================================================
   WORLD / INTERNATIONAL
   ========================================================= */

function qualifyInternational() {
  const rank =
    getWorldRank(
      game.team.id
    );

  if (rank <= 4) {
    game.msc.status =
      "Qualified";

    return true;
  }

  game.msc.status =
    "Not Qualified";

  return false;
}

function updateInternationalStatus() {
  qualifyInternational();

  if (
    getWorldRank(game.team.id) <= 8
  ) {
    game.mSeries.status =
      "Potential Qualification";
  } else {
    game.mSeries.status =
      "Not Qualified";
  }
}

/* =========================================================
   V1.3 CSS
   ========================================================= */

function injectV13Styles() {
  if (
    document.getElementById(
      "v13Styles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "v13Styles";

  style.textContent = `
    .v13-panel {
      margin: 16px 0;
      padding: 16px;
      border-radius: 18px;
      background: rgba(20,20,28,.96);
      color: white;
      box-shadow: 0 10px 30px rgba(0,0,0,.18);
    }

    .v13-title {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 12px;
    }

    .v13-grid {
      display: grid;
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .v13-card {
      padding: 12px;
      border-radius: 12px;
      background: rgba(255,255,255,.07);
    }

    .v13-card small {
      display: block;
      opacity: .65;
      font-size: 10px;
      margin-bottom: 5px;
    }

    .v13-card strong {
      font-size: 14px;
    }

    .v13-actions {
      display: grid;
      grid-template-columns:
        repeat(2, minmax(0,1fr));
      gap: 8px;
      margin-top: 12px;
    }

    .v13-actions button,
    .v13-modal button {
      border: 0;
      border-radius: 12px;
      padding: 11px;
      font-weight: 700;
      cursor: pointer;
    }

    .v13-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 14px;
      background: rgba(0,0,0,.72);
    }

    .v13-modal {
      width: min(620px, 100%);
      max-height: 90vh;
      overflow-y: auto;
      padding: 18px;
      border-radius: 20px;
      background: #17171f;
      color: white;
      box-shadow: 0 20px 60px rgba(0,0,0,.45);
    }

    .v13-modal h2 {
      margin-top: 0;
    }

    .v13-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 12px 0;
    }

    .v13-player {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 14px;
      background: rgba(255,255,255,.07);
    }

    .v13-player > div {
      min-width: 0;
    }

    .v13-player strong,
    .v13-player small {
      display: block;
    }

    .v13-player small {
      margin-top: 4px;
      opacity: .7;
    }

    .v13-player p {
      margin-bottom: 0;
      opacity: .85;
    }

    .v13-profile {
      display: grid;
      grid-template-columns:
        repeat(2, minmax(0,1fr));
      gap: 8px;
      margin: 14px 0;
    }

    .v13-profile div {
      padding: 10px;
      border-radius: 10px;
      background: rgba(255,255,255,.07);
    }

    @media(max-width:520px) {
      .v13-grid,
      .v13-actions,
      .v13-profile {
        grid-template-columns: 1fr;
      }

      .v13-player {
        align-items: flex-start;
      }

      .v13-modal {
        padding: 14px;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

/* =========================================================
   DASHBOARD EXTRA BUTTONS
   ========================================================= */

function injectV13DashboardButtons() {
  if (
    document.getElementById(
      "v13QuickButtons"
    )
  ) {
    return;
  }

  const dashboard =
    document.getElementById(
      "dashboardScreen"
    );

  if (!dashboard) return;

  const box =
    document.createElement("div");

  box.id =
    "v13QuickButtons";

  box.className =
    "v13-panel";

  box.innerHTML = `
    <div class="v13-title">
      ⚡ Quick Management
    </div>

    <div class="v13-actions">
      <button onclick="openLineup()">
        🎮 Lineup
      </button>

      <button onclick="openFreeAgents()">
        🆓 Free Agent
      </button>

      <button onclick="openOffers()">
        🤝 Offers
      </button>

      <button onclick="openRivalries()">
        ⚔️ Rivalry
      </button>

      <button onclick="openAwards()">
        🏆 Awards
      </button>

      <button onclick="openInbox()">
        📨 Inbox
      </button>

      <button onclick="openStandings()">
        📊 Standings
      </button>

      <button onclick="upgradeOrganization()">
        🏢 Upgrade Org
      </button>
    </div>
  `;

  dashboard.appendChild(box);
}

/* =========================================================
   DASHBOARD RENDER WRAPPER
   ========================================================= */

const originalRenderDashboard =
  renderDashboard;

renderDashboard = function () {
  originalRenderDashboard();

  injectV13Styles();
  injectV13DashboardButtons();

  updateInternationalStatus();
};

/* =========================================================
   ROSTER CLICKABLE PROFILE
   ========================================================= */

function renderDetailedRoster() {
  const list =
    document.getElementById(
      "rosterList"
    );

  if (!list || !game.team) return;

  list.innerHTML =
    game.team.players
      .map(
        player => `
          <div
            class="player-card"
            onclick="openPlayerProfile('${player.id}')"
            style="cursor:pointer"
          >
            <div>
              <strong>
                ${player.name}
              </strong>

              <div>
                ${player.role}
                • OVR ${player.rating}
              </div>
            </div>

            <div>
              <small>
                Form
                ${Math.round(player.form)}
              </small>

              <br>

              <small>
                Fit
                ${Math.round(player.fitness)}
              </small>
            </div>
          </div>
        `
      )
      .join("");
}

/* =========================================================
   OVERRIDE ROSTER
   ========================================================= */

openRoster = function () {
  showScreen("rosterScreen");

  renderDetailedRoster();
};

/* =========================================================
   TRANSFER / AI DAILY MANAGEMENT
   ========================================================= */

function dailyAIManagement() {
  chooseAllAILineups();

  game.teams.forEach(team => {
    if (
      team.id === game.team.id
    ) {
      return;
    }

    if (
      chance(5)
    ) {
      aiRenewContracts();
    }

    if (
      transferWindowOpen() &&
      chance(10)
    ) {
      aiSignFreeAgent(team);
    }

    if (
      transferWindowOpen() &&
      chance(5)
    ) {
      aiReleasePlayer(team);
    }
  });
}

/* =========================================================
   FINANCIAL SAFETY
   ========================================================= */

function syncUserBudget() {
  if (!game.team) return;

  game.team.budget =
    game.budget;
}

function syncTeamBudget() {
  if (!game.team) return;

  game.budget =
    game.team.budget;
}

/* =========================================================
   SAVE OVERRIDE
   ========================================================= */

const originalSaveGame =
  saveGame;

saveGame = function (
  showMessage = true
) {
  syncUserBudget();

  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );

    if (showMessage) {
      alert(
        "💾 Career V1.3 berhasil disimpan."
      );
    }
  } catch (error) {
    console.error(
      "SAVE ERROR:",
      error
    );

    alert(
      "Gagal menyimpan career."
    );
  }
};

/* =========================================================
   RESTART OVERRIDE
   ========================================================= */

const originalRestartGame =
  restartGame;

restartGame = function () {
  const ok =
    confirm(
      "Hapus career V1.3 dan mulai dari awal?"
    );

  if (!ok) return;

  localStorage.removeItem(
    SAVE_KEY
  );

  OLD_SAVE_KEYS.forEach(
    key =>
      localStorage.removeItem(key)
  );

  game =
    createDefaultGame();

  selectedTarget =
    "top3";

  injectV13Styles();

  renderCountries();
};

/* =========================================================
   START CAREER OVERRIDE
   ========================================================= */

const originalStartCareer =
  startCareer;

startCareer = function () {
  originalStartCareer();

  if (
    game &&
    game.team
  ) {
    game.team.budget =
      game.budget;

    chooseBestLineup(
      game.team
    );

    initializeFreeAgents();
    initializeWorldRanking();

    saveGame(false);
  }
};

/* =========================================================
   SELECT TEAM OVERRIDE
   ========================================================= */

const originalSelectTeam =
  selectTeam;

selectTeam = function (
  teamId
) {
  game.selectedTeam =
    teamId;

  const setup =
    document.getElementById(
      "managerSetupScreen"
    );

  if (setup) {
    showScreen(
      "managerSetupScreen"
    );
  }
};

/* =========================================================
   MATCH NAVIGATION SAFETY
   ========================================================= */

function openNextUserMatch() {
  const match =
    game.schedule.find(
      m =>
        !m.played &&
        (
          m.home === game.team.id ||
          m.away === game.team.id
        )
    );

  if (!match) {
    alert(
      "Tidak ada match tersisa."
    );
    return;
  }

  if (
    new Date(match.date) >
    new Date(game.date)
  ) {
    game.date =
      match.date;
  }

  openMatch(match.id);
}

/* =========================================================
   FIX AI MATCH RESULT SCREEN
   ========================================================= */

const originalSimulateCurrentMatch =
  simulateCurrentMatch;

function simulateMatchSilently(match) {
  const oldCurrent =
    game.currentMatch;

  game.currentMatch =
    match;

  const home =
    game.teams.find(
      t => t.id === match.home
    );

  const away =
    game.teams.find(
      t => t.id === match.away
    );

  if (!home || !away) {
    game.currentMatch =
      oldCurrent;
    return;
  }

  chooseBestLineup(home);
  chooseBestLineup(away);

  let hp =
    calculateTeamPower(home) +
    2.5 +
    managerMatchBonus(home);

  let ap =
    calculateTeamPower(away) +
    managerMatchBonus(away);

  hp +=
    rivalryBonus(
      home,
      away
    );

  hp += randFloat(-5, 5);
  ap += randFloat(-5, 5);

  const need =
    Math.ceil(
      match.bestOf / 2
    );

  let hs = 0;
  let as = 0;

  const homeStats = [];
  const awayStats = [];

  while (
    hs < need &&
    as < need
  ) {
    if (
      hp + randFloat(-7, 7) >=
      ap + randFloat(-7, 7)
    ) {
      hs++;

      homeStats.push(
        createGamePlayerStats(
          getStartingPlayers(home),
          true
        )
      );

      awayStats.push(
        createGamePlayerStats(
          getStartingPlayers(away),
          false
        )
      );
    } else {
      as++;

      homeStats.push(
        createGamePlayerStats(
          getStartingPlayers(home),
          false
        )
      );

      awayStats.push(
        createGamePlayerStats(
          getStartingPlayers(away),
          true
        )
      );
    }
  }

  const winner =
    hs > as
      ? home
      : away;

  const loser =
    winner.id === home.id
      ? away
      : home;

  match.homeScore = hs;
  match.awayScore = as;
  match.winner = winner.id;
  match.played = true;

  applyTeamMatchResult(
    winner,
    loser,
    winner.id === home.id,
    match
  );

  applyPlayerMatchStats(
    home,
    away,
    homeStats,
    awayStats,
    hs,
    as
  );

  applyMatchFatigue(home);
  applyMatchFatigue(away);

  checkInjuries(home);
  checkInjuries(away);

  updateWorldRankingMatch(
    winner,
    loser,
    match.phase !== "regular"
  );

  game.seasonStats.matches++;

  if (
    winner.id === game.team.id
  ) {
    game.seasonStats.wins++;
  }

  if (
    loser.id === game.team.id
  ) {
    game.seasonStats.losses++;
  }

  game.currentMatch =
    oldCurrent;
}

/* =========================================================
   REPLACE AI SIMULATION
   ========================================================= */

simulateAIMatches = function () {
  const matches =
    game.schedule.filter(
      m =>
        !m.played &&
        m.date <= game.date
    );

  matches.forEach(match => {
    if (
      match.home === game.team.id ||
      match.away === game.team.id
    ) {
      return;
    }

    simulateMatchSilently(
      match
    );
  });

  checkSeasonProgress();
};

/* =========================================================
   FINAL ADVANCE DAY
   ========================================================= */

advanceDay = function () {
  if (!game || !game.team) return;

  game.date =
    addDays(
      game.date,
      1
    );

  recoverPlayers();

  updateAllPlayerForms();

  dailyAIManagement();

  simulateAIMatches();

  checkInjuries(
    game.team
  );

  if (
    new Date(game.date).getDate() === 1
  ) {
    processMonthlyFinance();
  }

  if (
    transferWindowOpen()
  ) {
    processAITransfers();
  }

  chooseAllAILineups();

  checkSeasonProgress();

  renderDashboard();

  saveGame(false);
};

/* =========================================================
   CURRENT MATCH BUTTON
   ========================================================= */

playNextMatch = function () {
  const match =
    game.schedule.find(
      m =>
        !m.played &&
        (
          m.home === game.team.id ||
          m.away === game.team.id
        )
    );

  if (!match) {
    checkSeasonProgress();
    renderDashboard();
    return;
  }

  if (
    new Date(match.date) >
    new Date(game.date)
  ) {
    game.date =
      match.date;
  }

  openMatch(
    match.id
  );
};

/* =========================================================
   SCHEDULE SAFETY
   ========================================================= */

function getNextUserMatch() {
  return game.schedule
    .filter(
      m =>
        !m.played &&
        (
          m.home === game.team.id ||
          m.away === game.team.id
        )
    )
    .sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    )[0] || null;
}

/* =========================================================
   INITIAL LOAD
   ========================================================= */

function bootV13() {
  injectV13Styles();

  if (!game) {
    game =
      createDefaultGame();
  }

  const loaded =
    loadGame();

  if (loaded && game.team) {
    syncTeamBudget();

    initializeFreeAgents();

    if (
      !game.worldRanking.length
    ) {
      initializeWorldRanking();
    }

    initializeAIManagers();

    chooseAllAILineups();

    renderDashboard();

    showScreen(
      "dashboardScreen"
    );

    saveGame(false);

    return;
  }

  renderCountries();
}

/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    bootV13();
  }
);

/* =========================================================
   FALLBACK
   ========================================================= */

if (
  document.readyState !==
  "loading"
) {
  setTimeout(
    () => {
      if (
        !game ||
        !game.team
      ) {
        bootV13();
      }
    },
    100
  );
}

/* =========================================================
   END V1.3
   ========================================================= */
