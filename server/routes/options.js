import express from 'express'
import { getOptions, getIncompatibilities } from '../controllers/options.js'

const router = express.Router()

router.get('/incompatibilities', getIncompatibilities)
router.get('/', getOptions)

export default router
