-- ============================================================
-- SUPABASE MIGRATION: Combat System & Item Overhaul
-- Date: 2025-01-XX
-- Description: 
--   - Monster stats changed from flat att/str/def to per-style
--     offensive (offAtt.melee/ranged/magic) and defensive 
--     (defBonus.melee/ranged/magic) stats
--   - OSRS-style combat damage calculation implemented
--   - Bows changed from 4-tick to 3-tick attack speed
--   - All items are defined client-side in gameData.js
--   - Saved game states are JSON blobs in game_saves table
--
-- IMPORTANT: Items (WEAPONS, ARMOR, AMMO, ITEMS) are NOT stored
--   in Supabase tables. They live in src/data/gameData.js.
--   Only player state (skills, inventory, equipment) is saved.
--
-- This migration cleans up stale/renamed item references in
-- existing saved game states if any items were removed or renamed.
-- ============================================================

-- ============================================================
-- 1. CLEANUP: Remove stale equipped items from saved states
--    If a player has an item equipped that no longer exists in
--    the client-side WEAPONS/ARMOR/AMMO dicts, clear that slot.
-- ============================================================

-- List of ALL valid equipment item IDs (current as of this migration)
-- Weapons:
--   bronze_scimitar, iron_scimitar, steel_scimitar, alloy_scimitar, apex_scimitar, nova_scimitar
--   bronze_bow, iron_bow, steel_bow, alloy_bow, apex_bow, nova_bow
--   bronze_staff, iron_staff, steel_staff, alloy_staff, apex_staff, nova_staff
-- Armor:
--   bronze_helmet, bronze_body, bronze_legs, bronze_shield
--   iron_helmet, iron_body, iron_legs, iron_shield
--   steel_helmet, steel_body, steel_legs, steel_shield
--   alloy_helmet, alloy_body, alloy_legs, alloy_shield
--   apex_helmet, apex_body, apex_legs, apex_shield
--   nova_helmet, nova_body, nova_legs, nova_shield
--   leather_cowl, leather_body, leather_chaps
--   green_leather_body, green_leather_chaps
--   red_leather_body, red_leather_chaps
--   black_leather_body, black_leather_chaps
--   apprentice_hat, apprentice_top, apprentice_bottom
--   wizard_hat, wizard_top, wizard_bottom
--   mystic_hat, mystic_top, mystic_bottom
-- Ammo:
--   bronze_arrow, iron_arrow, steel_arrow, alloy_arrow, apex_arrow, nova_arrow

-- Function to clean up any invalid equipped items in saved states
CREATE OR REPLACE FUNCTION cleanup_stale_equipment()
RETURNS void AS $$
DECLARE
  rec RECORD;
  save_data JSONB;
  equip JSONB;
  changed BOOLEAN;
  valid_weapons TEXT[] := ARRAY[
    'bronze_scimitar','iron_scimitar','steel_scimitar','alloy_scimitar','apex_scimitar','nova_scimitar',
    'bronze_bow','iron_bow','steel_bow','alloy_bow','apex_bow','nova_bow',
    'bronze_staff','iron_staff','steel_staff','alloy_staff','apex_staff','nova_staff'
  ];
  valid_armor TEXT[] := ARRAY[
    'bronze_helmet','bronze_body','bronze_legs','bronze_shield',
    'iron_helmet','iron_body','iron_legs','iron_shield',
    'steel_helmet','steel_body','steel_legs','steel_shield',
    'alloy_helmet','alloy_body','alloy_legs','alloy_shield',
    'apex_helmet','apex_body','apex_legs','apex_shield',
    'nova_helmet','nova_body','nova_legs','nova_shield',
    'leather_cowl','leather_body','leather_chaps',
    'green_leather_body','green_leather_chaps',
    'red_leather_body','red_leather_chaps',
    'black_leather_body','black_leather_chaps',
    'apprentice_hat','apprentice_top','apprentice_bottom',
    'wizard_hat','wizard_top','wizard_bottom',
    'mystic_hat','mystic_top','mystic_bottom'
  ];
  valid_ammo TEXT[] := ARRAY[
    'bronze_arrow','iron_arrow','steel_arrow','alloy_arrow','apex_arrow','nova_arrow'
  ];
  slot_name TEXT;
  slot_value TEXT;
BEGIN
  FOR rec IN SELECT id, save_data FROM game_saves LOOP
    save_data := rec.save_data;
    equip := save_data->'equipment';
    changed := FALSE;
    
    IF equip IS NOT NULL THEN
      -- Check weapon slot
      slot_value := equip->>'weapon';
      IF slot_value IS NOT NULL AND slot_value != '' AND NOT (slot_value = ANY(valid_weapons)) THEN
        equip := equip - 'weapon';
        changed := TRUE;
        RAISE NOTICE 'Removed invalid weapon % from save %', slot_value, rec.id;
      END IF;
      
      -- Check armor slots (head, body, legs, shield)
      FOREACH slot_name IN ARRAY ARRAY['head','body','legs','shield'] LOOP
        slot_value := equip->>slot_name;
        IF slot_value IS NOT NULL AND slot_value != '' AND NOT (slot_value = ANY(valid_armor)) THEN
          equip := equip - slot_name;
          changed := TRUE;
          RAISE NOTICE 'Removed invalid armor % from slot % in save %', slot_value, slot_name, rec.id;
        END IF;
      END LOOP;
      
      -- Check ammo slot
      slot_value := equip->>'ammo';
      IF slot_value IS NOT NULL AND slot_value != '' AND NOT (slot_value = ANY(valid_ammo)) THEN
        equip := equip - 'ammo';
        changed := TRUE;
        RAISE NOTICE 'Removed invalid ammo % from save %', slot_value, rec.id;
      END IF;
      
      IF changed THEN
        save_data := jsonb_set(save_data, '{equipment}', equip);
        UPDATE game_saves SET save_data = save_data WHERE id = rec.id;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the cleanup
SELECT cleanup_stale_equipment();

-- Drop the function after use (optional)
-- DROP FUNCTION IF EXISTS cleanup_stale_equipment();

-- ============================================================
-- 2. CHANGE LOG (for reference)
-- ============================================================
-- 
-- MONSTER STAT FORMAT CHANGE:
--   OLD: { hp, att, str, def, speedTicks, type, weakness }
--   NEW: { hp, str, speedTicks, type, weakness,
--          offAtt: { melee, ranged, magic },
--          defBonus: { melee, ranged, magic } }
--
-- NOTE: Monster stats are NOT stored in saves. They are defined
--   client-side and loaded fresh on each session. No database
--   changes needed for monster stat overhaul.
--
-- WEAPON CHANGES:
--   - All bows: speedTicks changed from 4 to 3
--   - All staffs: confirmed 1-handed (no equipSlot:'shield')
--   - Bow str: set to 0 (ranged damage comes from ammo)
--   - Staff str: high values (magic damage from staff)
--
-- COMBAT ENGINE CHANGES:
--   - OSRS-style accuracy: Attack Roll vs Defence Roll
--   - OSRS-style max hit: floor(0.5 + effectiveLevel * (bonus+64) / 640)
--   - Player armor bonuses now used in combat calculations
--   - Ammo rangedStr used for ranged max hit
--   - Per-style defensive matching (melee def vs melee attacks, etc.)
--
-- ============================================================
