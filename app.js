/*
=========================================
MLBB PRO MANAGER
VERSION 0.1
=========================================
*/


// =======================================
// DATA
// =======================================

const gameData = {

  countries: [
    {
      id: "indonesia",
      name: "Indonesia",
      flag: "🇮🇩",
      description: "Mobile Legends Professional League Indonesia",

      leagues: [
        {
          id: "mpl-id",
          name: "MPL Indonesia",
          short: "MPL ID",

          teams: [
            {
              id: "rrq",
              name: "RRQ",
              short: "RRQ"
            },
            {
              id: "evos",
              name: "EVOS",
              short: "EVOS"
            },
            {
              id: "onic",
              name: "ONIC",
              short: "ONIC"
            },
            {
              id: "bigetron",
              name: "Bigetron",
              short: "BTR"
            },
            {
              id: "alter-ego",
              name: "Alter Ego",
              short: "AE"
            },
            {
              id: "dewa",
              name: "Dewa United",
              short: "DEWA"
            },
            {
              id: "dewa-united",
              name: "Dewa United",
              short: "DU"
            },
            {
              id: "navi",
              name: "NAVI",
              short: "NAVI"
            }
          ]
        }
      ]
    },


    {
      id: "philippines",
      name: "Philippines",
      flag: "🇵🇭",
      description: "Mobile Legends Professional League Philippines",

      leagues: [
        {
          id: "mpl-ph",
          name: "MPL Philippines",
          short: "MPL PH",

          teams: [
            {
              id: "fnatic-onic",
              name: "FNATIC ONIC",
              short: "ONIC"
            },
            {
              id: "team-liquid-echo",
              name: "Team Liquid ECHO",
              short: "TLID"
            },
            {
              id: "falcons-ap-bren",
              name: "Falcons AP Bren",
              short: "FLCB"
            },
            {
              id: "rsg-ph",
              name: "RSG Philippines",
              short: "RSG"
            }
          ]
        }
      ]
    },


    {
      id: "malaysia",
      name: "Malaysia",
      flag: "🇲🇾",
      description: "Mobile Legends Professional League Malaysia",

      leagues: [
        {
          id: "mpl-my",
          name: "MPL Malaysia",
          short: "MPL MY",

          teams: [
            {
              id: "selangor-red-giants",
              name: "Selangor Red Giants",
              short: "SRG"
            },
            {
              id: "todak",
              name: "TODAK",
              short: "TODAK"
            },
            {
              id: "homebois",
              name: "HomeBois",
              short: "HB"
            }
          ]
        }
      ]
    },


    {
      id: "singapore",
      name: "Singapore",
      flag: "🇸🇬",
      description: "Mobile Legends Professional League Singapore",

      leagues: [
        {
          id: "mpl-sg",
          name: "MPL Singapore",
          short: "MPL SG",

          teams: [
            {
              id: "rsg-sg",
              name: "RSG Singapore",
              short: "RSG"
            },
            {
              id: "evos-sg",
              name: "EVOS SG",
              short: "EVOS"
            }
          ]
        }
      ]
    },


    {
      id: "cambodia",
      name: "Cambodia",
      flag: "🇰🇭",
      description: "Mobile Legends Professional League Cambodia",

      leagues: [
        {
          id: "mpl-kh",
          name: "MPL Cambodia",
          short: "MPL KH",

          teams: [
            {
              id: "see-you-soon",
              name: "See You Soon",
              short: "SYS"
            }
          ]
        }
      ]
    },


    {
      id: "brazil",
      name: "Brazil",
      flag: "🇧🇷",
      description: "Mobile Legends Professional League Brazil",

      leagues: [
        {
          id: "mpl-br",
          name: "MPL Brazil",
          short: "MPL BR",

          teams: [
            {
              id: "red-canids",
              name: "RED Canids",
              short: "RED"
            }
          ]
        }
      ]
    }
  ]

};


// =======================================
// GAME STATE
// =======================================

let selectedCountry = null;
let selectedLeague = null;
let selectedTeam = null;


// =======================================
// DOM
// =======================================

const countryScreen = document.getElementById("countryScreen");
const leagueScreen = document.getElementById("leagueScreen");
const teamScreen = document.getElementById("teamScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

const countryList = document.getElementById("countryList");
const leagueList = document.getElementById("leagueList");
const teamList = document.getElementById("teamList");


// =======================================
// SCREEN CONTROL
// =======================================

function showScreen(screen) {

  document.querySelectorAll(".screen").forEach(element => {
    element.classList.remove("active");
  });

  screen.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// =======================================
// COUNTRY
// =======================================

function renderCountries() {

  countryList.innerHTML = "";

  gameData.countries.forEach(country => {

    const button = document.createElement("button");

    button.className = "option-button";

    button.innerHTML = `
      <strong>${country.flag} ${country.name}</strong>
      <small>${country.description}</small>
    `;

    button.addEventListener("click", () => {
      selectCountry(country.id);
    });

    countryList.appendChild(button);

  });

}


// =======================================
// SELECT COUNTRY
// =======================================

function selectCountry(countryId) {

  selectedCountry =
    gameData.countries.find(country => country.id === countryId);

  if (!selectedCountry) return;

  document.getElementById("selectedCountryTitle").textContent =
    selectedCountry.name;

  renderLeagues();

  showScreen(leagueScreen);
}


// =======================================
// LEAGUE
// =======================================

function renderLeagues() {

  leagueList.innerHTML = "";

  if (!selectedCountry.leagues.length) {

    leagueList.innerHTML = `
      <div class="option-button">
        <strong>Belum tersedia</strong>
        <small>
          Data liga untuk region ini akan ditambahkan
          pada versi berikutnya.
        </small>
      </div>
    `;

    return;
  }


  selectedCountry.leagues.forEach(league => {

    const button = document.createElement("button");

    button.className = "option-button";

    button.innerHTML = `
      <strong>${league.name}</strong>
      <small>${league.short}</small>
    `;

    button.addEventListener("click", () => {
      selectLeague(league.id);
    });

    leagueList.appendChild(button);

  });

}


// =======================================
// SELECT LEAGUE
// =======================================

function selectLeague(leagueId) {

  selectedLeague =
    selectedCountry.leagues.find(
      league => league.id === leagueId
    );

  if (!selectedLeague) return;

  document.getElementById("selectedLeagueTitle").textContent =
    selectedLeague.name;

  renderTeams();

  showScreen(teamScreen);
}


// =======================================
// TEAM
// =======================================

function renderTeams() {

  teamList.innerHTML = "";

  selectedLeague.teams.forEach(team => {

    const button = document.createElement("button");

    button.className = "team-button";

    button.innerHTML = `
      <div class="team-logo">
        ${team.short}
      </div>

      <div>
        <strong>${team.name}</strong>
        <small>${selectedLeague.short}</small>
      </div>
    `;

    button.addEventListener("click", () => {
      selectTeam(team.id);
    });

    teamList.appendChild(button);

  });

}


// =======================================
// SELECT TEAM
// =======================================

function selectTeam(teamId) {

  selectedTeam =
    selectedLeague.teams.find(
      team => team.id === teamId
    );

  if (!selectedTeam) return;


  document.getElementById("dashboardTeam").textContent =
    selectedTeam.name;

  document.getElementById("dashboardLeague").textContent =
    `${selectedLeague.name} • ${selectedCountry.name}`;


  saveCareer();

  showScreen(dashboardScreen);
}


// =======================================
// BACK BUTTONS
// =======================================

function backToCountry() {

  showScreen(countryScreen);

}


function backToLeague() {

  showScreen(leagueScreen);

}


// =======================================
// RESTART
// =======================================

function restartGame() {

  selectedCountry = null;
  selectedLeague = null;
  selectedTeam = null;

  localStorage.removeItem("mlbbProManagerCareer");

  showScreen(countryScreen);

}


// =======================================
// SAVE
// =======================================

function saveCareer() {

  const career = {

    country: selectedCountry.id,

    league: selectedLeague.id,

    team: selectedTeam.id

  };

  localStorage.setItem(
    "mlbbProManagerCareer",
    JSON.stringify(career)
  );

}


// =======================================
// LOAD CAREER
// =======================================

function loadCareer() {

  const saved =
    localStorage.getItem("mlbbProManagerCareer");

  if (!saved) return;

  try {

    const career = JSON.parse(saved);


    const country =
      gameData.countries.find(
        item => item.id === career.country
      );

    if (!country) return;


    const league =
      country.leagues.find(
        item => item.id === career.league
      );

    if (!league) return;


    const team =
      league.teams.find(
        item => item.id === career.team
      );

    if (!team) return;


    selectedCountry = country;
    selectedLeague = league;
    selectedTeam = team;


    document.getElementById("dashboardTeam").textContent =
      team.name;

    document.getElementById("dashboardLeague").textContent =
      `${league.name} • ${country.name}`;

  } catch (error) {

    console.error(
      "Gagal membaca career save:",
      error
    );

  }

}


// =======================================
// START
// =======================================

renderCountries();

loadCareer();


// =======================================
// DEBUG
// =======================================

console.log("MLBB Pro Manager V0.1 loaded.");
