import { pool } from '../config/database.js'

export const getOptions = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM options ORDER BY feature, price')
        res.status(200).json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getIncompatibilities = async (req, res) => {
    try {
        const result = await pool.query('SELECT option_a, option_b FROM incompatibilities')
        res.status(200).json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
