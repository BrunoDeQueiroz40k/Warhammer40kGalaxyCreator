export const FACTIONS = [
  "Imperium",
  "Necrons",
  "Caos",
  "Orks",
  "Xenos",
  "Aeldari",
  "Tau",
] as const;

export const SUB_FACTIONS_BY_FACTION: Record<string, string[]> = {
  Imperium: [
    "Space Marines",
    "Astra Militarum",
    "Krieg",
    "Adepta Sororitas",
    "Adeptus Mechanicus",
    "Inquisition",
  ],
  Caos: [
    "Chaos Space Marines",
    "Death Guard",
    "Thousand Sons",
    "World Eaters",
    "Chaos Daemons",
  ],
  Xenos: ["Tyranids", "Genestealer Cults", "Drukhari", "Leagues of Votann"],
  Necrons: ["Sautekh Dynasty", "Nihilakh Dynasty", "Novokh Dynasty"],
  Orks: ["Goffs", "Bad Moons", "Evil Sunz", "Deathskulls"],
  Aeldari: ["Craftworlds", "Harlequins", "Ynnari"],
  Tau: ["T'au Sept", "Vior'la Sept", "Bork'an Sept", "Farsight Enclaves"],
};

export const SPACE_MARINES_CHAPTERS = [
  "Ultramarines",
  "Blood Angels",
  "Dark Angels",
  "Space Wolves",
  "Imperial Fists",
  "Salamanders",
  "Raven Guard",
  "White Scars",
  "Black Templars",
  "Deathwatch",
] as const;
