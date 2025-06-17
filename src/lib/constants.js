// A centralized place for WoW-related constants

export const WOW_CLASSES = {
  Warrior: { name: "Warrior", color: "#C79C6E" },
  Paladin: { name: "Paladin", color: "#F58CBA" },
  Hunter: { name: "Hunter", color: "#ABD473" },
  Rogue: { name: "Rogue", color: "#FFF569" },
  Priest: { name: "Priest", color: "#FFFFFF" },
  "Death Knight": { name: "Death Knight", color: "#C41F3B" },
  Shaman: { name: "Shaman", color: "#0070DE" },
  Mage: { name: "Mage", color: "#69CCF0" },
  Warlock: { name: "Warlock", color: "#9482C9" },
  Monk: { name: "Monk", color: "#00FF96" },
  Druid: { name: "Druid", color: "#FF7D0A" },
  "Demon Hunter": { name: "Demon Hunter", color: "#A330C9" },
  Evoker: { name: "Evoker", color: "#33937F" },
  Any: { name: "Any", color: "#A0A0A0" },
};

// The approved list of tags admins can choose from.
export const APPROVED_TAGS = [
  "dragonflight",
  "the war within",
  "raw gold",
  "farm",
  "2x4",
  "open world",
  "dungeon",
  "mining",
  "herbalism",
  "skinning",
  "fishing",
  "cooking",
  "alchemy",
  "blacksmithing",
  "enchanting",
  "engineering",
  "inscription",
  "jewelcrafting",
  "leatherworking",
  "tailoring",
  "transmog",
  "mount",
  "pet",
  "auction house",
  "flipping",
  "shuffle",
  "vendor",
  "solo",
  "group",
];

// ... (Keep WOW_CLASSES and APPROVED_TAGS at the top)

export const WOW_EXPANSIONS = [
  { name: "The War Within", color: "#4B54A8" },
  { name: "Dragonflight", color: "#D39E4B" },
  { name: "Shadowlands", color: "#6A75C8" },
  { name: "Battle for Azeroth", color: "#C5A152" },
  { name: "Legion", color: "#3D991F" },
  { name: "Warlords of Draenor", color: "#8B4513" },
  { name: "Mists of Pandaria", color: "#008B8B" },
  { name: "Cataclysm", color: "#DD5400" },
  { name: "Wrath of the Lich King", color: "#4682B4" },
  { name: "The Burning Crusade", color: "#00A36C" },
  { name: "Classic", color: "#D2B48C" },
];

// ... (Keep WOW_CLASSES, APPROVED_TAGS, and WOW_EXPANSIONS)

export const GUIDE_CATEGORIES = [
  "Raw Gold",
  "Gathering",
  "Professions",
  "Flipping",
  "Sniping",
  "Crafting",
  "Dungeon Farm",
  "Open World Farm",
  "Vendor Shuffle",
  "Miscellaneous",
].sort();

export const PROFILE_IMAGES = Array.from(
  { length: 50 },
  (_, i) => `/images/avatars/avatar${i + 2}.png`
);
