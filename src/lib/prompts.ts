import { TriviaPrompt, TriviaSource } from './types';

export interface CategoryMeta {
  id: string;
  name: string;
  icon: string;
  tagline: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'Classified History',
    name: 'Classified History',
    icon: '🕵️',
    tagline: 'Absurd military plots, royal eccentricities & forgotten scandals',
  },
  {
    id: 'Bizarre Laws',
    name: 'Bizarre Laws',
    icon: '⚖️',
    tagline: 'Real statutes and courtroom rulings too weird to be fiction',
  },
  {
    id: 'Absurd Science',
    name: 'Absurd Science',
    icon: '🧪',
    tagline: 'Ig Nobel experiments, weird patents & cosmic oddities',
  },
  {
    id: 'Strange Nature',
    name: 'Strange Nature',
    icon: '🐙',
    tagline: 'Evolutionary plot twists and animals behaving badly',
  },
  {
    id: 'Heists & Hoaxes',
    name: 'Heists & Hoaxes',
    icon: '💎',
    tagline: 'Audacious cons, stolen landmarks & legendary pranks',
  },
  {
    id: 'Pop & Tech Oddities',
    name: 'Pop & Tech Oddities',
    icon: '🕹️',
    tagline: 'Glitches, billionaires, corporate blunders & viral history',
  },
];

export const PLAYER_AVATARS = [
  '🦊', '🐙', '🦉', '🦈', '🦄', '🐲', '🤖', '👽', '🎭', '⚡', '🔮', '👑'
];

export const PLAYER_COLORS = [
  '#00F2FE', // Electric Cyan
  '#FF2A85', // Hyper Magenta
  '#FFB800', // Solar Gold
  '#00E699', // Neon Emerald
  '#A855F7', // Ultraviolet
  '#FF6B35', // Plasma Coral
  '#38BDF8', // Sky Laser
  '#F43F5E', // Crimson Pulse
];

export const TRIVIA_PROMPTS: TriviaPrompt[] = [
  // 1. Classified History
  {
    id: 'hist-1',
    category: 'Classified History',
    categoryIcon: '🕵️',
    question: 'During World War II, the U.S. OSS (predecessor to the CIA) developed a secret weapon to spook Japanese soldiers by painting foxes with _____ so they looked like floating demon spirits.',
    truth: 'glow-in-the-dark paint',
    acceptedTruthSynonyms: ['glow in the dark paint', 'luminescent paint', 'radioactive paint', 'glowing paint', 'phosphorescent paint'],
    houseDecoys: [
      'phosphorus squid ink',
      'holographic mirrors',
      'uv reactive jellyfish oil',
      'silver theatrical greasepaint'
    ],
    factoid: 'Codenamed Operation Fantasia, the plan was tested in Washington, D.C.’s Rock Creek Park. Smithsonian reports that the paint contained radium; the wider scheme was abandoned after practical problems, including getting the paint to survive the foxes’ swim to shore.',
    difficulty: 'Devious',
  },
  {
    id: 'hist-2',
    category: 'Classified History',
    categoryIcon: '🕵️',
    question: 'According to an 1807 anecdote, Napoleon’s post-Treaty of Tilsit rabbit hunt went wrong when a crowd of tame farm _____ charged toward the hunting party instead of fleeing.',
    truth: 'rabbits',
    acceptedTruthSynonyms: ['bunnies', 'domesticated rabbits', 'tame rabbits', 'farm rabbits'],
    houseDecoys: [
      'a flock of drunken palace peacocks',
      'escaped Prussian war hounds',
      'swarms of angry hornet nests',
      'twenty-four trained circus bears'
    ],
    factoid: 'Chief of Staff Alexandre Berthier bought tame farmed rabbits instead of wild ones for a royal hunt. When the cages opened, the bunnies thought Napoleon had food and swarmed his carriage.',
    difficulty: 'Standard',
  },
  {
    id: 'hist-3',
    category: 'Classified History',
    categoryIcon: '🕵️',
    question: 'In 1997, the small Alaskan community of Talkeetna began its unusual write-in mayoral story by electing _____ as its honorary mayor.',
    truth: 'an orange tabby cat named Stubbs',
    acceptedTruthSynonyms: ['a cat', 'stubbs the cat', 'an orange cat', 'tabby cat', 'cat named stubbs'],
    houseDecoys: [
      'a retired sled dog named Yukon',
      'a wooden chainsaw carving of a moose',
      'an unplugged 1984 vending machine',
      'a three-legged bald eagle'
    ],
    factoid: 'Stubbs was a write-in, honorary mayor of a community without a human mayor—not an elected municipal official. He held the title for about 20 years, until his death in 2017.',
    difficulty: 'Standard',
  },
  {
    id: 'hist-4',
    category: 'Classified History',
    categoryIcon: '🕵️',
    question: 'For its 1960s "Acoustic Kitty" project, the CIA put a microphone in a cat’s ear and implanted a tiny radio transmitter at the base of its _____ .',
    truth: 'skull',
    acceptedTruthSynonyms: ['the skull', 'cat’s skull', 'the base of the skull', 'back of its skull', 'head'],
    houseDecoys: [
      'a miniature microfilm camera',
      'a morse-code collar buzzer',
      'a magnetic tape recorder',
      'an infrared tracking beacon'
    ],
    factoid: 'Declassified records say the microphone sat in the ear canal and a fine wire antenna ran through the fur. The CIA ultimately called the animal-surveillance method impractical; the famous taxi story is disputed, so this round sticks to the documented hardware.',
    difficulty: 'Mind-Bender',
  },

  // 2. Bizarre Laws
  {
    id: 'law-1',
    category: 'Bizarre Laws',
    categoryIcon: '⚖️',
    question: 'Section 32 of the UK’s Salmon Act 1986 makes it an offence, in certain cases involving illegally caught fish, to handle salmon in _____ circumstances.',
    truth: 'suspicious',
    acceptedTruthSynonyms: ['suspicious circumstances', 'under suspicious circumstances', 'suspiciously'],
    houseDecoys: [
      'an unmuzzled ferret after sunset',
      'a wheel of unaged cheddar cheese',
      'more than three brass tubas at once',
      'a top hat filled with live pigeons'
    ],
    factoid: 'The phrase is real, but the law targets receiving, retaining, moving or disposing of fish when you know—or reasonably suspect—it was illegally taken. It is not a ban on carrying a fish in a funny way.',
    difficulty: 'Standard',
  },
  {
    id: 'law-2',
    category: 'Bizarre Laws',
    categoryIcon: '⚖️',
    question: 'Swiss animal-welfare rules say social species such as guinea pigs must not be kept alone. So a pet owner needs at least one companion _____ .',
    truth: 'guinea pig',
    acceptedTruthSynonyms: ['another guinea pig', 'a second guinea pig', 'guinea pig companion', 'guinea pig friend'],
    houseDecoys: [
      'miniature lop rabbit',
      'pygmy hedgehog',
      'fainting goat',
      'sugar glider'
    ],
    factoid: 'Switzerland’s Federal Food Safety and Veterinary Office says social animal species must not be kept individually. Guinea pigs are among the species for which the rules specify a group of at least two; the welfare principle is real, even if many viral summaries exaggerate its enforcement.',
    difficulty: 'Standard',
  },
  {
    id: 'law-3',
    category: 'Bizarre Laws',
    categoryIcon: '⚖️',
    question: 'In Stambovsky v. Ackley, a 1991 New York appellate court famously described a seller-promoted house as haunted as a matter of _____ .',
    truth: 'law',
    acceptedTruthSynonyms: ['a matter of law', 'legally', 'legally haunted'],
    houseDecoys: [
      'built directly over a subway vent',
      'used as a set for a soap opera',
      'visited daily by a flock of 80 crows',
      'missing all interior bedroom doors'
    ],
    factoid: 'The court allowed the buyer to seek rescission because the seller had publicly promoted the house’s ghostly reputation. It was a narrow, case-specific property ruling—not a blanket rule about supernatural disclosures.',
    difficulty: 'Devious',
  },
  {
    id: 'law-4',
    category: 'Bizarre Laws',
    categoryIcon: '⚖️',
    question: 'In the French vineyard town of Châteauneuf-du-Pape, a 1954 municipal decree still on the books strictly forbids _____ from landing or taking off within town limits.',
    truth: 'flying saucers and UFOs',
    acceptedTruthSynonyms: ['flying saucers', 'ufos', 'alien spaceships', 'extraterrestrial craft', 'spaceships'],
    houseDecoys: [
      'advertising blimps for cheap beer',
      'hot air balloons shaped like vegetables',
      'unlicensed carrier pigeons',
      'helicopters carrying wine critics'
    ],
    factoid: 'Mayor Lucien Jeune passed the law during a 1954 French UFO wave—and brilliant publicity stunt—declaring that any alien craft landing in the vineyards would be immediately impounded.',
    difficulty: 'Devious',
  },

  // 3. Absurd Science
  {
    id: 'sci-1',
    category: 'Absurd Science',
    categoryIcon: '🧪',
    question: 'In 2000, physicist Andre Geim won the Ig Nobel Prize (before later winning a real Nobel Prize) for using powerful electromagnets to levitate a live _____ in mid-air.',
    truth: 'frog',
    acceptedTruthSynonyms: ['a frog', 'live frog', 'green frog', 'toad'],
    houseDecoys: [
      'hamster in a tiny tuxedo',
      'garden snail',
      'goldfish in a water droplet',
      'bumblebee asleep on a petal'
    ],
    factoid: 'Geim remains the only person in history to win both an Ig Nobel Prize (for levitating a frog via diamagnetism) and a Nobel Prize in Physics (for discovering graphene).',
    difficulty: 'Standard',
  },
  {
    id: 'sci-2',
    category: 'Absurd Science',
    categoryIcon: '🧪',
    question: 'Astronomers detected ethyl formate in the Sagittarius B2 cloud. On Earth, this molecule contributes to raspberry flavor and also smells like _____ .',
    truth: 'rum',
    acceptedTruthSynonyms: ['a rum-like aroma', 'rum', 'alcohol', 'liquor'],
    houseDecoys: [
      'burnt toast and vanilla',
      'sour green apples and ozone',
      'salted caramel and copper',
      'peppermint and sulfur'
    ],
    factoid: 'The molecule’s presence was detected by radio astronomy. That does not mean the vacuum of space literally tastes like raspberry rum: Sagittarius B2 contains many molecules, and ethyl formate is only one contributor to raspberry flavor and rum’s aroma.',
    difficulty: 'Devious',
  },
  {
    id: 'sci-3',
    category: 'Absurd Science',
    categoryIcon: '🧪',
    question: 'The University of Queensland’s century-long Pitch Drop Experiment has produced only _____ full drops since the funnel stem was cut in 1930.',
    truth: 'nine',
    acceptedTruthSynonyms: ['9', 'nine drops', 'only nine drops'],
    houseDecoys: [
      'a fossilized pine resin bead',
      'frozen mercury',
      'petrified maple syrup',
      'molten cathedral stained glass'
    ],
    factoid: 'Physicist Thomas Parnell prepared the pitch in 1927, let it settle, then cut the funnel stem in 1930. The first drop took eight years to fall; the ninth fell in 2014. UQ’s experiment page lists nine drops to date.',
    difficulty: 'Mind-Bender',
  },
  {
    id: 'sci-4',
    category: 'Absurd Science',
    categoryIcon: '🧪',
    question: 'During the 1904 Olympic Marathon in St. Louis, winner Thomas Hicks was kept running by his trainers, who fed him a wild sports drink made of _____ .',
    truth: 'strychnine rat poison, raw egg whites, and brandy',
    acceptedTruthSynonyms: ['rat poison and brandy', 'strychnine and brandy', 'rat poison', 'strychnine'],
    houseDecoys: [
      'warm beef broth mixed with gunpowder',
      'melted lard, espresso, and vinegar',
      'pickled herring juice and laudanum',
      'carbonated goat milk and cayenne pepper'
    ],
    factoid: 'His support crew first gave him strychnine mixed with egg whites; later, another dose was taken with brandy. Small doses were then believed to act as a stimulant, though strychnine is a potent poison. The Smithsonian account describes Hicks as nearly collapsing near the finish.',
    difficulty: 'Devious',
  },

  // 4. Strange Nature
  {
    id: 'nat-1',
    category: 'Strange Nature',
    categoryIcon: '🐙',
    question: 'Wombats are the only known mammals whose intestines form their dry droppings into three-dimensional _____ .',
    truth: 'cubes',
    acceptedTruthSynonyms: ['cube shapes', 'cube-shaped droppings', 'cubic feces', 'cuboids'],
    houseDecoys: [
      'gallstones',
      'earwax pellets',
      'milk curds',
      'burrow entrance tunnels'
    ],
    factoid: 'The cubes form inside the last part of the intestine, where uneven tissue stiffness and muscular contractions shape the stool. Wombats use droppings to communicate; researchers suggest the flat sides help them stay put on rocks and logs.',
    difficulty: 'Standard',
  },
  {
    id: 'nat-2',
    category: 'Strange Nature',
    categoryIcon: '🐙',
    question: 'When a platypus hunts underwater with its eyes, ears and nostrils closed, sensors in its bill detect tiny electrical signals from prey. The sense is called _____ .',
    truth: 'electroreception',
    acceptedTruthSynonyms: ['electroreceptors', 'electroreception', 'electrolocation', 'detecting electrical signals', 'electric-field sensing'],
    houseDecoys: [
      'magnetoreception',
      'echolocation',
      'infrared vision',
      'ultraviolet polarization'
    ],
    factoid: 'The Australian Museum describes the platypus bill as its main underwater sense organ, with pressure-sensitive receptors and electroreceptors. Exactly how the platypus combines those signals to pinpoint prey is still being studied.',
    difficulty: 'Standard',
  },
  {
    id: 'nat-3',
    category: 'Strange Nature',
    categoryIcon: '🐙',
    question: 'To defend itself from predators, the Malaysian exploding ant (Colobopsis explodens) flexes its abdomen so hard that it ruptures and sprays attackers with _____ .',
    truth: 'bright yellow toxic glue',
    acceptedTruthSynonyms: ['yellow glue', 'toxic glue', 'sticky yellow goo', 'poisonous glue'],
    houseDecoys: [
      'boiling peppermint-scented acid',
      'foaming purple ink',
      'cloud of sneezing powder spores',
      'liquid wax that hardens like cement'
    ],
    factoid: 'The ant’s defensive secretion is bright yellow, sticky, toxic, and has a spice- or curry-like smell. The self-sacrificing rupture is called autothysis; this is a last-resort defense for the colony.',
    difficulty: 'Devious',
  },
  {
    id: 'nat-4',
    category: 'Strange Nature',
    categoryIcon: '🐙',
    question: 'Male satin bowerbirds build courtship bowers and are especially drawn to plastic bottle-top treasures in the color _____.',
    truth: 'blue',
    acceptedTruthSynonyms: ['blue objects', 'blue bottle caps', 'the color blue'],
    houseDecoys: [
      'shiny silver coins and keys',
      'round white river pebbles',
      'discarded golf balls',
      'red casino poker chips'
    ],
    factoid: 'Satin bowerbirds particularly prefer blue decorations; field research found bottle tops among the most sought-after objects relative to their availability. A bower is a courtship display, not a nest.',
    difficulty: 'Standard',
  },

  // 5. Heists & Hoaxes
  {
    id: 'heist-1',
    category: 'Heists & Hoaxes',
    categoryIcon: '💎',
    question: 'Between 2011 and 2012, thieves pulled off the "Great Canadian Heist" in Quebec by siphoning thousands of barrels of _____ from the province’s strategic reserve.',
    truth: 'maple syrup',
    acceptedTruthSynonyms: ['pure maple syrup', 'barrels of maple syrup', 'syrup'],
    houseDecoys: [
      'aged ice-wine vintage',
      'medical-grade helium gas',
      'solid gold hockey pucks',
      'arctic salmon caviar'
    ],
    factoid: 'The thieves rented space inside the Federation of Quebec Maple Syrup Producers’ warehouse, drained 3,000 tons of syrup, and refilled the barrels with water so inspectors wouldn’t notice.',
    difficulty: 'Standard',
  },
  {
    id: 'heist-2',
    category: 'Heists & Hoaxes',
    categoryIcon: '💎',
    question: 'In 1925, con artist Victor Lustig posed as a French official and sold a scrap-metal dealer the rights to dismantle which Paris landmark—then tried the same con again? _____',
    truth: 'the Eiffel Tower',
    acceptedTruthSynonyms: ['eiffel tower', 'paris eiffel tower'],
    houseDecoys: [
      'the Louvre glass pyramid',
      'Napoleon’s solid bronze cannon fleet',
      'the Palace of Versailles gates',
      'the Paris Metro underground tracks'
    ],
    factoid: 'Lustig sold the supposed scrap rights to André Poisson once. Emboldened when Poisson did not report the scam, he returned to attempt it again—but the second target became suspicious and alerted police. So: one confirmed sale, one failed repeat attempt.',
    difficulty: 'Standard',
  },
  {
    id: 'heist-3',
    category: 'Heists & Hoaxes',
    categoryIcon: '💎',
    question: 'On April Fools’ Day 1957, the BBC news program Panorama convinced thousands of British viewers that mild winter weather had resulted in a bumper harvest of _____ growing on trees in Switzerland.',
    truth: 'spaghetti',
    acceptedTruthSynonyms: ['spaghetti noodles', 'pasta', 'spaghetti on trees'],
    houseDecoys: [
      'pre-peeled bananas',
      'swiss cheese wheels',
      'square watermelon cubes',
      'instant coffee beans'
    ],
    factoid: 'Hundreds of viewers phoned the BBC asking how to grow their own spaghetti bush; operators famously replied, "Place a sprig of spaghetti in a tin of tomato sauce and hope for the best."',
    difficulty: 'Standard',
  },
  {
    id: 'heist-4',
    category: 'Heists & Hoaxes',
    categoryIcon: '💎',
    question: 'In July 2008, an estimated 500 truckloads of white beach _____ disappeared from Coral Spring in Jamaica’s Trelawny parish.',
    truth: 'sand',
    acceptedTruthSynonyms: ['white sand', 'beach sand', 'coral sand', 'white coral sand'],
    houseDecoys: [
      'driftwood sculptures',
      'pink conch shells',
      'sunken Spanish cobblestones',
      'luxury cabana huts'
    ],
    factoid: 'The Guardian reported that about 500 truckloads were removed from the Coral Spring site. Some of the sand was later reported found at two hotel developments; the theft sparked a complex investigation and political controversy.',
    difficulty: 'Devious',
  },

  // 6. Pop & Tech Oddities
  {
    id: 'tech-1',
    category: 'Pop & Tech Oddities',
    categoryIcon: '🕹️',
    question: 'In 1991, researchers at the University of Cambridge aimed a camera at the Trojan Room’s _____ so they could check whether it was full before walking over.',
    truth: 'coffee pot',
    acceptedTruthSynonyms: ['coffee machine', 'coffee maker', 'coffee pot', 'pot of coffee'],
    houseDecoys: [
      'a sleeping campus cat named Turing',
      'whether it was raining on the bike rack',
      'the temperature of the server room beer fridge',
      'how long the cafeteria lunch line was'
    ],
    factoid: 'The camera first served an image on the lab’s local network; it became publicly viewable on the web in 1993 and was switched off in 2001. Its modest goal was to save a disappointing trip to an empty pot.',
    difficulty: 'Standard',
  },
  {
    id: 'tech-2',
    category: 'Pop & Tech Oddities',
    categoryIcon: '🕹️',
    question: 'In 1992, Pepsi’s Philippine "Number Fever" contest announced 349 as a jackpot number; that number had already appeared inside about _____ bottle caps.',
    truth: '800,000',
    acceptedTruthSynonyms: ['800000', 'eight hundred thousand', '800,000 bottle caps', 'hundreds of thousands'], 
    houseDecoys: [
      'rival Coca-Cola cans by mistake',
      'billboards two weeks before the draw',
      'every single newspaper in Manila',
      'expired milk cartons'
    ],
    factoid: 'Pepsi said the 349 caps lacked the required security code, so they were not valid jackpot claims. The announcement nevertheless sparked mass protests; the company later offered a goodwill payment to holders of misprinted caps.',
    difficulty: 'Devious',
  },
  {
    id: 'tech-3',
    category: 'Pop & Tech Oddities',
    categoryIcon: '🕹️',
    question: 'Nintendo began in Kyoto in 1889, long before video games, by manufacturing Japanese playing cards called _____ .',
    truth: 'Hanafuda',
    acceptedTruthSynonyms: ['hanafuda cards', 'flower cards', 'Japanese flower cards'],
    houseDecoys: [
      'bamboo abacus calculators',
      'clockwork brass singing birds',
      'painted silk paper lanterns',
      'wooden puzzle boxes'
    ],
    factoid: 'Nintendo’s own company history says Fusajiro Yamauchi began manufacturing and selling Hanafuda playing cards in Kyoto in 1889. The company still sells a modern Hanafuda set.',
    difficulty: 'Standard',
  },
  {
    id: 'tech-4',
    category: 'Pop & Tech Oddities',
    categoryIcon: '🕹️',
    question: 'Cloudflare’s LavaRand system adds a visual source of randomness by filming a wall of about 100 _____ in its San Francisco lobby.',
    truth: 'lava lamps',
    acceptedTruthSynonyms: ['a hundred lava lamps', '100 lava lamps', 'lava lamps'],
    houseDecoys: [
      'fifty ant farms in neon gel',
      'pendulum clocks swinging out of sync',
      'automated dice-rolling machines',
      'goldfish swimming through laser beams'
    ],
    factoid: 'Cloudflare says the filmed wax patterns and camera sensor noise are mixed into its entropy pool as an additional randomness source—not used alone as a magic encryption key generator.',
    difficulty: 'Standard',
  },
];

export const TRIVIA_SOURCES: Record<string, TriviaSource> = {
  'hist-1': {
    label: 'Smithsonian Magazine · Operation Fantasia',
    url: 'https://www.smithsonianmag.com/history/unsuccessful-wwii-plot-fight-japanese-radioactive-foxes-180975932/',
  },
  'hist-2': {
    label: 'Mental Floss · Napoleon and the rabbits',
    url: 'https://www.mentalfloss.com/article/51364/time-napoleon-was-attacked-rabbits',
  },
  'hist-3': {
    label: 'BBC News · Talkeetna’s honorary cat mayor',
    url: 'https://www.bbc.com/news/newsbeat-37164544',
  },
  'hist-4': {
    label: 'Smithsonian Magazine · Project Acoustic Kitty',
    url: 'https://www.smithsonianmag.com/smart-news/cia-experimented-animals-1960s-too-just-ask-acoustic-kitty-180964313/',
  },
  'law-1': {
    label: 'UK legislation · Salmon Act 1986, section 32',
    url: 'https://www.legislation.gov.uk/ukpga/1986/62/section/32',
  },
  'law-2': {
    label: 'SWI swissinfo.ch · Swiss guinea-pig welfare fact-check',
    url: 'https://www.swissinfo.ch/eng/culture/loo-flushing-explosives-gold_fact-check-lonely-guinea-pigs-and-other-quirky-swiss-rumours/45067078',
  },
  'law-3': {
    label: 'Cornell Law · Stambovsky v. Ackley',
    url: 'https://www.law.cornell.edu/wex/stambovsky_v._ackley',
  },
  'law-4': {
    label: 'Space Legal Issues · Châteauneuf-du-Pape’s 1954 decree',
    url: 'https://www.spacelegalissues.com/the-french-anti-ufo-municipal-law-of-1954/',
  },
  'sci-1': {
    label: 'BBC Bitesize · Geim’s levitating frog and Nobel prizes',
    url: 'https://www.bbc.co.uk/bitesize/articles/zp2yrmn',
  },
  'sci-2': {
    label: 'The Guardian · Ethyl formate in Sagittarius B2',
    url: 'https://www.theguardian.com/science/2009/apr/21/space-raspberries-amino-acids-astrobiology',
  },
  'sci-3': {
    label: 'University of Queensland · Pitch Drop Experiment',
    url: 'https://smp.uq.edu.au/pitch-drop-experiment',
  },
  'sci-4': {
    label: 'Smithsonian Magazine · 1904 Olympic Marathon',
    url: 'https://www.smithsonianmag.com/history/how-the-1904-marathon-became-one-of-the-weirdest-olympic-events-of-all-time-14910747/',
  },
  'nat-1': {
    label: 'BBC News · Why wombats produce cube-shaped droppings',
    url: 'https://www.bbc.co.uk/news/world-australia-46258616',
  },
  'nat-2': {
    label: 'Australian Museum · Platypus feeding and electroreception',
    url: 'https://australian.museum/learn/animals/mammals/platypus/',
  },
  'nat-3': {
    label: 'Smithsonian Magazine · Exploding ant defense',
    url: 'https://www.smithsonianmag.com/smart-news/exploding-ant-ruptures-its-own-body-defend-its-nest-180968857/',
  },
  'nat-4': {
    label: 'ABC Science · Satin bowerbirds and blue bottle tops',
    url: 'https://www.abc.net.au/science/articles/2006/08/28/1723333.htm',
  },
  'heist-1': {
    label: 'Vanity Fair · Quebec’s maple-syrup heist',
    url: 'https://www.vanityfair.com/news/2016/12/maple-syrup-heist',
  },
  'heist-2': {
    label: 'Smithsonian Magazine · The Eiffel Tower con',
    url: 'https://www.smithsonianmag.com/history/man-who-sold-eiffel-tower-twice-180958370/',
  },
  'heist-3': {
    label: 'BBC Archive · 1957 spaghetti-harvest prank',
    url: 'https://www.bbc.com/news/av/world-68707739',
  },
  'heist-4': {
    label: 'The Guardian · Jamaica’s missing beach sand',
    url: 'https://www.theguardian.com/world/2008/oct/21/jamaica',
  },
  'tech-1': {
    label: 'History of Information · Cambridge’s Trojan Room coffee pot',
    url: 'https://www.historyofinformation.com/detail.php?id=1507',
  },
  'tech-2': {
    label: 'The New York Times · Pepsi’s Number Fever fiasco',
    url: 'https://www.nytimes.com/1993/08/18/business/company-news-an-unlucky-number-pepsi-caps-the-damages-on-a-promotion-gone-flat.html',
  },
  'tech-3': {
    label: 'Nintendo · Official company history',
    url: 'https://www.nintendo.co.jp/corporate/en/history/index.html',
  },
  'tech-4': {
    label: 'Cloudflare Blog · LavaRand in production',
    url: 'https://blog.cloudflare.com/lavarand-in-production-the-nitty-gritty-technical-details/',
  },
};

export const BOT_NAMES = [
  'Cipher_Vex',
  'NovaBluff',
  'Echo_Mirage',
  'Kitsune_99',
  'Astra_Zero',
  'Vesper_Hex',
  'Chrono_Fox',
];
