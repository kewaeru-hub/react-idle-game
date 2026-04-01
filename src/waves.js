const monsters = require('./monsters');

const waves = [
    { wave: 1, monsters: [{ type: 'prayer-eater', count: 1 }] },
    { wave: 2, monsters: [{ type: 'prayer-eater', count: 2 }] },
    { wave: 3, monsters: [{ type: 'archer', count: 1 }] },
    { wave: 4, monsters: [{ type: 'mage', count: 1 }] },
    { wave: 5, monsters: [{ type: 'zed', count: 1 }] },
];

// ...existing code...
module.exports = waves;