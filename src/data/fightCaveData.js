// Fight Cave Data - All monsters and waves

const monsters = {
    "prayer-eater": {
        hp: 3,
        str: 2,
        offAtt: { melee: 1, ranged: 0, magic: 0 },
        defBonus: { melee: 0, ranged: 0, magic: 0 },
        attackSpeed: 3,
        type: 'melee'
    },
    "archer": {
        hp: 5,
        str: 3,
        offAtt: { melee: 0, ranged: 5, magic: 0 },
        defBonus: { melee: 2, ranged: 2, magic: 0 },
        attackSpeed: 3,
        type: 'ranged'
    },
    "mage": {
        hp: 7,
        str: 4,
        offAtt: { melee: 0, ranged: 0, magic: 5 },
        defBonus: { melee: 1, ranged: 1, magic: 5 },
        attackSpeed: 4,
        type: 'magic'
    },
    "zed": {
        hp: 12,
        str: 8,
        offAtt: { melee: 8, ranged: 0, magic: 0 },
        defBonus: { melee: 5, ranged: 3, magic: 2 },
        attackSpeed: 2,
        type: 'melee'
    }
};

const waves = [
    { wave: 1, monsters: [{ type: 'prayer-eater', count: 1 }] },
    { wave: 2, monsters: [{ type: 'prayer-eater', count: 2 }] },
    { wave: 3, monsters: [{ type: 'archer', count: 1 }] },
    { wave: 4, monsters: [{ type: 'prayer-eater', count: 1 }, { type: 'archer', count: 1 }] },
    { wave: 5, monsters: [{ type: 'prayer-eater', count: 2 }, { type: 'archer', count: 1 }] },
    { wave: 6, monsters: [{ type: 'archer', count: 2 }] },    
    { wave: 7, monsters: [{ type: 'mage', count: 1 }] },
    { wave: 8, monsters: [{ type: 'prayer-eater', count: 1 }, { type: 'mage', count: 1 }] },
    { wave: 9, monsters: [{ type: 'prayer-eater', count: 2 }, { type: 'mage', count: 1 }] },
    { wave: 10, monsters: [{ type: 'archer', count: 1 }, { type: 'mage', count: 1 }] },
    { wave: 11, monsters: [{ type: 'prayer-eater', count: 1 }, { type: 'archer', count: 1 }, { type: 'mage', count: 1 }] },
    { wave: 12, monsters: [{ type: 'prayer-eater', count: 2 }, { type: 'archer', count: 1 }, { type: 'mage', count: 1 }] },
    { wave: 13, monsters: [{ type: 'archer', count: 2 }, { type: 'mage', count: 1 }] },
    { wave: 14, monsters: [{ type: 'mage', count: 2 }] }, 
    { wave: 15, monsters: [{ type: 'zed', count: 1 }] }
];

export { monsters, waves };
