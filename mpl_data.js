/* =========================================================
   MLBB PRO MANAGER
   LEAGUE DATABASE V1.5
   ========================================================= */

function P(name, role, rating, nationality) {

  return {
    name,
    role,
    rating,
    potential: Math.min(99, rating + Math.floor(Math.random() * 10)),
    nationality,
    age: 18 + Math.floor(Math.random() * 9)
  };

}


const MPL_ID_2026 = {

  id: "mpl_id",
  name: "MPL Indonesia",
  region: "Indonesia",
  season: 2026,

  teams: [

    {
      id: "rrq",
      name: "RRQ",
      players: [
        P("Skylar", "GOLD", 91, "ID"),
        P("Sutsujin", "JG", 89, "ID"),
        P("Rinz", "MID", 88, "ID"),
        P("Khezcute", "ROAM", 87, "ID"),
        P("Lemon", "EXP", 84, "ID"),
        P("Aran", "EXP", 82, "ID"),
        P("Clayyy", "MID", 82, "ID")
      ]
    },

    {
      id: "evos",
      name: "EVOS",
      players: [
        P("Alberttt", "JG", 89, "ID"),
        P("Branz", "GOLD", 87, "ID"),
        P("DreamS", "ROAM", 84, "ID"),
        P("Vaanstrong", "MID", 83, "ID"),
        P("Fluffy", "EXP", 84, "ID"),
        P("JungleKid", "JG", 80, "ID"),
        P("Raven", "GOLD", 79, "ID")
      ]
    },

    {
      id: "onic",
      name: "ONIC",
      players: [
        P("Kairi", "JG", 92, "PH"),
        P("Sanz", "MID", 91, "ID"),
        P("CW", "GOLD", 89, "ID"),
        P("Butsss", "EXP", 88, "ID"),
        P("Kiboy", "ROAM", 88, "ID"),
        P("Caderaa", "GOLD", 82, "ID"),
        P("Yeb", "MID", 81, "ID")
      ]
    },

    {
      id: "geek",
      name: "Geek Fam",
      players: [
        P("Caderaa", "GOLD", 84, "ID"),
        P("Aboy", "MID", 83, "ID"),
        P("Luke", "EXP", 82, "ID"),
        P("Nnael", "JG", 84, "ID"),
        P("Baloyskie", "ROAM", 86, "PH"),
        P("Junior", "EXP", 78, "ID"),
        P("Zeta", "JG", 78, "ID")
      ]
    },

    {
      id: "dewa",
      name: "Dewa United",
      players: [
        P("Fighter", "EXP", 81, "ID"),
        P("Jungler", "JG", 82, "ID"),
        P("MidOne", "MID", 80, "ID"),
        P("Goldie", "GOLD", 81, "ID"),
        P("Roamer", "ROAM", 79, "ID"),
        P("Youngster", "MID", 77, "ID"),
        P("Flex", "EXP", 76, "ID")
      ]
    },

    {
      id: "bigetron",
      name: "Bigetron",
      players: [
        P("SuperKenz", "MID", 85, "ID"),
        P("Kenn", "EXP", 83, "ID"),
        P("Moreno", "MID", 86, "ID"),
        P("Gamora", "ROAM", 82, "ID"),
        P("Saken", "JG", 82, "ID"),
        P("GoldStar", "GOLD", 80, "ID"),
        P("Junior", "JG", 77, "ID")
      ]
    },

    {
      id: "aura",
      name: "AURA Fire",
      players: [
        P("Facehugger", "MID", 84, "ID"),
        P("Kabuki", "GOLD", 83, "ID"),
        P("High", "ROAM", 81, "ID"),
        P("Jamet", "EXP", 80, "ID"),
        P("JunglerX", "JG", 81, "ID"),
        P("Rex", "GOLD", 76, "ID"),
        P("Nova", "EXP", 77, "ID")
      ]
    },

    {
      id: "dewa2",
      name: "Alter Ego",
      players: [
        P("Nino", "GOLD", 86, "ID"),
        P("Pai", "EXP", 87, "ID"),
        P("Udil", "MID", 87, "ID"),
        P("Celiboy", "JG", 83, "ID"),
        P("Leomurphy", "ROAM", 84, "ID"),
        P("Rexxy", "JG", 79, "ID"),
        P("Arss", "EXP", 78, "ID")
      ]
    }

  ]

};


const MPL_PH_2026 = {

  id: "mpl_ph",
  name: "MPL Philippines",
  region: "Philippines",
  season: 2026,

  teams: [

    {
      id: "echo",
      name: "Team Liquid ECHO",
      players: [
        P("Sanford", "EXP", 91, "PH"),
        P("KarlTzy", "JG", 92, "PH"),
        P("Yawi", "ROAM", 90, "PH"),
        P("Jaypee", "GOLD", 88, "PH"),
        P("Super Red", "MID", 88, "PH"),
        P("Bennyqt", "GOLD", 87, "PH"),
        P("Sanji", "MID", 84, "PH")
      ]
    },

    {
      id: "fnatic",
      name: "Fnatic ONIC PH",
      players: [
        P("Kairi", "JG", 93, "PH"),
        P("Super Frince", "MID", 90, "PH"),
        P("Kelra", "GOLD", 92, "PH"),
        P("KurtTzy", "EXP", 87, "PH"),
        P("Kiboy", "ROAM", 89, "PH"),
        P("Demonkite", "JG", 85, "PH"),
        P("Basic", "GOLD", 84, "PH")
      ]
    },

    {
      id: "falcons",
      name: "Falcons AP Bren",
      players: [
        P("Owgwen", "ROAM", 89, "PH"),
        P("KyleTzy", "JG", 90, "PH"),
        P("Super Marco", "GOLD", 91, "PH"),
        P("FlapTzy", "EXP", 89, "PH"),
        P("Pheww", "MID", 88, "PH"),
        P("Saxa", "JG", 82, "PH"),
        P("Edward", "EXP", 87, "PH")
      ]
    },

    {
      id: "rsg",
      name: "RSG Philippines",
      players: [
        P("Demx", "ROAM", 83, "PH"),
        P("Irrad", "JG", 86, "PH"),
        P("Kousei", "MID", 85, "PH"),
        P("Light", "GOLD", 84, "PH"),
        P("Lusty", "EXP", 82, "PH"),
        P("Jeymz", "MID", 78, "PH"),
        P("Aqua", "GOLD", 80, "PH")
      ]
    }

  ]

};


const MPL_KH_2026 = {

  id: "mpl_kh",
  name: "MPL Cambodia",
  region: "Cambodia",
  season: 2026,

  teams: [

    {
      id: "btkh",
      name: "Burn X Flash",
      players: [
        P("Seira", "JG", 82, "KH"),
        P("Rex", "GOLD", 81, "KH"),
        P("Noblesse", "MID", 80, "KH"),
        P("King", "EXP", 79, "KH"),
        P("Support", "ROAM", 79, "KH"),
        P("Flash", "JG", 76, "KH"),
        P("Nova", "GOLD", 75, "KH")
      ]
    },

    {
      id: "seeu",
      name: "See You Soon",
      players: [
        P("Lynx", "EXP", 81, "KH"),
        P("Zero", "JG", 80, "KH"),
        P("Ace", "MID", 82, "KH"),
        P("Ghost", "GOLD", 80, "KH"),
        P("Wall", "ROAM", 78, "KH"),
        P("Young", "MID", 74, "KH"),
        P("Neo", "JG", 75, "KH")
      ]
    }

  ]

};
