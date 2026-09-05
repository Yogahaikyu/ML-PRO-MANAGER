/* =========================================================
   MLBB PRO MANAGER
   COUNTRIES / REGIONS V1.5
   ========================================================= */

"use strict";

const countries = window.MLBB_COUNTRIES || [];

const SAVE_KEY = "mlbb_pro_manager_save_v15";

window.MLBB_COUNTRIES = [

  {
    id: "ID",
    name: "Indonesia",
    flag: "🇮🇩",
    description: "Mobile Legends Indonesia"
  },

  {
    id: "PH",
    name: "Philippines",
    flag: "🇵🇭",
    description: "Mobile Legends Philippines"
  },

  {
    id: "MY",
    name: "Malaysia",
    flag: "🇲🇾",
    description: "Mobile Legends Malaysia"
  },

  {
    id: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    description: "Mobile Legends Singapore"
  },

  {
    id: "KH",
    name: "Cambodia",
    flag: "🇰🇭",
    description: "Mobile Legends Cambodia"
  },

  {
    id: "MM",
    name: "Myanmar",
    flag: "🇲🇲",
    description: "Mobile Legends Myanmar"
  },

  {
    id: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    description: "Mobile Legends Brazil"
  },

  {
    id: "LATAM",
    name: "Latin America",
    flag: "🌎",
    description: "Mobile Legends Latin America"
  }

];

console.log(
  "[MLBB PM] countries.js loaded:",
  window.MLBB_COUNTRIES.length,
  "regions"
);
