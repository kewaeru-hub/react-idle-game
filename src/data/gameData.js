// src/data/gameData.js

export const SKILL_LIST = ['attack', 'strength', 'defence', 'ranged', 'magic', 'hitpoints', 'combat', 'slayer', 'prayer', 'woodcutting', 'fishing', 'cooking', 'mining', 'smithing', 'infusion', 'thieving', 'farming', 'foraging', 'herblore', 'crafting', 'agility'];

// ==========================================
// --- TOOLS (CONSTANTS & MAPPING) ---
// ==========================================
export const TOOL_SKILLS = {
  woodcutting: { icon: '🪓', name: 'Woodcutting Axe', tiers: ['bronze_axe', 'iron_axe', 'steel_axe', 'alloy_axe', 'apex_axe', 'nova_axe'] },
  fishing: { icon: '🎣', name: 'Fishing Rod', tiers: ['bronze_rod', 'iron_rod', 'steel_rod', 'alloy_rod', 'apex_rod', 'nova_rod'] },
  mining: { icon: '⛏️', name: 'Mining Pickaxe', tiers: ['bronze_pickaxe', 'iron_pickaxe', 'steel_pickaxe', 'alloy_pickaxe', 'apex_pickaxe', 'nova_pickaxe'] },
  cooking: { icon: '🍳', name: 'Cooking Pan', tiers: ['bronze_pan', 'iron_pan', 'steel_pan', 'alloy_pan', 'apex_pan', 'nova_pan'] },
  smithing: { icon: '🔨', name: 'Smithing Hammer', tiers: ['bronze_hammer', 'iron_hammer', 'steel_hammer', 'alloy_hammer', 'apex_hammer', 'nova_hammer'] },
  crafting: { icon: '🧵', name: 'Crafting Needle', tiers: ['bronze_needle', 'iron_needle', 'steel_needle', 'alloy_needle', 'apex_needle', 'nova_needle'] },
  herblore: { icon: '🧪', name: 'Herblore Pestle', tiers: ['bronze_pestle', 'iron_pestle', 'steel_pestle', 'alloy_pestle', 'apex_pestle', 'nova_pestle'] },
  farming: { icon: '🌱', name: 'Farming Spade', tiers: ['bronze_spade', 'iron_spade', 'steel_spade', 'alloy_spade', 'apex_spade', 'nova_spade'] },
  foraging: { icon: '🌾', name: 'Foraging Sickle', tiers: ['bronze_sickle', 'iron_sickle', 'steel_sickle', 'alloy_sickle', 'apex_sickle', 'nova_sickle'] },
  thieving: { icon: '🔓', name: 'Thieving Lockpick', tiers: ['bronze_lockpick', 'iron_lockpick', 'steel_lockpick', 'alloy_lockpick', 'apex_lockpick', 'nova_lockpick'] },
  agility: { icon: '👢', name: 'Agility Boots', tiers: ['bronze_boots', 'iron_boots', 'steel_boots', 'alloy_boots', 'apex_boots', 'nova_boots'] }
};

export const TOOL_DROP_HOURS = 20; // 1 bronze tool drops per 20 hours of skilling

export const PET_DROP_HOURS = 600; // 1 skilling pet drops per 600 hours of skilling

// ==========================================
// --- WEAPONS, ARMOR & AMMO STATS ---
// ==========================================

export const WEAPONS = {
  // --- SCIMITARS (Melee) ---
  bronze_scimitar: { name: 'Bronze Scimitar', att: 6, str: 6, speedTicks: 4, type: 'melee', value: 30 },
  iron_scimitar: { name: 'Iron Scimitar', att: 10, str: 9, speedTicks: 4, type: 'melee', value: 85 },
  steel_scimitar: { name: 'Steel Scimitar', att: 21, str: 20, speedTicks: 4, type: 'melee', value: 180 },
  alloy_scimitar: { name: 'Alloy Scimitar', att: 29, str: 28, speedTicks: 4, type: 'melee', value: 450 },
  apex_scimitar: { name: 'Apex Scimitar', att: 45, str: 44, speedTicks: 4, type: 'melee', value: 1200 },
  nova_scimitar: { name: 'Nova Scimitar', att: 67, str: 66, speedTicks: 4, type: 'melee', value: 3500 },
  
  // --- BOWS (Ranged) ---
  bronze_bow: { name: 'Bronze Bow', att: 8, str: 0, speedTicks: 3, type: 'ranged', value: 35 },
  iron_bow: { name: 'Iron Bow', att: 14, str: 0, speedTicks: 3, type: 'ranged', value: 95 },
  steel_bow: { name: 'Steel Bow', att: 20, str: 0, speedTicks: 3, type: 'ranged', value: 210 },
  alloy_bow: { name: 'Alloy Bow', att: 29, str: 0, speedTicks: 3, type: 'ranged', value: 520 },
  apex_bow: { name: 'Apex Bow', att: 47, str: 0, speedTicks: 3, type: 'ranged', value: 1400 },
  nova_bow: { name: 'Nova Bow', att: 69, str: 0, speedTicks: 3, type: 'ranged', value: 4000 },
  
  // --- STAFFS (Magic) ---
  bronze_staff: { name: 'Bronze Staff', att: 12, str: 18, speedTicks: 5, type: 'magic', value: 40 },
  iron_staff: { name: 'Iron Staff', att: 26, str: 39, speedTicks: 5, type: 'magic', value: 110 },
  steel_staff: { name: 'Steel Staff', att: 42, str: 58, speedTicks: 5, type: 'magic', value: 240 },
  alloy_staff: { name: 'Alloy Staff', att: 63, str: 76, speedTicks: 5, type: 'magic', value: 600 },
  apex_staff: { name: 'Apex Staff', att: 101, str: 115, speedTicks: 5, type: 'magic', value: 1600 },
  nova_staff: { name: 'Nova Staff', att: 132, str: 152, speedTicks: 5, type: 'magic', value: 4500 }
};

export const ARMOR = {
  // 🗡️ MELEE ARMOR
  bronze_helmet: { name: 'Bronze Helmet', equipSlot: 'head', accuracy: 0, magicAcc: -3, rangedAcc: -1, defence: 4, rangedDef: 4, magicDef: -1, value: 20 },
  bronze_body: { name: 'Bronze Platebody', equipSlot: 'body', accuracy: 0, magicAcc: -15, rangedAcc: -7, defence: 11, rangedDef: 14, magicDef: -4, value: 60 },
  bronze_legs: { name: 'Bronze Platelegs', equipSlot: 'legs', accuracy: 0, magicAcc: -11, rangedAcc: -5, defence: 7, rangedDef: 9, magicDef: -2, value: 40 },
  bronze_shield: { name: 'Bronze Shield', equipSlot: 'shield', accuracy: -1, magicAcc: -8, rangedAcc: -2, defence: 5, rangedDef: 6, magicDef: -2, value: 30 },
  
  iron_helmet: { name: 'Iron Helmet', equipSlot: 'head', accuracy: 0, magicAcc: -3, rangedAcc: -1, defence: 6, rangedDef: 6, magicDef: -1, value: 55 },
  iron_body: { name: 'Iron Platebody', equipSlot: 'body', accuracy: 0, magicAcc: -15, rangedAcc: -7, defence: 18, rangedDef: 20, magicDef: -4, value: 160 },
  iron_legs: { name: 'Iron Platelegs', equipSlot: 'legs', accuracy: 0, magicAcc: -11, rangedAcc: -5, defence: 11, rangedDef: 13, magicDef: -2, value: 110 },
  iron_shield: { name: 'Iron Shield', equipSlot: 'shield', accuracy: -1, magicAcc: -8, rangedAcc: -2, defence: 8, rangedDef: 9, magicDef: -2, value: 135 },

  steel_helmet: { name: 'Steel Helmet', equipSlot: 'head', accuracy: 0, magicAcc: -3, rangedAcc: -1, defence: 12, rangedDef: 12, magicDef: -2, value: 180 },
  steel_body: { name: 'Steel Platebody', equipSlot: 'body', accuracy: 0, magicAcc: -15, rangedAcc: -7, defence: 32, rangedDef: 31, magicDef: -5, value: 400 },
  steel_legs: { name: 'Steel Platelegs', equipSlot: 'legs', accuracy: 0, magicAcc: -11, rangedAcc: -5, defence: 20, rangedDef: 20, magicDef: -3, value: 280 },
  steel_shield: { name: 'Steel Shield', equipSlot: 'shield', accuracy: -1, magicAcc: -8, rangedAcc: -2, defence: 15, rangedDef: 15, magicDef: -3, value: 220 },

  alloy_helmet: { name: 'Alloy Helmet', equipSlot: 'head', accuracy: 0, magicAcc: -4, rangedAcc: -2, defence: 17, rangedDef: 17, magicDef: -5, value: 18000 },
  alloy_body: { name: 'Alloy Platebody', equipSlot: 'body', accuracy: 0, magicAcc: -18, rangedAcc: -8, defence: 46, rangedDef: 44, magicDef: -10, value: 54000 },
  alloy_legs: { name: 'Alloy Platelegs', equipSlot: 'legs', accuracy: 0, magicAcc: -13, rangedAcc: -6, defence: 29, rangedDef: 28, magicDef: -5, value: 36000 },
  alloy_shield: { name: 'Alloy Shield', equipSlot: 'shield', accuracy: -2, magicAcc: -10, rangedAcc: -3, defence: 22, rangedDef: 21, magicDef: -8, value: 42000 },
  
  apex_helmet: { name: 'Apex Helmet', equipSlot: 'head', accuracy: 0, magicAcc: -5, rangedAcc: -2, defence: 24, rangedDef: 24, magicDef: -6, value: 45000 },
  apex_body: { name: 'Apex Platebody', equipSlot: 'body', accuracy: 0, magicAcc: -20, rangedAcc: -10, defence: 65, rangedDef: 63, magicDef: -12, value: 135000 },
  apex_legs: { name: 'Apex Platelegs', equipSlot: 'legs', accuracy: 0, magicAcc: -15, rangedAcc: -7, defence: 42, rangedDef: 40, magicDef: -7, value: 90000 },
  apex_shield: { name: 'Apex Shield', equipSlot: 'shield', accuracy: -3, magicAcc: -12, rangedAcc: -4, defence: 31, rangedDef: 30, magicDef: -10, value: 105000 },
  
  nova_helmet: { name: 'Nova Helmet', equipSlot: 'head', accuracy: 0, magicAcc: -6, rangedAcc: -3, defence: 33, rangedDef: 33, magicDef: -8, value: 120000 },
  nova_body: { name: 'Nova Platebody', equipSlot: 'body', accuracy: 0, magicAcc: -22, rangedAcc: -12, defence: 88, rangedDef: 85, magicDef: -15, value: 360000 },
  nova_legs: { name: 'Nova Platelegs', equipSlot: 'legs', accuracy: 0, magicAcc: -17, rangedAcc: -8, defence: 57, rangedDef: 55, magicDef: -9, value: 240000 },
  nova_shield: { name: 'Nova Shield', equipSlot: 'shield', accuracy: -4, magicAcc: -15, rangedAcc: -5, defence: 43, rangedDef: 42, magicDef: -12, value: 280000 },

  // 🏹 RANGED ARMOR
  leather_cowl: { name: 'Leather Cowl', equipSlot: 'head', accuracy: 0, magicAcc: -1, rangedAcc: 2, defence: 2, rangedDef: 4, magicDef: 4, value: 10 },
  leather_body: { name: 'Leather Body', equipSlot: 'body', accuracy: 0, magicAcc: -5, rangedAcc: 8, defence: 9, rangedDef: 13, magicDef: 15, value: 25 },
  leather_chaps: { name: 'Leather Chaps', equipSlot: 'legs', accuracy: 0, magicAcc: -3, rangedAcc: 4, defence: 6, rangedDef: 9, magicDef: 10, value: 15 },

  green_leather_body: { name: 'Green Body', equipSlot: 'body', accuracy: 0, magicAcc: -10, rangedAcc: 15, defence: 25, rangedDef: 30, magicDef: 40, value: 450 },
  green_leather_chaps: { name: 'Green Chaps', equipSlot: 'legs', accuracy: 0, magicAcc: -5, rangedAcc: 8, defence: 16, rangedDef: 20, magicDef: 24, value: 280 },

  red_leather_body: { name: 'Red Body', equipSlot: 'body', accuracy: 0, magicAcc: -10, rangedAcc: 15, defence: 25, rangedDef: 30, magicDef: 40, value: 450 },
  red_leather_chaps: { name: 'Red Chaps', equipSlot: 'legs', accuracy: 0, magicAcc: -5, rangedAcc: 8, defence: 16, rangedDef: 20, magicDef: 24, value: 280 },

  black_leather_body: { name: 'Black Body', equipSlot: 'body', accuracy: 0, magicAcc: -15, rangedAcc: 30, defence: 50, rangedDef: 60, magicDef: 70, value: 1800 },
  black_leather_chaps: { name: 'Black Chaps', equipSlot: 'legs', accuracy: 0, magicAcc: -8, rangedAcc: 17, defence: 32, rangedDef: 40, magicDef: 45, value: 1100 },

  // 🧙 MAGIC ARMOR
  apprentice_hat: { name: 'Apprentice Hat', equipSlot: 'head', accuracy: -2, magicAcc: 3, rangedAcc: -2, defence: 2, rangedDef: 0, magicDef: 3, value: 15 },
  apprentice_top: { name: 'Apprentice Top', equipSlot: 'body', accuracy: -4, magicAcc: 8, rangedAcc: -4, defence: 5, rangedDef: 0, magicDef: 8, value: 30 },
  apprentice_bottom: { name: 'Apprentice Bottom', equipSlot: 'legs', accuracy: -3, magicAcc: 5, rangedAcc: -3, defence: 4, rangedDef: 0, magicDef: 5, value: 20 },

  wizard_hat: { name: 'Wizard Hat', equipSlot: 'head', accuracy: -3, magicAcc: 6, rangedAcc: -3, defence: 4, rangedDef: 0, magicDef: 6, value: 60 },
  wizard_top: { name: 'Wizard Top', equipSlot: 'body', accuracy: -8, magicAcc: 15, rangedAcc: -8, defence: 10, rangedDef: 0, magicDef: 15, value: 120 },
  wizard_bottom: { name: 'Wizard Bottom', equipSlot: 'legs', accuracy: -6, magicAcc: 10, rangedAcc: -6, defence: 8, rangedDef: 0, magicDef: 10, value: 80 },

  mystic_hat: { name: 'Mystic Hat', equipSlot: 'head', accuracy: -5, magicAcc: 12, rangedAcc: -5, defence: 8, rangedDef: 0, magicDef: 12, value: 5000 },
  mystic_top: { name: 'Mystic Top', equipSlot: 'body', accuracy: -15, magicAcc: 30, rangedAcc: -15, defence: 20, rangedDef: 0, magicDef: 30, value: 15000 },
  mystic_bottom: { name: 'Mystic Bottom', equipSlot: 'legs', accuracy: -10, magicAcc: 20, rangedAcc: -10, defence: 15, rangedDef: 0, magicDef: 20, value: 10000 }
};

export const AMMO = {
  bronze_arrow: { id: 'bronze_arrow', name: 'Bronze Arrow', type: 'ammo', rangedStr: 7, value: 1 },
  iron_arrow: { id: 'iron_arrow', name: 'Iron Arrow', type: 'ammo', rangedStr: 10, value: 3 },
  steel_arrow: { id: 'steel_arrow', name: 'Steel Arrow', type: 'ammo', rangedStr: 16, value: 12 },
  alloy_arrow: { id: 'alloy_arrow', name: 'Alloy Arrow', type: 'ammo', rangedStr: 22, value: 32 },
  apex_arrow: { id: 'apex_arrow', name: 'Apex Arrow', type: 'ammo', rangedStr: 31, value: 80 },
  nova_arrow: { id: 'nova_arrow', name: 'Nova Arrow', type: 'ammo', rangedStr: 49, value: 200 },
};

// ==========================================
// --- RESOURCES & MISC ITEMS (De Nieuwe Lijst!) ---
// ==========================================
export const ITEMS = {
  // --- Pets ---
  woodcutting_pet: { name: 'Beaver', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  fishing_pet: { name: 'Heron', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  mining_pet: { name: 'Rock Golem', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  foraging_pet: { name: 'Tanuki', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  cooking_pet: { name: 'Rocky Raccoon', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  smithing_pet: { name: 'Smithy', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  crafting_pet: { name: 'Chameleon', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  herblore_pet: { name: 'Herbi', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  thieving_pet: { name: 'Raccoon', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  farming_pet: { name: 'Mole', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  agility_pet: { name: 'Squirrel', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },
  slayer_pet: { name: 'Crawling Hand', value: 500000, equipSlot: 'pet', maxAmount: 1, tradeable: false },

  // Valuta & Drops
  coins: { name: 'Coins', value: 1 },
  feathers: { name: 'Feathers', value: 2 },
  bones: { name: 'Bones', value: 3 },
  big_bones: { name: 'Big Bones', value: 18 },
  dragon_bones: { name: 'Dragon Bones', value: 150 },
  wyvern_bones: { name: 'Wyvern Bones', value: 250 },
  cowhide: { name: 'Cowhide', value: 5 },
  snake_hide: { name: 'Snake Hide', value: 12 },
  wolf_fur: { name: 'Wolf Fur', value: 15 },
  bear_fur: { name: 'Bear Fur', value: 25 },
  green_dhide: { name: 'Green D-hide', value: 80 },
  red_dhide: { name: 'Red D-hide', value: 150 },
  black_dhide: { name: 'Black D-hide', value: 300 },
  spider_eggs: { name: 'Spider Eggs', value: 35 },
  swamp_tar: { name: 'Swamp Tar', value: 15 },
  ectoplasm: { name: 'Ectoplasm', value: 40 },
  vampire_dust: { name: 'Vampire Dust', value: 120 },
  demonic_ashes: { name: 'Demonic Ashes', value: 65 },

  // Ores & Bars
  copper_ore: { name: 'Copper Ore', value: 4 },
  tin_ore: { name: 'Tin Ore', value: 4 },
  iron_ore: { name: 'Iron Ore', value: 18 },
  coal_ore: { name: 'Coal Ore', value: 30 },
  alloy_ore: { name: 'Alloy Ore', value: 85 },
  apex_ore: { name: 'Apex Ore', value: 200 },
  nova_ore: { name: 'Nova Ore', value: 500 },
  bronze_bar: { name: 'Bronze Bar', value: 12 },
  iron_bar: { name: 'Iron Bar', value: 40 },
  steel_bar: { name: 'Steel Bar', value: 75 },
  alloy_bar: { name: 'Alloy Bar', value: 180 },
  apex_bar: { name: 'Apex Bar', value: 420 },
  nova_bar: { name: 'Nova Bar', value: 1050 },

  // Gems & Runes
  iron_gem: { name: 'Iron Gem', value: 50 },
  steel_gem: { name: 'Steel Gem', value: 120 },
  mithril_gem: { name: 'Mithril Gem', value: 300 },
  adamant_gem: { name: 'Adamant Gem', value: 750 },
  rune_gem: { name: 'Rune Gem', value: 2000 },
  water_rune: { name: 'Water Rune', value: 5 },
  mind_rune: { name: 'Mind Rune', value: 4 },
  blood_rune: { name: 'Blood Rune', value: 80 },
  chaos_rune: { name: 'Chaos Rune', value: 35 },

  // Logs & Crafting Materials
  spruce_log: { name: 'Spruce Log', value: 3 },
  pine_log: { name: 'Pine Log', value: 6 },
  oak_log: { name: 'Oak Log', value: 12 },
  willow_log: { name: 'Willow Log', value: 18 },
  maple_log: { name: 'Maple Log', value: 25 },
  teak_log: { name: 'Teak Log', value: 40 },
  chestnut_log: { name: 'Chestnut Log', value: 60 },
  mahogany_log: { name: 'Mahogany Log', value: 85 },
  yew_log: { name: 'Yew Log', value: 140 },
  redwood_log: { name: 'Redwood Log', value: 250 },
  magic_log: { name: 'Magic Log', value: 400 },
  leather: { name: 'Leather', value: 12 },
  snake_leather: { name: 'Snake Leather', value: 30 },
  green_dragon_leather: { name: 'Green Dragon Leather', value: 120 },
  red_dragon_leather: { name: 'Red Dragon Leather', value: 220 },
  black_dragon_leather: { name: 'Black Dragon Leather', value: 450 },
  silk: { name: 'Silk', value: 18 },
  fine_cloth: { name: 'Fine Cloth', value: 65 },
  mystic_cloth: { name: 'Mystic Cloth', value: 300 },

  // Seeds & Herbs
  potato_seed: { name: 'Potato Seed', value: 2 },
  herb_seed: { name: 'Herb Seed', value: 8 },
  watermelon_seed: { name: 'Watermelon Seed', value: 15 },
  oak_seed: { name: 'Oak Seed', value: 30 },
  magic_seed: { name: 'Magic Seed', value: 600 },
  guam_leaf: { name: 'Guam Leaf', value: 18 },
  ranarr_weed: { name: 'Ranarr Weed', value: 180 },
  snapdragon: { name: 'Snapdragon', value: 450 },
  torstol: { name: 'Torstol', value: 1200 },

  // Fishing (Raw)
  raw_shrimp: { name: 'Raw Shrimp', value: 2 },
  raw_mackarel: { name: 'Raw Mackarel', value: 6 },
  raw_cod: { name: 'Raw Cod', value: 14 },
  raw_trout: { name: 'Raw Trout', value: 22 },
  raw_salmon: { name: 'Raw Salmon', value: 38 },
  raw_carp: { name: 'Raw Carp', value: 55 },
  raw_crab: { name: 'Raw Crab', value: 85 },
  raw_anglerfish: { name: 'Raw Anglerfish', value: 135 },
  raw_tuna: { name: 'Raw Tuna', value: 200 },
  raw_shark: { name: 'Raw Shark', value: 350 },

  // Cooking (Cooked)
  cooked_shrimp: { name: 'Cooked Shrimp', value: 4 },
  cooked_mackarel: { name: 'Cooked Mackarel', value: 10 },
  cooked_cod: { name: 'Cooked Cod', value: 20 },
  cooked_trout: { name: 'Cooked Trout', value: 32 },
  cooked_salmon: { name: 'Cooked Salmon', value: 55 },
  cooked_carp: { name: 'Cooked Carp', value: 80 },
  cooked_crab: { name: 'Cooked Crab', value: 125 },
  cooked_anglerfish: { name: 'Cooked Anglerfish', value: 200 },
  cooked_tuna: { name: 'Cooked Tuna', value: 300 },
  cooked_shark: { name: 'Cooked Shark', value: 550 },
  meat: { name: 'Raw Meat', value: 3 },
  cooked_meat: { name: 'Cooked Meat', value: 5 },
  big_meat: { name: 'Raw Big Meat', value: 10 },
  cooked_big_meat: { name: 'Cooked Big Meat', value: 18 },
  great_meat: { name: 'Raw Great Meat', value: 30 },
  cooked_great_meat: { name: 'Cooked Great Meat', value: 55 },

  // Foraging
  eggs: { name: 'Eggs', value: 2 },
  onion: { name: 'Onion', value: 4 },
  flax: { name: 'Flax', value: 6 },
  blueberries: { name: 'Blueberries', value: 10 },
  garlic: { name: 'Garlic', value: 15 },
  seaweed: { name: 'Seaweed', value: 18 },
  fungi: { name: 'Forage Fungi', value: 30 },
  berries: { name: 'Berries', value: 50 },

  // Potions
  prayer_potion: { name: 'Prayer Potion', value: 150 },

  // Agility Rewards
  mark_of_grace: { name: 'Mark of Grace', value: 25 },
  agility_ticket: { name: 'Agility Ticket', value: 100 },

  // Farming Seeds
  tomato_seed: { name: 'Tomato Seed', value: 3 },
  cabbage_seed: { name: 'Cabbage Seed', value: 4 },
  strawberry_seed: { name: 'Strawberry Seed', value: 8 },
  sweetcorn_seed: { name: 'Sweetcorn Seed', value: 12 },
  snape_grass_seed: { name: 'Snape Grass Seed', value: 20 },
  ranarr_seed: { name: 'Ranarr Seed', value: 120 },
  snapdragon_seed: { name: 'Snapdragon Seed', value: 300 },
  torstol_seed: { name: 'Torstol Seed', value: 800 },

  // Farming Produce
  potato: { name: 'Potato', value: 4 },
  tomato: { name: 'Tomato', value: 6 },
  cabbage: { name: 'Cabbage', value: 8 },
  strawberry: { name: 'Strawberry', value: 15 },
  sweetcorn: { name: 'Sweetcorn', value: 25 },
  snape_grass: { name: 'Snape Grass', value: 40 },
  grimy_guam: { name: 'Grimy Guam', value: 15 },
  grimy_ranarr: { name: 'Grimy Ranarr', value: 150 },
  grimy_snapdragon: { name: 'Grimy Snapdragon', value: 400 },
  grimy_torstol: { name: 'Grimy Torstol', value: 1000 },

  // Herblore Potions
  combat_potion: { name: 'Combat Potion', value: 200 },
  super_combat_potion: { name: 'Super Combat Potion', value: 800 },
  ranged_potion: { name: 'Ranged Potion', value: 200 },
  super_ranged_potion: { name: 'Super Ranged Potion', value: 800 },
  magic_potion: { name: 'Magic Potion', value: 200 },
  super_magic_potion: { name: 'Super Magic Potion', value: 800 },
  respawn_potion: { name: 'Respawn Potion', value: 350 },
  gathering_potion: { name: 'Gathering Potion', value: 300 },
  stamina_potion: { name: 'Stamina Potion', value: 250 },

  // Herblore Components
  dragon_scale: { name: 'Dragon Scale', value: 500 },

  // Thieving Loot
  stolen_coins: { name: 'Stolen Coins', value: 1 },
  gold_ring: { name: 'Gold Ring', value: 50 },
  silver_necklace: { name: 'Silver Necklace', value: 80 },
  gem_bag: { name: 'Gem Bag', value: 200 },
  lockpick: { name: 'Lockpick', value: 15 },
  treasury_note: { name: 'Treasury Note', value: 500 },

  // --- TOOLS (11 skills × 6 tiers) ---
  // Woodcutting Axes
  bronze_axe: { name: 'Bronze Axe', value: 50, equipSlot: 'tool', speedBoosts: { woodcutting: 0.02 } },
  iron_axe: { name: 'Iron Axe', value: 120, equipSlot: 'tool', speedBoosts: { woodcutting: 0.04 } },
  steel_axe: { name: 'Steel Axe', value: 300, equipSlot: 'tool', speedBoosts: { woodcutting: 0.06 } },
  alloy_axe: { name: 'Alloy Axe', value: 900, equipSlot: 'tool', speedBoosts: { woodcutting: 0.08 } },
  apex_axe: { name: 'Apex Axe', value: 2500, equipSlot: 'tool', speedBoosts: { woodcutting: 0.10 } },
  nova_axe: { name: 'Nova Axe', value: 7000, equipSlot: 'tool', speedBoosts: { woodcutting: 0.12 } },

  // Fishing Rods
  bronze_rod: { name: 'Bronze Rod', value: 50, equipSlot: 'tool', speedBoosts: { fishing: 0.02 } },
  iron_rod: { name: 'Iron Rod', value: 120, equipSlot: 'tool', speedBoosts: { fishing: 0.04 } },
  steel_rod: { name: 'Steel Rod', value: 300, equipSlot: 'tool', speedBoosts: { fishing: 0.06 } },
  alloy_rod: { name: 'Alloy Rod', value: 900, equipSlot: 'tool', speedBoosts: { fishing: 0.08 } },
  apex_rod: { name: 'Apex Rod', value: 2500, equipSlot: 'tool', speedBoosts: { fishing: 0.10 } },
  nova_rod: { name: 'Nova Rod', value: 7000, equipSlot: 'tool', speedBoosts: { fishing: 0.12 } },

  // Mining Pickaxes
  bronze_pickaxe: { name: 'Bronze Pickaxe', value: 50, equipSlot: 'tool', speedBoosts: { mining: 0.02 } },
  iron_pickaxe: { name: 'Iron Pickaxe', value: 120, equipSlot: 'tool', speedBoosts: { mining: 0.04 } },
  steel_pickaxe: { name: 'Steel Pickaxe', value: 300, equipSlot: 'tool', speedBoosts: { mining: 0.06 } },
  alloy_pickaxe: { name: 'Alloy Pickaxe', value: 900, equipSlot: 'tool', speedBoosts: { mining: 0.08 } },
  apex_pickaxe: { name: 'Apex Pickaxe', value: 2500, equipSlot: 'tool', speedBoosts: { mining: 0.10 } },
  nova_pickaxe: { name: 'Nova Pickaxe', value: 7000, equipSlot: 'tool', speedBoosts: { mining: 0.12 } },

  // Cooking Pans
  bronze_pan: { name: 'Bronze Pan', value: 50, equipSlot: 'tool', speedBoosts: { cooking: 0.02 } },
  iron_pan: { name: 'Iron Pan', value: 120, equipSlot: 'tool', speedBoosts: { cooking: 0.04 } },
  steel_pan: { name: 'Steel Pan', value: 300, equipSlot: 'tool', speedBoosts: { cooking: 0.06 } },
  alloy_pan: { name: 'Alloy Pan', value: 900, equipSlot: 'tool', speedBoosts: { cooking: 0.08 } },
  apex_pan: { name: 'Apex Pan', value: 2500, equipSlot: 'tool', speedBoosts: { cooking: 0.10 } },
  nova_pan: { name: 'Nova Pan', value: 7000, equipSlot: 'tool', speedBoosts: { cooking: 0.12 } },

  // Smithing Hammers
  bronze_hammer: { name: 'Bronze Hammer', value: 50, equipSlot: 'tool', speedBoosts: { smithing: 0.02 } },
  iron_hammer: { name: 'Iron Hammer', value: 120, equipSlot: 'tool', speedBoosts: { smithing: 0.04 } },
  steel_hammer: { name: 'Steel Hammer', value: 300, equipSlot: 'tool', speedBoosts: { smithing: 0.06 } },
  alloy_hammer: { name: 'Alloy Hammer', value: 900, equipSlot: 'tool', speedBoosts: { smithing: 0.08 } },
  apex_hammer: { name: 'Apex Hammer', value: 2500, equipSlot: 'tool', speedBoosts: { smithing: 0.10 } },
  nova_hammer: { name: 'Nova Hammer', value: 7000, equipSlot: 'tool', speedBoosts: { smithing: 0.12 } },

  // Crafting Needles
  bronze_needle: { name: 'Bronze Needle', value: 50, equipSlot: 'tool', speedBoosts: { crafting: 0.02 } },
  iron_needle: { name: 'Iron Needle', value: 120, equipSlot: 'tool', speedBoosts: { crafting: 0.04 } },
  steel_needle: { name: 'Steel Needle', value: 300, equipSlot: 'tool', speedBoosts: { crafting: 0.06 } },
  alloy_needle: { name: 'Alloy Needle', value: 900, equipSlot: 'tool', speedBoosts: { crafting: 0.08 } },
  apex_needle: { name: 'Apex Needle', value: 2500, equipSlot: 'tool', speedBoosts: { crafting: 0.10 } },
  nova_needle: { name: 'Nova Needle', value: 7000, equipSlot: 'tool', speedBoosts: { crafting: 0.12 } },

  // Herblore Pestles
  bronze_pestle: { name: 'Bronze Pestle', value: 50, equipSlot: 'tool', speedBoosts: { herblore: 0.02 } },
  iron_pestle: { name: 'Iron Pestle', value: 120, equipSlot: 'tool', speedBoosts: { herblore: 0.04 } },
  steel_pestle: { name: 'Steel Pestle', value: 300, equipSlot: 'tool', speedBoosts: { herblore: 0.06 } },
  alloy_pestle: { name: 'Alloy Pestle', value: 900, equipSlot: 'tool', speedBoosts: { herblore: 0.08 } },
  apex_pestle: { name: 'Apex Pestle', value: 2500, equipSlot: 'tool', speedBoosts: { herblore: 0.10 } },
  nova_pestle: { name: 'Nova Pestle', value: 7000, equipSlot: 'tool', speedBoosts: { herblore: 0.12 } },

  // Farming Spades
  bronze_spade: { name: 'Bronze Spade', value: 50, equipSlot: 'tool', speedBoosts: { farming: 0.02 } },
  iron_spade: { name: 'Iron Spade', value: 120, equipSlot: 'tool', speedBoosts: { farming: 0.04 } },
  steel_spade: { name: 'Steel Spade', value: 300, equipSlot: 'tool', speedBoosts: { farming: 0.06 } },
  alloy_spade: { name: 'Alloy Spade', value: 900, equipSlot: 'tool', speedBoosts: { farming: 0.08 } },
  apex_spade: { name: 'Apex Spade', value: 2500, equipSlot: 'tool', speedBoosts: { farming: 0.10 } },
  nova_spade: { name: 'Nova Spade', value: 7000, equipSlot: 'tool', speedBoosts: { farming: 0.12 } },

  // Foraging Sickles
  bronze_sickle: { name: 'Bronze Sickle', value: 50, equipSlot: 'tool', speedBoosts: { foraging: 0.02 } },
  iron_sickle: { name: 'Iron Sickle', value: 120, equipSlot: 'tool', speedBoosts: { foraging: 0.04 } },
  steel_sickle: { name: 'Steel Sickle', value: 300, equipSlot: 'tool', speedBoosts: { foraging: 0.06 } },
  alloy_sickle: { name: 'Alloy Sickle', value: 900, equipSlot: 'tool', speedBoosts: { foraging: 0.08 } },
  apex_sickle: { name: 'Apex Sickle', value: 2500, equipSlot: 'tool', speedBoosts: { foraging: 0.10 } },
  nova_sickle: { name: 'Nova Sickle', value: 7000, equipSlot: 'tool', speedBoosts: { foraging: 0.12 } },

  // Thieving Lockpicks (tools used for thieving)
  bronze_lockpick: { name: 'Bronze Lockpick', value: 50, equipSlot: 'tool', speedBoosts: { thieving: 0.02 } },
  iron_lockpick: { name: 'Iron Lockpick', value: 120, equipSlot: 'tool', speedBoosts: { thieving: 0.04 } },
  steel_lockpick: { name: 'Steel Lockpick', value: 300, equipSlot: 'tool', speedBoosts: { thieving: 0.06 } },
  alloy_lockpick: { name: 'Alloy Lockpick', value: 900, equipSlot: 'tool', speedBoosts: { thieving: 0.08 } },
  apex_lockpick: { name: 'Apex Lockpick', value: 2500, equipSlot: 'tool', speedBoosts: { thieving: 0.10 } },
  nova_lockpick: { name: 'Nova Lockpick', value: 7000, equipSlot: 'tool', speedBoosts: { thieving: 0.12 } },

  // Agility Boots (special tool category)
  bronze_boots: { name: 'Bronze Boots', value: 50, equipSlot: 'tool', speedBoosts: { agility: 0.02 } },
  iron_boots: { name: 'Iron Boots', value: 120, equipSlot: 'tool', speedBoosts: { agility: 0.04 } },
  steel_boots: { name: 'Steel Boots', value: 300, equipSlot: 'tool', speedBoosts: { agility: 0.06 } },
  alloy_boots: { name: 'Alloy Boots', value: 900, equipSlot: 'tool', speedBoosts: { agility: 0.08 } },
  apex_boots: { name: 'Apex Boots', value: 2500, equipSlot: 'tool', speedBoosts: { agility: 0.10 } },
  nova_boots: { name: 'Nova Boots', value: 7000, equipSlot: 'tool', speedBoosts: { agility: 0.12 } }
};

// ==========================================
// --- SHOP STOCK (General Store) ---
// ==========================================
export const SHOP_STOCK = [
  // --- Tools & Weapons (Melee) ---
  { id: 'bronze_scimitar', cost: 1 },
  { id: 'iron_scimitar', cost: 1 },
  { id: 'steel_scimitar', cost: 1 },
  { id: 'alloy_scimitar', cost: 1 },
  { id: 'apex_scimitar', cost: 1 },
  { id: 'nova_scimitar', cost: 1 },

  // --- Tools & Weapons (Ranged) ---
  { id: 'bronze_bow', cost: 35 },
  { id: 'iron_bow', cost: 95 },
  { id: 'steel_bow', cost: 210 },
  { id: 'alloy_bow', cost: 520 },
  { id: 'apex_bow', cost: 1400 },
  { id: 'nova_bow', cost: 4000 },

  // --- Tools & Weapons (Magic) ---
  { id: 'bronze_staff', cost: 40 },
  { id: 'iron_staff', cost: 110 },
  { id: 'steel_staff', cost: 240 },
  { id: 'alloy_staff', cost: 600 },
  { id: 'apex_staff', cost: 1600 },
  { id: 'nova_staff', cost: 4500 },

  // --- Armor (Helmets) ---
  { id: 'bronze_helmet', cost: 20 },
  { id: 'iron_helmet', cost: 55 },
  { id: 'steel_helmet', cost: 180 },
  { id: 'alloy_helmet', cost: 18000 },
  { id: 'apex_helmet', cost: 45000 },
  { id: 'nova_helmet', cost: 120000 },

  // --- Armor (Bodies) ---
  { id: 'bronze_body', cost: 60 },
  { id: 'iron_body', cost: 160 },
  { id: 'steel_body', cost: 400 },
  { id: 'alloy_body', cost: 54000 },
  { id: 'apex_body', cost: 135000 },
  { id: 'nova_body', cost: 360000 },

  // --- Armor (Legs) ---
  { id: 'bronze_legs', cost: 40 },
  { id: 'iron_legs', cost: 110 },
  { id: 'steel_legs', cost: 280 },
  { id: 'alloy_legs', cost: 36000 },
  { id: 'apex_legs', cost: 90000 },
  { id: 'nova_legs', cost: 240000 },

  // --- Bars (Crafting) ---
  { id: 'bronze_bar', cost: 5 },
  { id: 'iron_bar', cost: 1 },
  { id: 'steel_bar', cost: 1 },
  { id: 'alloy_bar', cost: 1 },
  { id: 'apex_bar', cost: 1 },
  { id: 'nova_bar', cost: 1 },

  // --- Ores ---
  { id: 'copper_ore', cost: 1 },
  { id: 'tin_ore', cost: 1 },
  { id: 'iron_ore', cost: 1 },
  { id: 'coal_ore', cost: 1 },
  { id: 'alloy_ore', cost: 1 },
  { id: 'apex_ore', cost: 1 },
  { id: 'nova_ore', cost: 1 },

  // --- Ammo & Runes ---
  { id: 'bronze_arrow', cost: 2 },
  { id: 'iron_arrow', cost: 6 },
  { id: 'water_rune', cost: 15 },
  { id: 'mind_rune', cost: 12 },
  { id: 'chaos_rune', cost: 90 },

  // --- Food & Supplies ---
  { id: 'raw_shrimp', cost: 10 },
  { id: 'cooked_shrimp', cost: 15 },
  { id: 'meat', cost: 10 },
  { id: 'cooked_meat', cost: 15 },
  { id: 'bones', cost: 10 },
  
  // --- Potions ---
  { id: 'prayer_potion', cost: 400 }
];

// ==========================================
// --- PRAYER BOOK ---
// ==========================================
export const PRAYER_BOOK = [
  // Tier 1 (Drain: 0.1 per tick - extreem zuinig)
  { id: 'dmg_5', name: 'Burst of Strength', type: 'boost', desc: '+5% Damage & Accuracy', reqLvl: 5, icon: '💪', buff: 1.05, drain: 0.1 },
  { id: 'anti_melee_40', name: 'Thick Skin', type: 'melee_def', desc: '40% Melee Reduction', reqLvl: 10, icon: '🛡️', block: 0.60, drain: 0.1 },
  { id: 'anti_range_40', name: 'Rock Skin', type: 'range_def', desc: '40% Ranged Reduction', reqLvl: 15, icon: '🏹', block: 0.60, drain: 0.1 },
  { id: 'anti_mage_40', name: 'Mystic Will', type: 'mage_def', desc: '40% Magic Reduction', reqLvl: 20, icon: '🔮', block: 0.60, drain: 0.1 },
  
  // Tier 2 (Drain: 0.3 per tick - redelijk)
  { id: 'dmg_10', name: 'Superhuman Strength', type: 'boost', desc: '+10% Damage & Accuracy', reqLvl: 25, icon: '💪', buff: 1.10, drain: 0.3 },
  { id: 'anti_melee_60', name: 'Steel Skin', type: 'melee_def', desc: '60% Melee Reduction', reqLvl: 35, icon: '🛡️', block: 0.40, drain: 0.3 },
  { id: 'anti_range_60', name: 'Iron Skin', type: 'range_def', desc: '60% Ranged Reduction', reqLvl: 40, icon: '🏹', block: 0.40, drain: 0.3 },
  { id: 'anti_mage_60', name: 'Mystic Lore', type: 'mage_def', desc: '60% Magic Reduction', reqLvl: 45, icon: '🔮', block: 0.40, drain: 0.3 },
  
  // Tier 3 (Drain: 0.6 per tick - verbruikt flink)
  { id: 'dmg_12_5', name: 'Ultimate Strength', type: 'boost', desc: '+12.5% Damage & Accuracy', reqLvl: 50, icon: '💪', buff: 1.125, drain: 0.6 },
  { id: 'anti_melee_80', name: 'Protect from Melee (L)', type: 'melee_def', desc: '80% Melee Reduction', reqLvl: 60, icon: '🛡️', block: 0.20, drain: 0.6 },
  { id: 'anti_range_80', name: 'Protect from Missiles (L)', type: 'range_def', desc: '80% Ranged Reduction', reqLvl: 65, icon: '🏹', block: 0.20, drain: 0.6 },
  { id: 'anti_mage_80', name: 'Protect from Magic (L)', type: 'mage_def', desc: '80% Magic Reduction', reqLvl: 70, icon: '🔮', block: 0.20, drain: 0.6 },
  
  // Tier 4 (Drain: 1.0+ per tick - zware drain!)
  { id: 'dmg_15', name: 'Piety', type: 'boost', desc: '+15% Damage & Accuracy', reqLvl: 75, icon: '🌟', buff: 1.15, drain: 1.0 },
  { id: 'anti_melee_100', name: 'Protect from Melee', type: 'melee_def', desc: '100% Melee Reduction', reqLvl: 80, icon: '🛡️', block: 0.0, drain: 1.0 },
  { id: 'anti_range_100', name: 'Protect from Missiles', type: 'range_def', desc: '100% Ranged Reduction', reqLvl: 82, icon: '🏹', block: 0.0, drain: 1.0 },
  { id: 'anti_mage_100', name: 'Protect from Magic', type: 'mage_def', desc: '100% Magic Reduction', reqLvl: 85, icon: '🔮', block: 0.0, drain: 1.2 }
];

export const ACTIONS = {
// --- COMBAT: MONSTERS & DROPS ---
// --- BEGINNER (Lvl 1 - 10) ---
  fight_chicken: { skill: 'combat', name: 'Chicken', reqLvl: 1, category: 'beginner', enemy: { hp: 3, str: 1, speedTicks: 4, type: 'melee', weakness: 'range', offAtt: { melee: 1, ranged: 0, magic: 0 }, defBonus: { melee: 1, ranged: 1, magic: 0 } }, reward: { feathers: 5, meat: 1, bones: 1 } },
  fight_cow: { skill: 'combat', name: 'Cow', reqLvl: 1, category: 'beginner', enemy: { hp: 8, str: 2, speedTicks: 4, type: 'melee', weakness: 'magic', offAtt: { melee: 2, ranged: 0, magic: 0 }, defBonus: { melee: 3, ranged: 2, magic: 1 } }, reward: { cowhide: 1, meat: 1, bones: 1 } },
  fight_goblin: { skill: 'combat', name: 'Goblin', reqLvl: 1, category: 'beginner', enemy: { hp: 5, str: 2, speedTicks: 4, type: 'melee', weakness: 'range', offAtt: { melee: 2, ranged: 0, magic: 0 }, defBonus: { melee: 1, ranged: 1, magic: 0 } }, reward: { coins: 5, bones: 1, bronze_scimitar: 1, potato_seed: 1 } },
  fight_snake: { skill: 'combat', name: 'Snake', reqLvl: 1, category: 'beginner', enemy: { hp: 10, str: 3, speedTicks: 3, type: 'melee', weakness: 'magic', offAtt: { melee: 4, ranged: 0, magic: 0 }, defBonus: { melee: 3, ranged: 2, magic: 1 } }, reward: { snake_hide: 1, meat: 1, bones: 1 } },
  fight_wolf: { skill: 'combat', name: 'Wolf', reqLvl: 1, category: 'beginner', enemy: { hp: 12, str: 4, speedTicks: 4, type: 'melee', weakness: 'range', offAtt: { melee: 5, ranged: 0, magic: 0 }, defBonus: { melee: 4, ranged: 3, magic: 1 } }, reward: { meat: 1, bones: 1, wolf_fur: 1 } },
  fight_bear: { skill: 'combat', name: 'Bear', reqLvl: 1, category: 'beginner', enemy: { hp: 20, str: 6, speedTicks: 5, type: 'melee', weakness: 'magic', offAtt: { melee: 6, ranged: 0, magic: 0 }, defBonus: { melee: 7, ranged: 5, magic: 2 } }, reward: { big_meat: 1, bear_fur: 1, big_bones: 1 } },

  // --- EASY (Lvl 15 - 45) ---
  fight_zombie: { skill: 'combat', name: 'Zombie', reqLvl: 1, category: 'easy', enemy: { hp: 22, str: 7, speedTicks: 5, type: 'melee', weakness: 'magic', offAtt: { melee: 8, ranged: 0, magic: 0 }, defBonus: { melee: 8, ranged: 6, magic: 2 } }, reward: { bones: 1, iron_scimitar: 1, iron_gem: 1 } },
  fight_scorpion: { skill: 'combat', name: 'Scorpion', reqLvl: 1, category: 'easy', enemy: { hp: 25, str: 8, speedTicks: 4, type: 'melee', weakness: 'magic', offAtt: { melee: 10, ranged: 0, magic: 0 }, defBonus: { melee: 12, ranged: 10, magic: 3 } }, reward: { meat: 1, bones: 1, bronze_bar: 1 } },
  fight_druid: { skill: 'combat', name: 'Druid', reqLvl: 1, category: 'easy', enemy: { hp: 30, str: 10, speedTicks: 5, type: 'magic', weakness: 'range', offAtt: { melee: 0, ranged: 0, magic: 12 }, defBonus: { melee: 5, ranged: 5, magic: 15 } }, reward: { bronze_staff: 1, bones: 1, guam_leaf: 2, herb_seed: 1 } },
  fight_orc: { skill: 'combat', name: 'Orc', reqLvl: 1, category: 'easy', enemy: { hp: 35, str: 14, speedTicks: 5, type: 'melee', weakness: 'magic', offAtt: { melee: 15, ranged: 0, magic: 0 }, defBonus: { melee: 14, ranged: 10, magic: 4 } }, reward: { coins: 20, iron_bar: 1, big_bones: 1, watermelon_seed: 1 } },
  fight_crocodile: { skill: 'combat', name: 'Crocodile', reqLvl: 1, category: 'easy', enemy: { hp: 40, str: 16, speedTicks: 4, type: 'melee', weakness: 'magic', offAtt: { melee: 18, ranged: 0, magic: 0 }, defBonus: { melee: 18, ranged: 15, magic: 5 } }, reward: { big_meat: 1, big_bones: 1, water_rune: 15 } },
  fight_giant: { skill: 'combat', name: 'Giant', reqLvl: 1, category: 'easy', enemy: { hp: 50, str: 22, speedTicks: 6, type: 'melee', weakness: 'magic', offAtt: { melee: 20, ranged: 0, magic: 0 }, defBonus: { melee: 20, ranged: 15, magic: 6 } }, reward: { big_meat: 1, coins: 50, big_bones: 1, steel_gem: 1, oak_seed: 1 } },
  fight_green_dragon: { skill: 'combat', name: 'Green Dragon', reqLvl: 1, category: 'easy', enemy: { hp: 75, str: 25, speedTicks: 4, type: 'melee', weakness: 'range', offAtt: { melee: 25, ranged: 0, magic: 0 }, defBonus: { melee: 28, ranged: 22, magic: 18 } }, reward: { green_dhide: 1, dragon_bones: 1, steel_gem: 1 } },

  // --- MODERATE (Lvl 50 - 75) ---
  fight_ghost: { skill: 'combat', name: 'Ghost', reqLvl: 1, category: 'moderate', enemy: { hp: 55, str: 25, speedTicks: 5, type: 'magic', weakness: 'range', offAtt: { melee: 0, ranged: 0, magic: 30 }, defBonus: { melee: 10, ranged: 10, magic: 40 } }, reward: { ectoplasm: 1, bones: 1, mind_rune: 20 } },
  fight_red_spider: { skill: 'combat', name: 'Red Spider', reqLvl: 1, category: 'moderate', enemy: { hp: 60, str: 28, speedTicks: 3, type: 'melee', weakness: 'magic', offAtt: { melee: 35, ranged: 0, magic: 0 }, defBonus: { melee: 30, ranged: 25, magic: 8 } }, reward: { spider_eggs: 2, bones: 1 } },
  fight_swamp_lizard: { skill: 'combat', name: 'Swamp Lizard', reqLvl: 1, category: 'moderate', enemy: { hp: 70, str: 35, speedTicks: 4, type: 'melee', weakness: 'range', offAtt: { melee: 40, ranged: 0, magic: 0 }, defBonus: { melee: 38, ranged: 30, magic: 12 } }, reward: { swamp_tar: 3, great_meat: 1, big_bones: 1 } },
  fight_demon: { skill: 'combat', name: 'Demon', reqLvl: 1, category: 'moderate', enemy: { hp: 80, str: 45, speedTicks: 4, type: 'melee', weakness: 'magic', offAtt: { melee: 45, ranged: 0, magic: 0 }, defBonus: { melee: 45, ranged: 40, magic: 10 } }, reward: { rune_ore: 1, big_bones: 1, mithril_gem: 1, demonic_ashes: 1 } },
  fight_demonic_scorpion: { skill: 'combat', name: 'Demonic Scorpion', reqLvl: 1, category: 'moderate', enemy: { hp: 85, str: 48, speedTicks: 4, type: 'melee', weakness: 'magic', offAtt: { melee: 50, ranged: 0, magic: 0 }, defBonus: { melee: 55, ranged: 50, magic: 12 } }, reward: { great_meat: 1, alloy_bar: 1, big_bones: 1, mithril_gem: 1 } }, 
  fight_red_dragon: { skill: 'combat', name: 'Red Dragon', reqLvl: 1, category: 'moderate', enemy: { hp: 110, str: 60, speedTicks: 4, type: 'melee', weakness: 'range', offAtt: { melee: 55, ranged: 0, magic: 0 }, defBonus: { melee: 65, ranged: 50, magic: 40 } }, reward: { red_dhide: 1, dragon_bones: 1, adamant_gem: 1 } },

  // --- HARD (Lvl 80 - 100) ---
  fight_vampire: { skill: 'combat', name: 'Vampire', reqLvl: 1, category: 'hard', enemy: { hp: 120, str: 65, speedTicks: 3, type: 'melee', weakness: 'magic', offAtt: { melee: 65, ranged: 0, magic: 0 }, defBonus: { melee: 70, ranged: 60, magic: 15 } }, reward: { vampire_dust: 1, blood_rune: 5, bones: 1, adamant_gem: 1 } },
  fight_werewolf: { skill: 'combat', name: 'Possessed Werewolf', reqLvl: 1, category: 'hard', enemy: { hp: 135, str: 70, speedTicks: 4, type: 'melee', weakness: 'magic', offAtt: { melee: 75, ranged: 0, magic: 0 }, defBonus: { melee: 72, ranged: 65, magic: 18 } }, reward: { great_meat: 1, big_bones: 1, wolf_fur: 2 } },
  fight_demonic_zombie: { skill: 'combat', name: 'Demonic Zombie', reqLvl: 1, category: 'hard', enemy: { hp: 150, str: 85, speedTicks: 5, type: 'melee', weakness: 'range', offAtt: { melee: 80, ranged: 0, magic: 0 }, defBonus: { melee: 85, ranged: 70, magic: 20 } }, reward: { apex_bar: 1, big_bones: 1, adamant_gem: 1, ranarr_weed: 1 } },
  fight_dark_warrior: { skill: 'combat', name: 'Dark Warrior', reqLvl: 1, category: 'hard', enemy: { hp: 160, str: 90, speedTicks: 4, type: 'melee', weakness: 'magic', offAtt: { melee: 90, ranged: 0, magic: 0 }, defBonus: { melee: 100, ranged: 90, magic: 25 } }, reward: { apex_scimitar: 1, bones: 1, adamant_gem: 1, coins: 150 } },
  fight_black_dragon: { skill: 'combat', name: 'Black Dragon', reqLvl: 1, category: 'hard', enemy: { hp: 190, str: 105, speedTicks: 4, type: 'melee', weakness: 'range', offAtt: { melee: 100, ranged: 0, magic: 0 }, defBonus: { melee: 120, ranged: 100, magic: 80 } }, reward: { black_dhide: 1, dragon_bones: 1, rune_gem: 1, magic_seed: 1 } },

  // --- EXTREME (Lvl 105+) ---
  fight_wyvern: { skill: 'combat', name: 'Wyvern', reqLvl: 1, category: 'extreme', enemy: { hp: 220, str: 115, speedTicks: 4, type: 'range', weakness: 'melee', offAtt: { melee: 0, ranged: 115, magic: 0 }, defBonus: { melee: 100, ranged: 130, magic: 110 } }, reward: { wyvern_bones: 1, dragon_bones: 1, rune_gem: 1, snapdragon: 1 } },
  fight_demonic_giant: { skill: 'combat', name: 'Demonic Giant', reqLvl: 1, category: 'extreme', enemy: { hp: 250, str: 140, speedTicks: 6, type: 'melee', weakness: 'magic', offAtt: { melee: 130, ranged: 0, magic: 0 }, defBonus: { melee: 135, ranged: 120, magic: 30 } }, reward: { great_meat: 1, coins: 500, big_bones: 1, rune_gem: 1 } },
  fight_abyssal_demon: { skill: 'combat', name: 'Abyssal Demon', reqLvl: 1, category: 'extreme', enemy: { hp: 280, str: 135, speedTicks: 4, type: 'melee', weakness: 'range', offAtt: { melee: 140, ranged: 0, magic: 0 }, defBonus: { melee: 140, ranged: 120, magic: 90 } }, reward: { demonic_ashes: 2, nova_scimitar: 1, big_bones: 1, rune_gem: 1 } },
  fight_chaos_elemental: { skill: 'combat', name: 'Chaos Elemental', reqLvl: 1, category: 'extreme', enemy: { hp: 300, str: 140, speedTicks: 4, type: 'magic', weakness: 'melee', offAtt: { melee: 0, ranged: 0, magic: 150 }, defBonus: { melee: 100, ranged: 120, magic: 160 } }, reward: { chaos_rune: 50, coins: 1000, big_bones: 1, torstol: 1, rune_gem: 2 } },
  fight_death_knight: { skill: 'combat', name: 'Death Knight', reqLvl: 1, category: 'extreme', enemy: { hp: 350, str: 170, speedTicks: 5, type: 'melee', weakness: 'magic', offAtt: { melee: 160, ranged: 0, magic: 0 }, defBonus: { melee: 175, ranged: 160, magic: 40 } }, reward: { nova_scimitar: 1, big_bones: 1, rune_gem: 1, blood_rune: 20 } },

  // --- LAVA CAVE (Boss Waves) ---
  lava_cave: { skill: 'combat', name: 'Lava Cave', reqLvl: 1, category: 'bosses', isFightCave: true, enemy: { hp: 1, str: 1, speedTicks: 4, type: 'melee', offAtt: { melee: 1, ranged: 0, magic: 0 }, defBonus: { melee: 1, ranged: 1, magic: 1 } }, reward: { coins: 5000, big_bones: 5, rune_gem: 2 } },

// --- PRAYER ---
  bury_normal: { skill: 'prayer', name: 'Bones', baseTime: 900, xp: 4.5, reqLvl: 1, cost: { bones: 1 }, reward: {} },
  bury_big: { skill: 'prayer', name: 'Big Bones', baseTime: 900, xp: 15, reqLvl: 5, cost: { big_bones: 1 }, reward: {} },
  bury_dragon: { skill: 'prayer', name: 'Dragon Bones', baseTime: 900, xp: 72, reqLvl: 43, cost: { dragon_bones: 1 }, reward: {} },

// --- WOODCUTTING ---
  wc_spruce: { skill: 'woodcutting', name: 'Spruce Tree', baseTime: 2700, xp: 10, reqLvl: 1, reward: { spruce_log: 1 } },
  wc_oak: { skill: 'woodcutting', name: 'Oak Tree', baseTime: 3300, xp: 25, reqLvl: 20, reward: { oak_log: 1 } },
  wc_willow: { skill: 'woodcutting', name: 'Willow Tree', baseTime: 3900, xp: 40, reqLvl: 30, reward: { willow_log: 1 } },
  wc_maple: { skill: 'woodcutting', name: 'Maple Tree', baseTime: 4250, xp: 50, reqLvl: 40, reward: { maple_log: 1 } },
  wc_mahogany: { skill: 'woodcutting', name: 'Mahogany Tree', baseTime: 5200, xp: 75, reqLvl: 50, reward: { mahogany_log: 1 } },
  wc_yew: { skill: 'woodcutting', name: 'Yew Tree', baseTime: 9250, xp: 150, reqLvl: 60, reward: { yew_log: 1 } },
  wc_magic: { skill: 'woodcutting', name: 'Magic Tree', baseTime: 15000, xp: 280, reqLvl: 70, reward: { magic_log: 1 } },
  wc_elder: { skill: 'woodcutting', name: 'Elder Tree', baseTime: 22250, xp: 500, reqLvl: 80, reward: { elder_log: 1 } },
  wc_aether: { skill: 'woodcutting', name: 'Aether Tree', baseTime: 30000, xp: 730, reqLvl: 90, reward: { aether_log: 1 } },
  
// --- CRAFTING ---
  // --- TANNING (Hides naar Leather) ---
  craft_leather: { skill: 'crafting', name: 'Leather', reqLvl: 1, category: 'tanning', xp: 10, baseTime: 1320, cost: { cowhide: 1 }, reward: { leather: 1 } },
  craft_snake_leather: { skill: 'crafting', name: 'Snake Hide', reqLvl: 15, category: 'tanning', xp: 22, baseTime: 1500, cost: { snake_hide: 1 }, reward: { snake_leather: 1 } },
  craft_green_leather: { skill: 'crafting', name: 'Green D-hide', reqLvl: 40, category: 'tanning', xp: 40, baseTime: 1680, cost: { green_dhide: 1 }, reward: { green_dragon_leather: 1 } },
  craft_red_leather: { skill: 'crafting', name: 'Red D-hide', reqLvl: 60, category: 'tanning', xp: 60, baseTime: 1860, cost: { red_dhide: 1 }, reward: { red_dragon_leather: 1 } },
  craft_black_leather: { skill: 'crafting', name: 'Black D-hide', reqLvl: 80, category: 'tanning', xp: 82, baseTime: 2040, cost: { black_dhide: 1 }, reward: { black_dragon_leather: 1 } },

  // --- ARMOR (Leather naar Uitrusting) ---
  craft_leather_body: { skill: 'crafting', name: 'Leather Body', reqLvl: 1, category: 'armor', xp: 22, baseTime: 2100, cost: { leather: 3 }, reward: { leather_body: 1 } },
  craft_bear_fur_top: { skill: 'crafting', name: 'Bear Fur Top', reqLvl: 10, category: 'armor', xp: 38, baseTime: 2280, cost: { bear_fur: 2 }, reward: { bear_fur_top: 1 } },
  craft_snake_body: { skill: 'crafting', name: 'Snake Body', reqLvl: 20, category: 'armor', xp: 58, baseTime: 2520, cost: { snake_leather: 3 }, reward: { snake_body: 1 } },
  craft_green_dhide_body: { skill: 'crafting', name: 'Green D-hide Body', reqLvl: 45, category: 'armor', xp: 105, baseTime: 2880, cost: { green_dragon_leather: 3 }, reward: { green_dhide_body: 1 } },
  craft_red_dhide_body: { skill: 'crafting', name: 'Red D-hide Body', reqLvl: 65, category: 'armor', xp: 145, baseTime: 3240, cost: { red_dragon_leather: 3 }, reward: { red_dhide_body: 1 } },
  craft_black_dhide_body: { skill: 'crafting', name: 'Black D-hide Body', reqLvl: 85, category: 'armor', xp: 195, baseTime: 3660, cost: { black_dragon_leather: 3 }, reward: { black_dhide_body: 1 } },

  // --- AMMO (Logs + Bars naar Pijlen) ---
  craft_bronze_arrow: { skill: 'crafting', name: 'Bronze Arrows (x40)', reqLvl: 1, category: 'ammo', xp: 12, baseTime: 1260, cost: { spruce_log: 1, bronze_bar: 1 }, reward: { bronze_arrow: 40 } },
  craft_iron_arrow: { skill: 'crafting', name: 'Iron Arrows (x40)', reqLvl: 15, category: 'ammo', xp: 25, baseTime: 1440, cost: { oak_log: 1, iron_bar: 1 }, reward: { iron_arrow: 40 } },
  craft_steel_arrow: { skill: 'crafting', name: 'Steel Arrows (x40)', reqLvl: 30, category: 'ammo', xp: 42, baseTime: 1680, cost: { willow_log: 1, steel_bar: 1 }, reward: { steel_arrow: 40 } },
  craft_alloy_arrow: { skill: 'crafting', name: 'Alloy Arrows (x40)', reqLvl: 50, category: 'ammo', xp: 68, baseTime: 1920, cost: { maple_log: 1, alloy_bar: 1 }, reward: { alloy_arrow: 40 } },
  craft_apex_arrow: { skill: 'crafting', name: 'Apex Arrows (x40)', reqLvl: 70, category: 'ammo', xp: 95, baseTime: 2220, cost: { yew_log: 1, apex_bar: 1 }, reward: { apex_arrow: 40 } },
  craft_nova_arrow: { skill: 'crafting', name: 'Nova Arrows (x40)', reqLvl: 85, category: 'ammo', xp: 130, baseTime: 2520, cost: { magic_log: 1, nova_bar: 1 }, reward: { nova_arrow: 40 } },

// ==========================================
  // --- SMITHING (Smelting - Ore to Bar) ---
  // ==========================================
  smelt_bronze_bar: { skill: 'smithing', name: 'Bronze Bar', baseTime: 1500, xp: 12, reqLvl: 1, cost: { tin_ore: 1, copper_ore: 1 }, reward: { bronze_bar: 1 } },
  smelt_iron_bar: { skill: 'smithing', name: 'Iron Bar', baseTime: 1800, xp: 25, reqLvl: 15, cost: { iron_ore: 1 }, reward: { iron_bar: 1 } },
  smelt_steel_bar: { skill: 'smithing', name: 'Steel Bar', baseTime: 1920, xp: 38, reqLvl: 30, cost: { iron_ore: 1, coal_ore: 1 }, reward: { steel_bar: 1 } },
  smelt_alloy_bar: { skill: 'smithing', name: 'Alloy Bar', baseTime: 2280, xp: 55, reqLvl: 50, cost: { alloy_ore: 1, coal_ore: 2 }, reward: { alloy_bar: 1 } },
  smelt_apex_bar: { skill: 'smithing', name: 'Apex Bar', baseTime: 2520, xp: 88, reqLvl: 70, cost: { apex_ore: 1, coal_ore: 5 }, reward: { apex_bar: 1 } },
  smelt_nova_bar: { skill: 'smithing', name: 'Nova Bar', baseTime: 2880, xp: 130, reqLvl: 85, cost: { nova_ore: 2, coal_ore: 10 }, reward: { nova_bar: 1 } },

  // ==========================================
  // ==========================================
  // BRONZE (Level 1+)
  smith_bronze_helmet: { skill: 'smithing', name: 'Bronze Helmet', reqLvl: 1, xp: 25, baseTime: 2100, cost: { bronze_bar: 2 }, reward: { bronze_helmet: 1 } },
  smith_bronze_legs: { skill: 'smithing', name: 'Bronze Platelegs', reqLvl: 14, xp: 37, baseTime: 2520, cost: { bronze_bar: 3 }, reward: { bronze_legs: 1 } },
  smith_bronze_body: { skill: 'smithing', name: 'Bronze Platebody', reqLvl: 18, xp: 62, baseTime: 3300, cost: { bronze_bar: 5 }, reward: { bronze_body: 1 } },

  // IRON (Level 15+)
  smith_iron_helmet: { skill: 'smithing', name: 'Iron Helmet', reqLvl: 15, xp: 50, baseTime: 2280, cost: { iron_bar: 2 }, reward: { iron_helmet: 1 } },
  smith_iron_legs: { skill: 'smithing', name: 'Iron Platelegs', reqLvl: 31, xp: 75, baseTime: 2700, cost: { iron_bar: 3 }, reward: { iron_legs: 1 } },
  smith_iron_body: { skill: 'smithing', name: 'Iron Platebody', reqLvl: 33, xp: 125, baseTime: 3720, cost: { iron_bar: 5 }, reward: { iron_body: 1 } },

  // STEEL (Level 30+)
  smith_steel_helmet: { skill: 'smithing', name: 'Steel Helmet', reqLvl: 30, xp: 75, baseTime: 2400, cost: { steel_bar: 2 }, reward: { steel_helmet: 1 } },
  smith_steel_legs: { skill: 'smithing', name: 'Steel Platelegs', reqLvl: 37, xp: 112, baseTime: 2880, cost: { steel_bar: 3 }, reward: { steel_legs: 1 } },
  smith_steel_body: { skill: 'smithing', name: 'Steel Platebody', reqLvl: 41, xp: 187, baseTime: 3900, cost: { steel_bar: 5 }, reward: { steel_body: 1 } },

  // ALLOY (Level 50+)
  smith_alloy_helmet: { skill: 'smithing', name: 'Alloy Helmet', reqLvl: 50, xp: 110, baseTime: 2700, cost: { alloy_bar: 2 }, reward: { alloy_helmet: 1 } },
  smith_alloy_legs: { skill: 'smithing', name: 'Alloy Platelegs', reqLvl: 57, xp: 165, baseTime: 3240, cost: { alloy_bar: 3 }, reward: { alloy_legs: 1 } },
  smith_alloy_body: { skill: 'smithing', name: 'Alloy Platebody', reqLvl: 61, xp: 275, baseTime: 4200, cost: { alloy_bar: 5 }, reward: { alloy_body: 1 } },

  // APEX (Level 70+)
  smith_apex_helmet: { skill: 'smithing', name: 'Apex Helmet', reqLvl: 70, xp: 150, baseTime: 2880, cost: { apex_bar: 2 }, reward: { apex_helmet: 1 } },
  smith_apex_legs: { skill: 'smithing', name: 'Apex Platelegs', reqLvl: 77, xp: 225, baseTime: 3480, cost: { apex_bar: 3 }, reward: { apex_legs: 1 } },
  smith_apex_body: { skill: 'smithing', name: 'Apex Platebody', reqLvl: 82, xp: 375, baseTime: 4500, cost: { apex_bar: 5 }, reward: { apex_body: 1 } },

  // NOVA (Level 85+)
  smith_nova_helmet: { skill: 'smithing', name: 'Nova Helmet', reqLvl: 85, xp: 200, baseTime: 3120, cost: { nova_bar: 2 }, reward: { nova_helmet: 1 } },
  smith_nova_legs: { skill: 'smithing', name: 'Nova Platelegs', reqLvl: 92, xp: 300, baseTime: 3780, cost: { nova_bar: 3 }, reward: { nova_legs: 1 } },
  smith_nova_body: { skill: 'smithing', name: 'Nova Platebody', reqLvl: 96, xp: 500, baseTime: 4800, cost: { nova_bar: 5 }, reward: { nova_body: 1 } },

  // ==========================================
  // --- CRAFTING (Ranged Armor - Leather) ---
  // ==========================================
  // NORMAL LEATHER
  craft_leather_cowl: { skill: 'crafting', name: 'Leather Cowl', reqLvl: 1, xp: 16, baseTime: 1680, cost: { leather: 1 }, reward: { leather_cowl: 1 } },
  craft_leather_chaps: { skill: 'crafting', name: 'Leather Chaps', reqLvl: 18, xp: 32, baseTime: 2100, cost: { leather: 2 }, reward: { leather_chaps: 1 } },
  craft_leather_body: { skill: 'crafting', name: 'Leather Body', reqLvl: 14, xp: 48, baseTime: 2520, cost: { leather: 3 }, reward: { leather_body: 1 } },

  // GREEN LEATHER (Level 57+)
  craft_green_chaps: { skill: 'crafting', name: 'Green Chaps', reqLvl: 60, xp: 124, baseTime: 2460, cost: { green_leather: 2 }, reward: { green_leather_chaps: 1 } },
  craft_green_body: { skill: 'crafting', name: 'Green Body', reqLvl: 63, xp: 186, baseTime: 3000, cost: { green_leather: 3 }, reward: { green_leather_body: 1 } },

  // BLACK LEATHER (Level 79+)
  craft_black_chaps: { skill: 'crafting', name: 'Black Chaps', reqLvl: 82, xp: 172, baseTime: 2880, cost: { black_leather: 2 }, reward: { black_leather_chaps: 1 } },
  craft_black_body: { skill: 'crafting', name: 'Black Body', reqLvl: 84, xp: 258, baseTime: 3480, cost: { black_leather: 3 }, reward: { black_leather_body: 1 } },

  // ==========================================
  // --- CRAFTING (Magic Armor - Robes) ---
  // ==========================================
  // APPRENTICE (Silk)
  craft_apprentice_hat: { skill: 'crafting', name: 'Apprentice Hat', reqLvl: 10, xp: 20, baseTime: 1680, cost: { silk: 1 }, reward: { apprentice_hat: 1 } },
  craft_apprentice_bottom: { skill: 'crafting', name: 'Apprentice Bottom', reqLvl: 13, xp: 40, baseTime: 2100, cost: { silk: 2 }, reward: { apprentice_bottom: 1 } },
  craft_apprentice_top: { skill: 'crafting', name: 'Apprentice Top', reqLvl: 16, xp: 60, baseTime: 2520, cost: { silk: 3 }, reward: { apprentice_top: 1 } },

  // WIZARD (Fine Cloth)
  craft_wizard_hat: { skill: 'crafting', name: 'Wizard Hat', reqLvl: 40, xp: 45, baseTime: 1920, cost: { fine_cloth: 1 }, reward: { wizard_hat: 1 } },
  craft_wizard_bottom: { skill: 'crafting', name: 'Wizard Bottom', reqLvl: 43, xp: 90, baseTime: 2460, cost: { fine_cloth: 2 }, reward: { wizard_bottom: 1 } },
  craft_wizard_top: { skill: 'crafting', name: 'Wizard Top', reqLvl: 46, xp: 135, baseTime: 3000, cost: { fine_cloth: 3 }, reward: { wizard_top: 1 } },

  // MYSTIC (Mystic Cloth)
  craft_mystic_hat: { skill: 'crafting', name: 'Mystic Hat', reqLvl: 70, xp: 75, baseTime: 2280, cost: { mystic_cloth: 1 }, reward: { mystic_hat: 1 } },
  craft_mystic_bottom: { skill: 'crafting', name: 'Mystic Bottom', reqLvl: 73, xp: 150, baseTime: 2880, cost: { mystic_cloth: 2 }, reward: { mystic_bottom: 1 } },
  craft_mystic_top: { skill: 'crafting', name: 'Mystic Top', reqLvl: 76, xp: 225, baseTime: 3480, cost: { mystic_cloth: 3 }, reward: { mystic_top: 1 } },

  // --- FISHING ---
  fish_shrimp: { skill: 'fishing', name: 'Shrimp', baseTime: 5100, xp: 15, reqLvl: 1, reward: { raw_shrimp: 1 } },
  fish_mackarel: { skill: 'fishing', name: 'Mackarel', baseTime: 6000, xp: 25, reqLvl: 10, reward: { raw_mackarel: 1 } },
  fish_cod: { skill: 'fishing', name: 'Cod', baseTime: 7200, xp: 40, reqLvl: 20, reward: { raw_cod: 1 } },
  fish_trout: { skill: 'fishing', name: 'Trout', baseTime: 8500, xp: 60, reqLvl: 30, reward: { raw_trout: 1 } },
  fish_salmon: { skill: 'fishing', name: 'Salmon', baseTime: 9800, xp: 80, reqLvl: 40, reward: { raw_salmon: 1 } },
  fish_carp: { skill: 'fishing', name: 'Carp', baseTime: 12500, xp: 125, reqLvl: 50, reward: { raw_carp: 1 } },
  fish_crab: { skill: 'fishing', name: 'Crab', baseTime: 15000, xp: 160, reqLvl: 60, reward: { raw_crab: 1 } },
  fish_anglerfish: { skill: 'fishing', name: 'Anglerfish', baseTime: 18500, xp: 210, reqLvl: 70, reward: { raw_anglerfish: 1 } },
  fish_tuna: { skill: 'fishing', name: 'Tuna', baseTime: 24000, xp: 315, reqLvl: 80, reward: { raw_tuna: 1 } },
  fish_shark: { skill: 'fishing', name: 'Shark', baseTime: 32000, xp: 500, reqLvl: 90, reward: { raw_shark: 1 } },

// --- MINING ---
  mine_copper: { skill: 'mining', name: 'Copper', baseTime: 3500, xp: 10, reqLvl: 1, reward: { copper_ore: 1 } },
  mine_tin: { skill: 'mining', name: 'Tin', baseTime: 3500, xp: 10, reqLvl: 1, reward: { tin_ore: 1 } },
  mine_iron: { skill: 'mining', name: 'Iron', baseTime: 5150, xp: 30, reqLvl: 15, reward: { iron_ore: 1 } },
  mine_coal: { skill: 'mining', name: 'Coal', baseTime: 7550, xp: 60, reqLvl: 35, reward: { coal_ore: 1 } },
  mine_alloy: { skill: 'mining', name: 'Alloy', baseTime: 13400, xp: 150, reqLvl: 55, reward: { alloy_ore: 1 } },
  mine_apex: { skill: 'mining', name: 'Apex', baseTime: 27500, xp: 400, reqLvl: 70, reward: { apex_ore: 1 } },
  mine_nova: { skill: 'mining', name: 'Nova', baseTime: 46000, xp: 800, reqLvl: 85, reward: { nova_ore: 1 } },

// --- FORAGING ---
  forage_eggs: { skill: 'foraging', name: 'Eggs', baseTime: 3200, xp: 15, reqLvl: 1, reward: { eggs: 1 } },
  forage_onion: { skill: 'foraging', name: 'Onion', baseTime: 3800, xp: 35, reqLvl: 10, reward: { onion: 1 } },
  forage_flax: { skill: 'foraging', name: 'Flax', baseTime: 4200, xp: 55, reqLvl: 20, reward: { flax: 1 } },
  forage_blueberries: { skill: 'foraging', name: 'Blueberries', baseTime: 4800, xp: 70, reqLvl: 30, reward: { blueberries: 1 } },
  forage_garlic: { skill: 'foraging', name: 'Garlic', baseTime: 5500, xp: 100, reqLvl: 40, reward: { garlic: 1 } },
  forage_seaweed: { skill: 'foraging', name: 'Seaweed', baseTime: 6500, xp: 130, reqLvl: 50, reward: { seaweed: 1 } },
  forage_fungi: { skill: 'foraging', name: 'Forage Fungi', baseTime: 9500, xp: 220, reqLvl: 65, reward: { fungi: 1 } },
  forage_berries: { skill: 'foraging', name: 'Berries', baseTime: 14500, xp: 405, reqLvl: 80, reward: { berries: 1 } },

  // --- AGILITY ---
  agility_gnome_course: { skill: 'agility', name: 'Gnome Course', baseTime: 4800, xp: 8, reqLvl: 1, reward: { mark_of_grace: 1 } },
  agility_draynor_course: { skill: 'agility', name: 'Draynor Course', baseTime: 5700, xp: 16, reqLvl: 10, reward: { mark_of_grace: 1 } },
  agility_varrock_course: { skill: 'agility', name: 'Varrock Course', baseTime: 6120, xp: 28, reqLvl: 20, reward: { mark_of_grace: 1 } },
  agility_canifis_course: { skill: 'agility', name: 'Canifis Course', baseTime: 6600, xp: 42, reqLvl: 35, reward: { mark_of_grace: 2 } },
  agility_falador_course: { skill: 'agility', name: 'Falador Course', baseTime: 7500, xp: 58, reqLvl: 50, reward: { mark_of_grace: 2 } },
  agility_seers_course: { skill: 'agility', name: 'Seers Course', baseTime: 7800, xp: 78, reqLvl: 60, reward: { mark_of_grace: 3 } },
  agility_rellekka_course: { skill: 'agility', name: 'Rellekka Course', baseTime: 8700, xp: 102, reqLvl: 70, reward: { mark_of_grace: 3 } },
  agility_ardougne_course: { skill: 'agility', name: 'Ardougne Course', baseTime: 9000, xp: 135, reqLvl: 80, reward: { mark_of_grace: 4, agility_ticket: 1 } },
  agility_prif_course: { skill: 'agility', name: 'Prifddinas Course', baseTime: 9900, xp: 168, reqLvl: 90, reward: { mark_of_grace: 5, agility_ticket: 2 } },

  // --- FARMING (Produce) ---
  farm_potato: { skill: 'farming', name: 'Potato', baseTime: 40000, xp: 100, reqLvl: 1, category: 'produce', cost: { potato_seed: 1 }, reward: { potato: 5 } },
  farm_tomato: { skill: 'farming', name: 'Tomato', baseTime: 50000, xp: 250, reqLvl: 10, category: 'produce', cost: { tomato_seed: 1 }, reward: { tomato: 5 } },
  farm_cabbage: { skill: 'farming', name: 'Cabbage', baseTime: 55000, xp: 400, reqLvl: 20, category: 'produce', cost: { cabbage_seed: 1 }, reward: { cabbage: 5 } },
  farm_strawberry: { skill: 'farming', name: 'Strawberry', baseTime: 60000, xp: 600, reqLvl: 30, category: 'produce', cost: { strawberry_seed: 1 }, reward: { strawberry: 5 } },
  farm_sweetcorn: { skill: 'farming', name: 'Sweetcorn', baseTime: 75000, xp: 1600, reqLvl: 40, category: 'produce', cost: { sweetcorn_seed: 1 }, reward: { sweetcorn: 5 } },
  farm_snape_grass: { skill: 'farming', name: 'Snape Grass', baseTime: 90000, xp: 3800, reqLvl: 55, category: 'produce', cost: { snape_grass_seed: 1 }, reward: { snape_grass: 5 } },

  // --- FARMING (Herbs) ---
  farm_guam: { skill: 'farming', name: 'Guam', baseTime: 45000, xp: 160, reqLvl: 9, category: 'herbs', cost: { herb_seed: 1 }, reward: { grimy_guam: 5 } },
  farm_ranarr: { skill: 'farming', name: 'Ranarr', baseTime: 65000, xp: 900, reqLvl: 32, category: 'herbs', cost: { ranarr_seed: 1 }, reward: { grimy_ranarr: 5 } },
  farm_snapdragon: { skill: 'farming', name: 'Snapdragon', baseTime: 110000, xp: 7200, reqLvl: 62, category: 'herbs', cost: { snapdragon_seed: 1 }, reward: { grimy_snapdragon: 5 } },
  farm_torstol: { skill: 'farming', name: 'Torstol', baseTime: 140000, xp: 12600, reqLvl: 85, category: 'herbs', cost: { torstol_seed: 1 }, reward: { grimy_torstol: 5 } },

  // --- HERBLORE: CLEANING (Grimy → Clean) ---
  clean_guam: { skill: 'herblore', name: 'Clean Guam', baseTime: 900, xp: 3, reqLvl: 1, category: 'cleaning', cost: { grimy_guam: 1 }, reward: { guam_leaf: 1 } },
  clean_ranarr: { skill: 'herblore', name: 'Clean Ranarr', baseTime: 900, xp: 8, reqLvl: 25, category: 'cleaning', cost: { grimy_ranarr: 1 }, reward: { ranarr_weed: 1 } },
  clean_snapdragon: { skill: 'herblore', name: 'Clean Snapdragon', baseTime: 900, xp: 12, reqLvl: 59, category: 'cleaning', cost: { grimy_snapdragon: 1 }, reward: { snapdragon: 1 } },
  clean_torstol: { skill: 'herblore', name: 'Clean Torstol', baseTime: 900, xp: 16, reqLvl: 75, category: 'cleaning', cost: { grimy_torstol: 1 }, reward: { torstol: 1 } },

  // --- HERBLORE: BREWING (Herbs + Secondary → Potion) ---
  brew_combat_potion: { skill: 'herblore', name: 'Combat Potion', baseTime: 6000, xp: 45, reqLvl: 5, category: 'brewing', cost: { guam_leaf: 1, potato: 1 }, reward: { combat_potion: 1 } },
  brew_ranged_potion: { skill: 'herblore', name: 'Ranged Potion', baseTime: 6000, xp: 50, reqLvl: 12, category: 'brewing', cost: { guam_leaf: 1, cabbage: 1 }, reward: { ranged_potion: 1 } },
  brew_magic_potion: { skill: 'herblore', name: 'Magic Potion', baseTime: 6000, xp: 55, reqLvl: 18, category: 'brewing', cost: { guam_leaf: 1, snape_grass: 1 }, reward: { magic_potion: 1 } },
  brew_prayer_potion: { skill: 'herblore', name: 'Prayer Potion', baseTime: 7200, xp: 65, reqLvl: 30, category: 'brewing', cost: { ranarr_weed: 1, snape_grass: 1 }, reward: { prayer_potion: 1 } },
  brew_stamina_potion: { skill: 'herblore', name: 'Stamina Potion', baseTime: 6000, xp: 60, reqLvl: 35, category: 'brewing', cost: { ranarr_weed: 1, strawberry: 1 }, reward: { stamina_potion: 1 } },
  brew_gathering_potion: { skill: 'herblore', name: 'Gathering Potion', baseTime: 7200, xp: 72, reqLvl: 45, category: 'brewing', cost: { snapdragon: 1, sweetcorn: 1 }, reward: { gathering_potion: 1 } },
  brew_respawn_potion: { skill: 'herblore', name: 'Respawn Potion', baseTime: 8400, xp: 85, reqLvl: 55, category: 'brewing', cost: { snapdragon: 1, tomato: 1 }, reward: { respawn_potion: 1 } },

  // --- HERBLORE: SUPER POTIONS (Potion + Torstol + Dragon Scale → Super) ---
  brew_super_combat: { skill: 'herblore', name: 'Super Combat Potion', baseTime: 10800, xp: 150, reqLvl: 70, category: 'super', cost: { combat_potion: 1, torstol: 1, dragon_scale: 1 }, reward: { super_combat_potion: 1 } },
  brew_super_ranged: { skill: 'herblore', name: 'Super Ranged Potion', baseTime: 10800, xp: 150, reqLvl: 72, category: 'super', cost: { ranged_potion: 1, torstol: 1, dragon_scale: 1 }, reward: { super_ranged_potion: 1 } },
  brew_super_magic: { skill: 'herblore', name: 'Super Magic Potion', baseTime: 10800, xp: 150, reqLvl: 76, category: 'super', cost: { magic_potion: 1, torstol: 1, dragon_scale: 1 }, reward: { super_magic_potion: 1 } },

  // --- COOKING ---
  cook_meat: { skill: 'cooking', name: 'Meat', baseTime: 1000, xp: 5, reqLvl: 1, category: 'meat', cost: { meat: 1 }, reward: { cooked_meat: 1 } },
  cook_shrimp: { skill: 'cooking', name: 'Shrimp', baseTime: 1800, xp: 10, reqLvl: 1, category: 'fish', cost: { raw_shrimp: 1 }, reward: { cooked_shrimp: 1 } },
  cook_mackarel: { skill: 'cooking', name: 'Mackarel', baseTime: 2100, xp: 20, reqLvl: 10, category: 'fish', cost: { raw_mackarel: 1 }, reward: { cooked_mackarel: 1 } },
  cook_cod: { skill: 'cooking', name: 'Cod', baseTime: 2500, xp: 30, reqLvl: 20, category: 'fish', cost: { raw_cod: 1 }, reward: { cooked_cod: 1 } },
  cook_big_meat: { skill: 'cooking', name: 'Big Meat', baseTime: 1800, xp: 25, reqLvl: 25, category: 'meat', cost: { big_meat: 1 }, reward: { cooked_big_meat: 1 } },
  cook_trout: { skill: 'cooking', name: 'Trout', baseTime: 2800, xp: 40, reqLvl: 30, category: 'fish', cost: { raw_trout: 1 }, reward: { cooked_trout: 1 } },
  cook_salmon: { skill: 'cooking', name: 'Salmon', baseTime: 3200, xp: 55, reqLvl: 40, category: 'fish', cost: { raw_salmon: 1 }, reward: { cooked_salmon: 1 } },
  cook_carp: { skill: 'cooking', name: 'Carp', baseTime: 4000, xp: 80, reqLvl: 50, category: 'fish', cost: { raw_carp: 1 }, reward: { cooked_carp: 1 } },
  cook_crab: { skill: 'cooking', name: 'Crab', baseTime: 4800, xp: 105, reqLvl: 60, category: 'fish', cost: { raw_crab: 1 }, reward: { cooked_crab: 1 } },
  cook_great_meat: { skill: 'cooking', name: 'Great Meat', baseTime: 3500, xp: 75, reqLvl: 60, category: 'meat', cost: { great_meat: 1 }, reward: { cooked_great_meat: 1 } },
  cook_anglerfish: { skill: 'cooking', name: 'Anglerfish', baseTime: 5500, xp: 125, reqLvl: 70, category: 'fish', cost: { raw_anglerfish: 1 }, reward: { cooked_anglerfish: 1 } },
  cook_tuna: { skill: 'cooking', name: 'Tuna', baseTime: 6800, xp: 180, reqLvl: 80, category: 'fish', cost: { raw_tuna: 1 }, reward: { cooked_tuna: 1 } },
  cook_shark: { skill: 'cooking', name: 'Shark', baseTime: 8500, xp: 265, reqLvl: 90, category: 'fish', cost: { raw_shark: 1 }, reward: { cooked_shark: 1 } },

// --- INFUSION (Gear Upgrading) ---
// --- MELEE SCIMITARS ---
  infuse_bronze_to_iron_scimitar: { skill: 'infusion', name: 'Iron Scimitar', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'scimitars', cost: { bronze_scimitar: 2, iron_bar: 200 }, reward: { iron_scimitar: 1 } },
  infuse_iron_to_steel_scimitar: { skill: 'infusion', name: 'Steel Scimitar', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'scimitars', cost: { iron_scimitar: 2, steel_bar: 200 }, reward: { steel_scimitar: 1 } },
  infuse_steel_to_alloy_scimitar: { skill: 'infusion', name: 'Alloy Scimitar', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'scimitars', cost: { steel_scimitar: 2, alloy_bar: 200 }, reward: { alloy_scimitar: 1 } },
  infuse_alloy_to_apex_scimitar: { skill: 'infusion', name: 'Apex Scimitar', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'scimitars', cost: { alloy_scimitar: 2, apex_bar: 200 }, reward: { apex_scimitar: 1 } },
  infuse_apex_to_nova_scimitar: { skill: 'infusion', name: 'Nova Scimitar', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'scimitars', cost: { apex_scimitar: 2, nova_bar: 200 }, reward: { nova_scimitar: 1 } },

// --- RANGED BOWS ---
  infuse_bronze_to_iron_bow: { skill: 'infusion', name: 'Iron Bow', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'bows', cost: { bronze_bow: 2, iron_bar: 200 }, reward: { iron_bow: 1 } },
  infuse_iron_to_steel_bow: { skill: 'infusion', name: 'Steel Bow', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'bows', cost: { iron_bow: 2, steel_bar: 200 }, reward: { steel_bow: 1 } },
  infuse_steel_to_alloy_bow: { skill: 'infusion', name: 'Alloy Bow', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'bows', cost: { steel_bow: 2, alloy_bar: 200 }, reward: { alloy_bow: 1 } },
  infuse_alloy_to_apex_bow: { skill: 'infusion', name: 'Apex Bow', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'bows', cost: { alloy_bow: 2, apex_bar: 200 }, reward: { apex_bow: 1 } },
  infuse_apex_to_nova_bow: { skill: 'infusion', name: 'Nova Bow', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'bows', cost: { apex_bow: 2, nova_bar: 200 }, reward: { nova_bow: 1 } },

// --- MAGIC STAFFS ---
  infuse_bronze_to_iron_staff: { skill: 'infusion', name: 'Iron Staff', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'staffs', cost: { bronze_staff: 2, iron_bar: 200 }, reward: { iron_staff: 1 } },
  infuse_iron_to_steel_staff: { skill: 'infusion', name: 'Steel Staff', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'staffs', cost: { iron_staff: 2, steel_bar: 200 }, reward: { steel_staff: 1 } },
  infuse_steel_to_alloy_staff: { skill: 'infusion', name: 'Alloy Staff', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'staffs', cost: { steel_staff: 2, alloy_bar: 200 }, reward: { alloy_staff: 1 } },
  infuse_alloy_to_apex_staff: { skill: 'infusion', name: 'Apex Staff', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'staffs', cost: { alloy_staff: 2, apex_bar: 200 }, reward: { apex_staff: 1 } },
  infuse_apex_to_nova_staff: { skill: 'infusion', name: 'Nova Staff', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'staffs', cost: { apex_staff: 2, nova_bar: 200 }, reward: { nova_staff: 1 } },

// --- MELEE ARMOR (Helmets) ---
  infuse_bronze_to_iron_helmet: { skill: 'infusion', name: 'Iron Helmet', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'armor', cost: { bronze_helmet: 2, iron_bar: 200 }, reward: { iron_helmet: 1 } },
  infuse_iron_to_steel_helmet: { skill: 'infusion', name: 'Steel Helmet', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'armor', cost: { iron_helmet: 2, steel_bar: 200 }, reward: { steel_helmet: 1 } },
  infuse_steel_to_alloy_helmet: { skill: 'infusion', name: 'Alloy Helmet', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'armor', cost: { steel_helmet: 2, alloy_bar: 200 }, reward: { alloy_helmet: 1 } },
  infuse_alloy_to_apex_helmet: { skill: 'infusion', name: 'Apex Helmet', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'armor', cost: { alloy_helmet: 2, apex_bar: 200 }, reward: { apex_helmet: 1 } },
  infuse_apex_to_nova_helmet: { skill: 'infusion', name: 'Nova Helmet', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'armor', cost: { apex_helmet: 2, nova_bar: 200 }, reward: { nova_helmet: 1 } },

// --- MELEE ARMOR (Bodies) ---
  infuse_bronze_to_iron_body: { skill: 'infusion', name: 'Iron Platebody', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'armor', cost: { bronze_body: 2, iron_bar: 200 }, reward: { iron_body: 1 } },
  infuse_iron_to_steel_body: { skill: 'infusion', name: 'Steel Platebody', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'armor', cost: { iron_body: 2, steel_bar: 200 }, reward: { steel_body: 1 } },
  infuse_steel_to_alloy_body: { skill: 'infusion', name: 'Alloy Platebody', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'armor', cost: { steel_body: 2, alloy_bar: 200 }, reward: { alloy_body: 1 } },
  infuse_alloy_to_apex_body: { skill: 'infusion', name: 'Apex Platebody', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'armor', cost: { alloy_body: 2, apex_bar: 200 }, reward: { apex_body: 1 } },
  infuse_apex_to_nova_body: { skill: 'infusion', name: 'Nova Platebody', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'armor', cost: { apex_body: 2, nova_bar: 200 }, reward: { nova_body: 1 } },

// --- MELEE ARMOR (Legs) ---
  infuse_bronze_to_iron_legs: { skill: 'infusion', name: 'Iron Platelegs', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'armor', cost: { bronze_legs: 2, iron_bar: 200 }, reward: { iron_legs: 1 } },
  infuse_iron_to_steel_legs: { skill: 'infusion', name: 'Steel Platelegs', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'armor', cost: { iron_legs: 2, steel_bar: 200 }, reward: { steel_legs: 1 } },
  infuse_steel_to_alloy_legs: { skill: 'infusion', name: 'Alloy Platelegs', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'armor', cost: { steel_legs: 2, alloy_bar: 200 }, reward: { alloy_legs: 1 } },
  infuse_alloy_to_apex_legs: { skill: 'infusion', name: 'Apex Platelegs', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'armor', cost: { alloy_legs: 2, apex_bar: 200 }, reward: { apex_legs: 1 } },
  infuse_apex_to_nova_legs: { skill: 'infusion', name: 'Nova Platelegs', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'armor', cost: { apex_legs: 2, nova_bar: 200 }, reward: { nova_legs: 1 } },

// --- MELEE ARMOR (Shields) ---
  infuse_bronze_to_iron_shield: { skill: 'infusion', name: 'Iron Shield', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'armor', cost: { bronze_shield: 2, iron_bar: 200 }, reward: { iron_shield: 1 } },
  infuse_iron_to_steel_shield: { skill: 'infusion', name: 'Steel Shield', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'armor', cost: { iron_shield: 2, steel_bar: 200 }, reward: { steel_shield: 1 } },
  infuse_steel_to_alloy_shield: { skill: 'infusion', name: 'Alloy Shield', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'armor', cost: { steel_shield: 2, alloy_bar: 200 }, reward: { alloy_shield: 1 } },
  infuse_alloy_to_apex_shield: { skill: 'infusion', name: 'Apex Shield', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'armor', cost: { alloy_shield: 2, apex_bar: 200 }, reward: { apex_shield: 1 } },
  infuse_apex_to_nova_shield: { skill: 'infusion', name: 'Nova Shield', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'armor', cost: { apex_shield: 2, nova_bar: 200 }, reward: { nova_shield: 1 } },

// --- TOOLS (Axes - Woodcutting) ---
  infuse_bronze_to_iron_axe: { skill: 'infusion', name: 'Iron Axe', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_axes', cost: { bronze_axe: 2, iron_bar: 200 }, reward: { iron_axe: 1 } },
  infuse_iron_to_steel_axe: { skill: 'infusion', name: 'Steel Axe', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_axes', cost: { iron_axe: 2, steel_bar: 200 }, reward: { steel_axe: 1 } },
  infuse_steel_to_alloy_axe: { skill: 'infusion', name: 'Alloy Axe', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_axes', cost: { steel_axe: 2, alloy_bar: 200 }, reward: { alloy_axe: 1 } },
  infuse_alloy_to_apex_axe: { skill: 'infusion', name: 'Apex Axe', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_axes', cost: { alloy_axe: 2, apex_bar: 200 }, reward: { apex_axe: 1 } },
  infuse_apex_to_nova_axe: { skill: 'infusion', name: 'Nova Axe', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_axes', cost: { apex_axe: 2, nova_bar: 200 }, reward: { nova_axe: 1 } },

// --- TOOLS (Rods - Fishing) ---
  infuse_bronze_to_iron_rod: { skill: 'infusion', name: 'Iron Rod', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_rods', cost: { bronze_rod: 2, iron_bar: 200 }, reward: { iron_rod: 1 } },
  infuse_iron_to_steel_rod: { skill: 'infusion', name: 'Steel Rod', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_rods', cost: { iron_rod: 2, steel_bar: 200 }, reward: { steel_rod: 1 } },
  infuse_steel_to_alloy_rod: { skill: 'infusion', name: 'Alloy Rod', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_rods', cost: { steel_rod: 2, alloy_bar: 200 }, reward: { alloy_rod: 1 } },
  infuse_alloy_to_apex_rod: { skill: 'infusion', name: 'Apex Rod', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_rods', cost: { alloy_rod: 2, apex_bar: 200 }, reward: { apex_rod: 1 } },
  infuse_apex_to_nova_rod: { skill: 'infusion', name: 'Nova Rod', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_rods', cost: { apex_rod: 2, nova_bar: 200 }, reward: { nova_rod: 1 } },

// --- TOOLS (Pickaxes - Mining) ---
  infuse_bronze_to_iron_pickaxe: { skill: 'infusion', name: 'Iron Pickaxe', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_pickaxes', cost: { bronze_pickaxe: 2, iron_bar: 200 }, reward: { iron_pickaxe: 1 } },
  infuse_iron_to_steel_pickaxe: { skill: 'infusion', name: 'Steel Pickaxe', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_pickaxes', cost: { iron_pickaxe: 2, steel_bar: 200 }, reward: { steel_pickaxe: 1 } },
  infuse_steel_to_alloy_pickaxe: { skill: 'infusion', name: 'Alloy Pickaxe', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_pickaxes', cost: { steel_pickaxe: 2, alloy_bar: 200 }, reward: { alloy_pickaxe: 1 } },
  infuse_alloy_to_apex_pickaxe: { skill: 'infusion', name: 'Apex Pickaxe', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_pickaxes', cost: { alloy_pickaxe: 2, apex_bar: 200 }, reward: { apex_pickaxe: 1 } },
  infuse_apex_to_nova_pickaxe: { skill: 'infusion', name: 'Nova Pickaxe', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_pickaxes', cost: { apex_pickaxe: 2, nova_bar: 200 }, reward: { nova_pickaxe: 1 } },

// --- TOOLS (Pans - Cooking) ---
  infuse_bronze_to_iron_pan: { skill: 'infusion', name: 'Iron Pan', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_pans', cost: { bronze_pan: 2, iron_bar: 200 }, reward: { iron_pan: 1 } },
  infuse_iron_to_steel_pan: { skill: 'infusion', name: 'Steel Pan', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_pans', cost: { iron_pan: 2, steel_bar: 200 }, reward: { steel_pan: 1 } },
  infuse_steel_to_alloy_pan: { skill: 'infusion', name: 'Alloy Pan', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_pans', cost: { steel_pan: 2, alloy_bar: 200 }, reward: { alloy_pan: 1 } },
  infuse_alloy_to_apex_pan: { skill: 'infusion', name: 'Apex Pan', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_pans', cost: { alloy_pan: 2, apex_bar: 200 }, reward: { apex_pan: 1 } },
  infuse_apex_to_nova_pan: { skill: 'infusion', name: 'Nova Pan', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_pans', cost: { apex_pan: 2, nova_bar: 200 }, reward: { nova_pan: 1 } },

// --- TOOLS (Hammers - Smithing) ---
  infuse_bronze_to_iron_hammer: { skill: 'infusion', name: 'Iron Hammer', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_hammers', cost: { bronze_hammer: 2, iron_bar: 200 }, reward: { iron_hammer: 1 } },
  infuse_iron_to_steel_hammer: { skill: 'infusion', name: 'Steel Hammer', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_hammers', cost: { iron_hammer: 2, steel_bar: 200 }, reward: { steel_hammer: 1 } },
  infuse_steel_to_alloy_hammer: { skill: 'infusion', name: 'Alloy Hammer', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_hammers', cost: { steel_hammer: 2, alloy_bar: 200 }, reward: { alloy_hammer: 1 } },
  infuse_alloy_to_apex_hammer: { skill: 'infusion', name: 'Apex Hammer', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_hammers', cost: { alloy_hammer: 2, apex_bar: 200 }, reward: { apex_hammer: 1 } },
  infuse_apex_to_nova_hammer: { skill: 'infusion', name: 'Nova Hammer', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_hammers', cost: { apex_hammer: 2, nova_bar: 200 }, reward: { nova_hammer: 1 } },

// --- TOOLS (Needles - Crafting) ---
  infuse_bronze_to_iron_needle: { skill: 'infusion', name: 'Iron Needle', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_needles', cost: { bronze_needle: 2, iron_bar: 200 }, reward: { iron_needle: 1 } },
  infuse_iron_to_steel_needle: { skill: 'infusion', name: 'Steel Needle', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_needles', cost: { iron_needle: 2, steel_bar: 200 }, reward: { steel_needle: 1 } },
  infuse_steel_to_alloy_needle: { skill: 'infusion', name: 'Alloy Needle', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_needles', cost: { steel_needle: 2, alloy_bar: 200 }, reward: { alloy_needle: 1 } },
  infuse_alloy_to_apex_needle: { skill: 'infusion', name: 'Apex Needle', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_needles', cost: { alloy_needle: 2, apex_bar: 200 }, reward: { apex_needle: 1 } },
  infuse_apex_to_nova_needle: { skill: 'infusion', name: 'Nova Needle', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_needles', cost: { apex_needle: 2, nova_bar: 200 }, reward: { nova_needle: 1 } },

// --- TOOLS (Pestles - Herblore) ---
  infuse_bronze_to_iron_pestle: { skill: 'infusion', name: 'Iron Pestle', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_pestles', cost: { bronze_pestle: 2, iron_bar: 200 }, reward: { iron_pestle: 1 } },
  infuse_iron_to_steel_pestle: { skill: 'infusion', name: 'Steel Pestle', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_pestles', cost: { iron_pestle: 2, steel_bar: 200 }, reward: { steel_pestle: 1 } },
  infuse_steel_to_alloy_pestle: { skill: 'infusion', name: 'Alloy Pestle', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_pestles', cost: { steel_pestle: 2, alloy_bar: 200 }, reward: { alloy_pestle: 1 } },
  infuse_alloy_to_apex_pestle: { skill: 'infusion', name: 'Apex Pestle', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_pestles', cost: { alloy_pestle: 2, apex_bar: 200 }, reward: { apex_pestle: 1 } },
  infuse_apex_to_nova_pestle: { skill: 'infusion', name: 'Nova Pestle', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_pestles', cost: { apex_pestle: 2, nova_bar: 200 }, reward: { nova_pestle: 1 } },

// --- TOOLS (Spades - Farming) ---
  infuse_bronze_to_iron_spade: { skill: 'infusion', name: 'Iron Spade', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_spades', cost: { bronze_spade: 2, iron_bar: 200 }, reward: { iron_spade: 1 } },
  infuse_iron_to_steel_spade: { skill: 'infusion', name: 'Steel Spade', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_spades', cost: { iron_spade: 2, steel_bar: 200 }, reward: { steel_spade: 1 } },
  infuse_steel_to_alloy_spade: { skill: 'infusion', name: 'Alloy Spade', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_spades', cost: { steel_spade: 2, alloy_bar: 200 }, reward: { alloy_spade: 1 } },
  infuse_alloy_to_apex_spade: { skill: 'infusion', name: 'Apex Spade', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_spades', cost: { alloy_spade: 2, apex_bar: 200 }, reward: { apex_spade: 1 } },
  infuse_apex_to_nova_spade: { skill: 'infusion', name: 'Nova Spade', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_spades', cost: { apex_spade: 2, nova_bar: 200 }, reward: { nova_spade: 1 } },

// --- TOOLS (Sickles - Foraging) ---
  infuse_bronze_to_iron_sickle: { skill: 'infusion', name: 'Iron Sickle', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_sickles', cost: { bronze_sickle: 2, iron_bar: 200 }, reward: { iron_sickle: 1 } },
  infuse_iron_to_steel_sickle: { skill: 'infusion', name: 'Steel Sickle', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_sickles', cost: { iron_sickle: 2, steel_bar: 200 }, reward: { steel_sickle: 1 } },
  infuse_steel_to_alloy_sickle: { skill: 'infusion', name: 'Alloy Sickle', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_sickles', cost: { steel_sickle: 2, alloy_bar: 200 }, reward: { alloy_sickle: 1 } },
  infuse_alloy_to_apex_sickle: { skill: 'infusion', name: 'Apex Sickle', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_sickles', cost: { alloy_sickle: 2, apex_bar: 200 }, reward: { apex_sickle: 1 } },
  infuse_apex_to_nova_sickle: { skill: 'infusion', name: 'Nova Sickle', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_sickles', cost: { apex_sickle: 2, nova_bar: 200 }, reward: { nova_sickle: 1 } },

// --- TOOLS (Lockpicks - Thieving) ---
  infuse_bronze_to_iron_lockpick: { skill: 'infusion', name: 'Iron Lockpick', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_lockpicks', cost: { bronze_lockpick: 2, iron_bar: 200 }, reward: { iron_lockpick: 1 } },
  infuse_iron_to_steel_lockpick: { skill: 'infusion', name: 'Steel Lockpick', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_lockpicks', cost: { iron_lockpick: 2, steel_bar: 200 }, reward: { steel_lockpick: 1 } },
  infuse_steel_to_alloy_lockpick: { skill: 'infusion', name: 'Alloy Lockpick', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_lockpicks', cost: { steel_lockpick: 2, alloy_bar: 200 }, reward: { alloy_lockpick: 1 } },
  infuse_alloy_to_apex_lockpick: { skill: 'infusion', name: 'Apex Lockpick', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_lockpicks', cost: { alloy_lockpick: 2, apex_bar: 200 }, reward: { apex_lockpick: 1 } },
  infuse_apex_to_nova_lockpick: { skill: 'infusion', name: 'Nova Lockpick', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_lockpicks', cost: { apex_lockpick: 2, nova_bar: 200 }, reward: { nova_lockpick: 1 } },

// --- TOOLS (Boots - Agility) ---
  infuse_bronze_to_iron_boots: { skill: 'infusion', name: 'Iron Boots', baseTime: 5000, xp: 10000, reqLvl: 5, category: 'tools_boots', cost: { bronze_boots: 2, iron_bar: 200 }, reward: { iron_boots: 1 } },
  infuse_iron_to_steel_boots: { skill: 'infusion', name: 'Steel Boots', baseTime: 5000, xp: 18000, reqLvl: 15, category: 'tools_boots', cost: { iron_boots: 2, steel_bar: 200 }, reward: { steel_boots: 1 } },
  infuse_steel_to_alloy_boots: { skill: 'infusion', name: 'Alloy Boots', baseTime: 5000, xp: 31000, reqLvl: 25, category: 'tools_boots', cost: { steel_boots: 2, alloy_bar: 200 }, reward: { alloy_boots: 1 } },
  infuse_alloy_to_apex_boots: { skill: 'infusion', name: 'Apex Boots', baseTime: 5000, xp: 55000, reqLvl: 40, category: 'tools_boots', cost: { alloy_boots: 2, apex_bar: 200 }, reward: { apex_boots: 1 } },
  infuse_apex_to_nova_boots: { skill: 'infusion', name: 'Nova Boots', baseTime: 5000, xp: 80000, reqLvl: 55, category: 'tools_boots', cost: { apex_boots: 2, nova_bar: 200 }, reward: { nova_boots: 1 } },
  
  // --- THIEVING (Dummy action for FloatingBar) ---
  thieving: { skill: 'thieving', name: 'Thieving', xp: 0 },
};

// ==========================================
// --- THIEVING TARGETS ---
// ==========================================
export const THIEVING_TARGETS = [
  {
    id: 'pickpocket_farmer',
    name: 'Farmer',
    icon: '🧑‍🌾',
    reqLvl: 1,
    xp: 8,
    baseStunChance: 0.65,
    stunDurationMs: 3000,
    actionTimeMs: 2400,
    reward: { coins: 9 },
    desc: 'A simple farmer. Easy pickings.'
  },
  {
    id: 'pickpocket_warrior',
    name: 'Warrior',
    icon: '⚔️',
    reqLvl: 10,
    xp: 18,
    baseStunChance: 0.70,
    stunDurationMs: 3500,
    actionTimeMs: 2600,
    reward: { coins: 18, lockpick: 1 },
    desc: 'A trained warrior. Watch out for his reflexes.'
  },
  {
    id: 'pickpocket_rogue',
    name: 'Rogue',
    icon: '🗡️',
    reqLvl: 20,
    xp: 30,
    baseStunChance: 0.72,
    stunDurationMs: 3500,
    actionTimeMs: 2800,
    reward: { coins: 30, lockpick: 2 },
    desc: 'A fellow thief. He knows all the tricks.'
  },
  {
    id: 'steal_bakery_stall',
    name: 'Bakery Stall',
    icon: '🍞',
    reqLvl: 25,
    xp: 35,
    baseStunChance: 0.55,
    stunDurationMs: 4000,
    actionTimeMs: 3200,
    reward: { coins: 20 },
    desc: 'Swipe goods from the bakery stall.'
  },
  {
    id: 'pickpocket_guard',
    name: 'Guard',
    icon: '💂',
    reqLvl: 35,
    xp: 48,
    baseStunChance: 0.75,
    stunDurationMs: 4000,
    actionTimeMs: 3000,
    reward: { coins: 45, gold_ring: 1 },
    desc: 'City guards carry decent coin purses.'
  },
  {
    id: 'steal_gem_stall',
    name: 'Gem Stall',
    icon: '💎',
    reqLvl: 45,
    xp: 60,
    baseStunChance: 0.65,
    stunDurationMs: 4500,
    actionTimeMs: 3400,
    reward: { coins: 35, silver_necklace: 1 },
    desc: 'A stall full of sparkling gems.'
  },
  {
    id: 'pickpocket_paladin',
    name: 'Paladin',
    icon: '🛡️',
    reqLvl: 55,
    xp: 80,
    baseStunChance: 0.78,
    stunDurationMs: 4500,
    actionTimeMs: 3200,
    reward: { coins: 80, gold_ring: 1, chaos_rune: 2 },
    desc: 'Holy warriors with heavy purses.'
  },
  {
    id: 'pickpocket_knight',
    name: 'Knight of Ardougne',
    icon: '🏰',
    reqLvl: 65,
    xp: 105,
    baseStunChance: 0.80,
    stunDurationMs: 5000,
    actionTimeMs: 3000,
    reward: { coins: 120, gold_ring: 1 },
    desc: 'Knights are wealthy targets, but very alert.'
  },
  {
    id: 'steal_bank_chest',
    name: 'Bank Vault',
    icon: '🏦',
    reqLvl: 75,
    xp: 135,
    baseStunChance: 0.82,
    stunDurationMs: 5500,
    actionTimeMs: 4000,
    reward: { coins: 200, gem_bag: 1 },
    desc: 'Break into a bank vault. High risk, high reward.'
  },
  {
    id: 'steal_outpost_treasury',
    name: 'Outpost Treasury',
    icon: '🏴',
    reqLvl: 85,
    xp: 170,
    baseStunChance: 0.85,
    stunDurationMs: 6000,
    actionTimeMs: 4500,
    reward: { coins: 350, treasury_note: 1, gem_bag: 1 },
    desc: 'The most guarded treasure. Only masters dare.'
  },
];

// --- SLAYER MASTERS ---
export const SLAYER_MASTERS = [
  {
    id: 'master_1', name: 'Turael', tier: 'beginner', reqHp: 10, points: 5,
    desc: 'Beginner monsters',
    taskRange: [15, 30],
    monsters: ['fight_chicken', 'fight_cow', 'fight_goblin', 'fight_snake', 'fight_wolf', 'fight_bear']
  },
  {
    id: 'master_2', name: 'Vannaka', tier: 'easy', reqHp: 25, points: 10,
    desc: 'Easy monsters',
    taskRange: [30, 60],
    monsters: ['fight_zombie', 'fight_scorpion', 'fight_druid', 'fight_orc', 'fight_crocodile', 'fight_giant', 'fight_green_dragon']
  },
  {
    id: 'master_3', name: 'Chaeldar', tier: 'moderate', reqHp: 40, points: 15,
    desc: 'Moderate monsters',
    taskRange: [40, 80],
    monsters: ['fight_ghost', 'fight_red_spider', 'fight_swamp_lizard', 'fight_demon', 'fight_demonic_scorpion', 'fight_red_dragon']
  },
  {
    id: 'master_4', name: 'Nieve', tier: 'hard', reqHp: 60, points: 20,
    desc: 'Hard monsters',
    taskRange: [50, 100],
    monsters: ['fight_vampire', 'fight_werewolf', 'fight_demonic_zombie', 'fight_dark_warrior', 'fight_black_dragon']
  },
  {
    id: 'master_5', name: 'Duradel', tier: 'extreme', reqHp: 80, points: 25,
    desc: 'Extreme monsters',
    taskRange: [60, 120],
    monsters: ['fight_wyvern', 'fight_demonic_giant', 'fight_abyssal_demon', 'fight_chaos_elemental', 'fight_death_knight']
  },
  {
    id: 'master_boss', name: 'Konar', tier: 'boss', reqHp: 0, points: 35,
    desc: 'Boss tasks (requires unlock)',
    requiresUnlock: true,
    taskRange: [5, 15],
    monsters: ['lava_cave']
  }
];

// ==========================================
// --- CENTRALIZED ITEM IMAGES ---
// ==========================================
// This object is used across all components to display item images
// Add image paths using PUBLIC_URL format for Vite compatibility
export const PETS = {
  woodcutting_pet: { name: 'Beaver', skill: 'woodcutting', equipSlot: 'pet', desc: '10% chance to receive an extra log when woodcutting.', perk: 'extraLog', perkChance: 0.10 },
  fishing_pet: { name: 'Heron', skill: 'fishing', equipSlot: 'pet', desc: '+20% chance to find treasure chests while fishing.', perk: 'treasureBoost', perkValue: 0.20 },
  mining_pet: { name: 'Rock Golem', skill: 'mining', equipSlot: 'pet', desc: '5% chance per mine action that the ore auto-smelts into a bar.', perk: 'autoSmelt', perkChance: 1 },
  foraging_pet: { name: 'Tanuki', skill: 'foraging', equipSlot: 'pet', desc: 'Reduces foraging time by 1 second.', perk: 'foragingSpeed', perkValue: 1000 },
  cooking_pet: { name: 'Rocky Raccoon', skill: 'cooking', equipSlot: 'pet', desc: '50% chance to cook 3 fish at once (costs 3 raw fish).', perk: 'batchCook', perkChance: 0.50, perkMultiplier: 3 },
  smithing_pet: { name: 'Smithy', skill: 'smithing', equipSlot: 'pet', desc: '5% chance to gain a bar while smithing.', perk: 'barSave', perkChance: 0.05 },
  crafting_pet: { name: 'Chameleon', skill: 'crafting', equipSlot: 'pet', desc: '5% chance that no resources are consumed during crafting.', perk: 'freeCraft', perkChance: 0.05 },
  herblore_pet: { name: 'Herbi', skill: 'herblore', equipSlot: 'pet', desc: '10% chance to brew a second potion without extra resources.', perk: 'doubleBrew', perkChance: 0.10 },
  thieving_pet: { name: 'Raccoon', skill: 'thieving', equipSlot: 'pet', desc: '50% chance to steal loot while you are stunned.', perk: 'stunSteal', perkChance: 0.50 },
  farming_pet: { name: 'Mole', skill: 'farming', equipSlot: 'pet', desc: 'Once per day, activate the Mole Timer: farming is 100% faster for 30 minutes.', perk: 'moleTimer', perkDuration: 30 * 60 * 1000, perkCooldown: 24 * 60 * 60 * 1000 },
  agility_pet: { name: 'Squirrel', skill: 'agility', equipSlot: 'pet', desc: '5% chance to instantly complete an agility course.', perk: 'instantCourse', perkChance: 0.05 },
  slayer_pet: { name: 'Crawling Hand', skill: 'slayer', equipSlot: 'pet', desc: '+5% extra damage while on a slayer task.', perk: 'slayerBonus', perkValue: 0.05 },
};

export const ITEM_IMAGES = {
  // --- Ores ---
  copper_ore: '/src/assets/mining/Ores/copper_ore.png',
  tin_ore: '/src/assets/mining/Ores/tin_ore.png',
  iron_ore: '/src/assets/mining/Ores/iron_ore.png',
  coal_ore: '/src/assets/mining/Ores/coal_ore.png',
  alloy_ore: '/src/assets/mining/Ores/alloy_ore.png',
  apex_ore: '/src/assets/mining/Ores/apex_ore.png',
  nova_ore: '/src/assets/mining/Ores/nova_ore.png',

  // --- Bars ---
  bronze_bar: '/src/assets/Smithing/Bars/bronze_bar.png',
  iron_bar: '/src/assets/Smithing/Bars/iron_bar.png',
  steel_bar: '/src/assets/Smithing/Bars/steel_bar.png',
  alloy_bar: '/src/assets/Smithing/Bars/alloy_bar.png',
  apex_bar: '/src/assets/Smithing/Bars/apex_bar.png',
  nova_bar: '/src/assets/Smithing/Bars/nova_bar.png',

  // --- Weapons: Scimitars ---
  bronze_scimitar: '/src/assets/Equipment/Weapons/Melee/bronze_scimitar.png',
  iron_scimitar: '/src/assets/Equipment/Weapons/Melee/iron_scimitar.png',
  steel_scimitar: '/src/assets/Equipment/Weapons/Melee/steel_scimitar.png',
  alloy_scimitar: '/src/assets/Equipment/Weapons/Melee/alloy_scimitar.png',
  apex_scimitar: '/src/assets/Equipment/Weapons/Melee/apex_scimitar.png',
  nova_scimitar: '/src/assets/Equipment/Weapons/Melee/nova_scimitar.png',

  // --- Weapons: Bows ---
  bronze_bow: '/src/assets/Equipment/Weapons/Ranged/bronze_bow.png',
  iron_bow: '/src/assets/Equipment/Weapons/Ranged/iron_bow.png',
  steel_bow: '/src/assets/Equipment/Weapons/Ranged/steel_bow.png',
  alloy_bow: '/src/assets/Equipment/Weapons/Ranged/alloy_bow.png',
  apex_bow: '/src/assets/Equipment/Weapons/Ranged/apex_bow.png',
  nova_bow: '/src/assets/Equipment/Weapons/Ranged/nova_bow.png',

  // --- Weapons: Staffs ---
  bronze_staff: '/src/assets/Equipment/Weapons/Mage/bronze_staff.png',
  iron_staff: '/src/assets/Equipment/Weapons/Mage/iron_staff.png',
  steel_staff: '/src/assets/Equipment/Weapons/Mage/steel_staff.png',
  alloy_staff: '/src/assets/Equipment/Weapons/Mage/alloy_staff.png',
  apex_staff: '/src/assets/Equipment/Weapons/Mage/apex_staff.png',
  nova_staff: '/src/assets/Equipment/Weapons/Mage/nova_staff.png',

  // --- Armor: Helmets ---
  bronze_helmet: '/src/assets/Armor/Helm/bronze_helm.png',
  iron_helmet: '/src/assets/Armor/Helm/iron_helm.png',
  steel_helmet: '/src/assets/Armor/Helm/steel_helm.png',
  alloy_helmet: '/src/assets/Armor/Helm/alloy_helm.png',
  apex_helmet: '/src/assets/Armor/Helm/apex_helm.png',
  nova_helmet: '/src/assets/Armor/Helm/nova_helm.png',

  // --- Armor: Bodies ---
  bronze_body: '/src/assets/Armor/Platebody/bronze_platebody.png',
  iron_body: '/src/assets/Armor/Platebody/iron_platebody.png',
  steel_body: '/src/assets/Armor/Platebody/steel_platebody.png',
  alloy_body: '/src/assets/Armor/Platebody/alloy_platebody.png',
  apex_body: '/src/assets/Armor/Platebody/apex_platebody.png',
  nova_body: '/src/assets/Armor/Platebody/nova_platebody.png',

  // --- Armor: Legs ---
  bronze_legs: '/src/assets/Armor/Platelegs/bronze_platelegs.png',
  iron_legs: '/src/assets/Armor/Platelegs/iron_platelegs.png',
  steel_legs: '/src/assets/Armor/Platelegs/steel_platelegs.png',
  alloy_legs: '/src/assets/Armor/Platelegs/alloy_platelegs.png',
  apex_legs: '/src/assets/Armor/Platelegs/apex_platelegs.png',
  nova_legs: '/src/assets/Armor/Platelegs/nova_platelegs.png',

  // --- Pets ---
  woodcutting_pet: new URL('../assets/Pets/woodcutting_pet.png', import.meta.url).href,
  fishing_pet: new URL('../assets/Pets/fishing_pet.png', import.meta.url).href,
  mining_pet: new URL('../assets/Pets/mining_pet.png', import.meta.url).href,
  foraging_pet: new URL('../assets/Pets/foraging_pet.png', import.meta.url).href,
  cooking_pet: new URL('../assets/Pets/cooking_pet.png', import.meta.url).href,
  smithing_pet: new URL('../assets/Pets/smithing_pet.png', import.meta.url).href,
  crafting_pet: new URL('../assets/Pets/crafting_pet.png', import.meta.url).href,
  herblore_pet: new URL('../assets/Pets/herblore_pet.png', import.meta.url).href,
  thieving_pet: new URL('../assets/Pets/thieving_pet.png', import.meta.url).href,
  farming_pet: new URL('../assets/Pets/farming_pet.png', import.meta.url).href,
  agility_pet: new URL('../assets/Pets/agility_pet.png', import.meta.url).href,
  slayer_pet: new URL('../assets/Pets/slayer_pet.png', import.meta.url).href,
};

// ==========================================
// --- POTION EFFECTS ---
// ==========================================
export const POTION_EFFECTS = {
  combat_potion: {
    name: 'Combat Potion',
    boosts: { attack: 5, strength: 5 },
    duration: 120,
    icon: '⚔️'
  },
  super_combat_potion: {
    name: 'Super Combat Potion',
    boosts: { attack: 10, strength: 10, defence: 5 },
    duration: 180,
    icon: '⚔️'
  },
  ranged_potion: {
    name: 'Ranged Potion',
    boosts: { ranged: 6 },
    duration: 120,
    icon: '🏹'
  },
  super_ranged_potion: {
    name: 'Super Ranged Potion',
    boosts: { ranged: 12, defence: 5 },
    duration: 180,
    icon: '🏹'
  },
  magic_potion: {
    name: 'Magic Potion',
    boosts: { magic: 6 },
    duration: 120,
    icon: '🔮'
  },
  super_magic_potion: {
    name: 'Super Magic Potion',
    boosts: { magic: 12, defence: 5 },
    duration: 180,
    icon: '🔮'
  },
  respawn_potion: {
    name: 'Respawn Potion',
    effect: 'reduce_respawn',
    value: 0.5,
    duration: 180,
    icon: '⏱️'
  },
  gathering_potion: {
    name: 'Gathering Potion',
    effect: 'sell_chance',
    value: 0.20,
    duration: 180,
    icon: '💰'
  },
  stamina_potion: {
    name: 'Stamina Potion',
    effect: 'speed_boost',
    value: 0.10,
    duration: 120,
    icon: '⚡'
  }
};
