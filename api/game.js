// src/lib/store.ts
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// src/lib/prompts.ts
var CATEGORIES = [
  {
    id: "Classified History",
    name: "Classified History",
    icon: "\u{1F575}\uFE0F",
    tagline: "Absurd military plots, royal eccentricities & forgotten scandals"
  },
  {
    id: "Bizarre Laws",
    name: "Bizarre Laws",
    icon: "\u2696\uFE0F",
    tagline: "Real statutes and courtroom rulings too weird to be fiction"
  },
  {
    id: "Absurd Science",
    name: "Absurd Science",
    icon: "\u{1F9EA}",
    tagline: "Ig Nobel experiments, weird patents & cosmic oddities"
  },
  {
    id: "Strange Nature",
    name: "Strange Nature",
    icon: "\u{1F419}",
    tagline: "Evolutionary plot twists and animals behaving badly"
  },
  {
    id: "Heists & Hoaxes",
    name: "Heists & Hoaxes",
    icon: "\u{1F48E}",
    tagline: "Audacious cons, stolen landmarks & legendary pranks"
  },
  {
    id: "Pop & Tech Oddities",
    name: "Pop & Tech Oddities",
    icon: "\u{1F579}\uFE0F",
    tagline: "Glitches, billionaires, corporate blunders & viral history"
  }
];
var PLAYER_AVATARS = [
  "\u{1F98A}",
  "\u{1F419}",
  "\u{1F989}",
  "\u{1F988}",
  "\u{1F984}",
  "\u{1F432}",
  "\u{1F916}",
  "\u{1F47D}",
  "\u{1F3AD}",
  "\u26A1",
  "\u{1F52E}",
  "\u{1F451}"
];
var PLAYER_COLORS = [
  "#00F2FE",
  // Electric Cyan
  "#FF2A85",
  // Hyper Magenta
  "#FFB800",
  // Solar Gold
  "#00E699",
  // Neon Emerald
  "#A855F7",
  // Ultraviolet
  "#FF6B35",
  // Plasma Coral
  "#38BDF8",
  // Sky Laser
  "#F43F5E"
  // Crimson Pulse
];
var TRIVIA_PROMPTS = [
  // 1. Classified History
  {
    id: "hist-1",
    category: "Classified History",
    categoryIcon: "\u{1F575}\uFE0F",
    question: "During World War II, the U.S. OSS (predecessor to the CIA) developed a secret weapon to spook Japanese soldiers by painting foxes with _____ so they looked like floating demon spirits.",
    truth: "glow-in-the-dark paint",
    acceptedTruthSynonyms: ["glow in the dark paint", "luminescent paint", "radioactive paint", "glowing paint", "phosphorescent paint"],
    houseDecoys: [
      "phosphorus squid ink",
      "holographic mirrors",
      "uv reactive jellyfish oil",
      "silver theatrical greasepaint"
    ],
    factoid: "Codenamed Operation Fantasia, the plan was tested in Washington, D.C.\u2019s Rock Creek Park. Smithsonian reports that the paint contained radium; the wider scheme was abandoned after practical problems, including getting the paint to survive the foxes\u2019 swim to shore.",
    difficulty: "Devious"
  },
  {
    id: "hist-2",
    category: "Classified History",
    categoryIcon: "\u{1F575}\uFE0F",
    question: "According to an 1807 anecdote, Napoleon\u2019s post-Treaty of Tilsit rabbit hunt went wrong when a crowd of tame farm _____ charged toward the hunting party instead of fleeing.",
    truth: "rabbits",
    acceptedTruthSynonyms: ["bunnies", "domesticated rabbits", "tame rabbits", "farm rabbits"],
    houseDecoys: [
      "a flock of drunken palace peacocks",
      "escaped Prussian war hounds",
      "swarms of angry hornet nests",
      "twenty-four trained circus bears"
    ],
    factoid: "Chief of Staff Alexandre Berthier bought tame farmed rabbits instead of wild ones for a royal hunt. When the cages opened, the bunnies thought Napoleon had food and swarmed his carriage.",
    difficulty: "Standard"
  },
  {
    id: "hist-3",
    category: "Classified History",
    categoryIcon: "\u{1F575}\uFE0F",
    question: "In 1997, the small Alaskan community of Talkeetna began its unusual write-in mayoral story by electing _____ as its honorary mayor.",
    truth: "an orange tabby cat named Stubbs",
    acceptedTruthSynonyms: ["a cat", "stubbs the cat", "an orange cat", "tabby cat", "cat named stubbs"],
    houseDecoys: [
      "a retired sled dog named Yukon",
      "a wooden chainsaw carving of a moose",
      "an unplugged 1984 vending machine",
      "a three-legged bald eagle"
    ],
    factoid: "Stubbs was a write-in, honorary mayor of a community without a human mayor\u2014not an elected municipal official. He held the title for about 20 years, until his death in 2017.",
    difficulty: "Standard"
  },
  {
    id: "hist-4",
    category: "Classified History",
    categoryIcon: "\u{1F575}\uFE0F",
    question: 'For its 1960s "Acoustic Kitty" project, the CIA put a microphone in a cat\u2019s ear and implanted a tiny radio transmitter at the base of its _____ .',
    truth: "skull",
    acceptedTruthSynonyms: ["the skull", "cat\u2019s skull", "the base of the skull", "back of its skull", "head"],
    houseDecoys: [
      "a miniature microfilm camera",
      "a morse-code collar buzzer",
      "a magnetic tape recorder",
      "an infrared tracking beacon"
    ],
    factoid: "Declassified records say the microphone sat in the ear canal and a fine wire antenna ran through the fur. The CIA ultimately called the animal-surveillance method impractical; the famous taxi story is disputed, so this round sticks to the documented hardware.",
    difficulty: "Mind-Bender"
  },
  // 2. Bizarre Laws
  {
    id: "law-1",
    category: "Bizarre Laws",
    categoryIcon: "\u2696\uFE0F",
    question: "Section 32 of the UK\u2019s Salmon Act 1986 makes it an offence, in certain cases involving illegally caught fish, to handle salmon in _____ circumstances.",
    truth: "suspicious",
    acceptedTruthSynonyms: ["suspicious circumstances", "under suspicious circumstances", "suspiciously"],
    houseDecoys: [
      "an unmuzzled ferret after sunset",
      "a wheel of unaged cheddar cheese",
      "more than three brass tubas at once",
      "a top hat filled with live pigeons"
    ],
    factoid: "The phrase is real, but the law targets receiving, retaining, moving or disposing of fish when you know\u2014or reasonably suspect\u2014it was illegally taken. It is not a ban on carrying a fish in a funny way.",
    difficulty: "Standard"
  },
  {
    id: "law-2",
    category: "Bizarre Laws",
    categoryIcon: "\u2696\uFE0F",
    question: "Swiss animal-welfare rules say social species such as guinea pigs must not be kept alone. So a pet owner needs at least one companion _____ .",
    truth: "guinea pig",
    acceptedTruthSynonyms: ["another guinea pig", "a second guinea pig", "guinea pig companion", "guinea pig friend"],
    houseDecoys: [
      "miniature lop rabbit",
      "pygmy hedgehog",
      "fainting goat",
      "sugar glider"
    ],
    factoid: "Switzerland\u2019s Federal Food Safety and Veterinary Office says social animal species must not be kept individually. Guinea pigs are among the species for which the rules specify a group of at least two; the welfare principle is real, even if many viral summaries exaggerate its enforcement.",
    difficulty: "Standard"
  },
  {
    id: "law-3",
    category: "Bizarre Laws",
    categoryIcon: "\u2696\uFE0F",
    question: "In Stambovsky v. Ackley, a 1991 New York appellate court famously described a seller-promoted house as haunted as a matter of _____ .",
    truth: "law",
    acceptedTruthSynonyms: ["a matter of law", "legally", "legally haunted"],
    houseDecoys: [
      "built directly over a subway vent",
      "used as a set for a soap opera",
      "visited daily by a flock of 80 crows",
      "missing all interior bedroom doors"
    ],
    factoid: "The court allowed the buyer to seek rescission because the seller had publicly promoted the house\u2019s ghostly reputation. It was a narrow, case-specific property ruling\u2014not a blanket rule about supernatural disclosures.",
    difficulty: "Devious"
  },
  {
    id: "law-4",
    category: "Bizarre Laws",
    categoryIcon: "\u2696\uFE0F",
    question: "In the French vineyard town of Ch\xE2teauneuf-du-Pape, a 1954 municipal decree still on the books strictly forbids _____ from landing or taking off within town limits.",
    truth: "flying saucers and UFOs",
    acceptedTruthSynonyms: ["flying saucers", "ufos", "alien spaceships", "extraterrestrial craft", "spaceships"],
    houseDecoys: [
      "advertising blimps for cheap beer",
      "hot air balloons shaped like vegetables",
      "unlicensed carrier pigeons",
      "helicopters carrying wine critics"
    ],
    factoid: "Mayor Lucien Jeune passed the law during a 1954 French UFO wave\u2014and brilliant publicity stunt\u2014declaring that any alien craft landing in the vineyards would be immediately impounded.",
    difficulty: "Devious"
  },
  // 3. Absurd Science
  {
    id: "sci-1",
    category: "Absurd Science",
    categoryIcon: "\u{1F9EA}",
    question: "In 2000, physicist Andre Geim won the Ig Nobel Prize (before later winning a real Nobel Prize) for using powerful electromagnets to levitate a live _____ in mid-air.",
    truth: "frog",
    acceptedTruthSynonyms: ["a frog", "live frog", "green frog", "toad"],
    houseDecoys: [
      "hamster in a tiny tuxedo",
      "garden snail",
      "goldfish in a water droplet",
      "bumblebee asleep on a petal"
    ],
    factoid: "Geim remains the only person in history to win both an Ig Nobel Prize (for levitating a frog via diamagnetism) and a Nobel Prize in Physics (for discovering graphene).",
    difficulty: "Standard"
  },
  {
    id: "sci-2",
    category: "Absurd Science",
    categoryIcon: "\u{1F9EA}",
    question: "Astronomers detected ethyl formate in the Sagittarius B2 cloud. On Earth, this molecule contributes to raspberry flavor and also smells like _____ .",
    truth: "rum",
    acceptedTruthSynonyms: ["a rum-like aroma", "rum", "alcohol", "liquor"],
    houseDecoys: [
      "burnt toast and vanilla",
      "sour green apples and ozone",
      "salted caramel and copper",
      "peppermint and sulfur"
    ],
    factoid: "The molecule\u2019s presence was detected by radio astronomy. That does not mean the vacuum of space literally tastes like raspberry rum: Sagittarius B2 contains many molecules, and ethyl formate is only one contributor to raspberry flavor and rum\u2019s aroma.",
    difficulty: "Devious"
  },
  {
    id: "sci-3",
    category: "Absurd Science",
    categoryIcon: "\u{1F9EA}",
    question: "The University of Queensland\u2019s century-long Pitch Drop Experiment has produced only _____ full drops since the funnel stem was cut in 1930.",
    truth: "nine",
    acceptedTruthSynonyms: ["9", "nine drops", "only nine drops"],
    houseDecoys: [
      "a fossilized pine resin bead",
      "frozen mercury",
      "petrified maple syrup",
      "molten cathedral stained glass"
    ],
    factoid: "Physicist Thomas Parnell prepared the pitch in 1927, let it settle, then cut the funnel stem in 1930. The first drop took eight years to fall; the ninth fell in 2014. UQ\u2019s experiment page lists nine drops to date.",
    difficulty: "Mind-Bender"
  },
  {
    id: "sci-4",
    category: "Absurd Science",
    categoryIcon: "\u{1F9EA}",
    question: "During the 1904 Olympic Marathon in St. Louis, winner Thomas Hicks was kept running by his trainers, who fed him a wild sports drink made of _____ .",
    truth: "strychnine rat poison, raw egg whites, and brandy",
    acceptedTruthSynonyms: ["rat poison and brandy", "strychnine and brandy", "rat poison", "strychnine"],
    houseDecoys: [
      "warm beef broth mixed with gunpowder",
      "melted lard, espresso, and vinegar",
      "pickled herring juice and laudanum",
      "carbonated goat milk and cayenne pepper"
    ],
    factoid: "His support crew first gave him strychnine mixed with egg whites; later, another dose was taken with brandy. Small doses were then believed to act as a stimulant, though strychnine is a potent poison. The Smithsonian account describes Hicks as nearly collapsing near the finish.",
    difficulty: "Devious"
  },
  // 4. Strange Nature
  {
    id: "nat-1",
    category: "Strange Nature",
    categoryIcon: "\u{1F419}",
    question: "Wombats are the only known mammals whose intestines form their dry droppings into three-dimensional _____ .",
    truth: "cubes",
    acceptedTruthSynonyms: ["cube shapes", "cube-shaped droppings", "cubic feces", "cuboids"],
    houseDecoys: [
      "gallstones",
      "earwax pellets",
      "milk curds",
      "burrow entrance tunnels"
    ],
    factoid: "The cubes form inside the last part of the intestine, where uneven tissue stiffness and muscular contractions shape the stool. Wombats use droppings to communicate; researchers suggest the flat sides help them stay put on rocks and logs.",
    difficulty: "Standard"
  },
  {
    id: "nat-2",
    category: "Strange Nature",
    categoryIcon: "\u{1F419}",
    question: "When a platypus hunts underwater with its eyes, ears and nostrils closed, sensors in its bill detect tiny electrical signals from prey. The sense is called _____ .",
    truth: "electroreception",
    acceptedTruthSynonyms: ["electroreceptors", "electroreception", "electrolocation", "detecting electrical signals", "electric-field sensing"],
    houseDecoys: [
      "magnetoreception",
      "echolocation",
      "infrared vision",
      "ultraviolet polarization"
    ],
    factoid: "The Australian Museum describes the platypus bill as its main underwater sense organ, with pressure-sensitive receptors and electroreceptors. Exactly how the platypus combines those signals to pinpoint prey is still being studied.",
    difficulty: "Standard"
  },
  {
    id: "nat-3",
    category: "Strange Nature",
    categoryIcon: "\u{1F419}",
    question: "To defend itself from predators, the Malaysian exploding ant (Colobopsis explodens) flexes its abdomen so hard that it ruptures and sprays attackers with _____ .",
    truth: "bright yellow toxic glue",
    acceptedTruthSynonyms: ["yellow glue", "toxic glue", "sticky yellow goo", "poisonous glue"],
    houseDecoys: [
      "boiling peppermint-scented acid",
      "foaming purple ink",
      "cloud of sneezing powder spores",
      "liquid wax that hardens like cement"
    ],
    factoid: "The ant\u2019s defensive secretion is bright yellow, sticky, toxic, and has a spice- or curry-like smell. The self-sacrificing rupture is called autothysis; this is a last-resort defense for the colony.",
    difficulty: "Devious"
  },
  {
    id: "nat-4",
    category: "Strange Nature",
    categoryIcon: "\u{1F419}",
    question: "Male satin bowerbirds build courtship bowers and are especially drawn to plastic bottle-top treasures in the color _____.",
    truth: "blue",
    acceptedTruthSynonyms: ["blue objects", "blue bottle caps", "the color blue"],
    houseDecoys: [
      "shiny silver coins and keys",
      "round white river pebbles",
      "discarded golf balls",
      "red casino poker chips"
    ],
    factoid: "Satin bowerbirds particularly prefer blue decorations; field research found bottle tops among the most sought-after objects relative to their availability. A bower is a courtship display, not a nest.",
    difficulty: "Standard"
  },
  // 5. Heists & Hoaxes
  {
    id: "heist-1",
    category: "Heists & Hoaxes",
    categoryIcon: "\u{1F48E}",
    question: 'Between 2011 and 2012, thieves pulled off the "Great Canadian Heist" in Quebec by siphoning thousands of barrels of _____ from the province\u2019s strategic reserve.',
    truth: "maple syrup",
    acceptedTruthSynonyms: ["pure maple syrup", "barrels of maple syrup", "syrup"],
    houseDecoys: [
      "aged ice-wine vintage",
      "medical-grade helium gas",
      "solid gold hockey pucks",
      "arctic salmon caviar"
    ],
    factoid: "The thieves rented space inside the Federation of Quebec Maple Syrup Producers\u2019 warehouse, drained 3,000 tons of syrup, and refilled the barrels with water so inspectors wouldn\u2019t notice.",
    difficulty: "Standard"
  },
  {
    id: "heist-2",
    category: "Heists & Hoaxes",
    categoryIcon: "\u{1F48E}",
    question: "In 1925, con artist Victor Lustig posed as a French official and sold a scrap-metal dealer the rights to dismantle which Paris landmark\u2014then tried the same con again? _____",
    truth: "the Eiffel Tower",
    acceptedTruthSynonyms: ["eiffel tower", "paris eiffel tower"],
    houseDecoys: [
      "the Louvre glass pyramid",
      "Napoleon\u2019s solid bronze cannon fleet",
      "the Palace of Versailles gates",
      "the Paris Metro underground tracks"
    ],
    factoid: "Lustig sold the supposed scrap rights to Andr\xE9 Poisson once. Emboldened when Poisson did not report the scam, he returned to attempt it again\u2014but the second target became suspicious and alerted police. So: one confirmed sale, one failed repeat attempt.",
    difficulty: "Standard"
  },
  {
    id: "heist-3",
    category: "Heists & Hoaxes",
    categoryIcon: "\u{1F48E}",
    question: "On April Fools\u2019 Day 1957, the BBC news program Panorama convinced thousands of British viewers that mild winter weather had resulted in a bumper harvest of _____ growing on trees in Switzerland.",
    truth: "spaghetti",
    acceptedTruthSynonyms: ["spaghetti noodles", "pasta", "spaghetti on trees"],
    houseDecoys: [
      "pre-peeled bananas",
      "swiss cheese wheels",
      "square watermelon cubes",
      "instant coffee beans"
    ],
    factoid: 'Hundreds of viewers phoned the BBC asking how to grow their own spaghetti bush; operators famously replied, "Place a sprig of spaghetti in a tin of tomato sauce and hope for the best."',
    difficulty: "Standard"
  },
  {
    id: "heist-4",
    category: "Heists & Hoaxes",
    categoryIcon: "\u{1F48E}",
    question: "In July 2008, an estimated 500 truckloads of white beach _____ disappeared from Coral Spring in Jamaica\u2019s Trelawny parish.",
    truth: "sand",
    acceptedTruthSynonyms: ["white sand", "beach sand", "coral sand", "white coral sand"],
    houseDecoys: [
      "driftwood sculptures",
      "pink conch shells",
      "sunken Spanish cobblestones",
      "luxury cabana huts"
    ],
    factoid: "The Guardian reported that about 500 truckloads were removed from the Coral Spring site. Some of the sand was later reported found at two hotel developments; the theft sparked a complex investigation and political controversy.",
    difficulty: "Devious"
  },
  // 6. Pop & Tech Oddities
  {
    id: "tech-1",
    category: "Pop & Tech Oddities",
    categoryIcon: "\u{1F579}\uFE0F",
    question: "In 1991, researchers at the University of Cambridge aimed a camera at the Trojan Room\u2019s _____ so they could check whether it was full before walking over.",
    truth: "coffee pot",
    acceptedTruthSynonyms: ["coffee machine", "coffee maker", "coffee pot", "pot of coffee"],
    houseDecoys: [
      "a sleeping campus cat named Turing",
      "whether it was raining on the bike rack",
      "the temperature of the server room beer fridge",
      "how long the cafeteria lunch line was"
    ],
    factoid: "The camera first served an image on the lab\u2019s local network; it became publicly viewable on the web in 1993 and was switched off in 2001. Its modest goal was to save a disappointing trip to an empty pot.",
    difficulty: "Standard"
  },
  {
    id: "tech-2",
    category: "Pop & Tech Oddities",
    categoryIcon: "\u{1F579}\uFE0F",
    question: 'In 1992, Pepsi\u2019s Philippine "Number Fever" contest announced 349 as a jackpot number; that number had already appeared inside about _____ bottle caps.',
    truth: "800,000",
    acceptedTruthSynonyms: ["800000", "eight hundred thousand", "800,000 bottle caps", "hundreds of thousands"],
    houseDecoys: [
      "rival Coca-Cola cans by mistake",
      "billboards two weeks before the draw",
      "every single newspaper in Manila",
      "expired milk cartons"
    ],
    factoid: "Pepsi said the 349 caps lacked the required security code, so they were not valid jackpot claims. The announcement nevertheless sparked mass protests; the company later offered a goodwill payment to holders of misprinted caps.",
    difficulty: "Devious"
  },
  {
    id: "tech-3",
    category: "Pop & Tech Oddities",
    categoryIcon: "\u{1F579}\uFE0F",
    question: "Nintendo began in Kyoto in 1889, long before video games, by manufacturing Japanese playing cards called _____ .",
    truth: "Hanafuda",
    acceptedTruthSynonyms: ["hanafuda cards", "flower cards", "Japanese flower cards"],
    houseDecoys: [
      "bamboo abacus calculators",
      "clockwork brass singing birds",
      "painted silk paper lanterns",
      "wooden puzzle boxes"
    ],
    factoid: "Nintendo\u2019s own company history says Fusajiro Yamauchi began manufacturing and selling Hanafuda playing cards in Kyoto in 1889. The company still sells a modern Hanafuda set.",
    difficulty: "Standard"
  },
  {
    id: "tech-4",
    category: "Pop & Tech Oddities",
    categoryIcon: "\u{1F579}\uFE0F",
    question: "Cloudflare\u2019s LavaRand system adds a visual source of randomness by filming a wall of about 100 _____ in its San Francisco lobby.",
    truth: "lava lamps",
    acceptedTruthSynonyms: ["a hundred lava lamps", "100 lava lamps", "lava lamps"],
    houseDecoys: [
      "fifty ant farms in neon gel",
      "pendulum clocks swinging out of sync",
      "automated dice-rolling machines",
      "goldfish swimming through laser beams"
    ],
    factoid: "Cloudflare says the filmed wax patterns and camera sensor noise are mixed into its entropy pool as an additional randomness source\u2014not used alone as a magic encryption key generator.",
    difficulty: "Standard"
  }
];
var BOT_NAMES = [
  "Cipher_Vex",
  "NovaBluff",
  "Echo_Mirage",
  "Kitsune_99",
  "Astra_Zero",
  "Vesper_Hex",
  "Chrono_Fox"
];

// src/lib/engine.ts
var ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateRoomCode(seed) {
  let code = "";
  for (let i = 0; i < 4; i++) {
    const r = seed !== void 0 ? Math.abs(Math.sin(seed + i * 99) * 1e4) % 1 : Math.random();
    code += ROOM_CODE_CHARS[Math.floor(r * ROOM_CODE_CHARS.length)];
  }
  return code;
}
function normalizeText(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\b(a|an|the|of|in|on|to|with)\b/g, " ").replace(/\s+/g, " ").trim();
}
function isTooCloseToTruth(input, prompt) {
  const normInput = normalizeText(input);
  if (!normInput) return false;
  const candidates = [prompt.truth, ...prompt.acceptedTruthSynonyms].map(normalizeText);
  for (const cand of candidates) {
    if (!cand) continue;
    if (normInput === cand) return true;
    if (cand.length >= 4 && normInput.includes(cand) && normInput.length <= cand.length + 6) {
      return true;
    }
    if (normInput.length >= 5 && cand.includes(normInput) && cand.length <= normInput.length + 5) {
      return true;
    }
  }
  return false;
}
function addActivity(room, text, type = "system") {
  const event = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    type,
    timestamp: Date.now()
  };
  room.activityFeed = [event, ...room.activityFeed].slice(0, 18);
}
function createInitialPlayer(params) {
  const now = Date.now();
  return {
    id: params.id,
    name: params.name.trim().slice(0, 18) || "Player",
    avatar: params.avatar || PLAYER_AVATARS[0],
    color: params.color || PLAYER_COLORS[0],
    isHost: params.isHost,
    isReady: params.isHost || Boolean(params.isBot),
    isBot: Boolean(params.isBot),
    score: 0,
    lastRoundDelta: 0,
    gambits: {
      truth_radar: true,
      double_agent: true,
      shield_bet: true
    },
    activeGambit: null,
    eliminatedOptionId: null,
    stats: {
      truthsFound: 0,
      playersFooled: 0,
      timesFooled: 0,
      kudosReceived: 0,
      wagerPointsEarned: 0,
      currentStreak: 0,
      bestStreak: 0
    },
    joinedAt: now,
    lastSeenAt: now
  };
}
function createRoomState(params) {
  const now = Date.now();
  const code = (params.code || generateRoomCode()).toUpperCase();
  const hostId = params.hostId || `p-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const host = createInitialPlayer({
    id: hostId,
    name: params.hostName,
    avatar: params.avatar,
    color: params.color,
    isHost: true
  });
  const room = {
    code,
    version: 1,
    createdAt: now,
    updatedAt: now,
    phase: "lobby",
    roundNumber: 0,
    totalRounds: 3,
    phaseStartedAt: now,
    phaseEndsAt: null,
    settings: {
      totalRounds: 3,
      roundTimerSeconds: params.timerSeconds ?? 60,
      allowHouseDecoys: true
    },
    players: [host],
    usedPromptIds: [],
    categoryOptions: [],
    selectedCategory: null,
    currentPrompt: null,
    submissions: {},
    lineup: [],
    votes: {},
    kudosVotes: {},
    revealStep: 0,
    lastRoundBreakdowns: [],
    history: [],
    reactions: [],
    activityFeed: [
      {
        id: `act-${now}`,
        text: `${host.name} opened the Mirage Arena (${code})`,
        type: "join",
        timestamp: now
      }
    ],
    awards: []
  };
  return { room, playerId: hostId };
}
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function drawCategoryOptions(usedPromptIds) {
  const availableCategories = CATEGORIES.filter(
    (cat) => TRIVIA_PROMPTS.some((p) => p.category === cat.id && !usedPromptIds.includes(p.id))
  );
  const pool = availableCategories.length >= 3 ? availableCategories : CATEGORIES;
  const shuffled = shuffle(pool);
  return shuffled.slice(0, 3).map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    tagline: cat.tagline,
    votes: []
  }));
}
function selectPromptForCategory(categoryName, usedPromptIds) {
  const inCat = TRIVIA_PROMPTS.filter(
    (p) => p.category === categoryName && !usedPromptIds.includes(p.id)
  );
  if (inCat.length > 0) {
    return inCat[Math.floor(Math.random() * inCat.length)];
  }
  const anyUnused = TRIVIA_PROMPTS.filter((p) => !usedPromptIds.includes(p.id));
  if (anyUnused.length > 0) {
    return anyUnused[Math.floor(Math.random() * anyUnused.length)];
  }
  return TRIVIA_PROMPTS[Math.floor(Math.random() * TRIVIA_PROMPTS.length)];
}
function runBotActionsForPhase(room) {
  const bots = room.players.filter((p) => p.isBot);
  if (bots.length === 0) return;
  if (room.phase === "category_select" && room.categoryOptions.length > 0) {
    for (const bot of bots) {
      const alreadyVoted = room.categoryOptions.some((c) => c.votes.includes(bot.id));
      if (!alreadyVoted) {
        const pick = room.categoryOptions[Math.floor(Math.random() * room.categoryOptions.length)];
        pick.votes.push(bot.id);
      }
    }
  } else if (room.phase === "write_bluff" && room.currentPrompt) {
    const prompt = room.currentPrompt;
    const usedTexts = new Set(
      Object.values(room.submissions).map((s) => normalizeText(s.text))
    );
    bots.forEach((bot, idx) => {
      if (!room.submissions[bot.id]) {
        const availableDecoys = prompt.houseDecoys.filter(
          (d) => !usedTexts.has(normalizeText(d))
        );
        const chosenText = availableDecoys[idx % Math.max(1, availableDecoys.length)] || `${prompt.houseDecoys[0]} (classified)`;
        usedTexts.add(normalizeText(chosenText));
        const wagers = [1, 2, 3];
        const wager = wagers[Math.floor(Math.random() * wagers.length)];
        room.submissions[bot.id] = {
          playerId: bot.id,
          text: chosenText,
          wager,
          gambitUsed: null,
          submittedAt: Date.now()
        };
      }
    });
  } else if (room.phase === "vote_truth" && room.lineup.length > 0) {
    for (const bot of bots) {
      if (!room.votes[bot.id]) {
        const eligible = room.lineup.filter((opt) => !opt.authorIds.includes(bot.id));
        if (eligible.length > 0) {
          const pick = eligible[Math.floor(Math.random() * eligible.length)];
          room.votes[bot.id] = pick.id;
          if (!pick.voterIds.includes(bot.id)) {
            pick.voterIds.push(bot.id);
          }
        }
      }
    }
  }
}
function beginRoundCategorySelect(room) {
  const now = Date.now();
  room.roundNumber += 1;
  room.phase = "category_select";
  room.phaseStartedAt = now;
  room.phaseEndsAt = room.settings.roundTimerSeconds > 0 ? now + Math.min(30, room.settings.roundTimerSeconds) * 1e3 : null;
  room.categoryOptions = drawCategoryOptions(room.usedPromptIds);
  room.selectedCategory = null;
  room.currentPrompt = null;
  room.submissions = {};
  room.lineup = [];
  room.votes = {};
  room.kudosVotes = {};
  room.revealStep = 0;
  room.lastRoundBreakdowns = [];
  for (const p of room.players) {
    p.activeGambit = null;
    p.eliminatedOptionId = null;
  }
  addActivity(
    room,
    `Round ${room.roundNumber} of ${room.totalRounds} initiated \u2014 Vote for a dossier category!`,
    "system"
  );
  runBotActionsForPhase(room);
}
function finalizeCategoryAndStartBluff(room, forcedCategoryId) {
  const now = Date.now();
  let winningCat = room.categoryOptions[0];
  if (forcedCategoryId) {
    const found = room.categoryOptions.find((c) => c.id === forcedCategoryId);
    if (found) winningCat = found;
  } else {
    const maxVotes = Math.max(...room.categoryOptions.map((c) => c.votes.length), 0);
    const tied = room.categoryOptions.filter((c) => c.votes.length === maxVotes);
    if (tied.length > 0) winningCat = tied[Math.floor(Math.random() * tied.length)];
  }
  const categoryName = winningCat ? winningCat.id : CATEGORIES[0].id;
  const prompt = selectPromptForCategory(categoryName, room.usedPromptIds);
  room.selectedCategory = categoryName;
  room.currentPrompt = prompt;
  room.usedPromptIds.push(prompt.id);
  room.phase = "write_bluff";
  room.phaseStartedAt = now;
  room.phaseEndsAt = room.settings.roundTimerSeconds > 0 ? now + room.settings.roundTimerSeconds * 1e3 : null;
  addActivity(room, `Dossier locked: ${categoryName}! Craft your forgery.`, "system");
  runBotActionsForPhase(room);
}
function buildLineupForRoom(room) {
  if (!room.currentPrompt) return;
  const prompt = room.currentPrompt;
  const optionsMap = /* @__PURE__ */ new Map();
  for (const sub of Object.values(room.submissions)) {
    const norm = normalizeText(sub.text);
    if (!norm) continue;
    const existing = optionsMap.get(norm);
    if (existing) {
      if (!existing.authorIds.includes(sub.playerId)) {
        existing.authorIds.push(sub.playerId);
      }
    } else {
      optionsMap.set(norm, {
        id: `opt-${Math.random().toString(36).slice(2, 11)}`,
        text: sub.text.trim(),
        isTruth: false,
        authorIds: [sub.playerId],
        isHouseDecoy: false,
        voterIds: [],
        kudosVoterIds: []
      });
    }
  }
  const truthNorm = normalizeText(prompt.truth);
  optionsMap.set(`__truth__${truthNorm}`, {
    id: `opt-${Math.random().toString(36).slice(2, 11)}`,
    text: prompt.truth,
    isTruth: true,
    authorIds: [],
    isHouseDecoy: false,
    voterIds: [],
    kudosVoterIds: []
  });
  let decoyIdx = 0;
  while (optionsMap.size < 4 && decoyIdx < prompt.houseDecoys.length) {
    const decoyText = prompt.houseDecoys[decoyIdx];
    const norm = normalizeText(decoyText);
    if (!optionsMap.has(norm) && norm !== truthNorm) {
      optionsMap.set(norm, {
        id: `opt-${Math.random().toString(36).slice(2, 11)}`,
        text: decoyText,
        isTruth: false,
        authorIds: [],
        isHouseDecoy: true,
        voterIds: [],
        kudosVoterIds: []
      });
    }
    decoyIdx++;
  }
  const allOptions = Array.from(optionsMap.values());
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }
  room.lineup = allOptions;
  const now = Date.now();
  room.phase = "vote_truth";
  room.phaseStartedAt = now;
  room.phaseEndsAt = room.settings.roundTimerSeconds > 0 ? now + Math.max(30, Math.floor(room.settings.roundTimerSeconds * 0.75)) * 1e3 : null;
  addActivity(
    room,
    `All forgeries on the table! Spot the real truth among ${allOptions.length} suspects.`,
    "system"
  );
  runBotActionsForPhase(room);
}
function resolveRoundScores(room) {
  const isFinaleRound = room.roundNumber >= room.totalRounds;
  const baseTruthPoints = isFinaleRound ? 1e3 : 500;
  const baseFoolPoints = 400;
  const streakBonusAmount = 250;
  const kudosBonusAmount = 150;
  const shieldBonusAmount = 200;
  const breakdownsMap = /* @__PURE__ */ new Map();
  for (const player of room.players) {
    const sub = room.submissions[player.id];
    breakdownsMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      avatar: player.avatar,
      color: player.color,
      truthPoints: 0,
      wagerPenalty: 0,
      fooledPoints: 0,
      streakBonus: 0,
      kudosBonus: 0,
      shieldBonus: 0,
      totalDelta: 0,
      wagerUsed: sub?.wager || 1,
      gambitUsed: sub?.gambitUsed || player.activeGambit || null,
      foundTruth: false,
      fooledPlayerNames: [],
      fooledByAuthorName: null
    });
  }
  for (const voter of room.players) {
    const votedOptionId = room.votes[voter.id];
    const voterBreakdown = breakdownsMap.get(voter.id);
    const votedOption = room.lineup.find((o) => o.id === votedOptionId);
    if (votedOption && votedOption.isTruth) {
      voterBreakdown.foundTruth = true;
      const wager = voterBreakdown.wagerUsed;
      const pts = baseTruthPoints * wager;
      voterBreakdown.truthPoints = pts;
      voter.stats.truthsFound += 1;
      voter.stats.wagerPointsEarned += pts;
      voter.stats.currentStreak += 1;
      if (voter.stats.currentStreak > voter.stats.bestStreak) {
        voter.stats.bestStreak = voter.stats.currentStreak;
      }
      if (voter.stats.currentStreak >= 2) {
        voterBreakdown.streakBonus = streakBonusAmount;
      }
    } else if (votedOption) {
      voter.stats.timesFooled += 1;
      if (voterBreakdown.gambitUsed === "shield_bet") {
        voterBreakdown.shieldBonus = shieldBonusAmount;
      } else {
        voter.stats.currentStreak = 0;
        voterBreakdown.wagerPenalty = voterBreakdown.wagerUsed === 3 ? 500 : voterBreakdown.wagerUsed === 2 ? 250 : 0;
      }
      if (votedOption.authorIds.length > 0) {
        const authorNames = [];
        for (const authorId of votedOption.authorIds) {
          if (authorId === voter.id) continue;
          const author = room.players.find((p) => p.id === authorId);
          const authorBreakdown = breakdownsMap.get(authorId);
          if (author && authorBreakdown) {
            authorNames.push(author.name);
            const isDoubleAgent = authorBreakdown.gambitUsed === "double_agent";
            const foolPts = isDoubleAgent ? baseFoolPoints * 2 : baseFoolPoints;
            authorBreakdown.fooledPoints += foolPts;
            authorBreakdown.fooledPlayerNames.push(voter.name);
            author.stats.playersFooled += 1;
          }
        }
        voterBreakdown.fooledByAuthorName = authorNames.join(" & ") || "House Decoy";
      } else if (votedOption.isHouseDecoy) {
        voterBreakdown.fooledByAuthorName = "House Decoy";
      }
    } else {
      voter.stats.currentStreak = 0;
    }
  }
  for (const option of room.lineup) {
    if (option.kudosVoterIds.length > 0 && option.authorIds.length > 0) {
      for (const authorId of option.authorIds) {
        const author = room.players.find((p) => p.id === authorId);
        const authorBreakdown = breakdownsMap.get(authorId);
        if (author && authorBreakdown) {
          const validKudosCount = option.kudosVoterIds.filter((id) => id !== authorId).length;
          const kPts = validKudosCount * kudosBonusAmount;
          authorBreakdown.kudosBonus += kPts;
          author.stats.kudosReceived += validKudosCount;
        }
      }
    }
  }
  const breakdowns = [];
  for (const player of room.players) {
    const b = breakdownsMap.get(player.id);
    b.totalDelta = b.truthPoints - b.wagerPenalty + b.fooledPoints + b.streakBonus + b.kudosBonus + b.shieldBonus;
    player.lastRoundDelta = b.totalDelta;
    player.score += b.totalDelta;
    breakdowns.push(b);
  }
  breakdowns.sort((a, b) => b.totalDelta - a.totalDelta);
  room.lastRoundBreakdowns = breakdowns;
  room.revealStep = 0;
  if (room.currentPrompt) {
    room.history.push({
      roundNumber: room.roundNumber,
      category: room.selectedCategory || room.currentPrompt.category,
      question: room.currentPrompt.question,
      truth: room.currentPrompt.truth,
      factoid: room.currentPrompt.factoid,
      lineup: JSON.parse(JSON.stringify(room.lineup)),
      breakdowns: JSON.parse(JSON.stringify(breakdowns))
    });
  }
  const now = Date.now();
  room.phase = "round_reveal";
  room.phaseStartedAt = now;
  room.phaseEndsAt = null;
  addActivity(room, `Round ${room.roundNumber} dossiers declassified!`, "system");
}
function computeMatchAwards(room) {
  if (room.players.length === 0) return [];
  const awards = [];
  const byFooled = [...room.players].sort(
    (a, b) => b.stats.playersFooled - a.stats.playersFooled || b.score - a.score
  );
  if (byFooled[0]) {
    awards.push({
      id: "award-puppetmaster",
      title: "The Puppetmaster",
      subtitle: "Master of Forgery & Deception",
      icon: "\u{1F98A}",
      winnerId: byFooled[0].id,
      winnerName: byFooled[0].name,
      winnerAvatar: byFooled[0].avatar,
      winnerColor: byFooled[0].color,
      statLabel: `${byFooled[0].stats.playersFooled} Rival${byFooled[0].stats.playersFooled === 1 ? "" : "s"} Fooled`
    });
  }
  const byTruths = [...room.players].sort(
    (a, b) => b.stats.truthsFound - a.stats.truthsFound || b.score - a.score
  );
  if (byTruths[0]) {
    awards.push({
      id: "award-oracle",
      title: "The Grand Oracle",
      subtitle: "Unshakeable Truth Detector",
      icon: "\u{1F52E}",
      winnerId: byTruths[0].id,
      winnerName: byTruths[0].name,
      winnerAvatar: byTruths[0].avatar,
      winnerColor: byTruths[0].color,
      statLabel: `${byTruths[0].stats.truthsFound}/${room.totalRounds} Truths Spotted`
    });
  }
  const byWager = [...room.players].sort(
    (a, b) => b.stats.wagerPointsEarned - a.stats.wagerPointsEarned || b.score - a.score
  );
  if (byWager[0]) {
    awards.push({
      id: "award-highroller",
      title: "High-Stakes Maverick",
      subtitle: "Boldest Wager Multiplier Payoffs",
      icon: "\u{1F48E}",
      winnerId: byWager[0].id,
      winnerName: byWager[0].name,
      winnerAvatar: byWager[0].avatar,
      winnerColor: byWager[0].color,
      statLabel: `${byWager[0].stats.wagerPointsEarned.toLocaleString()} Wager Pts`
    });
  }
  const byKudos = [...room.players].sort(
    (a, b) => b.stats.kudosReceived - a.stats.kudosReceived || b.score - a.score
  );
  if (byKudos[0]) {
    awards.push({
      id: "award-comedian",
      title: "Golden Tongue",
      subtitle: "Most Applauded Forgeries",
      icon: "\u{1F525}",
      winnerId: byKudos[0].id,
      winnerName: byKudos[0].name,
      winnerAvatar: byKudos[0].avatar,
      winnerColor: byKudos[0].color,
      statLabel: `${byKudos[0].stats.kudosReceived} Kudos Stamp${byKudos[0].stats.kudosReceived === 1 ? "" : "s"}`
    });
  }
  return awards;
}
function applyGameAction(room, payload) {
  const now = Date.now();
  room.updatedAt = now;
  room.version += 1;
  if ("playerId" in payload && payload.playerId) {
    const p = room.players.find((pl) => pl.id === payload.playerId);
    if (p) p.lastSeenAt = now;
  }
  switch (payload.action) {
    case "get_room": {
      return { room };
    }
    case "join_room": {
      const cleanName = payload.playerName.trim().slice(0, 18);
      if (!cleanName) {
        throw new Error("Please enter a display name to join.");
      }
      let existing = room.players.find(
        (p) => payload.playerId && p.id === payload.playerId || p.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (existing) {
        existing.name = cleanName;
        if (payload.avatar) existing.avatar = payload.avatar;
        if (payload.color) existing.color = payload.color;
        existing.lastSeenAt = now;
        return { room, playerId: existing.id };
      }
      if (room.phase !== "lobby") {
        throw new Error("This match is already in progress. Ask the host for the next room code!");
      }
      if (room.players.length >= 8) {
        throw new Error("This room is full (maximum 8 players).");
      }
      const newPlayerId = payload.playerId || `p-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const usedColors = new Set(room.players.map((p) => p.color));
      const assignedColor = payload.color && !usedColors.has(payload.color) ? payload.color : PLAYER_COLORS.find((c) => !usedColors.has(c)) || payload.color || PLAYER_COLORS[0];
      const newPlayer = createInitialPlayer({
        id: newPlayerId,
        name: cleanName,
        avatar: payload.avatar || PLAYER_AVATARS[room.players.length % PLAYER_AVATARS.length],
        color: assignedColor,
        isHost: false
      });
      room.players.push(newPlayer);
      addActivity(room, `${newPlayer.name} entered the lobby`, "join");
      return { room, playerId: newPlayerId };
    }
    case "toggle_ready": {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error("Player not found in room.");
      player.isReady = !player.isReady;
      return { room };
    }
    case "update_settings": {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error("Only the room host can update match settings.");
      }
      room.settings.roundTimerSeconds = payload.timerSeconds;
      if (payload.totalRounds && payload.totalRounds >= 1 && payload.totalRounds <= 5) {
        room.settings.totalRounds = payload.totalRounds;
        room.totalRounds = payload.totalRounds;
      }
      return { room };
    }
    case "add_bot": {
      const host = room.players.find((p) => p.id === payload.hostId);
      if (!host || !host.isHost) {
        throw new Error("Only the host can add an AI challenger.");
      }
      if (room.phase !== "lobby") {
        throw new Error("AI challengers can only be added in the lobby.");
      }
      if (room.players.length >= 8) {
        throw new Error("Maximum 8 players reached.");
      }
      const existingNames = new Set(room.players.map((p) => p.name));
      const botName = BOT_NAMES.find((n) => !existingNames.has(n)) || `MirageBot_${room.players.length}`;
      const botId = `bot-${now.toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
      const bot = createInitialPlayer({
        id: botId,
        name: botName,
        avatar: "\u{1F916}",
        color: PLAYER_COLORS[room.players.length % PLAYER_COLORS.length],
        isHost: false,
        isBot: true
      });
      room.players.push(bot);
      addActivity(room, `AI Challenger ${bot.name} joined the table`, "join");
      return { room };
    }
    case "remove_player": {
      const host = room.players.find((p) => p.id === payload.hostId);
      if (!host || !host.isHost) {
        throw new Error("Only the host can remove players.");
      }
      if (payload.targetPlayerId === host.id) {
        throw new Error("Host cannot remove themselves.");
      }
      room.players = room.players.filter((p) => p.id !== payload.targetPlayerId);
      return { room };
    }
    case "start_game": {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error("Only the host can start the game.");
      }
      if (room.players.length < 2) {
        throw new Error("At least 2 players are required to start the match.");
      }
      const notReady = room.players.filter((p) => !p.isReady);
      if (notReady.length > 0) {
        throw new Error(`Waiting for ${notReady.length} player${notReady.length === 1 ? "" : "s"} to tap Ready.`);
      }
      if (room.phase !== "lobby") {
        return { room };
      }
      room.roundNumber = 0;
      beginRoundCategorySelect(room);
      return { room };
    }
    case "vote_category": {
      if (room.phase !== "category_select") {
        return { room };
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error("Player not found.");
      for (const cat of room.categoryOptions) {
        cat.votes = cat.votes.filter((id) => id !== player.id);
      }
      const targetCat = room.categoryOptions.find((c) => c.id === payload.categoryId);
      if (!targetCat) throw new Error("Category not found.");
      targetCat.votes.push(player.id);
      const totalVotes = room.categoryOptions.reduce((acc, c) => acc + c.votes.length, 0);
      if (totalVotes >= room.players.length) {
        finalizeCategoryAndStartBluff(room);
      }
      return { room };
    }
    case "submit_bluff": {
      if (room.phase !== "write_bluff" || !room.currentPrompt) {
        return { room };
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error("Player not found.");
      const trimmed = payload.text.trim().slice(0, 80);
      if (!trimmed) {
        throw new Error("Your bluff cannot be empty!");
      }
      if (isTooCloseToTruth(trimmed, room.currentPrompt)) {
        throw new Error(
          "TRUTH_INTERCEPTED: You typed the actual real answer! Enter a convincing fake answer instead to fool the room."
        );
      }
      const wager = payload.wager === 2 || payload.wager === 3 ? payload.wager : 1;
      let chosenGambit = null;
      if (payload.gambit === "double_agent" || payload.gambit === "shield_bet") {
        if (player.gambits[payload.gambit]) {
          chosenGambit = payload.gambit;
          player.gambits[payload.gambit] = false;
          player.activeGambit = chosenGambit;
        }
      }
      room.submissions[player.id] = {
        playerId: player.id,
        text: trimmed,
        wager,
        gambitUsed: chosenGambit,
        submittedAt: now
      };
      const wagerLabel = wager === 3 ? "3x ALL-IN" : wager === 2 ? "2x Bold" : "1x Stake";
      addActivity(
        room,
        `${player.name} locked in their forgery (${wagerLabel})${chosenGambit ? " + Tactical Gambit!" : ""}`,
        chosenGambit ? "gambit" : "lock"
      );
      const submittedCount = Object.keys(room.submissions).length;
      if (submittedCount >= room.players.length) {
        buildLineupForRoom(room);
      }
      return { room };
    }
    case "use_truth_radar": {
      if (room.phase !== "vote_truth") {
        throw new Error("Truth Radar can only be activated during the Suspect Lineup phase.");
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error("Player not found.");
      if (!player.gambits.truth_radar) {
        throw new Error("You have already used your Truth Radar this match.");
      }
      if (player.eliminatedOptionId) {
        return { room };
      }
      const removableFakes = room.lineup.filter(
        (opt) => !opt.isTruth && !opt.authorIds.includes(player.id)
      );
      if (removableFakes.length === 0) {
        throw new Error("No eligible fake suspects to eliminate.");
      }
      const target = removableFakes[Math.floor(Math.random() * removableFakes.length)];
      player.eliminatedOptionId = target.id;
      player.gambits.truth_radar = false;
      addActivity(room, `${player.name} deployed Truth Radar (private fake filter)!`, "gambit");
      return { room };
    }
    case "submit_vote": {
      if (room.phase !== "vote_truth") {
        return { room };
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error("Player not found.");
      const option = room.lineup.find((o) => o.id === payload.optionId);
      if (!option) throw new Error("Selected answer card not found.");
      if (option.authorIds.includes(player.id)) {
        throw new Error("You can't vote for your own forgery!");
      }
      for (const opt of room.lineup) {
        opt.voterIds = opt.voterIds.filter((id) => id !== player.id);
      }
      room.votes[player.id] = option.id;
      option.voterIds.push(player.id);
      addActivity(room, `${player.name} locked in their verdict`, "lock");
      if (Object.keys(room.votes).length >= room.players.length) {
        resolveRoundScores(room);
      }
      return { room };
    }
    case "toggle_kudos": {
      if (room.phase !== "vote_truth" && room.phase !== "round_reveal") {
        return { room };
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error("Player not found.");
      const option = room.lineup.find((o) => o.id === payload.optionId);
      if (!option) throw new Error("Option not found.");
      if (option.authorIds.includes(player.id)) {
        throw new Error("You can't award Kudos to your own bluff!");
      }
      for (const opt of room.lineup) {
        opt.kudosVoterIds = opt.kudosVoterIds.filter((id) => id !== player.id);
      }
      if (room.kudosVotes[player.id] === option.id) {
        delete room.kudosVotes[player.id];
      } else {
        room.kudosVotes[player.id] = option.id;
        option.kudosVoterIds.push(player.id);
      }
      return { room };
    }
    case "advance_reveal_step": {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error("Only the host can declassify the next dossier.");
      }
      if (room.phase === "round_reveal") {
        room.revealStep = Math.min(room.lineup.length, room.revealStep + 1);
      }
      return { room };
    }
    case "next_phase": {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error("Only the host can advance the match.");
      }
      if (payload.expectedPhase && payload.expectedPhase !== room.phase) {
        return { room };
      }
      if (payload.expectedPhaseStartedAt && payload.expectedPhaseStartedAt !== room.phaseStartedAt) {
        return { room };
      }
      if (room.phase === "category_select") {
        finalizeCategoryAndStartBluff(room);
      } else if (room.phase === "write_bluff") {
        buildLineupForRoom(room);
      } else if (room.phase === "vote_truth") {
        resolveRoundScores(room);
      } else if (room.phase === "round_reveal") {
        if (room.revealStep < room.lineup.length) {
          throw new Error("Reveal every dossier card before continuing.");
        }
        if (room.roundNumber >= room.totalRounds) {
          room.phase = "game_over";
          room.phaseStartedAt = now;
          room.phaseEndsAt = null;
          room.awards = computeMatchAwards(room);
          addActivity(room, `Match complete! Behold the Champions of Mirage Royale!`, "system");
        } else {
          beginRoundCategorySelect(room);
        }
      }
      return { room };
    }
    case "send_reaction": {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) return { room };
      const allowedEmojis = ["\u{1F525}", "\u{1F602}", "\u{1F9E0}", "\u{1F480}", "\u{1F440}", "\u{1F451}", "\u26A1", "\u{1F44F}"];
      const emoji = allowedEmojis.includes(payload.emoji) ? payload.emoji : "\u{1F525}";
      const reaction = {
        id: `rx-${now}-${Math.random().toString(36).slice(2, 6)}`,
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
        emoji,
        createdAt: now
      };
      room.reactions = [...room.reactions.filter((r) => now - r.createdAt < 12e3), reaction].slice(
        -20
      );
      return { room };
    }
    case "restart_game": {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error("Only the host can start a rematch.");
      }
      room.roundNumber = 0;
      room.usedPromptIds = [];
      room.history = [];
      room.awards = [];
      room.lastRoundBreakdowns = [];
      for (const p of room.players) {
        p.score = 0;
        p.lastRoundDelta = 0;
        p.activeGambit = null;
        p.eliminatedOptionId = null;
        p.gambits = {
          truth_radar: true,
          double_agent: true,
          shield_bet: true
        };
        p.stats = {
          truthsFound: 0,
          playersFooled: 0,
          timesFooled: 0,
          kudosReceived: 0,
          wagerPointsEarned: 0,
          currentStreak: 0,
          bestStreak: 0
        };
      }
      beginRoundCategorySelect(room);
      return { room };
    }
    default:
      return { room };
  }
}

// src/lib/store.ts
var memoryRooms = /* @__PURE__ */ new Map();
var ROOM_TTL_SECONDS = 60 * 60 * 24;
var ABSENT_ETAG = "__mirage_absent__";
var CAS_WRITE_SCRIPT = `
local current = redis.call('GET', KEYS[1])
local expected = ARGV[1]
if expected == '${ABSENT_ETAG}' then
  if current then return 0 end
else
  if not current then return 0 end
  local ok, record = pcall(cjson.decode, current)
  if not ok or record.etag ~= expected then return 0 end
end
redis.call('SET', KEYS[1], ARGV[3], 'EX', tonumber(ARGV[2]))
return 1
`;
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function upstashConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}
function assertStorageConfigured() {
  if (process.env.VERCEL && !upstashConfig()) {
    throw new Error(
      "Shared game storage is not connected yet. In Vercel, add an Upstash Redis database from the Marketplace and redeploy."
    );
  }
}
function storageKey(code) {
  return `mirage:room:${code.toUpperCase()}`;
}
function makeSessionToken() {
  return randomBytes(32).toString("base64url");
}
function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function secureTokenMatches(storedHash, suppliedToken) {
  if (!storedHash || !suppliedToken) return false;
  const suppliedHash = hashSessionToken(suppliedToken);
  const stored = Buffer.from(storedHash, "hex");
  const supplied = Buffer.from(suppliedHash, "hex");
  return stored.length === supplied.length && timingSafeEqual(stored, supplied);
}
function actorId(payload) {
  if (payload.action === "add_bot" || payload.action === "remove_player") return payload.hostId;
  if ("playerId" in payload) return payload.playerId;
  return void 0;
}
function sanitizeRoomForPlayer(source, playerId) {
  const room = clone(source);
  const canReveal = room.phase === "round_reveal" || room.phase === "game_over";
  for (const player of room.players) {
    delete player.sessionTokenHash;
    if (!canReveal && player.id !== playerId) {
      player.activeGambit = null;
      player.gambits = { truth_radar: true, double_agent: true, shield_bet: true };
      player.eliminatedOptionId = null;
    }
  }
  if (!canReveal && room.currentPrompt) {
    room.currentPrompt.truth = "";
    room.currentPrompt.acceptedTruthSynonyms = [];
    room.currentPrompt.houseDecoys = [];
    room.currentPrompt.factoid = "";
  }
  if (!canReveal) {
    const hiddenSubmissions = {};
    for (const [id, submission] of Object.entries(room.submissions)) {
      hiddenSubmissions[id] = id === playerId ? submission : {
        playerId: id,
        text: "",
        wager: 1,
        gambitUsed: null,
        submittedAt: submission.submittedAt
      };
    }
    room.submissions = hiddenSubmissions;
    room.lineup = room.lineup.map((option) => ({
      ...option,
      // No truth flag, author identity, house-decoy label, or public voting trail during simultaneous voting.
      isTruth: false,
      authorIds: playerId && option.authorIds.includes(playerId) ? [playerId] : [],
      isHouseDecoy: false,
      voterIds: [],
      kudosVoterIds: []
    }));
    const privateVote = room.votes[playerId || ""];
    room.votes = Object.fromEntries(
      Object.keys(room.votes).map((id) => [id, id === playerId ? privateVote : ""])
    );
    const privateKudos = room.kudosVotes[playerId || ""];
    room.kudosVotes = Object.fromEntries(
      Object.keys(room.kudosVotes).map((id) => [id, id === playerId ? privateKudos : ""])
    );
  }
  return room;
}
async function upstashRequest(commandPath, init) {
  const config = upstashConfig();
  if (!config) throw new Error("Upstash Redis is not configured.");
  const response = await fetch(`${config.url}/${commandPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      ...init?.headers || {}
    },
    cache: "no-store"
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Shared room storage failed (${response.status}). Please retry.`);
  }
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error("Shared room storage returned an unreadable response.");
  }
  if (result.error) throw new Error("Shared room storage rejected the request.");
  return result.result;
}
async function readRoomWithEtag(code) {
  assertStorageConfigured();
  const config = upstashConfig();
  const key = storageKey(code);
  if (config) {
    const raw = await upstashRequest(`get/${encodeURIComponent(key)}`);
    if (!raw) return { room: null, etag: null };
    const parsed = JSON.parse(raw);
    return { room: parsed.room, etag: parsed.etag };
  }
  const record = memoryRooms.get(key);
  if (!record) return { room: null, etag: null };
  return { room: clone(record.room), etag: record.etag };
}
async function writeRoomConditional(code, room, expectedEtag) {
  assertStorageConfigured();
  const key = storageKey(code);
  const newEtag = `v${room.version}-${Date.now()}-${randomBytes(5).toString("hex")}`;
  const record = { room: clone(room), etag: newEtag };
  const serialized = JSON.stringify(record);
  const config = upstashConfig();
  if (config) {
    const commandPath = [
      "eval",
      encodeURIComponent(CAS_WRITE_SCRIPT),
      "1",
      encodeURIComponent(key),
      encodeURIComponent(expectedEtag ?? ABSENT_ETAG),
      String(ROOM_TTL_SECONDS)
    ].join("/");
    const result = await upstashRequest(commandPath, {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: serialized
    });
    return Number(result) === 1;
  }
  const existing = memoryRooms.get(key);
  if (expectedEtag === null ? Boolean(existing) : !existing || existing.etag !== expectedEtag) {
    return false;
  }
  memoryRooms.set(key, record);
  return true;
}
function requireSession(room, payload, playerId) {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) throw new Error("Your player session is no longer in this room. Rejoin with a new name.");
  if (!secureTokenMatches(player.sessionTokenHash, payload.sessionToken)) {
    throw new Error("Your secure session expired or is invalid. Rejoin from this device to continue.");
  }
}
function publicResponse(room, playerId, sessionToken) {
  return {
    room: sanitizeRoomForPlayer(room, playerId),
    ...playerId ? { playerId } : {},
    ...sessionToken ? { sessionToken } : {}
  };
}
async function processGameRequest(payload) {
  assertStorageConfigured();
  if (payload.action === "create_room") {
    const sessionToken = makeSessionToken();
    for (let attempt = 0; attempt < 8; attempt++) {
      const code2 = generateRoomCode();
      const { room, playerId } = createRoomState({
        code: code2,
        hostName: payload.hostName,
        avatar: payload.avatar,
        color: payload.color,
        timerSeconds: payload.timerSeconds
      });
      const host = room.players.find((p) => p.id === playerId);
      host.sessionTokenHash = hashSessionToken(sessionToken);
      if (await writeRoomConditional(code2, room, null)) {
        return publicResponse(room, playerId, sessionToken);
      }
    }
    throw new Error("Could not allocate a unique room code. Please try again.");
  }
  const code = payload.code?.trim().toUpperCase();
  if (!code) throw new Error("Room code is required.");
  if (payload.action === "get_room") {
    const { room } = await readRoomWithEtag(code);
    if (!room) throw new Error(`Room "${code}" not found. Double-check the 4-letter code!`);
    if (payload.playerId) requireSession(room, payload, payload.playerId);
    return publicResponse(room, payload.playerId);
  }
  const isJoin = payload.action === "join_room";
  let joinPlayerId = isJoin ? payload.playerId : void 0;
  let joinToken = isJoin ? payload.sessionToken : void 0;
  if (isJoin && (!joinPlayerId || !joinToken)) {
    joinPlayerId = `p-${Date.now().toString(36)}-${randomBytes(5).toString("hex")}`;
    joinToken = makeSessionToken();
  }
  const MAX_RETRIES = 8;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { room, etag } = await readRoomWithEtag(code);
    if (!room) throw new Error(`Room "${code}" not found. Double-check the 4-letter code!`);
    let actionPayload = payload;
    let responsePlayerId = actorId(payload);
    let responseToken;
    if (isJoin) {
      const requestedId = joinPlayerId;
      const existingById = room.players.find((player) => player.id === requestedId);
      if (existingById) {
        requireSession(room, { ...payload, sessionToken: joinToken }, requestedId);
        responsePlayerId = requestedId;
        responseToken = joinToken;
      } else {
        const duplicateName = room.players.find(
          (player) => player.name.toLowerCase() === payload.playerName.trim().toLowerCase()
        );
        if (duplicateName) {
          throw new Error("That callsign is already in use. Rejoin from the original device or choose another name.");
        }
        responsePlayerId = requestedId;
        responseToken = joinToken;
      }
      actionPayload = { ...payload, playerId: requestedId, sessionToken: joinToken };
    } else {
      const id = actorId(payload);
      if (!id) throw new Error("Player identity is required for this action.");
      requireSession(room, payload, id);
      responsePlayerId = id;
    }
    const workingCopy = clone(room);
    const result = applyGameAction(workingCopy, actionPayload);
    if (isJoin) {
      const joinedPlayer = result.room.players.find((player) => player.id === responsePlayerId);
      if (!joinedPlayer) throw new Error("Could not establish player identity in this room.");
      if (!room.players.some((player) => player.id === responsePlayerId)) {
        joinedPlayer.sessionTokenHash = hashSessionToken(responseToken);
      }
    }
    if (await writeRoomConditional(code, result.room, etag)) {
      return publicResponse(result.room, responsePlayerId, responseToken);
    }
  }
  throw new Error("High activity in room \u2014 please retry your action.");
}

// src/server/gameHandler.ts
async function handler(req, res) {
  if (typeof Request !== "undefined" && req instanceof Request && !res) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { "Cache-Control": "no-store, max-age=0" }
      });
    }
    try {
      let payload;
      if (req.method === "GET") {
        const url = new URL(req.url);
        const code = url.searchParams.get("code") || "";
        const playerId = url.searchParams.get("playerId") || void 0;
        payload = { action: "get_room", code, playerId };
      } else {
        payload = await req.json();
      }
      const result = await processGameRequest(payload);
      return new Response(JSON.stringify({ ok: true, ...result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff"
        }
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: err?.message || "Unexpected server error" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, max-age=0",
            "X-Content-Type-Options": "nosniff"
          }
        }
      );
    }
  }
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  try {
    let payload;
    if (req.method === "GET") {
      const code = req.query?.code || "";
      const playerId = req.query?.playerId || void 0;
      payload = { action: "get_room", code, playerId };
    } else {
      payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    }
    const result = await processGameRequest(payload);
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: err?.message || "Unexpected server error"
    });
  }
}
export {
  handler as default
};
