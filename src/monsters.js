const monsters = {
    "prayer-eater": {
        hp: 3,
        def: 0,
        offensiveStats: {
            attack: 1,
            magic: 1,
            ranged: 1
        },
        attackSpeed: 2
    },
    "archer": {
        hp: 5,
        def: 0,
        offensiveStats: {
            attack: 1,
            magic: 1,
            ranged: 5
        },
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

// ...existing code...
module.exports = monsters;