import { pool } from '../config/database.js'

const BASE_PRICE = 30000

const selectedIds = (body) => [body.wheel_id, body.exterior_id, body.roof_id, body.interior_id]

const findConflict = async (ids) => {
    const result = await pool.query(
        `SELECT * FROM incompatibilities
         WHERE option_a = ANY($1) AND option_b = ANY($1)`,
        [ids]
    )
    return result.rows[0] || null
}

const calcPrice = async (ids) => {
    const result = await pool.query(
        'SELECT COALESCE(SUM(price), 0) AS sum FROM options WHERE id = ANY($1)',
        [ids]
    )
    return BASE_PRICE + Number(result.rows[0].sum)
}

export const getCars = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cars ORDER BY id')
        res.status(200).json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getCar = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cars WHERE id = $1', [req.params.id])
        result.rows[0]
            ? res.status(200).json(result.rows[0])
            : res.status(404).json({ error: 'car not found' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const createCar = async (req, res) => {
    try {
        const ids = selectedIds(req.body)
        if (await findConflict(ids))
            return res.status(400).json({ error: 'Invalid combination: incompatible options selected' })

        const total = await calcPrice(ids)
        const result = await pool.query(
            `INSERT INTO cars (name, wheel_id, exterior_id, roof_id, interior_id, total_price)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.body.name, ...ids, total]
        )
        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const updateCar = async (req, res) => {
    try {
        const ids = selectedIds(req.body)
        if (await findConflict(ids))
            return res.status(400).json({ error: 'Invalid combination: incompatible options selected' })

        const total = await calcPrice(ids)
        const result = await pool.query(
            `UPDATE cars SET name = $1, wheel_id = $2, exterior_id = $3, roof_id = $4,
             interior_id = $5, total_price = $6 WHERE id = $7 RETURNING *`,
            [req.body.name, ...ids, total, req.params.id]
        )
        result.rows[0]
            ? res.status(200).json(result.rows[0])
            : res.status(404).json({ error: 'car not found' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const deleteCar = async (req, res) => {
    try {
        await pool.query('DELETE FROM cars WHERE id = $1', [req.params.id])
        res.status(204).end()
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
