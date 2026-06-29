const BASE = '/api/cars'

export const getCars = async () => {
    const res = await fetch(BASE)
    return res.json()
}

export const getCar = async (id) => {
    const res = await fetch(`${BASE}/${id}`)
    return res.json()
}

export const createCar = async (car) => {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(car)
    })
    const body = await res.json()
    return res.ok ? { data: body } : { error: body.error }
}

export const updateCar = async (id, car) => {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(car)
    })
    const body = await res.json()
    return res.ok ? { data: body } : { error: body.error }
}

export const deleteCar = async (id) => {
    await fetch(`${BASE}/${id}`, { method: 'DELETE' })
}

export default { getCars, getCar, createCar, updateCar, deleteCar }
