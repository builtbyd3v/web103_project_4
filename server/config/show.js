import { pool } from './database.js'

const show = async () => {
    for (const table of ['options', 'incompatibilities', 'cars']) {
        const { rows } = await pool.query(`SELECT * FROM ${table}`)
        console.log(`\n=== ${table} (${rows.length} rows) ===`)
        console.table(rows)
    }
    await pool.end()
}

show()
