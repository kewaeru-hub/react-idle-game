// Fight Cave Data - All monsters and waves

const monsters = {
    "prayer-eater": {
        hp: 3,
        def: 0,
        offensiveStats: {
            attack: 1,
            magic: 1,
            ranged: 1
        },
        att: 999,
        minHit: 5,
        maxHit: 5,
        attackSpeed: 3
    },
    "archer": {
        hp: 5,
        def: 0,
        offensiveStats: {
            attack: 5,
            magic: 1,
            ranged: 5
        },
        att: 999,
        minHit: 5,
        maxHit: 5,
        attackSpeed: 3
    },
    "mage": {
        hp: 7,
        def: 0,
        offensiveStats: {
            attack: 1,
            magic: 5,
            ranged: 1
        },
        att: 999,
        minHit: 5,
        maxHit: 5,
        attackSpeed: 4
    },
    "zed": {
        hp: 12,
        def: 0,
        offensiveStats: {
            attack: 1,
            magic: 1,
            ranged: 1
        },
        attackSpeed: 2
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
