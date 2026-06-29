import { pool } from './database.js'

const createTables = async () => {
    const query = `
        DROP TABLE IF EXISTS cars;
        DROP TABLE IF EXISTS incompatibilities;
        DROP TABLE IF EXISTS options;

        CREATE TABLE options (
            id      SERIAL PRIMARY KEY,
            feature VARCHAR(20) NOT NULL,   -- 'wheels' | 'exterior' | 'roof' | 'interior'
            name    VARCHAR(50) NOT NULL,
            price   INTEGER NOT NULL DEFAULT 0,
            color   VARCHAR(7)              -- hex, exterior only; null otherwise
        );

        CREATE TABLE incompatibilities (
            id       SERIAL PRIMARY KEY,
            option_a INTEGER REFERENCES options(id),
            option_b INTEGER REFERENCES options(id)
        );

        CREATE TABLE cars (
            id          SERIAL PRIMARY KEY,
            name        VARCHAR(100) NOT NULL,
            wheel_id    INTEGER REFERENCES options(id),
            exterior_id INTEGER REFERENCES options(id),
            roof_id     INTEGER REFERENCES options(id),
            interior_id INTEGER REFERENCES options(id),
            total_price INTEGER NOT NULL,
            created_at  TIMESTAMP DEFAULT NOW()
        );
    `
    await pool.query(query)
    console.log('✅ tables created')
}

const seedOptions = async () => {
    const options = [
        ['wheels',   'Sport Silver',    0,    null],
        ['wheels',   'Matte Black',     400,  null],
        ['wheels',   'Chrome',          800,  null],
        ['wheels',   'Performance Red', 1200, null],
        ['exterior', 'Midnight Black',  0,    '#111111'],
        ['exterior', 'Racing Red',      500,  '#c0392b'],
        ['exterior', 'Electric Blue',   700,  '#2980b9'],
        ['exterior', 'Pearl White',     900,  '#ecf0f1'],
        ['exterior', 'Forest Green',    600,  '#27ae60'],
        ['roof',     'Hardtop',         0,    null],
        ['roof',     'Sunroof',         1100, null],
        ['roof',     'Convertible',     1800, null],
        ['interior', 'Black Leather',   0,    null],
        ['interior', 'Tan Leather',     600,  null],
        ['interior', 'Sport Cloth',     300,  null]
    ]
    for (const [feature, name, price, color] of options) {
        await pool.query(
            'INSERT INTO options (feature, name, price, color) VALUES ($1, $2, $3, $4)',
            [feature, name, price, color]
        )
    }
    console.log('✅ options seeded')
}

const seedIncompatibilities = async () => {
    const pairs = [
        ['Convertible',     'Forest Green'],   // no green convertibles
        ['Convertible',     'Sport Cloth'],    // cloth not offered on convertible
        ['Performance Red', 'Pearl White'],    // racing wheels clash w/ white
        ['Chrome',          'Electric Blue']   // chrome clashes w/ blue
    ]
    for (const [a, b] of pairs) {
        await pool.query(
            `INSERT INTO incompatibilities (option_a, option_b)
             VALUES ((SELECT id FROM options WHERE name = $1),
                     (SELECT id FROM options WHERE name = $2))`,
            [a, b]
        )
    }
    console.log('✅ incompatibilities seeded')
}

const reset = async () => {
    await createTables()
    await seedOptions()
    await seedIncompatibilities()
    await pool.end()
}

reset()
