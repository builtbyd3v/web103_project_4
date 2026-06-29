const BASE = '/api/options'

export const getOptions = async () => {
    const res = await fetch(BASE)
    return res.json()
}

export const getIncompatibilities = async () => {
    const res = await fetch(`${BASE}/incompatibilities`)
    return res.json()
}

export default { getOptions, getIncompatibilities }
