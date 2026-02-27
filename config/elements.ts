// Element catalog — all landscape elements available in the game

export interface ElementDefinition {
  type: string;
  name: string;
  category: string;
  description: string;
  funFacts?: string[];
  width: number;
  height: number;
}

export const ELEMENT_CATALOG: ElementDefinition[] = [
  // === TREES ===
  {
    type: 'oak_tree',
    name: 'Oak Tree',
    category: 'trees',
    description: 'Long-lived native oak reaching 80–100 ft. Acorns feed deer, turkeys, and songbirds while the canopy hosts hundreds of moth and butterfly species.',
    funFacts: [
      'A single oak can produce 70,000 acorns per year',
      'Supports 500+ species of caterpillars',
      'Can live over 200 years',
    ],
    width: 64,
    height: 64,
  },
  {
    type: 'maple_tree',
    name: 'Maple Tree',
    category: 'trees',
    description: 'Native maple with brilliant red and orange fall foliage. Feeds birds, squirrels, and pollinators with early-spring blooms.',
    funFacts: [
      'Red maples are one of the first trees to bloom in spring',
      'Seeds spin like tiny helicopters when they fall',
      'Fall leaves turn red, orange, and yellow all on one tree',
    ],
    width: 64,
    height: 64,
  },
  {
    type: 'pine_tree',
    name: 'Pine Tree',
    category: 'trees',
    description: 'Tall evergreen native to the SE US, providing year-round shelter and seeds for birds and squirrels. Fast-growing with dense needles that support wildlife across all seasons.',
    funFacts: [
      'Loblolly pines can grow 2 ft per year',
      'Pine needles make natural mulch that enriches soil',
      'Bald eagles prefer tall pines for nesting',
    ],
    width: 48,
    height: 64,
  },
  {
    type: 'fruit_tree',
    name: 'Fruit Tree',
    category: 'trees',
    description: 'Spring blossoms attract bees and butterflies, including Eastern Tiger Swallowtails. Fruit feeds small mammals and birds through summer and fall.',
    funFacts: [
      'A single apple tree can produce 800 lbs of fruit per year',
      'Fruit trees need pollinators — no bees, no fruit!',
      'Fallen fruit feeds foxes, deer, and box turtles',
    ],
    width: 48,
    height: 56,
  },

  // === SHRUBS ===
  {
    type: 'native_shrub',
    name: 'Native Shrub',
    category: 'shrubs',
    description: 'Dense native shrub providing critical wildlife cover. Bright berries feed 48+ bird species through winter.',
    funFacts: [
      'Winterberry holly berries last all winter for hungry birds',
      'Dense branches hide nests from predators',
      'Native shrubs support 10x more caterpillars than non-native ones',
    ],
    width: 40,
    height: 36,
  },
  {
    type: 'berry_bush',
    name: 'Berry Bush',
    category: 'shrubs',
    description: 'Produces summer berries eaten by songbirds, bears, and small mammals. Spring blooms attract native bees and butterflies.',
    funFacts: [
      'Blueberries are one of the only fruits native to North America',
      'Birds can strip a berry bush clean in a single day',
      'Berry bushes turn brilliant red in fall',
    ],
    width: 36,
    height: 32,
  },
  {
    type: 'hedge_row',
    name: 'Hedge Row',
    category: 'shrubs',
    description: 'Dense native shrubs form living corridors for nesting birds and pollinators. Evergreen hedgerows block wind, shelter wildlife, and connect fragmented habitats.',
    funFacts: [
      'Hedgerows can be wildlife highways connecting isolated habitats',
      'A single hedgerow can shelter 60+ bird species',
      'Hedges reduce wind speed by up to 50%',
    ],
    width: 64,
    height: 28,
  },

  // === FLOWERS ===
  {
    type: 'wildflower_patch',
    name: 'Wildflower Patch',
    category: 'flowers',
    description: 'Native wildflower mix of coneflowers and black-eyed Susans. Attracts bees, butterflies, and songbirds across three seasons of bloom.',
    funFacts: [
      'Black-eyed Susans bloom for up to 3 months straight',
      'Coneflower seeds are a favorite winter food for goldfinches',
      'Wildflower meadows support 3x more pollinators than lawns',
    ],
    width: 40,
    height: 32,
  },
  {
    type: 'sunflower_cluster',
    name: 'Sunflower Cluster',
    category: 'flowers',
    description: 'Towering up to 10 ft tall with bold yellow blooms that attract bees and butterflies. Leave seed heads standing to feed birds through winter.',
    funFacts: [
      'Sunflower heads track the sun across the sky (heliotropism)',
      'A single head can contain up to 2,000 seeds',
      'Sunflower roots can pull toxins out of contaminated soil',
    ],
    width: 36,
    height: 44,
  },
  {
    type: 'shade_fern',
    name: 'Shade Fern',
    category: 'flowers',
    description: 'Evergreen understory fern that holds moisture and prevents erosion on shaded slopes. Provides year-round ground cover and nesting material for songbirds.',
    funFacts: [
      'Christmas ferns stay green all winter under the snow',
      'Ferns are ancient — they existed before dinosaurs',
      'Birds line their nests with soft fern fronds',
    ],
    width: 32,
    height: 28,
  },

  // === GROUND COVER ===
  {
    type: 'native_grass',
    name: 'Native Grass',
    category: 'ground_cover',
    description: 'Deep-rooted native grasses that prevent erosion and build soil health. Seeds feed songbirds while dense clumps shelter wildlife year-round.',
    funFacts: [
      'Native grass roots can grow 10–15 ft deep',
      'Switchgrass was the dominant plant of the American prairie',
      'Grasslands store more carbon underground than forests do',
    ],
    width: 48,
    height: 24,
  },
  {
    type: 'moss_patch',
    name: 'Moss Patch',
    category: 'ground_cover',
    description: 'Shade-loving moss that absorbs many times its weight in water, preventing erosion. A low-maintenance ground cover that shelters insects and retains moisture year-round.',
    funFacts: [
      'Moss can absorb up to 20x its dry weight in water',
      'Moss has no roots — it absorbs water through its leaves',
      'Some mosses can survive being completely dried out for years',
    ],
    width: 40,
    height: 20,
  },
  {
    type: 'clover_ground',
    name: 'Clover Ground Cover',
    category: 'ground_cover',
    description: 'Fixes nitrogen in soil and spreads as a living mat. Attracts bees and butterflies while enriching depleted ground.',
    funFacts: [
      'Clover makes its own fertilizer by pulling nitrogen from the air',
      'A four-leaf clover is a 1 in 5,000 mutation',
      'Honeybees love clover — it is their top nectar source',
    ],
    width: 44,
    height: 22,
  },

  // === WATER FEATURES ===
  {
    type: 'rain_garden',
    name: 'Rain Garden',
    category: 'water_features',
    description: 'A planted depression that captures and filters stormwater runoff.',
    funFacts: [
      'Rain gardens can absorb 30% more water than a lawn',
      'They filter pollutants like oil and fertilizer from runoff',
      'A rain garden recharges groundwater naturally',
    ],
    width: 56,
    height: 48,
  },
  {
    type: 'small_pond',
    name: 'Small Pond',
    category: 'water_features',
    description: 'A small pond supporting amphibians, insects, and birds.',
    funFacts: [
      'Even a small pond can support frogs, dragonflies, and newts',
      'Ponds are the most biodiverse habitat per square foot',
      'Dragonfly larvae live in ponds for up to 5 years before flying',
    ],
    width: 56,
    height: 44,
  },
  {
    type: 'birdbath',
    name: 'Bird Bath',
    category: 'water_features',
    description: 'A simple water source attracting birds to the garden.',
    funFacts: [
      'Birds need water for drinking and bathing to keep feathers clean',
      'Moving water attracts more bird species than still water',
      'Birdbaths can attract species that never visit feeders',
    ],
    width: 28,
    height: 32,
  },

  // === STRUCTURES ===
  {
    type: 'birdhouse',
    name: 'Birdhouse',
    category: 'structures',
    description: 'Nesting box providing shelter for cavity-nesting birds.',
    funFacts: [
      'Bluebirds, wrens, and chickadees all use nest boxes',
      'The entrance hole size determines which birds move in',
      'A birdhouse should face away from prevailing winds',
    ],
    width: 24,
    height: 36,
  },
  {
    type: 'insect_hotel',
    name: 'Insect Hotel',
    category: 'structures',
    description: 'A shelter for beneficial insects like solitary bees and ladybugs.',
    funFacts: [
      'Solitary bees pollinate 90% of wild plants worldwide',
      'Ladybugs eat up to 5,000 aphids in a lifetime',
      'Mason bees are 100x more efficient pollinators than honeybees',
    ],
    width: 28,
    height: 32,
  },
  {
    type: 'compost_bin',
    name: 'Compost Bin',
    category: 'structures',
    description: 'Recycles organic waste into rich soil nutrients.',
    funFacts: [
      'Compost can be ready in as little as 3 months',
      'Worms in a compost bin can eat half their weight daily',
      'Composting reduces landfill methane emissions',
    ],
    width: 28,
    height: 28,
  },
  {
    type: 'bench',
    name: 'Park Bench',
    category: 'structures',
    description: 'A wooden bench inviting visitors to sit and watch birds. Encourages people to slow down, observe wildlife, and connect with the sanctuary.',
    funFacts: [
      'Sitting quietly for 10 min lets wildlife return and forage nearby',
      'Birdwatchers discover more species by sitting still than walking',
      'Benches near water or feeders see the most bird activity',
    ],
    width: 40,
    height: 28,
  },

  // === WILDLIFE HABITAT ===
  {
    type: 'log_pile',
    name: 'Log Pile',
    category: 'wildlife_habitat',
    description: 'Decomposing logs providing habitat for insects and small animals.',
    funFacts: [
      'A rotting log can house beetles, salamanders, and fungi',
      'Decomposing wood returns nutrients to the soil for decades',
      'Fireflies lay their eggs in moist, decaying wood',
    ],
    width: 44,
    height: 28,
  },
  {
    type: 'rock_garden',
    name: 'Rock Garden',
    category: 'wildlife_habitat',
    description: 'Rocks providing basking spots for reptiles and shelter for insects.',
    funFacts: [
      'Lizards and snakes bask on warm rocks to regulate body temperature',
      'Gaps between rocks create micro-habitats for ground beetles',
      'Rock gardens need zero watering — great for dry areas',
    ],
    width: 48,
    height: 32,
  },

  // === INVASIVE ===
  {
    type: 'invasive_vine',
    name: 'Invasive Vine',
    category: 'invasive',
    description: '⚠️ Aggressive vine that smothers native plants. Hurts biodiversity!',
    funFacts: [
      'Kudzu vine can grow up to 1 ft per day in summer',
      'Invasive vines block sunlight and kill trees by smothering them',
      'English ivy damages buildings and trees with clinging roots',
    ],
    width: 36,
    height: 36,
  },
  {
    type: 'invasive_grass',
    name: 'Invasive Grass',
    category: 'invasive',
    description: '⚠️ Non-native grass that crowds out native species.',
    funFacts: [
      'Bermuda grass spreads by runners, seeds, and underground stems',
      'Invasive grasses fuel hotter, more frequent wildfires',
      'Non-native grasses provide almost no food for native insects',
    ],
    width: 48,
    height: 24,
  },
];

export const ELEMENT_CATEGORIES: { key: string; label: string; color: string }[] = [
  { key: 'trees', label: 'Trees', color: '#2d5a27' },
  { key: 'shrubs', label: 'Shrubs', color: '#4a7c3f' },
  { key: 'flowers', label: 'Flowers', color: '#c94c8e' },
  { key: 'ground_cover', label: 'Ground Cover', color: '#6b8f3c' },
  { key: 'water_features', label: 'Water', color: '#3b82c4' },
  { key: 'structures', label: 'Structures', color: '#8b6914' },
  { key: 'wildlife_habitat', label: 'Habitat', color: '#7a5230' },
  { key: 'invasive', label: 'Invasive ⚠️', color: '#c0392b' },
];

export function getElementDef(type: string): ElementDefinition | undefined {
  return ELEMENT_CATALOG.find((e) => e.type === type);
}
